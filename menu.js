/**
 * Menu JS - 3-Tier Navigation
 * Landing → Super Category → Sub Category → Items
 */

let menu = window.defaultMenu || [];
let catEmojis = window.defaultCatEmojis || {};
let cart = JSON.parse(localStorage.getItem('foody_cart_menu')) || [];
let serviceType = 'onsite';

// Global comparison to detect changes
let lastDataVersion = "";

// ═══ SYNC DATA FROM SERVER ═══
async function syncDataFromServer() {
    try {
        const res = await fetch('/api/data');
        if (!res.ok) return;
        const data = await res.json();
        const dataStr = JSON.stringify(data);

        if (dataStr === lastDataVersion) return; // No change
        lastDataVersion = dataStr;

        // Update local variables
        menu = Array.isArray(data.menu) ? data.menu : menu;
        catEmojis = data.catEmojis || catEmojis;

        // Update global config object
        if (data.superCategories) window.restaurantConfig.superCategories = data.superCategories;
        if (data.wifi) window.restaurantConfig.wifi = { name: data.wifi.ssid, code: data.wifi.pass };
        if (data.social) window.restaurantConfig.socials = data.social;
        if (data.hours) window.restaurantConfig._hours = data.hours;
        if (data.hoursNote) window.restaurantConfig._hoursNote = data.hoursNote;
        if (data.promoIds) window.promoIds = data.promoIds;

        console.log('[SYNC] Data updated from server');

        // Refresh UI
        if (typeof renderMenu === 'function') renderMenu();
        if (typeof renderPromoCarousel === 'function') renderPromoCarousel();
        if (typeof renderLandingInfo === 'function') renderLandingInfo();

        // If we are in the items view, refresh the list
        if (navigationStack.length > 0) {
            const last = navigationStack[navigationStack.length - 1];
            if (last.startsWith('items:')) {
                const cat = last.split(':')[1];
                showCategoryItems(cat); // This navigates, but we want to refresh CURRENT view.
                navigationStack.pop(); // Remove the extra stack entry added by showCategoryItems
            } else if (last.startsWith('subcats:')) {
                const scId = last.split(':')[1];
                const sc = window.restaurantConfig.superCategories.find(s => s.id === scId);
                if (sc) {
                    showSubCategoryGrid(sc, false);
                }
            }
        }

        // Check if dish page is open for the updated menu
        const dishPage = document.getElementById('dishPage');
        if (dishPage && dishPage.classList.contains('open')) {
            // Re-open (refresh) the current dish page to show new price/sizes
            const currentName = document.getElementById('dishPageName')?.textContent;
            if (currentName) {
                const cleanName = currentName.replace(' (PROMO)', '');
                const updatedItem = menu.find(m => m.name === cleanName);
                if (updatedItem) {
                    openDishPage(updatedItem.id);
                }
            }
        }
    } catch (e) {
        console.warn('[SYNC] Failed to fetch data:', e);
    }
}

// Start real-time sync (poll every 2 seconds for "instant" feel)
setInterval(syncDataFromServer, 2000);

// ═══════════════════════ RESTAURANT CONFIG ═══════════════════════
const config = window.restaurantConfig;
const superCategories = config.superCategories;


let navigationStack = []; // stack: 'landing', 'supercats', 'subcats:NAME', 'items:CAT'
let currentSuperCat = null;

// ═══════════════════════ INIT ═══════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    // Initial sync
    await syncDataFromServer();
    initMenuApp();
});

function initMenuApp() {
    renderMenu();
    renderSuperCatSheet();
    renderPromoCarousel();
    renderLandingInfo();
    updateCartUI();
    updateHistoryBadge();
    window.updateStatus();
    const savedLang = localStorage.getItem('foody_lang') || 'fr';
    window.setLang(savedLang);
}

function renderLandingInfo() {
    const config = window.restaurantConfig;
    if (!config) return;

    // Location
    const locEl = document.getElementById('landingLocation');
    if (locEl) {
        locEl.textContent = config.location.address;
        locEl.onclick = () => window.open(config.location.url, '_blank');
    }

    // Phone
    const phoneEl = document.getElementById('landingPhone');
    if (phoneEl) {
        phoneEl.textContent = config.phone;
        phoneEl.onclick = () => window.open(`tel:${config.phone.replace(/\s/g, '')}`, '_self');
    }

    // Socials
    const socialEl = document.getElementById('landingSocial');
    if (socialEl) {
        socialEl.textContent = '@' + (config.socials.instagram.split('/').pop() || 'foody.tanger');
        socialEl.onclick = () => openSocialModal();
    }

    // WiFi
    const wifiEl = document.getElementById('landingWifi');
    if (wifiEl) {
        wifiEl.textContent = config.wifi.name;
        wifiEl.onclick = () => openWiFiModal();
    }
}

