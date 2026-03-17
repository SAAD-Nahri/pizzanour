let menu = [];
let catEmojis = window.defaultCatEmojis || {};
let restaurantConfig = window.restaurantConfig || window.defaultConfig || {};
let promoIds = [];
let adminAuth = { user: 'admin', pass: 'foody2026' };

// Admin category filter state
let currentAdminCategory = localStorage.getItem('foody_admin_category_filter') || 'All';

// Load all data from server API
async function loadDataFromServer() {
    try {
        const res = await fetch('/api/data', { credentials: 'include' });
        if (!res.ok) return false;
        const data = await res.json();

        // Populate menu
        menu = Array.isArray(data.menu) ? data.menu : [];

        // Populate categories
        if (data.catEmojis && Object.keys(data.catEmojis).length > 0) {
            catEmojis = data.catEmojis;
        }

        // Populate config from server data
        if (data.superCategories) {
            restaurantConfig.superCategories = data.superCategories;
        }
        if (data.wifi) {
            restaurantConfig.wifi = { name: data.wifi.ssid || '', code: data.wifi.pass || '' };
        }
        if (data.social) {
            restaurantConfig.socials = data.social;
        }
        if (data.landing) {
            restaurantConfig.location = data.landing.location || restaurantConfig.location;
            restaurantConfig.phone = data.landing.phone || restaurantConfig.phone;
        }
        if (data.hours) {
            restaurantConfig._hours = data.hours;
        }
        if (data.gallery) {
            restaurantConfig.gallery = data.gallery;
        }
        if (data.promoId !== undefined) {
            promoIds = data.promoId ? [data.promoId] : [];
        }
        if (Array.isArray(data.promoIds)) {
            promoIds = data.promoIds;
        }

        console.log('[ADMIN] Loaded', menu.length, 'items from server');
        return true;
    } catch (e) {
        console.error('[ADMIN] Failed to load data from server:', e);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Allow Enter key on login
    document.getElementById('loginPass').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performAdminLogin();
    });
    document.getElementById('loginUser').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('loginPass').focus();
    });
});

async function performAdminLogin() {
    console.log('[LOGIN] performAdminLogin triggered');
    const userEl = document.getElementById('loginUser');
    const passEl = document.getElementById('loginPass');
    const errorEl = document.getElementById('loginError');

    if (!userEl || !passEl) {
        console.error('[LOGIN] Missing login elements!');
        return;
    }

    const username = userEl.value.trim();
    const password = passEl.value;

    console.log('[LOGIN] Attempting login for:', username);

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log('[LOGIN] Server response:', data);
        if (!res.ok || !data.ok) {
            if (errorEl) {
                errorEl.textContent = '❌ Identifiants incorrects';
                errorEl.style.display = 'block';
            }
            return;
        }
        showDashboard();
    } catch (e) {
        console.error('[LOGIN] Request error:', e);
        if (errorEl) {
            errorEl.textContent = '❌ Erreur de connexion au serveur';
            errorEl.style.display = 'block';
        }
    }
}

async function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminSidebar').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'block';
    await loadDataFromServer();
    refreshUI();
    initForms();
}

async function adminLogout() {
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); } catch (e) { }
    location.reload();
}

function refreshUI() {
    renderCategoryFilters();
    renderMenuTable();
    renderCatTable();
    renderSuperCatTable();
    populateCatDropdown();
    initWifiForm();
    initLandingPageForm();
    initSuperCatForm();
    initSecurityForm();
    initHoursForm();
    initGalleryForm();
    renderGalleryAdmin();
    updateStats();
}

