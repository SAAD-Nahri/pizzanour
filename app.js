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
let socialLinks = { ...defaultSocialLinks };
let guestExperience = { ...defaultGuestExperience };
let sectionVisibility = { ...defaultSectionVisibility };
let sectionOrder = [...defaultSectionOrder];

let categories = [];
let cart = [];
let serviceType = 'onsite';
let currentSlide = 0;
const PUBLIC_DATA_TIMEOUT_MS = 8000;

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
    menu = (Array.isArray(data?.menu) ? data.menu : defaultMenu).map(normalizeMenuItem);
    catEmojis = data?.catEmojis && typeof data.catEmojis === 'object' ? data.catEmojis : { ...defaultCatEmojis };
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

async function loadSiteData() {
    try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller
            ? setTimeout(() => controller.abort(), PUBLIC_DATA_TIMEOUT_MS)
            : null;
        let res;
        try {
            res = await fetch('/api/data', {
                cache: 'no-store',
                signal: controller ? controller.signal : undefined
            });
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
        if (!res.ok) throw new Error('Server returned ' + res.status);
        applySiteData(await res.json());
    } catch (error) {
        console.error('Failed to load site data:', error);
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
}

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    await loadSiteData();
    initApp();
});

function initApp() {
    categories = [...new Set(menu.map(m => m.cat))];
    if (document.getElementById('catScroll')) renderCatNav();
    if (document.getElementById('dropdownMenu')) renderDropdown();
    if (document.getElementById('menuWrap')) renderMenu();
    renderPromo();
    renderSocialLinks();
    renderHours();
    renderGallery();
    renderPaymentFacilities();
    renderSectionLayout();
    if (document.getElementById('menuWrap')) setupScroll();
    startSlider();
    updateWifiUI();
    updateWhatsAppLinks();
    renderLocation();

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
        });
    });
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

    const anchor = document.getElementById('confirmOverlay');
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
    if (!promoId) {
        if (promoSection) promoSection.style.display = 'none';
        return;
    }
    const item = menu.find(m => m.id == promoId);
    if (!item) return;

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
        document.getElementById('promo-item-cta').onclick = () => addItem(item.id);
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

// IMAGE HELPER
function imgTag(item) {
    const emoji = catEmojis[item.cat] || '🍴';
    const firstImg = (item.images && item.images.length > 0) ? item.images[0] : (item.img || '');
    if (firstImg) return `<img src="${firstImg}" alt="${window.getLocalizedMenuName(item)}" width="320" height="320" onerror="this.style.display='none';this.parentNode.textContent='${emoji}'" loading="lazy" decoding="async" fetchpriority="low" />`;
    return emoji;
}

// CATEGORY NAV
function renderCatNav() {
    document.getElementById('catScroll').innerHTML = categories.map((c, i) =>
        `<button class="cat-btn${i === 0 ? ' active' : ''}" data-cat="${c}" onclick="scrollToCat('${c}',this)">${catEmojis[c] || '🍴'} ${c}</button>`
    ).join('');
}

function renderDropdown() {
    document.getElementById('dropdownMenu').innerHTML = categories.map(c =>
        `<button class="dd-item" onclick="ddGo('${c}')">${c}</button>`
    ).join('');
}

function toggleDropdown() {
    document.getElementById('dropdownMenu').classList.toggle('open');
    document.getElementById('dropdownBg').classList.toggle('open');
}

function ddGo(cat) {
    toggleDropdown();
    const el = document.getElementById('cat-' + cat.replace(/\s/g, '-'));
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
}

function toggleSearch() {
    const bar = document.getElementById('searchBar');
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) document.getElementById('searchInput').focus();
    else { document.getElementById('searchInput').value = ''; searchProducts(''); }
}

function searchProducts(q) {
    const query = q.toLowerCase().trim();
    document.querySelectorAll('.product-card').forEach(c => {
        const name = c.querySelector('.p-name').textContent.toLowerCase();
        const desc = c.querySelector('.p-desc').textContent.toLowerCase();
        c.classList.toggle('hidden', query && !name.includes(query) && !desc.includes(query));
    });
    document.querySelectorAll('.cat-section').forEach(s => {
        s.style.display = s.querySelectorAll('.product-card:not(.hidden)').length === 0 && query ? 'none' : 'block';
    });
}

