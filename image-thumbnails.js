const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { uploadsDir } = require("./site-store");

const THUMBNAIL_DIRNAME = ".thumbs";
const THUMBNAIL_WIDTH = 320;
const THUMBNAIL_HEIGHT = 320;
const THUMBNAIL_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function getThumbnailDir() {
  return path.join(uploadsDir, THUMBNAIL_DIRNAME);
}

function getUploadThumbnailPublicUrl(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/uploads/")) return value;

  const filename = path.basename(trimmed);
  const extension = path.extname(filename).toLowerCase();
  if (!THUMBNAIL_EXTENSIONS.has(extension)) return value;

  return `/uploads/${THUMBNAIL_DIRNAME}/${filename}.webp`;
}

async function ensureThumbnailFile(originalFileName, targetFileName) {
  const safeOriginalName = path.basename(originalFileName || "");
  const safeTargetName = path.basename(targetFileName || "");
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
    await sharp(originalPath)
      .rotate()
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: "cover",
        position: "attention"
      })
      .webp({
        quality: 72,
        effort: 4
      })
      .toFile(thumbnailPath);
  }

  return thumbnailPath;
}

function createThumbnailRequestHandler() {
  return async function handleThumbnailRequest(req, res, next) {
    try {
      const requestedFile = path.basename(req.params.file || "");
      if (!requestedFile.endsWith(".webp")) {
        res.status(404).type("text/plain").send("Not Found");
        return;
      }

      const originalFileName = requestedFile.slice(0, -".webp".length);
      const resolvedPath = await ensureThumbnailFile(originalFileName, requestedFile);

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

module.exports = {
  createThumbnailRequestHandler,
  ensureThumbnailFile,
  getUploadThumbnailPublicUrl
};
