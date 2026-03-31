const crypto = require("crypto");
const compression = require("compression");
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const {
  MAX_JSON_BYTES,
  booleanFromEnv,
  clearSessionCookie,
  createBuildFingerprint,
  createSessionManager,
  createUploadMiddleware,
  getSessionToken,
  parsePort,
  setStaticAssetHeaders,
  setSessionCookie
} = require("./server-common");
const { createThumbnailRequestHandler, ensureThumbnailFile, getThumbnailTargetFileName } = require("./image-thumbnails");
const { ensureStorage, readData, resetToBundledData, uploadsDir, writeData } = require("./site-store");
const {
  buildProductRecipeKeyFromMenuItem,
  approveLibraryAsset,
  ensureMediaLibraryStructure,
  findApprovedProductAssetForMenuItem,
  registerLibraryAsset
} = require("./media-library/library");
const {
  copyFileIntoSellerJob,
  createSellerJob,
  ensureSellerJobsStructure,
  writeSellerJobJson,
  writeSellerJobText
} = require("./seller-jobs/jobs");

const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASS = "foody2026";
const HASH_ITERATIONS = 120000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = "sha512";
const MIN_PASSWORD_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const OPENAI_IMPORT_MODEL = process.env.OPENAI_IMPORT_MODEL || "gpt-4o-mini";
const OPENAI_IMPORT_PDF_MODEL = process.env.OPENAI_IMPORT_PDF_MODEL || "gpt-4o";
const OPENAI_ITEM_MEDIA_MODEL = process.env.OPENAI_ITEM_MEDIA_MODEL || "gpt-image-1-mini";
const OPENAI_ITEM_MEDIA_QUALITY = typeof process.env.OPENAI_ITEM_MEDIA_QUALITY === "string"
  ? process.env.OPENAI_ITEM_MEDIA_QUALITY.trim().toLowerCase()
  : "";
const GENERATED_IMAGE_QUALITY = Number.parseInt(process.env.GENERATED_IMAGE_QUALITY || "82", 10) || 82;
const SELLER_TOOLS_ENABLED = booleanFromEnv(
  process.env.SELLER_TOOLS_ENABLED,
  process.env.NODE_ENV !== "production"
);
const AI_MEDIA_TOOLS_ENABLED = booleanFromEnv(process.env.AI_MEDIA_TOOLS_ENABLED, false);
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";
const IMPORTER_MAX_MENU_IMAGES = 16;
const IMPORTER_MAX_VENUE_IMAGES = 6;
const IMPORTER_SOURCE_STRUCTURING_MAX_PAGES = 3;
const IMPORTER_SOURCE_STRUCTURING_MAX_CHARS = 6500;

const app = express();
const port = parsePort(process.env.PORT, 3102);
const upload = createUploadMiddleware();
const sessions = createSessionManager(path.join(__dirname, "sessions.json"));
const build = createBuildFingerprint([
  path.join(__dirname, "admin-server.js"),
  path.join(__dirname, "admin.html"),
  path.join(__dirname, "admin.js"),
  path.join(__dirname, "scripts", "generate-admin-pwa-icons.js"),
  path.join(__dirname, "images", "pwa", "admin-app-icon.svg"),
  path.join(__dirname, "shared.js"),
  path.join(__dirname, "style.css")
]);
const dataRoot = process.env.DATA_FILE
  ? path.dirname(process.env.DATA_FILE)
  : __dirname;
const authFile = process.env.AUTH_FILE || path.join(dataRoot, "auth.json");
const loginAttempts = new Map();
const adminPwaIconDir = path.join(__dirname, "images", "pwa");
const adminPwaIconFiles = Object.freeze({
  svg: path.join(adminPwaIconDir, "admin-app-icon.svg"),
  icon64: path.join(adminPwaIconDir, "admin-app-icon-64.png"),
  icon180: path.join(adminPwaIconDir, "admin-app-icon-180.png"),
  icon192: path.join(adminPwaIconDir, "admin-app-icon-192.png"),
  icon512: path.join(adminPwaIconDir, "admin-app-icon-512.png"),
  maskable512: path.join(adminPwaIconDir, "admin-app-icon-maskable-512.png")
});

app.use(compression({
  threshold: 1024
}));

const IMPORTER_SYSTEM_PROMPT = [
  "You generate seller-side draft JSON for a white-label restaurant website.",
  "Use extracted menu source text as the source of truth when it is provided.",
  "If extracted source text is not provided, use the uploaded menu images or PDFs as the source of truth for menu items, prices, categories, and descriptions.",
  "Infer FR, EN, and AR names and descriptions for menu items, categories, and super-categories when confidence is reasonable.",
  "Do not invent contact details, maps, hours, WiFi, or social links.",
  "Do not invent branding, hero media, gallery media, website copy, or restaurant story content.",
  "If information is missing, leave the field empty and record a warning.",
  "Map extracted menu categories into canonical super-categories whenever the source menu does not explicitly provide them.",
  "Use these canonical super-categories as the default top-level groups: Starters, Main Courses, Sides, Desserts, Beverages, Breakfast.",
  "Do not mirror category names as super-category names unless they clearly match one of those canonical groups.",
  "If a category is ambiguous, choose the closest canonical group and record the uncertainty in review.warnings instead of inventing a new top-level group.",
  "Flag uncertainty in review.warnings or review.blockers instead of pretending confidence.",
  "Use category keys consistently: restaurantData.categories[].key must match menu[].cat and superCategories[].cats[].",
  "Follow the JSON schema exactly."
].join("\n");

const IMPORTER_SOURCE_EXTRACTION_SYSTEM_PROMPT = [
  "You extract raw restaurant menu source text from uploaded menu images or PDFs.",
  "Return page-by-page text only.",
  "Preserve headings, item names, prices, and short descriptions with meaningful line breaks.",
  "Preserve visible section headings and subsection headings even when they do not explicitly say category or super-category.",
  "If names, descriptions, and prices are visually separated, keep the closest related lines together in reading order.",
  "For PDFs, return one page entry per PDF page in order. For single menu images, return one page entry for the visible menu content in that image.",
  "Keep the original language and wording. Do not translate, summarize, group, or normalize the menu.",
  "Skip clearly decorative non-menu copy when it is obvious.",
  "If a region is unreadable or ambiguous, omit invented text and record the problem in warnings.",
  "Follow the JSON schema exactly."
].join("\n");

const IMPORTER_SOURCE_TEXT_FALLBACK_SYSTEM_PROMPT = [
  "You extract raw restaurant menu text from one uploaded menu image or PDF.",
  "Return plain text only.",
  "Preserve the visible menu reading order as faithfully as possible.",
  "Preserve visible section headings and subsection headings as separate lines when they appear.",
  "Keep item names, prices, and short descriptions together when they clearly belong together.",
  "Do not translate, summarize, explain, or output JSON.",
  "Skip obvious decorative marketing copy when it is clearly not part of the menu.",
  "If some text is unreadable, omit it instead of inventing content."
].join("\n");

const IMPORTER_CANONICAL_SUPER_CATEGORY_DEFS = [
  {
    id: "starters",
    name: "Starters",
    desc: "Appetizers, salads, soups, and light first plates.",
    emoji: "🥗",
    translations: {
      fr: { name: "Entrees", desc: "Entrees, salades, soupes et petites assiettes." },
      en: { name: "Starters", desc: "Appetizers, salads, soups, and light first plates." },
      ar: { name: "المقبلات", desc: "مقبلات وسلطات وشوربات وأطباق خفيفة." }
    },
    keywords: [
      "starter", "starters", "entree", "entrees", "appetizer", "appetizers", "appetiser", "appetisers",
      "salad", "salads", "salade", "salades", "soup", "soups", "soupe", "soupes",
      "mezze", "meze", "mezza", "tapas", "hors doeuvre", "hors d oeuvre",
      "مقبلات", "سلطة", "سلطات", "شوربة", "حساء", "مزة"
    ]
  },
  {
    id: "main-courses",
    name: "Main Courses",
    desc: "Core savory dishes and full plates.",
    emoji: "🍽️",
    translations: {
      fr: { name: "Plats Principaux", desc: "Plats principaux et assiettes completes." },
      en: { name: "Main Courses", desc: "Core savory dishes and full plates." },
      ar: { name: "الاطباق الرئيسية", desc: "الاطباق الرئيسية والوجبات الكاملة." }
    },
    keywords: [
      "main course", "main courses", "main dish", "main dishes", "plat", "plats", "plat principal", "plats principaux",
      "grill", "grills", "pizza", "pizzas", "burger", "burgers", "sandwich", "sandwiches", "wrap", "wraps",
      "taco", "tacos", "shawarma", "pasta", "pastas", "spaghetti", "tagine", "tajine", "couscous",
      "combo", "combos", "formule", "formules", "menu enfant", "kids menu", "kids",
      "meat", "viande", "beef", "steak", "chicken", "poulet", "fish", "poisson", "seafood", "brochette",
      "الأطباق الرئيسية", "طبق رئيسي", "رئيسية", "مشاوي", "بيتزا", "برغر", "برجر", "ساندويتش", "شطائر",
      "باستا", "معكرونة", "طاجين", "كسكس", "سمك", "مأكولات بحرية"
    ]
  },
  {
    id: "sides",
    name: "Sides",
    desc: "Accompaniments, extras, and side dishes.",
    emoji: "🍟",
    translations: {
      fr: { name: "Accompagnements", desc: "Accompagnements, extras et petites portions." },
      en: { name: "Sides", desc: "Accompaniments, extras, and side dishes." },
      ar: { name: "الاطباق الجانبية", desc: "أطباق جانبية وإضافات ومقبلات صغيرة." }
    },
    keywords: [
      "side", "sides", "side dish", "side dishes", "accompaniment", "accompaniments", "accompagnement", "accompagnements",
      "garniture", "garnitures", "extra", "extras", "supplement", "supplements", "frites", "fries", "rice", "riz",
      "potato", "potatoes", "puree", "bread", "pain", "sauce", "sauces", "dip", "dips",
      "جانبية", "اطباق جانبية", "أطباق جانبية", "إضافات", "بطاطس", "أرز", "خبز", "صلصات", "صوص"
    ]
  },
  {
    id: "desserts",
    name: "Desserts",
    desc: "Sweet dishes, pastries, and chilled treats.",
    emoji: "🍰",
    translations: {
      fr: { name: "Desserts", desc: "Desserts, patisseries et douceurs." },
      en: { name: "Desserts", desc: "Sweet dishes, pastries, and chilled treats." },
      ar: { name: "الحلويات", desc: "حلويات ومعجنات وأصناف حلوة." }
    },
    keywords: [
      "dessert", "desserts", "sweet", "sweets", "cake", "cakes", "gateau", "gateaux", "tarte", "tartes",
      "fondant", "cookie", "cookies", "brownie", "mousse", "cheesecake", "glace", "ice cream",
      "crepe", "crepes", "waffle", "waffles", "patisserie", "patisseries", "pastry", "pastries",
      "حلويات", "تحلية", "تحليات", "كيك", "آيس كريم", "ايس كريم", "كريب", "وافل"
    ]
  },
  {
    id: "beverages",
    name: "Beverages",
    desc: "Cold drinks, hot drinks, juices, and cocktails.",
    emoji: "🥤",
    translations: {
      fr: { name: "Boissons", desc: "Boissons froides, chaudes, jus et cocktails." },
      en: { name: "Beverages", desc: "Cold drinks, hot drinks, juices, and cocktails." },
      ar: { name: "المشروبات", desc: "مشروبات ساخنة وباردة وعصائر وكوكتيلات." }
    },
    keywords: [
      "beverage", "beverages", "drink", "drinks", "boisson", "boissons", "jus", "juice", "juices",
      "smoothie", "smoothies", "cocktail", "cocktails", "mocktail", "mocktails", "mojito", "coffee", "cafe", "cafes",
      "tea", "the", "infusion", "espresso", "latte", "cappuccino", "soda", "soft", "soft drinks",
      "milkshake", "shake", "shakes", "water", "eau", "beer", "biere", "wine", "vin",
      "مشروبات", "مشروب", "عصير", "عصائر", "قهوة", "شاي", "كوكتيل", "كوكتيلات", "موهيتو", "ماء", "سموذي"
    ]
  },
  {
    id: "breakfast",
    name: "Breakfast",
    desc: "Morning dishes, eggs, pastries, and brunch items.",
    emoji: "🍳",
    translations: {
      fr: { name: "Petit Dejeuner", desc: "Petit dejeuner, brunch et gourmandises du matin." },
      en: { name: "Breakfast", desc: "Morning dishes, eggs, pastries, and brunch items." },
      ar: { name: "الفطور", desc: "فطور وبرنش وأطباق الصباح." }
    },
    keywords: [
      "breakfast", "petit dejeuner", "petit-dejeuner", "brunch", "morning", "omelette", "omelet", "egg", "eggs",
      "pancake", "pancakes", "croissant", "viennoiserie", "viennoiseries", "toast", "toasts", "bagel", "granola",
      "porridge", "club matin", "morning pastries",
      "فطور", "افطار", "إفطار", "برنش", "بيض", "أومليت", "اومليت", "بان كيك", "كرواسون", "توست"
    ]
  }
];

const IMPORTER_REPAIR_SYSTEM_PROMPT = [
  "You repair malformed seller-side restaurant draft output into valid JSON.",
  "The input may contain near-JSON, markdown fences, extra commentary, or partially malformed structure.",
  "Return only valid JSON that follows the provided schema exactly.",
  "Do not add new facts that were not present in the source text.",
  "If a value is missing or uncertain, use empty strings, empty arrays, null, or warnings instead of inventing data."
].join("\n");

const IMPORTER_TRANSLATION_BUCKET_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["name", "desc"],
  properties: {
    name: { type: "string" },
    desc: { type: "string" }
  }
};

const IMPORTER_TRANSLATIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["fr", "en", "ar"],
  properties: {
    fr: IMPORTER_TRANSLATION_BUCKET_SCHEMA,
    en: IMPORTER_TRANSLATION_BUCKET_SCHEMA,
    ar: IMPORTER_TRANSLATION_BUCKET_SCHEMA
  }
};

