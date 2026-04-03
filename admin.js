let menu = [];
let catEmojis = window.defaultCatEmojis || {};
let categoryImages = window.defaultCategoryImages || {};
window.categoryImages = categoryImages;
let categoryTranslations = window.defaultCategoryTranslations || {};
let restaurantConfig = window.restaurantConfig || window.defaultConfig || {};
let promoIds = [];
let lastImporterDraft = null;
let lastImporterDraftMeta = null;
let lastImporterReviewReport = null;
const IMPORT_STUDIO_MAX_MENU_IMAGES = 8;
let adminAuth = { user: 'admin', pass: '' };
let adminSecurityStatus = null;
let adminCapabilities = {
    sellerToolsEnabled: false,
    aiMediaToolsEnabled: false
};
let adminSaveState = {
    type: 'idle',
    message: '',
    updatedAt: null
};
let importStudioBusy = false;
let activeImporterJobId = '';
let activeImporterPollHandle = 0;
let deferredAdminInstallPrompt = null;
let adminSaveLoopPromise = null;
let adminSaveRequested = false;
let adminHelpToggleIdCounter = 0;
const ADMIN_APP_SECTION_KEY = 'restaurant_admin_last_section';
const ADMIN_IMPORTER_ACTIVE_JOB_KEY = 'restaurant_admin_importer_active_job';
const IMPORTER_JOB_POLL_MAX_FAILURES = 6;
const ADMIN_PWA_COPY = Object.freeze({
    fr: {
        label: 'Accès rapide',
        title: "Installer l'app admin",
        copy: "Ajoutez l'admin à l'écran d'accueil pour ouvrir le back-office comme une vraie application.",
        iosCopy: "Sur iPhone, utilisez Partager puis Ajouter à l'écran d'accueil pour installer l'admin.",
        button: "Installer l'app",
        iosButton: "Ajouter à l'écran d'accueil",
        sidebarButton: '⬇ Installer l’app',
        installedToast: "L'app admin est installée.",
        desktopHint: "Utilisez le menu du navigateur pour installer l'app."
    },
    en: {
        label: 'Quick Access',
        title: 'Install the admin app',
        copy: 'Add the admin to the home screen so the restaurant owner can open it like a real app.',
        iosCopy: 'On iPhone, use Share and then Add to Home Screen to install the admin.',
        button: 'Install App',
        iosButton: 'Add to Home Screen',
        sidebarButton: '⬇ Install App',
        installedToast: 'The admin app is installed.',
        desktopHint: 'Use the browser install option to add this app.'
    },
    ar: {
        label: 'دخول سريع',
        title: 'ثبت تطبيق الإدارة',
        copy: 'أضف لوحة الإدارة إلى الشاشة الرئيسية ليصل صاحب المطعم إليها كتطبيق سريع.',
        iosCopy: 'على iPhone استخدم مشاركة ثم إضافة إلى الشاشة الرئيسية لتثبيت لوحة الإدارة.',
        button: 'تثبيت التطبيق',
        iosButton: 'إضافة إلى الشاشة الرئيسية',
        sidebarButton: '⬇ تثبيت التطبيق',
        installedToast: 'تم تثبيت تطبيق الإدارة.',
        desktopHint: 'استخدم خيار التثبيت من المتصفح لإضافة التطبيق.'
    }
});
const ADMIN_PWA_SHELL_COPY = Object.freeze({
    fr: {
        standalone: 'Application admin',
        browser: 'Interface web'
    },
    en: {
        standalone: 'Admin app',
        browser: 'Web access'
    },
    ar: {
        standalone: 'تطبيق الإدارة',
        browser: 'نسخة الويب'
    }
});
const ADMIN_ICON = Object.freeze({
    bullet: String.fromCodePoint(0x2022),
    heart: String.fromCodePoint(0x2764, 0xFE0F),
    star: String.fromCodePoint(0x2B50),
    sparkle: String.fromCodePoint(0x2728),
    edit: String.fromCodePoint(0x270F, 0xFE0F),
    image: String.fromCodePoint(0x1F5BC, 0xFE0F),
    trash: String.fromCodePoint(0x1F5D1, 0xFE0F),
    camera: String.fromCodePoint(0x1F4F7)
});
const DEFAULT_SUPER_CATEGORY_ICON = '🍽️';
const SUPER_CATEGORY_ICON_PRESETS = Object.freeze([
    { icon: '🍽️', label: 'General' },
    { icon: '🍳', label: 'Breakfast' },
    { icon: '☕', label: 'Coffee' },
    { icon: '🥐', label: 'Bakery' },
    { icon: '🥗', label: 'Fresh' },
    { icon: '🍔', label: 'Burgers' },
    { icon: '🍕', label: 'Pizza' },
    { icon: '🍝', label: 'Pasta' },
    { icon: '🍲', label: 'Meals' },
    { icon: '🥩', label: 'Grill' },
    { icon: '🍰', label: 'Desserts' },
    { icon: '🍹', label: 'Beverages' }
]);
const SUPER_CATEGORY_ICON_RULES = Object.freeze([
    { icon: '🍳', terms: ['breakfast', 'morning', 'brunch', 'petit déjeuner', 'petit-dejeuner', 'matin', 'فطور', 'إفطار', 'صباح'] },
    { icon: '☕', terms: ['coffee', 'cafe', 'café', 'espresso', 'tea', 'thé', 'boisson chaude', 'قهوة', 'شاي'] },
    { icon: '🥐', terms: ['bakery', 'viennoiserie', 'pastry', 'croissant', 'boulangerie', 'معجنات'] },
    { icon: '🥗', terms: ['salad', 'healthy', 'fresh', 'veg', 'vég', 'green', 'سلطة', 'طازج'] },
    { icon: '🍔', terms: ['burger', 'sandwich', 'snack', 'tacos', 'wrap', 'برغر', 'ساندويتش'] },
    { icon: '🍕', terms: ['pizza', 'pizzeria'] },
    { icon: '🍝', terms: ['pasta', 'italian', 'italien', 'mac', 'spaghetti'] },
    { icon: '🍲', terms: ['meal', 'main', 'lunch', 'dinner', 'plat', 'plats', 'repas', 'tajine', 'طاجين', 'وجبات', 'رئيسية'] },
    { icon: '🥩', terms: ['grill', 'bbq', 'steak', 'meat', 'viande', 'grillade', 'مشاوي', 'لحم'] },
    { icon: '🍰', terms: ['dessert', 'sweet', 'cake', 'gateau', 'gâteau', 'patisserie', 'حلويات', 'تحلية'] },
    { icon: '🍹', terms: ['drink', 'drinks', 'juice', 'cocktail', 'beverage', 'boisson', 'boissons', 'عصير', 'مشروبات'] }
]);
let adminActionDialogResolver = null;
let superCategoryIconManuallyChosen = false;
const ADMIN_HELP_TOGGLE_RULES = Object.freeze([
    {
        hostSelector: '.menu-builder-stage',
        anchorSelector: '.menu-builder-heading',
        helpSelector: '#menuBuilderCopy, #menuBuilderOnboarding, #menuBuilderOverview',
        label: 'Menu builder help'
    },
    {
        hostSelector: '.menu-crud-form-intro',
        anchorSelector: '.menu-crud-form-intro-shell',
        helpSelector: '.menu-crud-form-intro-copy, .menu-crud-form-meta',
        label: 'Form guidance'
    },
    {
        hostSelector: '.menu-form-block',
        anchorSelector: '.menu-form-block-header',
        helpSelector: '.menu-form-block-copy, .menu-form-side-panel',
        label: 'Section guidance'
    },
    {
        hostSelector: '.translation-summary-card',
        anchorSelector: '.translation-summary-header',
        helpSelector: '.translation-summary-header p, .translation-summary-note',
        label: 'Translation guidance'
    },
    {
        hostSelector: '.info-hero-header',
        anchorSelector: '.info-hero-copy',
        helpSelector: '.info-hero-copy p',
        label: 'Info overview help'
    },
    {
        hostSelector: '.owner-subsection-heading',
        helpSelector: 'p',
        label: 'Section help'
    },
    {
        hostSelector: '.section-divider',
        helpSelector: '.section-divider-copy',
        label: 'Section help'
    },
    {
        hostSelector: '.branding-overview-card',
        anchorSelector: '.branding-overview-copy',
        helpSelector: '.branding-overview-copy p',
        label: 'Branding overview help'
    },
    {
        hostSelector: '.brand-asset-card',
        anchorSelector: 'h4',
        helpSelector: 'p',
        label: 'Media help'
    },
    {
        hostSelector: '#wifi',
        anchorSelector: 'h3',
        helpSelector: ':scope > p[data-i18n="admin.wifi.subtitle"]',
        label: 'Network help'
    },
    {
        hostSelector: '#branding',
        anchorSelector: 'h3',
        helpSelector: ':scope > p[data-i18n="admin.branding.subtitle"]',
        label: 'Branding help'
    },
    {
        hostSelector: '#landing',
        anchorSelector: 'h3',
        helpSelector: ':scope > p[data-i18n="admin.landing.subtitle"]',
        label: 'Homepage help'
    },
    {
        hostSelector: '#hours',
        anchorSelector: 'h3',
        helpSelector: ':scope > p',
        label: 'Hours help'
    },
    {
        hostSelector: '#supercategories',
        anchorSelector: 'h3',
        helpSelector: ':scope > p',
        label: 'Super category help'
    },
    {
        hostSelector: '#data-tools .tool-card--accent',
        anchorSelector: 'h4',
        helpSelector: ':scope > p, .muted-copy',
        label: 'Import help'
    },
    {
        hostSelector: '#security',
        anchorSelector: 'h3',
        helpSelector: ':scope > p.copy-muted, .security-help, .info-save-note',
        label: 'Security help'
    },
    {
        hostSelector: '.image-modal-dropzone',
        anchorSelector: '.image-modal-label',
        helpSelector: '.image-modal-helper',
        label: 'Image manager help'
    },
    {
        hostSelector: '.super-icon-picker',
        anchorSelector: '.super-icon-preview',
        helpSelector: '.super-icon-helper, .super-icon-preview-note',
        label: 'Icon picker help'
    }
]);

function getSuperCategoryIconPresetMeta(icon = '') {
    const normalized = String(icon || '').trim();
    return SUPER_CATEGORY_ICON_PRESETS.find((entry) => entry.icon === normalized) || null;
}

