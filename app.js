// WhatsApp management moved to socialLinks (Persistence Layer)
// const WHATSAPP_NUMBER = '212626081745';

// Default Data — Full Menu from Restaurant Board
// Data and Translations are now loaded from shared.js


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
    if (document.getElementById('catScroll')) renderCatNav();
    if (document.getElementById('dropdownMenu')) renderDropdown();
    if (document.getElementById('menuWrap')) renderMenu();
    renderPromo();
    renderSocialLinks();
    renderHours();
    renderGallery();
    if (document.getElementById('menuWrap')) setupScroll();
    startSlider();
    updateWifiUI();
    updateWhatsAppLinks();
    renderLocation();

    // Safety check for language initialization
    const initialLangBtn = document.querySelector('.lang-btn') || document.querySelector('.lang-drop-btn');
    setLang('fr', initialLangBtn);

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

    const hours = JSON.parse(localStorage.getItem('foody_hours')) || window.defaultHours;
    const note = localStorage.getItem('foody_hours_note') || window.defaultHoursNote || '';

    grid.innerHTML = hours.map(h => `
        <div class="hours-row${h.highlight ? ' highlight-row' : ''}">
            <span class="hours-day" data-i18n="${h.i18n}">${h.day}</span>
            <span class="hours-dash"></span>
            <span class="hours-time">${h.open} – ${h.close}</span>
        </div>
    `).join('');

    if (noteEl && note) noteEl.textContent = note;
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

function renderGallery() {
    const grid = document.getElementById('mainGalleryGrid');
    if (!grid) return;

    const images = restaurantConfig.gallery || [];
    if (images.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; opacity:0.5; padding:40px;">Bientôt de nouvelles photos...</p>';
        return;
    }

    grid.innerHTML = images.map(img => `
        <div class="gallery-item" onclick="openGalleryLightbox('${img}')">
            <img src="${img}" alt="Gallery Image" loading="lazy" />
        </div>
    `).join('');
}

function renderLocation() {
    const addressText = document.getElementById('contactAddressText');
    const footerAddressText = document.getElementById('footerAddressText');
    const addressCard = document.getElementById('contactAddressCard');

    if (restaurantConfig.location) {
        if (addressText) addressText.textContent = restaurantConfig.location.address;
        if (footerAddressText) footerAddressText.textContent = restaurantConfig.location.address;
        if (addressCard && restaurantConfig.location.url) {
            addressCard.onclick = () => {
                window.open(restaurantConfig.location.url, '_blank');
            };
        }
    }
}

function openGalleryLightbox(src) {
    // We can reuse the product detail modal or create a simple lightbox
    // For now, let's keep it simple or integrate with existing modal logic
    showToast('Photo agrandie (Lightbox à venir)');
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
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        return `
      <section class="cat-section" id="cat-${cat.replace(/\s/g, '-')}">
        <h2 class="cat-title">${cat}</h2>
        ${items.map((item, i) => `
          <div class="product-card" style="animation-delay:${i * 0.06}s" onclick="openProductModal(${item.id})">
            ${item.badge ? `<span class="p-badge">${item.badge}</span>` : ''}
            <div class="p-info">
              <div class="p-name">${item.name}</div>
              <div class="p-desc">${item.desc}</div>
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

    title.textContent = `Réserver : ${type}`;

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
        alert('Veuillez entrer votre nom.');
        document.getElementById('eventCustName').focus();
        return;
    }
    if (!phone) {
        alert('Veuillez entrer votre numéro de téléphone.');
        document.getElementById('eventCustPhone').focus();
        return;
    }

    const waNum = socialLinks.whatsapp || '212626081745';
    let msg = `✨ *RÉSERVATION ÉVÉNEMENT – FOODY*\n━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 *Type:* ${currentEventType}\n`;
    msg += `👤 *Client:* ${name}\n`;
    msg += `📱 *Tél:* ${phone}\n`;
    msg += `━━━━━━━━━━━━━━━━\n\n🙏 Merci de me contacter pour confirmer les détails !`;

    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    closeEventModal();
}
