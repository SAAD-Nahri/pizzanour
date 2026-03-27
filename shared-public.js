/**
 * Shared data and utilities for the restaurant template
 * Loaded before app.js and menu.js
 *
 * Note for maintainers:
 * The active runtime starter data is defined later in this file
 * with `window.whiteLabelStarterSeed`.
 * Legacy demo defaults have been removed so the repo now mirrors
 * the active white-label runtime behavior.
 */

function cloneStarterTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
        fr: { ...(source.fr || {}) },
        en: { ...(source.en || {}) },
        ar: { ...(source.ar || {}) }
    };
}

function cloneStarterTranslationMap(input) {
    const source = input && typeof input === 'object' ? input : {};
    const out = {};

    Object.entries(source).forEach(([key, value]) => {
        if (typeof key !== 'string' || !key.trim()) return;
        out[key] = cloneStarterTranslations(value);
    });

    return out;
}

function cloneStarterSuperCategory(group) {
    const source = group && typeof group === 'object' ? group : {};
    return {
        ...source,
        cats: Array.isArray(source.cats) ? [...source.cats] : [],
        translations: cloneStarterTranslations(source.translations)
    };
}

function cloneStarterMenuItem(item) {
    return {
        ...item,
        ingredients: Array.isArray(item.ingredients) ? [...item.ingredients] : [],
        images: Array.isArray(item.images) ? [...item.images] : [],
        sizes: item.sizes ? { ...item.sizes } : undefined,
        translations: cloneStarterTranslations(item.translations)
    };
}

function repairPossibleMojibake(value) {
    let result = typeof value === 'string' ? value : '';
    for (let i = 0; i < 2; i += 1) {
        if (!/[ÃØÙðâ]/.test(result)) break;
        try {
            const repaired = decodeURIComponent(escape(result));
            if (!repaired || repaired === result) break;
            result = repaired;
        } catch (_error) {
            break;
        }
    }
    return result;
}

function canonicalMenuLookupKey(value) {
    const repaired = repairPossibleMojibake(String(value || '').trim());
    return repaired
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

window.whiteLabelStarterSeed = {
    menu: [],
    catEmojis: {},
    categoryImages: {},
    categoryTranslations: {},
    superCategories: []
};

window.defaultMenu = [];
window.defaultCatEmojis = {};
window.defaultCategoryImages = {};
window.defaultCategoryTranslations = {};
window.defaultSuperCategories = [];

const STARTER_CATEGORY_TRANSLATION_FALLBACKS = {};
const STARTER_SUPERCATEGORY_TRANSLATION_FALLBACKS = {};

window.defaultBranding = {
    "presetId": "core",
    "restaurantName": "Restaurant",
    "shortName": "Restaurant",
    "tagline": "Local cuisine, warm service, and a polished online presence.",
    "logoMark": "🍽️",
    "primaryColor": "#E21B1B",
    "secondaryColor": "#FF8D08",
    "accentColor": "#FFD700",
    "surfaceColor": "#FFF8F0",
    "surfaceMuted": "#F4EBDD",
    "textColor": "#261A16",
    "textMuted": "#75655C",
    "menuBackground": "#111318",
    "menuSurface": "#1B1F26",
    "heroImage": "images/hero-default.svg",
    "logoImage": ""
};

function normalizeColor(value, fallback) {
    const raw = typeof value === 'string' ? value.trim() : '';
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw) ? raw : fallback;
}

function normalizePresetId(value, fallback) {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return /^[a-z0-9_-]{2,40}$/.test(raw) ? raw : fallback;
}

function hexToRgb(color) {
    const normalized = normalizeColor(color, '').replace('#', '');
    if (!normalized) return null;
    const full = normalized.length === 3
        ? normalized.split('').map((char) => `${char}${char}`).join('')
        : normalized;
    const parsed = Number.parseInt(full, 16);
    if (!Number.isFinite(parsed)) return null;

    return {
        r: (parsed >> 16) & 255,
        g: (parsed >> 8) & 255,
        b: parsed & 255
    };
}

function rgbToHex(rgb, fallback = '#000000') {
    if (!rgb) return fallback;
    const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function mixHexColors(colorA, colorB, ratio = 0.5, fallback = colorA) {
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    if (!rgbA || !rgbB) return fallback;

    const weight = Math.max(0, Math.min(1, Number(ratio) || 0));
    return rgbToHex({
        r: rgbA.r + ((rgbB.r - rgbA.r) * weight),
        g: rgbA.g + ((rgbB.g - rgbA.g) * weight),
        b: rgbA.b + ((rgbB.b - rgbA.b) * weight)
    }, fallback);
}

function normalizeHeroSlideList(input, fallbackSlides = [], primaryHero = '') {
    const fallback = Array.isArray(fallbackSlides) ? fallbackSlides.filter(Boolean) : [];
    const sourceSlides = Array.isArray(input) ? input.filter((value) => typeof value === 'string' && value.trim()) : [];
    const baseSlides = sourceSlides.length > 0 ? sourceSlides : fallback;
    const firstSlide = (typeof primaryHero === 'string' && primaryHero.trim())
        ? primaryHero.trim()
        : (baseSlides[0] || fallback[0] || window.defaultBranding?.heroImage || 'images/hero-default.svg');

    return [
        firstSlide,
        baseSlides[1] || fallback[1] || firstSlide,
        baseSlides[2] || fallback[2] || baseSlides[1] || fallback[1] || firstSlide
    ];
}

window.brandPresetCatalog = {
    core: {
        presetId: 'core',
        label: 'Core / White Label',
        heroImage: 'images/hero-default.svg',
        heroSlides: ['images/hero-default.svg', 'images/hero-cafe.svg', 'images/hero-traditional.svg'],
        primaryColor: '#E21B1B',
        secondaryColor: '#FF8D08',
        accentColor: '#FFD700',
        surfaceColor: '#FFF8F0',
        surfaceMuted: '#F4EBDD',
        textColor: '#261A16',
        textMuted: '#75655C',
        menuBackground: '#111318',
        menuSurface: '#1B1F26'
    },
    fast_food: {
        presetId: 'fast_food',
        label: 'Fast Food / Street Food',
        heroImage: 'images/hero-fast.svg',
        heroSlides: ['images/hero-fast.svg', 'images/hero-default.svg', 'images/hero-traditional.svg'],
        primaryColor: '#C62828',
        secondaryColor: '#FF8F00',
        accentColor: '#FFD54F',
        surfaceColor: '#FFF5ED',
        surfaceMuted: '#F8E7D8',
        textColor: '#251715',
        textMuted: '#735E56',
        menuBackground: '#140F12',
        menuSurface: '#21181D'
    },
    cafe: {
        presetId: 'cafe',
        label: 'Cafe / Brunch',
        heroImage: 'images/hero-cafe.svg',
        heroSlides: ['images/hero-cafe.svg', 'images/hero-default.svg', 'images/hero-traditional.svg'],
        primaryColor: '#8B5E3C',
        secondaryColor: '#D49A63',
        accentColor: '#F3D08B',
        surfaceColor: '#FBF5EE',
        surfaceMuted: '#EFE3D4',
        textColor: '#2B211B',
        textMuted: '#75675E',
        menuBackground: '#171311',
        menuSurface: '#241C18'
    },
    traditional: {
        presetId: 'traditional',
        label: 'Traditional / Family Restaurant',
        heroImage: 'images/hero-traditional.svg',
        heroSlides: ['images/hero-traditional.svg', 'images/hero-default.svg', 'images/hero-cafe.svg'],
        primaryColor: '#A63D32',
        secondaryColor: '#C8873F',
        accentColor: '#E5C77A',
        surfaceColor: '#FBF4EA',
        surfaceMuted: '#F1E2CD',
        textColor: '#291C18',
        textMuted: '#78655A',
        menuBackground: '#151112',
        menuSurface: '#24191A'
    }
};

window.getBrandPresetConfig = function (presetId) {
    const normalizedId = normalizePresetId(presetId, 'core');
    return window.brandPresetCatalog[normalizedId] || window.brandPresetCatalog.core;
};

window.defaultBranding = {
    ...window.defaultBranding,
    ...window.getBrandPresetConfig(window.defaultBranding?.presetId || 'core'),
    restaurantName: 'Restaurant',
    shortName: 'Restaurant'
};

function normalizeBranding(input) {
    const source = input && typeof input === 'object' ? input : {};
    const presetDefaults = window.getBrandPresetConfig(source.presetId || window.defaultBranding.presetId);
    const heroImage = typeof source.heroImage === 'string' && source.heroImage.trim()
        ? source.heroImage.trim()
        : (presetDefaults.heroImage || window.defaultBranding.heroImage);
    const heroSlides = normalizeHeroSlideList(source.heroSlides, presetDefaults.heroSlides, heroImage);
    return {
        ...presetDefaults,
        ...window.defaultBranding,
        ...source,
        presetId: normalizePresetId(source.presetId, window.defaultBranding.presetId),
        restaurantName: typeof source.restaurantName === 'string' && source.restaurantName.trim()
            ? source.restaurantName.trim()
            : window.defaultBranding.restaurantName,
        shortName: typeof source.shortName === 'string' && source.shortName.trim()
            ? source.shortName.trim()
            : window.defaultBranding.shortName,
        tagline: typeof source.tagline === 'string' && source.tagline.trim()
            ? source.tagline.trim()
            : window.defaultBranding.tagline,
        logoMark: typeof source.logoMark === 'string' && source.logoMark.trim()
            ? source.logoMark.trim().slice(0, 12)
            : window.defaultBranding.logoMark,
        primaryColor: normalizeColor(source.primaryColor, window.defaultBranding.primaryColor),
        secondaryColor: normalizeColor(source.secondaryColor, window.defaultBranding.secondaryColor),
        accentColor: normalizeColor(source.accentColor, window.defaultBranding.accentColor),
        surfaceColor: normalizeColor(source.surfaceColor, window.defaultBranding.surfaceColor),
        surfaceMuted: normalizeColor(source.surfaceMuted, window.defaultBranding.surfaceMuted),
        textColor: normalizeColor(source.textColor, window.defaultBranding.textColor),
        textMuted: normalizeColor(source.textMuted, window.defaultBranding.textMuted),
        menuBackground: normalizeColor(source.menuBackground, window.defaultBranding.menuBackground),
        menuSurface: normalizeColor(source.menuSurface, window.defaultBranding.menuSurface),
        heroImage,
        heroSlides,
        logoImage: typeof source.logoImage === 'string' && source.logoImage.trim()
            ? source.logoImage.trim()
            : window.defaultBranding.logoImage
    };
}

function getPublicUploadThumbnailUrl(value, variant = 'default') {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed.startsWith('/uploads/')) return value;

    const filename = trimmed.split('/').pop();
    if (!filename || !/\.(jpg|jpeg|png|webp|avif)$/i.test(filename)) return value;
    if (variant === 'default') {
        return `/uploads/.thumbs/${filename}.webp`;
    }
    return `/uploads/.thumbs/${filename}.${variant}.webp`;
}

