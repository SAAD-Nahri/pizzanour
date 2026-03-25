const fs = require("fs/promises");
const path = require("path");
const esbuild = require("esbuild");
const { minify: minifyHtml } = require("html-minifier-terser");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public-build");

const ASSETS = [
  { input: "style.css", loader: "css" },
  { input: "menu-page.css", loader: "css" },
  { input: "game.css", loader: "css" },
  { input: "shared-public.js", loader: "js" },
  { input: "app.js", loader: "js" },
  { input: "menu.js", loader: "js" },
  { input: "homepage-extras.js", loader: "js" },
  { input: "game.js", loader: "js" }
];

const HTML_FILES = ["index.html", "menu.html"];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function minifyAsset({ input, loader }) {
  const inputPath = path.join(ROOT, input);
  const source = await fs.readFile(inputPath, "utf8");
  const result = await esbuild.transform(source, {
    loader,
    minify: true,
    legalComments: "none",
    charset: "utf8",
    target: loader === "js" ? "es2019" : undefined
  });

  const outPath = path.join(OUT_DIR, input);
  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, result.code, "utf8");

  return {
    input,
    before: Buffer.byteLength(source),
    after: Buffer.byteLength(result.code)
  };
}

async function minifyHtmlFile(input) {
  const inputPath = path.join(ROOT, input);
  const source = await fs.readFile(inputPath, "utf8");
  const code = await minifyHtml(source, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: false,
    keepClosingSlash: true
  });

  const outPath = path.join(OUT_DIR, input);
  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, code, "utf8");

  return {
    input,
    before: Buffer.byteLength(source),
    after: Buffer.byteLength(code)
  };
}

async function main() {
  await ensureDir(OUT_DIR);
  const results = [];

  for (const asset of ASSETS) {
    results.push(await minifyAsset(asset));
  }

  for (const input of HTML_FILES) {
    results.push(await minifyHtmlFile(input));
  }

  const totalBefore = results.reduce((sum, item) => sum + item.before, 0);
  const totalAfter = results.reduce((sum, item) => sum + item.after, 0);

  results.forEach((item) => {
    const saved = item.before - item.after;
    const pct = item.before > 0 ? Math.round((saved / item.before) * 100) : 0;
    console.log(`${item.input}: ${item.before} -> ${item.after} bytes (-${pct}%)`);
  });

  console.log(`Total: ${totalBefore} -> ${totalAfter} bytes`);
}

main().catch((error) => {
  console.error("Failed to build public assets:", error);
  process.exitCode = 1;
});