const IMPORTER_TEXT_FORMAT = {
  type: "json_schema",
  name: "restaurant_import_draft",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["restaurantData", "review"],
    properties: {
      restaurantData: {
        type: "object",
        additionalProperties: false,
        required: [
          "menu",
          "categories",
          "superCategories"
        ],
        properties: {
          menu: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "cat", "name", "desc", "price", "translations"],
              properties: {
                id: { type: ["string", "number", "null"] },
                cat: { type: "string" },
                name: { type: "string" },
                desc: { type: "string" },
                price: { type: ["number", "null"] },
                translations: IMPORTER_TRANSLATIONS_SCHEMA
              }
            }
          },
          categories: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["key", "name", "emoji", "translations"],
              properties: {
                key: { type: "string" },
                name: { type: "string" },
                emoji: { type: "string" },
                translations: IMPORTER_TRANSLATIONS_SCHEMA
              }
            }
          },
          superCategories: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "name", "desc", "cats", "translations"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                desc: { type: "string" },
                cats: {
                  type: "array",
                  items: { type: "string" }
                },
                translations: IMPORTER_TRANSLATIONS_SCHEMA
              }
            }
          }
        }
      },
      review: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "blockers", "warnings", "untranslatedItems"],
        properties: {
          summary: { type: "string" },
          blockers: {
            type: "array",
            items: { type: "string" }
          },
          warnings: {
            type: "array",
            items: { type: "string" }
          },
          untranslatedItems: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }
  }
};

const IMPORTER_SOURCE_EXTRACTION_FORMAT = {
  type: "json_schema",
  name: "restaurant_menu_source",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["pages", "warnings"],
    properties: {
      pages: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "text"],
          properties: {
            label: { type: "string" },
            text: { type: "string" }
          }
        }
      },
      warnings: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
};

const IMPORTER_TRANSLATION_SYSTEM_PROMPT = [
  "You improve translations for an extracted restaurant website draft.",
  "Return translations only and follow the JSON schema exactly.",
  "Preserve ids and keys exactly as provided.",
  "Provide natural FR, EN, and AR names and descriptions for every entry.",
  "Do not invent new dishes, categories, or facts.",
  "Use the provided extracted text as the source of truth.",
  "If a phrase is ambiguous, choose the safest natural translation and mention the ambiguity in warnings."
].join("\n");

const IMPORTER_TRANSLATION_COMPLETION_FORMAT = {
  type: "json_schema",
  name: "restaurant_translation_completion",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["menu", "categories", "superCategories", "warnings"],
    properties: {
      menu: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "translations"],
          properties: {
            id: { type: ["string", "number", "null"] },
            translations: IMPORTER_TRANSLATIONS_SCHEMA
          }
        }
      },
      categories: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["key", "translations"],
          properties: {
            key: { type: "string" },
            translations: IMPORTER_TRANSLATIONS_SCHEMA
          }
        }
      },
      superCategories: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "translations"],
          properties: {
            id: { type: "string" },
            translations: IMPORTER_TRANSLATIONS_SCHEMA
          }
        }
      },
      warnings: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
};

function guessMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".pdf") return "application/pdf";
  return "";
}

