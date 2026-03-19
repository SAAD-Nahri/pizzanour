const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const MEDIA_LIBRARY_ROOT = __dirname;
const MEDIA_LIBRARY_CATALOG_DIR = path.join(MEDIA_LIBRARY_ROOT, "catalog");
const MEDIA_LIBRARY_ASSETS_DIR = path.join(MEDIA_LIBRARY_ROOT, "assets");
const MEDIA_LIBRARY_PROMPTS_DIR = path.join(MEDIA_LIBRARY_ROOT, "prompts");
const MEDIA_LIBRARY_REVIEWS_DIR = path.join(MEDIA_LIBRARY_ROOT, "reviews");
const MEDIA_LIBRARY_CATALOG_FILE = path.join(MEDIA_LIBRARY_CATALOG_DIR, "catalog.json");

const SLOT_TYPES = ["hero", "gallery", "product"];
const SOURCE_TYPES = ["client", "curated", "generated", "placeholder"];
const STOPWORDS = new Set([
  "and",
  "avec",
  "the",
  "for",
  "des",
  "les",
  "aux",
  "sans",
  "menu",
  "plat",
  "plats",
  "dish",
  "item",
  "food",
  "drink",
  "boisson",
  "recipe",
  "maison",
  "signature"
]);

function createEmptyCatalog() {
  const now = new Date().toISOString();
  return {
    version: 1,
    updatedAt: now,
    assets: [],
    recipes: [],
    matches: []
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureMediaLibraryStructure() {
  ensureDir(MEDIA_LIBRARY_CATALOG_DIR);
  ensureDir(MEDIA_LIBRARY_PROMPTS_DIR);
  ensureDir(MEDIA_LIBRARY_REVIEWS_DIR);

  SLOT_TYPES.forEach((slotType) => {
    SOURCE_TYPES.forEach((sourceType) => {
      ensureDir(path.join(MEDIA_LIBRARY_ASSETS_DIR, slotType, sourceType));
    });
  });

  if (!fs.existsSync(MEDIA_LIBRARY_CATALOG_FILE)) {
    fs.writeFileSync(MEDIA_LIBRARY_CATALOG_FILE, `${JSON.stringify(createEmptyCatalog(), null, 2)}\n`);
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugifyText(value) {
  return normalizeText(value)
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeList(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value || "").trim())
    .filter(Boolean))];
}

function normalizeSlotType(slotType) {
  return SLOT_TYPES.includes(slotType) ? slotType : "product";
}

function normalizeSourceType(sourceType) {
  return SOURCE_TYPES.includes(sourceType) ? sourceType : "generated";
}

function guessMimeType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function toRepoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
}

function loadMediaLibraryCatalog() {
  ensureMediaLibraryStructure();

  try {
    const parsed = JSON.parse(fs.readFileSync(MEDIA_LIBRARY_CATALOG_FILE, "utf8"));
    return {
      version: Number(parsed?.version) || 1,
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      assets: Array.isArray(parsed?.assets) ? parsed.assets : [],
      recipes: Array.isArray(parsed?.recipes) ? parsed.recipes : [],
      matches: Array.isArray(parsed?.matches) ? parsed.matches : []
    };
  } catch (_error) {
    const fallback = createEmptyCatalog();
    fs.writeFileSync(MEDIA_LIBRARY_CATALOG_FILE, `${JSON.stringify(fallback, null, 2)}\n`);
    return fallback;
  }
}

function saveMediaLibraryCatalog(catalog) {
  const nextCatalog = {
    version: Number(catalog?.version) || 1,
    updatedAt: new Date().toISOString(),
    assets: Array.isArray(catalog?.assets) ? catalog.assets : [],
    recipes: Array.isArray(catalog?.recipes) ? catalog.recipes : [],
    matches: Array.isArray(catalog?.matches) ? catalog.matches : []
  };
  fs.writeFileSync(MEDIA_LIBRARY_CATALOG_FILE, `${JSON.stringify(nextCatalog, null, 2)}\n`);
  return nextCatalog;
}

function computeSha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function collectItemNameVariants(item) {
  const source = item && typeof item === "object" ? item : {};
  const translations = source.translations && typeof source.translations === "object" ? source.translations : {};
  return normalizeList([
    source.name,
    translations.fr?.name,
    translations.en?.name,
    translations.ar?.name
  ]);
}