const PAYMENT_METHOD_IDS = ['cash', 'tpe'];
const FACILITY_IDS = ['wifi', 'accessible', 'parking', 'terrace', 'family'];
const SECTION_VISIBILITY_KEYS = ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];
const SECTION_ORDER_KEYS = ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];

function normalizeGuestExperience(input) {
    const source = input && typeof input === 'object' ? input : {};
    const paymentMethods = Array.isArray(source.paymentMethods) ? source.paymentMethods : [];
    const facilities = Array.isArray(source.facilities) ? source.facilities : [];

    return {
        paymentMethods: PAYMENT_METHOD_IDS.filter((id) => paymentMethods.includes(id)),
        facilities: FACILITY_IDS.filter((id) => facilities.includes(id))
    };
}

function normalizeSectionVisibility(input) {
    const source = input && typeof input === 'object' ? input : {};
    const defaults = {
        about: true,
        payments: true,
        events: true,
        gallery: true,
        hours: true,
        contact: true
    };

    SECTION_VISIBILITY_KEYS.forEach((key) => {
        if (typeof source[key] === 'boolean') {
            defaults[key] = source[key];
        }
    });

    return defaults;
}

function normalizeSectionOrder(input) {
    const source = Array.isArray(input) ? input : [];
    const out = [];

    source.forEach((value) => {
        if (typeof value !== 'string') return;
        const safeValue = value.trim();
        if (!SECTION_ORDER_KEYS.includes(safeValue)) return;
        if (out.includes(safeValue)) return;
        out.push(safeValue);
    });

    SECTION_ORDER_KEYS.forEach((key) => {
        if (!out.includes(key)) {
            out.push(key);
        }
    });

    return out;
}

window.defaultConfig = {
    "name": "Restaurant",
    "location": {
        "address": "",
        "url": ""
    },
    "phone": "",
    "socials": {
        "instagram": "",
        "facebook": "",
        "tiktok": "",
        "tripadvisor": "",
        "whatsapp": ""
    },
    "categoryTranslations": window.defaultCategoryTranslations,
    "superCategories": window.defaultSuperCategories,
    "wifi": {
        "name": "",
        "code": ""
    },
    "gallery": [
        "images/gallery-default-room.svg",
        "images/gallery-default-plating.svg",
        "images/gallery-default-table.svg"
    ],
    "guestExperience": {
        "paymentMethods": ["cash", "tpe"],
        "facilities": ["wifi"]
    },
    "sectionVisibility": {
        "about": true,
        "payments": true,
        "events": true,
        "gallery": true,
        "hours": true,
        "contact": true
    },
    "sectionOrder": ["about", "payments", "events", "gallery", "hours", "contact"],
    "branding": window.defaultBranding,
    "contentTranslations": {
        "fr": {},
        "en": {},
        "ar": {}
    }
};

// Initialize restaurantConfig from defaults. The server payload is the source of truth.
(function () {
    window.restaurantConfig = {
        ...window.defaultConfig,
        location: { ...window.defaultConfig.location },
        socials: { ...window.defaultConfig.socials },
        wifi: { ...window.defaultConfig.wifi },
        categoryTranslations: cloneStarterTranslationMap(window.defaultCategoryTranslations),
        superCategories: [...window.defaultSuperCategories],
        gallery: [],
        guestExperience: normalizeGuestExperience(window.defaultConfig.guestExperience),
        sectionVisibility: normalizeSectionVisibility(window.defaultConfig.sectionVisibility),
        sectionOrder: normalizeSectionOrder(window.defaultConfig.sectionOrder),
        branding: normalizeBranding(window.defaultConfig.branding),
        contentTranslations: {
            fr: {},
            en: {},
            ar: {}
        }
    };
})();

function normalizeContentTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    const languages = ['fr', 'en', 'ar'];
    const out = {};

    languages.forEach((lang) => {
        const bucket = source[lang] && typeof source[lang] === 'object' ? source[lang] : {};
        out[lang] = {};
        Object.entries(bucket).forEach(([key, value]) => {
            if (typeof key !== 'string' || !key.trim()) return;
            if (typeof value !== 'string') return;
            out[lang][key.trim()] = value.trim();
        });
    });

    return out;
}

function normalizeEntityTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
        fr: {
            name: typeof source.fr?.name === 'string' ? source.fr.name.trim() : '',
            desc: typeof source.fr?.desc === 'string' ? source.fr.desc.trim() : ''
        },
        en: {
            name: typeof source.en?.name === 'string' ? source.en.name.trim() : '',
            desc: typeof source.en?.desc === 'string' ? source.en.desc.trim() : ''
        },
        ar: {
            name: typeof source.ar?.name === 'string' ? source.ar.name.trim() : '',
            desc: typeof source.ar?.desc === 'string' ? source.ar.desc.trim() : ''
        }
    };
}

function normalizeCategoryTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    const out = {};
    const knownCategoryEntries = Object.keys(window.defaultCatEmojis || {}).map((key) => ({
        raw: key,
        canonical: canonicalMenuLookupKey(key)
    }));

    Object.entries(source).forEach(([key, value]) => {
        if (typeof key !== 'string' || !key.trim()) return;
        const trimmedKey = key.trim();
        const canonicalKey = canonicalMenuLookupKey(trimmedKey);
        const knownMatch = knownCategoryEntries.find((entry) => entry.canonical === canonicalKey);
        const targetKey = knownMatch ? knownMatch.raw : repairPossibleMojibake(trimmedKey);
        out[targetKey] = normalizeEntityTranslations(value);
    });

    knownCategoryEntries.forEach(({ raw, canonical }) => {
        if (!out[raw]) {
            out[raw] = normalizeEntityTranslations(STARTER_CATEGORY_TRANSLATION_FALLBACKS[canonical]);
            return;
        }

        const fallback = normalizeEntityTranslations(STARTER_CATEGORY_TRANSLATION_FALLBACKS[canonical]);
        ['fr', 'en', 'ar'].forEach((lang) => {
            if (!out[raw][lang].name && fallback[lang].name) {
                out[raw][lang].name = fallback[lang].name;
            }
        });
    });

    return out;
}

function normalizeSuperCategories(input) {
    const source = Array.isArray(input) ? input : [];
    return source.map((group) => ({
        ...(group && typeof group === 'object' ? group : {}),
        name: repairPossibleMojibake(group?.name || ''),
        desc: repairPossibleMojibake(group?.desc || ''),
        cats: Array.isArray(group?.cats) ? group.cats.filter(Boolean).map((value) => repairPossibleMojibake(value)) : [],
        translations: (() => {
            const fallback = normalizeEntityTranslations(
                STARTER_SUPERCATEGORY_TRANSLATION_FALLBACKS[String(group?.id || '').trim()] || {}
            );
            const current = normalizeEntityTranslations(group?.translations);
            ['fr', 'en', 'ar'].forEach((lang) => {
                if (!current[lang].name && fallback[lang].name) current[lang].name = fallback[lang].name;
                if (!current[lang].desc && fallback[lang].desc) current[lang].desc = fallback[lang].desc;
            });
            return current;
        })()
    }));
}