function resolveLocalUploadPath(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  const cleanPath = raw.startsWith("http")
    ? (() => {
      try {
        return new URL(raw).pathname || "";
      } catch (_error) {
        return "";
      }
    })()
    : raw;

  if (!cleanPath.startsWith("/uploads/")) return "";
  const relativePath = cleanPath.replace(/^\/uploads\//, "");
  if (!relativePath || relativePath.includes("..")) return "";
  return path.join(uploadsDir, relativePath);
}

function buildInputImageFromUploadUrl(value) {
  const filePath = resolveLocalUploadPath(value);
  if (!filePath || !fs.existsSync(filePath)) return null;
  const mimeType = guessMimeType(filePath);
  if (!mimeType || !mimeType.startsWith("image/")) return null;
  const base64 = fs.readFileSync(filePath).toString("base64");
  return {
    type: "input_image",
    image_url: `data:${mimeType};base64,${base64}`
  };
}

function buildInputFileFromUploadUrl(value) {
  const filePath = resolveLocalUploadPath(value);
  if (!filePath || !fs.existsSync(filePath)) return null;
  const mimeType = guessMimeType(filePath);
  if (mimeType !== "application/pdf") return null;
  const base64 = fs.readFileSync(filePath).toString("base64");
  return {
    type: "input_file",
    filename: path.basename(filePath),
    file_data: `data:${mimeType};base64,${base64}`
  };
}

function importerHasPdfInput(input) {
  return Array.isArray(input?.menuPdfUrls)
    && input.menuPdfUrls.some((value) => typeof value === "string" && value.trim());
}

function getImporterModelForInput(input) {
  return importerHasPdfInput(input) ? OPENAI_IMPORT_PDF_MODEL : OPENAI_IMPORT_MODEL;
}

function getImporterModelForAsset(asset) {
  return asset?.kind === "pdf" ? OPENAI_IMPORT_PDF_MODEL : OPENAI_IMPORT_MODEL;
}

function buildImporterAssetLabel(kind, index, url) {
  const fallback = kind === "pdf" ? `Menu PDF ${index + 1}` : `Menu Image ${index + 1}`;
  const filePath = resolveLocalUploadPath(url);
  if (!filePath) return fallback;

  const rawBaseName = path.basename(filePath, path.extname(filePath)).replace(/[_-]+/g, " ");
  const normalizedBaseName = normalizeImporterText(rawBaseName);
  return normalizedBaseName ? `${fallback}: ${normalizedBaseName}` : fallback;
}

function buildImporterAssetDescriptors(input) {
  const imageAssets = (Array.isArray(input?.menuImageUrls) ? input.menuImageUrls : [])
    .map((url, index) => ({
      kind: "image",
      index,
      url,
      label: buildImporterAssetLabel("image", index, url),
      contentInput: buildInputImageFromUploadUrl(url)
    }))
    .filter((asset) => asset.contentInput);

  const pdfAssets = (Array.isArray(input?.menuPdfUrls) ? input.menuPdfUrls : [])
    .map((url, index) => ({
      kind: "pdf",
      index,
      url,
      label: buildImporterAssetLabel("pdf", index, url),
      contentInput: buildInputFileFromUploadUrl(url)
    }))
    .filter((asset) => asset.contentInput);

  return [...pdfAssets, ...imageAssets];
}

function copyUploadUrlsToSellerJob(jobId, relativeDir, urls = []) {
  const copied = [];
  urls.forEach((url, index) => {
    const sourcePath = resolveLocalUploadPath(url);
    if (!sourcePath || !fs.existsSync(sourcePath)) return;
    const targetPath = copyFileIntoSellerJob(jobId, relativeDir, sourcePath, `${String(index + 1).padStart(2, "0")}-${path.basename(sourcePath)}`);
    copied.push(targetPath);
  });
  return copied;
}

function materializeLibraryAssetToUpload(asset) {
  const relativePath = typeof asset?.filepath === "string" ? asset.filepath.trim() : "";
  if (!relativePath) return "";

  const sourcePath = path.join(__dirname, relativePath.replace(/\//g, path.sep));
  if (!fs.existsSync(sourcePath)) return "";

  const extension = path.extname(sourcePath).toLowerCase() || ".png";
  const filename = `library_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${extension}`;
  const outputPath = path.join(uploadsDir, filename);
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.copyFileSync(sourcePath, outputPath);
  return `/uploads/${filename}`;
}

async function saveGeneratedImage(base64Data, prefix = "generated") {
  const safePrefix = typeof prefix === "string" && prefix.trim() ? prefix.trim().replace(/[^a-z0-9_-]+/gi, "-") : "generated";
  const filename = `${safePrefix}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.webp`;
  const filePath = path.join(uploadsDir, filename);
  fs.mkdirSync(uploadsDir, { recursive: true });
  const sourceBuffer = Buffer.from(base64Data, "base64");
  await sharp(sourceBuffer)
    .rotate()
    .webp({
      quality: GENERATED_IMAGE_QUALITY,
      effort: 4
    })
    .toFile(filePath);

  Promise.all([
    ensureThumbnailFile(filename, getThumbnailTargetFileName(filename, "default"), "default"),
    ensureThumbnailFile(filename, getThumbnailTargetFileName(filename, "menu"), "menu"),
    ensureThumbnailFile(filename, getThumbnailTargetFileName(filename, "list"), "list")
  ]).catch((thumbnailError) => {
    console.warn("Generated image thumbnail generation failed:", thumbnailError);
  });

  return `/uploads/${filename}`;
}

function resolveOpenAiItemMediaQuality(model) {
  const normalizedModel = asImporterString(model).toLowerCase();
  const requestedQuality = asImporterString(OPENAI_ITEM_MEDIA_QUALITY).toLowerCase();

  if (normalizedModel === "dall-e-3") {
    return requestedQuality === "hd" ? "hd" : "standard";
  }

  if (normalizedModel.startsWith("gpt-image-1")) {
    if (["low", "medium", "high"].includes(requestedQuality)) {
      return requestedQuality;
    }
    return normalizedModel === "gpt-image-1-mini" ? "low" : "medium";
  }

  if (["low", "medium", "high"].includes(requestedQuality)) {
    return requestedQuality;
  }
  return "medium";
}

function asImporterString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function canonicalImporterLookup(value) {
  return asImporterString(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function fillTranslationBucket(bucket, fallbackName = "", fallbackDesc = "") {
  const source = bucket && typeof bucket === "object" ? bucket : {};
  return {
    name: asImporterString(source.name) || fallbackName,
    desc: asImporterString(source.desc) || fallbackDesc
  };
}

function fillTranslationSet(translations, fallbackName = "", fallbackDesc = "") {
  const source = translations && typeof translations === "object" ? translations : {};
  return {
    fr: fillTranslationBucket(source.fr, fallbackName, fallbackDesc),
    en: fillTranslationBucket(source.en, fallbackName, fallbackDesc),
    ar: fillTranslationBucket(source.ar, fallbackName, fallbackDesc)
  };
}

function repairPossibleImporterMojibake(value) {
  let result = asImporterString(value);
  if (!result) return "";

  for (let index = 0; index < 2; index += 1) {
    if (!/[ÃØÙðâ]/.test(result)) break;

    try {
      const repairedLatin1 = Buffer.from(result, "latin1").toString("utf8");
      if (repairedLatin1 && repairedLatin1 !== result) {
        result = repairedLatin1;
        continue;
      }
    } catch (_error) {
      // Fall through to the browser-style repair attempt.
    }

    try {
      const repairedEscaped = decodeURIComponent(escape(result));
      if (!repairedEscaped || repairedEscaped === result) break;
      result = repairedEscaped;
    } catch (_error) {
      break;
    }
  }

  return result;
}

function normalizeImporterWhitespace(value) {
  return repairPossibleImporterMojibake(value)
    .replace(/[\u200B-\u200D\uFEFF]/g, " ")
    .replace(/[•·▪●◦■►]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImporterSourceText(value) {
  const raw = repairPossibleImporterMojibake(asImporterString(value))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (!raw) return "";

  const normalizedLines = [];
  raw.split("\n").forEach((line) => {
    const cleaned = line
      .replace(/[\u200B-\u200D\uFEFF]/g, " ")
      .replace(/[â€¢Â·â–ªâ—â—¦â– â–º]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) {
      if (normalizedLines[normalizedLines.length - 1] !== "") {
        normalizedLines.push("");
      }
      return;
    }

    normalizedLines.push(cleaned);
  });

  return normalizedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function trimImporterSeparators(value) {
  return asImporterString(value)
    .replace(/^[\s\-–—:;|.,/\\]+/, "")
    .replace(/[\s\-–—:;|.,/\\]+$/, "")
    .trim();
}

function normalizeImporterText(value) {
  return trimImporterSeparators(normalizeImporterWhitespace(value));
}

function slugifyImporterKey(value) {
  const clean = canonicalImporterLookup(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "entry";
}

function parsePossiblePriceToken(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 5000) {
    return Math.round(value * 100) / 100;
  }

  const raw = asImporterString(value).replace(/\s+/g, "");
  if (!raw) return null;

  let normalized = raw;
  if (normalized.includes(",") && !normalized.includes(".")) {
    normalized = normalized.replace(",", ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }

  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number) || number <= 0 || number > 5000) return null;
  return Math.round(number * 100) / 100;
}

function extractTrailingPrice(text) {
  const source = normalizeImporterText(text);
  if (!source) {
    return { text: "", price: null };
  }

  const match = source.match(/^(.*?)(?:\s*[.\-–—|:]\s*|\s+)(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:mad|dh|dhs|da|eur|usd|€|\$|درهم|د\.?\s*م)?$/iu);
  if (!match) {
    return { text: source, price: null };
  }

  const price = parsePossiblePriceToken(match[2]);
  if (!Number.isFinite(price)) {
    return { text: source, price: null };
  }

  return {
    text: normalizeImporterText(match[1]),
    price
  };
}

function normalizeImporterPrice(explicitPrice, ...fallbackTexts) {
  const direct = parsePossiblePriceToken(explicitPrice);
  if (Number.isFinite(direct)) return direct;

  for (const text of fallbackTexts) {
    const source = normalizeImporterText(text);
    if (!source) continue;

    const trailing = extractTrailingPrice(source);
    if (Number.isFinite(trailing.price)) {
      return trailing.price;
    }

    const matches = [...source.matchAll(/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:mad|dh|dhs|da|eur|usd|€|\$|درهم|د\.?\s*م)?/giu)];
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const candidate = parsePossiblePriceToken(matches[index][1]);
      if (Number.isFinite(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function splitInlineNameAndDesc(name, desc) {
  let nextName = normalizeImporterText(name);
  let nextDesc = normalizeImporterText(desc);

  if (!nextName && nextDesc) {
    nextName = nextDesc;
    nextDesc = "";
  }

  nextName = extractTrailingPrice(nextName).text || nextName;

  if (!nextDesc) {
    const separatorMatch = nextName.match(/^(.+?)\s(?:-|–|—|:|\|)\s(.+)$/);
    if (separatorMatch?.[1] && separatorMatch?.[2] && separatorMatch[2].length >= 8) {
      nextName = normalizeImporterText(separatorMatch[1]);
      nextDesc = normalizeImporterText(separatorMatch[2]);
    }
  }

  if (!nextDesc) {
    const parentheticalMatch = nextName.match(/^(.+?)\s*\((.{8,})\)$/);
    if (parentheticalMatch?.[1] && parentheticalMatch?.[2]) {
      nextName = normalizeImporterText(parentheticalMatch[1]);
      nextDesc = normalizeImporterText(parentheticalMatch[2]);
    }
  }

  return {
    name: nextName,
    desc: nextDesc
  };
}

function guessImporterCategoryEmoji(value) {
  const source = canonicalImporterLookup(value);
  if (!source) return "🍴";
  if (/(drink|boisson|jus|smooth|cafe|coffee|tea|the|cocktail|mocktail|soda|juice)/.test(source)) return "🥤";
  if (/(dessert|sweet|gateau|cake|tarte|fondant|glace|ice cream|bakery|patis|viennois)/.test(source)) return "🍰";
  if (/(pizza|burger|sandwich|tacos|wrap|street|snack)/.test(source)) return "🍔";
  if (/(poisson|fish|seafood|crevette|shrimp|salmon|thon|tuna|sushi|maki|sashimi)/.test(source)) return "🍣";
  if (/(salad|salade|starter|entree|soup|soupe|appetizer|mezze|mezza)/.test(source)) return "🥗";
  if (/(grill|bbq|poulet|chicken|beef|steak|meat|viande|plat|main|pasta|pate|rice|riz|tajine)/.test(source)) return "🍽️";
  return "🍴";
}

function chooseRicherImporterItem(current, candidate) {
  const currentDesc = normalizeImporterText(current?.desc);
  const candidateDesc = normalizeImporterText(candidate?.desc);
  const currentImageCount = Array.isArray(current?.images) ? current.images.length : 0;
  const candidateImageCount = Array.isArray(candidate?.images) ? candidate.images.length : 0;
  const currentTranslationScore = ["fr", "en", "ar"].reduce((total, key) => total + (asImporterString(current?.translations?.[key]?.name) ? 1 : 0), 0);
  const candidateTranslationScore = ["fr", "en", "ar"].reduce((total, key) => total + (asImporterString(candidate?.translations?.[key]?.name) ? 1 : 0), 0);
  const currentScore = (currentDesc ? 2 : 0) + (Number.isFinite(current?.price) ? 2 : 0) + currentImageCount + currentTranslationScore;
  const candidateScore = (candidateDesc ? 2 : 0) + (Number.isFinite(candidate?.price) ? 2 : 0) + candidateImageCount + candidateTranslationScore;
  return candidateScore > currentScore ? candidate : current;
}

function dedupeImporterMenuItems(items) {
  const seen = new Map();
  let removedCount = 0;

  items.forEach((item) => {
    const key = [
      canonicalImporterLookup(item?.cat),
      canonicalImporterLookup(item?.name),
      Number.isFinite(item?.price) ? String(item.price) : ""
    ].join("|");

    if (!key || key === "||") return;

    if (!seen.has(key)) {
      seen.set(key, item);
      return;
    }

    removedCount += 1;
    seen.set(key, chooseRicherImporterItem(seen.get(key), item));
  });

  return {
    items: [...seen.values()],
    removedCount
  };
}

function buildFallbackSuperCategories(categoryTranslations, catEmojis) {
  return Object.keys(categoryTranslations || {}).map((key, index) => {
    const translations = fillTranslationSet(categoryTranslations[key], key, "");
    return {
      id: `super-${slugifyImporterKey(key)}-${index + 1}`,
      name: asImporterString(translations?.fr?.name) || key,
      desc: asImporterString(translations?.fr?.desc),
      emoji: asImporterString(catEmojis?.[key]) || guessImporterCategoryEmoji(key),
      time: "",
      cats: [key],
      translations
    };
  });
}

function buildImporterKeywordHaystack(value) {
  return ` ${canonicalImporterLookup(value)
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function scoreImporterKeywords(value, keywords, weight = 1) {
  const haystack = buildImporterKeywordHaystack(value);
  if (!haystack.trim()) return 0;

  return keywords.reduce((total, keyword) => {
    const needle = buildImporterKeywordHaystack(keyword).trim();
    if (!needle) return total;
    return haystack.includes(` ${needle} `) ? total + weight : total;
  }, 0);
}

function collectImporterCategoryInferenceSignals(categoryKey, categoryTranslations, menuItems) {
  const translations = categoryTranslations?.[categoryKey] || {};
  const relevantItems = (Array.isArray(menuItems) ? menuItems : [])
    .filter((item) => item?.cat === categoryKey)
    .slice(0, 10);

  return {
    strongTexts: [
      categoryKey,
      translations?.fr?.name,
      translations?.en?.name,
      translations?.ar?.name
    ].filter(Boolean),
    supportTexts: [
      translations?.fr?.desc,
      translations?.en?.desc,
      translations?.ar?.desc,
      ...relevantItems.flatMap((item) => [
        item?.name,
        item?.desc,
        item?.translations?.fr?.name,
        item?.translations?.en?.name,
        item?.translations?.ar?.name
      ])
    ].filter(Boolean)
  };
}

function scoreImporterCanonicalSuperCategory(signals, definition) {
  const strongScore = (Array.isArray(signals?.strongTexts) ? signals.strongTexts : [])
    .reduce((total, value) => total + scoreImporterKeywords(value, definition.keywords, 6), 0);
  const supportScore = (Array.isArray(signals?.supportTexts) ? signals.supportTexts : [])
    .reduce((total, value) => total + scoreImporterKeywords(value, definition.keywords, 1), 0);

  return strongScore + supportScore;
}

function inferImporterCanonicalSuperCategoryForCategory(categoryKey, categoryTranslations, menuItems) {
  const signals = collectImporterCategoryInferenceSignals(categoryKey, categoryTranslations, menuItems);
  const scored = IMPORTER_CANONICAL_SUPER_CATEGORY_DEFS
    .map((definition) => ({
      id: definition.id,
      score: scoreImporterCanonicalSuperCategory(signals, definition)
    }))
    .sort((left, right) => right.score - left.score);

  const best = scored[0];
  const second = scored[1];
  if (!best || best.score <= 0) {
    return {
      id: "main-courses",
      confidence: "fallback"
    };
  }

  return {
    id: best.id,
    confidence: best.score >= ((second?.score || 0) + 3) ? "high" : "medium"
  };
}

function inferImporterCanonicalSuperCategoryFromEntry(entry) {
  const signals = {
    strongTexts: [
      entry?.id,
      entry?.name,
      entry?.translations?.fr?.name,
      entry?.translations?.en?.name,
      entry?.translations?.ar?.name
    ].filter(Boolean),
    supportTexts: [
      entry?.desc,
      entry?.translations?.fr?.desc,
      entry?.translations?.en?.desc,
      entry?.translations?.ar?.desc
    ].filter(Boolean)
  };

  const scored = IMPORTER_CANONICAL_SUPER_CATEGORY_DEFS
    .map((definition) => ({
      id: definition.id,
      score: scoreImporterCanonicalSuperCategory(signals, definition)
    }))
    .sort((left, right) => right.score - left.score);

  const best = scored[0];
  const second = scored[1];
  if (!best || best.score <= 0 || best.score < ((second?.score || 0) + 3)) {
    return "";
  }
  return best.id;
}

function buildCanonicalImporterSuperCategories(categoryTranslations, menuItems, normalizedSuperCategories) {
  const categoryKeys = Object.keys(categoryTranslations || {});
  const assignedByCategory = new Map();
  const extractedBucketEntries = new Map();
  let fallbackAssignmentCount = 0;

  (Array.isArray(normalizedSuperCategories) ? normalizedSuperCategories : []).forEach((entry) => {
    const bucketId = inferImporterCanonicalSuperCategoryFromEntry(entry);
    if (!bucketId) return;

    const existing = extractedBucketEntries.get(bucketId);
    if (!existing || (Array.isArray(entry.cats) ? entry.cats.length : 0) > (Array.isArray(existing.cats) ? existing.cats.length : 0)) {
      extractedBucketEntries.set(bucketId, entry);
    }

    (Array.isArray(entry.cats) ? entry.cats : []).forEach((categoryKey) => {
      if (categoryTranslations?.[categoryKey]) {
        assignedByCategory.set(categoryKey, bucketId);
      }
    });
  });

  categoryKeys.forEach((categoryKey) => {
    if (assignedByCategory.has(categoryKey)) return;
    const inferred = inferImporterCanonicalSuperCategoryForCategory(categoryKey, categoryTranslations, menuItems);
    assignedByCategory.set(categoryKey, inferred.id);
    if (inferred.confidence === "fallback") {
      fallbackAssignmentCount += 1;
    }
  });

  const superCategories = IMPORTER_CANONICAL_SUPER_CATEGORY_DEFS.map((definition) => {
    const cats = categoryKeys.filter((categoryKey) => assignedByCategory.get(categoryKey) === definition.id);
    if (!cats.length) return null;

    const extractedEntry = extractedBucketEntries.get(definition.id);
    const fallbackName = normalizeImporterText(extractedEntry?.name) || definition.name;
    const fallbackDesc = normalizeImporterText(extractedEntry?.desc) || definition.desc;
    const translationSeed = deepMerge(definition.translations, extractedEntry?.translations || {});

    return {
      id: normalizeImporterText(extractedEntry?.id) || definition.id,
      name: fallbackName,
      desc: fallbackDesc,
      emoji: asImporterString(extractedEntry?.emoji) || definition.emoji,
      time: normalizeImporterText(extractedEntry?.time),
      cats,
      translations: fillTranslationSet(translationSeed, fallbackName, fallbackDesc)
    };
  }).filter(Boolean);

  return {
    superCategories,
    fallbackAssignmentCount
  };
}

function buildImporterDraftSkeleton(input) {
  const menuImageUrls = Array.isArray(input.menuImageUrls) ? input.menuImageUrls : [];
  const menuPdfUrls = Array.isArray(input.menuPdfUrls) ? input.menuPdfUrls : [];
  const restaurantPhotoUrls = Array.isArray(input.restaurantPhotoUrls) ? input.restaurantPhotoUrls : [];
  const restaurantName = typeof input.restaurantName === "string" ? input.restaurantName.trim() : "";
  const shortName = typeof input.shortName === "string" ? input.shortName.trim() : "";
  const logoImageUrl = typeof input.logoImageUrl === "string" ? input.logoImageUrl.trim() : "";
  const heroImage = restaurantPhotoUrls[0] || "";

  return {
    restaurantData: {
      menu: [],
      catEmojis: {},
      categoryTranslations: {},
      wifi: { ssid: "", pass: "" },
      social: {
        instagram: "",
        facebook: "",
        tiktok: "",
        tripadvisor: "",
        whatsapp: ""
      },
      guestExperience: {
        paymentMethods: [],
        facilities: []
      },
      sectionVisibility: {},
      sectionOrder: [],
      branding: {
        presetId: "core",
        restaurantName,
        shortName: shortName || restaurantName,
        tagline: "",
        logoMark: "🍽️",
        primaryColor: "",
        secondaryColor: "",
        accentColor: "",
        surfaceColor: "",
        surfaceMuted: "",
        textColor: "",
        textMuted: "",
        menuBackground: "",
        menuSurface: "",
        heroImage,
        heroSlides: [
          heroImage,
          restaurantPhotoUrls[1] || "",
          restaurantPhotoUrls[2] || ""
        ],
        logoImage: logoImageUrl
      },
      contentTranslations: {
        fr: {},
        en: {},
        ar: {}
      },
      promoId: null,
      promoIds: [],
      superCategories: [],
      hours: [],
      hoursNote: "",
      gallery: restaurantPhotoUrls,
      landing: {
        location: {
          address: "",
          url: ""
        },
        phone: ""
      }
    },
    review: {
      sourceFiles: [...menuImageUrls, ...menuPdfUrls],
      summary: "",
      blockers: [],
      warnings: [],
      missingMediaSlots: [],
      untranslatedItems: [],
      confidence: {
        menuExtraction: "unknown",
        translations: "unknown",
        mediaMatching: "unknown"
      }
    }
  };
}

function normalizeImporterSourceExtraction(parsed) {
  const source = parsed && typeof parsed === "object" ? parsed : {};
  const pages = Array.isArray(source.pages)
    ? source.pages.map((entry, index) => ({
      label: normalizeImporterText(entry?.label) || `Page ${index + 1}`,
      text: normalizeImporterSourceText(entry?.text)
    })).filter((entry) => entry.text)
    : [];

  return {
    pages,
    warnings: Array.isArray(source.warnings)
      ? source.warnings.map((value) => normalizeImporterText(value)).filter(Boolean)
      : []
  };
}

function fingerprintImporterSourcePage(page) {
  return canonicalImporterLookup(page?.text)
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeImporterSourcePages(pages) {
  const seen = new Set();
  const dedupedPages = [];
  let removedCount = 0;

  (Array.isArray(pages) ? pages : []).forEach((page) => {
    const text = normalizeImporterSourceText(page?.text);
    if (!text) return;

    const fingerprint = fingerprintImporterSourcePage({ text });
    if (!fingerprint) return;
    if (seen.has(fingerprint)) {
      removedCount += 1;
      return;
    }

    seen.add(fingerprint);
    dedupedPages.push({
      label: normalizeImporterText(page?.label) || `Page ${dedupedPages.length + 1}`,
      text
    });
  });

  return {
    pages: dedupedPages,
    removedCount
  };
}

function splitOversizedImporterSourcePage(page, maxCharsPerPage) {
  const label = normalizeImporterText(page?.label) || "Page";
  const text = normalizeImporterSourceText(page?.text);
  if (!text) return [];
  if (!maxCharsPerPage || text.length <= maxCharsPerPage) {
    return [{ label, text }];
  }

  const blocks = text.split(/\n{2,}/).map((block) => normalizeImporterSourceText(block)).filter(Boolean);
  if (!blocks.length) {
    const segments = [];
    for (let cursor = 0; cursor < text.length; cursor += maxCharsPerPage) {
      segments.push({
        label: `${label} (Part ${segments.length + 1})`,
        text: text.slice(cursor, cursor + maxCharsPerPage).trim()
      });
    }
    return segments.filter((entry) => entry.text);
  }

  const parts = [];
  let currentText = "";
  blocks.forEach((block) => {
    const candidate = currentText ? `${currentText}\n\n${block}` : block;
    if (candidate.length <= maxCharsPerPage) {
      currentText = candidate;
      return;
    }

    if (currentText) {
      parts.push(currentText);
    }

    if (block.length <= maxCharsPerPage) {
      currentText = block;
      return;
    }

    for (let cursor = 0; cursor < block.length; cursor += maxCharsPerPage) {
      parts.push(block.slice(cursor, cursor + maxCharsPerPage).trim());
    }
    currentText = "";
  });

  if (currentText) {
    parts.push(currentText);
  }

  return parts
    .map((partText, index) => ({
      label: `${label} (Part ${index + 1})`,
      text: normalizeImporterSourceText(partText)
    }))
    .filter((entry) => entry.text);
}

function prepareImporterSourceForStructuring(source, limits = {}) {
  const pages = Array.isArray(source?.pages) ? source.pages : [];
  const warnings = Array.isArray(source?.warnings) ? source.warnings.slice() : [];
  const preparedPages = [];
  let splitPageCount = 0;

  pages.forEach((page, index) => {
    const label = normalizeImporterText(page?.label) || `Page ${index + 1}`;
    const text = normalizeImporterSourceText(page?.text);
    if (!text) return;

    const maxChars = Number(limits.maxCharsPerPage) || 0;
    const splitPages = splitOversizedImporterSourcePage({ label, text }, maxChars);
    if (splitPages.length > 1) {
      splitPageCount += 1;
    }
    preparedPages.push(...splitPages);
  });

  const deduped = dedupeImporterSourcePages(preparedPages);
  if (deduped.removedCount > 0) {
    warnings.push(`Removed ${deduped.removedCount} duplicate extracted page(s) before structuring.`);
  }
  if (splitPageCount > 0) {
    warnings.push(`Split ${splitPageCount} oversized extracted page(s) into smaller parts before structuring.`);
  }

  return {
    pages: deduped.pages,
    warnings: [...new Set(warnings.filter(Boolean))]
  };
}

function splitImporterSourceIntoChunks(source) {
  const pages = Array.isArray(source?.pages) ? source.pages : [];
  if (!pages.length) return [];

  const chunks = [];
  let currentPages = [];
  let currentChars = 0;

  pages.forEach((page) => {
    const estimatedChars = (page?.label?.length || 0) + (page?.text?.length || 0) + 64;
    const shouldBreak = currentPages.length > 0
      && (
        currentPages.length >= IMPORTER_SOURCE_STRUCTURING_MAX_PAGES
        || currentChars + estimatedChars > IMPORTER_SOURCE_STRUCTURING_MAX_CHARS
      );

    if (shouldBreak) {
      chunks.push({ pages: currentPages, warnings: [] });
      currentPages = [];
      currentChars = 0;
    }

    currentPages.push(page);
    currentChars += estimatedChars;
  });

  if (currentPages.length) {
    chunks.push({ pages: currentPages, warnings: [] });
  }

  return chunks;
}

function mergeStructuredImporterDrafts(drafts) {
  const safeDrafts = Array.isArray(drafts) ? drafts.filter((entry) => entry && typeof entry === "object") : [];
  if (!safeDrafts.length) {
    return {
      restaurantData: {
        menu: [],
        categories: [],
        superCategories: []
      },
      review: {
        summary: "",
        blockers: [],
        warnings: [],
        untranslatedItems: []
      }
    };
  }

  if (safeDrafts.length === 1) {
    return safeDrafts[0];
  }

  const merged = {
    restaurantData: {
      menu: [],
      categories: [],
      superCategories: []
    },
    review: {
      summary: "",
      blockers: [],
      warnings: [],
      untranslatedItems: []
    }
  };

  safeDrafts.forEach((draft, index) => {
    const restaurantData = draft.restaurantData && typeof draft.restaurantData === "object"
      ? draft.restaurantData
      : {};
    const review = draft.review && typeof draft.review === "object"
      ? draft.review
      : {};

    if (Array.isArray(restaurantData.menu)) {
      merged.restaurantData.menu.push(...restaurantData.menu);
    }
    if (Array.isArray(restaurantData.categories)) {
      merged.restaurantData.categories.push(...restaurantData.categories);
    }
    if (Array.isArray(restaurantData.superCategories)) {
      merged.restaurantData.superCategories.push(...restaurantData.superCategories);
    }

    if (Array.isArray(review.blockers)) {
      merged.review.blockers.push(...review.blockers);
    }
    if (Array.isArray(review.warnings)) {
      merged.review.warnings.push(...review.warnings.map((value) => `Chunk ${index + 1}: ${value}`));
    }
    if (Array.isArray(review.untranslatedItems)) {
      merged.review.untranslatedItems.push(...review.untranslatedItems);
    }
  });

  merged.review.summary = `Structured ${merged.restaurantData.menu.length} menu item(s) from ${safeDrafts.length} extracted source chunk(s).`;
  merged.review.blockers = [...new Set(merged.review.blockers.filter(Boolean))];
  merged.review.warnings = [...new Set(merged.review.warnings.filter(Boolean))];
  merged.review.untranslatedItems = [...new Set(merged.review.untranslatedItems.filter(Boolean))];
  return merged;
}

function formatImporterSourceForPrompt(source) {
  const pages = Array.isArray(source?.pages) ? source.pages : [];
  const sections = pages.map((page, index) => {
    const label = normalizeImporterText(page?.label) || `Page ${index + 1}`;
    const text = normalizeImporterSourceText(page?.text);
    return `## ${label}\n${text}`;
  }).filter(Boolean);

  const warnings = Array.isArray(source?.warnings) ? source.warnings.filter(Boolean) : [];

  return [
    "Extracted menu source text:",
    sections.join("\n\n"),
    warnings.length ? `Source extraction warnings:\n- ${warnings.join("\n- ")}` : ""
  ].filter(Boolean).join("\n\n");
}

function deepMerge(target, source) {
  if (Array.isArray(source)) {
    return source.slice();
  }
  if (!source || typeof source !== "object") {
    return source;
  }

  const base = target && typeof target === "object" && !Array.isArray(target)
    ? { ...target }
    : {};

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      base[key] = value.slice();
    } else if (value && typeof value === "object") {
      base[key] = deepMerge(base[key], value);
    } else {
      base[key] = value;
    }
  }

  return base;
}

function normalizeStructuredImporterDraft(parsed) {
  const draft = parsed && typeof parsed === "object"
    ? JSON.parse(JSON.stringify(parsed))
    : {};
  const restaurantData = draft.restaurantData && typeof draft.restaurantData === "object"
    ? draft.restaurantData
    : {};
  const review = draft.review && typeof draft.review === "object"
    ? draft.review
    : {};
  const menu = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
  const categories = Array.isArray(restaurantData.categories) ? restaurantData.categories : [];
  const aliasMap = new Map();
  const catEmojis = {};
  const categoryTranslations = {};
  const reviewWarnings = Array.isArray(review.warnings) ? review.warnings.slice() : [];
  const reviewBlockers = Array.isArray(review.blockers) ? review.blockers.slice() : [];
  let normalizedPriceCount = 0;
  let fallbackCategoryCount = 0;
  let derivedCategoryCount = 0;
  let derivedSuperCategoryCount = 0;
  let duplicateIdCount = 0;

  const derivedCategories = categories.length
    ? categories
    : [...new Set(menu.map((item) => normalizeImporterText(item?.cat)).filter(Boolean))].map((key) => ({
      key,
      name: key,
      emoji: guessImporterCategoryEmoji(key),
      translations: {
        fr: { name: key, desc: "" },
        en: { name: key, desc: "" },
        ar: { name: key, desc: "" }
      }
    }));

  derivedCategories.forEach((category, index) => {
    const translations = category?.translations && typeof category.translations === "object"
      ? category.translations
      : {};
    const normalizedName = normalizeImporterText(category?.name);
    const normalizedFrName = normalizeImporterText(translations?.fr?.name);
    const key = normalizeImporterText(category?.key)
      || normalizedFrName
      || normalizedName
      || `category-${index + 1}`;
    const categoryTranslationSet = fillTranslationSet(translations, normalizedName || key, "");

    catEmojis[key] = asImporterString(category?.emoji) || guessImporterCategoryEmoji(key);
    categoryTranslations[key] = categoryTranslationSet;

    [
      key,
      normalizedName,
      categoryTranslationSet?.fr?.name,
      categoryTranslationSet?.en?.name,
      categoryTranslationSet?.ar?.name
    ].forEach((alias) => {
      const canonical = canonicalImporterLookup(alias);
      if (canonical) aliasMap.set(canonical, key);
    });
  });

  restaurantData.menu = menu.map((item, index) => {
    const images = Array.isArray(item?.images)
      ? item.images.filter((value) => typeof value === "string" && value.trim())
      : [];
    const img = asImporterString(item?.img) || images[0] || "";
    const splitText = splitInlineNameAndDesc(item?.name, item?.desc);
    const catValue = normalizeImporterText(item?.cat);
    let normalizedCat = aliasMap.get(canonicalImporterLookup(catValue)) || catValue || "";
    if (!normalizedCat) {
      normalizedCat = "Menu";
      fallbackCategoryCount += 1;
    }

    const normalizedPrice = normalizeImporterPrice(item?.price, item?.name, item?.desc);
    if (!Number.isFinite(parsePossiblePriceToken(item?.price)) && Number.isFinite(normalizedPrice)) {
      normalizedPriceCount += 1;
    }

    return {
      ...item,
      id: asImporterString(item?.id) || `item-${slugifyImporterKey(normalizedCat)}-${index + 1}`,
      cat: normalizedCat,
      name: splitText.name,
      desc: splitText.desc,
      price: Number.isFinite(normalizedPrice) ? normalizedPrice : null,
      img,
      images: img && !images.length ? [img] : images,
      translations: fillTranslationSet(item?.translations, splitText.name, splitText.desc),
      ingredients: Array.isArray(item?.ingredients)
        ? item.ingredients.map((value) => normalizeImporterText(value)).filter(Boolean)
        : []
    };
  }).filter((item) => item.name);

  if (!categories.length) {
    derivedCategoryCount = Object.keys(categoryTranslations).length;
  }

  if (!categoryTranslations.Menu && restaurantData.menu.some((item) => item.cat === "Menu")) {
    catEmojis.Menu = guessImporterCategoryEmoji("Menu");
    categoryTranslations.Menu = fillTranslationSet({}, "Menu", "");
    aliasMap.set(canonicalImporterLookup("Menu"), "Menu");
    derivedCategoryCount += 1;
  }

  const dedupedMenu = dedupeImporterMenuItems(restaurantData.menu);
  restaurantData.menu = dedupedMenu.items;
  if (dedupedMenu.removedCount > 0) {
    reviewWarnings.push(`Removed ${dedupedMenu.removedCount} duplicate menu item(s) during import cleanup.`);
  }

  const usedMenuIds = new Set();
  restaurantData.menu = restaurantData.menu.map((item, index) => {
    let nextId = asImporterString(item?.id) || `item-${slugifyImporterKey(item?.cat)}-${slugifyImporterKey(item?.name)}-${index + 1}`;
    if (usedMenuIds.has(nextId)) {
      duplicateIdCount += 1;
      nextId = `${nextId}-${index + 1}`;
    }
    usedMenuIds.add(nextId);
    return {
      ...item,
      id: nextId
    };
  });

  const normalizedSuperCategories = (Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : []).map((entry, index) => {
    const cats = Array.isArray(entry?.cats)
      ? [...new Set(entry.cats
        .map((value) => aliasMap.get(canonicalImporterLookup(value)) || normalizeImporterText(value))
        .filter((value) => Boolean(value) && categoryTranslations[value]))]
      : [];
    const fallbackName = normalizeImporterText(entry?.name)
      || (cats.length === 1 ? asImporterString(categoryTranslations[cats[0]]?.fr?.name) || cats[0] : `Super Category ${index + 1}`);
    const fallbackDesc = normalizeImporterText(entry?.desc)
      || (cats.length === 1 ? asImporterString(categoryTranslations[cats[0]]?.fr?.desc) : "");

    return {
      ...entry,
      id: normalizeImporterText(entry?.id) || `super-${slugifyImporterKey(fallbackName)}-${index + 1}`,
      name: fallbackName,
      desc: fallbackDesc,
      emoji: asImporterString(entry?.emoji) || (cats.length === 1 ? asImporterString(catEmojis[cats[0]]) : "🍽️"),
      time: normalizeImporterText(entry?.time),
      cats,
      translations: fillTranslationSet(entry?.translations, fallbackName, fallbackDesc)
    };
  }).filter((entry) => entry.name && entry.cats.length);

  const canonicalSuperCategoryResult = buildCanonicalImporterSuperCategories(
    categoryTranslations,
    restaurantData.menu,
    normalizedSuperCategories
  );
  derivedSuperCategoryCount = canonicalSuperCategoryResult.superCategories.length;
  restaurantData.superCategories = canonicalSuperCategoryResult.superCategories;

  if (restaurantData.branding && typeof restaurantData.branding === "object") {
    const heroSlides = Array.isArray(restaurantData.branding.heroSlides)
      ? restaurantData.branding.heroSlides.filter((value) => typeof value === "string" && value.trim())
      : [];
    const heroImage = asImporterString(restaurantData.branding.heroImage);
    restaurantData.branding.heroSlides = heroSlides.length
      ? heroSlides
      : (heroImage ? [heroImage] : []);
  }

  delete restaurantData.categories;
  restaurantData.catEmojis = catEmojis;
  restaurantData.categoryTranslations = categoryTranslations;
  draft.restaurantData = restaurantData;

  review.summary = asImporterString(review.summary)
    || `Extracted ${restaurantData.menu.length} menu item(s) across ${Object.keys(categoryTranslations).length} category(ies).`;
  if (normalizedPriceCount > 0) {
    reviewWarnings.push(`Recovered ${normalizedPriceCount} price value(s) from extracted menu text.`);
  }
  if (fallbackCategoryCount > 0) {
    reviewWarnings.push(`Grouped ${fallbackCategoryCount} item(s) into a fallback Menu category because no category label was extracted.`);
  }
  if (derivedCategoryCount > 0) {
    reviewWarnings.push(`Derived ${derivedCategoryCount} category record(s) from extracted menu items.`);
  }
  if (derivedSuperCategoryCount > 0) {
    reviewWarnings.push(`Grouped categories into ${derivedSuperCategoryCount} canonical super-category bucket(s) for cleaner navigation.`);
  }
  if (canonicalSuperCategoryResult.fallbackAssignmentCount > 0) {
    reviewWarnings.push(`Mapped ${canonicalSuperCategoryResult.fallbackAssignmentCount} ambiguous category(ies) into the default canonical buckets because the source menu did not label a clear top-level group.`);
  }
  if (duplicateIdCount > 0) {
    reviewWarnings.push(`Rebuilt ${duplicateIdCount} duplicate menu item id(s) during import normalization.`);
  }
  if (!restaurantData.menu.length) {
    reviewBlockers.push("No valid menu items were extracted after import cleanup.");
  }
  if (!Object.keys(categoryTranslations).length) {
    reviewBlockers.push("No valid categories were extracted after import cleanup.");
  }
  review.warnings = [...new Set(reviewWarnings.filter(Boolean))];
  review.blockers = [...new Set(reviewBlockers.filter(Boolean))];
  review.untranslatedItems = Array.isArray(review.untranslatedItems) ? review.untranslatedItems.filter(Boolean) : [];
  draft.review = review;

  return draft;
}

function applyImporterMediaFallbacks(draft, input) {
  const workingDraft = draft && typeof draft === "object" ? draft : {};
  const restaurantData = workingDraft.restaurantData && typeof workingDraft.restaurantData === "object"
    ? workingDraft.restaurantData
    : {};
  const branding = restaurantData.branding && typeof restaurantData.branding === "object"
    ? restaurantData.branding
    : {};
  const logoImageUrl = asImporterString(input?.logoImageUrl);
  const restaurantPhotoUrls = Array.isArray(input?.restaurantPhotoUrls)
    ? input.restaurantPhotoUrls.filter((value) => typeof value === "string" && value.trim())
    : [];

  if (!asImporterString(branding.logoImage) && logoImageUrl) {
    branding.logoImage = logoImageUrl;
  }

  if (!asImporterString(branding.heroImage) && restaurantPhotoUrls[0]) {
    branding.heroImage = restaurantPhotoUrls[0];
  }

  const existingHeroSlides = Array.isArray(branding.heroSlides)
    ? branding.heroSlides.filter((value) => typeof value === "string" && value.trim())
    : [];
  if (!existingHeroSlides.length) {
    branding.heroSlides = [
      asImporterString(branding.heroImage),
      restaurantPhotoUrls[1] || "",
      restaurantPhotoUrls[2] || ""
    ].filter(Boolean);
  } else {
    branding.heroSlides = existingHeroSlides;
  }

  const existingGallery = Array.isArray(restaurantData.gallery)
    ? restaurantData.gallery.filter((value) => typeof value === "string" && value.trim())
    : [];
  if (!existingGallery.length && restaurantPhotoUrls.length) {
    restaurantData.gallery = restaurantPhotoUrls.slice(0, 6);
  } else {
    restaurantData.gallery = existingGallery;
  }

  restaurantData.branding = branding;
  workingDraft.restaurantData = restaurantData;
  return workingDraft;
}

function buildImporterTranslationRequest(draft) {
  const restaurantData = draft?.restaurantData || {};
  return {
    menu: (Array.isArray(restaurantData.menu) ? restaurantData.menu : []).map((item) => ({
      id: item.id ?? null,
      name: asImporterString(item?.name),
      desc: asImporterString(item?.desc),
      translations: fillTranslationSet(item?.translations, asImporterString(item?.name), asImporterString(item?.desc))
    })),
    categories: Object.entries(restaurantData.categoryTranslations || {}).map(([key, value]) => ({
      key,
      name: asImporterString(value?.fr?.name) || key,
      desc: asImporterString(value?.fr?.desc),
      translations: fillTranslationSet(value, asImporterString(value?.fr?.name) || key, asImporterString(value?.fr?.desc))
    })),
    superCategories: (Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : []).map((entry) => ({
      id: asImporterString(entry?.id),
      name: asImporterString(entry?.name),
      desc: asImporterString(entry?.desc),
      translations: fillTranslationSet(entry?.translations, asImporterString(entry?.name), asImporterString(entry?.desc))
    }))
  };
}

function mergeImporterTranslationCompletion(draft, completion) {
  const workingDraft = draft && typeof draft === "object" ? draft : {};
  const restaurantData = workingDraft.restaurantData && typeof workingDraft.restaurantData === "object"
    ? workingDraft.restaurantData
    : {};
  const review = workingDraft.review && typeof workingDraft.review === "object"
    ? workingDraft.review
    : {};
  const menuTranslations = new Map(
    (Array.isArray(completion?.menu) ? completion.menu : []).map((entry) => [String(entry?.id ?? ""), entry?.translations])
  );
  const categoryTranslations = new Map(
    (Array.isArray(completion?.categories) ? completion.categories : []).map((entry) => [asImporterString(entry?.key), entry?.translations])
  );
  const superCategoryTranslations = new Map(
    (Array.isArray(completion?.superCategories) ? completion.superCategories : []).map((entry) => [asImporterString(entry?.id), entry?.translations])
  );

  restaurantData.menu = (Array.isArray(restaurantData.menu) ? restaurantData.menu : []).map((item) => ({
    ...item,
    translations: fillTranslationSet(
      menuTranslations.get(String(item?.id ?? "")) || item?.translations,
      asImporterString(item?.name),
      asImporterString(item?.desc)
    )
  }));

  restaurantData.categoryTranslations = Object.fromEntries(
    Object.entries(restaurantData.categoryTranslations || {}).map(([key, value]) => [
      key,
      fillTranslationSet(
        categoryTranslations.get(key) || value,
        asImporterString(value?.fr?.name) || key,
        asImporterString(value?.fr?.desc)
      )
    ])
  );

  restaurantData.superCategories = (Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : []).map((entry) => ({
    ...entry,
    translations: fillTranslationSet(
      superCategoryTranslations.get(asImporterString(entry?.id)) || entry?.translations,
      asImporterString(entry?.name),
      asImporterString(entry?.desc)
    )
  }));

  const warnings = Array.isArray(review.warnings) ? review.warnings.slice() : [];
  const completionWarnings = Array.isArray(completion?.warnings) ? completion.warnings : [];
  review.warnings = [...warnings, ...completionWarnings].filter(Boolean);
  review.untranslatedItems = restaurantData.menu
    .filter((item) => {
      const translations = item?.translations || {};
      return !asImporterString(translations?.fr?.name)
        || !asImporterString(translations?.en?.name)
        || !asImporterString(translations?.ar?.name);
    })
    .map((item) => asImporterString(item?.name) || String(item?.id ?? "unknown-item"));

  workingDraft.restaurantData = restaurantData;
  workingDraft.review = review;
  return workingDraft;
}

async function completeImporterTranslations(draft) {
  const translationInput = buildImporterTranslationRequest(draft);
  const hasContent = translationInput.menu.length || translationInput.categories.length || translationInput.superCategories.length;
  if (!hasContent) return draft;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_IMPORT_MODEL,
      instructions: IMPORTER_TRANSLATION_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(translationInput)
            }
          ]
        }
      ],
      text: {
        format: IMPORTER_TRANSLATION_COMPLETION_FORMAT
      },
      store: false,
      temperature: 0.2,
      max_output_tokens: 4000
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_translation_completion_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  const parsedPayload = extractStructuredParsedOutput(payload);
  if (parsedPayload) {
    return mergeImporterTranslationCompletion(draft, parsedPayload);
  }

  const rawText = extractResponseText(payload);
  if (!rawText) {
    const error = new Error(payload?.status === "incomplete" ? "incomplete_translation_response" : "empty_translation_response");
    error.statusCode = 502;
    throw error;
  }

  let parsed;
  try {
    parsed = parseModelJsonText(rawText);
  } catch (_error) {
    console.error("IMPORTER RAW TRANSLATION TEXT:", rawText.slice(0, 1200));
    const error = new Error("invalid_translation_json_from_openai");
    error.statusCode = 502;
    throw error;
  }

  return mergeImporterTranslationCompletion(draft, parsed);
}

function extractResponseText(payload) {
  if (payload && typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const parts = [];

  output.forEach((entry) => {
    const content = Array.isArray(entry?.content) ? entry.content : [];
    content.forEach((item) => {
      if (item?.type === "output_text" && typeof item.text === "string") {
        parts.push(item.text);
      }
    });
  });

  return parts.join("").trim();
}

function extractStructuredParsedOutput(payload) {
  if (payload && typeof payload === "object") {
    if (payload.output_parsed && typeof payload.output_parsed === "object") {
      return payload.output_parsed;
    }

    const output = Array.isArray(payload.output) ? payload.output : [];
    for (const entry of output) {
      const content = Array.isArray(entry?.content) ? entry.content : [];
      for (const item of content) {
        if (item && typeof item === "object" && item.parsed && typeof item.parsed === "object") {
          return item.parsed;
        }
      }
    }
  }
  return null;
}

function parseModelJsonText(rawText) {
  const source = typeof rawText === "string" ? rawText.trim() : "";
  const candidates = [];

  if (source) {
    candidates.push(source);
  }

  const fencedMatch = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1].trim());
  }

  const firstBraceIndex = source.indexOf("{");
  const lastBraceIndex = source.lastIndexOf("}");
  if (firstBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
    candidates.push(source.slice(firstBraceIndex, lastBraceIndex + 1).trim());
  }

  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    try {
      return JSON.parse(candidate);
    } catch (_error) {
      // Keep trying weaker recovery candidates.
    }
  }

  throw new Error("invalid_json_from_openai");
}

