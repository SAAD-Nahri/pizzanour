// ============================================
//  FOODY – Admin Dashboard Logic (PRO)
// ============================================

const defaultMenu = [
    // BURGERS
    { id: 1, cat: 'Burgers', name: 'Cheese-Burger', desc: '1 Steak, Fromage, Salade', ingredients: ['Steak haché', 'Fromage', 'Salade', 'Sauce'], price: 22, images: [] },
    { id: 2, cat: 'Burgers', name: 'Quality-Burger', desc: '1 Steak, Oeuf, Fromage, Salade', ingredients: ['Steak haché', 'Oeuf', 'Fromage', 'Salade'], price: 25, images: [] },
    { id: 3, cat: 'Burgers', name: 'Double-Cheese', desc: '2 Steaks, Fromage, Salade', ingredients: ['2 Steaks hachés', 'Fromage', 'Salade', 'Sauce'], price: 32, images: [] },
    { id: 4, cat: 'Burgers', name: 'Triple-Burger', desc: '3 Steaks, Fromage, Salade', ingredients: ['3 Steaks hachés', 'Fromage', 'Salade', 'Sauce'], price: 50, badge: 'XXL', images: [] },
    { id: 5, cat: 'Burgers', name: 'Bigg-Burger', desc: '2 Steaks, Fromage, Salade', ingredients: ['2 Steaks hachés', 'Fromage', 'Salade', 'Sauce'], price: 33, images: [] },
    { id: 6, cat: 'Burgers', name: 'Chicken-Burger', desc: '1 Steak Poulet, Fromage, Salade', ingredients: ['Steak poulet', 'Fromage', 'Salade', 'Sauce'], price: 24, images: [] },
    { id: 7, cat: 'Burgers', name: 'Roasty Chicken', desc: 'Poulet rôti, Fromage, Salade', ingredients: ['Poulet rôti', 'Fromage', 'Salade'], price: 28, images: [] },
    { id: 8, cat: 'Burgers', name: 'Fish-Supreme', desc: 'Filet de poisson, Fromage, Salade', ingredients: ['Filet de poisson', 'Fromage', 'Salade', 'Sauce tartare'], price: 28, images: [] },
    { id: 9, cat: 'Burgers', name: 'Menu Enfants', desc: 'Burger + Cheese + Frites + Boisson', ingredients: ['Mini burger', 'Fromage', 'Frites', 'Boisson'], price: 40, badge: 'Kids', images: [] },
    // SANDWICH FROID
    { id: 10, cat: 'Sandwich Froid', name: 'Sandwich Thon', desc: 'Thon, Salade, Frites', ingredients: ['Thon', 'Salade', 'Frites', 'Mayonnaise'], price: 15, images: [] },
    { id: 11, cat: 'Sandwich Froid', name: 'Sandwich Mortadelle', desc: 'Mortadelle, Salade, Frites', ingredients: ['Mortadelle', 'Salade', 'Frites'], price: 12, images: [] },
    { id: 12, cat: 'Sandwich Froid', name: 'Sandwich Cacher', desc: 'Cacher, Salade, Frites', ingredients: ['Cacher', 'Salade', 'Frites'], price: 12, images: [] },
    { id: 13, cat: 'Sandwich Froid', name: 'Sandwich Oeuf', desc: 'Oeuf, Salade, Frites', ingredients: ['Oeuf', 'Salade', 'Frites'], price: 12, images: [] },
    { id: 14, cat: 'Sandwich Froid', name: 'Sandwich Tortilla', desc: 'Tortilla, Salade, Frites', ingredients: ['Tortilla', 'Salade', 'Frites'], price: 15, images: [] },
    { id: 15, cat: 'Sandwich Froid', name: 'Sandwich Tortilla Spéciale', desc: 'Tortilla spéciale, Salade, Frites', ingredients: ['Tortilla', 'Garniture spéciale', 'Salade', 'Frites'], price: 20, badge: 'Spécial', images: [] },
    // SANDWICH CHAUD
    { id: 16, cat: 'Sandwich Chaud', name: 'Sandwich Escalope', desc: 'Escalope grillée, Salade, Frites', ingredients: ['Escalope', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    { id: 17, cat: 'Sandwich Chaud', name: 'Sandwich Poulet', desc: 'Poulet grillé, Salade, Frites', ingredients: ['Poulet', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    { id: 18, cat: 'Sandwich Chaud', name: 'Sandwich Viande Hachée', desc: 'Viande hachée, Salade, Frites', ingredients: ['Viande hachée', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    { id: 19, cat: 'Sandwich Chaud', name: 'Sandwich Saucisse', desc: 'Saucisse grillée, Salade, Frites', ingredients: ['Saucisse', 'Salade', 'Frites', 'Sauce'], price: 25, images: [] },
    { id: 20, cat: 'Sandwich Chaud', name: 'Sandwich Fruits de Mer', desc: 'Fruits de mer, Salade, Frites', ingredients: ['Crevettes', 'Calamar', 'Salade', 'Frites'], price: 40, badge: 'Premium', images: [] },
    { id: 21, cat: 'Sandwich Chaud', name: 'Sandwich Foie', desc: 'Foie grillé, Salade, Frites', ingredients: ['Foie', 'Salade', 'Frites', 'Oignons'], price: 35, images: [] },
    { id: 22, cat: 'Sandwich Chaud', name: 'Sandwich Mixte', desc: 'Mix viandes, Salade, Frites', ingredients: ['Mix viandes', 'Salade', 'Frites', 'Sauce'], price: 35, images: [] },
    { id: 23, cat: 'Sandwich Chaud', name: 'Sandwich Cordon Bleu', desc: 'Cordon bleu, Salade, Frites', ingredients: ['Cordon bleu', 'Fromage', 'Salade', 'Frites'], price: 27, images: [] },
    { id: 24, cat: 'Sandwich Chaud', name: 'Sandwich Chawarma', desc: 'Chawarma, Salade, Frites', ingredients: ['Chawarma', 'Salade', 'Frites', 'Sauce'], price: 27, images: [] },
    // PLATS
    { id: 25, cat: 'Plats', name: 'Plat Poulet', desc: 'Poulet grillé avec riz ou frites, salade', ingredients: ['Poulet', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 26, cat: 'Plats', name: 'Plat Viande Hachée', desc: 'Viande hachée avec riz ou frites, salade', ingredients: ['Viande hachée', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 27, cat: 'Plats', name: 'Plat Chawarma', desc: 'Chawarma avec riz ou frites, salade', ingredients: ['Chawarma', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 28, cat: 'Plats', name: 'Plat Saucisse', desc: 'Saucisse avec riz ou frites, salade', ingredients: ['Saucisse', 'Riz ou Frites', 'Salade'], price: 38, images: [] },
    { id: 29, cat: 'Plats', name: 'Plat Cordon Bleu', desc: 'Cordon bleu avec riz ou frites, salade', ingredients: ['Cordon bleu', 'Riz ou Frites', 'Salade'], price: 45, images: [] },
    { id: 30, cat: 'Plats', name: 'Plat Foie', desc: 'Foie grillé avec riz ou frites, salade', ingredients: ['Foie', 'Riz ou Frites', 'Salade'], price: 45, images: [] },
    { id: 31, cat: 'Plats', name: 'Plat Fruits de Mer', desc: 'Fruits de mer avec riz ou frites, salade', ingredients: ['Crevettes', 'Calamar', 'Riz ou Frites', 'Salade'], price: 50, badge: 'Premium', images: [] },
    { id: 32, cat: 'Plats', name: 'Plat Mixte', desc: 'Mix viandes avec riz ou frites, salade', ingredients: ['Mix viandes', 'Riz ou Frites', 'Salade'], price: 50, images: [] },
    { id: 33, cat: 'Plats', name: 'Plat Escalope', desc: 'Escalope avec riz ou frites, salade', ingredients: ['Escalope', 'Riz ou Frites', 'Salade'], price: 40, images: [] },
    // PANINIS
    { id: 34, cat: 'Paninis', name: 'Panini Thon', desc: 'Panini grillé au thon', ingredients: ['Thon', 'Fromage', 'Sauce'], price: 18, images: [] },
    { id: 35, cat: 'Paninis', name: 'Panini Fromage', desc: 'Panini grillé fromage fondu', ingredients: ['Fromage fondu', 'Herbes'], price: 18, images: [] },
    { id: 36, cat: 'Paninis', name: 'Panini Poulet', desc: 'Panini grillé au poulet', ingredients: ['Poulet', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 37, cat: 'Paninis', name: 'Panini Viande Hachée', desc: 'Panini grillé viande hachée', ingredients: ['Viande hachée', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 38, cat: 'Paninis', name: 'Panini Saucisse', desc: 'Panini grillé saucisse', ingredients: ['Saucisse', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 39, cat: 'Paninis', name: 'Panini Chawarma', desc: 'Panini grillé chawarma', ingredients: ['Chawarma', 'Fromage', 'Sauce'], price: 25, images: [] },
    { id: 40, cat: 'Paninis', name: 'Panini Fruits de Mer', desc: 'Panini grillé fruits de mer', ingredients: ['Crevettes', 'Calamar', 'Fromage', 'Sauce'], price: 35, images: [] },
    { id: 41, cat: 'Paninis', name: 'Panini Mixte', desc: 'Panini grillé mixte', ingredients: ['Mix viandes', 'Fromage', 'Sauce'], price: 35, images: [] },
    // TACOS
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
    // GRATINÉ
    { id: 63, cat: 'Gratiné', name: 'Gratiné (L)', desc: 'Gratiné au fromage', ingredients: ['Viande', 'Fromage gratiné', 'Frites', 'Sauce'], price: 45, images: [] },
    { id: 64, cat: 'Gratiné', name: 'Gratiné (XL)', desc: 'Gratiné au fromage — XL', ingredients: ['Viande (double)', 'Fromage gratiné', 'Frites', 'Sauce'], price: 60, badge: 'XL', images: [] },
    // DIVERS
    { id: 65, cat: 'Divers', name: '6 Nuggets', desc: '6 pièces croustillantes', ingredients: ['Nuggets de poulet', 'Sauce'], price: 25, images: [] },
    { id: 66, cat: 'Divers', name: '6 Croquettes', desc: '6 croquettes croustillantes', ingredients: ['Croquettes', 'Sauce'], price: 30, images: [] },
    { id: 67, cat: 'Divers', name: 'Plat de Frites', desc: 'Portion de frites', ingredients: ['Frites', 'Sel'], price: 7, images: [] },
    { id: 68, cat: 'Divers', name: 'Supplément Fromage', desc: 'Fromage en supplément', ingredients: ['Fromage'], price: 10, images: [] },
    // SALADES
    { id: 69, cat: 'Salades', name: 'Salade Niçoise', desc: 'Salade niçoise fraîche', ingredients: ['Thon', 'Oeuf', 'Tomate', 'Olives', 'Laitue'], price: 20, images: [] },
    { id: 70, cat: 'Salades', name: 'Salade Rosa', desc: 'Salade rosa', ingredients: ['Laitue', 'Tomate', 'Concombre', 'Carotte', 'Vinaigrette'], price: 20, images: [] },
    { id: 71, cat: 'Salades', name: 'Salade Poulet', desc: 'Salade au poulet grillé', ingredients: ['Poulet grillé', 'Laitue', 'Tomate', 'Maïs', 'Sauce'], price: 25, images: [] },
    { id: 72, cat: 'Salades', name: 'Salade Panda', desc: 'Salade panda premium', ingredients: ['Mix salade', 'Garniture spéciale', 'Sauce chef'], price: 30, badge: 'Premium', images: [] },
];

const defaultCatEmojis = { 'Burgers': '🍔', 'Sandwich Froid': '🥪', 'Sandwich Chaud': '🔥', 'Plats': '🍽️', 'Paninis': '🥖', 'Tacos': '🌮', 'Gratiné': '🧀', 'Divers': '🍟', 'Salades': '🥗' };

const defaultWifiData = { ssid: 'Foody_Guest', pass: 'foody2026' };
const defaultSocialLinks = { instagram: '', facebook: '', tiktok: '', whatsapp: '212626081745' };

let menu = [];
let catEmojis = {};
let wifiData = { ...defaultWifiData };
let socialLinks = { ...defaultSocialLinks };
let promoId = null;
let formsInitialized = false;

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

function buildSiteData() {
    return {
        menu: menu.map(normalizeMenuItem),
        catEmojis,
        wifi: wifiData,
        social: socialLinks,
        promoId
    };
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminSidebar').style.display = 'none';
    document.getElementById('adminMain').style.display = 'none';
}

async function checkSession() {
    try {
        const res = await fetch('/api/admin/session');
        if (!res.ok) return false;
        const result = await res.json();
        return Boolean(result.authenticated);
    } catch (_error) {
        return false;
    }
}

async function loadData() {
    const res = await fetch('/api/data');
    if (res.status === 401) {
        showLoginScreen();
        throw new Error('Authentication required');
    }
    if (!res.ok) throw new Error('Server returned ' + res.status);
    applySiteData(await res.json());
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('loginPass').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
    document.getElementById('loginUser').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('loginPass').focus();
    });

    if (await checkSession()) {
        await showDashboard();
    } else {
        showLoginScreen();
    }
});

async function attemptLogin() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(result.error || 'Login failed');
        }
        await showDashboard();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminSidebar').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'block';

    try {
        await loadData();
        refreshUI();
        if (!formsInitialized) {
            initForms();
            formsInitialized = true;
        }
    } catch (error) {
        if (error.message !== 'Authentication required') {
            alert('Failed to load admin data: ' + error.message);
        }
    }
}

async function adminLogout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_error) {
        // Ignore logout failures and reset UI state.
    }
    location.reload();
}

function refreshUI() {
    renderMenuTable();
    renderCatTable();
    populateCatDropdown();
    initWifiForm();
    initSocialForm();
    initSecurityForm();
    updateStats();
}

function renderMenuTable() {
    const tbody = document.querySelector('#menuTable tbody');
    if (!tbody) return;
    tbody.innerHTML = menu.map(item => {
        // Fix image fallback logic
        const images = (item.images && item.images.length > 0) ? item.images : (item.img ? [item.img] : []);
        const firstImg = images.length > 0 ? images[0] : '';
        return `
        <tr>
            <td>
                <div style="width:50px; height:50px; background:#eee; border-radius:8px; overflow:hidden; border:1px solid #ddd; cursor:pointer" onclick="openImageModal(${item.id})">
                    ${firstImg ? `<img src="${firstImg}" style="width:100%; height:100%; object-fit:cover" onerror="this.src='https://via.placeholder.com/50?text=Error'">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">📷</div>'}
                </div>
                ${images.length > 0 ? `<small style="display:block;text-align:center;font-size:10px;color:var(--primary);cursor:pointer;margin-top:2px" onclick="openImageModal(${item.id})">${images.length} image(s)</small>` : ''}
            </td>
            <td><strong>${item.name}</strong><br><small style="color:#888">${item.desc}</small></td>
            <td>${item.cat}</td>
            <td>MAD ${item.price.toFixed(2)}</td>
            <td><span class="promo-star action-btn ${promoId == item.id ? 'promo-active' : ''}" onclick="togglePromo(${item.id})">⭐</span></td>
            <td>
                <button class="action-btn" onclick="editItem(${item.id})" title="Modifier les détails">✏️</button>
                <button class="action-btn" onclick="openImageModal(${item.id})" title="Gérer les images">🖼️</button>
                <button class="action-btn" onclick="deleteItem(${item.id})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

let editingItemId = null;

function editItem(id) {
    const item = menu.find(m => m.id == id);
    if (!item) return;

    editingItemId = id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCat').value = item.cat;
    document.getElementById('itemDesc').value = item.desc;
    document.getElementById('itemIngredients').value = (item.ingredients || []).join(', ');
    document.getElementById('itemPrice').value = item.price;

    // Change form title and button
    document.querySelector('#menu h3').textContent = "Modifier le produit: " + item.name;
    document.querySelector('#foodForm .primary-btn').textContent = "💾 Mettre à jour le produit";

    // Scroll to form
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

function resetFoodForm() {
    editingItemId = null;
    document.getElementById('foodForm').reset();
    document.querySelector('#menu h3').textContent = "Add New Food Item";
    document.querySelector('#foodForm .primary-btn').textContent = "➕ Save Product";
}

function initForms() {
    document.getElementById('foodForm').onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('itemFile');
        const urlInput = document.getElementById('itemImg').value;

        let images = urlInput.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);

        if (fileInput.files.length > 0) {
            const uploadedImages = await uploadFiles(fileInput.files);
            images.push(...uploadedImages);
        }

        const ingredients = document.getElementById('itemIngredients').value.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (editingItemId) {
            const index = menu.findIndex(m => m.id == editingItemId);
            if (index !== -1) {
                const finalImages = images.length > 0 ? images : (menu[index].images || []);
                menu[index] = {
                    ...menu[index],
                    name: document.getElementById('itemName').value,
                    cat: document.getElementById('itemCat').value,
                    desc: document.getElementById('itemDesc').value,
                    ingredients: ingredients,
                    price: parseFloat(document.getElementById('itemPrice').value),
                    images: finalImages,
                    img: finalImages[0] || ''
                };
            }
            showToast('Produit mis à jour avec succès !');
        } else {
            const newItem = {
                id: Date.now(),
                name: document.getElementById('itemName').value,
                cat: document.getElementById('itemCat').value,
                desc: document.getElementById('itemDesc').value,
                ingredients: ingredients,
                price: parseFloat(document.getElementById('itemPrice').value),
                images: images,
                img: images[0] || ''
            };
            menu.push(newItem);
            showToast('Produit ajouté avec succès !');
        }

        await saveAndRefresh();
        resetFoodForm();
    };

    document.getElementById('catForm').onsubmit = async (e) => {
        e.preventDefault();
        catEmojis[document.getElementById('catName').value] = document.getElementById('catEmoji').value;
        await saveAndRefresh();
        e.target.reset();
        showToast('Catégorie ajoutée !');
    };

    document.getElementById('wifiForm').onsubmit = async (e) => {
        e.preventDefault();
        wifiData.ssid = document.getElementById('wifiSSID').value;
        wifiData.pass = document.getElementById('wifiPassInput').value;
        await saveAndRefresh();
        showToast('WiFi mis à jour !');
    };

    document.getElementById('socialForm').onsubmit = async (e) => {
        e.preventDefault();
        socialLinks.instagram = document.getElementById('socialInsta').value;
        socialLinks.facebook = document.getElementById('socialFb').value;
        socialLinks.tiktok = document.getElementById('socialTiktok').value;
        socialLinks.whatsapp = document.getElementById('socialWhatsapp').value.trim();
        await saveAndRefresh();
        initSocialForm();
        showToast('Liens sociaux sauvegardés !');
    };
}
function initSocialForm() {
    document.getElementById('socialInsta').value = socialLinks.instagram;
    document.getElementById('socialFb').value = socialLinks.facebook;
    document.getElementById('socialTiktok').value = socialLinks.tiktok;
    document.getElementById('socialWhatsapp').value = socialLinks.whatsapp || '';

    const preview = document.getElementById('socialPreview');
    let chips = '';
    if (socialLinks.instagram) chips += `<a href="${socialLinks.instagram}" target="_blank" class="social-chip"><span>IG</span> Instagram</a>`;
    if (socialLinks.facebook) chips += `<a href="${socialLinks.facebook}" target="_blank" class="social-chip"><span>FB</span> Facebook</a>`;
    if (socialLinks.tiktok) chips += `<a href="${socialLinks.tiktok}" target="_blank" class="social-chip"><span>TT</span> TikTok</a>`;
    if (socialLinks.whatsapp) chips += `<a href="https://wa.me/${socialLinks.whatsapp}" target="_blank" class="social-chip"><span>WA</span> WhatsApp</a>`;
    preview.innerHTML = chips || '<p style="color:#888">No social links configured yet.</p>';
}

function initSecurityForm() {
    const note = document.getElementById('securityNote');
    if (note) {
        note.textContent = 'Admin credentials are controlled by ADMIN_USER and ADMIN_PASS in the server environment.';
    }
}

async function uploadFiles(fileList) {
    const urls = [];
    for (const file of Array.from(fileList || [])) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        if (res.status === 401) {
            showLoginScreen();
            throw new Error('Authentication required');
        }
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(result.error || 'Upload failed with status ' + res.status);
        }
        urls.push(result.url);
    }
    return urls;
}

async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    menu = menu.filter(item => item.id != id);
    if (promoId == id) promoId = null;
    await saveAndRefresh();
}

async function togglePromo(id) {
    promoId = promoId == id ? null : id;
    await saveAndRefresh();
}

async function saveAndRefresh() {
    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildSiteData())
        });
        if (res.status === 401) {
            showLoginScreen();
            throw new Error('Authentication required');
        }
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(result.error || 'Server returned ' + res.status);
        }
        applySiteData(result.data || buildSiteData());
        refreshUI();
    } catch (error) {
        console.error('Save error:', error);
        alert('Save failed: ' + error.message);
    }
}

