// WhatsApp management moved to socialLinks (Persistence Layer)
// const WHATSAPP_NUMBER = '212626081745';

// Default Data — Full Menu from Restaurant Board
// Data and Translations are now loaded from shared.js


// Persistence Layer
const defaultWifiData = {
    ssid: window.defaultConfig?.wifi?.name || '',
    pass: window.defaultConfig?.wifi?.code || ''
};
const defaultSocialLinks = { ...(window.defaultConfig?.socials || {}), whatsapp: window.defaultConfig?.socials?.whatsapp || '' };
const defaultGuestExperience = {
    paymentMethods: Array.isArray(window.defaultConfig?.guestExperience?.paymentMethods)
        ? [...window.defaultConfig.guestExperience.paymentMethods]
        : ['cash', 'tpe'],
    facilities: Array.isArray(window.defaultConfig?.guestExperience?.facilities)
        ? [...window.defaultConfig.guestExperience.facilities]
        : ['wifi']
};
const defaultSectionVisibility = {
    ...(window.defaultConfig?.sectionVisibility || {
        about: true,
        payments: true,
        events: true,
        gallery: true,
        hours: true,
        contact: true
    })
};
const defaultSectionOrder = Array.isArray(window.defaultConfig?.sectionOrder)
    ? [...window.defaultConfig.sectionOrder]
    : ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];

let menu = defaultMenu.map(item => ({ ...item, images: Array.isArray(item.images) ? item.images : [], img: item.img || '' }));
let catEmojis = { ...defaultCatEmojis };
let categoryImages = { ...(window.defaultCategoryImages || {}) };
window.categoryImages = categoryImages;
let wifiData = { ...defaultWifiData };
let promoId = null;
let homePromoItem = null;
let homeFeaturedItems = [];
let socialLinks = { ...defaultSocialLinks };
let guestExperience = { ...defaultGuestExperience };
let sectionVisibility = { ...defaultSectionVisibility };
let sectionOrder = [...defaultSectionOrder];
let currentSlide = 0;
const PUBLIC_DATA_TIMEOUT_MS = 8000;
const MENU_SNAPSHOT_STORAGE_KEY = 'foody_public_menu_snapshot_v1';
let homepageSyncInFlight = null;
let homepageInitialized = false;
let homepageSliderStarted = false;
let lastPublicDataVersion = '';
let homepageDeferredRenderHandle = null;
let homepageDeferredSectionsReady = false;
let homepageDeferredIntentArmed = false;
let homepageDeferredFallbackTimer = null;
let eventBookingScriptPromise = null;
let homepageExtrasScriptPromise = null;

function getVersionedPublicAsset(pathname) {
    const version = typeof window.__PUBLIC_BUILD_VERSION === 'string' ? window.__PUBLIC_BUILD_VERSION.trim() : '';
    if (!version) return pathname;
    return `${pathname}?v=${encodeURIComponent(version)}`;
}

function scheduleLowPriorityTask(callback, timeout = 1200) {
    if (typeof window.requestIdleCallback === 'function') {
        return window.requestIdleCallback(callback, { timeout });
    }
    return window.setTimeout(callback, 120);
}

function cancelLowPriorityTask(handle) {
    if (!handle) return;
    if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(handle);
        return;
    }
    clearTimeout(handle);
}

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

