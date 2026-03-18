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

function cloneStarterMenuItem(item) {
    return {
        ...item,
        ingredients: Array.isArray(item.ingredients) ? [...item.ingredients] : [],
        images: Array.isArray(item.images) ? [...item.images] : [],
        sizes: item.sizes ? { ...item.sizes } : undefined,
        translations: cloneStarterTranslations(item.translations)
    };
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
    superCategories: [
        {
            id: "cuisine",
            name: "Cuisine maison",
            desc: "Entrées et recettes signatures",
            emoji: "🍽️",
            cats: ["Entrées", "Plats"]
        },
        {
            id: "signatures",
            name: "Signatures",
            desc: "Assiettes, sandwichs et recettes maison",
            emoji: "⭐",
            cats: ["Signatures"]
        },
        {
            id: "desserts",
            name: "Douceurs",
            desc: "Desserts pour finir en beauté",
            emoji: "🍰",
            cats: ["Desserts"]
        },
        {
            id: "boissons",
            name: "Boissons",
            desc: "Boissons fraîches et boissons chaudes",
            emoji: "🥤",
            cats: ["Boissons"]
        }
    ]
};

// The white-label starter pack is the active runtime default.
window.defaultMenu = window.whiteLabelStarterSeed.menu.map(cloneStarterMenuItem);
window.defaultCatEmojis = { ...window.whiteLabelStarterSeed.catEmojis };
window.defaultSuperCategories = window.whiteLabelStarterSeed.superCategories.map((group) => ({
    ...group,
    cats: Array.isArray(group.cats) ? [...group.cats] : []
}));

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

window.mergeRestaurantConfig = function (patch) {
    const source = patch && typeof patch === 'object' ? patch : {};
    const current = window.restaurantConfig || {};
    const next = { ...current, ...source };
    const currentContentTranslations = normalizeContentTranslations(current.contentTranslations || window.defaultConfig.contentTranslations);
    const sourceContentTranslations = normalizeContentTranslations(source.contentTranslations || {});

    next.location = { ...window.defaultConfig.location, ...(current.location || {}), ...(source.location || {}) };
    next.socials = { ...window.defaultConfig.socials, ...(current.socials || {}), ...(source.socials || {}) };
    next.wifi = { ...window.defaultConfig.wifi, ...(current.wifi || {}), ...(source.wifi || {}) };
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

    if (!Array.isArray(next.superCategories)) {
        next.superCategories = Array.isArray(current.superCategories)
            ? current.superCategories
            : window.defaultSuperCategories;
    }

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
        document.title = `Menu | ${titleBase}`;
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
    if (aboutTagline && branding.tagline) {
        aboutTagline.textContent = branding.tagline;
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
        hero_sub1: 'Une table pour', hero_title1: 'SAVEURS <span>AUTHENTIQUES</span>', hero_cta: 'COMMANDER EN LIGNE',
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
        wifi_connect_title: 'Connexion WiFi',
        wifi_network_label: 'Réseau',
        modal_close: 'FERMER',
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
        admin_panel_link: 'Admin Panel',
        site_title_suffix: 'Commandez en ligne',
        promo_badge: 'PROMO DU JOUR', promo_add: 'AJOUTER AU PANIER',
        ingredients_label: 'Ingrédients', add_to_cart: 'AJOUTER AU PANIER',
        ticket_title: 'VOTRE TICKET', ticket_subtitle: 'Merci de votre confiance!',
        ticket_order_no: 'Commande N°', ticket_date: 'Date', ticket_total: 'TOTAL',
        ticket_service: 'Mode', ticket_client: 'Client', ticket_addr: 'Adresse',
        ticket_footer: 'Veuillez présenter ce ticket à la caisse.',
    },
    en: {
        status_open: 'Open', status_closed: 'Closed', status_loading: 'Loading...',
        nav_home: 'Home', nav_menu: 'Menu', nav_about: 'About Us', nav_events: 'Events', nav_gallery: 'Gallery',
        nav_contact: 'Contact Us', nav_hours: 'Hours', nav_order: 'ORDER ONLINE', nav_directions: 'GET DIRECTIONS',
        hero_sub1: 'A table for', hero_title1: 'AUTHENTIC <span>FLAVOR</span>', hero_cta: 'ORDER ONLINE',
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
    },
    ar: {
        status_open: 'مفتوح', status_closed: 'مغلق', status_loading: 'جاري التحميل...',
        nav_home: 'الرئيسية', nav_menu: 'القائمة', nav_about: 'من نحن', nav_events: 'الفعاليات', nav_gallery: 'المعرض',
        nav_contact: 'اتصل بنا', nav_hours: 'أوقات العمل', nav_order: 'اطلب الآن', nav_directions: 'الاتجاهات',
        hero_sub1: 'تجربة من', hero_title1: 'نكهات <span>أصيلة</span>', hero_cta: 'اطلب أونلاين',
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
