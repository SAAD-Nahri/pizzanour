const express = require("express");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

const {
  createBuildFingerprint,
  parsePort,
  setStaticAssetHeaders
} = require("./server-common");
const { createThumbnailRequestHandler, warmUploadThumbnailCache } = require("./image-thumbnails");
const { ensureStorage, getDataVersion, readData, uploadsDir } = require("./site-store");

const app = express();
const port = parsePort(process.env.PORT, 3002);
const publicBuildDir = path.join(__dirname, "public-build");
const PUBLIC_BUILD_FILES = new Set([
  "/style.css",
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
    sizes: source.sizes && typeof source.sizes === "object" ? source.sizes : (Array.isArray(source.sizes) ? source.sizes : [])
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
    branding: sanitizePublicBranding(source.branding),
    contentTranslations: source.contentTranslations && typeof source.contentTranslations === "object"
      ? source.contentTranslations
      : {},
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
    categoryTranslations: source.categoryTranslations && typeof source.categoryTranslations === "object"
      ? source.categoryTranslations
      : {}
  };
}

function buildPublicHomePayload(data) {
  const source = data && typeof data === "object" ? data : {};

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
    categoryTranslations: source.categoryTranslations && typeof source.categoryTranslations === "object"
      ? source.categoryTranslations
      : {}
  };
}

function sendBuiltOrSourceHtml(res, fileName) {
  const builtPath = path.join(publicBuildDir, fileName);
  const sourcePath = path.join(__dirname, fileName);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(fs.existsSync(builtPath) ? builtPath : sourcePath);
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
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  const version = getDataVersion();
  const etag = `W/"${version}"`;
  res.setHeader("ETag", etag);
  res.setHeader("X-Data-Version", version);
  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }
  const payload = getCachedPublicPayload(version);
  res.type("application/json").send(payload.json);
});

app.get("/api/menu-data", (req, res) => {
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  const version = getDataVersion();
  const etag = `W/"${version}"`;
  res.setHeader("ETag", etag);
  res.setHeader("X-Data-Version", version);
  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }
  const payload = getCachedMenuPayload(version);
  res.type("application/json").send(payload.json);
});

app.get("/api/home-data", (req, res) => {
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  const version = getDataVersion();
  const etag = `W/"${version}"`;
  res.setHeader("ETag", etag);
  res.setHeader("X-Data-Version", version);
  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }
  const payload = getCachedHomePayload(version);
  res.type("application/json").send(payload.json);
});

app.get("/uploads/.thumbs/:file", createThumbnailRequestHandler());

app.use("/uploads", express.static(uploadsDir, {
  immutable: true,
  maxAge: "30d"
}));

app.get(Array.from(PUBLIC_BUILD_FILES), (req, res, next) => {
  const builtPath = path.join(publicBuildDir, req.path.replace(/^\//, ""));
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
});

app.get("/", (_req, res) => {
  sendBuiltOrSourceHtml(res, "index.html");
});

app.get("/menu.html", (_req, res) => {
  sendBuiltOrSourceHtml(res, "menu.html");
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
