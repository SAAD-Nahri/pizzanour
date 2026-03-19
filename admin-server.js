const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const path = require("path");

const {
  MAX_JSON_BYTES,
  clearSessionCookie,
  createSessionManager,
  createUploadMiddleware,
  getSessionToken,
  parsePort,
  setSessionCookie
} = require("./server-common");
const { ensureStorage, readData, resetToBundledData, uploadsDir, writeData } = require("./site-store");

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
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const IMPORTER_MAX_MENU_IMAGES = 8;
const IMPORTER_MAX_VENUE_IMAGES = 6;

const app = express();
const port = parsePort(process.env.PORT, 3102);
const upload = createUploadMiddleware();
const sessions = createSessionManager(path.join(__dirname, "sessions.json"));
const dataRoot = process.env.DATA_FILE
  ? path.dirname(process.env.DATA_FILE)
  : __dirname;
const authFile = process.env.AUTH_FILE || path.join(dataRoot, "auth.json");
const loginAttempts = new Map();

const IMPORTER_SYSTEM_PROMPT = [
  "You generate seller-side draft JSON for a white-label restaurant website.",
  "Use the uploaded menu images as the source of truth for menu items, prices, categories, and descriptions.",
  "Infer FR, EN, and AR names and descriptions for menu items, categories, and super-categories when confidence is reasonable.",
  "Do not invent contact details, maps, hours, WiFi, or social links.",
  "If information is missing, leave the field empty and record a warning.",
  "Prefer clean restaurant website categories and group them into super-categories only when the grouping is clear.",
  "Flag uncertainty in review.warnings or review.blockers instead of pretending confidence.",
  "Use category keys consistently: restaurantData.categories[].key must match menu[].cat and superCategories[].cats[].",
  "Follow the JSON schema exactly."
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
          "superCategories",
          "wifi",
          "social",
          "branding",
          "landing",
          "contentTranslations",
          "promoIds",
          "gallery",
          "hours",
          "hoursNote"
        ],
        properties: {
          menu: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "cat", "name", "desc", "price", "ingredients", "badge", "featured", "img", "images", "translations"],
              properties: {
                id: { type: ["string", "number", "null"] },
                cat: { type: "string" },
                name: { type: "string" },
                desc: { type: "string" },
                price: { type: ["number", "null"] },
                ingredients: {
                  type: "array",
                  items: { type: "string" }
                },
                badge: { type: "string" },
                featured: { type: "boolean" },
                img: { type: "string" },
                images: {
                  type: "array",
                  items: { type: "string" }
                },
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
              required: ["id", "name", "desc", "emoji", "time", "cats", "translations"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                desc: { type: "string" },
                emoji: { type: "string" },
                time: { type: "string" },
                cats: {
                  type: "array",
                  items: { type: "string" }
                },
                translations: IMPORTER_TRANSLATIONS_SCHEMA
              }
            }
          },
          wifi: {
            type: "object",
            additionalProperties: false,
            required: ["ssid", "pass"],
            properties: {
              ssid: { type: "string" },
              pass: { type: "string" }
            }
          },
          social: {
            type: "object",
            additionalProperties: false,
            required: ["instagram", "facebook", "tiktok", "tripadvisor", "whatsapp"],
            properties: {
              instagram: { type: "string" },
              facebook: { type: "string" },
              tiktok: { type: "string" },
              tripadvisor: { type: "string" },
              whatsapp: { type: "string" }
            }
          },
          branding: {
            type: "object",
            additionalProperties: false,
            required: ["presetId", "restaurantName", "shortName", "tagline", "primaryColor", "secondaryColor", "accentColor", "heroImage", "heroSlides", "logoImage"],
            properties: {
              presetId: { type: "string" },
              restaurantName: { type: "string" },
              shortName: { type: "string" },
              tagline: { type: "string" },
              primaryColor: { type: "string" },
              secondaryColor: { type: "string" },
              accentColor: { type: "string" },
              heroImage: { type: "string" },
              heroSlides: {
                type: "array",
                items: { type: "string" }
              },
              logoImage: { type: "string" }
            }
          },
          landing: {
            type: "object",
            additionalProperties: false,
            required: ["phone", "location"],
            properties: {
              phone: { type: "string" },
              location: {
                type: "object",
                additionalProperties: false,
                required: ["title", "address", "url"],
                properties: {
                  title: { type: "string" },
                  address: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          },
          contentTranslations: {
            type: "object",
            additionalProperties: false,
            required: ["fr", "en", "ar"],
            properties: {
              fr: {
                type: "object",
                additionalProperties: false,
                required: ["homeTitle", "homeSubtitle", "aboutTitle", "aboutText", "footerNote", "footerRights"],
                properties: {
                  homeTitle: { type: "string" },
                  homeSubtitle: { type: "string" },
                  aboutTitle: { type: "string" },
                  aboutText: { type: "string" },
                  footerNote: { type: "string" },
                  footerRights: { type: "string" }
                }
              },
              en: {
                type: "object",
                additionalProperties: false,
                required: ["homeTitle", "homeSubtitle", "aboutTitle", "aboutText", "footerNote", "footerRights"],
                properties: {
                  homeTitle: { type: "string" },
                  homeSubtitle: { type: "string" },
                  aboutTitle: { type: "string" },
                  aboutText: { type: "string" },
                  footerNote: { type: "string" },
                  footerRights: { type: "string" }
                }
              },
              ar: {
                type: "object",
                additionalProperties: false,
                required: ["homeTitle", "homeSubtitle", "aboutTitle", "aboutText", "footerNote", "footerRights"],
                properties: {
                  homeTitle: { type: "string" },
                  homeSubtitle: { type: "string" },
                  aboutTitle: { type: "string" },
                  aboutText: { type: "string" },
                  footerNote: { type: "string" },
                  footerRights: { type: "string" }
                }
              }
            }
          },
          promoIds: {
            type: "array",
            items: { type: ["string", "number"] }
          },
          gallery: {
            type: "array",
            items: { type: "string" }
          },
          hours: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["day", "open", "close", "highlight"],
              properties: {
                day: { type: "string" },
                open: { type: "string" },
                close: { type: "string" },
                highlight: { type: "boolean" }
              }
            }
          },
          hoursNote: { type: "string" }
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

function guessMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
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
  if (!mimeType) return null;
  const base64 = fs.readFileSync(filePath).toString("base64");
  return {
    type: "input_image",
    image_url: `data:${mimeType};base64,${base64}`
  };
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

function buildImporterDraftSkeleton(input) {
  const menuImageUrls = Array.isArray(input.menuImageUrls) ? input.menuImageUrls : [];
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
      sourceFiles: [...menuImageUrls, ...restaurantPhotoUrls, ...(logoImageUrl ? [logoImageUrl] : [])],
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
  const menu = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
  const categories = Array.isArray(restaurantData.categories) ? restaurantData.categories : [];
  const aliasMap = new Map();
  const catEmojis = {};
  const categoryTranslations = {};

  const derivedCategories = categories.length
    ? categories
    : [...new Set(menu.map((item) => asImporterString(item?.cat)).filter(Boolean))].map((key) => ({
      key,
      name: key,
      emoji: "🍴",
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
    const key = asImporterString(category?.key)
      || asImporterString(translations?.fr?.name)
      || asImporterString(category?.name)
      || `category-${index + 1}`;
    const frName = asImporterString(translations?.fr?.name) || asImporterString(category?.name) || key;
    const enName = asImporterString(translations?.en?.name);
    const arName = asImporterString(translations?.ar?.name);
    const frDesc = asImporterString(translations?.fr?.desc);
    const enDesc = asImporterString(translations?.en?.desc);
    const arDesc = asImporterString(translations?.ar?.desc);

    catEmojis[key] = asImporterString(category?.emoji) || "🍴";
    categoryTranslations[key] = {
      fr: { name: frName, desc: frDesc },
      en: { name: enName, desc: enDesc },
      ar: { name: arName, desc: arDesc }
    };

    [
      key,
      category?.name,
      translations?.fr?.name,
      translations?.en?.name,
      translations?.ar?.name
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
    const catValue = asImporterString(item?.cat);
    const normalizedCat = aliasMap.get(canonicalImporterLookup(catValue)) || catValue || `category-${index + 1}`;

    return {
      ...item,
      cat: normalizedCat,
      img,
      images: img && !images.length ? [img] : images
    };
  });

  restaurantData.superCategories = (Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : []).map((entry, index) => ({
    ...entry,
    id: asImporterString(entry?.id) || `super-category-${index + 1}`,
    cats: Array.isArray(entry?.cats)
      ? entry.cats
        .map((value) => aliasMap.get(canonicalImporterLookup(value)) || asImporterString(value))
        .filter(Boolean)
      : []
  }));

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

  return draft;
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

async function generateImporterDraft(input) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("openai_not_configured");
    error.statusCode = 400;
    throw error;
  }

  const menuImageUrls = Array.isArray(input.menuImageUrls) ? input.menuImageUrls.slice(0, IMPORTER_MAX_MENU_IMAGES) : [];
  const restaurantPhotoUrls = Array.isArray(input.restaurantPhotoUrls) ? input.restaurantPhotoUrls.slice(0, IMPORTER_MAX_VENUE_IMAGES) : [];
  const logoImageUrl = typeof input.logoImageUrl === "string" ? input.logoImageUrl.trim() : "";
  const restaurantName = typeof input.restaurantName === "string" ? input.restaurantName.trim() : "";
  const shortName = typeof input.shortName === "string" ? input.shortName.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";

  const imageInputs = [
    ...menuImageUrls.map(buildInputImageFromUploadUrl).filter(Boolean),
    ...(logoImageUrl ? [buildInputImageFromUploadUrl(logoImageUrl)].filter(Boolean) : []),
    ...restaurantPhotoUrls.map(buildInputImageFromUploadUrl).filter(Boolean)
  ];

  if (!imageInputs.length) {
    const error = new Error("no_import_images");
    error.statusCode = 400;
    throw error;
  }

  const userContext = [
    `Restaurant name: ${restaurantName || "(not provided)"}`,
    `Short brand name: ${shortName || "(not provided)"}`,
    `Menu image count: ${menuImageUrls.length}`,
    `Logo provided: ${logoImageUrl ? "yes" : "no"}`,
    `Restaurant photo count: ${restaurantPhotoUrls.length}`,
    `Seller notes: ${notes || "(none)"}`
  ].join("\n");

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_IMPORT_MODEL,
      instructions: IMPORTER_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: userContext },
            ...imageInputs
          ]
        }
      ],
      text: {
        format: IMPORTER_TEXT_FORMAT
      },
      store: false,
      temperature: 0.2,
      max_output_tokens: 6000
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "openai_request_failed";
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }

  const rawText = extractResponseText(payload);
  if (!rawText) {
    const error = new Error(payload?.status === "incomplete" ? "incomplete_openai_response" : "empty_openai_response");
    error.statusCode = 502;
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (_error) {
    console.error("IMPORTER RAW OPENAI TEXT:", rawText.slice(0, 1200));
    const error = new Error("invalid_json_from_openai");
    error.statusCode = 502;
    throw error;
  }

  const skeleton = buildImporterDraftSkeleton({
    restaurantName,
    shortName,
    menuImageUrls,
    logoImageUrl,
    restaurantPhotoUrls
  });

  return deepMerge(skeleton, normalizeStructuredImporterDraft(parsed));
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

app.use(express.json({ limit: MAX_JSON_BYTES }));

function requireAuth(req, res, next) {
  const token = getSessionToken(req);
  if (!sessions.isValid(token)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "admin" });
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

app.post("/api/admin/logout", (req, res) => {
  sessions.remove(getSessionToken(req));
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/data", requireAuth, (_req, res) => {
  res.json(readData());
});

app.post("/api/data", requireAuth, (req, res) => {
  const saved = writeData(req.body);
  res.json({ ok: true, data: saved });
});

app.get("/api/data/export", requireAuth, (_req, res) => {
  const data = readData();
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="restaurant-backup-${stamp}.json"`);
  res.send(JSON.stringify(data, null, 2));
});

app.post("/api/data/import", requireAuth, (req, res) => {
  try {
    const payload = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
    const saved = writeData(payload);
    res.json({ ok: true, data: saved });
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    res.status(400).json({ ok: false, error: "invalid_import_payload" });
  }
});

app.post("/api/importer/draft", requireAuth, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const draft = await generateImporterDraft(payload);
    res.json({ ok: true, draft });
  } catch (error) {
    console.error("IMPORTER DRAFT ERROR:", error);
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || "importer_draft_failed"
    });
  }
});

app.post("/api/data/reset", requireAuth, (_req, res) => {
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

    res.json({ ok: true, url: `/uploads/${req.file.filename}` });
  });
});

app.use("/uploads", express.static(uploadsDir));

app.get(["/", "/admin", "/admin.html"], (_req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin.js", (_req, res) => {
  res.sendFile(path.join(__dirname, "admin.js"));
});

app.get("/shared.js", (_req, res) => {
  res.sendFile(path.join(__dirname, "shared.js"));
});

app.use("/images", express.static(path.join(__dirname, "images")));

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
