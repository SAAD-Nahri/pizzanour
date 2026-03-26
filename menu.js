/**
 * Menu JS - 3-Tier Navigation
 * Landing â†’ Super Category â†’ Sub Category â†’ Items
 */

let menu = window.defaultMenu || [];
let catEmojis = window.defaultCatEmojis || {};
window.catEmojis = catEmojis;
let categoryImages = window.defaultCategoryImages || {};
window.categoryImages = categoryImages;
let cart = typeof window.getStoredCart === 'function'
    ? window.getStoredCart()
    : [];
let gameScriptPromise = null;
const gameLoaderPlaceholders = {};

function getVersionedPublicAsset(pathname) {
    const version = typeof window.__PUBLIC_BUILD_VERSION === 'string' ? window.__PUBLIC_BUILD_VERSION.trim() : '';
    if (!version) return pathname;
    return `${pathname}?v=${encodeURIComponent(version)}`;
}

function ensureGameScriptLoaded() {
    if (window.__foodyGameLoaded) return Promise.resolve();
    if (gameScriptPromise) return gameScriptPromise;

    gameScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = getVersionedPublicAsset('game.js');
        script.async = true;
        script.onload = () => {
            window.__foodyGameLoaded = true;
            resolve();
        };
        script.onerror = () => {
            gameScriptPromise = null;
            reject(new Error('game_script_load_failed'));
        };
        document.body.appendChild(script);
    });

    return gameScriptPromise;
}

function installGameLoader(actionName) {
    const placeholder = function (...args) {
        return ensureGameScriptLoaded()
            .then(() => {
                const action = window[actionName];
                if (typeof action === 'function' && action !== placeholder) {
                    return action(...args);
                }
                return undefined;
            })
            .catch(() => {
                window.showToast?.(t('lightbox_soon', 'Photo preview coming soon'));
                return undefined;
            });
    };

    gameLoaderPlaceholders[actionName] = placeholder;
    window[actionName] = placeholder;
}

['openGameModal', 'closeGameModal', 'startGame', 'updatePlayerSlider', 'handleBoxClick'].forEach(installGameLoader);
let serviceType = 'onsite';
const MENU_UI_ICONS = Object.freeze({
    home: String.fromCodePoint(0x1F3E0),
    facebook: String.fromCodePoint(0x1F4D8),
    instagram: String.fromCodePoint(0x1F4F8),
    tiktok: String.fromCodePoint(0x1F3B5),
    whatsapp: String.fromCodePoint(0x1F4DE),
    wifi: String.fromCodePoint(0x1F4F6),
    fire: String.fromCodePoint(0x1F525),
    sparkle: String.fromCodePoint(0x2728),
    arrow: String.fromCodePoint(0x203A),
    plate: String.fromCodePoint(0x1F37D, 0xFE0F),
    heart: String.fromCodePoint(0x2764, 0xFE0F),
    takeaway: String.fromCodePoint(0x1F6CD, 0xFE0F),
    delivery: String.fromCodePoint(0x1F69A),
    address: String.fromCodePoint(0x1F4CD),
    trash: String.fromCodePoint(0x1F5D1, 0xFE0F)
});

// Global comparison to detect changes
let lastDataVersion = "";
let syncInFlight = null;
const PUBLIC_DATA_TIMEOUT_MS = 8000;
const PUBLIC_RESUME_SYNC_MIN_GAP_MS = 60000;
const MENU_SNAPSHOT_STORAGE_KEY = 'foody_public_menu_snapshot_v1';
let lastPublicSyncStartedAt = 0;

function readStoredMenuSnapshot() {
    try {
        if (!window.localStorage) return null;
        const raw = window.localStorage.getItem(MENU_SNAPSHOT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_error) {
        return null;
    }
}

function persistCurrentMenuSnapshot(version = '') {
    try {
        if (!window.localStorage) return;
        window.localStorage.setItem(MENU_SNAPSHOT_STORAGE_KEY, JSON.stringify({
            version,
            menu,
            catEmojis,
            categoryImages,
            restaurantData: {
                superCategories: Array.isArray(window.restaurantConfig?.superCategories) ? window.restaurantConfig.superCategories : [],
                categoryImages,
                categoryTranslations: window.restaurantConfig?.categoryTranslations || {},
                wifi: {
                    ssid: window.restaurantConfig?.wifi?.ssid || window.restaurantConfig?.wifi?.name || '',
                    pass: window.restaurantConfig?.wifi?.pass || window.restaurantConfig?.wifi?.code || ''
                },
                social: window.restaurantConfig?.socials || {},
                guestExperience: window.restaurantConfig?.guestExperience || {},
                sectionVisibility: window.restaurantConfig?.sectionVisibility || {},
                sectionOrder: Array.isArray(window.restaurantConfig?.sectionOrder) ? window.restaurantConfig.sectionOrder : [],
                landing: {
                    location: window.restaurantConfig?.location || {},
                    phone: window.restaurantConfig?.phone || ''
                },
                gallery: Array.isArray(window.restaurantConfig?.gallery) ? window.restaurantConfig.gallery : [],
                hours: Array.isArray(window.restaurantConfig?._hours) ? window.restaurantConfig._hours : [],
                hoursNote: typeof window.restaurantConfig?._hoursNote === 'string' ? window.restaurantConfig._hoursNote : '',
                branding: window.restaurantConfig?.branding || {},
                contentTranslations: window.restaurantConfig?.contentTranslations || {}
            }
        }));
    } catch (_error) {
        // Ignore storage quota or privacy-mode failures.
    }
}

function applyMenuDataSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;

    const source = snapshot.restaurantData || {};
    let applied = false;

    if (Array.isArray(snapshot.menu)) {
        menu = snapshot.menu;
        applied = true;
    }
    if (snapshot.catEmojis && typeof snapshot.catEmojis === 'object') {
        catEmojis = snapshot.catEmojis;
        window.catEmojis = catEmojis;
        applied = true;
    }
    const snapshotCategoryImages = snapshot.categoryImages && typeof snapshot.categoryImages === 'object'
        ? snapshot.categoryImages
        : (source.categoryImages && typeof source.categoryImages === 'object' ? source.categoryImages : null);
    if (snapshotCategoryImages) {
        categoryImages = snapshotCategoryImages;
        window.categoryImages = categoryImages;
        applied = true;
    }
    if (typeof window.mergeRestaurantConfig === 'function') {
        const snapshotWifi = source.wifi && typeof source.wifi === 'object'
            ? {
                name: source.wifi.name || source.wifi.ssid || '',
                code: source.wifi.code || source.wifi.pass || ''
            }
            : window.restaurantConfig.wifi;
        const snapshotLanding = source.landing && typeof source.landing === 'object' ? source.landing : {};
        window.mergeRestaurantConfig({
            superCategories: Array.isArray(source.superCategories) ? source.superCategories : window.restaurantConfig.superCategories,
            categoryTranslations: source.categoryTranslations || window.restaurantConfig.categoryTranslations,
            wifi: snapshotWifi,
            socials: source.social || source.socials || window.restaurantConfig.socials,
            guestExperience: source.guestExperience || window.restaurantConfig.guestExperience,
            sectionVisibility: source.sectionVisibility || window.restaurantConfig.sectionVisibility,
            sectionOrder: source.sectionOrder || window.restaurantConfig.sectionOrder,
            location: snapshotLanding.location || source.location || window.restaurantConfig.location,
            phone: typeof snapshotLanding.phone === 'string' ? snapshotLanding.phone : (typeof source.phone === 'string' ? source.phone : window.restaurantConfig.phone),
            gallery: Array.isArray(source.gallery) ? source.gallery : window.restaurantConfig.gallery,
            _hours: Array.isArray(source.hours) ? source.hours : window.restaurantConfig._hours,
            _hoursNote: typeof source.hoursNote === 'string' ? source.hoursNote : window.restaurantConfig._hoursNote,
            branding: source.branding || window.restaurantConfig.branding,
            contentTranslations: source.contentTranslations || window.restaurantConfig.contentTranslations
        });
        applied = true;
    }

    if (typeof snapshot.version === 'string' && snapshot.version) {
        lastDataVersion = snapshot.version;
    }

    return applied;
}

