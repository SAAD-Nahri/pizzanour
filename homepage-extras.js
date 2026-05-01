function homepageState() {
    return typeof window.__homepageGetState === 'function'
        ? window.__homepageGetState()
        : {};
}

function tx(key, fallback, vars) {
    if (typeof window.formatTranslation === 'function') {
        return window.formatTranslation(key, fallback, vars);
    }
    if (typeof window.getTranslation === 'function') {
        return window.getTranslation(key, fallback);
    }
    return fallback;
}

function escapeHomepageAttr(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildSocialLinkMarkup({ href, className, icon, label, iconOnly = false }) {
    const safeHref = escapeHomepageAttr(href);
    const safeLabel = escapeHomepageAttr(label);
    const safeClass = escapeHomepageAttr(className || '');
    const safeIcon = escapeHomepageAttr(icon);
    const body = iconOnly
        ? safeIcon
        : `<span>${safeIcon}</span> ${safeLabel}`;
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="${safeClass}" aria-label="${safeLabel}" title="${safeLabel}">${body}</a>`;
}

const HOURS_DAY_I18N_KEYS = {
    lundi: 'day_mon',
    monday: 'day_mon',
    'الاثنين': 'day_mon',
    mardi: 'day_tue',
    tuesday: 'day_tue',
    'الثلاثاء': 'day_tue',
    mercredi: 'day_wed',
    wednesday: 'day_wed',
    'الأربعاء': 'day_wed',
    jeudi: 'day_thu',
    thursday: 'day_thu',
    'الخميس': 'day_thu',
    vendredi: 'day_fri',
    friday: 'day_fri',
    'الجمعة': 'day_fri',
    samedi: 'day_sat',
    saturday: 'day_sat',
    'السبت': 'day_sat',
    dimanche: 'day_sun',
    sunday: 'day_sun',
    'الأحد': 'day_sun'
};

function getHoursDayI18nKey(hourEntry) {
    const explicitKey = typeof hourEntry?.i18n === 'string' && hourEntry.i18n.trim()
        ? hourEntry.i18n.trim()
        : '';
    if (explicitKey) return explicitKey;

    const dayName = String(hourEntry?.day || '').trim().toLowerCase();
    return HOURS_DAY_I18N_KEYS[dayName] || '';
}

function ensureDeferredHomepageDom() {
    const root = document.getElementById('homepageDeferredRoot');
    const template = document.getElementById('homepageDeferredTemplate');
    if (!root || !template || root.childElementCount > 0) {
        return;
    }

    root.appendChild(template.content.cloneNode(true));
}

function renderHours() {
    ensureDeferredHomepageDom();
    const grid = document.getElementById('hoursGrid');
    const noteEl = document.getElementById('hoursNote');
    if (!grid) return;

    const hours = Array.isArray(window.restaurantConfig?._hours) && window.restaurantConfig._hours.length > 0
        ? window.restaurantConfig._hours
        : window.defaultHours;
    const currentLang = window.currentLang || document.documentElement.lang || 'fr';
    const customNote = window.restaurantConfig?._hoursNote || '';
    const shouldUseTranslatedDefaultNote = !customNote || currentLang !== 'fr';
    const note = shouldUseTranslatedDefaultNote
        ? tx('hours_note_default', window.defaultHoursNote || customNote || '')
        : customNote;

    grid.innerHTML = hours.map(h => {
        const dayKey = getHoursDayI18nKey(h);
        const dayLabel = dayKey ? tx(dayKey, h.day) : h.day;
        const dayI18nAttr = dayKey ? ` data-i18n="${dayKey}"` : '';
        const openTime = escapeHomepageAttr(h.open);
        const closeTime = escapeHomepageAttr(h.close);
        return `
        <div class="hours-row${h.highlight ? ' highlight-row' : ''}">
            <span class="hours-day"${dayI18nAttr}>${escapeHomepageAttr(dayLabel)}</span>
            <span class="hours-dash"></span>
            <span class="hours-time">${openTime} - ${closeTime}</span>
        </div>
    `;
    }).join('');

    if (noteEl) {
        if (shouldUseTranslatedDefaultNote && window.defaultHoursNote) {
            noteEl.setAttribute('data-i18n', 'hours_note_default');
        } else {
            noteEl.removeAttribute('data-i18n');
        }
        noteEl.textContent = note;
    }

    // Today's hours for contact section
    const contactTodayHours = document.getElementById('contactTodayHours');
    if (contactTodayHours) {
        const todayIndex = new Date().getDay();
        const mondayFirstIndex = todayIndex === 0 ? 6 : todayIndex - 1;
        const todayData = hours[mondayFirstIndex] || hours[0];
        if (todayData) {
            contactTodayHours.textContent = `${todayData.open} - ${todayData.close}`;
        }
    }
}

function updateWifiUI() {
    const { wifiData = {} } = homepageState();
    const ssidEl = document.getElementById('wifiSSIDDisplay');
    const passEl = document.getElementById('wifiPass');
    const qrEl = document.getElementById('wifiQR');
    const wifiSsid = (typeof wifiData?.ssid === 'string' && wifiData.ssid.trim())
        ? wifiData.ssid.trim()
        : tx('wifi_default_name', 'Restaurant WiFi');
    const wifiPass = (typeof wifiData?.pass === 'string' && wifiData.pass.trim())
        ? wifiData.pass.trim()
        : tx('wifi_default_code_help', 'Ask the team');
    if (ssidEl) ssidEl.innerHTML = `<strong>${escapeHomepageAttr(tx('wifi_ssid_label', 'SSID'))}:</strong> ${escapeHomepageAttr(wifiSsid)}`;
    if (passEl) passEl.textContent = wifiPass;
    if (qrEl) {
        qrEl.width = 160;
        qrEl.height = 160;
        qrEl.loading = 'lazy';
        qrEl.decoding = 'async';
        qrEl.fetchPriority = 'low';
        qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WIFI:S:${encodeURIComponent(wifiSsid)};T:WPA;P:${encodeURIComponent(wifiPass)};;`;
    }
}