window.getEffectiveSuperCategories = function (menuItems, config = window.restaurantConfig) {
    const items = Array.isArray(menuItems) ? menuItems : [];
    const runtimeConfig = config && typeof config === 'object' ? config : {};
    const currentCategories = [...new Set(
        items
            .map((item) => (typeof item?.cat === 'string' ? repairPossibleMojibake(item.cat.trim()) : ''))
            .filter(Boolean)
    )];

    if (!currentCategories.length) {
        return Array.isArray(runtimeConfig.superCategories) ? runtimeConfig.superCategories : [];
    }

    const categoryTranslations = runtimeConfig.categoryTranslations && typeof runtimeConfig.categoryTranslations === 'object'
        ? runtimeConfig.categoryTranslations
        : {};
    const categoryEmojiMap = window.catEmojis && typeof window.catEmojis === 'object'
        ? window.catEmojis
        : (window.defaultCatEmojis || {});
    const savedGroups = Array.isArray(runtimeConfig.superCategories) ? runtimeConfig.superCategories : [];
    const validGroups = [];
    const coveredCategories = new Set();

    savedGroups.forEach((group, index) => {
        const cats = Array.isArray(group?.cats)
            ? [...new Set(group.cats
                .map((value) => (typeof value === 'string' ? repairPossibleMojibake(value.trim()) : ''))
                .filter((value) => value && currentCategories.includes(value)))]
            : [];
        if (!cats.length) return;
        cats.forEach((value) => coveredCategories.add(value));
        validGroups.push({
            ...(group && typeof group === 'object' ? group : {}),
            id: typeof group?.id === 'string' && group.id.trim() ? group.id.trim() : `runtime-super-${index + 1}`,
            cats
        });
    });

    const missingCategories = currentCategories.filter((cat) => !coveredCategories.has(cat));
    if (!validGroups.length || missingCategories.length) {
        const fallbackGroups = missingCategories.map((cat, index) => {
            const translations = normalizeEntityTranslations(categoryTranslations[cat]);
            const fallbackName = translations.fr.name || repairPossibleMojibake(cat);
            const fallbackDesc = translations.fr.desc || '';
            return {
                id: `runtime-${canonicalMenuLookupKey(cat) || index + 1}`,
                name: fallbackName,
                desc: fallbackDesc,
                emoji: categoryEmojiMap[cat] || '🍴',
                time: '',
                cats: [cat],
                translations: {
                    fr: { name: translations.fr.name || fallbackName, desc: translations.fr.desc || fallbackDesc },
                    en: { name: translations.en.name || fallbackName, desc: translations.en.desc || fallbackDesc },
                    ar: { name: translations.ar.name || fallbackName, desc: translations.ar.desc || fallbackDesc }
                }
            };
        });

        return validGroups.length ? [...validGroups, ...fallbackGroups] : fallbackGroups;
    }

    return validGroups;
};

window.mergeRestaurantConfig = function (patch) {
    const source = patch && typeof patch === 'object' ? patch : {};
    const current = window.restaurantConfig || {};
    const next = { ...current, ...source };
    const currentContentTranslations = normalizeContentTranslations(current.contentTranslations || window.defaultConfig.contentTranslations);
    const sourceContentTranslations = normalizeContentTranslations(source.contentTranslations || {});

    next.location = { ...window.defaultConfig.location, ...(current.location || {}), ...(source.location || {}) };
    next.socials = { ...window.defaultConfig.socials, ...(current.socials || {}), ...(source.socials || {}) };
    next.wifi = { ...window.defaultConfig.wifi, ...(current.wifi || {}), ...(source.wifi || {}) };
    next.categoryTranslations = {
        ...normalizeCategoryTranslations(window.defaultConfig.categoryTranslations),
        ...normalizeCategoryTranslations(current.categoryTranslations),
        ...normalizeCategoryTranslations(source.categoryTranslations)
    };
    next.guestExperience = normalizeGuestExperience(source.guestExperience || current.guestExperience || window.defaultConfig.guestExperience);
    next.sectionVisibility = normalizeSectionVisibility(source.sectionVisibility || current.sectionVisibility || window.defaultConfig.sectionVisibility);
    next.sectionOrder = normalizeSectionOrder(source.sectionOrder || current.sectionOrder || window.defaultConfig.sectionOrder);
    next.branding = normalizeBranding(source.branding || current.branding || window.defaultBranding);
    next.contentTranslations = {
        fr: { ...(currentContentTranslations.fr || {}), ...(sourceContentTranslations.fr || {}) },
        en: { ...(currentContentTranslations.en || {}), ...(sourceContentTranslations.en || {}) },
        ar: { ...(currentContentTranslations.ar || {}), ...(sourceContentTranslations.ar || {}) }
    };

    if (!Array.isArray(next.gallery)) {
        next.gallery = Array.isArray(current.gallery) ? current.gallery : [];
    }

    next.superCategories = normalizeSuperCategories(
        Array.isArray(source.superCategories)
            ? source.superCategories
            : (Array.isArray(current.superCategories) ? current.superCategories : window.defaultSuperCategories)
    );

    window.restaurantConfig = next;

    return window.restaurantConfig;
};

window.getRestaurantDisplayName = function () {
    const brandingName = window.restaurantConfig?.branding?.restaurantName;
    if (typeof brandingName === 'string' && brandingName.trim()) {
        return brandingName.trim();
    }
    if (typeof window.restaurantConfig?.name === 'string' && window.restaurantConfig.name.trim()) {
        return window.restaurantConfig.name.trim();
    }
    return window.defaultBranding.restaurantName;
};

window.getRestaurantShortName = function () {
    const shortName = window.restaurantConfig?.branding?.shortName;
    if (typeof shortName === 'string' && shortName.trim()) {
        return shortName.trim();
    }
    return window.getRestaurantDisplayName();
};

window.getRestaurantInitials = function () {
    const raw = window.getRestaurantShortName() || window.getRestaurantDisplayName() || 'R';
    const parts = raw
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 2);

    if (!parts.length) return 'R';
    return parts.map((part) => part[0]).join('').toUpperCase();
};

window.getRestaurantAddress = function () {
    const address = window.restaurantConfig?.location?.address;
    if (typeof address === 'string' && address.trim()) {
        return address.trim();
    }
    return window.defaultConfig.location.address;
};

window.getLocalizedMenuField = function (item, field, fallback = '') {
    if (!item || typeof item !== 'object') return fallback;
    const lang = window.currentLang || document.documentElement.lang || 'fr';
    const translated = item.translations?.[lang]?.[field];
    if (typeof translated === 'string' && translated.trim()) {
        return translated.trim();
    }

    const baseValue = item[field];
    if (typeof baseValue === 'string' && baseValue.trim()) {
        return baseValue.trim();
    }

    return fallback;
};

window.getLocalizedCategoryName = function (categoryKey, fallback = '') {
    const rawKey = typeof categoryKey === 'string' ? categoryKey : '';
    const categoryMap = window.restaurantConfig?.categoryTranslations || {};
    const direct = categoryMap[rawKey];
    const canonicalKey = canonicalMenuLookupKey(rawKey);
    const aliasKey = Object.keys(categoryMap).find((key) => canonicalMenuLookupKey(key) === canonicalKey);
    const translations = direct || (aliasKey ? categoryMap[aliasKey] : undefined);
    const lang = window.currentLang || document.documentElement.lang || 'fr';
    const translated = translations?.[lang]?.name;

    if (typeof translated === 'string' && translated.trim()) {
        return repairPossibleMojibake(translated.trim());
    }
    if (rawKey.trim()) {
        return repairPossibleMojibake(rawKey.trim());
    }
    return fallback;
};

window.getLocalizedSuperCategoryField = function (superCategory, field, fallback = '') {
    if (!superCategory || typeof superCategory !== 'object') return fallback;
    const lang = window.currentLang || document.documentElement.lang || 'fr';
    const translated = superCategory.translations?.[lang]?.[field];

    if (typeof translated === 'string' && translated.trim()) {
        return repairPossibleMojibake(translated.trim());
    }

    const baseValue = superCategory[field];
    if (typeof baseValue === 'string' && baseValue.trim()) {
        return repairPossibleMojibake(baseValue.trim());
    }

    return fallback;
};

window.getLocalizedSuperCategoryName = function (superCategory, fallback = '') {
    return window.getLocalizedSuperCategoryField(superCategory, 'name', fallback);
};

window.getLocalizedSuperCategoryDescription = function (superCategory, fallback = '') {
    return window.getLocalizedSuperCategoryField(superCategory, 'desc', fallback);
};

window.getLocalizedMenuName = function (item) {
    return window.getLocalizedMenuField(item, 'name', '');
};

window.getLocalizedMenuDescription = function (item, fallback = '') {
    return window.getLocalizedMenuField(item, 'desc', fallback);
};

window.getLocaleDictionary = function (lang) {
    const base = window.translations?.[lang] || {};
    const overrides = window.restaurantConfig?.contentTranslations?.[lang] || {};
    return { ...base, ...overrides };
};

window.getTranslation = function (key, fallback = '') {
    const lang = window.currentLang || document.documentElement.lang || 'fr';
    return window.getLocaleDictionary(lang)?.[key] || fallback;
};

window.formatTranslation = function (key, fallback = '', vars = {}) {
    const template = window.getTranslation(key, fallback);
    return Object.entries(vars || {}).reduce((text, [token, value]) => {
        return text.replace(new RegExp(`\\{${token}\\}`, 'g'), String(value ?? ''));
    }, template);
};

window.getSafeExternalUrl = function (value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';

    try {
        const parsed = new URL(raw, window.location.origin);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.href;
        }
    } catch (_error) {
        return '';
    }

    return '';
};

window.openSafeExternalUrl = function (value, target = '_blank') {
    const safeUrl = window.getSafeExternalUrl(value);
    if (!safeUrl) return false;
    window.open(safeUrl, target, target === '_blank' ? 'noopener,noreferrer' : undefined);
    return true;
};

window.bindPublicMediaPreview = function (element, mediaFactory) {
    if (!element) return;

    const clearPreview = () => {
        element.onclick = null;
        element.onkeydown = null;
        element.removeAttribute('tabindex');
        element.removeAttribute('role');
        element.classList.remove('is-previewable');
    };

    if (typeof mediaFactory !== 'function') {
        clearPreview();
        return;
    }

    const openPreview = () => {
        const galleryItems = mediaFactory();
        if (!Array.isArray(galleryItems) || galleryItems.length === 0) return;
        const previewHandler =
            typeof window.openPublicMediaPreview === 'function'
                ? window.openPublicMediaPreview
                : (typeof window.openGallery === 'function' ? window.openGallery : null);
        if (previewHandler) {
            previewHandler(galleryItems, 0);
        }
    };

    element.onclick = openPreview;
    element.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPreview();
        }
    };
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.classList.add('is-previewable');
};

window.getSafePhoneHref = function (value) {
    const digits = String(value || '').replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : '';
};

