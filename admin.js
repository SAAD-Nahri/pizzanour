let menu = [];
let catEmojis = window.defaultCatEmojis || {};
let categoryImages = window.defaultCategoryImages || {};
window.categoryImages = categoryImages;
let categoryTranslations = window.defaultCategoryTranslations || {};
let restaurantConfig = window.restaurantConfig || window.defaultConfig || {};
let promoIds = [];
let lastImporterDraft = null;
let lastImporterDraftMeta = null;
let lastImporterReviewReport = null;
const IMPORT_STUDIO_MAX_MENU_IMAGES = 8;
let adminAuth = { user: 'admin', pass: '' };
let adminSecurityStatus = null;
let adminCapabilities = {
    sellerToolsEnabled: false,
    aiMediaToolsEnabled: false
};
let adminSaveState = {
    type: 'idle',
    message: '',
    updatedAt: null
};
const ADMIN_ICON = Object.freeze({
    bullet: String.fromCodePoint(0x2022),
    heart: String.fromCodePoint(0x2764, 0xFE0F),
    star: String.fromCodePoint(0x2B50),
    sparkle: String.fromCodePoint(0x2728),
    edit: String.fromCodePoint(0x270F, 0xFE0F),
    image: String.fromCodePoint(0x1F5BC, 0xFE0F),
    trash: String.fromCodePoint(0x1F5D1, 0xFE0F),
    camera: String.fromCodePoint(0x1F4F7)
});

function t(key, fallback = '', vars = {}) {
    if (typeof window.formatTranslation === 'function') {
        return window.formatTranslation(key, fallback, vars);
    }
    return fallback;
}

// Admin category filter state
let currentAdminCategory = typeof window.getStoredAdminCategoryFilter === 'function'
    ? window.getStoredAdminCategoryFilter()
    : 'All';

const CONTENT_EDITOR_LANGUAGES = ['fr', 'en', 'ar'];
const LANDING_CONTENT_FIELDS = [
    { key: 'hero_sub1', label: 'Hero Slide 1 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title1', label: 'Hero Slide 1 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_sub2', label: 'Hero Slide 2 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title2', label: 'Hero Slide 2 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_desc2', label: 'Hero Slide 2 - Description', type: 'textarea', hint: 'Short supporting sentence for the second slide.' },
    { key: 'hero_sub3', label: 'Hero Slide 3 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title3', label: 'Hero Slide 3 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_desc3', label: 'Hero Slide 3 - Description', type: 'textarea', hint: 'Short supporting sentence for the third slide.' },
    { key: 'about_p1', label: 'About - Paragraph 1', type: 'textarea', hint: 'Opening paragraph for your restaurant story.' },
    { key: 'about_p2', label: 'About - Paragraph 2', type: 'textarea', hint: 'Details about quality, style, or philosophy.' },
    { key: 'about_p3', label: 'About - Paragraph 3', type: 'textarea', hint: 'Closing paragraph and promise to customers.' },
    { key: 'event_birthday', label: 'Events - Birthday Title', type: 'text', hint: 'Title for the first event/service card.' },
    { key: 'event_birthday_desc', label: 'Events - Birthday Description', type: 'textarea', hint: 'Description for the first event/service card.' },
    { key: 'event_family', label: 'Events - Family Title', type: 'text', hint: 'Title for the second event/service card.' },
    { key: 'event_family_desc', label: 'Events - Family Description', type: 'textarea', hint: 'Description for the second event/service card.' },
    { key: 'event_corporate', label: 'Events - Corporate Title', type: 'text', hint: 'Title for the third event/service card.' },
    { key: 'event_corporate_desc', label: 'Events - Corporate Description', type: 'textarea', hint: 'Description for the third event/service card.' },
    { key: 'event_party', label: 'Events - Private Party Title', type: 'text', hint: 'Title for the fourth event/service card.' },
    { key: 'event_party_desc', label: 'Events - Private Party Description', type: 'textarea', hint: 'Description for the fourth event/service card.' },
    { key: 'events_cta_text', label: 'Events - CTA Text', type: 'textarea', hint: 'Closing sentence before the contact button.' },
    { key: 'footer_note', label: 'Footer - Note', type: 'textarea', hint: 'Small footer sentence that reinforces the restaurant identity.' },
    { key: 'footer_rights', label: 'Footer - Rights Text', type: 'text', hint: 'Short legal/footer rights sentence shown after the year and restaurant name.' }
];
const MENU_ITEM_TRANSLATION_LANGUAGES = [
    { code: 'fr', label: 'French' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' }
];
const GUEST_EXPERIENCE_PAYMENT_FIELDS = {
    cash: 'lpPayCash',
    tpe: 'lpPayTpe'
};
const GUEST_EXPERIENCE_FACILITY_FIELDS = {
    wifi: 'lpFacilityWifi',
    accessible: 'lpFacilityAccessible',
    parking: 'lpFacilityParking',
    terrace: 'lpFacilityTerrace',
    family: 'lpFacilityFamily'
};
const SECTION_VISIBILITY_FIELDS = {
    about: 'lpSectionAbout',
    payments: 'lpSectionPayments',
    events: 'lpSectionEvents',
    gallery: 'lpSectionGallery',
    hours: 'lpSectionHours',
    contact: 'lpSectionContact'
};
const INFO_SECTION_IDS = ['info', 'landing', 'wifi', 'hours', 'security'];
const BRANDING_SECTION_IDS = ['branding', 'gallery'];
const MENU_WORKSPACE_SECTION_IDS = ['menu', 'categories', 'supercategories'];
const MENU_WORKSPACE_STEPS = ['supercategories', 'categories', 'items'];
const BRANDING_WORKSPACE_TABS = ['identity', 'homepage', 'gallery'];
const ADMIN_SECTION_ORDER_KEYS = ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];
const SECTION_ORDER_LABELS = {
    about: 'admin.section_order.about',
    payments: 'admin.section_order.payments',
    events: 'admin.section_order.events',
    gallery: 'admin.section_order.gallery',
    hours: 'admin.section_order.hours',
    contact: 'admin.section_order.contact'
};
let landingSectionOrderDraft = [...ADMIN_SECTION_ORDER_KEYS];
let currentMenuWorkspaceStep = 'supercategories';
let currentBrandingWorkspaceTab = 'identity';
let menuBuilderSelectedSuperCategoryId = '';
let menuBuilderSelectedCategoryKey = '';
const PRESET_THEME_TOKENS = {
    fast_food: {
        presetId: 'fast_food',
        heroImage: 'images/hero-fast.svg',
        surfaceColor: '#FFF5ED',
        surfaceMuted: '#F8E7D8',
        textColor: '#251715',
        textMuted: '#735E56',
        menuBackground: '#140F12',
        menuSurface: '#21181D'
    },
    cafe: {
        presetId: 'cafe',
        heroImage: 'images/hero-cafe.svg',
        surfaceColor: '#FBF5EE',
        surfaceMuted: '#EFE3D4',
        textColor: '#2B211B',
        textMuted: '#75675E',
        menuBackground: '#171311',
        menuSurface: '#241C18'
    },
    traditional: {
        presetId: 'traditional',
        heroImage: 'images/hero-traditional.svg',
        surfaceColor: '#FBF4EA',
        surfaceMuted: '#F1E2CD',
        textColor: '#291C18',
        textMuted: '#78655A',
        menuBackground: '#151112',
        menuSurface: '#24191A'
    }
};

