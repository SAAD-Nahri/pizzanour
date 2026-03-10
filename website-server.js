const express = require("express");
const path = require("path");

const { parsePort } = require("./server-common");
const { ensureStorage, readData, uploadsDir } = require("./site-store");

const app = express();
const port = parsePort(process.env.PORT, 3002);

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
  res.json({ status: "ok", service: "website" });
});

app.get("/api/data", (_req, res) => {
  res.json(readData());
});

app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

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

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Foody website server running on 0.0.0.0:${port}`);
});

module.exports = { app, server };