function t(key, fallback, vars) {
    if (typeof window.formatTranslation === 'function') {
        return window.formatTranslation(key, fallback, vars);
    }
    if (typeof window.getTranslation === 'function') {
        return window.getTranslation(key, fallback);
    }
    return fallback;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeMenuItem(item) {
    const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    return {
        ...item,
        images,
        img: item.img || images[0] || ''
    };
}

function applySiteData(data) {
    if (Array.isArray(data?.menu)) {
        menu = data.menu.map(normalizeMenuItem);
    }
    if (data?.catEmojis && typeof data.catEmojis === 'object') {
        catEmojis = data.catEmojis;
    }
    if (data?.categoryImages && typeof data.categoryImages === 'object') {
        categoryImages = data.categoryImages;
        window.categoryImages = categoryImages;
    }
    wifiData = { ...defaultWifiData, ...(data?.wifi && typeof data.wifi === 'object' ? data.wifi : {}) };
    socialLinks = { ...defaultSocialLinks, ...(data?.social && typeof data.social === 'object' ? data.social : {}) };
    guestExperience = {
        paymentMethods: Array.isArray(data?.guestExperience?.paymentMethods)
            ? data.guestExperience.paymentMethods.filter(Boolean)
            : [...defaultGuestExperience.paymentMethods],
        facilities: Array.isArray(data?.guestExperience?.facilities)
            ? data.guestExperience.facilities.filter(Boolean)
            : [...defaultGuestExperience.facilities]
    };
    sectionVisibility = { ...defaultSectionVisibility, ...(data?.sectionVisibility && typeof data.sectionVisibility === 'object' ? data.sectionVisibility : {}) };
    sectionOrder = Array.isArray(data?.sectionOrder) ? data.sectionOrder.filter(Boolean) : [...defaultSectionOrder];
    promoId = typeof data?.promoId === 'undefined' ? null : data.promoId;
    if (Object.prototype.hasOwnProperty.call(data || {}, 'promoItem')) {
        homePromoItem = data?.promoItem ? normalizeMenuItem(data.promoItem) : null;
    }
    if (Array.isArray(data?.featuredItems)) {
        homeFeaturedItems = data.featuredItems.map(normalizeMenuItem);
    } else if (Array.isArray(data?.menu)) {
        homeFeaturedItems = [];
    }
    window.promoIds = Array.isArray(data?.promoIds)
        ? data.promoIds
        : promoId !== null
            ? [promoId]
            : [];

    if (typeof window.mergeRestaurantConfig === 'function') {
        window.mergeRestaurantConfig({
            wifi: { name: wifiData.ssid, code: wifiData.pass },
            socials: socialLinks,
            guestExperience,
            sectionVisibility,
            sectionOrder,
            location: data?.landing?.location || window.restaurantConfig?.location,
            phone: data?.landing?.phone || window.restaurantConfig?.phone,
            gallery: Array.isArray(data?.gallery) ? data.gallery : window.restaurantConfig?.gallery,
            superCategories: Array.isArray(data?.superCategories) ? data.superCategories : window.restaurantConfig?.superCategories,
            categoryTranslations: data?.categoryTranslations || window.restaurantConfig?.categoryTranslations,
            _hours: Array.isArray(data?.hours) ? data.hours : window.restaurantConfig?._hours,
            _hoursNote: typeof data?.hoursNote === 'string' ? data.hoursNote : window.restaurantConfig?._hoursNote,
            branding: data?.branding || window.restaurantConfig?.branding,
            contentTranslations: data?.contentTranslations || window.restaurantConfig?.contentTranslations
        });
    }
}

function applySiteDataSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;

    const source = snapshot.restaurantData || {};
    const snapshotWifi = source.wifi && typeof source.wifi === 'object'
        ? {
            ssid: source.wifi.ssid || source.wifi.name || '',
            pass: source.wifi.pass || source.wifi.code || ''
        }
        : {};
    const snapshotLanding = source.landing && typeof source.landing === 'object'
        ? source.landing
        : {
            location: source.location || {},
            phone: source.phone || ''
        };

    applySiteData({
        menu: Array.isArray(snapshot.menu) ? snapshot.menu : defaultMenu,
        catEmojis: snapshot.catEmojis || defaultCatEmojis,
        categoryImages: snapshot.categoryImages || source.categoryImages || window.defaultCategoryImages || {},
        wifi: snapshotWifi,
        social: source.social || source.socials || defaultSocialLinks,
        guestExperience: source.guestExperience || defaultGuestExperience,
        sectionVisibility: source.sectionVisibility || defaultSectionVisibility,
        sectionOrder: source.sectionOrder || defaultSectionOrder,
        promoIds: Array.isArray(snapshot.promoIds) ? snapshot.promoIds : [],
        promoId: Array.isArray(snapshot.promoIds) && snapshot.promoIds.length === 1 ? snapshot.promoIds[0] : null,
        gallery: Array.isArray(source.gallery) ? source.gallery : [],
        hours: Array.isArray(source.hours) ? source.hours : [],
        hoursNote: typeof source.hoursNote === 'string' ? source.hoursNote : '',
        superCategories: Array.isArray(source.superCategories) ? source.superCategories : [],
        categoryTranslations: source.categoryTranslations || {},
        branding: source.branding || {},
        contentTranslations: source.contentTranslations || {},
        landing: snapshotLanding
    });

    if (typeof snapshot.version === 'string' && snapshot.version) {
        lastPublicDataVersion = snapshot.version;
    }

    return true;
}