async function repairImporterJsonText(rawText) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_IMPORT_PDF_MODEL,
      instructions: IMPORTER_REPAIR_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: rawText
            }
          ]
        }
      ],
      text: {
        format: IMPORTER_TEXT_FORMAT
      },
      store: false,
      temperature: 0,
      max_output_tokens: 6000
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_import_repair_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  const parsedPayload = extractStructuredParsedOutput(payload);
  if (parsedPayload) {
    return {
      rawText: JSON.stringify(parsedPayload),
      parsed: parsedPayload
    };
  }

  const repairedText = extractResponseText(payload);
  if (!repairedText) {
    const error = new Error(payload?.status === "incomplete" ? "incomplete_import_repair_response" : "empty_import_repair_response");
    error.statusCode = 502;
    throw error;
  }

  return {
    rawText: repairedText,
    parsed: parseModelJsonText(repairedText)
  };
}

async function buildImporterDraftFromPlainTextFallback(input, context = {}) {
  const assets = buildImporterAssetDescriptors(input);
  const warnings = Array.isArray(context?.warnings) ? context.warnings.slice() : [];
  const extractedResults = [];

  for (const asset of assets) {
    try {
      extractedResults.push(await extractImporterMenuSourceTextFallbackFromAsset(input, asset));
    } catch (error) {
      console.error(`IMPORTER DIRECT PLAIN-TEXT FALLBACK ERROR [${asset.label}]:`, error);
      warnings.push(`${asset.label}: ${error.message}`);
    }
  }

  const fallbackSource = prepareImporterSourceForStructuring({
    pages: extractedResults.flatMap((entry) => entry.pages || []),
    warnings: [
      ...warnings,
      ...extractedResults.flatMap((entry) => Array.isArray(entry.warnings) ? entry.warnings : [])
    ]
  }, {
    maxCharsPerPage: 4500
  });

  if (!fallbackSource.pages.length) {
    const error = new Error("empty_plain_text_importer_fallback");
    error.statusCode = 502;
    throw error;
  }

  const chunks = splitImporterSourceIntoChunks(fallbackSource);
  const structuredDrafts = [];
  for (let index = 0; index < chunks.length; index += 1) {
    structuredDrafts.push(await buildImporterDraftFromSource(input, chunks[index], {
      chunkIndex: index,
      totalChunks: chunks.length
    }));
  }

  const parsed = mergeStructuredImporterDrafts(structuredDrafts);
  const review = parsed.review && typeof parsed.review === "object" ? parsed.review : {};
  const reviewWarnings = Array.isArray(review.warnings) ? review.warnings.slice() : [];
  parsed.review = {
    ...review,
    warnings: [
      ...reviewWarnings,
      "Plain-text extraction fallback used because direct multimodal structuring returned invalid JSON.",
      ...fallbackSource.warnings
    ].filter(Boolean)
  };

  return {
    parsed,
    fallbackSource
  };
}

