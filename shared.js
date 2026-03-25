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
    menu: [
        {
            id: 1001,
            cat: "Entrées",
            name: "Soupe du chef",
            desc: "Velouté du jour servi avec pain maison.",
            price: 28,
            img: "images/menu-lib-starters.svg",
            images: ["images/menu-lib-starters.svg"],
            ingredients: ["Légumes du jour", "Crème légère", "Pain maison"],
            translations: {
                fr: { name: "Soupe du chef", desc: "Velouté du jour servi avec pain maison." },
                en: { name: "Chef's Soup", desc: "Soup of the day served with house bread." },
                ar: { name: "حساء الشيف", desc: "حساء اليوم يقدم مع خبز المنزل." }
            }
        },
        {
            id: 1002,
            cat: "Entrées",
            name: "Salade du marché",
            desc: "Mesclun, légumes croquants, graines et vinaigrette citron.",
            price: 36,
            img: "images/menu-lib-starters.svg",
            images: ["images/menu-lib-starters.svg"],
            ingredients: ["Salade verte", "Légumes croquants", "Graines", "Vinaigrette citron"],
            translations: {
                fr: { name: "Salade du marché", desc: "Mesclun, légumes croquants, graines et vinaigrette citron." },
                en: { name: "Market Salad", desc: "Seasonal greens, crunchy vegetables, seeds, and lemon dressing." },
                ar: { name: "سلطة السوق", desc: "خضار موسمية مع خضار مقرمشة وبذور وصلصة الليمون." }
            }
        },
        {
            id: 1003,
            cat: "Entrées",
            name: "Burrata des jardins",
            desc: "Tomates confites, herbes fraîches et huile d'olive.",
            price: 48,
            img: "images/menu-lib-starters.svg",
            images: ["images/menu-lib-starters.svg"],
            ingredients: ["Burrata", "Tomates confites", "Herbes fraîches", "Huile d'olive"],
            translations: {
                fr: { name: "Burrata des jardins", desc: "Tomates confites, herbes fraîches et huile d'olive." },
                en: { name: "Garden Burrata", desc: "Confit tomatoes, fresh herbs, and olive oil." },
                ar: { name: "بوراتا الحديقة", desc: "طماطم كونفيه مع أعشاب طازجة وزيت الزيتون." }
            }
        },
        {
            id: 1004,
            cat: "Plats",
            name: "Poulet rôti maison",
            desc: "Servi avec pommes grenailles et sauce au jus.",
            price: 78,
            featured: true,
            img: "images/menu-lib-grill.svg",
            images: ["images/menu-lib-grill.svg"],
            ingredients: ["Poulet rôti", "Pommes grenailles", "Sauce maison"],
            translations: {
                fr: { name: "Poulet rôti maison", desc: "Servi avec pommes grenailles et sauce au jus." },
                en: { name: "House Roasted Chicken", desc: "Served with baby potatoes and pan sauce." },
                ar: { name: "دجاج مشوي منزلي", desc: "يقدم مع بطاطس صغيرة وصلصة الطهي." }
            }
        },
        {
            id: 1005,
            cat: "Plats",
            name: "Filet de poisson citronné",
            desc: "Poisson du jour, légumes sautés et citron rôti.",
            price: 84,
            featured: true,
            img: "images/menu-lib-seafood.svg",
            images: ["images/menu-lib-seafood.svg"],
            ingredients: ["Poisson du jour", "Légumes sautés", "Citron rôti"],
            translations: {
                fr: { name: "Filet de poisson citronné", desc: "Poisson du jour, légumes sautés et citron rôti." },
                en: { name: "Lemon Fish Fillet", desc: "Catch of the day, sautéed vegetables, and roasted lemon." },
                ar: { name: "فيليه سمك بالليمون", desc: "سمك اليوم مع خضار سوتيه وليمون مشوي." }
            }
        },
        {
            id: 1006,
            cat: "Plats",
            name: "Pâtes crémeuses aux champignons",
            desc: "Sauce onctueuse, champignons rôtis et parmesan.",
            price: 62,
            img: "images/menu-lib-mains.svg",
            images: ["images/menu-lib-mains.svg"],
            ingredients: ["Pâtes fraîches", "Champignons rôtis", "Parmesan"],
            translations: {
                fr: { name: "Pâtes crémeuses aux champignons", desc: "Sauce onctueuse, champignons rôtis et parmesan." },
                en: { name: "Creamy Mushroom Pasta", desc: "Velvety sauce, roasted mushrooms, and parmesan." },
                ar: { name: "باستا كريمية بالفطر", desc: "صلصة كريمية مع فطر مشوي وجبن بارميزان." }
            }
        },
        {
            id: 1007,
            cat: "Signatures",
            name: "Club sandwich poulet",
            desc: "Poulet grillé, laitue, tomate et sauce maison.",
            price: 48,
            featured: true,
            img: "images/menu-lib-sandwich.svg",
            images: ["images/menu-lib-sandwich.svg"],
            ingredients: ["Poulet grillé", "Laitue", "Tomate", "Sauce maison"],
            translations: {
                fr: { name: "Club sandwich poulet", desc: "Poulet grillé, laitue, tomate et sauce maison." },
                en: { name: "Chicken Club Sandwich", desc: "Grilled chicken, lettuce, tomato, and house sauce." },
                ar: { name: "كلوب ساندويتش بالدجاج", desc: "دجاج مشوي وخس وطماطم وصلصة خاصة." }
            }
        },
        {
            id: 1008,
            cat: "Signatures",
            name: "Assiette signature",
            desc: "Recette de la maison, garniture du moment et sauce signature.",
            price: 58,
            featured: true,
            img: "images/menu-lib-mains.svg",
            images: ["images/menu-lib-mains.svg"],
            ingredients: ["Recette maison", "Garniture du moment", "Sauce signature"],
            translations: {
                fr: { name: "Assiette signature", desc: "Recette de la maison, garniture du moment et sauce signature." },
                en: { name: "Signature Plate", desc: "House recipe, seasonal garnish, and signature sauce." },
                ar: { name: "طبق سيغنتشر", desc: "وصفة من المطعم مع مرافقة اليوم وصلصة مميزة." }
            }
        },
        {
            id: 1009,
            cat: "Signatures",
            name: "Wrap légumes grillés",
            desc: "Légumes de saison, houmous et herbes fraîches.",
            price: 42,
            img: "images/menu-lib-street-food.svg",
            images: ["images/menu-lib-street-food.svg"],
            ingredients: ["Légumes grillés", "Houmous", "Herbes fraîches"],
            translations: {
                fr: { name: "Wrap légumes grillés", desc: "Légumes de saison, houmous et herbes fraîches." },
                en: { name: "Grilled Vegetable Wrap", desc: "Seasonal vegetables, hummus, and fresh herbs." },
                ar: { name: "لفافة خضار مشوية", desc: "خضار موسمية مع حمص وأعشاب طازجة." }
            }
        },
        {
            id: 1010,
            cat: "Desserts",
            name: "Fondant au chocolat",
            desc: "Servi tiède avec une touche de crème légère.",
            price: 32,
            img: "images/menu-lib-dessert.svg",
            images: ["images/menu-lib-dessert.svg"],
            ingredients: ["Chocolat noir", "Crème légère"],
            translations: {
                fr: { name: "Fondant au chocolat", desc: "Servi tiède avec une touche de crème légère." },
                en: { name: "Chocolate Fondant", desc: "Served warm with a touch of light cream." },
                ar: { name: "فوندان شوكولاتة", desc: "يقدم دافئاً مع لمسة من الكريمة الخفيفة." }
            }
        },
        {
            id: 1011,
            cat: "Desserts",
            name: "Tarte fine aux pommes",
            desc: "Pommes caramélisées et pâte croustillante.",
            price: 30,
            img: "images/menu-lib-bakery.svg",
            images: ["images/menu-lib-bakery.svg"],
            ingredients: ["Pommes", "Pâte croustillante", "Caramel léger"],
            translations: {
                fr: { name: "Tarte fine aux pommes", desc: "Pommes caramélisées et pâte croustillante." },
                en: { name: "Apple Tart", desc: "Caramelized apples on a crisp pastry base." },
                ar: { name: "تارت رقيق بالتفاح", desc: "تفاح مكرمل فوق عجين مقرمش." }
            }
        },
        {
            id: 1012,
            cat: "Boissons",
            name: "Citronnade maison",
            desc: "Boisson fraîche au citron et à la menthe.",
            price: 18,
            hasSizes: true,
            sizes: {
                small: 18,
                medium: 24,
                large: 29
            },
            img: "images/menu-lib-cold-drinks.svg",
            images: ["images/menu-lib-cold-drinks.svg"],
            ingredients: ["Citron", "Menthe", "Eau fraîche"],
            translations: {
                fr: { name: "Citronnade maison", desc: "Boisson fraîche au citron et à la menthe." },
                en: { name: "House Lemonade", desc: "Fresh lemon and mint drink." },
                ar: { name: "ليموناضة منزلية", desc: "مشروب منعش بالليمون والنعناع." }
            }
        },
        {
            id: 1013,
            cat: "Boissons",
            name: "Thé à la menthe",
            desc: "Infusion traditionnelle servie bien chaude.",
            price: 16,
            img: "images/menu-lib-hot-drinks.svg",
            images: ["images/menu-lib-hot-drinks.svg"],
            ingredients: ["Thé vert", "Menthe fraîche"],
            translations: {
                fr: { name: "Thé à la menthe", desc: "Infusion traditionnelle servie bien chaude." },
                en: { name: "Mint Tea", desc: "Traditional infusion served hot." },
                ar: { name: "شاي بالنعناع", desc: "مشروب تقليدي يقدم ساخناً." }
            }
        }
    ],
    catEmojis: {
        "Entrées": "🥗",
        "Plats": "🍽️",
        "Signatures": "⭐",
        "Desserts": "🍰",
        "Boissons": "🥤"
    },
    categoryImages: {},
    categoryTranslations: {
        "EntrÃ©es": {
            fr: { name: "EntrÃ©es" },
            en: { name: "Starters" },
            ar: { name: "المقبلات" }
        },
        "Plats": {
            fr: { name: "Plats" },
            en: { name: "Mains" },
            ar: { name: "الأطباق الرئيسية" }
        },
        "Signatures": {
            fr: { name: "Signatures" },
            en: { name: "Signatures" },
            ar: { name: "الأطباق المميزة" }
        },
        "Desserts": {
            fr: { name: "Desserts" },
            en: { name: "Desserts" },
            ar: { name: "الحلويات" }
        },
        "Boissons": {
            fr: { name: "Boissons" },
            en: { name: "Drinks" },
            ar: { name: "المشروبات" }
        }
    },
    superCategories: [
        {
            id: "cuisine",
            name: "Cuisine maison",
            desc: "Entrées et recettes signatures",
            emoji: "🍽️",
            cats: ["Entrées", "Plats"],
            translations: {
                fr: { name: "Cuisine maison", desc: "Entrées et recettes signatures" },
                en: { name: "House kitchen", desc: "Starters and signature recipes" },
                ar: { name: "مطبخ المنزل", desc: "مقبلات ووصفات مميزة" }
            }
        },
        {
            id: "signatures",
            name: "Signatures",
            desc: "Assiettes, sandwichs et recettes maison",
            emoji: "⭐",
            cats: ["Signatures"],
            translations: {
                fr: { name: "Suggestions maison", desc: "Assiettes, sandwichs et recettes flexibles" },
                en: { name: "House suggestions", desc: "Plates, sandwiches, and flexible house recipes" },
                ar: { name: "اقتراحات المنزل", desc: "أطباق وسندويشات ووصفات منزلية مرنة" }
            }
        },
        {
            id: "desserts",
            name: "Douceurs",
            desc: "Desserts pour finir en beauté",
            emoji: "🍰",
            cats: ["Desserts"],
            translations: {
                fr: { name: "Douceurs", desc: "Desserts pour finir en beauté" },
                en: { name: "Sweet treats", desc: "Desserts to finish beautifully" },
                ar: { name: "حلويات", desc: "حلويات لنهاية جميلة" }
            }
        },
        {
            id: "boissons",
            name: "Boissons",
            desc: "Boissons fraîches et boissons chaudes",
            emoji: "🥤",
            cats: ["Boissons"],
            translations: {
                fr: { name: "Boissons", desc: "Boissons fraîches et boissons chaudes" },
                en: { name: "Drinks", desc: "Cold drinks and hot beverages" },
                ar: { name: "المشروبات", desc: "مشروبات باردة ومشروبات ساخنة" }
            }
        }
    ]
};

// The white-label starter pack is the active runtime default.
window.defaultMenu = window.whiteLabelStarterSeed.menu.map(cloneStarterMenuItem);
window.defaultCatEmojis = { ...window.whiteLabelStarterSeed.catEmojis };
window.defaultCategoryImages = { ...(window.whiteLabelStarterSeed.categoryImages || {}) };
window.defaultCategoryTranslations = cloneStarterTranslationMap(window.whiteLabelStarterSeed.categoryTranslations);
window.defaultSuperCategories = window.whiteLabelStarterSeed.superCategories.map(cloneStarterSuperCategory);

const STARTER_CATEGORY_TRANSLATION_FALLBACKS = {
    entrees: {
        fr: { name: "Entrées" },
        en: { name: "Starters" },
        ar: { name: "المقبلات" }
    },
    plats: {
        fr: { name: "Plats" },
        en: { name: "Mains" },
        ar: { name: "الأطباق الرئيسية" }
    },
    signatures: {
        fr: { name: "Signatures" },
        en: { name: "Signatures" },
        ar: { name: "الأطباق المميزة" }
    },
    desserts: {
        fr: { name: "Desserts" },
        en: { name: "Desserts" },
        ar: { name: "الحلويات" }
    },
    boissons: {
        fr: { name: "Boissons" },
        en: { name: "Drinks" },
        ar: { name: "المشروبات" }
    }
};