// ─── CATEGORY FILTERS LOGIC ──────────────────────────────────────────────
function renderCategoryFilters() {
    const container = document.getElementById('adminCategoryFilters');
    if (!container) return;

    // Calculate counts
    const counts = { 'All': menu.length };
    menu.forEach(item => {
        const cat = item.cat || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    // Create unique categories list
    const categories = ['All', ...new Set(menu.map(i => i.cat || 'Uncategorized'))].sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
    });

    // Render buttons
    container.innerHTML = categories.map(cat => {
        const count = counts[cat] || 0;
        const isActive = currentAdminCategory === cat ? 'active' : '';
        return `<button class="category-filter-btn ${isActive}" onclick="setAdminCategoryFilter('${cat}')">
            ${cat} <span style="opacity:0.75; font-size:0.8em;">(${count})</span>
        </button>`;
    }).join('');
}

window.setAdminCategoryFilter = function (cat) {
    currentAdminCategory = cat;
    localStorage.setItem('foody_admin_category_filter', cat);

    // Update active state on buttons without full re-render
    const buttons = document.querySelectorAll('#adminCategoryFilters .category-filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(cat + ' ')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderMenuTable();
}
// ─────────────────────────────────────────────────────────────────────────

function renderMenuTable() {
    const tbody = document.querySelector('#menuTable tbody');
    if (!tbody) return;
    try {
        // Filter menu based on active category
        const filteredMenu = currentAdminCategory === 'All'
            ? menu
            : menu.filter(item => (item.cat || 'Uncategorized') === currentAdminCategory);

        if (filteredMenu.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#888;">Aucun produit dans la catégorie "${currentAdminCategory}".</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredMenu.map(item => {
            // Fix image fallback logic
            const images = (item.images && item.images.length > 0) ? item.images : (item.img ? [item.img] : []);
            const firstImg = images.length > 0 ? images[0] : '';
            const safePrice = Number(item.price) || 0;
            const likeCount = (typeof window.getLikeCount === 'function') ? window.getLikeCount(item.id) : 0;
            return `
            <tr>
                <td>
                    <div style="width:50px; height:50px; background:#eee; border-radius:8px; overflow:hidden; border:1px solid #ddd; cursor:pointer" onclick="openImageModal(${item.id})">
                        ${firstImg ? `<img src="${firstImg}" style="width:100%; height:100%; object-fit:cover" onerror="this.src='https://via.placeholder.com/50?text=Error'">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">📷</div>'}
                    </div>
                    ${images.length > 0 ? `<small style="display:block;text-align:center;font-size:10px;color:var(--primary);cursor:pointer;margin-top:2px" onclick="openImageModal(${item.id})">${images.length} image(s)</small>` : ''}
                </td>
                <td><strong>${item.name || 'UnnamedItem'}</strong><br><small style="color:#888">${item.desc || ''}</small></td>
                <td>${item.cat || 'Uncategorized'}</td>
                <td>MAD ${safePrice.toFixed(2)}</td>
                <td><span style="color:#e01e2f">❤️</span> ${likeCount}</td>
                <td><span class="promo-star action-btn ${promoIds.includes(item.id) ? 'promo-active' : ''}" onclick="togglePromo(${item.id})">⭐</span></td>
                <td><span class="promo-star action-btn ${item.featured ? 'promo-active' : ''}" onclick="toggleFeatured(${item.id})" style="filter: ${item.featured ? 'none' : 'grayscale(1)'}; opacity: ${item.featured ? '1' : '0.5'};">✨</span></td>
                <td>
                    <button class="action-btn" onclick="editItem(${item.id})" title="Modifier les détails">✏️</button>
                    <button class="action-btn" onclick="openImageModal(${item.id})" title="Gérer les images">🖼️</button>
                    <button class="action-btn" onclick="deleteItem(${item.id})">🗑️</button>
                </td>
            </tr > `;
        }).join('');
    } catch (e) {
        console.error('Render Table Error:', e);
        tbody.innerHTML = `< tr > <td colspan="7" style="color:red; text-align:center;">Erreur de chargement des produits. Veuillez cliquer sur 'Reset All Data'.</td></tr > `;
    }
}

let editingItemId = null;
// Store the full existing image array for the item being edited (including base64)
window._editingImages = [];

function toggleSizesUI() {
    const hasSizes = document.getElementById('itemHasSizes').checked;
    document.getElementById('singlePriceGroup').style.display = hasSizes ? 'none' : 'block';
    document.getElementById('multiPriceGroup').style.display = hasSizes ? 'grid' : 'none';
}

function editItem(id) {
    const item = menu.find(m => m.id == id);
    if (!item) return;

    editingItemId = id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCat').value = item.cat;
    document.getElementById('itemDesc').value = item.desc || '';
    document.getElementById('itemIngredients').value = (item.ingredients || []).join(', ');

    const hasSizes = item.hasSizes || false;
    document.getElementById('itemHasSizes').checked = hasSizes;
    toggleSizesUI();

    if (hasSizes && item.sizes) {
        document.getElementById('itemPriceSmall').value = item.sizes.small || '';
        document.getElementById('itemPriceMedium').value = item.sizes.medium || '';
        document.getElementById('itemPriceLarge').value = item.sizes.large || '';
        document.getElementById('itemPrice').value = '';
    } else {
        document.getElementById('itemPrice').value = item.price || '';
        document.getElementById('itemPriceSmall').value = '';
        document.getElementById('itemPriceMedium').value = '';
        document.getElementById('itemPriceLarge').value = '';
    }

    document.getElementById('itemFeatured').checked = item.featured || false;
    const availableCb = document.getElementById('itemAvailable');
    if (availableCb) availableCb.checked = item.available !== false;

    // Store ALL existing images (including base64) for preservation during save
    const existingImages = item.images && item.images.length > 0 ? item.images : (item.img ? [item.img] : []);
    window._editingImages = [...existingImages];

    // Show only URL images in the text field (base64 is too long to show)
    const urlImages = existingImages.filter(img => !img.startsWith('data:'));
    const imgInput = document.getElementById('itemImg');
    if (imgInput) imgInput.value = urlImages.join(', ');

    // Change form title and button
    document.querySelector('#menu h3').textContent = "✏️ Modifier: " + item.name;
    document.querySelector('#foodForm .primary-btn').textContent = "💾 Mettre à jour le produit";

    // Scroll to form
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

function resetFoodForm() {
    editingItemId = null;
    document.getElementById('foodForm').reset();
    document.getElementById('itemFeatured').checked = false;
    document.getElementById('itemHasSizes').checked = false;
    const availableCb = document.getElementById('itemAvailable');
    if (availableCb) availableCb.checked = true;
    toggleSizesUI();
    document.querySelector('#menu h3').textContent = "Add New Food Item";
    document.querySelector('#foodForm .primary-btn').textContent = "➕ Save Product";
}

function initForms() {
    document.getElementById('foodForm').onsubmit = async (e) => {
        e.preventDefault();
        await commitFormItem();
    };

    // --- Shared save logic, can be called directly without a form submit event ---
    window.commitFormItem = async function () {
        const fileInput = document.getElementById('itemFile');
        const urlInput = document.getElementById('itemImg').value;

        // Parse URL images — split by NEWLINE only
        let urlImages = urlInput.split(/\n/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('data:'));

        // Upload new files to server (stored on disk, returned as /uploads/... URL)
        let newUploadedUrls = [];
        if (fileInput && fileInput.files.length > 0) {
            showToast('⏳ Téléchargement des images en cours...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    newUploadedUrls.push(url);
                } catch (err) {
                    console.error('Image upload failed:', err);
                    showToast('⚠️ Échec du téléchargement de l\'image — réessayez.');
                }
            }
        }

        // Build final images array:
        // - URL images from text field + newly uploaded server URLs
        // - Keep existing images if nothing new is provided
        let finalImages;
        if (editingItemId) {
            const existingImages = window._editingImages || [];
            if (newUploadedUrls.length > 0) {
                // New uploads provided — use URL list + new server images
                finalImages = [...urlImages, ...newUploadedUrls];
            } else if (urlImages.length > 0) {
                // URL field was updated — use those (no new uploads)
                finalImages = [...urlImages];
            } else {
                // Nothing changed — keep all existing images
                finalImages = [...existingImages];
            }
        } else {
            finalImages = [...urlImages, ...newUploadedUrls];
        }

        const ingredients = document.getElementById('itemIngredients').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const name = document.getElementById('itemName').value.trim();
        const cat = document.getElementById('itemCat').value;
        const desc = document.getElementById('itemDesc').value.trim();
        const featured = document.getElementById('itemFeatured').checked;
        const available = document.getElementById('itemAvailable').checked;

        const hasSizes = document.getElementById('itemHasSizes').checked;
        let price = 0;
        let sizes = null;

        if (hasSizes) {
            sizes = {
                small: parseFloat(document.getElementById('itemPriceSmall').value) || 0,
                medium: parseFloat(document.getElementById('itemPriceMedium').value) || 0,
                large: parseFloat(document.getElementById('itemPriceLarge').value) || 0
            };
            price = sizes.small || sizes.medium || sizes.large || 0; // Use first available for general display if needed
        } else {
            price = parseFloat(document.getElementById('itemPrice').value) || 0;
        }

        if (!name) { showToast('⚠️ Le nom du produit est obligatoire !'); return; }

        if (editingItemId) {
            const index = menu.findIndex(m => m.id == editingItemId);
            if (index !== -1) {
                menu[index] = {
                    ...menu[index],
                    name, cat, desc, ingredients, price,
                    hasSizes, sizes,
                    images: finalImages,
                    img: finalImages[0] || menu[index].img || '',
                    featured,
                    available
                };
            }
            showToast('✅ Produit mis à jour !');
        } else {
            const newItem = {
                id: Date.now(),
                name, cat, desc, ingredients, price,
                hasSizes, sizes,
                images: finalImages,
                img: finalImages[0] || '',
                featured,
                available,
                likes: 0,
                badge: ''
            };
            menu.push(newItem);
            showToast('✅ Produit ajouté !');
        }

        saveAndRefresh();
        resetFoodForm();
    };

    document.getElementById('catForm').onsubmit = (e) => {
        e.preventDefault();
        catEmojis[document.getElementById('catName').value] = document.getElementById('catEmoji').value;
        saveAndRefresh();
        e.target.reset();
        showToast('Catégorie ajoutée !');
    };

    document.getElementById('wifiForm').onsubmit = (e) => {
        e.preventDefault();
        restaurantConfig.wifi.name = document.getElementById('wifiSSID').value;
        restaurantConfig.wifi.code = document.getElementById('wifiPassInput').value;
        saveAndRefresh();
        showToast('WiFi mis à jour !');
    };

    document.getElementById('landingPageForm').onsubmit = (e) => {
        e.preventDefault();
        restaurantConfig.location.address = document.getElementById('lpAddress').value;
        restaurantConfig.location.url = document.getElementById('lpMapUrl').value;
        restaurantConfig.phone = document.getElementById('lpPhone').value;
        restaurantConfig.socials.instagram = document.getElementById('lpInsta').value;
        restaurantConfig.socials.facebook = document.getElementById('lpFb').value;
        restaurantConfig.socials.tiktok = document.getElementById('lpTiktok').value;
        restaurantConfig.socials.tripadvisor = document.getElementById('lpTrip').value;
        saveAndRefresh();
        showToast('Landing Page info sauvegardée !');
    };

    document.getElementById('superCatForm').onsubmit = (e) => {
        e.preventDefault();
        const selectedCats = Array.from(document.querySelectorAll('.sc-cat-check:checked')).map(cb => cb.value);
        const name = document.getElementById('scName').value;
        const emoji = document.getElementById('scEmoji').value;
        const desc = document.getElementById('scDesc').value;
        const time = document.getElementById('scTime').value;

        const id = name.toLowerCase().replace(/\s+/g, '_');
        const existingIdx = restaurantConfig.superCategories.findIndex(sc => sc.id === id);

        const newSC = { id, name, emoji, desc, time, cats: selectedCats };

        if (existingIdx !== -1) {
            restaurantConfig.superCategories[existingIdx] = newSC;
        } else {
            restaurantConfig.superCategories.push(newSC);
        }

        saveAndRefresh();
        e.target.reset();
        showToast('Super Catégorie sauvegardée !');
    };
}

function initLandingPageForm() {
    const config = restaurantConfig;
    const fields = {
        'lpAddress': config.location.address,
        'lpMapUrl': config.location.url,
        'lpPhone': config.phone,
        'lpInsta': config.socials.instagram,
        'lpFb': config.socials.facebook,
        'lpTiktok': config.socials.tiktok,
        'lpTrip': config.socials.tripadvisor || ''
    };
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
    }
}

function initSuperCatForm() {
    const container = document.getElementById('scCatsList');
    if (!container) return;
    const cats = Object.keys(catEmojis);
    container.innerHTML = cats.map(cat => `
            <label style="display:flex; align-items:center; gap:5px; background:#f0f0f0; padding:5px 10px; border-radius:20px; font-size:0.8rem; cursor:pointer;">
                <input type="checkbox" value="${cat}" class="sc-cat-check" style="width:auto; margin:0;">
                    ${cat}
                </label>
        `).join('');
}

function renderSuperCatTable() {
    const tbody = document.querySelector('#superCatTable tbody');
    if (!tbody) return;
    tbody.innerHTML = restaurantConfig.superCategories.map(sc => `
            <tr>
            <td>${sc.emoji}</td>
            <td><strong>${sc.name}</strong><br><small>${sc.time || ''}</small></td>
            <td>${sc.cats.join(', ')}</td>
            <td>
                <button class="action-btn" onclick="editSuperCat('${sc.id}')">✏️</button>
                <button class="action-btn" onclick="deleteSuperCat('${sc.id}')">🗑️</button>
            </td>
        </tr>
            `).join('');
}

function editSuperCat(id) {
    const sc = restaurantConfig.superCategories.find(s => s.id === id);
    if (!sc) return;
    document.getElementById('scName').value = sc.name;
    document.getElementById('scEmoji').value = sc.emoji;
    document.getElementById('scDesc').value = sc.desc;
    document.getElementById('scTime').value = sc.time || '';

    const checks = document.querySelectorAll('.sc-cat-check');
    checks.forEach(cb => cb.checked = sc.cats.includes(cb.value));

    document.getElementById('supercategories').scrollIntoView({ behavior: 'smooth' });
}

function deleteSuperCat(id) {
    if (confirm('Supprimer cette super catégorie ?')) {
        restaurantConfig.superCategories = restaurantConfig.superCategories.filter(s => s.id !== id);
        saveAndRefresh();
    }
}

function initSecurityForm() {
    const form = document.getElementById('securityForm');
    if (!form) return; // FIX: Don't crash if not on security tab or element missing

    // Note: We can no longer auto-populate the password for security reasons,
    // but we can populate the current logged-in username if needed.
    const newUserInput = document.getElementById('adminNewUser');
    if (newUserInput && adminAuth.user) newUserInput.value = adminAuth.user;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('adminNewUser').value.trim();
        const newPassword = document.getElementById('adminNewPass').value;
        const confirmPassword = document.getElementById('adminConfirmPass').value;

        if (newPassword && newPassword !== confirmPassword) {
            return alert('❌ Les mots de passe ne correspondent pas !');
        }

        try {
            const res = await fetch('/api/admin/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newUsername, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (res.ok && data.ok) {
                adminAuth.user = newUsername; // Update local memory
                showToast('🔒 ' + (data.message || 'Identifiants mis à jour avec succès !'));
                document.getElementById('adminNewPass').value = '';
                document.getElementById('adminConfirmPass').value = '';
            } else {
                alert('❌ Erreur: ' + (data.error || 'Impossible de mettre à jour les identifiants.'));
            }
        } catch (err) {
            console.error('Credentials update error:', err);
            alert('❌ Erreur de connexion au serveur.');
        }
    };
}

async function uploadImageToServer(file) {
    const formData = new FormData();
    formData.append('image', file, file.name);

    const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Upload failed: ' + response.statusText);
    }

    const data = await response.json();
    if (data.ok && data.url) {
        return data.url;
    }
    if (data.urls && data.urls.length > 0) {
        return data.urls[0];
    }
    throw new Error('No URL returned from server');
}

// Image handling helper
const toImageUrl = (img) => img;

function deleteItem(id) { if (confirm('Supprimer cet article ?')) { menu = menu.filter(m => m.id != id); promoIds = promoIds.filter(pid => pid != id); saveAndRefresh(); } }
function togglePromo(id) {
    if (promoIds.includes(id)) {
        promoIds = promoIds.filter(pid => pid != id);
    } else {
        promoIds.push(id);
    }
    saveAndRefresh();
}
function toggleFeatured(id) {
    const item = menu.find(m => m.id == id);
    if (item) {
        item.featured = !item.featured;
        saveAndRefresh();
    }
}
async function forceSaveChanges() {
    try {
        // If user is currently editing a food item, commit those changes first
        if (editingItemId && typeof window.commitFormItem === 'function') {
            await window.commitFormItem();
        } else {
            await saveAndRefresh();
            showToast('✅ Toutes les modifications ont été enregistrées !');
        }

        // Visual feedback on float button
        const btn = document.getElementById('floatSaveBtn');
        if (btn) {
            btn.classList.add('saved');
            btn.innerHTML = '<span style="font-size:1.3rem;">✅</span><span>Sauvegardé !</span>';
            setTimeout(() => {
                btn.classList.remove('saved');
                btn.innerHTML = '<span style="font-size:1.3rem;">💾</span><span>Sauvegarder</span>';
            }, 2500);
        }
    } catch (e) {
        console.error('Save Error:', e);
        alert('❌ Erreur de sauvegarde: ' + e.message);
    }
}
async function saveAndRefresh() {
    // Strip base64 images before sending to server
    const cleanMenu = menu.map(item => {
        const imgs = item.images || (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        return { ...item, images: urlOnly, img: urlOnly[0] || item.img || '' };
    });

    // Build payload matching server data structure
    const payload = {
        menu: cleanMenu,
        catEmojis: catEmojis,
        wifi: { ssid: restaurantConfig.wifi?.name || '', pass: restaurantConfig.wifi?.code || '' },
        social: restaurantConfig.socials || {},
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: restaurantConfig.superCategories || [],
        hours: restaurantConfig._hours || null,
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: restaurantConfig.location,
            phone: restaurantConfig.phone
        }
    };

    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server save failed');
        }
        refreshUI();
    } catch (e) {
        console.error('Save Error:', e);
        showToast('❌ Erreur de sauvegarde: ' + e.message);
    }
}
function showToast(msg) { const t = document.getElementById('adminToast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
function clearImageCache() {
    const count = menu.filter(item => (item.images || []).some(img => img.startsWith('data:')) || (item.img || '').startsWith('data:')).length;
    if (count === 0) { showToast('✅ Aucune image en cache à supprimer.'); return; }
    if (!confirm(`Supprimer les images en cache de ${count} produit(s) ? Les images URL seront conservées.`)) return;
    menu = menu.map(item => {
        const imgs = Array.isArray(item.images) ? item.images : (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        return { ...item, images: urlOnly, img: urlOnly[0] || '' };
    });
    saveAndRefresh();
    showToast(`✅ Cache image vidé pour ${count} produit(s).Stockage libéré!`);
}
function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');

    // Auto-close sidebar on mobile after choosing
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
    const el = document.getElementById('itemCat');
    if (el) el.innerHTML = Object.keys(catEmojis).map(c => `<option value="${c}">${c}</option>`).join('');
}
function renderCatTable() {
    const el = document.querySelector('#catTable tbody');
    if (el) el.innerHTML = Object.keys(catEmojis).map(cat => `<tr><td>${catEmojis[cat]}</td><td><strong>${cat}</strong></td><td>${menu.filter(m => m.cat === cat).length} items</td><td><button class="action-btn" onclick="deleteCat('${cat}')">🗑️</button></td></tr>`).join('');
}
function deleteCat(cat) { if (menu.some(m => m.cat === cat)) return alert('Supprimez d\'abord les produits de cette catégorie !'); delete catEmojis[cat]; saveAndRefresh(); }
function initWifiForm() {
    const fields = {
        'wifiSSID': restaurantConfig.wifi.name,
        'wifiPassInput': restaurantConfig.wifi.code
    };
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
    }
    const hintS = document.getElementById('hintS');
    const hintP = document.getElementById('hintP');
    if (hintS) hintS.textContent = restaurantConfig.wifi.name;
    if (hintP) hintP.textContent = restaurantConfig.wifi.code;
}
function updateStats() {
    const p = document.getElementById('stat-products');
    const c = document.getElementById('stat-cats');
    const pr = document.getElementById('stat-promo');
    if (p) p.textContent = menu.length;
    if (c) c.textContent = Object.keys(catEmojis).length;
    if (pr) pr.textContent = promoIds.length;
}

// IMAGE MODAL LOGIC
let currentEditingId = null;

function openImageModal(id) {
    currentEditingId = id;
    const item = menu.find(m => m.id == id); // Use == for safety
    if (!item) return;

    // Ensure item has an images array
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

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden; border:1px solid #ddd;">
                <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteModalImage(${index})" style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px; font-size:12px;">✕</button>
                </div>
        `).join('') + (images.length === 0 ? '<p style="grid-column: span 3; color:#888; text-align:center;">Aucune image pour le moment.</p>' : '');
}

async function handleModalImageUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];

    for (let file of input.files) {
        try {
            const url = await uploadImageToServer(file);
            item.images.push(url);
        } catch (err) {
            console.error('Modal upload failed:', err);
            showToast('⚠️ Échec de l\'upload');
        }
    }

    // SYNC: Ensure main img is set to the first image for the main page cards
    if (item.images.length > 0) item.img = item.images[0];

    input.value = '';
    saveAndRefresh();
    renderModalImages();
    showToast('Image(s) ajoutée(s)!');
}