function normalizeSuperCategoryIconSource(name = '', desc = '') {
    return `${name} ${desc}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ' ');
}

function suggestSuperCategoryIcon(name = '', desc = '') {
    const source = normalizeSuperCategoryIconSource(name, desc);
    if (source) {
        const match = SUPER_CATEGORY_ICON_RULES.find((rule) =>
            rule.terms.some((term) => source.includes(normalizeSuperCategoryIconSource(term)))
        );
        if (match?.icon) return match.icon;
    }
    return DEFAULT_SUPER_CATEGORY_ICON;
}

function updateSuperCategoryIconPreview(icon = '') {
    const normalized = String(icon || '').trim() || DEFAULT_SUPER_CATEGORY_ICON;
    const previewGlyph = document.getElementById('superIconPreviewGlyph');
    const previewTitle = document.getElementById('superIconPreviewTitle');
    const previewNote = document.getElementById('superIconPreviewNote');
    const preset = getSuperCategoryIconPresetMeta(normalized);

    if (previewGlyph) previewGlyph.textContent = normalized;
    if (previewTitle) {
        previewTitle.textContent = preset
            ? `${preset.label} icon`
            : 'Custom fallback icon';
    }
    if (previewNote) {
        previewNote.textContent = preset
            ? 'Used in the builder, structure lists, and quick menu cues.'
            : 'Custom icon kept for this group. Use it only when the quick picks do not fit.';
    }

    const picker = document.getElementById('superCategoryIconPicker');
    if (picker) {
        picker.querySelectorAll('.super-icon-picker-btn').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.icon === normalized);
            button.setAttribute('aria-selected', button.dataset.icon === normalized ? 'true' : 'false');
        });
    }

    const manualDisclosure = document.querySelector('.super-icon-manual');
    if (manualDisclosure) {
        manualDisclosure.open = !preset;
    }
}

function applySuperCategoryIcon(icon, options = {}) {
    const {
        manual = false,
        dispatch = false
    } = options;
    const input = document.getElementById('scEmoji');
    if (!input) return;

    const normalized = String(icon || '').trim() || DEFAULT_SUPER_CATEGORY_ICON;
    input.value = normalized;
    superCategoryIconManuallyChosen = Boolean(manual);
    updateSuperCategoryIconPreview(normalized);
    refreshMenuCrudFormUx('superCatForm');

    if (dispatch) {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function renderSuperCategoryIconPicker(selectedIcon = DEFAULT_SUPER_CATEGORY_ICON) {
    const picker = document.getElementById('superCategoryIconPicker');
    if (!picker) return;
    const normalized = String(selectedIcon || '').trim() || DEFAULT_SUPER_CATEGORY_ICON;
    picker.innerHTML = SUPER_CATEGORY_ICON_PRESETS.map((entry) => `
        <button
            type="button"
            class="super-icon-picker-btn${entry.icon === normalized ? ' is-active' : ''}"
            data-icon="${escapeHtmlAttr(entry.icon)}"
            aria-pressed="${entry.icon === normalized ? 'true' : 'false'}"
            aria-selected="${entry.icon === normalized ? 'true' : 'false'}"
            title="${escapeHtmlAttr(entry.label)}"
        >
            <span class="super-icon-picker-emoji">${escapeHtml(entry.icon)}</span>
            <span class="super-icon-picker-label">${escapeHtml(entry.label)}</span>
        </button>
    `).join('');

    picker.querySelectorAll('.super-icon-picker-btn').forEach((button) => {
        button.addEventListener('click', () => {
            applySuperCategoryIcon(button.dataset.icon || DEFAULT_SUPER_CATEGORY_ICON, {
                manual: true,
                dispatch: true
            });
        });
    });

    updateSuperCategoryIconPreview(normalized);
}

function clearActiveImporterPollHandle() {
    if (activeImporterPollHandle) {
        clearTimeout(activeImporterPollHandle);
        activeImporterPollHandle = 0;
    }
}

function persistActiveImporterJob(jobId = '') {
    try {
        if (!jobId) {
            window.sessionStorage.removeItem(ADMIN_IMPORTER_ACTIVE_JOB_KEY);
            return;
        }
        window.sessionStorage.setItem(ADMIN_IMPORTER_ACTIVE_JOB_KEY, String(jobId));
    } catch (_error) {
        // Ignore storage errors; importer still works in-memory.
    }
}

function getPersistedActiveImporterJob() {
    try {
        return window.sessionStorage.getItem(ADMIN_IMPORTER_ACTIVE_JOB_KEY) || '';
    } catch (_error) {
        return '';
    }
}

function setAdminTaskOverlay(state = null) {
    const overlayEl = document.getElementById('adminTaskOverlay');
    const badgeEl = document.getElementById('adminTaskBadge');
    const titleEl = document.getElementById('adminTaskTitle');
    const copyEl = document.getElementById('adminTaskCopy');
    const fillEl = document.getElementById('adminTaskProgressFill');
    const stageEl = document.getElementById('adminTaskStage');
    const hintEl = document.getElementById('adminTaskHint');
    const active = Boolean(state);

    if (overlayEl) {
        overlayEl.hidden = !active;
    }
    document.body.classList.toggle('admin-task-busy', active);
    document.documentElement.classList.toggle('admin-task-busy', active);

    if (!active) {
        if (fillEl) fillEl.style.width = '0%';
        return;
    }

    const progress = Math.max(0, Math.min(100, Number(state.progress) || 0));
    if (badgeEl) badgeEl.textContent = state.badge || 'Working';
    if (titleEl) titleEl.textContent = state.title || 'Please wait';
    if (copyEl) copyEl.textContent = state.copy || 'The admin is finishing a long-running task. Keep this page open.';
    if (fillEl) fillEl.style.width = `${progress}%`;
    if (stageEl) stageEl.textContent = state.stage || `${progress}% complete`;
    if (hintEl) hintEl.textContent = state.hint || 'This screen is temporarily locked.';
}

function setImportStudioControlsBusy(active) {
    importStudioBusy = Boolean(active);
    const menuFilesEl = document.getElementById('importStudioMenuFiles');
    const generateBtn = document.querySelector('#data-tools .tool-actions .primary-btn');
    const copyBtn = document.getElementById('copyImporterDraftJsonBtn');
    const applyMenuBtn = document.getElementById('applyImporterMenuOnlyBtn');
    const applyStructureBtn = document.getElementById('applyImporterStructureBtn');

    if (menuFilesEl) menuFilesEl.disabled = importStudioBusy;
    if (generateBtn) generateBtn.disabled = importStudioBusy;
    if (copyBtn) copyBtn.disabled = importStudioBusy || !lastImporterDraft;
    if (applyMenuBtn && importStudioBusy) applyMenuBtn.disabled = true;
    if (applyStructureBtn && importStudioBusy) applyStructureBtn.disabled = true;
    if (!importStudioBusy && typeof renderImporterDraftOutputs === 'function') {
        renderImporterDraftOutputs(lastImporterDraft);
    }
}

function setImportStudioStatus(state = null) {
    const cardEl = document.getElementById('importStudioStatusCard');
    const badgeEl = document.getElementById('importStudioStatusBadge');
    const metaEl = document.getElementById('importStudioStatusMeta');
    const titleEl = document.getElementById('importStudioStatusTitle');
    const copyEl = document.getElementById('importStudioStatusCopy');
    const fillEl = document.getElementById('importStudioStatusFill');

    if (!cardEl) return;
    if (!state) {
        cardEl.hidden = true;
        cardEl.classList.remove('is-complete', 'is-error');
        if (fillEl) fillEl.style.width = '0%';
        renderImportStudioStageTimeline(null);
        return;
    }

    const progress = Math.max(0, Math.min(100, Number(state.progress) || 0));
    cardEl.hidden = false;
    cardEl.classList.toggle('is-complete', state.status === 'succeeded');
    cardEl.classList.toggle('is-error', state.status === 'failed');
    if (badgeEl) badgeEl.textContent = state.badge || (state.status === 'failed' ? 'Import failed' : state.status === 'succeeded' ? 'Draft ready' : 'Import in progress');
    if (metaEl) metaEl.textContent = state.meta || `${progress}% complete`;
    if (titleEl) titleEl.textContent = state.title || 'Preparing import';
    if (copyEl) copyEl.textContent = state.copy || 'Keep this tab open while the draft is prepared.';
    if (fillEl) fillEl.style.width = `${progress}%`;
    renderImportStudioStageTimeline(state);
}

function getImportStudioPhaseKey(state = {}) {
    const stageKey = String(state.stageKey || '').trim().toLowerCase();
    const signal = `${state.badge || ''} ${state.title || ''} ${state.meta || ''}`.toLowerCase();

    if (signal.includes('publish')) return 'publish';
    if (signal.includes('upload')) return 'upload';
    if (stageKey === 'succeeded' || signal.includes('draft ready') || signal.includes('menu draft generated')) return 'review';
    if (['queued', 'prepare_input', 'source_extraction', 'source_structuring', 'direct_structuring', 'finalize'].includes(stageKey)) return 'extract';
    if (signal.includes('extract') || signal.includes('structur') || signal.includes('import')) return 'extract';
    if (state.status === 'failed') return signal.includes('publish') ? 'publish' : 'extract';
    return 'upload';
}

function renderImportStudioStageTimeline(state = null) {
    const timelineEl = document.getElementById('importStudioStageTimeline');
    if (!timelineEl) return;
    if (!state) {
        timelineEl.innerHTML = '';
        return;
    }

    const phases = [
        { key: 'upload', label: 'Upload', copy: 'Collect the files' },
        { key: 'extract', label: 'Extract', copy: 'Read and structure the menu' },
        { key: 'review', label: 'Review', copy: 'Check draft quality' },
        { key: 'publish', label: 'Publish', copy: 'Write to live data' }
    ];
    const activePhase = getImportStudioPhaseKey(state);
    const activeIndex = Math.max(0, phases.findIndex((phase) => phase.key === activePhase));

    timelineEl.innerHTML = phases.map((phase, index) => {
        let status = 'pending';
        if (state.status === 'failed' && index === activeIndex) {
            status = 'failed';
        } else if (index < activeIndex) {
            status = 'ready';
        } else if (index === activeIndex) {
            status = state.status === 'succeeded'
                ? (activePhase === 'review' && phase.key === 'publish' ? 'pending' : 'ready')
                : 'active';
        }

        return `
            <div class="importer-stage-pill is-${status}">
                <strong>${escapeHtml(phase.label)}</strong>
                <span>${escapeHtml(phase.copy)}</span>
            </div>
        `;
    }).join('');
}

function getImporterConfidenceTone(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'high') return 'high';
    if (normalized === 'medium') return 'medium';
    if (normalized === 'low') return 'low';
    return 'unknown';
}

function renderImporterIssuePanelMarkup({ title, badge, tone, copy, items, emptyCopy }) {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    return `
        <section class="importer-issue-panel is-${escapeHtml(tone || 'info')}">
            <div class="importer-issue-head">
                <div>
                    <h6>${escapeHtml(title)}</h6>
                    <p class="importer-issue-copy">${escapeHtml(copy || '')}</p>
                </div>
                <span class="importer-issue-badge">${escapeHtml(badge || '')}</span>
            </div>
            ${safeItems.length
                ? `<ul class="importer-issue-list">${safeItems.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>`
                : `<p class="importer-issue-empty">${escapeHtml(emptyCopy || 'Nothing to review here.')}</p>`}
        </section>
    `;
}

function renderImporterImpactPanel(report, draft, meta = {}) {
    const impactEl = document.getElementById('importStudioImpactPanel');
    if (!impactEl) return;
    if (!report || !draft) {
        impactEl.innerHTML = `
            <h5>Publish decision</h5>
            <p class="importer-impact-copy">Create a draft first to see what will change before anything goes live.</p>
        `;
        return;
    }

    const review = draft.review || {};
    const confidence = review.confidence || {};
    const menuOnlyState = report.canApplyMenuOnly ? 'is-ready' : report.blockers.length ? 'is-block' : 'is-warn';
    const structureState = report.canApplyMenuStructure ? 'is-ready' : report.blockers.length ? 'is-block' : 'is-warn';

    impactEl.innerHTML = `
        <h5>Publish decision</h5>
        <p class="importer-impact-copy">This draft stays inside admin until you publish it. Use this panel to choose the safest scope.</p>
        <ul class="importer-impact-list">
            <li>
                <div>
                    <strong>Menu data only</strong>
                    <span>Replaces dish data without changing category structure.</span>
                </div>
                <span class="importer-impact-state ${menuOnlyState}">${report.canApplyMenuOnly ? 'Ready' : report.blockers.length ? 'Blocked' : 'Review'}</span>
            </li>
            <li>
                <div>
                    <strong>Menu + structure</strong>
                    <span>Also replaces imported categories and super categories.</span>
                </div>
                <span class="importer-impact-state ${structureState}">${report.canApplyMenuStructure ? 'Ready' : report.blockers.length ? 'Blocked' : 'Review'}</span>
            </li>
            <li>
                <div>
                    <strong>Library matches</strong>
                    <span>Existing media auto-matched into the draft.</span>
                </div>
                <span class="importer-impact-state">${escapeHtml(String(Number(meta.mediaLibraryMatches) || 0))}</span>
            </li>
            <li>
                <div>
                    <strong>Confidence mix</strong>
                    <span>Extraction ${escapeHtml(confidence.menuExtraction || 'unknown')} / Translation ${escapeHtml(confidence.translations || 'unknown')} / Media ${escapeHtml(confidence.mediaMatching || 'unknown')}</span>
                </div>
                <span class="importer-impact-state">${escapeHtml(meta.jobId ? `Job ${meta.jobId}` : 'Draft')}</span>
            </li>
        </ul>
    `;
}

function buildImporterConfidencePillsMarkup(review = {}) {
    const confidence = review.confidence || {};
    const entries = [
        { label: 'Extraction', value: confidence.menuExtraction || 'unknown' },
        { label: 'Translation', value: confidence.translations || 'unknown' },
        { label: 'Media', value: confidence.mediaMatching || 'unknown' }
    ];

    return entries.map((entry) => `
        <span class="importer-confidence-pill is-${escapeHtml(getImporterConfidenceTone(entry.value))}">
            ${escapeHtml(entry.label)} · ${escapeHtml(String(entry.value))}
        </span>
    `).join('');
}

function buildImporterIssuePanelsMarkup(report, untranslatedItems = []) {
    const translationNotes = [];
    if ((report?.missingTranslationCount || 0) > 0) {
        translationNotes.push(`${report.missingTranslationCount} item(s) still miss one or more translated names.`);
    }
    if ((report?.weakTranslationCount || 0) > 0) {
        translationNotes.push(`${report.weakTranslationCount} item(s) still look like fallback translations and should be reviewed manually.`);
    }
    if ((report?.missingDescriptionCount || 0) > 0) {
        translationNotes.push(`${report.missingDescriptionCount} item(s) still miss a description.`);
    }

    const untranslatedPreview = Array.isArray(untranslatedItems)
        ? untranslatedItems.filter(Boolean).slice(0, 6)
        : [];

    return [
        renderImporterIssuePanelMarkup({
            title: 'Blockers',
            badge: report?.blockers?.length ? `${report.blockers.length} blocking` : 'Clear',
            tone: report?.blockers?.length ? 'block' : 'info',
            copy: report?.blockers?.length
                ? 'These issues should be resolved before anything is published live.'
                : 'No hard blockers were detected in the current draft.',
            items: report?.blockers || [],
            emptyCopy: 'No blockers are holding this draft back right now.'
        }),
        renderImporterIssuePanelMarkup({
            title: 'Warnings',
            badge: report?.warnings?.length ? `${report.warnings.length} review` : 'Stable',
            tone: report?.warnings?.length ? 'warn' : 'info',
            copy: report?.warnings?.length
                ? 'These are review signals, not hard stops. Read them before you publish.'
                : 'No secondary warnings were detected.',
            items: report?.warnings || [],
            emptyCopy: 'No warnings were raised for this draft.'
        }),
        renderImporterIssuePanelMarkup({
            title: 'Translation review',
            badge: untranslatedPreview.length || translationNotes.length ? 'Check labels' : 'Covered',
            tone: untranslatedPreview.length || translationNotes.length ? 'warn' : 'info',
            copy: untranslatedPreview.length || translationNotes.length
                ? 'The importer filled the language set, but these items still deserve a manual look.'
                : 'Translations and descriptions look complete at this stage.',
            items: [...translationNotes, ...untranslatedPreview.map((name) => `Review labels for ${name}.`)],
            emptyCopy: 'No translation cleanup is recommended.'
        })
    ].join('');
}

function applyImportStudioProgress(state = null, options = {}) {
    setImportStudioStatus(state);
    setImportStudioControlsBusy(Boolean(state) && state.status !== 'succeeded' && state.status !== 'failed');
    if (options.overlay !== false) {
        setAdminTaskOverlay(state ? {
            badge: state.badge || 'Import in progress',
            title: state.title,
            copy: state.copy,
            progress: state.progress,
            stage: state.meta,
            hint: state.hint || 'Keep this page open while extraction and structuring finish.'
        } : null);
    }
}

function t(key, fallback = '', vars = {}) {
    if (typeof window.formatTranslation === 'function') {
        return window.formatTranslation(key, fallback, vars);
    }
    return fallback;
}

window.resolveAdminActionDialog = function (confirmed = false) {
    const dialog = document.getElementById('adminActionDialog');
    if (dialog) {
        if (typeof dialog.close === 'function' && dialog.open) {
            dialog.close();
        } else {
            dialog.removeAttribute('open');
        }
    }
    if (adminActionDialogResolver) {
        const resolve = adminActionDialogResolver;
        adminActionDialogResolver = null;
        resolve(Boolean(confirmed));
    }
};

function openAdminActionDialog(options = {}) {
    const dialog = document.getElementById('adminActionDialog');
    const card = document.getElementById('adminActionCard');
    const kicker = document.getElementById('adminActionKicker');
    const title = document.getElementById('adminActionTitle');
    const copy = document.getElementById('adminActionCopy');
    const note = document.getElementById('adminActionNote');
    const cancelBtn = document.getElementById('adminActionCancel');
    const confirmBtn = document.getElementById('adminActionConfirm');
    if (!dialog || !card || !kicker || !title || !copy || !note || !cancelBtn || !confirmBtn) {
        return Promise.resolve(Boolean(options.fallbackResult));
    }

    if (adminActionDialogResolver) {
        const resolve = adminActionDialogResolver;
        adminActionDialogResolver = null;
        resolve(false);
    }

    const mode = options.mode === 'notice' ? 'notice' : 'confirm';
    const tone = options.tone === 'danger' ? 'danger' : 'default';
    card.classList.toggle('is-danger', tone === 'danger');
    kicker.textContent = options.kicker || (mode === 'notice' ? 'Please note' : 'Please confirm');
    title.textContent = options.title || (mode === 'notice' ? 'Update' : 'Are you sure?');
    copy.textContent = options.copy || '';
    note.hidden = !options.note;
    note.textContent = options.note || '';
    cancelBtn.hidden = mode === 'notice';
    cancelBtn.textContent = options.cancelLabel || 'Cancel';
    confirmBtn.textContent = options.confirmLabel || (mode === 'notice' ? 'OK' : 'Continue');
    confirmBtn.classList.toggle('is-danger', tone === 'danger');

    return new Promise((resolve) => {
        adminActionDialogResolver = resolve;
        if (typeof dialog.showModal === 'function') {
            if (!dialog.open) dialog.showModal();
        } else {
            dialog.setAttribute('open', 'open');
        }
    });
}

function showAdminConfirm(options = {}) {
    return openAdminActionDialog({ ...options, mode: 'confirm' });
}

function showAdminNotice(options = {}) {
    return openAdminActionDialog({ ...options, mode: 'notice', fallbackResult: true });
}

function getAdminPwaLanguage() {
    const lang = window.currentLang || window.getStoredLanguage?.() || document.documentElement.lang || 'fr';
    return ['fr', 'en', 'ar'].includes(lang) ? lang : 'fr';
}

function getAdminPwaCopy() {
    return ADMIN_PWA_COPY[getAdminPwaLanguage()] || ADMIN_PWA_COPY.fr;
}

function getAdminPwaShellCopy() {
    return ADMIN_PWA_SHELL_COPY[getAdminPwaLanguage()] || ADMIN_PWA_SHELL_COPY.fr;
}

function getAdminConnectionCopy() {
    const lang = getAdminPwaLanguage();
    if (lang === 'ar') {
        return {
            online: 'متصل',
            offline: 'غير متصل',
            onlineToast: 'تمت استعادة الاتصال.',
            offlineToast: 'أنت الآن دون اتصال. قد لا يتم حفظ التغييرات حتى يعود الاتصال.'
        };
    }
    if (lang === 'en') {
        return {
            online: 'Online',
            offline: 'Offline',
            onlineToast: 'Connection restored.',
            offlineToast: 'You are offline. Changes may not save until the connection returns.'
        };
    }
    return {
        online: 'En ligne',
        offline: 'Hors ligne',
        onlineToast: 'Connexion rétablie.',
        offlineToast: "Vous êtes hors ligne. Les changements ne seront peut-être pas enregistrés tant que la connexion n'est pas revenue."
    };
}

function getAdminShellSectionLabel(sectionId) {
    const topLevelSection = resolveTopLevelSection(sectionId || 'menu');
    const button = topLevelSection === 'branding'
        ? document.getElementById('brandingNavBtn')
        : topLevelSection === 'info'
            ? document.getElementById('infoNavBtn')
            : topLevelSection === 'data-tools'
                ? document.getElementById('sellerToolsNavBtn')
                : document.getElementById('menuNavBtn');
    if (!button) return '';
    return (button.textContent || '').replace(/\s+/g, ' ').trim();
}

function isIosStandaloneCapable() {
    const ua = window.navigator.userAgent || '';
    return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

function isAndroidLike() {
    const ua = window.navigator.userAgent || '';
    return /android/i.test(ua);
}

function isAdminStandaloneMode() {
    const url = new URL(window.location.href);
    const launchedFromPwa = (url.searchParams.get('source') || '').trim().toLowerCase() === 'pwa';
    const displayModeStandalone = typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)').matches
        : false;
    return displayModeStandalone || window.navigator.standalone === true || launchedFromPwa;
}

function getRequestedAdminSection() {
    const url = new URL(window.location.href);
    const sectionParam = (url.searchParams.get('section') || '').trim();
    const hashSection = (url.hash || '').replace(/^#/, '').trim();
    const candidate = sectionParam || hashSection;
    return candidate || '';
}

function getSavedAdminSection() {
    try {
        return window.localStorage.getItem(ADMIN_APP_SECTION_KEY) || '';
    } catch (_error) {
        return '';
    }
}

function storeAdminSection(sectionId) {
    if (!sectionId) return;
    try {
        window.localStorage.setItem(ADMIN_APP_SECTION_KEY, sectionId);
    } catch (_error) {
        // Ignore private mode or storage restrictions.
    }
}

function normalizeAdminSectionTarget(sectionId) {
    if (!sectionId) return 'menu';
    if (isMenuWorkspaceSection(sectionId) || isInfoSection(sectionId) || isBrandingSection(sectionId)) {
        return sectionId;
    }
    if (sectionId === 'data-tools' || sectionId === 'menu' || sectionId === 'info' || sectionId === 'branding') {
        return sectionId;
    }
    return 'menu';
}

function getAdminInstallFallbackCopy() {
    const text = getAdminPwaCopy();
    if (deferredAdminInstallPrompt) {
        return {
            copy: text.copy,
            button: text.button
        };
    }
    if (isIosStandaloneCapable()) {
        return {
            copy: text.iosCopy,
            button: text.iosButton
        };
    }
    if (isAndroidLike()) {
        return {
            copy: getAdminPwaLanguage() === 'fr'
                ? "Sur Android, ouvrez le menu du navigateur puis choisissez Installer l'application ou Ajouter à l'écran d'accueil."
                : getAdminPwaLanguage() === 'ar'
                    ? 'على Android افتح قائمة المتصفح ثم اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية.'
                    : 'On Android, open the browser menu and choose Install app or Add to Home Screen.',
            button: getAdminPwaLanguage() === 'fr'
                ? 'Comment installer'
                : getAdminPwaLanguage() === 'ar'
                    ? 'طريقة التثبيت'
                    : 'How to install'
        };
    }
    return {
        copy: text.desktopHint,
        button: getAdminPwaLanguage() === 'fr'
            ? 'Voir les instructions'
            : getAdminPwaLanguage() === 'ar'
                ? 'عرض التعليمات'
                : 'View instructions'
    };
}

function syncAdminAppShell(activeSection = '') {
    if (!document.body) return;
    const standalone = isAdminStandaloneMode();
    document.body.classList.toggle('admin-standalone', standalone);
    document.body.classList.toggle('admin-browser-shell', !standalone);

    const stateBadge = document.getElementById('adminMobileStateBadge');
    if (stateBadge) {
        const shellCopy = getAdminPwaShellCopy();
        const isAuthenticated = document.body.classList.contains('is-authenticated');
        const sectionLabel = isAuthenticated ? getAdminShellSectionLabel(activeSection || getRequestedAdminSection() || getSavedAdminSection() || 'menu') : '';
        stateBadge.textContent = sectionLabel || (standalone ? shellCopy.standalone : shellCopy.browser);
    }

    syncAdminMobileSaveBadge();
    syncAdminConnectionBadge();
}

function syncAdminMobileSaveBadge() {
    const badge = document.getElementById('adminMobileSaveBadge');
    if (!badge) return;

    const labelMap = {
        idle: t('admin.save_state.idle_label', 'Ready'),
        saving: t('admin.save_state.saving_label', 'Saving'),
        success: t('admin.save_state.success_label', 'Saved'),
        error: t('admin.save_state.error_label', 'Attention')
    };
    const stateType = adminSaveState.type || 'idle';
    badge.classList.remove('is-idle', 'is-saving', 'is-success', 'is-error');
    badge.classList.add(`is-${stateType}`);
    badge.textContent = labelMap[stateType] || labelMap.idle;
}

function syncAdminConnectionBadge() {
    const badge = document.getElementById('adminMobileConnectionBadge');
    if (!badge) return;
    const copy = getAdminConnectionCopy();
    const online = navigator.onLine !== false;
    badge.classList.remove('is-online', 'is-offline');
    badge.classList.add(online ? 'is-online' : 'is-offline');
    badge.textContent = online ? copy.online : copy.offline;
}

function updateAdminInstallUi() {
    const card = document.getElementById('adminInstallCard');
    const sidebarBtn = document.getElementById('adminSidebarInstallBtn');
    const label = document.getElementById('adminInstallLabel');
    const title = document.getElementById('adminInstallTitle');
    const copy = document.getElementById('adminInstallCopy');
    const button = document.getElementById('adminInstallBtn');

    if (!card || !sidebarBtn || !label || !title || !copy || !button) return;

    const text = getAdminPwaCopy();
    const installed = isAdminStandaloneMode();
    const fallback = getAdminInstallFallbackCopy();

    label.textContent = text.label;
    title.textContent = text.title;
    copy.textContent = fallback.copy;
    button.textContent = fallback.button;
    sidebarBtn.textContent = text.sidebarButton;

    card.hidden = installed;
    sidebarBtn.hidden = installed;
    syncAdminAppShell();
}

async function registerAdminPwa() {
    if (!('serviceWorker' in navigator)) {
        updateAdminInstallUi();
        return;
    }

    const isSecure = window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!isSecure) {
        updateAdminInstallUi();
        return;
    }

    try {
        await navigator.serviceWorker.register('/admin-sw.js', { scope: '/' });
    } catch (error) {
        console.warn('[ADMIN PWA] Service worker registration failed:', error);
    }

    updateAdminInstallUi();
}

// Admin category filter state
let currentAdminCategory = typeof window.getStoredAdminCategoryFilter === 'function'
    ? window.getStoredAdminCategoryFilter()
    : 'All';

const CONTENT_EDITOR_LANGUAGES = ['fr', 'en', 'ar'];
const LANDING_CONTENT_FIELDS = [
    { key: 'hero_sub1', label: 'Hero Slide 1 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title1', label: 'Hero Slide 1 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_sub2', label: 'Hero Slide 2 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title2', label: 'Hero Slide 2 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_desc2', label: 'Hero Slide 2 - Description', type: 'textarea', hint: 'Short supporting sentence for the second slide.' },
    { key: 'hero_sub3', label: 'Hero Slide 3 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title3', label: 'Hero Slide 3 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_desc3', label: 'Hero Slide 3 - Description', type: 'textarea', hint: 'Short supporting sentence for the third slide.' },
    { key: 'about_p1', label: 'About - Paragraph 1', type: 'textarea', hint: 'Opening paragraph for your restaurant story.' },
    { key: 'about_p2', label: 'About - Paragraph 2', type: 'textarea', hint: 'Details about quality, style, or philosophy.' },
    { key: 'about_p3', label: 'About - Paragraph 3', type: 'textarea', hint: 'Closing paragraph and promise to customers.' },
    { key: 'event_birthday', label: 'Events - Birthday Title', type: 'text', hint: 'Title for the first event/service card.' },
    { key: 'event_birthday_desc', label: 'Events - Birthday Description', type: 'textarea', hint: 'Description for the first event/service card.' },
    { key: 'event_family', label: 'Events - Family Title', type: 'text', hint: 'Title for the second event/service card.' },
    { key: 'event_family_desc', label: 'Events - Family Description', type: 'textarea', hint: 'Description for the second event/service card.' },
    { key: 'event_corporate', label: 'Events - Corporate Title', type: 'text', hint: 'Title for the third event/service card.' },
    { key: 'event_corporate_desc', label: 'Events - Corporate Description', type: 'textarea', hint: 'Description for the third event/service card.' },
    { key: 'event_party', label: 'Events - Private Party Title', type: 'text', hint: 'Title for the fourth event/service card.' },
    { key: 'event_party_desc', label: 'Events - Private Party Description', type: 'textarea', hint: 'Description for the fourth event/service card.' },
    { key: 'events_cta_text', label: 'Events - CTA Text', type: 'textarea', hint: 'Closing sentence before the contact button.' },
    { key: 'footer_note', label: 'Footer - Note', type: 'textarea', hint: 'Small footer sentence that reinforces the restaurant identity.' },
    { key: 'footer_rights', label: 'Footer - Rights Text', type: 'text', hint: 'Short legal/footer rights sentence shown after the year and restaurant name.' }
];
const MENU_ITEM_TRANSLATION_LANGUAGES = [
    { code: 'fr', label: 'French' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' }
];
const GUEST_EXPERIENCE_PAYMENT_FIELDS = {
    cash: 'lpPayCash',
    tpe: 'lpPayTpe'
};
const GUEST_EXPERIENCE_FACILITY_FIELDS = {
    wifi: 'lpFacilityWifi',
    accessible: 'lpFacilityAccessible',
    parking: 'lpFacilityParking',
    terrace: 'lpFacilityTerrace',
    family: 'lpFacilityFamily'
};
const SECTION_VISIBILITY_FIELDS = {
    about: 'lpSectionAbout',
    payments: 'lpSectionPayments',
    events: 'lpSectionEvents',
    gallery: 'lpSectionGallery',
    hours: 'lpSectionHours',
    contact: 'lpSectionContact'
};
const INFO_SECTION_IDS = ['info', 'landing', 'wifi', 'hours', 'security'];
const BRANDING_SECTION_IDS = ['branding', 'gallery'];
const MENU_WORKSPACE_SECTION_IDS = ['menu', 'categories', 'supercategories'];
const MENU_WORKSPACE_STEPS = ['supercategories', 'categories', 'items'];
const BRANDING_WORKSPACE_TABS = ['identity', 'homepage', 'gallery'];
const ADMIN_SECTION_ORDER_KEYS = ['about', 'payments', 'events', 'gallery', 'hours', 'contact'];
const SECTION_ORDER_LABELS = {
    about: 'admin.section_order.about',
    payments: 'admin.section_order.payments',
    events: 'admin.section_order.events',
    gallery: 'admin.section_order.gallery',
    hours: 'admin.section_order.hours',
    contact: 'admin.section_order.contact'
};
let landingSectionOrderDraft = [...ADMIN_SECTION_ORDER_KEYS];
let currentMenuWorkspaceStep = 'supercategories';
let currentBrandingWorkspaceTab = 'identity';
let menuBuilderSelectedSuperCategoryId = '';
let menuBuilderSelectedCategoryKey = '';
let menuCrudDirty = false;
let menuCrudBaselineState = '';
let menuCrudTrackedFormId = '';
const PRESET_THEME_TOKENS = {
    fast_food: {
        presetId: 'fast_food',
        heroImage: 'images/hero-fast.svg',
        surfaceColor: '#FFF5ED',
        surfaceMuted: '#F8E7D8',
        textColor: '#251715',
        textMuted: '#735E56',
        menuBackground: '#140F12',
        menuSurface: '#21181D'
    },
    cafe: {
        presetId: 'cafe',
        heroImage: 'images/hero-cafe.svg',
        surfaceColor: '#FBF5EE',
        surfaceMuted: '#EFE3D4',
        textColor: '#2B211B',
        textMuted: '#75675E',
        menuBackground: '#171311',
        menuSurface: '#241C18'
    },
    traditional: {
        presetId: 'traditional',
        heroImage: 'images/hero-traditional.svg',
        surfaceColor: '#FBF4EA',
        surfaceMuted: '#F1E2CD',
        textColor: '#291C18',
        textMuted: '#78655A',
        menuBackground: '#151112',
        menuSurface: '#24191A'
    }
};

function getPresetThemePack(presetId) {
    if (typeof window.getBrandPresetConfig === 'function') {
        return window.getBrandPresetConfig(presetId);
    }
    return PRESET_THEME_TOKENS[presetId] || PRESET_THEME_TOKENS.fast_food;
}

function repairAdminMojibake(value) {
    let result = typeof value === 'string' ? value : '';
    for (let i = 0; i < 2; i += 1) {
        if (!/[ÃØÙðâ]/.test(result)) break;
        try {
            const repaired = decodeURIComponent(escape(result));
            if (!repaired || repaired === result) break;
            result = repaired;
        } catch (_error) {
            break;
        }
    }
    return result;
}

function normalizeAdminPresetStrings(input) {
    if (typeof input === 'string') return repairAdminMojibake(input);
    if (Array.isArray(input)) return input.map((entry) => normalizeAdminPresetStrings(entry));
    if (!input || typeof input !== 'object') return input;

    return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, normalizeAdminPresetStrings(value)])
    );
}

const ONBOARDING_PRESETS = normalizeAdminPresetStrings({
    fast_food: {
        branding: {
            logoMark: '🍔',
            primaryColor: '#c62828',
            secondaryColor: '#ff8f00',
            accentColor: '#ffd54f',
            tagline: 'Quick service, generous plates, and an easy-to-love local concept.'
        },
        guestExperience: {
            paymentMethods: ['cash', 'tpe'],
            facilities: ['wifi', 'terrace']
        },
        sectionVisibility: {
            about: true,
            payments: true,
            events: false,
            gallery: true,
            hours: true,
            contact: true
        },
        sectionOrder: ['about', 'payments', 'gallery', 'hours', 'contact', 'events'],
        contentTranslations: {
            fr: {
                hero_sub1: 'Une adresse pour',
                hero_title1: 'FAIM <span>BIEN SERVIE</span>',
                hero_sub2: 'Découvrez les',
                hero_title2: 'INCONTOURNABLES <span>{{shortName}}</span>',
                hero_desc2: 'Des recettes généreuses, rapides et pensées pour revenir souvent.',
                hero_sub3: 'Sur place, à emporter',
                hero_title3: 'CHAUD <span>ET RAPIDE</span>',
                hero_desc3: 'Une expérience simple, gourmande et efficace toute la journée.',
                about_p1: '{{restaurantName}} propose une cuisine réconfortante, bien exécutée et facile à recommander.',
                about_p2: 'Nous misons sur des recettes lisibles, des portions généreuses et un service régulier pour toutes les visites du quotidien.',
                about_p3: 'Notre ambition est simple : devenir une adresse fiable pour manger vite, bien, et avec plaisir.',
                event_birthday: 'Anniversaires',
                event_birthday_desc: 'Un format simple et convivial pour les petits groupes.',
                event_family: 'Repas entre amis',
                event_family_desc: 'Des plats à partager et une ambiance décontractée.',
                event_corporate: 'Commandes de groupe',
                event_corporate_desc: 'Une solution rapide pour les équipes et les commandes en volume.',
                event_party: 'Soirées privées',
                event_party_desc: 'Un point de rencontre gourmand pour vos moments informels.',
                events_cta_text: 'Besoin d’un format groupe ou d’une privatisation légère ? Contactez-nous.',
                footer_note: 'Cuisine généreuse, service rapide et adresse facile à recommander.'
            },
            en: {
                hero_sub1: 'A place for',
                hero_title1: 'HUNGER <span>DONE RIGHT</span>',
                hero_sub2: 'Discover the',
                hero_title2: '{{shortName}} <span>FAVORITES</span>',
                hero_desc2: 'Generous recipes, quick service, and a concept built for repeat visits.',
                hero_sub3: 'Dine in or takeaway',
                hero_title3: 'HOT <span>AND FAST</span>',
                hero_desc3: 'A simple, satisfying, all-day food experience.',
                about_p1: '{{restaurantName}} is built around approachable favorites that are easy to enjoy and easy to recommend.',
                about_p2: 'We focus on clear recipes, generous portions, and consistent service for everyday visits.',
                about_p3: 'The goal is simple: become a reliable address when people want something fast, warm, and satisfying.',
                event_birthday: 'Birthdays',
                event_birthday_desc: 'A simple and friendly format for small groups.',
                event_family: 'Friends & family meals',
                event_family_desc: 'Shareable dishes in a relaxed atmosphere.',
                event_corporate: 'Group orders',
                event_corporate_desc: 'A fast option for teams and larger orders.',
                event_party: 'Private nights',
                event_party_desc: 'A casual food spot for informal celebrations.',
                events_cta_text: 'Need a group format or light privatization? Contact us.',
                footer_note: 'Generous dishes, quick service, and a local address worth revisiting.'
            },
            ar: {
                hero_sub1: 'Ø¹Ù†ÙˆØ§Ù† Ù…Ù† Ø£Ø¬Ù„',
                hero_title1: 'Ø§Ù„Ø¬ÙˆØ¹ <span>Ø§Ù„Ù…Ø´Ø¨ÙŽØ¹</span>',
                hero_sub2: 'Ø§ÙƒØªØ´Ù',
                hero_title2: 'Ù…ÙØ¶Ù„Ø§Øª <span>{{shortName}}</span>',
                hero_desc2: 'ÙˆØµÙØ§Øª Ø³Ø®ÙŠØ© ÙˆØ®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØªØ¬Ø±Ø¨Ø© ØªØ´Ø¬Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø¹ÙˆØ¯Ø©.',
                hero_sub3: 'Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø·Ø¹Ù… Ø£Ùˆ Ù„Ù„Ø·Ù„Ø¨',
                hero_title3: 'Ø³Ø§Ø®Ù† <span>ÙˆØ³Ø±ÙŠØ¹</span>',
                hero_desc3: 'ØªØ¬Ø±Ø¨Ø© Ø¨Ø³ÙŠØ·Ø© ÙˆÙ…Ø´Ø¨Ø¹Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„ÙŠÙˆÙ… ÙƒÙ„Ù‡.',
                about_p1: '{{restaurantName}} ÙŠÙ‚Ø¯Ù… Ø£ÙƒÙ„Ø§Øª Ù…Ø±ÙŠØ­Ø© ÙˆØ³Ù‡Ù„Ø© Ø§Ù„ØªÙˆØµÙŠØ© Ø¨Ù‡Ø§ Ù…Ù† Ø£ÙˆÙ„ Ø²ÙŠØ§Ø±Ø©.',
                about_p2: 'Ù†Ø±ÙƒØ² Ø¹Ù„Ù‰ ÙˆØµÙØ§Øª ÙˆØ§Ø¶Ø­Ø© ÙˆØ­ØµØµ Ø³Ø®ÙŠØ© ÙˆØ®Ø¯Ù…Ø© Ù…Ù†ØªØ¸Ù…Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ø²ÙŠØ§Ø±Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©.',
                about_p3: 'Ù‡Ø¯ÙÙ†Ø§ ÙˆØ§Ø¶Ø­: Ø£Ù† Ù†ØµØ¨Ø­ Ø¹Ù†ÙˆØ§Ù†Ø§Ù‹ Ù…ÙˆØ«ÙˆÙ‚Ø§Ù‹ Ù„Ù…Ù† ÙŠØ±ÙŠØ¯ Ø£ÙƒÙ„Ø§Ù‹ Ø³Ø±ÙŠØ¹Ø§Ù‹ ÙˆÙ„Ø°ÙŠØ°Ø§Ù‹ ÙˆÙ…Ø´Ø¨Ø¹Ø§Ù‹.',
                event_birthday: 'Ø£Ø¹ÙŠØ§Ø¯ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯',
                event_birthday_desc: 'ØµÙŠØºØ© Ø¨Ø³ÙŠØ·Ø© ÙˆÙ…Ù…ØªØ¹Ø© Ù„Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„ØµØºÙŠØ±Ø©.',
                event_family: 'Ù„Ù‚Ø§Ø¡Ø§Øª Ø§Ù„Ø£ØµØ¯Ù‚Ø§Ø¡ ÙˆØ§Ù„Ø¹Ø§Ø¦Ù„Ø©',
                event_family_desc: 'Ø£Ø·Ø¨Ø§Ù‚ Ù„Ù„Ù…Ø´Ø§Ø±ÙƒØ© ÙÙŠ Ø£Ø¬ÙˆØ§Ø¡ Ù…Ø±ÙŠØ­Ø©.',
                event_corporate: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª',
                event_corporate_desc: 'Ø­Ù„ Ø³Ø±ÙŠØ¹ Ù„Ù„ÙØ±Ù‚ ÙˆØ§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ÙƒØ¨ÙŠØ±Ø©.',
                event_party: 'Ø£Ù…Ø³ÙŠØ§Øª Ø®Ø§ØµØ©',
                event_party_desc: 'Ù…ÙƒØ§Ù† Ù…Ø±ÙŠØ­ Ù„Ù„Ø§Ø­ØªÙØ§Ù„Ø§Øª ØºÙŠØ± Ø§Ù„Ø±Ø³Ù…ÙŠØ©.',
                events_cta_text: 'Ù‡Ù„ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØµÙŠØºØ© Ø¬Ù…Ø§Ø¹ÙŠØ© Ø£Ùˆ Ø­Ø¬Ø² Ø®ÙÙŠÙØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
                footer_note: 'Ø£ÙƒÙ„ Ø³Ø®ÙŠ ÙˆØ®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØ¹Ù†ÙˆØ§Ù† ÙŠØ³ØªØ­Ù‚ Ø§Ù„Ø²ÙŠØ§Ø±Ø© Ù…Ù† Ø¬Ø¯ÙŠØ¯.'
            }
        }
    },
    cafe: {
        branding: {
            logoMark: 'â˜•',
            primaryColor: '#5d4037',
            secondaryColor: '#c08b5c',
            accentColor: '#f4d6a0',
            tagline: 'Coffee, brunch, and slow moments worth sharing.'
        },
        guestExperience: {
            paymentMethods: ['cash', 'tpe'],
            facilities: ['wifi', 'terrace', 'family']
        },
        sectionVisibility: {
            about: true,
            payments: true,
            events: true,
            gallery: true,
            hours: true,
            contact: true
        },
        sectionOrder: ['about', 'gallery', 'payments', 'events', 'hours', 'contact'],
        contentTranslations: {
            fr: {
                hero_sub1: 'Un lieu pour',
                hero_title1: 'CAFÉ <span>& BRUNCH</span>',
                hero_sub2: 'Savourez les',
                hero_title2: 'INSTANTS <span>{{shortName}}</span>',
                hero_desc2: 'Une adresse chaleureuse pour le café, les douceurs et les rendez-vous du quotidien.',
                hero_sub3: 'Du matin au goûter',
                hero_title3: 'DOUX <span>& SOIGNÉ</span>',
                hero_desc3: 'Des recettes maison et une atmosphère pensée pour prendre son temps.',
                about_p1: '{{restaurantName}} est pensé comme une adresse lumineuse pour le café, le brunch et les pauses qui font du bien.',
                about_p2: 'Nous travaillons une carte simple, soignée et accueillante, idéale pour un rendez-vous, une pause ou un moment à partager.',
                about_p3: 'Notre promesse : une expérience douce, régulière et agréable, du premier café au dernier dessert.',
                event_birthday: 'Brunchs privés',
                event_birthday_desc: 'Un format convivial pour les matinées et anniversaires en petit comité.',
                event_family: 'Rencontres entre proches',
                event_family_desc: 'Un lieu calme et chaleureux pour se retrouver autour d’une belle table.',
                event_corporate: 'Réunions café',
                event_corporate_desc: 'Un cadre détendu pour les rendez-vous professionnels et pauses d’équipe.',
                event_party: 'Goûters & célébrations',
                event_party_desc: 'Une ambiance douce pour les moments à partager.',
                events_cta_text: 'Vous préparez un brunch, une réunion ou un goûter privé ? Écrivez-nous.',
                footer_note: 'Café, brunch et douceurs servis dans une ambiance chaleureuse.'
            },
            en: {
                hero_sub1: 'A place for',
                hero_title1: 'COFFEE <span>& BRUNCH</span>',
                hero_sub2: 'Enjoy the',
                hero_title2: '{{shortName}} <span>MOMENTS</span>',
                hero_desc2: 'A warm address for coffee, pastries, brunch, and everyday meetups.',
                hero_sub3: 'From morning to afternoon',
                hero_title3: 'CALM <span>& CRAFTED</span>',
                hero_desc3: 'House-made recipes and an atmosphere designed for slower moments.',
                about_p1: '{{restaurantName}} is designed as a bright and welcoming address for coffee, brunch, and everyday breaks.',
                about_p2: 'We focus on a simple, polished menu that works for meetings, catch-ups, and relaxed pauses.',
                about_p3: 'Our promise is a soft, reliable experience from the first coffee to the final dessert.',
                event_birthday: 'Private brunches',
                event_birthday_desc: 'A friendly setup for morning celebrations and intimate birthdays.',
                event_family: 'Gatherings with loved ones',
                event_family_desc: 'A calm, warm place to reconnect around a beautiful table.',
                event_corporate: 'Coffee meetings',
                event_corporate_desc: 'A relaxed setting for professional meetings and team breaks.',
                event_party: 'Tea time & celebrations',
                event_party_desc: 'A softer atmosphere for shared moments.',
                events_cta_text: 'Planning a brunch, meeting, or private tea time? Contact us.',
                footer_note: 'Coffee, brunch, and house-made treats in a warm setting.'
            },
            ar: {
                hero_sub1: 'Ù…ÙƒØ§Ù† Ù…Ù† Ø£Ø¬Ù„',
                hero_title1: 'Ø§Ù„Ù‚Ù‡ÙˆØ© <span>ÙˆØ§Ù„Ø¨Ø±Ù†Ø´</span>',
                hero_sub2: 'Ø§Ø³ØªÙ…ØªØ¹ Ø¨Ù€',
                hero_title2: 'Ù„Ø­Ø¸Ø§Øª <span>{{shortName}}</span>',
                hero_desc2: 'Ø¹Ù†ÙˆØ§Ù† Ø¯Ø§ÙØ¦ Ù„Ù„Ù‚Ù‡ÙˆØ© ÙˆØ§Ù„Ø­Ù„ÙˆÙŠØ§Øª ÙˆØ§Ù„Ù„Ù‚Ø§Ø¡Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©.',
                hero_sub3: 'Ù…Ù† Ø§Ù„ØµØ¨Ø§Ø­ Ø¥Ù„Ù‰ Ø§Ù„Ø¹ØµØ±',
                hero_title3: 'Ù‡Ø§Ø¯Ø¦ <span>ÙˆÙ…ØªÙ‚Ù†</span>',
                hero_desc3: 'ÙˆØµÙØ§Øª Ù…Ù†Ø²Ù„ÙŠØ© ÙˆØ£Ø¬ÙˆØ§Ø¡ ØªÙ…Ù†Ø­Ùƒ ÙˆÙ‚ØªØ§Ù‹ Ø£Ø¬Ù…Ù„.',
                about_p1: '{{restaurantName}} ØµÙÙ…Ù… ÙƒØ¹Ù†ÙˆØ§Ù† Ù…Ø±ÙŠØ­ Ù„Ù„Ù‚Ù‡ÙˆØ© ÙˆØ§Ù„Ø¨Ø±Ù†Ø´ ÙˆØ§Ù„Ø§Ø³ØªØ±Ø§Ø­Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©.',
                about_p2: 'Ù†Ù‚Ø¯Ù… Ù‚Ø§Ø¦Ù…Ø© Ø¨Ø³ÙŠØ·Ø© ÙˆØ£Ù†ÙŠÙ‚Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆØ§Ù„Ù„Ù‚Ø§Ø¡Ø§Øª ÙˆØ§Ù„Ù„Ø­Ø¸Ø§Øª Ø§Ù„Ù‡Ø§Ø¯Ø¦Ø©.',
                about_p3: 'ÙˆØ¹Ø¯Ù†Ø§ Ù‡Ùˆ ØªØ¬Ø±Ø¨Ø© Ù„Ø·ÙŠÙØ© ÙˆØ«Ø§Ø¨ØªØ© Ù…Ù† Ø£ÙˆÙ„ ÙÙ†Ø¬Ø§Ù† Ù‚Ù‡ÙˆØ© Ø¥Ù„Ù‰ Ø¢Ø®Ø± Ø­Ù„ÙˆÙ‰.',
                event_birthday: 'Ø¨Ø±Ù†Ø´Ø§Øª Ø®Ø§ØµØ©',
                event_birthday_desc: 'ØµÙŠØºØ© ÙˆØ¯ÙŠØ© Ù„Ù„Ø§Ø­ØªÙØ§Ù„Ø§Øª Ø§Ù„ØµØ¨Ø§Ø­ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„ØµØºÙŠØ±Ø©.',
                event_family: 'Ù„Ù‚Ø§Ø¡Ø§Øª Ø¹Ø§Ø¦Ù„ÙŠØ©',
                event_family_desc: 'Ù…ÙƒØ§Ù† Ù‡Ø§Ø¯Ø¦ ÙˆØ¯Ø§ÙØ¦ Ù„Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ Ø­ÙˆÙ„ Ø·Ø§ÙˆÙ„Ø© Ø¬Ù…ÙŠÙ„Ø©.',
                event_corporate: 'Ù„Ù‚Ø§Ø¡Ø§Øª Ø¹Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù‚Ù‡ÙˆØ©',
                event_corporate_desc: 'Ø¬Ùˆ Ù…Ø±ÙŠØ­ Ù„Ù„Ø§Ø¬ØªÙ…Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‡Ù†ÙŠØ© ÙˆØ§Ø³ØªØ±Ø§Ø­Ø§Øª Ø§Ù„ÙØ±Ù‚.',
                event_party: 'Ø´Ø§ÙŠ Ø§Ù„Ø¹ØµØ± ÙˆØ§Ù„Ø§Ø­ØªÙØ§Ù„Ø§Øª',
                event_party_desc: 'Ø£Ø¬ÙˆØ§Ø¡ Ù„Ø·ÙŠÙØ© Ù„Ù„Ø­Ø¸Ø§Øª Ø§Ù„Ù…Ø´ØªØ±ÙƒØ©.',
                events_cta_text: 'Ù‡Ù„ ØªØ®Ø·Ø· Ù„Ø¨Ø±Ù†Ø´ Ø£Ùˆ Ù„Ù‚Ø§Ø¡ Ø£Ùˆ Ù…Ù†Ø§Ø³Ø¨Ø© Ø®Ø§ØµØ©ØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
                footer_note: 'Ù‚Ù‡ÙˆØ© ÙˆØ¨Ø±Ù†Ø´ ÙˆØ­Ù„ÙˆÙŠØ§Øª Ù…Ù†Ø²Ù„ÙŠØ© ÙÙŠ Ø£Ø¬ÙˆØ§Ø¡ Ø¯Ø§ÙØ¦Ø©.'
            }
        }
    },
    traditional: {
        branding: {
            logoMark: '🍲',
            primaryColor: '#8d2f23',
            secondaryColor: '#b97745',
            accentColor: '#d6b17a',
            tagline: 'Traditional recipes, family tables, and generous hospitality.'
        },
        guestExperience: {
            paymentMethods: ['cash', 'tpe'],
            facilities: ['wifi', 'parking', 'family']
        },
        sectionVisibility: {
            about: true,
            payments: true,
            events: true,
            gallery: true,
            hours: true,
            contact: true
        },
        sectionOrder: ['about', 'events', 'payments', 'gallery', 'hours', 'contact'],
        contentTranslations: {
            fr: {
                hero_sub1: 'Une maison de',
                hero_title1: 'SAVEURS <span>TRADITIONNELLES</span>',
                hero_sub2: 'Retrouvez les',
                hero_title2: 'RECETTES <span>{{shortName}}</span>',
                hero_desc2: 'Des plats sincères, une table familiale et un accueil généreux.',
                hero_sub3: 'Pour les repas à partager',
                hero_title3: 'AUTHENTIQUE <span>& CHALEUREUX</span>',
                hero_desc3: 'Une cuisine de tradition pensée pour les grandes et petites occasions.',
                about_p1: '{{restaurantName}} valorise la cuisine traditionnelle, les recettes de transmission et les repas qui rassemblent.',
                about_p2: 'Nous privilégions la générosité, les saveurs connues, et une atmosphère familiale qui met les invités à l’aise.',
                about_p3: 'Notre objectif est d’offrir une adresse de confiance pour les repas du quotidien comme pour les moments importants.',
                event_birthday: 'Repas de famille',
                event_birthday_desc: 'Une table accueillante pour célébrer les temps forts en famille.',
                event_family: 'Retrouvailles',
                event_family_desc: 'Un cadre adapté aux repas généreux et aux longues conversations.',
                event_corporate: 'Repas d’équipe',
                event_corporate_desc: 'Un format chaleureux pour accueillir collègues et partenaires.',
                event_party: 'Fêtes traditionnelles',
                event_party_desc: 'Une cuisine de partage pour les célébrations privées.',
                events_cta_text: 'Vous préparez un repas de groupe ou une célébration ? Contactez-nous.',
                footer_note: 'Recettes traditionnelles, table familiale et hospitalité généreuse.'
            },
            en: {
                hero_sub1: 'A home for',
                hero_title1: 'TRADITIONAL <span>FLAVORS</span>',
                hero_sub2: 'Rediscover the',
                hero_title2: '{{shortName}} <span>RECIPES</span>',
                hero_desc2: 'Sincere dishes, a family table, and generous hospitality.',
                hero_sub3: 'For shared meals',
                hero_title3: 'AUTHENTIC <span>& WARM</span>',
                hero_desc3: 'Traditional cooking made for everyday meals and special occasions.',
                about_p1: '{{restaurantName}} celebrates traditional cooking, passed-down recipes, and meals that bring people together.',
                about_p2: 'We focus on generosity, familiar flavors, and a family atmosphere that makes guests feel at home.',
                about_p3: 'Our aim is to offer a trusted address for everyday meals as well as meaningful celebrations.',
                event_birthday: 'Family meals',
                event_birthday_desc: 'A welcoming table for important moments with loved ones.',
                event_family: 'Gatherings',
                event_family_desc: 'A setting designed for generous meals and long conversations.',
                event_corporate: 'Team meals',
                event_corporate_desc: 'A warm format for colleagues, partners, and hosted lunches.',
                event_party: 'Traditional celebrations',
                event_party_desc: 'A sharing-style kitchen for private celebrations.',
                events_cta_text: 'Planning a group meal or celebration? Contact us.',
                footer_note: 'Traditional recipes, family tables, and generous hospitality.'
            },
            ar: {
                hero_sub1: 'Ø¨ÙŠØª Ù„Ù€',
                hero_title1: 'Ø§Ù„Ù†ÙƒÙ‡Ø§Øª <span>Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ©</span>',
                hero_sub2: 'Ø§ÙƒØªØ´Ù Ù…Ù† Ø¬Ø¯ÙŠØ¯',
                hero_title2: 'ÙˆØµÙØ§Øª <span>{{shortName}}</span>',
                hero_desc2: 'Ø£Ø·Ø¨Ø§Ù‚ ØµØ§Ø¯Ù‚Ø© ÙˆØ·Ø§ÙˆÙ„Ø© Ø¹Ø§Ø¦Ù„ÙŠØ© ÙˆØ§Ø³ØªÙ‚Ø¨Ø§Ù„ ÙƒØ±ÙŠÙ….',
                hero_sub3: 'Ù„Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„Ù…Ø´ØªØ±ÙƒØ©',
                hero_title3: 'Ø£ØµÙŠÙ„ <span>ÙˆØ¯Ø§ÙØ¦</span>',
                hero_desc3: 'Ù…Ø·Ø¨Ø® ØªÙ‚Ù„ÙŠØ¯ÙŠ ÙŠÙ†Ø§Ø³Ø¨ Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø¹Ø§Ø¯ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„Ø®Ø§ØµØ©.',
                about_p1: '{{restaurantName}} ÙŠØ­ØªÙÙŠ Ø¨Ø§Ù„Ù…Ø·Ø¨Ø® Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠ ÙˆØ§Ù„ÙˆØµÙØ§Øª Ø§Ù„Ù…ØªÙˆØ§Ø±Ø«Ø© ÙˆØ§Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ØªÙŠ ØªØ¬Ù…Ø¹ Ø§Ù„Ù†Ø§Ø³.',
                about_p2: 'Ù†Ø±ÙƒØ² Ø¹Ù„Ù‰ Ø§Ù„ÙƒØ±Ù… ÙˆØ§Ù„Ù†ÙƒÙ‡Ø§Øª Ø§Ù„Ù…Ø£Ù„ÙˆÙØ© ÙˆØ£Ø¬ÙˆØ§Ø¡ Ø¹Ø§Ø¦Ù„ÙŠØ© ØªØ¬Ø¹Ù„ Ø§Ù„Ø¶ÙŠÙˆÙ ÙŠØ´Ø¹Ø±ÙˆÙ† Ø¨Ø§Ù„Ø±Ø§Ø­Ø©.',
                about_p3: 'Ù‡Ø¯ÙÙ†Ø§ Ø£Ù† Ù†Ù‚Ø¯Ù… Ø¹Ù†ÙˆØ§Ù†Ø§Ù‹ Ù…ÙˆØ«ÙˆÙ‚Ø§Ù‹ Ù„Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙˆÙ„Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„Ù…Ù‡Ù…Ø© Ø£ÙŠØ¶Ø§Ù‹.',
                event_birthday: 'ÙˆØ¬Ø¨Ø§Øª Ø¹Ø§Ø¦Ù„ÙŠØ©',
                event_birthday_desc: 'Ø·Ø§ÙˆÙ„Ø© Ù…Ø±Ø­Ø¨Ø© Ù„Ù„Ø§Ø­ØªÙØ§Ù„ Ø¨Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ù…Ø¹ Ø§Ù„Ø£Ø­Ø¨Ø§Ø¨.',
                event_family: 'Ù„Ù‚Ø§Ø¡Ø§Øª ÙˆÙ„Ù…Ù‘Ø§Øª',
                event_family_desc: 'Ù…ÙƒØ§Ù† Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„Ø³Ø®ÙŠØ© ÙˆØ§Ù„Ø£Ø­Ø§Ø¯ÙŠØ« Ø§Ù„Ø·ÙˆÙŠÙ„Ø©.',
                event_corporate: 'ÙˆØ¬Ø¨Ø§Øª Ø§Ù„ÙØ±Ù‚',
                event_corporate_desc: 'ØµÙŠØºØ© Ø¯Ø§ÙØ¦Ø© Ù„Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø²Ù…Ù„Ø§Ø¡ ÙˆØ§Ù„Ø´Ø±ÙƒØ§Ø¡.',
                event_party: 'Ø§Ø­ØªÙØ§Ù„Ø§Øª ØªÙ‚Ù„ÙŠØ¯ÙŠØ©',
                event_party_desc: 'Ù…Ø·Ø¨Ø® Ù‚Ø§Ø¦Ù… Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© Ù„Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª Ø§Ù„Ø®Ø§ØµØ©.',
                events_cta_text: 'Ù‡Ù„ ØªØ®Ø·Ø· Ù„ÙˆØ¬Ø¨Ø© Ø¬Ù…Ø§Ø¹ÙŠØ© Ø£Ùˆ Ø§Ø­ØªÙØ§Ù„ØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.',
                footer_note: 'ÙˆØµÙØ§Øª ØªÙ‚Ù„ÙŠØ¯ÙŠØ© ÙˆØ·Ø§ÙˆÙ„Ø© Ø¹Ø§Ø¦Ù„ÙŠØ© ÙˆØ¶ÙŠØ§ÙØ© ÙƒØ±ÙŠÙ…Ø©.'
            }
        }
    }
});

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtmlAttr(value) {
    return escapeHtml(value);
}

function toInlineJsString(value) {
    return JSON.stringify(String(value ?? ''));
}

function normalizeMenuItemTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    const out = {};

    MENU_ITEM_TRANSLATION_LANGUAGES.forEach(({ code }) => {
        const bucket = source[code] && typeof source[code] === 'object' ? source[code] : {};
        out[code] = {
            name: typeof bucket.name === 'string' ? bucket.name.trim() : '',
            desc: typeof bucket.desc === 'string' ? bucket.desc.trim() : ''
        };
    });

    return out;
}

function getMenuItemTranslationInputId(field, lang) {
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    return field === 'name' ? `itemName${suffix}` : `itemDesc${suffix}`;
}

function setMenuItemTranslationFields(input) {
    const translations = normalizeMenuItemTranslations(input);
    MENU_ITEM_TRANSLATION_LANGUAGES.forEach(({ code }) => {
        const nameInput = document.getElementById(getMenuItemTranslationInputId('name', code));
        const descInput = document.getElementById(getMenuItemTranslationInputId('desc', code));
        if (nameInput) nameInput.value = translations[code].name;
        if (descInput) descInput.value = translations[code].desc;
    });
}

function buildMenuItemTranslations() {
    const translations = {};

    MENU_ITEM_TRANSLATION_LANGUAGES.forEach(({ code }) => {
        const nameInput = document.getElementById(getMenuItemTranslationInputId('name', code));
        const descInput = document.getElementById(getMenuItemTranslationInputId('desc', code));
        translations[code] = {
            name: nameInput ? nameInput.value.trim() : '',
            desc: descInput ? descInput.value.trim() : ''
        };
    });

    return translations;
}

function getAdminItemDisplayName(item) {
    if (typeof item?.name === 'string' && item.name.trim()) {
        return item.name.trim();
    }

    const translations = normalizeMenuItemTranslations(item?.translations);
    return translations.fr.name || translations.en.name || translations.ar.name || 'Unnamed item';
}

function getAdminItemDisplayDescription(item) {
    if (typeof item?.desc === 'string' && item.desc.trim()) {
        return item.desc.trim();
    }

    const translations = normalizeMenuItemTranslations(item?.translations);
    return translations.fr.desc || translations.en.desc || translations.ar.desc || '';
}

function renderMenuTranslationBadges(item) {
    const translations = normalizeMenuItemTranslations(item?.translations);

    return MENU_ITEM_TRANSLATION_LANGUAGES.map(({ code, label }) => {
        const bucket = translations[code];
        const isFilled = Boolean(bucket.name || bucket.desc);
        const title = `${label}: ${isFilled ? 'ready' : 'missing'}`;
        return `<span class="translation-badge ${isFilled ? 'is-filled' : ''}" title="${escapeHtml(title)}">${code.toUpperCase()}</span>`;
    }).join('');
}

function normalizeEntityTranslations(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
        fr: {
            name: typeof source.fr?.name === 'string' ? source.fr.name.trim() : '',
            desc: typeof source.fr?.desc === 'string' ? source.fr.desc.trim() : ''
        },
        en: {
            name: typeof source.en?.name === 'string' ? source.en.name.trim() : '',
            desc: typeof source.en?.desc === 'string' ? source.en.desc.trim() : ''
        },
        ar: {
            name: typeof source.ar?.name === 'string' ? source.ar.name.trim() : '',
            desc: typeof source.ar?.desc === 'string' ? source.ar.desc.trim() : ''
        }
    };
}

function getCategoryTranslations(catKey) {
    return normalizeEntityTranslations(categoryTranslations?.[catKey]);
}

function setCategoryTranslationFieldsFromTranslations(input, fallbackName = '') {
    const translations = normalizeEntityTranslations(input);
    const baseName = typeof fallbackName === 'string' ? fallbackName.trim() : '';
    const fieldMap = {
        fr: 'catNameFr',
        en: 'catNameEn',
        ar: 'catNameAr'
    };

    Object.entries(fieldMap).forEach(([lang, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = translations[lang].name || (lang === 'fr' ? baseName : '');
        }
    });
}

function setCategoryTranslationFields(catKey = '') {
    const translations = getCategoryTranslations(catKey);
    const baseName = typeof catKey === 'string' ? catKey.trim() : '';
    setCategoryTranslationFieldsFromTranslations(translations, baseName);
}

function buildCategoryTranslations(baseName) {
    const safeBaseName = typeof baseName === 'string' ? baseName.trim() : '';
    const next = normalizeEntityTranslations(categoryTranslations?.[safeBaseName]);

    ['fr', 'en', 'ar'].forEach((lang) => {
        const input = document.getElementById(`catName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        next[lang].name = input ? input.value.trim() : '';
        next[lang].desc = '';
    });

    if (!next.fr.name && safeBaseName) {
        next.fr.name = safeBaseName;
    }

    return next;
}

