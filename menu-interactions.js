(function () {
    if (window.__foodyMenuInteractionsLoaded) return;

    function runtime() {
        return typeof window.__foodyGetMenuRuntime === 'function'
            ? window.__foodyGetMenuRuntime()
            : null;
    }

    function getMenu() {
        return runtime()?.getMenu?.() || [];
    }

    function getCart() {
        return runtime()?.getCart?.() || [];
    }

    function setCart(nextCart) {
        runtime()?.setCart?.(nextCart);
    }

    function getServiceType() {
        return runtime()?.getServiceType?.() || 'onsite';
    }

    function setServiceType(nextType) {
        runtime()?.setServiceType?.(nextType);
    }

    function t(key, fallback, vars) {
        return runtime()?.t?.(key, fallback, vars) || fallback;
    }

    function sameMenuItemId(left, right) {
        return runtime()?.sameMenuItemId?.(left, right) || String(left ?? '') === String(right ?? '');
    }

    function serializeInlineId(value) {
        return runtime()?.serializeInlineId?.(value) || JSON.stringify(String(value ?? ''));
    }

    function getAvailableItemExtras(item) {
        return typeof window.getAvailableItemExtras === 'function'
            ? window.getAvailableItemExtras(item)
            : [];
    }

    function getSelectedItemExtras(item, selectedExtras) {
        return typeof window.getSelectedItemExtras === 'function'
            ? window.getSelectedItemExtras(item, selectedExtras)
            : [];
    }

    function getConfiguredItemPrice(item, sizeKey, selectedExtras) {
        return typeof window.getConfiguredItemPrice === 'function'
            ? window.getConfiguredItemPrice(item, sizeKey, selectedExtras)
            : window.getItemPrice(item, sizeKey);
    }

    function formatMoney(value) {
        const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
        return `${amount.toFixed(0)} MAD`;
    }

    function getUiLang() {
        if (typeof window.getStoredLanguage === 'function') {
            return window.getStoredLanguage();
        }
        const htmlLang = document.documentElement?.getAttribute('lang') || '';
        return htmlLang.slice(0, 2) || 'fr';
    }

    function getDishUiCopy(key) {
        const lang = getUiLang();
        const copy = {
            size_title: { fr: 'Choisissez une taille', en: 'Choose a size', ar: 'اختر الحجم' },
            extras_title: { fr: 'Ajoutez des extras', en: 'Add extras', ar: 'أضف إضافات' },
            included_label: { fr: 'Inclus', en: 'Included', ar: 'مشمول' }
        };
        return copy[key]?.[lang] || copy[key]?.fr || '';
    }

    function formatSelectedExtrasSummary(extras) {
        const safeExtras = Array.isArray(extras) ? extras.filter(Boolean) : [];
        if (!safeExtras.length) return '';
        return safeExtras.map((extra) => {
            const name = typeof extra.name === 'string' ? extra.name.trim() : '';
            if (!name) return '';
            return `${name}${extra.price ? ` (+${formatMoney(extra.price)})` : ''}`;
        }).filter(Boolean).join(' • ');
    }

    function escapeUiHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildModalEmptyStateMarkup({
        icon = MENU_UI_ICONS.sparkle,
        eyebrow = '',
        title = '',
        text = '',
        actionLabel = '',
        action = ''
    } = {}) {
        const safeEyebrow = String(eyebrow || '').trim();
        const safeTitle = String(title || '').trim();
        const safeText = String(text || '').trim();
        const safeActionLabel = String(actionLabel || '').trim();
        const safeAction = String(action || '').trim();

        return `
            <div class="menu-empty-state is-modal">
                <div class="menu-empty-state-icon">${icon}</div>
                ${safeEyebrow ? `<div class="menu-empty-state-eyebrow">${escapeUiHtml(safeEyebrow)}</div>` : ''}
                ${safeTitle ? `<h3 class="menu-empty-state-title">${escapeUiHtml(safeTitle)}</h3>` : ''}
                ${safeText ? `<p class="menu-empty-state-copy">${escapeUiHtml(safeText)}</p>` : ''}
                ${safeActionLabel && safeAction ? `<button class="menu-empty-state-action" onclick="${escapeUiHtml(safeAction)}">${escapeUiHtml(safeActionLabel)}</button>` : ''}
            </div>
        `;
    }

    function repeatCartItem(cartId) {
        const item = getCart().find((entry) => String(entry.cartId) === String(cartId));
        if (!item) return;
        window.addToCart(item.id, {
            size: item.selectedSize || null,
            extras: Array.isArray(item.selectedExtras) ? item.selectedExtras.map((extra) => extra.id || extra.name) : []
        });
        renderDrawer();
    }

    const MENU_UI_ICONS = runtime()?.MENU_UI_ICONS || {};
    let galleryItems = [];
    let currentGalleryIdx = 0;
    let interactionDomReady = false;
    let currentDishImages = [];
    let currentDishImageIdx = 0;

    function buildGalleryEntries(items) {
        return (Array.isArray(items) ? items : []).flatMap((entry) => {
            if (!entry) return [];

            if (typeof entry.imageSrc === 'string' && entry.imageSrc.trim()) {
                return [{
                    imageSrc: entry.imageSrc.trim(),
                    title: typeof entry.title === 'string' && entry.title.trim()
                        ? entry.title.trim()
                        : ''
                }];
            }

            const itemImages = Array.isArray(entry.images)
                ? entry.images.filter((value) => typeof value === 'string' && value.trim())
                : [];
            const fallbackImg = typeof entry.img === 'string' && entry.img.trim() ? entry.img.trim() : '';
            const images = itemImages.length ? itemImages : (fallbackImg ? [fallbackImg] : []);
            if (!images.length) return [];

            const localizedTitle = typeof window.getLocalizedMenuName === 'function'
                ? window.getLocalizedMenuName(entry)
                : (entry.name || '');

            return images.map((imageSrc) => ({
                imageSrc,
                title: localizedTitle
            }));
        });
    }

    function ensureMenuInteractionDom() {
        if (interactionDomReady || document.getElementById('dishPage')) {
            interactionDomReady = true;
            return;
        }

        const template = document.createElement('template');
        template.innerHTML = `
            <div id="dishPage" class="dish-page">
                <button class="dish-page-close" onclick="closeDishPage()" aria-label="${t('modal_close', 'Close')}">&times;</button>
                <div class="dish-page-header">
                    <button id="dishPagePrev" class="dish-page-media-nav dish-page-media-prev" type="button" onclick="prevDishImage()" aria-label="${t('gallery_prev', 'Previous image')}">&#10094;</button>
                    <img id="dishPageImg" src="" alt="" class="dish-page-img" width="1200" height="900" decoding="async">
                    <button id="dishPageNext" class="dish-page-media-nav dish-page-media-next" type="button" onclick="nextDishImage()" aria-label="${t('gallery_next', 'Next image')}">&#10095;</button>
                    <div id="dishPageCount" class="dish-page-media-count"></div>
                </div>
                <div class="dish-page-body">
                    <h2 id="dishPageName" class="dish-page-name"></h2>
                    <div id="dishPagePrice" class="dish-page-price"></div>
                    <div id="dishPagePriceNote" class="dish-page-price-note"></div>
                    <p id="dishPageDesc" class="dish-page-desc"></p>
                    <div id="dishPageConfig" class="dish-page-config"></div>
                    <div id="dishPageLoveContainer" class="dish-page-love-row"></div>
                    <div class="dish-page-footer">
                        <button id="dishPageAddBtn" class="dish-add-btn">${t('add_to_cart', 'AJOUTER AU PANIER')}</button>
                    </div>
                </div>
            </div>

            <div id="historyOverlay" class="history-overlay" onclick="closeHistory()">
                <div class="history-modal" onclick="event.stopPropagation()">
                    <div class="history-header">
                        <h2>${t('history_title', 'Historique')}</h2>
                        <button onclick="closeHistory()" class="history-close-btn" aria-label="${t('modal_close', 'Close')}">&times;</button>
                    </div>
                    <div id="historyContent">
                        <p class="history-empty">${t('history_empty', 'Aucune commande recente.')}</p>
                    </div>
                </div>
            </div>

            <div id="sharedOverlay" class="overlay" onclick="closeAllModals()"></div>

            <div id="cartDrawer" class="modal-sheet">
                <div class="modal-handle"></div>
                <div id="drawerContent"></div>
            </div>

            <div id="ticketModal" class="modal-sheet ticket-sheet">
                <div id="ticketContent"></div>
            </div>

            <div id="galleryOverlay" class="gallery-overlay" onclick="closeGallery()">
                <button class="gallery-close" onclick="closeGallery()">&times;</button>
                <div class="gallery-container" onclick="event.stopPropagation()">
                    <button class="gallery-nav gallery-prev" onclick="prevGalleryImage()">&#10094;</button>
                    <img id="galleryImg" src="" alt="Gallery Image" width="1200" height="900" decoding="async">
                    <button class="gallery-nav gallery-next" onclick="nextGalleryImage()">&#10095;</button>
                </div>
                <div class="gallery-info" onclick="event.stopPropagation()">
                    <div id="galleryTitle" class="gallery-title"></div>
                    <div id="galleryCount" class="gallery-count"></div>
                </div>
            </div>
        `;

        document.body.appendChild(template.content);
        interactionDomReady = true;
    }

    function closeAllModals() {
        ensureMenuInteractionDom();
        ['sharedOverlay', 'cartDrawer', 'ticketModal', 'dishPage', 'historyOverlay', 'superCatSheet', 'superCatOverlay'].forEach((id) => {
            document.getElementById(id)?.classList.remove('open');
        });
        const galleryOverlay = document.getElementById('galleryOverlay');
        if (galleryOverlay) galleryOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function openDishPage(id) {
        ensureMenuInteractionDom();
        const item = getMenu().find((entry) => sameMenuItemId(entry.id, id));
        if (!item) return;

        const page = document.getElementById('dishPage');
        const imgEl = document.getElementById('dishPageImg');
        const prevBtn = document.getElementById('dishPagePrev');
        const nextBtn = document.getElementById('dishPageNext');
        const countEl = document.getElementById('dishPageCount');
        const nameEl = document.getElementById('dishPageName');
        const priceEl = document.getElementById('dishPagePrice');
        const priceNoteEl = document.getElementById('dishPagePriceNote');
        const descEl = document.getElementById('dishPageDesc');
        const configEl = document.getElementById('dishPageConfig');
        const addBtn = document.getElementById('dishPageAddBtn');
        if (!page || !imgEl || !prevBtn || !nextBtn || !countEl || !nameEl || !priceEl || !priceNoteEl || !descEl || !configEl || !addBtn) return;

        page.dataset.itemId = String(item.id);

        const availableExtras = getAvailableItemExtras(item);
        const availableSizeKeys = item.hasSizes && item.sizes
            ? ['small', 'medium', 'large'].filter((sizeKey) => Number(item.sizes?.[sizeKey]) > 0)
            : [];
        let selectedSize = availableSizeKeys[0] || null;
        let selectedExtraIds = [];

        const renderDishConfigurator = () => {
            const sizeLabels = {
                small: 'S',
                medium: 'M',
                large: 'L'
            };

            configEl.innerHTML = `
                ${availableSizeKeys.length ? `
                    <div class="dish-config-block">
                        <div class="dish-config-label">${getDishUiCopy('size_title')}</div>
                        <div class="dish-config-options dish-size-options">
                            ${availableSizeKeys.map((sizeKey) => `
                                <button
                                    type="button"
                                    class="dish-config-chip${selectedSize === sizeKey ? ' is-active' : ''}"
                                    data-size-key="${sizeKey}">
                                    ${sizeLabels[sizeKey] || sizeKey} · ${formatMoney(item.sizes?.[sizeKey])}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${availableExtras.length ? `
                    <div class="dish-config-block">
                        <div class="dish-config-label">${getDishUiCopy('extras_title')}</div>
                        <div class="dish-extra-options">
                            ${availableExtras.map((extra) => `
                                <label class="dish-extra-option">
                                    <input
                                        type="checkbox"
                                        class="dish-extra-check"
                                        value="${extra.id}"
                                        ${selectedExtraIds.includes(extra.id) ? 'checked' : ''}>
                                    <span class="dish-extra-copy">
                                        <span class="dish-extra-name">${extra.name}</span>
                                        <span class="dish-extra-price">${extra.price ? `+${formatMoney(extra.price)}` : getDishUiCopy('included_label')}</span>
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

            configEl.querySelectorAll('[data-size-key]').forEach((button) => {
                button.addEventListener('click', () => {
                    selectedSize = button.dataset.sizeKey || null;
                    syncDishPricing();
                    renderDishConfigurator();
                });
            });

            configEl.querySelectorAll('.dish-extra-check').forEach((checkbox) => {
                checkbox.addEventListener('change', () => {
                    selectedExtraIds = Array.from(configEl.querySelectorAll('.dish-extra-check:checked'))
                        .map((entry) => entry.value)
                        .filter(Boolean);
                    syncDishPricing();
                });
            });
        };

        const syncDishPricing = () => {
            const selectedExtras = getSelectedItemExtras(item, selectedExtraIds);
            const totalPrice = getConfiguredItemPrice(item, selectedSize, selectedExtras);
            priceEl.textContent = formatMoney(totalPrice);
            priceNoteEl.textContent = selectedExtras.length
                ? formatSelectedExtrasSummary(selectedExtras)
                : '';
            priceNoteEl.style.display = priceNoteEl.textContent ? 'block' : 'none';
        };

        const itemImages = Array.isArray(item.images)
            ? item.images.filter((value) => typeof value === 'string' && value.trim())
            : [];
        const fallbackImg = typeof item.img === 'string' && item.img.trim() ? item.img.trim() : '';
        currentDishImages = itemImages.length ? itemImages : (fallbackImg ? [fallbackImg] : []);
        currentDishImageIdx = 0;

        const syncDishImage = () => {
            const activeImage = currentDishImages[currentDishImageIdx] || '';
            if (!activeImage) {
                imgEl.removeAttribute('src');
                imgEl.style.display = 'none';
                imgEl.onclick = null;
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                countEl.style.display = 'none';
                return;
            }

            window.setSafeImageSource(imgEl, activeImage, {
                onMissing: () => {
                    imgEl.removeAttribute('src');
                    imgEl.style.display = 'none';
                },
                displayValue: 'block'
            });
            imgEl.onclick = () => openGallery([item], currentDishImageIdx);
            imgEl.style.cursor = 'zoom-in';
            imgEl.classList.remove('dish-page-img-animate');
            void imgEl.offsetWidth;
            imgEl.classList.add('dish-page-img-animate');
            const hasMultipleImages = currentDishImages.length > 1;
            prevBtn.style.display = hasMultipleImages ? 'flex' : 'none';
            nextBtn.style.display = hasMultipleImages ? 'flex' : 'none';
            countEl.style.display = hasMultipleImages ? 'inline-flex' : 'none';
            countEl.textContent = `${currentDishImageIdx + 1} / ${currentDishImages.length}`;
        };

        page.__syncDishImage = syncDishImage;
        syncDishImage();

        nameEl.textContent = window.getLocalizedMenuName(item);
        renderDishConfigurator();
        syncDishPricing();
        descEl.textContent = window.getLocalizedMenuDescription(item, t('dish_default_desc', 'A carefully prepared dish made with our best ingredients.'));
        addBtn.onclick = () => {
            window.addToCart(item.id, {
                size: selectedSize,
                extras: selectedExtraIds
            });
            closeDishPage();
        };

        const loveContainer = document.getElementById('dishPageLoveContainer');
        if (loveContainer) {
            loveContainer.innerHTML = `
                <button class="love-btn ${window.getLikeCount(item.id) > 0 ? 'loved' : ''}" style="position:static; width:40px; height:40px; font-size:1.2rem;" onclick="window.handleToggleLike(${serializeInlineId(item.id)}, this)">
                    ${MENU_UI_ICONS.heart}<span class="love-count" style="font-size:0.8rem;">${window.getLikeCount(item.id)}</span>
                </button>
            `;
        }

        page.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDishPage() {
        ensureMenuInteractionDom();
        document.getElementById('dishPage')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openDishGallery(id, startIndex = 0) {
        const item = getMenu().find((entry) => sameMenuItemId(entry.id, id));
        if (!item) return;
        openGallery([item], startIndex);
    }

    function nextDishImage() {
        const page = document.getElementById('dishPage');
        if (!page || !currentDishImages.length) return;
        currentDishImageIdx = (currentDishImageIdx + 1) % currentDishImages.length;
        if (typeof page.__syncDishImage === 'function') {
            page.__syncDishImage();
        }
    }

    function prevDishImage() {
        const page = document.getElementById('dishPage');
        if (!page || !currentDishImages.length) return;
        currentDishImageIdx = (currentDishImageIdx - 1 + currentDishImages.length) % currentDishImages.length;
        if (typeof page.__syncDishImage === 'function') {
            page.__syncDishImage();
        }
    }

    function openGallery(items, startIndex = 0) {
        ensureMenuInteractionDom();
        galleryItems = buildGalleryEntries(items);
        if (!galleryItems.length) return;

        currentGalleryIdx = Math.max(0, Math.min(startIndex, galleryItems.length - 1));
        const overlay = document.getElementById('galleryOverlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateGalleryView();
    }

    function closeGallery() {
        ensureMenuInteractionDom();
        const overlay = document.getElementById('galleryOverlay');
        if (overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function updateGalleryView() {
        ensureMenuInteractionDom();
        const entry = galleryItems[currentGalleryIdx];
        if (!entry) return;
        const img = document.getElementById('galleryImg');
        const title = document.getElementById('galleryTitle');
        const count = document.getElementById('galleryCount');
        if (!img || !title || !count) return;

        img.classList.remove('gallery-flip');
        void img.offsetWidth;
        img.classList.add('gallery-flip');

        window.setSafeImageSource(img, entry.imageSrc, {
            onMissing: () => {
                closeGallery();
            },
            displayValue: 'block'
        });
        title.textContent = entry.title || '';
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

    function openDrawer() {
        ensureMenuInteractionDom();
        document.getElementById('sharedOverlay')?.classList.add('open');
        document.getElementById('cartDrawer')?.classList.add('open');
        renderDrawer();
        document.body.style.overflow = 'hidden';
    }

    function renderDrawer() {
        ensureMenuInteractionDom();
        const cart = getCart();
        const serviceType = getServiceType();
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const content = document.getElementById('drawerContent');
        if (!content) return;
        const restaurantName = typeof window.getRestaurantDisplayName === 'function'
            ? window.getRestaurantDisplayName()
            : 'Restaurant';
        const serviceOptions = [
            { key: 'onsite', icon: MENU_UI_ICONS.plate, label: t('service_onsite', 'Sur place') },
            { key: 'takeaway', icon: MENU_UI_ICONS.takeaway, label: t('service_takeaway', 'A emporter') },
            { key: 'delivery', icon: MENU_UI_ICONS.delivery, label: t('service_delivery', 'Livraison') }
        ];

        if (!cart.length) {
            content.innerHTML = `
                <div class="cart-drawer-body is-empty">
                    <div class="cart-drawer-header">
                        <div class="cart-drawer-title">${restaurantName}</div>
                        <div class="cart-drawer-meta">
                            <div class="cart-drawer-count">${t('cart_items_count', '{count} item(s)', { count: 0 })}</div>
                        </div>
                    </div>
                    ${buildModalEmptyStateMarkup({
                        icon: MENU_UI_ICONS.plate,
                        eyebrow: t('confirm_cart_label', 'Mon panier'),
                        title: t('cart_empty_title', 'Votre panier est vide'),
                        text: t('cart_empty_text', 'Ajoutez quelques plats pour commencer votre commande.'),
                        actionLabel: t('cart_empty_action', 'Continuer'),
                        action: 'closeAllModals(); showLanding();'
                    })}
                </div>
            `;

            if (typeof window.applyBranding === 'function') {
                window.applyBranding();
            }
            return;
        }

        content.innerHTML = `
            <div class="cart-drawer-body">
                <div class="cart-drawer-header">
                    <div class="cart-drawer-title">${restaurantName}</div>
                    <div class="cart-drawer-meta">
                        <button onclick="if(confirm('${t('cart_clear_confirm', 'Vider le panier ?')}')) { window.__foodyGetMenuRuntime().setCart([]); window.__foodyGetMenuRuntime().saveCart(); window.__foodyGetMenuRuntime().updateCartUI(); closeAllModals(); }" class="cart-drawer-clear">${t('cart_clear', 'Vider')}</button>
                        <div class="cart-drawer-count">${t('cart_items_count', '{count} item(s)', { count: cart.length })}</div>
                    </div>
                </div>
                <div class="cart-items-list">
                    ${cart.map((item) => `
                        <div class="cart-item-card">
                            <div class="cart-item-main">
                                <div class="cart-item-name">
                                    ${window.getLocalizedMenuName(item)} ${item.selectedSize ? `<span class="cart-item-size">(${item.selectedSize.charAt(0).toUpperCase()})</span>` : ''}
                                </div>
                                ${item.selectedExtras?.length ? `<div class="cart-item-extras">${formatSelectedExtrasSummary(item.selectedExtras)}</div>` : ''}
                                <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} MAD</div>
                            </div>
                            <div class="cart-item-controls">
                                <button onclick="removeFromCart('${item.cartId}')" class="cart-qty-btn is-minus">-</button>
                                <span class="cart-item-qty">${item.qty}</span>
                                <button onclick="window.repeatCartItem('${item.cartId}')" class="cart-qty-btn is-plus">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-service-grid">
                    ${serviceOptions.map((option) => `
                        <button class="cart-service-btn${serviceType === option.key ? ' is-active' : ''}" onclick="window.__foodyGetMenuRuntime().setServiceType('${option.key}'); renderDrawer()">
                            <span class="cart-service-icon">${option.icon}</span>
                            <span class="cart-service-label">${option.label}</span>
                        </button>
                    `).join('')}
                </div>
                ${serviceType === 'delivery' ? `
                <div class="cart-delivery-block">
                    <label class="cart-delivery-label">${t('cart_delivery_label', `${MENU_UI_ICONS.address} Adresse de livraison`)}</label>
                    <textarea id="deliveryAddress" rows="2" placeholder="${t('cart_delivery_placeholder', 'Ex : Appartement 12, residence, quartier...')}" oninput="window.currentDeliveryAddress = this.value" class="cart-delivery-input">${window.currentDeliveryAddress || ''}</textarea>
                </div>
                ` : ''}
                <div class="cart-total-card">
                    <div class="cart-total-row">
                        <span>${t('cart_total_label', 'Total')}</span><span>${total.toFixed(2)} MAD</span>
                    </div>
                </div>
                <button onclick="generateTicket()" class="cart-confirm-btn">${t('cart_confirm_order', 'CONFIRMER MA COMMANDE')}</button>
            </div>
        `;

        if (typeof window.applyBranding === 'function') {
            window.applyBranding();
        }
    }

    function openHistory() {
        ensureMenuInteractionDom();
        renderHistory();
        document.getElementById('historyOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeHistory() {
        ensureMenuInteractionDom();
        document.getElementById('historyOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderHistory() {
        ensureMenuInteractionDom();
        const history = typeof window.getStoredHistory === 'function'
            ? window.getStoredHistory()
            : [];
        const container = document.getElementById('historyContent');
        if (!container) return;
        container.innerHTML = history.length === 0
            ? buildModalEmptyStateMarkup({
                icon: MENU_UI_ICONS.sparkle,
                eyebrow: t('history_title', 'Historique'),
                title: t('history_empty_title', 'Aucune commande récente'),
                text: t('history_empty_text', 'Vos tickets validés apparaitront ici pour être retrouvés rapidement.'),
                actionLabel: t('history_empty_action', 'Retour au menu'),
                action: 'closeHistory(); showLanding();'
            })
            : history.map((ticketHtml, index) => `
                <div class="history-ticket history-ticket-wrap">
                    ${renderHistoryTicketCard(ticketHtml)}
                    <button onclick="deleteHistoryItem(${index})" class="history-delete-btn" title="${t('history_delete_title', 'Supprimer')}">${MENU_UI_ICONS.trash}</button>
                </div>
            `).join('');
    }

    function deleteHistoryItem(index) {
        if (!confirm(t('history_delete_confirm', "Supprimer ce ticket de l'historique ?"))) return;
        let history = typeof window.getStoredHistory === 'function'
            ? window.getStoredHistory()
            : [];
        history.splice(index, 1);
        if (typeof window.setStoredHistory === 'function') {
            window.setStoredHistory(history);
        }
        renderHistory();
        runtime()?.updateHistoryBadge?.();
    }

    function saveToHistory(text) {
        let history = typeof window.getStoredHistory === 'function'
            ? window.getStoredHistory()
            : [];
        history.unshift(text);
        if (history.length > 3) history = history.slice(0, 3);
        if (typeof window.setStoredHistory === 'function') {
            window.setStoredHistory(history);
        }
        runtime()?.updateHistoryBadge?.();
    }

    function escapeHistoryHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function parseLegacyHistoryEntry(entry) {
        const raw = String(entry || '').trim();
        const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
        if (!lines.length) return null;

        const ticketLine = lines[0] || '';
        const dateLine = lines[1] || '';
        const typeLine = lines.find((line) => /^type\s*:/i.test(line)) || '';
        const totalLine = lines.find((line) => /^total\s*:/i.test(line)) || '';
        const dividerIndex = lines.findIndex((line) => line === '---');
        const itemLines = dividerIndex >= 0 ? lines.slice(dividerIndex + 1) : [];

        return {
            legacy: true,
            orderNo: ticketLine.replace(/^ticket\s*#?/i, '').trim(),
            createdAtLabel: dateLine,
            serviceLabel: typeLine.replace(/^type\s*:/i, '').trim(),
            totalLabel: totalLine.replace(/^total\s*:/i, '').trim(),
            items: itemLines.map((line) => ({ label: line }))
        };
    }

    function normalizeHistoryEntry(entry) {
        if (!entry) return null;
        if (typeof entry === 'string') return parseLegacyHistoryEntry(entry);
        if (typeof entry !== 'object') return null;

        const items = Array.isArray(entry.items)
            ? entry.items.map((item) => ({
                qty: Number.isFinite(Number(item?.qty)) ? Number(item.qty) : 1,
                name: typeof item?.name === 'string' ? item.name.trim() : '',
                total: Number.isFinite(Number(item?.total)) ? Number(item.total) : null,
                label: typeof item?.label === 'string' ? item.label.trim() : '',
                extras: Array.isArray(item?.extras)
                    ? item.extras
                        .map((extra) => typeof extra === 'string' ? extra.trim() : '')
                        .filter(Boolean)
                    : [],
                sizeLabel: typeof item?.sizeLabel === 'string' ? item.sizeLabel.trim() : ''
            })).filter((item) => item.name || item.label)
            : [];

        return {
            legacy: false,
            orderNo: typeof entry.orderNo === 'string' ? entry.orderNo.trim() : String(entry.orderNo || '').trim(),
            createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : '',
            serviceLabel: typeof entry.serviceLabel === 'string' ? entry.serviceLabel.trim() : '',
            total: Number.isFinite(Number(entry.total)) ? Number(entry.total) : null,
            currency: typeof entry.currency === 'string' && entry.currency.trim() ? entry.currency.trim() : 'MAD',
            address: typeof entry.address === 'string' ? entry.address.trim() : '',
            items
        };
    }

    function formatHistoryDateParts(value, fallbackLabel = '') {
        const date = value ? new Date(value) : null;
        if (!date || Number.isNaN(date.getTime())) {
            return {
                date: fallbackLabel,
                time: ''
            };
        }
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    function renderHistoryTicketCard(entry) {
        const normalized = normalizeHistoryEntry(entry);
        if (!normalized) return '';

        const dateParts = formatHistoryDateParts(normalized.createdAt, normalized.createdAtLabel || '');
        const itemsMarkup = normalized.items.map((item) => {
            if (item.label && !item.name) {
                return `<div class="history-line-item is-legacy">${escapeHistoryHtml(item.label)}</div>`;
            }

            return `
                <div class="history-line-item">
                    <div class="history-line-item-main">
                        <div class="history-line-item-head">
                            <span class="history-line-item-qty">${item.qty}&times;</span>
                            <span class="history-line-item-name">${escapeHistoryHtml(item.name)}</span>
                            ${item.sizeLabel ? `<span class="history-line-item-size">${escapeHistoryHtml(item.sizeLabel)}</span>` : ''}
                        </div>
                        ${item.extras?.length ? `<div class="history-line-item-extras">${escapeHistoryHtml(item.extras.join(' • '))}</div>` : ''}
                    </div>
                    ${Number.isFinite(item.total) ? `<span class="history-line-item-total">${item.total.toFixed(0)} ${escapeHistoryHtml(normalized.currency)}</span>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="history-ticket-card${normalized.legacy ? ' is-legacy' : ''}">
                <div class="history-ticket-top">
                    <div>
                        <div class="history-ticket-label">${t('ticket_number_prefix', 'TICKET')}</div>
                        <div class="history-ticket-number">#${escapeHistoryHtml(normalized.orderNo || '----')}</div>
                    </div>
                    <div class="history-ticket-status">${escapeHistoryHtml(normalized.serviceLabel || t('service_onsite', 'Sur place'))}</div>
                </div>
                <div class="history-ticket-meta">
                    <div class="history-ticket-meta-row">
                        <span>${t('ticket_date', 'Date')}</span>
                        <strong>${escapeHistoryHtml(dateParts.date || '')}</strong>
                    </div>
                    ${dateParts.time ? `
                        <div class="history-ticket-meta-row">
                            <span>Time</span>
                            <strong>${escapeHistoryHtml(dateParts.time)}</strong>
                        </div>
                    ` : ''}
                    <div class="history-ticket-meta-row">
                        <span>${t('ticket_total', 'TOTAL')}</span>
                        <strong>${Number.isFinite(normalized.total) ? `${normalized.total.toFixed(0)} ${escapeHistoryHtml(normalized.currency)}` : escapeHistoryHtml(normalized.totalLabel || '')}</strong>
                    </div>
                    ${normalized.address ? `
                        <div class="history-ticket-address">
                            <span>${MENU_UI_ICONS.address}</span>
                            <span>${escapeHistoryHtml(normalized.address)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="history-ticket-items">
                    ${itemsMarkup}
                </div>
            </div>
        `;
    }

    function generateTicket() {
        ensureMenuInteractionDom();
        const cart = getCart();
        const serviceType = getServiceType();
        if (serviceType === 'delivery' && (!window.currentDeliveryAddress || window.currentDeliveryAddress.trim() === '')) {
            alert(t('ticket_delivery_required', 'Veuillez saisir votre adresse de livraison.'));
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const now = new Date();
        const orderNo = Math.floor(1000 + Math.random() * 9000);
        const ticketModal = document.getElementById('ticketModal');
        const ticketContent = document.getElementById('ticketContent');
        if (!ticketModal || !ticketContent) return;
        const restaurantName = typeof window.getRestaurantDisplayName === 'function' ? window.getRestaurantDisplayName() : 'Restaurant';
        const restaurantAddress = typeof window.getRestaurantAddress === 'function' ? window.getRestaurantAddress() : '';

        const serviceLabels = {
            onsite: t('service_onsite', 'Sur place'),
            takeaway: t('service_takeaway', 'Takeaway'),
            delivery: t('service_delivery', 'Livraison')
        };
        const serviceLabel = serviceLabels[serviceType];

        ticketContent.innerHTML = `
            <div class="ticket-content">
                <button onclick="closeAllModals()" class="ticket-close-btn">&times;</button>
                <div class="ticket-brand">
                    <div class="ticket-brand-name">${restaurantName}</div>
                    <div class="ticket-brand-address">${restaurantAddress}</div>
                </div>
                <div class="ticket-summary">
                    <div class="ticket-number">${t('ticket_number_prefix', 'TICKET')} #${orderNo}</div>
                    <div class="ticket-datetime">${now.toLocaleDateString()} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div class="ticket-service">${t('ticket_type_label', 'Type')}: ${serviceLabel}</div>
                    ${serviceType === 'delivery' ? `<div class="ticket-delivery-address">${MENU_UI_ICONS.address} ${window.currentDeliveryAddress}</div>` : ''}
                </div>
                <div class="ticket-items">
                    ${cart.map((item) => `
                        <div class="ticket-item-row">
                            <div class="ticket-item-name">
                                <div><strong class="ticket-item-qty">${item.qty} &times;</strong> ${window.getLocalizedMenuName(item)}${item.selectedSize ? ` <span class="ticket-item-size">(${item.selectedSize.charAt(0).toUpperCase()})</span>` : ''}</div>
                                ${item.selectedExtras?.length ? `<div class="ticket-item-extras">${item.selectedExtras.map((extra) => extra.name).join(' • ')}</div>` : ''}
                            </div>
                            <div class="ticket-item-price">${(item.price * item.qty).toFixed(0)} <span class="ticket-item-currency">dhs</span></div>
                        </div>
                    `).join('')}
                </div>
                <div class="ticket-total-wrap">
                    <div class="ticket-total-box">${t('ticket_total_prefix', 'TOTAL :')} ${total.toFixed(0)} dhs</div>
                </div>
                ${serviceType === 'delivery' ? `
                    <div class="ticket-actions-grid">
                        <button onclick="document.getElementById('ticketModal').classList.remove('open'); document.getElementById('cartDrawer').classList.add('open');" class="ticket-action-btn is-outline">${t('ticket_edit', 'MODIFIER')}</button>
                        <button onclick="sendOrderViaWhatsApp('${orderNo}', ${total.toFixed(2)}, '${serviceLabel}')" class="ticket-action-btn is-primary">${t('ticket_order', 'COMMANDER')}</button>
                    </div>
                ` : `
                    <div id="ticketActions_${orderNo}" class="ticket-actions-single">
                        <button onclick="finalizeOrderSilent('${orderNo}', ${total.toFixed(2)}, '${serviceLabel}', this)" class="ticket-action-btn is-dark">${t('ticket_validate', 'VALIDER LA COMMANDE')}</button>
                        <div class="ticket-helper">${t('ticket_helper', 'Cliquez pour enregistrer et montrer au serveur')}</div>
                    </div>
                `}
            </div>
        `;

        document.getElementById('cartDrawer')?.classList.remove('open');
        ticketModal.classList.add('open');
    }

    function finalizeOrder(orderNo, total, serviceLabel) {
        const now = new Date();
        const cart = getCart();
        const serviceType = getServiceType();
        saveToHistory({
            orderNo: String(orderNo),
            createdAt: now.toISOString(),
            serviceLabel,
            total,
            currency: 'MAD',
            address: serviceType === 'delivery' ? window.currentDeliveryAddress.trim() : '',
            items: cart.map((item) => ({
                qty: item.qty,
                name: window.getLocalizedMenuName(item),
                sizeLabel: item.selectedSize ? item.selectedSize.charAt(0).toUpperCase() : '',
                extras: Array.isArray(item.selectedExtras) ? item.selectedExtras.map((extra) => extra.name) : [],
                total: item.price * item.qty
            }))
        });
        setCart([]);
        window.currentDeliveryAddress = '';
        runtime()?.saveCart?.();
        runtime()?.updateCartUI?.();
        closeAllModals();
        runtime()?.showLanding?.();
    }

    function finalizeOrderSilent(orderNo, total, serviceLabel, btn) {
        const now = new Date();
        const cart = getCart();
        saveToHistory({
            orderNo: String(orderNo),
            createdAt: now.toISOString(),
            serviceLabel,
            total,
            currency: 'MAD',
            items: cart.map((item) => ({
                qty: item.qty,
                name: window.getLocalizedMenuName(item),
                sizeLabel: item.selectedSize ? item.selectedSize.charAt(0).toUpperCase() : '',
                extras: Array.isArray(item.selectedExtras) ? item.selectedExtras.map((extra) => extra.name) : [],
                total: item.price * item.qty
            }))
        });
        setCart([]);
        window.currentDeliveryAddress = '';
        runtime()?.saveCart?.();
        runtime()?.updateCartUI?.();

        const parent = btn.parentElement;
        if (!parent) return;
        parent.innerHTML = `
            <button onclick="closeAllModals(); showLanding();" class="ticket-action-btn is-success">${t('ticket_saved', 'ORDER SAVED')}</button>
            <div class="ticket-helper is-success">${t('ticket_saved_help', 'Order saved. Tap to close.')}</div>
        `;
    }

    function sendOrderViaWhatsApp(orderNo, total, serviceLabel) {
        const cart = getCart();
        const serviceType = getServiceType();
        let waText = `*${t('wa_new_order_title', 'NEW ORDER - {restaurant}', { restaurant: `#${orderNo}` })}*\n`;
        waText += `${t('ticket_type_label', 'Type')}: ${serviceLabel}\n`;
        if (serviceType === 'delivery') {
            waText += `${t('ticket_addr', 'Adresse')}: ${window.currentDeliveryAddress.trim()}\n`;
        }
        waText += `---------------------------\n`;
        cart.forEach((item) => {
            const sizeLabel = item.selectedSize ? ` (${item.selectedSize.charAt(0).toUpperCase()})` : '';
            const extrasLabel = item.selectedExtras?.length
                ? ` + ${item.selectedExtras.map((extra) => extra.name).join(', ')}`
                : '';
            waText += `${item.qty}x ${window.getLocalizedMenuName(item)}${sizeLabel}${extrasLabel} - ${(item.price * item.qty).toFixed(0)} dhs\n`;
        });
        waText += `---------------------------\n`;
        waText += `*${t('wa_total_label', 'TOTAL')}: ${total.toFixed(0)} dhs*\n`;

        const phone = window.getWhatsAppNumber();
        if (!phone) {
            window.showToast(t('social_empty', 'No links configured yet.'));
            return;
        }

        finalizeOrder(orderNo, total, serviceLabel);
        window.openSafeExternalUrl(`https://wa.me/${phone}?text=${encodeURIComponent(waText)}`, '_blank');
    }

    document.addEventListener('keydown', (event) => {
        const overlay = document.getElementById('galleryOverlay');
        if (overlay && overlay.style.display === 'flex') {
            if (event.key === 'ArrowRight') nextGalleryImage();
            if (event.key === 'ArrowLeft') prevGalleryImage();
            if (event.key === 'Escape') closeGallery();
        }
    });

    window.openDishPage = openDishPage;
    window.closeDishPage = closeDishPage;
    window.openDishGallery = openDishGallery;
    window.repeatCartItem = repeatCartItem;
    window.nextDishImage = nextDishImage;
    window.prevDishImage = prevDishImage;
    window.openGallery = openGallery;
    window.closeGallery = closeGallery;
    window.updateGalleryView = updateGalleryView;
    window.nextGalleryImage = nextGalleryImage;
    window.prevGalleryImage = prevGalleryImage;
    window.openDrawer = openDrawer;
    window.closeAllModals = closeAllModals;
    window.renderDrawer = renderDrawer;
    window.openHistory = openHistory;
    window.closeHistory = closeHistory;
    window.renderHistory = renderHistory;
    window.deleteHistoryItem = deleteHistoryItem;
    window.saveToHistory = saveToHistory;
    window.generateTicket = generateTicket;
    window.finalizeOrder = finalizeOrder;
    window.finalizeOrderSilent = finalizeOrderSilent;
    window.sendOrderViaWhatsApp = sendOrderViaWhatsApp;
    window.__foodyMenuInteractionsLoaded = true;
})();