function addModalImageUrl() {
    const url = document.getElementById('modalImgUrl').value.trim();
    if (!url) return;
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];
    item.images.push(url);

    // SYNC: Keep main img updated
    if (item.images.length > 0) item.img = item.images[0];

    document.getElementById('modalImgUrl').value = '';
    saveAndRefresh();
    renderModalImages();
    showToast('Image ajoutée via URL!');
}

function deleteModalImage(index) {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item || !item.images) return;

    item.images.splice(index, 1);

    // SYNC: Keep main img updated after deletion
    item.img = item.images.length > 0 ? item.images[0] : '';

    saveAndRefresh();
    renderModalImages();
    showToast('Image supprimée');
}

async function resetDefaults() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser TOUTES les données du menu et de la configuration aux valeurs par défaut ? Cette action est irréversible.')) {
        try {
            const res = await fetch('/api/data/reset', { method: 'POST', credentials: 'include' });
            if (res.ok) {
                await loadDataFromServer();
                refreshUI();
                showToast('✅ Données réinitialisées !');
            }
        } catch (e) {
            console.error('Reset error:', e);
        }
    }
}

// ═══════════════════════ HOURS MANAGEMENT ═══════════════════════
const HOUR_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function initHoursForm() {
    const hours = JSON.parse(localStorage.getItem('foody_hours')) || window.defaultHours;
    const note = localStorage.getItem('foody_hours_note') || window.defaultHoursNote || '';

    // Populate inputs
    HOUR_KEYS.forEach((key, i) => {
        const h = hours[i];
        const openEl = document.getElementById(`h_${key} _open`);
        const closeEl = document.getElementById(`h_${key} _close`);
        const hlEl = document.getElementById(`h_${key} _hl`);
        if (openEl) openEl.value = h.open || '11:00';
        if (closeEl) closeEl.value = h.close || '23:00';
        if (hlEl) hlEl.checked = h.highlight || false;
    });

    const noteEl = document.getElementById('hoursNote');
    if (noteEl) noteEl.value = note;

    // Form submit
    const form = document.getElementById('hoursForm');
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            const updatedHours = window.defaultHours.map((def, i) => {
                const key = HOUR_KEYS[i];
                const openEl = document.getElementById(`h_${key} _open`);
                const closeEl = document.getElementById(`h_${key} _close`);
                const hlEl = document.getElementById(`h_${key} _hl`);
                return {
                    day: def.day,
                    i18n: def.i18n,
                    open: openEl ? openEl.value : def.open,
                    close: closeEl ? closeEl.value : def.close,
                    highlight: hlEl ? hlEl.checked : false
                };
            });
            const noteEl = document.getElementById('hoursNote');
            const updatedNote = noteEl ? noteEl.value.trim() : '';
            localStorage.setItem('foody_hours', JSON.stringify(updatedHours));
            localStorage.setItem('foody_hours_note', updatedNote);
            showToast('✅ Horaires mis à jour !');
        };
    }
}