function getAssignedSuperCategoryIdForCategory(catKey = '') {
    const safeKey = typeof catKey === 'string' ? catKey.trim() : '';
    if (!safeKey) return '';
    const configured = Array.isArray(restaurantConfig.superCategories) ? restaurantConfig.superCategories : [];
    const match = configured.find((entry) => Array.isArray(entry?.cats) && entry.cats.includes(safeKey));
    return match?.id || '';
}

function populateCategorySuperCategoryOptions(selectedId = '') {
    const select = document.getElementById('catSuperCategory');
    if (!select) return;

    const configured = Array.isArray(restaurantConfig.superCategories) ? restaurantConfig.superCategories : [];
    const currentValue = selectedId || select.value || '';
    const options = ['<option value="">Select a super category</option>']
        .concat(configured.map((entry) => `<option value="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</option>`));

    select.innerHTML = options.join('');
    select.value = currentValue;
}

function setSuperCategoryTranslationFields(input, fallbackName = '', fallbackDesc = '') {
    const translations = normalizeEntityTranslations(input);
    ['fr', 'en', 'ar'].forEach((lang) => {
        const nameInput = document.getElementById(`scName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        const descInput = document.getElementById(`scDesc${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        if (nameInput) nameInput.value = translations[lang].name || (lang === 'fr' ? fallbackName : '');
        if (descInput) descInput.value = translations[lang].desc || (lang === 'fr' ? fallbackDesc : '');
    });
}

function resetCategoryFormState() {
    const form = document.getElementById('catForm');
    if (form) form.reset();
    setMenuCrudValidationState('catForm', {});
    setMenuTranslationWarnings('category');
    const editingKeyInput = document.getElementById('catEditingKey');
    if (editingKeyInput) editingKeyInput.value = '';
    populateCategorySuperCategoryOptions(menuBuilderSelectedSuperCategoryId || '');
    setCategoryTranslationFields();
    updateCategoryImagePreview();
    syncCategoryImageAiControls();
    refreshMenuCrudFormUx('catForm');
}

function normalizeCategoryImagePath(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function updateCategoryImagePreview() {
    const previewShell = document.getElementById('catImagePreview');
    const previewImg = document.getElementById('catImagePreviewImg');
    const previewFallback = document.getElementById('catImagePreviewFallback');
    const input = document.getElementById('catImage');
    if (!previewShell || !previewImg || !previewFallback) return;

    const nextImage = normalizeCategoryImagePath(input ? input.value : '');
    if (nextImage) {
        previewShell.classList.add('has-image');
        previewImg.style.display = '';
        previewFallback.style.display = 'none';
        previewImg.src = nextImage;
        previewImg.onerror = () => {
            previewShell.classList.remove('has-image');
            previewImg.style.display = 'none';
            previewFallback.style.display = '';
            previewImg.onerror = null;
        };
        return;
    }

    previewShell.classList.remove('has-image');
    previewImg.style.display = 'none';
    previewImg.removeAttribute('src');
    previewFallback.style.display = '';
}

function bindCategoryImageFormEvents() {
    const imageInput = document.getElementById('catImage');
    const uploadInput = document.getElementById('catImageUpload');

    if (imageInput && !imageInput.dataset.boundPreview) {
        imageInput.dataset.boundPreview = 'true';
        imageInput.addEventListener('input', updateCategoryImagePreview);
        imageInput.addEventListener('change', updateCategoryImagePreview);
    }

    if (uploadInput && !uploadInput.dataset.boundPreview) {
        uploadInput.dataset.boundPreview = 'true';
        uploadInput.addEventListener('change', () => {
            const file = uploadInput.files && uploadInput.files[0];
            const previewShell = document.getElementById('catImagePreview');
            const previewImg = document.getElementById('catImagePreviewImg');
            const previewFallback = document.getElementById('catImagePreviewFallback');
            if (!previewShell || !previewImg || !previewFallback) return;
            if (!file) {
                updateCategoryImagePreview();
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            previewShell.classList.add('has-image');
            previewImg.style.display = '';
            previewFallback.style.display = 'none';
            previewImg.src = objectUrl;
            previewImg.onload = () => {
                URL.revokeObjectURL(objectUrl);
                previewImg.onload = null;
            };
        });
    }
}

function normalizeSuperCategoryIconValue(value) {
    return String(value || '').trim();
}

function setSuperCategoryIcon(value, markTouched = true) {
    applySuperCategoryIcon(value, {
        manual: markTouched,
        dispatch: false
    });
}

function maybeSuggestSuperCategoryIcon() {
    if (superCategoryIconManuallyChosen) return;
    const name = document.getElementById('scName')?.value?.trim() || '';
    const desc = document.getElementById('scDesc')?.value?.trim() || '';
    setSuperCategoryIcon(suggestSuperCategoryIcon(name, desc), false);
}

function bindSuperCategoryIconControls() {
    const iconInput = document.getElementById('scEmoji');
    if (iconInput && !iconInput.dataset.iconBound) {
        iconInput.dataset.iconBound = 'true';
        iconInput.addEventListener('input', () => {
            const normalized = normalizeSuperCategoryIconValue(iconInput.value);
            superCategoryIconManuallyChosen = Boolean(normalized);
            updateSuperCategoryIconPreview(normalized || DEFAULT_SUPER_CATEGORY_ICON);
            refreshMenuCrudFormUx('superCatForm');
        });
    }

    ['scName', 'scDesc'].forEach((id) => {
        const field = document.getElementById(id);
        if (field && !field.dataset.iconSuggestBound) {
            field.dataset.iconSuggestBound = 'true';
            field.addEventListener('input', () => maybeSuggestSuperCategoryIcon());
        }
    });
}

function resetSuperCategoryFormState() {
    const form = document.getElementById('superCatForm');
    if (form) form.reset();
    setMenuCrudValidationState('superCatForm', {});
    setMenuTranslationWarnings('supercategory');
    const editingIdInput = document.getElementById('scEditingId');
    if (editingIdInput) editingIdInput.value = '';
    superCategoryIconManuallyChosen = false;
    renderSuperCategoryIconPicker(DEFAULT_SUPER_CATEGORY_ICON);
    setSuperCategoryIcon(DEFAULT_SUPER_CATEGORY_ICON, false);
    setSuperCategoryTranslationFields();
    document.querySelectorAll('.sc-cat-check').forEach((cb) => {
        cb.checked = false;
    });
    refreshMenuCrudFormUx('superCatForm');
}

function buildSuperCategoryTranslations(name, desc) {
    const next = normalizeEntityTranslations();
    ['fr', 'en', 'ar'].forEach((lang) => {
        const nameInput = document.getElementById(`scName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        const descInput = document.getElementById(`scDesc${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        next[lang].name = nameInput ? nameInput.value.trim() : '';
        next[lang].desc = descInput ? descInput.value.trim() : '';
    });
    if (!next.fr.name && name) next.fr.name = name;
    if (!next.fr.desc && desc) next.fr.desc = desc;
    return next;
}

const MENU_CRUD_FORM_DEFAULT_SECTIONS = {
    foodForm: 'core',
    catForm: 'identity',
    superCatForm: 'identity'
};

const MENU_TRANSLATION_ENTITY_CONFIG = {
    item: {
        formId: 'foodForm',
        summaryNoteId: 'itemTranslationSummaryNote',
        statusRowId: 'itemTranslationStatusRow',
        disclosureId: 'itemTranslationDisclosure',
        buttonId: 'itemTranslationGenerateBtn',
        warningId: 'itemTranslationAiNote'
    },
    category: {
        formId: 'catForm',
        summaryNoteId: 'catTranslationSummaryNote',
        statusRowId: 'catTranslationStatusRow',
        disclosureId: 'catTranslationDisclosure',
        buttonId: 'catTranslationGenerateBtn',
        warningId: 'catTranslationAiNote'
    },
    supercategory: {
        formId: 'superCatForm',
        summaryNoteId: 'superTranslationSummaryNote',
        statusRowId: 'superTranslationStatusRow',
        disclosureId: 'superTranslationDisclosure',
        buttonId: 'superTranslationGenerateBtn',
        warningId: 'superTranslationAiNote'
    }
};

const menuTranslationWarnings = {
    item: [],
    category: [],
    supercategory: []
};

const menuCrudValidationState = {
    foodForm: null,
    catForm: null,
    superCatForm: null
};

function getMenuCrudSections(form) {
    if (!form) return [];
    const sections = Array.from(form.querySelectorAll('[data-menu-section]'));
    if (!sections.length) return [];
    const navButtons = Array.from(document.querySelectorAll(`.menu-crud-step-btn[data-form-id="${form.id}"]`));
    if (!navButtons.length) return sections;
    const ordered = navButtons
        .map((button) => button.dataset.sectionTarget || '')
        .map((sectionId) => sections.find((section) => section.dataset.menuSection === sectionId))
        .filter(Boolean);
    return ordered.length === sections.length ? ordered : sections;
}

function setMenuCrudMetaText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setTextIfPresent(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function getAdminHelpDisplayValue(element) {
    if (!element) return 'block';
    if (element.classList.contains('menu-form-side-panel')) return 'grid';
    if (element.tagName === 'UL') return 'grid';
    if (element.tagName === 'SPAN') return 'inline';
    return 'block';
}

function ensureAdminHelpNodeId(element) {
    if (!element.id) {
        adminHelpToggleIdCounter += 1;
        element.id = `adminHelpNode${adminHelpToggleIdCounter}`;
    }
    return element.id;
}

function setAdminHelpNodeVisibility(element, visible) {
    if (!element) return;
    if (!element.dataset.adminHelpDisplay) {
        element.dataset.adminHelpDisplay = getAdminHelpDisplayValue(element);
    }
    if (visible) {
        element.hidden = false;
        element.setAttribute('aria-hidden', 'false');
        element.style.setProperty('display', element.dataset.adminHelpDisplay, 'important');
        return;
    }
    element.hidden = true;
    element.setAttribute('aria-hidden', 'true');
    element.style.setProperty('display', 'none', 'important');
}

function initializeAdminHelpToggles() {
    document.querySelectorAll('.info-save-note, .branding-save-note, .security-help, .super-icon-preview-note').forEach((node) => {
        setAdminHelpNodeVisibility(node, false);
    });

    ADMIN_HELP_TOGGLE_RULES.forEach((rule) => {
        document.querySelectorAll(rule.hostSelector).forEach((host) => {
            const helpNodes = Array.from(host.querySelectorAll(rule.helpSelector)).filter((node) => {
                return node && String(node.textContent || '').trim();
            });
            if (!helpNodes.length) return;

            const anchor = rule.anchorSelector ? host.querySelector(rule.anchorSelector) : host;
            if (!anchor) return;

            anchor.classList.add('admin-help-host', 'has-admin-help');
            let toggle = anchor.querySelector('[data-admin-help-toggle="true"]');

            if (!toggle) {
                toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'admin-help-toggle';
                toggle.dataset.adminHelpToggle = 'true';
                toggle.textContent = '?';
                toggle.title = rule.label || 'Show guidance';
                toggle.setAttribute('aria-label', rule.label || 'Show guidance');
                toggle.setAttribute('aria-expanded', 'false');
                anchor.appendChild(toggle);
            }

            toggle.setAttribute('aria-controls', helpNodes.map((node) => ensureAdminHelpNodeId(node)).join(' '));
            helpNodes.forEach((node) => setAdminHelpNodeVisibility(node, false));

            if (toggle.dataset.adminHelpBound === 'true') return;
            toggle.dataset.adminHelpBound = 'true';
            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                const nextVisible = !expanded;
                toggle.setAttribute('aria-expanded', nextVisible ? 'true' : 'false');
                helpNodes.forEach((node) => setAdminHelpNodeVisibility(node, nextVisible));
            });
        });
    });
}

function getFilledTranslationCount(translations) {
    const normalized = normalizeEntityTranslations(translations);
    return ['fr', 'en', 'ar'].reduce((total, lang) => total + (normalized[lang].name ? 1 : 0), 0);
}

function decorateRequiredMenuCrudLabels(root = document) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const markedLabels = new Set();
    root.querySelectorAll('.menu-crud-form-shell label[data-required="true"]').forEach((label) => {
        markedLabels.add(label);
    });
    root.querySelectorAll('.menu-crud-form-shell input[required], .menu-crud-form-shell select[required], .menu-crud-form-shell textarea[required]').forEach((field) => {
        let label = null;
        if (field.id) {
            label = root.querySelector(`label[for="${field.id}"]`);
        }
        if (!label) {
            label = field.closest('.form-group')?.querySelector('label');
        }
        if (!label || markedLabels.has(label)) return;
        label.dataset.required = 'true';
        markedLabels.add(label);
    });
}

function buildTranslationStatusMarkup(translations) {
    const normalized = normalizeEntityTranslations(translations);
    return [
        { lang: 'fr', label: 'French' },
        { lang: 'en', label: 'English' },
        { lang: 'ar', label: 'Arabic' }
    ].map(({ lang, label }) => {
        const ready = Boolean(normalized[lang]?.name);
        return `<span class="translation-status-pill ${ready ? 'is-ready' : ''}">${label} ${ready ? 'Ready' : 'Missing'}</span>`;
    }).join('');
}

function setMenuTranslationWarnings(entityType, warnings = []) {
    if (!Object.prototype.hasOwnProperty.call(menuTranslationWarnings, entityType)) return;
    menuTranslationWarnings[entityType] = Array.isArray(warnings)
        ? warnings.map((warning) => String(warning || '').trim()).filter(Boolean)
        : [];
}

function renderMenuTranslationWarnings(entityType) {
    const config = MENU_TRANSLATION_ENTITY_CONFIG[entityType];
    if (!config?.warningId) return;
    const el = document.getElementById(config.warningId);
    if (!el) return;
    const warnings = menuTranslationWarnings[entityType] || [];
    if (!warnings.length) {
        el.hidden = true;
        el.innerHTML = '';
        return;
    }
    el.hidden = false;
    el.innerHTML = `
        <strong>AI review notes</strong>
        <ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>
    `;
}

function refreshTranslationSummary(entityType) {
    const config = MENU_TRANSLATION_ENTITY_CONFIG[entityType];
    if (!config) return;
    let translations = normalizeEntityTranslations();
    let note = 'No translations yet';

    if (entityType === 'item') {
        translations = buildMenuItemTranslations();
    } else if (entityType === 'category') {
        const baseName = document.getElementById('catName')?.value?.trim() || '';
        translations = buildCategoryTranslations(baseName);
    } else if (entityType === 'supercategory') {
        const name = document.getElementById('scName')?.value?.trim() || '';
        const desc = document.getElementById('scDesc')?.value?.trim() || '';
        translations = buildSuperCategoryTranslations(name, desc);
    }

    const filledCount = getFilledTranslationCount(translations);
    if (filledCount === 3) note = 'All customer labels are ready';
    else if (filledCount > 0) note = `${filledCount}/3 language labels ready`;
    const noteEl = document.getElementById(config.summaryNoteId);
    if (noteEl) noteEl.textContent = note;
    const row = document.getElementById(config.statusRowId);
    if (row) row.innerHTML = buildTranslationStatusMarkup(translations);
    renderMenuTranslationWarnings(entityType);
    if (entityType === 'item') {
        setMenuCrudMetaText(
            'foodFormMetaTranslations',
            filledCount === 3 ? 'Translations ready' : filledCount > 0 ? `${filledCount}/3 labels ready` : 'Translations pending'
        );
    }

    if (entityType === 'category') {
        setMenuCrudMetaText(
            'catFormMetaLabels',
            filledCount === 3 ? 'Labels ready' : filledCount > 0 ? `${filledCount}/3 labels ready` : 'Labels pending'
        );
    }

    if (entityType === 'supercategory') {
        setMenuCrudMetaText(
            'superCatFormMetaLabels',
            filledCount === 3 ? 'Labels ready' : filledCount > 0 ? `${filledCount}/3 labels ready` : 'Labels pending'
        );
    }
}

function refreshFoodFormReview() {
    const name = document.getElementById('itemName')?.value?.trim() || 'Start with a dish name';
    const desc = document.getElementById('itemDesc')?.value?.trim() || 'The default description will appear here once it is filled.';
    const hasSizes = Boolean(document.getElementById('itemHasSizes')?.checked);
    const price = Number.parseFloat(document.getElementById('itemPrice')?.value || '0') || 0;
    const priceSmall = Number.parseFloat(document.getElementById('itemPriceSmall')?.value || '0') || 0;
    const priceMedium = Number.parseFloat(document.getElementById('itemPriceMedium')?.value || '0') || 0;
    const priceLarge = Number.parseFloat(document.getElementById('itemPriceLarge')?.value || '0') || 0;
    const extras = typeof collectItemExtrasFromEditor === 'function' ? collectItemExtrasFromEditor() : [];
    const images = (() => {
        const urls = String(document.getElementById('itemImg')?.value || '')
            .split(/\n/)
            .map((value) => value.trim())
            .filter(Boolean);
        const files = document.getElementById('itemFile')?.files?.length || 0;
        if (editingItemId) {
            const existing = Array.isArray(window._editingImages) ? window._editingImages.filter(Boolean).length : 0;
            return Math.max(existing, urls.length) + files;
        }
        return urls.length + files;
    })();
    const translationCount = getFilledTranslationCount(buildMenuItemTranslations());
    const available = document.getElementById('itemAvailable')?.checked !== false;
    const featured = Boolean(document.getElementById('itemFeatured')?.checked);
    const pricingState = hasSizes
        ? (['itemPriceSmall', 'itemPriceMedium', 'itemPriceLarge'].some((id) => (Number.parseFloat(document.getElementById(id)?.value || '0') || 0) > 0)
            ? 'Size pricing ready'
            : 'Pricing pending')
        : (price > 0 ? 'Standard price ready' : 'Pricing pending');

    setMenuCrudMetaText('foodFormMetaState', editingItemId ? 'Editing existing dish' : 'New dish draft');
    setMenuCrudMetaText('foodFormMetaPricing', pricingState);
    setTextIfPresent('itemReviewSummaryName', name);
    setTextIfPresent('itemReviewSummaryDesc', desc);
    setTextIfPresent('itemReviewPriceMode', hasSizes
        ? `Sizes from ${[priceSmall, priceMedium, priceLarge].filter((value) => value > 0)[0] || 0} MAD`
        : (price > 0 ? `${price} MAD standard price` : 'No pricing yet'));
    setTextIfPresent('itemReviewExtrasCount', extras.length > 0
        ? `${extras.length} paid extra${extras.length > 1 ? 's' : ''} configured`
        : 'No extras configured');
    setTextIfPresent('itemReviewMediaCount', images > 0
        ? `${images} media asset${images > 1 ? 's' : ''}`
        : 'No media yet');
    setTextIfPresent('itemReviewMediaHint', editingItemId
        ? 'Use the gallery manager if you need to curate the saved image order.'
        : 'Save once, then the full gallery manager becomes available.');
    setTextIfPresent('itemReviewTranslationState', translationCount === 3
        ? 'Translations ready'
        : translationCount > 0 ? `${translationCount}/3 labels ready` : 'Translations pending');
    setTextIfPresent('itemReviewAvailabilityState', `${available ? 'Visible' : 'Hidden'} on the live menu${featured ? ' · featured' : ''}`);
}

function getMenuCrudSectionStatus(formId, sectionId) {
    if (formId === 'foodForm') {
        const name = document.getElementById('itemName')?.value?.trim() || '';
        const cat = document.getElementById('itemCat')?.value?.trim() || '';
        const desc = document.getElementById('itemDesc')?.value?.trim() || '';
        const hasSizes = Boolean(document.getElementById('itemHasSizes')?.checked);
        const hasSingle = (Number.parseFloat(document.getElementById('itemPrice')?.value || '0') || 0) > 0;
        const hasSized = ['itemPriceSmall', 'itemPriceMedium', 'itemPriceLarge'].some((id) => (Number.parseFloat(document.getElementById(id)?.value || '0') || 0) > 0);
        if (sectionId === 'core') return name && cat && desc ? 'ready' : 'missing';
        if (sectionId === 'pricing') {
            return hasSizes ? (hasSized ? 'ready' : 'missing') : (hasSingle ? 'ready' : 'missing');
        }
        if (sectionId === 'extras') {
            const extrasCount = typeof collectItemExtrasFromEditor === 'function' ? collectItemExtrasFromEditor().length : 0;
            return extrasCount > 0 ? 'ready' : 'optional';
        }
        if (sectionId === 'media') {
            const hasImages = Boolean(String(document.getElementById('itemImg')?.value || '').trim())
                || Boolean(document.getElementById('itemFile')?.files?.length)
                || Boolean(Array.isArray(window._editingImages) && window._editingImages.length);
            return hasImages ? 'ready' : 'optional';
        }
        if (sectionId === 'labels') {
            return getFilledTranslationCount(buildMenuItemTranslations()) === 3 ? 'ready' : 'missing';
        }
        if (sectionId === 'review') {
            return name && cat && desc && (hasSizes ? hasSized : hasSingle) ? 'ready' : 'missing';
        }
    }

    if (formId === 'catForm') {
        const name = document.getElementById('catName')?.value?.trim() || '';
        const superCategory = document.getElementById('catSuperCategory')?.value?.trim() || '';
        if (sectionId === 'identity') return name && superCategory ? 'ready' : 'missing';
        if (sectionId === 'visual') {
            const hasImage = Boolean(String(document.getElementById('catImage')?.value || '').trim())
                || Boolean(document.getElementById('catImageUpload')?.files?.length);
            return hasImage ? 'ready' : 'optional';
        }
        if (sectionId === 'labels') {
            return getFilledTranslationCount(buildCategoryTranslations(name)) === 3 ? 'ready' : 'missing';
        }
    }

    if (formId === 'superCatForm') {
        const name = document.getElementById('scName')?.value?.trim() || '';
        const desc = document.getElementById('scDesc')?.value?.trim() || '';
        if (sectionId === 'identity') return name && desc ? 'ready' : 'missing';
        if (sectionId === 'labels') {
            return getFilledTranslationCount(buildSuperCategoryTranslations(name, desc)) === 3 ? 'ready' : 'missing';
        }
        if (sectionId === 'structure') {
            return Array.from(document.querySelectorAll('.sc-cat-check:checked')).length > 0 ? 'ready' : 'missing';
        }
    }

    return 'optional';
}

function refreshMenuCrudSectionButtons(form) {
    if (!form?.id) return;
    const buttons = document.querySelectorAll(`.menu-crud-step-btn[data-form-id="${form.id}"]`);
    buttons.forEach((button) => {
        const sectionId = button.dataset.sectionTarget || '';
        const status = getMenuCrudSectionStatus(form.id, sectionId);
        button.dataset.status = status;
        const statusEl = button.querySelector('.menu-crud-step-status');
        if (statusEl) {
            statusEl.textContent = status === 'ready' ? 'Ready' : status === 'optional' ? 'Optional' : 'Missing';
        }
    });
}

function getActiveMenuCrudSectionId(form) {
    return getMenuCrudSections(form).find((section) => section.classList.contains('is-active'))?.dataset.menuSection
        || MENU_CRUD_FORM_DEFAULT_SECTIONS[form?.id]
        || '';
}

function getMenuCrudSectionLabel(formId, sectionId) {
    return document.querySelector(`.menu-crud-step-btn[data-form-id="${formId}"][data-section-target="${sectionId}"] .menu-crud-step-label`)?.textContent?.trim()
        || sectionId;
}

function getMenuCrudMissingTarget(formId, sectionId) {
    if (formId === 'foodForm') {
        const name = document.getElementById('itemName')?.value?.trim() || '';
        const cat = document.getElementById('itemCat')?.value?.trim() || '';
        const desc = document.getElementById('itemDesc')?.value?.trim() || '';
        const hasSizes = Boolean(document.getElementById('itemHasSizes')?.checked);
        const sizedPriceIds = ['itemPriceSmall', 'itemPriceMedium', 'itemPriceLarge'];
        const firstSizedPriceId = sizedPriceIds.find((id) => (Number.parseFloat(document.getElementById(id)?.value || '0') || 0) > 0) || sizedPriceIds[0];
        if (sectionId === 'core') {
            if (!name) return { message: 'Add the dish name in Core.', fieldId: 'itemName' };
            if (!cat) return { message: 'Choose the category in Core.', fieldId: 'itemCat' };
            if (!desc) return { message: 'Add the fallback description in Core.', fieldId: 'itemDesc' };
        }
        if (sectionId === 'pricing') {
            return hasSizes
                ? { message: 'Add at least one size price in Pricing.', fieldId: firstSizedPriceId }
                : { message: 'Add the dish price in Pricing.', fieldId: 'itemPrice' };
        }
        if (sectionId === 'labels') {
            return { message: 'Generate or enter the missing labels in Labels.', fieldId: 'itemTranslationGenerateBtn' };
        }
    }

    if (formId === 'catForm') {
        const name = document.getElementById('catName')?.value?.trim() || '';
        const superCategory = document.getElementById('catSuperCategory')?.value?.trim() || '';
        if (sectionId === 'identity') {
            if (!name) return { message: 'Add the category name in Identity.', fieldId: 'catName' };
            if (!superCategory) return { message: 'Choose the parent super category in Identity.', fieldId: 'catSuperCategory' };
        }
        if (sectionId === 'labels') {
            return { message: 'Generate or enter the missing labels in Labels.', fieldId: 'catTranslationGenerateBtn' };
        }
    }

    if (formId === 'superCatForm') {
        const name = document.getElementById('scName')?.value?.trim() || '';
        const desc = document.getElementById('scDesc')?.value?.trim() || '';
        if (sectionId === 'identity') {
            if (!name) return { message: 'Add the group name in Identity.', fieldId: 'scName' };
            if (!desc) return { message: 'Add the fallback description in Identity.', fieldId: 'scDesc' };
        }
        if (sectionId === 'labels') {
            return { message: 'Generate or enter the missing labels in Labels.', fieldId: 'superTranslationGenerateBtn' };
        }
        if (sectionId === 'structure') {
            return { message: 'Select at least one category in Structure.', fieldId: 'scCatsList' };
        }
    }

    return {
        message: `Complete the ${getMenuCrudSectionLabel(formId, sectionId).toLowerCase()} section before saving.`,
        fieldId: ''
    };
}

function syncMenuCrudFooter(form) {
    if (!form?.id) return;
    const sections = getMenuCrudSections(form);
    if (!sections.length) return;
    const activeSectionId = getActiveMenuCrudSectionId(form);
    const activeIndex = Math.max(0, sections.findIndex((section) => section.dataset.menuSection === activeSectionId));
    const total = sections.length;
    const readyCount = sections.filter((section) => getMenuCrudSectionStatus(form.id, section.dataset.menuSection) === 'ready').length;
    const firstMissing = sections.find((section) => getMenuCrudSectionStatus(form.id, section.dataset.menuSection) === 'missing')?.dataset.menuSection || '';

    const titleEl = document.getElementById(`${form.id}NavTitle`);
    if (titleEl) titleEl.textContent = getMenuCrudSectionLabel(form.id, activeSectionId);

    const hintEl = document.getElementById(`${form.id}NavHint`);
    if (hintEl) {
        hintEl.textContent = `Step ${activeIndex + 1} of ${total} · ${readyCount} ${readyCount === 1 ? 'section' : 'sections'} ready`;
    }

    const prevBtn = document.getElementById(`${form.id}PrevBtn`);
    if (prevBtn) {
        prevBtn.disabled = activeIndex <= 0;
    }

    const nextBtn = document.getElementById(`${form.id}PrimaryBtn`);
    if (!nextBtn) return;
    if (activeIndex < total - 1) {
        nextBtn.disabled = false;
        nextBtn.dataset.mode = 'next';
        nextBtn.textContent = 'Continue';
    } else if (firstMissing && firstMissing !== activeSectionId) {
        nextBtn.disabled = false;
        nextBtn.dataset.mode = 'missing';
        nextBtn.textContent = 'Finish missing step';
    } else {
        nextBtn.disabled = false;
        nextBtn.dataset.mode = 'save';
        nextBtn.textContent = nextBtn.dataset.saveLabel || 'Save';
    }
}

window.handleMenuCrudPrimaryAction = function (formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const button = document.getElementById(`${formId}PrimaryBtn`);
    const mode = button?.dataset.mode || 'next';

    if (mode === 'save') {
        setMenuCrudValidationState(formId, {});
        if (typeof form.requestSubmit === 'function') {
            form.requestSubmit();
        } else {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
        return;
    }

    if (mode === 'missing') {
        const sections = getMenuCrudSections(form);
        const firstMissing = sections.find((section) => getMenuCrudSectionStatus(formId, section.dataset.menuSection) === 'missing');
        if (firstMissing) {
            const missingSectionId = firstMissing.dataset.menuSection;
            const target = getMenuCrudMissingTarget(formId, missingSectionId);
            const message = target.message || `Complete the ${getMenuCrudSectionLabel(formId, missingSectionId).toLowerCase()} section before saving.`;
            setMenuCrudValidationState(formId, { message, sectionId: missingSectionId, fieldId: target.fieldId || '' });
            showToast(message);
            if (target.fieldId) {
                focusMenuCrudField(formId, missingSectionId, target.fieldId);
            } else {
                activateMenuCrudSection(formId, missingSectionId);
            }
            return;
        }
    }

    stepMenuCrudSection(formId, 1);
};

function refreshMenuCrudFormUx(target) {
    const form = typeof target === 'string' ? document.getElementById(target) : target;
    if (!form) return;
    refreshMenuCrudSectionButtons(form);
    if (form.id === 'foodForm') {
        refreshTranslationSummary('item');
        refreshFoodFormReview();
        const galleryBtn = document.getElementById('itemOpenGalleryBtn');
        if (galleryBtn) {
            galleryBtn.disabled = !editingItemId;
            galleryBtn.textContent = editingItemId ? 'Open image manager' : 'Save once to manage gallery';
        }
    } else if (form.id === 'catForm') {
        refreshTranslationSummary('category');
        const hasImage = Boolean(String(document.getElementById('catImage')?.value || '').trim())
            || Boolean(document.getElementById('catImageUpload')?.files?.length);
        setMenuCrudMetaText('catFormMetaState', document.getElementById('catEditingKey')?.value ? 'Editing category' : 'Category draft');
        setMenuCrudMetaText('catFormMetaVisual', hasImage ? 'Image ready' : 'Image optional');
    } else if (form.id === 'superCatForm') {
        refreshTranslationSummary('supercategory');
        const selectedCount = Array.from(document.querySelectorAll('.sc-cat-check:checked')).length;
        setMenuCrudMetaText('superCatFormMetaState', selectedCount > 0 ? `${selectedCount} categories linked` : 'Structure draft');
    }
    renderMenuCrudValidationState(form.id);
    syncMenuCrudFooter(form);
}

function setMenuCrudValidationMessage(formId, message = '') {
    const note = document.getElementById(`${formId}ValidationNote`);
    if (!note) return;
    const nextMessage = String(message || '').trim();
    if (!nextMessage) {
        note.hidden = true;
        note.innerHTML = '';
        return;
    }
    note.hidden = false;
    note.innerHTML = `<strong>Needs attention</strong><span>${escapeHtml(nextMessage)}</span>`;
}

function clearMenuCrudFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.querySelectorAll('.field-invalid').forEach((field) => {
            field.classList.remove('field-invalid');
            field.removeAttribute('aria-invalid');
        });
        form.querySelectorAll('.form-group.has-error').forEach((group) => group.classList.remove('has-error'));
    }
    document.querySelectorAll(`.menu-crud-step-btn[data-form-id="${formId}"]`).forEach((button) => {
        button.classList.remove('has-error');
    });
}

function renderMenuCrudValidationState(formId) {
    clearMenuCrudFieldErrors(formId);
    const state = menuCrudValidationState[formId];
    if (!state?.message) return;
    if (state.sectionId) {
        const stepButton = document.querySelector(`.menu-crud-step-btn[data-form-id="${formId}"][data-section-target="${state.sectionId}"]`);
        stepButton?.classList.add('has-error');
    }
    if (state.fieldId) {
        const field = document.getElementById(state.fieldId);
        if (field) {
            field.classList.add('field-invalid');
            field.setAttribute('aria-invalid', 'true');
            field.closest('.form-group')?.classList.add('has-error');
        }
    }
}

function setMenuCrudValidationState(formId, { message = '', sectionId = '', fieldId = '' } = {}) {
    const nextMessage = String(message || '').trim();
    if (!nextMessage) {
        menuCrudValidationState[formId] = null;
        setMenuCrudValidationMessage(formId, '');
        clearMenuCrudFieldErrors(formId);
        return;
    }
    menuCrudValidationState[formId] = { message: nextMessage, sectionId, fieldId };
    setMenuCrudValidationMessage(formId, nextMessage);
    renderMenuCrudValidationState(formId);
}

function focusMenuCrudField(formId, sectionId, fieldId) {
    activateMenuCrudSection(formId, sectionId, false);
    const field = document.getElementById(fieldId);
    if (!field) return;
    let detailsParent = field.closest('details');
    while (detailsParent) {
        detailsParent.open = true;
        detailsParent = detailsParent.parentElement?.closest?.('details') || null;
    }
    const isFocusable = typeof field.matches === 'function'
        && field.matches('input, select, textarea, button, [href], [tabindex]');
    if (!isFocusable && !field.hasAttribute('tabindex')) {
        field.setAttribute('tabindex', '-1');
    }
    requestAnimationFrame(() => {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof field.focus === 'function') field.focus();
    });
}

function setMenuCrudPrimaryButtonState(formId, state) {
    const form = document.getElementById(formId);
    const button = document.getElementById(`${formId}PrimaryBtn`);
    const footer = document.getElementById(getMenuCrudFooterId(formId));
    const cancelButton = footer?.querySelector('.menu-crud-cancel-btn');
    if (!button) return;

    if (!button.dataset.defaultLabel) {
        button.dataset.defaultLabel = button.textContent.trim() || 'Continue';
    }

    if (state === 'saving') {
        button.disabled = true;
        button.textContent = 'Saving...';
        if (cancelButton) cancelButton.disabled = true;
        return;
    }

    if (state === 'saved') {
        button.disabled = false;
        button.textContent = 'Saved';
        if (cancelButton) cancelButton.disabled = false;
        return;
    }

    button.disabled = false;
    if (cancelButton) cancelButton.disabled = false;
    syncMenuCrudFooter(form);
}

function initializeMenuCrudFormEnhancements(form) {
    if (!form) return;
    decorateRequiredMenuCrudLabels(form);
    if (!form.dataset.menuUxBound) {
        form.addEventListener('input', () => {
            setMenuCrudValidationState(form.id, {});
            refreshMenuCrudFormUx(form);
        });
        form.addEventListener('change', () => {
            setMenuCrudValidationState(form.id, {});
            refreshMenuCrudFormUx(form);
        });
        form.dataset.menuUxBound = 'true';
    }
    const defaultSection = MENU_CRUD_FORM_DEFAULT_SECTIONS[form.id];
    if (defaultSection) activateMenuCrudSection(form.id, defaultSection, false);
    refreshMenuCrudFormUx(form);
}

window.activateMenuCrudSection = function (formId, sectionId, shouldScroll = true) {
    const form = document.getElementById(formId);
    if (!form) return;
    const sections = getMenuCrudSections(form);
    sections.forEach((section) => {
        section.classList.toggle('is-active', section.dataset.menuSection === sectionId);
    });
    document.querySelectorAll(`.menu-crud-step-btn[data-form-id="${formId}"]`).forEach((button) => {
        button.classList.toggle('is-active', button.dataset.sectionTarget === sectionId);
    });
    if (shouldScroll) {
        const targetSection = sections.find((section) => section.dataset.menuSection === sectionId);
        targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    refreshMenuCrudFormUx(form);
};

window.stepMenuCrudSection = function (formId, direction) {
    const form = document.getElementById(formId);
    if (!form) return;
    const sections = getMenuCrudSections(form);
    if (!sections.length) return;
    const activeSectionId = getActiveMenuCrudSectionId(form);
    const activeIndex = Math.max(0, sections.findIndex((section) => section.dataset.menuSection === activeSectionId));
    if (direction < 0) {
        const previous = sections[activeIndex - 1];
        if (previous) {
            activateMenuCrudSection(formId, previous.dataset.menuSection);
        }
        return;
    }

    const next = sections[activeIndex + 1];
    if (next) {
        activateMenuCrudSection(formId, next.dataset.menuSection);
        return;
    }

    const firstMissing = sections.find((section) => getMenuCrudSectionStatus(formId, section.dataset.menuSection) === 'missing');
    if (firstMissing && firstMissing.dataset.menuSection !== activeSectionId) {
        activateMenuCrudSection(formId, firstMissing.dataset.menuSection);
    }
};

window.toggleTranslationEditor = function (entityType) {
    const config = MENU_TRANSLATION_ENTITY_CONFIG[entityType];
    if (!config) return;
    const disclosure = document.getElementById(config.disclosureId);
    if (!disclosure) return;
    disclosure.open = !disclosure.open;
    if (disclosure.open) {
        disclosure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

window.openItemImageManagerFromForm = function () {
    if (!editingItemId) {
        showToast('Save the dish first, then open the full image manager.');
        return;
    }
    openImageModal(editingItemId);
};

window.generateEntityTranslations = async function (entityType) {
    if (!adminCapabilities.aiMediaToolsEnabled) {
        showToast('AI generation is disabled.');
        return;
    }
    const config = MENU_TRANSLATION_ENTITY_CONFIG[entityType];
    if (!config) return;

    let payload = {};
    let title = 'Generating translations';
    let copy = 'The admin is creating customer-facing labels across French, English, and Arabic.';
    if (entityType === 'item') {
        const fallbackName = document.getElementById('itemName')?.value?.trim() || '';
        if (!fallbackName) {
            showToast('Default dish name is required before generating translations.');
            return;
        }
        payload = {
            entityType: 'item',
            fallbackName,
            fallbackDesc: document.getElementById('itemDesc')?.value?.trim() || '',
            categoryName: typeof window.getLocalizedCategoryName === 'function'
                ? window.getLocalizedCategoryName(document.getElementById('itemCat')?.value || '', document.getElementById('itemCat')?.value || '')
                : (document.getElementById('itemCat')?.value || ''),
            existingTranslations: buildMenuItemTranslations()
        };
        title = 'Generating dish translations';
    } else if (entityType === 'category') {
        const fallbackName = document.getElementById('catName')?.value?.trim() || '';
        if (!fallbackName) {
            showToast('Category name is required before generating translations.');
            return;
        }
        const selectedSuperCategoryId = document.getElementById('catSuperCategory')?.value?.trim() || '';
        const selectedSuperCategory = (restaurantConfig.superCategories || []).find((entry) => entry.id === selectedSuperCategoryId);
        payload = {
            entityType: 'category',
            fallbackName,
            superCategoryName: selectedSuperCategory?.name || '',
            existingTranslations: buildCategoryTranslations(fallbackName),
            sampleItems: menu.filter((item) => item.cat === fallbackName).slice(0, 4).map((item) => getAdminItemDisplayName(item))
        };
        title = 'Generating category translations';
    } else {
        const fallbackName = document.getElementById('scName')?.value?.trim() || '';
        if (!fallbackName) {
            showToast('Super category name is required before generating translations.');
            return;
        }
        payload = {
            entityType: 'supercategory',
            fallbackName,
            fallbackDesc: document.getElementById('scDesc')?.value?.trim() || '',
            existingTranslations: buildSuperCategoryTranslations(fallbackName, document.getElementById('scDesc')?.value?.trim() || ''),
            includedCategories: Array.from(document.querySelectorAll('.sc-cat-check:checked')).map((entry) => entry.value)
        };
        title = 'Generating group translations';
    }

    const buttonEl = document.getElementById(config.buttonId);
    const originalLabel = buttonEl?.textContent || 'Generate with AI';
    if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'Generating...';
    }
    setAdminTaskOverlay({
        badge: 'AI labels',
        title,
        copy,
        progress: 54,
        stage: 'Translation generation',
        hint: 'The admin is locked while AI prepares the customer-facing labels.'
    });

    try {
        const response = await fetch('/api/ai/translate-menu-entity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.translations) {
            throw new Error(data.error || 'AI translation generation failed.');
        }

        if (entityType === 'item') {
            setMenuItemTranslationFields(data.translations);
        } else if (entityType === 'category') {
            setCategoryTranslationFieldsFromTranslations(data.translations, document.getElementById('catName')?.value?.trim() || '');
        } else {
            setSuperCategoryTranslationFields(data.translations, document.getElementById('scName')?.value?.trim() || '', document.getElementById('scDesc')?.value?.trim() || '');
        }

        setMenuTranslationWarnings(entityType, data.warnings || []);
        activateMenuCrudSection(config.formId, 'labels', false);
        const disclosure = document.getElementById(config.disclosureId);
        if (disclosure) {
            disclosure.open = true;
            disclosure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        refreshMenuCrudFormUx(config.formId);
        showToast(data.warnings?.length ? 'Translations generated. Review the wording before saving.' : 'Translations generated.');
    } catch (error) {
        console.error('AI translation generation error:', error);
        const message = getLongTaskConflictMessage(error) || (error?.message === 'openai_not_configured'
            ? 'Set OPENAI_API_KEY before using AI translation generation.'
            : error.message);
        showToast(`AI translation generation failed: ${message}`);
    } finally {
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.textContent = originalLabel;
        }
        setAdminTaskOverlay(null);
    }
};

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
        categoryImages = data.categoryImages && typeof data.categoryImages === 'object'
            ? data.categoryImages
            : (window.defaultCategoryImages || {});
        window.categoryImages = categoryImages;
        categoryTranslations = data.categoryTranslations && typeof data.categoryTranslations === 'object'
            ? data.categoryTranslations
            : (window.defaultCategoryTranslations || {});

        // Populate config from server data
        if (typeof window.mergeRestaurantConfig === 'function') {
            window.mergeRestaurantConfig({
                superCategories: Array.isArray(data.superCategories) ? data.superCategories : restaurantConfig.superCategories,
                wifi: data.wifi ? { name: data.wifi.ssid || '', code: data.wifi.pass || '' } : restaurantConfig.wifi,
                socials: data.social || restaurantConfig.socials,
                guestExperience: data.guestExperience || restaurantConfig.guestExperience,
                sectionVisibility: data.sectionVisibility || restaurantConfig.sectionVisibility,
                sectionOrder: data.sectionOrder || restaurantConfig.sectionOrder,
                categoryTranslations: data.categoryTranslations || restaurantConfig.categoryTranslations,
                location: data.landing?.location || restaurantConfig.location,
                phone: data.landing?.phone || restaurantConfig.phone,
                _hours: Array.isArray(data.hours) ? data.hours : restaurantConfig._hours,
                _hoursNote: typeof data.hoursNote === 'string' ? data.hoursNote : restaurantConfig._hoursNote,
                gallery: Array.isArray(data.gallery) ? data.gallery : restaurantConfig.gallery,
                branding: data.branding || restaurantConfig.branding,
                contentTranslations: data.contentTranslations || restaurantConfig.contentTranslations
            });
            restaurantConfig = window.restaurantConfig;
            categoryTranslations = restaurantConfig.categoryTranslations || categoryTranslations;
        }
        if (data.promoId !== undefined) {
            promoIds = data.promoId ? [data.promoId] : [];
        }
        if (Array.isArray(data.promoIds)) {
            promoIds = data.promoIds;
        }
        window.promoIds = promoIds; // Sync for shared.js

        console.log('[ADMIN] Loaded', menu.length, 'items from server');
        return true;
    } catch (e) {
        console.error('[ADMIN] Failed to load data from server:', e);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const websiteHomeLink = document.querySelector('.back-btn');
    if (websiteHomeLink) websiteHomeLink.setAttribute('href', '/');
    syncAdminAppShell();
    document.body.classList.remove('is-authenticated');

    window.addEventListener('online', () => {
        syncAdminConnectionBadge();
        showToast(getAdminConnectionCopy().onlineToast);
    });

    window.addEventListener('offline', () => {
        syncAdminConnectionBadge();
        showToast(getAdminConnectionCopy().offlineToast);
    });

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredAdminInstallPrompt = event;
        updateAdminInstallUi();
    });

    window.addEventListener('appinstalled', () => {
        deferredAdminInstallPrompt = null;
        updateAdminInstallUi();
        showToast(getAdminPwaCopy().installedToast);
    });
    window.addEventListener('beforeunload', (event) => {
        refreshMenuCrudDirtyState();
        if (!importStudioBusy && !activeImporterJobId && !document.body.classList.contains('admin-task-busy') && !menuCrudDirty) return;
        event.preventDefault();
        event.returnValue = '';
    });

    if (typeof window.matchMedia === 'function') {
        const standaloneMedia = window.matchMedia('(display-mode: standalone)');
        if (typeof standaloneMedia.addEventListener === 'function') {
            standaloneMedia.addEventListener('change', updateAdminInstallUi);
        }
    }
    // Check if we already have a valid session
    await checkSession();

    // Allow Enter key on login
    document.getElementById('loginPass').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performAdminLogin();
    });
    document.getElementById('loginUser').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('loginPass').focus();
    });
    bindCategoryImageFormEvents();
    updateCategoryImagePreview();
    await registerAdminPwa();
});