async function fetchPublicDataWithTimeout() {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
        ? setTimeout(() => controller.abort(), PUBLIC_DATA_TIMEOUT_MS)
        : null;

    try {
        return await fetch('/api/menu-data', {
            headers: lastDataVersion ? { 'If-None-Match': lastDataVersion } : undefined,
            signal: controller ? controller.signal : undefined
        });
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

// â•â•â• SYNC DATA FROM SERVER â•â•â•
async function syncDataFromServer() {
    if (syncInFlight) return syncInFlight;
    lastPublicSyncStartedAt = Date.now();

    syncInFlight = (async () => {
    try {
        const res = await fetchPublicDataWithTimeout();
        if (res.status === 304) return;
        if (!res.ok) return;
        const nextVersion = res.headers.get('etag') || res.headers.get('x-data-version') || '';
        const data = await res.json();
        const nextDataVersion = nextVersion || JSON.stringify(data);

        if (nextDataVersion === lastDataVersion) return;

        // Update local variables
        menu = Array.isArray(data.menu) ? data.menu : menu;
        catEmojis = data.catEmojis || catEmojis;
        window.catEmojis = catEmojis;
        categoryImages = data.categoryImages || categoryImages;
        window.categoryImages = categoryImages;

        // Update global config object
        if (typeof window.mergeRestaurantConfig === 'function') {
            window.mergeRestaurantConfig({
                superCategories: Array.isArray(data.superCategories) ? data.superCategories : window.restaurantConfig.superCategories,
                categoryTranslations: data.categoryTranslations || window.restaurantConfig.categoryTranslations,
                wifi: data.wifi ? { name: data.wifi.ssid, code: data.wifi.pass } : window.restaurantConfig.wifi,
                socials: data.social || window.restaurantConfig.socials,
                location: data.landing?.location || window.restaurantConfig.location,
                phone: data.landing?.phone || window.restaurantConfig.phone,
                gallery: Array.isArray(data.gallery) ? data.gallery : window.restaurantConfig.gallery,
                _hours: Array.isArray(data.hours) ? data.hours : window.restaurantConfig._hours,
                _hoursNote: typeof data.hoursNote === 'string' ? data.hoursNote : window.restaurantConfig._hoursNote,
                branding: data.branding || window.restaurantConfig.branding,
                contentTranslations: data.contentTranslations || window.restaurantConfig.contentTranslations
            });
        }
        persistCurrentMenuSnapshot(nextDataVersion);

        console.log('[SYNC] Data updated from server');
        if (typeof window.applyBranding === 'function') {
            try {
                window.applyBranding();
            } catch (error) {
                console.error('[SYNC] applyBranding failed:', error);
                throw error;
            }
        }

        // Refresh UI
        const currentState = navigationStack[navigationStack.length - 1] || '';
        if (menuMarkupReady && typeof renderMenu === 'function' && !currentState.startsWith('items:')) renderMenu();
        if (typeof renderLandingInfo === 'function') renderLandingInfo();
        if (superCatSheetReady && typeof renderSuperCatSheet === 'function') renderSuperCatSheet();
        // If we are in the items view, refresh the list
        if (navigationStack.length > 0) {
            const last = navigationStack[navigationStack.length - 1];
            if (last.startsWith('items:')) {
                const cat = last.split(':')[1];
                showCategoryItems(cat); // This navigates, but we want to refresh CURRENT view.
                navigationStack.pop(); // Remove the extra stack entry added by showCategoryItems
            } else if (last.startsWith('subcats:')) {
                const scId = last.split(':')[1];
                const sc = getSuperCategories().find(s => s.id === scId);
                if (sc) {
                    showSubCategoryGrid(sc, false);
                }
            }
        }

        // Check if dish page is open for the updated menu
        const dishPage = document.getElementById('dishPage');
        if (dishPage && dishPage.classList.contains('open')) {
            // Re-open (refresh) the current dish page to show new price/sizes
            const currentItemId = String(dishPage.dataset.itemId || '');
            if (currentItemId) {
                const updatedItem = menu.find((item) => sameMenuItemId(item.id, currentItemId));
                if (updatedItem) {
                    openDishPage(updatedItem.id);
                }
            }
        }

        lastDataVersion = nextDataVersion;
        menuCategoryMarkupCache = new Map();
    } catch (e) {
        console.warn('[SYNC] Failed to fetch data:', e);
    } finally {
        syncInFlight = null;
    }
    })();

    return syncInFlight;
}

function shouldSyncOnResume() {
    return (Date.now() - lastPublicSyncStartedAt) >= PUBLIC_RESUME_SYNC_MIN_GAP_MS;
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && shouldSyncOnResume()) {
        syncDataFromServer();
    }
});
window.addEventListener('focus', () => {
    if (shouldSyncOnResume()) {
        syncDataFromServer();
    }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• RESTAURANT CONFIG â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const config = window.restaurantConfig;

function getSuperCategories() {
    if (typeof window.getEffectiveSuperCategories === 'function') {
        return window.getEffectiveSuperCategories(menu, window.restaurantConfig);
    }
    return Array.isArray(window.restaurantConfig?.superCategories) ? window.restaurantConfig.superCategories : [];
}

function t(key, fallback, vars) {
    if (typeof window.formatTranslation === 'function') {
        return window.formatTranslation(key, fallback, vars);
    }
    if (typeof window.getTranslation === 'function') {
        return window.getTranslation(key, fallback);
    }
    return fallback;
}

function sameMenuItemId(left, right) {
    return String(left ?? '') === String(right ?? '');
}

function serializeInlineId(value) {
    const raw = String(value ?? '');
    const escaped = raw
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
    return `'${escaped}'`;
}

function escapeHtmlAttr(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getMenuCardImageSrc(src, variant = 'menu') {
    const raw = String(src ?? '').trim();
    if (!raw.startsWith('/uploads/')) return raw;
    if (!/\.(jpe?g|png|webp|avif)$/i.test(raw)) return raw;
    const filename = raw.split('/').pop();
    if (!filename) return raw;
    const safeVariant = variant === 'list' ? 'list' : 'menu';
    return `/uploads/.thumbs/${filename}.${safeVariant}.webp`;
}

function getCategoryPreviewSource(cat) {
    const explicitCategoryImage = typeof categoryImages?.[cat] === 'string'
        ? categoryImages[cat].trim()
        : '';
    if (explicitCategoryImage) {
        return {
            src: getMenuCardImageSrc(explicitCategoryImage, 'menu'),
            originalSrc: explicitCategoryImage
        };
    }

    const representativeItem =
        menu.find((item) => item.cat === cat && item.available !== false && ((item.images && item.images[0]) || item.img))
        || menu.find((item) => item.cat === cat && ((item.images && item.images[0]) || item.img))
        || null;

    const itemSrc = representativeItem
        ? ((representativeItem.images && representativeItem.images[0]) || representativeItem.img || '')
        : '';

    if (itemSrc) {
        return {
            src: getMenuCardImageSrc(itemSrc, 'menu'),
            originalSrc: itemSrc
        };
    }

    const brandingHero = String(window.restaurantConfig?.branding?.heroImage || '').trim();
    const runtimeHero = document.getElementById('menuHeroImage')?.getAttribute('src') || '';
    const fallbackSrc = brandingHero || runtimeHero || 'images/hero-default.svg';

    return {
        src: fallbackSrc,
        originalSrc: ''
    };
}

function buildCategoryNavigationCardMarkup(cat) {
    const localizedName = window.getLocalizedCategoryName(cat, cat);
    const preview = getCategoryPreviewSource(cat);
    const fallbackGlyph = (localizedName || cat || MENU_UI_ICONS.plate).trim().charAt(0).toUpperCase() || '•';
    const originalSrcAttr = preview.originalSrc && preview.originalSrc !== preview.src
        ? ` data-original-src="${escapeHtmlAttr(preview.originalSrc)}"`
        : '';

    return `
        <button class="menu-category-card menu-reveal-observe" data-cat="${escapeHtmlAttr(cat)}" onclick="showCategoryItems(${serializeInlineId(cat)})">
            <span class="menu-category-card-media">
                <img class="menu-deferred-img" data-menu-src="${escapeHtmlAttr(preview.src)}"${originalSrcAttr} data-fallback-emoji="${escapeHtmlAttr(fallbackGlyph)}" alt="${escapeHtmlAttr(localizedName)}" width="960" height="540" loading="lazy" decoding="async" fetchpriority="low">
            </span>
            <span class="menu-category-card-shade"></span>
            <span class="menu-category-card-title">${localizedName}</span>
        </button>
    `;
}

function getSuperCategoryForCategory(cat) {
    if (currentSuperCat && Array.isArray(currentSuperCat.cats) && currentSuperCat.cats.includes(cat)) {
        return currentSuperCat;
    }
    const matched = getSuperCategories().find((entry) => Array.isArray(entry.cats) && entry.cats.includes(cat));
    if (matched) currentSuperCat = matched;
    return matched || null;
}

function buildCategorySubnavButtonMarkup(cat, isActive = false) {
    const localizedName = window.getLocalizedCategoryName(cat, cat);

    return `
        <button class="menu-subnav-tab ${isActive ? 'active' : ''} menu-reveal-observe" data-cat="${escapeHtmlAttr(cat)}" onclick="showCategoryItems(${serializeInlineId(cat)})" ${isActive ? 'aria-current="page"' : ''}>
            <span class="menu-subnav-name">${localizedName}</span>
        </button>
    `;
}

function renderSuperCategoryChildNav(sc, activeCat = '') {
    const navWrapper = document.getElementById('catNavWrapper');
    const subCatTitle = document.getElementById('subCatTitle');
    const catNav = document.getElementById('catNavScroll');
    if (!navWrapper || !subCatTitle || !catNav || !sc) return;

    const currentCategories = [...new Set(menu.map((m) => m.cat))];
    const filteredCats = (Array.isArray(sc.cats) ? sc.cats : []).filter((c) => currentCategories.includes(c));

    navWrapper.style.display = filteredCats.length ? 'block' : 'none';
    subCatTitle.textContent = window.getLocalizedSuperCategoryName(sc, sc.name);
    catNav.classList.remove('is-visual-list');
    catNav.innerHTML = `
        <div class="menu-subnav-track" role="tablist" aria-label="${escapeHtmlAttr(window.getLocalizedSuperCategoryName(sc, sc.name))}">
            ${filteredCats.map((c) => buildCategorySubnavButtonMarkup(c, c === activeCat)).join('')}
        </div>
    `;
    scheduleMenuFixedLayout();
}


let navigationStack = []; // stack: 'landing', 'supercats', 'subcats:NAME', 'items:CAT'
let currentSuperCat = null;
let menuMotionObserver = null;
let menuMotionRefreshFrame = null;
let categoryChunkObserver = null;
let menuMarkupReady = false;
let superCatSheetReady = false;
let menuImageObserver = null;
let activeCategoryRenderState = null;
let activeCategoryRenderToken = 0;
let featuredRenderToken = 0;
let menuCategoryMarkupCache = new Map();
let menuInteractionsScriptPromise = null;

function updateMenuFixedLayout() {
    const navView = document.getElementById('menuNavigationView');
    if (!navView) return;

    const topNav = navView.querySelector('.menu-nav-bar');
    if (!topNav) return;

    const mode = navView.getAttribute('data-mode');
    const navBottom = Math.max(0, Math.round(topNav.getBoundingClientRect().bottom));
    navView.style.setProperty('--menu-subnav-top', `${navBottom}px`);

    if (mode === 'items') {
        const catNavWrapper = document.getElementById('catNavWrapper');
        const catHeight = catNavWrapper && catNavWrapper.style.display !== 'none'
            ? Math.max(40, Math.round(catNavWrapper.getBoundingClientRect().height || catNavWrapper.offsetHeight || 0))
            : 0;
        navView.style.setProperty('--menu-subnav-height', `${catHeight}px`);
        navView.style.setProperty('--menu-fixed-stack-height', `${navBottom + catHeight}px`);
    } else {
        navView.style.setProperty('--menu-subnav-height', '0px');
        navView.style.setProperty('--menu-fixed-stack-height', `${navBottom}px`);
    }
}

function scheduleMenuFixedLayout() {
    window.requestAnimationFrame(updateMenuFixedLayout);
}

function ensureMenuInteractionsScriptLoaded() {
    if (window.__foodyMenuInteractionsLoaded) return Promise.resolve();
    if (menuInteractionsScriptPromise) return menuInteractionsScriptPromise;

    menuInteractionsScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = getVersionedPublicAsset('menu-interactions.js');
        script.async = true;
        script.onload = () => {
            window.__foodyMenuInteractionsLoaded = true;
            resolve();
        };
        script.onerror = () => {
            menuInteractionsScriptPromise = null;
            reject(new Error('menu_interactions_load_failed'));
        };
        document.body.appendChild(script);
    });

    return menuInteractionsScriptPromise;
}

window.__foodyGetMenuRuntime = function __foodyGetMenuRuntime() {
    return {
        t,
        sameMenuItemId,
        serializeInlineId,
        MENU_UI_ICONS,
        getMenu: () => menu,
        getCart: () => cart,
        setCart: (nextCart) => {
            cart = Array.isArray(nextCart) ? nextCart : [];
        },
        getServiceType: () => serviceType,
        setServiceType: (nextType) => {
            serviceType = typeof nextType === 'string' && nextType ? nextType : 'onsite';
        },
        saveCart,
        updateCartUI,
        updateHistoryBadge,
        showLanding
    };
};

function isCompactMenuViewport() {
    return Boolean(
        window.matchMedia &&
        (
            window.matchMedia('(max-width: 768px)').matches ||
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(hover: none)').matches
        )
    );
}

function getMenuRenderChunkConfig() {
    return isCompactMenuViewport()
        ? { initial: 4, chunk: 6 }
        : { initial: 8, chunk: 12 };
}

function prefersReducedMenuMotion() {
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    return Boolean(
        saveData ||
        (window.matchMedia && (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            window.matchMedia('(max-width: 768px)').matches ||
            window.matchMedia('(pointer: coarse)').matches
        ))
    );
}

function disconnectCategoryChunkObserver() {
    if (!categoryChunkObserver) return;
    categoryChunkObserver.disconnect();
    categoryChunkObserver = null;
}

function ensureCategoryChunkObserver() {
    if (categoryChunkObserver || !('IntersectionObserver' in window)) return categoryChunkObserver;

    categoryChunkObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const currentState = activeCategoryRenderState;
            if (!currentState || entry.target !== currentState.sentinel) return;
            categoryChunkObserver.unobserve(entry.target);
            scheduleNextCategoryChunk(activeCategoryRenderToken);
        });
    }, { rootMargin: '320px 0px' });

    return categoryChunkObserver;
}