function extractGeneratedImageBase64(payload) {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  const imageCall = output.find((entry) => entry?.type === "image_generation_call" && typeof entry?.result === "string" && entry.result.trim());
  return imageCall?.result || "";
}

function extractImagesApiBase64(payload) {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const imageRecord = data.find((entry) => typeof entry?.b64_json === "string" && entry.b64_json.trim());
  return imageRecord?.b64_json || "";
}

function isOrgVerificationError(message) {
  return typeof message === "string"
    && /verify organization|verified to use the model|verification/i.test(message);
}

function buildMenuItemImagePrompt(input) {
  const itemName = asImporterString(input?.name) || "Dish";
  const itemDescription = asImporterString(input?.description);
  const categoryKey = asImporterString(input?.categoryKey);
  const categoryName = asImporterString(input?.categoryName) || categoryKey;
  const cuisineHint = asImporterString(input?.cuisineHint);
  const lookup = [itemName, itemDescription, categoryName, cuisineHint]
    .join(" ")
    .toLowerCase();
  const isDrink = /(coffee|cafe|espresso|latte|mocha|tea|th[eé]|juice|smoothie|cocktail|mocktail|drink|boisson|soda|cola|water|eau|milkshake)/.test(lookup);
  const isDessert = /(dessert|cake|tarte|tart|chocolate|fondant|brownie|cookie|glace|ice cream|crepe|gaufre|waffle|cheesecake)/.test(lookup);
  const presentationHint = isDrink
    ? "Present it as a real beverage in the correct cup or glass, with believable texture, foam, ice, or garnish only if appropriate."
    : isDessert
      ? "Present it as a plated dessert portion with realistic garnish and restaurant-style dessert presentation."
      : "Present it as a plated savory restaurant dish, with a believable portion size and garnish only when it fits the described recipe.";

  return [
    "Create a realistic restaurant menu photo for a mobile ordering app.",
    "Return one single real-looking food or drink photograph, not an illustration or generic stock-style mockup.",
    "The image should look like a dish actually served by a real restaurant: believable plating, natural texture, realistic lighting, and normal restaurant tableware.",
    "Compose it like professional menu photography: close-up or 3/4 angle, one clear subject, clean background, strong focus on the dish, and a crop that works for a square menu thumbnail.",
    presentationHint,
    categoryName ? `Category: ${categoryName}.` : "",
    cuisineHint ? `Cuisine hint: ${cuisineHint}.` : "",
    `Dish name: ${itemName}.`,
    itemDescription ? `Dish description and ingredients: ${itemDescription}.` : "",
    "Follow the dish name and description closely. Do not substitute the main ingredients with something else.",
    "Avoid text, labels, logos, watermark, collage, split layout, packaging mockup, cutaway views, floating ingredients, duplicated plates, hands, or visible people.",
    "Keep the main dish centered and clearly readable at small mobile sizes."
  ].filter(Boolean).join(" ");
}