function getPresetThemePack(presetId) {
    if (typeof window.getBrandPresetConfig === 'function') {
        return window.getBrandPresetConfig(presetId);
    }
    return PRESET_THEME_TOKENS[presetId] || PRESET_THEME_TOKENS.fast_food;
}
const ONBOARDING_PRESETS = {
    fast_food: {
        branding: {
            logoMark: 'ðŸ”',
            primaryColor: '#c62828',
            secondaryColor: '#ff8f00',
            accentColor: '#ffd54f',
            tagline: 'Quick service, generous plates, and an easy-to-love local concept.'
        },
        guestExperience: {
            paymentMethods: ['cash', 'tpe'],
            facilities: ['wifi', 'terrace']
        },
        sectionVisibility: {
            about: true,
            payments: true,
            events: false,
            gallery: true,
            hours: true,
            contact: true
        },
        sectionOrder: ['about', 'payments', 'gallery', 'hours', 'contact', 'events'],
        contentTranslations: {
            fr: {
                hero_sub1: 'Une adresse pour',
                hero_title1: 'FAIM <span>BIEN SERVIE</span>',
                hero_sub2: 'DÃ©couvrez les',
                hero_title2: 'INCONTOURNABLES <span>{{shortName}}</span>',
                hero_desc2: 'Des recettes gÃ©nÃ©reuses, rapides et pensÃ©es pour revenir souvent.',
                hero_sub3: 'Sur place, Ã  emporter',
                hero_title3: 'CHAUD <span>ET RAPIDE</span>',
                hero_desc3: 'Une expÃ©rience simple, gourmande et efficace toute la journÃ©e.',
                about_p1: '{{restaurantName}} propose une cuisine rÃ©confortante, bien exÃ©cutÃ©e et facile Ã  recommander.',
                about_p2: 'Nous misons sur des recettes lisibles, des portions gÃ©nÃ©reuses et un service rÃ©gulier pour toutes les visites du quotidien.',
                about_p3: 'Notre ambition est simple : devenir une adresse fiable pour manger vite, bien, et avec plaisir.',
                event_birthday: 'Anniversaires',
                event_birthday_desc: 'Un format simple et convivial pour les petits groupes.',
                event_family: 'Repas entre amis',
                event_family_desc: 'Des plats Ã  partager et une ambiance dÃ©contractÃ©e.',
                event_corporate: 'Commandes de groupe',
                event_corporate_desc: 'Une solution rapide pour les Ã©quipes et les commandes en volume.',
                event_party: 'SoirÃ©es privÃ©es',
                event_party_desc: 'Un point de rencontre gourmand pour vos moments informels.',
                events_cta_text: 'Besoin dâ€™un format groupe ou dâ€™une privatisation lÃ©gÃ¨re ? Contactez-nous.',
                footer_note: 'Cuisine gÃ©nÃ©reuse, service rapide et adresse facile Ã  recommander.'
            },
            en: {
                hero_sub1: 'A place for',
                hero_title1: 'HUNGER <span>DONE RIGHT</span>',
                hero_sub2: 'Discover the',
                hero_title2: '{{shortName}} <span>FAVORITES</span>',
                hero_desc2: 'Generous recipes, quick service, and a concept built for repeat visits.',
                hero_sub3: 'Dine in or takeaway',
                hero_title3: 'HOT <span>AND FAST</span>',
                hero_desc3: 'A simple, satisfying, all-day food experience.',
                about_p1: '{{restaurantName}} is built around approachable favorites that are easy to enjoy and easy to recommend.',
                about_p2: 'We focus on clear recipes, generous portions, and consistent service for everyday visits.',
                about_p3: 'The goal is simple: become a reliable address when people want something fast, warm, and satisfying.',
                event_birthday: 'Birthdays',
                event_birthday_desc: 'A simple and friendly format for small groups.',
                event_family: 'Friends & family meals',
                event_family_desc: 'Shareable dishes in a relaxed atmosphere.',
                event_corporate: 'Group orders',
                event_corporate_desc: 'A fast option for teams and larger orders.',
                event_party: 'Private nights',
                event_party_desc: 'A casual food spot for informal celebrations.',
                events_cta_text: 'Need a group format or light privatization? Contact us.',
                footer_note: 'Generous dishes, quick service, and a local address worth revisiting.'
            },
            ar: {
                hero_sub1: 'Ø¹Ù†ÙˆØ§Ù† Ù…Ù† Ø£Ø¬Ù„',
                hero_title1: 'Ø§Ù„Ø¬ÙˆØ¹ <span>Ø§Ù„Ù…Ø´Ø¨ÙŽØ¹</span>',
                hero_sub2: 'Ø§ÙƒØªØ´Ù',
                hero_title2: 'Ù…ÙØ¶Ù„Ø§Øª <span>{{shortName}}</span>',
                hero_desc2: 'ÙˆØµÙØ§Øª Ø³Ø®ÙŠØ© ÙˆØ®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØªØ¬Ø±Ø¨Ø© ØªØ´Ø¬Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø¹ÙˆØ¯Ø©.',
                hero_sub3: 'Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø·Ø¹Ù… Ø£Ùˆ Ù„Ù„Ø·Ù„Ø¨',
                hero_title3: 'Ø³Ø§Ø®Ù† <span>ÙˆØ³Ø±ÙŠØ¹</span>',
                hero_desc3: 'ØªØ¬Ø±Ø¨Ø© Ø¨Ø³ÙŠØ·Ø© ÙˆÙ…Ø´Ø¨Ø¹Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„ÙŠÙˆÙ… ÙƒÙ„Ù‡.',
                about_p1: '{{restaurantName}} ÙŠÙ‚Ø¯Ù… Ø£ÙƒÙ„Ø§Øª Ù…Ø±ÙŠØ­Ø© ÙˆØ³Ù‡Ù„Ø© Ø§Ù„ØªÙˆØµÙŠØ© Ø¨Ù‡Ø§ Ù…Ù† Ø£ÙˆÙ„ Ø²ÙŠØ§Ø±Ø©.',
                about_p2: 'Ù†Ø±ÙƒØ² Ø¹Ù„Ù‰ ÙˆØµÙØ§Øª ÙˆØ§Ø¶Ø­Ø© ÙˆØ­ØµØµ Ø³Ø®ÙŠØ© ÙˆØ®Ø¯Ù…Ø© Ù…Ù†ØªØ¸Ù…Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ø²ÙŠØ§Ø±Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©.',
                about_p3: 'Ù‡Ø¯ÙÙ†Ø§ ÙˆØ§Ø¶Ø­: Ø£Ù† Ù†ØµØ¨Ø­ Ø¹Ù†ÙˆØ§Ù†Ø§Ù‹ Ù…ÙˆØ«ÙˆÙ‚Ø§Ù‹ Ù„Ù…Ù† ÙŠØ±ÙŠØ¯ Ø£ÙƒÙ„Ø§Ù‹ Ø³Ø±ÙŠØ¹Ø§Ù‹ ÙˆÙ„Ø°ÙŠØ°Ø§Ù‹ ÙˆÙ…Ø´Ø¨Ø¹Ø§Ù‹.',
                event_birthday: 'Ø£Ø¹ÙŠØ§Ø¯ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯',
                event_birthday_desc: 'ØµÙŠØºØ© Ø¨Ø³ÙŠØ·Ø© ÙˆÙ…Ù…ØªØ¹Ø© Ù„Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„ØµØºÙŠØ±Ø©.',
                event_family: 'Ù„Ù‚Ø§Ø¡Ø§Øª Ø§Ù„Ø£ØµØ¯Ù‚Ø§Ø¡ ÙˆØ§Ù„Ø¹Ø§Ø¦Ù„Ø©',
                event_family_desc: 'Ø£Ø·Ø¨Ø§Ù‚ Ù„Ù„Ù…Ø´Ø§Ø±ÙƒØ© ÙÙŠ Ø£Ø¬ÙˆØ§Ø¡ Ù…Ø±ÙŠØ­Ø©.',
                event_corporate: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª',
                event_corporate_desc: 'Ø­Ù„ Ø³Ø±ÙŠØ¹ Ù„Ù„ÙØ±Ù‚ ÙˆØ§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ÙƒØ¨ÙŠØ±Ø©.',
                event_party: 'Ø£Ù…Ø³ÙŠØ§Øª Ø®Ø§ØµØ©',
                event_party_desc: 'Ù…ÙƒØ§Ù† Ù…Ø±ÙŠØ­ Ù„Ù„Ø§Ø­ØªÙØ§Ù„Ø§Øª ØºÙŠØ± Ø§Ù„Ø±Ø³Ù…ÙŠØ©.',
                events_cta_text: 'Ù‡Ù„ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØµÙŠØºØ© Ø¬Ù…Ø§Ø¹ÙŠØ© Ø£Ùˆ Ø­Ø¬Ø² Ø®ÙÙŠÙØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
                footer_note: 'Ø£ÙƒÙ„ Ø³Ø®ÙŠ ÙˆØ®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØ¹Ù†ÙˆØ§Ù† ÙŠØ³ØªØ­Ù‚ Ø§Ù„Ø²ÙŠØ§Ø±Ø© Ù…Ù† Ø¬Ø¯ÙŠØ¯.'
            }
        }
    },
    cafe: {
        branding: {
            logoMark: 'â˜•',
            primaryColor: '#5d4037',
            secondaryColor: '#c08b5c',
            accentColor: '#f4d6a0',
            tagline: 'Coffee, brunch, and slow moments worth sharing.'
        },
        guestExperience: {
            paymentMethods: ['cash', 'tpe'],
            facilities: ['wifi', 'terrace', 'family']
        },
        sectionVisibility: {
            about: true,
            payments: true,
            events: true,
            gallery: true,
            hours: true,
            contact: true
        },
        sectionOrder: ['about', 'gallery', 'payments', 'events', 'hours', 'contact'],
        contentTranslations: {
            fr: {
                hero_sub1: 'Un lieu pour',
                hero_title1: 'CAFÃ‰ <span>& BRUNCH</span>',
                hero_sub2: 'Savourez les',
                hero_title2: 'INSTANTS <span>{{shortName}}</span>',
                hero_desc2: 'Une adresse chaleureuse pour le cafÃ©, les douceurs et les rendez-vous du quotidien.',
                hero_sub3: 'Du matin au goÃ»ter',
                hero_title3: 'DOUX <span>& SOIGNÃ‰</span>',
                hero_desc3: 'Des recettes maison et une atmosphÃ¨re pensÃ©e pour prendre son temps.',
                about_p1: '{{restaurantName}} est pensÃ© comme une adresse lumineuse pour le cafÃ©, le brunch et les pauses qui font du bien.',
                about_p2: 'Nous travaillons une carte simple, soignÃ©e et accueillante, idÃ©ale pour un rendez-vous, une pause ou un moment Ã  partager.',
                about_p3: 'Notre promesse : une expÃ©rience douce, rÃ©guliÃ¨re et agrÃ©able, du premier cafÃ© au dernier dessert.',
                event_birthday: 'Brunchs privÃ©s',
                event_birthday_desc: 'Un format convivial pour les matinÃ©es et anniversaires en petit comitÃ©.',
                event_family: 'Rencontres entre proches',
                event_family_desc: 'Un lieu calme et chaleureux pour se retrouver autour dâ€™une belle table.',
                event_corporate: 'RÃ©unions cafÃ©',
                event_corporate_desc: 'Un cadre dÃ©tendu pour les rendez-vous professionnels et pauses dâ€™Ã©quipe.',
                event_party: 'GoÃ»ters & cÃ©lÃ©brations',
                event_party_desc: 'Une ambiance douce pour les moments Ã  partager.',
                events_cta_text: 'Vous prÃ©parez un brunch, une rÃ©union ou un goÃ»ter privÃ© ? Ã‰crivez-nous.',
                footer_note: 'CafÃ©, brunch et douceurs servis dans une ambiance chaleureuse.'
            },
            en: {
                hero_sub1: 'A place for',
                hero_title1: 'COFFEE <span>& BRUNCH</span>',
                hero_sub2: 'Enjoy the',
                hero_title2: '{{shortName}} <span>MOMENTS</span>',
                hero_desc2: 'A warm address for coffee, pastries, brunch, and everyday meetups.',
                hero_sub3: 'From morning to afternoon',
                hero_title3: 'CALM <span>& CRAFTED</span>',
                hero_desc3: 'House-made recipes and an atmosphere designed for slower moments.',
                about_p1: '{{restaurantName}} is designed as a bright and welcoming address for coffee, brunch, and everyday breaks.',
                about_p2: 'We focus on a simple, polished menu that works for meetings, catch-ups, and relaxed pauses.',
                about_p3: 'Our promise is a soft, reliable experience from the first coffee to the final dessert.',
                event_birthday: 'Private brunches',
                event_birthday_desc: 'A friendly setup for morning celebrations and intimate birthdays.',
                event_family: 'Gatherings with loved ones',
                event_family_desc: 'A calm, warm place to reconnect around a beautiful table.',
                event_corporate: 'Coffee meetings',
                event_corporate_desc: 'A relaxed setting for professional meetings and team breaks.',
                event_party: 'Tea time & celebrations',
                event_party_desc: 'A softer atmosphere for shared moments.',
                events_cta_text: 'Planning a brunch, meeting, or private tea time? Contact us.',
                footer_note: 'Coffee, brunch, and house-made treats in a warm setting.'
            },
            ar: {
                hero_sub1: 'Ù…ÙƒØ§Ù† Ù…Ù† Ø£Ø¬Ù„',
                hero_title1: 'Ø§Ù„Ù‚Ù‡ÙˆØ© <span>ÙˆØ§Ù„Ø¨Ø±Ù†Ø´</span>',
                hero_sub2: 'Ø§Ø³ØªÙ…ØªØ¹ Ø¨Ù€',
                hero_title2: 'Ù„Ø­Ø¸Ø§Øª <span>{{shortName}}</span>',
                hero_desc2: 'Ø¹Ù†ÙˆØ§Ù† Ø¯Ø§ÙØ¦ Ù„Ù„Ù‚Ù‡ÙˆØ© ÙˆØ§Ù„Ø­Ù„ÙˆÙŠØ§Øª ÙˆØ§Ù„Ù„Ù‚Ø§Ø¡Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©.',
                hero_sub3: 'Ù…Ù† Ø§Ù„ØµØ¨Ø§Ø­ Ø¥Ù„Ù‰ Ø§Ù„Ø¹ØµØ±',
                hero_title3: 'Ù‡Ø§Ø¯Ø¦ <span>ÙˆÙ…ØªÙ‚Ù†</span>',
                hero_desc3: 'ÙˆØµÙØ§Øª Ù…Ù†Ø²Ù„ÙŠØ© ÙˆØ£Ø¬ÙˆØ§Ø¡ ØªÙ…Ù†Ø­Ùƒ ÙˆÙ‚ØªØ§Ù‹ Ø£Ø¬Ù…Ù„.',
                about_p1: '{{restaurantName}} ØµÙÙ…Ù… ÙƒØ¹Ù†ÙˆØ§Ù† Ù…Ø±ÙŠØ­ Ù„Ù„Ù‚Ù‡ÙˆØ© ÙˆØ§Ù„Ø¨Ø±Ù†Ø´ ÙˆØ§Ù„Ø§Ø³ØªØ±Ø§Ø­Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©.',
                about_p2: 'Ù†Ù‚Ø¯Ù… Ù‚Ø§Ø¦Ù…Ø© Ø¨Ø³ÙŠØ·Ø© ÙˆØ£Ù†ÙŠÙ‚Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆØ§Ù„Ù„Ù‚Ø§Ø¡Ø§Øª ÙˆØ§Ù„Ù„Ø­Ø¸Ø§Øª Ø§Ù„Ù‡Ø§Ø¯Ø¦Ø©.',
                about_p3: 'ÙˆØ¹Ø¯Ù†Ø§ Ù‡Ùˆ ØªØ¬Ø±Ø¨Ø© Ù„Ø·ÙŠÙØ© ÙˆØ«Ø§Ø¨ØªØ© Ù…Ù† Ø£ÙˆÙ„ ÙÙ†Ø¬Ø§Ù† Ù‚Ù‡ÙˆØ© Ø¥Ù„Ù‰ Ø¢Ø®Ø± Ø­Ù„ÙˆÙ‰.',
                event_birthday: 'Ø¨Ø±Ù†Ø´Ø§Øª Ø®Ø§ØµØ©',
                event_birthday_desc: 'ØµÙŠØºØ© ÙˆØ¯ÙŠØ© Ù„Ù„Ø§Ø­ØªÙØ§Ù„Ø§Øª Ø§Ù„ØµØ¨Ø§Ø­ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„ØµØºÙŠØ±Ø©.',
                event_family: 'Ù„Ù‚Ø§Ø¡Ø§Øª Ø¹Ø§Ø¦Ù„ÙŠØ©',
                event_family_desc: 'Ù…ÙƒØ§Ù† Ù‡Ø§Ø¯Ø¦ ÙˆØ¯Ø§ÙØ¦ Ù„Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ Ø­ÙˆÙ„ Ø·Ø§ÙˆÙ„Ø© Ø¬Ù…ÙŠÙ„Ø©.',
                event_corporate: 'Ù„Ù‚Ø§Ø¡Ø§Øª Ø¹Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù‚Ù‡ÙˆØ©',
                event_corporate_desc: 'Ø¬Ùˆ Ù…Ø±ÙŠØ­ Ù„Ù„Ø§Ø¬ØªÙ…Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‡Ù†ÙŠØ© ÙˆØ§Ø³ØªØ±Ø§Ø­Ø§Øª Ø§Ù„ÙØ±Ù‚.',
                event_party: 'Ø´Ø§ÙŠ Ø§Ù„Ø¹ØµØ± ÙˆØ§Ù„Ø§Ø­ØªÙØ§Ù„Ø§Øª',
                event_party_desc: 'Ø£Ø¬ÙˆØ§Ø¡ Ù„Ø·ÙŠÙØ© Ù„Ù„Ø­Ø¸Ø§Øª Ø§Ù„Ù…Ø´ØªØ±ÙƒØ©.',
                events_cta_text: 'Ù‡Ù„ ØªØ®Ø·Ø· Ù„Ø¨Ø±Ù†Ø´ Ø£Ùˆ Ù„Ù‚Ø§Ø¡ Ø£Ùˆ Ù…Ù†Ø§Ø³Ø¨Ø© Ø®Ø§ØµØ©ØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
                footer_note: 'Ù‚Ù‡ÙˆØ© ÙˆØ¨Ø±Ù†Ø´ ÙˆØ­Ù„ÙˆÙŠØ§Øª Ù…Ù†Ø²Ù„ÙŠØ© ÙÙŠ Ø£Ø¬ÙˆØ§Ø¡ Ø¯Ø§ÙØ¦Ø©.'
            }
        }
    },
    traditional: {
        branding: {
            logoMark: 'ðŸ²',
            primaryColor: '#8d2f23',
            secondaryColor: '#b97745',
            accentColor: '#d6b17a',
            tagline: 'Traditional recipes, family tables, and generous hospitality.'
        },
        guestExperience: {
            paymentMethods: ['cash', 'tpe'],
            facilities: ['wifi', 'parking', 'family']
        },
        sectionVisibility: {
            about: true,
            payments: true,
            events: true,
            gallery: true,
            hours: true,
            contact: true
        },
        sectionOrder: ['about', 'events', 'payments', 'gallery', 'hours', 'contact'],
        contentTranslations: {
            fr: {
                hero_sub1: 'Une maison de',
                hero_title1: 'SAVEURS <span>TRADITIONNELLES</span>',
                hero_sub2: 'Retrouvez les',
                hero_title2: 'RECETTES <span>{{shortName}}</span>',
                hero_desc2: 'Des plats sincÃ¨res, une table familiale et un accueil gÃ©nÃ©reux.',
                hero_sub3: 'Pour les repas Ã  partager',
                hero_title3: 'AUTHENTIQUE <span>& CHALEUREUX</span>',
                hero_desc3: 'Une cuisine de tradition pensÃ©e pour les grandes et petites occasions.',
                about_p1: '{{restaurantName}} valorise la cuisine traditionnelle, les recettes de transmission et les repas qui rassemblent.',
                about_p2: 'Nous privilÃ©gions la gÃ©nÃ©rositÃ©, les saveurs connues, et une atmosphÃ¨re familiale qui met les invitÃ©s Ã  lâ€™aise.',
                about_p3: 'Notre objectif est dâ€™offrir une adresse de confiance pour les repas du quotidien comme pour les moments importants.',
                event_birthday: 'Repas de famille',
                event_birthday_desc: 'Une table accueillante pour cÃ©lÃ©brer les temps forts en famille.',
                event_family: 'Retrouvailles',
                event_family_desc: 'Un cadre adaptÃ© aux repas gÃ©nÃ©reux et aux longues conversations.',
                event_corporate: 'Repas dâ€™Ã©quipe',
                event_corporate_desc: 'Un format chaleureux pour accueillir collÃ¨gues et partenaires.',
                event_party: 'FÃªtes traditionnelles',
                event_party_desc: 'Une cuisine de partage pour les cÃ©lÃ©brations privÃ©es.',
                events_cta_text: 'Vous prÃ©parez un repas de groupe ou une cÃ©lÃ©bration ? Contactez-nous.',
                footer_note: 'Recettes traditionnelles, table familiale et hospitalitÃ© gÃ©nÃ©reuse.'
            },
            en: {
                hero_sub1: 'A home for',
                hero_title1: 'TRADITIONAL <span>FLAVORS</span>',
                hero_sub2: 'Rediscover the',
                hero_title2: '{{shortName}} <span>RECIPES</span>',
                hero_desc2: 'Sincere dishes, a family table, and generous hospitality.',
                hero_sub3: 'For shared meals',
                hero_title3: 'AUTHENTIC <span>& WARM</span>',
                hero_desc3: 'Traditional cooking made for everyday meals and special occasions.',
                about_p1: '{{restaurantName}} celebrates traditional cooking, passed-down recipes, and meals that bring people together.',
                about_p2: 'We focus on generosity, familiar flavors, and a family atmosphere that makes guests feel at home.',
                about_p3: 'Our aim is to offer a trusted address for everyday meals as well as meaningful celebrations.',
                event_birthday: 'Family meals',
                event_birthday_desc: 'A welcoming table for important moments with loved ones.',
                event_family: 'Gatherings',
                event_family_desc: 'A setting designed for generous meals and long conversations.',
                event_corporate: 'Team meals',
                event_corporate_desc: 'A warm format for colleagues, partners, and hosted lunches.',
                event_party: 'Traditional celebrations',
                event_party_desc: 'A sharing-style kitchen for private celebrations.',
                events_cta_text: 'Planning a group meal or celebration? Contact us.',
                footer_note: 'Traditional recipes, family tables, and generous hospitality.'
            },
            ar: {
                hero_sub1: 'Ø¨ÙŠØª Ù„Ù€',
                hero_title1: 'Ø§Ù„Ù†ÙƒÙ‡Ø§Øª <span>Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ©</span>',
                hero_sub2: 'Ø§ÙƒØªØ´Ù Ù…Ù† Ø¬Ø¯ÙŠØ¯',
                hero_title2: 'ÙˆØµÙØ§Øª <span>{{shortName}}</span>',
                hero_desc2: 'Ø£Ø·Ø¨Ø§Ù‚ ØµØ§Ø¯Ù‚Ø© ÙˆØ·Ø§ÙˆÙ„Ø© Ø¹Ø§Ø¦Ù„ÙŠØ© ÙˆØ§Ø³ØªÙ‚Ø¨Ø§Ù„ ÙƒØ±ÙŠÙ….',
                hero_sub3: 'Ù„Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„Ù…Ø´ØªØ±ÙƒØ©',
                hero_title3: 'Ø£ØµÙŠÙ„ <span>ÙˆØ¯Ø§ÙØ¦</span>',
                hero_desc3: 'Ù…Ø·Ø¨Ø® ØªÙ‚Ù„ÙŠØ¯ÙŠ ÙŠÙ†Ø§Ø³Ø¨ Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø¹Ø§Ø¯ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„Ø®Ø§ØµØ©.',
                about_p1: '{{restaurantName}} ÙŠØ­ØªÙÙŠ Ø¨Ø§Ù„Ù…Ø·Ø¨Ø® Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠ ÙˆØ§Ù„ÙˆØµÙØ§Øª Ø§Ù„Ù…ØªÙˆØ§Ø±Ø«Ø© ÙˆØ§Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ØªÙŠ ØªØ¬Ù…Ø¹ Ø§Ù„Ù†Ø§Ø³.',
                about_p2: 'Ù†Ø±ÙƒØ² Ø¹Ù„Ù‰ Ø§Ù„ÙƒØ±Ù… ÙˆØ§Ù„Ù†ÙƒÙ‡Ø§Øª Ø§Ù„Ù…Ø£Ù„ÙˆÙØ© ÙˆØ£Ø¬ÙˆØ§Ø¡ Ø¹Ø§Ø¦Ù„ÙŠØ© ØªØ¬Ø¹Ù„ Ø§Ù„Ø¶ÙŠÙˆÙ ÙŠØ´Ø¹Ø±ÙˆÙ† Ø¨Ø§Ù„Ø±Ø§Ø­Ø©.',
                about_p3: 'Ù‡Ø¯ÙÙ†Ø§ Ø£Ù† Ù†Ù‚Ø¯Ù… Ø¹Ù†ÙˆØ§Ù†Ø§Ù‹ Ù…ÙˆØ«ÙˆÙ‚Ø§Ù‹ Ù„Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙˆÙ„Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„Ù…Ù‡Ù…Ø© Ø£ÙŠØ¶Ø§Ù‹.',
                event_birthday: 'ÙˆØ¬Ø¨Ø§Øª Ø¹Ø§Ø¦Ù„ÙŠØ©',
                event_birthday_desc: 'Ø·Ø§ÙˆÙ„Ø© Ù…Ø±Ø­Ø¨Ø© Ù„Ù„Ø§Ø­ØªÙØ§Ù„ Ø¨Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ù…Ø¹ Ø§Ù„Ø£Ø­Ø¨Ø§Ø¨.',
                event_family: 'Ù„Ù‚Ø§Ø¡Ø§Øª ÙˆÙ„Ù…Ù‘Ø§Øª',
                event_family_desc: 'Ù…ÙƒØ§Ù† Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„Ø³Ø®ÙŠØ© ÙˆØ§Ù„Ø£Ø­Ø§Ø¯ÙŠØ« Ø§Ù„Ø·ÙˆÙŠÙ„Ø©.',
                event_corporate: 'ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ÙØ±Ù‚',
                event_corporate_desc: 'ØµÙŠØºØ© Ø¯Ø§ÙØ¦Ø© Ù„Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø²Ù…Ù„Ø§Ø¡ ÙˆØ§Ù„Ø´Ø±ÙƒØ§Ø¡.',
                event_party: 'Ø§Ø­ØªÙØ§Ù„Ø§Øª ØªÙ‚Ù„ÙŠØ¯ÙŠØ©',
                event_party_desc: 'Ù…Ø·Ø¨Ø® Ù‚Ø§Ø¦Ù… Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© Ù„Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„Ø®Ø§ØµØ©.',
                events_cta_text: 'Ù‡Ù„ ØªØ®Ø·Ø· Ù„ÙˆØ¬Ø¨Ø© Ø¬Ù…Ø§Ø¹ÙŠØ© Ø£Ùˆ Ø§Ø­ØªÙØ§Ù„ØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
                footer_note: 'ÙˆØµÙØ§Øª ØªÙ‚Ù„ÙŠØ¯ÙŠØ© ÙˆØ·Ø§ÙˆÙ„Ø© Ø¹Ø§Ø¦Ù„ÙŠØ© ÙˆØ¶ÙŠØ§ÙØ© ÙƒØ±ÙŠÙ…Ø©.'
            }
        }
    }
};

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toInlineJsString(value) {
    return JSON.stringify(String(value ?? ''));
}

function normalizeMenuItemTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    const out = {};

    MENU_ITEM_TRANSLATION_LANGUAGES.forEach(({ code }) => {
        const bucket = source[code] && typeof source[code] === 'object' ? source[code] : {};
        out[code] = {
            name: typeof bucket.name === 'string' ? bucket.name.trim() : '',
            desc: typeof bucket.desc === 'string' ? bucket.desc.trim() : ''
        };
    });

    return out;
}

function getMenuItemTranslationInputId(field, lang) {
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    return field === 'name' ? `itemName${suffix}` : `itemDesc${suffix}`;
}

function setMenuItemTranslationFields(input) {
    const translations = normalizeMenuItemTranslations(input);
    MENU_ITEM_TRANSLATION_LANGUAGES.forEach(({ code }) => {
        const nameInput = document.getElementById(getMenuItemTranslationInputId('name', code));
        const descInput = document.getElementById(getMenuItemTranslationInputId('desc', code));
        if (nameInput) nameInput.value = translations[code].name;
        if (descInput) descInput.value = translations[code].desc;
    });
}

function buildMenuItemTranslations() {
    const translations = {};

    MENU_ITEM_TRANSLATION_LANGUAGES.forEach(({ code }) => {
        const nameInput = document.getElementById(getMenuItemTranslationInputId('name', code));
        const descInput = document.getElementById(getMenuItemTranslationInputId('desc', code));
        translations[code] = {
            name: nameInput ? nameInput.value.trim() : '',
            desc: descInput ? descInput.value.trim() : ''
        };
    });

    return translations;
}

function getAdminItemDisplayName(item) {
    if (typeof item?.name === 'string' && item.name.trim()) {
        return item.name.trim();
    }

    const translations = normalizeMenuItemTranslations(item?.translations);
    return translations.fr.name || translations.en.name || translations.ar.name || 'Unnamed item';
}

function getAdminItemDisplayDescription(item) {
    if (typeof item?.desc === 'string' && item.desc.trim()) {
        return item.desc.trim();
    }

    const translations = normalizeMenuItemTranslations(item?.translations);
    return translations.fr.desc || translations.en.desc || translations.ar.desc || '';
}