const STARTER_SUPERCATEGORY_TRANSLATION_FALLBACKS = {
    cuisine: {
        fr: { name: "Cuisine maison", desc: "Entrées et recettes signatures" },
        en: { name: "House kitchen", desc: "Starters and signature recipes" },
        ar: { name: "مطبخ المنزل", desc: "مقبلات ووصفات مميزة" }
    },
    signatures: {
        fr: { name: "Suggestions maison", desc: "Assiettes, sandwichs et recettes flexibles" },
        en: { name: "House suggestions", desc: "Plates, sandwiches, and flexible house recipes" },
        ar: { name: "اقتراحات المنزل", desc: "أطباق وسندويشات ووصفات منزلية مرنة" }
    },
    desserts: {
        fr: { name: "Douceurs", desc: "Desserts pour finir en beauté" },
        en: { name: "Sweet treats", desc: "Desserts to finish beautifully" },
        ar: { name: "حلويات", desc: "حلويات لنهاية جميلة" }
    },
    boissons: {
        fr: { name: "Boissons", desc: "Boissons fraîches et boissons chaudes" },
        en: { name: "Drinks", desc: "Cold drinks and hot beverages" },
        ar: { name: "المشروبات", desc: "مشروبات باردة ومشروبات ساخنة" }
    }
};

const starterCategoryKeys = Object.keys(window.defaultCatEmojis);
if (!window.defaultCategoryTranslations[starterCategoryKeys[0]]) {
    window.defaultCategoryTranslations = {
        [starterCategoryKeys[0] || 'Starters']: {
            fr: { name: starterCategoryKeys[0] || 'Entrées' },
            en: { name: 'Starters' },
            ar: { name: 'المقبلات' }
        },
        [starterCategoryKeys[1] || 'Mains']: {
            fr: { name: starterCategoryKeys[1] || 'Plats' },
            en: { name: 'Mains' },
            ar: { name: 'الأطباق الرئيسية' }
        },
        [starterCategoryKeys[2] || 'Signatures']: {
            fr: { name: starterCategoryKeys[2] || 'Signatures' },
            en: { name: 'Signatures' },
            ar: { name: 'الأطباق المميزة' }
        },
        [starterCategoryKeys[3] || 'Desserts']: {
            fr: { name: starterCategoryKeys[3] || 'Desserts' },
            en: { name: 'Desserts' },
            ar: { name: 'الحلويات' }
        },
        [starterCategoryKeys[4] || 'Drinks']: {
            fr: { name: starterCategoryKeys[4] || 'Boissons' },
            en: { name: 'Drinks' },
            ar: { name: 'المشروبات' }
        }
    };
}

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

function normalizeMenuImageMatchText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\u0600-\u06ff]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

window.menuImageLibrary = [
    {
        id: 'breakfast',
        label: 'Breakfast & Brunch',
        src: 'images/menu-lib-breakfast.svg',
        keywords: ['breakfast', 'brunch', 'petit dejeuner', 'morning', 'omelette', 'toast', 'croissant', 'crepe', 'fotor', 'فطور'],
        categories: ['petit dejeuner', 'breakfast', 'brunch', 'crepes sucrees']
    },
    {
        id: 'starters',
        label: 'Starters & Soups',
        src: 'images/menu-lib-starters.svg',
        keywords: ['starter', 'entree', 'appetizer', 'soup', 'salad', 'salade', 'mezze', 'soupe', 'سلطة', 'شوربة'],
        categories: ['entrees', 'entree', 'starters', 'salades', 'salad']
    },
    {
        id: 'grill',
        label: 'Grill & Meat Plates',
        src: 'images/menu-lib-grill.svg',
        keywords: ['grill', 'grilled', 'barbecue', 'bbq', 'steak', 'brochette', 'kebab', 'kefta', 'lamb', 'beef', 'meat', 'mixed grill', 'grillade', 'مشوي', 'كفتة', 'كباب'],
        categories: ['grill', 'grillades', 'brochettes', 'viandes', 'meat', 'bbq']
    },
    {
        id: 'seafood',
        label: 'Seafood & Fish',
        src: 'images/menu-lib-seafood.svg',
        keywords: ['fish', 'seafood', 'shrimp', 'crevette', 'prawn', 'poisson', 'saumon', 'salmon', 'calamari', 'octopus', 'moules', 'fruits de mer', 'سمك', 'روبيان', 'مأكولات بحرية'],
        categories: ['poisson', 'seafood', 'fruits de mer', 'fish']
    },
    {
        id: 'pizza',
        label: 'Pizza & Oven Specials',
        src: 'images/menu-lib-pizza.svg',
        keywords: ['pizza', 'pinsa', 'flatbread', 'calzone', 'بيتزا'],
        categories: ['pizza', 'pizzas']
    },
    {
        id: 'street-food',
        label: 'Street Food',
        src: 'images/menu-lib-street-food.svg',
        keywords: ['burger', 'hamburger', 'cheeseburger', 'tacos', 'burrito', 'wrap', 'snack', 'street food', 'برغر', 'تاكوس', 'بوريتو'],
        categories: ['burger', 'burritos', 'tacos', 'street food']
    },
    {
        id: 'sandwich',
        label: 'Sandwiches & Panini',
        src: 'images/menu-lib-sandwich.svg',
        keywords: ['sandwich', 'panini', 'shawarma', 'club', 'baguette', 'toastie', 'خبز'],
        categories: ['sandwich', 'panini']
    },
    {
        id: 'mains',
        label: 'Main Dishes',
        src: 'images/menu-lib-mains.svg',
        keywords: ['main', 'plate', 'plat', 'tajine', 'grill', 'pasta', 'pates', 'chicken', 'beef', 'seafood', 'dish', 'طبق', 'طاجين', 'باستا'],
        categories: ['plats', 'les plats', 'tajine', 'pasticcio', 'les pates', 'pates', 'mains']
    },
    {
        id: 'desserts',
        label: 'Desserts & Sweet Treats',
        src: 'images/menu-lib-dessert.svg',
        keywords: ['dessert', 'cake', 'tiramisu', 'sweet', 'nutella', 'chocolate', 'crepe', 'waffle', 'ice cream', 'حلوى', 'تحلية'],
        categories: ['desserts', 'dessert', 'crepes sucrees']
    },
    {
        id: 'bakery',
        label: 'Bakery & Pastries',
        src: 'images/menu-lib-bakery.svg',
        keywords: ['bakery', 'pastry', 'viennoiserie', 'croissant', 'pain au chocolat', 'muffin', 'cookie', 'brownie', 'bun', 'brioche', 'patisserie', 'معجنات', 'كرواسون'],
        categories: ['viennoiseries', 'patisserie', 'bakery', 'pastries']
    },
    {
        id: 'hot-drinks',
        label: 'Coffee & Hot Drinks',
        src: 'images/menu-lib-hot-drinks.svg',
        keywords: ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'tea', 'the', 'infusion', 'milk', 'قهوة', 'شاي'],
        categories: ['nos cafes', 'cafe', 'thes et infusion', 'the et infusion', 'lait']
    },
    {
        id: 'cold-drinks',
        label: 'Cold Drinks & Juice',
        src: 'images/menu-lib-cold-drinks.svg',
        keywords: ['juice', 'jus', 'smoothie', 'mojito', 'milkshake', 'drink', 'boisson', 'soda', 'water', 'cocktail', 'عصير', 'مشروب'],
        categories: ['boissons', 'nos jus', 'nos mojito', 'nos milkshakes']
    },
    {
        id: 'generic',
        label: 'Generic Dish Placeholder',
        src: 'images/menu-lib-generic.svg',
        keywords: [],
        categories: []
    }
].map((entry) => ({
    ...entry,
    keywords: Array.isArray(entry.keywords) ? [...entry.keywords] : [],
    categories: Array.isArray(entry.categories) ? [...entry.categories] : []
}));

function getMenuImageMatchText(item) {
    const source = item && typeof item === 'object' ? item : {};
    const translations = source.translations && typeof source.translations === 'object' ? source.translations : {};
    const translationText = Object.values(translations)
        .flatMap((bucket) => bucket && typeof bucket === 'object'
            ? [bucket.name || '', bucket.desc || '']
            : [])
        .join(' ');
    const ingredientText = Array.isArray(source.ingredients) ? source.ingredients.join(' ') : '';

    return normalizeMenuImageMatchText([
        source.cat || '',
        source.name || '',
        source.desc || '',
        ingredientText,
        translationText
    ].join(' '));
}

function splitMenuImageMatchTokens(value) {
    return normalizeMenuImageMatchText(value)
        .split(' ')
        .filter(Boolean);
}

function hasNormalizedMenuImageTerm(haystack, tokenSet, value) {
    const normalizedValue = normalizeMenuImageMatchText(value);
    if (!normalizedValue) return false;
    if (normalizedValue.includes(' ')) return haystack.includes(normalizedValue);
    return tokenSet.has(normalizedValue);
}

window.getPrimaryMenuItemImage = function (item) {
    const source = item && typeof item === 'object' ? item : {};
    const images = Array.isArray(source.images) ? source.images.filter(Boolean) : [];
    if (images[0]) return images[0];
    return typeof source.img === 'string' ? source.img.trim() : '';
};

window.isManagedMenuLibraryImage = function (src) {
    const value = typeof src === 'string' ? src.trim() : '';
    return /^images\/menu-lib-[a-z0-9-]+\.svg$/i.test(value) || value === 'images/menu-item-placeholder.svg';
};

window.isManagedGalleryImage = function (src) {
    const value = typeof src === 'string' ? src.trim() : '';
    return /^images\/gallery-default-[a-z0-9-]+\.svg$/i.test(value);
};

window.getMenuImageSuggestion = function (item) {
    const haystack = getMenuImageMatchText(item);
    const normalizedCategory = normalizeMenuImageMatchText(item?.cat || '');
    const tokenSet = new Set(splitMenuImageMatchTokens(haystack));
    let bestMatch = null;

    window.menuImageLibrary.forEach((entry) => {
        if (entry.id === 'generic') return;

        let score = 0;
        let categoryMatches = 0;
        let keywordMatches = 0;
        const matchedSignals = [];

        entry.categories.forEach((categoryKeyword) => {
            const normalizedKeyword = normalizeMenuImageMatchText(categoryKeyword);
            if (!normalizedKeyword) return;
            if (normalizedCategory === normalizedKeyword) {
                score += 8;
                categoryMatches += 1;
                matchedSignals.push(`category:${categoryKeyword}`);
            } else if (normalizedCategory.includes(normalizedKeyword)) {
                score += 5;
                categoryMatches += 1;
                matchedSignals.push(`category:${categoryKeyword}`);
            }
        });

        entry.keywords.forEach((keyword) => {
            if (hasNormalizedMenuImageTerm(haystack, tokenSet, keyword)) {
                score += normalizeMenuImageMatchText(keyword).includes(' ') ? 4 : 3;
                keywordMatches += 1;
                matchedSignals.push(`keyword:${keyword}`);
            }
        });

        if (!bestMatch || score > bestMatch.score) {
            bestMatch = {
                id: entry.id,
                label: entry.label,
                src: entry.src,
                score,
                categoryMatches,
                keywordMatches,
                matchedSignals
            };
        }
    });

    if (bestMatch && bestMatch.score > 0) {
        const confidence = bestMatch.score >= 8
            ? 'high'
            : bestMatch.score >= 4
                ? 'medium'
                : 'low';
        const matchType = bestMatch.categoryMatches > 0 && bestMatch.keywordMatches > 0
            ? 'mixed'
            : bestMatch.categoryMatches > 0
                ? 'category'
                : 'keyword';
        return {
            ...bestMatch,
            confidence,
            matchType,
            reason: bestMatch.matchedSignals.length
                ? `Matched: ${bestMatch.matchedSignals.slice(0, 3).map((entry) => entry.replace(/^[^:]+:/, '')).join(', ')}`
                : 'Matched from category'
        };
    }

    const fallback = window.menuImageLibrary.find((entry) => entry.id === 'generic') || window.menuImageLibrary[0];
    return {
        id: fallback.id,
        label: fallback.label,
        src: fallback.src,
        score: 0,
        categoryMatches: 0,
        keywordMatches: 0,
        matchedSignals: [],
        confidence: 'fallback',
        matchType: 'fallback',
        reason: 'Used the generic fallback placeholder'
    };
};

function isPresetManagedHeroAsset(src) {
    const value = typeof src === 'string' ? src.trim() : '';
    return /^images\/hero-(default|fast|cafe|traditional)\.svg$/i.test(value);
}

function getMenuAuditImageState(src) {
    const value = typeof src === 'string' ? src.trim() : '';
    if (!value) return 'missing';
    if (typeof window.isManagedMenuLibraryImage === 'function' && window.isManagedMenuLibraryImage(value)) {
        return 'managed';
    }
    return 'ready';
}