function buildCategoryImagePrompt(input) {
  const categoryName = asImporterString(input?.categoryName);
  const superCategoryName = asImporterString(input?.superCategoryName);
  const sampleItems = Array.isArray(input?.sampleItems)
    ? input.sampleItems
      .map((value) => asImporterString(value))
      .filter(Boolean)
      .slice(0, 4)
    : [];
  const translations = input?.translations && typeof input.translations === "object" ? input.translations : {};
  const translatedNames = ["fr", "en", "ar"]
    .map((lang) => asImporterString(translations?.[lang]?.name))
    .filter(Boolean)
    .join(" / ");

  return [
    "Create a realistic restaurant menu category image for a mobile ordering app.",
    "Return one single real-looking food or drink photograph, not an illustration, emoji, icon, or poster.",
    categoryName ? `Primary category: ${categoryName}.` : "",
    superCategoryName ? `Top-level menu group: ${superCategoryName}.` : "",
    translatedNames ? `Category names across languages: ${translatedNames}.` : "",
    sampleItems.length ? `Representative items in this category: ${sampleItems.join(", ")}.` : "",
    "Show one representative plated dish or beverage style for this category only.",
    "The result should feel premium and appetizing, with believable tableware, natural restaurant lighting, and a composition that works as a soft visual background behind a category product list.",
    "Avoid text, labels, logos, watermark, collage, packaging, hands, and visible people."
  ].filter(Boolean).join(" ");
}

async function generateMenuItemMediaImage(input) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("openai_not_configured");
    error.statusCode = 400;
    throw error;
  }

  const itemName = asImporterString(input?.name);
  if (!itemName) {
    const error = new Error("menu_item_name_required");
    error.statusCode = 400;
    throw error;
  }

  const itemLike = {
    name: itemName,
    desc: asImporterString(input?.description),
    cat: asImporterString(input?.categoryKey),
    translations: input?.translations && typeof input.translations === "object" ? input.translations : {}
  };
  const prompt = buildMenuItemImagePrompt(input);

  async function requestMenuItemImage(model) {
    const quality = resolveOpenAiItemMediaQuality(model);
    const normalizedModel = asImporterString(model).toLowerCase();
    const body = {
      model,
      prompt,
      size: "1024x1024",
      quality
    };
    if (normalizedModel === "dall-e-3" || normalizedModel === "dall-e-2") {
      body.response_format = "b64_json";
    }
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, model, quality };
  }

  let generationResult = await requestMenuItemImage(OPENAI_ITEM_MEDIA_MODEL);
  if (!generationResult.response.ok) {
    const initialMessage = generationResult.payload?.error?.message || generationResult.payload?.message || "openai_menu_item_media_request_failed";
    if (OPENAI_ITEM_MEDIA_MODEL !== "dall-e-3" && isOrgVerificationError(initialMessage)) {
      generationResult = await requestMenuItemImage("dall-e-3");
    }
  }

  if (!generationResult.response.ok) {
    const message = generationResult.payload?.error?.message || generationResult.payload?.message || "openai_menu_item_media_request_failed";
    const error = new Error(message);
    error.statusCode = generationResult.response.status || 502;
    throw error;
  }

  const base64Image = extractImagesApiBase64(generationResult.payload);
  if (!base64Image) {
    const error = new Error("empty_generated_image");
    error.statusCode = 502;
    throw error;
  }

  const url = await saveGeneratedImage(base64Image, "product-generated");
  let libraryAssetId = "";

  try {
    const uploadPath = resolveLocalUploadPath(url);
    if (uploadPath) {
      const libraryAsset = registerLibraryAsset({
        sourceFilePath: uploadPath,
        slotType: "product",
        sourceType: "generated",
        displayName: itemName,
        description: itemLike.desc || itemName,
        categoryKey: itemLike.cat,
        recipeKey: buildProductRecipeKeyFromMenuItem(itemLike),
        languageVariants: itemLike.translations,
        tags: [itemLike.cat, "menu-item", itemName].filter(Boolean),
        approved: true,
        model: generationResult.model,
        quality: generationResult.quality,
        prompt,
        promptVersion: "menu-item-image-v2",
        notes: "Generated from the item image modal.",
        createdFrom: "menu_item_image_modal"
      });
      libraryAssetId = libraryAsset?.assetId || "";
    }
  } catch (error) {
    console.error("MENU ITEM MEDIA LIBRARY REGISTER ERROR:", error);
  }

  return {
    url,
    prompt,
    libraryAssetId,
    model: generationResult.model,
    quality: generationResult.quality
  };
}

async function generateCategoryMediaImage(input) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("openai_not_configured");
    error.statusCode = 400;
    throw error;
  }

  const categoryName = asImporterString(input?.categoryName);
  if (!categoryName) {
    const error = new Error("category_name_required");
    error.statusCode = 400;
    throw error;
  }

  const prompt = buildCategoryImagePrompt(input);

  async function requestCategoryImage(model) {
    const quality = resolveOpenAiItemMediaQuality(model);
    const normalizedModel = asImporterString(model).toLowerCase();
    const body = {
      model,
      prompt,
      size: "1024x1024",
      quality
    };
    if (normalizedModel === "dall-e-3" || normalizedModel === "dall-e-2") {
      body.response_format = "b64_json";
    }
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, model, quality };
  }

  let generationResult = await requestCategoryImage(OPENAI_ITEM_MEDIA_MODEL);
  if (!generationResult.response.ok) {
    const initialMessage = generationResult.payload?.error?.message || generationResult.payload?.message || "openai_category_media_request_failed";
    if (OPENAI_ITEM_MEDIA_MODEL !== "dall-e-3" && isOrgVerificationError(initialMessage)) {
      generationResult = await requestCategoryImage("dall-e-3");
    }
  }

  if (!generationResult.response.ok) {
    const message = generationResult.payload?.error?.message || generationResult.payload?.message || "openai_category_media_request_failed";
    const error = new Error(message);
    error.statusCode = generationResult.response.status || 502;
    throw error;
  }

  const base64Image = extractImagesApiBase64(generationResult.payload);
  if (!base64Image) {
    const error = new Error("empty_generated_image");
    error.statusCode = 502;
    throw error;
  }

  const url = await saveGeneratedImage(base64Image, "category-generated");
  return {
    url,
    prompt,
    model: generationResult.model,
    quality: generationResult.quality
  };
}

function applyImporterProductLibraryMatches(draft) {
  const nextDraft = draft && typeof draft === "object" ? JSON.parse(JSON.stringify(draft)) : {};
  const restaurantData = nextDraft.restaurantData && typeof nextDraft.restaurantData === "object"
    ? nextDraft.restaurantData
    : {};
  const menuItems = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
  const assetUrlCache = new Map();
  let matchedCount = 0;

  restaurantData.menu = menuItems.map((item) => {
    const primaryImage = typeof item?.img === "string" && item.img.trim()
      ? item.img.trim()
      : (Array.isArray(item?.images) ? item.images.find((value) => typeof value === "string" && value.trim()) : "");
    if (primaryImage) return item;

    const matchedAsset = findApprovedProductAssetForMenuItem(item);
    if (!matchedAsset) return item;

    let uploadUrl = assetUrlCache.get(matchedAsset.assetId);
    if (!uploadUrl) {
      uploadUrl = materializeLibraryAssetToUpload(matchedAsset);
      if (!uploadUrl) return item;
      assetUrlCache.set(matchedAsset.assetId, uploadUrl);
    }

    matchedCount += 1;
    return {
      ...item,
      img: uploadUrl,
      images: [uploadUrl]
    };
  });

  nextDraft.restaurantData = restaurantData;

  const review = nextDraft.review && typeof nextDraft.review === "object" ? nextDraft.review : {};
  const warnings = Array.isArray(review.warnings) ? review.warnings.slice() : [];
  if (matchedCount > 0) {
    warnings.push(`Local media library matched ${matchedCount} menu item image(s) before seller apply.`);
  }
  nextDraft.review = {
    ...review,
    warnings,
    mediaLibraryMatches: matchedCount
  };

  return { draft: nextDraft, matchedCount };
}

async function extractImporterMenuSourceFromAsset(input, asset) {
  const notes = asImporterString(input?.notes);
  const restaurantName = asImporterString(input?.restaurantName);
  const shortName = asImporterString(input?.shortName);
  const importerModel = getImporterModelForAsset(asset);
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: importerModel,
      instructions: IMPORTER_SOURCE_EXTRACTION_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Restaurant name: ${restaurantName || "(not provided)"}`,
                `Short brand name: ${shortName || "(not provided)"}`,
                `Seller notes: ${notes || "(none)"}`,
                `Extract source text only from this asset: ${asset.label}`,
                asset.kind === "pdf"
                  ? "This asset is a PDF. Return one page entry per PDF page in reading order."
                  : "This asset is a menu image. Return one page entry for the visible menu content in this image."
              ].join("\n")
            },
            asset.contentInput
          ]
        }
      ],
      text: {
        format: IMPORTER_SOURCE_EXTRACTION_FORMAT
      },
      store: false,
      temperature: 0,
      max_output_tokens: asset.kind === "pdf" ? 12000 : 3000
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_source_extraction_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  let normalized;
  const parsedPayload = extractStructuredParsedOutput(payload);
  if (parsedPayload) {
    normalized = normalizeImporterSourceExtraction(parsedPayload);
  } else {
    const rawText = extractResponseText(payload);
    if (!rawText) {
      const error = new Error(payload?.status === "incomplete" ? "incomplete_source_extraction_response" : "empty_source_extraction_response");
      error.statusCode = 502;
      throw error;
    }

    normalized = normalizeImporterSourceExtraction(parseModelJsonText(rawText));
  }

  const pages = normalized.pages.map((page, index) => {
    const rawLabel = normalizeImporterText(page?.label);
    const pageLabel = asset.kind === "pdf"
      ? `${asset.label} - ${rawLabel || `Page ${index + 1}`}`
      : (normalized.pages.length > 1 ? `${asset.label} - Part ${index + 1}` : asset.label);

    return {
      label: pageLabel,
      text: normalizeImporterSourceText(page?.text)
    };
  }).filter((page) => page.text);

  return {
    asset: {
      kind: asset.kind,
      label: asset.label,
      url: asset.url,
      model: importerModel
    },
    pages,
    warnings: normalized.warnings.map((warning) => `${asset.label}: ${warning}`)
  };
}

async function extractImporterMenuSourceTextFallbackFromAsset(input, asset) {
  const notes = asImporterString(input?.notes);
  const restaurantName = asImporterString(input?.restaurantName);
  const shortName = asImporterString(input?.shortName);
  const importerModel = getImporterModelForAsset(asset);
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: importerModel,
      instructions: IMPORTER_SOURCE_TEXT_FALLBACK_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Restaurant name: ${restaurantName || "(not provided)"}`,
                `Short brand name: ${shortName || "(not provided)"}`,
                `Seller notes: ${notes || "(none)"}`,
                `Extract raw menu text only from this asset: ${asset.label}`
              ].join("\n")
            },
            asset.contentInput
          ]
        }
      ],
      store: false,
      temperature: 0,
      max_output_tokens: asset.kind === "pdf" ? 12000 : 3500
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_source_text_fallback_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  const rawText = normalizeImporterSourceText(extractResponseText(payload));
  if (!rawText) {
    const error = new Error(payload?.status === "incomplete" ? "incomplete_source_text_fallback_response" : "empty_source_text_fallback_response");
    error.statusCode = 502;
    throw error;
  }

  return {
    asset: {
      kind: asset.kind,
      label: asset.label,
      url: asset.url,
      model: importerModel,
      mode: "text_fallback"
    },
    pages: splitOversizedImporterSourcePage({
      label: asset.label,
      text: rawText
    }, 3200),
    warnings: [`${asset.label}: Plain-text source fallback used because structured source extraction did not return usable pages.`]
  };
}

async function extractImporterMenuSource(input) {
  const assets = buildImporterAssetDescriptors(input);
  if (!assets.length) {
    return { pages: [], warnings: [], assets: [] };
  }

  const warnings = [];
  const results = [];

  for (const asset of assets) {
    try {
      const primaryResult = await extractImporterMenuSourceFromAsset(input, asset);
      if (Array.isArray(primaryResult.pages) && primaryResult.pages.length) {
        results.push(primaryResult);
        continue;
      }
      throw new Error("empty_structured_source_extraction");
    } catch (error) {
      console.error(`IMPORTER ASSET SOURCE EXTRACTION ERROR [${asset.label}]:`, error);
      try {
        const fallbackResult = await extractImporterMenuSourceTextFallbackFromAsset(input, asset);
        results.push(fallbackResult);
        warnings.push(`${asset.label}: structured source extraction fallback used (${error.message}).`);
      } catch (fallbackError) {
        console.error(`IMPORTER ASSET SOURCE TEXT FALLBACK ERROR [${asset.label}]:`, fallbackError);
        warnings.push(`${asset.label}: ${fallbackError.message}`);
      }
    }
  }

  const merged = prepareImporterSourceForStructuring({
    pages: results.flatMap((entry) => entry.pages || []),
    warnings: [
      ...warnings,
      ...results.flatMap((entry) => Array.isArray(entry.warnings) ? entry.warnings : [])
    ]
  }, {
    maxCharsPerPage: 4500
  });

  return {
    ...merged,
    assets: results.map((entry) => ({
      ...entry.asset,
      pages: Array.isArray(entry.pages) ? entry.pages : [],
      warnings: Array.isArray(entry.warnings) ? entry.warnings : []
    }))
  };
}