function buildProductRecipeCandidateKeys(item) {
  const source = item && typeof item === "object" ? item : {};
  const categoryKey = slugifyText(source.cat || "") || "uncategorized";
  const names = collectItemNameVariants(source)
    .map((value) => slugifyText(value))
    .filter(Boolean);

  if (names.length) {
    return [...new Set(names.map((name) => `product:${categoryKey}:${name}`))];
  }

  const fallbackTokens = normalizeText([
    source.desc || "",
    ...(Array.isArray(source.ingredients) ? source.ingredients : [])
  ].join(" "))
    .split(" ")
    .filter((token) => token && !STOPWORDS.has(token))
    .slice(0, 6);

  return [`product:${categoryKey}:${fallbackTokens.join("-") || "item"}`];
}

function buildProductRecipeKeyFromMenuItem(item) {
  return buildProductRecipeCandidateKeys(item)[0] || "product:uncategorized:item";
}

function upsertRecipeRecord(catalog, input) {
  const recipeKey = String(input?.recipeKey || "").trim();
  if (!recipeKey) return null;

  const existingIndex = catalog.recipes.findIndex((entry) => entry.recipeKey === recipeKey);
  const nextRecord = {
    recipeKey,
    slotType: input.slotType || "product",
    displayName: String(input.displayName || "").trim(),
    description: String(input.description || "").trim(),
    categoryKey: String(input.categoryKey || "").trim(),
    languageVariants: input.languageVariants && typeof input.languageVariants === "object"
      ? input.languageVariants
      : {},
    tags: normalizeList(input.tags),
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    catalog.recipes[existingIndex] = {
      ...catalog.recipes[existingIndex],
      ...nextRecord,
      tags: normalizeList([...(catalog.recipes[existingIndex].tags || []), ...nextRecord.tags])
    };
    return catalog.recipes[existingIndex];
  }

  catalog.recipes.push(nextRecord);
  return nextRecord;
}

function copyFileIntoLibrary(input) {
  const sourceFilePath = path.resolve(String(input?.sourceFilePath || ""));
  const slotType = normalizeSlotType(input?.slotType);
  const sourceType = normalizeSourceType(input?.sourceType);
  const extension = path.extname(sourceFilePath).toLowerCase() || ".png";
  const filenameStem = slugifyText(
    input?.filenameHint
      || input?.displayName
      || input?.recipeKey
      || `${slotType}-${sourceType}`
  ) || `${slotType}-${sourceType}`;
  const filename = `${filenameStem}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${extension}`;
  const destinationDir = path.join(MEDIA_LIBRARY_ASSETS_DIR, slotType, sourceType);
  const destinationPath = path.join(destinationDir, filename);

  ensureDir(destinationDir);
  fs.copyFileSync(sourceFilePath, destinationPath);
  return destinationPath;
}

