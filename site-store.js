const fs = require("fs");
const path = require("path");

const bundledDataFile = path.join(__dirname, "data.json");
const bundledUploadsDir = path.join(__dirname, "uploads");
const dataFile = process.env.DATA_FILE || bundledDataFile;
const uploadsDir = process.env.UPLOADS_DIR || bundledUploadsDir;

const FALLBACK_DATA = {
  menu: [],
  catEmojis: {},
  wifi: {
    ssid: "Foody_Guest",
    pass: "foody2026"
  },
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "212626081745"
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
    ssid: asString(source.ssid, 120) || "Foody_Guest",
    pass: asString(source.pass, 120) || "foody2026"
  };
}

function sanitizeSocial(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    instagram: asString(source.instagram, 2048),
    facebook: asString(source.facebook, 2048),
    tiktok: asString(source.tiktok, 2048),
    whatsapp: asString(source.whatsapp, 64) || "212626081745"
  };
}

function sanitizePromoId(input, menu) {
  if (input === null || typeof input === "undefined" || input === "") {
    return null;
  }
  const match = menu.find((item) => String(item.id) === String(input));
  return match ? match.id : null;
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
  result.wifi = sanitizeWifi(source.wifi);
  result.social = sanitizeSocial(source.social);
  result.promoId = sanitizePromoId(source.promoId, menu);

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
  readData,
  writeData,
  normalizeData,
  resetToBundledData
};