function openWiFiModal() {
    const config = window.restaurantConfig;
    const content = `
        <div class="modal-body" style="padding:40px 20px; text-align:center;">
            <div style="font-size:3rem; margin-bottom:20px;">📶</div>
            <h2 style="margin-bottom:10px;">Connect to WiFi</h2>
            <p style="color:#666; margin-bottom:30px;">Network: <strong>${config.wifi.name}</strong></p>
            <div style="background:#f4f4f4; padding:20px; border-radius:15px; font-family:monospace; font-size:1.5rem; letter-spacing:2px; color:var(--primary); font-weight:bold; border:2px dashed #ddd;">
                ${config.wifi.code}
            </div>
            <button class="primary-btn" style="margin-top:30px; width:100%;" onclick="closeAllModals()">OK</button>
        </div>
    `;
    const drawer = document.getElementById('cartDrawer');
    document.getElementById('drawerContent').innerHTML = content;
    drawer.classList.add('open');
    document.getElementById('sharedOverlay').classList.add('open');
}

function openSocialModal() {
    const config = window.restaurantConfig;
    const content = `
        <div class="modal-body" style="padding:30px 20px;">
            <h2 style="text-align:center; margin-bottom:25px;">Our Social Media</h2>
            <div class="social-list" style="display:flex; flex-direction:column; gap:15px;">
                <a href="${config.socials.instagram}" target="_blank" class="social-item" style="display:flex; align-items:center; gap:15px; padding:15px; background:#f9f9f9; border-radius:12px; text-decoration:none; color:#000;">
                    <span style="font-size:1.5rem;">📸</span> <strong>Instagram</strong>
                </a>
                <a href="${config.socials.facebook}" target="_blank" class="social-item" style="display:flex; align-items:center; gap:15px; padding:15px; background:#f9f9f9; border-radius:12px; text-decoration:none; color:#000;">
                    <span style="font-size:1.5rem;">📘</span> <strong>Facebook</strong>
                </a>
                <a href="${config.socials.tiktok}" target="_blank" class="social-item" style="display:flex; align-items:center; gap:15px; padding:15px; background:#f9f9f9; border-radius:12px; text-decoration:none; color:#000;">
                    <span style="font-size:1.5rem;">🎵</span> <strong>TikTok</strong>
                </a>
                <a href="${config.socials.tripadvisor}" target="_blank" class="social-item" style="display:flex; align-items:center; gap:15px; padding:15px; background:#f9f9f9; border-radius:12px; text-decoration:none; color:#000;">
                    <span style="font-size:1.5rem;">🦉</span> <strong>TripAdvisor</strong>
                </a>
            </div>
            <button class="primary-btn" style="margin-top:25px; width:100%; background:#eee; color:#000;" onclick="closeAllModals()">CLOSE</button>
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
        container.innerHTML = `<div class="promo-empty-msg">🔥 Découvrez nos promos du jour bientôt !</div>`;
        return;
    }

    container.innerHTML = promoItems.map(item => {
        const discountedPrice = window.getItemPrice(item);
        return `
            <div class="promo-card-vibrant" onclick="openDishPage(${item.id})">
                <span class="promo-tag-glow">OFFRE</span>
                <span class="promo-discount-badge">-20%</span>
                <div class="promo-visual-vibrant" onclick="event.stopPropagation(); openGallery(menu.filter(m => window.getPromoIds().includes(m.id)), menu.filter(m => window.getPromoIds().includes(m.id)).findIndex(p => p.id === ${item.id}))">
                    ${imgTag(item)}
                    <div class="promo-glow-vibrant"></div>
                </div>
                <div class="promo-info-vibrant">
                    <div class="promo-name-vibrant">${item.name}</div>
                    <div class="promo-price-vibrant">
                        <span class="price-new">${discountedPrice.toFixed(0)} MAD</span>
                        <span class="price-old">${item.price.toFixed(0)} MAD</span>
                    </div>
                </div>
                <button class="promo-add-vibrant" onclick="event.stopPropagation();addToCart(${item.id})">
                    AJOUTER
                </button>
            </div>
        `;
    }).join('');

    startPromoAutoSlide(container);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMenuNavigationView(title) {
    document.getElementById('landingView').style.display = 'none';
    document.getElementById('menuNavigationView').style.display = 'block';
    document.getElementById('menuNavTitle').textContent = title || 'Menu';
    updateBackBtn();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderFeaturedSlider(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <div class="featured-header-sexy">
            <span class="featured-header-label" data-i18n="featured_label">Nolasco Selection</span>
            <h2 class="featured-header-title">
                <span data-i18n="featured_best">Nos Coups de Coeur</span> ✨
            </h2>
        </div>
        <div class="featured-slider">
            ${items.map(item => `
                <div class="featured-card" onclick="openDishPage(${item.id})">
                    <div class="featured-img-wrap">
                        ${imgTag(item)}
                    </div>
                    <div class="featured-info">
                        <div class="featured-name">${item.name}</div>
                        <div class="featured-price">${window.getItemPrice(item).toFixed(0)} MAD</div>
                    </div>
                    <button class="featured-add-btn" onclick="event.stopPropagation();addToCart(${item.id})">+</button>
                </div>
            `).join('')}
        </div>
    `;
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
        const sc = superCategories.find(s => s.id === scId);
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
    container.innerHTML = superCategories.map((sc, i) => `
        <button class="super-cat-pill ${i === 0 ? 'active' : ''}" onclick="openSuperCatSheet()">
            ${sc.emoji} ${sc.name}
        </button>
    `).join('');
}

