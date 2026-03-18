let menu = [];
let catEmojis = window.defaultCatEmojis || {};
let restaurantConfig = window.restaurantConfig || window.defaultConfig || {};
let promoIds = [];
let adminAuth = { user: 'admin', pass: '' };
let adminSecurityStatus = null;
let adminSaveState = {
    type: 'idle',
    message: 'No server save yet in this session.',
    updatedAt: null
};

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
const ADMIN_SECTION_ORDER_KEYS = ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];
const SECTION_ORDER_LABELS = {
    about: 'About section',
    payments: 'Payment & facilities',
    events: 'Events section',
    gallery: 'Gallery section',
    hours: 'Hours section',
    contact: 'Contact section'
};
let landingSectionOrderDraft = [...ADMIN_SECTION_ORDER_KEYS];
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
            logoMark: '🍔',
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
                hero_sub2: 'Découvrez les',
                hero_title2: 'INCONTOURNABLES <span>{{shortName}}</span>',
                hero_desc2: 'Des recettes généreuses, rapides et pensées pour revenir souvent.',
                hero_sub3: 'Sur place, à emporter',
                hero_title3: 'CHAUD <span>ET RAPIDE</span>',
                hero_desc3: 'Une expérience simple, gourmande et efficace toute la journée.',
                about_p1: '{{restaurantName}} propose une cuisine réconfortante, bien exécutée et facile à recommander.',
                about_p2: 'Nous misons sur des recettes lisibles, des portions généreuses et un service régulier pour toutes les visites du quotidien.',
                about_p3: 'Notre ambition est simple : devenir une adresse fiable pour manger vite, bien, et avec plaisir.',
                event_birthday: 'Anniversaires',
                event_birthday_desc: 'Un format simple et convivial pour les petits groupes.',
                event_family: 'Repas entre amis',
                event_family_desc: 'Des plats à partager et une ambiance décontractée.',
                event_corporate: 'Commandes de groupe',
                event_corporate_desc: 'Une solution rapide pour les équipes et les commandes en volume.',
                event_party: 'Soirées privées',
                event_party_desc: 'Un point de rencontre gourmand pour vos moments informels.',
                events_cta_text: 'Besoin d’un format groupe ou d’une privatisation légère ? Contactez-nous.',
                footer_note: 'Cuisine généreuse, service rapide et adresse facile à recommander.'
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
                hero_sub1: 'عنوان من أجل',
                hero_title1: 'الجوع <span>المشبَع</span>',
                hero_sub2: 'اكتشف',
                hero_title2: 'مفضلات <span>{{shortName}}</span>',
                hero_desc2: 'وصفات سخية وخدمة سريعة وتجربة تشجع على العودة.',
                hero_sub3: 'داخل المطعم أو للطلب',
                hero_title3: 'ساخن <span>وسريع</span>',
                hero_desc3: 'تجربة بسيطة ومشبعة تناسب اليوم كله.',
                about_p1: '{{restaurantName}} يقدم أكلات مريحة وسهلة التوصية بها من أول زيارة.',
                about_p2: 'نركز على وصفات واضحة وحصص سخية وخدمة منتظمة تناسب الزيارات اليومية.',
                about_p3: 'هدفنا واضح: أن نصبح عنواناً موثوقاً لمن يريد أكلاً سريعاً ولذيذاً ومشبعاً.',
                event_birthday: 'أعياد الميلاد',
                event_birthday_desc: 'صيغة بسيطة وممتعة للمجموعات الصغيرة.',
                event_family: 'لقاءات الأصدقاء والعائلة',
                event_family_desc: 'أطباق للمشاركة في أجواء مريحة.',
                event_corporate: 'طلبات المجموعات',
                event_corporate_desc: 'حل سريع للفرق والطلبات الكبيرة.',
                event_party: 'أمسيات خاصة',
                event_party_desc: 'مكان مريح للاحتفالات غير الرسمية.',
                events_cta_text: 'هل تحتاج إلى صيغة جماعية أو حجز خفيف؟ تواصل معنا.',
                footer_note: 'أكل سخي وخدمة سريعة وعنوان يستحق الزيارة من جديد.'
            }
        }
    },
    cafe: {
        branding: {
            logoMark: '☕',
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
                hero_title1: 'CAFÉ <span>& BRUNCH</span>',
                hero_sub2: 'Savourez les',
                hero_title2: 'INSTANTS <span>{{shortName}}</span>',
                hero_desc2: 'Une adresse chaleureuse pour le café, les douceurs et les rendez-vous du quotidien.',
                hero_sub3: 'Du matin au goûter',
                hero_title3: 'DOUX <span>& SOIGNÉ</span>',
                hero_desc3: 'Des recettes maison et une atmosphère pensée pour prendre son temps.',
                about_p1: '{{restaurantName}} est pensé comme une adresse lumineuse pour le café, le brunch et les pauses qui font du bien.',
                about_p2: 'Nous travaillons une carte simple, soignée et accueillante, idéale pour un rendez-vous, une pause ou un moment à partager.',
                about_p3: 'Notre promesse : une expérience douce, régulière et agréable, du premier café au dernier dessert.',
                event_birthday: 'Brunchs privés',
                event_birthday_desc: 'Un format convivial pour les matinées et anniversaires en petit comité.',
                event_family: 'Rencontres entre proches',
                event_family_desc: 'Un lieu calme et chaleureux pour se retrouver autour d’une belle table.',
                event_corporate: 'Réunions café',
                event_corporate_desc: 'Un cadre détendu pour les rendez-vous professionnels et pauses d’équipe.',
                event_party: 'Goûters & célébrations',
                event_party_desc: 'Une ambiance douce pour les moments à partager.',
                events_cta_text: 'Vous préparez un brunch, une réunion ou un goûter privé ? Écrivez-nous.',
                footer_note: 'Café, brunch et douceurs servis dans une ambiance chaleureuse.'
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
                hero_sub1: 'مكان من أجل',
                hero_title1: 'القهوة <span>والبرنش</span>',
                hero_sub2: 'استمتع بـ',
                hero_title2: 'لحظات <span>{{shortName}}</span>',
                hero_desc2: 'عنوان دافئ للقهوة والحلويات واللقاءات اليومية.',
                hero_sub3: 'من الصباح إلى العصر',
                hero_title3: 'هادئ <span>ومتقن</span>',
                hero_desc3: 'وصفات منزلية وأجواء تمنحك وقتاً أجمل.',
                about_p1: '{{restaurantName}} صُمم كعنوان مريح للقهوة والبرنش والاستراحات اليومية.',
                about_p2: 'نقدم قائمة بسيطة وأنيقة تناسب المواعيد واللقاءات واللحظات الهادئة.',
                about_p3: 'وعدنا هو تجربة لطيفة وثابتة من أول فنجان قهوة إلى آخر حلوى.',
                event_birthday: 'برنشات خاصة',
                event_birthday_desc: 'صيغة ودية للاحتفالات الصباحية والمناسبات الصغيرة.',
                event_family: 'لقاءات عائلية',
                event_family_desc: 'مكان هادئ ودافئ للاجتماع حول طاولة جميلة.',
                event_corporate: 'لقاءات عمل مع القهوة',
                event_corporate_desc: 'جو مريح للاجتماعات المهنية واستراحات الفرق.',
                event_party: 'شاي العصر والاحتفالات',
                event_party_desc: 'أجواء لطيفة للحظات المشتركة.',
                events_cta_text: 'هل تخطط لبرنش أو لقاء أو مناسبة خاصة؟ تواصل معنا.',
                footer_note: 'قهوة وبرنش وحلويات منزلية في أجواء دافئة.'
            }
        }
    },
    traditional: {
        branding: {
            logoMark: '🍲',
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
                hero_desc2: 'Des plats sincères, une table familiale et un accueil généreux.',
                hero_sub3: 'Pour les repas à partager',
                hero_title3: 'AUTHENTIQUE <span>& CHALEUREUX</span>',
                hero_desc3: 'Une cuisine de tradition pensée pour les grandes et petites occasions.',
                about_p1: '{{restaurantName}} valorise la cuisine traditionnelle, les recettes de transmission et les repas qui rassemblent.',
                about_p2: 'Nous privilégions la générosité, les saveurs connues, et une atmosphère familiale qui met les invités à l’aise.',
                about_p3: 'Notre objectif est d’offrir une adresse de confiance pour les repas du quotidien comme pour les moments importants.',
                event_birthday: 'Repas de famille',
                event_birthday_desc: 'Une table accueillante pour célébrer les temps forts en famille.',
                event_family: 'Retrouvailles',
                event_family_desc: 'Un cadre adapté aux repas généreux et aux longues conversations.',
                event_corporate: 'Repas d’équipe',
                event_corporate_desc: 'Un format chaleureux pour accueillir collègues et partenaires.',
                event_party: 'Fêtes traditionnelles',
                event_party_desc: 'Une cuisine de partage pour les célébrations privées.',
                events_cta_text: 'Vous préparez un repas de groupe ou une célébration ? Contactez-nous.',
                footer_note: 'Recettes traditionnelles, table familiale et hospitalité généreuse.'
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
                hero_sub1: 'بيت لـ',
                hero_title1: 'النكهات <span>التقليدية</span>',
                hero_sub2: 'اكتشف من جديد',
                hero_title2: 'وصفات <span>{{shortName}}</span>',
                hero_desc2: 'أطباق صادقة وطاولة عائلية واستقبال كريم.',
                hero_sub3: 'للوجبات المشتركة',
                hero_title3: 'أصيل <span>ودافئ</span>',
                hero_desc3: 'مطبخ تقليدي يناسب الأيام العادية والمناسبات الخاصة.',
                about_p1: '{{restaurantName}} يحتفي بالمطبخ التقليدي والوصفات المتوارثة والوجبات التي تجمع الناس.',
                about_p2: 'نركز على الكرم والنكهات المألوفة وأجواء عائلية تجعل الضيوف يشعرون بالراحة.',
                about_p3: 'هدفنا أن نقدم عنواناً موثوقاً للوجبات اليومية وللمناسبات المهمة أيضاً.',
                event_birthday: 'وجبات عائلية',
                event_birthday_desc: 'طاولة مرحبة للاحتفال بالمناسبات مع الأحباب.',
                event_family: 'لقاءات ولمّات',
                event_family_desc: 'مكان مناسب للوجبات السخية والأحاديث الطويلة.',
                event_corporate: 'وجبات الفرق',
                event_corporate_desc: 'صيغة دافئة لاستقبال الزملاء والشركاء.',
                event_party: 'احتفالات تقليدية',
                event_party_desc: 'مطبخ قائم على المشاركة للمناسبات الخاصة.',
                events_cta_text: 'هل تخطط لوجبة جماعية أو احتفال؟ تواصل معنا.',
                footer_note: 'وصفات تقليدية وطاولة عائلية وضيافة كريمة.'
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

function replacePresetVars(value, vars) {
    if (typeof value !== 'string') return '';
    return value.replace(/\{\{(\w+)\}\}/g, (_match, key) => vars[key] || '');
}

function slugifyForWifi(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24);
}

function buildPresetTranslations(preset, vars) {
    const base = { fr: {}, en: {}, ar: {} };
    const source = preset?.contentTranslations || {};

    Object.keys(base).forEach((lang) => {
        const bucket = source[lang] && typeof source[lang] === 'object' ? source[lang] : {};
        Object.entries(bucket).forEach(([key, value]) => {
            base[lang][key] = replacePresetVars(value, vars);
        });
    });

    return base;
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

        // Populate config from server data
        if (typeof window.mergeRestaurantConfig === 'function') {
            window.mergeRestaurantConfig({
                superCategories: Array.isArray(data.superCategories) ? data.superCategories : restaurantConfig.superCategories,
                wifi: data.wifi ? { name: data.wifi.ssid || '', code: data.wifi.pass || '' } : restaurantConfig.wifi,
                socials: data.social || restaurantConfig.socials,
                guestExperience: data.guestExperience || restaurantConfig.guestExperience,
                sectionVisibility: data.sectionVisibility || restaurantConfig.sectionVisibility,
                sectionOrder: data.sectionOrder || restaurantConfig.sectionOrder,
                location: data.landing?.location || restaurantConfig.location,
                phone: data.landing?.phone || restaurantConfig.phone,
                _hours: Array.isArray(data.hours) ? data.hours : restaurantConfig._hours,
                _hoursNote: typeof data.hoursNote === 'string' ? data.hoursNote : restaurantConfig._hoursNote,
                gallery: Array.isArray(data.gallery) ? data.gallery : restaurantConfig.gallery,
                branding: data.branding || restaurantConfig.branding,
                contentTranslations: data.contentTranslations || restaurantConfig.contentTranslations
            });
            restaurantConfig = window.restaurantConfig;
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
        idle: { bg: '#f5f5f5', color: '#555', dot: '#999', label: 'Ready' },
        saving: { bg: '#fff6db', color: '#8a5a00', dot: '#f59e0b', label: 'Saving' },
        success: { bg: '#e9f9ef', color: '#166534', dot: '#10b981', label: 'Saved' },
        error: { bg: '#fdeaea', color: '#991b1b', dot: '#ef4444', label: 'Attention' }
    };
    const style = palette[adminSaveState.type] || palette.idle;
    const timeText = adminSaveState.updatedAt
        ? new Date(adminSaveState.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    el.style.background = style.bg;
    el.style.color = style.color;
    el.innerHTML = `
        <span class="admin-save-status-dot" style="background:${style.dot};"></span>
        <span>${style.label}: ${adminSaveState.message}${timeText ? ` (${timeText})` : ''}</span>
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
                errorEl.textContent = '❌ Identifiants incorrects';
                errorEl.style.display = 'block';
            }
            return;
        }
        showDashboard();
    } catch (e) {
        console.error('[LOGIN] Request error:', e);
        if (errorEl) {
            errorEl.textContent = '❌ Erreur de connexion au serveur';
            errorEl.style.display = 'block';
        }
    }
}

async function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminSidebar').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'block';
    await loadDataFromServer();
    refreshUI();
    initForms();
}

async function adminLogout() {
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); } catch (e) { }
    location.reload();
}

function refreshUI() {
    renderAdminSaveState();
    renderCategoryFilters();
    renderMenuTable();
    renderCatTable();
    renderSuperCatTable();
    populateCatDropdown();
    initBrandingForm();
    initWifiForm();
    initLandingPageForm();
    initSuperCatForm();
    initSecurityForm();
    initHoursForm();
    initGalleryForm();
    renderGalleryAdmin();
    renderLaunchReadinessCard();
    updateStats();
    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
}

function getLaunchReadinessChecks() {
    const config = window.restaurantConfig || {};
    const branding = config.branding || {};
    const location = config.location || {};
    const galleryItems = Array.isArray(config.gallery) ? config.gallery.filter(Boolean) : [];
    const hours = Array.isArray(config._hours) ? config._hours.filter(Boolean) : [];
    const mapUrl = typeof window.getSafeExternalUrl === 'function'
        ? window.getSafeExternalUrl(location.url)
        : location.url;
    const menuItems = Array.isArray(menu) ? menu : [];

    let missingTranslationCount = 0;
    let missingImageCount = 0;
    let managedLibraryImageCount = 0;

    menuItems.forEach((item) => {
        const translations = normalizeMenuItemTranslations(item.translations);
        const hasAllNames = ['fr', 'en', 'ar'].every((lang) => translations[lang]?.name);
        if (!hasAllNames) missingTranslationCount += 1;

        const primaryImage = typeof window.getPrimaryMenuItemImage === 'function'
            ? window.getPrimaryMenuItemImage(item)
            : ((Array.isArray(item.images) ? item.images.filter(Boolean)[0] : '') || item.img || '');

        if (!primaryImage) missingImageCount += 1;
        if (typeof window.isManagedMenuLibraryImage === 'function' && window.isManagedMenuLibraryImage(primaryImage)) {
            managedLibraryImageCount += 1;
        }
    });

    return [
        {
            label: 'Branding media',
            ok: Boolean(branding.logoImage && branding.heroImage),
            detail: branding.logoImage && branding.heroImage
                ? 'Logo and hero image are configured.'
                : 'Add both a logo and a hero image before delivery.'
        },
        {
            label: 'Core contact details',
            ok: Boolean(location.address && mapUrl && config.phone),
            detail: location.address && mapUrl && config.phone
                ? 'Address, map link, and phone are present.'
                : 'Address, map URL, or phone is still incomplete.'
        },
        {
            label: 'Opening hours',
            ok: hours.length > 0,
            detail: hours.length > 0
                ? `${hours.length} hour rows configured.`
                : 'Add opening hours before handoff.'
        },
        {
            label: 'Menu coverage',
            ok: menuItems.length > 0,
            detail: menuItems.length > 0
                ? `${menuItems.length} menu items configured.`
                : 'No menu items are configured yet.'
        },
        {
            label: 'Menu translations',
            ok: menuItems.length > 0 && missingTranslationCount === 0,
            detail: menuItems.length === 0
                ? 'Add menu items before reviewing translations.'
                : missingTranslationCount === 0
                    ? 'All menu items have FR / EN / AR names.'
                    : `${missingTranslationCount} menu item(s) still miss one or more translated names.`
        },
        {
            label: 'Item imagery',
            ok: menuItems.length > 0 && missingImageCount === 0,
            detail: menuItems.length === 0
                ? 'Add menu items before reviewing dish imagery.'
                : missingImageCount === 0
                    ? managedLibraryImageCount > 0
                        ? `Every menu item has an image source. ${managedLibraryImageCount} item(s) still use managed library placeholders.`
                        : 'Every menu item has an image source.'
                    : `${missingImageCount} menu item(s) still miss an image.`
        },
        {
            label: 'Gallery',
            ok: galleryItems.length > 0,
            detail: galleryItems.length > 0
                ? `${galleryItems.length} gallery image(s) configured.`
                : 'Add at least one gallery image for a more complete delivery.'
        },
        {
            label: 'Admin security',
            ok: Boolean(adminSecurityStatus) && !adminSecurityStatus.usesDefaultCredentials,
            detail: !adminSecurityStatus
                ? 'Security status has not loaded yet.'
                : adminSecurityStatus.usesDefaultCredentials
                ? 'Default admin credentials are still active.'
                : 'Custom admin credentials are active.'
        }
    ];
}

function getLaunchReadinessAction(check) {
    const source = check && typeof check === 'object' ? check : {};
    switch (source.label) {
        case 'Branding media':
            return { sectionId: 'branding', label: 'Open Branding' };
        case 'Core contact details':
            return { sectionId: 'landing', label: 'Open Landing' };
        case 'Opening hours':
            return { sectionId: 'hours', label: 'Open Hours' };
        case 'Menu coverage':
        case 'Menu translations':
        case 'Item imagery':
            return { sectionId: 'menu', label: 'Open Menu' };
        case 'Gallery':
            return { sectionId: 'gallery', label: 'Open Gallery' };
        case 'Admin security':
            return { sectionId: 'security', label: 'Open Security' };
        default:
            return null;
    }
}

function getMediaSlotAction(slot) {
    const source = slot && typeof slot === 'object' ? slot : {};
    switch (source.id) {
        case 'branding.logo':
        case 'branding.hero.primary':
        case 'branding.hero.slide2':
        case 'branding.hero.slide3':
            return { sectionId: 'branding', label: 'Open Branding' };
        case 'homepage.gallery':
            return { sectionId: 'gallery', label: 'Open Gallery' };
        case 'menu.featured':
        case 'menu.promo':
        case 'menu.items':
            return { sectionId: 'menu', label: 'Open Menu' };
        default:
            return null;
    }
}

window.openReadinessSection = function (sectionId) {
    if (!sectionId) return;
    const btn = Array.from(document.querySelectorAll('.nav-btn')).find((element) => {
        const handler = element.getAttribute('onclick') || '';
        return handler.includes(`showSection('${sectionId}'`);
    });

    if (btn && typeof showSection === 'function') {
        showSection(sectionId, btn);
    }

    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

function renderLaunchReadinessCard() {
    const summaryEl = document.getElementById('launchReadinessSummary');
    const listEl = document.getElementById('launchReadinessList');
    const mediaEl = document.getElementById('launchReadinessMedia');
    const noteEl = document.getElementById('launchReadinessNote');
    if (!summaryEl || !listEl || !mediaEl || !noteEl) return;

    const checks = getLaunchReadinessChecks();
    const mediaSlots = typeof window.getMediaSlotAudit === 'function'
        ? window.getMediaSlotAudit(window.restaurantConfig || {}, Array.isArray(menu) ? menu : [], promoIds)
        : [];
    const mediaBlockers = mediaSlots.filter((slot) => slot.blocksHandoff);
    const mediaWarnings = mediaSlots.filter((slot) => !slot.blocksHandoff && slot.state !== 'ready');
    const mediaManaged = mediaSlots.filter((slot) => slot.state === 'managed');
    const mediaMissing = mediaSlots.filter((slot) => slot.state === 'missing');
    const mediaPartial = mediaSlots.filter((slot) => slot.state === 'partial');

    const okCount = checks.filter((check) => check.ok).length;
    const totalCount = checks.length;
    const allReady = okCount === totalCount && mediaBlockers.length === 0;
    const summaryLabel = allReady
        ? 'Ready for final review'
        : mediaBlockers.length > 0
            ? `${mediaBlockers.length} handoff blocker(s)`
            : `${okCount}/${totalCount} checks passed`;

    summaryEl.innerHTML = `
        <span class="readiness-summary-dot"></span>
        <span>${summaryLabel}</span>
    `;
    summaryEl.style.background = allReady ? '#ecfdf5' : (mediaBlockers.length > 0 ? '#fef2f2' : '#fffbeb');
    summaryEl.style.color = allReady ? '#166534' : (mediaBlockers.length > 0 ? '#991b1b' : '#92400e');

    listEl.innerHTML = checks.map((check) => {
        const action = getLaunchReadinessAction(check);
        return `
            <div class="readiness-item ${check.ok ? 'is-ok' : 'is-warn'}">
                <div class="readiness-item-main">
                    <strong>${check.label}</strong>
                    <small>${check.detail}</small>
                    ${action ? `<button type="button" class="readiness-action" onclick="openReadinessSection('${action.sectionId}')">${action.label}</button>` : ''}
                </div>
                <span class="readiness-badge">${check.ok ? 'OK' : 'Needs work'}</span>
            </div>
        `;
    }).join('');

    mediaEl.innerHTML = `
        <div class="readiness-section-title">Media Delivery Status</div>
        <div class="readiness-metrics">
            <span class="readiness-metric ${mediaBlockers.length > 0 ? 'is-block' : 'is-muted'}">${mediaBlockers.length} blocker${mediaBlockers.length === 1 ? '' : 's'}</span>
            <span class="readiness-metric ${mediaWarnings.length > 0 ? 'is-warn' : 'is-muted'}">${mediaWarnings.length} warning${mediaWarnings.length === 1 ? '' : 's'}</span>
            <span class="readiness-metric ${mediaManaged.length > 0 ? 'is-managed' : 'is-muted'}">${mediaManaged.length} managed</span>
            <span class="readiness-metric ${mediaMissing.length > 0 || mediaPartial.length > 0 ? 'is-warn' : 'is-muted'}">${mediaMissing.length} missing / ${mediaPartial.length} partial</span>
        </div>
        ${mediaSlots.length === 0
            ? '<div class="readiness-item is-warn"><div><strong>Media audit unavailable</strong><small>Run again after the restaurant data loads fully.</small></div><span class="readiness-badge">Pending</span></div>'
            : mediaSlots.map((slot) => {
                const variantClass = slot.blocksHandoff
                    ? 'is-block'
                    : (slot.state === 'ready' ? 'is-ok' : 'is-warn');
                const badgeLabel = slot.blocksHandoff
                    ? 'Blocks handoff'
                    : (slot.state === 'ready' ? 'Ready' : 'Warning');
                const action = getMediaSlotAction(slot);
                return `
                    <div class="readiness-item ${variantClass}">
                        <div class="readiness-item-main">
                            <strong>${slot.label}</strong>
                            <small>${slot.detail} ${slot.sellerRule}</small>
                            ${action ? `<button type="button" class="readiness-action" onclick="openReadinessSection('${action.sectionId}')">${action.label}</button>` : ''}
                        </div>
                        <span class="readiness-badge">${badgeLabel}</span>
                    </div>
                `;
            }).join('')}
    `;

    noteEl.style.display = 'block';
    noteEl.innerHTML = `
        <strong>Seller policy</strong>
        ${mediaBlockers.length > 0
            ? `${mediaBlockers.length} media blocker(s) must be fixed before delivery. ${mediaWarnings.length} other slot(s) are warnings only.`
            : mediaWarnings.length > 0
                ? `No media blockers remain. ${mediaWarnings.length} optional media warning(s) can still be improved before handoff.`
                : 'Core media requirements are ready for delivery.'}
    `;
}

function inferHandoffUrls() {
    const current = window.location;
    const adminUrl = current.origin + current.pathname.replace(/\/$/, '');
    let websiteUrl = current.origin;

    if (/^admin\./i.test(current.hostname)) {
        websiteUrl = `${current.protocol}//${current.hostname.replace(/^admin\./i, '')}`;
    } else if (/\/admin\/?$/i.test(current.pathname)) {
        websiteUrl = current.origin;
    }

    return { websiteUrl, adminUrl };
}

window.generateHandoffSummary = function () {
    const output = document.getElementById('handoffSummaryOutput');
    if (!output) return;

    const config = window.restaurantConfig || {};
    const branding = config.branding || {};
    const location = config.location || {};
    const galleryItems = Array.isArray(config.gallery) ? config.gallery.filter(Boolean) : [];
    const hours = Array.isArray(config._hours) ? config._hours.filter(Boolean) : [];
    const menuItems = Array.isArray(menu) ? menu : [];
    const checks = getLaunchReadinessChecks();
    const warnChecks = checks.filter((check) => !check.ok);
    const urls = inferHandoffUrls();
    const mediaSlots = typeof window.getMediaSlotAudit === 'function'
        ? window.getMediaSlotAudit(config, menuItems, promoIds)
        : [];
    const mediaBlockers = mediaSlots.filter((slot) => slot.blocksHandoff);
    const mediaWarnings = mediaSlots.filter((slot) => !slot.blocksHandoff && slot.state !== 'ready');
    const managedLibraryImageCount = menuItems.filter((item) => {
        const primaryImage = typeof window.getPrimaryMenuItemImage === 'function'
            ? window.getPrimaryMenuItemImage(item)
            : ((Array.isArray(item.images) ? item.images.filter(Boolean)[0] : '') || item.img || '');
        return typeof window.isManagedMenuLibraryImage === 'function' && window.isManagedMenuLibraryImage(primaryImage);
    }).length;

    output.value = [
        `Restaurant: ${branding.restaurantName || branding.shortName || 'Not set'}`,
        `Short brand: ${branding.shortName || 'Not set'}`,
        `Website URL: ${urls.websiteUrl}`,
        `Admin URL: ${urls.adminUrl}`,
        `Admin user: ${adminAuth.user || 'Not set'}`,
        `Phone: ${config.phone || 'Not set'}`,
        `Address: ${location.address || 'Not set'}`,
        `Menu items: ${menuItems.length}`,
        `Library image placeholders: ${managedLibraryImageCount}`,
        `Gallery images: ${galleryItems.length}`,
        `Hours rows: ${hours.length}`,
        `Launch readiness: ${checks.filter((check) => check.ok).length}/${checks.length} checks passed`,
        `Media blockers: ${mediaBlockers.length}`,
        `Media warnings: ${mediaWarnings.length}`,
        '',
        mediaSlots.length
            ? 'Media slots:'
            : 'Media slots: unavailable.',
        ...mediaSlots.map((slot) => `- ${slot.label}: ${slot.state}${slot.blocksHandoff ? ' [BLOCKS HANDOFF]' : ''}. ${slot.detail} ${slot.sellerRule}`),
        '',
        mediaBlockers.length
            ? 'Media blockers:'
            : 'Media blockers: none.',
        ...mediaBlockers.map((slot) => `- ${slot.label}: ${slot.sellerRule}`),
        '',
        warnChecks.length
            ? 'Open issues:'
            : 'Open issues: none. Ready for final review.',
        ...warnChecks.map((check) => `- ${check.label}: ${check.detail}`)
    ].join('\n');

    showToast('Handoff summary generated.');
};

window.copyHandoffSummary = async function () {
    const output = document.getElementById('handoffSummaryOutput');
    if (!output) return;
    if (!output.value.trim()) {
        window.generateHandoffSummary();
    }

    try {
        await navigator.clipboard.writeText(output.value);
        showToast('Handoff summary copied.');
    } catch (_error) {
        output.focus();
        output.select();
        showToast('Copy failed. Select the summary manually.');
    }
};

window.downloadHandoffSummary = function () {
    const output = document.getElementById('handoffSummaryOutput');
    if (!output) return;
    if (!output.value.trim()) {
        window.generateHandoffSummary();
    }

    const restaurantSlug = String(window.restaurantConfig?.branding?.shortName || 'restaurant')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'restaurant';
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${restaurantSlug}-handoff-summary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Handoff summary downloaded.');
};

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
        'Menu image suggestion run',
        `Items reviewed: ${menuItems.length}`,
        `Images assigned: ${assignedCount}`,
        `Items already covered: ${alreadyCoveredCount}`,
        `High confidence matches: ${confidenceCounts.high}`,
        `Medium confidence matches: ${confidenceCounts.medium}`,
        `Low confidence matches: ${confidenceCounts.low}`,
        `Generic fallback placeholders: ${confidenceCounts.fallback}`,
        ''
    ];

    if (suggestions.length > 0) {
        summaryLines.push('Assignments:');
        suggestions.forEach((entry) => {
            summaryLines.push(`- ${entry.itemName} [${entry.category}] -> ${entry.label} [${entry.confidence} / ${entry.matchType}] (${entry.reason})`);
        });
        if (confidenceCounts.fallback > 0) {
            summaryLines.push('');
            summaryLines.push('Review note: fallback assignments are generic placeholders and should be replaced first when better client media exists.');
        }
    } else {
        summaryLines.push('Assignments: none. Every menu item already had an image.');
    }

    if (output) {
        output.value = summaryLines.join('\n');
    }

    if (assignedCount === 0) {
        renderLaunchReadinessCard();
        showToast('No missing menu images were found.');
        return;
    }

    renderMenuTable();
    updateStats();
    renderLaunchReadinessCard();

    const saved = await saveAndRefresh();
    if (saved) {
        showToast(`Assigned ${assignedCount} menu image suggestion(s).`);
    }
};

