const express = require("express");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

const {
  createBuildFingerprint,
  parsePort,
  setStaticAssetHeaders
} = require("./server-common");
const { createThumbnailRequestHandler, getUploadThumbnailPublicUrl, warmUploadThumbnailCache } = require("./image-thumbnails");
const { ensureStorage, getDataVersion, readData, uploadsDir } = require("./site-store");

const app = express();
const port = parsePort(process.env.PORT, 3015);
const publicBuildDir = path.join(__dirname, "public-build");
const PUBLIC_BUILD_FILES = new Set([
  "/home-shell.css",
  "/home-polish.css",
  "/laruche.css",
  "/style.css",
  "/vendor/bootstrap-icons/bootstrap-icons.min.css",
  "/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2",
  "/vendor/bootstrap-icons/fonts/bootstrap-icons.woff",
  "/menu-shell.css",
  "/menu-page.css",
  "/game.css",
  "/shared-public.js",
  "/app.js",
  "/menu.js",
  "/menu-interactions.js",
  "/homepage-extras.js",
  "/game.js"
]);
const build = createBuildFingerprint([
  path.join(__dirname, "website-server.js"),
  path.join(__dirname, "index.html"),
  path.join(__dirname, "menu.html"),
  path.join(__dirname, "home-shell.css"),
  path.join(__dirname, "home-polish.css"),
  path.join(__dirname, "menu-shell.css"),
  path.join(__dirname, "menu-page.css"),
  path.join(__dirname, "game.css"),
  path.join(__dirname, "app.js"),
  path.join(__dirname, "menu.js"),
  path.join(__dirname, "menu-interactions.js"),
  path.join(__dirname, "shared.js"),
  path.join(__dirname, "shared-public.js"),
  path.join(__dirname, "style.css")
]);

ensureStorage();

app.use(compression({
  threshold: 1024
}));

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "images", "hero-default.svg"));
});

function asPublicString(value, maxLength = 8192) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function sanitizePublicStringArray(values, maxItems = 12, maxLength = 8192) {
  return Array.isArray(values)
    ? values
      .filter((value) => typeof value === "string" && value.trim())
      .slice(0, maxItems)
      .map((value) => value.trim().slice(0, maxLength))
    : [];
}

function sanitizePublicTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    fr: {
      name: asPublicString(source.fr?.name, 160),
      desc: asPublicString(source.fr?.desc, 2000)
    },
    en: {
      name: asPublicString(source.en?.name, 160),
      desc: asPublicString(source.en?.desc, 2000)
    },
    ar: {
      name: asPublicString(source.ar?.name, 160),
      desc: asPublicString(source.ar?.desc, 2000)
    }
  };
}

function sanitizePublicCategoryTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  const out = {};
  for (const [key, value] of Object.entries(source)) {
    const safeKey = asPublicString(key, 120).trim();
    if (!safeKey) continue;
    out[safeKey] = sanitizePublicTranslations(value);
  }
  return out;
}

function sanitizePublicMenuExtras(input) {
  const source = Array.isArray(input) ? input : [];
  return source
    .filter((entry) => entry && typeof entry === "object")
    .map((entry, index) => ({
      id: asPublicString(entry.id, 120) || `extra-${index + 1}`,
      name: asPublicString(entry.name, 160),
      price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0
    }))
    .filter((entry) => entry.name);
}

function sanitizePublicMenuItem(item) {
  const source = item && typeof item === "object" ? item : {};
  const images = sanitizePublicStringArray(source.images, 8);
  return {
    id: typeof source.id === "string" || Number.isFinite(source.id) ? source.id : "",
    cat: asPublicString(source.cat, 120),
    name: asPublicString(source.name, 160),
    desc: asPublicString(source.desc, 2000),
    price: Number.isFinite(Number(source.price)) ? Number(source.price) : 0,
    badge: asPublicString(source.badge, 64),
    img: asPublicString(source.img, 8192) || images[0] || "",
    images,
    ingredients: sanitizePublicStringArray(source.ingredients, 24, 160),
    translations: sanitizePublicTranslations(source.translations),
    likes: Number.isFinite(Number(source.likes)) ? Number(source.likes) : 0,
    featured: Boolean(source.featured),
    available: source.available !== false,
    hasSizes: Boolean(source.hasSizes),
    sizes: source.sizes && typeof source.sizes === "object" ? source.sizes : (Array.isArray(source.sizes) ? source.sizes : []),
    extras: sanitizePublicMenuExtras(source.extras),
    discount: Number.isFinite(Number(source.discount)) ? Number(source.discount) : 0
  };
}

