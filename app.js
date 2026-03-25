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
let wifiData = { ...defaultWifiData };
let promoId = null;
let homePromoItem = null;
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
let eventBookingScriptPromise = null;

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
            promoIds: Array.isArray(window.promoIds) ? window.promoIds : [],
            restaurantData: {
                superCategories: Array.isArray(window.restaurantConfig?.superCategories) ? window.restaurantConfig.superCategories : [],
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
        script.src = 'event-booking.js';
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
            } else {
                scheduleDeferredHomepageSections();
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
        const res = await fetch('/api/data', {
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
    renderPromo();
    renderLocation();
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
        link.addEventListener('click', () => {
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
    scheduleDeferredHomepageSections();
    scheduleLowPriorityTask(() => {
        warmMenuSnapshotFromHomepage();
    }, 1800);
}

// ═══════════════════════ DYNAMIC HOURS ═══════════════════════
function renderHours() {
    const grid = document.getElementById('hoursGrid');
    const noteEl = document.getElementById('hoursNote');
    if (!grid) return;

    const hours = Array.isArray(window.restaurantConfig?._hours) && window.restaurantConfig._hours.length > 0
        ? window.restaurantConfig._hours
        : window.defaultHours;
    const note = typeof window.restaurantConfig?._hoursNote === 'string'
        ? window.restaurantConfig._hoursNote
        : (window.defaultHoursNote || '');

    grid.innerHTML = hours.map(h => `
        <div class="hours-row${h.highlight ? ' highlight-row' : ''}">
            <span class="hours-day" data-i18n="${h.i18n}">${h.day}</span>
            <span class="hours-dash"></span>
            <span class="hours-time">${h.open} – ${h.close}</span>
        </div>
    `).join('');

    if (noteEl) {
        noteEl.textContent = note;
    }
}

function updateWifiUI() {
    const ssidEl = document.getElementById('wifiSSIDDisplay');
    const passEl = document.getElementById('wifiPass');
    const qrEl = document.getElementById('wifiQR');
    const wifiSsid = (typeof wifiData?.ssid === 'string' && wifiData.ssid.trim())
        ? wifiData.ssid.trim()
        : t('wifi_default_name', 'Restaurant WiFi');
    const wifiPass = (typeof wifiData?.pass === 'string' && wifiData.pass.trim())
        ? wifiData.pass.trim()
        : t('wifi_default_code_help', 'Ask the team');
    if (ssidEl) ssidEl.innerHTML = `<strong>${t('wifi_ssid_label', 'SSID')}:</strong> ${wifiSsid}`;
    if (passEl) passEl.textContent = wifiPass;
    if (qrEl) qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WIFI:S:${encodeURIComponent(wifiSsid)};T:WPA;P:${encodeURIComponent(wifiPass)};;`;
}

function updateWhatsAppLinks() {
    const wa = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(socialLinks.whatsapp || '').replace(/\D/g, '');
    const eventLink = document.getElementById('eventWALink');
    const contactLink = document.getElementById('contactWALink');

    if (eventLink) {
        eventLink.href = wa ? `https://wa.me/${wa}` : '#contact';
        eventLink.target = wa ? '_blank' : '_self';
    }
    if (contactLink) {
        if (wa) {
            contactLink.href = `https://wa.me/${wa}`;
            contactLink.target = '_blank';
            contactLink.textContent = `+${wa}`;
        } else {
            contactLink.href = `tel:${restaurantConfig.phone.replace(/\s/g, '')}`;
            contactLink.removeAttribute('target');
            contactLink.textContent = restaurantConfig.phone;
        }
    }
}

function updateWhatsAppLinks() {
    const phoneFallback = (window.restaurantConfig?.phone || '').replace(/\D/g, '');
    const wa = (socialLinks.whatsapp || '').replace(/\D/g, '') || phoneFallback;
    const eventLink = document.getElementById('eventWALink');
    const contactLink = document.getElementById('contactWALink');

    if (eventLink) {
        if (wa) {
            eventLink.href = `https://wa.me/${wa}`;
        } else {
            eventLink.removeAttribute('href');
        }
    }

    if (contactLink) {
        if (!wa) {
            contactLink.removeAttribute('href');
            contactLink.textContent = window.restaurantConfig?.phone || t('social_whatsapp', 'WhatsApp');
            return;
        }

        contactLink.href = `https://wa.me/${wa}`;
        contactLink.textContent = socialLinks.whatsapp ? `+${wa}` : (window.restaurantConfig?.phone || `+${wa}`);
    }
}

function renderSocialLinks() {
    const modalList = document.getElementById('modalSocialList');
    const footerContainer = document.getElementById('footerSocial');
    const contactSocialLinks = document.getElementById('contactSocialLinks');

    let modalItems = '';
    let footerIcons = '';
    let contactButtons = '';
    const instagramUrl = window.getSafeExternalUrl(socialLinks.instagram);
    const facebookUrl = window.getSafeExternalUrl(socialLinks.facebook);
    const tiktokUrl = window.getSafeExternalUrl(socialLinks.tiktok);
    const tripAdvisorUrl = window.getSafeExternalUrl(socialLinks.tripadvisor);

    if (instagramUrl) {
        modalItems += `<a href="${instagramUrl}" target="_blank" class="social-link-item instagram"><span>📸</span> ${t('social_instagram', 'Instagram')}</a>`;
        footerIcons += `<a href="${instagramUrl}" target="_blank" class="footer-social-icon">📸</a>`;
        contactButtons += `<a href="${instagramUrl}" target="_blank" class="social-btn">📸 ${t('social_instagram', 'Instagram')}</a>`;
    }
    if (facebookUrl) {
        modalItems += `<a href="${facebookUrl}" target="_blank" class="social-link-item facebook"><span>📘</span> ${t('social_facebook', 'Facebook')}</a>`;
        footerIcons += `<a href="${facebookUrl}" target="_blank" class="footer-social-icon">📘</a>`;
        contactButtons += `<a href="${facebookUrl}" target="_blank" class="social-btn">📘 ${t('social_facebook', 'Facebook')}</a>`;
    }
    if (tiktokUrl) {
        modalItems += `<a href="${tiktokUrl}" target="_blank" class="social-link-item tiktok"><span>🎵</span> ${t('social_tiktok', 'TikTok')}</a>`;
        footerIcons += `<a href="${tiktokUrl}" target="_blank" class="footer-social-icon">🎵</a>`;
        contactButtons += `<a href="${tiktokUrl}" target="_blank" class="social-btn">🎵 ${t('social_tiktok', 'TikTok')}</a>`;
    }
    if (tripAdvisorUrl) {
        modalItems += `<a href="${tripAdvisorUrl}" target="_blank" class="social-link-item"><span>⭐</span> ${t('social_tripadvisor', 'TripAdvisor')}</a>`;
        footerIcons += `<a href="${tripAdvisorUrl}" target="_blank" class="footer-social-icon">⭐</a>`;
        contactButtons += `<a href="${tripAdvisorUrl}" target="_blank" class="social-btn">⭐ ${t('social_tripadvisor', 'TripAdvisor')}</a>`;
    }
    const waNumber = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(socialLinks.whatsapp || '').replace(/\D/g, '');
    if (waNumber) {
        modalItems += `<a href="https://wa.me/${waNumber}" target="_blank" class="social-link-item whatsapp"><span>📞</span> ${t('social_whatsapp', 'WhatsApp')}</a>`;
        footerIcons += `<a href="https://wa.me/${waNumber}" target="_blank" class="footer-social-icon">📞</a>`;
        contactButtons += `<a href="https://wa.me/${waNumber}" target="_blank" class="social-btn">📞 ${t('social_whatsapp', 'WhatsApp')}</a>`;
    }

    const emptyText = typeof window.getTranslation === 'function'
        ? window.getTranslation('social_empty', 'Aucun lien configuré.')
        : 'Aucun lien configuré.';
    const emptyStateHtml = `
        <div class="website-empty-state is-social">
            <strong>${typeof window.getTranslation === 'function'
                ? window.getTranslation('social_modal_title', 'Nos réseaux')
                : 'Nos réseaux'}</strong>
            <span>${emptyText}</span>
        </div>
    `;
    if (modalList) modalList.innerHTML = modalItems || emptyStateHtml;
    if (footerContainer) {
        footerContainer.innerHTML = footerIcons;
        footerContainer.style.display = footerIcons ? '' : 'none';
    }
    if (contactSocialLinks) {
        contactSocialLinks.innerHTML = contactButtons || emptyStateHtml;
    }
}

function renderGallery() {
    const grid = document.getElementById('mainGalleryGrid');
    if (!grid) return;
    const gallerySection = document.getElementById('gallery');

    const images = restaurantConfig.gallery || [];
    const emptyText = typeof window.getTranslation === 'function'
        ? window.getTranslation('gallery_empty', 'De nouvelles photos arrivent bientôt...')
        : 'De nouvelles photos arrivent bientôt...';
    const emptyStateHtml = `
        <div class="website-empty-state is-gallery">
            <strong>${typeof window.getTranslation === 'function'
                ? window.getTranslation('gallery_title', 'Galerie')
                : 'Galerie'}</strong>
            <span>${emptyText}</span>
        </div>
    `;
    if (images.length === 0) {
        grid.innerHTML = emptyStateHtml;
        if (gallerySection && (window.restaurantConfig?.sectionVisibility?.gallery !== false)) {
            gallerySection.style.display = '';
        }
        return;
    }

    grid.innerHTML = images.map(img => `
        <div class="gallery-item" onclick="openGalleryLightbox('${img}')">
            <img src="${img}" alt="Gallery Image" width="640" height="640" loading="lazy" decoding="async" fetchpriority="low" />
        </div>
    `).join('');
    grid.querySelectorAll('img').forEach((imgEl) => {
        imgEl.onerror = () => {
            const card = imgEl.closest('.gallery-item');
            if (card) card.remove();
            if (!grid.querySelector('.gallery-item')) {
                grid.innerHTML = emptyStateHtml;
            }
        };
    });
}

function renderLocation() {
    const addressText = document.getElementById('contactAddressText');
    const footerAddressText = document.getElementById('footerAddressText');
    const addressCard = document.getElementById('contactAddressCard');
    const topAddressText = document.getElementById('topAddressDisplay');
    const topPhoneText = document.getElementById('topPhoneDisplay');
    const contactPhoneLink = document.getElementById('contactPhoneLink');
    const directionsLink = document.getElementById('directionsLink');
    const reviewsLink = document.getElementById('reviewsLink');

    if (restaurantConfig.location) {
        if (addressText) addressText.textContent = restaurantConfig.location.address;
        if (footerAddressText) footerAddressText.textContent = restaurantConfig.location.address;
        if (topAddressText) topAddressText.textContent = `📍 ${restaurantConfig.location.address}`;
        const mapUrl = window.getSafeExternalUrl(restaurantConfig.location.url);
        if (addressCard && mapUrl) {
            addressCard.onclick = () => {
                window.openSafeExternalUrl(mapUrl, '_blank');
            };
            addressCard.classList.add('is-actionable');
        } else if (addressCard) {
            addressCard.onclick = null;
            addressCard.classList.remove('is-actionable');
        }
        if (directionsLink && mapUrl) {
            directionsLink.href = mapUrl;
            directionsLink.classList.remove('is-disabled');
        } else if (directionsLink) {
            directionsLink.removeAttribute('href');
            directionsLink.classList.add('is-disabled');
        }
        if (reviewsLink && mapUrl) {
            reviewsLink.href = mapUrl;
            reviewsLink.classList.remove('is-disabled');
        } else if (reviewsLink) {
            reviewsLink.removeAttribute('href');
            reviewsLink.classList.add('is-disabled');
        }
    } else if (addressCard) {
        addressCard.onclick = null;
        addressCard.classList.remove('is-actionable');
        if (addressText) {
            addressText.textContent = typeof window.getTranslation === 'function'
                ? window.getTranslation('landing_address_placeholder', 'Restaurant address')
                : 'Restaurant address';
        }
        if (footerAddressText) footerAddressText.textContent = '';
        if (topAddressText) topAddressText.textContent = '';
        if (reviewsLink) {
            reviewsLink.removeAttribute('href');
            reviewsLink.classList.add('is-disabled');
        }
    }

    if (restaurantConfig.phone) {
        if (topPhoneText) topPhoneText.textContent = `📞 ${restaurantConfig.phone}`;
        if (contactPhoneLink) {
            const phoneHref = window.getSafePhoneHref(restaurantConfig.phone);
            if (phoneHref) {
                contactPhoneLink.href = phoneHref;
            } else {
                contactPhoneLink.removeAttribute('href');
            }
            contactPhoneLink.textContent = restaurantConfig.phone;
        }
    }

    if (!restaurantConfig.phone) {
        if (topPhoneText) topPhoneText.textContent = '';
        if (contactPhoneLink) {
            contactPhoneLink.removeAttribute('href');
            contactPhoneLink.textContent = typeof window.getTranslation === 'function'
                ? window.getTranslation('landing_phone_placeholder', 'Phone coming soon')
                : 'Phone coming soon';
        }
    }

    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
}

function renderPaymentFacilities() {
    const section = document.getElementById('payments');
    const paymentsList = document.getElementById('paymentMethodsList');
    const facilitiesList = document.getElementById('facilityList');
    const divider = document.getElementById('paymentsDivider');

    if (!section || !paymentsList || !facilitiesList) return;

    const paymentCatalog = {
        cash: { icon: '💵', labelKey: 'pf_payment_cash' },
        tpe: { icon: '💳', labelKey: 'pf_payment_tpe' }
    };
    const facilityCatalog = {
        wifi: { icon: '📶', labelKey: 'pf_facility_wifi' },
        accessible: { icon: '♿', labelKey: 'pf_facility_accessible' },
        parking: { icon: '🅿️', labelKey: 'pf_facility_parking' },
        terrace: { icon: '☀️', labelKey: 'pf_facility_terrace' },
        family: { icon: '👨‍👩‍👧‍👦', labelKey: 'pf_facility_family' }
    };

    const paymentItems = (guestExperience.paymentMethods || [])
        .map((id) => paymentCatalog[id])
        .filter(Boolean)
        .map((item) => `
            <div class="pf-icon-item">
              <span class="pf-icon">${item.icon}</span>
              <span class="pf-label" data-i18n="${item.labelKey}">${window.getTranslation(item.labelKey, item.labelKey)}</span>
            </div>
        `)
        .join('');

    const facilityItems = (guestExperience.facilities || [])
        .map((id) => facilityCatalog[id])
        .filter(Boolean)
        .map((item) => `
            <div class="pf-icon-item">
              <span class="pf-icon">${item.icon}</span>
              <span class="pf-label" data-i18n="${item.labelKey}">${window.getTranslation(item.labelKey, item.labelKey)}</span>
            </div>
        `)
        .join('');

    paymentsList.innerHTML = paymentItems;
    facilitiesList.innerHTML = facilityItems;

    const hasPayments = Boolean(paymentItems);
    const hasFacilities = Boolean(facilityItems);

    const paymentsCard = document.getElementById('paymentsCard');
    const facilitiesCard = document.getElementById('facilitiesCard');
    if (paymentsCard) paymentsCard.style.display = hasPayments ? '' : 'none';
    if (facilitiesCard) facilitiesCard.style.display = hasFacilities ? '' : 'none';
    if (divider) divider.style.display = hasPayments && hasFacilities ? '' : 'none';
    section.style.display = hasPayments || hasFacilities ? '' : 'none';
}

function renderSectionLayout() {
    const visibility = window.restaurantConfig?.sectionVisibility || sectionVisibility || defaultSectionVisibility;
    const orderSource = Array.isArray(window.restaurantConfig?.sectionOrder) ? window.restaurantConfig.sectionOrder : sectionOrder;
    const order = [];
    const knownKeys = ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];

    (Array.isArray(orderSource) ? orderSource : []).forEach((key) => {
        if (!knownKeys.includes(key) || order.includes(key)) return;
        order.push(key);
    });
    knownKeys.forEach((key) => {
        if (!order.includes(key)) order.push(key);
    });

    const sectionMap = {
        about: 'about',
        payments: 'payments',
        events: 'events',
        gallery: 'gallery',
        hours: 'hours',
        contact: 'contact'
    };

    const anchor = document.getElementById('footer');
    if (anchor && anchor.parentNode) {
        order.forEach((key) => {
            const section = document.getElementById(sectionMap[key]);
            if (section) {
                anchor.parentNode.insertBefore(section, anchor);
            }
        });
    }

    Object.entries(sectionMap).forEach(([key, id]) => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = visibility[key] === false ? 'none' : '';
        }
        document.querySelectorAll(`[data-section-link="${key}"]`).forEach((link) => {
            link.style.display = visibility[key] === false ? 'none' : '';
        });
    });

    const footerSocial = document.getElementById('footerSocial');
    if (footerSocial && !footerSocial.innerHTML.trim()) {
        footerSocial.style.display = 'none';
    } else if (footerSocial) {
        footerSocial.style.display = '';
    }

    const hoursNote = document.getElementById('hoursNote');
    if (hoursNote && !hoursNote.textContent.trim()) {
        hoursNote.style.display = 'none';
    } else if (hoursNote) {
        hoursNote.style.display = '';
    }
}

