"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml"
]);
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "uploads",
  ".thumbs"
]);

const MOJIBAKE_PATTERNS = [
  { label: "UTF-8 accent decoded as Latin-1", value: "\u00c3" },
  { label: "UTF-8 symbol decoded as Latin-1", value: "\u00c2" },
  { label: "curly apostrophe mojibake", value: "\u00e2\u20ac\u2122" },
  { label: "opening quote mojibake", value: "\u00e2\u20ac\u0153" },
  { label: "closing quote mojibake", value: "\u00e2\u20ac\u009d" },
  { label: "en dash mojibake", value: "\u00e2\u20ac\u201c" },
  { label: "em dash mojibake", value: "\u00e2\u20ac\u201d" },
  { label: "bullet mojibake", value: "\u00e2\u20ac\u00a2" },
  { label: "replacement character", value: "\ufffd" }
];

function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName);
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) {
        walk(path.join(dir, entry.name), files);
      }
      continue;
    }

    if (entry.isFile()) {
      const filePath = path.join(dir, entry.name);
      if (isTextFile(filePath)) {
        files.push(filePath);
      }
    }
  }
  return files;
}

function formatSnippet(line) {
  return line.trim().slice(0, 180);
}

const findings = [];

for (const filePath of walk(ROOT)) {
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    findings.push({
      filePath,
      lineNumber: 0,
      label: "invalid UTF-8",
      snippet: error.message
    });
    continue;
  }

  const lines = content.split(/\r?\n/);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (const pattern of MOJIBAKE_PATTERNS) {
      if (line.includes(pattern.value)) {
        findings.push({
          filePath,
          lineNumber: lineIndex + 1,
          label: pattern.label,
          snippet: formatSnippet(line)
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Encoding check failed. Possible mojibake found:");
  for (const finding of findings.slice(0, 40)) {
    const relativePath = path.relative(ROOT, finding.filePath);
    console.error(`- ${relativePath}:${finding.lineNumber} [${finding.label}] ${finding.snippet}`);
  }
  if (findings.length > 40) {
    console.error(`...and ${findings.length - 40} more.`);
  }
  process.exit(1);
}

console.log("Encoding check passed.");