function scrollToCat(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const el = document.getElementById('cat-' + cat.replace(/\s/g, '-'));
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
}

// MENU RENDER
function renderMenu() {
    document.getElementById('menuWrap').innerHTML = categories.map(cat => {
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        return `
      <section class="cat-section" id="cat-${cat.replace(/\s/g, '-')}">
        <h2 class="cat-title">${cat}</h2>
        ${items.map((item, i) => `
          <div class="product-card" style="animation-delay:${i * 0.06}s" onclick="openProductModal(${item.id})">
            ${item.badge ? `<span class="p-badge">${item.badge}</span>` : ''}
            <div class="p-info">
              <div class="p-name">${window.getLocalizedMenuName(item)}</div>
              <div class="p-desc">${window.getLocalizedMenuDescription(item)}</div>
              <div class="p-price">${item.hasSizes && item.sizes && item.sizes.length > 0 ? `À partir de MAD ${Math.min(...item.sizes.map(s => s.price)).toFixed(2)}` : `MAD ${item.price.toFixed(2)}`}</div>
            </div>
            <div class="p-img">${imgTag(item)}</div>
            <button class="p-add" onclick="event.stopPropagation();addItem(${item.id})">+</button>
          </div>
        `).join('')}
      </section>`;
    }).join('');
}

// SCROLL
function setupScroll() {
    window.addEventListener('scroll', () => {
        let active = categories[0];
        categories.forEach(cat => {
            const el = document.getElementById('cat-' + cat.replace(/\s/g, '-'));
            if (el && el.getBoundingClientRect().top < 200) active = cat;
        });
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === active));
    });
}

// CART
function addItem(id) {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty++; else cart.push({ ...item, qty: 1 });
    updateBottomBar();
    showToast(t('toast_item_added', `✅ ${window.getLocalizedMenuName(item)} ajouté !`, { item: window.getLocalizedMenuName(item) }));
}

