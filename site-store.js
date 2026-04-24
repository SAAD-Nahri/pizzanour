const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const bundledDataFile = path.join(__dirname, "data.json");
const bundledUploadsDir = path.join(__dirname, "uploads");
const dataFile = process.env.DATA_FILE || bundledDataFile;
const uploadsDir = process.env.UPLOADS_DIR || bundledUploadsDir;

const FALLBACK_DATA = {
  menu: [],
  catEmojis: {},
  categoryImages: {},
  categoryTranslations: {},
  wifi: {
    ssid: "",
    pass: ""
  },
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    tripadvisor: "",
    whatsapp: ""
  },
  guestExperience: {
    paymentMethods: ["cash", "tpe"],
    facilities: ["wifi"]
  },
  sectionVisibility: {
    about: true,
    payments: true,
    events: true,
    gallery: true,
    hours: true,
    contact: true
  },
  sectionOrder: ["about", "payments", "events", "gallery", "hours", "contact"],
  branding: {
    presetId: "core",
    restaurantName: "Restaurant",
    shortName: "Restaurant",
    tagline: "Local cuisine, warm service, and a polished online presence.",
    logoMark: "🍽️",
    primaryColor: "#E21B1B",
    secondaryColor: "#FF8D08",
    accentColor: "#FFD700",
    surfaceColor: "#FFF8F0",
    surfaceMuted: "#F4EBDD",
    textColor: "#261A16",
    textMuted: "#75655C",
    menuBackground: "#111318",
    menuSurface: "#1B1F26",
    heroImage: "images/hero-default.svg",
    heroSlides: ["images/hero-default.svg", "images/hero-cafe.svg", "images/hero-traditional.svg"],
    logoImage: ""
  },
  contentTranslations: {
    fr: {},
    en: {},
    ar: {}
  },
  promoId: null
};

function readBundledSeed() {
  try {
    const raw = fs.readFileSync(bundledDataFile, "utf8");
    return JSON.parse(raw);
  } catch (_error) {
    return FALLBACK_DATA;
  }
}

function asString(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength);
}

function sanitizeId(value, fallback) {
  if (Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 128);
  return fallback;
}

function sanitizeImages(images, fallbackImage) {
  const values = Array.isArray(images) ? images : [];
  const out = values
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim().slice(0, 8192))
    .slice(0, 12);

  if (!out.length && typeof fallbackImage === "string" && fallbackImage.trim()) {
    out.push(fallbackImage.trim().slice(0, 8192));
  }

  return out;
}

function sanitizeMenuTranslationBucket(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    name: asString(source.name, 160).trim(),
    desc: asString(source.desc, 2000).trim()
  };
}

function sanitizeMenuTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    fr: sanitizeMenuTranslationBucket(source.fr),
    en: sanitizeMenuTranslationBucket(source.en),
    ar: sanitizeMenuTranslationBucket(source.ar)
  };
}

function sanitizeMenuItemExtra(input, index = 0) {
  const source = input && typeof input === "object" ? input : {};
  const name = asString(source.name, 120).trim();
  const price = Number.parseFloat(source.price);
  if (!name) return null;

  return {
    id: asString(source.id, 120).trim() || `extra-${index + 1}`,
    name,
    price: Number.isFinite(price) ? price : 0
  };
}

function sanitizeMenuItemExtras(input) {
  const source = Array.isArray(input) ? input : [];
  return source
    .map((entry, index) => sanitizeMenuItemExtra(entry, index))
    .filter(Boolean)
    .slice(0, 12);
}

function sanitizeEntityTranslationBucket(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    name: asString(source.name, 160).trim(),
    desc: asString(source.desc, 2000).trim()
  };
}

function sanitizeEntityTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    fr: sanitizeEntityTranslationBucket(source.fr),
    en: sanitizeEntityTranslationBucket(source.en),
    ar: sanitizeEntityTranslationBucket(source.ar)
  };
}

