const crypto = require("crypto");
const path = require("path");
const multer = require("multer");

const { uploadsDir } = require("./site-store");

const MAX_JSON_BYTES = "1mb";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);
const SESSION_COOKIE = "foody_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

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

function createSessionManager() {
  const sessions = new Map();

  function clearExpired() {
    const now = Date.now();
    for (const [token, expiresAt] of sessions.entries()) {
      if (expiresAt <= now) {
        sessions.delete(token);
      }
    }
  }

  function create() {
    clearExpired();
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    return token;
  }

  function isValid(token) {
    clearExpired();
    if (!token) return false;
    const expiresAt = sessions.get(token);
    if (!expiresAt) return false;
    if (expiresAt <= Date.now()) {
      sessions.delete(token);
      return false;
    }
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    return true;
  }

  function remove(token) {
    if (token) sessions.delete(token);
  }

  return { create, isValid, remove };
}

function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  return typeof token === "string" && token ? token : null;
}

function setSessionCookie(res, token) {
  const secure = booleanFromEnv(process.env.COOKIE_SECURE, process.env.NODE_ENV === "production");
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
  const secure = booleanFromEnv(process.env.COOKIE_SECURE, process.env.NODE_ENV === "production");
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

module.exports = {
  MAX_JSON_BYTES,
  clearSessionCookie,
  createSessionManager,
  createUploadMiddleware,
  getSessionToken,
  parsePort,
  setSessionCookie
};
