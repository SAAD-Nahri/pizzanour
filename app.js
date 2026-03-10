// WhatsApp management moved to socialLinks (Persistence Layer)
// const WHATSAPP_NUMBER = '212626081745';

// Default Data — Full Menu from Restaurant Board
const defaultMenu = [
    // ═══════════════════════ BURGERS ═══════════════════════
    { id: 1, cat: 'Burgers', name: 'Cheese-Burger', desc: '1 Steak, Fromage, Salade', ingredients: ['Steak haché', 'Fromage', 'Salade', 'Sauce'], price: 22, images: [] },
    { id: 2, cat: 'Burgers', name: 'Quality-Burger', desc: '1 Steak, Oeuf, Fromage, Salade', ingredients: ['Steak haché', 'Oeuf', 'Fromage', 'Salade'], price: 25, images: [] },
    { id: 3, cat: 'Burgers', name: 'Double-Cheese', desc: '2 Steaks, Fromage, Salade', ingredients: ['2 Steaks hachés', 'Fromage', 'Salade', 'Sauce'], price: 32, images: [] },
    { id: 4, cat: 'Burgers', name: 'Triple-Burger', desc: '3 Steaks, Fromage, Salade', ingredients: ['3 Steaks hachés', 'Fromage', 'Salade', 'Sauce'], price: 50, badge: 'XXL', images: [] },
    { id: 5, cat: 'Burgers', name: 'Bigg-Burger', desc: '2 Steaks, Fromage, Salade', ingredients: ['2 Steaks hachés', 'Fromage', 'Salade', 'Sauce'], price: 33, images: [] },
    { id: 6, cat: 'Burgers', name: 'Chicken-Burger', desc: '1 Steak Poulet, Fromage, Salade', ingredients: ['Steak poulet', 'Fromage', 'Salade', 'Sauce'], price: 24, images: [] },
    { id: 7, cat: 'Burgers', name: 'Roasty Chicken', desc: 'Poulet rôti, Fromage, Salade', ingredients: ['Poulet rôti', 'Fromage', 'Salade'], price: 28, images: [] },
    { id: 8, cat: 'Burgers', name: 'Fish-Supreme', desc: 'Filet de poisson, Fromage, Salade', ingredients: ['Filet de poisson', 'Fromage', 'Salade', 'Sauce tartare'], price: 28, images: [] },
    { id: 9, cat: 'Burgers', name: 'Menu Enfants', desc: 'Burger + Cheese + Frites + Boisson', ingredients: ['Mini burger', 'Fromage', 'Frites', 'Boisson'], price: 40, badge: 'Kids', images: [] },

    // ═══════════════════ SANDWICH FROID ═══════════════════
    { id: 10, cat: 'Sandwich Froid', name: 'Sandwich Thon', desc: 'Thon, Salade, Frites', ingredients: ['Thon', 'Salade', 'Frites', 'Mayonnaise'], price: 15, images: [] },
    { id: 11, cat: 'Sandwich Froid', name: 'Sandwich Mortadelle', desc: 'Mortadelle, Salade, Frites', ingredients: ['Mortadelle', 'Salade', 'Frites'], price: 12, images: [] },
    { id: 12, cat: 'Sandwich Froid', name: 'Sandwich Cacher', desc: 'Cacher, Salade, Frites', ingredients: ['Cacher', 'Salade', 'Frites'], price: 12, images: [] },
    { id: 13, cat: 'Sandwich Froid', name: 'Sandwich Oeuf', desc: 'Oeuf, Salade, Frites', ingredients: ['Oeuf', 'Salade', 'Frites'], price: 12, images: [] },
    { id: 14, cat: 'Sandwich Froid', name: 'Sandwich Tortilla', desc: 'Tortilla, Salade, Frites', ingredients: ['Tortilla', 'Salade', 'Frites'], price: 15, images: [] },
    { id: 15, cat: 'Sandwich Froid', name: 'Sandwich Tortilla Spéciale', desc: 'Tortilla spéciale, Salade, Frites', ingredients: ['Tortilla', 'Garniture spéciale', 'Salade', 'Frites'], price: 20, badge: 'Spécial', images: [] },

    // ═══════════════════ SANDWICH CHAUD ═══════════════════
    { id: 16, cat: 'Sandwich Chaud', name: 'Sandwich Escalope', desc: 'Escalope grillée, Salade, Frites', ingredients: ['Escalope', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    { id: 17, cat: 'Sandwich Chaud', name: 'Sandwich Poulet', desc: 'Poulet grillé, Salade, Frites', ingredients: ['Poulet', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    { id: 18, cat: 'Sandwich Chaud', name: 'Sandwich Viande Hachée', desc: 'Viande hachée, Salade, Frites', ingredients: ['Viande hachée', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    { id: 19, cat: 'Sandwich Chaud', name: 'Sandwich Saucisse', desc: 'Saucisse grillée, Salade, Frites', ingredients: ['Saucisse', 'Salade', 'Frites', 'Sauce'], price: 25, images: [] },
    { id: 20, cat: 'Sandwich Chaud', name: 'Sandwich Fruits de Mer', desc: 'Fruits de mer, Salade, Frites', ingredients: ['Crevettes', 'Calamar', 'Salade', 'Frites'], price: 40, badge: 'Premium', images: [] },
    { id: 21, cat: 'Sandwich Chaud', name: 'Sandwich Foie', desc: 'Foie grillé, Salade, Frites', ingredients: ['Foie', 'Salade', 'Frites', 'Oignons'], price: 35, images: [] },
    { id: 22, cat: 'Sandwich Chaud', name: 'Sandwich Mixte', desc: 'Mix viandes, Salade, Frites', ingredients: ['Mix viandes', 'Salade', 'Frites', 'Sauce'], price: 35, images: [] },
    { id: 23, cat: 'Sandwich Chaud', name: 'Sandwich Cordon Bleu', desc: 'Cordon bleu, Salade, Frites', ingredients: ['Cordon bleu', 'Fromage', 'Salade', 'Frites'], price: 27, images: [] },
    { id: 24, cat: 'Sandwich Chaud', name: 'Sandwich Chawarma', desc: 'Chawarma, Salade, Frites', ingredients: ['Chawarma', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },

    // ═══════════════════════ PLATS ═══════════════════════
    { id: 25, cat: 'Plats', name: 'Plat Poulet', desc: 'Poulet grillé avec riz ou frites, salade', ingredients: ['Poulet', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 26, cat: 'Plats', name: 'Plat Viande Hachée', desc: 'Viande hachée avec riz ou frites, salade', ingredients: ['Viande hachée', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 27, cat: 'Plats', name: 'Plat Chawarma', desc: 'Chawarma avec riz ou frites, salade', ingredients: ['Chawarma', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 28, cat: 'Plats', name: 'Plat Saucisse', desc: 'Saucisse avec riz ou frites, salade', ingredients: ['Saucisse', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 29, cat: 'Plats', name: 'Plat Cordon Bleu', desc: 'Cordon bleu avec riz ou frites, salade', ingredients: ['Cordon bleu', 'Riz ou Frites', 'Salade'], price: 45, images: [] },
    { id: 30, cat: 'Plats', name: 'Plat Foie', desc: 'Foie grillé avec riz ou frites, salade', ingredients: ['Foie', 'Riz ou Frites', 'Salade'], price: 45, images: [] },
    { id: 31, cat: 'Plats', name: 'Plat Fruits de Mer', desc: 'Fruits de mer avec riz ou frites, salade', ingredients: ['Crevettes', 'Calamar', 'Riz ou Frites', 'Salade'], price: 50, badge: 'Premium', images: [] },
    { id: 32, cat: 'Plats', name: 'Plat Mixte', desc: 'Mix viandes avec riz ou frites, salade', ingredients: ['Mix viandes', 'Riz ou Frites', 'Salade'], price: 50, images: [] },
    { id: 33, cat: 'Plats', name: 'Plat Escalope', desc: 'Escalope avec riz ou frites, salade', ingredients: ['Escalope', 'Riz ou Frites', 'Salade'], price: 40, images: [] },

    // ═══════════════════════ PANINIS ═══════════════════════
    { id: 34, cat: 'Paninis', name: 'Panini Thon', desc: 'Panini grillé au thon', ingredients: ['Thon', 'Fromage', 'Sauce'], price: 18, images: [] },
    { id: 35, cat: 'Paninis', name: 'Panini Fromage', desc: 'Panini grillé fromage fondu', ingredients: ['Fromage fondu', 'Herbes'], price: 18, images: [] },
    { id: 36, cat: 'Paninis', name: 'Panini Poulet', desc: 'Panini grillé au poulet', ingredients: ['Poulet', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 37, cat: 'Paninis', name: 'Panini Viande Hachée', desc: 'Panini grillé viande hachée', ingredients: ['Viande hachée', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 38, cat: 'Paninis', name: 'Panini Saucisse', desc: 'Panini grillé saucisse', ingredients: ['Saucisse', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 39, cat: 'Paninis', name: 'Panini Chawarma', desc: 'Panini grillé chawarma', ingredients: ['Chawarma', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 40, cat: 'Paninis', name: 'Panini Fruits de Mer', desc: 'Panini grillé fruits de mer', ingredients: ['Crevettes', 'Calamar', 'Fromage', 'Sauce'], price: 35, images: [] },
    { id: 41, cat: 'Paninis', name: 'Panini Mixte', desc: 'Panini grillé mixte', ingredients: ['Mix viandes', 'Fromage', 'Sauce'], price: 35, images: [] },

    // ═══════════════════════ TACOS ═══════════════════════
    { id: 42, cat: 'Tacos', name: 'Tacos Poulet (L)', desc: 'Poulet, fromage, sauce', ingredients: ['Poulet', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 43, cat: 'Tacos', name: 'Tacos Poulet (XL)', desc: 'Poulet, fromage, sauce — XL', ingredients: ['Poulet (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 44, cat: 'Tacos', name: 'Tacos Viande Hachée (L)', desc: 'Viande hachée, fromage, sauce', ingredients: ['Viande hachée', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 45, cat: 'Tacos', name: 'Tacos Viande Hachée (XL)', desc: 'Viande hachée, fromage, sauce — XL', ingredients: ['Viande hachée (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 46, cat: 'Tacos', name: 'Tacos Cordon Bleu (L)', desc: 'Cordon bleu, fromage, sauce', ingredients: ['Cordon bleu', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 47, cat: 'Tacos', name: 'Tacos Cordon Bleu (XL)', desc: 'Cordon bleu, fromage, sauce — XL', ingredients: ['Cordon bleu (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 48, cat: 'Tacos', name: 'Tacos Nuggets (L)', desc: 'Nuggets, fromage, sauce', ingredients: ['Nuggets', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 49, cat: 'Tacos', name: 'Tacos Nuggets (XL)', desc: 'Nuggets, fromage, sauce — XL', ingredients: ['Nuggets (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 50, cat: 'Tacos', name: 'Tacos Tenders (L)', desc: 'Tenders, fromage, sauce', ingredients: ['Tenders', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 51, cat: 'Tacos', name: 'Tacos Tenders (XL)', desc: 'Tenders, fromage, sauce — XL', ingredients: ['Tenders (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 52, cat: 'Tacos', name: 'Tacos Fish (L)', desc: 'Poisson, fromage, sauce', ingredients: ['Poisson pané', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 53, cat: 'Tacos', name: 'Tacos Fish (XL)', desc: 'Poisson, fromage, sauce — XL', ingredients: ['Poisson pané (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 54, cat: 'Tacos', name: 'Tacos Escalope (L)', desc: 'Escalope, fromage, sauce', ingredients: ['Escalope', 'Fromage', 'Sauce fromagère'], price: 45, images: [] },
    { id: 55, cat: 'Tacos', name: 'Tacos Escalope (XL)', desc: 'Escalope, fromage, sauce — XL', ingredients: ['Escalope (double)', 'Fromage', 'Sauce fromagère'], price: 55, badge: 'XL', images: [] },
    { id: 56, cat: 'Tacos', name: 'Tacos Mixte 2 Viandes (L)', desc: '2 viandes, fromage, sauce', ingredients: ['2 Viandes au choix', 'Fromage', 'Sauce fromagère'], price: 50, images: [] },
    { id: 57, cat: 'Tacos', name: 'Tacos Mixte 2 Viandes (XL)', desc: '2 viandes, fromage, sauce — XL', ingredients: ['2 Viandes au choix (double)', 'Fromage', 'Sauce fromagère'], price: 65, badge: 'XL', images: [] },
    { id: 58, cat: 'Tacos', name: 'Tacos 3 Viandes', desc: '3 viandes, fromage, sauce', ingredients: ['3 Viandes au choix', 'Fromage', 'Sauce fromagère'], price: 65, badge: 'Géant', images: [] },
    { id: 59, cat: 'Tacos', name: 'Tacos Chawarma (L)', desc: 'Chawarma, fromage, sauce', ingredients: ['Chawarma', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 60, cat: 'Tacos', name: 'Tacos Chawarma (XL)', desc: 'Chawarma, fromage, sauce — XL', ingredients: ['Chawarma (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },
    { id: 61, cat: 'Tacos', name: 'Tacos Saucisse (L)', desc: 'Saucisse, fromage, sauce', ingredients: ['Saucisse', 'Fromage', 'Sauce fromagère'], price: 35, images: [] },
    { id: 62, cat: 'Tacos', name: 'Tacos Saucisse (XL)', desc: 'Saucisse, fromage, sauce — XL', ingredients: ['Saucisse (double)', 'Fromage', 'Sauce fromagère'], price: 50, badge: 'XL', images: [] },

    // ═══════════════════ GRATINÉ ═══════════════════════
    { id: 63, cat: 'Gratiné', name: 'Gratiné (L)', desc: 'Gratiné au fromage', ingredients: ['Viande', 'Fromage gratiné', 'Frites', 'Sauce'], price: 45, images: [] },
    { id: 64, cat: 'Gratiné', name: 'Gratiné (XL)', desc: 'Gratiné au fromage — XL', ingredients: ['Viande (double)', 'Fromage gratiné', 'Frites', 'Sauce'], price: 60, badge: 'XL', images: [] },

    // ═══════════════════════ DIVERS ═══════════════════════
    { id: 65, cat: 'Divers', name: '6 Nuggets', desc: '6 pièces croustillantes', ingredients: ['Nuggets de poulet', 'Sauce'], price: 25, images: [] },
    { id: 66, cat: 'Divers', name: '6 Croquettes', desc: '6 croquettes croustillantes', ingredients: ['Croquettes', 'Sauce'], price: 30, images: [] },
    { id: 67, cat: 'Divers', name: 'Plat de Frites', desc: 'Portion de frites', ingredients: ['Frites', 'Sel'], price: 7, images: [] },
    { id: 68, cat: 'Divers', name: 'Supplément Fromage', desc: 'Fromage en supplément', ingredients: ['Fromage'], price: 10, images: [] },

    // ═══════════════════════ SALADES ═══════════════════════
    { id: 69, cat: 'Salades', name: 'Salade Niçoise', desc: 'Salade niçoise fraîche', ingredients: ['Thon', 'Oeuf', 'Tomate', 'Olives', 'Laitue'], price: 20, images: [] },
    { id: 70, cat: 'Salades', name: 'Salade Rosa', desc: 'Salade rosa', ingredients: ['Laitue', 'Tomate', 'Concombre', 'Carotte', 'Vinaigrette'], price: 20, images: [] },
    { id: 71, cat: 'Salades', name: 'Salade Poulet', desc: 'Salade au poulet grillé', ingredients: ['Poulet grillé', 'Laitue', 'Tomate', 'Maïs', 'Sauce'], price: 25, images: [] },
    { id: 72, cat: 'Salades', name: 'Salade Panda', desc: 'Salade panda premium', ingredients: ['Mix salade', 'Garniture spéciale', 'Sauce chef'], price: 30, badge: 'Premium', images: [] },
];

const defaultCatEmojis = {
    'Burgers': '🍔',
    'Sandwich Froid': '🥪',
    'Sandwich Chaud': '🔥',
    'Plats': '🍽️',
    'Paninis': '🥖',
    'Tacos': '🌮',
    'Gratiné': '🧀',
    'Divers': '🍟',
    'Salades': '🥗'
};


// Persistence Layer
const defaultWifiData = { ssid: 'Foody_Guest', pass: 'foody2026' };
const defaultSocialLinks = { instagram: '', facebook: '', tiktok: '', whatsapp: '212626081745' };

let menu = defaultMenu.map(item => ({ ...item, images: Array.isArray(item.images) ? item.images : [], img: item.img || '' }));
let catEmojis = { ...defaultCatEmojis };
let wifiData = { ...defaultWifiData };
let promoId = null;
let socialLinks = { ...defaultSocialLinks };

let categories = [];
let cart = [];
let serviceType = 'onsite';
let currentSlide = 0;

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
    promoId = typeof data?.promoId === 'undefined' ? null : data.promoId;
}

async function loadSiteData() {
    try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Server returned ' + res.status);
        applySiteData(await res.json());
    } catch (error) {
        console.error('Failed to load site data:', error);
        applySiteData({
            menu: defaultMenu,
            catEmojis: defaultCatEmojis,
            wifi: defaultWifiData,
            social: defaultSocialLinks,
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
    renderCatNav();
    renderDropdown();
    renderMenu();
    renderPromo();
    renderSocialLinks();
    setupScroll();
    startSlider();
    updateWifiUI();
    updateWhatsAppLinks();

    setLang('fr', document.querySelector('.lang-btn'));
    updateStatus();

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('headerNav').classList.remove('mobile-open');
        });
    });
}

function updateWifiUI() {
    const ssidEl = document.getElementById('wifiSSIDDisplay');
    const passEl = document.getElementById('wifiPass');
    const qrEl = document.getElementById('wifiQR');
    if (ssidEl) ssidEl.innerHTML = `<strong>SSID:</strong> ${wifiData.ssid}`;
    if (passEl) passEl.textContent = wifiData.pass;
    if (qrEl) qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WIFI:S:${encodeURIComponent(wifiData.ssid)};T:WPA;P:${encodeURIComponent(wifiData.pass)};;`;
}

function updateWhatsAppLinks() {
    const wa = socialLinks.whatsapp || '212626081745';
    const eventLink = document.getElementById('eventWALink');
    const contactLink = document.getElementById('contactWALink');

    if (eventLink) eventLink.href = `https://wa.me/${wa}`;
    if (contactLink) {
        contactLink.href = `https://wa.me/${wa}`;
        // Optional: format the display number if it's the default
        if (wa === '212626081745') {
            contactLink.textContent = '+212 626 081 745';
        } else {
            contactLink.textContent = '+' + wa;
        }
    }
}

function renderSocialLinks() {
    const modalList = document.getElementById('modalSocialList');
    const footerContainer = document.getElementById('footerSocial');

    let modalItems = '';
    let footerIcons = '';

    if (socialLinks.instagram) {
        modalItems += `<a href="${socialLinks.instagram}" target="_blank" class="social-link-item instagram"><span>📸</span> Instagram</a>`;
        footerIcons += `<a href="${socialLinks.instagram}" target="_blank" class="footer-social-icon">📸</a>`;
    }
    if (socialLinks.facebook) {
        modalItems += `<a href="${socialLinks.facebook}" target="_blank" class="social-link-item facebook"><span>📘</span> Facebook</a>`;
        footerIcons += `<a href="${socialLinks.facebook}" target="_blank" class="footer-social-icon">📘</a>`;
    }
    if (socialLinks.tiktok) {
        modalItems += `<a href="${socialLinks.tiktok}" target="_blank" class="social-link-item tiktok"><span>🎵</span> TikTok</a>`;
        footerIcons += `<a href="${socialLinks.tiktok}" target="_blank" class="footer-social-icon">🎵</a>`;
    }
    if (socialLinks.whatsapp) {
        modalItems += `<a href="https://wa.me/${socialLinks.whatsapp}" target="_blank" class="social-link-item whatsapp"><span>📞</span> WhatsApp</a>`;
        footerIcons += `<a href="https://wa.me/${socialLinks.whatsapp}" target="_blank" class="footer-social-icon">📞</a>`;
    }

    if (modalList) modalList.innerHTML = modalItems || '<p style="color:#888; text-align:center;">Aucun lien configuré.</p>';
    if (footerContainer) footerContainer.innerHTML = footerIcons;
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
        document.getElementById('promo-item-name').textContent = item.name;
        document.getElementById('promo-item-price').textContent = `MAD ${item.price.toFixed(2)}`;
        document.getElementById('promo-item-img').src = item.img || '';
        document.getElementById('promo-item-cta').onclick = () => addItem(item.id);
    }
}


// STATUS LOGIC
function updateStatus() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0=Sun, 1=Mon...

    let isOpen = false;
    if (day >= 1 && day <= 4) { // Mon-Thu
        if (hour >= 11 && hour < 23) isOpen = true;
    } else if (day === 5 || day === 6) { // Fri-Sat
        if (hour >= 11 && hour <= 23) isOpen = true;
    } else if (day === 0) { // Sun
        if (hour >= 12 && hour < 23) isOpen = true;
    }

    const badge = document.getElementById('statusBadge');
    if (!badge) return;
    badge.className = 'status-badge ' + (isOpen ? 'status-open' : 'status-closed');
    const textEl = document.getElementById('statusText');
    if (textEl) {
        textEl.setAttribute('data-i18n', isOpen ? 'status_open' : 'status_closed');
        // Initial text
        textEl.textContent = isOpen ? 'Ouvert' : 'Fermé';
    }
}

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
    if (firstImg) return `<img src="${firstImg}" alt="${item.name}" onerror="this.style.display='none';this.parentNode.textContent='${emoji}'" loading="lazy" />`;
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
        const items = menu.filter(m => m.cat === cat);
        return `
      <section class="cat-section" id="cat-${cat.replace(/\s/g, '-')}">
        <h2 class="cat-title">${cat}</h2>
        ${items.map((item, i) => `
          <div class="product-card" style="animation-delay:${i * 0.06}s" onclick="openProductModal(${item.id})">
            ${item.badge ? `<span class="p-badge">${item.badge}</span>` : ''}
            <div class="p-info">
              <div class="p-name">${item.name}</div>
              <div class="p-desc">${item.desc}</div>
              <div class="p-price">MAD ${item.price.toFixed(2)}</div>
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
    showToast(`✅ ${item.name} ajouté!`);
}

function updateBottomBar() {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const bar = document.getElementById('bottomBar');
    if (count === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    document.getElementById('bottomCount').textContent = count + ' product' + (count > 1 ? 's' : '');
    document.getElementById('bottomTotal').textContent = 'MAD ' + total.toFixed(2);
}

// CONFIRM
function openConfirm() {
    if (cart.length === 0) { showToast('🛒 Ajoutez des articles!'); return; }
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
      <div class="conf-info"><div class="conf-name">${c.name}</div><div class="conf-price">MAD ${(c.price * c.qty).toFixed(2)}</div></div>
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
      <div class="comp-name">${item.name}</div>
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
    const svc = { onsite: '🍽️ Sur Place', takeaway: '🛍️ À Emporter', delivery: '🚚 Livraison' };
    let msg = `🍔 *NOUVELLE COMMANDE – FOODY*\n━━━━━━━━━━━━━━━━\n📋 *Service:* ${svc[serviceType]}\n`;
    if (serviceType === 'delivery') {
        const n = document.getElementById('cName').value.trim(), a = document.getElementById('cAddr').value.trim(), p = document.getElementById('cPhone').value.trim();
        if (!n) { document.getElementById('cName').focus(); return alert('Entrez votre nom!'); }
        if (!a) { document.getElementById('cAddr').focus(); return alert('Entrez votre adresse!'); }
        msg += `👤 *Client:* ${n}\n📍 *Adresse:* ${a}\n`; if (p) msg += `📱 *Tél:* ${p}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━\n\n🛒 *COMMANDE:*\n\n`;
    cart.forEach((c, i) => { msg += `${i + 1}. *${c.name}* × ${c.qty}\n   💰 ${(c.price * c.qty).toFixed(2)} MAD\n\n`; });
    msg += `━━━━━━━━━━━━━━━━\n💵 *TOTAL: ${total.toFixed(2)} MAD*\n━━━━━━━━━━━━━━━━\n\n🙏 Merci chez *Foody*!`;
    const waNum = socialLinks.whatsapp || '212626081745';
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

// TOAST
function showToast(text) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = text;
    document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 50);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2000);
}

// MOBILE MENU
function toggleMobileMenu() {
    document.getElementById('headerNav').classList.toggle('mobile-open');
}

// ===== i18n LANGUAGE SYSTEM =====
const translations = {
    fr: {
        status_open: 'Ouvert', status_closed: 'Fermé', status_loading: 'Chargement...',
        nav_home: 'Accueil', nav_menu: 'Menu', nav_about: 'À Propos', nav_events: 'Événements',
        nav_contact: 'Contact', nav_hours: 'Horaires', nav_order: 'COMMANDER', nav_directions: 'ITINÉRAIRE',
        hero_sub1: 'Préparez-vous pour', hero_cta: 'COMMANDER EN LIGNE',
        hero_sub2: 'Essayez Notre', hero_desc2: 'Frites & Boisson inclus',
        hero_sub3: 'Frais Chaque Jour', hero_desc3: 'Sandwichs, Paninis & plus',
        see_order: 'Voir ma commande',
        about_tag: 'Notre Histoire', about_title: 'À Propos de <span>Foody</span>',
        about_tagline: 'Burgers, Tacos & Plus Encore',
        about_p1: 'Chers invités, notre histoire commence dans les ruelles vibrantes de Tanger. Passionnés par la cuisine de rue authentique, nous avons voulu créer un lieu où chaque bouchée raconte une histoire de saveur, de fraîcheur et d\'amour.',
        about_p2: 'Depuis notre humble début, nous avons toujours cru que la meilleure nourriture est celle préparée avec les ingrédients les plus frais, des recettes halal authentiques, et surtout, beaucoup de passion.',
        about_p3: 'Notre mission est simple : vous offrir la meilleure qualité, un service exceptionnel, et une expérience culinaire inoubliable.',
        about_welcome: 'Bienvenue, revenez nous voir !', about_thanks: 'Merci,',
        about_years: 'Ans d\'Expérience', about_items: 'Plats au Menu', about_halal: 'Halal & Frais', about_rating: 'Avis Clients',
        events_tag: 'Célébrez avec nous', events_title: 'Événements <span>Privés</span>',
        event_birthday: 'Anniversaires', event_birthday_desc: 'Célébrez votre jour spécial avec un menu personnalisé et une ambiance festive.',
        event_family: 'Réunions Familiales', event_family_desc: 'Un espace chaleureux pour réunir votre famille autour de plats délicieux.',
        event_corporate: 'Événements Corporate', event_corporate_desc: 'Impressionnez vos collègues avec un traiteur professionnel et savoureux.',
        event_party: 'Fêtes Privées', event_party_desc: 'Louez notre espace pour une soirée inoubliable avec vos amis.',
        events_cta_text: 'Intéressé par un événement ? Contactez-nous !', events_cta_btn: '📩 Demander un Devis',
        hours_tag: 'Quand nous visiter', hours_title: 'Horaires <span>d\'Ouverture</span>',
        day_mon: 'Lundi', day_tue: 'Mardi', day_wed: 'Mercredi', day_thu: 'Jeudi', day_fri: 'Vendredi', day_sat: 'Samedi', day_sun: 'Dimanche',
        hours_note: '🔥 Ouvert tous les jours ! Livraison disponible.',
        contact_tag: 'Venez Manger', contact_title: 'Contactez-<span>Nous</span>',
        contact_address_title: 'Adresse', contact_phone_title: 'Téléphone',
        side_menu: 'MENU', side_wifi: 'CODE WIFI', side_insta: 'INSTAGRAM',
        wifi_title: 'WiFi Gratuit', wifi_scan: 'Scannez pour vous connecter',
        promo_badge: 'PROMO DU JOUR', promo_add: 'AJOUTER AU PANIER',
        ingredients_label: 'Ingrédients', add_to_cart: 'AJOUTER AU PANIER',
    },
    en: {
        status_open: 'Open', status_closed: 'Closed', status_loading: 'Loading...',
        nav_home: 'Home', nav_menu: 'Menu', nav_about: 'About Us', nav_events: 'Events',
        nav_contact: 'Contact Us', nav_hours: 'Hours', nav_order: 'ORDER ONLINE', nav_directions: 'GET DIRECTIONS',
        hero_sub1: 'Get ready for', hero_cta: 'ORDER ONLINE',
        hero_sub2: 'Try Our', hero_desc2: 'Includes Fries & Drink',
        hero_sub3: 'Fresh Daily', hero_desc3: 'Sandwiches, Paninis & more',
        see_order: 'See my order',
        about_tag: 'Our Story', about_title: 'About <span>Foody</span>',
        about_tagline: 'Burgers, Tacos & More',
        about_p1: 'Dear guests, our story begins in the vibrant streets of Tangier. Passionate about authentic street food, we wanted to create a place where every bite tells a story of flavor, freshness and love.',
        about_p2: 'Since our humble beginnings, we have always believed that the best food is made with the freshest ingredients, authentic halal recipes, and above all, plenty of passion.',
        about_p3: 'Our mission is simple: to offer you the best quality, exceptional service, and an unforgettable culinary experience.',
        about_welcome: 'Welcome, please come visit us again!', about_thanks: 'Thank you,',
        about_years: 'Years Experience', about_items: 'Menu Items', about_halal: 'Halal & Fresh', about_rating: 'Customer Reviews',
        events_tag: 'Celebrate with us', events_title: 'Private <span>Events</span>',
        event_birthday: 'Birthdays', event_birthday_desc: 'Celebrate your special day with a custom menu and festive ambiance.',
        event_family: 'Family Gatherings', event_family_desc: 'A warm space to bring your family together around delicious dishes.',
        event_corporate: 'Corporate Events', event_corporate_desc: 'Impress your colleagues with professional and tasty catering.',
        event_party: 'Private Parties', event_party_desc: 'Rent our space for an unforgettable evening with friends.',
        events_cta_text: 'Interested in an event? Contact us!', events_cta_btn: '📩 Request a Quote',
        hours_tag: 'When to visit', hours_title: 'Opening <span>Hours</span>',
        day_mon: 'Monday', day_tue: 'Tuesday', day_wed: 'Wednesday', day_thu: 'Thursday', day_fri: 'Friday', day_sat: 'Saturday', day_sun: 'Sunday',
        hours_note: '🔥 Open every day! Delivery available.',
        contact_tag: 'Come eat', contact_title: 'Contact <span>Us</span>',
        contact_address_title: 'Address', contact_phone_title: 'Phone',
        side_menu: 'MENU', side_wifi: 'WIFI CODE', side_insta: 'INSTAGRAM',
        wifi_title: 'Free WiFi', wifi_scan: 'Scan to connect',
        promo_badge: 'PROMO OF THE DAY', promo_add: 'ADD TO CART',
        ingredients_label: 'Ingredients', add_to_cart: 'ADD TO CART',
    },
    ar: {
        status_open: 'مفتوح', status_closed: 'مغلق', status_loading: 'جاري التحميل...',
        nav_home: 'الرئيسية', nav_menu: 'القائمة', nav_about: 'من نحن', nav_events: 'الفعاليات',
        nav_contact: 'اتصل بنا', nav_hours: 'أوقات العمل', nav_order: 'اطلب الآن', nav_directions: 'الاتجاهات',
        hero_sub1: 'استعد لـ', hero_cta: 'اطلب أونلاين',
        hero_sub2: 'جرب', hero_desc2: 'مع بطاطس ومشروب',
        hero_sub3: 'طازج يومياً', hero_desc3: 'سندويشات، بانيني والمزيد',
        see_order: 'عرض طلبي',
        about_tag: 'قصتنا', about_title: 'عن <span>فودي</span>',
        about_tagline: 'برجر، تاكوس والمزيد',
        about_p1: 'أعزاءنا الضيوف، تبدأ قصتنا في أزقة طنجة النابضة بالحياة. شغوفون بالأكل الشعبي الأصيل، أردنا خلق مكان كل لقمة فيه تحكي قصة نكهة وطزاجة وحب.',
        about_p2: 'منذ بدايتنا المتواضعة، آمنا دائماً أن أفضل طعام يُحضّر بأطزج المكونات، ووصفات حلال أصيلة، وقبل كل شيء، بالكثير من الشغف.',
        about_p3: 'مهمتنا بسيطة: تقديم أفضل جودة، خدمة استثنائية، وتجربة طعام لا تُنسى.',
        about_welcome: 'مرحباً، عودوا لزيارتنا!', about_thanks: 'شكراً لكم،',
        about_years: 'سنة خبرة', about_items: 'طبق في القائمة', about_halal: 'حلال وطازج', about_rating: 'آراء الزبائن',
        events_tag: 'احتفل معنا', events_title: 'فعاليات <span>خاصة</span>',
        event_birthday: 'أعياد الميلاد', event_birthday_desc: 'احتفل بيومك الخاص مع قائمة مخصصة وأجواء احتفالية.',
        event_family: 'لقاءات عائلية', event_family_desc: 'مساحة دافئة لجمع عائلتك حول أطباق لذيذة.',
        event_corporate: 'فعاليات الشركات', event_corporate_desc: 'أبهر زملاءك بتقديم طعام احترافي ولذيذ.',
        event_party: 'حفلات خاصة', event_party_desc: 'استأجر مساحتنا لسهرة لا تُنسى مع أصدقائك.',
        events_cta_text: 'مهتم بفعالية؟ تواصل معنا!', events_cta_btn: '📩 اطلب عرض سعر',
        hours_tag: 'متى تزورنا', hours_title: 'أوقات <span>العمل</span>',
        day_mon: 'الاثنين', day_tue: 'الثلاثاء', day_wed: 'الأربعاء', day_thu: 'الخميس', day_fri: 'الجمعة', day_sat: 'السبت', day_sun: 'الأحد',
        hours_note: '🔥 مفتوح كل يوم! التوصيل متاح.',
        contact_tag: 'تعال كُل', contact_title: 'اتصل <span>بنا</span>',
        contact_address_title: 'العنوان', contact_phone_title: 'الهاتف',
        side_menu: 'القائمة', side_wifi: 'كود الواي فاي', side_insta: 'إنستغرام',
        wifi_title: 'واي فاي مجاني', wifi_scan: 'امسح الرمز للاتصال',
        promo_badge: 'عرض اليوم', promo_add: 'أضف إلى السلة',
        ingredients_label: 'المكونات', add_to_cart: 'أضف إلى السلة',
    }
};

let currentLang = 'fr';

function setLang(lang, btn) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active-lang'));
    btn.classList.add('active-lang');
    const dict = translations[lang];
    if (!dict) return;

    // Set RTL for Arabic
    const html = document.getElementById('htmlRoot');
    if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
    } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', lang);
    }

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (dict[key].includes('<span>')) {
                el.innerHTML = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });
}

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
        showToast(currentLang === 'ar' ? 'تم نسخ كلمة المرور!' : (currentLang === 'en' ? 'Password copied!' : 'Mot de passe copié !'));
    });
}

// PRODUCT MODAL
function openProductModal(id) {
    const item = menu.find(m => m.id == id);
    if (!item) return;

    document.getElementById('detailName').textContent = item.name;
    document.getElementById('detailDesc').textContent = item.desc;
    document.getElementById('detailPrice').textContent = `MAD ${item.price.toFixed(2)}`;

    // Gallery
    const images = item.images && item.images.length > 0 ? item.images : (item.img ? [item.img] : []);
    const mainImg = document.getElementById('mainDetailImg');
    const thumbStrip = document.getElementById('thumbStrip');

    if (images.length > 0) {
        mainImg.src = images[0];
        mainImg.style.display = 'block';
        thumbStrip.innerHTML = images.map((img, i) =>
            `<div class="thumb ${i === 0 ? 'active' : ''}" onclick="setDetailImg('${img}', this)">
                <img src="${img}" alt="Thumb" />
             </div>`
        ).join('');
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
    document.getElementById('mainDetailImg').src = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productOverlay').classList.remove('open');
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}