window.copyMenuImageSuggestionSummary = async function () {
    const output = document.getElementById('menuImageSuggestionOutput');
    if (!output) return;

    if (!output.value.trim()) {
        showToast('Run the suggestion tool first.');
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        showToast('Image suggestion summary copied.');
    } catch (_error) {
        output.focus();
        output.select();
        showToast('Copy failed. Select the summary manually.');
    }
};

// ─── CATEGORY FILTERS LOGIC ──────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────

function renderMenuTable() {
    const tbody = document.querySelector('#menuTable tbody');
    if (!tbody) return;
    try {
        // Filter menu based on active category
        const filteredMenu = currentAdminCategory === 'All'
            ? menu
            : menu.filter(item => (item.cat || 'Uncategorized') === currentAdminCategory);

        if (filteredMenu.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#888;">Aucun produit dans la catégorie "${currentAdminCategory}".</td></tr>`;
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
            return `
            <tr>
                <td>
                    <div style="width:50px; height:50px; background:#eee; border-radius:8px; overflow:hidden; border:1px solid #ddd; cursor:pointer" onclick="openImageModal(${item.id})">
                        ${firstImg ? `<img src="${firstImg}" style="width:100%; height:100%; object-fit:cover" onerror="this.src='images/menu-item-placeholder.svg'">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">📷</div>'}
                    </div>
                    ${images.length > 0 ? `<small style="display:block;text-align:center;font-size:10px;color:var(--primary);cursor:pointer;margin-top:2px" onclick="openImageModal(${item.id})">${images.length} image(s)</small>` : ''}
                </td>
                <td><strong>${itemName}</strong><div class="item-copy-meta"><div class="translation-badges">${translationBadges}</div></div><small style="color:#888">${itemDesc}</small></td>
                <td>${itemCat}</td>
                <td>MAD ${safePrice.toFixed(2)}</td>
                <td><span style="color:#e01e2f">❤️</span> ${likeCount}</td>
                <td><span class="promo-star action-btn ${promoIds.includes(item.id) ? 'promo-active' : ''}" onclick="togglePromo(${item.id})">⭐</span></td>
                <td><span class="promo-star action-btn ${item.featured ? 'promo-active' : ''}" onclick="toggleFeatured(${item.id})" style="filter: ${item.featured ? 'none' : 'grayscale(1)'}; opacity: ${item.featured ? '1' : '0.5'};">✨</span></td>
                <td>
                    <button class="action-btn" onclick="editItem(${item.id})" title="Modifier les détails">✏️</button>
                    <button class="action-btn" onclick="openImageModal(${item.id})" title="Gérer les images">🖼️</button>
                    <button class="action-btn" onclick="deleteItem(${item.id})">🗑️</button>
                </td>
            </tr > `;
        }).join('');
    } catch (e) {
        console.error('Render Table Error:', e);
        tbody.innerHTML = `< tr > <td colspan="7" style="color:red; text-align:center;">Erreur de chargement des produits. Veuillez cliquer sur 'Reset All Data'.</td></tr > `;
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
    document.querySelector('#menu h3').textContent = "✏️ Modifier: " + getAdminItemDisplayName(item);
    document.querySelector('#foodForm .primary-btn').textContent = "💾 Mettre à jour le produit";

    // Scroll to form
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
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
    document.querySelector('#menu h3').textContent = "Add New Food Item";
    document.querySelector('#foodForm .primary-btn').textContent = "➕ Save Product";
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

        // Parse URL images — split by NEWLINE only
        let urlImages = urlInput.split(/\n/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('data:'));

        // Upload new files to server (stored on disk, returned as /uploads/... URL)
        let newUploadedUrls = [];
        if (fileInput && fileInput.files.length > 0) {
            showToast('⏳ Téléchargement des images en cours...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    newUploadedUrls.push(url);
                } catch (err) {
                    console.error('Image upload failed:', err);
                    showToast('⚠️ Échec du téléchargement de l\'image — réessayez.');
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
                // New uploads provided — use URL list + new server images
                finalImages = [...urlImages, ...newUploadedUrls];
            } else if (urlImages.length > 0) {
                // URL field was updated — use those (no new uploads)
                finalImages = [...urlImages];
            } else {
                // Nothing changed — keep all existing images
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

        if (!name) { showToast('⚠️ Le nom du produit est obligatoire !'); return; }

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
            showToast('✅ Produit mis à jour !');
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
            showToast('✅ Produit ajouté !');
        }

        saveAndRefresh();
        resetFoodForm();
    };

    document.getElementById('catForm').onsubmit = (e) => {
        e.preventDefault();
        catEmojis[document.getElementById('catName').value] = document.getElementById('catEmoji').value;
        saveAndRefresh();
        e.target.reset();
        showToast('Catégorie ajoutée !');
    };

    document.getElementById('wifiForm').onsubmit = (e) => {
        e.preventDefault();
        restaurantConfig.wifi.name = document.getElementById('wifiSSID').value;
        restaurantConfig.wifi.code = document.getElementById('wifiPassInput').value;
        saveAndRefresh();
        showToast('WiFi mis à jour !');
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
        showToast('Branding sauvegardé !');
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
        showToast('Landing page et contenu multilingue sauvegardés !');
    };

    document.getElementById('superCatForm').onsubmit = (e) => {
        e.preventDefault();
        const selectedCats = Array.from(document.querySelectorAll('.sc-cat-check:checked')).map(cb => cb.value);
        const name = document.getElementById('scName').value;
        const emoji = document.getElementById('scEmoji').value;
        const desc = document.getElementById('scDesc').value;
        const time = document.getElementById('scTime').value;

        const id = name.toLowerCase().replace(/\s+/g, '_');
        const existingIdx = restaurantConfig.superCategories.findIndex(sc => sc.id === id);

        const newSC = { id, name, emoji, desc, time, cats: selectedCats };

        if (existingIdx !== -1) {
            restaurantConfig.superCategories[existingIdx] = newSC;
        } else {
            restaurantConfig.superCategories.push(newSC);
        }

        saveAndRefresh();
        e.target.reset();
        showToast('Super Catégorie sauvegardée !');
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
                <strong>${escapeHtml(SECTION_ORDER_LABELS[key] || key)}</strong>
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
    return raw.startsWith('/') || isValidAbsoluteUrl(raw);
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
            <label style="display:flex; align-items:center; gap:5px; background:#f0f0f0; padding:5px 10px; border-radius:20px; font-size:0.8rem; cursor:pointer;">
                <input type="checkbox" value="${cat}" class="sc-cat-check" style="width:auto; margin:0;">
                    ${cat}
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
                <button class="action-btn" onclick="editSuperCat('${sc.id}')">✏️</button>
                <button class="action-btn" onclick="deleteSuperCat('${sc.id}')">🗑️</button>
            </td>
        </tr>
            `).join('');
}

function editSuperCat(id) {
    const sc = restaurantConfig.superCategories.find(s => s.id === id);
    if (!sc) return;
    document.getElementById('scName').value = sc.name;
    document.getElementById('scEmoji').value = sc.emoji;
    document.getElementById('scDesc').value = sc.desc;
    document.getElementById('scTime').value = sc.time || '';

    const checks = document.querySelectorAll('.sc-cat-check');
    checks.forEach(cb => cb.checked = sc.cats.includes(cb.value));

    document.getElementById('supercategories').scrollIntoView({ behavior: 'smooth' });
}

function deleteSuperCat(id) {
    if (confirm('Supprimer cette super catégorie ?')) {
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
            alert('⚠️ Session expirée. Veuillez vous reconnecter.');
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

window.exportRestaurantBackup = async function () {
    try {
        showToast('Preparing backup export...');
        const response = await fetch('/api/data/export', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('⚠️ Session expired. Please sign in again.');
                location.reload();
                return;
            }
            throw new Error('Export failed: ' + response.statusText);
        }

        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition') || '';
        const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
        const filename = match ? match[1] : 'restaurant-backup.json';
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
        showToast('Backup exported successfully.');
    } catch (error) {
        console.error('Export backup error:', error);
        showToast('Backup export failed.');
    }
};

window.importRestaurantBackup = async function () {
    const input = document.getElementById('dataImportFile');
    const file = input && input.files ? input.files[0] : null;

    if (!file) {
        showToast('Choose a JSON backup file first.');
        return;
    }

    if (!confirm('Importing a backup will replace the current restaurant data. Continue?')) {
        return;
    }

    try {
        showToast('Importing backup...');
        const raw = await file.text();
        const parsed = JSON.parse(raw);
        const response = await fetch('/api/data/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ data: parsed })
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
            if (response.status === 401) {
                alert('⚠️ Session expired. Please sign in again.');
                location.reload();
                return;
            }
            throw new Error(data.error || 'Import failed');
        }

        input.value = '';
        await loadDataFromServer();
        refreshUI();
        showToast('Backup imported successfully.');
    } catch (error) {
        console.error('Import backup error:', error);
        showToast('Backup import failed. Use a valid JSON export file.');
    }
};

window.applyOnboardingPreset = async function () {
    const presetId = document.getElementById('quickStartPreset')?.value || 'fast_food';
    const preset = ONBOARDING_PRESETS[presetId];
    if (!preset) {
        showToast('Choose a valid onboarding preset.');
        return;
    }

    const restaurantName = (document.getElementById('quickStartRestaurantName')?.value || '').trim();
    const shortNameInput = (document.getElementById('quickStartShortName')?.value || '').trim();
    const address = (document.getElementById('quickStartAddress')?.value || '').trim();
    const phone = (document.getElementById('quickStartPhone')?.value || '').trim();
    const whatsapp = (document.getElementById('quickStartWhatsApp')?.value || '').trim();

    if (!restaurantName) {
        showToast('Restaurant name is required for quick launch setup.');
        return;
    }

    const shortName = shortNameInput || restaurantName;
    const vars = { restaurantName, shortName };
    const presetTranslations = buildPresetTranslations(preset, vars);
    const wifiSeed = slugifyForWifi(shortName) || 'restaurant';
    const currentContent = restaurantConfig.contentTranslations || { fr: {}, en: {}, ar: {} };
    const nextContentTranslations = {
        fr: { ...(currentContent.fr || {}), ...(presetTranslations.fr || {}) },
        en: { ...(currentContent.en || {}), ...(presetTranslations.en || {}) },
        ar: { ...(currentContent.ar || {}), ...(presetTranslations.ar || {}) }
    };

    if (!confirm('Apply this quick launch preset? It will update branding, homepage copy, and onboarding defaults for this restaurant.')) {
        return;
    }

    if (typeof window.mergeRestaurantConfig === 'function') {
        window.mergeRestaurantConfig({
            branding: {
                ...(restaurantConfig.branding || {}),
                ...(getPresetThemePack(presetId) || {}),
                ...(preset.branding || {}),
                restaurantName,
                shortName,
                tagline: replacePresetVars(preset.branding?.tagline || '', vars) || preset.branding?.tagline || shortName
            },
            wifi: {
                ...(restaurantConfig.wifi || {}),
                name: `${wifiSeed}-wifi`,
                code: restaurantConfig.wifi?.code || window.defaultConfig?.wifi?.code || 'Ask the team'
            },
            guestExperience: preset.guestExperience || restaurantConfig.guestExperience,
            sectionVisibility: preset.sectionVisibility || restaurantConfig.sectionVisibility,
            sectionOrder: preset.sectionOrder || restaurantConfig.sectionOrder,
            contentTranslations: nextContentTranslations,
            location: {
                ...(restaurantConfig.location || {}),
                address: address || restaurantConfig.location?.address || ''
            },
            socials: {
                ...(restaurantConfig.socials || {}),
                whatsapp: whatsapp || restaurantConfig.socials?.whatsapp || ''
            },
            phone: phone || restaurantConfig.phone || ''
        });
        restaurantConfig = window.restaurantConfig;
    }

    landingSectionOrderDraft = normalizeSectionOrderDraft(
        preset.sectionOrder || restaurantConfig.sectionOrder || ADMIN_SECTION_ORDER_KEYS
    );

    try {
        await saveAndRefresh();
        refreshUI();
        const dataToolsButton = Array.from(document.querySelectorAll('.nav-btn')).find((button) => button.textContent.includes('Seller Tools'));
        if (dataToolsButton) {
            showSection('data-tools', dataToolsButton);
        }
        showToast('Quick launch preset applied.');
    } catch (error) {
        console.error('Quick launch preset error:', error);
        showToast('Quick launch preset failed.');
    }
};

// Image handling helper
const toImageUrl = (img) => img;

function deleteItem(id) { if (confirm('Supprimer cet article ?')) { menu = menu.filter(m => m.id != id); promoIds = promoIds.filter(pid => pid != id); saveAndRefresh(); } }
function togglePromo(id) {
    if (promoIds.includes(id)) {
        promoIds = promoIds.filter(pid => pid != id);
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
// Legacy save handlers kept only as a fallback reference while the newer save flow remains below.
async function forceSaveChangesLegacy() {
    try {
        // If user is currently editing a food item, commit those changes first
        if (editingItemId && typeof window.commitFormItem === 'function') {
            await window.commitFormItem();
        } else {
            await saveAndRefresh();
            showToast('✅ Toutes les modifications ont été enregistrées !');
        }

        // Visual feedback on float button
        const btn = document.getElementById('floatSaveBtn');
        if (btn) {
            btn.classList.add('saved');
            btn.innerHTML = '<span style="font-size:1.3rem;">✅</span><span>Sauvegardé !</span>';
            setTimeout(() => {
                btn.classList.remove('saved');
                btn.innerHTML = '<span style="font-size:1.3rem;">💾</span><span>Sauvegarder</span>';
            }, 2500);
        }
    } catch (e) {
        console.error('Save Error:', e);
        alert('❌ Erreur de sauvegarde: ' + e.message);
    }
}
async function saveAndRefreshLegacy() {
    setAdminSaveState('saving', 'Saving changes to the server...');
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
                alert('⚠️ Session expirée. Veuillez vous reconnecter.');
                location.reload();
                return;
            }
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server save failed');
        }
        refreshUI();
    } catch (e) {
        console.error('Save Error:', e);
        showToast('❌ Erreur de sauvegarde: ' + e.message);
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
            renderLaunchReadinessCard();
            return;
        }

        adminSecurityStatus = data;
        const notes = [];

        if (data.usesDefaultCredentials) {
            notes.push('Default admin credentials are still active. Change them before client handoff.');
        }
        if (data.isLegacyPlainText) {
            notes.push('Credentials are still stored in the legacy plain-text format. Saving a new password will migrate them to secure hashed storage.');
        }
        if (data.credentialSource === 'env') {
            notes.push('This instance currently relies on environment credentials. Saving here will create a local hashed auth file for this restaurant.');
        }
        if (data.credentialSource === 'default') {
            notes.push('This instance is still using the built-in fallback credentials. Replace them before production delivery.');
        }

        notes.push('Username rule: minimum 3 characters.');
        notes.push(`Password rule: minimum ${data.minPasswordLength || 8} characters.`);
        notes.push('When credentials change, older admin sessions are closed automatically.');

        const hasRisk = Boolean(
            data.usesDefaultCredentials ||
            data.isLegacyPlainText ||
            data.credentialSource === 'default'
        );
        statusCard.classList.toggle('is-risk', hasRisk);
        statusCard.innerHTML = `
            <div class="security-status-title">Security Status</div>
            <ul class="security-status-list">
                ${notes.map(note => `<li>${note}</li>`).join('')}
            </ul>
        `;
        statusCard.style.display = '';
        renderLaunchReadinessCard();
    } catch (error) {
        console.error('Security status error:', error);
        adminSecurityStatus = null;
        statusCard.style.display = 'none';
        renderLaunchReadinessCard();
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
                    errorEl.textContent = `Too many attempts. Try again in ${retryMinutes} min.`;
                } else {
                    errorEl.textContent = 'Incorrect credentials';
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
            errorEl.textContent = 'Server connection error';
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
            showToast('Passwords do not match.');
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
                showToast(data.message || 'Credentials updated successfully.');
                document.getElementById('adminNewPass').value = '';
                document.getElementById('adminConfirmPass').value = '';
                loadSecurityStatus();
            } else {
                showToast(data.error || 'Unable to update credentials.');
            }
        } catch (err) {
            console.error('Credentials update error:', err);
            showToast('Server connection error.');
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
                setAdminSaveState('error', 'Session expired. Please sign in again.');
                showToast('Session expired. Please sign in again.');
                location.reload();
                return false;
            }

            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server save failed');
        }

        refreshUI();
        setAdminSaveState('success', 'All current changes are saved on the server.');
        return true;
    } catch (e) {
        console.error('Save Error:', e);
        setAdminSaveState('error', e.message || 'Save failed.');
        showToast('Save failed: ' + e.message);
        return false;
    }
}

