const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { uploadsDir } = require("./site-store");

const THUMBNAIL_DIRNAME = ".thumbs";
const THUMBNAIL_WIDTH = Number.parseInt(process.env.IMAGE_THUMB_WIDTH || "320", 10) || 320;
const THUMBNAIL_HEIGHT = Number.parseInt(process.env.IMAGE_THUMB_HEIGHT || "320", 10) || 320;
const THUMBNAIL_QUALITY = Number.parseInt(process.env.IMAGE_THUMB_QUALITY || "72", 10) || 72;
const THUMB_VARIANT_VERSION = Number.parseInt(process.env.IMAGE_THUMB_VERSION || "2", 10) || 2;
const MENU_CARD_THUMB_WIDTH = Number.parseInt(process.env.IMAGE_MENU_THUMB_WIDTH || "160", 10) || 160;
const MENU_CARD_THUMB_HEIGHT = Number.parseInt(process.env.IMAGE_MENU_THUMB_HEIGHT || "160", 10) || 160;
const MENU_CARD_THUMB_QUALITY = Number.parseInt(process.env.IMAGE_MENU_THUMB_QUALITY || "52", 10) || 52;
const MENU_LIST_THUMB_WIDTH = Number.parseInt(process.env.IMAGE_MENU_LIST_THUMB_WIDTH || "112", 10) || 112;
const MENU_LIST_THUMB_HEIGHT = Number.parseInt(process.env.IMAGE_MENU_LIST_THUMB_HEIGHT || "112", 10) || 112;
const MENU_LIST_THUMB_QUALITY = Number.parseInt(process.env.IMAGE_MENU_LIST_THUMB_QUALITY || "46", 10) || 46;
const HERO_THUMB_WIDTH = Number.parseInt(process.env.IMAGE_HERO_THUMB_WIDTH || "1280", 10) || 1280;
const HERO_THUMB_HEIGHT = Number.parseInt(process.env.IMAGE_HERO_THUMB_HEIGHT || "720", 10) || 720;
const HERO_THUMB_QUALITY = Number.parseInt(process.env.IMAGE_HERO_THUMB_QUALITY || "58", 10) || 58;
const THUMBNAIL_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const THUMBNAIL_VARIANTS = Object.freeze({
  default: {
    suffix: "",
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    quality: THUMBNAIL_QUALITY,
    effort: 4
  },
  menu: {
    suffix: `.menu${THUMB_VARIANT_VERSION}`,
    width: MENU_CARD_THUMB_WIDTH,
    height: MENU_CARD_THUMB_HEIGHT,
    quality: MENU_CARD_THUMB_QUALITY,
    effort: 3
  },
  list: {
    suffix: `.list${THUMB_VARIANT_VERSION}`,
    width: MENU_LIST_THUMB_WIDTH,
    height: MENU_LIST_THUMB_HEIGHT,
    quality: MENU_LIST_THUMB_QUALITY,
    effort: 3
  },
  hero: {
    suffix: `.hero${THUMB_VARIANT_VERSION}`,
    width: HERO_THUMB_WIDTH,
    height: HERO_THUMB_HEIGHT,
    quality: HERO_THUMB_QUALITY,
    effort: 4
  }
});

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildFallbackThumbnailSvg(label, width, height) {
  const safeLabel = escapeSvgText(label || "Image unavailable");
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fff8ef"/>
          <stop offset="100%" stop-color="#f3e6d3"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="28" fill="url(#bg)"/>
      <rect x="${Math.round(width * 0.12)}" y="${Math.round(height * 0.12)}" width="${Math.round(width * 0.76)}" height="${Math.round(height * 0.76)}" rx="22" fill="rgba(255,255,255,0.85)" stroke="#e7d5bc" stroke-width="3"/>
      <circle cx="${Math.round(width * 0.38)}" cy="${Math.round(height * 0.42)}" r="${Math.round(Math.min(width, height) * 0.09)}" fill="#ffd7a8"/>
      <path d="M${Math.round(width * 0.27)} ${Math.round(height * 0.68)} L${Math.round(width * 0.45)} ${Math.round(height * 0.5)} L${Math.round(width * 0.57)} ${Math.round(height * 0.62)} L${Math.round(width * 0.7)} ${Math.round(height * 0.44)} L${Math.round(width * 0.82)} ${Math.round(height * 0.68)} Z" fill="#f7b86d"/>
      <text x="50%" y="${Math.round(height * 0.83)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(14, Math.round(width * 0.065))}" font-weight="700" fill="#7a5a3d">${safeLabel}</text>
    </svg>
  `.trim();
}

async function writeFallbackThumbnail(targetPath, variantConfig) {
  const svg = buildFallbackThumbnailSvg(
    variantConfig === THUMBNAIL_VARIANTS.list ? "Preview" : "Image unavailable",
    variantConfig.width,
    variantConfig.height
  );
  await sharp(Buffer.from(svg))
    .webp({
      quality: Math.max(variantConfig.quality, 58),
      effort: 2
    })
    .toFile(targetPath);
}

function getThumbnailDir() {
  return path.join(uploadsDir, THUMBNAIL_DIRNAME);
}

function getThumbnailVariantConfig(variant = "default") {
  return THUMBNAIL_VARIANTS[variant] || THUMBNAIL_VARIANTS.default;
}

function getThumbnailTargetFileName(originalFileName, variant = "default") {
  const safeOriginalName = path.basename(originalFileName || "");
  if (!safeOriginalName) return "";
  const variantConfig = getThumbnailVariantConfig(variant);
  return variant === "default"
    ? `${safeOriginalName}.webp`
    : `${safeOriginalName}${variantConfig.suffix}.webp`;
}

function getUploadThumbnailPublicUrl(value, variant = "default") {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/uploads/")) return value;

  const filename = path.basename(trimmed);
  const extension = path.extname(filename).toLowerCase();
  if (!THUMBNAIL_EXTENSIONS.has(extension)) return value;

  const variantConfig = getThumbnailVariantConfig(variant);
  return `/uploads/${THUMBNAIL_DIRNAME}/${filename}${variantConfig.suffix}.webp`;
}

async function ensureThumbnailFile(originalFileName, targetFileName, variant = "default") {
  const safeOriginalName = path.basename(originalFileName || "");
  const variantConfig = getThumbnailVariantConfig(variant);
  const safeTargetName = path.basename(targetFileName || `${safeOriginalName}${variantConfig.suffix}.webp`);
  if (!safeOriginalName || !safeTargetName) {
    return null;
  }

  const originalPath = path.join(uploadsDir, safeOriginalName);
  if (!fs.existsSync(originalPath)) {
    return null;
  }

  const extension = path.extname(originalPath).toLowerCase();
  if (!THUMBNAIL_EXTENSIONS.has(extension)) {
    return originalPath;
  }

  const thumbnailDir = getThumbnailDir();
  const thumbnailPath = path.join(thumbnailDir, safeTargetName);

  fs.mkdirSync(thumbnailDir, { recursive: true });

  if (!fs.existsSync(thumbnailPath)) {
    const tempPath = path.join(
      thumbnailDir,
      `${safeTargetName}.${process.pid}.${Date.now()}.tmp`
    );

    try {
      try {
        await sharp(originalPath, { failOn: "none" })
          .rotate()
          .resize(variantConfig.width, variantConfig.height, {
            fit: "cover",
            position: "attention"
          })
          .webp({
            quality: variantConfig.quality,
            effort: variantConfig.effort
          })
          .toFile(tempPath);
      } catch (error) {
        await writeFallbackThumbnail(tempPath, variantConfig);
      }

      if (!fs.existsSync(thumbnailPath)) {
        fs.renameSync(tempPath, thumbnailPath);
      } else if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { force: true });
      }
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { force: true });
      }
      if (!fs.existsSync(thumbnailPath)) {
        throw error;
      }
    }
  }

  return thumbnailPath;
}

function parseRequestedThumbnailFile(requestedFile) {
  if (!requestedFile.endsWith(".webp")) return null;

  const withoutWebp = requestedFile.slice(0, -".webp".length);
  const variantEntries = Object.entries(THUMBNAIL_VARIANTS)
    .filter(([variant]) => variant !== "default")
    .sort((left, right) => right[1].suffix.length - left[1].suffix.length);

  for (const [variant, config] of variantEntries) {
    if (withoutWebp.endsWith(config.suffix)) {
      return {
        originalFileName: withoutWebp.slice(0, -config.suffix.length),
        variant
      };
    }
  }

  for (const legacyVariant of ["menu", "list", "hero"]) {
    const legacySuffix = `.${legacyVariant}`;
    if (withoutWebp.endsWith(legacySuffix)) {
      return {
        originalFileName: withoutWebp.slice(0, -legacySuffix.length),
        variant: legacyVariant
      };
    }
  }

  return {
    originalFileName: withoutWebp,
    variant: "default"
  };
}

function createThumbnailRequestHandler() {
  return async function handleThumbnailRequest(req, res, next) {
    try {
      const requestedFile = path.basename(req.params.file || "");
      const parsedRequest = parseRequestedThumbnailFile(requestedFile);
      if (!parsedRequest) {
        res.status(404).type("text/plain").send("Not Found");
        return;
      }

      const resolvedPath = await ensureThumbnailFile(
        parsedRequest.originalFileName,
        requestedFile,
        parsedRequest.variant
      );

      if (!resolvedPath) {
        res.status(404).type("text/plain").send("Not Found");
        return;
      }

      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      res.sendFile(resolvedPath);
    } catch (error) {
      next(error);
    }
  };
}

function listThumbnailSourceFiles() {
  if (!fs.existsSync(uploadsDir)) return [];

  return fs.readdirSync(uploadsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => THUMBNAIL_EXTENSIONS.has(path.extname(name).toLowerCase()));
}

let thumbnailWarmupPromise = null;

function warmUploadThumbnailCache(options = {}) {
  if (thumbnailWarmupPromise) return thumbnailWarmupPromise;

  const logPrefix = options.logPrefix || "thumbs";
  const batchSize = Number.isInteger(options.batchSize) && options.batchSize > 0 ? options.batchSize : 12;

  thumbnailWarmupPromise = (async () => {
    const files = listThumbnailSourceFiles();
    if (!files.length) return;

    for (let index = 0; index < files.length; index += batchSize) {
      const batch = files.slice(index, index + batchSize);
      await Promise.all(batch.flatMap((fileName) => ([
        ensureThumbnailFile(fileName, getThumbnailTargetFileName(fileName, "default"), "default").catch((error) => {
          console.warn(`[${logPrefix}] Default thumbnail warmup failed for ${fileName}:`, error?.message || error);
        }),
        ensureThumbnailFile(fileName, getThumbnailTargetFileName(fileName, "menu"), "menu").catch((error) => {
          console.warn(`[${logPrefix}] Menu thumbnail warmup failed for ${fileName}:`, error?.message || error);
        }),
        ensureThumbnailFile(fileName, getThumbnailTargetFileName(fileName, "list"), "list").catch((error) => {
          console.warn(`[${logPrefix}] List thumbnail warmup failed for ${fileName}:`, error?.message || error);
        }),
        ensureThumbnailFile(fileName, getThumbnailTargetFileName(fileName, "hero"), "hero").catch((error) => {
          console.warn(`[${logPrefix}] Hero thumbnail warmup failed for ${fileName}:`, error?.message || error);
        })
      ])));
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    console.log(`[${logPrefix}] Warmed ${files.length} upload thumbnail set(s).`);
  })();

  return thumbnailWarmupPromise;
}

module.exports = {
  createThumbnailRequestHandler,
  ensureThumbnailFile,
  getThumbnailTargetFileName,
  getUploadThumbnailPublicUrl,
  getThumbnailDir,
  listThumbnailSourceFiles,
  warmUploadThumbnailCache
};