function sanitizePublicMenuPageItem(item) {
  const source = item && typeof item === "object" ? item : {};
  const images = sanitizePublicStringArray(source.images, 4);
  return {
    id: typeof source.id === "string" || Number.isFinite(source.id) ? source.id : "",
    cat: asPublicString(source.cat, 120),
    name: asPublicString(source.name, 160),
    desc: asPublicString(source.desc, 1200),
    price: Number.isFinite(Number(source.price)) ? Number(source.price) : 0,
    img: asPublicString(source.img, 8192) || images[0] || "",
    images,
    translations: sanitizePublicTranslations(source.translations),
    featured: Boolean(source.featured),
    available: source.available !== false,
    hasSizes: Boolean(source.hasSizes),
    sizes: source.sizes && typeof source.sizes === "object" ? source.sizes : (Array.isArray(source.sizes) ? source.sizes : []),
    extras: sanitizePublicMenuExtras(source.extras)
  };
}

function sanitizePublicBranding(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    presetId: asPublicString(source.presetId, 40),
    restaurantName: asPublicString(source.restaurantName, 160),
    shortName: asPublicString(source.shortName, 80),
    tagline: asPublicString(source.tagline, 160),
    logoMark: asPublicString(source.logoMark, 16),
    primaryColor: asPublicString(source.primaryColor, 16),
    secondaryColor: asPublicString(source.secondaryColor, 16),
    accentColor: asPublicString(source.accentColor, 16),
    surfaceColor: asPublicString(source.surfaceColor, 16),
    surfaceMuted: asPublicString(source.surfaceMuted, 16),
    textColor: asPublicString(source.textColor, 16),
    textMuted: asPublicString(source.textMuted, 16),
    menuBackground: asPublicString(source.menuBackground, 16),
    menuSurface: asPublicString(source.menuSurface, 16),
    heroImage: asPublicString(source.heroImage, 8192),
    heroSlides: sanitizePublicStringArray(source.heroSlides, 3, 8192),
    logoImage: asPublicString(source.logoImage, 8192)
  };
}

function optimizeHomeBrandingImages(branding) {
  if (!branding || typeof branding !== "object") return branding;
  return {
    ...branding,
    heroImage: getUploadThumbnailPublicUrl(branding.heroImage, "hero"),
    heroSlides: Array.isArray(branding.heroSlides)
      ? branding.heroSlides.map((value) => getUploadThumbnailPublicUrl(value, "hero"))
      : []
  };
}

function sanitizePublicSuperCategory(item) {
  const source = item && typeof item === "object" ? item : {};
  return {
    id: asPublicString(source.id, 120),
    name: asPublicString(source.name, 160),
    desc: asPublicString(source.desc, 240),
    emoji: asPublicString(source.emoji, 16),
    time: asPublicString(source.time, 64),
    cats: sanitizePublicStringArray(source.cats, 40, 120),
    translations: sanitizePublicTranslations(source.translations)
  };
}

function sanitizePublicHoursRow(item) {
  const source = item && typeof item === "object" ? item : {};
  return {
    day: asPublicString(source.day, 64),
    open: asPublicString(source.open, 64),
    close: asPublicString(source.close, 64),
    i18n: asPublicString(source.i18n, 120),
    highlight: Boolean(source.highlight)
  };
}

function buildPublicSitePayload(data) {
  const source = data && typeof data === "object" ? data : {};
  return {
    menu: Array.isArray(source.menu) ? source.menu.map(sanitizePublicMenuItem) : [],
    catEmojis: source.catEmojis && typeof source.catEmojis === "object" ? source.catEmojis : {},
    categoryImages: source.categoryImages && typeof source.categoryImages === "object" ? source.categoryImages : {},
    wifi: {
      ssid: asPublicString(source.wifi?.ssid || source.wifi?.name, 120),
      pass: asPublicString(source.wifi?.pass || source.wifi?.code, 120)
    },
    social: source.social && typeof source.social === "object" ? source.social : {},
    branding: optimizeHomeBrandingImages(sanitizePublicBranding(source.branding)),
    contentTranslations: source.contentTranslations && typeof source.contentTranslations === "object"
      ? source.contentTranslations
      : {},
    promoId: typeof source.promoId === "string" || Number.isFinite(source.promoId) ? source.promoId : null,
    promoIds: Array.isArray(source.promoIds) ? source.promoIds : [],
    superCategories: Array.isArray(source.superCategories) ? source.superCategories.map(sanitizePublicSuperCategory) : [],
    hours: Array.isArray(source.hours) ? source.hours.map(sanitizePublicHoursRow) : [],
    hoursNote: asPublicString(source.hoursNote, 240),
    gallery: sanitizePublicStringArray(source.gallery, 24, 8192),
    guestExperience: source.guestExperience && typeof source.guestExperience === "object"
      ? {
        paymentMethods: sanitizePublicStringArray(source.guestExperience.paymentMethods, 8, 40),
        facilities: sanitizePublicStringArray(source.guestExperience.facilities, 12, 40)
      }
      : { paymentMethods: [], facilities: [] },
    sectionVisibility: source.sectionVisibility && typeof source.sectionVisibility === "object"
      ? source.sectionVisibility
      : {},
    sectionOrder: sanitizePublicStringArray(source.sectionOrder, 12, 40),
    landing: source.landing && typeof source.landing === "object"
      ? {
        location: source.landing.location && typeof source.landing.location === "object"
          ? {
            address: asPublicString(source.landing.location.address, 240),
            url: asPublicString(source.landing.location.url, 2048)
          }
          : null,
        phone: asPublicString(source.landing.phone, 120)
      }
      : { location: null, phone: "" },
    categoryTranslations: sanitizePublicCategoryTranslations(source.categoryTranslations)
  };
}