function updateBottomBar() {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const bar = document.getElementById('bottomBar');
    if (count === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    document.getElementById('bottomCount').textContent = t('cart_items_count', '{count} item(s)', { count });
    document.getElementById('bottomTotal').textContent = 'MAD ' + total.toFixed(2);
}

// CONFIRM
function openConfirm() {
    if (cart.length === 0) { showToast(t('confirm_add_items', '🛒 Ajoutez des articles !')); return; }
    renderConfirm();
    document.getElementById('confirmPage').classList.add('open');
    document.getElementById('confirmOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeConfirm() {
    document.getElementById('confirmPage').classList.remove('open');
    document.getElementById('confirmOverlay').classList.remove('open');
    document.body.style.overflow = '';
}
function renderConfirm() {
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    document.getElementById('confirmTotal').textContent = 'MAD ' + total.toFixed(2);
    document.getElementById('confirmItems').innerHTML = cart.map(c => `
    <div class="conf-item">
      <div class="conf-img">${imgTag(c)}</div>
      <div class="conf-info"><div class="conf-name">${window.getLocalizedMenuName(c)}</div><div class="conf-price">MAD ${(c.price * c.qty).toFixed(2)}</div></div>
      <div class="conf-actions">
        <button class="conf-del" onclick="confRemove(${c.id})">🗑</button>
        <span class="conf-qty">${c.qty}</span>
        <button class="conf-plus" onclick="confAdd(${c.id})">+</button>
      </div>
    </div>`).join('');
    // Prioritize 'Divers' and 'Salades' for upselling
    const complements = menu.filter(m => !cart.find(c => c.id === m.id) && (m.cat === 'Divers' || m.cat === 'Salades')).sort(() => Math.random() - 0.5);
    const otherSuggestions = menu.filter(m => !cart.find(c => c.id === m.id) && m.cat !== 'Divers' && m.cat !== 'Salades').sort(() => Math.random() - 0.5);
    const notInCart = [...complements, ...otherSuggestions].slice(0, 10);
    document.getElementById('complementScroll').innerHTML = notInCart.map(item => `
    <div class="comp-card" onclick="compAdd(${item.id})">
      <div class="comp-card-img">${imgTag(item)}<button class="comp-add" onclick="event.stopPropagation();compAdd(${item.id})">+</button></div>
      <div class="comp-name">${window.getLocalizedMenuName(item)}</div>
      <div class="comp-price">MAD ${item.price.toFixed(2)}</div>
    </div>`).join('');
}
function confAdd(id) { const i = cart.find(c => c.id === id); if (i) { i.qty++; updateBottomBar(); renderConfirm(); } }
function confRemove(id) { const i = cart.find(c => c.id === id); if (i) { i.qty--; if (i.qty <= 0) cart = cart.filter(c => c.id !== id); updateBottomBar(); if (cart.length === 0) closeConfirm(); else renderConfirm(); } }
function compAdd(id) { addItem(id); renderConfirm(); }

// SERVICE
function selectService(svc, btn) {
    serviceType = svc;
    document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('deliveryFields').style.display = svc === 'delivery' ? 'block' : 'none';
}

// WHATSAPP
function sendWA() {
    if (cart.length === 0) return;
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const svc = {
        onsite: `🍽️ ${t('service_onsite', 'Sur place')}`,
        takeaway: `🛍️ ${t('service_takeaway', 'À emporter')}`,
        delivery: `🚚 ${t('service_delivery', 'Livraison')}`
    };
    const restaurantName = typeof window.getRestaurantShortName === 'function'
        ? window.getRestaurantShortName()
        : 'Restaurant';
    let msg = `🍔 *${t('wa_new_order_title', 'NOUVELLE COMMANDE – {restaurant}', { restaurant: restaurantName.toUpperCase() })}*\n━━━━━━━━━━━━━━━━\n📋 *${t('wa_service_label', 'Service')}:* ${svc[serviceType]}\n`;
    if (serviceType === 'delivery') {
        const n = document.getElementById('cName').value.trim(), a = document.getElementById('cAddr').value.trim(), p = document.getElementById('cPhone').value.trim();
        if (!n) { document.getElementById('cName').focus(); return alert(t('event_booking_name_required', 'Veuillez entrer votre nom.')); }
        if (!a) { document.getElementById('cAddr').focus(); return alert(t('ticket_delivery_required', 'Veuillez saisir votre adresse de livraison.')); }
        msg += `👤 *${t('wa_client_label', 'Client')}:* ${n}\n📍 *${t('ticket_addr', 'Adresse')}:* ${a}\n`; if (p) msg += `📱 *${t('wa_phone_label', 'Tél')}:* ${p}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━\n\n🛒 *${t('wa_order_label', 'COMMANDE')}:*\n\n`;
    cart.forEach((c, i) => { msg += `${i + 1}. *${window.getLocalizedMenuName(c)}* × ${c.qty}\n   💰 ${(c.price * c.qty).toFixed(2)} MAD\n\n`; });
    msg += `━━━━━━━━━━━━━━━━\n💵 *${t('wa_total_label', 'TOTAL')}: ${total.toFixed(2)} MAD*\n━━━━━━━━━━━━━━━━\n\n🙏 ${t('wa_thanks', 'Merci chez *{restaurant}*!', { restaurant: restaurantName })}`;
    const waNum = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(socialLinks.whatsapp || '').replace(/\D/g, '');
    if (!waNum) {
        showToast(window.getTranslation('social_empty', 'Aucun lien configuré.'));
        return;
    }
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

// TOAST
// Toast is now managed by shared.js

// MOBILE MENU
function toggleMobileMenu() {
    document.getElementById('headerNav').classList.toggle('mobile-open');
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

// PRODUCT MODAL
function openProductModal(id) {
    const item = menu.find(m => m.id == id);
    if (!item) return;

    document.getElementById('detailName').textContent = window.getLocalizedMenuName(item);
    document.getElementById('detailDesc').textContent = window.getLocalizedMenuDescription(item);
    document.getElementById('detailPrice').textContent = `MAD ${item.price.toFixed(2)}`;

    // Gallery
    const images = item.images && item.images.length > 0 ? item.images : (item.img ? [item.img] : []);
    const mainImg = document.getElementById('mainDetailImg');
    const thumbStrip = document.getElementById('thumbStrip');

    if (images.length > 0) {
        window.setSafeImageSource(mainImg, images[0], {
            fallbackSrc: '',
            onMissing: () => {
                mainImg.style.display = 'none';
            },
            displayValue: 'block'
        });
        thumbStrip.innerHTML = images.map((img, i) =>
            `<div class="thumb ${i === 0 ? 'active' : ''}" onclick="setDetailImg('${img}', this)">
                <img src="${img}" alt="Thumb" width="144" height="144" loading="lazy" decoding="async" fetchpriority="low" />
             </div>`
        ).join('');
        thumbStrip.querySelectorAll('img').forEach((imgEl) => {
            imgEl.onerror = () => {
                const thumb = imgEl.closest('.thumb');
                if (thumb) thumb.remove();
            };
        });
    } else {
        mainImg.style.display = 'none';
        thumbStrip.innerHTML = '';
    }

    // Ingredients
    const list = document.getElementById('detailIngredientsList');
    const wrap = document.getElementById('detailIngredientsWrap');
    if (item.ingredients && item.ingredients.length > 0) {
        wrap.style.display = 'block';
        list.innerHTML = item.ingredients.map(ing => `<li>${ing}</li>`).join('');
    } else {
        wrap.style.display = 'none';
    }

    document.getElementById('detailAddBtn').onclick = () => { addItem(item.id); closeProductModal(); };

    document.getElementById('productOverlay').classList.add('open');
    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function setDetailImg(src, thumb) {
    const mainDetailImg = document.getElementById('mainDetailImg');
    window.setSafeImageSource(mainDetailImg, src, {
        onMissing: () => {
            mainDetailImg.style.display = 'none';
        },
        displayValue: 'block'
    });
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productOverlay').classList.remove('open');
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}

// ═══════════════════════ EVENT BOOKING ═══════════════════════
let currentEventType = '';

function openEventModal(type) {
    currentEventType = type;
    const overlay = document.getElementById('eventBookingOverlay');
    const modal = document.getElementById('eventBookingModal');
    const title = document.getElementById('eventBookingTitle');
    const icon = document.getElementById('eventBookingIcon');

    if (!modal || !overlay) return;

    // Reset inputs for each new opening
    const nameInput = document.getElementById('eventCustName');
    const phoneInput = document.getElementById('eventCustPhone');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';

    title.textContent = t('event_booking_title_prefix', `Réserver : ${type}`, { type });

    // Set dynamic icons based on type
    const icons = {
        'Anniversaire': '🎂',
        'Réunion Familiale': '👨‍👩‍👧‍👦',
        'Événement Corporate': '🏢',
        'Fête Privée': '🎉'
    };
    icon.textContent = icons[type] || '📅';

    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    document.getElementById('eventBookingOverlay').classList.remove('open');
    document.getElementById('eventBookingModal').classList.remove('open');
    document.body.style.overflow = '';
}

function sendEventWA() {
    const name = document.getElementById('eventCustName').value.trim();
    const phone = document.getElementById('eventCustPhone').value.trim();

    if (!name) {
        alert(t('event_booking_name_required', 'Veuillez entrer votre nom.'));
        document.getElementById('eventCustName').focus();
        return;
    }
    if (!phone) {
        alert(t('event_booking_phone_required', 'Veuillez entrer votre numéro de téléphone.'));
        document.getElementById('eventCustPhone').focus();
        return;
    }

    const waNum = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(socialLinks.whatsapp || '').replace(/\D/g, '');
    if (!waNum) {
        alert(window.getTranslation('social_empty', 'Aucun lien configuré.'));
        return;
    }
    const restaurantName = typeof window.getRestaurantShortName === 'function'
        ? window.getRestaurantShortName()
        : 'Restaurant';
    let msg = `✨ *${t('wa_event_title', 'RÉSERVATION ÉVÉNEMENT – {restaurant}', { restaurant: restaurantName.toUpperCase() })}*\n━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 *${t('ticket_type_label', 'Type')}:* ${currentEventType}\n`;
    msg += `👤 *${t('wa_client_label', 'Client')}:* ${name}\n`;
    msg += `📱 *${t('wa_phone_label', 'Tél')}:* ${phone}\n`;
    msg += `━━━━━━━━━━━━━━━━\n\n🙏 ${t('wa_contact_confirm', 'Merci de me contacter pour confirmer les détails !')}`;

    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    closeEventModal();
}