window.installAdminApp = async function () {
    if (deferredAdminInstallPrompt) {
        deferredAdminInstallPrompt.prompt();
        try {
            await deferredAdminInstallPrompt.userChoice;
        } catch (_error) {
            // Ignore prompt choice errors; UI will be refreshed below.
        }
        deferredAdminInstallPrompt = null;
        updateAdminInstallUi();
        return;
    }

    if (isIosStandaloneCapable() && !isAdminStandaloneMode()) {
        showToast(getAdminPwaCopy().iosCopy);
        return;
    }

    if (isAndroidLike()) {
        showToast(getAdminInstallFallbackCopy().copy);
        return;
    }

    showToast(getAdminPwaCopy().desktopHint);
};

async function checkSession() {
    try {
        const res = await fetch('/api/admin/session', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.authenticated) {
            console.log('[ADMIN] Session valid. Auto-logging in...');
            showDashboard();
        }
    } catch (e) {
        console.error('[ADMIN] Session check error:', e);
    }
}

function renderAdminSaveState() {
    const el = document.getElementById('adminSaveStatus');
    if (!el) {
        syncAdminMobileSaveBadge();
        return;
    }

    const palette = {
        idle: { bg: '#f5f5f5', color: '#555', dot: '#999', label: t('admin.save_state.idle_label', 'Ready') },
        saving: { bg: '#fff6db', color: '#8a5a00', dot: '#f59e0b', label: t('admin.save_state.saving_label', 'Saving') },
        success: { bg: '#e9f9ef', color: '#166534', dot: '#10b981', label: t('admin.save_state.success_label', 'Saved') },
        error: { bg: '#fdeaea', color: '#991b1b', dot: '#ef4444', label: t('admin.save_state.error_label', 'Attention') }
    };
    const style = palette[adminSaveState.type] || palette.idle;
    const message = adminSaveState.message || t('admin.save_state.idle_message', 'No server save yet in this session.');
    const timeText = adminSaveState.updatedAt
        ? new Date(adminSaveState.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    el.style.background = style.bg;
    el.style.color = style.color;
    el.innerHTML = `
        <span class="admin-save-status-dot" style="background:${style.dot};"></span>
        <span>${style.label}: ${message}${timeText ? ` (${timeText})` : ''}</span>
    `;
    syncAdminMobileSaveBadge();
}

function setAdminSaveState(type, message) {
    adminSaveState = {
        type,
        message,
        updatedAt: new Date().toISOString()
    };
    renderAdminSaveState();
}

function isInfoSection(sectionId) {
    return INFO_SECTION_IDS.includes(sectionId);
}

function isBrandingSection(sectionId) {
    return BRANDING_SECTION_IDS.includes(sectionId);
}

function isMenuWorkspaceSection(sectionId) {
    return MENU_WORKSPACE_SECTION_IDS.includes(sectionId);
}

function resolveTopLevelSection(sectionId) {
    if (isMenuWorkspaceSection(sectionId)) return 'menu';
    if (isInfoSection(sectionId)) return 'info';
    if (isBrandingSection(sectionId)) return 'branding';
    return sectionId;
}

function getMenuWorkspaceStepForSection(sectionId) {
    if (sectionId === 'supercategories') return 'supercategories';
    if (sectionId === 'categories') return 'categories';
    if (sectionId === 'menu') return currentMenuWorkspaceStep || 'supercategories';
    return 'items';
}

function getSectionTitle(sectionId) {
    const titles = {
        menu: 'Menu',
        info: 'Info',
        branding: 'Branding',
        'data-tools': 'Import'
    };

    return titles[sectionId] || 'Menu';
}

function renderParameterShells() {
    const shells = Array.from(document.querySelectorAll('[data-parameter-shell]'));
    if (shells.length === 0) return;
    shells.forEach((shell) => {
        shell.innerHTML = '';
        shell.style.display = 'none';
    });
}

function syncParameterTabs() {
}

function moveSectionChildren(sourceId, targetId) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (!source || !target || target.dataset.mounted === 'true') return;

    Array.from(source.children).forEach((child) => {
        if (child.hasAttribute('data-parameter-shell')) return;
        target.appendChild(child);
    });

    target.dataset.mounted = 'true';
}

function moveSectionContentToHost(sourceId, targetId, skipSelectors = []) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (!source || !target || target.dataset.mounted === 'true') return;

    Array.from(source.children).forEach((child) => {
        if (child.hasAttribute('data-parameter-shell')) return;
        if (skipSelectors.some((selector) => child.matches(selector))) return;
        target.appendChild(child);
    });

    target.dataset.mounted = 'true';
}

function moveDisclosureBodyContentToHost(sourceId, targetId) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (!source || !target || target.dataset.mounted === 'true') return;

    const body = source.querySelector('.admin-disclosure-body');
    if (!body) {
        moveNodeToHost(sourceId, targetId);
        target.dataset.mounted = 'true';
        return;
    }

    Array.from(body.children).forEach((child) => {
        target.appendChild(child);
    });

    target.dataset.mounted = 'true';
}

function moveNodeToHost(nodeId, hostId) {
    const node = document.getElementById(nodeId);
    const host = document.getElementById(hostId);
    if (!node || !host) return;
    if (node.parentElement !== host) {
        host.appendChild(node);
    }
}

function mountOwnerAdminLayout() {
    moveSectionChildren('supercategories', 'menuSuperCategoryMount');
    moveSectionChildren('categories', 'menuCategoryMount');
    moveNodeToHost('landingContactBlock', 'infoLandingPrimaryMount');
    moveDisclosureBodyContentToHost('landingSocialBlock', 'infoLandingSocialMount');
    moveDisclosureBodyContentToHost('landingFacilitiesBlock', 'infoLandingFacilitiesMount');
    moveSectionContentToHost('hours', 'infoHoursMount', ['h3', 'p']);
    moveSectionContentToHost('wifi', 'infoWifiMount', ['h3', 'p']);
    moveSectionContentToHost('security', 'infoSecurityMount', ['h3', 'p']);
    moveNodeToHost('landingLayoutBlock', 'brandingHomepageLayoutMount');
    moveNodeToHost('landingCopyBlock', 'brandingHomepageCopyMount');
    moveSectionChildren('gallery', 'brandingGalleryMount');
    mountMenuCrudForms();
}

function syncMenuWorkspaceStepButtons() {
    MENU_WORKSPACE_STEPS.forEach((step) => {
        const button = document.getElementById(`menuWorkspaceBtn-${step}`);
        const panel = document.getElementById(`menuStepPanel-${step}`);
        if (button) {
            button.classList.toggle('active', step === currentMenuWorkspaceStep);
        }
        if (panel) {
            panel.classList.toggle('active', step === currentMenuWorkspaceStep);
        }
    });
}

function syncBrandingWorkspaceTabs() {
    BRANDING_WORKSPACE_TABS.forEach((tab) => {
        const button = document.getElementById(`brandingTabBtn-${tab}`);
        const panel = document.getElementById(`brandingPanel-${tab}`);
        if (button) {
            button.classList.toggle('active', tab === currentBrandingWorkspaceTab);
        }
        if (panel) {
            panel.classList.toggle('active', tab === currentBrandingWorkspaceTab);
        }
    });
}

window.setMenuWorkspaceStep = function (step) {
    if (!MENU_WORKSPACE_STEPS.includes(step)) return;
    currentMenuWorkspaceStep = step;
    syncMenuWorkspaceStepButtons();
};

window.setBrandingWorkspaceTab = function (tab) {
    if (!BRANDING_WORKSPACE_TABS.includes(tab)) return;
    currentBrandingWorkspaceTab = tab;
    syncBrandingWorkspaceTabs();
};