window.setSafeImageSource = function (imgEl, src, options = {}) {
    if (!imgEl) return false;

    const cleanSrc = typeof src === 'string' ? src.trim() : '';
    const fallbackSrc = typeof options.fallbackSrc === 'string' ? options.fallbackSrc.trim() : '';
    const onMissing = typeof options.onMissing === 'function'
        ? options.onMissing
        : () => {
            imgEl.style.display = 'none';
        };

    if (!cleanSrc) {
        imgEl.removeAttribute('src');
        onMissing();
        return false;
    }

    imgEl.dataset.fallbackApplied = 'false';
    imgEl.onerror = () => {
        if (fallbackSrc && imgEl.dataset.fallbackApplied !== 'true' && cleanSrc !== fallbackSrc) {
            imgEl.dataset.fallbackApplied = 'true';
            imgEl.src = fallbackSrc;
            return;
        }
        imgEl.onerror = null;
        onMissing();
    };
    imgEl.style.display = options.displayValue || '';
    imgEl.src = cleanSrc;
    return true;
};

window.getWhatsAppNumber = function () {
    const rawValue =
        window.restaurantConfig?.socials?.whatsapp ||
        window.restaurantConfig?.phone ||
        '';
    return String(rawValue).replace(/\D/g, '');
};

window.applyBranding = function () {
    if (!window.restaurantConfig) return;

    const branding = normalizeBranding(window.restaurantConfig.branding);
    const displayHeroImage = getPublicUploadThumbnailUrl(branding.heroImage, 'hero');
    const displayHeroSlides = normalizeHeroSlideList(
        branding.heroSlides,
        [],
        branding.heroImage
    ).map((value) => getPublicUploadThumbnailUrl(value, 'hero'));
    const lang = document.documentElement.lang || 'fr';
    const root = document.documentElement;
    const surface3 = mixHexColors(branding.surfaceMuted, '#ffffff', 0.35, branding.surfaceMuted);
    const borderColor = mixHexColors(branding.surfaceMuted, branding.textColor, 0.12, branding.surfaceMuted);
    const menuSurfaceAlt = mixHexColors(branding.menuSurface, '#ffffff', 0.08, branding.menuSurface);
    const pageBg = mixHexColors(branding.surfaceColor, '#ffffff', 0.08, branding.surfaceColor);
    const pageBgAlt = mixHexColors(branding.surfaceMuted, '#ffffff', 0.14, branding.surfaceMuted);

    document.body?.setAttribute('data-theme-preset', branding.presetId || 'core');
    root.style.setProperty('--red', branding.primaryColor);
    root.style.setProperty('--primary', branding.primaryColor);
    root.style.setProperty('--secondary', branding.secondaryColor);
    root.style.setProperty('--orange', branding.secondaryColor);
    root.style.setProperty('--orange-dark', branding.secondaryColor);
    root.style.setProperty('--yellow', branding.accentColor);
    root.style.setProperty('--bg', pageBg);
    root.style.setProperty('--bg2', pageBgAlt);
    root.style.setProperty('--surface-1', branding.surfaceColor);
    root.style.setProperty('--surface-2', branding.surfaceMuted);
    root.style.setProperty('--surface-3', surface3);
    root.style.setProperty('--text', branding.textColor);
    root.style.setProperty('--text2', branding.textMuted);
    root.style.setProperty('--text-muted', branding.textMuted);
    root.style.setProperty('--border', borderColor);
    root.style.setProperty('--menu-bg', branding.menuBackground);
    root.style.setProperty('--menu-surface', branding.menuSurface);
    root.style.setProperty('--menu-surface-2', menuSurfaceAlt);
    root.style.setProperty('--brand-hero-image', `url("${displayHeroImage}")`);
    root.style.setProperty('--brand-logo-image', `url("${branding.logoImage}")`);

    const titleBase = branding.shortName || branding.restaurantName;
    const hasAdminShell = document.getElementById('adminSidebar') || document.getElementById('loginScreen');
    if (hasAdminShell && titleBase) {
        document.title = `${titleBase} - Admin`;
    } else if (document.body?.classList.contains('menu-page')) {
        document.title = `${window.getTranslation('nav_menu', 'Menu')} | ${titleBase}`;
    } else if (titleBase) {
        document.title = `${titleBase} - ${window.getTranslation('site_title_suffix', 'Commandez en ligne')}`;
    }

    const textMap = {
        brandLogoIconHeader: branding.logoMark,
        brandNameHeader: branding.shortName,
        aboutSubtitleName: branding.restaurantName,
        landingRestaurantName: branding.restaurantName,
        footerBrandIcon: branding.logoMark,
        footerBrandName: branding.shortName
    };

    Object.entries(textMap).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    ['adminLoginTitleText', 'mobileAdminTitleText', 'adminSidebarTitleText'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `${branding.logoMark} ${branding.shortName} Admin`;
        }
    });

    const signature = document.getElementById('aboutSignatureText');
    if (signature) {
        const lang = document.documentElement.lang || 'fr';
        if (lang === 'en') {
            signature.textContent = `- The ${branding.shortName} team ${branding.logoMark}`;
        } else if (lang === 'ar') {
            signature.textContent = `${branding.logoMark} فريق ${branding.shortName}`;
        } else {
            signature.textContent = `- L'équipe ${branding.shortName} ${branding.logoMark}`;
        }
    }

    const aboutTagline = document.getElementById('aboutTaglineText');
    if (aboutTagline) {
        const rawTagline = typeof branding.tagline === 'string' ? branding.tagline.trim() : '';
        const defaultTagline = typeof window.defaultBranding?.tagline === 'string'
            ? window.defaultBranding.tagline.trim()
            : '';
        aboutTagline.textContent = rawTagline && rawTagline !== defaultTagline
            ? rawTagline
            : window.getTranslation('about_tagline', rawTagline || defaultTagline || '');
    }

    const aboutTitle = document.getElementById('aboutTitleHeading');
    if (aboutTitle) {
        if (lang === 'en') {
            aboutTitle.innerHTML = `About <span>${branding.shortName}</span>`;
        } else if (lang === 'ar') {
            aboutTitle.innerHTML = `<span>${branding.shortName}</span> من نحن`;
        } else {
            aboutTitle.innerHTML = `À Propos de <span>${branding.shortName}</span>`;
        }
    }

    const footerCopy = document.getElementById('footerCopyText');
    if (footerCopy) {
        const rights = window.getTranslation(
            'footer_rights',
            lang === 'en'
                ? 'All rights reserved.'
                : lang === 'ar'
                    ? 'جميع الحقوق محفوظة.'
                    : 'Tous droits reserves.'
        );
        footerCopy.textContent = `© ${new Date().getFullYear()} ${branding.shortName} - ${rights}`;
    }

    const galleryTag = document.getElementById('galleryTaglineText');
    if (galleryTag) {
        if (lang === 'en') {
            galleryTag.textContent = `${branding.shortName} Moments`;
        } else if (lang === 'ar') {
            galleryTag.textContent = `لحظات ${branding.shortName}`;
        } else {
            galleryTag.textContent = `Moments ${branding.shortName}`;
        }
    }

    document.querySelectorAll('.featured-header-label').forEach((element) => {
        if (lang === 'en') {
            element.textContent = `${branding.shortName} Selection`;
        } else if (lang === 'ar') {
            element.textContent = `مختارات ${branding.shortName}`;
        } else {
            element.textContent = `Sélection ${branding.shortName}`;
        }
    });

    const heroImageIds = ['landingHeroImage', 'menuHeroImage'];
    heroImageIds.forEach((id) => {
        const image = document.getElementById(id);
        if (image && branding.heroImage) {
            window.setSafeImageSource(image, displayHeroImage, {
                fallbackSrc: window.defaultBranding.heroImage,
                onMissing: () => {
                    image.style.display = '';
                }
            });
            window.bindPublicMediaPreview(image, () => [{
                name: branding.restaurantName || branding.shortName || 'Restaurant',
                img: branding.heroImage,
                images: [branding.heroImage]
            }]);
        }
    });

    const presetConfig = window.getBrandPresetConfig(branding.presetId);
    const homepageHeroImages = normalizeHeroSlideList(
        displayHeroSlides,
        presetConfig.heroSlides,
        displayHeroImage
    );

    homepageHeroImages.forEach((src, index) => {
        const image = document.getElementById(`heroSlideImage${index + 1}`);
        if (!image) return;
        window.setSafeImageSource(image, src, {
            fallbackSrc: window.defaultBranding.heroImage,
            onMissing: () => {
                image.style.display = '';
            },
            displayValue: 'block'
        });
    });

    const logoImage = document.getElementById('landingLogoImage');
    const logoFallback = document.getElementById('landingLogoFallback');
    const logoPreviewFactory = branding.logoImage
        ? () => [{
            name: `${branding.shortName || branding.restaurantName || 'Restaurant'} Logo`,
            img: branding.logoImage,
            images: [branding.logoImage]
        }]
        : null;
    if (logoImage) {
        if (branding.logoImage) {
            logoImage.alt = `${branding.shortName} Logo`;
            window.setSafeImageSource(logoImage, branding.logoImage, {
                onMissing: () => {
                    logoImage.removeAttribute('src');
                    logoImage.style.display = 'none';
                    if (logoFallback) {
                        logoFallback.textContent = window.getRestaurantInitials();
                        logoFallback.style.display = 'flex';
                        window.bindPublicMediaPreview(logoFallback, null);
                    }
                },
                displayValue: 'block'
            });
            window.bindPublicMediaPreview(logoImage, logoPreviewFactory);
            if (logoFallback) {
                logoFallback.style.display = 'none';
                window.bindPublicMediaPreview(logoFallback, logoPreviewFactory);
            }
        } else {
            logoImage.removeAttribute('src');
            logoImage.style.display = 'none';
            window.bindPublicMediaPreview(logoImage, null);
            if (logoFallback) {
                logoFallback.textContent = window.getRestaurantInitials();
                logoFallback.style.display = 'flex';
                window.bindPublicMediaPreview(logoFallback, null);
            }
        }
    }

    const adminLabels = {
        adminLoginTitleText: `${branding.logoMark} ${branding.shortName} Admin`,
        adminSidebarTitleText: `${branding.logoMark} ${branding.shortName} Admin`,
        mobileAdminTitleText: `${branding.logoMark} ${branding.shortName} Admin`
    };
    Object.entries(adminLabels).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    const adminLoginSubtitle = document.getElementById('adminLoginSubtitleText');
    if (adminLoginSubtitle) {
        if (lang === 'en') {
            adminLoginSubtitle.textContent = `Sign in to manage ${branding.restaurantName}`;
        } else if (lang === 'ar') {
            adminLoginSubtitle.textContent = `سجل الدخول لإدارة ${branding.restaurantName}`;
        } else {
            adminLoginSubtitle.textContent = `Connectez-vous pour gerer ${branding.restaurantName}`;
        }
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        const lang = document.documentElement.lang || 'fr';
        const suffix = lang === 'en'
            ? 'Order online.'
            : lang === 'ar'
                ? 'اطلب عبر الإنترنت.'
                : 'Commandez en ligne.';
        metaDescription.setAttribute('content', `${branding.shortName} – ${branding.tagline}. ${suffix}`);
    }
};

