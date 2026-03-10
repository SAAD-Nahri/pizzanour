const express = require("express");
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

const app = express();
const port = parsePort(process.env.PORT, 3102);
const upload = createUploadMiddleware();
const sessions = createSessionManager();

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "change-me-now";

if (!process.env.ADMIN_PASS) {
  console.warn("ADMIN_PASS is not set. Using development fallback credentials.");
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
  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    res.status(401).json({ ok: false, error: "invalid_credentials" });
    return;
  }

  const token = sessions.create();
  setSessionCookie(res, token);
  res.json({ ok: true, user: ADMIN_USER });
});

app.get("/api/admin/session", (req, res) => {
  const token = getSessionToken(req);
  res.json({ ok: true, authenticated: sessions.isValid(token) });
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

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not Found");
});

app.use((error, _req, res, _next) => {
  console.error("ADMIN SERVER ERROR:", error);
  res.status(500).json({ ok: false, error: "internal_server_error" });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Foody admin server running on 0.0.0.0:${port}`);
});

module.exports = { app, server };
