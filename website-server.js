const express = require("express");
const path = require("path");

const {
  createBuildFingerprint,
  parsePort,
  setStaticAssetHeaders
} = require("./server-common");
const { createThumbnailRequestHandler } = require("./image-thumbnails");
const { ensureStorage, getDataVersion, readData, uploadsDir } = require("./site-store");

const app = express();
const port = parsePort(process.env.PORT, 3002);
const build = createBuildFingerprint([
  path.join(__dirname, "website-server.js"),
  path.join(__dirname, "index.html"),
  path.join(__dirname, "menu.html"),
  path.join(__dirname, "app.js"),
  path.join(__dirname, "menu.js"),
  path.join(__dirname, "shared.js"),
  path.join(__dirname, "style.css")
]);

ensureStorage();

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
  "/DEPLOYMENT.md",
  "/.env",
  "/.env.example",
  "/nginx.conf"
]);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "website", build });
});

app.get("/build.json", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ status: "ok", service: "website", build });
});

app.get("/api/data", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const version = getDataVersion();
  const etag = `W/"${version}"`;
  res.setHeader("ETag", etag);
  res.setHeader("X-Data-Version", version);
  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }
  res.json(readData());
});

app.get("/uploads/.thumbs/:file", createThumbnailRequestHandler());

app.use("/uploads", express.static(uploadsDir, {
  immutable: true,
  maxAge: "30d"
}));

app.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((req, res, next) => {
  if (DENY_PUBLIC_FILES.has(req.path)) {
    res.status(404).type("text/plain").send("Not Found");
    return;
  }
  next();
});

app.use(express.static(__dirname, {
  index: false,
  setHeaders: setStaticAssetHeaders
}));

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not Found");
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Restaurant website server running on 0.0.0.0:${port}`);
});

module.exports = { app, server };