window.getMediaSlotAudit = function (config, menuItems, promoIdsInput) {
    const sourceConfig = config && typeof config === 'object' ? config : (window.restaurantConfig || {});
    const branding = sourceConfig.branding || {};
    const menuList = Array.isArray(menuItems) ? menuItems : (Array.isArray(window.menu) ? window.menu : []);
    const galleryItems = Array.isArray(sourceConfig.gallery) ? sourceConfig.gallery.filter(Boolean) : [];
    const promoIds = Array.isArray(promoIdsInput)
        ? promoIdsInput
        : (Array.isArray(sourceConfig.promoIds) ? sourceConfig.promoIds : (typeof window.getPromoIds === 'function' ? window.getPromoIds() : []));
    const heroSlides = Array.isArray(branding.heroSlides) ? branding.heroSlides : [];
    const galleryManagedCount = galleryItems.filter((src) => window.isManagedGalleryImage(src)).length;
    const galleryReadyCount = galleryItems.filter((src) => src && !window.isManagedGalleryImage(src)).length;
    const featuredItems = menuList.filter((item) => item && item.featured);
    const featuredWithImages = featuredItems.filter((item) => getMenuAuditImageState(window.getPrimaryMenuItemImage(item)) !== 'missing');
    const promoItems = menuList.filter((item) => item && promoIds.includes(item.id));
    const promoWithImages = promoItems.filter((item) => getMenuAuditImageState(window.getPrimaryMenuItemImage(item)) !== 'missing');
    const menuItemsMissingImages = menuList.filter((item) => getMenuAuditImageState(window.getPrimaryMenuItemImage(item)) === 'missing').length;
    const menuItemsManagedImages = menuList.filter((item) => getMenuAuditImageState(window.getPrimaryMenuItemImage(item)) === 'managed').length;

    const getHandoffPolicy = (id, state) => {
        switch (id) {
            case 'branding.logo':
                return {
                    blocksHandoff: state !== 'ready',
                    sellerRule: state === 'ready'
                        ? 'Required and ready for delivery.'
                        : 'Delivery should be blocked until a real client logo is assigned.'
                };
            case 'branding.hero.primary':
                return {
                    blocksHandoff: state !== 'ready',
                    sellerRule: state === 'ready'
                        ? 'Required and ready for delivery.'
                        : state === 'managed'
                            ? 'Delivery should be blocked until the preset hero is replaced with a client-specific visual.'
                            : 'Delivery should be blocked until a primary hero image is assigned.'
                };
            case 'menu.items':
                return {
                    blocksHandoff: state === 'missing',
                    sellerRule: state === 'missing'
                        ? 'Delivery should be blocked until every menu item has at least one image source.'
                        : state === 'managed'
                            ? 'Managed placeholders are acceptable temporarily, but should be replaced when stronger dish media exists.'
                            : 'Menu item imagery is acceptable for delivery.'
                };
            case 'homepage.gallery':
                return {
                    blocksHandoff: false,
                    sellerRule: state === 'ready'
                        ? 'Gallery coverage is strong enough for delivery.'
                        : 'Gallery coverage is optional, but stronger client-specific media will improve the package.'
                };
            case 'menu.featured':
            case 'menu.promo':
            case 'branding.hero.slide2':
            case 'branding.hero.slide3':
                return {
                    blocksHandoff: false,
                    sellerRule: state === 'ready'
                        ? 'This optional slot is ready.'
                        : 'This slot can stay optional, but filling it improves launch quality.'
                };
            default:
                return {
                    blocksHandoff: false,
                    sellerRule: 'Review this slot manually before handoff.'
                };
        }
    };

    const createAuditItem = (id, label, targetField, required, state, detail) => {
        const policy = getHandoffPolicy(id, state);
        return {
            id,
            label,
            targetField,
            required,
            state,
            detail,
            blocksHandoff: policy.blocksHandoff,
            sellerRule: policy.sellerRule
        };
    };

    return [
        createAuditItem(
            'branding.logo',
            'Brand logo',
            'branding.logoImage',
            true,
            branding.logoImage ? 'ready' : 'missing',
            branding.logoImage
                ? 'Logo file is assigned.'
                : 'Assign a client logo before handoff.'
        ),
        createAuditItem(
            'branding.hero.primary',
            'Homepage hero primary',
            'branding.heroImage',
            true,
            branding.heroImage
                ? (isPresetManagedHeroAsset(branding.heroImage) ? 'managed' : 'ready')
                : 'missing',
            !branding.heroImage
                ? 'Primary hero image is missing.'
                : isPresetManagedHeroAsset(branding.heroImage)
                    ? 'Using a managed preset hero asset.'
                    : 'Custom hero image is assigned.'
        ),
        createAuditItem(
            'branding.hero.slide2',
            'Homepage hero slide 2',
            'branding.heroSlides[1]',
            false,
            heroSlides[1]
                ? (isPresetManagedHeroAsset(heroSlides[1]) ? 'managed' : 'ready')
                : 'missing',
            !heroSlides[1]
                ? 'Optional secondary hero slide is empty.'
                : isPresetManagedHeroAsset(heroSlides[1])
                    ? 'Secondary slide still uses a managed preset asset.'
                    : 'Custom secondary hero slide is assigned.'
        ),
        createAuditItem(
            'branding.hero.slide3',
            'Homepage hero slide 3',
            'branding.heroSlides[2]',
            false,
            heroSlides[2]
                ? (isPresetManagedHeroAsset(heroSlides[2]) ? 'managed' : 'ready')
                : 'missing',
            !heroSlides[2]
                ? 'Optional third hero slide is empty.'
                : isPresetManagedHeroAsset(heroSlides[2])
                    ? 'Third slide still uses a managed preset asset.'
                    : 'Custom third hero slide is assigned.'
        ),
        createAuditItem(
            'homepage.gallery',
            'Homepage gallery',
            'gallery[]',
            false,
            galleryReadyCount >= 3
                ? 'ready'
                : galleryItems.length > 0 && galleryReadyCount === 0
                    ? 'managed'
                    : galleryItems.length > 0
                        ? 'partial'
                        : 'missing',
            galleryReadyCount >= 3
                ? `${galleryItems.length} gallery image(s) configured.`
                : galleryItems.length > 0 && galleryReadyCount === 0
                    ? `${galleryManagedCount} managed gallery visual(s) configured; replace them with client media for final delivery.`
                    : galleryItems.length > 0
                        ? `Gallery mixes ${galleryReadyCount} custom and ${galleryManagedCount} managed visual(s); add more client media for a stronger launch set.`
                    : 'No gallery images configured yet.'
        ),
        createAuditItem(
            'menu.featured',
            'Menu featured rail',
            'menu[].featured + menu[].img',
            false,
            featuredWithImages.length >= 3 ? 'ready' : featuredWithImages.length > 0 ? 'partial' : 'missing',
            featuredWithImages.length >= 3
                ? `${featuredWithImages.length} featured item(s) have visuals.`
                : featuredWithImages.length > 0
                    ? `${featuredWithImages.length} featured item(s) have visuals; consider adding more for the menu landing.`
                    : 'No featured menu visuals are ready.'
        ),
        createAuditItem(
            'menu.promo',
            'Promo carousel',
            'promoIds[] + menu[].img',
            false,
            promoWithImages.length >= 1 ? 'ready' : promoItems.length > 0 ? 'partial' : 'missing',
            promoWithImages.length >= 1
                ? `${promoWithImages.length} promo item(s) have visuals.`
                : promoItems.length > 0
                    ? 'Promo items exist but still need images.'
                    : 'No promo items are currently configured.'
        ),
        createAuditItem(
            'menu.items',
            'Menu item imagery',
            'menu[].img / menu[].images[]',
            true,
            menuItemsMissingImages === 0
                ? (menuItemsManagedImages > 0 ? 'managed' : 'ready')
                : 'missing',
            menuList.length === 0
                ? 'Menu items are not configured yet.'
                : menuItemsMissingImages > 0
                    ? `${menuItemsMissingImages} item(s) still have no image.`
                    : menuItemsManagedImages > 0
                        ? `${menuItemsManagedImages} item(s) still use managed library placeholders.`
                        : 'Every menu item has a non-placeholder image source.'
        )
    ];
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
    root.style.setProperty('--brand-hero-image', `url("${branding.heroImage}")`);
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
            window.setSafeImageSource(image, branding.heroImage, {
                fallbackSrc: window.defaultBranding.heroImage,
                onMissing: () => {
                    image.style.display = '';
                }
            });
        }
    });

    const presetConfig = window.getBrandPresetConfig(branding.presetId);
    const homepageHeroImages = normalizeHeroSlideList(
        branding.heroSlides,
        presetConfig.heroSlides,
        branding.heroImage
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
                    }
                },
                displayValue: 'block'
            });
            if (logoFallback) {
                logoFallback.style.display = 'none';
            }
        } else {
            logoImage.removeAttribute('src');
            logoImage.style.display = 'none';
            if (logoFallback) {
                logoFallback.textContent = window.getRestaurantInitials();
                logoFallback.style.display = 'flex';
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

window.getStoredAdminCategoryFilter = function () {
    const value = window.readBrowserState(window.browserStateKeys.adminCategoryFilter, 'All');
    return typeof value === 'string' && value.trim() ? value : 'All';
};

window.setStoredAdminCategoryFilter = function (value) {
    window.writeBrowserState(window.browserStateKeys.adminCategoryFilter, value || 'All');
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

Object.assign(window.translations.fr, {
    'admin.login.title': 'Administration du restaurant',
    'admin.login.subtitle': 'Connectez-vous pour gérer votre restaurant',
    'admin.login.username_placeholder': "Nom d'utilisateur",
    'admin.login.password_placeholder': 'Mot de passe',
    'admin.login.button': 'Se connecter',
    'admin.login.incorrect_credentials': 'Identifiants incorrects',
    'admin.login.server_connection_error': 'Erreur de connexion au serveur',
    'admin.login.too_many_attempts': 'Trop de tentatives. Réessayez dans {minutes} min.',
    'admin.mobile_title': 'ADMIN RESTAURANT',
    'admin.sidebar_title': 'Administration du restaurant',
    'admin.nav.menu': 'Menu Items',
    'admin.nav.categories': 'Categories',
    'admin.nav.branding': 'Branding',
    'admin.nav.landing': 'Landing Page',
    'admin.nav.parameters': 'Parameters',
    'admin.nav.supercategories': 'Super Categories',
    'admin.nav.hours': 'Horaires',
    'admin.nav.wifi': 'WiFi',
    'admin.nav.data_tools': 'Seller Tools',
    'admin.nav.security': 'Security',
    'admin.nav.stats': 'Statistics',
    'admin.nav.gallery': 'Galerie',
    'admin.nav.save_changes': 'Enregistrer les modifications',
    'admin.nav.logout': 'Déconnexion',
    'admin.header.menu_management': 'Gestion du menu',
    'admin.header.parameters': 'Parametres',
    'admin.header.website_home': 'Voir le site',
    'admin.save_state.idle_label': 'Prêt',
    'admin.save_state.saving_label': 'Sauvegarde',
    'admin.save_state.success_label': 'Sauvegardé',
    'admin.save_state.error_label': 'Attention',
    'admin.save_state.idle_message': 'Aucune sauvegarde serveur dans cette session.',
    'admin.save_state.saving_message': 'Sauvegarde des modifications sur le serveur...',
    'admin.save_state.success_message': 'Toutes les modifications actuelles sont enregistrées sur le serveur.',
    'admin.save_state.error_message': 'Échec de la sauvegarde.',
    'admin.save_state.error_prefix': 'Échec de la sauvegarde',
    'admin.save_state.session_expired': 'Session expirée. Veuillez vous reconnecter.',
    'admin.seller_tools.title': 'Seller Tools',
    'admin.seller_tools.subtitle': "Vérifiez l'état de lancement, préparez les éléments de handoff, gérez les presets de départ et déplacez les données restaurant entre instances.",
    'admin.parameters.branding': 'Identite visuelle',
    'admin.parameters.landing': 'Contenu du site',
    'admin.parameters.wifi': 'WiFi & contact',
    'admin.parameters.security': 'Acces',
    'admin.parameters.subtitle': "Gerez l'identite publique du site, les informations clients, le WiFi et l'acces admin dans un seul espace.",
    'admin.tools.audit': 'Audit',
    'admin.tools.launch_readiness': 'Launch Readiness',
    'admin.tools.launch_readiness_desc': "Vérifiez l'instance actuelle avant handoff. Cet audit rapide met en évidence le branding, les coordonnées, le menu, la galerie et la sécurité.",
    'admin.tools.audit_loading': "Chargement de l'audit...",
    'admin.tools.delivery': 'Delivery',
    'admin.tools.handoff_summary': 'Handoff Summary',
    'admin.tools.handoff_summary_desc': 'Générez un résumé opérationnel concis avant livraison ou revue interne.',
    'admin.tools.generate_summary': 'Générer le résumé',
    'admin.tools.copy_summary': 'Copier le résumé',
    'admin.tools.download_summary': 'Télécharger le résumé',
    'admin.tools.handoff_summary_placeholder': 'Générez un résumé pour revoir la configuration actuelle du restaurant.',
    'admin.tools.media': 'Media',
    'admin.tools.menu_image_suggestions': "Suggestions d'images menu",
    'admin.tools.menu_image_suggestions_desc': "Assignez des images locales aux plats sans visuel. Utilisez cela comme étape interne rapide avant les vraies photos client ou la génération IA.",
    'admin.tools.assign_missing_images': 'Assigner les images manquantes',
    'admin.tools.menu_image_suggestions_placeholder': "Lancez l'outil pour attribuer des images locales aux plats sans visuels."
});

Object.assign(window.translations.fr, {
    'admin.tools.starter': 'Starter',
    'admin.tools.quick_launch_preset': 'Preset de démarrage rapide',
    'admin.tools.quick_launch_preset_desc': "Appliquez une base solide pour un fast-food, un café ou un restaurant traditionnel avant l'ajustement final.",
    'admin.tools.apply_quick_launch': 'Appliquer le preset',
    'admin.tools.backup': 'Backup',
    'admin.tools.export_current_restaurant': 'Exporter le restaurant actuel',
    'admin.tools.export_current_restaurant_desc': 'Téléchargez toutes les données normalisées du site: menu, branding, horaires, traductions, visibilité et ordre des sections.',
    'admin.tools.export_backup': 'Exporter la sauvegarde',
    'admin.tools.restore': 'Restore',
    'admin.tools.import_restaurant_backup': 'Importer une sauvegarde restaurant',
    'admin.tools.import_restaurant_backup_desc': 'Téléversez un JSON exporté auparavant pour restaurer ou cloner rapidement une configuration.',
    'admin.tools.import_backup': 'Importer la sauvegarde',
    'admin.tools.reset': 'Reset',
    'admin.tools.starter_reset': 'Réinitialisation starter',
    'admin.tools.starter_reset_desc': 'Réinitialisez cette instance sur le template starter fourni pour recommencer une configuration.',
    'admin.tools.reset_to_starter': 'Réinitialiser le starter',
    'admin.quick_launch.preset': 'Preset',
    'admin.quick_launch.restaurant_name': 'Nom du restaurant',
    'admin.quick_launch.restaurant_name_placeholder': 'ex. Atlas Restaurant',
    'admin.quick_launch.short_brand_name': 'Nom de marque court',
    'admin.quick_launch.short_brand_name_placeholder': 'ex. Atlas',
    'admin.quick_launch.address': 'Adresse',
    'admin.quick_launch.address_placeholder': 'ex. Avenue Hassan II, Casablanca',
    'admin.quick_launch.phone': 'Téléphone',
    'admin.quick_launch.phone_placeholder': '+212 6...',
    'admin.quick_launch.whatsapp_optional': 'WhatsApp (optionnel)',
    'admin.security.title': 'Sécurité admin',
    'admin.security.subtitle': "Mettez à jour la connexion admin de ce restaurant. Les identifiants sont stockés de façon persistante et survivent aux redeploys.",
    'admin.security.admin_username': "Nom d'utilisateur admin",
    'admin.security.admin_username_placeholder': 'admin',
    'admin.security.admin_username_help': "Minimum 3 caractères. Cela devient le prochain accès admin pour ce restaurant.",
    'admin.security.new_password': 'Nouveau mot de passe',
    'admin.security.password_placeholder': '********',
    'admin.security.new_password_help': "Minimum 8 caractères. Laissez vide seulement si vous voulez garder le mot de passe actuel.",
    'admin.security.confirm_password': 'Confirmer le nouveau mot de passe',
    'admin.security.save_credentials': 'Enregistrer les identifiants',
    'admin.security.what_happens_on_save': "Ce qui se passe à l'enregistrement",
    'admin.security.save_rule_1': "Les anciennes sessions admin sont fermées automatiquement après un changement d'identifiants.",
    'admin.security.save_rule_2': "Si l'instance dépend encore des variables d'environnement, enregistrer ici crée le fichier d'auth persistant local pour ce restaurant.",
    'admin.security.save_rule_3': "Les changements sont enregistrés dans le chemin d'auth persistant configuré, pas seulement dans le conteneur en cours.",
    'admin.security.handoff_policy': 'Politique de handoff',
    'admin.security.handoff_policy_text': "Ne livrez pas le site tant que les identifiants par défaut sont actifs. Vérifiez que l'avertissement disparaît dans Launch Readiness et testez une nouvelle connexion."
});

Object.assign(window.translations.fr, {
    'admin.security.default_credentials_note': 'Les identifiants admin par défaut sont encore actifs. Changez-les avant handoff.',
    'admin.security.legacy_plaintext_note': "Les identifiants sont encore stockés dans l'ancien format texte. Sauvegarder un nouveau mot de passe les migrera vers un stockage haché sécurisé.",
    'admin.security.env_source_note': "Cette instance dépend actuellement des identifiants d'environnement. Enregistrer ici créera un fichier d'auth local haché pour ce restaurant.",
    'admin.security.default_source_note': "Cette instance utilise encore les identifiants fallback intégrés. Remplacez-les avant livraison production.",
    'admin.security.username_rule': "Règle du nom d'utilisateur: minimum 3 caractères.",
    'admin.security.password_rule': 'Règle du mot de passe: minimum {count} caractères.',
    'admin.security.session_rule': "Lors d'un changement d'identifiants, les anciennes sessions admin sont fermées automatiquement.",
    'admin.security.status_title': 'État de la sécurité',
    'admin.security.passwords_mismatch': 'Les mots de passe ne correspondent pas.',
    'admin.security.credentials_updated': 'Identifiants mis à jour avec succès.',
    'admin.security.credentials_update_failed': 'Impossible de mettre à jour les identifiants.',
    'admin.readiness.branding_media': 'Médias de branding',
    'admin.readiness.branding_media_ok': "Le logo et l'image hero sont configurés.",
    'admin.readiness.branding_media_missing': 'Ajoutez un logo et une image hero avant la livraison.',
    'admin.readiness.core_contact_details': 'Coordonnées essentielles',
    'admin.readiness.core_contact_details_ok': 'Adresse, carte et téléphone sont présents.',
    'admin.readiness.core_contact_details_missing': 'Adresse, lien carte ou téléphone encore incomplet.',
    'admin.readiness.opening_hours': 'Horaires',
    'admin.readiness.opening_hours_ok': '{count} lignes horaires configurées.',
    'admin.readiness.opening_hours_missing': 'Ajoutez les horaires avant le handoff.',
    'admin.readiness.menu_coverage': 'Couverture du menu',
    'admin.readiness.menu_coverage_ok': '{count} plats configurés.',
    'admin.readiness.menu_coverage_missing': "Aucun plat n'est configuré pour le moment.",
    'admin.readiness.menu_translations': 'Traductions du menu',
    'admin.readiness.menu_translations_empty': 'Ajoutez des plats avant de vérifier les traductions.',
    'admin.readiness.menu_translations_ok': 'Tous les plats ont un nom FR / EN / AR.',
    'admin.readiness.menu_translations_missing': '{count} plat(s) ont encore des noms traduits manquants.',
    'admin.readiness.item_imagery': 'Visuels des plats',
    'admin.readiness.item_imagery_empty': 'Ajoutez des plats avant de vérifier les visuels.',
    'admin.readiness.item_imagery_ok': "Chaque plat a une source d'image.",
    'admin.readiness.item_imagery_managed': "Chaque plat a une source d'image. {count} plat(s) utilisent encore des placeholders gérés.",
    'admin.readiness.item_imagery_missing': "{count} plat(s) n'ont toujours pas d'image.",
    'admin.readiness.gallery': 'Galerie',
    'admin.readiness.gallery_ok': '{count} image(s) galerie configurée(s).',
    'admin.readiness.gallery_missing': 'Ajoutez au moins une image galerie pour une livraison plus complète.',
    'admin.readiness.admin_security': 'Sécurité admin',
    'admin.readiness.admin_security_loading': "Le statut sécurité n'est pas encore chargé.",
    'admin.readiness.admin_security_default': 'Les identifiants admin par défaut sont encore actifs.',
    'admin.readiness.admin_security_ok': 'Des identifiants admin personnalisés sont actifs.',
    'admin.readiness.summary_ready': 'Prêt pour la revue finale',
    'admin.readiness.summary_blockers': '{count} bloqueur(s) handoff',
    'admin.readiness.summary_progress': '{ok}/{total} vérifications réussies',
    'admin.readiness.badge_ok': 'OK',
    'admin.readiness.badge_needs_work': 'À corriger'
});

Object.assign(window.translations.fr, {
    'admin.actions.open_branding': 'Ouvrir Branding',
    'admin.actions.open_landing': 'Ouvrir Landing',
    'admin.actions.open_hours': 'Ouvrir Horaires',
    'admin.actions.open_menu': 'Ouvrir Menu',
    'admin.actions.open_gallery': 'Ouvrir Galerie',
    'admin.actions.open_security': 'Ouvrir Security',
    'admin.media.status_title': 'État de livraison des médias',
    'admin.media.metric_blockers': '{count} bloqueur(s)',
    'admin.media.metric_warnings': '{count} avertissement(s)',
    'admin.media.metric_managed': '{count} géré(s)',
    'admin.media.metric_missing_partial': '{missing} manquant(s) / {partial} partiel(s)',
    'admin.media.audit_unavailable_title': 'Audit média indisponible',
    'admin.media.audit_unavailable_detail': 'Relancez après le chargement complet des données du restaurant.',
    'admin.media.badge_pending': 'En attente',
    'admin.media.badge_blocks_handoff': 'Bloque le handoff',
    'admin.media.badge_ready': 'Prêt',
    'admin.media.badge_warning': 'Avertissement',
    'admin.media.policy_title': 'Politique seller',
    'admin.media.policy_blockers': '{blockers} bloqueur(s) média doivent être corrigés avant la livraison. {warnings} autre(s) slot(s) sont seulement des avertissements.',
    'admin.media.policy_warnings': 'Aucun bloqueur média restant. {warnings} avertissement(s) média optionnel(s) peuvent encore être améliorés avant handoff.',
    'admin.media.policy_ready': 'Les exigences média essentielles sont prêtes pour la livraison.',
    'admin.handoff.restaurant': 'Restaurant',
    'admin.handoff.short_brand': 'Marque courte',
    'admin.handoff.website_url': 'URL du site',
    'admin.handoff.admin_url': 'URL admin',
    'admin.handoff.admin_user': 'Utilisateur admin',
    'admin.handoff.phone': 'Téléphone',
    'admin.handoff.address': 'Adresse',
    'admin.handoff.menu_items': 'Plats',
    'admin.handoff.library_placeholders': 'Placeholders bibliothèque',
    'admin.handoff.gallery_images': 'Images galerie',
    'admin.handoff.hours_rows': 'Lignes horaires',
    'admin.handoff.launch_readiness': 'État de lancement',
    'admin.handoff.media_blockers': 'Bloqueurs média',
    'admin.handoff.media_warnings': 'Avertissements média',
    'admin.handoff.media_slots': 'Slots média',
    'admin.handoff.open_issues': 'Points ouverts',
    'admin.handoff.open_issues_none': 'aucun. Prêt pour la revue finale.',
    'admin.handoff.generated': 'Résumé handoff généré.',
    'admin.handoff.copied': 'Résumé handoff copié.',
    'admin.handoff.downloaded': 'Résumé handoff téléchargé.',
    'admin.menu_images.summary_title': "Exécution des suggestions d'images menu",
    'admin.menu_images.items_reviewed': 'Plats analysés: {count}',
    'admin.menu_images.images_assigned': 'Images attribuées: {count}',
    'admin.menu_images.items_already_covered': 'Plats déjà couverts: {count}',
    'admin.menu_images.high_confidence': 'Correspondances forte confiance: {count}',
    'admin.menu_images.medium_confidence': 'Correspondances confiance moyenne: {count}',
    'admin.menu_images.low_confidence': 'Correspondances faible confiance: {count}',
    'admin.menu_images.fallback_confidence': 'Placeholders génériques fallback: {count}',
    'admin.menu_images.assignments': 'Attributions',
    'admin.menu_images.assignments_none': 'Attributions: aucune. Chaque plat avait déjà une image.',
    'admin.menu_images.review_note': 'Note: les attributions fallback sont des placeholders génériques à remplacer en priorité dès qu’un meilleur média client existe.',
    'admin.menu_images.none_missing': 'Aucune image menu manquante trouvée.',
    'admin.menu_images.assigned_toast': "{count} suggestion(s) d'image menu attribuée(s).",
    'admin.menu_images.run_first': "Exécutez d'abord l'outil de suggestion.",
    'admin.menu_images.copied': "Résumé des suggestions d'images copié.",
    'admin.section_order.about': 'Section À propos',
    'admin.section_order.payments': 'Paiement et facilités',
    'admin.section_order.events': 'Section événements',
    'admin.section_order.gallery': 'Section galerie',
    'admin.section_order.hours': 'Section horaires',
    'admin.section_order.contact': 'Section contact',
    'admin.common.not_set': 'Non défini',
    'admin.common.none': 'aucun.',
    'admin.common.unavailable': 'indisponible.',
    'admin.common.copy_failed': 'Échec de la copie. Sélectionnez le résumé manuellement.',
    'admin.floating_save': 'Publier les modifications',
    'admin.floating_save_title': 'Publier les modifications'
});

Object.assign(window.translations.fr, {
    'admin.menu.title': 'Ajouter un nouvel article',
    'admin.menu.default_name': 'Nom par défaut',
    'admin.menu.default_name_placeholder': 'ex. Assiette signature',
    'admin.menu.category': 'Catégorie',
    'admin.menu.default_description': 'Description par défaut',
    'admin.menu.default_description_placeholder': 'Utilisée comme secours si une traduction manque',
    'admin.menu.localized_names': 'Noms et descriptions localisés',
    'admin.menu.localized_names_hint': "Ces champs alimentent l'expérience menu en français, anglais et arabe et donnent une structure claire au futur importeur IA.",
    'admin.menu.name_fr': 'Nom (FR)',
    'admin.menu.name_fr_placeholder': 'Nom du plat en français',
    'admin.menu.description_fr': 'Description (FR)',
    'admin.menu.description_fr_placeholder': 'Description en français',
    'admin.menu.name_en': 'Nom (EN)',
    'admin.menu.name_en_placeholder': 'Nom du plat en anglais',
    'admin.menu.description_en': 'Description (EN)',
    'admin.menu.description_en_placeholder': 'Description en anglais',
    'admin.menu.name_ar': 'Nom (AR)',
    'admin.menu.name_ar_placeholder': 'Nom du plat en arabe',
    'admin.menu.description_ar': 'Description (AR)',
    'admin.menu.description_ar_placeholder': 'Description en arabe',
    'admin.menu.ingredients': 'Ingrédients (séparés par des virgules)',
    'admin.menu.ingredients_placeholder': 'Tomate, laitue, sauce spéciale...',
    'admin.menu.has_sizes': 'Article avec plusieurs tailles',
    'admin.menu.featured': 'Article mis en avant',
    'admin.menu.available': 'Disponible / En stock',
    'admin.menu.price': 'Prix (MAD)',
    'admin.menu.price_small': 'Petit prix',
    'admin.menu.price_medium': 'Prix moyen',
    'admin.menu.price_large': 'Grand prix',
    'admin.menu.gallery': 'Galerie (URLs ou upload)',
    'admin.menu.gallery_placeholder': 'Ou collez des URLs ici (séparées par des virgules)...',
    'admin.menu.save_product': 'Enregistrer le produit',
    'admin.menu.reset_all_data': 'Réinitialiser toutes les données',
    'admin.menu.existing_items': 'Articles existants (sélectionnez une étoile pour la promo du jour)',
    'admin.table.image': 'Image',
    'admin.table.name': 'Nom',
    'admin.table.category': 'Catégorie',
    'admin.table.price': 'Prix',
    'admin.table.actions': 'Actions',
    'admin.table.action': 'Action',
    'admin.table.items': 'Articles',
    'admin.table.emoji': 'Emoji',
    'admin.categories.title': 'Ajouter une nouvelle catégorie',
    'admin.categories.name': 'Nom de la catégorie',
    'admin.categories.name_placeholder': 'ex. Boissons chaudes',
    'admin.categories.name_fr': 'Nom de la catégorie',
    'admin.categories.name_fr_placeholder': 'Nom de la catégorie en français',
    'admin.categories.name_en': 'Nom de la catégorie',
    'admin.categories.name_en_placeholder': 'Nom de la catégorie en anglais',
    'admin.categories.name_ar': 'Nom de la catégorie',
    'admin.categories.name_ar_placeholder': 'Nom de la catégorie en arabe',
    'admin.categories.add': 'Ajouter la catégorie',
    'admin.categories.active': 'Catégories actives',
    'admin.wifi.title': 'Paramètres réseau',
    'admin.wifi.subtitle': 'Les mises à jour seront visibles immédiatement par les clients sur la page de scan.',
    'admin.wifi.name': 'Nom WiFi (SSID)',
    'admin.wifi.update': 'Mettre à jour le réseau',
    'admin.wifi.preview': 'Aperçu côté client :',
    'admin.wifi.preview_label': 'WiFi :',
    'admin.wifi.preview_pass': 'Code :',
    'admin.stats.title': 'Vue d’ensemble',
    'admin.stats.total_products': 'Produits au total',
    'admin.stats.categories': 'Catégories',
    'admin.stats.promo_status': 'Statut promo'
});

Object.assign(window.translations.fr, {
    'admin.branding.title': 'Système de marque et thème',
    'admin.branding.subtitle': 'Configurez l’identité réutilisable qui doit suivre ce restaurant sur le site public et le menu.',
    'admin.branding.preset': 'Preset',
    'admin.branding.restaurant_name': 'Nom du restaurant',
    'admin.branding.short_brand_name': 'Nom de marque court',
    'admin.branding.tagline': 'Signature',
    'admin.branding.tagline_placeholder': 'ex. Cuisine locale, brunch et café',
    'admin.branding.logo_mark': 'Lettre logo',
    'admin.branding.logo_mark_placeholder': 'ex. A',
    'admin.branding.primary_color': 'Couleur principale',
    'admin.branding.secondary_color': 'Couleur secondaire',
    'admin.branding.accent_color': 'Couleur accent',
    'admin.branding.surface_color': 'Couleur de surface',
    'admin.branding.muted_surface': 'Surface atténuée',
    'admin.branding.text_color': 'Couleur du texte',
    'admin.branding.muted_text': 'Texte atténué',
    'admin.branding.menu_background': 'Fond du menu',
    'admin.branding.menu_surface': 'Surface du menu',
    'admin.branding.logo_image_url': 'URL du logo',
    'admin.branding.logo_image_placeholder': '/uploads/logo.png ou https://...',
    'admin.branding.hero_image_url': 'URL de l’image hero',
    'admin.branding.hero_image_placeholder': '/uploads/cover.jpg ou https://...',
    'admin.branding.hero_slide_2_url': 'URL slide hero 2',
    'admin.branding.hero_slide_2_placeholder': '/uploads/cover-2.jpg ou https://...',
    'admin.branding.hero_slide_3_url': 'URL slide hero 3',
    'admin.branding.hero_slide_3_placeholder': '/uploads/cover-3.jpg ou https://...',
    'admin.branding.logo_upload': 'Upload du logo',
    'admin.branding.logo_upload_desc': 'Utilisez l’upload pour aller plus vite, tout en gardant le champ URL disponible si besoin.',
    'admin.branding.clear_logo': 'Effacer le logo',
    'admin.branding.hero_upload': 'Upload hero',
    'admin.branding.hero_upload_desc': 'Téléversez l’image de couverture ici et le champ URL sera rempli automatiquement.',
    'admin.branding.clear_hero': 'Effacer le hero',
    'admin.branding.hero_slide_2_upload': 'Upload slide hero 2',
    'admin.branding.hero_slide_2_upload_desc': 'Utilisez un second visuel si le client fournit plus d’une image forte.',
    'admin.branding.clear_slide_2': 'Effacer slide 2',
    'admin.branding.hero_slide_3_upload': 'Upload slide hero 3',
    'admin.branding.hero_slide_3_upload_desc': 'Ajoutez un troisième visuel pour que le slider paraisse vraiment finalisé.',
    'admin.branding.clear_slide_3': 'Effacer slide 3',
    'admin.branding.live_preview': 'Aperçu live de la marque',
    'admin.branding.live_preview_desc': 'Cet aperçu aide à valider les couleurs, le fallback logo et l’ambiance hero avant publication.',
    'admin.branding.save': 'Enregistrer le branding',
    'admin.landing.title': 'Configuration de la landing page',
    'admin.landing.subtitle': 'Mettez à jour ce que les clients voient lors de leur première visite.',
    'admin.landing.address': 'Adresse',
    'admin.landing.map_url': 'URL carte (Google Maps)',
    'admin.landing.phone_number': 'Numéro de téléphone',
    'admin.landing.instagram': 'Nom Instagram',
    'admin.landing.instagram_placeholder': '@restaurant.officiel',
    'admin.landing.facebook': 'URL Facebook',
    'admin.landing.tiktok': 'URL TikTok',
    'admin.landing.tripadvisor': 'URL TripAdvisor',
    'admin.landing.payments_facilities': 'Paiements et facilités',
    'admin.landing.payments_facilities_desc': 'Ces informations sont purement informatives pour le site public.',
    'admin.landing.accepted_payments': 'Paiements acceptés',
    'admin.landing.accepted_payments_desc': 'Choisissez les moyens de paiement à afficher sur la homepage.',
    'admin.landing.payment_cash': 'Espèces',
    'admin.landing.payment_tpe': 'TPE / Terminal carte',
    'admin.landing.guest_facilities': 'Facilités clients',
    'admin.landing.guest_facilities_desc': 'Sélectionnez les équipements ou détails de service proposés aux clients.',
    'admin.landing.facility_wifi': 'WiFi',
    'admin.landing.facility_accessible': 'Entrée accessible',
    'admin.landing.facility_parking': 'Parking',
    'admin.landing.facility_terrace': 'Terrasse',
    'admin.landing.facility_family': 'Espace famille',
    'menu_select_title': 'Sélectionner un menu',
    'game_how_to_play': 'Comment jouer ?',
    'game_logo_who': 'QUI',
    'game_logo_pays': 'PAIE ?'
});

Object.assign(window.translations.en, {
    'admin.login.title': 'Restaurant Admin',
    'admin.login.subtitle': 'Sign in to manage your restaurant',
    'admin.login.username_placeholder': 'Username',
    'admin.login.password_placeholder': 'Password',
    'admin.login.button': 'Sign In',
    'admin.login.incorrect_credentials': 'Incorrect credentials',
    'admin.login.server_connection_error': 'Server connection error',
    'admin.login.too_many_attempts': 'Too many attempts. Try again in {minutes} min.',
    'admin.mobile_title': 'RESTAURANT ADMIN',
    'admin.sidebar_title': 'Restaurant Admin',
    'admin.nav.menu': 'Menu Items',
    'admin.nav.categories': 'Categories',
    'admin.nav.branding': 'Branding',
    'admin.nav.landing': 'Landing Page',
    'admin.nav.parameters': 'Parameters',
    'admin.nav.supercategories': 'Super Categories',
    'admin.nav.hours': 'Hours',
    'admin.nav.wifi': 'WiFi',
    'admin.nav.data_tools': 'Seller Tools',
    'admin.nav.security': 'Security',
    'admin.nav.stats': 'Statistics',
    'admin.nav.gallery': 'Gallery',
    'admin.nav.save_changes': 'Save Changes',
    'admin.nav.logout': 'Logout',
    'admin.header.menu_management': 'Menu Management',
    'admin.header.parameters': 'Parameters',
    'admin.header.website_home': 'Website Home',
    'admin.save_state.idle_label': 'Ready',
    'admin.save_state.saving_label': 'Saving',
    'admin.save_state.success_label': 'Saved',
    'admin.save_state.error_label': 'Attention',
    'admin.save_state.idle_message': 'No server save yet in this session.',
    'admin.save_state.saving_message': 'Saving changes to the server...',
    'admin.save_state.success_message': 'All current changes are saved on the server.',
    'admin.save_state.error_message': 'Save failed.',
    'admin.save_state.error_prefix': 'Save failed',
    'admin.save_state.session_expired': 'Session expired. Please sign in again.',
    'admin.seller_tools.title': 'Seller Tools',
    'admin.seller_tools.subtitle': 'Review launch readiness, prepare handoff material, manage starter presets, and move restaurant data safely between instances.',
    'admin.parameters.branding': 'Brand Identity',
    'admin.parameters.landing': 'Website Content',
    'admin.parameters.wifi': 'WiFi & Contact',
    'admin.parameters.security': 'Access',
    'admin.parameters.subtitle': 'Manage the public website identity, key customer info, WiFi, and admin access from one configuration area.',
    'admin.tools.audit': 'Audit',
    'admin.tools.launch_readiness': 'Launch Readiness',
    'admin.tools.launch_readiness_desc': 'Review the current restaurant instance before handoff. This quick audit highlights missing branding, contact data, menu completeness, gallery coverage, and security issues.',
    'admin.tools.audit_loading': 'Audit loading...',
    'admin.tools.delivery': 'Delivery',
    'admin.tools.handoff_summary': 'Handoff Summary',
    'admin.tools.handoff_summary_desc': 'Generate a concise operational summary for this restaurant instance before delivery or internal review.',
    'admin.tools.generate_summary': 'Generate Summary',
    'admin.tools.copy_summary': 'Copy Summary',
    'admin.tools.download_summary': 'Download Summary',
    'admin.tools.handoff_summary_placeholder': 'Generate a summary to review the current restaurant setup.',
    'admin.tools.media': 'Media',
    'admin.tools.menu_image_suggestions': 'Menu Image Suggestions',
    'admin.tools.menu_image_suggestions_desc': 'Assign local library placeholders to menu items that still have no image. Use this as a fast internal delivery step before real client photos or future AI generation.',
    'admin.tools.assign_missing_images': 'Assign Missing Images',
    'admin.tools.menu_image_suggestions_placeholder': 'Run the suggestion tool to assign local library images to items without visuals.',
    'admin.tools.starter': 'Starter',
    'admin.tools.quick_launch_preset': 'Quick Launch Preset',
    'admin.tools.quick_launch_preset_desc': 'Apply a strong starting point for a fast-food, cafe, or traditional restaurant before you fine-tune the final content.',
    'admin.tools.apply_quick_launch': 'Apply Quick Launch Setup'
});

Object.assign(window.translations.en, {
    'admin.tools.backup': 'Backup',
    'admin.tools.export_current_restaurant': 'Export Current Restaurant',
    'admin.tools.export_current_restaurant_desc': 'Download the complete normalized website data including menu, branding, hours, translations, visibility, and section order.',
    'admin.tools.export_backup': 'Export Backup',
    'admin.tools.restore': 'Restore',
    'admin.tools.import_restaurant_backup': 'Import Restaurant Backup',
    'admin.tools.import_restaurant_backup_desc': 'Upload a previously exported JSON backup to restore or clone a restaurant setup quickly.',
    'admin.tools.import_backup': 'Import Backup',
    'admin.tools.reset': 'Reset',
    'admin.tools.starter_reset': 'Starter Reset',
    'admin.tools.starter_reset_desc': 'Reset this instance back to the bundled starter template when you want to begin a fresh restaurant setup.',
    'admin.tools.reset_to_starter': 'Reset To Starter',
    'admin.quick_launch.preset': 'Preset',
    'admin.quick_launch.restaurant_name': 'Restaurant Name',
    'admin.quick_launch.restaurant_name_placeholder': 'e.g. Atlas Restaurant',
    'admin.quick_launch.short_brand_name': 'Short Brand Name',
    'admin.quick_launch.short_brand_name_placeholder': 'e.g. Atlas',
    'admin.quick_launch.address': 'Address',
    'admin.quick_launch.address_placeholder': 'e.g. Avenue Hassan II, Casablanca',
    'admin.quick_launch.phone': 'Phone',
    'admin.quick_launch.phone_placeholder': '+212 6...',
    'admin.quick_launch.whatsapp_optional': 'WhatsApp (optional)',
    'admin.security.title': 'Admin Security',
    'admin.security.subtitle': 'Update the admin login used for this restaurant. Credential changes are stored in persisted server storage and survive redeploys.',
    'admin.security.admin_username': 'Admin Username',
    'admin.security.admin_username_placeholder': 'admin',
    'admin.security.admin_username_help': 'Minimum 3 characters. This becomes the next admin login for this restaurant.',
    'admin.security.new_password': 'New Password',
    'admin.security.password_placeholder': '********',
    'admin.security.new_password_help': 'Minimum 8 characters. Leave blank only if you want to keep the current password.',
    'admin.security.confirm_password': 'Confirm New Password',
    'admin.security.save_credentials': 'Save Credentials',
    'admin.security.what_happens_on_save': 'What happens on save',
    'admin.security.save_rule_1': 'Older admin sessions are closed automatically after credentials change.',
    'admin.security.save_rule_2': 'If the instance still relies on env credentials, saving here creates the local persisted auth file for this restaurant.',
    'admin.security.save_rule_3': 'Credential changes are stored at the configured persisted auth path, not only inside the running container.',
    'admin.security.handoff_policy': 'Handoff policy',
    'admin.security.handoff_policy_text': 'Do not deliver the website while default credentials remain active. Confirm the warning disappears in Launch Readiness and test a fresh login before handoff.',
    'admin.security.default_credentials_note': 'Default admin credentials are still active. Change them before client handoff.',
    'admin.security.legacy_plaintext_note': 'Credentials are still stored in the legacy plain-text format. Saving a new password will migrate them to secure hashed storage.',
    'admin.security.env_source_note': 'This instance currently relies on environment credentials. Saving here will create a local hashed auth file for this restaurant.',
    'admin.security.default_source_note': 'This instance is still using the built-in fallback credentials. Replace them before production delivery.',
    'admin.security.username_rule': 'Username rule: minimum 3 characters.',
    'admin.security.password_rule': 'Password rule: minimum {count} characters.',
    'admin.security.session_rule': 'When credentials change, older admin sessions are closed automatically.',
    'admin.security.status_title': 'Security Status',
    'admin.security.passwords_mismatch': 'Passwords do not match.',
    'admin.security.credentials_updated': 'Credentials updated successfully.',
    'admin.security.credentials_update_failed': 'Unable to update credentials.'
});

Object.assign(window.translations.en, {
    'admin.readiness.branding_media': 'Branding media',
    'admin.readiness.branding_media_ok': 'Logo and hero image are configured.',
    'admin.readiness.branding_media_missing': 'Add both a logo and a hero image before delivery.',
    'admin.readiness.core_contact_details': 'Core contact details',
    'admin.readiness.core_contact_details_ok': 'Address, map link, and phone are present.',
    'admin.readiness.core_contact_details_missing': 'Address, map URL, or phone is still incomplete.',
    'admin.readiness.opening_hours': 'Opening hours',
    'admin.readiness.opening_hours_ok': '{count} hour rows configured.',
    'admin.readiness.opening_hours_missing': 'Add opening hours before handoff.',
    'admin.readiness.menu_coverage': 'Menu coverage',
    'admin.readiness.menu_coverage_ok': '{count} menu items configured.',
    'admin.readiness.menu_coverage_missing': 'No menu items are configured yet.',
    'admin.readiness.menu_translations': 'Menu translations',
    'admin.readiness.menu_translations_empty': 'Add menu items before reviewing translations.',
    'admin.readiness.menu_translations_ok': 'All menu items have FR / EN / AR names.',
    'admin.readiness.menu_translations_missing': '{count} menu item(s) still miss one or more translated names.',
    'admin.readiness.item_imagery': 'Item imagery',
    'admin.readiness.item_imagery_empty': 'Add menu items before reviewing dish imagery.',
    'admin.readiness.item_imagery_ok': 'Every menu item has an image source.',
    'admin.readiness.item_imagery_managed': 'Every menu item has an image source. {count} item(s) still use managed library placeholders.',
    'admin.readiness.item_imagery_missing': '{count} menu item(s) still miss an image.',
    'admin.readiness.gallery': 'Gallery',
    'admin.readiness.gallery_ok': '{count} gallery image(s) configured.',
    'admin.readiness.gallery_missing': 'Add at least one gallery image for a more complete delivery.',
    'admin.readiness.admin_security': 'Admin security',
    'admin.readiness.admin_security_loading': 'Security status has not loaded yet.',
    'admin.readiness.admin_security_default': 'Default admin credentials are still active.',
    'admin.readiness.admin_security_ok': 'Custom admin credentials are active.',
    'admin.readiness.summary_ready': 'Ready for final review',
    'admin.readiness.summary_blockers': '{count} handoff blocker(s)',
    'admin.readiness.summary_progress': '{ok}/{total} checks passed',
    'admin.readiness.badge_ok': 'OK',
    'admin.readiness.badge_needs_work': 'Needs work',
    'admin.actions.open_branding': 'Open Branding',
    'admin.actions.open_landing': 'Open Landing',
    'admin.actions.open_hours': 'Open Hours',
    'admin.actions.open_menu': 'Open Menu',
    'admin.actions.open_gallery': 'Open Gallery',
    'admin.actions.open_security': 'Open Security'
});

Object.assign(window.translations.en, {
    'admin.media.status_title': 'Media Delivery Status',
    'admin.media.metric_blockers': '{count} blocker(s)',
    'admin.media.metric_warnings': '{count} warning(s)',
    'admin.media.metric_managed': '{count} managed',
    'admin.media.metric_missing_partial': '{missing} missing / {partial} partial',
    'admin.media.audit_unavailable_title': 'Media audit unavailable',
    'admin.media.audit_unavailable_detail': 'Run again after the restaurant data loads fully.',
    'admin.media.badge_pending': 'Pending',
    'admin.media.badge_blocks_handoff': 'Blocks handoff',
    'admin.media.badge_ready': 'Ready',
    'admin.media.badge_warning': 'Warning',
    'admin.media.policy_title': 'Seller policy',
    'admin.media.policy_blockers': '{blockers} media blocker(s) must be fixed before delivery. {warnings} other slot(s) are warnings only.',
    'admin.media.policy_warnings': 'No media blockers remain. {warnings} optional media warning(s) can still be improved before handoff.',
    'admin.media.policy_ready': 'Core media requirements are ready for delivery.',
    'admin.handoff.restaurant': 'Restaurant',
    'admin.handoff.short_brand': 'Short brand',
    'admin.handoff.website_url': 'Website URL',
    'admin.handoff.admin_url': 'Admin URL',
    'admin.handoff.admin_user': 'Admin user',
    'admin.handoff.phone': 'Phone',
    'admin.handoff.address': 'Address',
    'admin.handoff.menu_items': 'Menu items',
    'admin.handoff.library_placeholders': 'Library image placeholders',
    'admin.handoff.gallery_images': 'Gallery images',
    'admin.handoff.hours_rows': 'Hours rows',
    'admin.handoff.launch_readiness': 'Launch readiness',
    'admin.handoff.media_blockers': 'Media blockers',
    'admin.handoff.media_warnings': 'Media warnings',
    'admin.handoff.media_slots': 'Media slots',
    'admin.handoff.open_issues': 'Open issues',
    'admin.handoff.open_issues_none': 'none. Ready for final review.',
    'admin.handoff.generated': 'Handoff summary generated.',
    'admin.handoff.copied': 'Handoff summary copied.',
    'admin.handoff.downloaded': 'Handoff summary downloaded.',
    'admin.menu_images.summary_title': 'Menu image suggestion run',
    'admin.menu_images.items_reviewed': 'Items reviewed: {count}',
    'admin.menu_images.images_assigned': 'Images assigned: {count}',
    'admin.menu_images.items_already_covered': 'Items already covered: {count}',
    'admin.menu_images.high_confidence': 'High confidence matches: {count}',
    'admin.menu_images.medium_confidence': 'Medium confidence matches: {count}',
    'admin.menu_images.low_confidence': 'Low confidence matches: {count}',
    'admin.menu_images.fallback_confidence': 'Generic fallback placeholders: {count}',
    'admin.menu_images.assignments': 'Assignments',
    'admin.menu_images.assignments_none': 'Assignments: none. Every menu item already had an image.',
    'admin.menu_images.review_note': 'Review note: fallback assignments are generic placeholders and should be replaced first when better client media exists.',
    'admin.menu_images.none_missing': 'No missing menu images were found.',
    'admin.menu_images.assigned_toast': 'Assigned {count} menu image suggestion(s).',
    'admin.menu_images.run_first': 'Run the suggestion tool first.',
    'admin.menu_images.copied': 'Image suggestion summary copied.',
    'admin.section_order.about': 'About section',
    'admin.section_order.payments': 'Payment and facilities',
    'admin.section_order.events': 'Events section',
    'admin.section_order.gallery': 'Gallery section',
    'admin.section_order.hours': 'Hours section',
    'admin.section_order.contact': 'Contact section',
    'admin.common.not_set': 'Not set',
    'admin.common.none': 'none.',
    'admin.common.unavailable': 'unavailable.',
    'admin.common.copy_failed': 'Copy failed. Select the summary manually.',
    'admin.floating_save': 'Publish Changes',
    'admin.floating_save_title': 'Publish changes'
});

Object.assign(window.translations.en, {
    'admin.menu.title': 'Add New Food Item',
    'admin.menu.default_name': 'Default Name',
    'admin.menu.default_name_placeholder': 'e.g. Signature Plate',
    'admin.menu.category': 'Category',
    'admin.menu.default_description': 'Default Description',
    'admin.menu.default_description_placeholder': 'Used as the fallback when a translation is missing',
    'admin.menu.localized_names': 'Localized Names & Descriptions',
    'admin.menu.localized_names_hint': 'These fields power the French, English, and Arabic menu experience today and give the future AI importer a clean target schema.',
    'admin.lang.french': 'French',
    'admin.lang.english': 'English',
    'admin.lang.arabic': 'Arabic',
    'admin.menu.name_fr': 'Name (FR)',
    'admin.menu.name_fr_placeholder': 'Dish name in French',
    'admin.menu.description_fr': 'Description (FR)',
    'admin.menu.description_fr_placeholder': 'Dish description in French',
    'admin.menu.name_en': 'Name (EN)',
    'admin.menu.name_en_placeholder': 'Dish name in English',
    'admin.menu.description_en': 'Description (EN)',
    'admin.menu.description_en_placeholder': 'Dish description in English',
    'admin.menu.name_ar': 'Name (AR)',
    'admin.menu.name_ar_placeholder': 'Dish name in Arabic',
    'admin.menu.description_ar': 'Description (AR)',
    'admin.menu.description_ar_placeholder': 'Dish description in Arabic',
    'admin.menu.ingredients': 'Ingredients (Separate by commas)',
    'admin.menu.ingredients_placeholder': 'Tomato, Lettuce, Special Sauce...',
    'admin.menu.has_sizes': 'Item has Multiple Sizes',
    'admin.menu.featured': 'Featured Item',
    'admin.menu.available': 'Available / In Stock',
    'admin.menu.price': 'Price (MAD)',
    'admin.menu.price_small': 'Small Price',
    'admin.menu.price_medium': 'Medium Price',
    'admin.menu.price_large': 'Large Price',
    'admin.menu.gallery': 'Gallery (URLs or Upload)',
    'admin.menu.gallery_placeholder': 'Or paste URLs here (comma separated)...',
    'admin.menu.save_product': 'Save Product',
    'admin.menu.reset_all_data': 'Reset All Data',
    'admin.menu.existing_items': 'Existing Items (Select star for Promo of the Day)',
    'admin.table.image': 'Image',
    'admin.table.name': 'Name',
    'admin.table.category': 'Category',
    'admin.table.price': 'Price',
    'admin.table.actions': 'Actions',
    'admin.table.action': 'Action',
    'admin.table.items': 'Items',
    'admin.table.emoji': 'Emoji',
    'admin.categories.title': 'Add New Category',
    'admin.categories.name': 'Category Name',
    'admin.categories.name_placeholder': 'e.g. Hot Drinks',
    'admin.categories.emoji': 'Emoji',
    'admin.categories.name_fr': 'Category Name',
    'admin.categories.name_fr_placeholder': 'Category name in French',
    'admin.categories.name_en': 'Category Name',
    'admin.categories.name_en_placeholder': 'Category name in English',
    'admin.categories.name_ar': 'Category Name',
    'admin.categories.name_ar_placeholder': 'Category name in Arabic',
    'admin.categories.add': 'Add Category',
    'admin.categories.active': 'Active Categories',
    'admin.wifi.title': 'Network Settings',
    'admin.wifi.subtitle': 'Updates will be immediately visible to customers on the scan page.',
    'admin.wifi.name': 'WiFi Name (SSID)',
    'admin.wifi.password': 'Password',
    'admin.wifi.update': 'Update Network',
    'admin.wifi.preview': 'Customer View Preview:',
    'admin.wifi.preview_label': 'WiFi:',
    'admin.wifi.preview_pass': 'Pass:',
    'admin.stats.title': 'Business Overview',
    'admin.stats.total_products': 'Total Products',
    'admin.stats.categories': 'Categories',
    'admin.stats.promo_status': 'Promo Status',
    'admin.branding.title': 'Brand & Theme System',
    'admin.branding.subtitle': 'Configure the reusable identity that should follow this restaurant across the public website and menu.',
    'admin.branding.preset': 'Preset',
    'admin.branding.restaurant_name': 'Restaurant Name',
    'admin.branding.short_brand_name': 'Short Brand Name',
    'admin.branding.tagline': 'Tagline',
    'admin.branding.tagline_placeholder': 'e.g. Local cuisine, brunch & coffee',
    'admin.branding.logo_mark': 'Logo Mark',
    'admin.branding.logo_mark_placeholder': 'e.g. A',
    'admin.branding.primary_color': 'Primary Color',
    'admin.branding.secondary_color': 'Secondary Color',
    'admin.branding.accent_color': 'Accent Color',
    'admin.branding.surface_color': 'Surface Color',
    'admin.branding.muted_surface': 'Muted Surface',
    'admin.branding.text_color': 'Text Color',
    'admin.branding.muted_text': 'Muted Text',
    'admin.branding.menu_background': 'Menu Background',
    'admin.branding.menu_surface': 'Menu Surface',
    'admin.branding.logo_image_url': 'Logo Image URL',
    'admin.branding.logo_image_placeholder': '/uploads/logo.png or https://...',
    'admin.branding.hero_image_url': 'Hero Image URL',
    'admin.branding.hero_image_placeholder': '/uploads/cover.jpg or https://...',
    'admin.branding.hero_slide_2_url': 'Hero Slide 2 URL',
    'admin.branding.hero_slide_2_placeholder': '/uploads/cover-2.jpg or https://...',
    'admin.branding.hero_slide_3_url': 'Hero Slide 3 URL',
    'admin.branding.hero_slide_3_placeholder': '/uploads/cover-3.jpg or https://...',
    'admin.branding.logo_upload': 'Logo Upload',
    'admin.branding.logo_upload_desc': 'Use upload for faster delivery, while still keeping the URL field available when needed.',
    'admin.branding.clear_logo': 'Clear logo',
    'admin.branding.hero_upload': 'Hero Upload',
    'admin.branding.hero_upload_desc': 'Upload the cover image here and the URL field will be filled automatically.',
    'admin.branding.clear_hero': 'Clear hero',
    'admin.branding.hero_slide_2_upload': 'Hero Slide 2 Upload',
    'admin.branding.hero_slide_2_upload_desc': 'Use a second visual for the homepage slider if the client gives you more than one strong image.',
    'admin.branding.clear_slide_2': 'Clear slide 2',
    'admin.branding.hero_slide_3_upload': 'Hero Slide 3 Upload',
    'admin.branding.hero_slide_3_upload_desc': 'Add a third branded visual so the homepage slider feels fully finished instead of repeated.',
    'admin.branding.clear_slide_3': 'Clear slide 3',
    'admin.branding.live_preview': 'Live Brand Preview',
    'admin.branding.live_preview_desc': 'This preview helps you validate the colors, logo fallback, and hero feel before publishing.',
    'admin.branding.save': 'Save Branding',
    'admin.landing.title': 'Landing Page Configuration',
    'admin.landing.subtitle': 'Update what your customers see when they first visit your site.',
    'admin.landing.address': 'Address',
    'admin.landing.map_url': 'Map URL (Google Maps)',
    'admin.landing.phone_number': 'Phone Number',
    'admin.landing.instagram': 'Instagram Username',
    'admin.landing.instagram_placeholder': '@restaurant.official',
    'admin.landing.facebook': 'Facebook URL',
    'admin.landing.tiktok': 'TikTok URL',
    'admin.landing.tripadvisor': 'TripAdvisor URL',
    'admin.landing.payments_facilities': 'Payments & Facilities',
    'admin.landing.payments_facilities_desc': 'This is informational only for the public site. Use it to show what the restaurant accepts and what guests can expect on-site.',
    'admin.landing.accepted_payments': 'Accepted Payments',
    'admin.landing.accepted_payments_desc': 'Choose the payment methods you want to display on the homepage.',
    'admin.landing.payment_cash': 'Cash',
    'admin.landing.payment_tpe': 'TPE / Card terminal',
    'admin.landing.guest_facilities': 'Guest Facilities',
    'admin.landing.guest_facilities_desc': 'Pick the facilities or service details the restaurant offers to customers.',
    'admin.landing.facility_wifi': 'WiFi',
    'admin.landing.facility_accessible': 'Accessible entrance',
    'admin.landing.facility_parking': 'Parking',
    'admin.landing.facility_terrace': 'Terrace seating',
    'admin.landing.facility_family': 'Family-friendly area',
    'menu_select_title': 'Select a Menu',
    'game_how_to_play': 'How to play?',
    'game_logo_who': 'WHO',
    'game_logo_pays': 'PAYS?'
});

Object.assign(window.translations.ar, {
    'admin.login.title': 'إدارة المطعم',
    'admin.login.subtitle': 'سجّل الدخول لإدارة المطعم',
    'admin.login.username_placeholder': 'اسم المستخدم',
    'admin.login.password_placeholder': 'كلمة المرور',
    'admin.login.button': 'تسجيل الدخول',
    'admin.login.incorrect_credentials': 'بيانات الدخول غير صحيحة',
    'admin.login.server_connection_error': 'خطأ في الاتصال بالخادم',
    'admin.login.too_many_attempts': 'محاولات كثيرة. أعد المحاولة بعد {minutes} دقيقة.',
    'admin.mobile_title': 'إدارة المطعم',
    'admin.sidebar_title': 'إدارة المطعم',
    'admin.nav.menu': 'عناصر القائمة',
    'admin.nav.categories': 'الفئات',
    'admin.nav.branding': 'الهوية',
    'admin.nav.landing': 'صفحة الهبوط',
    'admin.nav.parameters': 'الإعدادات',
    'admin.nav.supercategories': 'الفئات العليا',
    'admin.nav.hours': 'الأوقات',
    'admin.nav.wifi': 'واي فاي',
    'admin.nav.data_tools': 'أدوات البائع',
    'admin.nav.security': 'الأمان',
    'admin.nav.stats': 'الإحصاءات',
    'admin.nav.gallery': 'المعرض',
    'admin.nav.save_changes': 'حفظ التعديلات',
    'admin.nav.logout': 'تسجيل الخروج',
    'admin.header.menu_management': 'إدارة القائمة',
    'admin.header.parameters': 'الإعدادات',
    'admin.header.website_home': 'الموقع الرئيسي',
    'admin.save_state.idle_label': 'جاهز',
    'admin.save_state.saving_label': 'جاري الحفظ',
    'admin.save_state.success_label': 'تم الحفظ',
    'admin.save_state.error_label': 'تنبيه',
    'admin.save_state.idle_message': 'لا توجد عملية حفظ على الخادم في هذه الجلسة.',
    'admin.save_state.saving_message': 'جاري حفظ التعديلات على الخادم...',
    'admin.save_state.success_message': 'تم حفظ كل التعديلات الحالية على الخادم.',
    'admin.save_state.error_message': 'فشل الحفظ.',
    'admin.save_state.error_prefix': 'فشل الحفظ',
    'admin.save_state.session_expired': 'انتهت الجلسة. يرجى تسجيل الدخول من جديد.',
    'admin.seller_tools.title': 'أدوات البائع',
    'admin.seller_tools.subtitle': 'راجع جاهزية الإطلاق، حضّر مواد التسليم، أدِر قوالب البداية، وانقل بيانات المطعم بأمان بين النسخ.',
    'admin.parameters.branding': 'هوية العلامة',
    'admin.parameters.landing': 'محتوى الموقع',
    'admin.parameters.wifi': 'الواي فاي والتواصل',
    'admin.parameters.security': 'الدخول',
    'admin.parameters.subtitle': 'أدر هوية الموقع العامة ومعلومات العملاء والواي فاي ودخول الإدارة من مكان واحد.',
    'admin.tools.audit': 'تدقيق',
    'admin.tools.launch_readiness': 'جاهزية الإطلاق',
    'admin.tools.launch_readiness_desc': 'راجع نسخة المطعم الحالية قبل التسليم. هذا التدقيق السريع يبرز النواقص في الهوية وبيانات التواصل واكتمال القائمة والمعرض والأمان.',
    'admin.tools.audit_loading': 'جاري تحميل التدقيق...',
    'admin.tools.delivery': 'التسليم',
    'admin.tools.handoff_summary': 'ملخص التسليم',
    'admin.tools.handoff_summary_desc': 'أنشئ ملخصًا تشغيليًا مختصرًا لهذه النسخة قبل التسليم أو المراجعة الداخلية.',
    'admin.tools.generate_summary': 'إنشاء الملخص',
    'admin.tools.copy_summary': 'نسخ الملخص',
    'admin.tools.download_summary': 'تنزيل الملخص',
    'admin.tools.handoff_summary_placeholder': 'أنشئ ملخصًا لمراجعة إعداد المطعم الحالي.',
    'admin.tools.media': 'الوسائط',
    'admin.tools.menu_image_suggestions': 'اقتراحات صور القائمة',
    'admin.tools.menu_image_suggestions_desc': 'عيّن صورًا محلية للعناصر التي لا تزال بلا صورة. استخدم هذا كخطوة تسليم داخلية سريعة قبل صور العميل الفعلية أو التوليد بالذكاء الاصطناعي.',
    'admin.tools.assign_missing_images': 'تعيين الصور الناقصة',
    'admin.tools.menu_image_suggestions_placeholder': 'شغّل الأداة لتعيين صور محلية للعناصر التي لا تحتوي على صور.'
});

Object.assign(window.translations.ar, {
    'admin.menu.title': 'إضافة عنصر طعام جديد',
    'admin.menu.default_name': 'الاسم الافتراضي',
    'admin.menu.default_name_placeholder': 'مثال: طبق مميز',
    'admin.menu.category': 'الفئة',
    'admin.menu.default_description': 'الوصف الافتراضي',
    'admin.menu.default_description_placeholder': 'يستخدم كخيار بديل إذا كانت الترجمة ناقصة',
    'admin.menu.localized_names': 'الأسماء والأوصاف المترجمة',
    'admin.menu.localized_names_hint': 'تدعم هذه الحقول تجربة القائمة الحالية بالفرنسية والإنجليزية والعربية وتوفر بنية واضحة للمستورد المستقبلي.',
    'admin.menu.name_fr': 'الاسم (FR)',
    'admin.menu.name_fr_placeholder': 'اسم الطبق بالفرنسية',
    'admin.menu.description_fr': 'الوصف (FR)',
    'admin.menu.description_fr_placeholder': 'وصف الطبق بالفرنسية',
    'admin.menu.name_en': 'الاسم (EN)',
    'admin.menu.name_en_placeholder': 'اسم الطبق بالإنجليزية',
    'admin.menu.description_en': 'الوصف (EN)',
    'admin.menu.description_en_placeholder': 'وصف الطبق بالإنجليزية',
    'admin.menu.name_ar': 'الاسم (AR)',
    'admin.menu.name_ar_placeholder': 'اسم الطبق بالعربية',
    'admin.menu.description_ar': 'الوصف (AR)',
    'admin.menu.description_ar_placeholder': 'وصف الطبق بالعربية',
    'admin.menu.ingredients': 'المكونات (مفصولة بفواصل)',
    'admin.menu.ingredients_placeholder': 'طماطم، خس، صلصة خاصة...',
    'admin.menu.has_sizes': 'العنصر له أحجام متعددة',
    'admin.menu.featured': 'عنصر مميز',
    'admin.menu.available': 'متاح / في المخزون',
    'admin.menu.price': 'السعر (MAD)',
    'admin.menu.price_small': 'سعر صغير',
    'admin.menu.price_medium': 'سعر متوسط',
    'admin.menu.price_large': 'سعر كبير',
    'admin.menu.gallery': 'المعرض (روابط أو رفع)',
    'admin.menu.gallery_placeholder': 'أو ألصق الروابط هنا (مفصولة بفواصل)...',
    'admin.menu.save_product': 'حفظ المنتج',
    'admin.menu.reset_all_data': 'إعادة ضبط كل البيانات',
    'admin.menu.existing_items': 'العناصر الحالية (اختر نجمة لعرض اليوم)',
    'admin.table.image': 'الصورة',
    'admin.table.name': 'الاسم',
    'admin.table.category': 'الفئة',
    'admin.table.price': 'السعر',
    'admin.table.actions': 'الإجراءات',
    'admin.table.action': 'إجراء',
    'admin.table.items': 'العناصر',
    'admin.table.emoji': 'إيموجي',
    'admin.categories.title': 'إضافة فئة جديدة',
    'admin.categories.name': 'اسم الفئة',
    'admin.categories.name_placeholder': 'مثال: مشروبات ساخنة',
    'admin.categories.name_fr': 'اسم الفئة',
    'admin.categories.name_fr_placeholder': 'اسم الفئة بالفرنسية',
    'admin.categories.name_en': 'اسم الفئة',
    'admin.categories.name_en_placeholder': 'اسم الفئة بالإنجليزية',
    'admin.categories.name_ar': 'اسم الفئة',
    'admin.categories.name_ar_placeholder': 'اسم الفئة بالعربية',
    'admin.categories.add': 'إضافة الفئة',
    'admin.categories.active': 'الفئات النشطة',
    'admin.wifi.title': 'إعدادات الشبكة',
    'admin.wifi.subtitle': 'ستظهر التحديثات فورًا للعملاء على صفحة المسح.',
    'admin.wifi.name': 'اسم الشبكة (SSID)',
    'admin.wifi.update': 'تحديث الشبكة',
    'admin.wifi.preview': 'معاينة العميل:',
    'admin.wifi.preview_label': 'واي فاي:',
    'admin.wifi.preview_pass': 'الرمز:',
    'admin.stats.title': 'نظرة عامة على النشاط',
    'admin.stats.total_products': 'إجمالي المنتجات',
    'admin.stats.categories': 'الفئات',
    'admin.stats.promo_status': 'حالة العرض',
    'admin.branding.title': 'نظام الهوية والثيم',
    'admin.branding.subtitle': 'اضبط الهوية القابلة لإعادة الاستخدام التي يجب أن ترافق هذا المطعم عبر الموقع العام والقائمة.',
    'admin.branding.preset': 'الإعداد',
    'admin.branding.restaurant_name': 'اسم المطعم',
    'admin.branding.short_brand_name': 'الاسم المختصر للعلامة',
    'admin.branding.tagline': 'الشعار النصي',
    'admin.branding.tagline_placeholder': 'مثال: مطبخ محلي، برنش وقهوة',
    'admin.branding.logo_mark': 'رمز الشعار',
    'admin.branding.logo_mark_placeholder': 'مثال: A',
    'admin.branding.primary_color': 'اللون الرئيسي',
    'admin.branding.secondary_color': 'اللون الثانوي',
    'admin.branding.accent_color': 'لون التمييز',
    'admin.branding.surface_color': 'لون السطح',
    'admin.branding.muted_surface': 'سطح هادئ',
    'admin.branding.text_color': 'لون النص',
    'admin.branding.muted_text': 'لون النص الثانوي',
    'admin.branding.menu_background': 'خلفية القائمة',
    'admin.branding.menu_surface': 'سطح القائمة',
    'admin.branding.logo_image_url': 'رابط صورة الشعار',
    'admin.branding.logo_image_placeholder': '/uploads/logo.png أو https://...',
    'admin.branding.hero_image_url': 'رابط صورة الواجهة',
    'admin.branding.hero_image_placeholder': '/uploads/cover.jpg أو https://...',
    'admin.branding.hero_slide_2_url': 'رابط شريحة الواجهة 2',
    'admin.branding.hero_slide_2_placeholder': '/uploads/cover-2.jpg أو https://...',
    'admin.branding.hero_slide_3_url': 'رابط شريحة الواجهة 3',
    'admin.branding.hero_slide_3_placeholder': '/uploads/cover-3.jpg أو https://...',
    'admin.branding.logo_upload': 'رفع الشعار',
    'admin.branding.logo_upload_desc': 'استخدم الرفع لتسليم أسرع مع الإبقاء على حقل الرابط عند الحاجة.',
    'admin.branding.clear_logo': 'مسح الشعار',
    'admin.branding.hero_upload': 'رفع صورة الواجهة',
    'admin.branding.hero_upload_desc': 'ارفع صورة الغلاف هنا وسيُملأ حقل الرابط تلقائيًا.',
    'admin.branding.clear_hero': 'مسح الواجهة',
    'admin.branding.hero_slide_2_upload': 'رفع شريحة الواجهة 2',
    'admin.branding.hero_slide_2_upload_desc': 'استخدم صورة ثانية إذا قدّم العميل أكثر من صورة قوية واحدة.',
    'admin.branding.clear_slide_2': 'مسح الشريحة 2',
    'admin.branding.hero_slide_3_upload': 'رفع شريحة الواجهة 3',
    'admin.branding.hero_slide_3_upload_desc': 'أضف صورة ثالثة ليبدو شريط الواجهة مكتملًا.',
    'admin.branding.clear_slide_3': 'مسح الشريحة 3',
    'admin.branding.live_preview': 'معاينة مباشرة للهوية',
    'admin.branding.live_preview_desc': 'تساعدك هذه المعاينة على التحقق من الألوان وسلوك الشعار وإحساس الواجهة قبل النشر.',
    'admin.branding.save': 'حفظ الهوية',
    'admin.landing.title': 'إعداد صفحة الهبوط',
    'admin.landing.subtitle': 'حدّث ما يراه العملاء عند زيارتهم الأولى للموقع.',
    'admin.landing.address': 'العنوان',
    'admin.landing.map_url': 'رابط الخريطة (Google Maps)',
    'admin.landing.phone_number': 'رقم الهاتف',
    'admin.landing.instagram': 'اسم مستخدم إنستغرام',
    'admin.landing.instagram_placeholder': '@restaurant.official',
    'admin.landing.facebook': 'رابط فيسبوك',
    'admin.landing.tiktok': 'رابط تيك توك',
    'admin.landing.tripadvisor': 'رابط TripAdvisor',
    'admin.landing.payments_facilities': 'الدفع والخدمات',
    'admin.landing.payments_facilities_desc': 'هذه المعلومات تعريفية فقط للموقع العام.',
    'admin.landing.accepted_payments': 'وسائل الدفع المقبولة',
    'admin.landing.accepted_payments_desc': 'اختر وسائل الدفع التي تريد عرضها على الصفحة الرئيسية.',
    'admin.landing.payment_cash': 'نقدًا',
    'admin.landing.payment_tpe': 'جهاز بطاقة / TPE',
    'admin.landing.guest_facilities': 'مرافق الضيوف',
    'admin.landing.guest_facilities_desc': 'اختر المرافق أو تفاصيل الخدمة التي يقدمها المطعم للعملاء.',
    'admin.landing.facility_wifi': 'واي فاي',
    'admin.landing.facility_accessible': 'مدخل ميسّر',
    'admin.landing.facility_parking': 'موقف سيارات',
    'admin.landing.facility_terrace': 'جلسات خارجية',
    'admin.landing.facility_family': 'منطقة عائلية',
    'menu_select_title': 'اختر قائمة',
    'game_how_to_play': 'كيف تلعب؟',
    'game_logo_who': 'من',
    'game_logo_pays': 'يدفع؟'
});

Object.assign(window.translations.ar, {
    'admin.tools.starter': 'البداية',
    'admin.tools.quick_launch_preset': 'إعداد الإطلاق السريع',
    'admin.tools.quick_launch_preset_desc': 'طبّق نقطة انطلاق قوية لمطعم وجبات سريعة أو مقهى أو مطعم تقليدي قبل ضبط المحتوى النهائي.',
    'admin.tools.apply_quick_launch': 'تطبيق إعداد الإطلاق السريع',
    'admin.tools.backup': 'النسخ الاحتياطي',
    'admin.tools.export_current_restaurant': 'تصدير المطعم الحالي',
    'admin.tools.export_current_restaurant_desc': 'نزّل بيانات الموقع الموحّدة كاملة بما في ذلك القائمة والهوية والأوقات والترجمات والظهور وترتيب الأقسام.',
    'admin.tools.export_backup': 'تصدير النسخة الاحتياطية',
    'admin.tools.restore': 'الاستعادة',
    'admin.tools.import_restaurant_backup': 'استيراد نسخة احتياطية للمطعم',
    'admin.tools.import_restaurant_backup_desc': 'ارفع ملف JSON تم تصديره سابقًا لاستعادة أو استنساخ إعداد مطعم بسرعة.',
    'admin.tools.import_backup': 'استيراد النسخة الاحتياطية',
    'admin.tools.reset': 'إعادة الضبط',
    'admin.tools.starter_reset': 'إعادة ضبط البداية',
    'admin.tools.starter_reset_desc': 'أعد هذه النسخة إلى القالب الابتدائي المرفق عندما تريد البدء من جديد.',
    'admin.tools.reset_to_starter': 'إعادة إلى البداية',
    'admin.quick_launch.preset': 'الإعداد',
    'admin.quick_launch.restaurant_name': 'اسم المطعم',
    'admin.quick_launch.restaurant_name_placeholder': 'مثال: Atlas Restaurant',
    'admin.quick_launch.short_brand_name': 'الاسم المختصر للعلامة',
    'admin.quick_launch.short_brand_name_placeholder': 'مثال: Atlas',
    'admin.quick_launch.address': 'العنوان',
    'admin.quick_launch.address_placeholder': 'مثال: Avenue Hassan II, Casablanca',
    'admin.quick_launch.phone': 'الهاتف',
    'admin.quick_launch.phone_placeholder': '+212 6...',
    'admin.quick_launch.whatsapp_optional': 'واتساب (اختياري)',
    'admin.security.title': 'أمان الإدارة',
    'admin.security.subtitle': 'حدّث بيانات دخول الإدارة الخاصة بهذا المطعم. تُخزَّن التغييرات في تخزين دائم وتبقى بعد إعادة النشر.',
    'admin.security.admin_username': 'اسم مستخدم الإدارة',
    'admin.security.admin_username_placeholder': 'admin',
    'admin.security.admin_username_help': 'الحد الأدنى 3 أحرف. سيصبح هذا تسجيل الدخول الإداري التالي لهذا المطعم.',
    'admin.security.new_password': 'كلمة المرور الجديدة',
    'admin.security.password_placeholder': '********',
    'admin.security.new_password_help': 'الحد الأدنى 8 أحرف. اتركه فارغًا فقط إذا أردت الاحتفاظ بكلمة المرور الحالية.',
    'admin.security.confirm_password': 'تأكيد كلمة المرور الجديدة',
    'admin.security.save_credentials': 'حفظ بيانات الدخول',
    'admin.security.what_happens_on_save': 'ماذا يحدث عند الحفظ',
    'admin.security.save_rule_1': 'تُغلق جلسات الإدارة القديمة تلقائيًا بعد تغيير بيانات الدخول.',
    'admin.security.save_rule_2': 'إذا كانت النسخة لا تزال تعتمد على بيانات البيئة، فإن الحفظ هنا ينشئ ملف توثيق محلي دائم لهذا المطعم.',
    'admin.security.save_rule_3': 'تُحفظ تغييرات بيانات الدخول في مسار التوثيق الدائم المكوّن، وليس فقط داخل الحاوية الحالية.',
    'admin.security.handoff_policy': 'سياسة التسليم',
    'admin.security.handoff_policy_text': 'لا تسلّم الموقع بينما ما تزال بيانات الدخول الافتراضية مفعّلة. تأكد من اختفاء التحذير في جاهزية الإطلاق وجرّب تسجيل دخول جديد قبل التسليم.'
});

Object.assign(window.translations.ar, {
    'admin.security.default_credentials_note': 'بيانات الدخول الافتراضية للإدارة ما تزال مفعّلة. غيّرها قبل التسليم.',
    'admin.security.legacy_plaintext_note': 'ما تزال بيانات الدخول محفوظة بصيغة النص القديم. حفظ كلمة مرور جديدة سينقلها إلى تخزين آمن ومشفّر.',
    'admin.security.env_source_note': 'تعتمد هذه النسخة حاليًا على بيانات اعتماد البيئة. الحفظ هنا سينشئ ملف توثيق محليًا مشفّرًا لهذا المطعم.',
    'admin.security.default_source_note': 'ما تزال هذه النسخة تستخدم بيانات الدخول الاحتياطية المدمجة. استبدلها قبل التسليم الإنتاجي.',
    'admin.security.username_rule': 'قاعدة اسم المستخدم: 3 أحرف على الأقل.',
    'admin.security.password_rule': 'قاعدة كلمة المرور: {count} أحرف على الأقل.',
    'admin.security.session_rule': 'عند تغيير بيانات الدخول، تُغلق جلسات الإدارة القديمة تلقائيًا.',
    'admin.security.status_title': 'حالة الأمان',
    'admin.security.passwords_mismatch': 'كلمتا المرور غير متطابقتين.',
    'admin.security.credentials_updated': 'تم تحديث بيانات الدخول بنجاح.',
    'admin.security.credentials_update_failed': 'تعذر تحديث بيانات الدخول.',
    'admin.readiness.branding_media': 'وسائط الهوية',
    'admin.readiness.branding_media_ok': 'تم إعداد الشعار وصورة الواجهة.',
    'admin.readiness.branding_media_missing': 'أضف الشعار وصورة الواجهة قبل التسليم.',
    'admin.readiness.core_contact_details': 'بيانات التواصل الأساسية',
    'admin.readiness.core_contact_details_ok': 'العنوان ورابط الخريطة والهاتف موجودة.',
    'admin.readiness.core_contact_details_missing': 'العنوان أو رابط الخريطة أو الهاتف ما يزال غير مكتمل.',
    'admin.readiness.opening_hours': 'أوقات العمل',
    'admin.readiness.opening_hours_ok': 'تم إعداد {count} صف(وف) للأوقات.',
    'admin.readiness.opening_hours_missing': 'أضف أوقات العمل قبل التسليم.',
    'admin.readiness.menu_coverage': 'تغطية القائمة',
    'admin.readiness.menu_coverage_ok': 'تم إعداد {count} عنصرًا في القائمة.',
    'admin.readiness.menu_coverage_missing': 'لم يتم إعداد عناصر القائمة بعد.',
    'admin.readiness.menu_translations': 'ترجمات القائمة',
    'admin.readiness.menu_translations_empty': 'أضف عناصر القائمة قبل مراجعة الترجمات.',
    'admin.readiness.menu_translations_ok': 'كل عناصر القائمة تحتوي على أسماء FR / EN / AR.',
    'admin.readiness.menu_translations_missing': 'لا يزال {count} عنصر/عناصر يفتقد اسمًا مترجمًا واحدًا أو أكثر.',
    'admin.readiness.item_imagery': 'صور العناصر',
    'admin.readiness.item_imagery_empty': 'أضف عناصر القائمة قبل مراجعة الصور.',
    'admin.readiness.item_imagery_ok': 'كل عنصر قائمة لديه مصدر صورة.',
    'admin.readiness.item_imagery_managed': 'كل عنصر قائمة لديه مصدر صورة. ما يزال {count} عنصرًا يستخدم صورًا مؤقتة مُدارة.',
    'admin.readiness.item_imagery_missing': 'ما يزال {count} عنصرًا بدون صورة.',
    'admin.readiness.gallery': 'المعرض',
    'admin.readiness.gallery_ok': 'تم إعداد {count} صورة في المعرض.',
    'admin.readiness.gallery_missing': 'أضف صورة واحدة على الأقل للمعرض لتسليم أكثر اكتمالاً.',
    'admin.readiness.admin_security': 'أمان الإدارة',
    'admin.readiness.admin_security_loading': 'لم يتم تحميل حالة الأمان بعد.',
    'admin.readiness.admin_security_default': 'بيانات الدخول الافتراضية للإدارة ما تزال مفعّلة.',
    'admin.readiness.admin_security_ok': 'بيانات دخول مخصصة للإدارة مفعّلة.',
    'admin.readiness.summary_ready': 'جاهز للمراجعة النهائية',
    'admin.readiness.summary_blockers': '{count} مانع/موانع للتسليم',
    'admin.readiness.summary_progress': 'نجح {ok} من أصل {total} فحصًا',
    'admin.readiness.badge_ok': 'موافق',
    'admin.readiness.badge_needs_work': 'يحتاج عملاً'
});

Object.assign(window.translations.ar, {
    'admin.actions.open_branding': 'فتح الهوية',
    'admin.actions.open_landing': 'فتح صفحة الهبوط',
    'admin.actions.open_hours': 'فتح الأوقات',
    'admin.actions.open_menu': 'فتح القائمة',
    'admin.actions.open_gallery': 'فتح المعرض',
    'admin.actions.open_security': 'فتح الأمان',
    'admin.media.status_title': 'حالة تسليم الوسائط',
    'admin.media.metric_blockers': '{count} مانع',
    'admin.media.metric_warnings': '{count} تحذير',
    'admin.media.metric_managed': '{count} مُدار',
    'admin.media.metric_missing_partial': '{missing} مفقود / {partial} جزئي',
    'admin.media.audit_unavailable_title': 'تدقيق الوسائط غير متاح',
    'admin.media.audit_unavailable_detail': 'أعد المحاولة بعد اكتمال تحميل بيانات المطعم.',
    'admin.media.badge_pending': 'قيد الانتظار',
    'admin.media.badge_blocks_handoff': 'يمنع التسليم',
    'admin.media.badge_ready': 'جاهز',
    'admin.media.badge_warning': 'تحذير',
    'admin.media.policy_title': 'سياسة البائع',
    'admin.media.policy_blockers': 'يجب إصلاح {blockers} مانع/موانع وسائط قبل التسليم. بينما {warnings} فتحة/فتحات أخرى هي مجرد تحذيرات.',
    'admin.media.policy_warnings': 'لا توجد موانع وسائط متبقية. ما يزال بالإمكان تحسين {warnings} تحذير/تحذيرات اختيارية قبل التسليم.',
    'admin.media.policy_ready': 'متطلبات الوسائط الأساسية جاهزة للتسليم.',
    'admin.handoff.restaurant': 'المطعم',
    'admin.handoff.short_brand': 'الاسم المختصر',
    'admin.handoff.website_url': 'رابط الموقع',
    'admin.handoff.admin_url': 'رابط الإدارة',
    'admin.handoff.admin_user': 'مستخدم الإدارة',
    'admin.handoff.phone': 'الهاتف',
    'admin.handoff.address': 'العنوان',
    'admin.handoff.menu_items': 'عناصر القائمة',
    'admin.handoff.library_placeholders': 'الصور المؤقتة من المكتبة',
    'admin.handoff.gallery_images': 'صور المعرض',
    'admin.handoff.hours_rows': 'صفوف الأوقات',
    'admin.handoff.launch_readiness': 'جاهزية الإطلاق',
    'admin.handoff.media_blockers': 'موانع الوسائط',
    'admin.handoff.media_warnings': 'تحذيرات الوسائط',
    'admin.handoff.media_slots': 'خانات الوسائط',
    'admin.handoff.open_issues': 'النقاط المفتوحة',
    'admin.handoff.open_issues_none': 'لا توجد. جاهز للمراجعة النهائية.',
    'admin.handoff.generated': 'تم إنشاء ملخص التسليم.',
    'admin.handoff.copied': 'تم نسخ ملخص التسليم.',
    'admin.handoff.downloaded': 'تم تنزيل ملخص التسليم.',
    'admin.menu_images.summary_title': 'تشغيل اقتراحات صور القائمة',
    'admin.menu_images.items_reviewed': 'العناصر التي تمت مراجعتها: {count}',
    'admin.menu_images.images_assigned': 'الصور التي تم تعيينها: {count}',
    'admin.menu_images.items_already_covered': 'العناصر المغطاة مسبقًا: {count}',
    'admin.menu_images.high_confidence': 'مطابقات عالية الثقة: {count}',
    'admin.menu_images.medium_confidence': 'مطابقات متوسطة الثقة: {count}',
    'admin.menu_images.low_confidence': 'مطابقات منخفضة الثقة: {count}',
    'admin.menu_images.fallback_confidence': 'صور بديلة عامة: {count}',
    'admin.menu_images.assignments': 'التعيينات',
    'admin.menu_images.assignments_none': 'التعيينات: لا شيء. كل عنصر قائمة لديه صورة بالفعل.',
    'admin.menu_images.review_note': 'ملاحظة: التعيينات البديلة هي صور مؤقتة عامة ويجب استبدالها أولاً عندما تتوفر وسائط أقوى للعميل.',
    'admin.menu_images.none_missing': 'لم يتم العثور على صور قائمة مفقودة.',
    'admin.menu_images.assigned_toast': 'تم تعيين {count} اقتراح/اقتراحات لصورة القائمة.',
    'admin.menu_images.run_first': 'شغّل أداة الاقتراح أولاً.',
    'admin.menu_images.copied': 'تم نسخ ملخص اقتراحات الصور.',
    'admin.section_order.about': 'قسم من نحن',
    'admin.section_order.payments': 'قسم الدفع والخدمات',
    'admin.section_order.events': 'قسم الفعاليات',
    'admin.section_order.gallery': 'قسم المعرض',
    'admin.section_order.hours': 'قسم الأوقات',
    'admin.section_order.contact': 'قسم التواصل',
    'admin.common.not_set': 'غير محدد',
    'admin.common.none': 'لا يوجد.',
    'admin.common.unavailable': 'غير متاح.',
    'admin.common.copy_failed': 'فشل النسخ. حدّد الملخص يدويًا.',
    'admin.floating_save': 'نشر التعديلات',
    'admin.floating_save_title': 'نشر التعديلات'
});

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
