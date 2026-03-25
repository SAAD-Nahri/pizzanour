const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
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
  { input: "menu-interactions.js", loader: "js" },
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
    after: Buffer.byteLength(result.code),
    code: result.code
  };
}

function versionedAssetPath(fileName, version) {
  return `${fileName}?v=${encodeURIComponent(version)}`;
}

async function minifyHtmlFile(input, version) {
  const inputPath = path.join(ROOT, input);
  const source = await fs.readFile(inputPath, "utf8");
  const versionedSource = source
    .replace(/href="style\.css"/g, `href="${versionedAssetPath("style.css", version)}"`)
    .replace(/href="menu-page\.css"/g, `href="${versionedAssetPath("menu-page.css", version)}"`)
    .replace(/href="shared-public\.js"/g, `href="${versionedAssetPath("shared-public.js", version)}"`)
    .replace(/href="app\.js"/g, `href="${versionedAssetPath("app.js", version)}"`)
    .replace(/href="menu\.js"/g, `href="${versionedAssetPath("menu.js", version)}"`)
    .replace(/href="homepage-extras\.js"/g, `href="${versionedAssetPath("homepage-extras.js", version)}"`)
    .replace(/href="game\.js"/g, `href="${versionedAssetPath("game.js", version)}"`)
    .replace(/src="shared-public\.js"/g, `src="${versionedAssetPath("shared-public.js", version)}"`)
    .replace(/src="app\.js"/g, `src="${versionedAssetPath("app.js", version)}"`)
    .replace(/src="menu\.js"/g, `src="${versionedAssetPath("menu.js", version)}"`)
    .replace(/href="game\.css"/g, `href="${versionedAssetPath("game.css", version)}"`)
    .replace(/href="homepage-extras\.js"/g, `href="${versionedAssetPath("homepage-extras.js", version)}"`)
    .replace(
      /(<script src="shared-public[^"]*" defer><\/script>)/,
      `<script>window.__PUBLIC_BUILD_VERSION=${JSON.stringify(version)};</script>$1`
    );

  const code = await minifyHtml(versionedSource, {
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
  const assetResults = [];

  for (const asset of ASSETS) {
    const result = await minifyAsset(asset);
    results.push(result);
    assetResults.push(result);
  }

  const versionHash = crypto
    .createHash("sha1")
    .update(assetResults.map((item) => `${item.input}:${item.code}`).join("\n"))
    .digest("hex")
    .slice(0, 10);

  for (const input of HTML_FILES) {
    results.push(await minifyHtmlFile(input, versionHash));
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
