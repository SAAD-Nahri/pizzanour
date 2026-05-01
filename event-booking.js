let eventModalStylesheetPromise = null;
let currentEventType = '';
let previousEventBookingBodyOverflow = '';

function cleanEventBookingField(value, maxLength = 80) {
    return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function getEventBookingWhatsAppUrl(number, message) {
    const digits = String(number || '').replace(/\D/g, '');
    return digits ? `https://wa.me/${encodeURIComponent(digits)}?text=${encodeURIComponent(message)}` : '';
}

const EVENT_TYPE_META = {
    birthday: { icon: '🎂', labelKey: 'event_birthday' },
    family: { icon: '👨‍👩‍👧‍👦', labelKey: 'event_family' },
    corporate: { icon: '🏢', labelKey: 'event_corporate' },
    party: { icon: '🎉', labelKey: 'event_party' }
};

function getEventTypeMeta(type = currentEventType) {
    const aliases = {
        Anniversaire: 'birthday',
        birthday: 'birthday',
        Réunion: 'family',
        'Réunion Familiale': 'family',
        family: 'family',
        Business: 'corporate',
        'Événement Corporate': 'corporate',
        corporate: 'corporate',
        Romantique: 'party',
        'Fête Privée': 'party',
        party: 'party'
    };
    const normalizedType = aliases[type] || type;
    return EVENT_TYPE_META[normalizedType] || { icon: '📅', labelKey: '' };
}

function getLocalizedEventType(type = currentEventType) {
    const meta = getEventTypeMeta(type);
    return meta.labelKey && typeof window.getTranslation === 'function'
        ? window.getTranslation(meta.labelKey, type)
        : type;
}

function refreshEventBookingCopy() {
    const title = document.getElementById('eventBookingTitle');
    const icon = document.getElementById('eventBookingIcon');
    const localizedType = getLocalizedEventType();
    if (title && currentEventType) {
        title.textContent = window.formatTranslation('event_booking_title_prefix', `Réserver : ${localizedType}`, { type: localizedType });
    }
    if (icon) {
        icon.textContent = getEventTypeMeta().icon;
    }
}

function ensureEventModalStylesheet() {
    if (document.getElementById('eventModalStylesheet')) {
        return Promise.resolve();
    }
    if (eventModalStylesheetPromise) {
        return eventModalStylesheetPromise;
    }

    eventModalStylesheetPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.id = 'eventModalStylesheet';
        link.rel = 'stylesheet';
        link.href = 'event-modal.css';
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('event_modal_css_failed'));
        document.head.appendChild(link);
    });

    return eventModalStylesheetPromise;
}

function notifyEventBookingIssue(message, focusTarget = null) {
    if (typeof window.showToast === 'function') {
        window.showToast(message);
    } else {
        alert(message);
    }
    focusTarget?.focus?.();
}

window.__eventBookingOpen = async function __eventBookingOpen(type) {
    currentEventType = type;
    const overlay = document.getElementById('eventBookingOverlay');
    const modal = document.getElementById('eventBookingModal');

    if (!modal || !overlay) return;

    try {
        await ensureEventModalStylesheet();
    } catch (error) {
        console.error('Failed to load event modal stylesheet:', error);
    }

    const nameInput = document.getElementById('eventCustName');
    const phoneInput = document.getElementById('eventCustPhone');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';

    refreshEventBookingCopy();

    overlay.classList.add('open');
    modal.classList.add('open');
    previousEventBookingBodyOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
};

window.__eventBookingClose = function __eventBookingClose() {
    document.getElementById('eventBookingOverlay')?.classList.remove('open');
    document.getElementById('eventBookingModal')?.classList.remove('open');
    document.body.style.overflow = previousEventBookingBodyOverflow;
    previousEventBookingBodyOverflow = '';
};

window.__eventBookingSend = function __eventBookingSend() {
    const nameInput = document.getElementById('eventCustName');
    const phoneInput = document.getElementById('eventCustPhone');
    const name = cleanEventBookingField(nameInput?.value, 80);
    const phone = cleanEventBookingField(phoneInput?.value, 40);

    if (!name) {
        notifyEventBookingIssue(
            window.formatTranslation('event_booking_name_required', 'Veuillez entrer votre nom.'),
            nameInput
        );
        return;
    }
    if (!phone) {
        notifyEventBookingIssue(
            window.formatTranslation('event_booking_phone_required', 'Veuillez entrer votre numéro de téléphone.'),
            phoneInput
        );
        return;
    }

    if (nameInput) nameInput.value = name;
    if (phoneInput) phoneInput.value = phone;

    const waNum = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(window.defaultConfig?.socials?.whatsapp || '').replace(/\D/g, '');
    if (!waNum) {
        notifyEventBookingIssue(window.getTranslation('social_empty', 'Aucun lien configuré.'));
        return;
    }

    const restaurantName = typeof window.getRestaurantShortName === 'function'
        ? window.getRestaurantShortName()
        : 'Restaurant';
    let msg = `✨ *${window.formatTranslation('wa_event_title', 'RÉSERVATION ÉVÉNEMENT – {restaurant}', { restaurant: restaurantName.toUpperCase() })}*\n━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 *${window.formatTranslation('ticket_type_label', 'Type')}:* ${getLocalizedEventType()}\n`;
    msg += `👤 *${window.formatTranslation('wa_client_label', 'Client')}:* ${name}\n`;
    msg += `📱 *${window.formatTranslation('wa_phone_label', 'Tél')}:* ${phone}\n`;
    msg += `━━━━━━━━━━━━━━━━\n\n🙏 ${window.formatTranslation('wa_contact_confirm', 'Merci de me contacter pour confirmer les détails !')}`;

    const whatsappUrl = getEventBookingWhatsAppUrl(waNum, msg);
    const opened = whatsappUrl && (typeof window.openSafeExternalUrl === 'function'
        ? window.openSafeExternalUrl(whatsappUrl, '_blank')
        : window.open(whatsappUrl, '_blank', 'noopener,noreferrer'));
    if (!opened) {
        notifyEventBookingIssue(window.getTranslation('wa_popup_blocked_text', 'Votre navigateur a bloqué l’ouverture de WhatsApp pour cette commande.'));
        return;
    }
    window.__eventBookingClose();
};

window.__eventBookingReady = true;
window.__eventBookingRefresh = refreshEventBookingCopy;
