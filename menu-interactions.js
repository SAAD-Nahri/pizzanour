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

    function getOptimizedPreviewImageSrc(value, variant = 'hero') {
        return typeof window.getPublicUploadThumbnailUrl === 'function'
            ? window.getPublicUploadThumbnailUrl(value, variant)
            : value;
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

    function getUiLocale() {
        const lang = getUiLang();
        if (lang === 'ar') return 'ar-MA';
        if (lang === 'en') return 'en-US';
        return 'fr-MA';
    }

    function formatUiDate(date) {
        return date.toLocaleDateString(getUiLocale());
    }

    function formatUiTime(date) {
        return date.toLocaleTimeString(getUiLocale(), { hour: '2-digit', minute: '2-digit' });
    }

    function getServiceTypeLabel(serviceType, fallback = '') {
        const labels = {
            onsite: t('service_onsite', 'Sur place'),
            takeaway: t('service_takeaway', 'Takeaway'),
            delivery: t('service_delivery', 'Livraison')
        };
        return labels[serviceType] || fallback;
    }

    function getDishUiCopy(key) {
        const copyKeys = {
            size_title: ['dish_size_title', 'Choisissez une taille'],
            extras_title: ['dish_extras_title', 'Ajoutez des extras'],
            included_label: ['dish_included_label', 'Inclus']
        };
        const [translationKey, fallback] = copyKeys[key] || ['', ''];
        return translationKey ? t(translationKey, fallback) : '';
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
    let currentGallerySourceItems = [];
    let orderPromptResolver = null;
    let lastOrderPromptFocus = null;
    let currentOrderPromptState = null;

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
                <button class="dish-page-close" onclick="closeDishPage()" data-i18n-title="modal_close" data-i18n-aria-label="modal_close" title="${t('modal_close', 'Close')}" aria-label="${t('modal_close', 'Close')}">&times;</button>
                <div class="dish-page-header">
                    <button id="dishPagePrev" class="dish-page-media-nav dish-page-media-prev" type="button" onclick="prevDishImage()" data-i18n-title="gallery_prev" data-i18n-aria-label="gallery_prev" title="${t('gallery_prev', 'Previous image')}" aria-label="${t('gallery_prev', 'Previous image')}">&#10094;</button>
                    <img id="dishPageImg" src="" alt="" class="dish-page-img" width="1200" height="900" decoding="async">
                    <button id="dishPageNext" class="dish-page-media-nav dish-page-media-next" type="button" onclick="nextDishImage()" data-i18n-title="gallery_next" data-i18n-aria-label="gallery_next" title="${t('gallery_next', 'Next image')}" aria-label="${t('gallery_next', 'Next image')}">&#10095;</button>
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
                        <button id="dishPageAddBtn" class="dish-add-btn" data-i18n="add_to_cart">${t('add_to_cart', 'AJOUTER AU PANIER')}</button>
                    </div>
                </div>
            </div>

            <div id="historyOverlay" class="history-overlay" onclick="closeHistory()">
                <div class="history-modal" onclick="event.stopPropagation()">
                    <div class="history-header">
                        <h2 data-i18n="history_title">${t('history_title', 'Historique')}</h2>
                        <button onclick="closeHistory()" class="history-close-btn" data-i18n-title="modal_close" data-i18n-aria-label="modal_close" title="${t('modal_close', 'Close')}" aria-label="${t('modal_close', 'Close')}">&times;</button>
                    </div>
                    <div id="historyContent">
                        <p class="history-empty" data-i18n="history_empty">${t('history_empty', 'Aucune commande recente.')}</p>
                    </div>
                </div>
            </div>

            <div id="sharedOverlay" class="overlay" onclick="closeAllModals()"></div>

            <div id="cartDrawer" class="modal-sheet cart-sheet">
                <div class="modal-handle"></div>
                <div id="drawerContent"></div>
            </div>

            <div id="ticketModal" class="modal-sheet ticket-sheet">
                <div id="ticketContent"></div>
            </div>

            <div id="galleryOverlay" class="gallery-overlay" onclick="closeGallery()">
                <button class="gallery-close" onclick="closeGallery()" data-i18n-title="modal_close" data-i18n-aria-label="modal_close" title="${t('modal_close', 'Close')}" aria-label="${t('modal_close', 'Close')}">&times;</button>
                <div class="gallery-container" onclick="event.stopPropagation()">
                    <button class="gallery-nav gallery-prev" onclick="prevGalleryImage()" data-i18n-title="gallery_prev" data-i18n-aria-label="gallery_prev" title="${t('gallery_prev', 'Previous image')}" aria-label="${t('gallery_prev', 'Previous image')}">&#10094;</button>
                    <img id="galleryImg" src="" alt="${t('image_alt_gallery', 'Gallery image')}" data-i18n-alt="image_alt_gallery" width="1200" height="900" decoding="async">
                    <button class="gallery-nav gallery-next" onclick="nextGalleryImage()" data-i18n-title="gallery_next" data-i18n-aria-label="gallery_next" title="${t('gallery_next', 'Next image')}" aria-label="${t('gallery_next', 'Next image')}">&#10095;</button>
                </div>
                <div class="gallery-info" onclick="event.stopPropagation()">
                    <div id="galleryTitle" class="gallery-title"></div>
                    <div id="galleryCount" class="gallery-count"></div>
                </div>
            </div>

            <div id="orderPromptOverlay" class="order-prompt-overlay" onclick="resolveOrderPrompt(false)">
                <div id="orderPromptCard" class="order-prompt-card" onclick="event.stopPropagation()">
                    <div id="orderPromptIcon" class="order-prompt-icon">${MENU_UI_ICONS.sparkle}</div>
                    <div id="orderPromptEyebrow" class="order-prompt-eyebrow"></div>
                    <h3 id="orderPromptTitle" class="order-prompt-title"></h3>
                    <p id="orderPromptCopy" class="order-prompt-copy"></p>
                    <div id="orderPromptNote" class="order-prompt-note"></div>
                    <div class="order-prompt-actions">
                        <button id="orderPromptCancel" class="order-prompt-btn is-muted" type="button" onclick="resolveOrderPrompt(false)">${t('action_cancel', 'Annuler')}</button>
                        <button id="orderPromptConfirm" class="order-prompt-btn is-primary" type="button" onclick="resolveOrderPrompt(true)">${t('action_confirm', 'Confirmer')}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(template.content);
        interactionDomReady = true;
    }

    function resolveOrderPrompt(confirmed = false) {
        const overlay = document.getElementById('orderPromptOverlay');
        const resolver = orderPromptResolver;
        orderPromptResolver = null;
        currentOrderPromptState = null;
        if (overlay) {
            overlay.classList.remove('open');
        }
        if (lastOrderPromptFocus && typeof lastOrderPromptFocus.focus === 'function') {
            queueMicrotask(() => {
                lastOrderPromptFocus.focus();
                lastOrderPromptFocus = null;
            });
        } else {
            lastOrderPromptFocus = null;
        }
        resolver?.(confirmed);
    }

    function resolvePromptValue(value) {
        return typeof value === 'function' ? value() : value;
    }

    function refreshOrderPromptCopy() {
        const overlay = document.getElementById('orderPromptOverlay');
        if (!overlay?.classList.contains('open') || !currentOrderPromptState) return;

        const card = document.getElementById('orderPromptCard');
        const iconEl = document.getElementById('orderPromptIcon');
        const eyebrowEl = document.getElementById('orderPromptEyebrow');
        const titleEl = document.getElementById('orderPromptTitle');
        const copyEl = document.getElementById('orderPromptCopy');
        const noteEl = document.getElementById('orderPromptNote');
        const cancelBtn = document.getElementById('orderPromptCancel');
        const confirmBtn = document.getElementById('orderPromptConfirm');
        if (!card || !iconEl || !eyebrowEl || !titleEl || !copyEl || !noteEl || !cancelBtn || !confirmBtn) return;

        const icon = resolvePromptValue(currentOrderPromptState.icon);
        const eyebrow = resolvePromptValue(currentOrderPromptState.eyebrow);
        const title = resolvePromptValue(currentOrderPromptState.title);
        const text = resolvePromptValue(currentOrderPromptState.text);
        const note = resolvePromptValue(currentOrderPromptState.note);
        const confirmLabel = resolvePromptValue(currentOrderPromptState.confirmLabel);
        const cancelLabel = resolvePromptValue(currentOrderPromptState.cancelLabel);
        const isNotice = currentOrderPromptState.mode === 'notice';

        iconEl.textContent = icon || MENU_UI_ICONS.sparkle || '!';
        eyebrowEl.textContent = String(eyebrow || '').trim();
        titleEl.textContent = String(title || '').trim();
        copyEl.textContent = String(text || '').trim();
        noteEl.textContent = String(note || '').trim();

        eyebrowEl.hidden = !eyebrowEl.textContent;
        titleEl.hidden = !titleEl.textContent;
        copyEl.hidden = !copyEl.textContent;
        noteEl.hidden = !noteEl.textContent;

        cancelBtn.textContent = String(cancelLabel || t('action_cancel', 'Annuler')).trim();
        confirmBtn.textContent = String(confirmLabel || (isNotice ? t('action_continue', 'Continuer') : t('action_confirm', 'Confirmer'))).trim();
        cancelBtn.hidden = isNotice;

        card.classList.toggle('is-danger', Boolean(currentOrderPromptState.danger));
        card.classList.toggle('is-notice', isNotice);
    }

    function openOrderPrompt({
        mode = 'confirm',
        icon = MENU_UI_ICONS.sparkle,
        eyebrow = '',
        title = '',
        text = '',
        note = '',
        confirmLabel = '',
        cancelLabel = '',
        danger = false
    } = {}) {
        ensureMenuInteractionDom();

        const overlay = document.getElementById('orderPromptOverlay');
        const card = document.getElementById('orderPromptCard');
        const iconEl = document.getElementById('orderPromptIcon');
        const eyebrowEl = document.getElementById('orderPromptEyebrow');
        const titleEl = document.getElementById('orderPromptTitle');
        const copyEl = document.getElementById('orderPromptCopy');
        const noteEl = document.getElementById('orderPromptNote');
        const cancelBtn = document.getElementById('orderPromptCancel');
        const confirmBtn = document.getElementById('orderPromptConfirm');
        if (!overlay || !card || !iconEl || !eyebrowEl || !titleEl || !copyEl || !noteEl || !cancelBtn || !confirmBtn) {
            return Promise.resolve(false);
        }

        orderPromptResolver?.(false);
        orderPromptResolver = null;
        lastOrderPromptFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        currentOrderPromptState = { mode, icon, eyebrow, title, text, note, confirmLabel, cancelLabel, danger };
        refreshOrderPromptCopy();
        overlay.classList.add('open');

        return new Promise((resolve) => {
            orderPromptResolver = resolve;
            queueMicrotask(() => {
                const isNotice = currentOrderPromptState?.mode === 'notice';
                (isNotice ? confirmBtn : cancelBtn).focus();
            });
        });
    }

    function showOrderConfirm(options = {}) {
        return openOrderPrompt({ ...options, mode: 'confirm' });
    }

    function showOrderNotice(options = {}) {
        return openOrderPrompt({ ...options, mode: 'notice' });
    }

    function clearDeliveryAddressAttention() {
        window.deliveryAddressNeedsAttention = false;
        const field = document.getElementById('deliveryAddress');
        const hint = document.getElementById('deliveryAddressHint');
        if (field) field.classList.remove('is-invalid');
        if (hint) {
            hint.textContent = t('cart_delivery_help', 'Ajoutez une adresse claire pour confirmer la livraison.');
            hint.classList.remove('is-warning');
        }
    }

    function focusDeliveryAddressField() {
        const field = document.getElementById('deliveryAddress');
        if (!field) return;
        field.focus();
        field.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function setDeliveryAddressAttention() {
        window.deliveryAddressNeedsAttention = true;
        const field = document.getElementById('deliveryAddress');
        const hint = document.getElementById('deliveryAddressHint');
        if (field) field.classList.add('is-invalid');
        if (hint) {
            hint.textContent = t('ticket_delivery_required', 'Veuillez saisir votre adresse de livraison.');
            hint.classList.add('is-warning');
        }
    }

    function handleDeliveryAddressInput(field) {
        window.currentDeliveryAddress = field?.value || '';
        if ((field?.value || '').trim()) {
            clearDeliveryAddressAttention();
        }
    }

    async function confirmClearCart() {
        const confirmed = await showOrderConfirm({
            icon: () => MENU_UI_ICONS.cart || MENU_UI_ICONS.plate,
            eyebrow: () => t('confirm_cart_label', 'Mon panier'),
            title: () => t('cart_clear_title', 'Vider le panier ?'),
            text: () => t('cart_clear_text', 'Cette commande en cours sera supprimée de cet appareil.'),
            note: () => t('cart_clear_note', 'Les plats pourront toujours être ajoutés à nouveau depuis la carte.'),
            confirmLabel: () => t('cart_clear_confirm_action', 'Vider le panier'),
            cancelLabel: () => t('action_keep', 'Garder')
        });
        if (!confirmed) return;
        setCart([]);
        clearDeliveryAddressAttention();
        runtime()?.saveCart?.();
        runtime()?.updateCartUI?.();
        closeAllModals();
        runtime()?.showLanding?.();
        window.showToast?.(t('cart_cleared', 'Panier vidé.'));
    }

    function closeAllModals() {
        ensureMenuInteractionDom();
        ['sharedOverlay', 'cartDrawer', 'ticketModal', 'dishPage', 'historyOverlay', 'superCatSheet', 'superCatOverlay', 'orderPromptOverlay'].forEach((id) => {
            document.getElementById(id)?.classList.remove('open');
        });
        document.getElementById('cartDrawer')?.classList.remove('is-info-modal');
        orderPromptResolver = null;
        const galleryOverlay = document.getElementById('galleryOverlay');
        if (galleryOverlay) galleryOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function closeTransientUi(exceptIds = []) {
        ensureMenuInteractionDom();
        const except = new Set(exceptIds);
        ['sharedOverlay', 'cartDrawer', 'ticketModal', 'dishPage', 'historyOverlay', 'superCatSheet', 'superCatOverlay', 'orderPromptOverlay'].forEach((id) => {
            if (!except.has(id)) {
                document.getElementById(id)?.classList.remove('open');
            }
        });
        if (!except.has('cartDrawer')) {
            document.getElementById('cartDrawer')?.classList.remove('is-info-modal');
        }
        if (!except.has('galleryOverlay')) {
            const galleryOverlay = document.getElementById('galleryOverlay');
            if (galleryOverlay) galleryOverlay.style.display = 'none';
        }
        orderPromptResolver = null;
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

            const optimizedImage = getOptimizedPreviewImageSrc(activeImage, 'hero');
            window.setSafeImageSource(imgEl, optimizedImage, {
                fallbackSrc: optimizedImage !== activeImage ? activeImage : '',
                loading: 'eager',
                decoding: 'async',
                fetchPriority: 'high',
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

        const refreshDishPageCopy = () => {
            nameEl.textContent = window.getLocalizedMenuName(item);
            imgEl.alt = nameEl.textContent || t('image_alt_menu_item', 'Menu item');
            renderDishConfigurator();
            syncDishPricing();
            descEl.textContent = window.getLocalizedMenuDescription(item, t('dish_default_desc', 'A carefully prepared dish made with our best ingredients.'));
        };

        page.__refreshDishPageCopy = refreshDishPageCopy;
        refreshDishPageCopy();
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
        currentGallerySourceItems = Array.isArray(items) ? items : [];
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
        currentGallerySourceItems = [];
        document.body.style.overflow = '';
    }

    function refreshGalleryCopy() {
        const overlay = document.getElementById('galleryOverlay');
        if (!overlay || overlay.style.display !== 'flex' || !currentGallerySourceItems.length) return;
        galleryItems = buildGalleryEntries(currentGallerySourceItems);
        if (!galleryItems.length) {
            closeGallery();
            return;
        }
        currentGalleryIdx = Math.max(0, Math.min(currentGalleryIdx, galleryItems.length - 1));
        updateGalleryView();
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

        const optimizedImage = getOptimizedPreviewImageSrc(entry.imageSrc, 'hero');
        window.setSafeImageSource(img, optimizedImage, {
            fallbackSrc: optimizedImage !== entry.imageSrc ? entry.imageSrc : '',
            loading: 'eager',
            decoding: 'async',
            fetchPriority: 'high',
            onMissing: () => {
                closeGallery();
            },
            displayValue: 'block'
        });
        img.alt = entry.title || t('image_alt_gallery', 'Gallery image');
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
        closeTransientUi(['sharedOverlay', 'cartDrawer']);
        document.getElementById('cartDrawer')?.classList.remove('is-info-modal');
        document.getElementById('sharedOverlay')?.classList.add('open');
        document.getElementById('cartDrawer')?.classList.add('open');
        renderDrawer();
        document.body.style.overflow = 'hidden';
    }

    function renderDrawer() {
        ensureMenuInteractionDom();
        const cart = getCart();
        const serviceType = getServiceType();
        if (serviceType !== 'delivery' || (window.currentDeliveryAddress || '').trim()) {
            window.deliveryAddressNeedsAttention = false;
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const content = document.getElementById('drawerContent');
        if (!content) return;
        const restaurantName = typeof window.getRestaurantDisplayName === 'function'
            ? window.getRestaurantDisplayName()
            : 'Restaurant';
        const safeRestaurantName = escapeUiHtml(restaurantName);
        const serviceOptions = [
            { key: 'onsite', icon: MENU_UI_ICONS.plate, label: t('service_onsite', 'Sur place') },
            { key: 'takeaway', icon: MENU_UI_ICONS.takeaway, label: t('service_takeaway', 'A emporter') },
            { key: 'delivery', icon: MENU_UI_ICONS.delivery, label: t('service_delivery', 'Livraison') }
        ];

        if (!cart.length) {
            content.innerHTML = `
                <div class="cart-drawer-body is-empty">
                    <div class="cart-drawer-header">
                        <div class="cart-drawer-title">${safeRestaurantName}</div>
                        <div class="cart-drawer-meta">
                            <div class="cart-drawer-count">${escapeUiHtml(t('cart_items_count', '{count} item(s)', { count: 0 }))}</div>
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
                    <div class="cart-drawer-title">${safeRestaurantName}</div>
                    <div class="cart-drawer-meta">
                        <button onclick="window.confirmClearCart()" class="cart-drawer-clear" data-i18n="cart_clear" data-i18n-aria-label="cart_clear" data-i18n-title="cart_clear" aria-label="${escapeUiHtml(t('cart_clear', 'Vider'))}" title="${escapeUiHtml(t('cart_clear', 'Vider'))}">${escapeUiHtml(t('cart_clear', 'Vider'))}</button>
                        <div class="cart-drawer-count">${escapeUiHtml(t('cart_items_count', '{count} item(s)', { count: cart.length }))}</div>
                    </div>
                </div>
                <div class="cart-items-list">
                    ${cart.map((item) => `
                        <div class="cart-item-card">
                            <div class="cart-item-main">
                                <div class="cart-item-name">
                                    ${escapeUiHtml(window.getLocalizedMenuName(item))} ${item.selectedSize ? `<span class="cart-item-size">(${escapeUiHtml(item.selectedSize.charAt(0).toUpperCase())})</span>` : ''}
                                </div>
                                ${item.selectedExtras?.length ? `<div class="cart-item-extras">${escapeUiHtml(formatSelectedExtrasSummary(item.selectedExtras))}</div>` : ''}
                                <div class="cart-item-price">${formatMoney(item.price * item.qty)}</div>
                            </div>
                            <div class="cart-item-controls">
                                <button onclick="removeFromCart(${serializeInlineId(item.cartId)})" class="cart-qty-btn is-minus">-</button>
                                <span class="cart-item-qty">${item.qty}</span>
                                <button onclick="window.repeatCartItem(${serializeInlineId(item.cartId)})" class="cart-qty-btn is-plus">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-checkout-panel">
                    <div class="cart-service-grid">
                        ${serviceOptions.map((option) => `
                            <button class="cart-service-btn${serviceType === option.key ? ' is-active' : ''}" onclick="window.__foodyGetMenuRuntime().setServiceType('${option.key}'); renderDrawer()">
                                <span class="cart-service-icon">${option.icon}</span>
                                <span class="cart-service-label">${escapeUiHtml(option.label)}</span>
                            </button>
                        `).join('')}
                    </div>
                    ${serviceType === 'delivery' ? `
                    <div class="cart-delivery-block">
                        <label class="cart-delivery-label" data-i18n="cart_delivery_label">${escapeUiHtml(t('cart_delivery_label', `${MENU_UI_ICONS.address} Adresse de livraison`))}</label>
                        <textarea id="deliveryAddress" rows="2" data-i18n-placeholder="cart_delivery_placeholder" placeholder="${escapeUiHtml(t('cart_delivery_placeholder', 'Ex : Appartement 12, residence, quartier...'))}" oninput="window.handleDeliveryAddressInput(this)" class="cart-delivery-input${window.deliveryAddressNeedsAttention ? ' is-invalid' : ''}">${escapeUiHtml(window.currentDeliveryAddress || '')}</textarea>
                        <div id="deliveryAddressHint" class="cart-delivery-hint${window.deliveryAddressNeedsAttention ? ' is-warning' : ''}">${escapeUiHtml(window.deliveryAddressNeedsAttention ? t('ticket_delivery_required', 'Veuillez saisir votre adresse de livraison.') : t('cart_delivery_help', 'Ajoutez une adresse claire pour confirmer la livraison.'))}</div>
                    </div>
                    ` : ''}
                    <div class="cart-total-card">
                        <div class="cart-total-row">
                            <span data-i18n="cart_total_label">${escapeUiHtml(t('cart_total_label', 'Total'))}</span><span>${formatMoney(total)}</span>
                        </div>
                    </div>
                    <button onclick="generateTicket()" class="cart-confirm-btn" data-i18n="cart_confirm_order">${escapeUiHtml(t('cart_confirm_order', 'CONFIRMER MA COMMANDE'))}</button>
                </div>
            </div>
        `;

        if (typeof window.applyBranding === 'function') {
            window.applyBranding();
        }
    }

    function openHistory() {
        ensureMenuInteractionDom();
        closeTransientUi(['historyOverlay']);
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
                    <button onclick="deleteHistoryItem(${index})" class="history-delete-btn" data-i18n-title="history_delete_title" data-i18n-aria-label="history_delete_title" title="${t('history_delete_title', 'Supprimer')}" aria-label="${t('history_delete_title', 'Supprimer')}">${MENU_UI_ICONS.trash}</button>
                </div>
            `).join('');
    }

    async function deleteHistoryItem(index) {
        const confirmed = await showOrderConfirm({
            icon: () => MENU_UI_ICONS.trash,
            eyebrow: () => t('history_title', 'Historique'),
            title: () => t('history_delete_title_confirm', 'Supprimer ce ticket ?'),
            text: () => t('history_delete_confirm', "Supprimer ce ticket de l'historique ?"),
            note: () => t('history_delete_note', "Cette suppression n'affecte que cet appareil."),
            confirmLabel: () => t('history_delete_action', 'Supprimer'),
            cancelLabel: () => t('action_keep', 'Garder'),
            danger: true
        });
        if (!confirmed) return;
        let history = typeof window.getStoredHistory === 'function'
            ? window.getStoredHistory()
            : [];
        history.splice(index, 1);
        if (typeof window.setStoredHistory === 'function') {
            window.setStoredHistory(history);
        }
        renderHistory();
        runtime()?.updateHistoryBadge?.();
        window.showToast?.(t('history_deleted', 'Ticket supprimé.'));
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
            serviceType: typeof entry.serviceType === 'string' ? entry.serviceType.trim() : '',
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
            date: formatUiDate(date),
            time: formatUiTime(date)
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

        const localizedServiceLabel = getServiceTypeLabel(normalized.serviceType, normalized.serviceLabel || t('service_onsite', 'Sur place'));

        return `
            <div class="history-ticket-card${normalized.legacy ? ' is-legacy' : ''}">
                <div class="history-ticket-top">
                    <div>
                        <div class="history-ticket-label">${t('ticket_number_prefix', 'TICKET')}</div>
                        <div class="history-ticket-number">#${escapeHistoryHtml(normalized.orderNo || '----')}</div>
                    </div>
                    <div class="history-ticket-status">${escapeHistoryHtml(localizedServiceLabel)}</div>
                </div>
                <div class="history-ticket-meta">
                    <div class="history-ticket-meta-row">
                        <span>${t('ticket_date', 'Date')}</span>
                        <strong>${escapeHistoryHtml(dateParts.date || '')}</strong>
                    </div>
                    ${dateParts.time ? `
                        <div class="history-ticket-meta-row">
                            <span>${t('ticket_time', 'Heure')}</span>
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
            setDeliveryAddressAttention();
            showOrderNotice({
                icon: () => MENU_UI_ICONS.address,
                eyebrow: () => t('service_delivery', 'Livraison'),
                title: () => t('ticket_delivery_required_title', 'Adresse requise'),
                text: () => t('ticket_delivery_required', 'Veuillez saisir votre adresse de livraison.'),
                note: () => t('ticket_delivery_required_note', 'Ajoutez une adresse claire avant de confirmer la commande.'),
                confirmLabel: () => t('action_continue', 'Continuer')
            }).then(() => {
                focusDeliveryAddressField();
            });
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const now = new Date();
        const orderNo = Math.floor(1000 + Math.random() * 9000);
        const ticketModal = document.getElementById('ticketModal');
        const ticketContent = document.getElementById('ticketContent');
        if (!ticketModal || !ticketContent) return;
        closeTransientUi(['sharedOverlay', 'ticketModal']);
        const restaurantName = typeof window.getRestaurantDisplayName === 'function' ? window.getRestaurantDisplayName() : 'Restaurant';
        const restaurantAddress = typeof window.getRestaurantAddress === 'function' ? window.getRestaurantAddress() : '';

        const serviceLabel = getServiceTypeLabel(serviceType, t('service_onsite', 'Sur place'));
        const safeServiceLabel = escapeUiHtml(serviceLabel);
        const safeOrderNo = escapeUiHtml(orderNo);
        const safeRestaurantName = escapeUiHtml(restaurantName);
        const safeRestaurantAddress = escapeUiHtml(restaurantAddress);
        const safeDeliveryAddress = escapeUiHtml(window.currentDeliveryAddress || '');

        ticketContent.innerHTML = `
            <div class="ticket-content">
                <button onclick="closeAllModals()" class="ticket-close-btn" data-i18n-title="modal_close" data-i18n-aria-label="modal_close" title="${escapeUiHtml(t('modal_close', 'Close'))}" aria-label="${escapeUiHtml(t('modal_close', 'Close'))}">&times;</button>
                <div class="ticket-brand">
                    <div class="ticket-brand-name">${safeRestaurantName}</div>
                    <div class="ticket-brand-address">${safeRestaurantAddress}</div>
                </div>
                <div class="ticket-summary">
                    <div class="ticket-number">${escapeUiHtml(t('ticket_number_prefix', 'TICKET'))} #${safeOrderNo}</div>
                    <div class="ticket-datetime">${formatUiDate(now)} - ${formatUiTime(now)}</div>
                    <div class="ticket-service">${escapeUiHtml(t('ticket_type_label', 'Type'))}: ${safeServiceLabel}</div>
                    ${serviceType === 'delivery' ? `<div class="ticket-delivery-address">${MENU_UI_ICONS.address} ${safeDeliveryAddress}</div>` : ''}
                </div>
                <div class="ticket-items">
                    ${cart.map((item) => `
                        <div class="ticket-item-row">
                            <div class="ticket-item-name">
                                <div><strong class="ticket-item-qty">${escapeUiHtml(item.qty)} &times;</strong> ${escapeUiHtml(window.getLocalizedMenuName(item))}${item.selectedSize ? ` <span class="ticket-item-size">(${escapeUiHtml(item.selectedSize.charAt(0).toUpperCase())})</span>` : ''}</div>
                                ${item.selectedExtras?.length ? `<div class="ticket-item-extras">${escapeUiHtml(item.selectedExtras.map((extra) => extra.name).filter(Boolean).join(' • '))}</div>` : ''}
                            </div>
                            <div class="ticket-item-price">${formatMoney(item.price * item.qty)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="ticket-total-wrap">
                    <div class="ticket-total-box"><span data-i18n="ticket_total_prefix">${escapeUiHtml(t('ticket_total_prefix', 'TOTAL :'))}</span> ${formatMoney(total)}</div>
                </div>
                ${serviceType === 'delivery' ? `
                    <div class="ticket-actions-grid">
                        <button onclick="document.getElementById('ticketModal').classList.remove('open'); document.getElementById('cartDrawer').classList.add('open');" class="ticket-action-btn is-outline">${escapeUiHtml(t('ticket_edit', 'MODIFIER'))}</button>
                        <button onclick="sendOrderViaWhatsApp(${serializeInlineId(orderNo)}, ${total.toFixed(2)}, ${serializeInlineId(serviceLabel)})" class="ticket-action-btn is-primary">${escapeUiHtml(t('ticket_order', 'COMMANDER'))}</button>
                    </div>
                ` : `
                    <div id="ticketActions_${orderNo}" class="ticket-actions-single">
                        <button onclick="finalizeOrderSilent(${serializeInlineId(orderNo)}, ${total.toFixed(2)}, ${serializeInlineId(serviceLabel)}, this)" class="ticket-action-btn is-dark">${escapeUiHtml(t('ticket_validate', 'VALIDER LA COMMANDE'))}</button>
                        <div class="ticket-helper">${escapeUiHtml(t('ticket_helper', 'Cliquez pour enregistrer et montrer au serveur'))}</div>
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
            serviceType,
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
        const serviceType = getServiceType();
        saveToHistory({
            orderNo: String(orderNo),
            createdAt: now.toISOString(),
            serviceType,
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
            <button onclick="closeAllModals(); showLanding();" class="ticket-action-btn is-success">${escapeUiHtml(t('ticket_saved', 'ORDER SAVED'))}</button>
            <div class="ticket-helper is-success">${escapeUiHtml(t('ticket_saved_help', 'Order saved. Tap to close.'))}</div>
        `;
    }

    function getOrderWhatsAppUrl(number, message) {
        const digits = String(number || '').replace(/\D/g, '');
        return digits ? `https://wa.me/${encodeURIComponent(digits)}?text=${encodeURIComponent(message)}` : '';
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
            waText += `${item.qty}x ${window.getLocalizedMenuName(item)}${sizeLabel}${extrasLabel} - ${formatMoney(item.price * item.qty)}\n`;
        });
        waText += `---------------------------\n`;
        waText += `*${t('wa_total_label', 'TOTAL')}: ${formatMoney(total)}*\n`;

        const phone = window.getWhatsAppNumber();
        if (!phone) {
            showOrderNotice({
                icon: () => MENU_UI_ICONS.whatsapp || MENU_UI_ICONS.sparkle,
                eyebrow: () => t('social_whatsapp', 'WhatsApp'),
                title: () => t('wa_missing_title', 'WhatsApp indisponible'),
                text: () => t('social_empty', 'No links configured yet.'),
                note: () => t('wa_missing_note', 'Ajoutez un numéro WhatsApp dans les paramètres du restaurant pour activer cette action.'),
                confirmLabel: () => t('action_ok', 'Compris')
            });
            return;
        }

        const whatsappUrl = getOrderWhatsAppUrl(phone, waText);
        const opened = whatsappUrl && window.openSafeExternalUrl(whatsappUrl, '_blank');
        if (!opened) {
            showOrderNotice({
                icon: () => MENU_UI_ICONS.whatsapp || MENU_UI_ICONS.sparkle,
                eyebrow: () => t('social_whatsapp', 'WhatsApp'),
                title: () => t('wa_popup_blocked_title', 'Autorisez l’ouverture de WhatsApp'),
                text: () => t('wa_popup_blocked_text', 'Votre navigateur a bloqué l’ouverture de WhatsApp pour cette commande.'),
                note: () => t('wa_popup_blocked_note', 'Autorisez les popups pour ce site puis réessayez depuis le ticket.'),
                confirmLabel: () => t('action_ok', 'Compris')
            });
            return;
        }

        finalizeOrder(orderNo, total, serviceLabel);
    }

    document.addEventListener('keydown', (event) => {
        const promptOverlay = document.getElementById('orderPromptOverlay');
        if (promptOverlay?.classList.contains('open') && event.key === 'Escape') {
            event.preventDefault();
            resolveOrderPrompt(false);
            return;
        }
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
    window.refreshGalleryCopy = refreshGalleryCopy;
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
    window.resolveOrderPrompt = resolveOrderPrompt;
    window.refreshOrderPrompt = refreshOrderPromptCopy;
    window.confirmClearCart = confirmClearCart;
    window.handleDeliveryAddressInput = handleDeliveryAddressInput;
    window.generateTicket = generateTicket;
    window.finalizeOrder = finalizeOrder;
    window.finalizeOrderSilent = finalizeOrderSilent;
    window.sendOrderViaWhatsApp = sendOrderViaWhatsApp;
    window.__foodyMenuInteractionsLoaded = true;
})();