function ensureMenuMotionObserver() {
    if (prefersReducedMenuMotion()) return null;
    if (menuMotionObserver) return menuMotionObserver;

    menuMotionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            menuMotionObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -12% 0px'
    });

    return menuMotionObserver;
}

function loadDeferredMenuImage(img) {
    if (!img || img.dataset.loaded === '1') return;
    const src = img.dataset.menuSrc;
    if (!src) return;

    img.dataset.loaded = '1';
    img.onerror = () => {
        const originalSrc = img.dataset.originalSrc;
        if (originalSrc) {
            img.dataset.originalSrc = '';
            img.src = originalSrc;
            return;
        }
        img.onerror = null;
        const fallback = document.createElement('span');
        fallback.className = 'emoji-placeholder';
        fallback.textContent = img.dataset.fallbackEmoji || MENU_UI_ICONS.plate;
        img.replaceWith(fallback);
    };
    img.src = src;
}

function ensureMenuImageObserver() {
    if (menuImageObserver || !('IntersectionObserver' in window)) return menuImageObserver;

    const rootMargin = isCompactMenuViewport() ? '120px 0px' : '220px 0px';
    menuImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const target = entry.target;
            menuImageObserver.unobserve(target);
            loadDeferredMenuImage(target);
        });
    }, { rootMargin });

    return menuImageObserver;
}