function buildPublicHomePayload(data) {
  const source = data && typeof data === "object" ? data : {};
  const promoIds = Array.isArray(source.promoIds)
    ? source.promoIds
    : (typeof source.promoId === "string" || Number.isFinite(source.promoId) ? [source.promoId] : []);
  const promoId = promoIds.length ? promoIds[0] : null;
  const promoItem = Array.isArray(source.menu)
    ? source.menu.find((item) => String(item?.id) === String(promoId))
    : null;
  const featuredItems = Array.isArray(source.menu)
    ? source.menu
        .filter((item) => item && item.featured && item.available !== false)
        .slice(0, 6)
        .map(sanitizePublicMenuItem)
    : [];

  return {
    wifi: {
      ssid: asPublicString(source.wifi?.ssid || source.wifi?.name, 120),
      pass: asPublicString(source.wifi?.pass || source.wifi?.code, 120)
    },
    social: source.social && typeof source.social === "object" ? source.social : {},
    branding: sanitizePublicBranding(source.branding),
    contentTranslations: source.contentTranslations && typeof source.contentTranslations === "object"
      ? source.contentTranslations
      : {},
    promoId,
    promoIds,
    promoItem: promoItem ? sanitizePublicMenuItem(promoItem) : null,
    featuredItems,
    categoryImages: source.categoryImages && typeof source.categoryImages === "object" ? source.categoryImages : {},
    hours: Array.isArray(source.hours) ? source.hours.map(sanitizePublicHoursRow) : [],
    hoursNote: asPublicString(source.hoursNote, 240),
    gallery: sanitizePublicStringArray(source.gallery, 24, 8192),
    guestExperience: source.guestExperience && typeof source.guestExperience === "object"
      ? {
        paymentMethods: sanitizePublicStringArray(source.guestExperience.paymentMethods, 8, 40),
        facilities: sanitizePublicStringArray(source.guestExperience.facilities, 12, 40)
      }
      : { paymentMethods: [], facilities: [] },
    sectionVisibility: source.sectionVisibility && typeof source.sectionVisibility === "object"
      ? source.sectionVisibility
      : {},
    sectionOrder: sanitizePublicStringArray(source.sectionOrder, 12, 40),
    landing: source.landing && typeof source.landing === "object"
      ? {
        location: source.landing.location && typeof source.landing.location === "object"
          ? {
            address: asPublicString(source.landing.location.address, 240),
            url: asPublicString(source.landing.location.url, 2048)
          }
          : null,
        phone: asPublicString(source.landing.phone, 120)
      }
      : { location: null, phone: "" }
  };
}

function buildPublicMenuPayload(data) {
  const source = data && typeof data === "object" ? data : {};
  return {
    menu: Array.isArray(source.menu) ? source.menu.map(sanitizePublicMenuPageItem) : [],
    catEmojis: source.catEmojis && typeof source.catEmojis === "object" ? source.catEmojis : {},
    categoryImages: source.categoryImages && typeof source.categoryImages === "object" ? source.categoryImages : {},
    wifi: {
      ssid: asPublicString(source.wifi?.ssid || source.wifi?.name, 120),
      pass: asPublicString(source.wifi?.pass || source.wifi?.code, 120)
    },
    social: source.social && typeof source.social === "object" ? source.social : {},
    branding: sanitizePublicBranding(source.branding),
    contentTranslations: source.contentTranslations && typeof source.contentTranslations === "object"
      ? source.contentTranslations
      : {},
    promoId: typeof source.promoId === "string" || Number.isFinite(source.promoId) ? source.promoId : null,
    promoIds: Array.isArray(source.promoIds) ? source.promoIds : [],
    superCategories: Array.isArray(source.superCategories) ? source.superCategories.map(sanitizePublicSuperCategory) : [],
    landing: source.landing && typeof source.landing === "object"
      ? {
        location: source.landing.location && typeof source.landing.location === "object"
          ? {
            address: asPublicString(source.landing.location.address, 240),
            url: asPublicString(source.landing.location.url, 2048)
          }
          : null,
        phone: asPublicString(source.landing.phone, 120)
      }
      : { location: null, phone: "" },
    categoryTranslations: sanitizePublicCategoryTranslations(source.categoryTranslations)
  };
}

