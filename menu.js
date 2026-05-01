/**
 * Menu JS - 3-Tier Navigation
 * Landing → Super Category → Sub Category → Items
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
let currentSharedModal = '';
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

function shouldUseStoredMenuSnapshot() {
    const host = String(window.location?.hostname || '').trim().toLowerCase();
    return host !== '127.0.0.1' && host !== 'localhost';
}

function readStoredMenuSnapshot() {
    try {
        if (!shouldUseStoredMenuSnapshot()) {
            window.localStorage?.removeItem?.(MENU_SNAPSHOT_STORAGE_KEY);
            return null;
        }
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
        if (!shouldUseStoredMenuSnapshot()) return;
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

// ═══ SYNC DATA FROM SERVER ═══
async function syncDataFromServer() {
    if (syncInFlight) return syncInFlight;
    lastPublicSyncStartedAt = Date.now();

    syncInFlight = (async () => {
    try {
        const res = await fetchPublicDataWithTimeout();
        if (res.status === 304) {
            initialMenuSyncState = 'ready';
            refreshLandingFeatured();
            return;
        }
        if (!res.ok) {
            initialMenuSyncState = 'error';
            refreshLandingFeatured();
            return;
        }
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
            const currentBranding = window.restaurantConfig?.branding || {};
            const nextBranding = data.branding || {};
            
            // Protect "Pizzeria Nour" branding from server defaults
            const isPizzeriaNour = String(currentBranding.restaurantName || '').toLowerCase().includes('nour');
            const brandingToApply = isPizzeriaNour ? currentBranding : nextBranding;

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
                branding: brandingToApply,
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
        refreshLandingFeatured();
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
        initialMenuSyncState = 'ready';
    } catch (e) {
        initialMenuSyncState = 'error';
        refreshLandingFeatured();
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

// ═══════════════════════ RESTAURANT CONFIG ═══════════════════════
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
    const safeVariant = variant === 'list'
        ? 'list'
        : (variant === 'hero' ? 'hero' : 'menu');
    return `/uploads/.thumbs/${filename}.${safeVariant}.webp`;
}

function getExplicitCategoryImage(cat) {
    return typeof categoryImages?.[cat] === 'string'
        ? categoryImages[cat].trim()
        : '';
}

function toCssImageValue(src) {
    const safe = String(src ?? '').replace(/["\\]/g, '\\$&');
    return `url("${safe}")`;
}

function buildCategoryBackdropImageValue(src) {
    const original = String(src ?? '').trim();
    if (!original) return '';
    const heroThumb = getMenuCardImageSrc(original, 'hero');
    if (heroThumb && heroThumb !== original) {
        return `${toCssImageValue(heroThumb)}, ${toCssImageValue(original)}`;
    }
    return toCssImageValue(original);
}

function applyActiveCategoryBackdrop(cat = '') {
    const contentArea = document.querySelector('#menuNavigationView .menu-content-area');
    if (!contentArea) return;

    const explicitCategoryImage = getExplicitCategoryImage(cat);
    if (!explicitCategoryImage) {
        contentArea.classList.remove('is-category-backed');
        contentArea.style.removeProperty('--menu-category-backdrop-image');
        return;
    }

    contentArea.classList.add('is-category-backed');
    contentArea.style.setProperty(
        '--menu-category-backdrop-image',
        buildCategoryBackdropImageValue(explicitCategoryImage)
    );
}

function buildMenuEmptyStateMarkup({
    icon = MENU_UI_ICONS.sparkle,
    eyebrow = '',
    title = '',
    text = '',
    actionLabel = '',
    action = '',
    className = ''
} = {}) {
    const safeEyebrow = String(eyebrow || '').trim();
    const safeTitle = String(title || '').trim();
    const safeText = String(text || '').trim();
    const safeActionLabel = String(actionLabel || '').trim();
    const safeAction = String(action || '').trim();

    return `
        <div class="menu-empty-state ${className} menu-reveal-observe">
            <div class="menu-empty-state-icon">${icon}</div>
            ${safeEyebrow ? `<div class="menu-empty-state-eyebrow">${escapeHtmlAttr(safeEyebrow)}</div>` : ''}
            ${safeTitle ? `<h3 class="menu-empty-state-title">${escapeHtmlAttr(safeTitle)}</h3>` : ''}
            ${safeText ? `<p class="menu-empty-state-copy">${escapeHtmlAttr(safeText)}</p>` : ''}
            ${safeActionLabel && safeAction ? `<button class="menu-empty-state-action" onclick="${escapeHtmlAttr(safeAction)}">${escapeHtmlAttr(safeActionLabel)}</button>` : ''}
        </div>
    `;
}

function getAvailableSuperCategories() {
    const currentCategories = new Set(
        menu
            .filter((item) => item?.available !== false)
            .map((item) => item.cat)
            .filter(Boolean)
    );

    return getSuperCategories().filter((entry) =>
        Array.isArray(entry?.cats) && entry.cats.some((cat) => currentCategories.has(cat))
    );
}

function getMenuLiveStats() {
    const visibleItems = menu.filter((item) => item?.available !== false);
    const visibleCategories = new Set(visibleItems.map((item) => item?.cat).filter(Boolean));
    const featuredCount = visibleItems.filter((item) => item?.featured).length;
    return {
        items: visibleItems.length,
        categories: visibleCategories.size,
        featured: featuredCount
    };
}

function getAvailableItemExtras(item) {
    return Array.isArray(item?.extras)
        ? item.extras
            .filter((extra) => extra && typeof extra === 'object' && String(extra.name || '').trim())
            .map((extra, index) => ({
                id: String(extra.id || `extra-${index + 1}`),
                name: String(extra.name || '').trim(),
                price: Number.isFinite(Number(extra.price)) ? Number(extra.price) : 0
            }))
        : [];
}

function getSelectedItemExtras(item, selectedExtras) {
    const availableExtras = getAvailableItemExtras(item);
    if (!availableExtras.length) return [];

    const selectedIds = (Array.isArray(selectedExtras) ? selectedExtras : [])
        .map((entry) => {
            if (entry && typeof entry === 'object') return String(entry.id || entry.name || '').trim();
            return String(entry || '').trim();
        })
        .filter(Boolean);

    if (!selectedIds.length) return [];

    return availableExtras.filter((extra) => selectedIds.includes(extra.id) || selectedIds.includes(extra.name));
}

function getConfiguredItemPrice(item, sizeKey, selectedExtras) {
    const basePrice = window.getItemPrice(item, sizeKey);
    const extrasTotal = getSelectedItemExtras(item, selectedExtras)
        .reduce((sum, extra) => sum + extra.price, 0);
    return basePrice + extrasTotal;
}

function buildCartItemId(id, sizeKey, selectedExtras) {
    const extrasKey = getSelectedItemExtras(menu.find((entry) => sameMenuItemId(entry.id, id)), selectedExtras)
        .map((extra) => extra.id)
        .sort()
        .join('+');
    return [String(id), String(sizeKey || ''), extrasKey].join('__');
}

function itemNeedsConfiguration(item) {
    return Boolean(item?.hasSizes || getAvailableItemExtras(item).length);
}

function handleMenuItemAdd(id) {
    const item = menu.find((entry) => sameMenuItemId(entry.id, id));
    if (!item) return;
    if (itemNeedsConfiguration(item)) {
        openDishPage(item.id);
        return;
    }
    addToCart(item.id);
}

function getCategoryPreviewSource(cat) {
    const explicitCategoryImage = getExplicitCategoryImage(cat);
    if (explicitCategoryImage) {
        return {
            src: getMenuCardImageSrc(explicitCategoryImage, 'menu'),
            originalSrc: explicitCategoryImage,
            fallbackOnly: false
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
            originalSrc: itemSrc,
            fallbackOnly: false
        };
    }

    return {
        src: '',
        originalSrc: '',
        fallbackOnly: true
    };
}

function getMenuCategoryItemCount(cat) {
    return menu.reduce((count, item) => count + ((item?.cat === cat && item?.available !== false) ? 1 : 0), 0);
}

function getSuperCategoryItemCount(sc) {
    if (!sc || !Array.isArray(sc.cats)) return 0;
    const cats = new Set(sc.cats);
    return menu.reduce((count, item) => count + ((item?.available !== false && cats.has(item?.cat)) ? 1 : 0), 0);
}

function buildCategoryNavigationCardMarkup(cat) {
    const localizedName = window.getLocalizedCategoryName(cat, cat);
    const itemCount = getMenuCategoryItemCount(cat);
    const preview = getCategoryPreviewSource(cat);
    const originalSrcAttr = preview.originalSrc && preview.originalSrc !== preview.src
        ? ` data-original-src="${escapeHtmlAttr(preview.originalSrc)}"`
        : '';
    const categoryFallbackGlyph = catEmojis[cat] || MENU_UI_ICONS.plate;
    const mediaMarkup = preview.fallbackOnly
        ? `<span class="emoji-placeholder menu-category-fallback" aria-hidden="true">${escapeHtmlAttr(categoryFallbackGlyph)}</span>`
        : `<img class="menu-deferred-img" data-menu-src="${escapeHtmlAttr(preview.src)}"${originalSrcAttr} data-fallback-emoji="${escapeHtmlAttr(categoryFallbackGlyph)}" data-fallback-class="menu-category-fallback" alt="${escapeHtmlAttr(localizedName)}" width="960" height="540" loading="lazy" decoding="async" fetchpriority="low">`;

    return `
        <button class="menu-category-card${preview.fallbackOnly ? ' has-designed-fallback' : ''} menu-reveal-observe" data-cat="${escapeHtmlAttr(cat)}" onclick="showCategoryItems(${serializeInlineId(cat)})">
            <span class="menu-category-card-media">
                ${mediaMarkup}
            </span>
            <span class="menu-category-card-shade"></span>
            <span class="menu-category-card-title">${localizedName}</span>
            <span class="menu-category-card-count">${itemCount}</span>
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
    const itemCount = getMenuCategoryItemCount(cat);

    return `
        <button class="menu-subnav-tab ${isActive ? 'active' : ''} menu-reveal-observe" data-cat="${escapeHtmlAttr(cat)}" onclick="showCategoryItems(${serializeInlineId(cat)})" ${isActive ? 'aria-current="page"' : ''}>
            <span class="menu-subnav-name">${localizedName}</span>
            <span class="menu-subnav-count">${itemCount}</span>
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
    scheduleActiveCategoryTabScroll();
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
let initialMenuSyncState = Array.isArray(menu) && menu.length ? 'ready' : 'pending';

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

function scheduleActiveCategoryTabScroll() {
    window.requestAnimationFrame(() => {
        const track = document.querySelector('#catNavScroll .menu-subnav-track');
        const activeTab = track?.querySelector('.menu-subnav-tab.active, .menu-subnav-tab[aria-current="page"]');
        if (!track || !activeTab) return;

        activeTab.scrollIntoView({
            behavior: prefersReducedMenuMotion() ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    });
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
        fallback.className = ['emoji-placeholder', img.dataset.fallbackClass || ''].filter(Boolean).join(' ');
        fallback.textContent = img.dataset.fallbackEmoji || MENU_UI_ICONS.plate;
        fallback.setAttribute('aria-hidden', 'true');
        img.closest('.menu-category-card')?.classList.add('has-designed-fallback');
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
    const isFeatured = !!item?.featured;
    const itemMeta = [];
    if (item?.hasSizes) itemMeta.push(t('multiple_sizes', 'Plusieurs tailles'));
    if (Array.isArray(item?.extras) && item.extras.length) itemMeta.push(t('extras_available', 'Extras'));
    return `
        <div class="menu-item-card menu-reveal-observe ${isFeatured ? 'menu-item-card--featured' : ''}" onclick="openDishPage(${serializeInlineId(item.id)})">
            ${isFeatured ? `<span class="menu-item-badge">${t('featured_label', 'Signature')}</span>` : ''}
            <button class="love-btn menu-item-love ${window.getLikeCount(item.id) > 0 ? 'loved text-pop' : ''}" 
                    onclick="event.stopPropagation(); window.handleToggleLike(${serializeInlineId(item.id)}, this)">
                <span class="love-icon">${MENU_UI_ICONS.heart}</span><span class="love-count">${window.getLikeCount(item.id)}</span>
            </button>
            <div class="menu-item-img" onclick="event.stopPropagation(); openDishPage(${serializeInlineId(item.id)})">
                ${imgTag(item, { defer: true, variant: 'list' })}
            </div>
            <div class="menu-item-info">
                <div class="menu-item-name">${window.getLocalizedMenuName(item)}</div>
                <div class="menu-item-desc">${window.getLocalizedMenuDescription(item)}</div>
                ${itemMeta.length ? `<div class="menu-item-meta">${itemMeta.map((label) => `<span class="menu-item-meta-pill">${label}</span>`).join('')}</div>` : ''}
                <div class="menu-item-price">
                    ${item.hasSizes
                        ? `<span class="menu-item-price-prefix"><i class="bi bi-tag-fill" aria-hidden="true"></i> ${t('price_from', 'À partir de')}</span> ${window.getItemPrice(item, 'small').toFixed(0)} MAD`
                        : `${item.price.toFixed(0)} MAD`}
                </div>
            </div>
            <div class="menu-item-side">
                <button class="menu-item-add" onclick="event.stopPropagation();handleMenuItemAdd(${serializeInlineId(item.id)})">+</button>
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

function buildCategorySectionMarkup(cat, gridMarkup, itemCount = 0) {
    return `
        <section class="menu-section menu-reveal-observe" id="cat-${cat.replace(/\s/g, '-')}">
            <h2 class="menu-section-title">
                <span class="menu-section-title-main">${catEmojis[cat] || MENU_UI_ICONS.plate} ${window.getLocalizedCategoryName(cat, cat)}</span>
                <span class="menu-section-count">${itemCount}</span>
            </h2>
            <div class="menu-grid">${gridMarkup}</div>
        </section>
    `;
}

function cacheRenderedCategoryMarkup(cat, gridMarkup) {
    const itemCount = typeof gridMarkup === 'string'
        ? (gridMarkup.match(/class="menu-item-card/g) || []).length
        : 0;
    menuCategoryMarkupCache.set(getMenuCategoryCacheKey(cat), buildCategorySectionMarkup(cat, gridMarkup, itemCount));
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
    if (menuMotionRefreshFrame) {
        cancelAnimationFrame(menuMotionRefreshFrame);
    }

    menuMotionRefreshFrame = requestAnimationFrame(() => {
        menuMotionRefreshFrame = null;
        refreshMenuMotionTargets();
    });
}

// ═══════════════════════ INIT ═══════════════════════

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
    if (Array.isArray(menu) && menu.length) {
        initialMenuSyncState = 'ready';
    }
    const savedLang = typeof window.getStoredLanguage === 'function'
        ? window.getStoredLanguage()
        : 'fr';
    window.setLang(savedLang);

    // Keep first paint light: show the landing basics now, and defer everything else.
    renderLandingInfo();

    const deferredInit = () => {
        refreshLandingFeatured();
        updateCartUI();
        updateHistoryBadge();
        scheduleMenuMotionRefresh();
        window.updateStatus();
        window.applyBranding();
    };

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(deferredInit, { timeout: 700 });
    } else {
        requestAnimationFrame(() => setTimeout(deferredInit, 0));
    }
}

function renderLandingInfo() {
    const config = window.restaurantConfig;
    if (!config) return;
    const locationConfig = config.location || {};
    const socialsConfig = config.socials || {};
    const wifiConfig = config.wifi || {};
    const stats = getMenuLiveStats();
    const mapUrl = window.getSafeExternalUrl(locationConfig.url);
    const phoneHref = window.getSafePhoneHref(config.phone);
    const getText = (key, fallback) => typeof window.getTranslation === 'function'
        ? window.getTranslation(key, fallback)
        : fallback;

    const subtitleEl = document.getElementById('landingSubtitle');
    if (subtitleEl) {
        subtitleEl.textContent = getText(
            'menu_landing_subtitle',
            'Carte du jour, prête à parcourir.'
        );
    }

    const metaItemsEl = document.getElementById('landingMetaItems');
    const metaCategoriesEl = document.getElementById('landingMetaCategories');
    const metaFeaturedEl = document.getElementById('landingMetaFeatured');
    if (metaItemsEl) metaItemsEl.textContent = `${stats.items} ${getText('menu_items', 'plats')}`;
    if (metaCategoriesEl) metaCategoriesEl.textContent = `${stats.categories} ${getText('categories', 'catégories')}`;
    if (metaFeaturedEl) metaFeaturedEl.textContent = `${stats.featured} ${getText('featured_label', 'signature')}`;

    // Location
    const locEl = document.getElementById('landingLocation');
    if (locEl) {
        const locationRow = locEl.closest('.info-row');
        const hasAddress = Boolean(locationConfig.address);
        locEl.textContent = locationConfig.address || getText('landing_address_placeholder', 'Restaurant address');
        if (locationRow && mapUrl && hasAddress) {
            locationRow.onclick = () => window.openSafeExternalUrl(mapUrl, '_blank');
            locationRow.classList.remove('opacity-60');
        } else if (locationRow) {
            locationRow.onclick = null;
        }
    }

    // Phone
    const phoneEl = document.getElementById('landingPhone');
    if (phoneEl) {
        const phoneRow = phoneEl.closest('.info-row');
        const hasPhone = Boolean(config.phone);
        phoneEl.textContent = config.phone || getText('landing_phone_placeholder', 'Phone coming soon');
        if (phoneRow && phoneHref && hasPhone) {
            phoneRow.onclick = () => { window.location.href = phoneHref; };
            phoneRow.classList.remove('opacity-60');
        } else if (phoneRow) {
            phoneRow.onclick = null;
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
        if (socialRow && hasSocials) {
            socialRow.onclick = () => openSocialModal();
            socialRow.classList.remove('opacity-60');
        } else if (socialRow) {
            socialRow.onclick = null;
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
        if (wifiRow && hasWifi) {
            wifiRow.onclick = () => openWiFiModal();
            wifiRow.classList.remove('opacity-60');
        } else if (wifiRow) {
            wifiRow.onclick = null;
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

    const SVG_ICONS = {
        home: '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-1.1 0-2 .9-2 2v1h3l-1 3h-2v6.8C18.56 20.87 22 16.84 22 12z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24"><path d="M16.75 13.96c.25.13 4.12 2.04 4.6 2.05.16.01.39.04.53.15.11.09.28.31.28.6 0 .5-.19 1.4-1.29 2.09-.85.52-1.72.63-2.14.63h-.03c-.24 0-1.07-.1-2.9-.6-2.5-1.19-5.11-3.6-6.72-5.4C7.43 11.66 6 9.87 6 7.83c0-.62.19-1.39.73-2 .57-.65 1.23-.74 1.57-.74.19 0 .39 0 .55.01.27.02.48.06.66.5.18.42.74 1.83.81 1.98.07.15.12.33.02.52-.09.18-.15.3-.29.46-.14.16-.29.35-.41.48-.13.14-.28.27-.12.55.15.28.68 1.15 1.45 1.84.99.89 1.85 1.16 2.12 1.3.28.13.44.11.6-.07.16-.18.69-.8 .88-1.07.18-.27.36-.23.63-.09M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.76 1.5 5.3L2 22l4.82-1.42A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>',
        tiktok: '<svg viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
        map: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
        phone: '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
        wifi: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c5-5 13-5 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>'
    };

    const homeLabel = t('landing_home_title', 'Home');
    const links = [`<a href="index.html" class="social-icon-link" aria-label="${homeLabel}" title="${homeLabel}">${SVG_ICONS.home}</a>`];
    const socials = { ...(window.restaurantConfig?.socials || {}) };
    socials.facebook = window.getSafeExternalUrl(socials.facebook);
    socials.instagram = window.getSafeExternalUrl(socials.instagram);
    socials.tiktok = window.getSafeExternalUrl(socials.tiktok);
    socials.whatsapp = window.getWhatsAppNumber();

    if (socials.facebook) {
        const label = t('social_facebook', 'Facebook');
        links.push(`<a href="${socials.facebook}" target="_blank" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.facebook}</a>`);
    }
    if (socials.instagram) {
        const label = t('social_instagram', 'Instagram');
        links.push(`<a href="${socials.instagram}" target="_blank" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.instagram}</a>`);
    }
    if (socials.tiktok) {
        const label = t('social_tiktok', 'TikTok');
        links.push(`<a href="${socials.tiktok}" target="_blank" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.tiktok}</a>`);
    }
    if (socials.whatsapp) {
        const label = t('social_whatsapp', 'WhatsApp');
        links.push(`<a href="https://wa.me/${socials.whatsapp}" target="_blank" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.whatsapp}</a>`);
    }

    const config = window.restaurantConfig;
    const locationConfig = config.location || {};
    const mapUrl = window.getSafeExternalUrl(locationConfig.url);
    const phoneHref = window.getSafePhoneHref(config.phone);
    const wifiConfig = config.wifi || {};
    const hasWifi = Boolean(wifiConfig.name && wifiConfig.code);

    if (mapUrl && locationConfig.address) {
        const label = t('landing_map_title', 'View on map');
        links.push(`<a href="${mapUrl}" target="_blank" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.map}</a>`);
    }
    if (phoneHref && config.phone) {
        const label = t('landing_call_title', 'Call');
        links.push(`<a href="${phoneHref}" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.phone}</a>`);
    }
    if (hasWifi) {
        const label = t('landing_wifi_title', 'WiFi code');
        links.push(`<a href="#" onclick="openWiFiModal(); return false;" class="social-icon-link" aria-label="${label}" title="${label}">${SVG_ICONS.wifi}</a>`);
    }

    container.classList.toggle('social-links-minimal', links.length === 1);
    container.innerHTML = links.join('');
}

function openWiFiModal() {
    currentSharedModal = 'wifi';
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
    currentSharedModal = 'social';
    const config = window.restaurantConfig;
    const title = t('social_modal_title', 'Our social media');
    const closeLabel = t('modal_close', 'CLOSE');
    const emptyText = t('social_empty', 'No links configured yet.');
    const whatsappNumber = window.getWhatsAppNumber();
    const instagramLabel = t('social_instagram', 'Instagram');
    const facebookLabel = t('social_facebook', 'Facebook');
    const tiktokLabel = t('social_tiktok', 'TikTok');
    const tripAdvisorLabel = t('social_tripadvisor', 'TripAdvisor');
    const whatsappLabel = t('social_whatsapp', 'WhatsApp');
    config.socials = config.socials || {};
    config.socials.instagram = window.getSafeExternalUrl(config.socials.instagram);
    config.socials.facebook = window.getSafeExternalUrl(config.socials.facebook);
    config.socials.tiktok = window.getSafeExternalUrl(config.socials.tiktok);
    config.socials.tripadvisor = window.getSafeExternalUrl(config.socials.tripadvisor);
    const socials = [
        config.socials.instagram ? `<a href="${config.socials.instagram}" target="_blank" class="social-item" aria-label="${instagramLabel}" title="${instagramLabel}"><span class="social-item-icon">${MENU_UI_ICONS.instagram}</span> <strong>${instagramLabel}</strong></a>` : '',
        config.socials.facebook ? `<a href="${config.socials.facebook}" target="_blank" class="social-item" aria-label="${facebookLabel}" title="${facebookLabel}"><span class="social-item-icon">${MENU_UI_ICONS.facebook}</span> <strong>${facebookLabel}</strong></a>` : '',
        config.socials.tiktok ? `<a href="${config.socials.tiktok}" target="_blank" class="social-item" aria-label="${tiktokLabel}" title="${tiktokLabel}"><span class="social-item-icon">${MENU_UI_ICONS.tiktok}</span> <strong>${tiktokLabel}</strong></a>` : '',
        config.socials.tripadvisor ? `<a href="${config.socials.tripadvisor}" target="_blank" class="social-item" aria-label="${tripAdvisorLabel}" title="${tripAdvisorLabel}"><span class="social-item-icon">${MENU_UI_ICONS.sparkle}</span> <strong>${tripAdvisorLabel}</strong></a>` : '',
        whatsappNumber ? `<a href="https://wa.me/${whatsappNumber}" target="_blank" class="social-item" aria-label="${whatsappLabel}" title="${whatsappLabel}"><span class="social-item-icon">${MENU_UI_ICONS.whatsapp}</span> <strong>${whatsappLabel}</strong></a>` : ''
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

// ═══════════════════════ LANDING & VIEWS ═══════════════════════

function showLanding() {
    featuredRenderToken += 1;
    // Close ALL overlays and modals first to prevent blank screen
    ['superCatOverlay', 'superCatSheet', 'sharedOverlay', 'cartDrawer',
        'ticketModal', 'dishPage', 'historyOverlay'].forEach(id => {
            document.getElementById(id)?.classList.remove('open');
        });
    currentSharedModal = '';
    document.body.style.overflow = '';

    // Now show landing and hide menu view
    document.getElementById('landingView').style.display = 'block';
    document.getElementById('menuNavigationView').style.display = 'none';
    document.getElementById('menuNavigationView')?.removeAttribute('data-mode');
    document.querySelector('.mobile-wrapper')?.classList.add('is-landing');
    refreshLandingFeatured();
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

function refreshLandingFeatured() {
    const container = document.getElementById('featuredLanding');
    if (!container) return;

    if (initialMenuSyncState === 'pending' && !menu.length) {
        container.dataset.state = 'loading';
        container.innerHTML = buildMenuEmptyStateMarkup({
            className: 'is-landing',
            icon: MENU_UI_ICONS.sparkle,
            eyebrow: t('nav_menu', 'Menu'),
            title: t('menu_loading_title', 'La carte arrive'),
            text: t('menu_loading_text', 'Nous préparons les plats et les catégories de cette table.')
        });
        scheduleMenuMotionRefresh();
        return;
    }

    if (initialMenuSyncState === 'error' && !menu.length) {
        container.dataset.state = 'error';
        container.innerHTML = buildMenuEmptyStateMarkup({
            className: 'is-landing',
            icon: MENU_UI_ICONS.sparkle,
            eyebrow: t('nav_menu', 'Menu'),
            title: t('menu_loading_error_title', 'Impossible de charger la carte'),
            text: t('menu_loading_error_text', 'Vérifiez la connexion puis réessayez dans un instant.'),
            actionLabel: t('menu_empty_refresh', 'Actualiser'),
            action: 'window.syncPublicMenuData && window.syncPublicMenuData()'
        });
        scheduleMenuMotionRefresh();
        return;
    }

    if (!menu.length || !getAvailableSuperCategories().length) {
        container.dataset.state = 'empty';
        container.innerHTML = buildMenuEmptyStateMarkup({
            className: 'is-landing',
            icon: MENU_UI_ICONS.plate,
            eyebrow: t('featured_label', 'Sélection Signature'),
            title: t('menu_empty_title', 'La carte se prépare'),
            text: t('menu_empty_text', 'Les plats apparaitront ici dès qu’ils seront publiés.'),
            actionLabel: t('menu_empty_refresh', 'Actualiser'),
            action: 'window.syncPublicMenuData && window.syncPublicMenuData()'
        });
        scheduleMenuMotionRefresh();
        return;
    }

    container.dataset.state = 'ready';
    scheduleDeferredFeaturedRender(
        menu.filter((item) => item?.featured && item?.available !== false),
        'featuredLanding'
    );
}

function renderFeaturedSlider(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.dataset.state = 'empty';
        container.innerHTML = '';
        scheduleMenuMotionRefresh();
        return;
    }

    container.dataset.state = 'ready';
    const liveStats = getMenuLiveStats();
    container.innerHTML = `
        <div class="featured-header-sexy menu-reveal-observe">
            <div class="featured-header-copy">
                <span class="featured-header-label">${t('featured_label', 'Sélection Signature')}</span>
                <div class="featured-header-meta">
                    <span class="featured-header-stat">${liveStats.items} ${t('menu_items', 'plats')}</span>
                    <span class="featured-header-stat">${liveStats.categories} ${t('categories', 'catégories')}</span>
                    <span class="featured-header-stat">${liveStats.featured} ${t('featured_label', 'signature')}</span>
                    <span class="featured-header-stat">${items.length} ${t('featured_label', 'sélection')}</span>
                </div>
            </div>
        </div>
        <div class="featured-slider">
            ${items.map(item => `
                <div class="featured-card menu-reveal-observe" onclick="openDishPage(${serializeInlineId(item.id)})">
                    <div class="featured-card-glow"></div>
                    <div class="featured-card-badge">${t('featured_label', 'Signature')}</div>
                    <div class="featured-img-wrap">
                        ${imgTag(item, { defer: true })}
                    </div>
                    <div class="featured-info">
                        <div class="featured-name">${window.getLocalizedMenuName(item)}</div>
                        <div class="featured-desc">${window.getLocalizedMenuDescription(item, t('dish_default_desc', 'Une préparation soignée avec les meilleurs ingrédients.'))}</div>
                    <div class="featured-price-row">
                        <div class="featured-price">${window.getItemPrice(item).toFixed(0)} MAD</div>
                        <div class="featured-hint">${t('view_menu', 'Voir le Menu')}</div>
                    </div>
                </div>
                    <button class="featured-add-btn" onclick="event.stopPropagation();handleMenuItemAdd(${serializeInlineId(item.id)})">+</button>
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


// ═══════════════════════ SUPER CATEGORY SHEET ═══════════════════════

function renderSuperCatSheet() {
    const list = document.getElementById('superCatList');
    if (!list) return;
    superCatSheetReady = true;
    const availableSuperCategories = getAvailableSuperCategories();
    list.innerHTML = availableSuperCategories.length
        ? availableSuperCategories.map(sc => `
        <div class="super-cat-row menu-reveal-observe" onclick="selectSuperCategory('${sc.id}')">
            <div class="super-cat-row-left">
                <span class="super-cat-row-emoji">${sc.emoji}</span>
                <div class="super-cat-row-info">
                    <div class="super-cat-row-name">${window.getLocalizedSuperCategoryName(sc, sc.name)}</div>
                    <div class="super-cat-row-desc">${window.getLocalizedSuperCategoryDescription(sc, '')}</div>
                </div>
            </div>
            <span class="super-cat-row-count">${getSuperCategoryItemCount(sc)}</span>
            <span class="super-cat-row-arrow">&rsaquo;</span>
        </div>
    `).join('')
        : buildMenuEmptyStateMarkup({
            className: 'is-sheet',
            icon: MENU_UI_ICONS.plate,
            eyebrow: t('nav_menu', 'Menu'),
            title: t('menu_sheet_empty_title', 'Aucune section disponible'),
            text: t('menu_sheet_empty_text', 'La carte revient très bientôt.'),
            actionLabel: t('modal_close', 'Close'),
            action: 'closeSuperCatSheet()'
        });
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

// ═══════════════════════ SUB CATEGORY GRID ═══════════════════════

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
        menuContent.innerHTML = buildMenuEmptyStateMarkup({
            className: 'is-surface',
            icon: MENU_UI_ICONS.sparkle,
            eyebrow: window.getLocalizedSuperCategoryName(sc, sc.name),
            title: t('menu_category_waiting_title', 'Cette section arrive bientôt'),
            text: t('menu_category_waiting_text', 'Les plats de cette section seront visibles dès qu’ils seront ajoutés.')
        });
    }

    updateBackBtn();
    scheduleMenuFixedLayout();
    scheduleMenuMotionRefresh();
}

// ═══════════════════════ CATEGORY ITEMS ═══════════════════════

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

    updateBackBtn();
    scheduleMenuFixedLayout();
    scheduleMenuMotionRefresh();
}

function rerenderCurrentMenuLanguageView() {
    if (superCatSheetReady) renderSuperCatSheet();
    renderLandingInfo();

    const currentState = navigationStack[navigationStack.length - 1] || '';

    if (!currentState) {
        refreshLandingFeatured();
        return;
    }

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
        if (document.getElementById('cartDrawer')?.classList.contains('open') && typeof window.renderDrawer === 'function') {
            window.renderDrawer();
        }
        if (document.getElementById('historyOverlay')?.classList.contains('open') && typeof window.renderHistory === 'function') {
            window.renderHistory();
        }
        if (document.getElementById('ticketModal')?.classList.contains('open') && typeof window.generateTicket === 'function') {
            window.generateTicket();
        }
        if (document.getElementById('orderPromptOverlay')?.classList.contains('open') && typeof window.refreshOrderPrompt === 'function') {
            window.refreshOrderPrompt();
        }
        const dishPage = document.getElementById('dishPage');
        if (dishPage?.classList.contains('open') && typeof dishPage.__refreshDishPageCopy === 'function') {
            dishPage.__refreshDishPageCopy();
        }
        const galleryOverlay = document.getElementById('galleryOverlay');
        if (galleryOverlay?.style.display === 'flex' && typeof window.refreshGalleryCopy === 'function') {
            window.refreshGalleryCopy();
        }
        if (document.getElementById('sharedOverlay')?.classList.contains('open')) {
            if (currentSharedModal === 'wifi') {
                openWiFiModal();
            } else if (currentSharedModal === 'social') {
                openSocialModal();
            }
        }
    };
}

// ═══════════════════════ RENDERING ═══════════════════════

function renderMenu(categoryFilter = null) {
    const wrap = document.getElementById('menuContent');
    if (!wrap) return;
    applyActiveCategoryBackdrop(categoryFilter);
    menuMarkupReady = true;
    activeCategoryRenderToken += 1;
    activeCategoryRenderState = null;
    disconnectCategoryChunkObserver();

    let categories = categoryFilter
        ? [categoryFilter]
        : [...new Set(menu.filter((item) => item.available !== false).map(m => m.cat))];

    if (categories.length === 1) {
        const cat = categories[0];
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        if (!items.length) {
            wrap.innerHTML = buildMenuEmptyStateMarkup({
                className: 'is-surface',
                icon: catEmojis[cat] || MENU_UI_ICONS.plate,
                eyebrow: window.getLocalizedCategoryName(cat, cat),
                title: t('menu_category_empty_title', 'Aucun plat disponible'),
                text: t('menu_category_empty_text', 'Cette catégorie sera bientôt garnie de nouvelles suggestions.')
            });
            scheduleMenuMotionRefresh();
            return;
        }
        const cachedMarkup = menuCategoryMarkupCache.get(getMenuCategoryCacheKey(cat));
        if (cachedMarkup) {
            wrap.innerHTML = cachedMarkup;
            observeDeferredMenuImages(wrap);
            scheduleMenuMotionRefresh();
            return;
        }

        wrap.innerHTML = buildCategorySectionMarkup(cat, '', items.length);

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
                <h2 class="menu-section-title">
                    <span class="menu-section-title-main">${catEmojis[cat] || MENU_UI_ICONS.plate} ${window.getLocalizedCategoryName(cat, cat)}</span>
                    <span class="menu-section-count">${items.length}</span>
                </h2>
                <div class="menu-grid">
                    ${items.map((item, itemIndex) => buildMenuItemCardMarkup(item, cat, itemIndex)).join('')}
                </div>
            </section>
        `;
    }).join('');

    if (!wrap.innerHTML.trim()) {
        wrap.innerHTML = buildMenuEmptyStateMarkup({
            className: 'is-surface',
            icon: MENU_UI_ICONS.sparkle,
            eyebrow: t('nav_menu', 'Menu'),
            title: t('menu_empty_title', 'La carte se prépare'),
            text: t('menu_empty_text', 'Les plats apparaitront ici dès qu’ils seront publiés.')
        });
    }
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

// ═══════════════════════ DISH PAGE ═══════════════════════

function openDishPage(id) {
    return ensureMenuInteractionsScriptLoaded().then(() => window.openDishPage(id));
}

function closeDishPage() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.closeDishPage());
}

// ═══════════════════════ IMAGE GALLERY ═══════════════════════
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

// ═══════════════════════ SEARCH ═══════════════════════

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

// ═══════════════════════ LANG DROPDOWN ═══════════════════════

function toggleLangDropdown() {
    document.getElementById('langOptions')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#langDropdown')) {
        document.getElementById('langOptions')?.classList.remove('open');
    }
});

// ═══════════════════════ CART ═══════════════════════

window.addToCart = function (id, sizeOrConfig, extrasArg) {
    const item = menu.find(m => sameMenuItemId(m.id, id));
    if (!item) return;

    const selectedSize = typeof sizeOrConfig === 'string'
        ? sizeOrConfig
        : (sizeOrConfig && typeof sizeOrConfig === 'object' ? sizeOrConfig.size || null : null);
    const selectedExtrasInput = Array.isArray(extrasArg)
        ? extrasArg
        : (sizeOrConfig && typeof sizeOrConfig === 'object' ? sizeOrConfig.extras : []);
    const selectedExtras = getSelectedItemExtras(item, selectedExtrasInput);
    const cartId = buildCartItemId(id, selectedSize, selectedExtras);
    const existing = cart.find(c => c.cartId === cartId);
    const correctPrice = getConfiguredItemPrice(item, selectedSize, selectedExtras);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            ...item,
            cartId: cartId,
            selectedSize: selectedSize,
            selectedExtras,
            basePrice: window.getItemPrice(item, selectedSize),
            price: correctPrice,
            qty: 1
        });
    }
    saveCart();
    updateCartUI();
    const sizeLabel = selectedSize ? ` (${selectedSize.charAt(0).toUpperCase()})` : '';
    const extrasLabel = selectedExtras.length
        ? ` + ${selectedExtras.map((extra) => extra.name).join(', ')}`
        : '';
    window.showToast?.(t('toast_item_added', `${MENU_UI_ICONS.sparkle} {item} ajouté !`, {
        item: `${window.getLocalizedMenuName(item)}${sizeLabel}${extrasLabel}`
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
    ['cartBadgeLanding', 'cartBadgeMenu'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            // Keep layout stable: always reserve space, hide only when empty.
            badge.textContent = count;
            badge.style.visibility = count > 0 ? 'visible' : 'hidden';
        }
    });
}

// ═══════════════════════ MODALS ═══════════════════════

function openDrawer() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.openDrawer());
}

function closeAllModals() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.closeAllModals());
}

function renderDrawer() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.renderDrawer());
}

// ═══════════════════════ HISTORY ═══════════════════════

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

// ═══════════════════════ TICKET ═══════════════════════
function generateTicket() {
    return ensureMenuInteractionsScriptLoaded().then(() => window.generateTicket());
}

// ═══════════════════════ LIKES HANDLER ═══════════════════════

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

// ═══════════════════════ GLOBALS ═══════════════════════
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
window.getAvailableItemExtras = getAvailableItemExtras;
window.getSelectedItemExtras = getSelectedItemExtras;
window.getConfiguredItemPrice = getConfiguredItemPrice;
window.handleMenuItemAdd = handleMenuItemAdd;
window.syncPublicMenuData = syncDataFromServer;

window.addEventListener('resize', scheduleMenuFixedLayout);
window.addEventListener('orientationchange', scheduleMenuFixedLayout);