function renderSuperCatSheet() {
    const list = document.getElementById('superCatList');
    if (!list) return;
    list.innerHTML = superCategories.map(sc => `
        <div class="super-cat-row" onclick="selectSuperCategory('${sc.id}')">
            <div class="super-cat-row-left">
                <span class="super-cat-row-emoji">${sc.emoji}</span>
                <div class="super-cat-row-info">
                    <div class="super-cat-row-name">${sc.name}</div>
                    <div class="super-cat-row-desc">${sc.desc}</div>
                </div>
            </div>
            <span class="super-cat-row-arrow">›</span>
        </div>
    `).join('');
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
    const sc = superCategories.find(s => s.id === scId);
    if (!sc) return;
    currentSuperCat = sc;
    closeSuperCatSheet();
    navigationStack = ['supercats'];
    showSubCategoryGrid(sc, true);
}

// ═══════════════════════ SUB CATEGORY GRID ═══════════════════════

function showSubCategoryGrid(sc, addToStack = true) {
    if (addToStack) navigationStack.push(`subcats:${sc.id}`);

    showMenuNavigationView(sc.name);

    const navWrapper = document.getElementById('catNavWrapper');
    const subCatTitle = document.getElementById('subCatTitle');
    const menuContent = document.getElementById('menuContent');
    const searchBox = document.getElementById('menuSearchBox');

    if (subCatTitle) subCatTitle.textContent = sc.name;

    navWrapper.style.display = 'block';
    menuContent.style.display = 'none';
    if (searchBox) searchBox.style.display = 'none';

    // Render category grid for this super-category
    const catNav = document.getElementById('catNavScroll');
    const currentCategories = [...new Set(menu.map(m => m.cat))];
    const filteredCats = sc.cats.filter(c => currentCategories.includes(c));
    catNav.innerHTML = filteredCats.map(c => `
        <button class="menu-cat-btn" data-cat="${c}" onclick="showCategoryItems('${c}')">
            <span class="cat-emoji">${catEmojis[c] || '🍴'}</span>
            <span class="cat-name">${c}</span>
        </button>
    `).join('');

    // Render global featured items for ALL categories in this super-category
    const featuredItems = menu.filter(m => sc.cats.includes(m.cat) && m.featured);
    renderFeaturedSlider(featuredItems, 'featuredGlobal');

    updateBackBtn();
}

// ═══════════════════════ CATEGORY ITEMS ═══════════════════════

function showCategoryItems(cat) {
    navigationStack.push(`items:${cat}`);

    showMenuNavigationView(cat);

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
}

// ═══════════════════════ RENDERING ═══════════════════════

