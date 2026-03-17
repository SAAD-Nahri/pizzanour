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

const fs = require('fs');
const authFile = path.join(__dirname, 'auth.json');

// --- CREDENTIAL MANAGEMENT ---
function getAdminCredentials() {
  if (fs.existsSync(authFile)) {
    try {
      return JSON.parse(fs.readFileSync(authFile, 'utf8'));
    } catch (e) {
      console.error("Error reading auth.json:", e);
    }
  }

  // Fallback to env vars or default
  return {
    user: process.env.ADMIN_USER || "admin",
    pass: process.env.ADMIN_PASS || "foody2026"
  };
}

function saveAdminCredentials(user, pass) {
  try {
    fs.writeFileSync(authFile, JSON.stringify({ user, pass }));
    return true;
  } catch (e) {
    console.error("Error saving auth.json:", e);
    return false;
  }
}

let currentCreds = getAdminCredentials();
if (currentCreds.user === 'admin' && currentCreds.pass === 'foody2026') {
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
  console.log(`[AUTH] Login request received. Body:`, JSON.stringify(req.body));
  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  // Always check against latest stored credentials
  currentCreds = getAdminCredentials();

  if (username !== currentCreds.user || password !== currentCreds.pass) {
    console.warn(`[AUTH] Invalid credentials for: "${username}" password_length: ${password.length}`);
    res.status(401).json({ ok: false, error: "invalid_credentials" });
    return;
  }

  const token = sessions.create();
  setSessionCookie(res, token);
  res.json({ ok: true, user: currentCreds.user });
});

// Credentials Update Endpoint
app.post("/api/admin/credentials", requireAuth, (req, res) => {
  const { newUsername, newPassword, confirmPassword } = req.body;

  if (!newUsername) {
    return res.status(400).json({ ok: false, error: "Nom d'utilisateur requis." });
  }

  // Update logic: If new password is provided, use it. Otherwise keep old password.
  let passToSave = currentCreds.pass;
  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ ok: false, error: "Les mots de passe ne correspondent pas." });
    }
    passToSave = newPassword;
  }

  const saved = saveAdminCredentials(newUsername, passToSave);
  if (saved) {
    currentCreds = { user: newUsername, pass: passToSave };
    res.json({ ok: true, message: "Identifiants sauvegardés avec succès." });
  } else {
    res.status(500).json({ ok: false, error: "Erreur lors de la sauvegarde côté serveur." });
  }
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
  console.log(`Foody admin server running on 0.0.0.0:${port}`);
});

module.exports = { app, server };