function observeDeferredMenuImages(scope = document) {
    const images = scope.querySelectorAll('.menu-deferred-img[data-menu-src]');
    if (!images.length) return;

    const observer = ensureMenuImageObserver();
    if (!observer) {
        images.forEach((img) => loadDeferredMenuImage(img));
        return;
    }

    images.forEach((img) => observer.observe(img));
}

function buildMenuItemCardMarkup(item, cat, itemIndex) {
    return `
        <div class="menu-item-card menu-reveal-observe" onclick="openDishPage(${serializeInlineId(item.id)})">
            <button class="love-btn menu-item-love ${window.getLikeCount(item.id) > 0 ? 'loved text-pop' : ''}" 
                    onclick="event.stopPropagation(); window.handleToggleLike(${serializeInlineId(item.id)}, this)">
                <span class="love-icon">${MENU_UI_ICONS.heart}</span><span class="love-count">${window.getLikeCount(item.id)}</span>
            </button>
            <div class="menu-item-img" onclick="event.stopPropagation(); openGallery(menu.filter(m => m.cat === ${serializeInlineId(cat)}), ${itemIndex})">
                ${imgTag(item, { defer: true, variant: 'list' })}
            </div>
            <div class="menu-item-info">
                <div class="menu-item-name">${window.getLocalizedMenuName(item)}</div>
                <div class="menu-item-desc">${window.getLocalizedMenuDescription(item)}</div>
                <div class="menu-item-price">
                    ${item.hasSizes
                        ? `<span style="font-size:0.7em; opacity:0.7;">${t('price_from', 'À partir de')}</span> ${window.getItemPrice(item, 'small').toFixed(0)} MAD`
                        : `${item.price.toFixed(0)} MAD`}
                </div>
            </div>
            <div class="menu-item-side">
                <button class="menu-item-add" onclick="event.stopPropagation();addToCart(${serializeInlineId(item.id)})">+</button>
            </div>
        </div>
    `;
}

function getMenuCategoryCacheKey(cat) {
    const currentLang = typeof window.getStoredLanguage === 'function'
        ? window.getStoredLanguage()
        : 'fr';
    return `${lastDataVersion || 'runtime'}::${currentLang}::${cat}`;
}

function buildCategorySectionMarkup(cat, gridMarkup) {
    return `
        <section class="menu-section menu-reveal-observe" id="cat-${cat.replace(/\s/g, '-')}">
            <h2 class="menu-section-title">${catEmojis[cat] || MENU_UI_ICONS.plate} ${window.getLocalizedCategoryName(cat, cat)}</h2>
            <div class="menu-grid">${gridMarkup}</div>
        </section>
    `;
}

function cacheRenderedCategoryMarkup(cat, gridMarkup) {
    menuCategoryMarkupCache.set(getMenuCategoryCacheKey(cat), buildCategorySectionMarkup(cat, gridMarkup));
}

function ensureCategoryChunkSentinel(state) {
    if (!state?.grid) return;
    if (!state.sentinel || !state.sentinel.isConnected) {
        const sentinel = document.createElement('div');
        sentinel.className = 'menu-grid-sentinel';
        sentinel.setAttribute('aria-hidden', 'true');
        state.grid.appendChild(sentinel);
        state.sentinel = sentinel;
    }

    const observer = ensureCategoryChunkObserver();
    if (observer) observer.observe(state.sentinel);
}

function flushActiveCategoryRenderState() {
    if (!activeCategoryRenderState) return;

    const state = activeCategoryRenderState;
    if (!state.grid) {
        activeCategoryRenderState = null;
        return;
    }

    while (state.nextIndex < state.items.length) {
        const chunkSize = getMenuRenderChunkConfig().chunk;
        const endIndex = Math.min(state.nextIndex + chunkSize, state.items.length);
        const chunkMarkup = state.items
            .slice(state.nextIndex, endIndex)
            .map((item, index) => buildMenuItemCardMarkup(item, state.category, state.nextIndex + index))
            .join('');
        if (state.sentinel && state.sentinel.isConnected) state.sentinel.insertAdjacentHTML('beforebegin', chunkMarkup);
        else state.grid.insertAdjacentHTML('beforeend', chunkMarkup);
        state.nextIndex = endIndex;
    }

    if (state.sentinel?.isConnected) state.sentinel.remove();
    disconnectCategoryChunkObserver();
    observeDeferredMenuImages(state.grid);
    scheduleMenuMotionRefresh();
    cacheRenderedCategoryMarkup(state.category, state.grid.innerHTML);
    activeCategoryRenderState = null;
}

function scheduleNextCategoryChunk(token) {
    const state = activeCategoryRenderState;
    if (!state || token !== activeCategoryRenderToken || state.nextIndex >= state.items.length) {
        if (state && state.nextIndex >= state.items.length) activeCategoryRenderState = null;
        return;
    }

    const run = () => {
        const currentState = activeCategoryRenderState;
        if (!currentState || token !== activeCategoryRenderToken || !currentState.grid) return;

        const chunkSize = getMenuRenderChunkConfig().chunk;
        const endIndex = Math.min(currentState.nextIndex + chunkSize, currentState.items.length);
        const chunkMarkup = currentState.items
            .slice(currentState.nextIndex, endIndex)
            .map((item, index) => buildMenuItemCardMarkup(item, currentState.category, currentState.nextIndex + index))
            .join('');
        if (currentState.sentinel && currentState.sentinel.isConnected) currentState.sentinel.insertAdjacentHTML('beforebegin', chunkMarkup);
        else currentState.grid.insertAdjacentHTML('beforeend', chunkMarkup);
        currentState.nextIndex = endIndex;
        observeDeferredMenuImages(currentState.grid);
        scheduleMenuMotionRefresh();

        if (currentState.nextIndex >= currentState.items.length) {
            if (currentState.sentinel?.isConnected) currentState.sentinel.remove();
            disconnectCategoryChunkObserver();
            cacheRenderedCategoryMarkup(currentState.category, currentState.grid.innerHTML);
            activeCategoryRenderState = null;
            return;
        }

        if (isCompactMenuViewport()) {
            ensureCategoryChunkSentinel(currentState);
            return;
        }

        scheduleNextCategoryChunk(token);
    };

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => run(), { timeout: 500 });
    } else {
        requestAnimationFrame(() => {
            setTimeout(run, 0);
        });
    }
}