function renderMenuTranslationBadges(item) {
    const translations = normalizeMenuItemTranslations(item?.translations);

    return MENU_ITEM_TRANSLATION_LANGUAGES.map(({ code, label }) => {
        const bucket = translations[code];
        const isFilled = Boolean(bucket.name || bucket.desc);
        const title = `${label}: ${isFilled ? 'ready' : 'missing'}`;
        return `<span class="translation-badge ${isFilled ? 'is-filled' : ''}" title="${escapeHtml(title)}">${code.toUpperCase()}</span>`;
    }).join('');
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

function getCategoryTranslations(catKey) {
    return normalizeEntityTranslations(categoryTranslations?.[catKey]);
}

function setCategoryTranslationFields(catKey = '') {
    const translations = getCategoryTranslations(catKey);
    const baseName = typeof catKey === 'string' ? catKey.trim() : '';
    const fieldMap = {
        fr: 'catNameFr',
        en: 'catNameEn',
        ar: 'catNameAr'
    };

    Object.entries(fieldMap).forEach(([lang, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = translations[lang].name || (lang === 'fr' ? baseName : '');
        }
    });
}

function buildCategoryTranslations(baseName) {
    const safeBaseName = typeof baseName === 'string' ? baseName.trim() : '';
    const next = normalizeEntityTranslations(categoryTranslations?.[safeBaseName]);

    ['fr', 'en', 'ar'].forEach((lang) => {
        const input = document.getElementById(`catName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        next[lang].name = input ? input.value.trim() : '';
        next[lang].desc = '';
    });

    if (!next.fr.name && safeBaseName) {
        next.fr.name = safeBaseName;
    }

    return next;
}

function getAssignedSuperCategoryIdForCategory(catKey = '') {
    const safeKey = typeof catKey === 'string' ? catKey.trim() : '';
    if (!safeKey) return '';
    const configured = Array.isArray(restaurantConfig.superCategories) ? restaurantConfig.superCategories : [];
    const match = configured.find((entry) => Array.isArray(entry?.cats) && entry.cats.includes(safeKey));
    return match?.id || '';
}

function populateCategorySuperCategoryOptions(selectedId = '') {
    const select = document.getElementById('catSuperCategory');
    if (!select) return;

    const configured = Array.isArray(restaurantConfig.superCategories) ? restaurantConfig.superCategories : [];
    const currentValue = selectedId || select.value || '';
    const options = ['<option value="">Select a super category</option>']
        .concat(configured.map((entry) => `<option value="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</option>`));

    select.innerHTML = options.join('');
    select.value = currentValue;
}

function setSuperCategoryTranslationFields(input, fallbackName = '', fallbackDesc = '') {
    const translations = normalizeEntityTranslations(input);
    ['fr', 'en', 'ar'].forEach((lang) => {
        const nameInput = document.getElementById(`scName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        const descInput = document.getElementById(`scDesc${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        if (nameInput) nameInput.value = translations[lang].name || (lang === 'fr' ? fallbackName : '');
        if (descInput) descInput.value = translations[lang].desc || (lang === 'fr' ? fallbackDesc : '');
    });
}

function resetCategoryFormState() {
    const form = document.getElementById('catForm');
    if (form) form.reset();
    const editingKeyInput = document.getElementById('catEditingKey');
    if (editingKeyInput) editingKeyInput.value = '';
    populateCategorySuperCategoryOptions(menuBuilderSelectedSuperCategoryId || '');
    setCategoryTranslationFields();
    updateCategoryImagePreview();
}

function normalizeCategoryImagePath(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function updateCategoryImagePreview() {
    const previewShell = document.getElementById('catImagePreview');
    const previewImg = document.getElementById('catImagePreviewImg');
    const previewFallback = document.getElementById('catImagePreviewFallback');
    const input = document.getElementById('catImage');
    if (!previewShell || !previewImg || !previewFallback) return;

    const nextImage = normalizeCategoryImagePath(input ? input.value : '');
    if (nextImage) {
        previewShell.classList.add('has-image');
        previewImg.style.display = '';
        previewFallback.style.display = 'none';
        previewImg.src = nextImage;
        previewImg.onerror = () => {
            previewShell.classList.remove('has-image');
            previewImg.style.display = 'none';
            previewFallback.style.display = '';
            previewImg.onerror = null;
        };
        return;
    }

    previewShell.classList.remove('has-image');
    previewImg.style.display = 'none';
    previewImg.removeAttribute('src');
    previewFallback.style.display = '';
}

function bindCategoryImageFormEvents() {
    const imageInput = document.getElementById('catImage');
    const uploadInput = document.getElementById('catImageUpload');

    if (imageInput && !imageInput.dataset.boundPreview) {
        imageInput.dataset.boundPreview = 'true';
        imageInput.addEventListener('input', updateCategoryImagePreview);
        imageInput.addEventListener('change', updateCategoryImagePreview);
    }

    if (uploadInput && !uploadInput.dataset.boundPreview) {
        uploadInput.dataset.boundPreview = 'true';
        uploadInput.addEventListener('change', () => {
            const file = uploadInput.files && uploadInput.files[0];
            const previewShell = document.getElementById('catImagePreview');
            const previewImg = document.getElementById('catImagePreviewImg');
            const previewFallback = document.getElementById('catImagePreviewFallback');
            if (!previewShell || !previewImg || !previewFallback) return;
            if (!file) {
                updateCategoryImagePreview();
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            previewShell.classList.add('has-image');
            previewImg.style.display = '';
            previewFallback.style.display = 'none';
            previewImg.src = objectUrl;
            previewImg.onload = () => {
                URL.revokeObjectURL(objectUrl);
                previewImg.onload = null;
            };
        });
    }
}

function resetSuperCategoryFormState() {
    const form = document.getElementById('superCatForm');
    if (form) form.reset();
    const editingIdInput = document.getElementById('scEditingId');
    if (editingIdInput) editingIdInput.value = '';
    setSuperCategoryTranslationFields();
    document.querySelectorAll('.sc-cat-check').forEach((cb) => {
        cb.checked = false;
    });
}

function buildSuperCategoryTranslations(name, desc) {
    const next = normalizeEntityTranslations();
    ['fr', 'en', 'ar'].forEach((lang) => {
        const nameInput = document.getElementById(`scName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        const descInput = document.getElementById(`scDesc${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        next[lang].name = nameInput ? nameInput.value.trim() : '';
        next[lang].desc = descInput ? descInput.value.trim() : '';
    });
    if (!next.fr.name && name) next.fr.name = name;
    if (!next.fr.desc && desc) next.fr.desc = desc;
    return next;
}

// Load all data from server API
async function loadDataFromServer() {
    try {
        const res = await fetch('/api/data', { credentials: 'include' });
        if (!res.ok) return false;
        const data = await res.json();

        // Populate menu
        menu = Array.isArray(data.menu) ? data.menu : [];

        // Populate categories
        if (data.catEmojis && Object.keys(data.catEmojis).length > 0) {
            catEmojis = data.catEmojis;
        }
        categoryImages = data.categoryImages && typeof data.categoryImages === 'object'
            ? data.categoryImages
            : (window.defaultCategoryImages || {});
        window.categoryImages = categoryImages;
        categoryTranslations = data.categoryTranslations && typeof data.categoryTranslations === 'object'
            ? data.categoryTranslations
            : (window.defaultCategoryTranslations || {});

        // Populate config from server data
        if (typeof window.mergeRestaurantConfig === 'function') {
            window.mergeRestaurantConfig({
                superCategories: Array.isArray(data.superCategories) ? data.superCategories : restaurantConfig.superCategories,
                wifi: data.wifi ? { name: data.wifi.ssid || '', code: data.wifi.pass || '' } : restaurantConfig.wifi,
                socials: data.social || restaurantConfig.socials,
                guestExperience: data.guestExperience || restaurantConfig.guestExperience,
                sectionVisibility: data.sectionVisibility || restaurantConfig.sectionVisibility,
                sectionOrder: data.sectionOrder || restaurantConfig.sectionOrder,
                categoryTranslations: data.categoryTranslations || restaurantConfig.categoryTranslations,
                location: data.landing?.location || restaurantConfig.location,
                phone: data.landing?.phone || restaurantConfig.phone,
                _hours: Array.isArray(data.hours) ? data.hours : restaurantConfig._hours,
                _hoursNote: typeof data.hoursNote === 'string' ? data.hoursNote : restaurantConfig._hoursNote,
                gallery: Array.isArray(data.gallery) ? data.gallery : restaurantConfig.gallery,
                branding: data.branding || restaurantConfig.branding,
                contentTranslations: data.contentTranslations || restaurantConfig.contentTranslations
            });
            restaurantConfig = window.restaurantConfig;
            categoryTranslations = restaurantConfig.categoryTranslations || categoryTranslations;
        }
        if (data.promoId !== undefined) {
            promoIds = data.promoId ? [data.promoId] : [];
        }
        if (Array.isArray(data.promoIds)) {
            promoIds = data.promoIds;
        }
        window.promoIds = promoIds; // Sync for shared.js

        console.log('[ADMIN] Loaded', menu.length, 'items from server');
        return true;
    } catch (e) {
        console.error('[ADMIN] Failed to load data from server:', e);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const websiteHomeLink = document.querySelector('.back-btn');
    if (websiteHomeLink) websiteHomeLink.setAttribute('href', '/');

    // Check if we already have a valid session
    await checkSession();

    // Allow Enter key on login
    document.getElementById('loginPass').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performAdminLogin();
    });
    document.getElementById('loginUser').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('loginPass').focus();
    });
    bindCategoryImageFormEvents();
    updateCategoryImagePreview();
});

async function checkSession() {
    try {
        const res = await fetch('/api/admin/session', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.authenticated) {
            console.log('[ADMIN] Session valid. Auto-logging in...');
            showDashboard();
        }
    } catch (e) {
        console.error('[ADMIN] Session check error:', e);
    }
}

function renderAdminSaveState() {
    const el = document.getElementById('adminSaveStatus');
    if (!el) return;

    const palette = {
        idle: { bg: '#f5f5f5', color: '#555', dot: '#999', label: t('admin.save_state.idle_label', 'Ready') },
        saving: { bg: '#fff6db', color: '#8a5a00', dot: '#f59e0b', label: t('admin.save_state.saving_label', 'Saving') },
        success: { bg: '#e9f9ef', color: '#166534', dot: '#10b981', label: t('admin.save_state.success_label', 'Saved') },
        error: { bg: '#fdeaea', color: '#991b1b', dot: '#ef4444', label: t('admin.save_state.error_label', 'Attention') }
    };
    const style = palette[adminSaveState.type] || palette.idle;
    const message = adminSaveState.message || t('admin.save_state.idle_message', 'No server save yet in this session.');
    const timeText = adminSaveState.updatedAt
        ? new Date(adminSaveState.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    el.style.background = style.bg;
    el.style.color = style.color;
    el.innerHTML = `
        <span class="admin-save-status-dot" style="background:${style.dot};"></span>
        <span>${style.label}: ${message}${timeText ? ` (${timeText})` : ''}</span>
    `;
}

function setAdminSaveState(type, message) {
    adminSaveState = {
        type,
        message,
        updatedAt: new Date().toISOString()
    };
    renderAdminSaveState();
}

function isInfoSection(sectionId) {
    return INFO_SECTION_IDS.includes(sectionId);
}

function isBrandingSection(sectionId) {
    return BRANDING_SECTION_IDS.includes(sectionId);
}

function isMenuWorkspaceSection(sectionId) {
    return MENU_WORKSPACE_SECTION_IDS.includes(sectionId);
}

function resolveTopLevelSection(sectionId) {
    if (isMenuWorkspaceSection(sectionId)) return 'menu';
    if (isInfoSection(sectionId)) return 'info';
    if (isBrandingSection(sectionId)) return 'branding';
    return sectionId;
}

function getMenuWorkspaceStepForSection(sectionId) {
    if (sectionId === 'supercategories') return 'supercategories';
    if (sectionId === 'categories') return 'categories';
    if (sectionId === 'menu') return currentMenuWorkspaceStep || 'supercategories';
    return 'items';
}

function getSectionTitle(sectionId) {
    const titles = {
        menu: 'Menu',
        info: 'Info',
        branding: 'Branding',
        'data-tools': 'Import'
    };

    return titles[sectionId] || 'Menu';
}

function renderParameterShells() {
    const shells = Array.from(document.querySelectorAll('[data-parameter-shell]'));
    if (shells.length === 0) return;
    shells.forEach((shell) => {
        shell.innerHTML = '';
        shell.style.display = 'none';
    });
}

function syncParameterTabs() {
}

function moveSectionChildren(sourceId, targetId) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (!source || !target || target.dataset.mounted === 'true') return;

    Array.from(source.children).forEach((child) => {
        if (child.hasAttribute('data-parameter-shell')) return;
        target.appendChild(child);
    });

    target.dataset.mounted = 'true';
}

function moveNodeToHost(nodeId, hostId) {
    const node = document.getElementById(nodeId);
    const host = document.getElementById(hostId);
    if (!node || !host) return;
    if (node.parentElement !== host) {
        host.appendChild(node);
    }
}

function mountOwnerAdminLayout() {
    moveSectionChildren('supercategories', 'menuSuperCategoryMount');
    moveSectionChildren('categories', 'menuCategoryMount');
    moveNodeToHost('landingContactBlock', 'infoLandingPrimaryMount');
    moveNodeToHost('landingSocialBlock', 'infoLandingSocialMount');
    moveNodeToHost('landingFacilitiesBlock', 'infoLandingFacilitiesMount');
    moveSectionChildren('hours', 'infoHoursMount');
    moveSectionChildren('wifi', 'infoWifiMount');
    moveSectionChildren('security', 'infoSecurityMount');
    moveNodeToHost('landingLayoutBlock', 'brandingHomepageLayoutMount');
    moveNodeToHost('landingCopyBlock', 'brandingHomepageCopyMount');
    moveSectionChildren('gallery', 'brandingGalleryMount');
    mountMenuCrudForms();
}

function syncMenuWorkspaceStepButtons() {
    MENU_WORKSPACE_STEPS.forEach((step) => {
        const button = document.getElementById(`menuWorkspaceBtn-${step}`);
        const panel = document.getElementById(`menuStepPanel-${step}`);
        if (button) {
            button.classList.toggle('active', step === currentMenuWorkspaceStep);
        }
        if (panel) {
            panel.classList.toggle('active', step === currentMenuWorkspaceStep);
        }
    });
}

function syncBrandingWorkspaceTabs() {
    BRANDING_WORKSPACE_TABS.forEach((tab) => {
        const button = document.getElementById(`brandingTabBtn-${tab}`);
        const panel = document.getElementById(`brandingPanel-${tab}`);
        if (button) {
            button.classList.toggle('active', tab === currentBrandingWorkspaceTab);
        }
        if (panel) {
            panel.classList.toggle('active', tab === currentBrandingWorkspaceTab);
        }
    });
}

window.setMenuWorkspaceStep = function (step) {
    if (!MENU_WORKSPACE_STEPS.includes(step)) return;
    currentMenuWorkspaceStep = step;
    syncMenuWorkspaceStepButtons();
};

window.setBrandingWorkspaceTab = function (tab) {
    if (!BRANDING_WORKSPACE_TABS.includes(tab)) return;
    currentBrandingWorkspaceTab = tab;
    syncBrandingWorkspaceTabs();
};

function scrollToAdminSubsection(sectionId) {
    const subsection = document.querySelector(`[data-admin-subsection="${sectionId}"]`);
    if (subsection) {
        if (subsection.tagName === 'DETAILS') {
            subsection.open = true;
        }
        subsection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function mountNodeIntoHost(nodeId, hostId) {
    const node = document.getElementById(nodeId);
    const host = document.getElementById(hostId);
    const modalBody = document.getElementById('menuCrudModalBody');
    if (!node || !host) return;
    if (modalBody && modalBody.contains(node)) return;
    if (node.parentElement !== host) {
        host.appendChild(node);
    }
}

function mountMenuCrudForms() {
    mountNodeIntoHost('superCatForm', 'menuCrudSuperHost');
    mountNodeIntoHost('catForm', 'menuCrudCategoryHost');
    mountNodeIntoHost('foodForm', 'menuCrudItemHost');
}

function getAdminMenuSuperCategoryRows() {
    const configured = Array.isArray(restaurantConfig.superCategories) ? restaurantConfig.superCategories : [];
    const categoryKeys = Object.keys(catEmojis || {});
    const assigned = new Set(configured.flatMap((entry) => Array.isArray(entry.cats) ? entry.cats : []));
    const rows = configured.map((entry) => ({ ...entry, isVirtual: false }));
    const unassigned = categoryKeys.filter((cat) => !assigned.has(cat));

    if (unassigned.length > 0) {
        rows.push({
            id: '__unassigned__',
            name: 'Unassigned Categories',
            desc: 'Categories not linked to a super category yet.',
            emoji: 'ðŸ§©',
            cats: unassigned,
            time: '',
            isVirtual: true
        });
    }

    return rows;
}

function getMenuBuilderCurrentSuperCategory() {
    const rows = getAdminMenuSuperCategoryRows();
    return rows.find((row) => row.id === menuBuilderSelectedSuperCategoryId) || null;
}

function getMenuBuilderCurrentCategories() {
    const superCategory = getMenuBuilderCurrentSuperCategory();
    if (!superCategory) return [];
    const categoryKeys = Array.isArray(superCategory.cats) ? superCategory.cats : [];
    return categoryKeys
        .map((catKey) => ({
            key: catKey,
            emoji: catEmojis?.[catKey] || ADMIN_ICON.bullet,
            name: window.getLocalizedCategoryName(catKey, catKey),
            itemCount: menu.filter((item) => item.cat === catKey).length
        }))
        .sort((left, right) => left.name.localeCompare(right.name));
}

function getMenuBuilderCurrentItems() {
    if (!menuBuilderSelectedCategoryKey) return [];
    return menu
        .filter((item) => item.cat === menuBuilderSelectedCategoryKey)
        .sort((left, right) => getAdminItemDisplayName(left).localeCompare(getAdminItemDisplayName(right)));
}

function resetMenuBuilderNavigation() {
    currentMenuWorkspaceStep = 'supercategories';
    menuBuilderSelectedSuperCategoryId = '';
    menuBuilderSelectedCategoryKey = '';
}

function renderMenuBuilder() {
    const table = document.getElementById('menuBuilderTable');
    const empty = document.getElementById('menuBuilderEmpty');
    const title = document.getElementById('menuBuilderTitle');
    const copy = document.getElementById('menuBuilderCopy');
    const crumbs = document.getElementById('menuBuilderBreadcrumbs');
    const addBtn = document.getElementById('menuBuilderAddBtn');
    const backBtn = document.getElementById('menuBuilderBackBtn');
    if (!table || !empty || !title || !copy || !crumbs || !addBtn || !backBtn) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    if (currentMenuWorkspaceStep !== 'supercategories' && !getMenuBuilderCurrentSuperCategory()) {
        currentMenuWorkspaceStep = 'supercategories';
        menuBuilderSelectedSuperCategoryId = '';
        menuBuilderSelectedCategoryKey = '';
    }

    if (currentMenuWorkspaceStep === 'items' && !getMenuBuilderCurrentItems().length && menuBuilderSelectedCategoryKey) {
        const currentCategories = getMenuBuilderCurrentCategories().map((entry) => entry.key);
        if (!currentCategories.includes(menuBuilderSelectedCategoryKey)) {
            currentMenuWorkspaceStep = 'categories';
            menuBuilderSelectedCategoryKey = '';
        }
    }

    let rows = [];
    let columns = [];
    let addLabel = 'Add';
    let emptyText = '';
    const breadcrumbParts = ['Menu'];

    if (currentMenuWorkspaceStep === 'supercategories') {
        rows = getAdminMenuSuperCategoryRows();
        columns = ['Super Category', 'Includes', 'Actions'];
        addLabel = 'Add Super Category';
        emptyText = 'No super categories yet. Add one to structure the menu.';
        title.textContent = 'Super Categories';
        copy.textContent = 'These are the first groups customers open before they see categories.';
    } else if (currentMenuWorkspaceStep === 'categories') {
        const superCategory = getMenuBuilderCurrentSuperCategory();
        rows = getMenuBuilderCurrentCategories();
        columns = ['Category', 'Items', 'Actions'];
        addLabel = 'Add Category';
        emptyText = 'This super category does not have categories yet.';
        title.textContent = superCategory ? `${superCategory.name} / Categories` : 'Categories';
        copy.textContent = 'Click a category to open its items. Add or edit categories from this table only.';
        if (superCategory) breadcrumbParts.push(superCategory.name);
    } else {
        const superCategory = getMenuBuilderCurrentSuperCategory();
        const categoryLabel = menuBuilderSelectedCategoryKey
            ? window.getLocalizedCategoryName(menuBuilderSelectedCategoryKey, menuBuilderSelectedCategoryKey)
            : 'Items';
        rows = getMenuBuilderCurrentItems();
        columns = ['Item', 'Price', 'Likes', 'Promo', 'Featured', 'Actions'];
        addLabel = 'Add Item';
        emptyText = 'No items in this category yet.';
        title.textContent = `${categoryLabel} / Items`;
        copy.textContent = 'Add or edit products for the selected category. Product forms only open when needed.';
        if (superCategory) breadcrumbParts.push(superCategory.name);
        if (menuBuilderSelectedCategoryKey) breadcrumbParts.push(categoryLabel);
    }

    crumbs.innerHTML = breadcrumbParts.map((entry) => `<span class="menu-builder-crumb">${escapeHtml(entry)}</span>`).join('');
    table.dataset.step = currentMenuWorkspaceStep;
    addBtn.textContent = addLabel;
    backBtn.style.display = currentMenuWorkspaceStep === 'supercategories' ? 'none' : '';
    thead.innerHTML = `<tr>${columns.map((label) => `<th>${escapeHtml(label)}</th>`).join('')}</tr>`;

    if (rows.length === 0) {
        tbody.innerHTML = '';
        table.style.display = 'none';
        empty.style.display = 'block';
        empty.textContent = emptyText;
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    if (currentMenuWorkspaceStep === 'supercategories') {
        tbody.innerHTML = rows.map((entry) => {
            const inlineId = toInlineJsString(entry.id);
            const categoriesCount = Array.isArray(entry.cats) ? entry.cats.length : 0;
            return `
                <tr onclick='openMenuBuilderRow(${inlineId})'>
                    <td data-label="Super Category">
                        <div class="menu-builder-entry">
                            <span class="menu-builder-entry-emoji">${escapeHtml(entry.emoji || ADMIN_ICON.bullet)}</span>
                            <div class="menu-builder-entry-copy">
                                <strong>${escapeHtml(entry.name || 'Super Category')}</strong>
                                <div class="menu-builder-row-copy">${escapeHtml(entry.desc || '')}</div>
                            </div>
                        </div>
                    </td>
                    <td data-label="Includes"><span class="menu-builder-count-pill">${categoriesCount} categories</span></td>
                    <td data-label="Actions">
                        <div class="menu-builder-item-actions">
                            ${entry.isVirtual ? '' : `<button type="button" class="action-btn" onclick='event.stopPropagation(); openMenuBuilderEdit("supercategory", ${inlineId})'>${ADMIN_ICON.edit}</button>`}
                            ${entry.isVirtual ? '' : `<button type="button" class="action-btn" onclick='event.stopPropagation(); deleteSuperCat(${inlineId})'>${ADMIN_ICON.trash}</button>`}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        return;
    }

    if (currentMenuWorkspaceStep === 'categories') {
        tbody.innerHTML = rows.map((entry) => {
            const inlineKey = toInlineJsString(entry.key);
            const categoryImage = typeof categoryImages?.[entry.key] === 'string' ? categoryImages[entry.key].trim() : '';
            return `
                <tr onclick='openMenuBuilderCategory(${inlineKey})'>
                    <td data-label="Category">
                        <div class="menu-builder-entry">
                            ${categoryImage
                                ? `<span class="menu-builder-entry-thumb"><img src="${escapeHtml(categoryImage)}" alt="${escapeHtml(entry.name)}" loading="lazy" decoding="async"></span>`
                                : `<span class="menu-builder-entry-emoji">${escapeHtml(entry.emoji)}</span>`}
                            <div class="menu-builder-entry-copy">
                                <strong>${escapeHtml(entry.name)}</strong>
                            </div>
                        </div>
                    </td>
                    <td data-label="Items"><span class="menu-builder-count-pill">${entry.itemCount} items</span></td>
                    <td data-label="Actions">
                        <div class="menu-builder-item-actions">
                            <button type="button" class="action-btn" title="Category image" onclick='event.stopPropagation(); openMenuBuilderEdit("category", ${inlineKey})'>${ADMIN_ICON.image}</button>
                            <button type="button" class="action-btn" onclick='event.stopPropagation(); openMenuBuilderEdit("category", ${inlineKey})'>${ADMIN_ICON.edit}</button>
                            <button type="button" class="action-btn" onclick='event.stopPropagation(); deleteCat(${inlineKey})'>${ADMIN_ICON.trash}</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        return;
    }

    tbody.innerHTML = rows.map((item) => {
        const inlineId = toInlineJsString(item.id);
        const displayName = getAdminItemDisplayName(item);
        const price = Number(item.price) || 0;
        const previewImage = (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.img) || '';
        const likes = Number(item.likes) || 0;
        return `
            <tr onclick='editItem(${inlineId})'>
                <td data-label="Item">
                    <div class="menu-builder-item-main">
                        <div class="menu-builder-item-thumb">${previewImage ? `<img src="${escapeHtml(previewImage)}" alt="${escapeHtml(displayName)}" width="160" height="160" loading="lazy" decoding="async" fetchpriority="low" />` : ''}</div>
                        <div class="menu-builder-item-meta">
                            <strong>${escapeHtml(displayName)}</strong>
                            <div class="menu-builder-row-copy">${escapeHtml(getAdminItemDisplayDescription(item))}</div>
                        </div>
                    </div>
                </td>
                <td data-label="Price"><span class="menu-builder-row-meta">MAD ${price.toFixed(2)}</span></td>
                <td data-label="Likes"><span class="menu-builder-likes">${ADMIN_ICON.heart} ${likes}</span></td>
                <td data-label="Featured"><button type="button" class="promo-star action-btn menu-builder-toggle ${item.featured ? 'promo-active' : ''}" onclick='event.stopPropagation(); toggleFeatured(${inlineId})' style="filter: ${item.featured ? 'none' : 'grayscale(1)'}; opacity: ${item.featured ? '1' : '0.5'};">${ADMIN_ICON.sparkle}</button></td>
                <td data-label="Actions">
                    <div class="menu-builder-item-actions">
                        <button type="button" class="action-btn" onclick='event.stopPropagation(); editItem(${inlineId})'>${ADMIN_ICON.edit}</button>
                        <button type="button" class="action-btn" onclick='event.stopPropagation(); openImageModal(${inlineId})'>${ADMIN_ICON.image}</button>
                        <button type="button" class="action-btn" onclick='event.stopPropagation(); deleteItem(${inlineId})'>${ADMIN_ICON.trash}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openMenuBuilderRow = function (superCategoryId) {
    menuBuilderSelectedSuperCategoryId = superCategoryId;
    menuBuilderSelectedCategoryKey = '';
    currentMenuWorkspaceStep = 'categories';
    renderMenuBuilder();
};

window.openMenuBuilderCategory = function (categoryKey) {
    menuBuilderSelectedCategoryKey = categoryKey;
    currentMenuWorkspaceStep = 'items';
    renderMenuBuilder();
};

window.goBackMenuBuilder = function () {
    if (currentMenuWorkspaceStep === 'items') {
        currentMenuWorkspaceStep = 'categories';
        menuBuilderSelectedCategoryKey = '';
    } else if (currentMenuWorkspaceStep === 'categories') {
        currentMenuWorkspaceStep = 'supercategories';
        menuBuilderSelectedSuperCategoryId = '';
        menuBuilderSelectedCategoryKey = '';
    }
    renderMenuBuilder();
};

function openMenuCrudModal(type, title) {
    mountMenuCrudForms();
    const modal = document.getElementById('menuCrudModal');
    const body = document.getElementById('menuCrudModalBody');
    const titleEl = document.getElementById('menuCrudModalTitle');
    const card = modal?.querySelector('.menu-crud-modal-card');
    const formId = type === 'supercategory' ? 'superCatForm' : type === 'category' ? 'catForm' : 'foodForm';
    const form = document.getElementById(formId);
    if (!modal || !body || !titleEl || !form) return;
    body.innerHTML = '';
    body.appendChild(form);
    titleEl.textContent = title;
    document.documentElement.classList.add('menu-crud-open');
    document.body.classList.add('menu-crud-open');
    if (typeof modal.showModal === 'function') {
        if (!modal.open) modal.showModal();
    } else {
        modal.setAttribute('open', 'open');
    }
    body.scrollTop = 0;
    if (card) card.scrollTop = 0;
    requestAnimationFrame(() => {
        body.scrollTop = 0;
        if (card) card.scrollTop = 0;
    });
}

window.closeMenuCrudModal = function () {
    const modal = document.getElementById('menuCrudModal');
    if (modal) {
        if (typeof modal.close === 'function' && modal.open) {
            modal.close();
        } else {
            modal.removeAttribute('open');
        }
    }
    document.documentElement.classList.remove('menu-crud-open');
    document.body.classList.remove('menu-crud-open');
    mountMenuCrudForms();
};

const menuCrudDialog = document.getElementById('menuCrudModal');
if (menuCrudDialog) {
    menuCrudDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        window.closeMenuCrudModal();
    });
}

window.openMenuBuilderAdd = function () {
    if (currentMenuWorkspaceStep === 'supercategories') {
        resetSuperCategoryFormState();
        openMenuCrudModal('supercategory', 'Add Super Category');
        return;
    }
    if (currentMenuWorkspaceStep === 'categories') {
        resetCategoryFormState();
        openMenuCrudModal('category', 'Add Category');
        return;
    }
    resetFoodForm();
    if (menuBuilderSelectedCategoryKey) {
        const itemCat = document.getElementById('itemCat');
        if (itemCat) itemCat.value = menuBuilderSelectedCategoryKey;
    }
    openMenuCrudModal('item', 'Add Item');
};

window.openMenuBuilderEdit = function (type, id) {
    if (type === 'supercategory') {
        editSuperCat(id);
        return;
    }
    if (type === 'category') {
        editCat(id);
        return;
    }
    editItem(id);
};

function applyAdminCapabilities() {
    const sellerToolsNavBtn = document.getElementById('sellerToolsNavBtn');
    const dataToolsSection = document.getElementById('data-tools');
    const modalAiImageTools = document.getElementById('modalAiImageTools');

    if (!adminCapabilities.sellerToolsEnabled) {
        sellerToolsNavBtn?.remove();
        dataToolsSection?.remove();
    } else {
        if (sellerToolsNavBtn) sellerToolsNavBtn.style.display = '';
        if (dataToolsSection) dataToolsSection.style.display = '';
    }

    if (!adminCapabilities.aiMediaToolsEnabled) {
        modalAiImageTools?.remove();
    } else if (modalAiImageTools) {
        modalAiImageTools.style.display = '';
    }

    if (!adminCapabilities.sellerToolsEnabled && dataToolsSection?.classList.contains('active')) {
        const menuBtn = document.getElementById('menuNavBtn');
        if (menuBtn) showSection('menu', menuBtn);
    }
}

async function loadAdminCapabilities() {
    try {
        const res = await fetch('/api/admin/capabilities', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
            adminCapabilities = { sellerToolsEnabled: false, aiMediaToolsEnabled: false };
            return;
        }
        adminCapabilities = {
            sellerToolsEnabled: Boolean(data.sellerToolsEnabled),
            aiMediaToolsEnabled: Boolean(data.aiMediaToolsEnabled)
        };
    } catch (error) {
        console.error('Capabilities load error:', error);
        adminCapabilities = { sellerToolsEnabled: false, aiMediaToolsEnabled: false };
    }
}

window.openParameterSection = function (sectionId) {
    showSection(sectionId);
};

async function performAdminLogin() {
    console.log('[LOGIN] performAdminLogin triggered');
    const userEl = document.getElementById('loginUser');
    const passEl = document.getElementById('loginPass');
    const errorEl = document.getElementById('loginError');

    if (!userEl || !passEl) {
        console.error('[LOGIN] Missing login elements!');
        return;
    }

    const username = userEl.value.trim();
    const password = passEl.value;

    console.log('[LOGIN] Attempting login for:', username);

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log('[LOGIN] Server response:', data);
        if (!res.ok || !data.ok) {
            if (errorEl) {
                errorEl.textContent = 'Incorrect credentials.';
                errorEl.style.display = 'block';
            }
            return;
        }
        showDashboard();
    } catch (e) {
        console.error('[LOGIN] Request error:', e);
        if (errorEl) {
            errorEl.textContent = 'Server connection error.';
            errorEl.style.display = 'block';
        }
    }
}

async function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminSidebar').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'block';
    await Promise.all([loadDataFromServer(), loadAdminCapabilities()]);
    mountOwnerAdminLayout();
    refreshUI();
    initForms();
}

async function adminLogout() {
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); } catch (e) { }
    location.reload();
}

function refreshUI() {
    mountOwnerAdminLayout();
    renderParameterShells();
    renderAdminSaveState();
    renderMenuBuilder();
    populateCatDropdown();
    initBrandingForm();
    initWifiForm();
    initLandingPageForm();
    initSuperCatForm();
    setCategoryTranslationFields();
    setSuperCategoryTranslationFields();
    initSecurityForm();
    initHoursForm();
    initGalleryForm();
    renderGalleryAdmin();
    renderImporterDraftOutputs(lastImporterDraft);
    updateStats();
    applyAdminCapabilities();
    syncParameterTabs();
    syncMenuWorkspaceStepButtons();
    syncBrandingWorkspaceTabs();
    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
}

window.suggestMissingMenuImages = async function () {
    const output = document.getElementById('menuImageSuggestionOutput');
    const menuItems = Array.isArray(menu) ? menu : [];
    const suggestions = [];
    let assignedCount = 0;
    let alreadyCoveredCount = 0;
    const confidenceCounts = {
        high: 0,
        medium: 0,
        low: 0,
        fallback: 0
    };

    menu = menuItems.map((item) => {
        const primaryImage = typeof window.getPrimaryMenuItemImage === 'function'
            ? window.getPrimaryMenuItemImage(item)
            : ((Array.isArray(item.images) ? item.images.filter(Boolean)[0] : '') || item.img || '');

        if (primaryImage) {
            alreadyCoveredCount += 1;
            return item;
        }

        const suggestion = typeof window.getMenuImageSuggestion === 'function'
            ? window.getMenuImageSuggestion(item)
            : null;

        if (!suggestion?.src) {
            return item;
        }

        assignedCount += 1;
        suggestions.push({
            itemName: getAdminItemDisplayName(item),
            category: item.cat || 'Uncategorized',
            label: suggestion.label,
            confidence: suggestion.confidence || 'fallback',
            matchType: suggestion.matchType || 'fallback',
            reason: suggestion.reason || 'Matched from local library'
        });
        confidenceCounts[suggestion.confidence || 'fallback'] += 1;

        return {
            ...item,
            img: suggestion.src,
            images: [suggestion.src]
        };
    });

    const summaryLines = [
        t('admin.menu_images.summary_title', 'Menu image suggestion run'),
        t('admin.menu_images.items_reviewed', 'Items reviewed: {count}', { count: menuItems.length }),
        t('admin.menu_images.images_assigned', 'Images assigned: {count}', { count: assignedCount }),
        t('admin.menu_images.items_already_covered', 'Items already covered: {count}', { count: alreadyCoveredCount }),
        t('admin.menu_images.high_confidence', 'High confidence matches: {count}', { count: confidenceCounts.high }),
        t('admin.menu_images.medium_confidence', 'Medium confidence matches: {count}', { count: confidenceCounts.medium }),
        t('admin.menu_images.low_confidence', 'Low confidence matches: {count}', { count: confidenceCounts.low }),
        t('admin.menu_images.fallback_confidence', 'Generic fallback placeholders: {count}', { count: confidenceCounts.fallback }),
        ''
    ];

    if (suggestions.length > 0) {
        summaryLines.push(`${t('admin.menu_images.assignments', 'Assignments')}:`);
        suggestions.forEach((entry) => {
            summaryLines.push(`- ${entry.itemName} [${entry.category}] -> ${entry.label} [${entry.confidence} / ${entry.matchType}] (${entry.reason})`);
        });
        if (confidenceCounts.fallback > 0) {
            summaryLines.push('');
            summaryLines.push(t('admin.menu_images.review_note', 'Review note: fallback assignments are generic placeholders and should be replaced first when better client media exists.'));
        }
    } else {
        summaryLines.push(t('admin.menu_images.assignments_none', 'Assignments: none. Every menu item already had an image.'));
    }

    if (output) {
        output.value = summaryLines.join('\n');
    }

    if (assignedCount === 0) {
        showToast(t('admin.menu_images.none_missing', 'No missing menu images were found.'));
        return;
    }

    renderMenuTable();
    updateStats();

    const saved = await saveAndRefresh();
    if (saved) {
        showToast(t('admin.menu_images.assigned_toast', 'Assigned {count} menu image suggestion(s).', { count: assignedCount }));
    }
};

window.copyMenuImageSuggestionSummary = async function () {
    const output = document.getElementById('menuImageSuggestionOutput');
    if (!output) return;

    if (!output.value.trim()) {
        showToast(t('admin.menu_images.run_first', 'Run the suggestion tool first.'));
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        showToast(t('admin.menu_images.copied', 'Image suggestion summary copied.'));
    } catch (_error) {
        output.focus();
        output.select();
        showToast(t('admin.common.copy_failed', 'Copy failed. Select the summary manually.'));
    }
};

// â”€â”€â”€ CATEGORY FILTERS LOGIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderCategoryFilters() {
    const container = document.getElementById('adminCategoryFilters');
    if (!container) return;

    // Calculate counts
    const counts = { 'All': menu.length };
    menu.forEach(item => {
        const cat = item.cat || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    // Create unique categories list
    const categories = ['All', ...new Set(menu.map(i => i.cat || 'Uncategorized'))].sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
    });

    // Render buttons
    container.innerHTML = categories.map(cat => {
        const count = counts[cat] || 0;
        const isActive = currentAdminCategory === cat ? 'active' : '';
        return `<button class="category-filter-btn ${isActive}" onclick="setAdminCategoryFilter('${cat}')">
            ${cat} <span class="category-filter-count">(${count})</span>
        </button>`;
    }).join('');
}

window.setAdminCategoryFilter = function (cat) {
    currentAdminCategory = cat;
    if (typeof window.setStoredAdminCategoryFilter === 'function') {
        window.setStoredAdminCategoryFilter(cat);
    }

    // Update active state on buttons without full re-render
    const buttons = document.querySelectorAll('#adminCategoryFilters .category-filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(cat + ' ')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderMenuTable();
}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderMenuTable() {
    const tbody = document.querySelector('#menuTable tbody');
    if (!tbody) return;
    try {
        // Filter menu based on active category
        const filteredMenu = currentAdminCategory === 'All'
            ? menu
            : menu.filter(item => (item.cat || 'Uncategorized') === currentAdminCategory);

        if (filteredMenu.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#888;">No items in category "${currentAdminCategory}".</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredMenu.map(item => {
            // Fix image fallback logic
            const images = (item.images && item.images.length > 0) ? item.images : (item.img ? [item.img] : []);
            const firstImg = images.length > 0 ? images[0] : '';
            const safePrice = Number(item.price) || 0;
            const likeCount = (typeof window.getLikeCount === 'function') ? window.getLikeCount(item.id) : 0;
            const itemName = escapeHtml(getAdminItemDisplayName(item));
            const itemDesc = escapeHtml(getAdminItemDisplayDescription(item));
            const itemCat = escapeHtml(item.cat || 'Uncategorized');
            const translationBadges = renderMenuTranslationBadges(item);
            const inlineItemId = toInlineJsString(item.id);
            return `
            <tr>
                <td>
                    <div style="width:50px; height:50px; background:#eee; border-radius:8px; overflow:hidden; border:1px solid #ddd; cursor:pointer" onclick='openImageModal(${inlineItemId})'>
                        ${firstImg ? `<img src="${firstImg}" width="320" height="320" loading="lazy" decoding="async" fetchpriority="low" style="width:100%; height:100%; object-fit:cover" onerror="this.src='images/menu-item-placeholder.svg'">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">${ADMIN_ICON.camera}</div>`}
                    </div>
                    ${images.length > 0 ? `<small style="display:block;text-align:center;font-size:10px;color:var(--primary);cursor:pointer;margin-top:2px" onclick='openImageModal(${inlineItemId})'>${images.length} image(s)</small>` : ''}
                </td>
                <td><strong>${itemName}</strong><div class="item-copy-meta"><div class="translation-badges">${translationBadges}</div></div><small style="color:#888">${itemDesc}</small></td>
                <td>${itemCat}</td>
                <td>MAD ${safePrice.toFixed(2)}</td>
                <td><span style="color:#e01e2f">${ADMIN_ICON.heart}</span> ${likeCount}</td>
                <td><span class="promo-star action-btn ${item.featured ? 'promo-active' : ''}" onclick='toggleFeatured(${inlineItemId})' style="filter: ${item.featured ? 'none' : 'grayscale(1)'}; opacity: ${item.featured ? '1' : '0.5'};">${ADMIN_ICON.sparkle}</span></td>
                <td>
                    <button class="action-btn" onclick='editItem(${inlineItemId})' title="Edit item">${ADMIN_ICON.edit}</button>
                    <button class="action-btn" onclick='openImageModal(${inlineItemId})' title="Manage images">${ADMIN_ICON.image}</button>
                    <button class="action-btn" onclick='deleteItem(${inlineItemId})'>${ADMIN_ICON.trash}</button>
                </td>
            </tr > `;
        }).join('');
    } catch (e) {
        console.error('Render Table Error:', e);
        tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Unable to load items.</td></tr>`;
    }
}

let editingItemId = null;
// Store the full existing image array for the item being edited (including base64)
window._editingImages = [];

function toggleSizesUI() {
    const hasSizes = document.getElementById('itemHasSizes').checked;
    document.getElementById('singlePriceGroup').style.display = hasSizes ? 'none' : 'block';
    document.getElementById('multiPriceGroup').style.display = hasSizes ? 'grid' : 'none';
}

function editItem(id) {
    const item = menu.find(m => m.id == id);
    if (!item) return;

    editingItemId = id;
    currentMenuWorkspaceStep = 'items';
    menuBuilderSelectedCategoryKey = item.cat || '';
    openMenuCrudModal('item', `Edit Item - ${getAdminItemDisplayName(item)}`);

    document.getElementById('itemName').value = item.name || getAdminItemDisplayName(item);
    document.getElementById('itemCat').value = item.cat;
    document.getElementById('itemDesc').value = item.desc || getAdminItemDisplayDescription(item);
    setMenuItemTranslationFields(item.translations);
    document.getElementById('itemIngredients').value = (item.ingredients || []).join(', ');

    const hasSizes = item.hasSizes || false;
    document.getElementById('itemHasSizes').checked = hasSizes;
    toggleSizesUI();

    if (hasSizes && item.sizes) {
        document.getElementById('itemPriceSmall').value = item.sizes.small || '';
        document.getElementById('itemPriceMedium').value = item.sizes.medium || '';
        document.getElementById('itemPriceLarge').value = item.sizes.large || '';
        document.getElementById('itemPrice').value = '';
    } else {
        document.getElementById('itemPrice').value = item.price || '';
        document.getElementById('itemPriceSmall').value = '';
        document.getElementById('itemPriceMedium').value = '';
        document.getElementById('itemPriceLarge').value = '';
    }

    document.getElementById('itemFeatured').checked = item.featured || false;
    const availableCb = document.getElementById('itemAvailable');
    if (availableCb) availableCb.checked = item.available !== false;

    // Store ALL existing images (including base64) for preservation during save
    const existingImages = item.images && item.images.length > 0 ? item.images : (item.img ? [item.img] : []);
    window._editingImages = [...existingImages];

    // Show only URL images in the text field (base64 is too long to show)
    const urlImages = existingImages.filter(img => !img.startsWith('data:'));
    const imgInput = document.getElementById('itemImg');
    if (imgInput) imgInput.value = urlImages.join(', ');

    // Change form title and button
    const itemEditorTitle = document.getElementById('menuItemEditorTitle');
    if (itemEditorTitle) itemEditorTitle.textContent = `Edit Item - ${getAdminItemDisplayName(item)}`;
    document.querySelector('#foodForm .primary-btn').textContent = 'Save';
}

function resetFoodForm() {
    editingItemId = null;
    document.getElementById('foodForm').reset();
    setMenuItemTranslationFields();
    document.getElementById('itemFeatured').checked = false;
    document.getElementById('itemHasSizes').checked = false;
    const availableCb = document.getElementById('itemAvailable');
    if (availableCb) availableCb.checked = true;
    toggleSizesUI();
    const itemEditorTitle = document.getElementById('menuItemEditorTitle');
    if (itemEditorTitle) itemEditorTitle.textContent = 'Add Item';
    document.querySelector('#foodForm .primary-btn').textContent = 'Save';
}

function initForms() {
    document.getElementById('foodForm').onsubmit = async (e) => {
        e.preventDefault();
        await commitFormItem();
    };

    // --- Shared save logic, can be called directly without a form submit event ---
    window.commitFormItem = async function () {
        const fileInput = document.getElementById('itemFile');
        const urlInput = document.getElementById('itemImg').value;

        // Parse URL images â€” split by NEWLINE only
        let urlImages = urlInput.split(/\n/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('data:'));

        // Upload new files to server (stored on disk, returned as /uploads/... URL)
        let newUploadedUrls = [];
        if (fileInput && fileInput.files.length > 0) {
            showToast('Uploading item images...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    newUploadedUrls.push(url);
                } catch (err) {
                    console.error('Image upload failed:', err);
                    showToast('Image upload failed. Please try again.');
                }
            }
        }

        // Build final images array:
        // - URL images from text field + newly uploaded server URLs
        // - Keep existing images if nothing new is provided
        let finalImages;
        if (editingItemId) {
            const existingImages = window._editingImages || [];
            if (newUploadedUrls.length > 0) {
                // New uploads provided â€” use URL list + new server images
                finalImages = [...urlImages, ...newUploadedUrls];
            } else if (urlImages.length > 0) {
                // URL field was updated â€” use those (no new uploads)
                finalImages = [...urlImages];
            } else {
                // Nothing changed â€” keep all existing images
                finalImages = [...existingImages];
            }
        } else {
            finalImages = [...urlImages, ...newUploadedUrls];
        }

        const ingredients = document.getElementById('itemIngredients').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const name = document.getElementById('itemName').value.trim();
        const cat = document.getElementById('itemCat').value;
        const desc = document.getElementById('itemDesc').value.trim();
        const translations = buildMenuItemTranslations();
        const featured = document.getElementById('itemFeatured').checked;
        const available = document.getElementById('itemAvailable').checked;

        const hasSizes = document.getElementById('itemHasSizes').checked;
        let price = 0;
        let sizes = null;

        if (hasSizes) {
            sizes = {
                small: parseFloat(document.getElementById('itemPriceSmall').value) || 0,
                medium: parseFloat(document.getElementById('itemPriceMedium').value) || 0,
                large: parseFloat(document.getElementById('itemPriceLarge').value) || 0
            };
            price = sizes.small || sizes.medium || sizes.large || 0; // Use first available for general display if needed
        } else {
            price = parseFloat(document.getElementById('itemPrice').value) || 0;
        }

        if (!name) { showToast('Item name is required.'); return; }

        if (editingItemId) {
            const index = menu.findIndex(m => m.id == editingItemId);
            if (index !== -1) {
                menu[index] = {
                    ...menu[index],
                    name, cat, desc, translations, ingredients, price,
                    hasSizes, sizes,
                    images: finalImages,
                    img: finalImages[0] || menu[index].img || '',
                    featured,
                    available
                };
            }
            showToast('Item updated.');
        } else {
            const newItem = {
                id: Date.now(),
                name, cat, desc, translations, ingredients, price,
                hasSizes, sizes,
                images: finalImages,
                img: finalImages[0] || '',
                featured,
                available,
                likes: 0,
                badge: ''
            };
            menu.push(newItem);
            showToast('Item added.');
        }

        const saved = await saveAndRefresh();
        if (saved) {
            resetFoodForm();
            closeMenuCrudModal();
        }
    };

    document.getElementById('catForm').onsubmit = async (e) => {
        e.preventDefault();
        const editingKeyInput = document.getElementById('catEditingKey');
        const previousKey = editingKeyInput ? editingKeyInput.value.trim() : '';
        const categoryName = document.getElementById('catName').value.trim();
        const selectedSuperCategoryId = document.getElementById('catSuperCategory')?.value?.trim() || '';
        if (!categoryName) {
            showToast('Category name is required.');
            return;
        }
        if (!selectedSuperCategoryId) {
            showToast('Please choose a super category.');
            return;
        }
        const nextEmoji = document.getElementById('catEmoji')?.value
            || catEmojis?.[categoryName]
            || catEmojis?.[previousKey]
            || ADMIN_ICON.bullet;
        const nextTranslations = buildCategoryTranslations(categoryName);
        const categoryImageInput = document.getElementById('catImage');
        const categoryImageUpload = document.getElementById('catImageUpload');
        let nextImage = normalizeCategoryImagePath(categoryImageInput ? categoryImageInput.value : '');

        if (categoryImageUpload && categoryImageUpload.files && categoryImageUpload.files[0]) {
            try {
                nextImage = await uploadImageToServer(categoryImageUpload.files[0]);
                if (categoryImageInput) categoryImageInput.value = nextImage;
            } catch (error) {
                console.error('Category image upload failed:', error);
                showToast('Category image upload failed.');
                return;
            }
        }

        if (previousKey && previousKey !== categoryName) {
            menu.forEach((item) => {
                if (item.cat === previousKey) item.cat = categoryName;
            });
            delete catEmojis[previousKey];
            delete categoryTranslations[previousKey];
            delete categoryImages[previousKey];
        }

        (restaurantConfig.superCategories || []).forEach((sc) => {
            const currentCats = Array.isArray(sc.cats) ? sc.cats : [];
            sc.cats = currentCats.filter((cat) => cat !== previousKey && cat !== categoryName);
        });

        const selectedSuperCategory = (restaurantConfig.superCategories || []).find((sc) => sc.id === selectedSuperCategoryId);
        if (!selectedSuperCategory) {
            showToast('Selected super category was not found.');
            return;
        }
        selectedSuperCategory.cats = Array.isArray(selectedSuperCategory.cats) ? selectedSuperCategory.cats : [];
        if (!selectedSuperCategory.cats.includes(categoryName)) {
            selectedSuperCategory.cats.push(categoryName);
        }

        catEmojis[categoryName] = nextEmoji;
        if (nextImage) categoryImages[categoryName] = nextImage;
        else delete categoryImages[categoryName];
        window.categoryImages = categoryImages;
        categoryTranslations[categoryName] = nextTranslations;
        const saved = await saveAndRefresh();
        if (saved) {
            menuBuilderSelectedSuperCategoryId = selectedSuperCategoryId;
            resetCategoryFormState();
            closeMenuCrudModal();
            showToast(previousKey ? 'Category updated.' : 'Category added.');
        }
    };

    document.getElementById('wifiForm').onsubmit = (e) => {
        e.preventDefault();
        restaurantConfig.wifi.name = document.getElementById('wifiSSID').value;
        restaurantConfig.wifi.code = document.getElementById('wifiPassInput').value;
        saveAndRefresh();
        showToast('WiFi updated.');
    };

    document.getElementById('brandingForm').onsubmit = (e) => {
        e.preventDefault();
        const brandingDraft = getBrandingDraftFromForm();

        if (!isValidAssetUrl(brandingDraft.logoImage)) {
            showToast('Logo image must be an absolute URL or a local /uploads path.');
            return;
        }

        if (!isValidAssetUrl(brandingDraft.heroImage)) {
            showToast('Hero image must be an absolute URL or a local /uploads path.');
            return;
        }

        if ((brandingDraft.heroSlides || []).some((value) => value && !isValidAssetUrl(value))) {
            showToast('Each hero slide image must be an absolute URL or a local /uploads path.');
            return;
        }

        if (typeof window.mergeRestaurantConfig === 'function') {
            window.mergeRestaurantConfig({
                branding: brandingDraft
            });
            restaurantConfig = window.restaurantConfig;
        }

        window.updateBrandingPreview();
        saveAndRefresh();
        showToast('Branding saved.');
    };

    document.getElementById('landingPageForm').onsubmit = (e) => {
        e.preventDefault();
        const nextContentTranslations = buildLandingContentTranslations();
        const guestExperience = buildGuestExperienceConfig();
        const sectionVisibility = buildSectionVisibilityConfig();
        const sectionOrder = normalizeSectionOrderDraft(landingSectionOrderDraft);
        const mapUrl = document.getElementById('lpMapUrl').value.trim();
        const phone = document.getElementById('lpPhone').value.trim();
        const facebookUrl = document.getElementById('lpFb').value.trim();
        const tiktokUrl = document.getElementById('lpTiktok').value.trim();
        const tripAdvisorUrl = document.getElementById('lpTrip').value.trim();

        if (!isValidAbsoluteUrl(mapUrl)) {
            showToast('Map URL must be a valid https:// link.');
            return;
        }

        if (!isLikelyPhoneNumber(phone)) {
            showToast('Phone number looks incomplete. Please use an international or local dial format.');
            return;
        }

        if (facebookUrl && !isValidAbsoluteUrl(facebookUrl)) {
            showToast('Facebook must be a valid https:// link.');
            return;
        }

        if (tiktokUrl && !isValidAbsoluteUrl(tiktokUrl)) {
            showToast('TikTok must be a valid https:// link.');
            return;
        }

        if (tripAdvisorUrl && !isValidAbsoluteUrl(tripAdvisorUrl)) {
            showToast('TripAdvisor must be a valid https:// link.');
            return;
        }

        restaurantConfig.location.address = document.getElementById('lpAddress').value;
        restaurantConfig.location.url = mapUrl;
        restaurantConfig.phone = phone;
        restaurantConfig.socials.instagram = document.getElementById('lpInsta').value;
        restaurantConfig.socials.facebook = facebookUrl;
        restaurantConfig.socials.tiktok = tiktokUrl;
        restaurantConfig.socials.tripadvisor = tripAdvisorUrl;
        restaurantConfig.guestExperience = guestExperience;
        restaurantConfig.sectionVisibility = sectionVisibility;
        restaurantConfig.sectionOrder = sectionOrder;
        restaurantConfig.contentTranslations = nextContentTranslations;

        if (window.restaurantConfig) {
            window.restaurantConfig.guestExperience = guestExperience;
            window.restaurantConfig.sectionVisibility = sectionVisibility;
            window.restaurantConfig.sectionOrder = sectionOrder;
            window.restaurantConfig.contentTranslations = nextContentTranslations;
        }

        saveAndRefresh();
        showToast('Homepage content saved.');
    };

    document.getElementById('superCatForm').onsubmit = async (e) => {
        e.preventDefault();
        const editingIdInput = document.getElementById('scEditingId');
        const editingId = editingIdInput ? editingIdInput.value.trim() : '';
        const selectedCats = Array.from(document.querySelectorAll('.sc-cat-check:checked')).map(cb => cb.value);
        const name = document.getElementById('scName').value.trim();
        const emoji = document.getElementById('scEmoji').value;
        const desc = document.getElementById('scDesc').value.trim();
        const time = document.getElementById('scTime').value;
        const translations = buildSuperCategoryTranslations(name, desc);

        const id = editingId || name.toLowerCase().replace(/\s+/g, '_');
        const existingIdx = restaurantConfig.superCategories.findIndex(sc => sc.id === id);

        const newSC = { id, name, emoji, desc, time, cats: selectedCats, translations };

        if (existingIdx !== -1) {
            restaurantConfig.superCategories[existingIdx] = newSC;
        } else {
            restaurantConfig.superCategories.push(newSC);
        }

        const saved = await saveAndRefresh();
        if (saved) {
            resetSuperCategoryFormState();
            closeMenuCrudModal();
            showToast(existingIdx !== -1 ? 'Super category updated.' : 'Super category saved.');
        }
    };
}

function getContentTranslationValue(lang, key) {
    return restaurantConfig?.contentTranslations?.[lang]?.[key] || '';
}

function renderLandingContentEditor() {
    const container = document.getElementById('landingContentGrid');
    if (!container) return;

    container.innerHTML = LANDING_CONTENT_FIELDS.map((field) => `
        <div style="background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="margin-bottom:14px;">
                <div style="font-weight:700; color:#111; margin-bottom:4px;">${escapeHtml(field.label)}</div>
                <div style="font-size:0.82rem; color:#6b7280; line-height:1.5;">${escapeHtml(field.hint)}</div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px;">
                ${CONTENT_EDITOR_LANGUAGES.map((lang) => {
                    const value = escapeHtml(getContentTranslationValue(lang, field.key));
                    const label = lang.toUpperCase();
                    if (field.type === 'textarea') {
                        return `
                            <label style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem; font-weight:700; color:#374151;">
                                <span>${label}</span>
                                <textarea data-content-lang="${lang}" data-content-key="${field.key}" rows="4" style="min-height:96px; resize:vertical;">${value}</textarea>
                            </label>
                        `;
                    }
                    return `
                        <label style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem; font-weight:700; color:#374151;">
                            <span>${label}</span>
                            <input type="text" data-content-lang="${lang}" data-content-key="${field.key}" value="${value}" />
                        </label>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function buildLandingContentTranslations() {
    const next = {
        fr: { ...(restaurantConfig?.contentTranslations?.fr || {}) },
        en: { ...(restaurantConfig?.contentTranslations?.en || {}) },
        ar: { ...(restaurantConfig?.contentTranslations?.ar || {}) }
    };

    LANDING_CONTENT_FIELDS.forEach((field) => {
        CONTENT_EDITOR_LANGUAGES.forEach((lang) => {
            const element = document.querySelector(`[data-content-lang="${lang}"][data-content-key="${field.key}"]`);
            const value = element ? element.value.trim() : '';

            if (value) {
                next[lang][field.key] = value;
            } else {
                delete next[lang][field.key];
            }
        });
    });

    return next;
}

function buildGuestExperienceConfig() {
    const paymentMethods = Object.entries(GUEST_EXPERIENCE_PAYMENT_FIELDS)
        .filter(([, fieldId]) => {
            const input = document.getElementById(fieldId);
            return input && input.checked;
        })
        .map(([id]) => id);

    const facilities = Object.entries(GUEST_EXPERIENCE_FACILITY_FIELDS)
        .filter(([, fieldId]) => {
            const input = document.getElementById(fieldId);
            return input && input.checked;
        })
        .map(([id]) => id);

    return { paymentMethods, facilities };
}

function initGuestExperienceFields() {
    const guestExperience = restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || {};
    const paymentMethods = Array.isArray(guestExperience.paymentMethods) ? guestExperience.paymentMethods : [];
    const facilities = Array.isArray(guestExperience.facilities) ? guestExperience.facilities : [];

    Object.entries(GUEST_EXPERIENCE_PAYMENT_FIELDS).forEach(([id, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) input.checked = paymentMethods.includes(id);
    });

    Object.entries(GUEST_EXPERIENCE_FACILITY_FIELDS).forEach(([id, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) input.checked = facilities.includes(id);
    });
}

function buildSectionVisibilityConfig() {
    const defaults = window.defaultConfig?.sectionVisibility || {};
    const out = { ...defaults };

    Object.entries(SECTION_VISIBILITY_FIELDS).forEach(([key, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            out[key] = input.checked;
        }
    });

    return out;
}

function initSectionVisibilityFields() {
    const sectionVisibility = restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {};

    Object.entries(SECTION_VISIBILITY_FIELDS).forEach(([key, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.checked = typeof sectionVisibility[key] === 'boolean' ? sectionVisibility[key] : true;
        }
    });
}

function normalizeSectionOrderDraft(input) {
    const source = Array.isArray(input) ? input : [];
    const out = [];

    source.forEach((value) => {
        if (typeof value !== 'string') return;
        const safeValue = value.trim();
        if (!ADMIN_SECTION_ORDER_KEYS.includes(safeValue)) return;
        if (out.includes(safeValue)) return;
        out.push(safeValue);
    });

    ADMIN_SECTION_ORDER_KEYS.forEach((key) => {
        if (!out.includes(key)) {
            out.push(key);
        }
    });

    return out;
}

function renderSectionOrderEditor() {
    const container = document.getElementById('landingSectionOrderList');
    if (!container) return;

    landingSectionOrderDraft = normalizeSectionOrderDraft(landingSectionOrderDraft);

    container.innerHTML = landingSectionOrderDraft.map((key, index) => `
        <div class="section-order-item">
            <div class="section-order-copy">
                <strong>${escapeHtml(t(SECTION_ORDER_LABELS[key], key))}</strong>
                <span>Position ${index + 1}</span>
            </div>
            <div class="section-order-actions">
                <button type="button" class="section-order-btn" onclick="moveLandingSectionOrder('${key}', -1)" ${index === 0 ? 'disabled' : ''}>Up</button>
                <button type="button" class="section-order-btn" onclick="moveLandingSectionOrder('${key}', 1)" ${index === landingSectionOrderDraft.length - 1 ? 'disabled' : ''}>Down</button>
            </div>
        </div>
    `).join('');
}

window.moveLandingSectionOrder = function (key, direction) {
    const currentOrder = normalizeSectionOrderDraft(landingSectionOrderDraft);
    const index = currentOrder.indexOf(key);
    if (index === -1) return;

    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= currentOrder.length) return;

    [currentOrder[index], currentOrder[nextIndex]] = [currentOrder[nextIndex], currentOrder[index]];
    landingSectionOrderDraft = currentOrder;
    renderSectionOrderEditor();
};

const BRANDING_PREVIEW_INPUT_IDS = [
    'brandPresetId',
    'brandRestaurantName',
    'brandShortName',
    'brandTagline',
    'brandLogoMark',
    'brandPrimaryColor',
    'brandSecondaryColor',
    'brandAccentColor',
    'brandSurfaceColor',
    'brandSurfaceMuted',
    'brandTextColor',
    'brandTextMuted',
    'brandMenuBackground',
    'brandMenuSurface',
    'brandHeroImage',
    'brandHeroSlide2',
    'brandHeroSlide3',
    'brandLogoImage'
];

function normalizePreviewColor(value, fallback) {
    const raw = typeof value === 'string' ? value.trim() : '';
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw) ? raw : fallback;
}

function isValidAbsoluteUrl(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return false;

    try {
        const parsed = new URL(raw);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

function isValidAssetUrl(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return true;
    return raw.startsWith('/')
        || raw.startsWith('images/')
        || raw.startsWith('uploads/')
        || isValidAbsoluteUrl(raw);
}

function isLikelyPhoneNumber(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return false;
    return /^[+\d][\d\s\-()/.]{5,}$/.test(raw);
}

function getBrandingDraftFromForm() {
    const defaults = window.defaultBranding || {};
    const selectedPresetId = document.getElementById('brandPresetId')?.value || restaurantConfig.branding?.presetId || defaults.presetId || 'core';
    const presetDefaults = typeof window.getBrandPresetConfig === 'function'
        ? window.getBrandPresetConfig(selectedPresetId)
        : (PRESET_THEME_TOKENS[selectedPresetId] || {});
    const currentBranding = typeof window.normalizeBranding === 'function'
        ? window.normalizeBranding({ ...presetDefaults, ...(restaurantConfig.branding || defaults), presetId: selectedPresetId })
        : { ...presetDefaults, ...(restaurantConfig.branding || defaults), presetId: selectedPresetId };
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };

    return {
        presetId: selectedPresetId,
        restaurantName: getValue('brandRestaurantName') || defaults.restaurantName || 'Restaurant',
        shortName: getValue('brandShortName') || defaults.shortName || 'Restaurant',
        tagline: getValue('brandTagline') || defaults.tagline || 'Cuisine, service, and atmosphere preview',
        logoMark: getValue('brandLogoMark') || defaults.logoMark || '',
        primaryColor: normalizePreviewColor(getValue('brandPrimaryColor'), currentBranding.primaryColor || defaults.primaryColor || '#e21b1b'),
        secondaryColor: normalizePreviewColor(getValue('brandSecondaryColor'), currentBranding.secondaryColor || defaults.secondaryColor || '#ff8d08'),
        accentColor: normalizePreviewColor(getValue('brandAccentColor'), currentBranding.accentColor || defaults.accentColor || '#ffd700'),
        surfaceColor: normalizePreviewColor(getValue('brandSurfaceColor'), currentBranding.surfaceColor || defaults.surfaceColor || '#fff8f0'),
        surfaceMuted: normalizePreviewColor(getValue('brandSurfaceMuted'), currentBranding.surfaceMuted || defaults.surfaceMuted || '#f4ebdd'),
        textColor: normalizePreviewColor(getValue('brandTextColor'), currentBranding.textColor || defaults.textColor || '#261a16'),
        textMuted: normalizePreviewColor(getValue('brandTextMuted'), currentBranding.textMuted || defaults.textMuted || '#75655c'),
        menuBackground: normalizePreviewColor(getValue('brandMenuBackground'), currentBranding.menuBackground || defaults.menuBackground || '#111318'),
        menuSurface: normalizePreviewColor(getValue('brandMenuSurface'), currentBranding.menuSurface || defaults.menuSurface || '#1b1f26'),
        heroImage: getValue('brandHeroImage') || currentBranding.heroImage || defaults.heroImage || '',
        heroSlides: [
            getValue('brandHeroImage') || currentBranding.heroImage || defaults.heroImage || '',
            getValue('brandHeroSlide2') || currentBranding.heroSlides?.[1] || '',
            getValue('brandHeroSlide3') || currentBranding.heroSlides?.[2] || ''
        ],
        logoImage: getValue('brandLogoImage')
    };
}

function getBrandPreviewInitials(draft) {
    const logoMark = typeof draft.logoMark === 'string' ? draft.logoMark.trim() : '';
    if (logoMark) {
        return logoMark.slice(0, 4).toUpperCase();
    }

    const seed = (draft.shortName || draft.restaurantName || 'BR')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('');

    return (seed || 'BR').toUpperCase();
}

function toCssImageUrl(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    return `url("${raw.replace(/"/g, '\\"')}")`;
}

function applyBrandPresetToForm(presetId) {
    const preset = getPresetThemePack(presetId);
    if (!preset) return;

    const assign = (id, value) => {
        const element = document.getElementById(id);
        if (element && typeof value === 'string' && value) {
            element.value = value;
        }
    };

    assign('brandPresetId', preset.presetId || presetId);
    assign('brandPrimaryColor', preset.primaryColor);
    assign('brandSecondaryColor', preset.secondaryColor);
    assign('brandAccentColor', preset.accentColor);
    assign('brandSurfaceColor', preset.surfaceColor);
    assign('brandSurfaceMuted', preset.surfaceMuted);
    assign('brandTextColor', preset.textColor);
    assign('brandTextMuted', preset.textMuted);
    assign('brandMenuBackground', preset.menuBackground);
    assign('brandMenuSurface', preset.menuSurface);

    const heroInput = document.getElementById('brandHeroImage');
    const knownPresetHeroes = Object.values(window.brandPresetCatalog || {})
        .flatMap((entry) => {
            const values = [];
            if (entry.heroImage) values.push(entry.heroImage);
            if (Array.isArray(entry.heroSlides)) values.push(...entry.heroSlides);
            return values;
        })
        .filter(Boolean);
    const applyHeroField = (fieldId, nextValue) => {
        const input = document.getElementById(fieldId);
        if (!input) return;
        const currentValue = input.value.trim();
        if (!currentValue || knownPresetHeroes.includes(currentValue)) {
            input.value = nextValue || '';
        }
    };

    applyHeroField('brandHeroImage', preset.heroSlides?.[0] || preset.heroImage || '');
    applyHeroField('brandHeroSlide2', preset.heroSlides?.[1] || '');
    applyHeroField('brandHeroSlide3', preset.heroSlides?.[2] || '');
}

function bindBrandingPreviewEvents() {
    if (bindBrandingPreviewEvents.bound) return;
    bindBrandingPreviewEvents.bound = true;

    BRANDING_PREVIEW_INPUT_IDS.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        const eventName = element.type === 'color' ? 'input' : 'input';
        element.addEventListener(eventName, () => {
            window.updateBrandingPreview();
        });
        if (eventName !== 'change') {
            element.addEventListener('change', () => {
                if (id === 'brandPresetId') {
                    applyBrandPresetToForm(element.value);
                }
                window.updateBrandingPreview();
            });
        }
    });
}

window.updateBrandingPreview = function () {
    const draft = getBrandingDraftFromForm();
    const hero = document.getElementById('brandHeroPreview');
    const logo = document.getElementById('brandLogoPreview');
    const title = document.getElementById('brandPreviewTitle');
    const heroText = document.getElementById('brandPreviewHeroText');
    const name = document.getElementById('brandPreviewName');
    const tagline = document.getElementById('brandPreviewTagline');
    const primary = document.getElementById('brandSwatchPrimary');
    const secondary = document.getElementById('brandSwatchSecondary');
    const accent = document.getElementById('brandSwatchAccent');
    const presetLabel = document.getElementById('brandPreviewPresetLabel');
    const homepageMock = document.getElementById('brandHomepageMock');
    const homepageMockTitle = document.getElementById('brandHomepageMockTitle');
    const homepageMockText = document.getElementById('brandHomepageMockText');
    const homepageMockMeta = document.getElementById('brandHomepageMockMeta');
    const homepageMockCta = document.getElementById('brandHomepageMockCta');
    const menuShell = document.getElementById('brandMenuMockShell');
    const menuChipPrimary = document.getElementById('brandMenuChipPrimary');
    const menuCardPreview = document.getElementById('brandMenuCardPreview');
    const menuCardMedia = document.getElementById('brandMenuCardMedia');
    const menuCardTitle = document.getElementById('brandMenuCardTitle');
    const menuCardText = document.getElementById('brandMenuCardText');
    const menuCardPrice = document.getElementById('brandMenuCardPrice');
    const menuCardTag = document.getElementById('brandMenuCardTag');

    if (!hero || !logo || !title || !heroText || !name || !tagline || !primary || !secondary || !accent) {
        return;
    }

    const preset = typeof window.getBrandPresetConfig === 'function'
        ? window.getBrandPresetConfig(draft.presetId)
        : { label: 'Preset', heroImage: draft.heroImage };
    const heroGradient = `linear-gradient(135deg, ${draft.accentColor} 0%, ${draft.secondaryColor} 45%, ${draft.primaryColor} 100%)`;
    const previewCard = document.querySelector('.brand-preview-card');
    const previewBody = document.querySelector('.brand-preview-body');
    const previewSwatches = document.querySelector('.brand-preview-swatches');
    hero.style.backgroundImage = draft.heroImage
        ? `${heroGradient}, ${toCssImageUrl(draft.heroImage)}`
        : heroGradient;

    title.textContent = `${draft.shortName || draft.restaurantName} website`;
    heroText.textContent = draft.tagline || 'Logo, colors, and cover image will update here as you edit.';
    name.textContent = draft.restaurantName;
    tagline.textContent = draft.tagline || 'Brand identity preview';

    if (previewCard) {
        previewCard.style.background = draft.surfaceColor;
        previewCard.style.borderColor = `${draft.primaryColor}33`;
        previewCard.style.color = draft.textColor;
    }
    if (previewBody) {
        previewBody.style.background = draft.surfaceMuted;
    }
    if (previewSwatches) {
        previewSwatches.style.background = draft.menuBackground;
        previewSwatches.style.color = '#fff';
    }

    if (draft.logoImage) {
        logo.textContent = '';
        logo.style.backgroundImage = toCssImageUrl(draft.logoImage);
    } else {
        logo.textContent = getBrandPreviewInitials(draft);
        logo.style.backgroundImage = 'none';
    }

    logo.style.backgroundColor = `${draft.primaryColor}22`;
    logo.style.color = draft.primaryColor;
    logo.style.borderColor = `${draft.primaryColor}33`;
    primary.style.background = draft.primaryColor;
    secondary.style.background = draft.secondaryColor;
    accent.style.background = draft.accentColor;

    if (presetLabel) {
        presetLabel.textContent = preset.label || draft.presetId || 'Preset';
    }

    if (homepageMock) {
        homepageMock.style.backgroundImage = draft.heroImage
            ? `${heroGradient}, ${toCssImageUrl(draft.heroImage)}`
            : heroGradient;
    }
    if (homepageMockTitle) {
        homepageMockTitle.textContent = `${draft.shortName || draft.restaurantName} website`;
    }
    if (homepageMockText) {
        homepageMockText.textContent = draft.tagline || 'Homepage hero, CTA, and media preview.';
    }
    if (homepageMockMeta) {
        homepageMockMeta.textContent = `${preset.label || 'Preset'} preview`;
    }
    if (homepageMockCta) {
        homepageMockCta.style.background = `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`;
    }

    if (menuShell) {
        menuShell.style.background = draft.menuBackground;
    }
    if (menuChipPrimary) {
        menuChipPrimary.style.background = `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`;
        menuChipPrimary.textContent = draft.shortName || 'Menu';
    }
    if (menuCardPreview) {
        menuCardPreview.style.background = draft.menuSurface;
        menuCardPreview.style.borderColor = `${draft.primaryColor}33`;
        menuCardPreview.style.color = '#fff';
    }
    if (menuCardMedia) {
        const mediaSrc = draft.heroImage || preset.heroImage || 'images/hero-default.svg';
        menuCardMedia.style.backgroundImage = `${heroGradient}, ${toCssImageUrl(mediaSrc)}`;
    }
    if (menuCardTitle) {
        menuCardTitle.textContent = `${draft.shortName || 'Signature'} Selection`;
    }
    if (menuCardText) {
        menuCardText.textContent = `Menu cards, background depth, and accent contrast for the ${preset.label || 'active'} preset.`;
    }
    if (menuCardPrice) {
        menuCardPrice.style.color = draft.accentColor;
    }
    if (menuCardTag) {
        menuCardTag.style.background = draft.secondaryColor;
    }
};

window.clearBrandAsset = function (fieldId) {
    const target = document.getElementById(fieldId);
    if (!target) return;

    target.value = '';

    if (fieldId === 'brandLogoImage') {
        const fileInput = document.getElementById('brandLogoFile');
        if (fileInput) fileInput.value = '';
    }

    if (fieldId === 'brandHeroImage') {
        const fileInput = document.getElementById('brandHeroFile');
        if (fileInput) fileInput.value = '';
    }

    if (fieldId === 'brandHeroSlide2') {
        const fileInput = document.getElementById('brandHeroSlide2File');
        if (fileInput) fileInput.value = '';
    }

    if (fieldId === 'brandHeroSlide3') {
        const fileInput = document.getElementById('brandHeroSlide3File');
        if (fileInput) fileInput.value = '';
    }

    window.updateBrandingPreview();
};

window.handleBrandAssetUpload = async function (fieldId, input) {
    const file = input && input.files && input.files[0];
    if (!file) return;

    try {
        const url = await uploadImageToServer(file);
        const target = document.getElementById(fieldId);
        if (target) {
            target.value = url;
        }
        window.updateBrandingPreview();
        showToast('Image uploaded. Save branding to publish it.');
    } catch (error) {
        console.error('Brand asset upload error:', error);
        showToast('Upload failed. Please try again.');
    } finally {
        if (input) {
            input.value = '';
        }
    }
};

function initLandingPageForm() {
    const config = restaurantConfig;
    const fields = {
        'lpAddress': config.location.address,
        'lpMapUrl': config.location.url,
        'lpPhone': config.phone,
        'lpInsta': config.socials.instagram,
        'lpFb': config.socials.facebook,
        'lpTiktok': config.socials.tiktok,
        'lpTrip': config.socials.tripadvisor || ''
    };
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
    }

    initGuestExperienceFields();
    initSectionVisibilityFields();
    landingSectionOrderDraft = normalizeSectionOrderDraft(
        restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS
    );
    renderSectionOrderEditor();
    renderLandingContentEditor();
}

function initBrandingForm() {
    const branding = restaurantConfig.branding || window.defaultBranding || {};
    const fields = {
        brandPresetId: branding.presetId || 'core',
        brandRestaurantName: branding.restaurantName || '',
        brandShortName: branding.shortName || '',
        brandTagline: branding.tagline || '',
        brandLogoMark: branding.logoMark || '',
        brandPrimaryColor: branding.primaryColor || '#e21b1b',
        brandSecondaryColor: branding.secondaryColor || '#ff8d08',
        brandAccentColor: branding.accentColor || '#ffd700',
        brandSurfaceColor: branding.surfaceColor || '#fff8f0',
        brandSurfaceMuted: branding.surfaceMuted || '#f4ebdd',
        brandTextColor: branding.textColor || '#261a16',
        brandTextMuted: branding.textMuted || '#75655c',
        brandMenuBackground: branding.menuBackground || '#111318',
        brandMenuSurface: branding.menuSurface || '#1b1f26',
        brandHeroImage: branding.heroImage || '',
        brandHeroSlide2: branding.heroSlides?.[1] || '',
        brandHeroSlide3: branding.heroSlides?.[2] || '',
        brandLogoImage: branding.logoImage || ''
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });

    bindBrandingPreviewEvents();
    window.updateBrandingPreview();
}

function initSuperCatForm() {
    const container = document.getElementById('scCatsList');
    if (!container) return;
    const cats = Object.keys(catEmojis);
    container.innerHTML = cats.map(cat => `
            <label class="chip-select-option">
                <input type="checkbox" value="${cat}" class="sc-cat-check">
                <span>${escapeHtml(window.getLocalizedCategoryName(cat, cat))}</span>
            </label>
        `).join('');
}

function renderSuperCatTable() {
    const tbody = document.querySelector('#superCatTable tbody');
    if (!tbody) return;
    tbody.innerHTML = restaurantConfig.superCategories.map(sc => `
            <tr>
            <td>${sc.emoji}</td>
            <td><strong>${sc.name}</strong><br><small>${sc.time || ''}</small></td>
            <td>${sc.cats.join(', ')}</td>
            <td>
                <button class="action-btn" onclick="editSuperCat('${sc.id}')">${ADMIN_ICON.edit}</button>
                <button class="action-btn" onclick="deleteSuperCat('${sc.id}')">${ADMIN_ICON.trash}</button>
            </td>
        </tr>
            `).join('');
}

function editSuperCat(id) {
    const sc = restaurantConfig.superCategories.find(s => s.id === id);
    if (!sc) return;
    currentMenuWorkspaceStep = 'supercategories';
    openMenuCrudModal('supercategory', `Edit Super Category - ${sc.name}`);

    const editingIdInput = document.getElementById('scEditingId');
    if (editingIdInput) editingIdInput.value = sc.id;
    document.getElementById('scName').value = sc.name;
    document.getElementById('scEmoji').value = sc.emoji;
    document.getElementById('scDesc').value = sc.desc;
    document.getElementById('scTime').value = sc.time || '';
    setSuperCategoryTranslationFields(sc.translations, sc.name, sc.desc);

    const checks = document.querySelectorAll('.sc-cat-check');
    checks.forEach(cb => cb.checked = sc.cats.includes(cb.value));
}

function deleteSuperCat(id) {
    if (confirm('Delete this super category?')) {
        restaurantConfig.superCategories = restaurantConfig.superCategories.filter(s => s.id !== id);
        saveAndRefresh();
    }
}

async function uploadImageToServer(file) {
    const formData = new FormData();
    formData.append('image', file, file.name);

    const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (!response.ok) {
        if (response.status === 401) {
            alert('Session expired. Please sign in again.');
            location.reload();
            return;
        }
        throw new Error('Upload failed: ' + response.statusText);
    }

    const data = await response.json();
    if (data.ok && data.url) {
        return data.url;
    }
    if (data.urls && data.urls.length > 0) {
        return data.urls[0];
    }
    throw new Error('No URL returned from server');
}


function renderImporterDraftOutputs(draft) {
    const summaryEl = document.getElementById('importStudioSummaryOutput');
    const jsonEl = document.getElementById('importStudioJsonOutput');
    const reviewGridEl = document.getElementById('importStudioReviewGrid');
    const applyNoteEl = document.getElementById('importStudioApplyNote');
    const applyMenuOnlyBtn = document.getElementById('applyImporterMenuOnlyBtn');
    const applyStructureBtn = document.getElementById('applyImporterStructureBtn');
    if (!summaryEl || !jsonEl) return;

    if (!draft) {
        summaryEl.value = 'No draft generated yet.';
        jsonEl.value = '';
        lastImporterReviewReport = null;
        if (reviewGridEl) reviewGridEl.innerHTML = '';
        if (applyNoteEl) {
            applyNoteEl.className = 'importer-apply-note';
            applyNoteEl.textContent = '';
        }
        if (applyMenuOnlyBtn) applyMenuOnlyBtn.disabled = true;
        if (applyStructureBtn) applyStructureBtn.disabled = true;
        return;
    }

    const restaurantData = draft.restaurantData || {};
    const review = draft.review || {};
    const menuItems = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
    const superCategories = Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : [];
    const blockers = Array.isArray(review.blockers) ? review.blockers : [];
    const warnings = Array.isArray(review.warnings) ? review.warnings : [];
    const untranslatedItems = Array.isArray(review.untranslatedItems) ? review.untranslatedItems : [];
    const reviewReport = getImporterReviewReport(draft);
    lastImporterReviewReport = reviewReport;

    summaryEl.value = [
        `Job id: ${lastImporterDraftMeta?.jobId || 'n/a'}`,
        `Summary: ${review.summary || 'No summary returned.'}`,
        `Menu items: ${menuItems.length}`,
        `Categories: ${Object.keys(restaurantData.catEmojis || {}).length}`,
        `Super categories: ${superCategories.length}`,
        `Blockers: ${reviewReport.blockers.length}`,
        `Warnings: ${reviewReport.warnings.length}`,
        `Untranslated items: ${untranslatedItems.length}`,
        `Library image matches: ${lastImporterDraftMeta?.mediaLibraryMatches || review.mediaLibraryMatches || 0}`,
        `Menu extraction confidence: ${review.confidence?.menuExtraction || 'unknown'}`,
        `Translation confidence: ${review.confidence?.translations || 'unknown'}`,
        `Media confidence: ${review.confidence?.mediaMatching || 'unknown'}`,
        '',
        reviewReport.blockers.length ? `Blockers:\n- ${reviewReport.blockers.join('\n- ')}` : 'Blockers:\n- none',
        '',
        reviewReport.warnings.length ? `Warnings:\n- ${reviewReport.warnings.join('\n- ')}` : 'Warnings:\n- none'
    ].join('\n');

    jsonEl.value = JSON.stringify(draft, null, 2);

    if (reviewGridEl) {
        reviewGridEl.innerHTML = [
            { value: reviewReport.menuItemCount, label: 'Items' },
            { value: reviewReport.categoryCount, label: 'Categories' },
            { value: reviewReport.superCategoryCount, label: 'Super Categories' },
            { value: reviewReport.missingPriceCount, label: 'Missing Prices' },
            { value: reviewReport.missingTranslationCount + reviewReport.weakTranslationCount, label: 'Translation Issues' },
            { value: reviewReport.uncategorizedCount, label: 'Unmapped Items' }
        ].map((entry) => `
            <div class="importer-review-stat">
                <strong>${entry.value}</strong>
                <span>${entry.label}</span>
            </div>
        `).join('');
    }

    if (applyMenuOnlyBtn) {
        applyMenuOnlyBtn.disabled = !reviewReport.canApplyMenuOnly;
    }
    if (applyStructureBtn) {
        applyStructureBtn.disabled = !reviewReport.canApplyMenuStructure;
    }

    if (applyNoteEl) {
        if (reviewReport.blockers.length) {
            applyNoteEl.className = 'importer-apply-note is-block';
            applyNoteEl.textContent = `Blockers found: ${reviewReport.blockers.join(' | ')}`;
        } else if (reviewReport.warnings.length) {
            applyNoteEl.className = 'importer-apply-note is-warn';
            applyNoteEl.textContent = `Warnings: ${reviewReport.warnings.slice(0, 4).join(' | ')}`;
        } else {
            applyNoteEl.className = 'importer-apply-note';
            applyNoteEl.textContent = '';
        }
    }
}

function getImporterReviewReport(draft) {
    const restaurantData = draft?.restaurantData || {};
    const review = draft?.review || {};
    const menuItems = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
    const catMap = restaurantData.catEmojis && typeof restaurantData.catEmojis === 'object' ? restaurantData.catEmojis : {};
    const categoryTranslationMap = restaurantData.categoryTranslations && typeof restaurantData.categoryTranslations === 'object'
        ? restaurantData.categoryTranslations
        : {};
    const superCategories = Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : [];
    const hasArabicScript = (value) => /[\u0600-\u06FF]/.test(typeof value === 'string' ? value : '');
    const normalizeCompare = (value) => (typeof value === 'string' ? value.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '');
    const isWeakTranslation = (item) => {
        const translations = normalizeMenuItemTranslations(item?.translations);
        const baseName = typeof item?.name === 'string' ? item.name.trim() : '';
        const frName = translations.fr?.name || '';
        const enName = translations.en?.name || '';
        const arName = translations.ar?.name || '';
        const baseNorm = normalizeCompare(baseName);
        const frNorm = normalizeCompare(frName);
        const enNorm = normalizeCompare(enName);
        const arNorm = normalizeCompare(arName);

        if (!frName || !enName || !arName) return true;
        if (!hasArabicScript(arName)) return true;
        if (frNorm && enNorm && frNorm === enNorm && frNorm !== 'sushi' && frNorm !== 'pizza' && frNorm !== 'burger') return true;
        if (baseNorm && frNorm === baseNorm && enNorm === baseNorm && arNorm === baseNorm) return true;
        return false;
    };

    const missingPriceCount = menuItems.filter((item) => item?.price === null || item?.price === '' || typeof item?.price === 'undefined').length;
    const missingTranslationCount = menuItems.filter((item) => {
        const translations = normalizeMenuItemTranslations(item?.translations);
        return ['fr', 'en', 'ar'].some((lang) => !translations[lang]?.name);
    }).length;
    const missingDescriptionCount = menuItems.filter((item) => {
        const desc = typeof item?.desc === 'string' ? item.desc.trim() : '';
        return !desc;
    }).length;
    const uncategorizedCount = menuItems.filter((item) => {
        const cat = typeof item?.cat === 'string' ? item.cat.trim() : '';
        return !cat || !catMap[cat];
    }).length;
    const currentCategoryKeys = Object.keys(catEmojis || {});
    const menuOnlyCategoryMismatchCount = menuItems.filter((item) => {
        const cat = typeof item?.cat === 'string' ? item.cat.trim() : '';
        return cat && !currentCategoryKeys.includes(cat);
    }).length;
    const categoryKeys = Object.keys(catMap);
    const weakTranslationCount = menuItems.filter((item) => isWeakTranslation(item)).length;
    const duplicateIdCount = (() => {
        const ids = menuItems.map((item) => typeof item?.id === 'string' || typeof item?.id === 'number' ? String(item.id).trim() : '').filter(Boolean);
        return ids.length - new Set(ids).size;
    })();
    const duplicateNameCount = (() => {
        const seen = new Set();
        let duplicates = 0;
        menuItems.forEach((item) => {
            const key = `${normalizeCompare(item?.cat)}|${normalizeCompare(item?.name)}`;
            if (!key || key === '|') return;
            if (seen.has(key)) {
                duplicates += 1;
                return;
            }
            seen.add(key);
        });
        return duplicates;
    })();
    const orphanSuperCategoryRefCount = superCategories.reduce((total, entry) => {
        const cats = Array.isArray(entry?.cats) ? entry.cats : [];
        return total + cats.filter((cat) => typeof cat === 'string' && cat.trim() && !catMap[cat.trim()]).length;
    }, 0);

    const derivedBlockers = [];
    if (!menuItems.length) derivedBlockers.push('No menu items were extracted.');
    if (!categoryKeys.length) derivedBlockers.push('No categories were extracted.');
    if (uncategorizedCount > 0) derivedBlockers.push(`${uncategorizedCount} menu item(s) are not mapped to a valid category.`);
    if (duplicateIdCount > 0) derivedBlockers.push(`${duplicateIdCount} duplicate menu item id(s) remain in the draft.`);
    if (duplicateNameCount > 0) derivedBlockers.push(`${duplicateNameCount} duplicate menu item name(s) remain inside the same category.`);
    if (orphanSuperCategoryRefCount > 0) derivedBlockers.push(`${orphanSuperCategoryRefCount} super-category reference(s) point to missing categories.`);

    const baseBlockers = Array.isArray(review.blockers) ? review.blockers.filter(Boolean) : [];
    const warnings = [
        ...(Array.isArray(review.warnings) ? review.warnings.filter(Boolean) : []),
        ...(missingPriceCount > 0 ? [`${missingPriceCount} item(s) still miss a price.`] : []),
        ...(missingTranslationCount > 0 ? [`${missingTranslationCount} item(s) still miss one or more translated names.`] : []),
        ...(weakTranslationCount > 0 ? [`${weakTranslationCount} item(s) still look like fallback translations and should be reviewed before apply.`] : []),
        ...(missingDescriptionCount > 0 ? [`${missingDescriptionCount} item(s) still miss a description.`] : []),
        ...(menuOnlyCategoryMismatchCount > 0 ? [`${menuOnlyCategoryMismatchCount} item(s) use categories that do not exist in the current site. Use "Menu + category structure" instead of "Menu only".`] : [])
    ];

    const blockers = [...baseBlockers, ...derivedBlockers];

    return {
        menuItemCount: menuItems.length,
        categoryCount: categoryKeys.length || Object.keys(categoryTranslationMap).length,
        superCategoryCount: superCategories.length,
        missingPriceCount,
        missingTranslationCount,
        weakTranslationCount,
        missingDescriptionCount,
        uncategorizedCount,
        menuOnlyCategoryMismatchCount,
        duplicateIdCount,
        duplicateNameCount,
        orphanSuperCategoryRefCount,
        blockers,
        warnings,
        canApplyMenuOnly: menuItems.length > 0 && menuOnlyCategoryMismatchCount === 0 && blockers.length === 0,
        canApplyMenuStructure: menuItems.length > 0 && categoryKeys.length > 0 && uncategorizedCount === 0 && blockers.length === 0
    };
}

function isPdfImportFile(file) {
    const source = file || {};
    const name = typeof source.name === 'string' ? source.name.trim().toLowerCase() : '';
    const type = typeof source.type === 'string' ? source.type.trim().toLowerCase() : '';
    return type === 'application/pdf' || name.endsWith('.pdf');
}

async function uploadFilesForImporter(fileList, label) {
    const files = Array.from(fileList || []).filter(Boolean);
    const urls = [];

    for (let index = 0; index < files.length; index += 1) {
        showToast(`Uploading ${label} ${index + 1}/${files.length}...`);
        const url = await uploadImageToServer(files[index]);
        if (url) urls.push(url);
    }

    return urls;
}

function buildImporterApplyPayload(draft, scope = 'menu_only') {
    const imported = draft?.restaurantData || {};
    const importedMenu = Array.isArray(imported.menu) && imported.menu.length ? imported.menu : menu;
    const preparedMenu = importedMenu.map((item) => {
        const images = Array.isArray(item?.images)
            ? item.images.filter((value) => typeof value === 'string' && value.trim())
            : [];
        const img = typeof item?.img === 'string' ? item.img.trim() : '';

        if (img || images.length) {
            return {
                ...item,
                img: img || images[0] || '',
                images: images.length ? images : (img ? [img] : [])
            };
        }

        if (typeof window.getMenuImageSuggestion === 'function') {
            const suggestion = window.getMenuImageSuggestion(item);
            if (suggestion?.src) {
                return {
                    ...item,
                    img: suggestion.src,
                    images: [suggestion.src]
                };
            }
        }

        return item;
    });

    const applyStructure = scope === 'menu_structure';

    return {
        menu: preparedMenu,
        catEmojis: applyStructure
            ? { ...(imported.catEmojis || {}) }
            : { ...catEmojis },
        categoryImages: { ...categoryImages },
        categoryTranslations: applyStructure
            ? { ...(imported.categoryTranslations || {}) }
            : { ...categoryTranslations },
        wifi: {
            ssid: restaurantConfig.wifi?.name || '',
            pass: restaurantConfig.wifi?.code || ''
        },
        social: {
            ...(restaurantConfig.socials || {})
        },
        guestExperience: restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: {
            ...(restaurantConfig.branding || window.defaultBranding || {})
        },
        contentTranslations: {
            fr: { ...(restaurantConfig.contentTranslations?.fr || {}) },
            en: { ...(restaurantConfig.contentTranslations?.en || {}) },
            ar: { ...(restaurantConfig.contentTranslations?.ar || {}) }
        },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: applyStructure
            ? (Array.isArray(imported.superCategories) && imported.superCategories.length ? imported.superCategories : [])
            : (restaurantConfig.superCategories || []),
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: {
                ...(restaurantConfig.location || {})
            },
            phone: restaurantConfig.phone || ''
        }
    };
}

window.generateImporterDraft = async function () {
    const menuFiles = Array.from(document.getElementById('importStudioMenuFiles')?.files || []);
    const branding = restaurantConfig?.branding || {};
    const restaurantName = (branding.restaurantName || window.getRestaurantDisplayName?.() || '').trim();
    const shortName = (branding.shortName || restaurantName || '').trim();
    const menuImageFiles = menuFiles.filter((file) => !isPdfImportFile(file));
    const menuPdfFiles = menuFiles.filter((file) => isPdfImportFile(file));

    if (!menuFiles.length) {
        showToast('Add at least one menu image or PDF first.');
        return;
    }

    if (menuFiles.length > IMPORT_STUDIO_MAX_MENU_IMAGES) {
        showToast(`Use up to ${IMPORT_STUDIO_MAX_MENU_IMAGES} menu files per draft.`);
        return;
    }

    try {
        showToast('Uploading import assets...');
        const menuImageUrls = await uploadFilesForImporter(menuImageFiles, 'menu image');
        const menuPdfUrls = await uploadFilesForImporter(menuPdfFiles, 'menu PDF');

        showToast('Generating menu draft...');
        const response = await fetch('/api/importer/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                restaurantName,
                shortName,
                notes: '',
                menuImageUrls,
                menuPdfUrls,
                logoImageUrl: '',
                restaurantPhotoUrls: []
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.draft) {
            const error = new Error(data.error || 'Importer draft failed.');
            error.jobId = data.jobId || '';
            error.stage = data.stage || '';
            throw error;
        }

        lastImporterDraft = data.draft;
        lastImporterDraftMeta = {
            jobId: data.jobId || '',
            mediaLibraryMatches: Number(data.mediaLibraryMatches) || 0
        };
        renderImporterDraftOutputs(lastImporterDraft);
        showToast('Menu draft generated.');
    } catch (error) {
        console.error('Importer draft error:', error);
        const message = error?.message === 'openai_not_configured'
            ? 'Set OPENAI_API_KEY on the admin server before using AI Import Studio.'
            : error?.message === 'invalid_json_from_openai'
                ? 'The model returned an invalid menu draft. Try fewer or clearer menu files.'
                : error?.message === 'incomplete_openai_response'
                    ? 'The model stopped before finishing the menu draft. Try fewer files or a clearer menu capture.'
                    : error.message;
        const stageLabel = error?.stage ? ` [${String(error.stage).replace(/_/g, ' ')}]` : '';
        const jobLabel = error?.jobId ? ` Job: ${error.jobId}.` : '';
        showToast(`Menu draft failed${stageLabel}: ${message}.${jobLabel}`.replace(/\.\s*\./g, '.'));
    }
};

window.applyImporterDraft = async function (scope = 'menu_only') {
    if (!lastImporterDraft) {
        showToast('Generate a draft first.');
        return;
    }

    const report = lastImporterReviewReport || getImporterReviewReport(lastImporterDraft);
    if (scope === 'menu_structure' && !report.canApplyMenuStructure) {
        showToast('Fix the importer blockers before applying category structure.');
        return;
    }
    if (scope === 'menu_only' && !report.canApplyMenuOnly) {
        showToast('The draft does not contain any menu items to apply.');
        return;
    }

    const confirmText = scope === 'menu_structure'
        ? 'Apply menu items and imported category structure to the current restaurant instance? Branding, landing, gallery, and other site identity settings will stay unchanged.'
        : 'Apply menu items only to the current restaurant instance? Category structure and site identity settings will stay unchanged.';
    if (!confirm(confirmText)) {
        return;
    }

    try {
        const payload = buildImporterApplyPayload(lastImporterDraft, scope);
        const response = await fetch('/api/data/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ data: payload })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.ok) {
            throw new Error(data.error || 'Draft apply failed.');
        }

        await loadDataFromServer();
        refreshUI();
        showToast(scope === 'menu_structure' ? 'Menu and structure applied.' : 'Menu items applied.');
    } catch (error) {
        console.error('Apply importer draft error:', error);
        showToast(`Draft apply failed: ${error.message}`);
    }
};

window.copyImporterDraftJson = async function () {
    if (!lastImporterDraft) {
        showToast('No draft to copy yet.');
        return;
    }

    try {
        await navigator.clipboard.writeText(JSON.stringify(lastImporterDraft, null, 2));
        showToast('Importer draft JSON copied.');
    } catch (error) {
        console.error('Copy importer draft error:', error);
        showToast('Could not copy importer draft JSON.');
    }
};

// Image handling helper
const toImageUrl = (img) => img;

function deleteItem(id) { if (confirm('Supprimer cet article ?')) { menu = menu.filter(m => m.id != id); promoIds = promoIds.filter(pid => pid != id); saveAndRefresh(); } }
function hasPromoId(id) {
    return promoIds.some((pid) => String(pid) === String(id));
}
function togglePromo(id) {
    if (hasPromoId(id)) {
        promoIds = promoIds.filter(pid => String(pid) !== String(id));
    } else {
        promoIds.push(id);
    }
    window.promoIds = promoIds; // Sync for shared.js
    saveAndRefresh();
}
function toggleFeatured(id) {
    const item = menu.find(m => m.id == id);
    if (item) {
        item.featured = !item.featured;
        saveAndRefresh();
    }
}

window.togglePromo = togglePromo;
window.toggleFeatured = toggleFeatured;
// Legacy save handlers kept only as a fallback reference while the newer save flow remains below.
async function forceSaveChangesLegacy() {
    try {
        // If user is currently editing a food item, commit those changes first
        if (editingItemId && typeof window.commitFormItem === 'function') {
            await window.commitFormItem();
        } else {
            await saveAndRefresh();
            showToast('All changes saved.');
        }

        // Visual feedback on float button
        const btn = document.getElementById('floatSaveBtn');
        if (btn) {
            btn.classList.add('saved');
            btn.innerHTML = '<span style="font-size:1.3rem;">✓</span><span>Saved</span>';
            setTimeout(() => {
                btn.classList.remove('saved');
                btn.innerHTML = '<span style="font-size:1.3rem;">💾</span><span>Save</span>';
            }, 2500);
        }
    } catch (e) {
        console.error('Save Error:', e);
        alert('Save error: ' + e.message);
    }
}
async function saveAndRefreshLegacy() {
    setAdminSaveState('saving', t('admin.save_state.saving_message', 'Saving changes to the server...'));
    // Strip base64 images before sending to server
    const cleanMenu = menu.map(item => {
        const imgs = item.images || (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        const safePrimaryImage = (typeof item.img === 'string' && !item.img.startsWith('data:')) ? item.img : '';
        return {
            ...item,
            translations: normalizeMenuItemTranslations(item.translations),
            images: urlOnly,
            img: urlOnly[0] || safePrimaryImage
        };
    });

    // Build payload matching server data structure
    const payload = {
        menu: cleanMenu,
        catEmojis: catEmojis,
        categoryImages: categoryImages,
        categoryTranslations: categoryTranslations,
        wifi: { ssid: restaurantConfig.wifi?.name || '', pass: restaurantConfig.wifi?.code || '' },
        social: restaurantConfig.socials || {},
        guestExperience: restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: restaurantConfig.branding || window.defaultBranding || {},
        contentTranslations: restaurantConfig.contentTranslations || { fr: {}, en: {}, ar: {} },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: restaurantConfig.superCategories || [],
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: restaurantConfig.location,
            phone: restaurantConfig.phone
        }
    };

    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            if (res.status === 401) {
                alert('Session expired. Please sign in again.');
                location.reload();
                return;
            }
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server save failed');
        }
        refreshUI();
    } catch (e) {
        console.error('Save Error:', e);
        showToast('Save error: ' + e.message);
    }
}

async function loadSecurityStatus() {
    const statusCard = document.getElementById('securityStatusCard');
    if (!statusCard) return;

    try {
        const res = await fetch('/api/admin/security-status', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.ok) {
            adminSecurityStatus = null;
            statusCard.style.display = 'none';
            return;
        }

        adminSecurityStatus = data;
        const notes = [];

        if (data.usesDefaultCredentials) {
            notes.push(t('admin.security.default_credentials_note', 'Default admin credentials are still active. Change them before client handoff.'));
        }
        if (data.isLegacyPlainText) {
            notes.push(t('admin.security.legacy_plaintext_note', 'Credentials are still stored in the legacy plain-text format. Saving a new password will migrate them to secure hashed storage.'));
        }
        if (data.credentialSource === 'env') {
            notes.push(t('admin.security.env_source_note', 'This instance currently relies on environment credentials. Saving here will create a local hashed auth file for this restaurant.'));
        }
        if (data.credentialSource === 'default') {
            notes.push(t('admin.security.default_source_note', 'This instance is still using the built-in fallback credentials. Replace them before production delivery.'));
        }

        notes.push(t('admin.security.username_rule', 'Username rule: minimum 3 characters.'));
        notes.push(t('admin.security.password_rule', 'Password rule: minimum {count} characters.', { count: data.minPasswordLength || 8 }));
        notes.push(t('admin.security.session_rule', 'When credentials change, older admin sessions are closed automatically.'));

        const hasRisk = Boolean(
            data.usesDefaultCredentials ||
            data.isLegacyPlainText ||
            data.credentialSource === 'default'
        );
        statusCard.classList.toggle('is-risk', hasRisk);
        statusCard.innerHTML = `
            <div class="security-status-title">${t('admin.security.status_title', 'Security Status')}</div>
            <ul class="security-status-list">
                ${notes.map(note => `<li>${note}</li>`).join('')}
            </ul>
        `;
        statusCard.style.display = '';
    } catch (error) {
        console.error('Security status error:', error);
        adminSecurityStatus = null;
        statusCard.style.display = 'none';
    }
}

async function performAdminLogin() {
    console.log('[LOGIN] performAdminLogin triggered');
    const userEl = document.getElementById('loginUser');
    const passEl = document.getElementById('loginPass');
    const errorEl = document.getElementById('loginError');

    if (!userEl || !passEl) {
        console.error('[LOGIN] Missing login elements!');
        return;
    }

    const username = userEl.value.trim();
    const password = passEl.value;

    console.log('[LOGIN] Attempting login for:', username);

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log('[LOGIN] Server response:', data);
        if (!res.ok || !data.ok) {
            if (errorEl) {
                if (data.error === 'too_many_attempts' && data.retryAfterSec) {
                    const retryMinutes = Math.max(1, Math.ceil(data.retryAfterSec / 60));
                    errorEl.textContent = t('admin.login.too_many_attempts', 'Too many attempts. Try again in {minutes} min.', { minutes: retryMinutes });
                } else {
                    errorEl.textContent = t('admin.login.incorrect_credentials', 'Incorrect credentials');
                }
                errorEl.style.display = 'block';
            }
            return;
        }

        if (errorEl) {
            errorEl.style.display = 'none';
        }
        showDashboard();
    } catch (e) {
        console.error('[LOGIN] Request error:', e);
        if (errorEl) {
            errorEl.textContent = t('admin.login.server_connection_error', 'Server connection error');
            errorEl.style.display = 'block';
        }
    }
}

function initSecurityForm() {
    const form = document.getElementById('securityForm');
    if (!form) return;

    loadSecurityStatus();

    const newUserInput = document.getElementById('adminNewUser');
    if (newUserInput && adminAuth.user) newUserInput.value = adminAuth.user;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('adminNewUser').value.trim();
        const newPassword = document.getElementById('adminNewPass').value;
        const confirmPassword = document.getElementById('adminConfirmPass').value;

        if (newPassword && newPassword !== confirmPassword) {
            showToast(t('admin.security.passwords_mismatch', 'Passwords do not match.'));
            return;
        }

        try {
            const res = await fetch('/api/admin/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newUsername, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (res.ok && data.ok) {
                adminAuth.user = data.user || newUsername;
                showToast(data.message || t('admin.security.credentials_updated', 'Credentials updated successfully.'));
                document.getElementById('adminNewPass').value = '';
                document.getElementById('adminConfirmPass').value = '';
                loadSecurityStatus();
            } else {
                showToast(data.error || t('admin.security.credentials_update_failed', 'Unable to update credentials.'));
            }
        } catch (err) {
            console.error('Credentials update error:', err);
            showToast(t('admin.login.server_connection_error', 'Server connection error.'));
        }
    };
}

function getFloatingSaveButtonMarkup(saved = false) {
    if (saved) {
        return '<span class="floating-action-icon">OK</span><span>Saved</span>';
    }
    return '<span class="floating-action-icon">SV</span><span>Publish Changes</span>';
}

async function forceSaveChanges() {
    try {
        let saved = false;

        if (editingItemId && typeof window.commitFormItem === 'function') {
            await window.commitFormItem();
            saved = true;
        } else {
            saved = await saveAndRefresh();
            if (saved) {
                showToast('All modifications have been saved.');
            }
        }

        if (!saved) {
            return;
        }

        const btn = document.getElementById('floatSaveBtn');
        if (btn) {
            btn.classList.add('saved');
            btn.innerHTML = getFloatingSaveButtonMarkup(true);
            setTimeout(() => {
                btn.classList.remove('saved');
                btn.innerHTML = getFloatingSaveButtonMarkup(false);
            }, 2500);
        }
    } catch (e) {
        console.error('Save Error:', e);
        setAdminSaveState('error', e.message || 'Save failed.');
        showToast('Save failed: ' + e.message);
    }
}

async function saveAndRefresh() {
    setAdminSaveState('saving', 'Saving changes to the server...');

    const cleanMenu = menu.map(item => {
        const imgs = item.images || (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        const safePrimaryImage = (typeof item.img === 'string' && !item.img.startsWith('data:')) ? item.img : '';
        return {
            ...item,
            translations: normalizeMenuItemTranslations(item.translations),
            images: urlOnly,
            img: urlOnly[0] || safePrimaryImage
        };
    });

    const payload = {
        menu: cleanMenu,
        catEmojis: catEmojis,
        categoryImages: categoryImages,
        categoryTranslations: categoryTranslations,
        wifi: { ssid: restaurantConfig.wifi?.name || '', pass: restaurantConfig.wifi?.code || '' },
        social: restaurantConfig.socials || {},
        guestExperience: restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: restaurantConfig.branding || window.defaultBranding || {},
        contentTranslations: restaurantConfig.contentTranslations || { fr: {}, en: {}, ar: {} },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: restaurantConfig.superCategories || [],
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: restaurantConfig.location,
            phone: restaurantConfig.phone
        }
    };

    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            if (res.status === 401) {
                setAdminSaveState('error', t('admin.save_state.session_expired', 'Session expired. Please sign in again.'));
                showToast(t('admin.save_state.session_expired', 'Session expired. Please sign in again.'));
                location.reload();
                return false;
            }

            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server save failed');
        }

        refreshUI();
        setAdminSaveState('success', t('admin.save_state.success_message', 'All current changes are saved on the server.'));
        return true;
    } catch (e) {
        console.error('Save Error:', e);
        setAdminSaveState('error', e.message || t('admin.save_state.error_message', 'Save failed.'));
        showToast(`${t('admin.save_state.error_prefix', 'Save failed')}: ${e.message}`);
        return false;
    }
}

function showToast(msg) { const t = document.getElementById('adminToast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
function showSection(id, btn) {
    const topLevelSection = resolveTopLevelSection(id);
    const navButton = btn || (topLevelSection === 'branding'
        ? document.getElementById('brandingNavBtn')
        : topLevelSection === 'info'
            ? document.getElementById('infoNavBtn')
            : topLevelSection === 'data-tools'
        ? document.getElementById('sellerToolsNavBtn')
        : topLevelSection === 'menu'
                ? document.getElementById('menuNavBtn')
                : null);
    const sectionTitle = document.getElementById('section-title');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(topLevelSection).classList.add('active');
    document.querySelectorAll(`.nav-btn[data-section="${topLevelSection}"]`).forEach(b => b.classList.add('active'));
    syncMobileParametersButton(topLevelSection);
    if (navButton) navButton.classList.add('active');
    if (sectionTitle) {
        sectionTitle.textContent = getSectionTitle(topLevelSection);
    }
    syncParameterTabs(topLevelSection);

    if (topLevelSection === 'menu') {
        if (id === 'menu') {
            resetMenuBuilderNavigation();
        } else {
            currentMenuWorkspaceStep = getMenuWorkspaceStepForSection(id);
        }
        renderMenuBuilder();
    } else if (id !== topLevelSection) {
        requestAnimationFrame(() => {
            scrollToAdminSubsection(id);
        });
    }

    // Auto-close sidebar on mobile after choosing
    if (window.innerWidth <= 992 && document.getElementById('adminSidebar')?.classList.contains('mobile-open')) {
        toggleSidebar();
    }
}

function syncMobileParametersButton(activeSection) {
    const sidebarOpen = document.getElementById('adminSidebar')?.classList.contains('mobile-open');
    const shouldActivate = sidebarOpen || activeSection === 'branding' || activeSection === 'data-tools';
    document.querySelectorAll('.nav-btn[data-section="parameters"]').forEach((button) => {
        button.classList.toggle('active', shouldActivate);
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
    const activeSection = document.querySelector('.section.active')?.id || 'menu';
    syncMobileParametersButton(activeSection);
}
function populateCatDropdown() {
    const el = document.getElementById('itemCat');
    if (el) el.innerHTML = Object.keys(catEmojis).map(c => `<option value="${c}">${window.getLocalizedCategoryName(c, c)}</option>`).join('');
}
function renderCatTable() {
    const el = document.querySelector('#catTable tbody');
    if (el) el.innerHTML = Object.keys(catEmojis).map(cat => {
        const image = typeof categoryImages?.[cat] === 'string' ? categoryImages[cat].trim() : '';
        const media = image
            ? `<span class="menu-builder-entry-thumb"><img src="${escapeHtml(image)}" alt="${escapeHtml(cat)}" loading="lazy" decoding="async"></span>`
            : `${catEmojis[cat]}`;
        return `<tr><td>${media}</td><td><strong>${cat}</strong></td><td>${menu.filter(m => m.cat === cat).length} items</td><td><button class="action-btn" title="Category image" onclick="editCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.image}</button><button class="action-btn" onclick="editCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.edit}</button><button class="action-btn" onclick="deleteCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.trash}</button></td></tr>`;
    }).join('');
}
function editCat(cat) {
    currentMenuWorkspaceStep = 'categories';
    menuBuilderSelectedCategoryKey = cat;
    openMenuCrudModal('category', `Edit Category - ${window.getLocalizedCategoryName(cat, cat)}`);

    const editingKeyInput = document.getElementById('catEditingKey');
    if (editingKeyInput) editingKeyInput.value = cat;
    const catNameInput = document.getElementById('catName');
    if (catNameInput) catNameInput.value = cat;
    populateCategorySuperCategoryOptions(getAssignedSuperCategoryIdForCategory(cat));
    const catImageInput = document.getElementById('catImage');
    if (catImageInput) catImageInput.value = categoryImages?.[cat] || '';
    const catImageUpload = document.getElementById('catImageUpload');
    if (catImageUpload) catImageUpload.value = '';
    setCategoryTranslationFields(cat);
    updateCategoryImagePreview();
}
function deleteCat(cat) {
    if (menu.some(m => m.cat === cat)) return alert('Delete the products in this category first.');
    (restaurantConfig.superCategories || []).forEach((sc) => {
        if (Array.isArray(sc.cats)) {
            sc.cats = sc.cats.filter((entry) => entry !== cat);
        }
    });
    delete catEmojis[cat];
    delete categoryTranslations[cat];
    delete categoryImages[cat];
    window.categoryImages = categoryImages;
    saveAndRefresh();
}
function initWifiForm() {
    const fields = {
        'wifiSSID': restaurantConfig.wifi.name,
        'wifiPassInput': restaurantConfig.wifi.code
    };
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
    }
    const hintS = document.getElementById('hintS');
    const hintP = document.getElementById('hintP');
    if (hintS) hintS.textContent = restaurantConfig.wifi.name;
    if (hintP) hintP.textContent = restaurantConfig.wifi.code;
}
function updateStats() {
    const p = document.getElementById('stat-products');
    const c = document.getElementById('stat-cats');
    const pr = document.getElementById('stat-promo');
    if (p) p.textContent = menu.length;
    if (c) c.textContent = Object.keys(catEmojis).length;
    if (pr) pr.textContent = promoIds.length;
}

// IMAGE MODAL LOGIC
let currentEditingId = null;

function syncImageModalAiControls() {
    const toolsEl = document.getElementById('modalAiImageTools');
    const buttonEl = document.getElementById('modalGenerateImageBtn');
    if (toolsEl) {
        toolsEl.style.display = adminCapabilities.aiMediaToolsEnabled ? '' : 'none';
    }
    if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = 'Generate with AI';
    }
}

function openImageModal(id) {
    currentEditingId = id;
    const item = menu.find(m => m.id == id); // Use == for safety
    if (!item) return;

    // Ensure item has an images array
    if (!item.images) {
        item.images = item.img ? [item.img] : [];
    }

    document.getElementById('imgModalItemName').textContent = getAdminItemDisplayName(item);
    document.getElementById('imageModal').style.display = 'flex';
    syncImageModalAiControls();
    renderModalImages();
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    currentEditingId = null;
    syncImageModalAiControls();
}

function renderModalImages() {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;
    const grid = document.getElementById('currentImagesGrid');
    const images = item.images || (item.img ? [item.img] : []);

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden; border:1px solid #ddd;">
                <img src="${img}" width="640" height="640" loading="lazy" decoding="async" fetchpriority="low" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteModalImage(${index})" style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px; font-size:12px;">&times;</button>
                </div>
        `).join('') + (images.length === 0 ? '<p class="image-modal-empty">No images yet.</p>' : '');
}

async function handleModalImageUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];

    for (let file of input.files) {
        try {
            const url = await uploadImageToServer(file);
            item.images.push(url);
        } catch (err) {
            console.error('Modal upload failed:', err);
            showToast('Upload failed.');
        }
    }

    // SYNC: Ensure main img is set to the first image for the main page cards
    if (item.images.length > 0) item.img = item.images[0];

    input.value = '';
    saveAndRefresh();
    renderModalImages();
    showToast('Images added.');
}

function addModalImageUrl() {
    const url = document.getElementById('modalImgUrl').value.trim();
    if (!url) return;
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];
    item.images.push(url);

    // SYNC: Keep main img updated
    if (item.images.length > 0) item.img = item.images[0];

    document.getElementById('modalImgUrl').value = '';
    saveAndRefresh();
    renderModalImages();
    showToast('Image added from URL.');
}

function deleteModalImage(index) {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item || !item.images) return;

    item.images.splice(index, 1);

    // SYNC: Keep main img updated after deletion
    item.img = item.images.length > 0 ? item.images[0] : '';

    saveAndRefresh();
    renderModalImages();
    showToast('Image removed.');
}

window.generateModalImageWithAI = async function () {
    if (!adminCapabilities.aiMediaToolsEnabled) {
        showToast("AI image generation is disabled.");
        return;
    }

    const item = menu.find(m => m.id == currentEditingId);
    const buttonEl = document.getElementById('modalGenerateImageBtn');
    if (!item || !buttonEl) return;
    if (!item.name || !item.name.trim()) {
        showToast('Item name is required before generating an image.');
        return;
    }

    const originalLabel = buttonEl.textContent;
    buttonEl.disabled = true;
    buttonEl.textContent = 'Generating...';

    try {
        const response = await fetch('/api/media/generate-menu-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: item.name || '',
                description: item.desc || '',
                categoryKey: item.cat || '',
                categoryName: typeof window.getLocalizedCategoryName === 'function'
                    ? window.getLocalizedCategoryName(item.cat, item.cat)
                    : (item.cat || ''),
                translations: item.translations || {}
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.url) {
            throw new Error(data.error || 'AI image generation failed.');
        }

        if (!item.images) item.images = item.img ? [item.img] : [];
        item.images = [data.url, ...item.images.filter((value) => value && value !== data.url)];
        item.img = item.images[0] || data.url;

        const saved = await saveAndRefresh();
        if (saved) {
            renderModalImages();
            showToast('AI image generated and added to the item.');
        }
    } catch (error) {
        console.error('Menu item AI image generation error:', error);
        const message = error?.message === 'openai_not_configured'
            ? 'Set OPENAI_API_KEY before using AI image generation.'
            : /verify organization|verified to use the model/i.test(error?.message || '')
                ? 'Your OpenAI organization is not verified for the configured image model. Use OPENAI_ITEM_MEDIA_MODEL=dall-e-3 or wait for verification to propagate.'
            : error.message;
        showToast(`AI image generation failed: ${message}`);
    } finally {
        buttonEl.disabled = false;
        buttonEl.textContent = originalLabel;
    }
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HOURS MANAGEMENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const HOUR_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function initHoursForm() {
    const hours = Array.isArray(restaurantConfig._hours) && restaurantConfig._hours.length > 0
        ? restaurantConfig._hours
        : window.defaultHours;
    const note = typeof restaurantConfig._hoursNote === 'string'
        ? restaurantConfig._hoursNote
        : (window.defaultHoursNote || '');

    // Populate inputs
    HOUR_KEYS.forEach((key, i) => {
        const h = hours[i];
        const openEl = document.getElementById(`h_${key}_open`);
        const closeEl = document.getElementById(`h_${key}_close`);
        const hlEl = document.getElementById(`h_${key}_hl`);
        if (openEl) openEl.value = h.open || '11:00';
        if (closeEl) closeEl.value = h.close || '23:00';
        if (hlEl) hlEl.checked = h.highlight || false;
    });

    const noteEl = document.getElementById('hoursNote');
    if (noteEl) noteEl.value = note;

    // Form submit
    const form = document.getElementById('hoursForm');
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            const updatedHours = window.defaultHours.map((def, i) => {
                const key = HOUR_KEYS[i];
                const openEl = document.getElementById(`h_${key}_open`);
                const closeEl = document.getElementById(`h_${key}_close`);
                const hlEl = document.getElementById(`h_${key}_hl`);
                return {
                    day: def.day,
                    i18n: def.i18n,
                    open: openEl ? openEl.value : def.open,
                    close: closeEl ? closeEl.value : def.close,
                    highlight: hlEl ? hlEl.checked : false
                };
            });
            const noteEl = document.getElementById('hoursNote');
            const updatedNote = noteEl ? noteEl.value.trim() : '';
            restaurantConfig._hours = updatedHours;
            restaurantConfig._hoursNote = updatedNote;
            saveAndRefresh();
            showToast('Hours updated.');
        };
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• GALLERY MANAGEMENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function initGalleryForm() {
    const form = document.getElementById('galleryForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('galleryFileInput');
        const urlInput = document.getElementById('galleryUrlInput');
        if (!fileInput || !urlInput) return;

        if (!restaurantConfig.gallery) restaurantConfig.gallery = [];

        // Handle URLs
        if (urlInput.value.trim()) {
            restaurantConfig.gallery.push(urlInput.value.trim());
            urlInput.value = '';
        }

        // Handle Files
        if (fileInput.files.length > 0) {
            showToast('Uploading gallery images...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    restaurantConfig.gallery.push(url);
                } catch (err) {
                    console.error('Gallery upload failed:', err);
                    showToast('Gallery upload failed.');
                }
            }
            fileInput.value = '';
        }

        saveAndRefresh();
        renderGalleryAdmin();
        showToast('Gallery images added.');
    };
}

function renderGalleryAdmin() {
    const grid = document.getElementById('galleryAdminGrid');
    if (!grid) return;

    const images = restaurantConfig.gallery || [];

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1.5; border-radius:12px; overflow:hidden; border:1px solid #ddd; background:#eee;">
                <img src="${img}" width="960" height="640" loading="lazy" decoding="async" fetchpriority="low" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteGalleryImage(${index})" style="position:absolute; top:8px; right:8px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:6px; cursor:pointer; padding:4px 8px; font-size:14px; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.2);">&times;</button>
                </div>
        `).join('') + (images.length === 0 ? '<p style="grid-column: 1/-1; color:#888; text-align:center; padding:40px; border:2px dashed #eee; border-radius:15px;">The gallery is empty.</p>' : '');
}

function deleteGalleryImage(index) {
    if (confirm('Supprimer cette image de la galerie ?')) {
        restaurantConfig.gallery.splice(index, 1);
        saveAndRefresh();
        renderGalleryAdmin();
        showToast('Image removed.');
    }
}