function renderMenu() {
    const wrap = document.getElementById('menuContent');
    if (!wrap) return;

    let categories = [...new Set(menu.map(m => m.cat))];

    wrap.innerHTML = categories.map(cat => {
        const items = menu.filter(m => m.cat === cat && m.available !== false);
        return `
            <section class="menu-section" id="cat-${cat.replace(/\s/g, '-')}">
                <h2 class="menu-section-title">${catEmojis[cat] || '🍴'} ${cat}</h2>
                <div class="menu-grid">
                    ${items.map(item => `
                        <div class="menu-item-card" onclick="openDishPage(${item.id})">
                             <button class="love-btn ${window.getLikeCount(item.id) > 0 ? 'loved text-pop' : ''}" 
                                     onclick="event.stopPropagation(); window.handleToggleLike(${item.id}, this)">
                                ❤️<span class="love-count">${window.getLikeCount(item.id)}</span>
                             </button>
                            <div class="menu-item-info">
                                <div class="menu-item-name">${item.name} ${window.isItemInPromo(item.id) ? '<span class="promo-tag-small">PROMO</span>' : ''}</div>
                                <div class="menu-item-desc">${item.desc}</div>
                                <div class="menu-item-price">
                                    ${item.hasSizes
                ? `<span style="font-size:0.7em; opacity:0.7;">À partir de</span> ${window.getItemPrice(item, 'small').toFixed(0)} MAD`
                : (window.isItemInPromo(item.id)
                    ? `<span class="price-discounted">${window.getItemPrice(item).toFixed(0)} MAD</span> <span class="price-original-item">${item.price.toFixed(0)} MAD</span>`
                    : `${item.price.toFixed(0)} MAD`)}
                                </div>
                            </div>
                            <div class="menu-item-img" onclick="event.stopPropagation(); openGallery(menu.filter(m => m.cat === '${cat}'), menu.filter(m => m.cat === '${cat}').indexOf(item))">
                                ${imgTag(item)}
                            </div>
                            <button class="menu-item-add" onclick="event.stopPropagation();addToCart(${item.id})">+</button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }).join('');
}

function imgTag(item) {
    const src = (item.images && item.images.length > 0) ? item.images[0] : item.img;
    if (src) return `<img src="${src}" alt="${item.name}" loading="lazy">`;
    return `<span class="emoji-placeholder">${catEmojis[item.cat] || '🍴'}</span>`;
}

// ═══════════════════════ DISH PAGE ═══════════════════════