function refreshMenuMotionTargets() {
    const targets = Array.from(document.querySelectorAll('.menu-reveal-observe'));
    if (targets.length === 0) return;

    if (prefersReducedMenuMotion()) {
        targets.forEach((target) => {
            target.classList.add('is-visible');
            target.style.removeProperty('--menu-reveal-delay');
        });
        return;
    }

    const observer = ensureMenuMotionObserver();
    let staggerIndex = 0;

    targets.forEach((target) => {
        const styles = window.getComputedStyle(target);
        if (styles.display === 'none' || styles.visibility === 'hidden') return;
        if (target.classList.contains('is-visible')) return;

        target.style.setProperty('--menu-reveal-delay', `${Math.min(staggerIndex * 55, 280)}ms`);
        observer.observe(target);
        staggerIndex += 1;
    });
}

function scheduleMenuMotionRefresh() {
    if (prefersReducedMenuMotion()) return;
    if (menuMotionRefreshFrame) {
        cancelAnimationFrame(menuMotionRefreshFrame);
    }

    menuMotionRefreshFrame = requestAnimationFrame(() => {
        menuMotionRefreshFrame = null;
        refreshMenuMotionTargets();
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• INIT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

document.addEventListener('DOMContentLoaded', async () => {
    initMenuApp();
    requestAnimationFrame(() => {
        setTimeout(() => {
            syncDataFromServer();
        }, 0);
    });
});

function initMenuApp() {
    applyMenuDataSnapshot(readStoredMenuSnapshot());
    const savedLang = typeof window.getStoredLanguage === 'function'
        ? window.getStoredLanguage()
        : 'fr';
    window.setLang(savedLang);
    renderLandingInfo();
    updateCartUI();
    updateHistoryBadge();
    scheduleMenuMotionRefresh();
    requestAnimationFrame(() => {
        setTimeout(() => {
            window.updateStatus();
            window.applyBranding();
        }, 0);
    });
}

function renderLandingInfo() {
    const config = window.restaurantConfig;
    if (!config) return;
    const locationConfig = config.location || {};
    const socialsConfig = config.socials || {};
    const wifiConfig = config.wifi || {};
    const mapUrl = window.getSafeExternalUrl(locationConfig.url);
    const phoneHref = window.getSafePhoneHref(config.phone);
    const getText = (key, fallback) => typeof window.getTranslation === 'function'
        ? window.getTranslation(key, fallback)
        : fallback;

    // Location
    const locEl = document.getElementById('landingLocation');
    if (locEl) {
        const locationRow = locEl.closest('.info-row');
        const hasAddress = Boolean(locationConfig.address);
        locEl.textContent = locationConfig.address || getText('landing_address_placeholder', 'Restaurant address');
        locEl.classList.toggle('is-empty', !hasAddress);
        if (locationRow && mapUrl && hasAddress) {
            locationRow.onclick = () => window.openSafeExternalUrl(mapUrl, '_blank');
            locationRow.classList.add('is-actionable');
            locationRow.classList.remove('is-empty');
        } else if (locationRow) {
            locationRow.onclick = null;
            locationRow.classList.remove('is-actionable');
            locationRow.classList.toggle('is-empty', !hasAddress);
        }
    }

    // Phone
    const phoneEl = document.getElementById('landingPhone');
    if (phoneEl) {
        const phoneRow = phoneEl.closest('.info-row');
        const hasPhone = Boolean(config.phone);
        phoneEl.textContent = config.phone || getText('landing_phone_placeholder', 'Phone coming soon');
        phoneEl.classList.toggle('is-empty', !hasPhone);
        if (phoneRow && phoneHref && hasPhone) {
            phoneRow.onclick = () => {
                window.location.href = phoneHref;
            };
            phoneRow.classList.add('is-actionable');
            phoneRow.classList.remove('is-empty');
        } else if (phoneRow) {
            phoneRow.onclick = null;
            phoneRow.classList.remove('is-actionable');
            phoneRow.classList.toggle('is-empty', !hasPhone);
        }
    }

    // Socials
    const socialEl = document.getElementById('landingSocial');
    if (socialEl) {
        const fallbackHandle = (window.restaurantConfig?.branding?.shortName || 'restaurant').toLowerCase().replace(/\s+/g, '');
        const instagramHandle = (socialsConfig.instagram || '').split('/').filter(Boolean).pop();
        const socialRow = socialEl.closest('.info-row');
        const hasSocials = Boolean(
            window.getSafeExternalUrl(socialsConfig.instagram) ||
            window.getSafeExternalUrl(socialsConfig.facebook) ||
            window.getSafeExternalUrl(socialsConfig.tiktok) ||
            window.getSafeExternalUrl(socialsConfig.tripadvisor) ||
            window.getWhatsAppNumber()
        );
        socialEl.textContent = hasSocials
            ? '@' + (instagramHandle || fallbackHandle)
            : getText('landing_social_placeholder', 'Social links coming soon');
        socialEl.classList.toggle('is-empty', !hasSocials);
        if (socialRow && hasSocials) {
            socialRow.onclick = () => openSocialModal();
            socialRow.classList.add('is-actionable');
            socialRow.classList.remove('is-empty');
        } else if (socialRow) {
            socialRow.onclick = null;
            socialRow.classList.remove('is-actionable');
            socialRow.classList.add('is-empty');
        }
    }

    // WiFi
    const wifiEl = document.getElementById('landingWifi');
    if (wifiEl) {
        const wifiRow = wifiEl.closest('.info-row');
        const hasWifi = Boolean(wifiConfig.name && wifiConfig.code);
        wifiEl.textContent = hasWifi
            ? wifiConfig.name
            : getText('landing_wifi_placeholder', 'WiFi code available on site');
        wifiEl.classList.toggle('is-empty', !hasWifi);
        if (wifiRow && hasWifi) {
            wifiRow.onclick = () => openWiFiModal();
            wifiRow.classList.add('is-actionable');
            wifiRow.classList.remove('is-empty');
        } else if (wifiRow) {
            wifiRow.onclick = null;
            wifiRow.classList.remove('is-actionable');
            wifiRow.classList.add('is-empty');
        }
    }

    renderLandingSocialLinks();
    scheduleMenuMotionRefresh();
}

function ensureSuperCatSheetReady() {
    if (superCatSheetReady) return;
    renderSuperCatSheet();
    superCatSheetReady = true;
}

function renderLandingSocialLinks() {
    const container = document.getElementById('menuLandingSocialLinks');
    if (!container) return;

    const links = [`<a href="index.html" class="social-icon-link" aria-label="${t('landing_home_title', 'Home')}">&#127968;</a>`];
    const socials = { ...(window.restaurantConfig?.socials || {}) };
    socials.facebook = window.getSafeExternalUrl(socials.facebook);
    socials.instagram = window.getSafeExternalUrl(socials.instagram);
    socials.tiktok = window.getSafeExternalUrl(socials.tiktok);
    socials.whatsapp = window.getWhatsAppNumber();

    if (socials.facebook) {
        links.push(`<a href="${socials.facebook}" target="_blank" class="social-icon-link" aria-label="${t('social_facebook', 'Facebook')}">&#128216;</a>`);
    }
    if (socials.instagram) {
        links.push(`<a href="${socials.instagram}" target="_blank" class="social-icon-link" aria-label="${t('social_instagram', 'Instagram')}">&#128247;</a>`);
    }
    if (socials.tiktok) {
        links.push(`<a href="${socials.tiktok}" target="_blank" class="social-icon-link" aria-label="${t('social_tiktok', 'TikTok')}">&#127925;</a>`);
    }
    if (socials.whatsapp) {
        links.push(`<a href="https://wa.me/${socials.whatsapp}" target="_blank" class="social-icon-link" aria-label="${t('social_whatsapp', 'WhatsApp')}">&#128222;</a>`);
    }

    container.classList.toggle('social-links-minimal', links.length === 1);
    container.innerHTML = links.join('');
}

function openWiFiModal() {
    const config = window.restaurantConfig;
    const wifiTitle = t('wifi_connect_title', 'Connect to WiFi');
    const networkLabel = t('wifi_network_label', 'Network');
    const closeLabel = t('modal_close', 'CLOSE');
    const content = `
        <div class="modal-body menu-modal-body is-centered">
            <div class="menu-modal-icon">${MENU_UI_ICONS.wifi}</div>
            <h2 class="menu-modal-title">${wifiTitle}</h2>
            <p class="menu-modal-subtitle">${networkLabel}: <strong>${config.wifi.name}</strong></p>
            <div class="menu-modal-code-card">
                ${config.wifi.code}
            </div>
            <button class="menu-modal-action" onclick="closeAllModals()">${closeLabel}</button>
        </div>
    `;
    const drawer = document.getElementById('cartDrawer');
    document.getElementById('drawerContent').innerHTML = content;
    drawer.classList.add('open');
    document.getElementById('sharedOverlay').classList.add('open');
}

function openSocialModal() {
    const config = window.restaurantConfig;
    const title = t('social_modal_title', 'Our social media');
    const closeLabel = t('modal_close', 'CLOSE');
    const emptyText = t('social_empty', 'No links configured yet.');
    const whatsappNumber = window.getWhatsAppNumber();
    config.socials = config.socials || {};
    config.socials.instagram = window.getSafeExternalUrl(config.socials.instagram);
    config.socials.facebook = window.getSafeExternalUrl(config.socials.facebook);
    config.socials.tiktok = window.getSafeExternalUrl(config.socials.tiktok);
    config.socials.tripadvisor = window.getSafeExternalUrl(config.socials.tripadvisor);
    const socials = [
        config.socials.instagram ? `<a href="${config.socials.instagram}" target="_blank" class="social-item"><span class="social-item-icon">${MENU_UI_ICONS.instagram}</span> <strong>${t('social_instagram', 'Instagram')}</strong></a>` : '',
        config.socials.facebook ? `<a href="${config.socials.facebook}" target="_blank" class="social-item"><span class="social-item-icon">${MENU_UI_ICONS.facebook}</span> <strong>${t('social_facebook', 'Facebook')}</strong></a>` : '',
        config.socials.tiktok ? `<a href="${config.socials.tiktok}" target="_blank" class="social-item"><span class="social-item-icon">${MENU_UI_ICONS.tiktok}</span> <strong>${t('social_tiktok', 'TikTok')}</strong></a>` : '',
        config.socials.tripadvisor ? `<a href="${config.socials.tripadvisor}" target="_blank" class="social-item"><span class="social-item-icon">${MENU_UI_ICONS.sparkle}</span> <strong>${t('social_tripadvisor', 'TripAdvisor')}</strong></a>` : '',
        whatsappNumber ? `<a href="https://wa.me/${whatsappNumber}" target="_blank" class="social-item"><span class="social-item-icon">${MENU_UI_ICONS.whatsapp}</span> <strong>${t('social_whatsapp', 'WhatsApp')}</strong></a>` : ''
    ].filter(Boolean).join('');
    const content = `
        <div class="modal-body menu-modal-body">
            <h2 class="menu-modal-title">${title}</h2>
            <div class="social-list">
                ${socials || `<p class="menu-modal-empty">${emptyText}</p>`}
            </div>
            <button class="menu-modal-action is-muted" onclick="closeAllModals()">${closeLabel}</button>
        </div>
    `;
    const drawer = document.getElementById('cartDrawer');
    document.getElementById('drawerContent').innerHTML = content;
    drawer.classList.add('open');
    document.getElementById('sharedOverlay').classList.add('open');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• LANDING & VIEWS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function showLanding() {
    featuredRenderToken += 1;
    // Close ALL overlays and modals first to prevent blank screen
    ['superCatOverlay', 'superCatSheet', 'sharedOverlay', 'cartDrawer',
        'ticketModal', 'dishPage', 'historyOverlay'].forEach(id => {
            document.getElementById(id)?.classList.remove('open');
        });
    document.body.style.overflow = '';

    // Now show landing and hide menu view
    document.getElementById('landingView').style.display = 'block';
    document.getElementById('menuNavigationView').style.display = 'none';
    document.getElementById('menuNavigationView')?.removeAttribute('data-mode');
    document.querySelector('.mobile-wrapper')?.classList.add('is-landing');
    navigationStack = [];
    updateBackBtn();
    scheduleMenuMotionRefresh();
    scheduleMenuFixedLayout();
    window.scrollTo({ top: 0, behavior: isCompactMenuViewport() ? 'auto' : 'smooth' });
}

function showMenuNavigationView(title) {
    document.getElementById('landingView').style.display = 'none';
    document.getElementById('menuNavigationView').style.display = 'block';
    document.querySelector('.mobile-wrapper')?.classList.remove('is-landing');
    document.getElementById('menuNavTitle').textContent = title || window.getTranslation('nav_menu', 'Menu');
    updateBackBtn();
    scheduleMenuMotionRefresh();
    scheduleMenuFixedLayout();
    window.scrollTo({ top: 0, behavior: isCompactMenuViewport() ? 'auto' : 'smooth' });
}

function renderFeaturedSlider(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.style.display = 'none';
        scheduleMenuMotionRefresh();
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <div class="featured-header-sexy menu-reveal-observe">
            <span class="featured-header-label">${t('featured_label', 'Sélection Signature')}</span>
            <h2 class="featured-header-title">
                <span>${t('featured_best', 'Nos Coups de Coeur')}</span> ${MENU_UI_ICONS.sparkle}
            </h2>
        </div>
        <div class="featured-slider">
            ${items.map(item => `
                <div class="featured-card menu-reveal-observe" onclick="openDishPage(${serializeInlineId(item.id)})">
                    <div class="featured-img-wrap">
                        ${imgTag(item, { defer: true })}
                    </div>
                    <div class="featured-info">
                        <div class="featured-name">${window.getLocalizedMenuName(item)}</div>
                        <div class="featured-price">${window.getItemPrice(item).toFixed(0)} MAD</div>
                    </div>
                    <button class="featured-add-btn" onclick="event.stopPropagation();addToCart(${serializeInlineId(item.id)})">+</button>
                </div>
            `).join('')}
        </div>
    `;

    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
    observeDeferredMenuImages(container);
    scheduleMenuMotionRefresh();
}

function scheduleDeferredFeaturedRender(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    featuredRenderToken += 1;
    const token = featuredRenderToken;
    container.style.display = 'none';
    container.innerHTML = '';

    const run = () => {
        if (token !== featuredRenderToken) return;
        renderFeaturedSlider(items, containerId);
    };

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => run(), { timeout: 600 });
        return;
    }

    requestAnimationFrame(() => {
        setTimeout(run, 40);
    });
}

function updateBackBtn() {
    const btn = document.getElementById('menuBackBtn');
    if (!btn) return;
    btn.style.display = navigationStack.length > 0 ? 'flex' : 'none';
}

function menuGoBack() {
    if (navigationStack.length <= 1) {
        showLanding();
        openSuperCatSheet();
        return;
    }

    navigationStack.pop();
    const last = navigationStack[navigationStack.length - 1];

    if (last.startsWith('subcats:')) {
        const scId = last.split(':')[1];
        const sc = getSuperCategories().find(s => s.id === scId);
        if (sc) showSubCategoryGrid(sc, false);
    } else {
        showLanding();
        openSuperCatSheet();
    }
    updateBackBtn();
}

// DELETED - Replaced by direct calls in menuGoBack


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SUPER CATEGORY SHEET â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderSuperCatSheet() {
    const list = document.getElementById('superCatList');
    if (!list) return;
    superCatSheetReady = true;
    list.innerHTML = getSuperCategories().map(sc => `
        <div class="super-cat-row menu-reveal-observe" onclick="selectSuperCategory('${sc.id}')">
            <div class="super-cat-row-left">
                <span class="super-cat-row-emoji">${sc.emoji}</span>
                <div class="super-cat-row-info">
                    <div class="super-cat-row-name">${window.getLocalizedSuperCategoryName(sc, sc.name)}</div>
                    <div class="super-cat-row-desc">${window.getLocalizedSuperCategoryDescription(sc, sc.desc)}</div>
                </div>
            </div>
            <span class="super-cat-row-arrow">&rsaquo;</span>
        </div>
    `).join('');
    scheduleMenuMotionRefresh();
}

function openSuperCatSheet() {
    ensureSuperCatSheetReady();
    document.getElementById('superCatOverlay').classList.add('open');
    document.getElementById('superCatSheet').classList.add('open');
}

function closeSuperCatSheet() {
    document.getElementById('superCatOverlay').classList.remove('open');
    document.getElementById('superCatSheet').classList.remove('open');
}

function selectSuperCategory(scId) {
    const sc = getSuperCategories().find(s => s.id === scId);
    if (!sc) return;
    currentSuperCat = sc;
    closeSuperCatSheet();
    navigationStack = ['supercats'];
    showSubCategoryGrid(sc, true);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SUB CATEGORY GRID â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function showSubCategoryGrid(sc, addToStack = true) {
    if (addToStack) navigationStack.push(`subcats:${sc.id}`);

    showMenuNavigationView(window.getLocalizedSuperCategoryName(sc, sc.name));

    const navWrapper = document.getElementById('catNavWrapper');
    const menuContent = document.getElementById('menuContent');
    document.getElementById('menuNavigationView')?.setAttribute('data-mode', 'items');

    const currentCategories = [...new Set(menu.map(m => m.cat))];
    const filteredCats = sc.cats.filter(c => currentCategories.includes(c));
    const defaultCategory = filteredCats[0] || '';

    navWrapper.style.display = filteredCats.length ? 'block' : 'none';
    menuContent.style.display = '';
    currentSuperCat = sc;

    renderSuperCategoryChildNav(sc, defaultCategory);
    if (defaultCategory) {
        renderMenu(defaultCategory);
    } else {
        menuContent.innerHTML = '';
    }

    scheduleDeferredFeaturedRender([], 'featuredGlobal');

    updateBackBtn();
    scheduleMenuFixedLayout();
    scheduleMenuMotionRefresh();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CATEGORY ITEMS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function showCategoryItems(cat, addToStack = true) {
    if (addToStack) navigationStack.push(`items:${cat}`);
    renderMenu(cat);

    showMenuNavigationView(window.getLocalizedCategoryName(cat, cat));

    const navWrapper = document.getElementById('catNavWrapper');
    const menuContent = document.getElementById('menuContent');
    const sc = getSuperCategoryForCategory(cat);

    document.getElementById('menuNavigationView')?.setAttribute('data-mode', 'items');
    renderSuperCategoryChildNav(sc, cat);
    menuContent.style.display = 'block';

    // Update global featured slider for specific category
    const featuredItems = menu.filter(m => m.cat === cat && m.featured && m.available !== false);
    scheduleDeferredFeaturedRender(featuredItems, 'featuredGlobal');

    updateBackBtn();
    scheduleMenuFixedLayout();
    scheduleMenuMotionRefresh();
}

function rerenderCurrentMenuLanguageView() {
    if (superCatSheetReady) renderSuperCatSheet();
    renderLandingInfo();

    const currentState = navigationStack[navigationStack.length - 1] || '';

    if (currentState.startsWith('items:')) {
        const categoryKey = currentState.slice('items:'.length);
        const activeSuperCategory = getSuperCategories().find((entry) => Array.isArray(entry?.cats) && entry.cats.includes(categoryKey));
        if (activeSuperCategory) currentSuperCat = activeSuperCategory;
        showCategoryItems(categoryKey, false);
        return;
    }

    if (currentState.startsWith('subcats:')) {
        const superCategoryId = currentState.slice('subcats:'.length);
        const activeSuperCategory = getSuperCategories().find((entry) => entry?.id === superCategoryId) || currentSuperCat;
        if (activeSuperCategory) {
            currentSuperCat = activeSuperCategory;
            showSubCategoryGrid(activeSuperCategory, false);
            return;
        }
    }

    if (currentState === 'supercats') {
        openSuperCatSheet();
    }

    scheduleMenuMotionRefresh();
}

const baseMenuSetLang = typeof window.setLang === 'function' ? window.setLang.bind(window) : null;
if (baseMenuSetLang) {
    window.setLang = function (lang, btn) {
        baseMenuSetLang(lang, btn);
        menuCategoryMarkupCache = new Map();
        rerenderCurrentMenuLanguageView();
    };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• RENDERING â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderMenu(categoryFilter = null) {
    const wrap = document.getElementById('menuContent');
    if (!wrap) return;
    menuMarkupReady = true;
    activeCategoryRenderToken += 1;
    activeCategoryRenderState = null;
    disconnectCategoryChunkObserver();

    let categories = categoryFilter
        ? [categoryFilter]
        : [...new Set(menu.map(m => m.cat))];

    if (categories.length === 1) {
        const cat = categories[0];
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        const cachedMarkup = menuCategoryMarkupCache.get(getMenuCategoryCacheKey(cat));
        if (cachedMarkup) {
            wrap.innerHTML = cachedMarkup;
            observeDeferredMenuImages(wrap);
            scheduleMenuMotionRefresh();
            return;
        }

        wrap.innerHTML = buildCategorySectionMarkup(cat, '');

        const grid = wrap.querySelector('.menu-grid');
        if (!grid) return;

        const initialCount = Math.min(getMenuRenderChunkConfig().initial, items.length);
        grid.innerHTML = items
            .slice(0, initialCount)
            .map((item, itemIndex) => buildMenuItemCardMarkup(item, cat, itemIndex))
            .join('');

        observeDeferredMenuImages(grid);
        scheduleMenuMotionRefresh();

        if (initialCount < items.length) {
            activeCategoryRenderState = {
                category: cat,
                items,
                nextIndex: initialCount,
                grid
            };
            if (isCompactMenuViewport()) ensureCategoryChunkSentinel(activeCategoryRenderState);
            else scheduleNextCategoryChunk(activeCategoryRenderToken);
        } else {
            cacheRenderedCategoryMarkup(cat, grid.innerHTML);
        }
        return;
    }

    wrap.innerHTML = categories.map(cat => {
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        return `
            <section class="menu-section menu-reveal-observe" id="cat-${cat.replace(/\s/g, '-')}">
                <h2 class="menu-section-title">${catEmojis[cat] || MENU_UI_ICONS.plate} ${window.getLocalizedCategoryName(cat, cat)}</h2>
                <div class="menu-grid">
                    ${items.map((item, itemIndex) => buildMenuItemCardMarkup(item, cat, itemIndex)).join('')}
                </div>
            </section>
        `;
    }).join('');
    observeDeferredMenuImages(wrap);
    scheduleMenuMotionRefresh();
}

function imgTag(item, options = {}) {
    const { defer = false, variant = 'menu' } = options;
    const src = (item.images && item.images.length > 0) ? item.images[0] : item.img;
    const optimizedSrc = getMenuCardImageSrc(src, variant);
    const safeFallbackEmoji = catEmojis[item.cat] || MENU_UI_ICONS.plate;
    const originalSrcAttr = optimizedSrc && src && optimizedSrc !== src
        ? ` data-original-src="${escapeHtmlAttr(src)}"`
        : '';
    if (optimizedSrc && defer) {
        return `<img class="menu-deferred-img" data-menu-src="${escapeHtmlAttr(optimizedSrc)}"${originalSrcAttr} data-fallback-emoji="${escapeHtmlAttr(safeFallbackEmoji)}" alt="${escapeHtmlAttr(window.getLocalizedMenuName(item))}" width="320" height="320" loading="lazy" decoding="async" fetchpriority="low">`;
    }
    if (optimizedSrc) return `<img src="${escapeHtmlAttr(optimizedSrc)}"${originalSrcAttr} alt="${escapeHtmlAttr(window.getLocalizedMenuName(item))}" width="320" height="320" loading="lazy" decoding="async" fetchpriority="low" onerror="if(this.dataset.originalSrc){const next=this.dataset.originalSrc; this.dataset.originalSrc=''; this.src=next; return;} this.onerror=null; this.replaceWith(Object.assign(document.createElement('span'), { className: 'emoji-placeholder', textContent: ${JSON.stringify(safeFallbackEmoji)} }))">`;
    return `<span class="emoji-placeholder">${safeFallbackEmoji}</span>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DISH PAGE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function openDishPage(id) {
    return ensureMenuInteractionsScriptLoaded().then(() => window.openDishPage(id));
}

function closeDishPage() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.closeDishPage());
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• IMAGE GALLERY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openGallery(items, startIndex = 0) {
    return ensureMenuInteractionsScriptLoaded().then(() => window.openGallery(items, startIndex));
}

function closeGallery() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.closeGallery());
}

function updateGalleryView() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.updateGalleryView());
}