function showToast(msg) { const t = document.getElementById('adminToast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
function clearImageCache() {
    const count = menu.filter(item => (item.images || []).some(img => img.startsWith('data:')) || (item.img || '').startsWith('data:')).length;
    if (count === 0) { showToast('✅ Aucune image en cache à supprimer.'); return; }
    if (!confirm(`Supprimer les images en cache de ${count} produit(s) ? Les images URL seront conservées.`)) return;
    menu = menu.map(item => {
        const imgs = Array.isArray(item.images) ? item.images : (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        return { ...item, images: urlOnly, img: urlOnly[0] || '' };
    });
    saveAndRefresh();
    showToast(`✅ Cache image vidé pour ${count} produit(s).Stockage libéré!`);
}
function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');

    // Auto-close sidebar on mobile after choosing
    if (window.innerWidth <= 992) {
        toggleSidebar();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
}
function populateCatDropdown() {
    const el = document.getElementById('itemCat');
    if (el) el.innerHTML = Object.keys(catEmojis).map(c => `<option value="${c}">${c}</option>`).join('');
}
function renderCatTable() {
    const el = document.querySelector('#catTable tbody');
    if (el) el.innerHTML = Object.keys(catEmojis).map(cat => `<tr><td>${catEmojis[cat]}</td><td><strong>${cat}</strong></td><td>${menu.filter(m => m.cat === cat).length} items</td><td><button class="action-btn" onclick="deleteCat('${cat}')">🗑️</button></td></tr>`).join('');
}
function deleteCat(cat) { if (menu.some(m => m.cat === cat)) return alert('Supprimez d\'abord les produits de cette catégorie !'); delete catEmojis[cat]; saveAndRefresh(); }
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
    renderModalImages();
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    currentEditingId = null;
}

function renderModalImages() {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;
    const grid = document.getElementById('currentImagesGrid');
    const images = item.images || (item.img ? [item.img] : []);

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden; border:1px solid #ddd;">
                <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteModalImage(${index})" style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px; font-size:12px;">✕</button>
                </div>
        `).join('') + (images.length === 0 ? '<p style="grid-column: span 3; color:#888; text-align:center;">Aucune image pour le moment.</p>' : '');
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
            showToast('⚠️ Échec de l\'upload');
        }
    }

    // SYNC: Ensure main img is set to the first image for the main page cards
    if (item.images.length > 0) item.img = item.images[0];

    input.value = '';
    saveAndRefresh();
    renderModalImages();
    showToast('Image(s) ajoutée(s)!');
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
    showToast('Image ajoutée via URL!');
}

function deleteModalImage(index) {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item || !item.images) return;

    item.images.splice(index, 1);

    // SYNC: Keep main img updated after deletion
    item.img = item.images.length > 0 ? item.images[0] : '';

    saveAndRefresh();
    renderModalImages();
    showToast('Image supprimée');
}

async function resetDefaults() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser TOUTES les données du menu et de la configuration aux valeurs par défaut ? Cette action est irréversible.')) {
        try {
            const res = await fetch('/api/data/reset', { method: 'POST', credentials: 'include' });
            if (res.ok) {
                await loadDataFromServer();
                refreshUI();
                showToast('✅ Données réinitialisées !');
            }
        } catch (e) {
            console.error('Reset error:', e);
        }
    }
}

// ═══════════════════════ HOURS MANAGEMENT ═══════════════════════
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
            showToast('✅ Horaires mis à jour !');
        };
    }
}

// ═══════════════════════ GALLERY MANAGEMENT ═══════════════════════

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
            showToast('⏳ Téléchargement gallery...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    restaurantConfig.gallery.push(url);
                } catch (err) {
                    console.error('Gallery upload failed:', err);
                    showToast('⚠️ Échec gallery');
                }
            }
            fileInput.value = '';
        }

        saveAndRefresh();
        renderGalleryAdmin();
        showToast('🖼️ Images ajoutées à la galerie !');
    };
}

function renderGalleryAdmin() {
    const grid = document.getElementById('galleryAdminGrid');
    if (!grid) return;

    const images = restaurantConfig.gallery || [];

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1.5; border-radius:12px; overflow:hidden; border:1px solid #ddd; background:#eee;">
                <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteGalleryImage(${index})" style="position:absolute; top:8px; right:8px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:6px; cursor:pointer; padding:4px 8px; font-size:14px; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.2);">✕</button>
                </div>
        `).join('') + (images.length === 0 ? '<p style="grid-column: 1/-1; color:#888; text-align:center; padding:40px; border:2px dashed #eee; border-radius:15px;">La galerie est vide.</p>' : '');
}

function deleteGalleryImage(index) {
    if (confirm('Supprimer cette image de la galerie ?')) {
        restaurantConfig.gallery.splice(index, 1);
        saveAndRefresh();
        renderGalleryAdmin();
        showToast('Image supprimée');
    }
}