function registerLibraryAsset(input) {
  const sourceFilePath = path.resolve(String(input?.sourceFilePath || ""));
  if (!sourceFilePath || !fs.existsSync(sourceFilePath)) {
    throw new Error("media_library_source_missing");
  }

  const catalog = loadMediaLibraryCatalog();
  const slotType = normalizeSlotType(input?.slotType);
  const sourceType = normalizeSourceType(input?.sourceType);
  const sha256 = computeSha256(sourceFilePath);
  const existingAsset = catalog.assets.find((asset) => asset.sha256 === sha256 && asset.slotType === slotType);

  if (existingAsset) {
    const approved = input?.approved === true || existingAsset.approved === true;
    existingAsset.displayName = String(input?.displayName || existingAsset.displayName || "").trim();
    existingAsset.description = String(input?.description || existingAsset.description || "").trim();
    existingAsset.tags = normalizeList([...(existingAsset.tags || []), ...(input?.tags || [])]);
    existingAsset.cuisineTags = normalizeList([...(existingAsset.cuisineTags || []), ...(input?.cuisineTags || [])]);
    existingAsset.recipeKey = String(input?.recipeKey || existingAsset.recipeKey || "").trim();
    existingAsset.approved = approved;
    existingAsset.approvedForAutoUse = approved;
    existingAsset.approvalStatus = approved ? "approved" : (existingAsset.approvalStatus || "generated_unreviewed");
    existingAsset.updatedAt = new Date().toISOString();
    saveMediaLibraryCatalog(catalog);
    return existingAsset;
  }

  const destinationPath = copyFileIntoLibrary({
    ...input,
    sourceFilePath,
    slotType,
    sourceType
  });
  const approved = input?.approved === true;
  const assetId = `asset_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const recipeKey = String(input?.recipeKey || "").trim();
  const assetRecord = {
    assetId,
    slotType,
    sourceType,
    approvalStatus: approved ? "approved" : "generated_unreviewed",
    approved,
    approvedForAutoUse: approved,
    filepath: toRepoRelative(destinationPath),
    sha256,
    width: null,
    height: null,
    mime: guessMimeType(destinationPath),
    displayName: String(input?.displayName || "").trim(),
    description: String(input?.description || "").trim(),
    categoryKey: String(input?.categoryKey || "").trim(),
    cuisineTags: normalizeList(input?.cuisineTags),
    tags: normalizeList(input?.tags),
    recipeKey,
    qualityScore: Number.isFinite(Number(input?.qualityScore)) ? Number(input.qualityScore) : 0,
    model: String(input?.model || "").trim(),
    prompt: String(input?.prompt || "").trim(),
    promptVersion: String(input?.promptVersion || "").trim(),
    notes: String(input?.notes || "").trim(),
    createdFrom: String(input?.createdFrom || "").trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  catalog.assets.push(assetRecord);

  if (recipeKey) {
    upsertRecipeRecord(catalog, {
      recipeKey,
      slotType,
      displayName: assetRecord.displayName,
      description: assetRecord.description,
      categoryKey: assetRecord.categoryKey,
      languageVariants: input?.languageVariants,
      tags: assetRecord.tags
    });
    catalog.matches.push({
      recipeKey,
      assetId,
      matchScore: 100,
      matchReason: sourceType === "generated" ? "ai_generated_exact" : "manual_register",
      approvedForAutoUse: approved,
      createdAt: new Date().toISOString()
    });
  }

  saveMediaLibraryCatalog(catalog);
  return assetRecord;
}

function approveLibraryAsset(assetId) {
  const catalog = loadMediaLibraryCatalog();
  const asset = catalog.assets.find((entry) => entry.assetId === assetId);
  if (!asset) return null;

  asset.approved = true;
  asset.approvedForAutoUse = true;
  asset.approvalStatus = "approved";
  asset.updatedAt = new Date().toISOString();

  catalog.matches = catalog.matches.map((match) => match.assetId === assetId
    ? { ...match, approvedForAutoUse: true }
    : match);

  saveMediaLibraryCatalog(catalog);
  return asset;
}

function findApprovedProductAssetForMenuItem(item) {
  const catalog = loadMediaLibraryCatalog();
  const candidateKeys = buildProductRecipeCandidateKeys(item);

  for (const recipeKey of candidateKeys) {
    const exactMatch = catalog.matches.find((match) => match.recipeKey === recipeKey && match.approvedForAutoUse);
    if (exactMatch) {
      const asset = catalog.assets.find((entry) => entry.assetId === exactMatch.assetId && entry.approved);
      if (asset) return asset;
    }

    const directAsset = catalog.assets.find((entry) => entry.recipeKey === recipeKey && entry.approved);
    if (directAsset) return directAsset;
  }

  return null;
}

function getMediaLibraryStats() {
  const catalog = loadMediaLibraryCatalog();
  const countsBySlot = SLOT_TYPES.reduce((acc, slotType) => ({ ...acc, [slotType]: 0 }), {});
  const countsBySource = SOURCE_TYPES.reduce((acc, sourceType) => ({ ...acc, [sourceType]: 0 }), {});

  catalog.assets.forEach((asset) => {
    countsBySlot[asset.slotType] = (countsBySlot[asset.slotType] || 0) + 1;
    countsBySource[asset.sourceType] = (countsBySource[asset.sourceType] || 0) + 1;
  });

  return {
    assetCount: catalog.assets.length,
    approvedCount: catalog.assets.filter((asset) => asset.approved).length,
    pendingCount: catalog.assets.filter((asset) => !asset.approved).length,
    recipeCount: catalog.recipes.length,
    matchCount: catalog.matches.length,
    countsBySlot,
    countsBySource
  };
}

module.exports = {
  MEDIA_LIBRARY_CATALOG_FILE,
  MEDIA_LIBRARY_ROOT,
  buildProductRecipeCandidateKeys,
  buildProductRecipeKeyFromMenuItem,
  ensureMediaLibraryStructure,
  findApprovedProductAssetForMenuItem,
  getMediaLibraryStats,
  loadMediaLibraryCatalog,
  registerLibraryAsset,
  saveMediaLibraryCatalog,
  approveLibraryAsset
};
