/**
 * Menu JS - 3-Tier Navigation
 * Landing → Super Category → Sub Category → Items
 */

let menu = window.defaultMenu || [];
let catEmojis = window.defaultCatEmojis || {};
window.catEmojis = catEmojis;
let cart = typeof window.getStoredCart === 'function'
    ? window.getStoredCart()
    : [];
let serviceType = 'onsite';

// Global comparison to detect changes
let lastDataVersion = "";
let syncInFlight = null;
const PUBLIC_DATA_TIMEOUT_MS = 8000;
const PUBLIC_RESUME_SYNC_MIN_GAP_MS = 60000;
let lastPublicSyncStartedAt = 0;

async function fetchPublicDataWithTimeout() {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
        ? setTimeout(() => controller.abort(), PUBLIC_DATA_TIMEOUT_MS)
        : null;

    try {
        return await fetch('/api/data', {
            cache: 'no-store',
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
        if (!res.ok) return;
        const data = await res.json();
        const nextDataVersion = JSON.stringify(data);

        if (nextDataVersion === lastDataVersion) return; // No change

        // Update local variables
        menu = Array.isArray(data.menu) ? data.menu : menu;
        catEmojis = data.catEmojis || catEmojis;
        window.catEmojis = catEmojis;

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
        if (data.promoIds) window.promoIds = data.promoIds;

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
        if (typeof renderMenu === 'function') renderMenu();
        if (typeof renderPromoCarousel === 'function') renderPromoCarousel();
        if (typeof renderLandingInfo === 'function') renderLandingInfo();
        if (typeof renderSuperCatSheet === 'function') renderSuperCatSheet();
        if (typeof renderSuperCatPills === 'function') renderSuperCatPills();

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


let navigationStack = []; // stack: 'landing', 'supercats', 'subcats:NAME', 'items:CAT'
let currentSuperCat = null;
let menuMotionObserver = null;
let menuMotionRefreshFrame = null;

function prefersReducedMenuMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
    syncDataFromServer();
});

function initMenuApp() {
    renderMenu();
    renderSuperCatSheet();
    renderPromoCarousel();
    renderLandingInfo();
    updateCartUI();
    updateHistoryBadge();
    window.updateStatus();
    const savedLang = typeof window.getStoredLanguage === 'function'
        ? window.getStoredLanguage()
        : 'fr';
    window.setLang(savedLang);
    window.applyBranding();
    scheduleMenuMotionRefresh();
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

    renderLandingHours();
    renderLandingSocialLinks();
    scheduleMenuMotionRefresh();
}

function renderLandingHours() {
    const grid = document.getElementById('landingHoursGrid');
    if (!grid) return;

    const hours = Array.isArray(window.restaurantConfig?._hours) && window.restaurantConfig._hours.length > 0
        ? window.restaurantConfig._hours
        : window.defaultHours;

    grid.innerHTML = hours.map((hour) => {
        const translatedDay = window.translations?.[window.currentLang]?.[hour.i18n] || hour.day;
        return `
            <div class="hour-row">
                <span data-i18n="${hour.i18n}">${translatedDay}</span>
                <span>${hour.open} – ${hour.close}</span>
            </div>
        `;
    }).join('');
}

function renderLandingSocialLinks() {
    const container = document.getElementById('menuLandingSocialLinks');
    if (!container) return;

    const links = ['<a href="index.html" class="social-icon-link">🏠</a>'];
    const socials = { ...(window.restaurantConfig?.socials || {}) };
    socials.facebook = window.getSafeExternalUrl(socials.facebook);
    socials.instagram = window.getSafeExternalUrl(socials.instagram);
    socials.tiktok = window.getSafeExternalUrl(socials.tiktok);
    socials.whatsapp = window.getWhatsAppNumber();

    if (socials.facebook) {
        links.push(`<a href="${socials.facebook}" target="_blank" class="social-icon-link">📘</a>`);
    }
    if (socials.instagram) {
        links.push(`<a href="${socials.instagram}" target="_blank" class="social-icon-link">📸</a>`);
    }
    if (socials.tiktok) {
        links.push(`<a href="${socials.tiktok}" target="_blank" class="social-icon-link">🎵</a>`);
    }
    if (socials.whatsapp) {
        links.push(`<a href="https://wa.me/${socials.whatsapp}" target="_blank" class="social-icon-link">📞</a>`);
    }

    if (links.length === 1) {
        const emptyText = t('social_empty', 'No links configured yet.');
        links.push(`<span class="social-links-empty">${emptyText}</span>`);
    }

    container.innerHTML = links.join('');
}

function openWiFiModal() {
    const config = window.restaurantConfig;
    const wifiTitle = t('wifi_connect_title', 'Connect to WiFi');
    const networkLabel = t('wifi_network_label', 'Network');
    const closeLabel = t('modal_close', 'CLOSE');
    const content = `
        <div class="modal-body menu-modal-body is-centered">
            <div class="menu-modal-icon">📶</div>
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
        config.socials.instagram ? `<a href="${config.socials.instagram}" target="_blank" class="social-item"><span class="social-item-icon">📸</span> <strong>${t('social_instagram', 'Instagram')}</strong></a>` : '',
        config.socials.facebook ? `<a href="${config.socials.facebook}" target="_blank" class="social-item"><span class="social-item-icon">📘</span> <strong>${t('social_facebook', 'Facebook')}</strong></a>` : '',
        config.socials.tiktok ? `<a href="${config.socials.tiktok}" target="_blank" class="social-item"><span class="social-item-icon">🎵</span> <strong>${t('social_tiktok', 'TikTok')}</strong></a>` : '',
        config.socials.tripadvisor ? `<a href="${config.socials.tripadvisor}" target="_blank" class="social-item"><span class="social-item-icon">⭐</span> <strong>${t('social_tripadvisor', 'TripAdvisor')}</strong></a>` : '',
        whatsappNumber ? `<a href="https://wa.me/${whatsappNumber}" target="_blank" class="social-item"><span class="social-item-icon">📞</span> <strong>${t('social_whatsapp', 'WhatsApp')}</strong></a>` : ''
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

let promoAutoSlideInterval = null;

function renderPromoCarousel() {
    const container = document.getElementById('promoCarousel');
    if (!container) return;

    if (promoAutoSlideInterval) clearInterval(promoAutoSlideInterval);

    const promoIds = window.getPromoIds();
    const promoItems = menu.filter(m => promoIds.includes(m.id));

    if (promoItems.length === 0) {
        container.innerHTML = `<div class="promo-empty-msg">${t('promo_empty', '🔥 Découvrez nos promos du jour bientôt !')}</div>`;
        scheduleMenuMotionRefresh();
        return;
    }

    container.innerHTML = promoItems.map(item => {
        const discountedPrice = window.getItemPrice(item);
        const serializedId = serializeInlineId(item.id);
        return `
            <div class="promo-card-vibrant menu-reveal-observe" onclick="openDishPage(${serializedId})">
                <span class="promo-tag-glow">${t('promo_offer_badge', 'OFFRE')}</span>
                <span class="promo-discount-badge">-20%</span>
                <div class="promo-visual-vibrant" onclick="event.stopPropagation(); openGallery(menu.filter(m => window.getPromoIds().includes(m.id)), menu.filter(m => window.getPromoIds().includes(m.id)).findIndex(p => String(p.id) === ${serializedId}))">
                    ${imgTag(item)}
                    <div class="promo-glow-vibrant"></div>
                </div>
                <div class="promo-info-vibrant">
                    <div class="promo-name-vibrant">${window.getLocalizedMenuName(item)}</div>
                    <div class="promo-price-vibrant">
                        <span class="price-new">${discountedPrice.toFixed(0)} MAD</span>
                        <span class="price-old">${item.price.toFixed(0)} MAD</span>
                    </div>
                </div>
                <button class="promo-add-vibrant" onclick="event.stopPropagation();addToCart(${serializedId})">
                    ${t('promo_add_short', 'AJOUTER')}
                </button>
            </div>
        `;
    }).join('');

    startPromoAutoSlide(container);
    scheduleMenuMotionRefresh();
}

function startPromoAutoSlide(container) {
    if (!container) return;

    let isPaused = false;
    container.onmouseenter = () => isPaused = true;
    container.onmouseleave = () => isPaused = false;
    container.ontouchstart = () => isPaused = true;
    container.ontouchend = () => isPaused = false;

    promoAutoSlideInterval = setInterval(() => {
        if (isPaused) return;

        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 5) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }
    }, 2000); // Faster slide (2 seconds)
}


// ═══════════════════════ LANDING & VIEWS ═══════════════════════

function showLanding() {
    // Close ALL overlays and modals first to prevent blank screen
    ['superCatOverlay', 'superCatSheet', 'sharedOverlay', 'cartDrawer',
        'ticketModal', 'dishPage', 'historyOverlay'].forEach(id => {
            document.getElementById(id)?.classList.remove('open');
        });
    document.body.style.overflow = '';

    // Now show landing and hide menu view
    document.getElementById('landingView').style.display = 'block';
    document.getElementById('menuNavigationView').style.display = 'none';
    navigationStack = [];
    updateBackBtn();
    scheduleMenuMotionRefresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMenuNavigationView(title) {
    document.getElementById('landingView').style.display = 'none';
    document.getElementById('menuNavigationView').style.display = 'block';
    document.getElementById('menuNavTitle').textContent = title || window.getTranslation('nav_menu', 'Menu');
    updateBackBtn();
    scheduleMenuMotionRefresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <span>${t('featured_best', 'Nos Coups de Coeur')}</span> ✨
            </h2>
        </div>
        <div class="featured-slider">
            ${items.map(item => `
                <div class="featured-card menu-reveal-observe" onclick="openDishPage(${serializeInlineId(item.id)})">
                    <div class="featured-img-wrap">
                        ${imgTag(item)}
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
    scheduleMenuMotionRefresh();
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

function renderSuperCatPills() {
    const container = document.getElementById('superCatPills');
    if (!container) return;
    container.innerHTML = getSuperCategories().map((sc, i) => `
        <button class="super-cat-pill ${i === 0 ? 'active' : ''}" onclick="openSuperCatSheet()">
            ${sc.emoji} ${window.getLocalizedSuperCategoryName(sc, sc.name)}
        </button>
    `).join('');
}

function renderSuperCatSheet() {
    const list = document.getElementById('superCatList');
    if (!list) return;
    list.innerHTML = getSuperCategories().map(sc => `
        <div class="super-cat-row menu-reveal-observe" onclick="selectSuperCategory('${sc.id}')">
            <div class="super-cat-row-left">
                <span class="super-cat-row-emoji">${sc.emoji}</span>
                <div class="super-cat-row-info">
                    <div class="super-cat-row-name">${window.getLocalizedSuperCategoryName(sc, sc.name)}</div>
                    <div class="super-cat-row-desc">${window.getLocalizedSuperCategoryDescription(sc, sc.desc)}</div>
                </div>
            </div>
            <span class="super-cat-row-arrow">›</span>
        </div>
    `).join('');
    scheduleMenuMotionRefresh();
}

function openSuperCatSheet() {
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
    const subCatTitle = document.getElementById('subCatTitle');
    const menuContent = document.getElementById('menuContent');
    const searchBox = document.getElementById('menuSearchBox');

    if (subCatTitle) subCatTitle.textContent = window.getLocalizedSuperCategoryName(sc, sc.name);

    navWrapper.style.display = 'block';
    menuContent.style.display = 'none';
    if (searchBox) searchBox.style.display = 'none';

    // Render category grid for this super-category
    const catNav = document.getElementById('catNavScroll');
    const currentCategories = [...new Set(menu.map(m => m.cat))];
    const filteredCats = sc.cats.filter(c => currentCategories.includes(c));
    catNav.innerHTML = filteredCats.map(c => `
        <button class="menu-cat-btn menu-reveal-observe" data-cat="${c}" onclick="showCategoryItems('${c}')">
            <span class="cat-emoji">${catEmojis[c] || '🍴'}</span>
            <span class="cat-name">${window.getLocalizedCategoryName(c, c)}</span>
        </button>
    `).join('');

    // Render global featured items for ALL categories in this super-category
    const featuredItems = menu.filter(m => sc.cats.includes(m.cat) && m.featured);
    renderFeaturedSlider(featuredItems, 'featuredGlobal');

    updateBackBtn();
    scheduleMenuMotionRefresh();
}

// ═══════════════════════ CATEGORY ITEMS ═══════════════════════

function showCategoryItems(cat) {
    navigationStack.push(`items:${cat}`);

    showMenuNavigationView(window.getLocalizedCategoryName(cat, cat));

    const navWrapper = document.getElementById('catNavWrapper');
    const menuContent = document.getElementById('menuContent');
    const searchBox = document.getElementById('menuSearchBox');

    navWrapper.style.display = 'none';
    menuContent.style.display = 'block';
    if (searchBox) searchBox.style.display = 'block';

    // Show only the selected category's sections
    document.querySelectorAll('.menu-section').forEach(s => {
        const sId = s.id.replace('cat-', '').replace(/-/g, ' ');
        s.style.display = sId === cat ? 'block' : 'none';
    });

    // Update global featured slider for specific category
    const featuredItems = menu.filter(m => m.cat === cat && m.featured && m.available !== false);
    renderFeaturedSlider(featuredItems, 'featuredGlobal');

    updateBackBtn();
    scheduleMenuMotionRefresh();
}

// ═══════════════════════ RENDERING ═══════════════════════

function renderMenu() {
    const wrap = document.getElementById('menuContent');
    if (!wrap) return;

    let categories = [...new Set(menu.map(m => m.cat))];

    wrap.innerHTML = categories.map(cat => {
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        return `
            <section class="menu-section menu-reveal-observe" id="cat-${cat.replace(/\s/g, '-')}">
                <h2 class="menu-section-title">${catEmojis[cat] || '🍴'} ${window.getLocalizedCategoryName(cat, cat)}</h2>
                <div class="menu-grid">
                    ${items.map((item, itemIndex) => `
                        <div class="menu-item-card menu-reveal-observe" onclick="openDishPage(${serializeInlineId(item.id)})">
                             <button class="love-btn ${window.getLikeCount(item.id) > 0 ? 'loved text-pop' : ''}" 
                                     onclick="event.stopPropagation(); window.handleToggleLike(${serializeInlineId(item.id)}, this)">
                                ❤️<span class="love-count">${window.getLikeCount(item.id)}</span>
                             </button>
                            <div class="menu-item-info">
                                <div class="menu-item-name">${window.getLocalizedMenuName(item)} ${window.isItemInPromo(item.id) ? `<span class="promo-tag-small">${t('promo_small_badge', 'PROMO')}</span>` : ''}</div>
                                <div class="menu-item-desc">${window.getLocalizedMenuDescription(item)}</div>
                                <div class="menu-item-price">
                                    ${item.hasSizes
                ? `<span style="font-size:0.7em; opacity:0.7;">${t('price_from', 'À partir de')}</span> ${window.getItemPrice(item, 'small').toFixed(0)} MAD`
                : (window.isItemInPromo(item.id)
                    ? `<span class="price-discounted">${window.getItemPrice(item).toFixed(0)} MAD</span> <span class="price-original-item">${item.price.toFixed(0)} MAD</span>`
                    : `${item.price.toFixed(0)} MAD`)}
                                </div>
                            </div>
                            <div class="menu-item-img" onclick="event.stopPropagation(); openGallery(menu.filter(m => m.cat === ${serializeInlineId(cat)}), ${itemIndex})">
                                ${imgTag(item)}
                            </div>
                            <button class="menu-item-add" onclick="event.stopPropagation();addToCart(${serializeInlineId(item.id)})">+</button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }).join('');
    scheduleMenuMotionRefresh();
}

function imgTag(item) {
    const src = (item.images && item.images.length > 0) ? item.images[0] : item.img;
    const safeFallbackEmoji = catEmojis[item.cat] || String.fromCodePoint(0x1F354);
    if (src) return `<img src="${src}" alt="${window.getLocalizedMenuName(item)}" loading="lazy" onerror="this.onerror=null; this.replaceWith(Object.assign(document.createElement('span'), { className: 'emoji-placeholder', textContent: ${JSON.stringify(safeFallbackEmoji)} }))">`;
    return `<span class="emoji-placeholder">${safeFallbackEmoji}</span>`;
    const fallbackEmoji = catEmojis[item.cat] || 'ðŸ´';
    if (src) return `<img src="${src}" alt="${window.getLocalizedMenuName(item)}" loading="lazy" onerror="this.onerror=null; this.replaceWith(Object.assign(document.createElement('span'), { className: 'emoji-placeholder', textContent: ${JSON.stringify(catEmojis[item.cat] || 'ðŸ´')} }))">`;
    return `<span class="emoji-placeholder">${catEmojis[item.cat] || '🍴'}</span>`;
}

// ═══════════════════════ DISH PAGE ═══════════════════════

function openDishPage(id) {
    const item = menu.find(m => sameMenuItemId(m.id, id));
    if (!item) return;

    const page = document.getElementById('dishPage');
    const imgEl = document.getElementById('dishPageImg');
    const nameEl = document.getElementById('dishPageName');
    const priceEl = document.getElementById('dishPagePrice');
    const descEl = document.getElementById('dishPageDesc');
    const addBtn = document.getElementById('dishPageAddBtn');
    page.dataset.itemId = String(item.id);

    // Size Selector Logic
    let selectedSize = item.hasSizes ? 'small' : null;
    const updateSizePrice = () => {
        if (priceEl) {
            const currentPrice = window.getItemPrice(item, selectedSize);
            const originalPrice = selectedSize ? (item.sizes[selectedSize] || item.price) : item.price;
            if (window.isItemInPromo(item.id)) {
                priceEl.innerHTML = `<span style="color:#ffd700; font-weight:800;">${currentPrice.toFixed(0)} MAD</span> <span style="text-decoration:line-through; font-size:0.8em; opacity:0.6;">${originalPrice.toFixed(0)} MAD</span>`;
            } else {
                priceEl.textContent = `${currentPrice.toFixed(0)} MAD`;
            }
        }
    };

    const sizeSelectorHtml = item.hasSizes ? `
        <div class="size-selector-wrap" style="margin: 20px 0; display: flex; gap: 10px; justify-content: center;">
            ${['small', 'medium', 'large'].map(s => {
        const p = item.sizes[s];
        if (!p) return '';
        const labels = { small: 'S', medium: 'M', large: 'L' };
        return `
                    <button class="size-btn ${selectedSize === s ? 'active' : ''}" 
                            onclick="window.selectDishSize('${s}')"
                            style="padding: 10px 20px; border-radius: 50px; border: 2px solid ${selectedSize === s ? 'var(--primary)' : '#eee'}; background: ${selectedSize === s ? 'var(--primary)' : '#fff'}; color: ${selectedSize === s ? '#fff' : '#333'}; cursor: pointer; font-weight: 700; transition: all 0.2s;">
                        ${labels[s]} - ${p} MAD
                    </button>
                `;
    }).join('')}
        </div>
    ` : '';

    // Add global helper for size selection if not exists
    window.selectDishSize = (size) => {
        selectedSize = size;
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.innerText.startsWith(size.charAt(0).toUpperCase()));
            // Simpler way: update the background/border inline or via another render
            btn.style.background = btn.innerText.startsWith(size.charAt(0).toUpperCase()) ? 'var(--primary)' : '#fff';
            btn.style.color = btn.innerText.startsWith(size.charAt(0).toUpperCase()) ? '#fff' : '#333';
            btn.style.borderColor = btn.innerText.startsWith(size.charAt(0).toUpperCase()) ? 'var(--primary)' : '#eee';
        });
        updateSizePrice();
    };

    const descContainer = descEl.parentElement;
    // Check if selector already exists and remove
    const oldSelector = descContainer.querySelector('.size-selector-wrap');
    if (oldSelector) oldSelector.remove();
    if (sizeSelectorHtml) {
        descEl.insertAdjacentHTML('afterend', sizeSelectorHtml);
    }

    const imgSrc = (item.images && item.images.length > 0) ? item.images[0] : item.img;

    if (imgSrc) {
        window.setSafeImageSource(imgEl, imgSrc, {
            onMissing: () => {
                imgEl.removeAttribute('src');
                imgEl.style.display = 'none';
            },
            displayValue: 'block'
        });
        imgEl.onclick = () => openGallery([item], 0);
        imgEl.style.cursor = 'zoom-in';
    } else {
        imgEl.removeAttribute('src');
        imgEl.style.display = 'none';
        imgEl.onclick = null;
    }

    if (nameEl) nameEl.textContent = window.getLocalizedMenuName(item) + (window.isItemInPromo(item.id) ? t('dish_promo_suffix', ' (PROMO)') : '');
    updateSizePrice();
    if (descEl) descEl.textContent = window.getLocalizedMenuDescription(item, t('dish_default_desc', 'Une préparation soignée avec les meilleurs ingrédients.'));

    if (addBtn) {
        addBtn.onclick = () => { addToCart(item.id, selectedSize); closeDishPage(); };
    }

    // Love button in page
    const loveContainer = document.getElementById('dishPageLoveContainer');
    if (loveContainer) {
        loveContainer.innerHTML = `
            <button class="love-btn ${window.getLikeCount(item.id) > 0 ? 'loved' : ''}" 
                    style="position:static; width:40px; height:40px; font-size:1.2rem;"
                    onclick="window.handleToggleLike(${serializeInlineId(item.id)}, this)">
                ❤️<span class="love-count" style="font-size:0.8rem;">${window.getLikeCount(item.id)}</span>
            </button>
        `;
    }

    page.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDishPage() {
    document.getElementById('dishPage').classList.remove('open');
    document.body.style.overflow = '';
}

// ═══════════════════════ IMAGE GALLERY ═══════════════════════
let galleryItems = [];
let currentGalleryIdx = 0;

function openGallery(items, startIndex = 0) {
    galleryItems = items.filter(it => (it.images && it.images.length > 0) || it.img); // Items with images
    if (galleryItems.length === 0) return;

    currentGalleryIdx = startIndex;
    const overlay = document.getElementById('galleryOverlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateGalleryView();
}

function closeGallery() {
    document.getElementById('galleryOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

function updateGalleryView() {
    const item = galleryItems[currentGalleryIdx];
    const img = document.getElementById('galleryImg');
    const title = document.getElementById('galleryTitle');
    const count = document.getElementById('galleryCount');

    // Animation reset
    img.classList.remove('gallery-flip');
    void img.offsetWidth; // trigger reflow
    img.classList.add('gallery-flip');

    const galleryImgSrc = (item.images && item.images.length > 0) ? item.images[0] : item.img;
    window.setSafeImageSource(img, galleryImgSrc, {
        onMissing: () => {
            closeGallery();
        },
        displayValue: 'block'
    });
    title.textContent = window.getLocalizedMenuName(item);
    count.textContent = `${currentGalleryIdx + 1} / ${galleryItems.length}`;
}

function nextGalleryImage() {
    currentGalleryIdx = (currentGalleryIdx + 1) % galleryItems.length;
    updateGalleryView();
}

function prevGalleryImage() {
    currentGalleryIdx = (currentGalleryIdx - 1 + galleryItems.length) % galleryItems.length;
    updateGalleryView();
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
    window.showToast?.(t('toast_item_added', '✅ {item} ajouté !', {
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
    const hubBtn = document.getElementById('cartHubBtn');
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((s, c) => s + c.qty, 0);
    if (count > 0) { if (hubBtn) hubBtn.style.display = 'flex'; if (badge) badge.textContent = count; }
    else { if (hubBtn) hubBtn.style.display = 'none'; }
}

// ═══════════════════════ MODALS ═══════════════════════

function openDrawer() {
    document.getElementById('sharedOverlay').classList.add('open');
    document.getElementById('cartDrawer').classList.add('open');
    renderDrawer();
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    ['sharedOverlay', 'cartDrawer', 'ticketModal', 'dishPage', 'historyOverlay', 'superCatSheet', 'superCatOverlay'].forEach(id => {
        document.getElementById(id)?.classList.remove('open');
    });
    document.body.style.overflow = '';
}

function renderDrawer() {
    const total = cart.reduce((s, c) => s + (c.price * c.qty), 0);
    const content = document.getElementById('drawerContent');
    if (!content) return;
    const restaurantName = typeof window.getRestaurantDisplayName === 'function'
        ? window.getRestaurantDisplayName()
        : 'Restaurant';
    const serviceOptions = [
        { key: 'onsite', icon: '🍽️', label: t('service_onsite', 'Sur place') },
        { key: 'takeaway', icon: '🛍️', label: t('service_takeaway', 'À Emporter') },
        { key: 'delivery', icon: '🛵', label: t('service_delivery', 'Livraison') }
    ];

    content.innerHTML = `
        <div class="cart-drawer-body">
            <div class="cart-drawer-header">
                <div class="cart-drawer-title">
                    ${restaurantName}
                </div>
                <div class="cart-drawer-meta">
                    <button onclick="if(confirm('${t('cart_clear_confirm', 'Vider le panier ?')}')) { cart=[]; saveCart(); updateCartUI(); closeAllModals(); }" class="cart-drawer-clear">${t('cart_clear', 'Vider')}</button>
                    <div class="cart-drawer-count">${t('cart_items_count', '{count} item(s)', { count: cart.length })}</div>
                </div>
            </div>
            <div class="cart-items-list">
                ${cart.map(item => `
                    <div class="cart-item-card">
                        <div class="cart-item-main">
                            <div class="cart-item-name">
                                ${window.getLocalizedMenuName(item)} ${item.selectedSize ? `<span class="cart-item-size">(${item.selectedSize.charAt(0).toUpperCase()})</span>` : ''}
                            </div>
                            <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} MAD</div>
                        </div>
                        <div class="cart-item-controls">
                            <button onclick="removeFromCart('${item.cartId}')" class="cart-qty-btn is-minus">-</button>
                            <span class="cart-item-qty">${item.qty}</span>
                            <button onclick="addToCart(${serializeInlineId(item.id)}, '${item.selectedSize || ''}');renderDrawer();" class="cart-qty-btn is-plus">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-service-grid">
                ${serviceOptions.map((option) => `
                    <button class="cart-service-btn${serviceType === option.key ? ' is-active' : ''}" onclick="serviceType='${option.key}'; renderDrawer()">
                        <span class="cart-service-icon">${option.icon}</span>
                        <span class="cart-service-label">${option.label}</span>
                    </button>
                `).join('')}
            </div>
            ${serviceType === 'delivery' ? `
            <div class="cart-delivery-block">
                <label class="cart-delivery-label">${t('cart_delivery_label', '📍 Adresse de livraison')}</label>
                <textarea id="deliveryAddress" rows="2" placeholder="${t('cart_delivery_placeholder', 'Ex : Appartement 12, résidence, quartier...')}" oninput="window.currentDeliveryAddress = this.value" class="cart-delivery-input">${window.currentDeliveryAddress || ''}</textarea>
            </div>
            ` : ''}
            <div class="cart-total-card">
                <div class="cart-total-row">
                    <span>${t('cart_total_label', 'Total')}</span><span>${total.toFixed(2)} MAD</span>
                </div>
            </div>
            <button onclick="generateTicket()" class="cart-confirm-btn">
                ${t('cart_confirm_order', 'CONFIRMER MA COMMANDE')}
            </button>
        </div>
    `;

    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
}

// ═══════════════════════ HISTORY ═══════════════════════

function openHistory() {
    renderHistory();
    document.getElementById('historyOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeHistory() {
    document.getElementById('historyOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

function renderHistory() {
    const history = typeof window.getStoredHistory === 'function'
        ? window.getStoredHistory()
        : [];
    const container = document.getElementById('historyContent');
    if (!container) return;
    container.innerHTML = history.length === 0
        ? `<p class="history-empty">${t('history_empty', 'Aucune commande récente.')}</p>`
        : history.map((ticketHtml, i) => `
            <div class="history-ticket history-ticket-wrap">
                ${ticketHtml}
                <button onclick="deleteHistoryItem(${i})" class="history-delete-btn" title="${t('history_delete_title', 'Supprimer')}">🗑️</button>
            </div>
        `).join('');
}

function deleteHistoryItem(index) {
    if (!confirm(t('history_delete_confirm', 'Supprimer ce ticket de l\'historique ?'))) return;
    let h = typeof window.getStoredHistory === 'function'
        ? window.getStoredHistory()
        : [];
    h.splice(index, 1);
    if (typeof window.setStoredHistory === 'function') {
        window.setStoredHistory(h);
    }
    renderHistory();
    updateHistoryBadge();
}

function saveToHistory(text) {
    let h = typeof window.getStoredHistory === 'function'
        ? window.getStoredHistory()
        : [];
    h.unshift(text); if (h.length > 3) h = h.slice(0, 3);
    if (typeof window.setStoredHistory === 'function') {
        window.setStoredHistory(h);
    }
    updateHistoryBadge();
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
    if (serviceType === 'delivery' && (!window.currentDeliveryAddress || window.currentDeliveryAddress.trim() === '')) {
        alert(t('ticket_delivery_required', 'Veuillez saisir votre adresse de livraison.'));
        return;
    }
    const total = cart.reduce((s, c) => s + (c.price * c.qty), 0);
    const now = new Date();
    const orderNo = Math.floor(1000 + Math.random() * 9000);
    const ticketModal = document.getElementById('ticketModal');
    const ticketContent = document.getElementById('ticketContent');
    const restaurantName = typeof window.getRestaurantDisplayName === 'function'
        ? window.getRestaurantDisplayName()
        : 'Restaurant';
    const restaurantAddress = typeof window.getRestaurantAddress === 'function'
        ? window.getRestaurantAddress()
        : '';

    const serviceLabels = {
        onsite: t('service_onsite', 'Sur place'),
        takeaway: t('service_takeaway', 'À emporter'),
        delivery: t('service_delivery', 'Livraison')
    };
    const serviceLabel = serviceLabels[serviceType];

    ticketContent.innerHTML = `
        <div class="ticket-content">
            <button onclick="closeAllModals()" class="ticket-close-btn">✕</button>
            <div class="ticket-brand">
                <div class="ticket-brand-name">${restaurantName}</div>
                <div class="ticket-brand-address">${restaurantAddress}</div>
            </div>
            <div class="ticket-summary">
                <div class="ticket-number">${t('ticket_number_prefix', 'TICKET')} #${orderNo}</div>
                <div class="ticket-datetime">${now.toLocaleDateString()} — ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="ticket-service">${t('ticket_type_label', 'Type')}: ${serviceLabel}</div>
                ${serviceType === 'delivery' ? `<div class="ticket-delivery-address">📍 ${window.currentDeliveryAddress}</div>` : ''}
            </div>
            <div class="ticket-items">
                ${cart.map(item => `
                    <div class="ticket-item-row">
                        <div class="ticket-item-name"><strong class="ticket-item-qty">${item.qty} ×</strong> ${window.getLocalizedMenuName(item)}</div>
                        <div class="ticket-item-price">${(item.price * item.qty).toFixed(0)} <span class="ticket-item-currency">dhs</span></div>
                    </div>
                `).join('')}
            </div>
            <div class="ticket-total-wrap">
                <div class="ticket-total-box">
                    ${t('ticket_total_prefix', 'TOTAL :')} ${total.toFixed(0)} dhs
                </div>
            </div>
            
            ${serviceType === 'delivery' ? `
                <div class="ticket-actions-grid">
                    <button onclick="document.getElementById('ticketModal').classList.remove('open'); document.getElementById('cartDrawer').classList.add('open');"
                            class="ticket-action-btn is-outline">
                        ${t('ticket_edit', 'MODIFIER')}
                    </button>
                    <button onclick="sendOrderViaWhatsApp('${orderNo}', ${total.toFixed(2)}, '${serviceLabel}')"
                            class="ticket-action-btn is-primary">
                        ${t('ticket_order', 'COMMANDER')}
                    </button>
                </div>
            ` : `
                <div id="ticketActions_${orderNo}" class="ticket-actions-single">
                    <button onclick="finalizeOrderSilent('${orderNo}', ${total.toFixed(2)}, '${serviceLabel}', this)"
                            class="ticket-action-btn is-dark">
                        ${t('ticket_validate', 'VALIDER LA COMMANDE')}
                    </button>
                    <div class="ticket-helper">${t('ticket_helper', 'Cliquez pour enregistrer et montrer au serveur')}</div>
                </div>
            `}
        </div>
    `;

    document.getElementById('cartDrawer').classList.remove('open');
    ticketModal.classList.add('open');
}

function finalizeOrder(orderNo, total, serviceLabel) {
    const now = new Date();
    const historyText = `${t('ticket_number_prefix', 'TICKET')} #${orderNo}\n${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n${t('ticket_type_label', 'Type')}: ${serviceLabel}\n${serviceType === 'delivery' ? `${t('ticket_addr', 'Adresse')}: ${window.currentDeliveryAddress.trim()}\n` : ''}${t('ticket_total', 'TOTAL')}: ${total.toFixed(0)} MAD\n---\n${cart.map(i => i.qty + 'x ' + window.getLocalizedMenuName(i)).join('\n')}`;
    saveToHistory(historyText);

    // Clear and return home
    cart = [];
    window.currentDeliveryAddress = '';
    saveCart();
    updateCartUI();
    closeAllModals();
    showLanding();
}

/** 
 * Finalize but keep receipt on screen for server to see.
 * Changes the button to a 'Close/Finish' button once clicked.
 */
function finalizeOrderSilent(orderNo, total, serviceLabel, btn) {
    const now = new Date();
    const historyText = `${t('ticket_number_prefix', 'TICKET')} #${orderNo}\n${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n${t('ticket_type_label', 'Type')}: ${serviceLabel}\n${t('ticket_total', 'TOTAL')}: ${total.toFixed(0)} MAD\n---\n${cart.map(i => i.qty + 'x ' + window.getLocalizedMenuName(i)).join('\n')}`;
    saveToHistory(historyText);

    // Clear background data
    cart = [];
    window.currentDeliveryAddress = '';
    saveCart();
    updateCartUI();

    // Update the button UI to allow exit
    const parent = btn.parentElement;
    parent.innerHTML = `
        <button onclick="closeAllModals(); showLanding();"
                class="ticket-action-btn is-success">
            ${t('ticket_saved', 'COMMANDE ENREGISTRÉE ✔')}
        </button>
        <div class="ticket-helper is-success">${t('ticket_saved_help', 'Ticket validé ! Cliquez pour fermer.')}</div>
    `;
}

function sendOrderViaWhatsApp(orderNo, total, serviceLabel) {
    // WhatsApp formatting
    let waText = `*${t('wa_new_order_title', 'NOUVELLE COMMANDE – {restaurant}', { restaurant: `#${orderNo}` })}*\n`;
    waText += `${t('ticket_type_label', 'Type')}: ${serviceLabel}\n`;
    if (serviceType === 'delivery') {
        waText += `📍 ${t('ticket_addr', 'Adresse')}: ${window.currentDeliveryAddress.trim()}\n`;
    }
    waText += `---------------------------\n`;
    cart.forEach(item => {
        waText += `${item.qty}x ${window.getLocalizedMenuName(item)} - ${(item.price * item.qty).toFixed(0)} dhs\n`;
    });
    waText += `---------------------------\n`;
    waText += `*${t('wa_total_label', 'TOTAL')}: ${total.toFixed(0)} dhs*\n`;

    const phone = window.getWhatsAppNumber();
    if (!phone) {
        window.showToast(t('social_empty', 'Aucun lien configuré.'));
        return;
    }

    // Save history then clear and send
    finalizeOrder(orderNo, total, serviceLabel);

    // Open WhatsApp
    window.openSafeExternalUrl(`https://wa.me/${phone}?text=${encodeURIComponent(waText)}`, '_blank');
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

function scrollPromo(dir) {
    const container = document.getElementById('promoCarousel');
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8 * dir;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}
window.scrollPromo = scrollPromo;
