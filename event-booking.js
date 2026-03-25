let eventModalStylesheetPromise = null;
let currentEventType = '';

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

window.__eventBookingOpen = async function __eventBookingOpen(type) {
    currentEventType = type;
    const overlay = document.getElementById('eventBookingOverlay');
    const modal = document.getElementById('eventBookingModal');
    const title = document.getElementById('eventBookingTitle');
    const icon = document.getElementById('eventBookingIcon');

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

    if (title) {
        title.textContent = window.formatTranslation('event_booking_title_prefix', `Reserver : ${type}`, { type });
    }

    const icons = {
        Anniversaire: '🎂',
        'Réunion Familiale': '👨‍👩‍👧‍👦',
        'Événement Corporate': '🏢',
        'Fête Privée': '🎉'
    };
    if (icon) {
        icon.textContent = icons[type] || '📅';
    }

    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.__eventBookingClose = function __eventBookingClose() {
    document.getElementById('eventBookingOverlay')?.classList.remove('open');
    document.getElementById('eventBookingModal')?.classList.remove('open');
    document.body.style.overflow = '';
};

window.__eventBookingSend = function __eventBookingSend() {
    const nameInput = document.getElementById('eventCustName');
    const phoneInput = document.getElementById('eventCustPhone');
    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';

    if (!name) {
        alert(window.formatTranslation('event_booking_name_required', 'Veuillez entrer votre nom.'));
        nameInput?.focus();
        return;
    }
    if (!phone) {
        alert(window.formatTranslation('event_booking_phone_required', 'Veuillez entrer votre numéro de téléphone.'));
        phoneInput?.focus();
        return;
    }

    const waNum = typeof window.getWhatsAppNumber === 'function'
        ? window.getWhatsAppNumber()
        : String(window.defaultConfig?.socials?.whatsapp || '').replace(/\D/g, '');
    if (!waNum) {
        alert(window.getTranslation('social_empty', 'Aucun lien configuré.'));
        return;
    }

    const restaurantName = typeof window.getRestaurantShortName === 'function'
        ? window.getRestaurantShortName()
        : 'Restaurant';
    let msg = `✨ *${window.formatTranslation('wa_event_title', 'RÉSERVATION ÉVÉNEMENT – {restaurant}', { restaurant: restaurantName.toUpperCase() })}*\n━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 *${window.formatTranslation('ticket_type_label', 'Type')}:* ${currentEventType}\n`;
    msg += `👤 *${window.formatTranslation('wa_client_label', 'Client')}:* ${name}\n`;
    msg += `📱 *${window.formatTranslation('wa_phone_label', 'Tél')}:* ${phone}\n`;
    msg += `━━━━━━━━━━━━━━━━\n\n🙏 ${window.formatTranslation('wa_contact_confirm', 'Merci de me contacter pour confirmer les détails !')}`;

    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    window.__eventBookingClose();
};

window.__eventBookingReady = true;