function updateWhatsAppLinks() {
    ensureDeferredHomepageDom();
    const { socialLinks = {} } = homepageState();
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
            contactLink.textContent = window.restaurantConfig?.phone || tx('social_whatsapp', 'WhatsApp');
            return;
        }

        contactLink.href = `https://wa.me/${wa}`;
        contactLink.textContent = socialLinks.whatsapp ? `+${wa}` : (window.restaurantConfig?.phone || `+${wa}`);
    }
}

function setHomepageExternalActionLink(link, url) {
    if (!link) return;
    if (url) {
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.removeAttribute('aria-disabled');
        link.removeAttribute('tabindex');
        link.classList.remove('is-disabled');
        return;
    }
    link.removeAttribute('href');
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');
    link.classList.add('is-disabled');
}

function renderSocialLinks() {
    ensureDeferredHomepageDom();
    const { socialLinks = {} } = homepageState();
    const modalList = document.getElementById('modalSocialList');
    const footerContainer = document.getElementById('footerSocial');
    const contactSocialLinks = document.getElementById('contactSocialLinks');

    let modalItems = '';
    let footerIcons = '';
    let contactButtons = '';

    const appendSocialLink = ({ href, label, icon, modalClass }) => {
        modalItems += buildSocialLinkMarkup({ href, className: modalClass, icon, label });
        footerIcons += buildSocialLinkMarkup({ href, className: 'footer-social-icon', icon, label, iconOnly: true });
        contactButtons += buildSocialLinkMarkup({ href, className: 'social-btn', icon, label });
    };

    const instagramUrl = window.getSafeExternalUrl(socialLinks.instagram);
    const facebookUrl = window.getSafeExternalUrl(socialLinks.facebook);
    const tiktokUrl = window.getSafeExternalUrl(socialLinks.tiktok);
    const tripAdvisorUrl = window.getSafeExternalUrl(socialLinks.tripadvisor);

    if (instagramUrl) {
        appendSocialLink({ href: instagramUrl, label: tx('social_instagram', 'Instagram'), icon: '📸', modalClass: 'social-link-item instagram' });
    }
    if (facebookUrl) {
        appendSocialLink({ href: facebookUrl, label: tx('social_facebook', 'Facebook'), icon: '📘', modalClass: 'social-link-item facebook' });
    }
    if (tiktokUrl) {
        appendSocialLink({ href: tiktokUrl, label: tx('social_tiktok', 'TikTok'), icon: '🎵', modalClass: 'social-link-item tiktok' });
    }
    if (tripAdvisorUrl) {
        appendSocialLink({ href: tripAdvisorUrl, label: tx('social_tripadvisor', 'TripAdvisor'), icon: '⭐', modalClass: 'social-link-item' });
    }
    const waNumber = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(socialLinks.whatsapp || '').replace(/\D/g, '');
    if (waNumber) {
        appendSocialLink({
            href: `https://wa.me/${encodeURIComponent(waNumber)}`,
            label: tx('social_whatsapp', 'WhatsApp'),
            icon: '📞',
            modalClass: 'social-link-item whatsapp'
        });
    }

    const emptyText = typeof window.getTranslation === 'function'
        ? window.getTranslation('social_empty', 'Aucun lien configuré.')
        : 'Aucun lien configuré.';
    const emptyStateHtml = `
        <div class="website-empty-state is-social">
            <strong>${typeof window.getTranslation === 'function'
                ? escapeHomepageAttr(window.getTranslation('social_modal_title', 'Nos réseaux'))
                : 'Nos réseaux'}</strong>
            <span>${escapeHomepageAttr(emptyText)}</span>
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
    ensureDeferredHomepageDom();
    const grid = document.getElementById('mainGalleryGrid');
    if (!grid) return;
    const gallerySection = document.getElementById('gallery');

    const images = (window.restaurantConfig?.gallery || []).map((img) => {
        if (typeof img !== 'string') return img;
        // Prefer built-in WebP gallery assets when callers still reference the old PNGs.
        if (img.startsWith('images/gallery_') && img.toLowerCase().endsWith('.png')) {
            return img.replace(/\.png$/i, '.webp');
        }
        return img;
    });
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

    grid.innerHTML = images.map(img => {
        const safeSrc = escapeHomepageAttr(img);
        const inlineSrc = JSON.stringify(String(img || ''));
        return `
        <div class="gallery-item" onclick="openGalleryLightbox(${escapeHomepageAttr(inlineSrc)})">
            <img src="${safeSrc}" alt="${escapeHomepageAttr(tx('image_alt_gallery', 'Gallery image'))}" width="640" height="640" loading="lazy" decoding="async" fetchpriority="low" />
        </div>
    `;
    }).join('');
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
    ensureDeferredHomepageDom();
    const addressText = document.getElementById('contactAddressText');
    const footerAddressText = document.getElementById('footerAddressText');
    const addressCard = document.getElementById('contactAddressCard');
    const topAddressText = document.getElementById('topAddressDisplay');
    const topPhoneText = document.getElementById('topPhoneDisplay');
    const contactPhoneLink = document.getElementById('contactPhoneLink');
    const directionsLink = document.getElementById('directionsLink');
    const reviewsLink = document.getElementById('reviewsLink');
    const footerTagline = document.getElementById('footerTaglineText');
    const footerName = document.getElementById('brandNameFooter');
    const footerLogo = document.getElementById('brandLogoIconFooter');
    const locationConfig = window.restaurantConfig?.location && typeof window.restaurantConfig.location === 'object'
        ? window.restaurantConfig.location
        : {};
    const locationAddress = typeof locationConfig.address === 'string'
        ? locationConfig.address.trim()
        : '';

    if (footerTagline) {
        const translatedFooterNote = typeof window.getTranslation === 'function'
            ? window.getTranslation('footer_note', '')
            : '';
        const brandingTagline = typeof window.restaurantConfig?.branding?.tagline === 'string'
            ? window.restaurantConfig.branding.tagline.trim()
            : '';
        footerTagline.textContent = translatedFooterNote || brandingTagline;
    }
    if (footerName && window.restaurantConfig?.branding?.restaurantName) {
        footerName.textContent = window.restaurantConfig.branding.restaurantName;
    }
    if (footerLogo && window.restaurantConfig?.branding?.logoMark) {
        footerLogo.textContent = window.restaurantConfig.branding.logoMark;
    }

    if (locationAddress) {
        if (addressText) addressText.textContent = locationAddress;
        if (footerAddressText) footerAddressText.textContent = locationAddress;
        if (topAddressText) topAddressText.textContent = `📍 ${locationAddress}`;
        const mapUrl = window.getSafeExternalUrl(locationConfig.url);
        if (addressCard && mapUrl) {
            addressCard.onclick = () => {
                window.openSafeExternalUrl(mapUrl, '_blank');
            };
            addressCard.classList.add('is-actionable');
        } else if (addressCard) {
            addressCard.onclick = null;
            addressCard.classList.remove('is-actionable');
        }
        setHomepageExternalActionLink(directionsLink, mapUrl);
        setHomepageExternalActionLink(reviewsLink, mapUrl);
    } else {
        if (addressCard) {
            addressCard.onclick = null;
            addressCard.classList.remove('is-actionable');
        }
        if (addressText) {
            addressText.textContent = typeof window.getTranslation === 'function'
                ? window.getTranslation('landing_address_placeholder', 'Restaurant address')
                : 'Restaurant address';
        }
        if (footerAddressText) footerAddressText.textContent = '';
        if (topAddressText) topAddressText.textContent = '';
        setHomepageExternalActionLink(directionsLink, '');
        setHomepageExternalActionLink(reviewsLink, '');
    }

    if (window.restaurantConfig?.phone) {
        if (topPhoneText) topPhoneText.textContent = `📞 ${window.restaurantConfig.phone}`;
        if (contactPhoneLink) {
            const phoneHref = window.getSafePhoneHref(window.restaurantConfig.phone);
            if (phoneHref) {
                contactPhoneLink.href = phoneHref;
            } else {
                contactPhoneLink.removeAttribute('href');
            }
            contactPhoneLink.textContent = window.restaurantConfig.phone;
        }
    }

    if (!window.restaurantConfig?.phone) {
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
    ensureDeferredHomepageDom();
    const { guestExperience = {} } = homepageState();
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

    const renderExperienceItem = (item) => {
        const label = typeof window.getTranslation === 'function'
            ? window.getTranslation(item.labelKey, item.labelKey)
            : item.labelKey;
        return `
            <div class="pf-icon-item">
              <span class="pf-icon">${escapeHomepageAttr(item.icon)}</span>
              <span class="pf-label" data-i18n="${escapeHomepageAttr(item.labelKey)}">${escapeHomepageAttr(label)}</span>
            </div>
        `;
    };

    const paymentItems = (guestExperience.paymentMethods || [])
        .map((id) => paymentCatalog[id])
        .filter(Boolean)
        .map(renderExperienceItem)
        .join('');

    const facilityItems = (guestExperience.facilities || [])
        .map((id) => facilityCatalog[id])
        .filter(Boolean)
        .map(renderExperienceItem)
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
    ensureDeferredHomepageDom();
    const { sectionVisibility = {}, sectionOrder = [], defaultSectionVisibility = {} } = homepageState();
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

window.__homepageOpenGalleryLightbox = function __homepageOpenGalleryLightbox() {
    window.showToast(window.getTranslation('lightbox_soon', 'Aperçu photo à venir'));
};

window.__homepageOpenSocialModal = function __homepageOpenSocialModal() {
    document.getElementById('socialOverlay')?.classList.add('open');
    document.getElementById('socialModal')?.classList.add('open');
};

window.__homepageCloseSocialModal = function __homepageCloseSocialModal() {
    document.getElementById('socialOverlay')?.classList.remove('open');
    document.getElementById('socialModal')?.classList.remove('open');
};

window.__homepageOpenWifiModal = function __homepageOpenWifiModal() {
    document.getElementById('wifiOverlay')?.classList.add('open');
    document.getElementById('wifiModal')?.classList.add('open');
};

window.__homepageCloseWifiModal = function __homepageCloseWifiModal() {
    document.getElementById('wifiOverlay')?.classList.remove('open');
    document.getElementById('wifiModal')?.classList.remove('open');
};

window.__homepageCopyWifi = function __homepageCopyWifi() {
    const pass = document.getElementById('wifiPass')?.textContent || '';
    navigator.clipboard.writeText(pass).then(() => {
        window.showToast(tx('wifi_password_copied', 'Mot de passe copié !'));
    });
};

window.__homepageRenderLocation = renderLocation;
window.__homepageRenderDeferredSections = function __homepageRenderDeferredSections() {
    renderSocialLinks();
    renderHours();
    renderGallery();
    renderLocation();
    renderPaymentFacilities();
    renderSectionLayout();
    updateWifiUI();
    updateWhatsAppLinks();
};

window.__homepageExtrasReady = true;