function sanitizeMenuItem(item, index) {
  const source = item && typeof item === "object" ? item : {};
  const images = sanitizeImages(source.images, source.img);
  const price = Number.parseFloat(source.price);

  // Start with all source properties to preserve extended fields
  // (hasSizes, sizes, featured, likes, discount, superCategory, etc.)
  const result = { ...source };

  // Sanitize known core fields
  result.id = sanitizeId(source.id, Date.now() + index);
  result.cat = asString(source.cat, 120);
  result.name = asString(source.name, 160);
  result.desc = asString(source.desc, 2000);
  result.ingredients = Array.isArray(source.ingredients)
    ? source.ingredients
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim().slice(0, 160))
      .slice(0, 24)
    : [];
  result.price = Number.isFinite(price) ? price : 0;
  result.badge = asString(source.badge, 64);
  result.images = images;
  result.img = images[0] || "";
  result.translations = sanitizeMenuTranslations(source.translations);
  result.extras = sanitizeMenuItemExtras(source.extras);

  return result;
}

function sanitizeCatEmojis(input) {
  const source = input && typeof input === "object" ? input : {};
  const out = {};
  for (const [key, value] of Object.entries(source)) {
    const safeKey = asString(key, 120);
    if (!safeKey) continue;
    out[safeKey] = asString(value, 16) || "🍴";
  }
  return out;
}

function sanitizeWifi(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    ssid: asString(source.ssid, 120) || "Restaurant WiFi",
    pass: asString(source.pass, 120) || "Ask the team"
  };
}

function sanitizeCategoryImages(input) {
  const source = input && typeof input === "object" ? input : {};
  const out = {};
  for (const [key, value] of Object.entries(source)) {
    const safeKey = asString(key, 120).trim();
    const safeValue = asString(value, 8192).trim();
    if (!safeKey || !safeValue) continue;
    out[safeKey] = safeValue;
  }
  return out;
}

function sanitizeCategoryTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  const out = {};

  for (const [key, value] of Object.entries(source)) {
    const safeKey = asString(key, 120).trim();
    if (!safeKey) continue;
    out[safeKey] = sanitizeEntityTranslations(value);
  }

  return out;
}

function sanitizeSuperCategories(input) {
  const source = Array.isArray(input) ? input : [];
  return source
    .map((entry, index) => {
      const item = entry && typeof entry === "object" ? entry : {};
      const translations = sanitizeEntityTranslations(item.translations);
      const name = asString(item.name, 160).trim()
        || translations.fr.name
        || translations.en.name
        || translations.ar.name;
      const id = asString(item.id, 120).trim() || `super-category-${index + 1}`;

      return {
        id,
        name,
        desc: asString(item.desc, 240).trim(),
        emoji: asString(item.emoji, 16).trim() || "🍽️",
        time: asString(item.time, 64).trim(),
        cats: Array.isArray(item.cats)
          ? item.cats
            .filter((value) => typeof value === "string" && value.trim())
            .map((value) => value.trim().slice(0, 120))
          : [],
        translations
      };
    })
    .filter((entry) => entry.name);
}

function sanitizeSocial(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    instagram: asString(source.instagram, 2048),
    facebook: asString(source.facebook, 2048),
    tiktok: asString(source.tiktok, 2048),
    tripadvisor: asString(source.tripadvisor, 2048),
    whatsapp: asString(source.whatsapp, 64)
  };
}

const PAYMENT_METHOD_IDS = ["cash", "tpe"];
const FACILITY_IDS = ["wifi", "accessible", "parking", "terrace", "family"];
const SECTION_VISIBILITY_KEYS = ["about", "payments", "events", "gallery", "hours", "contact"];
const SECTION_ORDER_KEYS = ["about", "payments", "events", "gallery", "hours", "contact"];

function sanitizeGuestExperience(input) {
  const source = input && typeof input === "object" ? input : {};
  const paymentMethods = Array.isArray(source.paymentMethods) ? source.paymentMethods : [];
  const facilities = Array.isArray(source.facilities) ? source.facilities : [];

  return {
    paymentMethods: PAYMENT_METHOD_IDS.filter((id) => paymentMethods.includes(id)),
    facilities: FACILITY_IDS.filter((id) => facilities.includes(id))
  };
}