async function resetDefaults() {
    if (!confirm('Reset all site data?')) return;
    try {
        const res = await fetch('/api/data/reset', { method: 'POST' });
        if (res.status === 401) {
            showLoginScreen();
            throw new Error('Authentication required');
        }
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(result.error || 'Reset failed');
        }
        applySiteData(result.data || {});
        refreshUI();
        showToast('Data reset.');
    } catch (error) {
        alert('Reset failed: ' + error.message);
    }
}

function showToast(msg) {
    const toast = document.getElementById('adminToast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(navBtn => navBtn.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');

    if (window.innerWidth <= 992) {
        toggleSidebar();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
}

function populateCatDropdown() {
    document.getElementById('itemCat').innerHTML = Object.keys(catEmojis)
        .map(category => `<option value="${category}">${category}</option>`)
        .join('');
}

function renderCatTable() {
    document.querySelector('#catTable tbody').innerHTML = Object.keys(catEmojis)
        .map(category => `
            <tr>
                <td>${catEmojis[category]}</td>
                <td><strong>${category}</strong></td>
                <td>${menu.filter(item => item.cat === category).length} items</td>
                <td><button class="action-btn" onclick="deleteCat('${category}')">Delete</button></td>
            </tr>
        `)
        .join('');
}

async function deleteCat(category) {
    if (menu.some(item => item.cat === category)) {
        alert('Delete the items in this category first.');
        return;
    }
    delete catEmojis[category];
    await saveAndRefresh();
}

function initWifiForm() {
    document.getElementById('wifiSSID').value = wifiData.ssid;
    document.getElementById('wifiPassInput').value = wifiData.pass;
    document.getElementById('hintS').textContent = wifiData.ssid;
    document.getElementById('hintP').textContent = wifiData.pass;
}

function updateStats() {
    document.getElementById('stat-products').textContent = menu.length;
    document.getElementById('stat-cats').textContent = Object.keys(catEmojis).length;
    document.getElementById('stat-promo').textContent = promoId ? 'YES' : 'NO';
}

let currentEditingId = null;

function openImageModal(id) {
    currentEditingId = id;
    const item = menu.find(m => m.id == id);
    if (!item) return;

    if (!item.images) {
        item.images = item.img ? [item.img] : [];
    }

    document.getElementById('imgModalItemName').textContent = item.name;
    document.getElementById('imageModal').style.display = 'flex';
    renderModalImages();
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    currentEditingId = null;
}

function renderModalImages() {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    const grid = document.getElementById('currentImagesGrid');
    const images = item.images || (item.img ? [item.img] : []);
    const cards = images.map((img, index) => `
        <div style="position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden; border:1px solid #ddd;">
            <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
            <button onclick="deleteModalImage(${index})" style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px; font-size:12px;">X</button>
        </div>
    `).join('');

    grid.innerHTML = cards || '<p style="grid-column: span 3; color:#888; text-align:center;">No images yet.</p>';
}

async function handleModalImageUpload(input) {
    if (!input.files || input.files.length === 0) return;

    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];

    const uploadedImages = await uploadFiles(input.files);
    item.images.push(...uploadedImages);
    item.img = item.images[0] || '';

    input.value = '';
    await saveAndRefresh();
    renderModalImages();
    showToast('Images added.');
}

async function addModalImageUrl() {
    const url = document.getElementById('modalImgUrl').value.trim();
    if (!url) return;

    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];
    item.images.push(url);
    item.img = item.images[0] || '';

    document.getElementById('modalImgUrl').value = '';
    await saveAndRefresh();
    renderModalImages();
    showToast('Image added.');
}

async function deleteModalImage(index) {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item || !item.images) return;

    item.images.splice(index, 1);
    item.img = item.images[0] || '';

    await saveAndRefresh();
    renderModalImages();
    showToast('Image removed.');
}