// --- BROWSER USER STATE HELPERS ---
window.browserStateKeys = {
    language: 'restaurant_lang',
    likes: 'restaurant_likes',
    cart: 'restaurant_cart_menu',
    history: 'restaurant_history',
    adminCategoryFilter: 'restaurant_admin_category_filter'
};

window.readBrowserState = function (key, fallbackValue) {
    if (!key) return fallbackValue;
    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue === null ? fallbackValue : rawValue;
    } catch (_error) {
        return fallbackValue;
    }
};

window.writeBrowserState = function (key, value) {
    if (!key) return;
    try {
        window.localStorage.setItem(key, value);
    } catch (_error) {
        // Ignore storage failures so the public site keeps working in restricted browsers.
    }
};

window.readBrowserJsonState = function (key, fallbackValue) {
    const rawValue = window.readBrowserState(key, null);
    if (rawValue === null) return fallbackValue;
    try {
        return JSON.parse(rawValue);
    } catch (_error) {
        return fallbackValue;
    }
};

window.writeBrowserJsonState = function (key, value) {
    window.writeBrowserState(key, JSON.stringify(value));
};

window.getStoredLanguage = function () {
    const lang = window.readBrowserState(window.browserStateKeys.language, 'fr');
    return ['fr', 'en', 'ar'].includes(lang) ? lang : 'fr';
};

window.setStoredLanguage = function (lang) {
    window.writeBrowserState(window.browserStateKeys.language, lang);
};

window.getStoredLikes = function () {
    const likes = window.readBrowserJsonState(window.browserStateKeys.likes, {});
    return likes && typeof likes === 'object' && !Array.isArray(likes) ? likes : {};
};

window.setStoredLikes = function (likes) {
    window.writeBrowserJsonState(window.browserStateKeys.likes, likes && typeof likes === 'object' ? likes : {});
};

window.getStoredCart = function () {
    const cart = window.readBrowserJsonState(window.browserStateKeys.cart, []);
    return Array.isArray(cart) ? cart : [];
};

window.setStoredCart = function (cart) {
    window.writeBrowserJsonState(window.browserStateKeys.cart, Array.isArray(cart) ? cart : []);
};

window.getStoredHistory = function () {
    const history = window.readBrowserJsonState(window.browserStateKeys.history, []);
    return Array.isArray(history) ? history : [];
};

window.setStoredHistory = function (history) {
    window.writeBrowserJsonState(window.browserStateKeys.history, Array.isArray(history) ? history : []);
};

// --- LIKES SYSTEM ---
window.likes = window.getStoredLikes();

window.getLikeCount = function (id) {
    return window.likes[id] || 0;
};

window.toggleLike = function (id) {
    if (!window.likes[id]) window.likes[id] = 0;
    window.likes[id]++;
    window.setStoredLikes(window.likes);
    return window.likes[id];
};