function sanitizeSectionVisibility(input) {
  const source = input && typeof input === "object" ? input : {};
  const out = { ...FALLBACK_DATA.sectionVisibility };

  SECTION_VISIBILITY_KEYS.forEach((key) => {
    if (typeof source[key] === "boolean") {
      out[key] = source[key];
    }
  });

  return out;
}

function sanitizeSectionOrder(input) {
  const source = Array.isArray(input) ? input : [];
  const out = [];

  source.forEach((value) => {
    if (typeof value !== "string") return;
    const safeValue = value.trim();
    if (!SECTION_ORDER_KEYS.includes(safeValue)) return;
    if (out.includes(safeValue)) return;
    out.push(safeValue);
  });

  SECTION_ORDER_KEYS.forEach((key) => {
    if (!out.includes(key)) {
      out.push(key);
    }
  });

  return out;
}

function sanitizeColor(value, fallback) {
  const raw = asString(value, 16).trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw) ? raw : fallback;
}

function sanitizeBranding(input) {
  const source = input && typeof input === "object" ? input : {};
  const heroImage = asString(source.heroImage, 8192) || FALLBACK_DATA.branding.heroImage;
  const heroSlides = Array.isArray(source.heroSlides)
    ? source.heroSlides
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim().slice(0, 8192))
      .slice(0, 3)
    : [];
  return {
    presetId: asString(source.presetId, 40).trim() || FALLBACK_DATA.branding.presetId,
    restaurantName: asString(source.restaurantName, 160) || FALLBACK_DATA.branding.restaurantName,
    shortName: asString(source.shortName, 80) || FALLBACK_DATA.branding.shortName,
    tagline: asString(source.tagline, 160) || FALLBACK_DATA.branding.tagline,
    logoMark: asString(source.logoMark, 12) || FALLBACK_DATA.branding.logoMark,
    primaryColor: sanitizeColor(source.primaryColor, FALLBACK_DATA.branding.primaryColor),
    secondaryColor: sanitizeColor(source.secondaryColor, FALLBACK_DATA.branding.secondaryColor),
    accentColor: sanitizeColor(source.accentColor, FALLBACK_DATA.branding.accentColor),
    surfaceColor: sanitizeColor(source.surfaceColor, FALLBACK_DATA.branding.surfaceColor),
    surfaceMuted: sanitizeColor(source.surfaceMuted, FALLBACK_DATA.branding.surfaceMuted),
    textColor: sanitizeColor(source.textColor, FALLBACK_DATA.branding.textColor),
    textMuted: sanitizeColor(source.textMuted, FALLBACK_DATA.branding.textMuted),
    menuBackground: sanitizeColor(source.menuBackground, FALLBACK_DATA.branding.menuBackground),
    menuSurface: sanitizeColor(source.menuSurface, FALLBACK_DATA.branding.menuSurface),
    heroImage,
    heroSlides: [
      heroImage,
      heroSlides[1] || FALLBACK_DATA.branding.heroSlides[1] || heroImage,
      heroSlides[2] || FALLBACK_DATA.branding.heroSlides[2] || heroSlides[1] || FALLBACK_DATA.branding.heroSlides[1] || heroImage
    ],
    logoImage: asString(source.logoImage, 8192) || FALLBACK_DATA.branding.logoImage
  };
}

function sanitizeTranslationBucket(input) {
  const source = input && typeof input === "object" ? input : {};
  const out = {};

  Object.entries(source).forEach(([key, value]) => {
    const safeKey = asString(key, 120).trim();
    const safeValue = asString(value, 4000).trim();
    if (!safeKey || !safeValue) return;
    out[safeKey] = safeValue;
  });

  return out;
}

function sanitizeContentTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    fr: sanitizeTranslationBucket(source.fr),
    en: sanitizeTranslationBucket(source.en),
    ar: sanitizeTranslationBucket(source.ar)
  };
}

