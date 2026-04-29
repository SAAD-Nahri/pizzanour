const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { uploadsDir } = require("./site-store");

const MAX_JSON_BYTES = "1mb";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "pdf"]);
const SESSION_COOKIE = "restaurant_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const NO_STORE_EXTENSIONS = new Set([".html"]);
const REVALIDATE_CACHE_EXTENSIONS = new Set([".js", ".css"]);
const LONG_CACHE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf"
]);

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallback;
  }
  return parsed;
}

function booleanFromEnv(value, fallback) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return fallback;
}

function parseCookies(cookieHeader) {
  const out = {};
  const source = typeof cookieHeader === "string" ? cookieHeader : "";

  source.split(";").forEach((entry) => {
    const index = entry.indexOf("=");
    if (index === -1) return;
    const key = entry.slice(0, index).trim();
    const value = entry.slice(index + 1).trim();
    if (!key) return;
    out[key] = decodeURIComponent(value);
  });

  return out;
}

function createSessionManager(persistenceFile = null) {
  let sessions = new Map();

  function loadSessions() {
    if (persistenceFile && fs.existsSync(persistenceFile)) {
      try {
        const raw = fs.readFileSync(persistenceFile, "utf8");
        const data = JSON.parse(raw);
        sessions = new Map(Object.entries(data));
        console.log(`[AUTH] Loaded ${sessions.size} sessions from ${persistenceFile}`);
      } catch (e) {
        console.error("Error loading sessions:", e);
      }
    }
  }

  function saveSessions() {
    if (persistenceFile) {
      try {
        const obj = Object.fromEntries(sessions);
        fs.writeFileSync(persistenceFile, JSON.stringify(obj), "utf8");
      } catch (e) {
        console.error("Error saving sessions:", e);
      }
    }
  }

  function clearExpired() {
    const now = Date.now();
    let changed = false;
    for (const [token, expiresAt] of sessions.entries()) {
      if (expiresAt <= now) {
        sessions.delete(token);
        changed = true;
      }
    }
    if (changed) saveSessions();
  }

  // Initial load
  loadSessions();

  function create() {
    clearExpired();
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    saveSessions();
    return token;
  }

  function isValid(token) {
    if (!token) return false;
    const expiresAt = sessions.get(token);
    if (!expiresAt) return false;
    if (expiresAt <= Date.now()) {
      sessions.delete(token);
      saveSessions();
      return false;
    }
    // Optional: Refresh TTL on use
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    saveSessions();
    return true;
  }

  function remove(token) {
    if (token) {
      sessions.delete(token);
      saveSessions();
    }
  }

  function clearAll() {
    if (sessions.size > 0) {
      sessions = new Map();
      saveSessions();
    }
  }

  return { create, isValid, remove, clearAll };
}

function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  return typeof token === "string" && token ? token : null;
}

function setSessionCookie(res, token) {
  // Be smart about Secure: only if NODE_ENV is production AND it's not localhost
  const isProd = process.env.NODE_ENV === "production";
  const envSecure = booleanFromEnv(process.env.COOKIE_SECURE, null);

  let secure = isProd;
  if (envSecure !== null) secure = envSecure;

  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];

  if (secure) {
    attributes.push("Secure");
  }

  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  const envSecure = booleanFromEnv(process.env.COOKIE_SECURE, null);

  let secure = isProd;
  if (envSecure !== null) secure = envSecure;

  const attributes = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];

  if (secure) {
    attributes.push("Secure");
  }

  res.setHeader("Set-Cookie", attributes.join("; "));
}

function createUploadMiddleware() {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const originalExtension = path.extname(file.originalname || "").toLowerCase().replace(/^\./, "");
        const extension = ALLOWED_UPLOAD_EXTENSIONS.has(originalExtension) ? originalExtension : "bin";
        cb(null, `upload_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${extension}`);
      }
    }),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: (_req, file, cb) => {
      const extension = path.extname(file.originalname || "").toLowerCase().replace(/^\./, "");
      if (!ALLOWED_UPLOAD_EXTENSIONS.has(extension)) {
        cb(new Error("unsupported_file_type"));
        return;
      }
      cb(null, true);
    }
  });
}

function createBuildFingerprint(filePaths) {
  const hash = crypto.createHash("sha1");

  filePaths.forEach((filePath) => {
    try {
      if (!fs.existsSync(filePath)) return;
      hash.update(path.basename(filePath));
      hash.update(fs.readFileSync(filePath));
    } catch (error) {
      hash.update(`${path.basename(filePath)}:missing`);
    }
  });

  return hash.digest("hex").slice(0, 12);
}

function setStaticAssetHeaders(res, filePath) {
  const extension = path.extname(filePath || "").toLowerCase();
  // Ensure browsers decode localized strings consistently.
  // (Some CDNs/proxies can drop charsets; being explicit prevents mojibake.)
  if (extension === ".html" || extension === ".css" || extension === ".js" || extension === ".json") {
    const contentType = res.getHeader("Content-Type");
    if (typeof contentType === "string" && !/charset=/i.test(contentType)) {
      res.setHeader("Content-Type", `${contentType}; charset=utf-8`);
    }
  }

  if (NO_STORE_EXTENSIONS.has(extension)) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return;
  }

  if (REVALIDATE_CACHE_EXTENSIONS.has(extension)) {
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    return;
  }

  if (LONG_CACHE_EXTENSIONS.has(extension)) {
    // Long-lived, fingerprinted/static assets (fonts/images/etc).
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
}

module.exports = {
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
};