window.translations = {
    fr: {
        status_open: 'Ouvert', status_closed: 'Fermé', status_loading: 'Chargement...',
        nav_home: 'Accueil', nav_menu: 'Menu', nav_about: 'À Propos', nav_events: 'Événements', nav_gallery: 'Galerie',
        nav_contact: 'Contact', nav_hours: 'Horaires', nav_order: 'COMMANDER', nav_directions: 'ITINÉRAIRE',
        hero_sub1: 'Une table pour', hero_title1: 'SAVEURS <span>AUTHENTIQUES</span>', hero_cta: 'VOIR LA CARTE',
        hero_sub2: 'Découvrez nos', hero_title2: 'PLATS <span>SIGNATURE</span>', hero_desc2: 'Des recettes maison pensées pour tous les appétits',
        hero_sub3: 'Cuisine préparée', hero_title3: 'FRAIS <span>CHAQUE JOUR</span>', hero_desc3: 'Sur place, à emporter ou en livraison',
        see_order: 'Voir ma commande',
        about_tag: 'Notre Histoire', about_title: 'À Propos de <span>Notre Table</span>',
        about_tagline: 'Cuisine sincère, service attentionné et identité locale',
        about_p1: "Notre histoire commence avec une idée simple : proposer une table accueillante, lisible et régulière pour les repas du quotidien comme pour les moments à partager.",
        about_p2: 'Nous privilégions des ingrédients frais, une cuisine soignée et une ambiance qui donne envie de revenir avec confiance.',
        about_p3: 'Notre objectif est de devenir une adresse locale fiable, chaleureuse et facile à recommander.',
        about_welcome: 'Au plaisir de vous revoir.', about_thanks: 'Merci,',
        about_years: "Ans d'Expérience", about_items: 'Plats au Menu', about_halal: 'Préparé chaque jour', about_rating: 'Avis Clients',
        events_tag: 'Célébrez avec nous', events_title: 'Événements <span>Privés</span>',
        event_birthday: 'Anniversaires', event_birthday_desc: 'Célébrez votre jour spécial avec un menu personnalisé et une ambiance festive.',
        event_family: 'Réunions Familiales', event_family_desc: 'Un espace chaleureux pour réunir votre famille autour de plats délicieux.',
        event_corporate: 'Événements Corporate', event_corporate_desc: 'Impressionnez vos collègues avec une offre professionnelle et savoureuse.',
        event_party: 'Fêtes Privées', event_party_desc: 'Profitez d’un espace adapté pour une soirée inoubliable avec vos amis.',
        events_cta_text: 'Intéressé par un événement ? Contactez-nous !', events_cta_btn: '📩 Demander un Devis',
        event_reserve: 'Réserver maintenant',
        hours_tag: 'Quand nous visiter', hours_title: "Horaires <span>d'Ouverture</span>",
        day_mon: 'Lundi', day_tue: 'Mardi', day_wed: 'Mercredi', day_thu: 'Jeudi', day_fri: 'Vendredi', day_sat: 'Samedi', day_sun: 'Dimanche',
        hours_note: '🔥 Ouvert tous les jours ! Livraison disponible.',
        pf_payments_title: 'Les Modes De Paiement', pf_facilities_title: 'Facilités',
        pf_payment_cash: 'Espèces', pf_payment_tpe: 'TPE',
        pf_facility_wifi: 'WiFi', pf_facility_accessible: 'Accessible', pf_facility_parking: 'Parking',
        pf_facility_terrace: 'Terrasse', pf_facility_family: 'Espace famille',
        gallery_tag: 'Ambiance & Assiettes', gallery_title: 'Notre <span>Galerie</span>',
        contact_tag: 'Venez Manger', contact_title: 'Contactez-<span>Nous</span>',
        footer_note: 'Cuisine maison, service chaleureux et accueil de proximité.',
        footer_rights: 'Tous droits réservés.',
        contact_address_title: 'Adresse', contact_phone_title: 'Téléphone',
        side_menu: 'MENU', side_wifi: 'CODE WIFI', side_insta: 'INSTAGRAM',
        social_title: 'Suivez-nous',
        side_social: 'SOCIAL',
        social_modal_title: 'Nos réseaux sociaux',
        social_empty: 'Aucun lien configuré.',
        landing_phone_placeholder: 'Numéro bientôt disponible',
        landing_social_placeholder: 'Réseaux bientôt disponibles',
        landing_wifi_placeholder: 'Code WiFi disponible sur place',
        wifi_title: 'WiFi Gratuit', wifi_scan: 'Scannez pour vous connecter',
        wifi_default_name: 'WiFi du restaurant',
        wifi_default_code_help: 'Demandez le mot de passe',
        wifi_connect_title: 'Connexion WiFi',
        wifi_network_label: 'Réseau',
        modal_close: 'FERMER',
        event_booking_subtitle: 'Parlez-nous de votre projet',
        featured_label: 'Sélection Signature',
        featured_best: 'Nos Coups de Coeur ✨',
        gallery_empty: 'De nouvelles photos arrivent bientôt...',
        lightbox_soon: 'Aperçu photo à venir',
        game_title: "Qui paie l'addition ?",
        game_subtitle: 'Jouez pour passer le temps !',
        game_cta: 'JOUER',
        view_menu: 'Voir le Menu',
        menu_select_title: 'Selectionner un menu',
        landing_address_placeholder: 'Adresse du restaurant',
        landing_hours_title: "Horaires d'Ouverture",
        menu_search_placeholder: 'Rechercher un plat...',
        admin_panel_link: 'Espace admin',
        site_title_suffix: 'Commandez en ligne',
        promo_badge: 'PROMO DU JOUR', promo_add: 'AJOUTER AU PANIER',
        ingredients_label: 'Ingrédients', add_to_cart: 'AJOUTER AU PANIER',
        ticket_title: 'VOTRE TICKET', ticket_subtitle: 'Merci de votre confiance!',
        ticket_order_no: 'Commande N°', ticket_date: 'Date', ticket_total: 'TOTAL',
        ticket_service: 'Mode', ticket_client: 'Client', ticket_addr: 'Adresse',
        ticket_footer: 'Veuillez présenter ce ticket à la caisse.',
        social_instagram: 'Instagram', social_facebook: 'Facebook', social_tiktok: 'TikTok', social_tripadvisor: 'TripAdvisor', social_whatsapp: 'WhatsApp',
        history_button_title: 'Historique', history_title: 'Historique', history_empty: 'Aucune commande récente.', history_delete_title: 'Supprimer', history_delete_confirm: 'Supprimer ce ticket de l\'historique ?',
        landing_map_title: 'Voir sur la carte', landing_call_title: 'Appeler', landing_social_title: 'Nos réseaux sociaux', landing_wifi_title: 'Code WiFi', landing_reviews_title: 'Avis Google', landing_home_title: 'Accueil',
        game_rule_1: 'Attendez votre tour puis ouvrez une case.', game_rule_2: 'Essayez d\'éviter le signe X.', game_rule_3: 'Si vous trouvez le X, vous payez l\'addition.',
        game_players_label: 'Nombre de joueurs', game_start_button: 'COMMENCER', game_board_subtitle: 'Celui qui trouve le X paie l\'addition !', game_loss_text: 'Joueur {player}, vous avez trouvé le signe X.', game_loss_title: 'Payez l\'addition !',
        promo_empty: '🔥 Découvrez nos promos du jour bientôt !', promo_offer_badge: 'OFFRE', promo_small_badge: 'PROMO', promo_add_short: 'AJOUTER',
        price_from: 'À partir de', dish_promo_suffix: ' (PROMO)', dish_default_desc: 'Une préparation soignée avec les meilleurs ingrédients.',
        cart_clear: 'Vider', cart_clear_confirm: 'Vider le panier ?', cart_items_count: '{count} article(s)', cart_delivery_label: '📍 Adresse de livraison', cart_delivery_placeholder: 'Ex : Appartement 12, résidence, quartier...', cart_total_label: 'Total', cart_confirm_order: 'CONFIRMER MA COMMANDE',
        service_onsite: 'Sur place', service_takeaway: 'À emporter', service_delivery: 'Livraison',
        ticket_delivery_required: 'Veuillez saisir votre adresse de livraison.', ticket_number_prefix: 'TICKET', ticket_type_label: 'Type', ticket_total_prefix: 'TOTAL :', ticket_edit: 'MODIFIER', ticket_order: 'COMMANDER', ticket_validate: 'VALIDER LA COMMANDE', ticket_helper: 'Cliquez pour enregistrer et montrer au serveur', ticket_saved: 'COMMANDE ENREGISTRÉE ✔', ticket_saved_help: 'Ticket validé ! Cliquez pour fermer.',
        confirm_back: '← Retour', confirm_cart_label: 'Votre panier', confirm_complement_title: 'Complétez votre commande', confirm_service_prompt: 'Choisissez le type de service :', confirm_name_placeholder: 'Votre nom...', confirm_address_placeholder: 'Adresse de livraison...', confirm_phone_placeholder: 'Numéro de téléphone...', confirm_whatsapp: 'Confirmer sur WhatsApp', confirm_add_items: '🛒 Ajoutez des articles !',
        contact_whatsapp_title: 'WhatsApp', wifi_ssid_label: 'SSID', wifi_password_label: 'Mot de passe', wifi_password_copied: 'Mot de passe copié !',
        toast_item_added: '✅ {item} ajouté !', event_booking_name_label: 'Votre nom', event_booking_phone_label: 'Téléphone', event_booking_name_placeholder: 'Ex : Ahmed Alaoui', event_booking_phone_placeholder: 'Ex : 0612345678', event_booking_submit: '📩 Envoyer sur WhatsApp', event_booking_name_required: 'Veuillez entrer votre nom.', event_booking_phone_required: 'Veuillez entrer votre numéro de téléphone.', event_booking_title_prefix: 'Réserver : {type}',
        wa_new_order_title: 'NOUVELLE COMMANDE – {restaurant}', wa_service_label: 'Service', wa_client_label: 'Client', wa_phone_label: 'Tél', wa_order_label: 'COMMANDE', wa_total_label: 'TOTAL', wa_thanks: 'Merci chez *{restaurant}*!', wa_event_title: 'RÉSERVATION ÉVÉNEMENT – {restaurant}', wa_contact_confirm: 'Merci de me contacter pour confirmer les détails !',
    },
    en: {
        status_open: 'Open', status_closed: 'Closed', status_loading: 'Loading...',
        nav_home: 'Home', nav_menu: 'Menu', nav_about: 'About Us', nav_events: 'Events', nav_gallery: 'Gallery',
        nav_contact: 'Contact Us', nav_hours: 'Hours', nav_order: 'ORDER ONLINE', nav_directions: 'GET DIRECTIONS',
        hero_sub1: 'A table for', hero_title1: 'AUTHENTIC <span>FLAVOR</span>', hero_cta: 'VIEW MENU',
        hero_sub2: 'Discover our', hero_title2: 'SIGNATURE <span>DISHES</span>', hero_desc2: 'House-made recipes for every appetite',
        hero_sub3: 'Prepared', hero_title3: 'FRESH <span>DAILY</span>', hero_desc3: 'Dine in, takeaway, or delivery',
        see_order: 'See my order',
        about_tag: 'Our Story', about_title: 'About <span>Our Place</span>',
        about_tagline: 'Honest food, thoughtful service, and a clear local identity',
        about_p1: 'Our story starts with one simple idea: build a welcoming address people can trust for everyday meals and shared moments.',
        about_p2: 'We focus on fresh ingredients, careful preparation, and a comfortable atmosphere that makes guests want to return.',
        about_p3: 'Our goal is to become a reliable local favorite with food that feels generous, polished, and easy to recommend.',
        about_welcome: 'We look forward to welcoming you again.', about_thanks: 'Thank you,',
        about_years: 'Years Experience', about_items: 'Menu Items', about_halal: 'Prepared Daily', about_rating: 'Customer Reviews',
        events_tag: 'Celebrate with us', events_title: 'Private <span>Events</span>',
        event_birthday: 'Birthdays', event_birthday_desc: 'Celebrate your special day with a custom menu and festive ambiance.',
        event_family: 'Family Gatherings', event_family_desc: 'A warm space to bring your family together around delicious dishes.',
        event_corporate: 'Corporate Events', event_corporate_desc: 'Impress your colleagues with professional and tasty catering.',
        event_party: 'Private Parties', event_party_desc: 'Rent our space for an unforgettable evening with friends.',
        events_cta_text: 'Interested in an event? Contact us!', events_cta_btn: '📩 Request a Quote',
        event_reserve: 'Book Now',
        hours_tag: 'When to visit', hours_title: 'Opening <span>Hours</span>',
        day_mon: 'Monday', day_tue: 'Tuesday', day_wed: 'Wednesday', day_thu: 'Thursday', day_fri: 'Friday', day_sat: 'Saturday', day_sun: 'Sunday',
        hours_note: '🔥 Open every day! Delivery available.',
        pf_payments_title: 'Payment Methods', pf_facilities_title: 'Facilities',
        pf_payment_cash: 'Cash', pf_payment_tpe: 'Card / TPE',
        pf_facility_wifi: 'WiFi', pf_facility_accessible: 'Accessible', pf_facility_parking: 'Parking',
        pf_facility_terrace: 'Terrace', pf_facility_family: 'Family space',
        gallery_tag: 'Atmosphere & Plates', gallery_title: 'Our <span>Gallery</span>',
        contact_tag: 'Come eat', contact_title: 'Contact <span>Us</span>',
        footer_note: 'House-made cuisine, warm service, and a welcoming local address.',
        footer_rights: 'All rights reserved.',
        contact_address_title: 'Address', contact_phone_title: 'Phone',
        side_menu: 'MENU', side_wifi: 'WIFI CODE', side_insta: 'INSTAGRAM',
        social_title: 'Follow Us',
        side_social: 'SOCIAL',
        social_modal_title: 'Our social media',
        social_empty: 'No links configured yet.',
        landing_phone_placeholder: 'Phone coming soon',
        landing_social_placeholder: 'Social links coming soon',
        landing_wifi_placeholder: 'WiFi code available on site',
        wifi_title: 'Free WiFi', wifi_scan: 'Scan to connect',
        wifi_default_name: 'Restaurant WiFi',
        wifi_default_code_help: 'Ask the team',
        wifi_connect_title: 'Connect to WiFi',
        wifi_network_label: 'Network',
        modal_close: 'CLOSE',
        "event_booking_subtitle": "Share your details with us",
        "featured_label": "Signature Selection",
        "featured_best": "Our Favorites ✨",
        gallery_empty: 'New photos coming soon...',
        lightbox_soon: 'Photo preview coming soon',
        game_title: 'Who pays the bill?',
        game_subtitle: 'Play while you wait!',
        game_cta: 'PLAY',
        view_menu: 'View Menu',
        menu_select_title: 'Select a Menu',
        landing_address_placeholder: 'Restaurant address',
        landing_hours_title: 'Opening Hours',
        menu_search_placeholder: 'Search for a dish...',
        admin_panel_link: 'Admin Panel',
        site_title_suffix: 'Order online',
        promo_badge: 'PROMO OF THE DAY', promo_add: 'ADD TO CART',
        ingredients_label: 'Ingredients', add_to_cart: 'ADD TO CART',
        ticket_title: 'YOUR TICKET', ticket_subtitle: 'Thank you for your order!',
        ticket_order_no: 'Order No', ticket_date: 'Date', ticket_total: 'TOTAL',
        ticket_service: 'Mode', ticket_client: 'Client', ticket_addr: 'Address',
        ticket_footer: 'Please show this ticket at the counter.',
        social_instagram: 'Instagram', social_facebook: 'Facebook', social_tiktok: 'TikTok', social_tripadvisor: 'TripAdvisor', social_whatsapp: 'WhatsApp',
        history_button_title: 'History', history_title: 'History', history_empty: 'No recent orders.', history_delete_title: 'Delete', history_delete_confirm: 'Delete this ticket from history?',
        landing_map_title: 'View on map', landing_call_title: 'Call', landing_social_title: 'Our social media', landing_wifi_title: 'WiFi code', landing_reviews_title: 'Google Reviews', landing_home_title: 'Home',
        game_rule_1: 'Wait for your turn and open a box.', game_rule_2: 'Try to avoid finding the X sign.', game_rule_3: 'If you find the X, pay the check.',
        game_players_label: 'Number of Players', game_start_button: 'START GAME', game_board_subtitle: 'The one who finds the X pays the check!', game_loss_text: 'Player {player}, you found the X sign.', game_loss_title: 'Pay the check!',
        promo_empty: '🔥 Discover our daily promos soon!', promo_offer_badge: 'OFFER', promo_small_badge: 'PROMO', promo_add_short: 'ADD',
        price_from: 'From', dish_promo_suffix: ' (PROMO)', dish_default_desc: 'A carefully prepared dish made with our best ingredients.',
        cart_clear: 'Clear', cart_clear_confirm: 'Clear the cart?', cart_items_count: '{count} item(s)', cart_delivery_label: '📍 Delivery address', cart_delivery_placeholder: 'Ex: Apartment 12, residence, neighborhood...', cart_total_label: 'Total', cart_confirm_order: 'CONFIRM MY ORDER',
        service_onsite: 'On site', service_takeaway: 'Take away', service_delivery: 'Delivery',
        ticket_delivery_required: 'Please enter your delivery address.', ticket_number_prefix: 'TICKET', ticket_type_label: 'Type', ticket_total_prefix: 'TOTAL:', ticket_edit: 'EDIT', ticket_order: 'ORDER', ticket_validate: 'VALIDATE ORDER', ticket_helper: 'Click to save and show it to the server', ticket_saved: 'ORDER SAVED ✔', ticket_saved_help: 'Ticket saved. Click to close.',
        confirm_back: '← Back', confirm_cart_label: 'Your cart', confirm_complement_title: 'Complement your order', confirm_service_prompt: 'Select the type of service:', confirm_name_placeholder: 'Your name...', confirm_address_placeholder: 'Delivery address...', confirm_phone_placeholder: 'Phone number...', confirm_whatsapp: 'Confirm on WhatsApp', confirm_add_items: '🛒 Add some items first!',
        contact_whatsapp_title: 'WhatsApp', wifi_ssid_label: 'SSID', wifi_password_label: 'Password', wifi_password_copied: 'Password copied!',
        toast_item_added: '✅ {item} added!', event_booking_name_label: 'Your name', event_booking_phone_label: 'Phone', event_booking_name_placeholder: 'Ex: Ahmed Alaoui', event_booking_phone_placeholder: 'Ex: 0612345678', event_booking_submit: '📩 Send on WhatsApp', event_booking_name_required: 'Please enter your name.', event_booking_phone_required: 'Please enter your phone number.', event_booking_title_prefix: 'Book: {type}',
        wa_new_order_title: 'NEW ORDER – {restaurant}', wa_service_label: 'Service', wa_client_label: 'Client', wa_phone_label: 'Phone', wa_order_label: 'ORDER', wa_total_label: 'TOTAL', wa_thanks: 'Thank you at *{restaurant}*!', wa_event_title: 'EVENT BOOKING – {restaurant}', wa_contact_confirm: 'Please contact me to confirm the details!',
    },
    ar: {
        status_open: 'مفتوح', status_closed: 'مغلق', status_loading: 'جاري التحميل...',
        nav_home: 'الرئيسية', nav_menu: 'القائمة', nav_about: 'من نحن', nav_events: 'الفعاليات', nav_gallery: 'المعرض',
        nav_contact: 'اتصل بنا', nav_hours: 'أوقات العمل', nav_order: 'اطلب الآن', nav_directions: 'الاتجاهات',
        hero_sub1: 'تجربة من', hero_title1: 'نكهات <span>أصيلة</span>', hero_cta: 'عرض القائمة',
        hero_sub2: 'اكتشف', hero_title2: 'أطباقنا <span>المميزة</span>', hero_desc2: 'وصفات منزلية تناسب كل الأذواق',
        hero_sub3: 'مطهو', hero_title3: 'طازج <span>كل يوم</span>', hero_desc3: 'داخل المطعم أو سفري أو توصيل',
        see_order: 'عرض طلبي',
        about_tag: 'قصتنا', about_title: 'عن <span>مطعمنا</span>',
        about_tagline: 'أكل صادق وخدمة مدروسة وهوية محلية واضحة',
        about_p1: 'تبدأ قصتنا بفكرة بسيطة: تقديم عنوان مريح وموثوق للوجبات اليومية واللحظات التي تستحق المشاركة.',
        about_p2: 'نركز على المكونات الطازجة والتحضير المتقن وأجواء تجعل الضيف يرغب في العودة بثقة.',
        about_p3: 'هدفنا أن نصبح عنواناً محلياً موثوقاً يجمع بين الكرم والتنظيم وسهولة التوصية به.',
        about_welcome: 'يسعدنا أن نرحب بكم مرة أخرى.', about_thanks: 'شكراً لكم،',
        about_years: 'سنة خبرة', about_items: 'طبق في القائمة', about_halal: 'محضر يومياً', about_rating: 'آراء الزبائن',
        events_tag: 'احتفل معنا', events_title: 'فعاليات <span>خاصة</span>',
        event_birthday: 'أعياد الميلاد', event_birthday_desc: 'احتفل بيومك الخاص مع قائمة مخصصة وأجواء احتفالية.',
        event_family: 'لقاءات عائلية', event_family_desc: 'مساحة دافئة لجمع عائلتك حول أطباق لذيذة.',
        event_corporate: 'فعاليات الشركات', event_corporate_desc: 'أبهر زملاءك بتقديم طعام احترافي ولذيذ.',
        event_party: 'حفلات خاصة', event_party_desc: 'استأجر مساحتنا لسهرة لا تُنسى مع أصدقائك.',
        events_cta_text: 'مهتم بفعالية؟ تواصل معنا!', events_cta_btn: '📩 اطلب عرض سعر',
        event_reserve: 'احجز الآن',
        hours_tag: 'متى تزورنا', hours_title: 'أوقات <span>العمل</span>',
        day_mon: 'الاثنين', day_tue: 'الثلاثاء', day_wed: 'الأربعاء', day_thu: 'الخميس', day_fri: 'الجمعة', day_sat: 'السبت', day_sun: 'الأحد',
        hours_note: '🔥 مفتوح كل يوم! التوصيل متاح.',
        pf_payments_title: 'طرق الدفع', pf_facilities_title: 'الخدمات',
        pf_payment_cash: 'نقداً', pf_payment_tpe: 'جهاز الأداء الإلكتروني',
        pf_facility_wifi: 'واي فاي', pf_facility_accessible: 'ولوج سهل', pf_facility_parking: 'موقف سيارات',
        pf_facility_terrace: 'تراس', pf_facility_family: 'فضاء عائلي',
        gallery_tag: 'الأجواء والأطباق', gallery_title: '<span>معرضنا</span>',
        contact_tag: 'تعال كُل', contact_title: 'اتصل <span>بنا</span>',
        footer_note: 'مأكولات منزلية وخدمة دافئة واستقبال يليق بالضيوف.',
        footer_rights: 'جميع الحقوق محفوظة.',
        contact_address_title: 'العنوان', contact_phone_title: 'الهاتف',
        side_menu: 'القائمة', side_wifi: 'كود الواي فاي', side_insta: 'إنستغرام',
        social_title: 'تابعنا',
        side_social: 'تواصل',
        social_modal_title: 'حساباتنا الاجتماعية',
        social_empty: 'لا توجد روابط مفعلة بعد.',
        landing_phone_placeholder: 'رقم الهاتف سيتوفر قريباً',
        landing_social_placeholder: 'روابط التواصل ستتوفر قريباً',
        landing_wifi_placeholder: 'رمز الواي فاي متوفر داخل المطعم',
        wifi_title: 'واي فاي مجاني', wifi_scan: 'امسح الرمز للاتصال',
        wifi_default_name: 'واي فاي المطعم',
        wifi_default_code_help: 'اطلب كلمة المرور',
        wifi_connect_title: 'الاتصال بالواي فاي',
        wifi_network_label: 'الشبكة',
        modal_close: 'إغلاق',
        "event_booking_subtitle": "شاركنا تفاصيلك",
        "featured_label": "مختارات مميزة",
        "featured_best": "أفضل أطباقنا ✨",
        gallery_empty: 'صور جديدة قريباً...',
        lightbox_soon: 'معاينة الصور قريباً',
        game_title: 'من سيدفع الفاتورة؟',
        game_subtitle: 'العب ريثما تنتظر!',
        game_cta: 'العب',
        view_menu: 'عرض القائمة',
        menu_select_title: 'اختر قائمة',
        landing_address_placeholder: 'عنوان المطعم',
        landing_hours_title: 'ساعات العمل',
        menu_search_placeholder: 'ابحث عن طبق...',
        admin_panel_link: 'لوحة الإدارة',
        site_title_suffix: 'اطلب عبر الإنترنت',
        promo_badge: 'عرض اليوم', promo_add: 'أضف إلى السلة',
        ingredients_label: 'المكونات', add_to_cart: 'أضف إلى السلة',
        ticket_title: 'تذكرتك', ticket_subtitle: 'شكراً لثقتكم!',
        ticket_order_no: 'طلب رقم', ticket_date: 'التاريخ', ticket_total: 'المجموع',
        ticket_service: 'الخدمة', ticket_client: 'الزبون', ticket_addr: 'العنوان',
        ticket_footer: 'يرجى تقديم هذه التذكرة عند الكاشير.',
        social_instagram: 'Instagram', social_facebook: 'Facebook', social_tiktok: 'TikTok', social_tripadvisor: 'TripAdvisor', social_whatsapp: 'WhatsApp',
        history_button_title: 'السجل', history_title: 'السجل', history_empty: 'لا توجد طلبات أخيرة.', history_delete_title: 'حذف', history_delete_confirm: 'هل تريد حذف هذه التذكرة من السجل؟',
        landing_map_title: 'عرض على الخريطة', landing_call_title: 'اتصال', landing_social_title: 'حساباتنا الاجتماعية', landing_wifi_title: 'رمز الواي فاي', landing_reviews_title: 'تقييمات جوجل', landing_home_title: 'الرئيسية',
        game_rule_1: 'انتظر دورك ثم افتح صندوقاً.', game_rule_2: 'حاول تجنب اكتشاف علامة X.', game_rule_3: 'إذا وجدت علامة X فأنت من سيدفع الفاتورة.',
        game_players_label: 'عدد اللاعبين', game_start_button: 'ابدأ اللعبة', game_board_subtitle: 'من يجد علامة X هو من سيدفع الفاتورة!', game_loss_text: 'اللاعب {player}، لقد وجدت علامة X.', game_loss_title: 'ادفع الفاتورة!',
        promo_empty: '🔥 اكتشف عروضنا اليومية قريباً!', promo_offer_badge: 'عرض', promo_small_badge: 'برومو', promo_add_short: 'أضف',
        price_from: 'يبدأ من', dish_promo_suffix: ' (برومو)', dish_default_desc: 'تحضير متقن بأفضل المكونات.',
        cart_clear: 'إفراغ', cart_clear_confirm: 'هل تريد إفراغ السلة؟', cart_items_count: '{count} عنصر', cart_delivery_label: '📍 عنوان التوصيل', cart_delivery_placeholder: 'مثال: شقة 12، إقامة، حي...', cart_total_label: 'المجموع', cart_confirm_order: 'تأكيد طلبي',
        service_onsite: 'داخل المطعم', service_takeaway: 'سفري', service_delivery: 'توصيل',
        ticket_delivery_required: 'يرجى إدخال عنوان التوصيل.', ticket_number_prefix: 'تذكرة', ticket_type_label: 'النوع', ticket_total_prefix: 'المجموع:', ticket_edit: 'تعديل', ticket_order: 'اطلب', ticket_validate: 'تأكيد الطلب', ticket_helper: 'اضغط للحفظ وإظهاره إلى النادل', ticket_saved: 'تم حفظ الطلب ✔', ticket_saved_help: 'تم تأكيد التذكرة. اضغط للإغلاق.',
        confirm_back: '← رجوع', confirm_cart_label: 'سلتك', confirm_complement_title: 'أكمل طلبك', confirm_service_prompt: 'اختر نوع الخدمة:', confirm_name_placeholder: 'اسمك...', confirm_address_placeholder: 'عنوان التوصيل...', confirm_phone_placeholder: 'رقم الهاتف...', confirm_whatsapp: 'أكد عبر واتساب', confirm_add_items: '🛒 أضف بعض الأطباق أولاً!',
        contact_whatsapp_title: 'WhatsApp', wifi_ssid_label: 'SSID', wifi_password_label: 'كلمة المرور', wifi_password_copied: 'تم نسخ كلمة المرور!',
        toast_item_added: '✅ تمت إضافة {item}!', event_booking_name_label: 'اسمك', event_booking_phone_label: 'الهاتف', event_booking_name_placeholder: 'مثال: Ahmed Alaoui', event_booking_phone_placeholder: 'مثال: 0612345678', event_booking_submit: '📩 أرسل عبر واتساب', event_booking_name_required: 'يرجى إدخال الاسم.', event_booking_phone_required: 'يرجى إدخال رقم الهاتف.', event_booking_title_prefix: 'احجز: {type}',
        wa_new_order_title: 'طلب جديد – {restaurant}', wa_service_label: 'الخدمة', wa_client_label: 'الزبون', wa_phone_label: 'الهاتف', wa_order_label: 'الطلب', wa_total_label: 'المجموع', wa_thanks: 'شكراً لديكم من *{restaurant}*!', wa_event_title: 'حجز فعالية – {restaurant}', wa_contact_confirm: 'يرجى التواصل معي لتأكيد التفاصيل!',
    }
};