function openGalleryLightbox(src) {
    // We can reuse the product detail modal or create a simple lightbox
    // For now, let's keep it simple or integrate with existing modal logic
    showToast(window.getTranslation('lightbox_soon', 'Aperçu photo à venir'));
}

function openSocialModal() {
    document.getElementById('socialOverlay').classList.add('open');
    document.getElementById('socialModal').classList.add('open');
}

function closeSocialModal() {
    document.getElementById('socialOverlay').classList.remove('open');
    document.getElementById('socialModal').classList.remove('open');
}

function renderPromo() {
    const promoSection = document.getElementById('promo-section');
    const item = homePromoItem || menu.find(m => m.id == promoId);
    if (!item) {
        if (promoSection) promoSection.style.display = 'none';
        return;
    }

    if (promoSection) {
        promoSection.style.display = 'block';
        document.getElementById('promo-item-name').textContent = window.getLocalizedMenuName(item);
        document.getElementById('promo-item-price').textContent = `MAD ${item.price.toFixed(2)}`;
        const promoImg = document.getElementById('promo-item-img');
        if (promoImg) {
            window.setSafeImageSource(promoImg, item.img || '', {
                fallbackSrc: window.defaultBranding?.heroImage || 'images/hero-default.svg',
                onMissing: () => {
                    promoImg.style.display = 'none';
                }
            });
        }
        document.getElementById('promo-item-cta').onclick = () => {
            window.location.href = 'menu.html';
        };
    }
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