function openDishPage(id) {
    const item = menu.find(m => m.id === id);
    if (!item) return;

    const page = document.getElementById('dishPage');
    const imgEl = document.getElementById('dishPageImg');
    const nameEl = document.getElementById('dishPageName');
    const priceEl = document.getElementById('dishPagePrice');
    const descEl = document.getElementById('dishPageDesc');
    const addBtn = document.getElementById('dishPageAddBtn');

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
        imgEl.src = imgSrc;
        imgEl.style.display = 'block';
        imgEl.onclick = () => openGallery([item], 0);
        imgEl.style.cursor = 'zoom-in';
    } else {
        imgEl.style.display = 'none';
        imgEl.onclick = null;
    }

    if (nameEl) nameEl.textContent = item.name + (window.isItemInPromo(item.id) ? ' (PROMO)' : '');
    updateSizePrice();
    if (descEl) descEl.textContent = item.desc || 'Une préparation soignée avec les meilleurs ingrédients.';

    if (addBtn) {
        addBtn.onclick = () => { addToCart(item.id, selectedSize); closeDishPage(); };
    }

    // Love button in page
    const loveContainer = document.getElementById('dishPageLoveContainer');
    if (loveContainer) {
        loveContainer.innerHTML = `
            <button class="love-btn ${window.getLikeCount(item.id) > 0 ? 'loved' : ''}" 
                    style="position:static; width:40px; height:40px; font-size:1.2rem;"
                    onclick="window.handleToggleLike(${item.id}, this)">
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
    img.src = galleryImgSrc;
    title.textContent = item.name;
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
    const item = menu.find(m => m.id === id);
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
    window.showToast?.(`✅ ${item.name}${sizeLabel} ajouté!`);
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

function saveCart() { localStorage.setItem('foody_cart_menu', JSON.stringify(cart)); }

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

    content.innerHTML = `
        <div style="padding:0 20px 120px;">
            <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #eee;padding-bottom:10px;">
                <div style="font-weight:900;font-size:1.4rem;text-transform:uppercase;color:#000;">
                    ${window.restaurantConfig?.name || 'Foody'}
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <button onclick="if(confirm('Vider le panier ?')) { cart=[]; saveCart(); updateCartUI(); closeAllModals(); }" style="background:none; border:none; color:#888; text-decoration:underline; cursor:pointer; font-size:0.8rem;">Vider</button>
                    <div style="font-size:0.9rem;color:var(--red);font-weight:700;">${cart.length} items</div>
                </div>
            </div>
            <div style="max-height:45vh;overflow-y:auto;margin-bottom:20px;">
                ${cart.map(item => `
                    <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;background:#f8f8f8;padding:12px;border-radius:12px;">
                        <div style="flex:1;">
                            <div style="font-weight:700;font-size:0.95rem;color:#000;">
                                ${item.name} ${item.selectedSize ? `<span style="font-size:0.8rem; color:var(--primary);">(${item.selectedSize.charAt(0).toUpperCase()})</span>` : ''}
                            </div>
                            <div style="color:var(--red);font-weight:700;font-size:0.9rem;">${(item.price * item.qty).toFixed(2)} MAD</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <button onclick="removeFromCart('${item.cartId}')" style="width:28px;height:28px;border-radius:8px;border:1px solid #ddd;background:#fff;">-</button>
                            <span style="font-weight:700;color:#000;">${item.qty}</span>
                            <button onclick="addToCart(${item.id}, '${item.selectedSize || ''}');renderDrawer();" style="width:28px;height:28px;border-radius:8px;border:none;background:var(--red);color:#fff;">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:15px;">
                <button class="svc-btn" onclick="serviceType='onsite'; renderDrawer()" style="padding:15px;border-radius:12px;border:2px solid ${serviceType === 'onsite' ? 'var(--red)' : '#eee'};background:${serviceType === 'onsite' ? '#fff' : '#f8f8f8'};color:${serviceType === 'onsite' ? 'var(--red)' : '#666'};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:all 0.2s;box-shadow:${serviceType === 'onsite' ? '0 4px 12px rgba(226,27,27,0.15)' : 'none'};">
                    <span style="font-size:1.5rem;">🍽️</span>
                    <span style="font-size:0.7rem;font-weight:700;">Sur place</span>
                </button>
                <button class="svc-btn" onclick="serviceType='takeaway'; renderDrawer()" style="padding:15px;border-radius:12px;border:2px solid ${serviceType === 'takeaway' ? 'var(--red)' : '#eee'};background:${serviceType === 'takeaway' ? '#fff' : '#f8f8f8'};color:${serviceType === 'takeaway' ? 'var(--red)' : '#666'};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:all 0.2s;box-shadow:${serviceType === 'takeaway' ? '0 4px 12px rgba(226,27,27,0.15)' : 'none'};">
                    <span style="font-size:1.5rem;">🛍️</span>
                    <span style="font-size:0.7rem;font-weight:700;">À Emporter</span>
                </button>
                <button class="svc-btn" onclick="serviceType='delivery'; renderDrawer()" style="padding:15px;border-radius:12px;border:2px solid ${serviceType === 'delivery' ? 'var(--red)' : '#eee'};background:${serviceType === 'delivery' ? '#fff' : '#f8f8f8'};color:${serviceType === 'delivery' ? 'var(--red)' : '#666'};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:all 0.2s;box-shadow:${serviceType === 'delivery' ? '0 4px 12px rgba(226,27,27,0.15)' : 'none'};">
                    <span style="font-size:1.5rem;">🛵</span>
                    <span style="font-size:0.7rem;font-weight:700;">Livraison</span>
                </button>
            </div>
            ${serviceType === 'delivery' ? `
            <div style="margin-bottom:20px; animation: fadeIn 0.3s ease;">
                <label style="display:block;margin-bottom:8px;font-weight:700;color:#000;font-size:0.9rem;">📍 Adresse de livraison</label>
                <textarea id="deliveryAddress" rows="2" placeholder="Ex: Appt 12, Résidence Les Fleurs, Tanger..." oninput="window.currentDeliveryAddress = this.value" style="width:100%;padding:12px;border-radius:12px;border:2px solid #eee;font-family:inherit;font-size:0.95rem;box-sizing:border-box;resize:vertical;outline:none;">${window.currentDeliveryAddress || ''}</textarea>
            </div>
            ` : ''}
            <div style="background:#f8f8f8;padding:15px;border-radius:15px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;color:#000;">
                    <span>Total</span><span>${total.toFixed(2)} MAD</span>
                </div>
            </div>
            <button onclick="generateTicket()" style="width:100%;padding:18px;border-radius:16px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:1rem;cursor:pointer;transition:transform 0.1s;">
                CONFIRMER MA COMMANDE
            </button>
        </div>
    `;
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
    const history = JSON.parse(localStorage.getItem('foody_history')) || [];
    const container = document.getElementById('historyContent');
    if (!container) return;
    container.innerHTML = history.length === 0
        ? '<p style="text-align:center;color:#999;padding:20px;">Aucune commande récente.</p>'
        : history.map((t, i) => `
            <div class="history-ticket" style="position:relative;">
                ${t}
                <button onclick="deleteHistoryItem(${i})" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem; filter: grayscale(1);" title="Supprimer">🗑️</button>
            </div>
        `).join('');
}

function deleteHistoryItem(index) {
    if (!confirm('Supprimer ce ticket de l\'historique ?')) return;
    let h = JSON.parse(localStorage.getItem('foody_history')) || [];
    h.splice(index, 1);
    localStorage.setItem('foody_history', JSON.stringify(h));
    renderHistory();
    updateHistoryBadge();
}

function saveToHistory(text) {
    let h = JSON.parse(localStorage.getItem('foody_history')) || [];
    h.unshift(text); if (h.length > 3) h = h.slice(0, 3);
    localStorage.setItem('foody_history', JSON.stringify(h));
    updateHistoryBadge();
}

function updateHistoryBadge() {
    const h = JSON.parse(localStorage.getItem('foody_history')) || [];
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
        alert('Veuillez saisir votre adresse de livraison.');
        return;
    }
    const total = cart.reduce((s, c) => s + (c.price * c.qty), 0);
    const now = new Date();
    const orderNo = Math.floor(1000 + Math.random() * 9000);
    const ticketModal = document.getElementById('ticketModal');
    const ticketContent = document.getElementById('ticketContent');

    const serviceLabels = {
        'onsite': 'Sur place',
        'takeaway': 'À Emporter',
        'delivery': 'Livraison'
    };
    const serviceLabel = serviceLabels[serviceType];

    ticketContent.innerHTML = `
        <div style="padding:50px 30px;font-family:'Outfit',sans-serif;color:#000;min-height:100vh;display:flex;flex-direction:column;justify-content:center;position:relative;">
            <button onclick="closeAllModals()" style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:2rem; cursor:pointer; color:#888;">✕</button>
            <div style="text-align:center;margin-bottom:40px;">
                <div style="font-weight:900;font-size:2.8rem;text-transform:uppercase;letter-spacing:2px;">${window.restaurantConfig?.name || 'Foody'}</div>
                <div style="font-size:0.9rem;color:#666;letter-spacing:4px;text-transform:uppercase;margin-top:10px;">${window.restaurantConfig?.location || 'Tanger, Maroc'}</div>
            </div>
            <div style="border-top:3px solid #000;border-bottom:3px solid #000;padding:25px 0;margin-bottom:40px;text-align:center;">
                <div style="font-weight:900;font-size:1.6rem;letter-spacing:1px;">TICKET #${orderNo}</div>
                <div style="font-size:1rem;color:#555;margin-top:5px;">${now.toLocaleDateString()} — ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div style="margin-top:15px;font-weight:900;color:var(--red);font-size:1.3rem;text-transform:uppercase;">${serviceLabel}</div>
                ${serviceType === 'delivery' ? `<div style="font-size:1.1rem;margin-top:10px;color:#333;font-weight:600;background:#fff5f5;padding:10px;border-radius:8px;border:1px dashed var(--red);">📍 ${window.currentDeliveryAddress}</div>` : ''}
            </div>
            <div style="margin-bottom:30px; border-bottom:1px solid #eee; padding-bottom:20px;">
                ${cart.map(item => `
                    <div style="display:flex;justify-content:space-between;margin-bottom:15px;text-align:left;font-size:1.1rem;">
                        <div style="font-weight:500;"><strong style="color:var(--red);">${item.qty} ×</strong> ${item.name}</div>
                        <div style="font-weight:800;color:#000;">${(item.price * item.qty).toFixed(0)} <span style="font-size:0.7em;">dhs</span></div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-bottom:50px;text-align:center;">
                <div style="background:#000;color:#fff;padding:20px;font-size:1.8rem;font-weight:900;border-radius:12px;letter-spacing:1px;font-family:'Outfit',sans-serif;">
                    TOTAL : ${total.toFixed(0)} dhs
                </div>
            </div>
            
            ${serviceType === 'delivery' ? `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                    <button onclick="document.getElementById('ticketModal').classList.remove('open'); document.getElementById('cartDrawer').classList.add('open');"
                            style="padding:20px;border-radius:12px;border:2px solid #000;background:none;color:#000;font-weight:800;font-size:1rem;cursor:pointer;">
                        MODIFIER
                    </button>
                    <button onclick="sendOrderViaWhatsApp('${orderNo}', ${total.toFixed(2)}, '${serviceLabel}')"
                            style="padding:20px;border-radius:12px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:1rem;cursor:pointer;box-shadow:0 10px 20px rgba(226,27,27,0.3);">
                        COMMANDER
                    </button>
                </div>
            ` : `
                <div id="ticketActions_${orderNo}">
                    <button onclick="finalizeOrderSilent('${orderNo}', ${total.toFixed(2)}, '${serviceLabel}', this)"
                            style="width:100%;padding:22px;border-radius:12px;border:none;background:#222;color:#fff;font-weight:800;font-size:1.2rem;cursor:pointer;box-shadow:0 10px 20px rgba(0,0,0,0.1);">
                        VALIDER LA COMMANDE
                    </button>
                    <div style="text-align:center; margin-top:15px; color:#888; font-size:0.9rem;">Cliquez pour enregistrer et montrer au serveur</div>
                </div>
            `}
        </div>
    `;

    document.getElementById('cartDrawer').classList.remove('open');
    ticketModal.classList.add('open');
}

function finalizeOrder(orderNo, total, serviceLabel) {
    const now = new Date();
    const historyText = `TICKET #${orderNo}\n${now.toLocaleDateString()} ${now.toLocaleTimeString()}\nType: ${serviceLabel}\n${serviceType === 'delivery' ? 'Adresse: ' + window.currentDeliveryAddress.trim() + '\n' : ''}Total: ${total.toFixed(0)} MAD\n---\n${cart.map(i => i.qty + 'x ' + i.name).join('\n')}`;
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
    const historyText = `TICKET #${orderNo}\n${now.toLocaleDateString()} ${now.toLocaleTimeString()}\nType: ${serviceLabel}\nTotal: ${total.toFixed(0)} MAD\n---\n${cart.map(i => i.qty + 'x ' + i.name).join('\n')}`;
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
                style="width:100%;padding:22px;border-radius:12px;border:none;background:#44bb44;color:#fff;font-weight:800;font-size:1.2rem;cursor:pointer;box-shadow:0 10px 20px rgba(68,187,68,0.2);">
            COMMANDE ENREGISTRÉE ✔
        </button>
        <div style="text-align:center; margin-top:15px; color:#44bb44; font-weight:700;">Ticket validé ! Cliquez pour fermer.</div>
    `;
}

function sendOrderViaWhatsApp(orderNo, total, serviceLabel) {
    const now = new Date();

    // WhatsApp formatting
    let waText = `*NOUVELLE COMMANDE #${orderNo}*\n`;
    waText += `Type: ${serviceLabel}\n`;
    if (serviceType === 'delivery') {
        waText += `📍 Adresse: ${window.currentDeliveryAddress.trim()}\n`;
    }
    waText += `---------------------------\n`;
    cart.forEach(item => {
        waText += `${item.qty}x ${item.name} - ${(item.price * item.qty).toFixed(0)} dhs\n`;
    });
    waText += `---------------------------\n`;
    waText += `*TOTAL: ${total.toFixed(0)} dhs*\n`;

    const configPhone = window.restaurantConfig?.phone || '+212600000000';
    const phone = configPhone.replace(/\D/g, ''); // strip non-numeric

    // Save history then clear and send
    finalizeOrder(orderNo, total, serviceLabel);

    // Open WhatsApp
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waText)}`, '_blank');
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
window.setService = setService;
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