function nextGalleryImage() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.nextGalleryImage());
}

function prevGalleryImage() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.prevGalleryImage());
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('galleryOverlay');
    if (overlay && overlay.style.display === 'flex') {
        if (e.key === 'ArrowRight') nextGalleryImage();
        if (e.key === 'ArrowLeft') prevGalleryImage();
        if (e.key === 'Escape') closeGallery();
    }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SEARCH â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function searchMenu(q) {
    const query = q.toLowerCase().trim();
    if (query && activeCategoryRenderState) {
        flushActiveCategoryRenderState();
    }

    document.querySelectorAll('.menu-item-card').forEach(card => {
        const name = card.querySelector('.menu-item-name').textContent.toLowerCase();
        const desc = card.querySelector('.menu-item-desc').textContent.toLowerCase();
        card.style.display = (!query || name.includes(query) || desc.includes(query)) ? 'flex' : 'none';
    });

    document.querySelectorAll('.menu-section').forEach(s => {
        const visible = Array.from(s.querySelectorAll('.menu-item-card')).some(c => c.style.display !== 'none');
        s.style.display = visible ? 'block' : 'none';
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• LANG DROPDOWN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function toggleLangDropdown() {
    document.getElementById('langOptions')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#langDropdown')) {
        document.getElementById('langOptions')?.classList.remove('open');
    }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CART â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

window.addToCart = function (id, size) {
    const item = menu.find(m => sameMenuItemId(m.id, id));
    if (!item) return;

    const cartId = size ? `${id}_${size}` : `${id}`;
    const existing = cart.find(c => c.cartId === cartId);
    const correctPrice = window.getItemPrice(item, size);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            ...item,
            cartId: cartId,
            selectedSize: size,
            price: correctPrice,
            qty: 1
        });
    }
    saveCart();
    updateCartUI();
    const sizeLabel = size ? ` (${size.charAt(0).toUpperCase()})` : '';
    window.showToast?.(t('toast_item_added', `${MENU_UI_ICONS.sparkle} {item} ajouté !`, {
        item: `${window.getLocalizedMenuName(item)}${sizeLabel}`
    }));
};