function scrollToAdminSubsection(sectionId) {
    const subsection = document.querySelector(`[data-admin-subsection="${sectionId}"]`);
    if (subsection) {
        if (subsection.tagName === 'DETAILS') {
            subsection.open = true;
        }
        subsection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function mountNodeIntoHost(nodeId, hostId) {
    const node = document.getElementById(nodeId);
    const host = document.getElementById(hostId);
    const modalBody = document.getElementById('menuCrudModalBody');
    if (!node || !host) return;
    if (modalBody && modalBody.contains(node)) return;
    if (node.parentElement !== host) {
        host.appendChild(node);
    }
}

function getMenuCrudFooterId(formId) {
    return `${formId}Footer`;
}

function restoreMenuCrudFooter(formId) {
    const form = document.getElementById(formId);
    const footer = document.getElementById(getMenuCrudFooterId(formId));
    if (!form || !footer || footer.parentElement === form) return;
    form.appendChild(footer);
}

function mountMenuCrudForms() {
    ['superCatForm', 'catForm', 'foodForm'].forEach((formId) => restoreMenuCrudFooter(formId));
    mountNodeIntoHost('superCatForm', 'menuCrudSuperHost');
    mountNodeIntoHost('catForm', 'menuCrudCategoryHost');
    mountNodeIntoHost('foodForm', 'menuCrudItemHost');
    ['superCatForm', 'catForm', 'foodForm'].forEach((formId) => {
        const form = document.getElementById(formId);
        if (form) initializeMenuCrudFormEnhancements(form);
    });
}

function getAdminMenuSuperCategoryRows() {
    const configured = Array.isArray(restaurantConfig.superCategories) ? restaurantConfig.superCategories : [];
    const categoryKeys = Object.keys(catEmojis || {});
    const assigned = new Set(configured.flatMap((entry) => Array.isArray(entry.cats) ? entry.cats : []));
    const rows = configured.map((entry) => ({ ...entry, isVirtual: false }));
    const unassigned = categoryKeys.filter((cat) => !assigned.has(cat));

    if (unassigned.length > 0) {
        rows.push({
            id: '__unassigned__',
            name: 'Unassigned Categories',
            desc: 'Categories not linked to a super category yet.',
            emoji: '🧩',
            cats: unassigned,
            time: '',
            isVirtual: true
        });
    }

    return rows;
}

function getMenuBuilderCurrentSuperCategory() {
    const rows = getAdminMenuSuperCategoryRows();
    return rows.find((row) => row.id === menuBuilderSelectedSuperCategoryId) || null;
}

function getMenuBuilderCurrentCategories() {
    const superCategory = getMenuBuilderCurrentSuperCategory();
    if (!superCategory) return [];
    const categoryKeys = Array.isArray(superCategory.cats) ? superCategory.cats : [];
    return categoryKeys
        .map((catKey) => ({
            key: catKey,
            emoji: catEmojis?.[catKey] || ADMIN_ICON.bullet,
            name: window.getLocalizedCategoryName(catKey, catKey),
            itemCount: menu.filter((item) => item.cat === catKey).length
        }))
        .sort((left, right) => left.name.localeCompare(right.name));
}

function getMenuBuilderCurrentItems() {
    if (!menuBuilderSelectedCategoryKey) return [];
    return menu
        .filter((item) => item.cat === menuBuilderSelectedCategoryKey)
        .sort((left, right) => getAdminItemDisplayName(left).localeCompare(getAdminItemDisplayName(right)));
}

function formatMenuBuilderCategoryPreview(categoryKeys = [], maxVisible = 2) {
    const keys = Array.isArray(categoryKeys) ? categoryKeys.filter(Boolean) : [];
    if (!keys.length) return '';
    const visible = keys
        .slice(0, maxVisible)
        .map((catKey) => window.getLocalizedCategoryName(catKey, catKey));
    const remaining = keys.length - visible.length;
    return remaining > 0
        ? `${visible.join(' • ')} • +${remaining} more`
        : visible.join(' • ');
}

function resetMenuBuilderNavigation() {
    currentMenuWorkspaceStep = 'supercategories';
    menuBuilderSelectedSuperCategoryId = '';
    menuBuilderSelectedCategoryKey = '';
}

function serializeMenuCrudForm(form) {
    if (!form) return '';
    const fields = Array.from(form.querySelectorAll('input, select, textarea')).map((field) => {
        const key = field.id || field.name || field.className || field.tagName;
        if (field.type === 'file') {
            return `${key}::files=${field.files?.length || 0}`;
        }
        if (field.type === 'checkbox' || field.type === 'radio') {
            return `${key}::checked=${field.checked ? '1' : '0'}`;
        }
        return `${key}::value=${field.value || ''}`;
    });
    return JSON.stringify(fields);
}

function refreshMenuCrudDirtyState() {
    if (!menuCrudTrackedFormId) {
        menuCrudDirty = false;
        return;
    }
    const form = document.getElementById(menuCrudTrackedFormId);
    if (!form) {
        menuCrudDirty = false;
        return;
    }
    menuCrudDirty = serializeMenuCrudForm(form) !== menuCrudBaselineState;
}

function startMenuCrudDirtyTracking(form) {
    if (!form) return;
    if (!form.dataset.dirtyBound) {
        form.addEventListener('input', refreshMenuCrudDirtyState);
        form.addEventListener('change', refreshMenuCrudDirtyState);
        form.dataset.dirtyBound = 'true';
    }
    menuCrudTrackedFormId = form.id || '';
    menuCrudBaselineState = serializeMenuCrudForm(form);
    menuCrudDirty = false;
}

function clearMenuCrudDirtyTracking() {
    menuCrudTrackedFormId = '';
    menuCrudBaselineState = '';
    menuCrudDirty = false;
}

function getMenuBuilderSetupState() {
    const branding = restaurantConfig?.branding || {};
    const defaultBranding = window.defaultBranding || {};
    const configuredSuperCategories = (restaurantConfig.superCategories || []).filter((entry) => !entry?.isVirtual);
    const categoryKeys = Object.keys(catEmojis || {});
    const menuCount = Array.isArray(menu) ? menu.length : 0;
    const hasBranding =
        (typeof branding.restaurantName === 'string' && branding.restaurantName.trim() && branding.restaurantName !== defaultBranding.restaurantName)
        || (typeof branding.logoImage === 'string' && branding.logoImage.trim())
        || (typeof branding.heroImage === 'string' && branding.heroImage.trim());

    return {
        hasBranding: Boolean(hasBranding),
        hasSuperCategories: configuredSuperCategories.length > 0,
        hasCategories: categoryKeys.length > 0,
        hasItems: menuCount > 0,
        firstSuperCategoryId: configuredSuperCategories[0]?.id || '',
        firstCategoryKey: categoryKeys[0] || '',
        superCategoryCount: configuredSuperCategories.length,
        categoryCount: categoryKeys.length,
        itemCount: menuCount
    };
}

function getMenuBuilderItemsForCategories(categoryKeys = []) {
    const keys = new Set(Array.isArray(categoryKeys) ? categoryKeys.filter(Boolean) : []);
    if (!keys.size) return [];
    return (Array.isArray(menu) ? menu : []).filter((item) => keys.has(item?.cat));
}

function getMenuBuilderCategoryImageCount(categoryKeys = []) {
    return (Array.isArray(categoryKeys) ? categoryKeys : []).filter((key) => {
        const image = typeof categoryImages?.[key] === 'string' ? categoryImages[key].trim() : '';
        return Boolean(image);
    }).length;
}

function renderMenuBuilderOverview() {
    const overviewEl = document.getElementById('menuBuilderOverview');
    if (!overviewEl) return;

    const state = getMenuBuilderSetupState();
    const currentSuperCategory = getMenuBuilderCurrentSuperCategory();
    const currentCategoryKey = menuBuilderSelectedCategoryKey || '';
    const currentCategoryName = currentCategoryKey
        ? window.getLocalizedCategoryName(currentCategoryKey, currentCategoryKey)
        : '';
    const unassignedCount = getAdminMenuSuperCategoryRows().find((entry) => entry.id === '__unassigned__')?.cats?.length || 0;
    const stageCards = [
        {
            value: state.superCategoryCount,
            label: 'Super Categories',
            note: state.superCategoryCount ? 'Top-level groups ready' : 'No groups yet'
        },
        {
            value: state.categoryCount,
            label: 'Categories',
            note: state.categoryCount ? 'Linked into the menu tree' : 'No categories yet'
        },
        {
            value: state.itemCount,
            label: 'Dishes',
            note: state.itemCount ? 'Visible in the workspace' : 'No dishes yet'
        },
        {
            value: currentMenuWorkspaceStep === 'supercategories'
                ? 'Map'
                : currentMenuWorkspaceStep === 'categories'
                    ? 'Browse'
                    : 'Fill',
            label: 'Current Focus',
            note: currentMenuWorkspaceStep === 'supercategories'
                ? 'Shape the menu structure'
                : currentMenuWorkspaceStep === 'categories'
                    ? 'Organize sections'
                    : 'Edit sellable dishes'
        }
    ];

    let focusTitle = 'Shape the first customer choices';
    let focusCopy = 'Each super category should feel like a clear browsing path, not a loose label. Keep the structure small, deliberate, and easy to scan.';
    let focusPills = [
        `${state.superCategoryCount} groups`,
        `${state.categoryCount} categories`,
        `${state.itemCount} dishes`
    ];
    let focusNote = unassignedCount
        ? `<strong>Attention:</strong> ${unassignedCount} categor${unassignedCount > 1 ? 'ies are' : 'y is'} still outside a super category.`
        : '<strong>Ready:</strong> The top-level structure is connected. Add or refine groups as the menu grows.';
    let focusStateClass = state.hasSuperCategories ? 'is-ready' : '';

    if (currentMenuWorkspaceStep === 'categories') {
        const categoryKeys = Array.isArray(currentSuperCategory?.cats) ? currentSuperCategory.cats : [];
        const itemsInGroup = getMenuBuilderItemsForCategories(categoryKeys);
        const imageReadyCount = getMenuBuilderCategoryImageCount(categoryKeys);
        focusTitle = currentSuperCategory
            ? `Organize ${currentSuperCategory.name}`
            : 'Organize the selected super category';
        focusCopy = 'Categories should stay narrow and visual. Customers should understand each section without reading a long explanation.';
        focusPills = [
            `${categoryKeys.length} categor${categoryKeys.length === 1 ? 'y' : 'ies'}`,
            `${itemsInGroup.length} dishes`,
            `${imageReadyCount} backdrop${imageReadyCount === 1 ? '' : 's'} ready`
        ];
        focusNote = categoryKeys.length
            ? '<strong>Next:</strong> Open a category row to work on the actual dishes and featured status.'
            : '<strong>Next:</strong> Add the first category so the public menu can drill down into a real section.';
        focusStateClass = categoryKeys.length ? 'is-ready' : '';
    } else if (currentMenuWorkspaceStep === 'items') {
        const featuredCount = getMenuBuilderCurrentItems().filter((item) => item?.featured).length;
        const extrasCount = getMenuBuilderCurrentItems().filter((item) => Array.isArray(item?.extras) && item.extras.length).length;
        const unavailableCount = getMenuBuilderCurrentItems().filter((item) => item?.available === false).length;
        focusTitle = currentCategoryName
            ? `Fill ${currentCategoryName}`
            : 'Fill the active category';
        focusCopy = 'Use short names, honest prices, and reserve the featured marker for a few signature dishes. Keep hidden items deliberate.';
        focusPills = [
            `${getMenuBuilderCurrentItems().length} dishes`,
            `${featuredCount} featured`,
            `${extrasCount} with extras`
        ];
        focusNote = unavailableCount
            ? `<strong>Attention:</strong> ${unavailableCount} dish${unavailableCount > 1 ? 'es are' : ' is'} hidden from customers right now.`
            : '<strong>Ready:</strong> This category is visible. Open any row to update copy, pricing, media, or extras.';
        focusStateClass = getMenuBuilderCurrentItems().length ? 'is-ready' : '';
    }

    overviewEl.innerHTML = `
        <div class="menu-builder-summary-strip">
            ${stageCards.map((entry) => `
                <span class="menu-builder-summary-pill">
                    <strong>${escapeHtml(String(entry.value))}</strong>
                    <em>${escapeHtml(entry.label)}</em>
                </span>
            `).join('')}
        </div>
        <div class="menu-builder-focus-inline ${focusStateClass}">
            <div class="menu-builder-focus-inline-head">
                <span class="menu-builder-focus-kicker ${focusStateClass}">${escapeHtml(
                    currentMenuWorkspaceStep === 'supercategories'
                        ? 'Structure'
                        : currentMenuWorkspaceStep === 'categories'
                            ? 'Categories'
                            : 'Dishes'
                )}</span>
                <strong>${escapeHtml(focusTitle)}</strong>
            </div>
            <p class="menu-builder-focus-copy">${escapeHtml(focusCopy)}</p>
            <div class="menu-builder-focus-pills">${focusPills.map((pill) => `<span class="menu-builder-focus-pill">${escapeHtml(pill)}</span>`).join('')}</div>
            <div class="menu-builder-focus-note">${focusNote}</div>
        </div>
    `;
    initializeAdminHelpToggles();
}

function renderMenuBuilderEmptyState(emptyEl, options = {}) {
    if (!emptyEl) return;
    const {
        title = 'Nothing here yet.',
        copy = 'Add content to continue.',
        actionLabel = '',
        actionHandler = '',
        secondaryLabel = '',
        secondaryHandler = ''
    } = options;

    emptyEl.innerHTML = `
        <h4 class="menu-builder-empty-title">${escapeHtml(title)}</h4>
        <p class="menu-builder-empty-copy">${escapeHtml(copy)}</p>
        ${(actionLabel || secondaryLabel) ? `
            <div class="menu-builder-empty-actions">
                ${actionLabel ? `<button type="button" class="primary-btn btn-auto" onclick="${escapeHtmlAttr(actionHandler)}">${escapeHtml(actionLabel)}</button>` : ''}
                ${secondaryLabel ? `<button type="button" class="brand-secondary-btn btn-auto" onclick="${escapeHtmlAttr(secondaryHandler)}">${escapeHtml(secondaryLabel)}</button>` : ''}
            </div>
        ` : ''}
    `;
}

function renderMenuBuilderOnboarding() {
    const onboardingEl = document.getElementById('menuBuilderOnboarding');
    if (!onboardingEl) return;

    const state = getMenuBuilderSetupState();
    const showOnboarding = currentMenuWorkspaceStep === 'supercategories'
        && (!state.hasBranding || !state.hasSuperCategories || !state.hasCategories || !state.hasItems);

    onboardingEl.hidden = !showOnboarding;
    onboardingEl.classList.toggle('is-visible', showOnboarding);
    if (!showOnboarding) {
        onboardingEl.innerHTML = '';
        return;
    }

    const steps = [
        {
            title: 'Set the brand',
            copy: 'Add the restaurant name, logo, and hero image so the public site starts feeling real from the first visit.',
            complete: state.hasBranding
        },
        {
            title: 'Create super categories',
            copy: state.hasSuperCategories
                ? `${state.superCategoryCount} super categor${state.superCategoryCount > 1 ? 'ies are' : 'y is'} ready.`
                : 'These are the first groups customers open before they drill into categories.',
            complete: state.hasSuperCategories
        },
        {
            title: 'Add categories',
            copy: state.hasCategories
                ? `${state.categoryCount} categor${state.categoryCount > 1 ? 'ies are' : 'y is'} linked into the menu tree.`
                : 'Create the sections customers will browse inside each super category.',
            complete: state.hasCategories
        },
        {
            title: 'Publish the first dishes',
            copy: state.hasItems
                ? `${state.itemCount} item${state.itemCount > 1 ? 's are' : ' is'} already live in the menu workspace.`
                : 'Add at least one dish so the public menu can open into real content instead of an empty section.',
            complete: state.hasItems
        }
    ];

    onboardingEl.innerHTML = `
        <div class="menu-builder-onboarding-head">
            <span class="menu-builder-onboarding-kicker">Quick start</span>
            <h4 class="menu-builder-onboarding-title">Build the first version of the menu in four moves.</h4>
            <p class="menu-builder-onboarding-copy">This keeps the owner focused on the right order: identity first, structure second, dishes last. Nothing here changes the live site until the content is actually saved.</p>
        </div>
        <div class="menu-builder-onboarding-grid">
            ${steps.map((step, index) => `
                <article class="menu-builder-onboarding-step ${step.complete ? 'is-complete' : ''}">
                    <div class="menu-builder-onboarding-step-top">
                        <span class="menu-builder-onboarding-index">${index + 1}</span>
                        <span class="menu-builder-onboarding-state">${step.complete ? 'Ready' : 'Pending'}</span>
                    </div>
                    <h5>${escapeHtml(step.title)}</h5>
                    <p>${escapeHtml(step.copy)}</p>
                </article>
            `).join('')}
        </div>
        <div class="menu-builder-onboarding-actions">
            <button type="button" class="primary-btn btn-auto" onclick="openMenuBuilderSetupAction()">${escapeHtml(
                !state.hasBranding
                    ? 'Open Branding'
                    : !state.hasSuperCategories
                        ? 'Add Super Category'
                        : !state.hasCategories
                            ? 'Add Category'
                            : 'Add First Dish'
            )}</button>
            ${adminCapabilities.sellerToolsEnabled ? '<button type="button" class="brand-secondary-btn btn-auto" onclick="openMenuBuilderSetupAction(\'import\')">Open Import Studio</button>' : ''}
        </div>
    `;
    initializeAdminHelpToggles();
}

function renderMenuBuilder() {
    const table = document.getElementById('menuBuilderTable');
    const empty = document.getElementById('menuBuilderEmpty');
    const overview = document.getElementById('menuBuilderOverview');
    const title = document.getElementById('menuBuilderTitle');
    const copy = document.getElementById('menuBuilderCopy');
    const crumbs = document.getElementById('menuBuilderBreadcrumbs');
    const addBtn = document.getElementById('menuBuilderAddBtn');
    const backBtn = document.getElementById('menuBuilderBackBtn');
    const actions = document.querySelector('.menu-builder-actions');
    if (!table || !empty || !title || !copy || !crumbs || !addBtn || !backBtn || !actions) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    renderMenuBuilderOnboarding();

    if (currentMenuWorkspaceStep !== 'supercategories' && !getMenuBuilderCurrentSuperCategory()) {
        currentMenuWorkspaceStep = 'supercategories';
        menuBuilderSelectedSuperCategoryId = '';
        menuBuilderSelectedCategoryKey = '';
    }

    if (currentMenuWorkspaceStep === 'items' && !getMenuBuilderCurrentItems().length && menuBuilderSelectedCategoryKey) {
        const currentCategories = getMenuBuilderCurrentCategories().map((entry) => entry.key);
        if (!currentCategories.includes(menuBuilderSelectedCategoryKey)) {
            currentMenuWorkspaceStep = 'categories';
            menuBuilderSelectedCategoryKey = '';
        }
    }

    let rows = [];
    let columns = [];
    let addLabel = 'Add';
    let emptyText = '';
    const breadcrumbParts = ['Menu'];

    if (currentMenuWorkspaceStep === 'supercategories') {
        rows = getAdminMenuSuperCategoryRows();
        columns = ['Super Category', 'Includes', 'Actions'];
        addLabel = 'Add Super Category';
        emptyText = 'No super categories yet. Add one to structure the menu.';
        title.textContent = 'Super Categories';
        copy.textContent = 'Create the first menu level.';
    } else if (currentMenuWorkspaceStep === 'categories') {
        const superCategory = getMenuBuilderCurrentSuperCategory();
        rows = getMenuBuilderCurrentCategories();
        columns = ['Category', 'Items', 'Actions'];
        addLabel = 'Add Category';
        emptyText = 'This super category does not have categories yet.';
        title.textContent = superCategory ? `${superCategory.name} / Categories` : 'Categories';
        copy.textContent = 'Organize the sections inside this group.';
        if (superCategory) breadcrumbParts.push(superCategory.name);
    } else {
        const superCategory = getMenuBuilderCurrentSuperCategory();
        const categoryLabel = menuBuilderSelectedCategoryKey
            ? window.getLocalizedCategoryName(menuBuilderSelectedCategoryKey, menuBuilderSelectedCategoryKey)
            : 'Items';
        rows = getMenuBuilderCurrentItems();
        columns = ['Item', 'Price', 'Likes', 'Featured', 'Actions'];
        addLabel = 'Add Item';
        emptyText = 'No items in this category yet.';
        title.textContent = `${categoryLabel} / Items`;
        copy.textContent = 'Add dishes for this category.';
        if (superCategory) breadcrumbParts.push(superCategory.name);
        if (menuBuilderSelectedCategoryKey) breadcrumbParts.push(categoryLabel);
    }

    crumbs.innerHTML = breadcrumbParts.map((entry) => `<span class="menu-builder-crumb">${escapeHtml(entry)}</span>`).join('');
    table.dataset.step = currentMenuWorkspaceStep;
    addBtn.textContent = addLabel;
    backBtn.style.display = currentMenuWorkspaceStep === 'supercategories' ? 'none' : '';
    actions.classList.toggle('menu-builder-actions--single', currentMenuWorkspaceStep === 'supercategories');
    thead.innerHTML = `<tr>${columns.map((label) => `<th>${escapeHtml(label)}</th>`).join('')}</tr>`;
    if (overview) {
        renderMenuBuilderOverview();
    }

    if (rows.length === 0) {
        tbody.innerHTML = '';
        table.style.display = 'none';
        empty.style.display = 'block';
        renderMenuBuilderEmptyState(empty, currentMenuWorkspaceStep === 'supercategories'
            ? {
                title: 'Start the menu structure here.',
                copy: emptyText,
                actionLabel: 'Add Super Category',
                actionHandler: 'openMenuBuilderAdd()',
                secondaryLabel: adminCapabilities.sellerToolsEnabled ? 'Open Import Studio' : '',
                secondaryHandler: "openMenuBuilderSetupAction('import')"
            }
            : currentMenuWorkspaceStep === 'categories'
                ? {
                    title: 'This group still needs its first category.',
                    copy: emptyText,
                    actionLabel: 'Add Category',
                    actionHandler: 'openMenuBuilderAdd()'
                }
                : {
                    title: 'This category has no dishes yet.',
                    copy: emptyText,
                    actionLabel: 'Add First Dish',
                    actionHandler: 'openMenuBuilderAdd()'
                });
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    if (currentMenuWorkspaceStep === 'supercategories') {
        tbody.innerHTML = rows.map((entry) => {
            const inlineId = toInlineJsString(entry.id);
            const categoriesCount = Array.isArray(entry.cats) ? entry.cats.length : 0;
            const categoryNames = formatMenuBuilderCategoryPreview(entry.cats, 2);
            const dishesCount = getMenuBuilderItemsForCategories(entry.cats || []).length;
            return `
                <tr onclick='openMenuBuilderRow(${inlineId})'>
                    <td data-label="Super Category">
                        <div class="menu-builder-entry">
                            <span class="menu-builder-entry-emoji">${escapeHtml(entry.emoji || ADMIN_ICON.bullet)}</span>
                            <div class="menu-builder-entry-copy">
                                <strong>${escapeHtml(entry.name || 'Super Category')}</strong>
                                ${entry.desc ? `<div class="menu-builder-row-copy">${escapeHtml(entry.desc)}</div>` : ''}
                                <div class="menu-builder-entry-pills">
                                    ${entry.time ? `<span class="menu-builder-entry-pill">${escapeHtml(entry.time)}</span>` : ''}
                                    <span class="menu-builder-entry-pill ${entry.isVirtual ? 'is-attention' : 'is-ready'}">${entry.isVirtual ? 'Needs structure' : 'Structure ready'}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td data-label="Includes">
                        <div class="menu-builder-side-stack">
                            <span class="menu-builder-side-label">Coverage</span>
                            <span class="menu-builder-count-pill">${categoriesCount} categories</span>
                            <span class="menu-builder-stat-note ${dishesCount ? '' : 'is-muted'}">${dishesCount} dish${dishesCount === 1 ? '' : 'es'}</span>
                            ${categoryNames ? `<div class="menu-builder-row-note">${escapeHtml(categoryNames)}</div>` : ''}
                        </div>
                    </td>
                    <td data-label="Actions">
                        <div class="menu-builder-item-actions menu-builder-action-rail">
                            ${entry.isVirtual ? '' : `<button type="button" class="action-btn" title="Edit super category" aria-label="Edit super category" onclick='event.stopPropagation(); openMenuBuilderEdit("supercategory", ${inlineId})'>${ADMIN_ICON.edit}</button>`}
                            ${entry.isVirtual ? '' : `<button type="button" class="action-btn" title="Delete super category" aria-label="Delete super category" onclick='event.stopPropagation(); deleteSuperCat(${inlineId})'>${ADMIN_ICON.trash}</button>`}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        return;
    }

    if (currentMenuWorkspaceStep === 'categories') {
        tbody.innerHTML = rows.map((entry) => {
            const inlineKey = toInlineJsString(entry.key);
            const categoryImage = typeof categoryImages?.[entry.key] === 'string' ? categoryImages[entry.key].trim() : '';
            const featuredCount = menu.filter((item) => item.cat === entry.key && item.featured).length;
            const extrasCount = menu.filter((item) => item.cat === entry.key && Array.isArray(item.extras) && item.extras.length > 0).length;
            return `
                <tr onclick='openMenuBuilderCategory(${inlineKey})'>
                    <td data-label="Category">
                        <div class="menu-builder-entry">
                            ${categoryImage
                                ? `<span class="menu-builder-entry-thumb"><img src="${escapeHtml(categoryImage)}" alt="${escapeHtml(entry.name)}" loading="lazy" decoding="async"></span>`
                                : `<span class="menu-builder-entry-emoji">${escapeHtml(entry.emoji)}</span>`}
                            <div class="menu-builder-entry-copy">
                                <strong>${escapeHtml(entry.name)}</strong>
                                <div class="menu-builder-entry-pills">
                                    <span class="menu-builder-entry-pill ${categoryImage ? 'is-ready' : 'is-attention'}">${categoryImage ? 'Image ready' : 'Image missing'}</span>
                                    ${featuredCount ? `<span class="menu-builder-entry-pill">${featuredCount} featured</span>` : ''}
                                    ${extrasCount ? `<span class="menu-builder-entry-pill">${extrasCount} with extras</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td data-label="Items">
                        <div class="menu-builder-side-stack">
                            <span class="menu-builder-side-label">Category health</span>
                            <span class="menu-builder-count-pill">${entry.itemCount} items</span>
                            <span class="menu-builder-stat-note ${entry.itemCount ? '' : 'is-muted'}">${entry.itemCount ? 'Ready for editing' : 'Add first dish'}</span>
                            <div class="menu-builder-row-note">${entry.itemCount ? 'Open to adjust pricing, extras, or media.' : 'Open this category and add the first dish.'}</div>
                        </div>
                    </td>
                    <td data-label="Actions">
                        <div class="menu-builder-item-actions menu-builder-action-rail">
                            <button type="button" class="action-btn" title="Edit category image" aria-label="Edit category image" onclick='event.stopPropagation(); openMenuBuilderEdit("category", ${inlineKey})'>${ADMIN_ICON.image}</button>
                            <button type="button" class="action-btn" title="Edit category" aria-label="Edit category" onclick='event.stopPropagation(); openMenuBuilderEdit("category", ${inlineKey})'>${ADMIN_ICON.edit}</button>
                            <button type="button" class="action-btn" title="Delete category" aria-label="Delete category" onclick='event.stopPropagation(); deleteCat(${inlineKey})'>${ADMIN_ICON.trash}</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        return;
    }

    tbody.innerHTML = rows.map((item) => {
        const inlineId = toInlineJsString(item.id);
        const displayName = getAdminItemDisplayName(item);
        const displayDescription = getAdminItemDisplayDescription(item);
        const price = Number(item.price) || 0;
        const previewImage = (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.img) || '';
        const likes = Number(item.likes) || 0;
        const sizesCount = item.hasSizes && item.sizes
            ? Object.values(item.sizes).filter((value) => Number(value) > 0).length
            : 0;
        const extrasCount = Array.isArray(item.extras) ? item.extras.length : 0;
        const availabilityLabel = item.available === false ? 'Hidden' : 'Visible';
        return `
            <tr onclick='editItem(${inlineId})'>
                <td data-label="Item">
                    <div class="menu-builder-item-main">
                        <div class="menu-builder-item-thumb">${previewImage ? `<img src="${escapeHtml(previewImage)}" alt="${escapeHtml(displayName)}" width="160" height="160" loading="lazy" decoding="async" fetchpriority="low" />` : `<span class="menu-builder-item-thumb-fallback">${ADMIN_ICON.camera}</span>`}</div>
                        <div class="menu-builder-item-meta">
                            <strong>${escapeHtml(displayName)}</strong>
                            ${displayDescription ? `<div class="menu-builder-row-copy">${escapeHtml(displayDescription)}</div>` : ''}
                            <div class="menu-builder-entry-pills">
                                <span class="menu-builder-entry-pill ${item.available === false ? 'is-attention' : 'is-ready'}">${availabilityLabel}</span>
                                ${item.featured ? '<span class="menu-builder-entry-pill is-ready">Featured</span>' : ''}
                                ${previewImage ? '<span class="menu-builder-entry-pill">Image ready</span>' : '<span class="menu-builder-entry-pill is-muted">Image missing</span>'}
                                ${sizesCount ? `<span class="menu-builder-entry-pill">${sizesCount} size${sizesCount === 1 ? '' : 's'}</span>` : ''}
                                ${extrasCount ? `<span class="menu-builder-entry-pill">${extrasCount} extra${extrasCount === 1 ? '' : 's'}</span>` : ''}
                            </div>
                            </div>
                        </div>
                    </td>
                <td data-label="Price">
                    <div class="menu-builder-stat-stack">
                        <span class="menu-builder-stat-label">Price</span>
                        <span class="menu-builder-row-meta">${item.hasSizes ? 'From ' : ''}MAD ${price.toFixed(2)}</span>
                        <span class="menu-builder-stat-note ${item.hasSizes ? '' : 'is-muted'}">${item.hasSizes ? 'Multiple sizes' : 'Base price'}</span>
                    </div>
                </td>
                <td data-label="Likes">
                    <div class="menu-builder-stat-stack">
                        <span class="menu-builder-stat-label">Likes</span>
                        <span class="menu-builder-likes">${ADMIN_ICON.heart} ${likes}</span>
                        <span class="menu-builder-stat-note ${likes ? '' : 'is-muted'}">${likes ? 'Saved by guests' : 'No saves yet'}</span>
                    </div>
                </td>
                <td data-label="Featured">
                    <div class="menu-builder-stat-stack">
                        <span class="menu-builder-stat-label">Highlight</span>
                        <button type="button" class="promo-star action-btn menu-builder-toggle ${item.featured ? 'promo-active' : ''}" title="${item.featured ? 'Remove featured status' : 'Mark as featured'}" aria-label="${item.featured ? 'Remove featured status' : 'Mark as featured'}" onclick='event.stopPropagation(); toggleFeatured(${inlineId})' style="filter: ${item.featured ? 'none' : 'grayscale(1)'}; opacity: ${item.featured ? '1' : '0.5'};">${ADMIN_ICON.sparkle}</button>
                        <span class="menu-builder-stat-note ${item.featured ? '' : 'is-muted'}">${item.featured ? 'On landing' : 'Standard'}</span>
                    </div>
                </td>
                <td data-label="Actions">
                    <div class="menu-builder-item-actions menu-builder-action-rail">
                        <button type="button" class="action-btn" title="Edit dish" aria-label="Edit dish" onclick='event.stopPropagation(); editItem(${inlineId})'>${ADMIN_ICON.edit}</button>
                        <button type="button" class="action-btn" title="Manage dish images" aria-label="Manage dish images" onclick='event.stopPropagation(); openImageModal(${inlineId})'>${ADMIN_ICON.image}</button>
                        <button type="button" class="action-btn" title="Delete dish" aria-label="Delete dish" onclick='event.stopPropagation(); deleteItem(${inlineId})'>${ADMIN_ICON.trash}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openMenuBuilderRow = function (superCategoryId) {
    menuBuilderSelectedSuperCategoryId = superCategoryId;
    menuBuilderSelectedCategoryKey = '';
    currentMenuWorkspaceStep = 'categories';
    renderMenuBuilder();
};

window.openMenuBuilderCategory = function (categoryKey) {
    menuBuilderSelectedCategoryKey = categoryKey;
    currentMenuWorkspaceStep = 'items';
    renderMenuBuilder();
};

window.goBackMenuBuilder = function () {
    if (currentMenuWorkspaceStep === 'items') {
        currentMenuWorkspaceStep = 'categories';
        menuBuilderSelectedCategoryKey = '';
    } else if (currentMenuWorkspaceStep === 'categories') {
        currentMenuWorkspaceStep = 'supercategories';
        menuBuilderSelectedSuperCategoryId = '';
        menuBuilderSelectedCategoryKey = '';
    }
    renderMenuBuilder();
};

function openMenuCrudModal(type, title) {
    mountMenuCrudForms();
    const modal = document.getElementById('menuCrudModal');
    const body = document.getElementById('menuCrudModalBody');
    const footerHost = document.getElementById('menuCrudModalFooterHost');
    const titleEl = document.getElementById('menuCrudModalTitle');
    const card = modal?.querySelector('.menu-crud-modal-card');
    const formId = type === 'supercategory' ? 'superCatForm' : type === 'category' ? 'catForm' : 'foodForm';
    const form = document.getElementById(formId);
    const footer = document.getElementById(getMenuCrudFooterId(formId));
    if (!modal || !body || !footerHost || !titleEl || !form || !footer) return;
    body.innerHTML = '';
    body.appendChild(form);
    footerHost.dataset.formId = formId;
    footerHost.appendChild(footer);
    titleEl.textContent = title;
    setMenuCrudValidationState(formId, {});
    initializeMenuCrudFormEnhancements(form);
    document.documentElement.classList.add('menu-crud-open');
    document.body.classList.add('menu-crud-open');
    if (typeof modal.showModal === 'function') {
        if (!modal.open) modal.showModal();
    } else {
        modal.setAttribute('open', 'open');
    }
    body.scrollTop = 0;
    if (card) card.scrollTop = 0;
    requestAnimationFrame(() => {
        body.scrollTop = 0;
        if (card) card.scrollTop = 0;
    });
    startMenuCrudDirtyTracking(form);
}

window.closeMenuCrudModal = async function (force = false) {
    if (!force) {
        refreshMenuCrudDirtyState();
        if (menuCrudDirty) {
            const confirmed = await showAdminConfirm({
                kicker: 'Unsaved changes',
                title: 'Discard changes in this form?',
                copy: 'The edits inside this sheet have not been saved yet. If you close it now, those changes will be lost.',
                note: 'Save first if you want these changes to appear on the live restaurant site.',
                confirmLabel: 'Discard changes',
                cancelLabel: 'Keep editing',
                tone: 'danger'
            });
            if (!confirmed) {
                return;
            }
        }
    }
    const modal = document.getElementById('menuCrudModal');
    if (modal) {
        if (typeof modal.close === 'function' && modal.open) {
            modal.close();
        } else {
            modal.removeAttribute('open');
        }
    }
    document.documentElement.classList.remove('menu-crud-open');
    document.body.classList.remove('menu-crud-open');
    clearMenuCrudDirtyTracking();
    mountMenuCrudForms();
    const footerHost = document.getElementById('menuCrudModalFooterHost');
    if (footerHost) {
        delete footerHost.dataset.formId;
    }
};

const menuCrudDialog = document.getElementById('menuCrudModal');
if (menuCrudDialog) {
    menuCrudDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        window.closeMenuCrudModal();
    });
}

const adminActionDialog = document.getElementById('adminActionDialog');
if (adminActionDialog) {
    adminActionDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        window.resolveAdminActionDialog(false);
    });
}

window.openMenuBuilderAdd = function () {
    if (currentMenuWorkspaceStep === 'supercategories') {
        resetSuperCategoryFormState();
        openMenuCrudModal('supercategory', 'Add Super Category');
        return;
    }
    if (currentMenuWorkspaceStep === 'categories') {
        resetCategoryFormState();
        openMenuCrudModal('category', 'Add Category');
        return;
    }
    resetFoodForm();
    if (menuBuilderSelectedCategoryKey) {
        const itemCat = document.getElementById('itemCat');
        if (itemCat) itemCat.value = menuBuilderSelectedCategoryKey;
    }
    openMenuCrudModal('item', 'Add Item');
};

window.openMenuBuilderEdit = function (type, id) {
    if (type === 'supercategory') {
        editSuperCat(id);
        return;
    }
    if (type === 'category') {
        editCat(id);
        return;
    }
    editItem(id);
};

function applyAdminCapabilities() {
    const sellerToolsNavBtn = document.getElementById('sellerToolsNavBtn');
    const dataToolsSection = document.getElementById('data-tools');
    const modalAiImageTools = document.getElementById('modalAiImageTools');
    const translationButtons = [
        document.getElementById('itemTranslationGenerateBtn'),
        document.getElementById('catTranslationGenerateBtn'),
        document.getElementById('superTranslationGenerateBtn'),
        document.getElementById('catGenerateImageBtn')
    ].filter(Boolean);

    if (!adminCapabilities.sellerToolsEnabled) {
        sellerToolsNavBtn?.remove();
        dataToolsSection?.remove();
    } else {
        if (sellerToolsNavBtn) sellerToolsNavBtn.style.display = '';
        if (dataToolsSection) dataToolsSection.style.display = '';
    }

    if (!adminCapabilities.aiMediaToolsEnabled) {
        modalAiImageTools?.remove();
        translationButtons.forEach((button) => {
            button.disabled = true;
            button.classList.add('is-disabled');
            button.title = 'Enable AI tools to use this action.';
        });
    } else if (modalAiImageTools) {
        modalAiImageTools.style.display = '';
        translationButtons.forEach((button) => {
            button.disabled = false;
            button.classList.remove('is-disabled');
            button.removeAttribute('title');
        });
    }

    if (!adminCapabilities.sellerToolsEnabled && dataToolsSection?.classList.contains('active')) {
        const menuBtn = document.getElementById('menuNavBtn');
        if (menuBtn) showSection('menu', menuBtn);
    }
}

async function loadAdminCapabilities() {
    try {
        const res = await fetch('/api/admin/capabilities', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
            adminCapabilities = { sellerToolsEnabled: false, aiMediaToolsEnabled: false };
            return;
        }
        adminCapabilities = {
            sellerToolsEnabled: Boolean(data.sellerToolsEnabled),
            aiMediaToolsEnabled: Boolean(data.aiMediaToolsEnabled)
        };
    } catch (error) {
        console.error('Capabilities load error:', error);
        adminCapabilities = { sellerToolsEnabled: false, aiMediaToolsEnabled: false };
    }
}

window.openParameterSection = function (sectionId) {
    showSection(sectionId);
};

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
                errorEl.textContent = 'Incorrect credentials.';
                errorEl.style.display = 'block';
            }
            return;
        }
        showDashboard();
    } catch (e) {
        console.error('[LOGIN] Request error:', e);
        if (errorEl) {
            errorEl.textContent = 'Server connection error.';
            errorEl.style.display = 'block';
        }
    }
}

async function showDashboard() {
    document.body.classList.add('is-authenticated');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminSidebar').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'block';
    await Promise.all([loadDataFromServer(), loadAdminCapabilities()]);
    mountOwnerAdminLayout();
    refreshUI();
    initForms();
    const requestedSection = normalizeAdminSectionTarget(getRequestedAdminSection() || getSavedAdminSection());
    if (requestedSection && requestedSection !== 'menu') {
        showSection(requestedSection);
    } else {
        storeAdminSection('menu');
        syncAdminAppShell('menu');
    }
    updateAdminInstallUi();
    await resumeActiveImporterJobIfNeeded();
}

window.openMenuBuilderSetupAction = function (action = '') {
    const state = getMenuBuilderSetupState();

    if (action === 'import') {
        const sellerToolsBtn = document.getElementById('sellerToolsNavBtn');
        if (sellerToolsBtn) {
            showSection('data-tools', sellerToolsBtn);
        }
        return;
    }

    if (!state.hasBranding) {
        const brandingBtn = document.getElementById('brandingNavBtn');
        if (brandingBtn) {
            showSection('branding', brandingBtn);
        }
        return;
    }

    if (!state.hasSuperCategories) {
        resetSuperCategoryFormState();
        resetMenuBuilderNavigation();
        renderMenuBuilder();
        openMenuCrudModal('supercategory', 'Add Super Category');
        return;
    }

    if (!state.hasCategories) {
        const targetSuperCategoryId = state.firstSuperCategoryId || '';
        if (targetSuperCategoryId) {
            menuBuilderSelectedSuperCategoryId = targetSuperCategoryId;
        }
        menuBuilderSelectedCategoryKey = '';
        currentMenuWorkspaceStep = 'categories';
        renderMenuBuilder();
        resetCategoryFormState();
        const superSelect = document.getElementById('catSuperCategory');
        if (superSelect && targetSuperCategoryId) {
            superSelect.value = targetSuperCategoryId;
        }
        openMenuCrudModal('category', 'Add Category');
        return;
    }

    const targetSuperCategory = getAdminMenuSuperCategoryRows().find((row) =>
        Array.isArray(row.cats) && row.cats.includes(state.firstCategoryKey)
    );
    if (targetSuperCategory?.id) {
        menuBuilderSelectedSuperCategoryId = targetSuperCategory.id;
    }
    menuBuilderSelectedCategoryKey = state.firstCategoryKey || '';
    currentMenuWorkspaceStep = 'items';
    renderMenuBuilder();
    resetFoodForm();
    const itemCat = document.getElementById('itemCat');
    if (itemCat && state.firstCategoryKey) {
        itemCat.value = state.firstCategoryKey;
    }
    openMenuCrudModal('item', 'Add Item');
};

async function adminLogout() {
    document.body.classList.remove('is-authenticated');
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); } catch (e) { }
    location.reload();
}

function refreshUI() {
    mountOwnerAdminLayout();
    renderParameterShells();
    renderAdminSaveState();
    renderMenuBuilder();
    populateCatDropdown();
    initBrandingForm();
    initWifiForm();
    initLandingPageForm();
    initSuperCatForm();
    setCategoryTranslationFields();
    setSuperCategoryTranslationFields();
    initializeMenuCrudFormEnhancements(document.getElementById('foodForm'));
    initializeMenuCrudFormEnhancements(document.getElementById('catForm'));
    initializeMenuCrudFormEnhancements(document.getElementById('superCatForm'));
    initSecurityForm();
    initHoursForm();
    initGalleryForm();
    renderGalleryAdmin();
    renderImporterDraftOutputs(lastImporterDraft);
    updateStats();
    applyAdminCapabilities();
    syncParameterTabs();
    syncMenuWorkspaceStepButtons();
    syncBrandingWorkspaceTabs();
    if (typeof window.applyBranding === 'function') {
        window.applyBranding();
    }
    initializeAdminHelpToggles();
    updateAdminInstallUi();
}

window.suggestMissingMenuImages = async function () {
    const output = document.getElementById('menuImageSuggestionOutput');
    const menuItems = Array.isArray(menu) ? menu : [];
    const suggestions = [];
    let assignedCount = 0;
    let alreadyCoveredCount = 0;
    const confidenceCounts = {
        high: 0,
        medium: 0,
        low: 0,
        fallback: 0
    };

    menu = menuItems.map((item) => {
        const primaryImage = typeof window.getPrimaryMenuItemImage === 'function'
            ? window.getPrimaryMenuItemImage(item)
            : ((Array.isArray(item.images) ? item.images.filter(Boolean)[0] : '') || item.img || '');

        if (primaryImage) {
            alreadyCoveredCount += 1;
            return item;
        }

        const suggestion = typeof window.getMenuImageSuggestion === 'function'
            ? window.getMenuImageSuggestion(item)
            : null;

        if (!suggestion?.src) {
            return item;
        }

        assignedCount += 1;
        suggestions.push({
            itemName: getAdminItemDisplayName(item),
            category: item.cat || 'Uncategorized',
            label: suggestion.label,
            confidence: suggestion.confidence || 'fallback',
            matchType: suggestion.matchType || 'fallback',
            reason: suggestion.reason || 'Matched from local library'
        });
        confidenceCounts[suggestion.confidence || 'fallback'] += 1;

        return {
            ...item,
            img: suggestion.src,
            images: [suggestion.src]
        };
    });

    const summaryLines = [
        t('admin.menu_images.summary_title', 'Menu image suggestion run'),
        t('admin.menu_images.items_reviewed', 'Items reviewed: {count}', { count: menuItems.length }),
        t('admin.menu_images.images_assigned', 'Images assigned: {count}', { count: assignedCount }),
        t('admin.menu_images.items_already_covered', 'Items already covered: {count}', { count: alreadyCoveredCount }),
        t('admin.menu_images.high_confidence', 'High confidence matches: {count}', { count: confidenceCounts.high }),
        t('admin.menu_images.medium_confidence', 'Medium confidence matches: {count}', { count: confidenceCounts.medium }),
        t('admin.menu_images.low_confidence', 'Low confidence matches: {count}', { count: confidenceCounts.low }),
        t('admin.menu_images.fallback_confidence', 'Generic fallback placeholders: {count}', { count: confidenceCounts.fallback }),
        ''
    ];

    if (suggestions.length > 0) {
        summaryLines.push(`${t('admin.menu_images.assignments', 'Assignments')}:`);
        suggestions.forEach((entry) => {
            summaryLines.push(`- ${entry.itemName} [${entry.category}] -> ${entry.label} [${entry.confidence} / ${entry.matchType}] (${entry.reason})`);
        });
        if (confidenceCounts.fallback > 0) {
            summaryLines.push('');
            summaryLines.push(t('admin.menu_images.review_note', 'Review note: fallback assignments are generic placeholders and should be replaced first when better client media exists.'));
        }
    } else {
        summaryLines.push(t('admin.menu_images.assignments_none', 'Assignments: none. Every menu item already had an image.'));
    }

    if (output) {
        output.value = summaryLines.join('\n');
    }

    if (assignedCount === 0) {
        showToast(t('admin.menu_images.none_missing', 'No missing menu images were found.'));
        return;
    }

    renderMenuTable();
    updateStats();

    const saved = await saveAndRefresh();
    if (saved) {
        showToast(t('admin.menu_images.assigned_toast', 'Assigned {count} menu image suggestion(s).', { count: assignedCount }));
    }
};

window.copyMenuImageSuggestionSummary = async function () {
    const output = document.getElementById('menuImageSuggestionOutput');
    if (!output) return;

    if (!output.value.trim()) {
        showToast(t('admin.menu_images.run_first', 'Run the suggestion tool first.'));
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        showToast(t('admin.menu_images.copied', 'Image suggestion summary copied.'));
    } catch (_error) {
        output.focus();
        output.select();
        showToast(t('admin.common.copy_failed', 'Copy failed. Select the summary manually.'));
    }
};

// â”€â”€â”€ CATEGORY FILTERS LOGIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            ${cat} <span class="category-filter-count">(${count})</span>
        </button>`;
    }).join('');
}

window.setAdminCategoryFilter = function (cat) {
    currentAdminCategory = cat;
    if (typeof window.setStoredAdminCategoryFilter === 'function') {
        window.setStoredAdminCategoryFilter(cat);
    }

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
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderMenuTable() {
    const tbody = document.querySelector('#menuTable tbody');
    if (!tbody) return;
    try {
        // Filter menu based on active category
        const filteredMenu = currentAdminCategory === 'All'
            ? menu
            : menu.filter(item => (item.cat || 'Uncategorized') === currentAdminCategory);

        if (filteredMenu.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#888;">No items in category "${currentAdminCategory}".</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredMenu.map(item => {
            // Fix image fallback logic
            const images = (item.images && item.images.length > 0) ? item.images : (item.img ? [item.img] : []);
            const firstImg = images.length > 0 ? images[0] : '';
            const safePrice = Number(item.price) || 0;
            const likeCount = (typeof window.getLikeCount === 'function') ? window.getLikeCount(item.id) : 0;
            const extrasCount = Array.isArray(item.extras) ? item.extras.length : 0;
            const itemName = escapeHtml(getAdminItemDisplayName(item));
            const itemDesc = escapeHtml(getAdminItemDisplayDescription(item));
            const itemCat = escapeHtml(item.cat || 'Uncategorized');
            const translationBadges = renderMenuTranslationBadges(item);
            const inlineItemId = toInlineJsString(item.id);
            return `
            <tr>
                <td>
                    <div style="width:50px; height:50px; background:#eee; border-radius:8px; overflow:hidden; border:1px solid #ddd; cursor:pointer" onclick='openImageModal(${inlineItemId})'>
                        ${firstImg ? `<img src="${firstImg}" width="320" height="320" loading="lazy" decoding="async" fetchpriority="low" style="width:100%; height:100%; object-fit:cover" onerror="this.src='images/menu-item-placeholder.svg'">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">${ADMIN_ICON.camera}</div>`}
                    </div>
                    ${images.length > 0 ? `<small style="display:block;text-align:center;font-size:10px;color:var(--primary);cursor:pointer;margin-top:2px" onclick='openImageModal(${inlineItemId})'>${images.length} image(s)</small>` : ''}
                </td>
                <td><strong>${itemName}</strong><div class="item-copy-meta"><div class="translation-badges">${translationBadges}</div>${extrasCount ? `<span class="translation-chip">${extrasCount} extra${extrasCount > 1 ? 's' : ''}</span>` : ''}</div></div><small style="color:#888">${itemDesc}</small></td>
                <td>${itemCat}</td>
                <td>MAD ${safePrice.toFixed(2)}</td>
                <td><span style="color:#e01e2f">${ADMIN_ICON.heart}</span> ${likeCount}</td>
                <td><span class="promo-star action-btn ${item.featured ? 'promo-active' : ''}" onclick='toggleFeatured(${inlineItemId})' style="filter: ${item.featured ? 'none' : 'grayscale(1)'}; opacity: ${item.featured ? '1' : '0.5'};">${ADMIN_ICON.sparkle}</span></td>
                <td>
                    <button class="action-btn" onclick='editItem(${inlineItemId})' title="Edit item">${ADMIN_ICON.edit}</button>
                    <button class="action-btn" onclick='openImageModal(${inlineItemId})' title="Manage images">${ADMIN_ICON.image}</button>
                    <button class="action-btn" onclick='deleteItem(${inlineItemId})'>${ADMIN_ICON.trash}</button>
                </td>
            </tr > `;
        }).join('');
    } catch (e) {
        console.error('Render Table Error:', e);
        tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Unable to load items.</td></tr>`;
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

function buildItemExtraId(name, index = 0) {
    const base = String(name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06ff]+/gi, '-')
        .replace(/^-+|-+$/g, '');
    return base || `extra-${index + 1}`;
}

function createItemExtraRowMarkup(extra = {}, index = 0) {
    const name = String(extra?.name || '').trim();
    const price = Number.isFinite(Number(extra?.price)) ? Number(extra.price) : '';
    const extraId = String(extra?.id || buildItemExtraId(name, index));
    return `
        <div class="dish-extra-row" data-extra-id="${escapeHtmlAttr(extraId)}">
            <div class="form-group">
                <label>Extra name</label>
                <input type="text" class="dish-extra-name" value="${escapeHtmlAttr(name)}" placeholder="e.g. Extra cheese" />
            </div>
            <div class="form-group">
                <label>Price (MAD)</label>
                <input type="number" class="dish-extra-price" value="${price === '' ? '' : escapeHtmlAttr(price)}" placeholder="0.00" step="0.01" min="0" />
            </div>
            <button type="button" class="action-btn dish-extra-remove" onclick="removeItemExtraRow(this)" aria-label="Remove extra">${ADMIN_ICON.trash}</button>
        </div>
    `;
}

function renderItemExtrasEditor(extras = []) {
    const list = document.getElementById('itemExtrasList');
    if (!list) return;
    const safeExtras = Array.isArray(extras) ? extras.filter((entry) => entry && typeof entry === 'object') : [];
    if (!safeExtras.length) {
        list.innerHTML = '<div class="dish-extra-empty">No paid extras yet. Add options like extra sauce, extra cheese, or toppings here.</div>';
        return;
    }
    list.innerHTML = safeExtras.map((extra, index) => createItemExtraRowMarkup(extra, index)).join('');
}

window.addItemExtraRow = function (extra = {}) {
    const list = document.getElementById('itemExtrasList');
    if (!list) return;
    const empty = list.querySelector('.dish-extra-empty');
    if (empty) empty.remove();
    list.insertAdjacentHTML('beforeend', createItemExtraRowMarkup(extra, list.querySelectorAll('.dish-extra-row').length));
};

window.removeItemExtraRow = function (button) {
    const row = button?.closest('.dish-extra-row');
    row?.remove();
    const list = document.getElementById('itemExtrasList');
    if (list && !list.querySelector('.dish-extra-row')) {
        renderItemExtrasEditor([]);
    }
};

function collectItemExtrasFromEditor() {
    return Array.from(document.querySelectorAll('#itemExtrasList .dish-extra-row'))
        .map((row, index) => {
            const name = row.querySelector('.dish-extra-name')?.value?.trim() || '';
            const price = parseFloat(row.querySelector('.dish-extra-price')?.value || '') || 0;
            if (!name) return null;
            return {
                id: row.dataset.extraId || buildItemExtraId(name, index),
                name,
                price
            };
        })
        .filter(Boolean);
}

function editItem(id) {
    const item = menu.find(m => m.id == id);
    if (!item) return;

    editingItemId = id;
    setMenuTranslationWarnings('item');
    currentMenuWorkspaceStep = 'items';
    menuBuilderSelectedCategoryKey = item.cat || '';
    openMenuCrudModal('item', `Edit Item - ${getAdminItemDisplayName(item)}`);

    document.getElementById('itemName').value = item.name || getAdminItemDisplayName(item);
    document.getElementById('itemCat').value = item.cat;
    document.getElementById('itemDesc').value = item.desc || getAdminItemDisplayDescription(item);
    setMenuItemTranslationFields(item.translations);
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
    renderItemExtrasEditor(item.extras || []);

    // Store ALL existing images (including base64) for preservation during save
    const existingImages = item.images && item.images.length > 0 ? item.images : (item.img ? [item.img] : []);
    window._editingImages = [...existingImages];

    // Show only URL images in the text field (base64 is too long to show)
    const urlImages = existingImages.filter(img => !img.startsWith('data:'));
    const imgInput = document.getElementById('itemImg');
    if (imgInput) imgInput.value = urlImages.join(', ');

    // Change form title and button
    const itemEditorTitle = document.getElementById('menuItemEditorTitle');
    if (itemEditorTitle) itemEditorTitle.textContent = `Edit Item - ${getAdminItemDisplayName(item)}`;
    document.querySelector('#foodForm .primary-btn').textContent = 'Save';
    refreshMenuCrudFormUx('foodForm');
    startMenuCrudDirtyTracking(document.getElementById('foodForm'));
}

function resetFoodForm() {
    editingItemId = null;
    document.getElementById('foodForm').reset();
    setMenuCrudValidationState('foodForm', {});
    setMenuTranslationWarnings('item');
    setMenuItemTranslationFields();
    document.getElementById('itemFeatured').checked = false;
    document.getElementById('itemHasSizes').checked = false;
    const availableCb = document.getElementById('itemAvailable');
    if (availableCb) availableCb.checked = true;
    toggleSizesUI();
    renderItemExtrasEditor([]);
    const itemEditorTitle = document.getElementById('menuItemEditorTitle');
    if (itemEditorTitle) itemEditorTitle.textContent = 'Add Item';
    document.querySelector('#foodForm .primary-btn').textContent = 'Save';
    refreshMenuCrudFormUx('foodForm');
}