async function buildImporterDraftFromSource(input, sourceExtraction, options = {}) {
  const chunkIndex = Number(options?.chunkIndex) || 0;
  const totalChunks = Number(options?.totalChunks) || 1;
  const importerModel = totalChunks > 1
    ? OPENAI_IMPORT_PDF_MODEL
    : getImporterModelForInput(input);
  const userContext = [
    `Restaurant name: ${input.restaurantName || "(not provided)"}`,
    `Short brand name: ${input.shortName || "(not provided)"}`,
    `Menu image count: ${Array.isArray(input.menuImageUrls) ? input.menuImageUrls.length : 0}`,
    `Menu PDF count: ${Array.isArray(input.menuPdfUrls) ? input.menuPdfUrls.length : 0}`,
    `Seller notes: ${input.notes || "(none)"}`,
    totalChunks > 1
      ? `Source chunk: ${chunkIndex + 1} of ${totalChunks}. Structure only the items and groups present in this chunk.`
      : "Source chunk: full extracted source."
  ].join("\n");

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: importerModel,
      instructions: IMPORTER_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${userContext}\n\n${formatImporterSourceForPrompt(sourceExtraction)}`
            }
          ]
        }
      ],
      text: {
        format: IMPORTER_TEXT_FORMAT
      },
      store: false,
      temperature: 0,
      max_output_tokens: 7000
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_request_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  const parsedPayload = extractStructuredParsedOutput(payload);
  if (parsedPayload) {
    return parsedPayload;
  }

  const rawText = extractResponseText(payload);
  if (!rawText) {
    const error = new Error(payload?.status === "incomplete" ? "incomplete_openai_response" : "empty_openai_response");
    error.statusCode = 502;
    throw error;
  }

  return parseModelJsonText(rawText);
}

async function buildImporterDraftDirectFromAssets(input) {
  const menuImageUrls = Array.isArray(input?.menuImageUrls) ? input.menuImageUrls : [];
  const menuPdfUrls = Array.isArray(input?.menuPdfUrls) ? input.menuPdfUrls : [];
  const restaurantName = asImporterString(input?.restaurantName);
  const shortName = asImporterString(input?.shortName);
  const notes = asImporterString(input?.notes);
  const importerModel = getImporterModelForInput(input);
  const imageInputs = menuImageUrls.map(buildInputImageFromUploadUrl).filter(Boolean);
  const fileInputs = menuPdfUrls.map(buildInputFileFromUploadUrl).filter(Boolean);
  const userContext = [
    `Restaurant name: ${restaurantName || "(not provided)"}`,
    `Short brand name: ${shortName || "(not provided)"}`,
    `Menu image count: ${menuImageUrls.length}`,
    `Menu PDF count: ${menuPdfUrls.length}`,
    `Seller notes: ${notes || "(none)"}`
  ].join("\n");

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: importerModel,
      instructions: IMPORTER_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: userContext },
            ...fileInputs,
            ...imageInputs
          ]
        }
      ],
      text: {
        format: IMPORTER_TEXT_FORMAT
      },
      store: false,
      temperature: 0,
      max_output_tokens: 9000
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_request_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  const parsedPayload = extractStructuredParsedOutput(payload);
  if (parsedPayload) {
    return {
      payload,
      parsed: parsedPayload,
      rawText: JSON.stringify(parsedPayload)
    };
  }

  const rawText = extractResponseText(payload);
  if (!rawText) {
    const error = new Error(payload?.status === "incomplete" ? "incomplete_openai_response" : "empty_openai_response");
    error.statusCode = 502;
    throw error;
  }

  try {
    return {
      payload,
      parsed: parseModelJsonText(rawText),
      rawText
    };
  } catch (_error) {
    console.error("IMPORTER RAW OPENAI TEXT:", rawText.slice(0, 1200));
    try {
      const repaired = await repairImporterJsonText(rawText);
      return {
        payload,
        parsed: repaired.parsed,
        rawText,
        repairedRawText: repaired.rawText
      };
    } catch (repairError) {
      console.error("IMPORTER JSON REPAIR ERROR:", repairError);
      const plainTextFallback = await buildImporterDraftFromPlainTextFallback(input, {
        warnings: [
          `Direct multimodal structuring repair fallback used: ${repairError.message}`
        ]
      });
      return {
        payload,
        parsed: plainTextFallback.parsed,
        rawText,
        repairedRawText: "",
        plainTextFallbackSource: plainTextFallback.fallbackSource
      };
    }
  }
}

async function finalizeImporterDraft(parsedDraft, input, extraWarnings = []) {
  const skeleton = buildImporterDraftSkeleton(input);
  let enrichedDraft = normalizeStructuredImporterDraft(parsedDraft);
  enrichedDraft = applyImporterMediaFallbacks(enrichedDraft, {
    logoImageUrl: input.logoImageUrl,
    restaurantPhotoUrls: input.restaurantPhotoUrls
  });

  if (extraWarnings.length) {
    const review = enrichedDraft.review && typeof enrichedDraft.review === "object" ? enrichedDraft.review : {};
    const warnings = Array.isArray(review.warnings) ? review.warnings.slice() : [];
    enrichedDraft.review = {
      ...review,
      warnings: [...warnings, ...extraWarnings].filter(Boolean)
    };
  }

  try {
    enrichedDraft = await completeImporterTranslations(enrichedDraft);
  } catch (error) {
    console.error("IMPORTER TRANSLATION COMPLETION ERROR:", error);
    const review = enrichedDraft.review && typeof enrichedDraft.review === "object" ? enrichedDraft.review : {};
    const warnings = Array.isArray(review.warnings) ? review.warnings.slice() : [];
    warnings.push(`Translation completion fallback used: ${error.message}`);
    enrichedDraft.review = { ...review, warnings };
  }

  let mergedDraft = deepMerge(skeleton, enrichedDraft);
  const matchedMedia = applyImporterProductLibraryMatches(mergedDraft);
  mergedDraft = matchedMedia.draft;

  return {
    draft: mergedDraft,
    mediaLibraryMatches: matchedMedia.matchedCount
  };
}

async function generateImporterDraft(input) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("openai_not_configured");
    error.statusCode = 400;
    throw error;
  }

  const menuImageUrls = Array.isArray(input.menuImageUrls) ? input.menuImageUrls.slice(0, IMPORTER_MAX_MENU_IMAGES) : [];
  const menuPdfUrls = Array.isArray(input.menuPdfUrls) ? input.menuPdfUrls.slice(0, IMPORTER_MAX_MENU_IMAGES) : [];
  const restaurantPhotoUrls = Array.isArray(input.restaurantPhotoUrls) ? input.restaurantPhotoUrls.slice(0, IMPORTER_MAX_VENUE_IMAGES) : [];
  const logoImageUrl = typeof input.logoImageUrl === "string" ? input.logoImageUrl.trim() : "";
  const restaurantName = typeof input.restaurantName === "string" ? input.restaurantName.trim() : "";
  const shortName = typeof input.shortName === "string" ? input.shortName.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const importerModel = getImporterModelForInput({ menuPdfUrls });
  const job = createSellerJob("import");
  let importerStage = "request";

  try {
    importerStage = "prepare_input";
    writeSellerJobJson(job.jobId, "input/request.json", {
      restaurantName,
      shortName,
      notes,
      menuImageUrls,
      menuPdfUrls,
      logoImageUrl,
      restaurantPhotoUrls,
      model: importerModel
    });
    copyUploadUrlsToSellerJob(job.jobId, "input/menu-images", menuImageUrls);
    copyUploadUrlsToSellerJob(job.jobId, "input/menu-pdfs", menuPdfUrls);
    copyUploadUrlsToSellerJob(job.jobId, "input/logo", logoImageUrl ? [logoImageUrl] : []);
    copyUploadUrlsToSellerJob(job.jobId, "input/venue", restaurantPhotoUrls);

    if (!menuImageUrls.length && !menuPdfUrls.length) {
      const error = new Error("no_import_assets");
      error.statusCode = 400;
      throw error;
    }
    const inputContext = {
      restaurantName,
      shortName,
      notes,
      menuImageUrls,
      menuPdfUrls,
      logoImageUrl,
      restaurantPhotoUrls
    };

    let parsedDraft = null;
    let sourceExtraction = null;
    const importerWarnings = [];

    try {
      importerStage = "source_extraction";
      sourceExtraction = await extractImporterMenuSource(inputContext);
      writeSellerJobJson(job.jobId, "extraction/menu-source.json", sourceExtraction);
      if (Array.isArray(sourceExtraction.assets)) {
        sourceExtraction.assets.forEach((asset, index) => {
          const assetKey = String(index + 1).padStart(2, "0");
          writeSellerJobJson(job.jobId, `extraction/source-assets/${assetKey}.json`, asset);
          if (Array.isArray(asset.pages) && asset.pages.length) {
            writeSellerJobText(job.jobId, `extraction/source-assets/${assetKey}.txt`, formatImporterSourceForPrompt({
              pages: asset.pages,
              warnings: Array.isArray(asset.warnings) ? asset.warnings : []
            }));
          }
        });
      }

      if (sourceExtraction.pages.length) {
        writeSellerJobText(job.jobId, "extraction/menu-source.txt", formatImporterSourceForPrompt(sourceExtraction));
        const sourceChunks = splitImporterSourceIntoChunks(sourceExtraction);
        writeSellerJobJson(job.jobId, "extraction/source-chunks/index.json", sourceChunks.map((chunk, index) => ({
          chunk: index + 1,
          pages: Array.isArray(chunk.pages) ? chunk.pages.map((page) => page.label) : [],
          pageCount: Array.isArray(chunk.pages) ? chunk.pages.length : 0
        })));

        if (sourceChunks.length > 1) {
          importerWarnings.push(`Structured extracted source in ${sourceChunks.length} chunk(s) for a more reliable large-menu import.`);
        }

        const structuredChunks = [];
        for (let index = 0; index < sourceChunks.length; index += 1) {
          const chunk = sourceChunks[index];
          const chunkKey = String(index + 1).padStart(2, "0");
          writeSellerJobJson(job.jobId, `extraction/source-chunks/${chunkKey}.json`, chunk);
          writeSellerJobText(job.jobId, `extraction/source-chunks/${chunkKey}.txt`, formatImporterSourceForPrompt(chunk));
          importerStage = sourceChunks.length > 1 ? `source_structuring_chunk_${index + 1}` : "source_structuring";
          const structuredChunk = await buildImporterDraftFromSource(inputContext, chunk, {
            chunkIndex: index,
            totalChunks: sourceChunks.length
          });
          structuredChunks.push(structuredChunk);
          writeSellerJobJson(job.jobId, `extraction/structured-from-source/${chunkKey}.json`, structuredChunk);
        }

        parsedDraft = mergeStructuredImporterDrafts(structuredChunks);
        writeSellerJobJson(job.jobId, "extraction/structured-from-source.json", parsedDraft);
      } else {
        importerWarnings.push("Source extraction produced no usable page text, so the importer fell back to direct multimodal structuring.");
      }
    } catch (error) {
      console.error("IMPORTER SOURCE EXTRACTION ERROR:", error);
      importerWarnings.push(`Source extraction fallback used: ${error.message}`);
    }

    if (!parsedDraft) {
      importerStage = "direct_structuring";
      const directDraft = await buildImporterDraftDirectFromAssets(inputContext);
      writeSellerJobJson(job.jobId, "extraction/openai-response.json", directDraft.payload);
      if (directDraft.rawText) {
        writeSellerJobText(job.jobId, "extraction/raw-output.txt", directDraft.rawText);
      }
      if (directDraft.repairedRawText) {
        writeSellerJobText(job.jobId, "extraction/repaired-output.txt", directDraft.repairedRawText);
      }
      if (directDraft.plainTextFallbackSource) {
        writeSellerJobJson(job.jobId, "extraction/plain-text-fallback-source.json", directDraft.plainTextFallbackSource);
        writeSellerJobText(job.jobId, "extraction/plain-text-fallback-source.txt", formatImporterSourceForPrompt(directDraft.plainTextFallbackSource));
      }
      parsedDraft = directDraft.parsed;
    }

    importerStage = "finalize";
    const finalized = await finalizeImporterDraft(
      parsedDraft,
      inputContext,
      [
        ...importerWarnings,
        ...(Array.isArray(sourceExtraction?.warnings)
          ? sourceExtraction.warnings.map((warning) => `Source extraction: ${warning}`)
          : [])
      ]
    );

    writeSellerJobJson(job.jobId, "final/draft.json", finalized.draft);

    return {
      draft: finalized.draft,
      jobId: job.jobId,
      mediaLibraryMatches: finalized.mediaLibraryMatches
    };
  } catch (error) {
    error.jobId = job.jobId;
    error.importerStage = error.importerStage || importerStage;
    writeSellerJobJson(job.jobId, "review/error.json", {
      message: error.message,
      stage: error.importerStage || importerStage,
      statusCode: error.statusCode || 500,
      at: new Date().toISOString()
    });
    throw error;
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
    .toString("hex");

  return {
    passwordHash,
    passwordSalt: salt,
    passwordIterations: HASH_ITERATIONS,
    passwordKeyLength: HASH_KEY_LENGTH,
    passwordDigest: HASH_DIGEST
  };
}

function verifyPassword(password, credentials) {
  if (!credentials || typeof password !== "string") return false;

  if (credentials.passwordHash && credentials.passwordSalt) {
    const iterations = Number(credentials.passwordIterations) || HASH_ITERATIONS;
    const keyLength = Number(credentials.passwordKeyLength) || HASH_KEY_LENGTH;
    const digest = credentials.passwordDigest || HASH_DIGEST;
    const candidateHash = crypto
      .pbkdf2Sync(password, credentials.passwordSalt, iterations, keyLength, digest)
      .toString("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(candidateHash, "hex"),
        Buffer.from(credentials.passwordHash, "hex")
      );
    } catch (_error) {
      return false;
    }
  }

  if (typeof credentials.pass === "string") {
    return password === credentials.pass;
  }

  return false;
}

function buildCredentialMeta(raw, source) {
  const user = typeof raw?.user === "string" && raw.user.trim()
    ? raw.user.trim()
    : DEFAULT_ADMIN_USER;
  const hasHash = typeof raw?.passwordHash === "string" && typeof raw?.passwordSalt === "string";
  const legacyPass = typeof raw?.pass === "string" ? raw.pass : "";
  const usesDefaultCredentials = user === DEFAULT_ADMIN_USER
    && (hasHash ? verifyPassword(DEFAULT_ADMIN_PASS, raw) : legacyPass === DEFAULT_ADMIN_PASS);

  return {
    ...raw,
    user,
    source,
    isLegacyPlainText: !hasHash && typeof raw?.pass === "string",
    usesDefaultCredentials
  };
}

function getAdminCredentials() {
  if (fs.existsSync(authFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(authFile, "utf8"));
      return buildCredentialMeta(parsed, "file");
    } catch (error) {
      console.error("Error reading auth.json:", error);
    }
  }

  const fallbackUser = process.env.ADMIN_USER || DEFAULT_ADMIN_USER;
  const fallbackPass = process.env.ADMIN_PASS || DEFAULT_ADMIN_PASS;
  return buildCredentialMeta(
    { user: fallbackUser, pass: fallbackPass },
    process.env.ADMIN_USER || process.env.ADMIN_PASS ? "env" : "default"
  );
}

function saveAdminCredentials(user, password) {
  try {
    const hashed = hashPassword(password);
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(
      authFile,
      JSON.stringify(
        {
          user,
          ...hashed,
          passwordUpdatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
    return true;
  } catch (error) {
    console.error("Error saving auth.json:", error);
    return false;
  }
}

function migrateLegacyCredentialsIfNeeded(credentials, password) {
  if (credentials?.source === "file" && credentials.isLegacyPlainText && typeof password === "string" && password) {
    const migrated = saveAdminCredentials(credentials.user, password);
    if (migrated) {
      currentCreds = getAdminCredentials();
      console.log("[AUTH] Migrated legacy plain-text credentials to hashed storage.");
    }
  }
}

function getRateLimitKey(req, username) {
  const requestIp = typeof req.ip === "string" && req.ip ? req.ip : "";
  const forwarded = typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"] : "";
  const ip = requestIp || forwarded || "unknown";
  return `${String(username || "").trim().toLowerCase()}::${ip}`;
}

function getRateLimitState(key) {
  const now = Date.now();
  const state = loginAttempts.get(key);

  if (!state) {
    return { count: 0, firstAttemptAt: now, lockedUntil: 0 };
  }

  if (state.lockedUntil && state.lockedUntil > now) {
    return state;
  }

  if (now - state.firstAttemptAt > LOGIN_WINDOW_MS) {
    const resetState = { count: 0, firstAttemptAt: now, lockedUntil: 0 };
    loginAttempts.set(key, resetState);
    return resetState;
  }

  return state;
}

function registerFailedLogin(key) {
  const now = Date.now();
  const currentState = getRateLimitState(key);
  const nextState = {
    count: currentState.count + 1,
    firstAttemptAt: currentState.count === 0 ? now : currentState.firstAttemptAt,
    lockedUntil: 0
  };

  if (nextState.count >= MAX_LOGIN_ATTEMPTS) {
    nextState.lockedUntil = now + LOGIN_LOCK_MS;
  }

  loginAttempts.set(key, nextState);
  return nextState;
}

function clearFailedLogins(key) {
  loginAttempts.delete(key);
}

let currentCreds = getAdminCredentials();
if (currentCreds.usesDefaultCredentials) {
  console.warn("Using default fallback credentials (admin / foody2026). Consider changing them in the Security tab.");
}

ensureStorage();
ensureMediaLibraryStructure();
ensureSellerJobsStructure();

app.use(express.json({ limit: MAX_JSON_BYTES }));

function requireAuth(req, res, next) {
  const token = getSessionToken(req);
  if (!sessions.isValid(token)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  next();
}

function requireSellerTools(_req, res, next) {
  if (!SELLER_TOOLS_ENABLED) {
    res.status(403).json({ ok: false, error: "seller_tools_disabled" });
    return;
  }
  next();
}

function requireAiMediaTools(_req, res, next) {
  if (!AI_MEDIA_TOOLS_ENABLED) {
    res.status(403).json({ ok: false, error: "ai_media_disabled" });
    return;
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "admin", build });
});

app.get("/build.json", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ status: "ok", service: "admin", build });
});

function getAdminPwaMeta() {
  const data = readData();
  const branding = data?.branding && typeof data.branding === "object" ? data.branding : {};
  const restaurantName = typeof branding.restaurantName === "string" && branding.restaurantName.trim()
    ? branding.restaurantName.trim()
    : "Restaurant";
  const shortName = typeof branding.shortName === "string" && branding.shortName.trim()
    ? branding.shortName.trim()
    : restaurantName;
  const primaryColor = typeof branding.primaryColor === "string" && branding.primaryColor.trim()
    ? branding.primaryColor.trim()
    : "#ff8d08";
  const menuBackground = typeof branding.menuBackground === "string" && branding.menuBackground.trim()
    ? branding.menuBackground.trim()
    : "#111318";

  return {
    restaurantName,
    shortName,
    primaryColor,
    menuBackground
  };
}

app.get("/manifest.webmanifest", (_req, res) => {
  const meta = getAdminPwaMeta();
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.type("application/manifest+json");
  res.send(JSON.stringify({
    id: "/admin.html",
    name: `${meta.restaurantName} Admin`,
    short_name: `${meta.shortName}`.slice(0, 12) || "Admin",
    description: `Manage ${meta.restaurantName} quickly from your phone or desktop home screen.`,
    start_url: "/admin.html?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: meta.menuBackground,
    theme_color: meta.menuBackground,
    categories: ["business", "food", "productivity"],
    icons: [
      {
        src: `/images/pwa/admin-app-icon.svg?v=${build}`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: `/images/pwa/admin-app-icon-192.png?v=${build}`,
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: `/images/pwa/admin-app-icon-512.png?v=${build}`,
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: `/images/pwa/admin-app-icon-maskable-512.png?v=${build}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  }, null, 2));
});