window.removeFromCart = function (cartId) {
    const idx = cart.findIndex(c => c.cartId === cartId);
    if (idx > -1) {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    saveCart();
    updateCartUI();
    if (cart.length === 0) closeAllModals();
    else renderDrawer();
};

function saveCart() {
    if (typeof window.setStoredCart === 'function') {
        window.setStoredCart(cart);
    }
}

function updateCartUI() {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    ['cartNavBtnLanding', 'cartNavBtnMenu'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = count > 0 ? 'flex' : 'none';
    });
    ['cartBadgeLanding', 'cartBadgeMenu'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) badge.textContent = count;
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MODALS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function openDrawer() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.openDrawer());
}

function closeAllModals() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.closeAllModals());
}

function renderDrawer() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.renderDrawer());
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HISTORY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function openHistory() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.openHistory());
}

function closeHistory() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.closeHistory());
}

function renderHistory() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.renderHistory());
}

function deleteHistoryItem(index) {
    return ensureMenuInteractionsScriptLoaded().then(() => window.deleteHistoryItem(index));
}

function saveToHistory(text) {
    return ensureMenuInteractionsScriptLoaded().then(() => window.saveToHistory(text));
}

function updateHistoryBadge() {
    const h = typeof window.getStoredHistory === 'function'
        ? window.getStoredHistory()
        : [];
    const count = h.length;
    const badges = ['histBadgeLanding', 'histBadgeMenu'];
    badges.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TICKET â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function generateTicket() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.generateTicket());
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• LIKES HANDLER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function handleToggleLike(id, btn) {
    const newCount = window.toggleLike(id);
    btn.classList.add('loved', 'animate-heart');
    const countEl = btn.querySelector('.love-count');
    if (countEl) countEl.textContent = newCount;

    // Refresh other instances of this item's like button (if both card and page are open)
    setTimeout(() => {
        btn.classList.remove('animate-heart');
    }, 500);
}
window.handleToggleLike = handleToggleLike;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• GLOBALS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
window.showLanding = showLanding;
window.openSuperCatSheet = openSuperCatSheet;
window.closeSuperCatSheet = closeSuperCatSheet;
window.selectSuperCategory = selectSuperCategory;
window.showSubCategoryGrid = showSubCategoryGrid;
window.showCategoryItems = showCategoryItems;
window.menuGoBack = menuGoBack;
window.toggleLangDropdown = toggleLangDropdown;
window.searchMenu = searchMenu;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openDrawer = openDrawer;
window.closeAllModals = closeAllModals;
window.openHistory = openHistory;
window.closeHistory = closeHistory;
window.generateTicket = generateTicket;
window.openDishPage = openDishPage;
window.closeDishPage = closeDishPage;
window.renderDrawer = renderDrawer;
window.saveCart = saveCart;
window.updateCartUI = updateCartUI;
window.openPublicMediaPreview = openGallery;

window.addEventListener('resize', scheduleMenuFixedLayout);
window.addEventListener('orientationchange', scheduleMenuFixedLayout);