function initForms() {
    document.getElementById('foodForm').onsubmit = async (e) => {
        e.preventDefault();
        await commitFormItem();
    };

    // --- Shared save logic, can be called directly without a form submit event ---
    window.commitFormItem = async function () {
        setMenuCrudPrimaryButtonState('foodForm', 'saving');
        setMenuCrudValidationState('foodForm', {});
        const fileInput = document.getElementById('itemFile');
        const urlInput = document.getElementById('itemImg').value;

        // Parse URL images â€” split by NEWLINE only
        let urlImages = urlInput.split(/\n/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('data:'));

        // Upload new files to server (stored on disk, returned as /uploads/... URL)
        let newUploadedUrls = [];
        if (fileInput && fileInput.files.length > 0) {
            showToast('Uploading item images...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    newUploadedUrls.push(url);
                } catch (err) {
                    console.error('Image upload failed:', err);
                    showToast('Image upload failed. Please try again.');
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
                // New uploads provided â€” use URL list + new server images
                finalImages = [...urlImages, ...newUploadedUrls];
            } else if (urlImages.length > 0) {
                // URL field was updated â€” use those (no new uploads)
                finalImages = [...urlImages];
            } else {
                // Nothing changed â€” keep all existing images
                finalImages = [...existingImages];
            }
        } else {
            finalImages = [...urlImages, ...newUploadedUrls];
        }

        const ingredients = document.getElementById('itemIngredients').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const name = document.getElementById('itemName').value.trim();
        const cat = document.getElementById('itemCat').value;
        const desc = document.getElementById('itemDesc').value.trim();
        const translations = buildMenuItemTranslations();
        const featured = document.getElementById('itemFeatured').checked;
        const available = document.getElementById('itemAvailable').checked;
        const extras = collectItemExtrasFromEditor();

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

        if (!name) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add the dish name in Core.', sectionId: 'core', fieldId: 'itemName' });
            showToast('Item name is required.');
            focusMenuCrudField('foodForm', 'core', 'itemName');
            return;
        }
        if (!cat) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Choose the category in Core.', sectionId: 'core', fieldId: 'itemCat' });
            showToast('Choose a category for this dish.');
            focusMenuCrudField('foodForm', 'core', 'itemCat');
            return;
        }
        if (!desc) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add the fallback description in Core.', sectionId: 'core', fieldId: 'itemDesc' });
            showToast('Add a fallback description for this dish.');
            focusMenuCrudField('foodForm', 'core', 'itemDesc');
            return;
        }
        if (hasSizes && !Object.values(sizes || {}).some((value) => Number(value) > 0)) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add at least one size price in Pricing.', sectionId: 'pricing', fieldId: 'itemPriceSmall' });
            showToast('Add at least one size price.');
            focusMenuCrudField('foodForm', 'pricing', 'itemPriceSmall');
            return;
        }
        if (!hasSizes && !(Number(price) > 0)) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add the dish price in Pricing.', sectionId: 'pricing', fieldId: 'itemPrice' });
            showToast('Add a price before saving this dish.');
            focusMenuCrudField('foodForm', 'pricing', 'itemPrice');
            return;
        }

        if (editingItemId) {
            const index = menu.findIndex(m => m.id == editingItemId);
            if (index !== -1) {
                menu[index] = {
                    ...menu[index],
                    name, cat, desc, translations, ingredients, price,
                    hasSizes, sizes,
                    extras,
                    images: finalImages,
                    img: finalImages[0] || menu[index].img || '',
                    featured,
                    available
                };
            }
        } else {
            const newItem = {
                id: Date.now(),
                name, cat, desc, translations, ingredients, price,
                hasSizes, sizes,
                extras,
                images: finalImages,
                img: finalImages[0] || '',
                featured,
                available,
                likes: 0,
                badge: ''
            };
            menu.push(newItem);
        }

        const saved = await saveAndRefresh();
        if (saved) {
            setMenuCrudPrimaryButtonState('foodForm', 'saved');
            showToast(editingItemId ? 'Item updated.' : 'Item added.');
            resetFoodForm();
            closeMenuCrudModal(true);
        } else {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
        }
    };

    document.getElementById('catForm').onsubmit = async (e) => {
        e.preventDefault();
        setMenuCrudPrimaryButtonState('catForm', 'saving');
        setMenuCrudValidationState('catForm', {});
        const editingKeyInput = document.getElementById('catEditingKey');
        const previousKey = editingKeyInput ? editingKeyInput.value.trim() : '';
        const categoryName = document.getElementById('catName').value.trim();
        const selectedSuperCategoryId = document.getElementById('catSuperCategory')?.value?.trim() || '';
        if (!categoryName) {
            setMenuCrudPrimaryButtonState('catForm', 'idle');
            setMenuCrudValidationState('catForm', { message: 'Add the category name in Identity.', sectionId: 'identity', fieldId: 'catName' });
            showToast('Category name is required.');
            focusMenuCrudField('catForm', 'identity', 'catName');
            return;
        }
        if (!selectedSuperCategoryId) {
            setMenuCrudPrimaryButtonState('catForm', 'idle');
            setMenuCrudValidationState('catForm', { message: 'Choose the parent super category in Identity.', sectionId: 'identity', fieldId: 'catSuperCategory' });
            showToast('Please choose a super category.');
            focusMenuCrudField('catForm', 'identity', 'catSuperCategory');
            return;
        }
        const nextEmoji = document.getElementById('catEmoji')?.value
            || catEmojis?.[categoryName]
            || catEmojis?.[previousKey]
            || ADMIN_ICON.bullet;
        const nextTranslations = buildCategoryTranslations(categoryName);
        const categoryImageInput = document.getElementById('catImage');
        const categoryImageUpload = document.getElementById('catImageUpload');
        let nextImage = normalizeCategoryImagePath(categoryImageInput ? categoryImageInput.value : '');

        if (categoryImageUpload && categoryImageUpload.files && categoryImageUpload.files[0]) {
            try {
                nextImage = await uploadImageToServer(categoryImageUpload.files[0]);
                if (categoryImageInput) categoryImageInput.value = nextImage;
            } catch (error) {
                console.error('Category image upload failed:', error);
                setMenuCrudPrimaryButtonState('catForm', 'idle');
                setMenuCrudValidationState('catForm', { message: 'The category image upload failed. Try again or save without it.', sectionId: 'visual', fieldId: 'catImageUpload' });
                showToast('Category image upload failed.');
                return;
            }
        }

        if (previousKey && previousKey !== categoryName) {
            menu.forEach((item) => {
                if (item.cat === previousKey) item.cat = categoryName;
            });
            delete catEmojis[previousKey];
            delete categoryTranslations[previousKey];
            delete categoryImages[previousKey];
        }

        (restaurantConfig.superCategories || []).forEach((sc) => {
            const currentCats = Array.isArray(sc.cats) ? sc.cats : [];
            sc.cats = currentCats.filter((cat) => cat !== previousKey && cat !== categoryName);
        });

        const selectedSuperCategory = (restaurantConfig.superCategories || []).find((sc) => sc.id === selectedSuperCategoryId);
        if (!selectedSuperCategory) {
            setMenuCrudPrimaryButtonState('catForm', 'idle');
            setMenuCrudValidationState('catForm', { message: 'The selected super category is no longer available.', sectionId: 'identity', fieldId: 'catSuperCategory' });
            showToast('Selected super category was not found.');
            return;
        }
        selectedSuperCategory.cats = Array.isArray(selectedSuperCategory.cats) ? selectedSuperCategory.cats : [];
        if (!selectedSuperCategory.cats.includes(categoryName)) {
            selectedSuperCategory.cats.push(categoryName);
        }

        catEmojis[categoryName] = nextEmoji;
        if (nextImage) categoryImages[categoryName] = nextImage;
        else delete categoryImages[categoryName];
        window.categoryImages = categoryImages;
        categoryTranslations[categoryName] = nextTranslations;
        const saved = await saveAndRefresh();
        if (saved) {
            setMenuCrudPrimaryButtonState('catForm', 'saved');
            menuBuilderSelectedSuperCategoryId = selectedSuperCategoryId;
            resetCategoryFormState();
            closeMenuCrudModal(true);
            showToast(previousKey ? 'Category updated.' : 'Category added.');
        } else {
            setMenuCrudPrimaryButtonState('catForm', 'idle');
        }
    };

    document.getElementById('wifiForm').onsubmit = async (e) => {
        e.preventDefault();
        const saveButton = e.submitter || document.getElementById('infoWifiSaveBtn');
        setInfoSaveButtonState(saveButton, 'saving');
        restaurantConfig.wifi.name = document.getElementById('wifiSSID').value;
        restaurantConfig.wifi.code = document.getElementById('wifiPassInput').value;
        const saved = await saveAndRefresh();
        if (saved) {
            renderInfoWorkspaceSummary();
            setInfoSaveButtonState(saveButton, 'saved');
            showToast('WiFi updated.');
        } else {
            setInfoSaveButtonState(saveButton, 'idle');
        }
    };

    document.getElementById('brandingForm').onsubmit = async (e) => {
        e.preventDefault();
        const brandingDraft = getBrandingDraftFromForm();

        if (!isValidAssetUrl(brandingDraft.logoImage)) {
            showToast('Logo image must be an absolute URL or a local /uploads path.');
            return;
        }

        if (!isValidAssetUrl(brandingDraft.heroImage)) {
            showToast('Hero image must be an absolute URL or a local /uploads path.');
            return;
        }

        if ((brandingDraft.heroSlides || []).some((value) => value && !isValidAssetUrl(value))) {
            showToast('Each hero slide image must be an absolute URL or a local /uploads path.');
            return;
        }

        if (typeof window.mergeRestaurantConfig === 'function') {
            window.mergeRestaurantConfig({
                branding: brandingDraft
            });
            restaurantConfig = window.restaurantConfig;
        }

        window.updateBrandingPreview();
        setBrandingSaveButtonsState('saving');
        const saved = await saveAndRefresh();
        if (saved) {
            setBrandingSaveButtonsState('saved');
            showToast('Branding saved.');
        } else {
            setBrandingSaveButtonsState('idle');
        }
    };

    document.getElementById('landingPageForm').onsubmit = async (e) => {
        e.preventDefault();
        const saveButton = e.submitter || document.getElementById('infoLandingSaveBtn');
        const nextContentTranslations = buildLandingContentTranslations();
        const guestExperience = buildGuestExperienceConfig();
        const sectionVisibility = buildSectionVisibilityConfig();
        const sectionOrder = normalizeSectionOrderDraft(landingSectionOrderDraft);
        const mapUrl = document.getElementById('lpMapUrl').value.trim();
        const phone = document.getElementById('lpPhone').value.trim();
        const facebookUrl = document.getElementById('lpFb').value.trim();
        const tiktokUrl = document.getElementById('lpTiktok').value.trim();
        const tripAdvisorUrl = document.getElementById('lpTrip').value.trim();

        if (!isValidAbsoluteUrl(mapUrl)) {
            showToast('Map URL must be a valid https:// link.');
            return;
        }

        if (!isLikelyPhoneNumber(phone)) {
            showToast('Phone number looks incomplete. Please use an international or local dial format.');
            return;
        }

        if (facebookUrl && !isValidAbsoluteUrl(facebookUrl)) {
            showToast('Facebook must be a valid https:// link.');
            return;
        }

        if (tiktokUrl && !isValidAbsoluteUrl(tiktokUrl)) {
            showToast('TikTok must be a valid https:// link.');
            return;
        }

        if (tripAdvisorUrl && !isValidAbsoluteUrl(tripAdvisorUrl)) {
            showToast('TripAdvisor must be a valid https:// link.');
            return;
        }

        setInfoSaveButtonState(saveButton, 'saving');
        restaurantConfig.location.address = document.getElementById('lpAddress').value;
        restaurantConfig.location.url = mapUrl;
        restaurantConfig.phone = phone;
        restaurantConfig.socials.instagram = document.getElementById('lpInsta').value;
        restaurantConfig.socials.facebook = facebookUrl;
        restaurantConfig.socials.tiktok = tiktokUrl;
        restaurantConfig.socials.tripadvisor = tripAdvisorUrl;
        restaurantConfig.guestExperience = guestExperience;
        restaurantConfig.sectionVisibility = sectionVisibility;
        restaurantConfig.sectionOrder = sectionOrder;
        restaurantConfig.contentTranslations = nextContentTranslations;

        if (window.restaurantConfig) {
            window.restaurantConfig.guestExperience = guestExperience;
            window.restaurantConfig.sectionVisibility = sectionVisibility;
            window.restaurantConfig.sectionOrder = sectionOrder;
            window.restaurantConfig.contentTranslations = nextContentTranslations;
        }

        const saved = await saveAndRefresh();
        if (saved) {
            renderInfoWorkspaceSummary();
            setInfoSaveButtonState(saveButton, 'saved');
            showToast('Public details saved.');
        } else {
            setInfoSaveButtonState(saveButton, 'idle');
        }
    };

    document.getElementById('superCatForm').onsubmit = async (e) => {
        e.preventDefault();
        setMenuCrudPrimaryButtonState('superCatForm', 'saving');
        setMenuCrudValidationState('superCatForm', {});
        const editingIdInput = document.getElementById('scEditingId');
        const editingId = editingIdInput ? editingIdInput.value.trim() : '';
        const selectedCats = Array.from(document.querySelectorAll('.sc-cat-check:checked')).map(cb => cb.value);
        const name = document.getElementById('scName').value.trim();
        let emoji = normalizeSuperCategoryIconValue(document.getElementById('scEmoji').value);
        const desc = document.getElementById('scDesc').value.trim();
        const time = document.getElementById('scTime').value;
        const translations = buildSuperCategoryTranslations(name, desc);

        if (!name) {
            setMenuCrudPrimaryButtonState('superCatForm', 'idle');
            setMenuCrudValidationState('superCatForm', { message: 'Add the group name in Identity.', sectionId: 'identity', fieldId: 'scName' });
            showToast('Super category name is required.');
            focusMenuCrudField('superCatForm', 'identity', 'scName');
            return;
        }
        if (!desc) {
            setMenuCrudPrimaryButtonState('superCatForm', 'idle');
            setMenuCrudValidationState('superCatForm', { message: 'Add the fallback description in Identity.', sectionId: 'identity', fieldId: 'scDesc' });
            showToast('Add a fallback description for this group.');
            focusMenuCrudField('superCatForm', 'identity', 'scDesc');
            return;
        }
        if (!selectedCats.length) {
            setMenuCrudPrimaryButtonState('superCatForm', 'idle');
            setMenuCrudValidationState('superCatForm', { message: 'Select at least one category in Structure.', sectionId: 'structure', fieldId: 'scCatsList' });
            showToast('Select at least one included category.');
            focusMenuCrudField('superCatForm', 'structure', 'scCatsList');
            return;
        }

        if (!emoji) {
            emoji = suggestSuperCategoryIcon(name, desc);
            setSuperCategoryIcon(emoji, false);
        }

        const id = editingId || name.toLowerCase().replace(/\s+/g, '_');
        const existingIdx = restaurantConfig.superCategories.findIndex(sc => sc.id === id);

        const newSC = { id, name, emoji, desc, time, cats: selectedCats, translations };

        if (existingIdx !== -1) {
            restaurantConfig.superCategories[existingIdx] = newSC;
        } else {
            restaurantConfig.superCategories.push(newSC);
        }

        const saved = await saveAndRefresh();
        if (saved) {
            setMenuCrudPrimaryButtonState('superCatForm', 'saved');
            resetSuperCategoryFormState();
            closeMenuCrudModal(true);
            showToast(existingIdx !== -1 ? 'Super category updated.' : 'Super category saved.');
        } else {
            setMenuCrudPrimaryButtonState('superCatForm', 'idle');
        }
    };
}

function getContentTranslationValue(lang, key) {
    return restaurantConfig?.contentTranslations?.[lang]?.[key] || '';
}

function renderLandingContentEditor() {
    const container = document.getElementById('landingContentGrid');
    if (!container) return;

    container.innerHTML = LANDING_CONTENT_FIELDS.map((field) => `
        <div style="background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="margin-bottom:14px;">
                <div style="font-weight:700; color:#111; margin-bottom:4px;">${escapeHtml(field.label)}</div>
                <div style="font-size:0.82rem; color:#6b7280; line-height:1.5;">${escapeHtml(field.hint)}</div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px;">
                ${CONTENT_EDITOR_LANGUAGES.map((lang) => {
                    const value = escapeHtml(getContentTranslationValue(lang, field.key));
                    const label = lang.toUpperCase();
                    if (field.type === 'textarea') {
                        return `
                            <label style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem; font-weight:700; color:#374151;">
                                <span>${label}</span>
                                <textarea data-content-lang="${lang}" data-content-key="${field.key}" rows="4" style="min-height:96px; resize:vertical;">${value}</textarea>
                            </label>
                        `;
                    }
                    return `
                        <label style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem; font-weight:700; color:#374151;">
                            <span>${label}</span>
                            <input type="text" data-content-lang="${lang}" data-content-key="${field.key}" value="${value}" />
                        </label>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function buildLandingContentTranslations() {
    const next = {
        fr: { ...(restaurantConfig?.contentTranslations?.fr || {}) },
        en: { ...(restaurantConfig?.contentTranslations?.en || {}) },
        ar: { ...(restaurantConfig?.contentTranslations?.ar || {}) }
    };

    LANDING_CONTENT_FIELDS.forEach((field) => {
        CONTENT_EDITOR_LANGUAGES.forEach((lang) => {
            const element = document.querySelector(`[data-content-lang="${lang}"][data-content-key="${field.key}"]`);
            const value = element ? element.value.trim() : '';

            if (value) {
                next[lang][field.key] = value;
            } else {
                delete next[lang][field.key];
            }
        });
    });

    return next;
}

function buildGuestExperienceConfig() {
    const paymentMethods = Object.entries(GUEST_EXPERIENCE_PAYMENT_FIELDS)
        .filter(([, fieldId]) => {
            const input = document.getElementById(fieldId);
            return input && input.checked;
        })
        .map(([id]) => id);

    const facilities = Object.entries(GUEST_EXPERIENCE_FACILITY_FIELDS)
        .filter(([, fieldId]) => {
            const input = document.getElementById(fieldId);
            return input && input.checked;
        })
        .map(([id]) => id);

    return { paymentMethods, facilities };
}

function initGuestExperienceFields() {
    const guestExperience = restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || {};
    const paymentMethods = Array.isArray(guestExperience.paymentMethods) ? guestExperience.paymentMethods : [];
    const facilities = Array.isArray(guestExperience.facilities) ? guestExperience.facilities : [];

    Object.entries(GUEST_EXPERIENCE_PAYMENT_FIELDS).forEach(([id, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) input.checked = paymentMethods.includes(id);
    });

    Object.entries(GUEST_EXPERIENCE_FACILITY_FIELDS).forEach(([id, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) input.checked = facilities.includes(id);
    });
}

function buildSectionVisibilityConfig() {
    const defaults = window.defaultConfig?.sectionVisibility || {};
    const out = { ...defaults };

    Object.entries(SECTION_VISIBILITY_FIELDS).forEach(([key, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            out[key] = input.checked;
        }
    });

    return out;
}

function summarizeInfoCopy(value, fallback = '') {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    if (raw.length <= 42) return raw;
    return `${raw.slice(0, 39)}...`;
}

function setInfoWorkspaceText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
}

function renderInfoWorkspaceSummary() {
    const readValue = (id, fallback = '') => {
        const el = document.getElementById(id);
        if (!el) return String(fallback || '').trim();
        if (el.type === 'checkbox') return el.checked;
        return String(el.value || '').trim();
    };

    const address = readValue('lpAddress', restaurantConfig.location?.address || '');
    const mapUrl = readValue('lpMapUrl', restaurantConfig.location?.url || '');
    const phone = readValue('lpPhone', restaurantConfig.phone || '');
    const socialLinks = [
        readValue('lpInsta', restaurantConfig.socials?.instagram || ''),
        readValue('lpFb', restaurantConfig.socials?.facebook || ''),
        readValue('lpTiktok', restaurantConfig.socials?.tiktok || ''),
        readValue('lpTrip', restaurantConfig.socials?.tripadvisor || '')
    ].filter(Boolean);

    const selectedPayments = Object.entries(GUEST_EXPERIENCE_PAYMENT_FIELDS)
        .filter(([, fieldId]) => {
            const input = document.getElementById(fieldId);
            return input ? input.checked : false;
        })
        .map(([id]) => id);

    const selectedFacilities = Object.entries(GUEST_EXPERIENCE_FACILITY_FIELDS)
        .filter(([, fieldId]) => {
            const input = document.getElementById(fieldId);
            return input ? input.checked : false;
        })
        .map(([id]) => id);

    const guestSignalCount = selectedPayments.length + selectedFacilities.length;

    const visibleSectionCount = Object.entries(SECTION_VISIBILITY_FIELDS).filter(([, fieldId]) => {
        const input = document.getElementById(fieldId);
        return input ? input.checked : true;
    }).length;

    const hoursNote = readValue('hoursNote', restaurantConfig._hoursNote || '');
    const hoursSource = Array.isArray(restaurantConfig._hours) && restaurantConfig._hours.length
        ? restaurantConfig._hours
        : (Array.isArray(window.defaultHours) ? window.defaultHours : []);
    const configuredHoursCount = hoursSource.filter((entry) => entry && entry.open && entry.close).length;
    const hoursSummary = hoursNote
        ? summarizeInfoCopy(hoursNote)
        : (configuredHoursCount ? `${configuredHoursCount} days configured` : 'Set opening hours');

    const wifiName = readValue('wifiSSID', restaurantConfig.wifi?.name || '');
    const securityUser = readValue('adminNewUser', adminAuth?.user || '');

    setInfoWorkspaceText('infoSummaryLocationValue', address || 'Add address');
    setInfoWorkspaceText('infoSummaryLocationNote', mapUrl && isValidAbsoluteUrl(mapUrl) ? 'Map link ready' : 'Map link pending');

    setInfoWorkspaceText('infoSummaryContactValue', phone || 'Add phone number');
    setInfoWorkspaceText('infoSummaryContactNote', socialLinks.length
        ? `${socialLinks.length} public link${socialLinks.length > 1 ? 's' : ''} live`
        : 'No public links yet');

    setInfoWorkspaceText('infoSummaryGuestValue', guestSignalCount ? `${guestSignalCount} guest signals live` : 'Review facilities');
    setInfoWorkspaceText('infoSummaryGuestNote', `${visibleSectionCount} homepage section${visibleSectionCount > 1 ? 's' : ''} visible`);

    setInfoWorkspaceText('infoSummaryOpsValue', securityUser ? `@${securityUser}` : 'Review access');
    setInfoWorkspaceText('infoSummaryOpsNote', wifiName ? `WiFi: ${summarizeInfoCopy(wifiName)}` : 'WiFi not configured');

    setInfoWorkspaceText('infoSocialMetric', socialLinks.length
        ? `${socialLinks.length} link${socialLinks.length > 1 ? 's' : ''} live`
        : 'No links live');
    setInfoWorkspaceText('infoFacilitiesMetric', guestSignalCount ? `${guestSignalCount} active` : 'Nothing active');
    setInfoWorkspaceText('infoHoursMetric', hoursSummary);
    setInfoWorkspaceText('infoWifiMetric', wifiName ? summarizeInfoCopy(wifiName, 'Configured') : 'Not configured');
    setInfoWorkspaceText('infoSecurityMetric', securityUser ? `@${securityUser}` : 'Update login');
}

function getInfoSaveButtonOriginalLabel(button) {
    if (!button) return '';
    if (!button.dataset.originalLabel) {
        button.dataset.originalLabel = button.textContent.trim();
    }
    return button.dataset.originalLabel;
}

function setInfoSaveButtonState(button, state) {
    if (!button) return;

    const originalLabel = getInfoSaveButtonOriginalLabel(button);
    if (button._saveFeedbackTimer) {
        clearTimeout(button._saveFeedbackTimer);
        button._saveFeedbackTimer = null;
    }

    button.classList.remove('is-saving', 'is-saved');
    button.disabled = false;

    if (state === 'saving') {
        button.classList.add('is-saving');
        button.disabled = true;
        button.textContent = t('admin.save_state.saving_label', 'Saving');
        return;
    }

    if (state === 'saved') {
        button.classList.add('is-saved');
        button.textContent = t('admin.save_state.success_label', 'Saved');
        button._saveFeedbackTimer = setTimeout(() => {
            button.classList.remove('is-saved');
            button.textContent = getInfoSaveButtonOriginalLabel(button);
        }, 1600);
        return;
    }

    button.textContent = originalLabel;
}

function getBrandingSaveButtons() {
    return Array.from(document.querySelectorAll('#brandingForm button[type="submit"]'));
}

function setBrandingSaveButtonsState(state) {
    getBrandingSaveButtons().forEach((button) => {
        setInfoSaveButtonState(button, state);
    });
}

function setGallerySaveButtonState(state) {
    const button = document.getElementById('brandingGallerySaveBtn');
    if (!button) return;
    setInfoSaveButtonState(button, state);
}

function initSectionVisibilityFields() {
    const sectionVisibility = restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {};

    Object.entries(SECTION_VISIBILITY_FIELDS).forEach(([key, fieldId]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.checked = typeof sectionVisibility[key] === 'boolean' ? sectionVisibility[key] : true;
        }
    });
}

function normalizeSectionOrderDraft(input) {
    const source = Array.isArray(input) ? input : [];
    const out = [];

    source.forEach((value) => {
        if (typeof value !== 'string') return;
        const safeValue = value.trim();
        if (!ADMIN_SECTION_ORDER_KEYS.includes(safeValue)) return;
        if (out.includes(safeValue)) return;
        out.push(safeValue);
    });

    ADMIN_SECTION_ORDER_KEYS.forEach((key) => {
        if (!out.includes(key)) {
            out.push(key);
        }
    });

    return out;
}

function renderSectionOrderEditor() {
    const container = document.getElementById('landingSectionOrderList');
    if (!container) return;

    landingSectionOrderDraft = normalizeSectionOrderDraft(landingSectionOrderDraft);

    container.innerHTML = landingSectionOrderDraft.map((key, index) => `
        <div class="section-order-item">
            <div class="section-order-copy">
                <strong>${escapeHtml(t(SECTION_ORDER_LABELS[key], key))}</strong>
                <span>Position ${index + 1}</span>
            </div>
            <div class="section-order-actions">
                <button type="button" class="section-order-btn" onclick="moveLandingSectionOrder('${key}', -1)" ${index === 0 ? 'disabled' : ''}>Up</button>
                <button type="button" class="section-order-btn" onclick="moveLandingSectionOrder('${key}', 1)" ${index === landingSectionOrderDraft.length - 1 ? 'disabled' : ''}>Down</button>
            </div>
        </div>
    `).join('');
}

window.moveLandingSectionOrder = function (key, direction) {
    const currentOrder = normalizeSectionOrderDraft(landingSectionOrderDraft);
    const index = currentOrder.indexOf(key);
    if (index === -1) return;

    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= currentOrder.length) return;

    [currentOrder[index], currentOrder[nextIndex]] = [currentOrder[nextIndex], currentOrder[index]];
    landingSectionOrderDraft = currentOrder;
    renderSectionOrderEditor();
};

const BRANDING_PREVIEW_INPUT_IDS = [
    'brandPresetId',
    'brandRestaurantName',
    'brandShortName',
    'brandTagline',
    'brandLogoMark',
    'brandPrimaryColor',
    'brandSecondaryColor',
    'brandAccentColor',
    'brandSurfaceColor',
    'brandSurfaceMuted',
    'brandTextColor',
    'brandTextMuted',
    'brandMenuBackground',
    'brandMenuSurface',
    'brandHeroImage',
    'brandHeroSlide2',
    'brandHeroSlide3',
    'brandLogoImage'
];

function normalizePreviewColor(value, fallback) {
    const raw = typeof value === 'string' ? value.trim() : '';
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw) ? raw : fallback;
}

function isValidAbsoluteUrl(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return false;

    try {
        const parsed = new URL(raw);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

function isValidAssetUrl(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return true;
    return raw.startsWith('/')
        || raw.startsWith('images/')
        || raw.startsWith('uploads/')
        || isValidAbsoluteUrl(raw);
}

function isLikelyPhoneNumber(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return false;
    return /^[+\d][\d\s\-()/.]{5,}$/.test(raw);
}

function getBrandingDraftFromForm() {
    const defaults = window.defaultBranding || {};
    const selectedPresetId = document.getElementById('brandPresetId')?.value || restaurantConfig.branding?.presetId || defaults.presetId || 'core';
    const presetDefaults = typeof window.getBrandPresetConfig === 'function'
        ? window.getBrandPresetConfig(selectedPresetId)
        : (PRESET_THEME_TOKENS[selectedPresetId] || {});
    const currentBranding = typeof window.normalizeBranding === 'function'
        ? window.normalizeBranding({ ...presetDefaults, ...(restaurantConfig.branding || defaults), presetId: selectedPresetId })
        : { ...presetDefaults, ...(restaurantConfig.branding || defaults), presetId: selectedPresetId };
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };

    return {
        presetId: selectedPresetId,
        restaurantName: getValue('brandRestaurantName') || defaults.restaurantName || 'Restaurant',
        shortName: getValue('brandShortName') || defaults.shortName || 'Restaurant',
        tagline: getValue('brandTagline') || defaults.tagline || 'Cuisine, service, and atmosphere preview',
        logoMark: getValue('brandLogoMark') || defaults.logoMark || '',
        primaryColor: normalizePreviewColor(getValue('brandPrimaryColor'), currentBranding.primaryColor || defaults.primaryColor || '#e21b1b'),
        secondaryColor: normalizePreviewColor(getValue('brandSecondaryColor'), currentBranding.secondaryColor || defaults.secondaryColor || '#ff8d08'),
        accentColor: normalizePreviewColor(getValue('brandAccentColor'), currentBranding.accentColor || defaults.accentColor || '#ffd700'),
        surfaceColor: normalizePreviewColor(getValue('brandSurfaceColor'), currentBranding.surfaceColor || defaults.surfaceColor || '#fff8f0'),
        surfaceMuted: normalizePreviewColor(getValue('brandSurfaceMuted'), currentBranding.surfaceMuted || defaults.surfaceMuted || '#f4ebdd'),
        textColor: normalizePreviewColor(getValue('brandTextColor'), currentBranding.textColor || defaults.textColor || '#261a16'),
        textMuted: normalizePreviewColor(getValue('brandTextMuted'), currentBranding.textMuted || defaults.textMuted || '#75655c'),
        menuBackground: normalizePreviewColor(getValue('brandMenuBackground'), currentBranding.menuBackground || defaults.menuBackground || '#111318'),
        menuSurface: normalizePreviewColor(getValue('brandMenuSurface'), currentBranding.menuSurface || defaults.menuSurface || '#1b1f26'),
        heroImage: getValue('brandHeroImage') || currentBranding.heroImage || defaults.heroImage || '',
        heroSlides: [
            getValue('brandHeroImage') || currentBranding.heroImage || defaults.heroImage || '',
            getValue('brandHeroSlide2') || currentBranding.heroSlides?.[1] || '',
            getValue('brandHeroSlide3') || currentBranding.heroSlides?.[2] || ''
        ],
        logoImage: getValue('brandLogoImage')
    };
}

function getBrandPreviewInitials(draft) {
    const logoMark = typeof draft.logoMark === 'string' ? draft.logoMark.trim() : '';
    if (logoMark) {
        return logoMark.slice(0, 4).toUpperCase();
    }

    const seed = (draft.shortName || draft.restaurantName || 'BR')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('');

    return (seed || 'BR').toUpperCase();
}

function toCssImageUrl(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    return `url("${raw.replace(/"/g, '\\"')}")`;
}

function applyBrandPresetToForm(presetId) {
    const preset = getPresetThemePack(presetId);
    if (!preset) return;

    const assign = (id, value) => {
        const element = document.getElementById(id);
        if (element && typeof value === 'string' && value) {
            element.value = value;
        }
    };

    assign('brandPresetId', preset.presetId || presetId);
    assign('brandPrimaryColor', preset.primaryColor);
    assign('brandSecondaryColor', preset.secondaryColor);
    assign('brandAccentColor', preset.accentColor);
    assign('brandSurfaceColor', preset.surfaceColor);
    assign('brandSurfaceMuted', preset.surfaceMuted);
    assign('brandTextColor', preset.textColor);
    assign('brandTextMuted', preset.textMuted);
    assign('brandMenuBackground', preset.menuBackground);
    assign('brandMenuSurface', preset.menuSurface);

    const heroInput = document.getElementById('brandHeroImage');
    const knownPresetHeroes = Object.values(window.brandPresetCatalog || {})
        .flatMap((entry) => {
            const values = [];
            if (entry.heroImage) values.push(entry.heroImage);
            if (Array.isArray(entry.heroSlides)) values.push(...entry.heroSlides);
            return values;
        })
        .filter(Boolean);
    const applyHeroField = (fieldId, nextValue) => {
        const input = document.getElementById(fieldId);
        if (!input) return;
        const currentValue = input.value.trim();
        if (!currentValue || knownPresetHeroes.includes(currentValue)) {
            input.value = nextValue || '';
        }
    };

    applyHeroField('brandHeroImage', preset.heroSlides?.[0] || preset.heroImage || '');
    applyHeroField('brandHeroSlide2', preset.heroSlides?.[1] || '');
    applyHeroField('brandHeroSlide3', preset.heroSlides?.[2] || '');
}

function bindBrandingPreviewEvents() {
    if (bindBrandingPreviewEvents.bound) return;
    bindBrandingPreviewEvents.bound = true;

    BRANDING_PREVIEW_INPUT_IDS.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        const eventName = element.type === 'color' ? 'input' : 'input';
        element.addEventListener(eventName, () => {
            window.updateBrandingPreview();
        });
        if (eventName !== 'change') {
            element.addEventListener('change', () => {
                if (id === 'brandPresetId') {
                    applyBrandPresetToForm(element.value);
                }
                window.updateBrandingPreview();
            });
        }
    });
}

window.updateBrandingPreview = function () {
    const draft = getBrandingDraftFromForm();
    const hero = document.getElementById('brandHeroPreview');
    const logo = document.getElementById('brandLogoPreview');
    const title = document.getElementById('brandPreviewTitle');
    const heroText = document.getElementById('brandPreviewHeroText');
    const name = document.getElementById('brandPreviewName');
    const tagline = document.getElementById('brandPreviewTagline');
    const primary = document.getElementById('brandSwatchPrimary');
    const secondary = document.getElementById('brandSwatchSecondary');
    const accent = document.getElementById('brandSwatchAccent');
    const presetLabel = document.getElementById('brandPreviewPresetLabel');
    const homepageMock = document.getElementById('brandHomepageMock');
    const homepageMockTitle = document.getElementById('brandHomepageMockTitle');
    const homepageMockText = document.getElementById('brandHomepageMockText');
    const homepageMockMeta = document.getElementById('brandHomepageMockMeta');
    const homepageMockCta = document.getElementById('brandHomepageMockCta');
    const menuShell = document.getElementById('brandMenuMockShell');
    const menuChipPrimary = document.getElementById('brandMenuChipPrimary');
    const menuCardPreview = document.getElementById('brandMenuCardPreview');
    const menuCardMedia = document.getElementById('brandMenuCardMedia');
    const menuCardTitle = document.getElementById('brandMenuCardTitle');
    const menuCardText = document.getElementById('brandMenuCardText');
    const menuCardPrice = document.getElementById('brandMenuCardPrice');
    const menuCardTag = document.getElementById('brandMenuCardTag');

    if (!hero || !logo || !title || !heroText || !name || !tagline || !primary || !secondary || !accent) {
        return;
    }

    const preset = typeof window.getBrandPresetConfig === 'function'
        ? window.getBrandPresetConfig(draft.presetId)
        : { label: 'Preset', heroImage: draft.heroImage };
    const heroGradient = `linear-gradient(135deg, ${draft.accentColor} 0%, ${draft.secondaryColor} 45%, ${draft.primaryColor} 100%)`;
    const previewCard = document.querySelector('.brand-preview-card');
    const previewBody = document.querySelector('.brand-preview-body');
    const previewSwatches = document.querySelector('.brand-preview-swatches');
    hero.style.backgroundImage = draft.heroImage
        ? `${heroGradient}, ${toCssImageUrl(draft.heroImage)}`
        : heroGradient;

    title.textContent = `${draft.shortName || draft.restaurantName} website`;
    heroText.textContent = draft.tagline || 'Logo, colors, and cover image will update here as you edit.';
    name.textContent = draft.restaurantName;
    tagline.textContent = draft.tagline || 'Brand identity preview';

    if (previewCard) {
        previewCard.style.background = draft.surfaceColor;
        previewCard.style.borderColor = `${draft.primaryColor}33`;
        previewCard.style.color = draft.textColor;
    }
    if (previewBody) {
        previewBody.style.background = draft.surfaceMuted;
    }
    if (previewSwatches) {
        previewSwatches.style.background = draft.menuBackground;
        previewSwatches.style.color = '#fff';
    }

    if (draft.logoImage) {
        logo.textContent = '';
        logo.style.backgroundImage = toCssImageUrl(draft.logoImage);
    } else {
        logo.textContent = getBrandPreviewInitials(draft);
        logo.style.backgroundImage = 'none';
    }

    logo.style.backgroundColor = `${draft.primaryColor}22`;
    logo.style.color = draft.primaryColor;
    logo.style.borderColor = `${draft.primaryColor}33`;
    primary.style.background = draft.primaryColor;
    secondary.style.background = draft.secondaryColor;
    accent.style.background = draft.accentColor;

    if (presetLabel) {
        presetLabel.textContent = preset.label || draft.presetId || 'Preset';
    }

    if (homepageMock) {
        homepageMock.style.backgroundImage = draft.heroImage
            ? `${heroGradient}, ${toCssImageUrl(draft.heroImage)}`
            : heroGradient;
    }
    if (homepageMockTitle) {
        homepageMockTitle.textContent = `${draft.shortName || draft.restaurantName} website`;
    }
    if (homepageMockText) {
        homepageMockText.textContent = draft.tagline || 'Homepage hero, CTA, and media preview.';
    }
    if (homepageMockMeta) {
        homepageMockMeta.textContent = `${preset.label || 'Preset'} preview`;
    }
    if (homepageMockCta) {
        homepageMockCta.style.background = `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`;
    }

    if (menuShell) {
        menuShell.style.background = draft.menuBackground;
    }
    if (menuChipPrimary) {
        menuChipPrimary.style.background = `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`;
        menuChipPrimary.textContent = draft.shortName || 'Menu';
    }
    if (menuCardPreview) {
        menuCardPreview.style.background = draft.menuSurface;
        menuCardPreview.style.borderColor = `${draft.primaryColor}33`;
        menuCardPreview.style.color = '#fff';
    }
    if (menuCardMedia) {
        const mediaSrc = draft.heroImage || preset.heroImage || 'images/hero-default.svg';
        menuCardMedia.style.backgroundImage = `${heroGradient}, ${toCssImageUrl(mediaSrc)}`;
    }
    if (menuCardTitle) {
        menuCardTitle.textContent = `${draft.shortName || 'Signature'} Selection`;
    }
    if (menuCardText) {
        menuCardText.textContent = `Menu cards, background depth, and accent contrast for the ${preset.label || 'active'} preset.`;
    }
    if (menuCardPrice) {
        menuCardPrice.style.color = draft.accentColor;
    }
    if (menuCardTag) {
        menuCardTag.style.background = draft.secondaryColor;
    }
};