app.get("/admin-sw.js", (_req, res) => {
  const precacheAssets = [
    "/",
    "/admin",
    "/admin.html",
    "/admin.js",
    "/shared.js",
    "/manifest.webmanifest",
    "/images/pwa/admin-app-icon-64.png",
    "/images/pwa/admin-app-icon-180.png",
    "/images/pwa/admin-app-icon-192.png",
    "/images/pwa/admin-app-icon-512.png",
    "/images/pwa/admin-app-icon-maskable-512.png",
    "/images/pwa/admin-app-icon.svg"
  ];

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.type("application/javascript");
  res.send(`
const CACHE_NAME = "restaurant-admin-shell-${build}";
const PRECACHE = ${JSON.stringify(precacheAssets)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("restaurant-admin-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/admin.html", responseClone));
          }
          return response;
        })
        .catch(() => caches.match("/admin.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
  `.trim());
});

app.post("/api/admin/login", (req, res) => {
  console.log("[AUTH] Login request received.");
  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const rateLimitKey = getRateLimitKey(req, username);
  const rateLimitState = getRateLimitState(rateLimitKey);

  if (rateLimitState.lockedUntil && rateLimitState.lockedUntil > Date.now()) {
    const retryAfterSec = Math.max(1, Math.ceil((rateLimitState.lockedUntil - Date.now()) / 1000));
    res.status(429).json({ ok: false, error: "too_many_attempts", retryAfterSec });
    return;
  }

  currentCreds = getAdminCredentials();

  if (username !== currentCreds.user || !verifyPassword(password, currentCreds)) {
    const failedState = registerFailedLogin(rateLimitKey);
    console.warn(`[AUTH] Invalid credentials for: "${username}" password_length: ${password.length}`);

    if (failedState.lockedUntil && failedState.lockedUntil > Date.now()) {
      const retryAfterSec = Math.max(1, Math.ceil((failedState.lockedUntil - Date.now()) / 1000));
      res.status(429).json({ ok: false, error: "too_many_attempts", retryAfterSec });
      return;
    }

    res.status(401).json({ ok: false, error: "invalid_credentials" });
    return;
  }

  clearFailedLogins(rateLimitKey);
  migrateLegacyCredentialsIfNeeded(currentCreds, password);

  const token = sessions.create();
  setSessionCookie(res, token);
  res.json({ ok: true, user: currentCreds.user });
});

app.post("/api/admin/credentials", requireAuth, (req, res) => {
  currentCreds = getAdminCredentials();

  const newUsername = typeof req.body?.newUsername === "string" ? req.body.newUsername.trim() : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  const confirmPassword = typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "";

  if (!newUsername) {
    res.status(400).json({ ok: false, error: "Nom d'utilisateur requis." });
    return;
  }

  if (newUsername.length < 3) {
    res.status(400).json({ ok: false, error: "Le nom d'utilisateur doit contenir au moins 3 caractères." });
    return;
  }

  let passwordToSave = "";
  if (newPassword) {
    if (newPassword !== confirmPassword) {
      res.status(400).json({ ok: false, error: "Les mots de passe ne correspondent pas." });
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ ok: false, error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` });
      return;
    }

    passwordToSave = newPassword;
  } else if (currentCreds.isLegacyPlainText && typeof currentCreds.pass === "string") {
    passwordToSave = currentCreds.pass;
  } else {
    res.status(400).json({ ok: false, error: "Saisissez un nouveau mot de passe pour finaliser cette mise à jour." });
    return;
  }

  const saved = saveAdminCredentials(newUsername, passwordToSave);
  if (!saved) {
    res.status(500).json({ ok: false, error: "Erreur lors de la sauvegarde côté serveur." });
    return;
  }

  currentCreds = getAdminCredentials();
  sessions.clearAll();
  const token = sessions.create();
  setSessionCookie(res, token);
  res.json({
    ok: true,
    user: currentCreds.user,
    message: "Identifiants sauvegardés avec succès. Les anciennes sessions ont été fermées."
  });
});

app.get("/api/admin/session", (req, res) => {
  const token = getSessionToken(req);
  res.json({ ok: true, authenticated: sessions.isValid(token) });
});

app.get("/api/admin/security-status", requireAuth, (_req, res) => {
  currentCreds = getAdminCredentials();
  res.json({
    ok: true,
    user: currentCreds.user,
    usesDefaultCredentials: currentCreds.usesDefaultCredentials,
    isLegacyPlainText: currentCreds.isLegacyPlainText,
    credentialSource: currentCreds.source,
    minPasswordLength: MIN_PASSWORD_LENGTH
  });
});

app.get("/api/admin/capabilities", requireAuth, (_req, res) => {
  res.json({
    ok: true,
    sellerToolsEnabled: SELLER_TOOLS_ENABLED,
    aiMediaToolsEnabled: AI_MEDIA_TOOLS_ENABLED
  });
});

app.post("/api/admin/logout", (req, res) => {
  sessions.remove(getSessionToken(req));
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/data", requireAuth, (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json(readData());
});

app.post("/api/data", requireAuth, (req, res) => {
  const saved = writeData(req.body);
  res.json({ ok: true, data: saved });
});

app.get("/api/data/export", requireAuth, requireSellerTools, (_req, res) => {
  const data = readData();
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="restaurant-backup-${stamp}.json"`);
  res.send(JSON.stringify(data, null, 2));
});

app.post("/api/data/import", requireAuth, requireSellerTools, (req, res) => {
  try {
    const payload = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
    const saved = writeData(payload);
    res.json({ ok: true, data: saved });
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    res.status(400).json({ ok: false, error: "invalid_import_payload" });
  }
});

app.post("/api/importer/draft", requireAuth, requireSellerTools, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const result = await generateImporterDraft(payload);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error("IMPORTER DRAFT ERROR:", error);
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || "importer_draft_failed",
      jobId: error.jobId || "",
      stage: error.importerStage || ""
    });
  }
});

app.post("/api/media/generate-menu-item", requireAuth, requireAiMediaTools, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const result = await generateMenuItemMediaImage(payload);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error("MENU ITEM MEDIA GENERATION ERROR:", error);
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || "menu_item_media_generation_failed"
    });
  }
});

app.post("/api/media/generate-category-image", requireAuth, requireAiMediaTools, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const result = await generateCategoryMediaImage(payload);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error("CATEGORY MEDIA GENERATION ERROR:", error);
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || "category_media_generation_failed"
    });
  }
});

app.post("/api/media/library/approve", requireAuth, requireSellerTools, requireAiMediaTools, (req, res) => {
  const assetId = typeof req.body?.assetId === "string" ? req.body.assetId.trim() : "";
  if (!assetId) {
    res.status(400).json({ ok: false, error: "asset_id_required" });
    return;
  }

  try {
    const asset = approveLibraryAsset(assetId);
    if (!asset) {
      res.status(404).json({ ok: false, error: "asset_not_found" });
      return;
    }
    res.json({ ok: true, asset });
  } catch (error) {
    console.error("MEDIA LIBRARY APPROVAL ERROR:", error);
    res.status(500).json({ ok: false, error: "media_library_approval_failed" });
  }
});

app.post("/api/data/reset", requireAuth, requireSellerTools, (_req, res) => {
  const reset = resetToBundledData();
  res.json({ ok: true, data: reset });
});

app.post("/api/upload", requireAuth, (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      if (error.message === "unsupported_file_type") {
        res.status(400).json({ ok: false, error: "unsupported_file_type" });
        return;
      }

      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ ok: false, error: "file_too_large" });
        return;
      }

      next(error);
      return;
    }

    if (!req.file) {
      res.status(400).json({ ok: false, error: "no_file_uploaded" });
      return;
    }

    Promise.all([
      ensureThumbnailFile(req.file.filename, getThumbnailTargetFileName(req.file.filename, "default"), "default"),
      ensureThumbnailFile(req.file.filename, getThumbnailTargetFileName(req.file.filename, "menu"), "menu"),
      ensureThumbnailFile(req.file.filename, getThumbnailTargetFileName(req.file.filename, "list"), "list")
    ]).catch((thumbnailError) => {
      console.warn("Thumbnail generation failed:", thumbnailError);
    });

    res.json({ ok: true, url: `/uploads/${req.file.filename}` });
  });
});

app.get("/uploads/.thumbs/:file", createThumbnailRequestHandler());

app.get("/favicon.ico", (_req, res) => {
  res.sendFile(adminPwaIconFiles.icon64);
});

app.get("/apple-touch-icon.png", (_req, res) => {
  res.sendFile(adminPwaIconFiles.icon180);
});

app.use("/uploads", express.static(uploadsDir, {
  immutable: true,
  maxAge: "30d"
}));

app.get(["/", "/admin", "/admin.html"], (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin.js", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(__dirname, "admin.js"));
});

app.get("/shared.js", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(__dirname, "shared.js"));
});

app.use("/images", express.static(path.join(__dirname, "images"), {
  setHeaders: setStaticAssetHeaders
}));

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not Found");
});

app.use((error, _req, res, _next) => {
  console.error("ADMIN SERVER ERROR:", error);
  res.status(500).json({ ok: false, error: "internal_server_error" });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Restaurant admin server running on 0.0.0.0:${port}`);
});

module.exports = { app, server };