function sanitizePromoId(input, menu) {
  if (input === null || typeof input === "undefined" || input === "") {
    return null;
  }
  const match = menu.find((item) => String(item.id) === String(input));
  return match ? match.id : null;
}

function sanitizeHoursNote(input) {
  return asString(input, 240);
}

function normalizeData(input) {
  const source = input && typeof input === "object" ? input : {};
  const menu = Array.isArray(source.menu) ? source.menu.map(sanitizeMenuItem) : [];

  // Start with all source properties to preserve extended top-level fields
  // (superCategories, hours, gallery, landing, paymentMethods, etc.)
  const result = { ...source };

  // Sanitize known core fields
  result.menu = menu;
  result.catEmojis = sanitizeCatEmojis(source.catEmojis);
  result.categoryImages = sanitizeCategoryImages(source.categoryImages);
  result.categoryTranslations = sanitizeCategoryTranslations(source.categoryTranslations);
  result.wifi = sanitizeWifi(source.wifi);
  result.social = sanitizeSocial(source.social);
  result.guestExperience = sanitizeGuestExperience(source.guestExperience);
  result.sectionVisibility = sanitizeSectionVisibility(source.sectionVisibility);
  result.sectionOrder = sanitizeSectionOrder(source.sectionOrder);
  result.branding = sanitizeBranding(source.branding);
  result.contentTranslations = sanitizeContentTranslations(source.contentTranslations);
  result.hoursNote = sanitizeHoursNote(source.hoursNote);
  result.promoId = sanitizePromoId(source.promoId, menu);
  result.superCategories = sanitizeSuperCategories(source.superCategories);

  // Sanitize promoIds array
  if (Array.isArray(source.promoIds)) {
    result.promoIds = source.promoIds
      .map((id) => {
        const match = menu.find((item) => String(item.id) === String(id));
        return match ? match.id : null;
      })
      .filter((id) => id !== null);
  } else {
    result.promoIds = result.promoId !== null ? [result.promoId] : [];
  }

  return result;
}


const INITIAL_DATA = normalizeData(readBundledSeed());

function ensureParentDirectory(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDirectoryContents(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) return;
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name === ".gitkeep") {
      continue;
    }
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (sourcePath === targetPath) {
      continue;
    }
    if (entry.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyDirectoryContents(sourcePath, targetPath);
      continue;
    }
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function seedDataFile() {
  if (fs.existsSync(dataFile)) return;
  if (dataFile !== bundledDataFile && fs.existsSync(bundledDataFile)) {
    fs.copyFileSync(bundledDataFile, dataFile);
    return;
  }
  fs.writeFileSync(dataFile, JSON.stringify(INITIAL_DATA, null, 2), "utf8");
}

function seedUploadsDirectory() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (uploadsDir !== bundledUploadsDir && fs.existsSync(bundledUploadsDir)) {
    copyDirectoryContents(bundledUploadsDir, uploadsDir);
  }
}

function ensureStorage() {
  ensureParentDirectory(dataFile);
  seedUploadsDirectory();
  seedDataFile();
}

function readData() {
  ensureStorage();

  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    return normalizeData(JSON.parse(raw));
  } catch (_error) {
    return normalizeData(INITIAL_DATA);
  }
}

function getDataVersion() {
  ensureStorage();

  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    return crypto.createHash("sha1").update(raw).digest("hex");
  } catch (_error) {
    return "0-0";
  }
}

function writeData(data) {
  ensureStorage();
  const normalized = normalizeData(data);
  fs.writeFileSync(dataFile, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

function resetToBundledData() {
  ensureStorage();
  const defaults = normalizeData(readBundledSeed());
  fs.writeFileSync(dataFile, JSON.stringify(defaults, null, 2), "utf8");
  return defaults;
}

module.exports = {
  dataFile,
  uploadsDir,
  ensureStorage,
  getDataVersion,
  readData,
  writeData,
  normalizeData,
  resetToBundledData
};