window.clearBrandAsset = function (fieldId) {
    const target = document.getElementById(fieldId);
    if (!target) return;

    target.value = '';

    if (fieldId === 'brandLogoImage') {
        const fileInput = document.getElementById('brandLogoFile');
        if (fileInput) fileInput.value = '';
    }

    if (fieldId === 'brandHeroImage') {
        const fileInput = document.getElementById('brandHeroFile');
        if (fileInput) fileInput.value = '';
    }

    if (fieldId === 'brandHeroSlide2') {
        const fileInput = document.getElementById('brandHeroSlide2File');
        if (fileInput) fileInput.value = '';
    }

    if (fieldId === 'brandHeroSlide3') {
        const fileInput = document.getElementById('brandHeroSlide3File');
        if (fileInput) fileInput.value = '';
    }

    window.updateBrandingPreview();
};

window.handleBrandAssetUpload = async function (fieldId, input) {
    const file = input && input.files && input.files[0];
    if (!file) return;

    try {
        const url = await uploadImageToServer(file);
        const target = document.getElementById(fieldId);
        if (target) {
            target.value = url;
        }
        window.updateBrandingPreview();
        showToast('Image uploaded. Save branding to publish it.');
    } catch (error) {
        console.error('Brand asset upload error:', error);
        showToast('Upload failed. Please try again.');
    } finally {
        if (input) {
            input.value = '';
        }
    }
};

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

    initGuestExperienceFields();
    initSectionVisibilityFields();
    landingSectionOrderDraft = normalizeSectionOrderDraft(
        restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS
    );
    renderSectionOrderEditor();
    renderLandingContentEditor();
    [
        'lpAddress',
        'lpMapUrl',
        'lpPhone',
        'lpInsta',
        'lpFb',
        'lpTiktok',
        'lpTrip'
    ].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.oninput = renderInfoWorkspaceSummary;
        input.onchange = renderInfoWorkspaceSummary;
    });

    [
        ...Object.values(GUEST_EXPERIENCE_PAYMENT_FIELDS),
        ...Object.values(GUEST_EXPERIENCE_FACILITY_FIELDS),
        ...Object.values(SECTION_VISIBILITY_FIELDS)
    ].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.onchange = renderInfoWorkspaceSummary;
    });

    renderInfoWorkspaceSummary();
}

function initBrandingForm() {
    const branding = restaurantConfig.branding || window.defaultBranding || {};
    const fields = {
        brandPresetId: branding.presetId || 'core',
        brandRestaurantName: branding.restaurantName || '',
        brandShortName: branding.shortName || '',
        brandTagline: branding.tagline || '',
        brandLogoMark: branding.logoMark || '',
        brandPrimaryColor: branding.primaryColor || '#e21b1b',
        brandSecondaryColor: branding.secondaryColor || '#ff8d08',
        brandAccentColor: branding.accentColor || '#ffd700',
        brandSurfaceColor: branding.surfaceColor || '#fff8f0',
        brandSurfaceMuted: branding.surfaceMuted || '#f4ebdd',
        brandTextColor: branding.textColor || '#261a16',
        brandTextMuted: branding.textMuted || '#75655c',
        brandMenuBackground: branding.menuBackground || '#111318',
        brandMenuSurface: branding.menuSurface || '#1b1f26',
        brandHeroImage: branding.heroImage || '',
        brandHeroSlide2: branding.heroSlides?.[1] || '',
        brandHeroSlide3: branding.heroSlides?.[2] || '',
        brandLogoImage: branding.logoImage || ''
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });

    bindBrandingPreviewEvents();
    window.updateBrandingPreview();
}

function initSuperCatForm() {
    const container = document.getElementById('scCatsList');
    if (!container) return;
    const cats = Object.keys(catEmojis);
    container.innerHTML = cats.map(cat => `
            <label class="chip-select-option">
                <input type="checkbox" value="${cat}" class="sc-cat-check">
                <span>${escapeHtml(window.getLocalizedCategoryName(cat, cat))}</span>
            </label>
        `).join('');
    bindSuperCategoryIconControls();
    renderSuperCategoryIconPicker(document.getElementById('scEmoji')?.value || DEFAULT_SUPER_CATEGORY_ICON);
    if (!normalizeSuperCategoryIconValue(document.getElementById('scEmoji')?.value || '')) {
        superCategoryIconManuallyChosen = false;
        setSuperCategoryIcon(DEFAULT_SUPER_CATEGORY_ICON, false);
    } else {
        updateSuperCategoryIconPreview(document.getElementById('scEmoji')?.value || DEFAULT_SUPER_CATEGORY_ICON);
    }
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
                <button class="action-btn" title="Edit super category" aria-label="Edit super category" onclick="editSuperCat('${sc.id}')">${ADMIN_ICON.edit}</button>
                <button class="action-btn" title="Delete super category" aria-label="Delete super category" onclick="deleteSuperCat('${sc.id}')">${ADMIN_ICON.trash}</button>
            </td>
        </tr>
            `).join('');
}

function editSuperCat(id) {
    const sc = restaurantConfig.superCategories.find(s => s.id === id);
    if (!sc) return;
    setMenuTranslationWarnings('supercategory');
    currentMenuWorkspaceStep = 'supercategories';
    openMenuCrudModal('supercategory', `Edit Super Category - ${sc.name}`);

    const editingIdInput = document.getElementById('scEditingId');
    if (editingIdInput) editingIdInput.value = sc.id;
    document.getElementById('scName').value = sc.name;
    setSuperCategoryIcon(sc.emoji || DEFAULT_SUPER_CATEGORY_ICON, false);
    superCategoryIconManuallyChosen = true;
    document.getElementById('scDesc').value = sc.desc;
    document.getElementById('scTime').value = sc.time || '';
    setSuperCategoryTranslationFields(sc.translations, sc.name, sc.desc);

    const checks = document.querySelectorAll('.sc-cat-check');
    checks.forEach(cb => cb.checked = sc.cats.includes(cb.value));
    refreshMenuCrudFormUx('superCatForm');
    startMenuCrudDirtyTracking(document.getElementById('superCatForm'));
}

async function deleteSuperCat(id) {
    const target = (restaurantConfig.superCategories || []).find((entry) => entry.id === id);
    const confirmed = await showAdminConfirm({
        kicker: 'Delete super category',
        title: `Delete ${target?.name || 'this super category'}?`,
        copy: 'This removes the super category from the menu builder. Categories themselves stay in the database, but they will no longer be grouped here.',
        note: 'Use this only when you are intentionally changing the restaurant menu structure.',
        confirmLabel: 'Delete super category',
        cancelLabel: 'Keep it',
        tone: 'danger'
    });
    if (!confirmed) return;
    restaurantConfig.superCategories = restaurantConfig.superCategories.filter(s => s.id !== id);
    saveAndRefresh();
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
        if (response.status === 401) {
            await showAdminNotice({
                kicker: 'Session expired',
                title: 'Please sign in again',
                copy: 'Your admin session expired while uploading an image. Sign in again and retry the upload.',
                confirmLabel: 'Reload now'
            });
            location.reload();
            return;
        }
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


function renderImporterDraftOutputs(draft) {
    const summaryEl = document.getElementById('importStudioSummaryOutput');
    const jsonEl = document.getElementById('importStudioJsonOutput');
    const reviewGridEl = document.getElementById('importStudioReviewGrid');
    const reviewSummaryEl = document.getElementById('importStudioReviewSummary');
    const reviewTitleEl = document.getElementById('importStudioReviewTitle');
    const reviewNarrativeEl = document.getElementById('importStudioReviewNarrative');
    const confidenceRowEl = document.getElementById('importStudioConfidenceRow');
    const issueGridEl = document.getElementById('importStudioIssueGrid');
    const applyNoteEl = document.getElementById('importStudioApplyNote');
    const applyMenuOnlyBtn = document.getElementById('applyImporterMenuOnlyBtn');
    const applyStructureBtn = document.getElementById('applyImporterStructureBtn');
    const copyBtn = document.querySelector('#data-tools .tool-actions .brand-secondary-btn');
    if (!summaryEl || !jsonEl) return;

    if (!draft) {
        summaryEl.value = 'No draft generated yet.';
        jsonEl.value = '';
        lastImporterReviewReport = null;
        if (reviewGridEl) reviewGridEl.innerHTML = '';
        if (issueGridEl) issueGridEl.innerHTML = '';
        if (confidenceRowEl) confidenceRowEl.innerHTML = '';
        if (reviewSummaryEl) reviewSummaryEl.hidden = true;
        renderImporterImpactPanel(null, null);
        if (applyNoteEl) {
            applyNoteEl.className = 'importer-apply-note';
            applyNoteEl.textContent = '';
            applyNoteEl.style.display = '';
        }
        if (applyMenuOnlyBtn) applyMenuOnlyBtn.disabled = true;
        if (applyStructureBtn) applyStructureBtn.disabled = true;
        if (copyBtn) copyBtn.disabled = true;
        initializeAdminHelpToggles();
        return;
    }

    const restaurantData = draft.restaurantData || {};
    const review = draft.review || {};
    const menuItems = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
    const superCategories = Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : [];
    const untranslatedItems = Array.isArray(review.untranslatedItems) ? review.untranslatedItems : [];
    const reviewReport = getImporterReviewReport(draft);
    lastImporterReviewReport = reviewReport;

    summaryEl.value = [
        `Job id: ${lastImporterDraftMeta?.jobId || 'n/a'}`,
        `Summary: ${review.summary || 'No summary returned.'}`,
        `Menu items: ${menuItems.length}`,
        `Categories: ${Object.keys(restaurantData.catEmojis || {}).length}`,
        `Super categories: ${superCategories.length}`,
        `Blockers: ${reviewReport.blockers.length}`,
        `Warnings: ${reviewReport.warnings.length}`,
        `Untranslated items: ${untranslatedItems.length}`,
        `Library image matches: ${lastImporterDraftMeta?.mediaLibraryMatches || review.mediaLibraryMatches || 0}`,
        `Menu extraction confidence: ${review.confidence?.menuExtraction || 'unknown'}`,
        `Translation confidence: ${review.confidence?.translations || 'unknown'}`,
        `Media confidence: ${review.confidence?.mediaMatching || 'unknown'}`,
        '',
        reviewReport.blockers.length ? `Blockers:\n- ${reviewReport.blockers.join('\n- ')}` : 'Blockers:\n- none',
        '',
        reviewReport.warnings.length ? `Warnings:\n- ${reviewReport.warnings.join('\n- ')}` : 'Warnings:\n- none'
    ].join('\n');

    jsonEl.value = JSON.stringify(draft, null, 2);

    if (reviewGridEl) {
        reviewGridEl.innerHTML = [
            { value: reviewReport.menuItemCount, label: 'Items' },
            { value: reviewReport.categoryCount, label: 'Categories' },
            { value: reviewReport.superCategoryCount, label: 'Super Categories' },
            { value: reviewReport.missingPriceCount, label: 'Missing Price' },
            { value: reviewReport.missingTranslationCount + reviewReport.weakTranslationCount, label: 'Language Review' },
            { value: reviewReport.uncategorizedCount, label: 'Needs Placement' }
        ].map((entry) => `
            <div class="importer-review-stat">
                <strong>${entry.value}</strong>
                <span>${entry.label}</span>
            </div>
        `).join('');
    }

    if (reviewSummaryEl) reviewSummaryEl.hidden = false;
    if (reviewTitleEl) {
        reviewTitleEl.textContent = review.summary ? 'Review the draft' : 'Review the imported draft';
    }
    if (reviewNarrativeEl) {
        reviewNarrativeEl.textContent = review.summary
            ? `${review.summary} Check blockers, warnings, and translation quality before you publish anything live.`
            : 'The importer generated a draft. Review the quality signals before you publish it live.';
    }
    if (confidenceRowEl) {
        confidenceRowEl.innerHTML = buildImporterConfidencePillsMarkup(review);
    }
    if (issueGridEl) {
        issueGridEl.innerHTML = buildImporterIssuePanelsMarkup(reviewReport, untranslatedItems);
    }
    renderImporterImpactPanel(reviewReport, draft, lastImporterDraftMeta || {});

    if (applyMenuOnlyBtn) {
        applyMenuOnlyBtn.disabled = importStudioBusy || !reviewReport.canApplyMenuOnly;
    }
    if (applyStructureBtn) {
        applyStructureBtn.disabled = importStudioBusy || !reviewReport.canApplyMenuStructure;
    }
    if (copyBtn) copyBtn.disabled = importStudioBusy;

    if (applyNoteEl) {
        if (reviewReport.blockers.length) {
            applyNoteEl.className = 'importer-apply-note is-block';
            applyNoteEl.style.display = '';
            applyNoteEl.textContent = `Resolve the blocking issues before publish: ${reviewReport.blockers.slice(0, 3).join(' | ')}`;
        } else if (reviewReport.warnings.length) {
            applyNoteEl.className = 'importer-apply-note is-warn';
            applyNoteEl.style.display = '';
            applyNoteEl.textContent = `Review these warnings before publish: ${reviewReport.warnings.slice(0, 3).join(' | ')}`;
        } else {
            applyNoteEl.className = 'importer-apply-note';
            applyNoteEl.textContent = 'This draft is ready. Choose the scope you want to replace.';
            applyNoteEl.style.display = 'block';
        }
    }
    initializeAdminHelpToggles();
}

function getImporterReviewReport(draft) {
    const restaurantData = draft?.restaurantData || {};
    const review = draft?.review || {};
    const menuItems = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
    const catMap = restaurantData.catEmojis && typeof restaurantData.catEmojis === 'object' ? restaurantData.catEmojis : {};
    const categoryTranslationMap = restaurantData.categoryTranslations && typeof restaurantData.categoryTranslations === 'object'
        ? restaurantData.categoryTranslations
        : {};
    const superCategories = Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : [];
    const hasArabicScript = (value) => /[\u0600-\u06FF]/.test(typeof value === 'string' ? value : '');
    const normalizeCompare = (value) => (typeof value === 'string' ? value.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '');
    const isWeakTranslation = (item) => {
        const translations = normalizeMenuItemTranslations(item?.translations);
        const baseName = typeof item?.name === 'string' ? item.name.trim() : '';
        const frName = translations.fr?.name || '';
        const enName = translations.en?.name || '';
        const arName = translations.ar?.name || '';
        const baseNorm = normalizeCompare(baseName);
        const frNorm = normalizeCompare(frName);
        const enNorm = normalizeCompare(enName);
        const arNorm = normalizeCompare(arName);

        if (!frName || !enName || !arName) return true;
        if (!hasArabicScript(arName)) return true;
        if (frNorm && enNorm && frNorm === enNorm && frNorm !== 'sushi' && frNorm !== 'pizza' && frNorm !== 'burger') return true;
        if (baseNorm && frNorm === baseNorm && enNorm === baseNorm && arNorm === baseNorm) return true;
        return false;
    };

    const missingPriceCount = menuItems.filter((item) => item?.price === null || item?.price === '' || typeof item?.price === 'undefined').length;
    const missingTranslationCount = menuItems.filter((item) => {
        const translations = normalizeMenuItemTranslations(item?.translations);
        return ['fr', 'en', 'ar'].some((lang) => !translations[lang]?.name);
    }).length;
    const missingDescriptionCount = menuItems.filter((item) => {
        const desc = typeof item?.desc === 'string' ? item.desc.trim() : '';
        return !desc;
    }).length;
    const uncategorizedCount = menuItems.filter((item) => {
        const cat = typeof item?.cat === 'string' ? item.cat.trim() : '';
        return !cat || !catMap[cat];
    }).length;
    const currentCategoryKeys = Object.keys(catEmojis || {});
    const menuOnlyCategoryMismatchCount = menuItems.filter((item) => {
        const cat = typeof item?.cat === 'string' ? item.cat.trim() : '';
        return cat && !currentCategoryKeys.includes(cat);
    }).length;
    const categoryKeys = Object.keys(catMap);
    const weakTranslationCount = menuItems.filter((item) => isWeakTranslation(item)).length;
    const duplicateIdCount = (() => {
        const ids = menuItems.map((item) => typeof item?.id === 'string' || typeof item?.id === 'number' ? String(item.id).trim() : '').filter(Boolean);
        return ids.length - new Set(ids).size;
    })();
    const duplicateNameCount = (() => {
        const seen = new Set();
        let duplicates = 0;
        menuItems.forEach((item) => {
            const key = `${normalizeCompare(item?.cat)}|${normalizeCompare(item?.name)}`;
            if (!key || key === '|') return;
            if (seen.has(key)) {
                duplicates += 1;
                return;
            }
            seen.add(key);
        });
        return duplicates;
    })();
    const orphanSuperCategoryRefCount = superCategories.reduce((total, entry) => {
        const cats = Array.isArray(entry?.cats) ? entry.cats : [];
        return total + cats.filter((cat) => typeof cat === 'string' && cat.trim() && !catMap[cat.trim()]).length;
    }, 0);

    const derivedBlockers = [];
    if (!menuItems.length) derivedBlockers.push('No menu items were extracted.');
    if (!categoryKeys.length) derivedBlockers.push('No categories were extracted.');
    if (uncategorizedCount > 0) derivedBlockers.push(`${uncategorizedCount} menu item(s) are not mapped to a valid category.`);
    if (duplicateIdCount > 0) derivedBlockers.push(`${duplicateIdCount} duplicate menu item id(s) remain in the draft.`);
    if (duplicateNameCount > 0) derivedBlockers.push(`${duplicateNameCount} duplicate menu item name(s) remain inside the same category.`);
    if (orphanSuperCategoryRefCount > 0) derivedBlockers.push(`${orphanSuperCategoryRefCount} super-category reference(s) point to missing categories.`);

    const baseBlockers = Array.isArray(review.blockers) ? review.blockers.filter(Boolean) : [];
    const warnings = [
        ...(Array.isArray(review.warnings) ? review.warnings.filter(Boolean) : []),
        ...(missingPriceCount > 0 ? [`${missingPriceCount} item(s) still miss a price.`] : []),
        ...(missingTranslationCount > 0 ? [`${missingTranslationCount} item(s) still miss one or more translated names.`] : []),
        ...(weakTranslationCount > 0 ? [`${weakTranslationCount} item(s) still look like fallback translations and should be reviewed before apply.`] : []),
        ...(missingDescriptionCount > 0 ? [`${missingDescriptionCount} item(s) still miss a description.`] : []),
        ...(menuOnlyCategoryMismatchCount > 0 ? [`${menuOnlyCategoryMismatchCount} item(s) use categories that do not exist in the current site. Use "Menu + category structure" instead of "Menu only".`] : [])
    ];

    const blockers = [...baseBlockers, ...derivedBlockers];

    return {
        menuItemCount: menuItems.length,
        categoryCount: categoryKeys.length || Object.keys(categoryTranslationMap).length,
        superCategoryCount: superCategories.length,
        missingPriceCount,
        missingTranslationCount,
        weakTranslationCount,
        missingDescriptionCount,
        uncategorizedCount,
        menuOnlyCategoryMismatchCount,
        duplicateIdCount,
        duplicateNameCount,
        orphanSuperCategoryRefCount,
        blockers,
        warnings,
        canApplyMenuOnly: menuItems.length > 0 && menuOnlyCategoryMismatchCount === 0 && blockers.length === 0,
        canApplyMenuStructure: menuItems.length > 0 && categoryKeys.length > 0 && uncategorizedCount === 0 && blockers.length === 0
    };
}

function isPdfImportFile(file) {
    const source = file || {};
    const name = typeof source.name === 'string' ? source.name.trim().toLowerCase() : '';
    const type = typeof source.type === 'string' ? source.type.trim().toLowerCase() : '';
    return type === 'application/pdf' || name.endsWith('.pdf');
}

async function uploadFilesForImporter(fileList, label, onProgress) {
    const files = Array.from(fileList || []).filter(Boolean);
    const urls = [];

    for (let index = 0; index < files.length; index += 1) {
        if (typeof onProgress === 'function') {
            onProgress({
                label,
                index: index + 1,
                total: files.length,
                fileName: files[index]?.name || ''
            });
        }
        const url = await uploadImageToServer(files[index]);
        if (url) urls.push(url);
    }

    return urls;
}

function buildImporterJobUiState(job) {
    const progress = Math.max(0, Math.min(100, Number(job?.progress) || 0));
    const status = typeof job?.status === 'string' ? job.status : 'running';
    const stage = typeof job?.stage === 'string' ? job.stage : '';
    return {
        status,
        stageKey: stage,
        progress,
        badge: status === 'failed' ? 'Import failed' : status === 'succeeded' ? 'Draft ready' : 'Import in progress',
        title: job?.title || 'Processing import',
        copy: job?.detail || 'The importer is still processing your menu files.',
        meta: stage ? stage.replace(/_/g, ' ') : `${progress}% complete`,
        hint: status === 'succeeded'
            ? 'Review the draft below before applying it live.'
            : 'Keep this page open while extraction and structuring finish.'
    };
}

function buildImporterResumeUiState(jobId) {
    return {
        status: 'running',
        stageKey: 'queued',
        progress: 14,
        badge: 'Resuming import',
        title: 'Reconnecting to the running import',
        copy: 'An import is already running. The admin is reconnecting to it now.',
        meta: jobId ? `Job ${jobId}` : 'Recovering active job',
        hint: 'Keep this page open while the running import finishes.'
    };
}

function buildImporterReconnectNeededUiState(jobId = '', copyOverride = '') {
    return {
        status: 'failed',
        stageKey: 'extract',
        progress: 100,
        badge: 'Reconnect needed',
        title: 'Importer connection lost',
        copy: copyOverride || 'The importer may still be running. Reopen Import to reconnect.',
        meta: jobId ? `Job ${jobId}` : 'Reconnect to continue',
        hint: 'Try opening the Import section again in a moment.'
    };
}

function getLongTaskConflictMessage(error) {
    if (error?.message === 'importer_job_in_progress') {
        return 'Finish the current import before starting another AI or data task.';
    }
    return '';
}

async function pollImporterDraftJob(jobId) {
    clearActiveImporterPollHandle();
    activeImporterJobId = jobId;
    persistActiveImporterJob(jobId);

    return await new Promise((resolve, reject) => {
        let failureCount = 0;
        const poll = async () => {
            try {
                const response = await fetch(`/api/importer/jobs/${encodeURIComponent(jobId)}`, {
                    credentials: 'include',
                    cache: 'no-store'
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.ok || !data.job) {
                    throw new Error(data.error || 'Importer progress is unavailable.');
                }

                failureCount = 0;
                const job = data.job;
                applyImportStudioProgress(buildImporterJobUiState(job));

                if (job.status === 'succeeded') {
                    clearActiveImporterPollHandle();
                    activeImporterJobId = '';
                    persistActiveImporterJob('');
                    resolve(job.result);
                    return;
                }

                if (job.status === 'failed') {
                    clearActiveImporterPollHandle();
                    activeImporterJobId = '';
                    persistActiveImporterJob('');
                    const error = new Error(job?.error?.message || 'Importer draft failed.');
                    error.stage = job?.error?.stage || job?.stage || '';
                    reject(error);
                    return;
                }

                activeImporterPollHandle = setTimeout(poll, 1000);
            } catch (error) {
                failureCount += 1;

                if (failureCount < IMPORTER_JOB_POLL_MAX_FAILURES) {
                    applyImportStudioProgress({
                        status: 'running',
                        badge: 'Reconnecting',
                        title: 'Trying to reconnect to the importer',
                        copy: 'The importer may still be running. The admin is retrying automatically.',
                        progress: 22,
                        meta: `Retry ${failureCount}/${IMPORTER_JOB_POLL_MAX_FAILURES - 1}`,
                        hint: 'Keep this page open while the connection recovers.'
                    });
                    activeImporterPollHandle = setTimeout(poll, 1500);
                    return;
                }

                clearActiveImporterPollHandle();
                activeImporterJobId = '';
                persistActiveImporterJob('');
                error.code = error.code || 'importer_poll_lost';
                reject(error);
            }
        };

        poll();
    });
}

async function resumeActiveImporterJobIfNeeded() {
    let jobId = activeImporterJobId || getPersistedActiveImporterJob();
    if (!jobId && !importStudioBusy) {
        try {
            const response = await fetch('/api/importer/jobs/active/current', {
                credentials: 'include',
                cache: 'no-store'
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok && data?.ok && data?.job?.jobId) {
                jobId = data.job.jobId;
                persistActiveImporterJob(jobId);
            }
        } catch (error) {
            console.error('Active importer discovery error:', error);
        }
    }

    if (!jobId || importStudioBusy) return;

    const dataToolsBtn = document.getElementById('sellerToolsNavBtn');
    if (dataToolsBtn) {
        showSection('data-tools', dataToolsBtn);
    }

    try {
        const result = await pollImporterDraftJob(jobId);
        if (result?.draft) {
            lastImporterDraft = result.draft;
            lastImporterDraftMeta = {
                jobId: result?.jobId || jobId,
                mediaLibraryMatches: Number(result?.mediaLibraryMatches) || 0
            };
            renderImporterDraftOutputs(lastImporterDraft);
            applyImportStudioProgress({
                status: 'succeeded',
                badge: 'Draft ready',
                title: 'Menu draft generated',
                copy: 'Review the draft before publishing.',
                progress: 100,
                meta: lastImporterDraftMeta.jobId ? `Job ${lastImporterDraftMeta.jobId}` : 'Ready',
                hint: 'Review it, then publish what you want.'
            });
            setTimeout(() => {
                setAdminTaskOverlay(null);
                setImportStudioControlsBusy(false);
            }, 320);
            showToast('Importer draft restored.');
        }
    } catch (error) {
        console.error('Importer resume error:', error);
        if (error?.code === 'importer_poll_lost') {
            applyImportStudioProgress(buildImporterReconnectNeededUiState(jobId));
            setTimeout(() => {
                setAdminTaskOverlay(null);
                setImportStudioControlsBusy(false);
            }, 240);
            showToast('Importer connection lost. Reopen Import to reconnect.');
            return;
        }
        persistActiveImporterJob('');
        setAdminTaskOverlay(null);
        setImportStudioControlsBusy(false);
        setImportStudioStatus(null);
    }
}

function buildImporterApplyPayload(draft, scope = 'menu_only') {
    const imported = draft?.restaurantData || {};
    const importedMenu = Array.isArray(imported.menu) && imported.menu.length ? imported.menu : menu;
    const preparedMenu = importedMenu.map((item) => {
        const images = Array.isArray(item?.images)
            ? item.images.filter((value) => typeof value === 'string' && value.trim())
            : [];
        const img = typeof item?.img === 'string' ? item.img.trim() : '';

        if (img || images.length) {
            return {
                ...item,
                img: img || images[0] || '',
                images: images.length ? images : (img ? [img] : [])
            };
        }

        if (typeof window.getMenuImageSuggestion === 'function') {
            const suggestion = window.getMenuImageSuggestion(item);
            if (suggestion?.src) {
                return {
                    ...item,
                    img: suggestion.src,
                    images: [suggestion.src]
                };
            }
        }

        return item;
    });

    const applyStructure = scope === 'menu_structure';

    return {
        menu: preparedMenu,
        catEmojis: applyStructure
            ? { ...(imported.catEmojis || {}) }
            : { ...catEmojis },
        categoryImages: { ...categoryImages },
        categoryTranslations: applyStructure
            ? { ...(imported.categoryTranslations || {}) }
            : { ...categoryTranslations },
        wifi: {
            ssid: restaurantConfig.wifi?.name || '',
            pass: restaurantConfig.wifi?.code || ''
        },
        social: {
            ...(restaurantConfig.socials || {})
        },
        guestExperience: restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: {
            ...(restaurantConfig.branding || window.defaultBranding || {})
        },
        contentTranslations: {
            fr: { ...(restaurantConfig.contentTranslations?.fr || {}) },
            en: { ...(restaurantConfig.contentTranslations?.en || {}) },
            ar: { ...(restaurantConfig.contentTranslations?.ar || {}) }
        },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: applyStructure
            ? (Array.isArray(imported.superCategories) && imported.superCategories.length ? imported.superCategories : [])
            : (restaurantConfig.superCategories || []),
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: {
                ...(restaurantConfig.location || {})
            },
            phone: restaurantConfig.phone || ''
        }
    };
}

window.generateImporterDraft = async function () {
    if (importStudioBusy) {
        showToast('The importer is already running. Please wait for it to finish.');
        return;
    }

    const menuFiles = Array.from(document.getElementById('importStudioMenuFiles')?.files || []);
    const branding = restaurantConfig?.branding || {};
    const restaurantName = (branding.restaurantName || window.getRestaurantDisplayName?.() || '').trim();
    const shortName = (branding.shortName || restaurantName || '').trim();
    const menuImageFiles = menuFiles.filter((file) => !isPdfImportFile(file));
    const menuPdfFiles = menuFiles.filter((file) => isPdfImportFile(file));

    if (!menuFiles.length) {
        showToast('Add at least one menu image or PDF first.');
        return;
    }

    if (menuFiles.length > IMPORT_STUDIO_MAX_MENU_IMAGES) {
        showToast(`Use up to ${IMPORT_STUDIO_MAX_MENU_IMAGES} menu files per draft.`);
        return;
    }

    try {
        applyImportStudioProgress({
            status: 'running',
            stageKey: 'upload',
            badge: 'Import in progress',
            title: 'Uploading menu files',
            copy: 'Preparing your files.',
            progress: 6,
            meta: 'Uploading assets'
        });

        const totalUploadCount = menuFiles.length;
        const updateUploadProgress = ({ label, index, total, fileName }) => {
            const completed = index - 1;
            const progress = totalUploadCount > 0
                ? 6 + Math.round(((completed + 0.35) / totalUploadCount) * 16)
                : 12;
            applyImportStudioProgress({
                status: 'running',
                stageKey: 'upload',
                badge: 'Import in progress',
                title: 'Uploading menu files',
                copy: fileName
                    ? `Uploading ${fileName}.`
                    : 'Preparing your files.',
                progress,
                meta: `${label} ${index}/${total}`
            });
        };

        const menuImageUrls = await uploadFilesForImporter(menuImageFiles, 'menu image', updateUploadProgress);
        const menuPdfUrls = await uploadFilesForImporter(menuPdfFiles, 'menu PDF', updateUploadProgress);

        applyImportStudioProgress({
            status: 'running',
            stageKey: 'queued',
            badge: 'Import in progress',
            title: 'Starting the AI importer',
            copy: 'The draft job has started and the admin is locked until it finishes.',
            progress: 18,
            meta: 'Job queued'
        });

        const response = await fetch('/api/importer/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                restaurantName,
                shortName,
                notes: '',
                menuImageUrls,
                menuPdfUrls,
                logoImageUrl: '',
                restaurantPhotoUrls: []
            })
        });

        const data = await response.json().catch(() => ({}));
        if ((!response.ok || !data.ok || !data.jobId) && data?.error === 'importer_job_in_progress' && data?.jobId) {
            applyImportStudioProgress(buildImporterResumeUiState(data.jobId));
            const result = await pollImporterDraftJob(data.jobId);
            lastImporterDraft = result?.draft || null;
            lastImporterDraftMeta = {
                jobId: result?.jobId || data.jobId || '',
                mediaLibraryMatches: Number(result?.mediaLibraryMatches) || 0
            };
            renderImporterDraftOutputs(lastImporterDraft);
            applyImportStudioProgress({
                status: 'succeeded',
                stageKey: 'succeeded',
                badge: 'Draft ready',
                title: 'Menu draft generated',
                copy: 'Review the draft before publishing.',
                progress: 100,
                meta: lastImporterDraftMeta.jobId ? `Job ${lastImporterDraftMeta.jobId}` : 'Ready',
                hint: 'Review it, then publish what you want.'
            });
            setTimeout(() => {
                setAdminTaskOverlay(null);
                setImportStudioControlsBusy(false);
            }, 320);
            showToast('Importer draft restored.');
            return;
        }

        if (!response.ok || !data.ok || !data.jobId) {
            const error = new Error(data.error || 'Importer draft failed.');
            error.jobId = data.jobId || '';
            error.stage = data.stage || '';
            throw error;
        }

        const result = await pollImporterDraftJob(data.jobId);
        lastImporterDraft = result?.draft || null;
        lastImporterDraftMeta = {
            jobId: result?.jobId || data.jobId || '',
            mediaLibraryMatches: Number(result?.mediaLibraryMatches) || 0
        };
        renderImporterDraftOutputs(lastImporterDraft);
        applyImportStudioProgress({
                status: 'succeeded',
                stageKey: 'succeeded',
                badge: 'Draft ready',
                title: 'Menu draft generated',
                copy: 'Review the draft before publishing.',
                progress: 100,
                meta: lastImporterDraftMeta.jobId ? `Job ${lastImporterDraftMeta.jobId}` : 'Ready',
                hint: 'Review it, then publish what you want.'
            });
        setTimeout(() => {
            setAdminTaskOverlay(null);
            setImportStudioControlsBusy(false);
        }, 320);
        showToast('Menu draft generated.');
    } catch (error) {
        clearActiveImporterPollHandle();
        activeImporterJobId = '';
        console.error('Importer draft error:', error);
        const message = error?.code === 'importer_poll_lost'
            ? 'The importer connection was lost. The job may still be running.'
            : error?.message === 'openai_not_configured'
            ? 'Set OPENAI_API_KEY on the admin server before using AI Import Studio.'
            : error?.message === 'invalid_json_from_openai'
                ? 'The model returned an invalid menu draft. Try fewer or clearer menu files.'
                : error?.message === 'incomplete_openai_response'
                    ? 'The model stopped before finishing the menu draft. Try fewer files or a clearer menu capture.'
                    : error.message;
        const stageLabel = error?.stage ? ` [${String(error.stage).replace(/_/g, ' ')}]` : '';
        const jobLabel = error?.jobId ? ` Job: ${error.jobId}.` : '';
        applyImportStudioProgress(error?.code === 'importer_poll_lost'
            ? buildImporterReconnectNeededUiState(error?.jobId || activeImporterJobId || '', `${message}${jobLabel}`.trim())
            : {
                status: 'failed',
                stageKey: error?.stage || 'failed',
                badge: 'Import failed',
                title: 'The menu draft could not be completed',
                copy: `${message}${jobLabel}`.trim(),
                progress: 100,
                meta: stageLabel ? stageLabel.replace(/[\[\]]/g, '') : 'Review the error and try again.',
                hint: 'You can retry after adjusting the files or server configuration.'
            });
        setImportStudioControlsBusy(false);
        setAdminTaskOverlay(null);
        showToast(
            error?.code === 'importer_poll_lost'
                ? 'Importer connection lost. Reopen Import to reconnect.'
                : `Menu draft failed${stageLabel}: ${message}.${jobLabel}`.replace(/\.\s*\./g, '.')
        );
    }
};

window.applyImporterDraft = async function (scope = 'menu_only') {
    if (!lastImporterDraft) {
        showToast('Generate a draft first.');
        return;
    }

    const report = lastImporterReviewReport || getImporterReviewReport(lastImporterDraft);
    if (scope === 'menu_structure' && !report.canApplyMenuStructure) {
        showToast('Fix the importer blockers before applying category structure.');
        return;
    }
    if (scope === 'menu_only' && !report.canApplyMenuOnly) {
        showToast('The draft does not contain any menu items to apply.');
        return;
    }

    const confirmText = scope === 'menu_structure'
        ? 'Apply menu items and imported category structure to the current restaurant instance? Branding, landing, gallery, and other site identity settings will stay unchanged.'
        : 'Apply menu items only to the current restaurant instance? Category structure and site identity settings will stay unchanged.';
    const confirmed = await showAdminConfirm({
        kicker: scope === 'menu_structure' ? 'Apply menu + structure' : 'Apply menu only',
        title: scope === 'menu_structure' ? 'Publish menu and structure?' : 'Publish menu items?',
        copy: confirmText,
        note: 'This writes the reviewed draft into the active restaurant data.',
        confirmLabel: scope === 'menu_structure' ? 'Publish everything' : 'Publish menu',
        cancelLabel: 'Not yet',
        tone: 'danger'
    });
    if (!confirmed) {
        return;
    }

    try {
        applyImportStudioProgress({
            status: 'running',
            stageKey: 'publish',
            badge: 'Publishing draft',
            title: scope === 'menu_structure' ? 'Publishing menu and structure' : 'Publishing menu items',
            copy: 'The reviewed draft is being written into the live restaurant data.',
            progress: 42,
            meta: scope === 'menu_structure' ? 'Menu + structure' : 'Menu only',
            hint: 'Please wait while the current restaurant data is updated.'
        });
        const payload = buildImporterApplyPayload(lastImporterDraft, scope);
        const response = await fetch('/api/data/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ data: payload })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.ok) {
            throw new Error(data.error || 'Draft apply failed.');
        }

        await loadDataFromServer();
        refreshUI();
        applyImportStudioProgress({
            status: 'succeeded',
            stageKey: 'publish',
            badge: 'Publish complete',
            title: scope === 'menu_structure' ? 'Menu and structure published' : 'Menu items published',
            copy: 'The public site can now use the reviewed importer data.',
            progress: 100,
            meta: 'Saved',
            hint: 'You can keep editing or generate another draft.'
        }, { overlay: false });
        setAdminTaskOverlay(null);
        setImportStudioControlsBusy(false);
        showToast(scope === 'menu_structure' ? 'Menu and structure published.' : 'Menu items published.');
    } catch (error) {
        console.error('Apply importer draft error:', error);
        applyImportStudioProgress({
            status: 'failed',
            stageKey: 'publish',
            badge: 'Apply failed',
            title: 'The reviewed draft could not be applied',
            copy: error.message,
            progress: 100,
            meta: 'Apply failed',
            hint: 'Nothing new was published. Fix the issue and try again.'
        }, { overlay: false });
        setAdminTaskOverlay(null);
        setImportStudioControlsBusy(false);
        showToast(`Draft apply failed: ${error.message}`);
    }
};

window.copyImporterDraftJson = async function () {
    if (!lastImporterDraft) {
        showToast('No draft to copy yet.');
        return;
    }

    try {
        await navigator.clipboard.writeText(JSON.stringify(lastImporterDraft, null, 2));
        showToast('Importer draft JSON copied.');
    } catch (error) {
        console.error('Copy importer draft error:', error);
        showToast('Could not copy importer draft JSON.');
    }
};

// Image handling helper
const toImageUrl = (img) => img;

async function deleteItem(id) {
    const target = menu.find((entry) => String(entry.id) === String(id));
    const confirmed = await showAdminConfirm({
        kicker: 'Delete dish',
        title: `Delete ${getAdminItemDisplayName(target) || 'this item'}?`,
        copy: 'This removes the dish from the admin menu builder and the customer-facing menu.',
        note: 'The deletion is published after saving and cannot be undone automatically.',
        confirmLabel: 'Delete dish',
        cancelLabel: 'Keep dish',
        tone: 'danger'
    });
    if (!confirmed) return;
    menu = menu.filter(m => m.id != id);
    promoIds = promoIds.filter(pid => pid != id);
    saveAndRefresh();
}
function hasPromoId(id) {
    return promoIds.some((pid) => String(pid) === String(id));
}
function togglePromo(id) {
    if (hasPromoId(id)) {
        promoIds = promoIds.filter(pid => String(pid) !== String(id));
    } else {
        promoIds.push(id);
    }
    window.promoIds = promoIds; // Sync for shared.js
    saveAndRefresh();
}
function toggleFeatured(id) {
    const item = menu.find(m => m.id == id);
    if (item) {
        item.featured = !item.featured;
        saveAndRefresh();
    }
}

window.togglePromo = togglePromo;
window.toggleFeatured = toggleFeatured;
// Legacy save handlers kept only as a fallback reference while the newer save flow remains below.
async function forceSaveChangesLegacy() {
    try {
        // If user is currently editing a food item, commit those changes first
        if (editingItemId && typeof window.commitFormItem === 'function') {
            await window.commitFormItem();
        } else {
            await saveAndRefresh();
            showToast('All changes saved.');
        }

        // Visual feedback on float button
        const btn = document.getElementById('floatSaveBtn');
        if (btn) {
            btn.classList.add('saved');
            btn.innerHTML = '<span style="font-size:1.3rem;">✓</span><span>Saved</span>';
            setTimeout(() => {
                btn.classList.remove('saved');
                btn.innerHTML = '<span style="font-size:1.3rem;">💾</span><span>Save</span>';
            }, 2500);
        }
    } catch (e) {
        console.error('Save Error:', e);
        await showAdminNotice({
            kicker: 'Save failed',
            title: 'The changes could not be saved',
            copy: e.message || 'A server error blocked this save.',
            confirmLabel: 'OK'
        });
    }
}
async function saveAndRefreshLegacy() {
    setAdminSaveState('saving', t('admin.save_state.saving_message', 'Saving changes to the server...'));
    // Strip base64 images before sending to server
    const cleanMenu = menu.map(item => {
        const imgs = item.images || (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        const safePrimaryImage = (typeof item.img === 'string' && !item.img.startsWith('data:')) ? item.img : '';
        return {
            ...item,
            translations: normalizeMenuItemTranslations(item.translations),
            images: urlOnly,
            img: urlOnly[0] || safePrimaryImage
        };
    });

    // Build payload matching server data structure
    const payload = {
        menu: cleanMenu,
        catEmojis: catEmojis,
        categoryImages: categoryImages,
        categoryTranslations: categoryTranslations,
        wifi: { ssid: restaurantConfig.wifi?.name || '', pass: restaurantConfig.wifi?.code || '' },
        social: restaurantConfig.socials || {},
        guestExperience: restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: restaurantConfig.branding || window.defaultBranding || {},
        contentTranslations: restaurantConfig.contentTranslations || { fr: {}, en: {}, ar: {} },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: restaurantConfig.superCategories || [],
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
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
            if (res.status === 401) {
                await showAdminNotice({
                    kicker: 'Session expired',
                    title: 'Please sign in again',
                    copy: 'Your admin session expired before this save completed.',
                    confirmLabel: 'Reload now'
                });
                location.reload();
                return;
            }
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server save failed');
        }
        refreshUI();
    } catch (e) {
        console.error('Save Error:', e);
        showToast('Save error: ' + e.message);
    }
}

async function loadSecurityStatus() {
    const statusCard = document.getElementById('securityStatusCard');
    if (!statusCard) return;

    try {
        const res = await fetch('/api/admin/security-status', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.ok) {
            adminSecurityStatus = null;
            statusCard.style.display = 'none';
            return;
        }

        adminSecurityStatus = data;
        const notes = [];

        if (data.usesDefaultCredentials) {
            notes.push(t('admin.security.default_credentials_note', 'Default admin credentials are still active. Change them before client handoff.'));
        }
        if (data.isLegacyPlainText) {
            notes.push(t('admin.security.legacy_plaintext_note', 'Credentials are still stored in the legacy plain-text format. Saving a new password will migrate them to secure hashed storage.'));
        }
        if (data.credentialSource === 'env') {
            notes.push(t('admin.security.env_source_note', 'This instance currently relies on environment credentials. Saving here will create a local hashed auth file for this restaurant.'));
        }
        if (data.credentialSource === 'default') {
            notes.push(t('admin.security.default_source_note', 'This instance is still using the built-in fallback credentials. Replace them before production delivery.'));
        }

        notes.push(t('admin.security.username_rule', 'Username rule: minimum 3 characters.'));
        notes.push(t('admin.security.password_rule', 'Password rule: minimum {count} characters.', { count: data.minPasswordLength || 8 }));
        notes.push(t('admin.security.session_rule', 'When credentials change, older admin sessions are closed automatically.'));

        const hasRisk = Boolean(
            data.usesDefaultCredentials ||
            data.isLegacyPlainText ||
            data.credentialSource === 'default'
        );
        statusCard.classList.toggle('is-risk', hasRisk);
        statusCard.innerHTML = `
            <div class="security-status-title">${t('admin.security.status_title', 'Security Status')}</div>
            <ul class="security-status-list">
                ${notes.map(note => `<li>${note}</li>`).join('')}
            </ul>
        `;
        statusCard.style.display = '';
    } catch (error) {
        console.error('Security status error:', error);
        adminSecurityStatus = null;
        statusCard.style.display = 'none';
    }
}

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
                if (data.error === 'too_many_attempts' && data.retryAfterSec) {
                    const retryMinutes = Math.max(1, Math.ceil(data.retryAfterSec / 60));
                    errorEl.textContent = t('admin.login.too_many_attempts', 'Too many attempts. Try again in {minutes} min.', { minutes: retryMinutes });
                } else {
                    errorEl.textContent = t('admin.login.incorrect_credentials', 'Incorrect credentials');
                }
                errorEl.style.display = 'block';
            }
            return;
        }

        if (errorEl) {
            errorEl.style.display = 'none';
        }
        showDashboard();
    } catch (e) {
        console.error('[LOGIN] Request error:', e);
        if (errorEl) {
            errorEl.textContent = t('admin.login.server_connection_error', 'Server connection error');
            errorEl.style.display = 'block';
        }
    }
}

function initSecurityForm() {
    const form = document.getElementById('securityForm');
    if (!form) return;

    loadSecurityStatus();

    const newUserInput = document.getElementById('adminNewUser');
    if (newUserInput && adminAuth.user) newUserInput.value = adminAuth.user;
    if (newUserInput) {
        newUserInput.oninput = renderInfoWorkspaceSummary;
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const saveButton = e.submitter || document.getElementById('infoSecuritySaveBtn');
        const newUsername = document.getElementById('adminNewUser').value.trim();
        const newPassword = document.getElementById('adminNewPass').value;
        const confirmPassword = document.getElementById('adminConfirmPass').value;

        if (newPassword && newPassword !== confirmPassword) {
            showToast(t('admin.security.passwords_mismatch', 'Passwords do not match.'));
            return;
        }

        try {
            setInfoSaveButtonState(saveButton, 'saving');
            const res = await fetch('/api/admin/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newUsername, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (res.ok && data.ok) {
                adminAuth.user = data.user || newUsername;
                setInfoSaveButtonState(saveButton, 'saved');
                showToast(data.message || t('admin.security.credentials_updated', 'Credentials updated successfully.'));
                document.getElementById('adminNewPass').value = '';
                document.getElementById('adminConfirmPass').value = '';
                loadSecurityStatus();
                renderInfoWorkspaceSummary();
            } else {
                setInfoSaveButtonState(saveButton, 'idle');
                showToast(data.error || t('admin.security.credentials_update_failed', 'Unable to update credentials.'));
            }
        } catch (err) {
            console.error('Credentials update error:', err);
            setInfoSaveButtonState(saveButton, 'idle');
            showToast(t('admin.login.server_connection_error', 'Server connection error.'));
        }
    };

    renderInfoWorkspaceSummary();
}

function getFloatingSaveButtonMarkup(saved = false) {
    if (saved) {
        return '<span class="floating-action-icon">OK</span><span>Saved</span>';
    }
    return '<span class="floating-action-icon">SV</span><span>Publish Changes</span>';
}

async function forceSaveChanges() {
    try {
        let saved = false;

        if (editingItemId && typeof window.commitFormItem === 'function') {
            await window.commitFormItem();
            saved = true;
        } else {
            saved = await saveAndRefresh();
            if (saved) {
                showToast('All modifications have been saved.');
            }
        }

        if (!saved) {
            return;
        }

        const btn = document.getElementById('floatSaveBtn');
        if (btn) {
            btn.classList.add('saved');
            btn.innerHTML = getFloatingSaveButtonMarkup(true);
            setTimeout(() => {
                btn.classList.remove('saved');
                btn.innerHTML = getFloatingSaveButtonMarkup(false);
            }, 2500);
        }
    } catch (e) {
        console.error('Save Error:', e);
        setAdminSaveState('error', e.message || 'Save failed.');
        showToast('Save failed: ' + e.message);
    }
}

async function performAdminSaveRequest() {
    const cleanMenu = menu.map(item => {
        const imgs = item.images || (item.img ? [item.img] : []);
        const urlOnly = imgs.filter(img => !img.startsWith('data:'));
        const safePrimaryImage = (typeof item.img === 'string' && !item.img.startsWith('data:')) ? item.img : '';
        return {
            ...item,
            translations: normalizeMenuItemTranslations(item.translations),
            images: urlOnly,
            img: urlOnly[0] || safePrimaryImage
        };
    });

    const payload = {
        menu: cleanMenu,
        catEmojis: catEmojis,
        categoryImages: categoryImages,
        categoryTranslations: categoryTranslations,
        wifi: { ssid: restaurantConfig.wifi?.name || '', pass: restaurantConfig.wifi?.code || '' },
        social: restaurantConfig.socials || {},
        guestExperience: restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: restaurantConfig.branding || window.defaultBranding || {},
        contentTranslations: restaurantConfig.contentTranslations || { fr: {}, en: {}, ar: {} },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: restaurantConfig.superCategories || [],
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: restaurantConfig.location,
            phone: restaurantConfig.phone
        }
    };

    const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        if (res.status === 401) {
            setAdminSaveState('error', t('admin.save_state.session_expired', 'Session expired. Please sign in again.'));
            showToast(t('admin.save_state.session_expired', 'Session expired. Please sign in again.'));
            location.reload();
            return false;
        }

        const err = await res.json().catch(() => ({}));
        const error = new Error(err.error || 'Server save failed');
        error.code = err.error || '';
        error.jobId = err.jobId || '';
        throw error;
    }

    refreshUI();
    return true;
}

async function saveAndRefresh() {
    adminSaveRequested = true;

    if (adminSaveLoopPromise) {
        setAdminSaveState('saving', t('admin.save_state.saving_message', 'Saving changes to the server...'));
        return adminSaveLoopPromise;
    }

    adminSaveLoopPromise = (async () => {
        let saved = false;
        try {
            while (adminSaveRequested) {
                adminSaveRequested = false;
                setAdminSaveState(
                    'saving',
                    saved
                        ? t('admin.save_state.saving_more_message', 'Saving your latest changes...')
                        : t('admin.save_state.saving_message', 'Saving changes to the server...')
                );
                saved = await performAdminSaveRequest();
            }

            if (saved) {
                setAdminSaveState('success', t('admin.save_state.success_message', 'All current changes are saved on the server.'));
            }
            return saved;
        } catch (e) {
            console.error('Save Error:', e);
            const message = getLongTaskConflictMessage(e) || e.message || t('admin.save_state.error_message', 'Save failed.');
            setAdminSaveState('error', message);
            showToast(`${t('admin.save_state.error_prefix', 'Save failed')}: ${message}`);
            return false;
        } finally {
            adminSaveLoopPromise = null;
        }
    })();

    return adminSaveLoopPromise;
}

function showToast(msg) { const t = document.getElementById('adminToast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
function showSection(id, btn) {
    const topLevelSection = resolveTopLevelSection(id);
    const navButton = btn || (topLevelSection === 'branding'
        ? document.getElementById('brandingNavBtn')
        : topLevelSection === 'info'
            ? document.getElementById('infoNavBtn')
            : topLevelSection === 'data-tools'
        ? document.getElementById('sellerToolsNavBtn')
        : topLevelSection === 'menu'
                ? document.getElementById('menuNavBtn')
                : null);
    const sectionTitle = document.getElementById('section-title');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(topLevelSection).classList.add('active');
    document.querySelectorAll(`.nav-btn[data-section="${topLevelSection}"]`).forEach(b => b.classList.add('active'));
    syncMobileParametersButton(topLevelSection);
    if (navButton) navButton.classList.add('active');
    if (sectionTitle) {
        sectionTitle.textContent = getSectionTitle(topLevelSection);
    }
    syncParameterTabs(topLevelSection);

    if (topLevelSection === 'menu') {
        if (id === 'menu') {
            resetMenuBuilderNavigation();
        } else {
            currentMenuWorkspaceStep = getMenuWorkspaceStepForSection(id);
        }
        renderMenuBuilder();
    } else if (id !== topLevelSection) {
        requestAnimationFrame(() => {
            scrollToAdminSubsection(id);
        });
    }

    // Auto-close sidebar on mobile after choosing
    if (window.innerWidth <= 992 && document.getElementById('adminSidebar')?.classList.contains('mobile-open')) {
        toggleSidebar();
    }

    storeAdminSection(id);
    syncAdminAppShell(id);
}

function syncMobileParametersButton(activeSection) {
    const sidebarOpen = document.getElementById('adminSidebar')?.classList.contains('mobile-open');
    const shouldActivate = sidebarOpen || activeSection === 'branding' || activeSection === 'data-tools';
    document.querySelectorAll('.nav-btn[data-section="parameters"]').forEach((button) => {
        button.classList.toggle('active', shouldActivate);
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
    const activeSection = document.querySelector('.section.active')?.id || 'menu';
    syncMobileParametersButton(activeSection);
}
function populateCatDropdown() {
    const el = document.getElementById('itemCat');
    if (el) el.innerHTML = Object.keys(catEmojis).map(c => `<option value="${c}">${window.getLocalizedCategoryName(c, c)}</option>`).join('');
}
function renderCatTable() {
    const el = document.querySelector('#catTable tbody');
    if (el) el.innerHTML = Object.keys(catEmojis).map(cat => {
        const image = typeof categoryImages?.[cat] === 'string' ? categoryImages[cat].trim() : '';
        const media = image
            ? `<span class="menu-builder-entry-thumb"><img src="${escapeHtml(image)}" alt="${escapeHtml(cat)}" loading="lazy" decoding="async"></span>`
            : `${catEmojis[cat]}`;
        return `<tr><td>${media}</td><td><strong>${cat}</strong></td><td>${menu.filter(m => m.cat === cat).length} items</td><td><button class="action-btn" title="Edit category image" aria-label="Edit category image" onclick="editCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.image}</button><button class="action-btn" title="Edit category" aria-label="Edit category" onclick="editCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.edit}</button><button class="action-btn" title="Delete category" aria-label="Delete category" onclick="deleteCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.trash}</button></td></tr>`;
    }).join('');
}
function editCat(cat) {
    setMenuTranslationWarnings('category');
    currentMenuWorkspaceStep = 'categories';
    menuBuilderSelectedCategoryKey = cat;
    openMenuCrudModal('category', `Edit Category - ${window.getLocalizedCategoryName(cat, cat)}`);

    const editingKeyInput = document.getElementById('catEditingKey');
    if (editingKeyInput) editingKeyInput.value = cat;
    const catNameInput = document.getElementById('catName');
    if (catNameInput) catNameInput.value = cat;
    populateCategorySuperCategoryOptions(getAssignedSuperCategoryIdForCategory(cat));
    const catImageInput = document.getElementById('catImage');
    if (catImageInput) catImageInput.value = categoryImages?.[cat] || '';
    const catImageUpload = document.getElementById('catImageUpload');
    if (catImageUpload) catImageUpload.value = '';
    setCategoryTranslationFields(cat);
    updateCategoryImagePreview();
    syncCategoryImageAiControls();
    refreshMenuCrudFormUx('catForm');
    startMenuCrudDirtyTracking(document.getElementById('catForm'));
}
async function deleteCat(cat) {
    if (menu.some(m => m.cat === cat)) {
        await showAdminNotice({
            kicker: 'Category still in use',
            title: `Remove the dishes in ${window.getLocalizedCategoryName(cat, cat)} first`,
            copy: 'This category still contains products. Delete or move those dishes before removing the category itself.',
            confirmLabel: 'OK'
        });
        return;
    }
    const confirmed = await showAdminConfirm({
        kicker: 'Delete category',
        title: `Delete ${window.getLocalizedCategoryName(cat, cat)}?`,
        copy: 'This removes the category from the menu structure and also clears its saved image and translations.',
        note: 'Only continue if the restaurant no longer needs this section.',
        confirmLabel: 'Delete category',
        cancelLabel: 'Keep category',
        tone: 'danger'
    });
    if (!confirmed) return;
    (restaurantConfig.superCategories || []).forEach((sc) => {
        if (Array.isArray(sc.cats)) {
            sc.cats = sc.cats.filter((entry) => entry !== cat);
        }
    });
    delete catEmojis[cat];
    delete categoryTranslations[cat];
    delete categoryImages[cat];
    window.categoryImages = categoryImages;
    saveAndRefresh();
}
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
    ['wifiSSID', 'wifiPassInput'].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.oninput = () => {
            if (hintS) hintS.textContent = document.getElementById('wifiSSID')?.value || '';
            if (hintP) hintP.textContent = document.getElementById('wifiPassInput')?.value || '';
            renderInfoWorkspaceSummary();
        };
        input.onchange = input.oninput;
    });
    renderInfoWorkspaceSummary();
}
function updateStats() {
    const p = document.getElementById('stat-products');
    const c = document.getElementById('stat-cats');
    const pr = document.getElementById('stat-promo');
    const featuredCount = Array.isArray(menu) ? menu.filter((item) => item?.featured).length : 0;
    if (p) p.textContent = menu.length;
    if (c) c.textContent = Object.keys(catEmojis).length;
    if (pr) pr.textContent = String(featuredCount);
}

