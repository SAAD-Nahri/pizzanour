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

    const MENU_UI_ICONS = runtime()?.MENU_UI_ICONS || {};
    let galleryItems = [];
    let currentGalleryIdx = 0;

    function closeAllModals() {
        ['sharedOverlay', 'cartDrawer', 'ticketModal', 'dishPage', 'historyOverlay', 'superCatSheet', 'superCatOverlay'].forEach((id) => {
            document.getElementById(id)?.classList.remove('open');
        });
        const galleryOverlay = document.getElementById('galleryOverlay');
        if (galleryOverlay) galleryOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function openDishPage(id) {
        const item = getMenu().find((entry) => sameMenuItemId(entry.id, id));
        if (!item) return;

        const page = document.getElementById('dishPage');
        const imgEl = document.getElementById('dishPageImg');
        const nameEl = document.getElementById('dishPageName');
        const priceEl = document.getElementById('dishPagePrice');
        const descEl = document.getElementById('dishPageDesc');
        const addBtn = document.getElementById('dishPageAddBtn');
        if (!page || !imgEl || !nameEl || !priceEl || !descEl || !addBtn) return;

        page.dataset.itemId = String(item.id);

        let selectedSize = item.hasSizes ? 'small' : null;
        const updateSizePrice = () => {
            const currentPrice = window.getItemPrice(item, selectedSize);
            const originalPrice = selectedSize ? (item.sizes?.[selectedSize] || item.price) : item.price;
            if (window.isItemInPromo(item.id)) {
                priceEl.innerHTML = `<span style="color:#ffd700; font-weight:800;">${currentPrice.toFixed(0)} MAD</span> <span style="text-decoration:line-through; font-size:0.8em; opacity:0.6;">${originalPrice.toFixed(0)} MAD</span>`;
            } else {
                priceEl.textContent = `${currentPrice.toFixed(0)} MAD`;
            }
        };

        const sizeSelectorHtml = item.hasSizes ? `
            <div class="size-selector-wrap" style="margin: 20px 0; display: flex; gap: 10px; justify-content: center;">
                ${['small', 'medium', 'large'].map((sizeKey) => {
                    const sizePrice = item.sizes?.[sizeKey];
                    if (!sizePrice) return '';
                    const labels = { small: 'S', medium: 'M', large: 'L' };
                    return `
                        <button class="size-btn ${selectedSize === sizeKey ? 'active' : ''}" 
                                onclick="window.selectDishSize('${sizeKey}')"
                                style="padding: 10px 20px; border-radius: 50px; border: 2px solid ${selectedSize === sizeKey ? 'var(--primary)' : '#eee'}; background: ${selectedSize === sizeKey ? 'var(--primary)' : '#fff'}; color: ${selectedSize === sizeKey ? '#fff' : '#333'}; cursor: pointer; font-weight: 700; transition: all 0.2s;">
                            ${labels[sizeKey]} - ${sizePrice} MAD
                        </button>
                    `;
                }).join('')}
            </div>
        ` : '';

        window.selectDishSize = (sizeKey) => {
            selectedSize = sizeKey;
            document.querySelectorAll('.size-btn').forEach((btn) => {
                const isActive = btn.innerText.startsWith(sizeKey.charAt(0).toUpperCase());
                btn.classList.toggle('active', isActive);
                btn.style.background = isActive ? 'var(--primary)' : '#fff';
                btn.style.color = isActive ? '#fff' : '#333';
                btn.style.borderColor = isActive ? 'var(--primary)' : '#eee';
            });
            updateSizePrice();
        };

        const oldSelector = descEl.parentElement?.querySelector('.size-selector-wrap');
        if (oldSelector) oldSelector.remove();
        if (sizeSelectorHtml) {
            descEl.insertAdjacentHTML('afterend', sizeSelectorHtml);
        }

        const imgSrc = (item.images && item.images.length > 0) ? item.images[0] : item.img;
        if (imgSrc) {
            window.setSafeImageSource(imgEl, imgSrc, {
                onMissing: () => {
                    imgEl.removeAttribute('src');
                    imgEl.style.display = 'none';
                },
                displayValue: 'block'
            });
            imgEl.onclick = () => openGallery([item], 0);
            imgEl.style.cursor = 'zoom-in';
        } else {
            imgEl.removeAttribute('src');
            imgEl.style.display = 'none';
            imgEl.onclick = null;
        }

        nameEl.textContent = window.getLocalizedMenuName(item) + (window.isItemInPromo(item.id) ? t('dish_promo_suffix', ' (PROMO)') : '');
        updateSizePrice();
        descEl.textContent = window.getLocalizedMenuDescription(item, t('dish_default_desc', 'A carefully prepared dish made with our best ingredients.'));
        addBtn.onclick = () => {
            window.addToCart(item.id, selectedSize);
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
        document.getElementById('dishPage')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openGallery(items, startIndex = 0) {
        galleryItems = items.filter((entry) => (entry.images && entry.images.length > 0) || entry.img);
        if (!galleryItems.length) return;

        currentGalleryIdx = startIndex;
        const overlay = document.getElementById('galleryOverlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateGalleryView();
    }

    function closeGallery() {
        const overlay = document.getElementById('galleryOverlay');
        if (overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function updateGalleryView() {
        const item = galleryItems[currentGalleryIdx];
        if (!item) return;
        const img = document.getElementById('galleryImg');
        const title = document.getElementById('galleryTitle');
        const count = document.getElementById('galleryCount');
        if (!img || !title || !count) return;

        img.classList.remove('gallery-flip');
        void img.offsetWidth;
        img.classList.add('gallery-flip');

        const galleryImgSrc = (item.images && item.images.length > 0) ? item.images[0] : item.img;
        window.setSafeImageSource(img, galleryImgSrc, {
            onMissing: () => {
                closeGallery();
            },
            displayValue: 'block'
        });
        title.textContent = window.getLocalizedMenuName(item);
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
        document.getElementById('sharedOverlay')?.classList.add('open');
        document.getElementById('cartDrawer')?.classList.add('open');
        renderDrawer();
        document.body.style.overflow = 'hidden';
    }

    function renderDrawer() {
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
            { key: 'takeaway', icon: MENU_UI_ICONS.takeaway, label: t('service_takeaway', 'À Emporter') },
            { key: 'delivery', icon: MENU_UI_ICONS.delivery, label: t('service_delivery', 'Livraison') }
        ];

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
                                <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} MAD</div>
                            </div>
                            <div class="cart-item-controls">
                                <button onclick="removeFromCart('${item.cartId}')" class="cart-qty-btn is-minus">-</button>
                                <span class="cart-item-qty">${item.qty}</span>
                                <button onclick="addToCart(${serializeInlineId(item.id)}, '${item.selectedSize || ''}');renderDrawer();" class="cart-qty-btn is-plus">+</button>
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
                    <textarea id="deliveryAddress" rows="2" placeholder="${t('cart_delivery_placeholder', 'Ex : Appartement 12, résidence, quartier...')}" oninput="window.currentDeliveryAddress = this.value" class="cart-delivery-input">${window.currentDeliveryAddress || ''}</textarea>
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
        renderHistory();
        document.getElementById('historyOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeHistory() {
        document.getElementById('historyOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderHistory() {
        const history = typeof window.getStoredHistory === 'function'
            ? window.getStoredHistory()
            : [];
        const container = document.getElementById('historyContent');
        if (!container) return;
        container.innerHTML = history.length === 0
            ? `<p class="history-empty">${t('history_empty', 'Aucune commande récente.')}</p>`
            : history.map((ticketHtml, index) => `
                <div class="history-ticket history-ticket-wrap">
                    ${ticketHtml}
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

    function generateTicket() {
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
                <button onclick="closeAllModals()" class="ticket-close-btn">×</button>
                <div class="ticket-brand">
                    <div class="ticket-brand-name">${restaurantName}</div>
                    <div class="ticket-brand-address">${restaurantAddress}</div>
                </div>
                <div class="ticket-summary">
                    <div class="ticket-number">${t('ticket_number_prefix', 'TICKET')} #${orderNo}</div>
                    <div class="ticket-datetime">${now.toLocaleDateString()} — ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div class="ticket-service">${t('ticket_type_label', 'Type')}: ${serviceLabel}</div>
                    ${serviceType === 'delivery' ? `<div class="ticket-delivery-address">📍 ${window.currentDeliveryAddress}</div>` : ''}
                </div>
                <div class="ticket-items">
                    ${cart.map((item) => `
                        <div class="ticket-item-row">
                            <div class="ticket-item-name"><strong class="ticket-item-qty">${item.qty} ×</strong> ${window.getLocalizedMenuName(item)}</div>
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
        const historyText = `${t('ticket_number_prefix', 'TICKET')} #${orderNo}\n${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n${t('ticket_type_label', 'Type')}: ${serviceLabel}\n${serviceType === 'delivery' ? `${t('ticket_addr', 'Adresse')}: ${window.currentDeliveryAddress.trim()}\n` : ''}${t('ticket_total', 'TOTAL')}: ${total.toFixed(0)} MAD\n---\n${cart.map((item) => item.qty + 'x ' + window.getLocalizedMenuName(item)).join('\n')}`;
        saveToHistory(historyText);
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
        const historyText = `${t('ticket_number_prefix', 'TICKET')} #${orderNo}\n${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n${t('ticket_type_label', 'Type')}: ${serviceLabel}\n${t('ticket_total', 'TOTAL')}: ${total.toFixed(0)} MAD\n---\n${cart.map((item) => item.qty + 'x ' + window.getLocalizedMenuName(item)).join('\n')}`;
        saveToHistory(historyText);
        setCart([]);
        window.currentDeliveryAddress = '';
        runtime()?.saveCart?.();
        runtime()?.updateCartUI?.();

        const parent = btn.parentElement;
        if (!parent) return;
        parent.innerHTML = `
            <button onclick="closeAllModals(); showLanding();" class="ticket-action-btn is-success">${t('ticket_saved', 'ORDER SAVED ✓')}</button>
            <div class="ticket-helper is-success">${t('ticket_saved_help', 'Order saved. Tap to close.')}</div>
        `;
    }

    function sendOrderViaWhatsApp(orderNo, total, serviceLabel) {
        const cart = getCart();
        const serviceType = getServiceType();
        let waText = `*${t('wa_new_order_title', 'NEW ORDER - {restaurant}', { restaurant: `#${orderNo}` })}*\n`;
        waText += `${t('ticket_type_label', 'Type')}: ${serviceLabel}\n`;
        if (serviceType === 'delivery') {
            waText += `📍 ${t('ticket_addr', 'Adresse')}: ${window.currentDeliveryAddress.trim()}\n`;
        }
        waText += `---------------------------\n`;
        cart.forEach((item) => {
            waText += `${item.qty}x ${window.getLocalizedMenuName(item)} - ${(item.price * item.qty).toFixed(0)} dhs\n`;
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