// --- PROMO & DISCOUNT HELPERS ---
window.getPromoIds = function () {
    // Priority 1: Use window.promoIds if set (usually by menu.js or admin.js sync)
    if (window.promoIds && Array.isArray(window.promoIds) && window.promoIds.length > 0) {
        return window.promoIds;
    }
    return [];
};

window.isItemInPromo = function (id) {
    return window.getPromoIds().includes(Number(id));
};

window.getItemPrice = function (item, sizeKey) {
    let basePrice = item.price;

    if (item.hasSizes && item.sizes) {
        if (sizeKey && item.sizes[sizeKey.toLowerCase()]) {
            basePrice = item.sizes[sizeKey.toLowerCase()];
        } else {
            // Default to small or the logic-defined price if no size specified
            basePrice = item.sizes.small || item.sizes.medium || item.sizes.large || item.price;
        }
    }

    if (window.isItemInPromo(item.id)) {
        return basePrice * 0.8; // 20% Discount
    }
    return basePrice;
};

window.currentLang = 'fr';

window.setLang = function (lang, btn) {
    window.currentLang = lang;

    // Update Dropdown Display
    const displayEl = document.getElementById('currentLangDisplay');
    if (displayEl) {
        const labels = { 'fr': 'FR', 'en': 'EN', 'ar': 'AR' };
        displayEl.textContent = labels[lang] || lang.toUpperCase();
    }

    // Close dropdown
    const opts = document.getElementById('langOptions');
    if (opts) opts.classList.remove('open');

    // Update active state for buttons if they exist
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active-lang'));
    if (btn) btn.classList.add('active-lang');

    const dict = window.getLocaleDictionary(lang);
    if (!dict) return;

    // Set RTL for Arabic
    const html = document.getElementById('htmlRoot') || document.documentElement;
    if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
    } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', lang);
    }

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (dict[key].includes('<span>')) {
                el.innerHTML = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key]) {
            el.setAttribute('title', dict[key]);
        }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria-label');
        if (dict[key]) {
            el.setAttribute('aria-label', dict[key]);
        }
    });

    // Update status based on language
    window.updateStatus();
    window.applyBranding();

    // Save preference
    window.setStoredLanguage(lang);
};