// IMAGE MODAL LOGIC
let currentEditingId = null;

function setImageModalProgress(active, text = 'Processing image...') {
    const progressEl = document.getElementById('modalImageProgress');
    const progressTextEl = document.getElementById('modalImageProgressText');
    const dropzoneEl = document.querySelector('.image-modal-dropzone');
    if (progressEl) progressEl.hidden = !active;
    if (progressTextEl) progressTextEl.textContent = text;
    if (dropzoneEl) dropzoneEl.classList.toggle('is-busy', active);
}

function syncImageModalAiControls() {
    const toolsEl = document.getElementById('modalAiImageTools');
    const buttonEl = document.getElementById('modalGenerateImageBtn');
    if (toolsEl) {
        toolsEl.style.display = adminCapabilities.aiMediaToolsEnabled ? '' : 'none';
    }
    if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = 'Generate with AI';
    }
    setImageModalProgress(false);
}

function openImageModal(id) {
    currentEditingId = id;
    const item = menu.find(m => m.id == id); // Use == for safety
    if (!item) return;

    // Ensure item has an images array
    if (!item.images) {
        item.images = item.img ? [item.img] : [];
    }

    document.getElementById('imgModalItemName').textContent = getAdminItemDisplayName(item);
    document.getElementById('imageModal').style.display = 'flex';
    syncImageModalAiControls();
    renderModalImages();
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    const uploadInput = document.getElementById('modalImgUpload');
    const captureInput = document.getElementById('modalImgCapture');
    if (uploadInput) uploadInput.value = '';
    if (captureInput) captureInput.value = '';
    currentEditingId = null;
    syncImageModalAiControls();
}

function renderModalImages() {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;
    const grid = document.getElementById('currentImagesGrid');
    const images = item.images || (item.img ? [item.img] : []);

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden; border:1px solid #ddd;">
                <img src="${img}" width="640" height="640" loading="lazy" decoding="async" fetchpriority="low" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteModalImage(${index})" style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px; font-size:12px;">&times;</button>
                </div>
        `).join('') + (images.length === 0 ? '<p class="image-modal-empty">No images yet.</p>' : '');
}

async function handleModalImageUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const item = menu.find(m => m.id == currentEditingId);
    if (!item) return;

    if (!item.images) item.images = item.img ? [item.img] : [];

    try {
        for (let index = 0; index < input.files.length; index += 1) {
            const file = input.files[index];
            const isCapture = input.id === 'modalImgCapture';
            const progressLabel = isCapture
                ? 'Uploading captured photo...'
                : `Uploading image ${index + 1} of ${input.files.length}...`;
            setImageModalProgress(true, progressLabel);
            const url = await uploadImageToServer(file);
            item.images.push(url);
        }

        // SYNC: Ensure main img is set to the first image for the main page cards
        if (item.images.length > 0) item.img = item.images[0];

        input.value = '';
        await saveAndRefresh();
        renderModalImages();
        showToast(input.id === 'modalImgCapture' ? 'Photo added.' : 'Images added.');
    } catch (err) {
        console.error('Modal upload failed:', err);
        showToast('Upload failed.');
    } finally {
        input.value = '';
        setImageModalProgress(false);
    }
}

function setCategoryImageProgress(active, text = 'Processing category image...') {
    const progressEl = document.getElementById('catImageProgress');
    const progressTextEl = document.getElementById('catImageProgressText');
    const buttonEl = document.getElementById('catGenerateImageBtn');
    if (progressEl) progressEl.hidden = !active;
    if (progressTextEl) progressTextEl.textContent = text;
    if (buttonEl) {
        buttonEl.disabled = active || !adminCapabilities.aiMediaToolsEnabled;
        buttonEl.textContent = active ? 'Generating...' : 'Generate with AI';
    }
}

function syncCategoryImageAiControls() {
    const buttonEl = document.getElementById('catGenerateImageBtn');
    if (buttonEl) {
        buttonEl.style.display = adminCapabilities.aiMediaToolsEnabled ? '' : 'none';
    }
    setCategoryImageProgress(false);
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
    showToast('Image added from URL.');
}

function deleteModalImage(index) {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item || !item.images) return;

    item.images.splice(index, 1);

    // SYNC: Keep main img updated after deletion
    item.img = item.images.length > 0 ? item.images[0] : '';

    saveAndRefresh();
    renderModalImages();
    showToast('Image removed.');
}

window.generateModalImageWithAI = async function () {
    if (!adminCapabilities.aiMediaToolsEnabled) {
        showToast("AI image generation is disabled.");
        return;
    }

    const item = menu.find(m => m.id == currentEditingId);
    const buttonEl = document.getElementById('modalGenerateImageBtn');
    if (!item || !buttonEl) return;
    if (!item.name || !item.name.trim()) {
        showToast('Item name is required before generating an image.');
        return;
    }

    const originalLabel = buttonEl.textContent;
    buttonEl.disabled = true;
    buttonEl.textContent = 'Generating...';
    setImageModalProgress(true, 'Generating dish image with AI...');
    setAdminTaskOverlay({
        badge: 'AI generation',
        title: 'Generating dish image',
        copy: 'The admin is creating a fresh image for this dish. Keep this page open until it finishes.',
        progress: 58,
        stage: 'Dish image generation',
        hint: 'The admin is locked while the image is being generated.'
    });

    try {
        const response = await fetch('/api/media/generate-menu-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: item.name || '',
                description: item.desc || '',
                categoryKey: item.cat || '',
                categoryName: typeof window.getLocalizedCategoryName === 'function'
                    ? window.getLocalizedCategoryName(item.cat, item.cat)
                    : (item.cat || ''),
                translations: item.translations || {}
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.url) {
            throw new Error(data.error || 'AI image generation failed.');
        }

        if (!item.images) item.images = item.img ? [item.img] : [];
        item.images = [data.url, ...item.images.filter((value) => value && value !== data.url)];
        item.img = item.images[0] || data.url;

        const saved = await saveAndRefresh();
        if (saved) {
            renderModalImages();
            showToast('AI image generated and added to the item.');
        }
    } catch (error) {
        console.error('Menu item AI image generation error:', error);
        const message = getLongTaskConflictMessage(error) || (error?.message === 'openai_not_configured'
            ? 'Set OPENAI_API_KEY before using AI image generation.'
            : /verify organization|verified to use the model/i.test(error?.message || '')
                ? 'Your OpenAI organization is not verified for the configured image model. Use OPENAI_ITEM_MEDIA_MODEL=dall-e-3 or wait for verification to propagate.'
            : error.message);
        showToast(`AI image generation failed: ${message}`);
    } finally {
        buttonEl.disabled = false;
        buttonEl.textContent = originalLabel;
        setImageModalProgress(false);
        setAdminTaskOverlay(null);
    }
}

window.generateCategoryImageWithAI = async function () {
    if (!adminCapabilities.aiMediaToolsEnabled) {
        showToast('AI image generation is disabled.');
        return;
    }

    const categoryName = document.getElementById('catName')?.value?.trim();
    const selectedSuperCategoryId = document.getElementById('catSuperCategory')?.value?.trim() || '';
    const selectedSuperCategory = (restaurantConfig.superCategories || []).find((sc) => sc.id === selectedSuperCategoryId);
    const imageInput = document.getElementById('catImage');
    if (!categoryName || !imageInput) {
        showToast('Category name is required before generating an image.');
        return;
    }

    setCategoryImageProgress(true, 'Generating category image with AI...');
    setAdminTaskOverlay({
        badge: 'AI generation',
        title: 'Generating category image',
        copy: 'The admin is creating a category visual to support the menu backdrop and category identity.',
        progress: 58,
        stage: 'Category image generation',
        hint: 'The admin is locked while the image is being generated.'
    });
    try {
        const response = await fetch('/api/media/generate-category-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                categoryName,
                superCategoryName: selectedSuperCategory?.name || '',
                translations: buildCategoryTranslations(categoryName),
                sampleItems: menu
                    .filter((item) => item.cat === categoryName)
                    .slice(0, 4)
                    .map((item) => getAdminItemDisplayName(item))
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.url) {
            throw new Error(data.error || 'AI category image generation failed.');
        }

        imageInput.value = data.url;
        updateCategoryImagePreview();
        showToast('AI image generated for the category.');
    } catch (error) {
        console.error('Category AI image generation error:', error);
        const message = getLongTaskConflictMessage(error) || (error?.message === 'openai_not_configured'
            ? 'Set OPENAI_API_KEY before using AI image generation.'
            : /verify organization|verified to use the model/i.test(error?.message || '')
                ? 'Your OpenAI organization is not verified for the configured image model. Use OPENAI_ITEM_MEDIA_MODEL=dall-e-3 or wait for verification to propagate.'
                : error.message);
        showToast(`AI image generation failed: ${message}`);
    } finally {
        setCategoryImageProgress(false);
        setAdminTaskOverlay(null);
    }
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HOURS MANAGEMENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const HOUR_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function initHoursForm() {
    const hours = Array.isArray(restaurantConfig._hours) && restaurantConfig._hours.length > 0
        ? restaurantConfig._hours
        : window.defaultHours;
    const note = typeof restaurantConfig._hoursNote === 'string'
        ? restaurantConfig._hoursNote
        : (window.defaultHoursNote || '');

    // Populate inputs
    HOUR_KEYS.forEach((key, i) => {
        const h = hours[i];
        const openEl = document.getElementById(`h_${key}_open`);
        const closeEl = document.getElementById(`h_${key}_close`);
        const hlEl = document.getElementById(`h_${key}_hl`);
        if (openEl) openEl.value = h.open || '11:00';
        if (closeEl) closeEl.value = h.close || '23:00';
        if (hlEl) hlEl.checked = h.highlight || false;
    });

    const noteEl = document.getElementById('hoursNote');
    if (noteEl) noteEl.value = note;

    HOUR_KEYS.forEach((key) => {
        const openEl = document.getElementById(`h_${key}_open`);
        const closeEl = document.getElementById(`h_${key}_close`);
        const hlEl = document.getElementById(`h_${key}_hl`);
        [openEl, closeEl, hlEl].forEach((input) => {
            if (!input) return;
            input.onchange = renderInfoWorkspaceSummary;
        });
    });
    if (noteEl) {
        noteEl.oninput = renderInfoWorkspaceSummary;
        noteEl.onchange = renderInfoWorkspaceSummary;
    }

    // Form submit
    const form = document.getElementById('hoursForm');
    if (form) {
        form.onsubmit = async function (e) {
            e.preventDefault();
            const saveButton = e.submitter || document.getElementById('infoHoursSaveBtn');
            setInfoSaveButtonState(saveButton, 'saving');
            const updatedHours = window.defaultHours.map((def, i) => {
                const key = HOUR_KEYS[i];
                const openEl = document.getElementById(`h_${key}_open`);
                const closeEl = document.getElementById(`h_${key}_close`);
                const hlEl = document.getElementById(`h_${key}_hl`);
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
            restaurantConfig._hours = updatedHours;
            restaurantConfig._hoursNote = updatedNote;
            const saved = await saveAndRefresh();
            if (saved) {
                renderInfoWorkspaceSummary();
                setInfoSaveButtonState(saveButton, 'saved');
                showToast('Hours updated.');
            } else {
                setInfoSaveButtonState(saveButton, 'idle');
            }
        };
    }

    renderInfoWorkspaceSummary();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• GALLERY MANAGEMENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function initGalleryForm() {
    const form = document.getElementById('galleryForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('galleryFileInput');
        const urlInput = document.getElementById('galleryUrlInput');
        if (!fileInput || !urlInput) return;

        if (!restaurantConfig.gallery) restaurantConfig.gallery = [];
        const previousGallery = Array.isArray(restaurantConfig.gallery) ? [...restaurantConfig.gallery] : [];
        const nextGallery = [...previousGallery];
        const saveButton = e.submitter || document.getElementById('brandingGallerySaveBtn');

        if (urlInput.value.trim() && !isValidAssetUrl(urlInput.value.trim())) {
            showToast('Gallery image must be an absolute URL or a local /uploads path.');
            return;
        }

        if (!urlInput.value.trim() && fileInput.files.length === 0) {
            showToast('Add an image URL or upload at least one image.');
            return;
        }

        // Handle URLs
        if (urlInput.value.trim()) {
            nextGallery.push(urlInput.value.trim());
            urlInput.value = '';
        }

        // Handle Files
        setGallerySaveButtonState('saving');
        if (fileInput.files.length > 0) {
            showToast('Uploading gallery images...');
            for (let file of fileInput.files) {
                try {
                    const url = await uploadImageToServer(file);
                    nextGallery.push(url);
                } catch (err) {
                    console.error('Gallery upload failed:', err);
                    showToast('Gallery upload failed.');
                    setGallerySaveButtonState('idle');
                    return;
                }
            }
            fileInput.value = '';
        }

        restaurantConfig.gallery = nextGallery;
        const saved = await saveAndRefresh();
        if (saved) {
            renderGalleryAdmin();
            setGallerySaveButtonState('saved');
            showToast('Gallery images added.');
        } else {
            restaurantConfig.gallery = previousGallery;
            renderGalleryAdmin();
            setGallerySaveButtonState('idle');
        }
    };
}

function renderGalleryAdmin() {
    const grid = document.getElementById('galleryAdminGrid');
    if (!grid) return;

    const images = restaurantConfig.gallery || [];

    grid.innerHTML = images.map((img, index) => `
            <div style="position:relative; aspect-ratio:1.5; border-radius:12px; overflow:hidden; border:1px solid #ddd; background:#eee;">
                <img src="${img}" width="960" height="640" loading="lazy" decoding="async" fetchpriority="low" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="deleteGalleryImage(${index})" style="position:absolute; top:8px; right:8px; background:rgba(255,0,0,0.8); color:#fff; border:none; border-radius:6px; cursor:pointer; padding:4px 8px; font-size:14px; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.2);">&times;</button>
                </div>
        `).join('') + (images.length === 0 ? '<p style="grid-column: 1/-1; color:#888; text-align:center; padding:40px; border:2px dashed #eee; border-radius:15px;">The gallery is empty.</p>' : '');
}

async function deleteGalleryImage(index) {
    const confirmed = await showAdminConfirm({
        kicker: 'Delete gallery image',
        title: 'Remove this gallery image?',
        copy: 'This image will disappear from the public gallery once the next save is published.',
        confirmLabel: 'Delete image',
        cancelLabel: 'Keep image',
        tone: 'danger'
    });
    if (!confirmed) return;
    const previousGallery = Array.isArray(restaurantConfig.gallery) ? [...restaurantConfig.gallery] : [];
    restaurantConfig.gallery.splice(index, 1);
    const saved = await saveAndRefresh();
    if (saved) {
        renderGalleryAdmin();
        showToast('Image removed.');
    } else {
        restaurantConfig.gallery = previousGallery;
        renderGalleryAdmin();
    }
}