function persistMenuSnapshotFromSiteData(data, version = '') {
    try {
        if (!window.localStorage) return;
        window.localStorage.setItem(MENU_SNAPSHOT_STORAGE_KEY, JSON.stringify({
            version,
            menu,
            catEmojis,
            categoryImages,
            promoIds: Array.isArray(window.promoIds) ? window.promoIds : [],
            restaurantData: {
                superCategories: Array.isArray(window.restaurantConfig?.superCategories) ? window.restaurantConfig.superCategories : [],
                categoryImages,
                categoryTranslations: window.restaurantConfig?.categoryTranslations || {},
                wifi: {
                    ssid: window.restaurantConfig?.wifi?.ssid || window.restaurantConfig?.wifi?.name || '',
                    pass: window.restaurantConfig?.wifi?.pass || window.restaurantConfig?.wifi?.code || ''
                },
                social: window.restaurantConfig?.socials || {},
                guestExperience: guestExperience,
                sectionVisibility: sectionVisibility,
                sectionOrder: sectionOrder,
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

function renderDeferredHomepageSections() {
    renderSocialLinks();
    renderHours();
    renderGallery();
    renderPaymentFacilities();
    renderSectionLayout();
    updateWifiUI();
    updateWhatsAppLinks();
    homepageDeferredSectionsReady = true;
}

function scheduleDeferredHomepageSections() {
    if (homepageDeferredSectionsReady) return;
    cancelLowPriorityTask(homepageDeferredRenderHandle);
    homepageDeferredRenderHandle = scheduleLowPriorityTask(() => {
        homepageDeferredRenderHandle = null;
        renderDeferredHomepageSections();
    });
}

function cleanupDeferredHomepageSectionIntent() {
    if (!homepageDeferredIntentArmed) return;
    homepageDeferredIntentArmed = false;
    window.removeEventListener('scroll', onHomepageDeferredIntent);
    window.removeEventListener('touchmove', onHomepageDeferredIntent);
    window.removeEventListener('wheel', onHomepageDeferredIntent);
    window.removeEventListener('keydown', onHomepageDeferredIntent);
    if (homepageDeferredFallbackTimer) {
        clearTimeout(homepageDeferredFallbackTimer);
        homepageDeferredFallbackTimer = null;
    }
}

function onHomepageDeferredIntent() {
    cleanupDeferredHomepageSectionIntent();
    renderDeferredHomepageSections();
}

function armDeferredHomepageSections() {
    if (homepageDeferredSectionsReady || homepageDeferredIntentArmed) return;
    homepageDeferredIntentArmed = true;
    window.addEventListener('scroll', onHomepageDeferredIntent, { passive: true });
    window.addEventListener('touchmove', onHomepageDeferredIntent, { passive: true });
    window.addEventListener('wheel', onHomepageDeferredIntent, { passive: true });
    window.addEventListener('keydown', onHomepageDeferredIntent);
    homepageDeferredFallbackTimer = window.setTimeout(() => {
        onHomepageDeferredIntent();
    }, 3200);
}

function ensureEventBookingScript() {
    if (window.__eventBookingReady) {
        return Promise.resolve();
    }
    if (eventBookingScriptPromise) {
        return eventBookingScriptPromise;
    }

    eventBookingScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-event-booking-script="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('event_booking_js_failed')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = getVersionedPublicAsset('event-booking.js');
        script.defer = true;
        script.setAttribute('data-event-booking-script', 'true');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('event_booking_js_failed'));
        document.head.appendChild(script);
    });

    return eventBookingScriptPromise;
}

async function loadSiteData() {
    if (homepageSyncInFlight) return homepageSyncInFlight;

    homepageSyncInFlight = (async () => {
    try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller
            ? setTimeout(() => controller.abort(), PUBLIC_DATA_TIMEOUT_MS)
            : null;
        let res;
        try {
            res = await fetch('/api/home-data', {
                headers: lastPublicDataVersion ? { 'If-None-Match': lastPublicDataVersion } : undefined,
                signal: controller ? controller.signal : undefined
            });
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
        if (res.status === 304) return;
        if (!res.ok) throw new Error('Server returned ' + res.status);
        const data = await res.json();
        const version = res.headers.get('etag') || res.headers.get('x-data-version') || '';
        applySiteData(data);
        persistMenuSnapshotFromSiteData(data, version);
        lastPublicDataVersion = version || lastPublicDataVersion;
        if (homepageInitialized) {
            refreshHomepageUI();
            if (homepageDeferredSectionsReady) {
                renderDeferredHomepageSections();
            }
        }
    } catch (error) {
        console.error('Failed to load site data:', error);
        if (!homepageInitialized) {
            applySiteData({
                menu: defaultMenu,
                catEmojis: defaultCatEmojis,
                wifi: defaultWifiData,
                social: defaultSocialLinks,
                guestExperience: defaultGuestExperience,
                sectionVisibility: defaultSectionVisibility,
                sectionOrder: defaultSectionOrder,
                promoId: null
            });
        }
    } finally {
        homepageSyncInFlight = null;
    }
    })();

    return homepageSyncInFlight;
}

async function warmMenuSnapshotFromHomepage() {
    const snapshot = readStoredMenuSnapshot();
    if (snapshot?.version && snapshot.version === lastPublicDataVersion && Array.isArray(snapshot.menu) && snapshot.menu.length) {
        return;
    }

    try {
        const res = await fetch('/api/menu-data', {
            headers: snapshot?.version ? { 'If-None-Match': snapshot.version } : undefined
        });
        if (res.status === 304) return;
        if (!res.ok) return;
        const data = await res.json();
        const version = res.headers.get('etag') || res.headers.get('x-data-version') || '';
        applySiteData(data);
        persistMenuSnapshotFromSiteData(data, version);
    } catch (error) {
        console.warn('Failed to warm menu snapshot from homepage:', error);
    }
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    const snapshot = readStoredMenuSnapshot();
    if (snapshot) {
        applySiteDataSnapshot(snapshot);
    }
    initApp();
    requestAnimationFrame(() => {
        loadSiteData();
    });
});

function refreshHomepageUI() {
    renderHomepageFeatured();
    renderLocationCritical();
    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
}

function initApp() {
    refreshHomepageUI();
    if (!homepageSliderStarted) {
        startSlider();
        homepageSliderStarted = true;
    }

    document.querySelectorAll('.slide-cta').forEach((cta) => {
        const goToMenu = (event) => {
            event.preventDefault();
            event.stopPropagation();
            window.location.href = 'menu.html';
        };
        cta.addEventListener('click', goToMenu);
        cta.addEventListener('touchend', goToMenu, { passive: false });
    });

    // Safety check for language initialization
    const initialLangBtn = document.querySelector('.lang-btn') || document.querySelector('.lang-drop-btn');
    const savedLang = typeof window.getStoredLanguage === 'function'
        ? window.getStoredLanguage()
        : 'fr';
    setLang(savedLang, initialLangBtn);

    if (document.getElementById('statusBadge')) updateStatus();

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            const targetSelector = link.getAttribute('href') || '';
            const needsDeferredSection = targetSelector.startsWith('#') && targetSelector !== '#heroSlider';
            if (needsDeferredSection && !homepageDeferredSectionsReady) {
                event.preventDefault();
                renderDeferredHomepageSections().then(() => {
                    requestAnimationFrame(() => {
                        document.querySelector(targetSelector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                });
            }
            const nav = document.getElementById('headerNav');
            if (nav) nav.classList.remove('mobile-open');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (menuBtn) {
                menuBtn.classList.remove('is-open');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    homepageInitialized = true;
    armDeferredHomepageSections();
    scheduleLowPriorityTask(() => {
        warmMenuSnapshotFromHomepage();
    }, 1800);
}

// ═══════════════════════ DYNAMIC HOURS ═══════════════════════
function ensureHomepageExtrasScript() {
    if (window.__homepageExtrasReady) {
        return Promise.resolve();
    }
    if (homepageExtrasScriptPromise) {
        return homepageExtrasScriptPromise;
    }

    homepageExtrasScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-homepage-extras-script="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('homepage_extras_js_failed')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = getVersionedPublicAsset('homepage-extras.js');
        script.defer = true;
        script.setAttribute('data-homepage-extras-script', 'true');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('homepage_extras_js_failed'));
        document.head.appendChild(script);
    });

    return homepageExtrasScriptPromise;
}

window.__homepageGetState = function __homepageGetState() {
    return {
        wifiData,
        socialLinks,
        guestExperience,
        sectionVisibility,
        sectionOrder,
        defaultSectionVisibility,
        defaultSectionOrder,
        promoId,
        homePromoItem,
        menu
    };
};

function renderDeferredHomepageSections() {
    return ensureHomepageExtrasScript()
        .then(() => {
            if (typeof window.__homepageRenderDeferredSections === 'function') {
                window.__homepageRenderDeferredSections();
            }
            homepageDeferredSectionsReady = true;
            cleanupDeferredHomepageSectionIntent();
        })
        .catch((error) => {
            console.error('Failed to load homepage extras:', error);
        });
}

function renderLocationCritical() {
    const topAddressText = document.getElementById('topAddressDisplay');
    const topPhoneText = document.getElementById('topPhoneDisplay');
    const directionsLink = document.getElementById('directionsLink');
    const reviewsLink = document.getElementById('reviewsLink');
    const mapUrl = window.getSafeExternalUrl(window.restaurantConfig?.location?.url);

    if (topAddressText) {
        topAddressText.textContent = window.restaurantConfig?.location?.address
            ? `📍 ${window.restaurantConfig.location.address}`
            : '';
    }

    if (topPhoneText) {
        topPhoneText.textContent = window.restaurantConfig?.phone
            ? `📞 ${window.restaurantConfig.phone}`
            : '';
    }

    if (directionsLink) {
        if (mapUrl) {
            directionsLink.href = mapUrl;
            directionsLink.classList.remove('is-disabled');
        } else {
            directionsLink.removeAttribute('href');
            directionsLink.classList.add('is-disabled');
        }
    }

    if (reviewsLink) {
        if (mapUrl) {
            reviewsLink.href = mapUrl;
            reviewsLink.classList.remove('is-disabled');
        } else {
            reviewsLink.removeAttribute('href');
            reviewsLink.classList.add('is-disabled');
        }
    }
}

function renderLocation() {
    ensureHomepageExtrasScript()
        .then(() => {
            if (typeof window.__homepageRenderLocation === 'function') {
                window.__homepageRenderLocation();
            }
        })
        .catch((error) => {
            console.error('Failed to render homepage location:', error);
        });
}

window.openGalleryLightbox = function openGalleryLightbox(src) {
    ensureHomepageExtrasScript()
        .then(() => {
            if (typeof window.__homepageOpenGalleryLightbox === 'function') {
                window.__homepageOpenGalleryLightbox(src);
            }
        })
        .catch((error) => {
            console.error('Failed to load homepage extras:', error);
        });
};

window.openSocialModal = function openSocialModal() {
    ensureHomepageExtrasScript()
        .then(() => {
            if (typeof window.__homepageOpenSocialModal === 'function') {
                window.__homepageOpenSocialModal();
            }
        })
        .catch((error) => {
            console.error('Failed to load homepage extras:', error);
        });
};

window.closeSocialModal = function closeSocialModal() {
    if (typeof window.__homepageCloseSocialModal === 'function') {
        window.__homepageCloseSocialModal();
    }
};

window.openWifiModal = function openWifiModal() {
    ensureHomepageExtrasScript()
        .then(() => {
            if (typeof window.__homepageOpenWifiModal === 'function') {
                window.__homepageOpenWifiModal();
            }
        })
        .catch((error) => {
            console.error('Failed to load homepage extras:', error);
        });
};

window.closeWifiModal = function closeWifiModal() {
    if (typeof window.__homepageCloseWifiModal === 'function') {
        window.__homepageCloseWifiModal();
    }
};

window.copyWifi = function copyWifi() {
    ensureHomepageExtrasScript()
        .then(() => {
            if (typeof window.__homepageCopyWifi === 'function') {
                window.__homepageCopyWifi();
            }
        })
        .catch((error) => {
            console.error('Failed to load homepage extras:', error);
        });
};

function getHomepageFeaturedItems() {
    const sourceItems = Array.isArray(homeFeaturedItems) && homeFeaturedItems.length
        ? homeFeaturedItems
        : menu.filter((item) => item?.featured && item?.available !== false);
    const seen = new Set();
    return sourceItems.filter((item) => {
        const key = String(item?.id ?? '');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 6);
}

function renderHomepageFeatured() {
    const mount = document.getElementById('menu-area');
    if (!mount) return;

    const items = getHomepageFeaturedItems();
    if (!items.length) {
        mount.innerHTML = '';
        mount.style.display = 'none';
        return;
    }

    const label = t('featured_label', 'Featured Selection');
    const title = t('featured_best', 'Our Favorites');
    const cta = t('view_menu', 'View Menu');

    mount.style.display = 'block';
    mount.innerHTML = `
      <section class="featured-section home-featured-spotlight">
        <div class="promo-inner home-featured-inner">
          <div class="home-featured-head">
            <div>
              <p class="section-tag home-featured-tag">${escapeHtml(label)}</p>
              <h2 class="section-title home-featured-title">${escapeHtml(title)}</h2>
            </div>
            <a href="menu.html" class="slide-cta home-featured-cta">${escapeHtml(cta)}</a>
          </div>
          <div class="featured-slider home-featured-slider">
            ${items.map((item) => `
              <a class="featured-card home-featured-card" href="menu.html" aria-label="${escapeHtml(window.getLocalizedMenuName(item) || '')}">
                <div class="featured-img-wrap home-featured-image-wrap">
                  <img
                    id="homeFeaturedImg${escapeHtml(String(item.id))}"
                    alt="${escapeHtml(window.getLocalizedMenuName(item) || '')}"
                    width="320"
                    height="240"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="featured-info home-featured-copy">
                  <div class="featured-name">${escapeHtml(window.getLocalizedMenuName(item) || '')}</div>
                  <div class="home-featured-desc">${escapeHtml(window.getLocalizedMenuDescription(item, t('dish_default_desc', 'A carefully prepared dish made with our best ingredients.')) || '')}</div>
                  <div class="featured-price">MAD ${Number(window.getItemPrice(item) || 0).toFixed(0)}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
    `;

    items.forEach((item) => {
        const image = document.getElementById(`homeFeaturedImg${String(item.id)}`);
        if (!image) return;
        window.setSafeImageSource(image, item.img || '', {
            fallbackSrc: window.defaultBranding?.heroImage || 'images/hero-default.svg'
        });
    });
}


// STATUS LOGIC
// Status is now managed by shared.js

// SLIDER
function startSlider() {
    setInterval(() => { goSlide((currentSlide + 1) % 3); }, 5000);
}
function goSlide(n) {
    currentSlide = n;
    document.querySelectorAll('.slide').forEach((s, i) => s.classList.toggle('slide-active', i === n));
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('dot-active', i === n));
}

// TOAST
// Toast is now managed by shared.js

// MOBILE MENU
function toggleMobileMenu() {
    const nav = document.getElementById('headerNav');
    const btn = document.querySelector('.mobile-menu-btn');
    if (!nav) return;
    const isOpen = nav.classList.toggle('mobile-open');
    if (btn) {
        btn.classList.toggle('is-open', isOpen);
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}


// Language and Translations are now managed by shared.js

// WIFI MODAL
function openWifiModal() {
    document.getElementById('wifiOverlay').classList.add('open');
    document.getElementById('wifiModal').classList.add('open');
}

function closeWifiModal() {
    document.getElementById('wifiOverlay').classList.remove('open');
    document.getElementById('wifiModal').classList.remove('open');
}

function copyWifi() {
    const pass = document.getElementById('wifiPass').textContent;
    navigator.clipboard.writeText(pass).then(() => {
        showToast(t('wifi_password_copied', 'Mot de passe copié !'));
    });
}

// Event booking is lazy-loaded to keep homepage boot lighter.
window.openEventModal = async function openEventModal(type) {
    try {
        await ensureEventBookingScript();
        if (typeof window.__eventBookingOpen === 'function') {
            window.__eventBookingOpen(type);
        }
    } catch (error) {
        console.error('Failed to load event booking flow:', error);
    }
};

window.closeEventModal = function closeEventModal() {
    if (typeof window.__eventBookingClose === 'function') {
        window.__eventBookingClose();
    }
};

window.sendEventWA = async function sendEventWA() {
    try {
        await ensureEventBookingScript();
        if (typeof window.__eventBookingSend === 'function') {
            window.__eventBookingSend();
        }
    } catch (error) {
        console.error('Failed to load event booking flow:', error);
    }
};