function sendBuiltOrSourceHtml(res, fileName) {
  const builtPath = path.join(publicBuildDir, fileName);
  const sourcePath = path.join(__dirname, fileName);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(fs.existsSync(builtPath) ? builtPath : sourcePath);
}

function isLocalDevRequest(req) {
  const host = String(req.hostname || "").trim().toLowerCase();
  return host === "127.0.0.1" || host === "localhost";
}

function sendPreferredPublicAsset(req, res, next) {
  const builtPath = path.join(publicBuildDir, req.path.replace(/^\//, ""));
  const sourcePath = path.join(__dirname, req.path.replace(/^\//, ""));
  const shouldPreferSource = isLocalDevRequest(req);

  if (shouldPreferSource && fs.existsSync(sourcePath)) {
    setStaticAssetHeaders(res, sourcePath);
    res.sendFile(sourcePath);
    return;
  }

  if (!fs.existsSync(builtPath)) {
    next();
    return;
  }

  if (typeof req.query?.v === "string" && req.query.v) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    setStaticAssetHeaders(res, builtPath);
  }
  res.sendFile(builtPath);
}

function sendPreferredHtml(req, res, fileName) {
  if (isLocalDevRequest(req)) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.sendFile(path.join(__dirname, fileName));
    return;
  }
  sendBuiltOrSourceHtml(res, fileName);
}

let cachedPublicPayload = {
  version: "",
  json: ""
};
let cachedMenuPayload = {
  version: "",
  json: ""
};
let cachedHomePayload = {
  version: "",
  json: ""
};

function getCachedPublicPayload(version) {
  if (cachedPublicPayload.version === version && cachedPublicPayload.json) {
    return cachedPublicPayload;
  }

  const payload = buildPublicSitePayload(readData());
  cachedPublicPayload = {
    version,
    json: JSON.stringify(payload)
  };
  return cachedPublicPayload;
}

function getCachedMenuPayload(version) {
  if (cachedMenuPayload.version === version && cachedMenuPayload.json) {
    return cachedMenuPayload;
  }

  const payload = buildPublicMenuPayload(readData());
  cachedMenuPayload = {
    version,
    json: JSON.stringify(payload)
  };
  return cachedMenuPayload;
}

function getCachedHomePayload(version) {
  if (cachedHomePayload.version === version && cachedHomePayload.json) {
    return cachedHomePayload;
  }

  const payload = buildPublicHomePayload(readData());
  cachedHomePayload = {
    version,
    json: JSON.stringify(payload)
  };
  return cachedHomePayload;
}

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
  const version = getDataVersion();
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Data-Version", version);
  res.type("application/json").send(JSON.stringify(buildPublicSitePayload(readData())));
});

app.get("/api/menu-data", (req, res) => {
  const version = getDataVersion();
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Data-Version", version);
  res.type("application/json").send(JSON.stringify(buildPublicMenuPayload(readData())));
});

app.get("/api/home-data", (req, res) => {
  const version = getDataVersion();
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Data-Version", version);
  res.type("application/json").send(JSON.stringify(buildPublicHomePayload(readData())));
});

app.get("/uploads/.thumbs/:file", createThumbnailRequestHandler());

app.use("/uploads", express.static(uploadsDir, {
  immutable: true,
  maxAge: "30d"
}));

app.get(Array.from(PUBLIC_BUILD_FILES), (req, res, next) => {
  sendPreferredPublicAsset(req, res, next);
});

app.get("/", (req, res) => {
  sendPreferredHtml(req, res, "index.html");
});

app.get("/menu.html", (req, res) => {
  sendPreferredHtml(req, res, "menu.html");
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
  setTimeout(() => {
    warmUploadThumbnailCache({ logPrefix: "website-thumbs" }).catch((error) => {
      console.warn("[website-thumbs] Warmup failed:", error?.message || error);
    });
  }, 250);
});

module.exports = { app, server };