window.updateStatus = function () {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    let isOpen = false;
    if (day >= 1 && day <= 4) {
        if (hour >= 11 && hour < 23) isOpen = true;
    } else if (day === 5 || day === 6) {
        if (hour >= 11 && hour <= 23) isOpen = true;
    } else if (day === 0) {
        if (hour >= 12 && hour < 23) isOpen = true;
    }

    const badge = document.getElementById('statusBadge');
    if (!badge) return isOpen;
    badge.className = 'status-badge ' + (isOpen ? 'status-open' : 'status-closed');
    const textEl = document.getElementById('statusText');
    if (textEl) {
        textEl.setAttribute('data-i18n', isOpen ? 'status_open' : 'status_closed');
        textEl.textContent = isOpen ? 'Ouvert' : 'Fermé';
    }
    if (textEl) {
        const dict = window.translations?.[window.currentLang] || {};
        textEl.textContent = isOpen
            ? (dict.status_open || 'Ouvert')
            : (dict.status_closed || 'Ferme');
    }

    return isOpen;
};

window.showToast = function (text) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = text;
    document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 50);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2000);
};

// Default Opening Hours
window.defaultHours = [
    { day: 'Lundi', i18n: 'day_mon', open: '11:00', close: '23:00', highlight: false },
    { day: 'Mardi', i18n: 'day_tue', open: '11:00', close: '23:00', highlight: false },
    { day: 'Mercredi', i18n: 'day_wed', open: '11:00', close: '23:00', highlight: false },
    { day: 'Jeudi', i18n: 'day_thu', open: '11:00', close: '23:00', highlight: false },
    { day: 'Vendredi', i18n: 'day_fri', open: '11:00', close: '00:00', highlight: false },
    { day: 'Samedi', i18n: 'day_sat', open: '11:00', close: '00:00', highlight: true },
    { day: 'Dimanche', i18n: 'day_sun', open: '12:00', close: '23:00', highlight: true }
];
window.defaultHoursNote = '🔥 Ouvert tous les jours ! Livraison disponible.';

document.addEventListener('DOMContentLoaded', () => {
    window.applyBranding();
});