// ═══════════════════════ GALLERY MANAGEMENT ═══════════════════════

function initGalleryForm() {
    const form = document.getElementById('galleryForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('galleryFileInput');
        const urlInput = document.getElementById('galleryUrlInput');
        if (!fileInput || !urlInput) return;

        if (!restaurantConfig.gallery) restaurantConfig.gallery = [];

        // Handle URLs
        if (urlInput.value.trim()) {
            restaurantConfig.gallery.push(urlInput.value.trim());
            urlInput.value = '';
        }

        // Handle Files
        if (fileInput.files.length > 0) {
            showToast('⏳ Téléchargement gallery...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    restaurantConfig.gallery.push(url);
                } catch (err) {
                    console.error('Gallery upload failed:', err);
                    showToast('⚠️ Échec gallery');
                }
            }
            fileInput.value = '';
        }

        saveAndRefresh();
        renderGalleryAdmin();
        showToast('🖼️ Images ajoutées à la galerie !');
    };
}

function renderGalleryAdmin() {
    const grid = document.getElementById('galleryAdminGrid');
    if (!grid) return;

    const images = restaurantConfig.gallery || [];

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1.5; border-radius:12px; overflow:hidden; border:1px solid #ddd; background:#eee;">
                <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteGalleryImage(${index})" style="position:absolute; top:8px; right:8px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:6px; cursor:pointer; padding:4px 8px; font-size:14px; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.2);">✕</button>
                </div>
        `).join('') + (images.length === 0 ? '<p style="grid-column: 1/-1; color:#888; text-align:center; padding:40px; border:2px dashed #eee; border-radius:15px;">La galerie est vide.</p>' : '');
}

function deleteGalleryImage(index) {
    if (confirm('Supprimer cette image de la galerie ?')) {
        restaurantConfig.gallery.splice(index, 1);
        saveAndRefresh();
        renderGalleryAdmin();
        showToast('Image supprimée');
    }
}
