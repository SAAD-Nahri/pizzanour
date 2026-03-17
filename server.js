const express = require("express");
const path = require("path");
const fs = require('fs');

const { ensureStorage, readData, uploadsDir } = require("./site-store");

const app = express();
const PORT = 8080;

ensureStorage();

app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "unified" });
});

app.get("/api/data", (_req, res) => {
    res.json(readData());
});

// For cross-compatibility with legacy upload endpoint
const multer = require("multer");
const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const name = Date.now() + '_' + Math.random().toString(36).slice(2) + ext;
        cb(null, name);
    }
});
const upload = multer({ storage });

app.post('/upload', upload.any(), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files found in upload' });
    }
    const uploadedUrls = req.files.map(file => '/uploads/' + file.filename);
    res.json({ urls: uploadedUrls });
});

app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Prevent leaking files that shouldn't be public
const DENY_PUBLIC_FILES = new Set([
    "/admin.html",
    "/admin.js",
    "/data.json",
    "/package.json",
    "/package-lock.json",
    "/website-server.js",
    "/admin-server.js",
    "/server-common.js",
    "/site-store.js",
    "/Dockerfile",
    "/docker-compose.yml",
    "/README.md",
    "/.env",
    "/.env.example"
]);

app.use((req, res, next) => {
    if (DENY_PUBLIC_FILES.has(req.path)) {
        res.status(404).type("text/plain").send("Not Found");
        return;
    }
    next();
});

app.use(express.static(__dirname, { index: false }));

app.use((_req, res) => {
    res.status(404).type("text/plain").send("Not Found");
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Foody unified server running at http://localhost:${PORT}/`);
    console.log(`Uploads directory: ${uploadsDir}`);
});

module.exports = { app, server };
