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
    updatedAt: null,
    savedAt: null,
    dataVersion: ''
};
let importStudioBusy = false;
let activeImporterJobId = '';
let activeImporterPollHandle = 0;
let deferredAdminInstallPrompt = null;
let adminSaveLoopPromise = null;
let adminSaveRequested = false;
let adminLoginInFlight = false;
let categoryImageDraftValue = '';
const ADMIN_APP_SECTION_KEY = 'restaurant_admin_last_section';
const ADMIN_IMPORTER_ACTIVE_JOB_KEY = 'restaurant_admin_importer_active_job';
const IMPORTER_JOB_POLL_MAX_FAILURES = 6;
const ADMIN_REQUEST_STATE = Object.freeze({
    idle: 'idle',
    saving: 'saving',
    success: 'success',
    error: 'error',
    sessionExpired: 'session-expired',
    importerBusy: 'importer-busy'
});
const ADMIN_REQUEST_FAILURE_CODES = new Set([
    'unauthorized',
    'importer_job_in_progress',
    'too_many_attempts',
    'network_error',
    'upload_failed',
    'refresh_after_save_failed'
]);
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
const BRAND_ASSET_FIELD_IDS = Object.freeze([
    'brandHeroImage',
    'brandHeroSlide2',
    'brandHeroSlide3',
    'brandLogoImage'
]);
let brandAssetDraftState = {};
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
    { icon: '\u{1F373}', terms: ['breakfast', 'morning', 'brunch', 'petit d\u00e9jeuner', 'petit-dejeuner', 'matin', '\u0641\u0637\u0648\u0631', '\u0625\u0641\u0637\u0627\u0631', '\u0635\u0628\u0627\u062d'] },
    { icon: '\u2615', terms: ['coffee', 'cafe', 'caf\u00e9', 'espresso', 'tea', 'th\u00e9', 'boisson chaude', '\u0642\u0647\u0648\u0629', '\u0634\u0627\u064a'] },
    { icon: '\u{1F950}', terms: ['bakery', 'viennoiserie', 'pastry', 'croissant', 'boulangerie', '\u0645\u0639\u062c\u0646\u0627\u062a'] },
    { icon: '\u{1F957}', terms: ['salad', 'healthy', 'fresh', 'veg', 'v\u00e9g', 'green', '\u0633\u0644\u0637\u0629', '\u0637\u0627\u0632\u062c'] },
    { icon: '\u{1F354}', terms: ['burger', 'sandwich', 'snack', 'tacos', 'wrap', '\u0628\u0631\u063a\u0631', '\u0633\u0627\u0646\u062f\u0648\u064a\u062a\u0634'] },
    { icon: '\u{1F355}', terms: ['pizza', 'pizzeria'] },
    { icon: '\u{1F35D}', terms: ['pasta', 'italian', 'italien', 'mac', 'spaghetti'] },
    { icon: '\u{1F372}', terms: ['meal', 'main', 'lunch', 'dinner', 'plat', 'plats', 'repas', 'tajine', '\u0637\u0627\u062c\u064a\u0646', '\u0648\u062c\u0628\u0627\u062a', '\u0631\u0626\u064a\u0633\u064a\u0629'] },
    { icon: '\u{1F969}', terms: ['grill', 'bbq', 'steak', 'meat', 'viande', 'grillade', '\u0645\u0634\u0627\u0648\u064a', '\u0644\u062d\u0645'] },
    { icon: '\u{1F370}', terms: ['dessert', 'sweet', 'cake', 'gateau', 'g\u00e2teau', 'patisserie', '\u062d\u0644\u0648\u064a\u0627\u062a', '\u062a\u062d\u0644\u064a\u0629'] },
    { icon: '\u{1F379}', terms: ['drink', 'drinks', 'juice', 'cocktail', 'beverage', 'boisson', 'boissons', '\u0639\u0635\u064a\u0631', '\u0645\u0634\u0631\u0648\u0628\u0627\u062a'] }
]);
let adminActionDialogResolver = null;
let superCategoryIconManuallyChosen = false;

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
    const infoState = report.canApplyInfo ? 'is-ready' : 'is-warn';
    const colorsState = report.canApplyBrandColors ? 'is-ready' : 'is-warn';

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
                    <strong>Menu + info</strong>
                    <span>Also replaces detected contact, hours, WiFi, payments, and facilities.</span>
                </div>
                <span class="importer-impact-state ${infoState}">${report.canApplyInfo ? `${report.infoSignalCount} found` : 'No info'}</span>
            </li>
            <li>
                <div>
                    <strong>Menu + colors</strong>
                    <span>Also applies palette colors sampled from menu images.</span>
                </div>
                <span class="importer-impact-state ${colorsState}">${report.canApplyBrandColors ? 'Palette ready' : 'No palette'}</span>
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
                    <span>Menu ${escapeHtml(confidence.menuExtraction || 'unknown')} / Info ${escapeHtml(confidence.infoExtraction || 'unknown')} / Translation ${escapeHtml(confidence.translations || 'unknown')} / Media ${escapeHtml(confidence.mediaMatching || 'unknown')}</span>
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
        { label: 'Info', value: confidence.infoExtraction || 'unknown' },
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
        error: t('admin.save_state.error_label', 'Attention'),
        'session-expired': t('admin.save_state.session_expired_label', 'Sign in'),
        'importer-busy': t('admin.save_state.importer_busy_label', 'Busy')
    };
    const stateType = adminSaveState.type || 'idle';
    badge.classList.remove('is-idle', 'is-saving', 'is-success', 'is-error', 'is-session-expired', 'is-importer-busy');
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
    { key: 'hero_desc1', label: 'Hero Slide 1 - Description', type: 'textarea', hint: 'Short supporting sentence for the first slide.' },
    { key: 'hero_sub2', label: 'Hero Slide 2 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title2', label: 'Hero Slide 2 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_desc2', label: 'Hero Slide 2 - Description', type: 'textarea', hint: 'Short supporting sentence for the second slide.' },
    { key: 'hero_sub3', label: 'Hero Slide 3 - Eyebrow', type: 'text', hint: 'Short introduction line above the main title.' },
    { key: 'hero_title3', label: 'Hero Slide 3 - Title', type: 'text', hint: 'Main highlighted title. You can keep <span>...</span> for the accent word.' },
    { key: 'hero_desc3', label: 'Hero Slide 3 - Description', type: 'textarea', hint: 'Short supporting sentence for the third slide.' },
    { key: 'hero_cta', label: 'Hero - CTA Label', type: 'text', hint: 'Primary call-to-action label used on the hero slides.' },
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
    { key: 'events_cta_btn', label: 'Events - CTA Button', type: 'text', hint: 'Button label shown under the events section.' },
    { key: 'footer_note', label: 'Footer - Note', type: 'textarea', hint: 'Small footer sentence that reinforces the restaurant identity.' },
    { key: 'footer_rights', label: 'Footer - Rights Text', type: 'text', hint: 'Short legal/footer rights sentence shown after the year and restaurant name.' }
];
const NOUR_HOMEPAGE_COPY_DEFAULTS = {
    fr: {
        hero_sub1: 'Au coeur de Tanger',
        hero_title1: 'SAVEURS <span>GENEREUSES</span>',
        hero_desc1: 'Pizzas généreuses, cuisine conviviale et accueil chaleureux au cœur de Tanger.',
        hero_sub2: 'Decouvrez les',
        hero_title2: 'INCONTOURNABLES <span>NOUR</span>',
        hero_desc2: 'Pizzas, plats chauds et assiettes gourmandes preparees pour les vraies faims.',
        hero_sub3: 'Sur place ou a emporter',
        hero_title3: 'CHAUD <span>ET RAPIDE</span>',
        hero_desc3: 'Une table conviviale pour dejeuner, diner ou partager un moment simple.',
        hero_cta: 'VOIR LA CARTE',
        about_p1: "Pizzeria Nour est une adresse chaleureuse a Tanger ou l'on vient pour bien manger, retrouver des saveurs familieres et profiter d'un accueil sincere.",
        about_p2: 'Notre cuisine mise sur des recettes genereuses, des produits choisis avec soin et une preparation reguliere, pour servir des pizzas et des plats qui donnent envie de revenir.',
        about_p3: "Que ce soit pour un repas en famille, une pause entre amis ou une commande a emporter, notre promesse reste la meme : du gout, de la constance et une belle generosite dans l'assiette.",
        event_birthday: 'Anniversaires',
        event_birthday_desc: 'Une table vivante et gourmande pour celebrer un anniversaire autour de pizzas, plats a partager et boissons pour tous.',
        event_family: 'Repas en Famille',
        event_family_desc: "Un cadre detendu pour reunir petits et grands autour d'une cuisine genereuse et facile a partager.",
        event_corporate: "Repas d'Equipe",
        event_corporate_desc: "Une solution simple et savoureuse pour les dejeuners de travail, commandes de groupe et moments d'equipe.",
        event_party: 'Soirees Privees',
        event_party_desc: 'Un lieu convivial pour organiser une soiree entre amis ou une petite celebration dans une ambiance chaleureuse.',
        events_cta_text: 'Vous preparez un anniversaire, un repas de groupe ou un moment prive ? Parlons-en.',
        events_cta_btn: 'Demander un devis',
        footer_note: 'Pizzas genereuses, cuisine conviviale et accueil chaleureux au coeur de Tanger.',
        footer_rights: 'Tous droits reserves.'
    },
    en: {
        hero_sub1: 'In the heart of Tangier',
        hero_title1: 'GENEROUS <span>FLAVORS</span>',
        hero_desc1: 'Generous pizza, welcoming service, and comforting food in the heart of Tangier.',
        hero_sub2: "Discover Nour's",
        hero_title2: 'SIGNATURE <span>FAVORITES</span>',
        hero_desc2: 'Pizza, hot dishes, and comforting plates made for real appetites.',
        hero_sub3: 'Dine in or takeaway',
        hero_title3: 'HOT <span>& READY</span>',
        hero_desc3: 'A welcoming table for lunch, dinner, or an easy moment to share.',
        hero_cta: 'VIEW MENU',
        about_p1: 'Pizzeria Nour is a warm address in Tangier where people come to eat well, enjoy familiar flavors, and feel genuinely welcomed.',
        about_p2: 'Our kitchen focuses on generous recipes, carefully selected ingredients, and consistent preparation so every pizza and dish feels satisfying and reliable.',
        about_p3: 'Whether you join us with family, meet friends, or order takeaway, our promise stays the same: real flavor, steady quality, and generous plates.',
        event_birthday: 'Birthdays',
        event_birthday_desc: 'A lively, food-filled setup for birthdays with pizza, shareable dishes, and a warm atmosphere for every guest.',
        event_family: 'Family Meals',
        event_family_desc: 'A relaxed place to gather around comforting food that works beautifully for both kids and adults.',
        event_corporate: 'Team Meals',
        event_corporate_desc: 'A simple and tasty option for work lunches, group orders, and casual team gatherings.',
        event_party: 'Private Nights',
        event_party_desc: 'A friendly spot for a private evening, informal celebration, or relaxed get-together with friends.',
        events_cta_text: "Planning a birthday, group meal, or private moment? Let's talk.",
        events_cta_btn: 'Request a Quote',
        footer_note: 'Generous pizza, welcoming service, and comforting food in the heart of Tangier.',
        footer_rights: 'All rights reserved.'
    },
    ar: {
        hero_sub1: 'في قلب طنجة',
        hero_title1: 'نكهات <span>سخية</span>',
        hero_desc1: 'بيتزا سخية وخدمة دافئة وأطباق مريحة في قلب طنجة.',
        hero_sub2: 'اكتشفوا',
        hero_title2: 'مفضلات <span>نور</span>',
        hero_desc2: 'بيتزا وأطباق ساخنة ووصفات مريحة تناسب الشهية الحقيقية.',
        hero_sub3: 'داخل المطعم أو سفري',
        hero_title3: 'ساخن <span>وجاهز</span>',
        hero_desc3: 'مكان دافئ للغداء أو العشاء أو لقضاء لحظة جميلة مع من تحب.',
        hero_cta: 'عرض القائمة',
        about_p1: 'بيتزا نور عنوان دافئ في طنجة، يأتي إليه الناس ليستمتعوا بالأكل الجيد والنكهات المحبوبة والاستقبال الصادق.',
        about_p2: 'نركز في مطبخنا على وصفات سخية ومكونات مختارة بعناية وتحضير ثابت، حتى تكون كل بيتزا وكل طبق مشبعاً وموثوقاً.',
        about_p3: 'سواء أتيت مع العائلة أو الأصدقاء أو طلبت سفري، يبقى وعدنا واحداً: طعم حقيقي وجودة ثابتة وكرم واضح في كل طبق.',
        event_birthday: 'أعياد الميلاد',
        event_birthday_desc: 'أجواء حيوية ولذيذة للاحتفال بعيد الميلاد مع البيتزا والأطباق المشتركة واستقبال دافئ للجميع.',
        event_family: 'وجبات عائلية',
        event_family_desc: 'مكان مريح يجمع الصغار والكبار حول أطباق مشبعة وسهلة المشاركة.',
        event_corporate: 'وجبات الفرق',
        event_corporate_desc: 'خيار عملي ولذيذ لغداء العمل والطلبات الجماعية ولقاءات الفريق.',
        event_party: 'أمسيات خاصة',
        event_party_desc: 'مكان ودود لأمسية خاصة أو احتفال بسيط أو لقاء جميل بين الأصدقاء.',
        events_cta_text: 'هل تخطط لعيد ميلاد أو وجبة جماعية أو مناسبة خاصة؟ تواصل معنا.',
        events_cta_btn: 'اطلب عرض سعر',
        footer_note: 'بيتزا سخية وخدمة دافئة وأطباق مريحة في قلب طنجة.',
        footer_rights: 'جميع الحقوق محفوظة.'
    }
};
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
const INFO_WORKSPACE_PANELS = ['public', 'social', 'facilities', 'hours', 'wifi', 'security'];
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
let currentInfoWorkspacePanel = 'public';
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
        if (!/[\u00C3\u00D8\u00D9\u00F0\u00E2]/.test(result)) break;
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
                hero_sub1: "عنوان من أجل",
                hero_title1: "الجوع <span>المشبَع</span>",
                hero_sub2: "اكتشف",
                hero_title2: "مفضلات <span>{{shortName}}</span>",
                hero_desc2: "وصفات سخية وخدمة سريعة وتجربة تشجع على العودة.",
                hero_sub3: "داخل المطعم أو للطلب",
                hero_title3: "ساخن <span>وسريع</span>",
                hero_desc3: "تجربة بسيطة ومشبعة تناسب اليوم كله.",
                about_p1: "{{restaurantName}} يقدم أكلات مريحة وسهلة التوصية بها من أول زيارة.",
                about_p2: "نركز على وصفات واضحة وحصص سخية وخدمة منتظمة تناسب الزيارات اليومية.",
                about_p3: "هدفنا واضح: أن نصبح عنواناً موثوقاً لمن يريد أكلاً سريعاً ولذيذاً ومشبعاً.",
                event_birthday: "أعياد الميلاد",
                event_birthday_desc: "صيغة بسيطة وممتعة للمجموعات الصغيرة.",
                event_family: "لقاءات الأصدقاء والعائلة",
                event_family_desc: "أطباق للمشاركة في أجواء مريحة.",
                event_corporate: "طلبات المجموعات",
                event_corporate_desc: "حل سريع للفرق والطلبات الكبيرة.",
                event_party: "أمسيات خاصة",
                event_party_desc: "مكان مريح للاحتفالات غير الرسمية.",
                events_cta_text: "هل تحتاج إلى صيغة جماعية أو حجز خفيف؟ تواصل معنا.",
                footer_note: "أكل سخي وخدمة سريعة وعنوان يستحق الزيارة من جديد."
            }
        }
    },
    cafe: {
        branding: {
            logoMark: "☕",
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
                hero_sub1: "مكان من أجل",
                hero_title1: "القهوة <span>والبرنش</span>",
                hero_sub2: "استمتع بـ",
                hero_title2: "لحظات <span>{{shortName}}</span>",
                hero_desc2: "عنوان دافئ للقهوة والحلويات واللقاءات اليومية.",
                hero_sub3: "من الصباح إلى العصر",
                hero_title3: "هادئ <span>ومتقن</span>",
                hero_desc3: "وصفات منزلية وأجواء تمنحك وقتاً أجمل.",
                about_p1: "{{restaurantName}} صمم كعنوان مريح للقهوة والبرنش والاستراحات اليومية.",
                about_p2: "نقدم قائمة بسيطة وأنيقة تناسب المواعيد واللقاءات واللحظات الهادئة.",
                about_p3: "وعدنا هو تجربة لطيفة وثابتة من أول فنجان قهوة إلى آخر حلوى.",
                event_birthday: "برنشات خاصة",
                event_birthday_desc: "صيغة ودية للاحتفالات الصباحية والمناسبات الصغيرة.",
                event_family: "لقاءات عائلية",
                event_family_desc: "مكان هادئ ودافئ للاجتماع حول طاولة جميلة.",
                event_corporate: "لقاءات عمل مع القهوة",
                event_corporate_desc: "جو مريح للاجتماعات المهنية واستراحات الفرق.",
                event_party: "شاي العصر والاحتفالات",
                event_party_desc: "أجواء لطيفة للحظات المشتركة.",
                events_cta_text: "هل تخطط لبرنش أو لقاء أو مناسبة خاصة؟ تواصل معنا.",
                footer_note: "قهوة وبرنش وحلويات منزلية في أجواء دافئة."
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
                hero_sub1: "بيت لـ",
                hero_title1: "النكهات <span>التقليدية</span>",
                hero_sub2: "اكتشف من جديد",
                hero_title2: "وصفات <span>{{shortName}}</span>",
                hero_desc2: "أطباق صادقة وطاولة عائلية واستقبال كريم.",
                hero_sub3: "للوجبات المشتركة",
                hero_title3: "أصيل <span>ودافئ</span>",
                hero_desc3: "مطبخ تقليدي يناسب الأيام العادية والمناسبات الخاصة.",
                about_p1: "{{restaurantName}} يحتفي بالمطبخ التقليدي والوصفات المتوارثة والوجبات التي تجمع الناس.",
                about_p2: "نركز على الكرم والنكهات المألوفة وأجواء عائلية تجعل الضيوف يشعرون بالراحة.",
                about_p3: "هدفنا أن نقدم عنواناً موثوقاً للوجبات اليومية وللمناسبات المهمة أيضاً.",
                event_birthday: "وجبات عائلية",
                event_birthday_desc: "طاولة مرحبة للاحتفال بالمناسبات مع الأحباب.",
                event_family: "لقاءات ولمّات",
                event_family_desc: "مكان مناسب للوجبات السخية والأحاديث الطويلة.",
                event_corporate: "وجبات الفرق",
                event_corporate_desc: "صيغة دافئة لاستقبال الزملاء والشركاء.",
                event_party: "احتفالات تقليدية",
                event_party_desc: "مطبخ قائم على المشاركة للمناسبات الخاصة.",
                events_cta_text: "هل تخطط لوجبة جماعية أو احتفال؟ تواصل معنا.",
                footer_note: "وصفات تقليدية وطاولة عائلية وضيافة كريمة."
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

function setSuperCategoryTranslationFields(input, fallbackName = '') {
    const translations = normalizeEntityTranslations(input);
    ['fr', 'en', 'ar'].forEach((lang) => {
        const nameInput = document.getElementById(`scName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        if (nameInput) nameInput.value = translations[lang].name || (lang === 'fr' ? fallbackName : '');
    });
}

function resetCategoryFormState() {
    const form = document.getElementById('catForm');
    if (form) form.reset();
    setMenuCrudValidationState('catForm', {});
    setMenuTranslationWarnings('category');
    setCategoryImageDraftValue('');
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

function setCategoryImageDraftValue(value = '') {
    categoryImageDraftValue = normalizeCategoryImagePath(value);
}

function getCategoryImageDraftValue() {
    return normalizeCategoryImagePath(categoryImageDraftValue);
}

function updateCategoryImagePreview() {
    const previewShell = document.getElementById('catImagePreview');
    const previewImg = document.getElementById('catImagePreviewImg');
    const previewFallback = document.getElementById('catImagePreviewFallback');
    if (!previewShell || !previewImg || !previewFallback) return;

    const nextImage = getCategoryImageDraftValue();
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
    const uploadInput = document.getElementById('catImageUpload');

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
    setSuperCategoryIcon(suggestSuperCategoryIcon(name, ''), false);
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

    ['scName'].forEach((id) => {
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

function buildSuperCategoryTranslations(name) {
    const next = normalizeEntityTranslations();
    ['fr', 'en', 'ar'].forEach((lang) => {
        const nameInput = document.getElementById(`scName${lang.charAt(0).toUpperCase()}${lang.slice(1)}`);
        next[lang].name = nameInput ? nameInput.value.trim() : '';
        next[lang].desc = '';
    });
    if (!next.fr.name && name) next.fr.name = name;
    return next;
}

function sanitizeSuperCategoryForStorage(entry = {}) {
    const group = entry && typeof entry === 'object' ? entry : {};
    const translations = normalizeEntityTranslations(group.translations);
    return {
        ...group,
        name: typeof group.name === 'string' ? group.name.trim() : '',
        emoji: normalizeSuperCategoryIconValue(group.emoji || ''),
        time: typeof group.time === 'string' ? group.time.trim() : '',
        cats: Array.isArray(group.cats) ? [...new Set(group.cats.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))] : [],
        translations: {
            fr: { name: translations.fr.name || '', desc: '' },
            en: { name: translations.en.name || '', desc: '' },
            ar: { name: translations.ar.name || '', desc: '' }
        }
    };
}

function getAdminSuperCategorySummary(entry) {
    const categories = Array.isArray(entry?.cats) ? entry.cats : [];
    return formatMenuBuilderCategoryPreview(categories, 3);
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
        translations = buildSuperCategoryTranslations(name);
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
            filledCount === 3 ? 'Labels ready' : filledCount > 0 ? `${filledCount}/3 labels ready` : 'Labels optional'
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
        const files = document.getElementById('itemFile')?.files?.length || 0;
        if (editingItemId) {
            const existing = Array.isArray(window._editingImages) ? window._editingImages.filter(Boolean).length : 0;
            return existing + files;
        }
        return files;
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
            const hasImages = Boolean(document.getElementById('itemFile')?.files?.length)
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
        const hasImage = Boolean(getCategoryImageDraftValue())
            || Boolean(document.getElementById('catImageUpload')?.files?.length);
            return hasImage ? 'ready' : 'optional';
        }
        if (sectionId === 'labels') {
            return getFilledTranslationCount(buildCategoryTranslations(name)) === 3 ? 'ready' : 'missing';
        }
    }

    if (formId === 'superCatForm') {
        const name = document.getElementById('scName')?.value?.trim() || '';
        if (sectionId === 'identity') return name ? 'ready' : 'missing';
        if (sectionId === 'labels') {
            return getFilledTranslationCount(buildSuperCategoryTranslations(name)) === 3 ? 'ready' : 'optional';
        }
        if (sectionId === 'structure') {
            return Array.from(document.querySelectorAll('.sc-cat-check:checked')).length > 0 ? 'ready' : 'optional';
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
        if (sectionId === 'identity') {
            if (!name) return { message: 'Add the group name in Identity.', fieldId: 'scName' };
        }
        if (sectionId === 'labels') {
            return { message: 'Generate or enter the missing labels in Labels.', fieldId: 'superTranslationGenerateBtn' };
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
        const hasImage = Boolean(getCategoryImageDraftValue())
            || Boolean(document.getElementById('catImageUpload')?.files?.length);
        setMenuCrudMetaText('catFormMetaState', document.getElementById('catEditingKey')?.value ? 'Editing category' : 'Category draft');
        setMenuCrudMetaText('catFormMetaVisual', hasImage ? 'Image ready' : 'Image optional');
    } else if (form.id === 'superCatForm') {
        refreshTranslationSummary('supercategory');
        const selectedCount = Array.from(document.querySelectorAll('.sc-cat-check:checked')).length;
        setMenuCrudMetaText('superCatFormMetaState', selectedCount > 0 ? `${selectedCount} categories linked` : 'No categories linked yet');
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
        form.querySelectorAll('.translation-summary-card.has-error').forEach((card) => card.classList.remove('has-error'));
        form.querySelectorAll('[data-menu-inline-error="true"]').forEach((node) => node.remove());
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
            const group = field.closest('.form-group, .translation-summary-card');
            group?.classList.add('has-error');
            if (group) {
                const errorNode = document.createElement('div');
                errorNode.className = 'form-group-error';
                errorNode.dataset.menuInlineError = 'true';
                errorNode.textContent = state.message;
                group.appendChild(errorNode);
            }
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

function surfaceMenuCrudSaveFailure(formId, fallbackMessage = '') {
    const message = String(adminSaveState.message || fallbackMessage || 'The save could not be completed.').trim();
    setMenuCrudPrimaryButtonState(formId, 'idle');
    setMenuCrudValidationState(formId, { message });
    const note = document.getElementById(`${formId}ValidationNote`);
    note?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            fallbackDesc: '',
            existingTranslations: buildSuperCategoryTranslations(fallbackName),
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
        if (!response.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }
        if (!data.ok || !data.translations) {
            throw createAdminRequestError(data.error || 'AI translation generation failed.', data.error || 'ai_translation_generation_failed');
        }

        if (entityType === 'item') {
            setMenuItemTranslationFields(data.translations);
        } else if (entityType === 'category') {
            setCategoryTranslationFieldsFromTranslations(data.translations, document.getElementById('catName')?.value?.trim() || '');
        } else {
            setSuperCategoryTranslationFields(data.translations, document.getElementById('scName')?.value?.trim() || '');
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
        reflectAdminRequestFailure(error);
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
function createAdminRequestError(message, code = '', extras = {}) {
    const error = new Error(String(message || 'Request failed.'));
    error.code = code || '';
    Object.assign(error, extras || {});
    return error;
}

function buildAdminRequestErrorFromResponse(response, payload = {}) {
    const status = Number(response?.status) || 0;
    const code = payload?.error || '';
    const retryAfterSec = Number(payload?.retryAfterSec) || 0;
    let message = payload?.message || payload?.error || '';

    if (status === 401) {
        message = t('admin.save_state.session_expired', 'Session expired. Please sign in again.');
    } else if (status === 409 && code === 'importer_job_in_progress') {
        message = getLongTaskConflictMessage({ code }) || 'Finish the current import before saving again.';
    } else if (status === 428 || code === 'confirmation_required') {
        message = 'Please confirm this action before applying it.';
    } else if (status === 429 || code === 'too_many_attempts') {
        message = retryAfterSec > 0
            ? `Too many attempts. Wait ${retryAfterSec}s and try again.`
            : 'Too many attempts. Please wait and try again.';
    } else if (!message) {
        message = `Request failed (${status || 'network'}).`;
    }

    return createAdminRequestError(message, code, {
        status,
        retryAfterSec,
        jobId: payload?.jobId || '',
        stage: payload?.stage || ''
    });
}

function getUploadFailureMessage(code, status) {
    const messages = {
        unsupported_file_type: 'Use a JPG, PNG, WebP, GIF, or PDF file. SVG uploads are not accepted for safety.',
        file_signature_mismatch: 'This file does not match its extension. Export it again as JPG, PNG, WebP, GIF, or PDF.',
        missing_uploaded_file: 'The upload could not be read. Please choose the file again.',
        image_optimization_failed: 'This image could not be optimized. Export it again as JPG, PNG, or WebP and retry.',
        file_too_large: 'This file is too large. Use a file under 10 MB.'
    };
    return messages[code] || `Upload failed: ${status || code || 'unknown error'}`;
}

function cloneAdminDraft(value) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return JSON.parse(JSON.stringify(value));
}

function getAdminRequestFailureState(error) {
    if (error?.status === 401 || error?.code === 'unauthorized') {
        return {
            type: ADMIN_REQUEST_STATE.sessionExpired,
            message: t('admin.save_state.session_expired', 'Session expired. Please sign in again.')
        };
    }

    if (error?.status === 409 || error?.code === 'importer_job_in_progress') {
        return {
            type: ADMIN_REQUEST_STATE.importerBusy,
            message: getLongTaskConflictMessage(error) || 'Finish the current import before saving again.'
        };
    }

    if (error?.status === 429 || error?.code === 'too_many_attempts') {
        return {
            type: ADMIN_REQUEST_STATE.error,
            message: error?.retryAfterSec > 0
                ? `Too many attempts. Wait ${error.retryAfterSec}s and try again.`
                : 'Too many attempts. Please wait and try again.'
        };
    }

    if (error?.code === 'upload_failed') {
        return {
            type: ADMIN_REQUEST_STATE.error,
            message: error?.message || 'The upload failed. Please retry.'
        };
    }

    if (error?.code === 'refresh_after_save_failed') {
        return {
            type: ADMIN_REQUEST_STATE.error,
            message: error?.message || 'Saved on the server, but the admin could not refresh the latest data.'
        };
    }

    if (error?.name === 'TypeError' || error?.code === 'network_error') {
        return {
            type: ADMIN_REQUEST_STATE.error,
            message: 'Network error. Check the connection and try again.'
        };
    }

    return {
        type: ADMIN_REQUEST_STATE.error,
        message: error?.message || t('admin.save_state.error_message', 'Save failed.')
    };
}

function reflectAdminRequestFailure(error) {
    if (!error) return;
    if (!error.status && !ADMIN_REQUEST_FAILURE_CODES.has(error.code)) return;
    const failure = getAdminRequestFailureState(error);
    setAdminSaveState(failure.type, failure.message);
}

function applyAdminServerData(data) {
    const payload = data && typeof data === 'object' ? data : {};

    menu = Array.isArray(payload.menu) ? payload.menu : [];
    catEmojis = payload.catEmojis && typeof payload.catEmojis === 'object'
        ? payload.catEmojis
        : {};
    categoryImages = payload.categoryImages && typeof payload.categoryImages === 'object'
        ? payload.categoryImages
        : (window.defaultCategoryImages || {});
    window.categoryImages = categoryImages;
    categoryTranslations = payload.categoryTranslations && typeof payload.categoryTranslations === 'object'
        ? payload.categoryTranslations
        : (window.defaultCategoryTranslations || {});

    if (typeof window.mergeRestaurantConfig === 'function') {
        window.mergeRestaurantConfig({
            superCategories: Array.isArray(payload.superCategories) ? payload.superCategories : [],
            wifi: payload.wifi ? { name: payload.wifi.ssid || '', code: payload.wifi.pass || '' } : (restaurantConfig.wifi || {}),
            socials: payload.social && typeof payload.social === 'object' ? payload.social : {},
            guestExperience: payload.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] },
            sectionVisibility: payload.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
            sectionOrder: payload.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
            categoryTranslations: payload.categoryTranslations || {},
            location: payload.landing?.location || { address: '', url: '' },
            phone: payload.landing?.phone || '',
            _hours: Array.isArray(payload.hours) ? payload.hours : null,
            _hoursNote: typeof payload.hoursNote === 'string' ? payload.hoursNote : '',
            gallery: Array.isArray(payload.gallery) ? payload.gallery : [],
            branding: payload.branding || window.defaultBranding || {},
            contentTranslations: payload.contentTranslations || { fr: {}, en: {}, ar: {} }
        });
        restaurantConfig = window.restaurantConfig;
        categoryTranslations = restaurantConfig.categoryTranslations || categoryTranslations;
    }

    if (payload.promoId !== undefined) {
        promoIds = payload.promoId ? [payload.promoId] : [];
    }
    if (Array.isArray(payload.promoIds)) {
        promoIds = payload.promoIds;
    }
    window.promoIds = promoIds;
}

async function fetchAdminDataSnapshot() {
    let response;
    try {
        response = await fetch('/api/data', {
            credentials: 'include',
            cache: 'no-store',
            headers: { Accept: 'application/json' }
        });
    } catch (error) {
        throw createAdminRequestError('Network error. Check the connection and try again.', 'network_error', { cause: error });
    }

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw buildAdminRequestErrorFromResponse(response, payload);
    }

    let data;
    try {
        data = await response.json();
    } catch (error) {
        throw createAdminRequestError('The server returned unreadable admin data.', 'invalid_admin_json', { cause: error });
    }

    return {
        data,
        dataVersion: response.headers.get('x-data-version') || ''
    };
}

async function loadDataFromServer({ silent = false } = {}) {
    try {
        const snapshot = await fetchAdminDataSnapshot();
        applyAdminServerData(snapshot.data);
        if (snapshot.dataVersion) {
            setAdminSaveState(
                adminSaveState.type || ADMIN_REQUEST_STATE.idle,
                adminSaveState.message || t('admin.save_state.idle_message', 'No server save yet in this session.'),
                {
                    savedAt: adminSaveState.savedAt,
                    dataVersion: snapshot.dataVersion
                }
            );
        }
        return true;
    } catch (error) {
        console.error('[ADMIN] Failed to load data from server:', error);
        if (!silent) {
            const failure = getAdminRequestFailureState(error);
            setAdminSaveState(failure.type, failure.message);
            showToast(failure.message);
        }
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
            showDashboard();
        }
    } catch (e) {
        console.error('[ADMIN] Session check error:', e);
    }
}

function renderAdminSaveState() {
    const el = document.getElementById('adminSaveStatus');
    const floatSaveBtn = document.getElementById('floatSaveBtn');
    if (floatSaveBtn) {
        const isBusy = adminSaveState.type === ADMIN_REQUEST_STATE.saving;
        floatSaveBtn.disabled = isBusy;
        floatSaveBtn.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    }
    if (!el) {
        syncAdminMobileSaveBadge();
        return;
    }

    const palette = {
        idle: { bg: '#f5f5f5', color: '#555', dot: '#999', label: t('admin.save_state.idle_label', 'Ready') },
        saving: { bg: '#fff6db', color: '#8a5a00', dot: '#f59e0b', label: t('admin.save_state.saving_label', 'Saving') },
        success: { bg: '#e9f9ef', color: '#166534', dot: '#10b981', label: t('admin.save_state.success_label', 'Saved') },
        error: { bg: '#fdeaea', color: '#991b1b', dot: '#ef4444', label: t('admin.save_state.error_label', 'Attention') },
        'session-expired': { bg: '#fdeaea', color: '#991b1b', dot: '#ef4444', label: t('admin.save_state.session_expired_label', 'Sign in') },
        'importer-busy': { bg: '#fff6db', color: '#8a5a00', dot: '#f59e0b', label: t('admin.save_state.importer_busy_label', 'Busy') }
    };
    const style = palette[adminSaveState.type] || palette.idle;
    const message = adminSaveState.message || t('admin.save_state.idle_message', 'No server save yet in this session.');
    const timeValue = adminSaveState.savedAt || adminSaveState.updatedAt;
    const timeText = timeValue
        ? new Date(timeValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
    const metaParts = [];
    if (timeText) metaParts.push(`Updated ${timeText}`);
    if (adminSaveState.dataVersion) metaParts.push(`v${String(adminSaveState.dataVersion).slice(0, 8)}`);
    const safeLabel = escapeHtml(style.label);
    const safeMessage = escapeHtml(message);
    const safeMeta = metaParts.map((part) => escapeHtml(part)).join(' · ');

    el.style.background = style.bg;
    el.style.color = style.color;
    el.innerHTML = `
        <span class="admin-save-status-dot" style="background:${style.dot};"></span>
        <span class="admin-save-status-copy">
            <strong>${safeLabel}</strong>
            <span>${safeMessage}</span>
            ${safeMeta ? `<small>${safeMeta}</small>` : ''}
        </span>
    `;
    syncAdminMobileSaveBadge();
}

function setAdminSaveState(type, message, meta = {}) {
    adminSaveState = {
        type,
        message,
        updatedAt: new Date().toISOString(),
        savedAt: meta.savedAt !== undefined ? meta.savedAt : adminSaveState.savedAt,
        dataVersion: meta.dataVersion !== undefined ? meta.dataVersion : adminSaveState.dataVersion
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
    if (sectionId === 'data-tools') return 'data-tools';
    // Keep the admin navigation production-safe: legacy/internal sections should never be activated.
    return 'menu';
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
        'data-tools': 'Data'
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
    // The Info workspace has its own headers/structure; skip legacy section headings/copy.
    moveSectionContentToHost('hours', 'infoHoursMount', ['h3', 'p']);
    moveSectionContentToHost('wifi', 'infoWifiMount', ['h3', 'p']);
    moveSectionContentToHost('security', 'infoSecurityMount', ['h3', 'p']);
    moveNodeToHost('landingLayoutBlock', 'brandingHomepageLayoutMount');
    moveNodeToHost('landingCopyBlock', 'brandingHomepageCopyMount');
    moveSectionChildren('gallery', 'brandingGalleryMount');
    mountMenuCrudForms();
    initInfoWorkspaceNavigation();
    initAdminLanguageRefresh();
    syncInfoWorkspacePanels();
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

function syncInfoWorkspacePanels() {
    INFO_WORKSPACE_PANELS.forEach((panelKey) => {
        const button = document.getElementById(`infoPanelBtn-${panelKey}`);
        const panel = document.querySelector(`[data-info-panel="${panelKey}"]`);
        const isActive = panelKey === currentInfoWorkspacePanel;

        if (button) {
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.tabIndex = isActive ? 0 : -1;
        }

        if (panel) {
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
            if (panel.tagName === 'DETAILS') {
                panel.open = isActive;
            }
        }
    });
}

function initInfoWorkspaceNavigation() {
    const nav = document.querySelector('.info-quick-actions');
    if (!nav || nav.dataset.navigationReady === 'true') return;

    nav.addEventListener('keydown', (event) => {
        const currentIndex = INFO_WORKSPACE_PANELS.indexOf(currentInfoWorkspacePanel);
        if (currentIndex < 0) return;

        let nextIndex = currentIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % INFO_WORKSPACE_PANELS.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + INFO_WORKSPACE_PANELS.length) % INFO_WORKSPACE_PANELS.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = INFO_WORKSPACE_PANELS.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        const nextPanel = INFO_WORKSPACE_PANELS[nextIndex];
        window.focusInfoWorkspacePanel(nextPanel);
        document.getElementById(`infoPanelBtn-${nextPanel}`)?.focus({ preventScroll: true });
    });

    nav.dataset.navigationReady = 'true';
}

function initAdminLanguageRefresh() {
    if (window.__adminLanguageRefreshReady) return;
    window.addEventListener('app:languagechange', () => {
        document.querySelectorAll('.info-save-btn[data-original-label]').forEach((button) => {
            delete button.dataset.originalLabel;
        });
        renderInfoWorkspaceSummary();
    });
    window.__adminLanguageRefreshReady = true;
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
            const categoryNames = getAdminSuperCategorySummary(entry);
            const dishesCount = getMenuBuilderItemsForCategories(entry.cats || []).length;
            return `
                <tr onclick='openMenuBuilderRow(${inlineId})'>
                    <td data-label="Super Category">
                        <div class="menu-builder-entry">
                            <span class="menu-builder-entry-emoji">${escapeHtml(entry.emoji || ADMIN_ICON.bullet)}</span>
                            <div class="menu-builder-entry-copy">
                                <strong>${escapeHtml(entry.name || 'Super Category')}</strong>
                                ${categoryNames ? `<div class="menu-builder-row-copy">${escapeHtml(categoryNames)}</div>` : ''}
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
                            <button type="button" class="action-btn" title="Edit category image" aria-label="Edit category image" onclick='event.stopPropagation(); openMenuBuilderEdit("category", ${inlineKey}, "visual")'>${ADMIN_ICON.image}</button>
                            <button type="button" class="action-btn" title="Edit category" aria-label="Edit category" onclick='event.stopPropagation(); openMenuBuilderEdit("category", ${inlineKey}, "labels")'>${ADMIN_ICON.edit}</button>
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

window.openMenuBuilderEdit = function (type, id, sectionId = null) {
    if (type === 'supercategory') {
        editSuperCat(id);
        return;
    }
    if (type === 'category') {
        editCat(id, sectionId);
        return;
    }
    editItem(id);
};

function applyAdminCapabilities() {
    const sellerToolsNavBtn = document.getElementById('sellerToolsNavBtn');
    const dataToolsSection = document.getElementById('data-tools');
    const importStudioCard = document.getElementById('importStudioCard');
    const modalAiImageTools = document.getElementById('modalAiImageTools');
    const translationButtons = [
        document.getElementById('itemTranslationGenerateBtn'),
        document.getElementById('catTranslationGenerateBtn'),
        document.getElementById('superTranslationGenerateBtn'),
        document.getElementById('catGenerateImageBtn')
    ].filter(Boolean);

    if (!adminCapabilities.sellerToolsEnabled) {
        if (importStudioCard) importStudioCard.style.display = 'none';
        if (sellerToolsNavBtn) sellerToolsNavBtn.innerHTML = '<i class="bi bi-download" aria-hidden="true"></i> Data';
    } else {
        if (sellerToolsNavBtn) sellerToolsNavBtn.style.display = '';
        if (dataToolsSection) dataToolsSection.style.display = '';
        if (importStudioCard) importStudioCard.style.display = '';
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

    if (dataToolsSection) dataToolsSection.style.display = '';
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

async function showDashboard() {
    document.body.classList.add('is-authenticated');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminSidebar').style.display = 'flex';
    document.getElementById('adminMain').style.display = 'block';
    const [loaded] = await Promise.all([loadDataFromServer({ silent: true }), loadAdminCapabilities()]);
    mountOwnerAdminLayout();
    refreshUI();
    if (!loaded) {
        const message = 'Could not load the latest server data. Reload and sign in again before editing.';
        setAdminSaveState(ADMIN_REQUEST_STATE.error, message);
        showToast(message);
    }
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

    updateAdminInstallUi();
}

window.suggestMissingMenuImages = async function () {
    const output = document.getElementById('menuImageSuggestionOutput');
    const menuItems = Array.isArray(menu) ? menu : [];
    const previousMenu = cloneAdminDraft(menuItems);
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
        return;
    }
    menu = previousMenu || [];
    renderMenuTable();
    updateStats();
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
    window._editingImages = [];
    const itemEditorTitle = document.getElementById('menuItemEditorTitle');
    if (itemEditorTitle) itemEditorTitle.textContent = 'Add Item';
    document.querySelector('#foodForm .primary-btn').textContent = 'Save';
    refreshMenuCrudFormUx('foodForm');
}

function initForms() {
    ['foodForm', 'catForm', 'superCatForm', 'wifiForm', 'brandingForm', 'landingPageForm', 'securityForm', 'hoursForm', 'galleryForm'].forEach((formId) => {
        const form = document.getElementById(formId);
        if (form) form.noValidate = true;
    });

    document.getElementById('foodForm').onsubmit = async (e) => {
        e.preventDefault();
        await commitFormItem();
    };

    // --- Shared save logic, can be called directly without a form submit event ---
    window.commitFormItem = async function () {
        setMenuCrudPrimaryButtonState('foodForm', 'saving');
        setMenuCrudValidationState('foodForm', {});
        const fileInput = document.getElementById('itemFile');

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
                    const failure = getAdminRequestFailureState(err);
                    setAdminSaveState(failure.type, failure.message);
                    setMenuCrudValidationState('foodForm', { message: failure.message, sectionId: 'media', fieldId: 'itemFile' });
                    showToast(failure.message);
                    return false;
                }
            }
        }

        // Build final images array:
        // - Keep existing saved images while editing
        // - Append any newly uploaded files
        let finalImages;
        if (editingItemId) {
            const existingImages = window._editingImages || [];
            finalImages = [...existingImages, ...newUploadedUrls];
        } else {
            finalImages = [...newUploadedUrls];
        }

        const ingredients = document.getElementById('itemIngredients').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const name = document.getElementById('itemName').value.trim();
        const cat = document.getElementById('itemCat').value;
        const desc = document.getElementById('itemDesc').value.trim();
        const previousMenu = cloneAdminDraft(menu);
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
            return false;
        }
        if (!cat) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Choose the category in Core.', sectionId: 'core', fieldId: 'itemCat' });
            showToast('Choose a category for this dish.');
            focusMenuCrudField('foodForm', 'core', 'itemCat');
            return false;
        }
        if (!desc) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add the fallback description in Core.', sectionId: 'core', fieldId: 'itemDesc' });
            showToast('Add a fallback description for this dish.');
            focusMenuCrudField('foodForm', 'core', 'itemDesc');
            return false;
        }
        if (hasSizes && !Object.values(sizes || {}).some((value) => Number(value) > 0)) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add at least one size price in Pricing.', sectionId: 'pricing', fieldId: 'itemPriceSmall' });
            showToast('Add at least one size price.');
            focusMenuCrudField('foodForm', 'pricing', 'itemPriceSmall');
            return false;
        }
        if (!hasSizes && !(Number(price) > 0)) {
            setMenuCrudPrimaryButtonState('foodForm', 'idle');
            setMenuCrudValidationState('foodForm', { message: 'Add the dish price in Pricing.', sectionId: 'pricing', fieldId: 'itemPrice' });
            showToast('Add a price before saving this dish.');
            focusMenuCrudField('foodForm', 'pricing', 'itemPrice');
            return false;
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
            return true;
        } else {
            menu = previousMenu || [];
            surfaceMenuCrudSaveFailure('foodForm', 'The dish could not be saved. Review the highlighted step and try again.');
            return false;
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
        const previousMenu = cloneAdminDraft(menu);
        const previousCatEmojis = cloneAdminDraft(catEmojis || {});
        const previousCategoryTranslations = cloneAdminDraft(categoryTranslations || {});
        const previousCategoryImages = cloneAdminDraft(categoryImages || {});
        const previousSuperCategories = cloneAdminDraft(restaurantConfig.superCategories || []);
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
        const categoryImageUpload = document.getElementById('catImageUpload');
        let nextImage = getCategoryImageDraftValue();

        if (categoryImageUpload && categoryImageUpload.files && categoryImageUpload.files[0]) {
            try {
                nextImage = await uploadImageToServer(categoryImageUpload.files[0]);
                setCategoryImageDraftValue(nextImage);
            } catch (error) {
                console.error('Category image upload failed:', error);
                setMenuCrudPrimaryButtonState('catForm', 'idle');
                const failure = getAdminRequestFailureState(error);
                setAdminSaveState(failure.type, failure.message);
                setMenuCrudValidationState('catForm', { message: failure.message, sectionId: 'visual', fieldId: 'catImageUpload' });
                showToast(failure.message);
                return;
            }
        }

        const selectedSuperCategory = (restaurantConfig.superCategories || []).find((sc) => sc.id === selectedSuperCategoryId);
        if (!selectedSuperCategory) {
            setMenuCrudPrimaryButtonState('catForm', 'idle');
            setMenuCrudValidationState('catForm', { message: 'The selected super category is no longer available.', sectionId: 'identity', fieldId: 'catSuperCategory' });
            showToast('Selected super category was not found.');
            return;
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
            menu = previousMenu || [];
            catEmojis = previousCatEmojis || {};
            categoryTranslations = previousCategoryTranslations || {};
            categoryImages = previousCategoryImages || {};
            restaurantConfig.superCategories = previousSuperCategories || [];
            if (window.restaurantConfig) {
                window.restaurantConfig.superCategories = restaurantConfig.superCategories;
            }
            window.categoryImages = categoryImages;
            surfaceMenuCrudSaveFailure('catForm', 'The category could not be saved. Review the highlighted step and try again.');
        }
    };

    document.getElementById('wifiForm').onsubmit = async (e) => {
        e.preventDefault();
        const saveButton = e.submitter || document.getElementById('infoWifiSaveBtn');
        const previousWifi = cloneAdminDraft(restaurantConfig.wifi || {});
        setInfoSaveButtonState(saveButton, 'saving');
        restaurantConfig.wifi.name = document.getElementById('wifiSSID').value;
        restaurantConfig.wifi.code = document.getElementById('wifiPassInput').value;
        const saved = await saveAndRefresh();
        if (saved) {
            renderInfoWorkspaceSummary();
            setInfoSaveButtonState(saveButton, 'saved');
            showToast('WiFi updated.');
        } else {
            restaurantConfig.wifi = previousWifi || { name: '', code: '' };
            if (window.restaurantConfig) {
                window.restaurantConfig.wifi = restaurantConfig.wifi;
            }
            setInfoSaveButtonState(saveButton, 'error');
        }
    };

    document.getElementById('brandingForm').onsubmit = async (e) => {
        e.preventDefault();
        const brandingDraft = getBrandingDraftFromForm();
        const previousBranding = cloneAdminDraft(restaurantConfig.branding || {});

        if (!isValidAssetUrl(brandingDraft.logoImage)) {
            showToast('Upload a logo image before saving.');
            return;
        }

        if (!isValidAssetUrl(brandingDraft.heroImage)) {
            showToast('Upload a hero image before saving.');
            return;
        }

        if ((brandingDraft.heroSlides || []).some((value) => value && !isValidAssetUrl(value))) {
            showToast('Remove or replace any invalid hero slide image before saving.');
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
            if (typeof window.mergeRestaurantConfig === 'function') {
                window.mergeRestaurantConfig({ branding: previousBranding || {} });
                restaurantConfig = window.restaurantConfig;
            } else {
                restaurantConfig.branding = previousBranding || {};
                if (window.restaurantConfig) {
                    window.restaurantConfig.branding = restaurantConfig.branding;
                }
            }
            if (typeof window.updateBrandingPreview === 'function') {
                window.updateBrandingPreview();
            }
            setBrandingSaveButtonsState('error');
        }
    };

    document.getElementById('landingPageForm').onsubmit = async (e) => {
        e.preventDefault();
        const saveButton = e.submitter || document.getElementById('infoPublicSaveBtn');
        const previousLocation = cloneAdminDraft(restaurantConfig.location || {});
        const previousPhone = restaurantConfig.phone || '';
        const previousSocials = cloneAdminDraft(restaurantConfig.socials || {});
        const previousGuestExperience = cloneAdminDraft(restaurantConfig.guestExperience || {});
        const previousSectionVisibility = cloneAdminDraft(restaurantConfig.sectionVisibility || {});
        const previousSectionOrder = cloneAdminDraft(restaurantConfig.sectionOrder || []);
        const previousContentTranslations = cloneAdminDraft(restaurantConfig.contentTranslations || {});
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
            restaurantConfig.location = previousLocation || { address: '', url: '' };
            restaurantConfig.phone = previousPhone;
            restaurantConfig.socials = previousSocials || {};
            restaurantConfig.guestExperience = previousGuestExperience || {};
            restaurantConfig.sectionVisibility = previousSectionVisibility || {};
            restaurantConfig.sectionOrder = previousSectionOrder || [];
            restaurantConfig.contentTranslations = previousContentTranslations || { fr: {}, en: {}, ar: {} };
            if (window.restaurantConfig) {
                window.restaurantConfig.location = restaurantConfig.location;
                window.restaurantConfig.phone = restaurantConfig.phone;
                window.restaurantConfig.socials = restaurantConfig.socials;
                window.restaurantConfig.guestExperience = restaurantConfig.guestExperience;
                window.restaurantConfig.sectionVisibility = restaurantConfig.sectionVisibility;
                window.restaurantConfig.sectionOrder = restaurantConfig.sectionOrder;
                window.restaurantConfig.contentTranslations = restaurantConfig.contentTranslations;
            }
            setInfoSaveButtonState(saveButton, 'error');
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
        const time = document.getElementById('scTime').value;
        const translations = buildSuperCategoryTranslations(name);

        if (!name) {
            setMenuCrudPrimaryButtonState('superCatForm', 'idle');
            setMenuCrudValidationState('superCatForm', { message: 'Add the group name in Identity.', sectionId: 'identity', fieldId: 'scName' });
            showToast('Super category name is required.');
            focusMenuCrudField('superCatForm', 'identity', 'scName');
            return;
        }
        if (!emoji) {
            emoji = suggestSuperCategoryIcon(name, '');
            setSuperCategoryIcon(emoji, false);
        }

        const id = editingId || name.toLowerCase().replace(/\s+/g, '_');
        const existingIdx = restaurantConfig.superCategories.findIndex(sc => sc.id === id);
        const previousSuperCategories = cloneAdminDraft(restaurantConfig.superCategories || []);

        const newSC = { id, name, emoji, time, cats: selectedCats, translations };

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
            restaurantConfig.superCategories = previousSuperCategories || [];
            if (window.restaurantConfig) {
                window.restaurantConfig.superCategories = restaurantConfig.superCategories;
            }
            surfaceMenuCrudSaveFailure('superCatForm', 'The super category could not be saved. Review the highlighted step and try again.');
        }
    };
}

function getContentTranslationValue(lang, key) {
    return restaurantConfig?.contentTranslations?.[lang]?.[key] || NOUR_HOMEPAGE_COPY_DEFAULTS?.[lang]?.[key] || '';
}

function renderLandingContentEditor() {
    const container = document.getElementById('landingContentGrid');
    if (!container) return;

    container.innerHTML = LANDING_CONTENT_FIELDS.map((field) => `
        <div class="landing-copy-card">
            <div class="landing-copy-card-header">
                <h5 class="landing-copy-field-title">${escapeHtml(field.label)}</h5>
                <span class="landing-copy-field-type">${field.type === 'textarea' ? 'Long copy' : 'Short text'}</span>
            </div>
            <div class="landing-copy-language-grid">
                ${CONTENT_EDITOR_LANGUAGES.map((lang) => {
                    const value = escapeHtml(getContentTranslationValue(lang, field.key));
                    const label = lang.toUpperCase();
                    if (field.type === 'textarea') {
                        return `
                            <label class="landing-copy-language-field">
                                <span class="landing-copy-language-label">${label}</span>
                                <textarea data-content-lang="${lang}" data-content-key="${field.key}" rows="6">${value}</textarea>
                            </label>
                        `;
                    }
                    return `
                        <label class="landing-copy-language-field">
                            <span class="landing-copy-language-label">${label}</span>
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

function setInfoSummaryState(id, isReady) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('is-ready', Boolean(isReady));
    el.classList.toggle('is-attention', !isReady);
}

window.focusInfoWorkspacePanel = function (panelKey) {
    const panelMap = {
        public: 'infoPanelPublic',
        social: 'infoPanelSocial',
        facilities: 'infoPanelFacilities',
        hours: 'infoPanelHours',
        wifi: 'infoPanelWifi',
        security: 'infoPanelSecurity'
    };
    const target = document.getElementById(panelMap[panelKey] || '');
    if (!target) return;
    currentInfoWorkspacePanel = INFO_WORKSPACE_PANELS.includes(panelKey) ? panelKey : 'public';
    syncInfoWorkspacePanels();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const focusTarget = target.querySelector('input, textarea, select, button') || target;
    if (focusTarget && typeof focusTarget.focus === 'function') {
        setTimeout(() => focusTarget.focus({ preventScroll: true }), 220);
    }
};

window.handleInfoSummaryCardKey = function (event, panelKey) {
    if (!event || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    window.focusInfoWorkspacePanel(panelKey);
};

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
        : (configuredHoursCount
            ? t('admin.info.hours_configured', '{count} days configured', { count: configuredHoursCount })
            : t('admin.info.set_hours', 'Set opening hours'));

    const wifiName = readValue('wifiSSID', restaurantConfig.wifi?.name || '');
    const securityUser = readValue('adminNewUser', adminAuth?.user || '');

    setInfoWorkspaceText('infoSummaryLocationValue', address || t('admin.info.add_address', 'Add address'));
    setInfoSummaryState('infoSummaryLocationCard', Boolean(address && mapUrl && isValidAbsoluteUrl(mapUrl)));

    setInfoWorkspaceText('infoSummaryContactValue', phone || t('admin.info.add_phone', 'Add phone number'));
    setInfoSummaryState('infoSummaryContactCard', Boolean(phone));

    setInfoWorkspaceText('infoSummaryGuestValue', guestSignalCount
        ? t('admin.info.guest_signals_live', '{count} guest signals live', { count: guestSignalCount })
        : t('admin.info.review_facilities', 'Review facilities'));
    setInfoSummaryState('infoSummaryGuestCard', guestSignalCount > 0);

    setInfoWorkspaceText('infoSummaryOpsValue', securityUser ? `@${securityUser}` : t('admin.info.review_access', 'Review access'));
    setInfoSummaryState('infoSummaryOpsCard', Boolean(securityUser && wifiName && configuredHoursCount));

    setInfoWorkspaceText('infoSocialMetric', socialLinks.length
        ? t(socialLinks.length > 1 ? 'admin.info.links_live_plural' : 'admin.info.links_live', '{count} link live', { count: socialLinks.length })
        : t('admin.info.no_links_live', 'No links live'));
    setInfoWorkspaceText('infoFacilitiesMetric', guestSignalCount
        ? t('admin.info.active_count', '{count} active', { count: guestSignalCount })
        : t('admin.info.nothing_active', 'Nothing active'));
    setInfoWorkspaceText('infoHoursMetric', hoursSummary);
    setInfoWorkspaceText('infoWifiMetric', wifiName
        ? summarizeInfoCopy(wifiName, t('admin.info.configured', 'Configured'))
        : t('admin.info.not_configured', 'Not configured'));
    setInfoWorkspaceText('infoSecurityMetric', securityUser ? `@${securityUser}` : t('admin.info.update_login', 'Update login'));
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

    button.classList.remove('is-saving', 'is-saved', 'is-error');
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

    if (state === 'error') {
        button.classList.add('is-error');
        button.textContent = t('admin.save_state.retry_label', 'Retry');
        button._saveFeedbackTimer = setTimeout(() => {
            button.classList.remove('is-error');
            button.textContent = getInfoSaveButtonOriginalLabel(button);
        }, 2200);
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
    'brandMenuSurface'
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

function createBrandAssetDraftState() {
    return BRAND_ASSET_FIELD_IDS.reduce((acc, fieldId) => {
        acc[fieldId] = { value: '', state: 'inherit' };
        return acc;
    }, {});
}

brandAssetDraftState = createBrandAssetDraftState();

function setBrandAssetFieldValue(id, value, state) {
    if (!BRAND_ASSET_FIELD_IDS.includes(id)) return;
    const nextValue = typeof value === 'string' ? value.trim() : '';
    brandAssetDraftState[id] = {
        value: nextValue,
        state: state || (nextValue ? 'set' : 'inherit')
    };
}

function getBrandAssetFieldValue(id, fallback = '') {
    if (!BRAND_ASSET_FIELD_IDS.includes(id)) return fallback;
    const entry = brandAssetDraftState[id] || { value: '', state: 'inherit' };
    if (entry.state === 'cleared') return '';
    return (entry.value || '').trim() || fallback;
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
        heroImage: getBrandAssetFieldValue('brandHeroImage', currentBranding.heroImage || defaults.heroImage || ''),
        heroSlides: [
            getBrandAssetFieldValue('brandHeroImage', currentBranding.heroImage || defaults.heroImage || ''),
            getBrandAssetFieldValue('brandHeroSlide2', currentBranding.heroSlides?.[1] || ''),
            getBrandAssetFieldValue('brandHeroSlide3', currentBranding.heroSlides?.[2] || '')
        ],
        logoImage: getBrandAssetFieldValue('brandLogoImage', currentBranding.logoImage || '')
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

    const knownPresetHeroes = Object.values(window.brandPresetCatalog || {})
        .flatMap((entry) => {
            const values = [];
            if (entry.heroImage) values.push(entry.heroImage);
            if (Array.isArray(entry.heroSlides)) values.push(...entry.heroSlides);
            return values;
        })
        .filter(Boolean);
    const applyHeroField = (fieldId, nextValue) => {
        const currentValue = getBrandAssetFieldValue(fieldId, '');
        if (!currentValue || knownPresetHeroes.includes(currentValue)) {
            setBrandAssetFieldValue(fieldId, nextValue || '', nextValue ? 'set' : 'inherit');
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
    const presetLabelText = t(`admin.branding.preset_${draft.presetId || 'core'}`, preset.label || draft.presetId || 'Preset');
    const brandName = draft.shortName || draft.restaurantName;
    const heroGradient = `linear-gradient(135deg, ${draft.accentColor} 0%, ${draft.secondaryColor} 45%, ${draft.primaryColor} 100%)`;
    const previewCard = document.querySelector('.brand-preview-card');
    const previewBody = document.querySelector('.brand-preview-body');
    const previewSwatches = document.querySelector('.brand-preview-swatches');
    hero.style.backgroundImage = draft.heroImage
        ? `${heroGradient}, ${toCssImageUrl(draft.heroImage)}`
        : heroGradient;

    title.textContent = t('admin.branding.preview_title_template', '{name} website', { name: brandName });
    heroText.textContent = draft.tagline || t('admin.branding.preview_hero_text', 'Logo, colors, and cover image will update here as you edit.');
    name.textContent = draft.restaurantName;
    tagline.textContent = draft.tagline || t('admin.branding.preview_identity_text', 'Brand identity preview');

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
        presetLabel.textContent = presetLabelText;
    }

    if (homepageMock) {
        homepageMock.style.backgroundImage = draft.heroImage
            ? `${heroGradient}, ${toCssImageUrl(draft.heroImage)}`
            : heroGradient;
    }
    if (homepageMockTitle) {
        homepageMockTitle.textContent = t('admin.branding.preview_title_template', '{name} website', { name: brandName });
    }
    if (homepageMockText) {
        homepageMockText.textContent = draft.tagline || t('admin.branding.preview_homepage_text', 'Homepage hero, CTA, and media preview.');
    }
    if (homepageMockMeta) {
        homepageMockMeta.textContent = t('admin.branding.preview_preset_template', '{preset} preview', { preset: presetLabelText });
    }
    if (homepageMockCta) {
        homepageMockCta.style.background = `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`;
    }

    if (menuShell) {
        menuShell.style.background = draft.menuBackground;
    }
    if (menuChipPrimary) {
        menuChipPrimary.style.background = `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`;
        menuChipPrimary.textContent = draft.shortName || t('admin.branding.preview_menu', 'Menu');
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
        menuCardTitle.textContent = t('admin.branding.preview_selection_template', '{name} Selection', {
            name: draft.shortName || t('admin.branding.preview_signature', 'Signature')
        });
    }
    if (menuCardText) {
        menuCardText.textContent = t('admin.branding.preview_menu_card_text', 'Menu cards, background depth, and accent contrast for the {preset} preset.', {
            preset: presetLabelText
        });
    }
    if (menuCardPrice) {
        menuCardPrice.style.color = draft.accentColor;
    }
    if (menuCardTag) {
        menuCardTag.style.background = draft.secondaryColor;
    }
};

window.clearBrandAsset = function (fieldId) {
    if (!BRAND_ASSET_FIELD_IDS.includes(fieldId)) return;
    setBrandAssetFieldValue(fieldId, '', 'cleared');

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
    if (!BRAND_ASSET_FIELD_IDS.includes(fieldId)) return;
    const file = input && input.files && input.files[0];
    if (!file) return;

    try {
        const url = await uploadImageToServer(file);
        setBrandAssetFieldValue(fieldId, url, 'set');
        window.updateBrandingPreview();
        showToast('Image uploaded. Save branding to publish it.');
    } catch (error) {
        console.error('Brand asset upload error:', error);
        const failure = getAdminRequestFailureState(error);
        setAdminSaveState(failure.type, failure.message);
        showToast(failure.message);
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

    brandAssetDraftState = createBrandAssetDraftState();
    Object.entries(fields).forEach(([id, value]) => {
        if (BRAND_ASSET_FIELD_IDS.includes(id)) {
            setBrandAssetFieldValue(id, value, value ? 'set' : 'inherit');
            return;
        }
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
            <td>${getAdminSuperCategorySummary(sc) || 'No categories linked yet'}</td>
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
    document.getElementById('scTime').value = sc.time || '';
    setSuperCategoryTranslationFields(sc.translations, sc.name);

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
    const previousSuperCategories = Array.isArray(restaurantConfig.superCategories)
        ? JSON.parse(JSON.stringify(restaurantConfig.superCategories))
        : [];
    restaurantConfig.superCategories = restaurantConfig.superCategories.filter(s => s.id !== id);
    const saved = await saveAndRefresh();
    if (saved) {
        showToast('Super category removed.');
        return;
    }
    restaurantConfig.superCategories = previousSuperCategories;
    if (window.restaurantConfig) {
        window.restaurantConfig.superCategories = previousSuperCategories;
    }
    refreshUI();
}

async function uploadImageToServer(file) {
    const formData = new FormData();
    formData.append('image', file, file.name);

    let response;
    try {
        response = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
    } catch (error) {
        throw createAdminRequestError('Network error while uploading. Check the connection and retry.', 'network_error', { cause: error });
    }

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const requestError = buildAdminRequestErrorFromResponse(response, payload);
        requestError.code = requestError.code || 'upload_failed';
        if (!requestError.message || requestError.message === payload?.error) {
            requestError.message = response.status === 401
                ? 'Session expired while uploading. Reload and sign in again.'
                : getUploadFailureMessage(payload?.error, response.statusText || response.status);
        }
        throw requestError;
    }

    const data = await response.json();
    if (data.ok && data.url) {
        return data.url;
    }
    if (data.urls && data.urls.length > 0) {
        return data.urls[0];
    }
    throw createAdminRequestError('No upload URL was returned from the server.', 'upload_failed');
}

window.exportRestaurantBackup = async function () {
    try {
        const response = await fetch('/api/data/export', { credentials: 'include' });
        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw buildAdminRequestErrorFromResponse(response, payload);
        }

        const blob = await response.blob();
        const stamp = new Date().toISOString().slice(0, 10);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `restaurant-backup-${stamp}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast('Backup exported.');
    } catch (error) {
        console.error('Backup export failed:', error);
        showToast(`Backup export failed: ${error.message}`);
    }
};

window.importRestaurantBackup = async function () {
    const input = document.getElementById('restaurantBackupFile');
    const file = input?.files?.[0];
    if (!file) {
        showToast('Choose a JSON backup first.');
        return;
    }

    let parsed;
    try {
        parsed = JSON.parse(await file.text());
    } catch (_error) {
        showToast('This backup file is not valid JSON.');
        return;
    }

    const confirmed = await showAdminConfirm({
        kicker: 'Import backup',
        title: 'Replace live data with this backup?',
        copy: 'The current restaurant data will be backed up first, then replaced by the selected JSON file.',
        note: 'Menu, branding, info, hours, gallery references, and homepage copy may change.',
        confirmLabel: 'Import backup',
        cancelLabel: 'Not yet',
        tone: 'danger'
    });
    if (!confirmed) return;

    try {
        setAdminSaveState(ADMIN_REQUEST_STATE.saving, 'Importing backup...');
        const response = await fetch('/api/data/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Intent': 'confirmed' },
            credentials: 'include',
            body: JSON.stringify({ data: parsed })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }

        await loadDataFromServer({ silent: true });
        refreshUI();
        setAdminSaveState(ADMIN_REQUEST_STATE.success, 'Backup imported.', {
            savedAt: data?.meta?.savedAt || new Date().toISOString(),
            dataVersion: data?.meta?.dataVersion || adminSaveState.dataVersion
        });
        showToast('Backup imported.');
    } catch (error) {
        console.error('Backup import failed:', error);
        reflectAdminRequestFailure(error);
        showToast(`Backup import failed: ${error.message}`);
    }
};

window.resetRestaurantData = async function () {
    const confirmed = await showAdminConfirm({
        kicker: 'Reset data',
        title: 'Reset to bundled demo data?',
        copy: 'The current restaurant data will be backed up first, then replaced with the bundled starter data.',
        note: 'Use this only when intentionally preparing a fresh setup.',
        confirmLabel: 'Reset data',
        cancelLabel: 'Cancel',
        tone: 'danger'
    });
    if (!confirmed) return;

    try {
        setAdminSaveState(ADMIN_REQUEST_STATE.saving, 'Resetting data...');
        const response = await fetch('/api/data/reset', {
            method: 'POST',
            headers: { 'X-Admin-Intent': 'confirmed' },
            credentials: 'include'
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }

        await loadDataFromServer({ silent: true });
        refreshUI();
        setAdminSaveState(ADMIN_REQUEST_STATE.success, 'Demo data restored.', {
            savedAt: new Date().toISOString(),
            dataVersion: adminSaveState.dataVersion
        });
        showToast('Demo data restored.');
    } catch (error) {
        console.error('Data reset failed:', error);
        reflectAdminRequestFailure(error);
        showToast(`Reset failed: ${error.message}`);
    }
};


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
    const applyInfoBtn = document.getElementById('applyImporterInfoBtn');
    const applyColorsBtn = document.getElementById('applyImporterColorsBtn');
    const copyBtn = document.getElementById('copyImporterDraftJsonBtn');
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
        if (applyInfoBtn) applyInfoBtn.disabled = true;
        if (applyColorsBtn) applyColorsBtn.disabled = true;
        if (copyBtn) copyBtn.disabled = true;

        return;
    }

    const restaurantData = draft.restaurantData || {};
    const review = draft.review || {};
    const menuItems = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
    const superCategories = Array.isArray(restaurantData.superCategories) ? restaurantData.superCategories : [];
    const landing = restaurantData.landing && typeof restaurantData.landing === 'object' ? restaurantData.landing : {};
    const social = restaurantData.social && typeof restaurantData.social === 'object' ? restaurantData.social : {};
    const wifi = restaurantData.wifi && typeof restaurantData.wifi === 'object' ? restaurantData.wifi : {};
    const guestExperience = restaurantData.guestExperience && typeof restaurantData.guestExperience === 'object' ? restaurantData.guestExperience : {};
    const importedBranding = restaurantData.branding && typeof restaurantData.branding === 'object' ? restaurantData.branding : {};
    const infoSignalCount = Number(review?.infoExtraction?.detectedFieldCount)
        || [
            landing?.phone,
            landing?.location?.address,
            landing?.location?.url,
            wifi?.ssid,
            wifi?.pass,
            ...(Array.isArray(restaurantData.hours) ? restaurantData.hours : []),
            restaurantData.hoursNote,
            ...Object.values(social || {}),
            ...(Array.isArray(guestExperience.paymentMethods) ? guestExperience.paymentMethods : []),
            ...(Array.isArray(guestExperience.facilities) ? guestExperience.facilities : [])
        ].filter(Boolean).length;
    const brandColorKeys = ['primaryColor', 'secondaryColor', 'accentColor', 'surfaceColor', 'surfaceMuted', 'textColor', 'textMuted', 'menuBackground', 'menuSurface'];
    const brandColorCount = brandColorKeys.filter((key) => /^#[0-9a-f]{6}$/i.test(String(importedBranding[key] || '').trim())).length;
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
        `Info signals: ${reviewReport.infoSignalCount}`,
        `Brand color palette: ${reviewReport.canApplyBrandColors ? 'detected' : 'not detected'}`,
        `Untranslated items: ${untranslatedItems.length}`,
        `Library image matches: ${lastImporterDraftMeta?.mediaLibraryMatches || review.mediaLibraryMatches || 0}`,
        `Menu extraction confidence: ${review.confidence?.menuExtraction || 'unknown'}`,
        `Info extraction confidence: ${review.confidence?.infoExtraction || 'unknown'}`,
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
            { value: reviewReport.infoSignalCount, label: 'Info Signals' },
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
    if (applyInfoBtn) {
        applyInfoBtn.disabled = importStudioBusy || !reviewReport.canApplyInfo;
    }
    if (applyColorsBtn) {
        applyColorsBtn.disabled = importStudioBusy || !reviewReport.canApplyBrandColors;
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
        infoSignalCount,
        brandColorCount,
        blockers,
        warnings,
        canApplyMenuOnly: menuItems.length > 0,
        canApplyMenuStructure: menuItems.length > 0,
        canApplyInfo: menuItems.length > 0 && infoSignalCount > 0,
        canApplyBrandColors: menuItems.length > 0 && brandColorCount >= 3
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
                if (!response.ok) {
                    throw buildAdminRequestErrorFromResponse(response, data);
                }
                if (!data.ok || !data.job) {
                    throw createAdminRequestError(data.error || 'Importer progress is unavailable.', data.error || 'importer_progress_unavailable');
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
    const applyInfo = scope === 'menu_info';
    const applyColors = scope === 'menu_colors';
    const importedLanding = imported.landing && typeof imported.landing === 'object' ? imported.landing : {};
    const importedLocation = importedLanding.location && typeof importedLanding.location === 'object' ? importedLanding.location : {};
    const importedWifi = imported.wifi && typeof imported.wifi === 'object' ? imported.wifi : {};
    const importedSocial = imported.social && typeof imported.social === 'object' ? imported.social : {};
    const importedGuestExperience = imported.guestExperience && typeof imported.guestExperience === 'object'
        ? imported.guestExperience
        : null;
    const importedHours = Array.isArray(imported.hours) && imported.hours.length ? imported.hours : null;
    const importedBranding = imported.branding && typeof imported.branding === 'object' ? imported.branding : {};
    const currentBranding = restaurantConfig.branding || window.defaultBranding || {};
    const importedColorKeys = ['primaryColor', 'secondaryColor', 'accentColor', 'surfaceColor', 'surfaceMuted', 'textColor', 'textMuted', 'menuBackground', 'menuSurface'];
    const importedColors = Object.fromEntries(importedColorKeys
        .map((key) => [key, importedBranding[key]])
        .filter(([, value]) => /^#[0-9a-f]{6}$/i.test(String(value || '').trim())));
    const compactImportedObject = (value) => Object.fromEntries(
        Object.entries(value && typeof value === 'object' ? value : {})
            .filter(([, entryValue]) => typeof entryValue === 'string' ? entryValue.trim() : Boolean(entryValue))
    );
    const currentGuestExperience = restaurantConfig.guestExperience || window.defaultConfig?.guestExperience || { paymentMethods: [], facilities: [] };
    const importedPaymentMethods = Array.isArray(importedGuestExperience?.paymentMethods) ? importedGuestExperience.paymentMethods : [];
    const importedFacilities = Array.isArray(importedGuestExperience?.facilities) ? importedGuestExperience.facilities : [];

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
            ssid: applyInfo ? (importedWifi.ssid || restaurantConfig.wifi?.name || '') : (restaurantConfig.wifi?.name || ''),
            pass: applyInfo ? (importedWifi.pass || restaurantConfig.wifi?.code || '') : (restaurantConfig.wifi?.code || '')
        },
        social: {
            ...(applyInfo ? { ...(restaurantConfig.socials || {}), ...compactImportedObject(importedSocial) } : (restaurantConfig.socials || {}))
        },
        guestExperience: applyInfo
            ? {
                paymentMethods: [...new Set([
                    ...(Array.isArray(currentGuestExperience.paymentMethods) ? currentGuestExperience.paymentMethods : []),
                    ...importedPaymentMethods
                ].filter(Boolean))],
                facilities: [...new Set([
                    ...(Array.isArray(currentGuestExperience.facilities) ? currentGuestExperience.facilities : []),
                    ...importedFacilities
                ].filter(Boolean))]
            }
            : currentGuestExperience,
        sectionVisibility: restaurantConfig.sectionVisibility || window.defaultConfig?.sectionVisibility || {},
        sectionOrder: restaurantConfig.sectionOrder || window.defaultConfig?.sectionOrder || ADMIN_SECTION_ORDER_KEYS,
        branding: {
            ...currentBranding,
            ...(applyColors ? importedColors : {})
        },
        contentTranslations: {
            fr: { ...(restaurantConfig.contentTranslations?.fr || {}) },
            en: { ...(restaurantConfig.contentTranslations?.en || {}) },
            ar: { ...(restaurantConfig.contentTranslations?.ar || {}) }
        },
        promoId: promoIds.length > 0 ? promoIds[0] : null,
        promoIds: promoIds,
        superCategories: applyStructure
            ? (Array.isArray(imported.superCategories) && imported.superCategories.length
                ? imported.superCategories.map((entry) => sanitizeSuperCategoryForStorage(entry))
                : [])
            : (Array.isArray(restaurantConfig.superCategories)
                ? restaurantConfig.superCategories.map((entry) => sanitizeSuperCategoryForStorage(entry))
                : []),
        hours: applyInfo ? (importedHours || restaurantConfig._hours || null) : (restaurantConfig._hours || null),
        hoursNote: applyInfo ? (imported.hoursNote || restaurantConfig._hoursNote || '') : (restaurantConfig._hoursNote || ''),
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: {
                ...(restaurantConfig.location || {}),
                ...(applyInfo ? compactImportedObject(importedLocation) : {})
            },
            phone: applyInfo ? (importedLanding.phone || restaurantConfig.phone || '') : (restaurantConfig.phone || '')
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

        if (!response.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }
        if (!data.ok || !data.jobId) {
            throw createAdminRequestError(data.error || 'Importer draft failed.', data.error || 'importer_draft_failed', {
                jobId: data.jobId || '',
                stage: data.stage || ''
            });
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
        reflectAdminRequestFailure(error);
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
    if (!report.canApplyMenuOnly || !report.canApplyMenuStructure) {
        showToast('The draft does not contain any menu items to apply.');
        return;
    }
    if (scope === 'menu_info' && !report.canApplyInfo) {
        showToast('No reliable info fields were detected in this draft.');
        return;
    }
    if (scope === 'menu_colors' && !report.canApplyBrandColors) {
        showToast('No reliable color palette was detected from the menu images.');
        return;
    }

    const scopeLabels = {
        menu_only: {
            kicker: 'Apply menu only',
            title: 'Publish menu items?',
            confirm: 'Publish menu',
            progressTitle: 'Publishing menu items',
            meta: 'Menu only',
            success: 'The reviewed menu is saved on the server.',
            doneTitle: 'Menu items published',
            toast: 'Menu items published.',
            copy: 'Apply menu items only to the current restaurant instance? Category structure and site identity settings will stay unchanged.'
        },
        menu_structure: {
            kicker: 'Apply menu + structure',
            title: 'Publish menu and structure?',
            confirm: 'Publish everything',
            progressTitle: 'Publishing menu and structure',
            meta: 'Menu + structure',
            success: 'The reviewed menu and structure are saved on the server.',
            doneTitle: 'Menu and structure published',
            toast: 'Menu and structure published.',
            copy: 'Apply menu items and imported category structure to the current restaurant instance? Branding, landing, gallery, and other site identity settings will stay unchanged.'
        },
        menu_info: {
            kicker: 'Apply menu + info',
            title: 'Publish menu and info?',
            confirm: 'Publish menu + info',
            progressTitle: 'Publishing menu and info',
            meta: 'Menu + info',
            success: 'The reviewed menu and imported info are saved on the server.',
            doneTitle: 'Menu and info published',
            toast: 'Menu and info published.',
            copy: 'Apply menu items plus detected phone, address, socials, WiFi, hours, payments, and facilities? Branding, gallery, and category structure will stay unchanged.'
        },
        menu_colors: {
            kicker: 'Apply menu + colors',
            title: 'Publish menu and palette?',
            confirm: 'Publish menu + colors',
            progressTitle: 'Publishing menu and palette',
            meta: 'Menu + colors',
            success: 'The reviewed menu and sampled brand colors are saved on the server.',
            doneTitle: 'Menu and colors published',
            toast: 'Menu and colors published.',
            copy: 'Apply menu items plus brand colors sampled from the uploaded menu images? Logo, hero media, gallery, contact info, and category structure will stay unchanged.'
        }
    };
    const scopeCopy = scopeLabels[scope] || scopeLabels.menu_only;
    const confirmed = await showAdminConfirm({
        kicker: scopeCopy.kicker,
        title: scopeCopy.title,
        copy: scopeCopy.copy,
        note: 'This writes the reviewed draft into the active restaurant data.',
        confirmLabel: scopeCopy.confirm,
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
            title: scopeCopy.progressTitle,
            copy: 'The reviewed draft is being written into the live restaurant data.',
            progress: 42,
            meta: scopeCopy.meta,
            hint: 'Please wait while the current restaurant data is updated.'
        });
        setAdminSaveState(
            ADMIN_REQUEST_STATE.saving,
            `${scopeCopy.progressTitle} to the server...`
        );
        const payload = buildImporterApplyPayload(lastImporterDraft, scope);
        const response = await fetch('/api/data/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Intent': 'confirmed' },
            credentials: 'include',
            body: JSON.stringify({ data: payload })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }
        if (!data.ok) {
            throw createAdminRequestError(data.error || 'Draft apply failed.', data.error || 'draft_apply_failed');
        }

        await loadDataFromServer({ silent: true });
        refreshUI();
        setAdminSaveState(
            ADMIN_REQUEST_STATE.success,
            scopeCopy.success,
            {
                savedAt: data?.meta?.savedAt || new Date().toISOString(),
                dataVersion: data?.meta?.dataVersion || adminSaveState.dataVersion
            }
        );
        applyImportStudioProgress({
            status: 'succeeded',
            stageKey: 'publish',
            badge: 'Publish complete',
            title: scopeCopy.doneTitle,
            copy: 'The public site can now use the reviewed importer data.',
            progress: 100,
            meta: 'Saved',
            hint: 'You can keep editing or generate another draft.'
        }, { overlay: false });
        setAdminTaskOverlay(null);
        setImportStudioControlsBusy(false);
        showToast(scopeCopy.toast);
    } catch (error) {
        console.error('Apply importer draft error:', error);
        reflectAdminRequestFailure(error);
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
    const previousMenu = JSON.parse(JSON.stringify(menu));
    const previousPromoIds = [...promoIds];
    menu = menu.filter(m => m.id != id);
    promoIds = promoIds.filter(pid => pid != id);
    window.promoIds = promoIds;
    const saved = await saveAndRefresh();
    if (saved) {
        showToast('Dish removed.');
        return;
    }
    menu = previousMenu;
    promoIds = previousPromoIds;
    window.promoIds = promoIds;
    refreshUI();
}
function hasPromoId(id) {
    return promoIds.some((pid) => String(pid) === String(id));
}
async function togglePromo(id) {
    const previousPromoIds = [...promoIds];
    if (hasPromoId(id)) {
        promoIds = promoIds.filter(pid => String(pid) !== String(id));
    } else {
        promoIds.push(id);
    }
    window.promoIds = promoIds; // Sync for shared.js
    const saved = await saveAndRefresh();
    if (saved) return;
    promoIds = previousPromoIds;
    window.promoIds = promoIds;
    refreshUI();
}
async function toggleFeatured(id) {
    const item = menu.find(m => m.id == id);
    if (item) {
        const previousFeatured = Boolean(item.featured);
        item.featured = !item.featured;
        const saved = await saveAndRefresh();
        if (saved) return;
        item.featured = previousFeatured;
        refreshUI();
    }
}

window.togglePromo = togglePromo;
window.toggleFeatured = toggleFeatured;
// Legacy save handlers kept only as a fallback reference while the newer save flow remains below.
async function forceSaveChangesLegacy() {
    try {
        // If user is currently editing a food item, commit those changes first
        let saved = false;
        if (editingItemId && typeof window.commitFormItem === 'function') {
            saved = await window.commitFormItem();
        } else {
            saved = await saveAndRefresh();
            if (saved) {
                showToast('All changes saved.');
            }
        }

        if (!saved) {
            return;
        }

        // Visual feedback on float button
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
        const failure = getAdminRequestFailureState(e);
        setAdminSaveState(failure.type, failure.message, {
            savedAt: e?.savedAt !== undefined ? e.savedAt : adminSaveState.savedAt,
            dataVersion: e?.dataVersion !== undefined ? e.dataVersion : adminSaveState.dataVersion
        });
        await showAdminNotice({
            kicker: 'Save failed',
            title: 'The changes could not be saved',
            copy: failure.message || 'A server error blocked this save.',
            confirmLabel: 'OK'
        });
    }
}
async function saveAndRefreshLegacy() {
    return saveAndRefresh();
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

function setAdminLoginPendingState(active) {
    adminLoginInFlight = Boolean(active);
    const button = document.getElementById('loginBtn');
    const userEl = document.getElementById('loginUser');
    const passEl = document.getElementById('loginPass');
    if (button) {
        button.disabled = adminLoginInFlight;
        button.setAttribute('aria-busy', adminLoginInFlight ? 'true' : 'false');
        button.textContent = adminLoginInFlight
            ? t('admin.save_state.saving_label', 'Saving')
            : t('admin.login.button', 'Se Connecter');
    }
    [userEl, passEl].forEach((field) => {
        if (field) field.disabled = adminLoginInFlight;
    });
}

async function performAdminLogin() {
    const userEl = document.getElementById('loginUser');
    const passEl = document.getElementById('loginPass');
    const errorEl = document.getElementById('loginError');

    if (!userEl || !passEl) {
        console.error('[LOGIN] Missing login elements!');
        return;
    }

    const username = userEl.value.trim();
    const password = passEl.value;
    if (adminLoginInFlight) return;

    try {
        setAdminLoginPendingState(true);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
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
    } finally {
        setAdminLoginPendingState(false);
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

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw buildAdminRequestErrorFromResponse(res, data);
            }

            if (data.ok) {
                adminAuth.user = data.user || newUsername;
                setInfoSaveButtonState(saveButton, 'saved');
                setAdminSaveState(
                    ADMIN_REQUEST_STATE.success,
                    data.message || t('admin.security.credentials_updated', 'Credentials updated successfully.'),
                    {
                        savedAt: new Date().toISOString(),
                        dataVersion: adminSaveState.dataVersion
                    }
                );
                showToast(data.message || t('admin.security.credentials_updated', 'Credentials updated successfully.'));
                document.getElementById('adminNewPass').value = '';
                document.getElementById('adminConfirmPass').value = '';
                loadSecurityStatus();
                renderInfoWorkspaceSummary();
            } else {
                const failure = getAdminRequestFailureState(
                    createAdminRequestError(
                        data.error || t('admin.security.credentials_update_failed', 'Unable to update credentials.'),
                        data.error || 'credentials_update_failed'
                    )
                );
                setAdminSaveState(failure.type, failure.message);
                setInfoSaveButtonState(saveButton, 'error');
                showToast(failure.message);
            }
        } catch (err) {
            console.error('Credentials update error:', err);
            const failure = getAdminRequestFailureState(err);
            setAdminSaveState(failure.type, failure.message);
            setInfoSaveButtonState(saveButton, 'error');
            showToast(failure.message || t('admin.login.server_connection_error', 'Server connection error.'));
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
            saved = await window.commitFormItem();
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
        const failure = getAdminRequestFailureState(e);
        setAdminSaveState(failure.type, failure.message, {
            savedAt: e?.savedAt !== undefined ? e.savedAt : adminSaveState.savedAt,
            dataVersion: e?.dataVersion !== undefined ? e.dataVersion : adminSaveState.dataVersion
        });
        showToast(`${t('admin.save_state.error_prefix', 'Save failed')}: ${failure.message}`);
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
        superCategories: Array.isArray(restaurantConfig.superCategories)
            ? restaurantConfig.superCategories.map((entry) => sanitizeSuperCategoryForStorage(entry))
            : [],
        hours: restaurantConfig._hours || null,
        hoursNote: restaurantConfig._hoursNote || '',
        gallery: restaurantConfig.gallery || [],
        landing: {
            location: restaurantConfig.location,
            phone: restaurantConfig.phone
        }
    };

    let res;
    try {
        res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    } catch (error) {
        throw createAdminRequestError('Network error. Check the connection and try again.', 'network_error', { cause: error });
    }

    const payloadResult = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw buildAdminRequestErrorFromResponse(res, payloadResult);
    }

    const saveMeta = {
        savedAt: payloadResult?.meta?.savedAt || new Date().toISOString(),
        dataVersion: payloadResult?.meta?.dataVersion || ''
    };

    try {
        const snapshot = await fetchAdminDataSnapshot();
        applyAdminServerData(snapshot.data);
        refreshUI();
        return {
            ok: true,
            meta: {
                savedAt: saveMeta.savedAt,
                dataVersion: snapshot.dataVersion || saveMeta.dataVersion || ''
            }
        };
    } catch (error) {
        throw createAdminRequestError(
            'Saved on the server, but the admin could not refresh the latest data. Reload to confirm the current state.',
            'refresh_after_save_failed',
            {
                cause: error,
                savedOnServer: true,
                savedAt: saveMeta.savedAt,
                dataVersion: saveMeta.dataVersion
            }
        );
    }
}

async function saveAndRefresh() {
    adminSaveRequested = true;

    if (adminSaveLoopPromise) {
        setAdminSaveState('saving', t('admin.save_state.saving_message', 'Saving changes to the server...'));
        return adminSaveLoopPromise;
    }

    adminSaveLoopPromise = (async () => {
        let saved = false;
        let latestSaveMeta = null;
        try {
            while (adminSaveRequested) {
                adminSaveRequested = false;
                setAdminSaveState(
                    'saving',
                    saved
                        ? t('admin.save_state.saving_more_message', 'Saving your latest changes...')
                        : t('admin.save_state.saving_message', 'Saving changes to the server...')
                );
                const result = await performAdminSaveRequest();
                saved = Boolean(result?.ok);
                if (result?.meta) {
                    latestSaveMeta = result.meta;
                }
            }

            if (saved) {
                setAdminSaveState(
                    'success',
                    t('admin.save_state.success_message', 'All current changes are saved on the server.'),
                    latestSaveMeta || {}
                );
            }
            return saved;
        } catch (e) {
            console.error('Save Error:', e);
            const failure = getAdminRequestFailureState(e);
            const message = failure.message || t('admin.save_state.error_message', 'Save failed.');
            setAdminSaveState(failure.type, message, {
                savedAt: e?.savedAt !== undefined ? e.savedAt : adminSaveState.savedAt,
                dataVersion: e?.dataVersion !== undefined ? e.dataVersion : adminSaveState.dataVersion
            });
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
        return `<tr><td>${media}</td><td><strong>${cat}</strong></td><td>${menu.filter(m => m.cat === cat).length} items</td><td><button class="action-btn" title="Edit category image" aria-label="Edit category image" onclick="editCat('${cat.replace(/'/g, "\\'")}', 'visual')">${ADMIN_ICON.image}</button><button class="action-btn" title="Edit category" aria-label="Edit category" onclick="editCat('${cat.replace(/'/g, "\\'")}', 'labels')">${ADMIN_ICON.edit}</button><button class="action-btn" title="Delete category" aria-label="Delete category" onclick="deleteCat('${cat.replace(/'/g, "\\'")}')">${ADMIN_ICON.trash}</button></td></tr>`;
    }).join('');
}
function editCat(cat, sectionId = null) {
    setMenuTranslationWarnings('category');
    currentMenuWorkspaceStep = 'categories';
    menuBuilderSelectedCategoryKey = cat;
    openMenuCrudModal('category', `Edit Category - ${window.getLocalizedCategoryName(cat, cat)}`);

    const editingKeyInput = document.getElementById('catEditingKey');
    if (editingKeyInput) editingKeyInput.value = cat;
    const catNameInput = document.getElementById('catName');
    if (catNameInput) catNameInput.value = cat;
    populateCategorySuperCategoryOptions(getAssignedSuperCategoryIdForCategory(cat));
    setCategoryImageDraftValue(categoryImages?.[cat] || '');
    const catImageUpload = document.getElementById('catImageUpload');
    if (catImageUpload) catImageUpload.value = '';
    setCategoryTranslationFields(cat);
    updateCategoryImagePreview();
    syncCategoryImageAiControls();
    refreshMenuCrudFormUx('catForm');
    if (sectionId && typeof window.activateMenuCrudSection === 'function') {
        setTimeout(() => window.activateMenuCrudSection('catForm', sectionId, false), 0);
    }
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
    const previousMenu = JSON.parse(JSON.stringify(menu));
    const previousCatEmojis = { ...catEmojis };
    const previousCategoryTranslations = JSON.parse(JSON.stringify(categoryTranslations || {}));
    const previousCategoryImages = { ...(categoryImages || {}) };
    const previousSuperCategories = Array.isArray(restaurantConfig.superCategories)
        ? JSON.parse(JSON.stringify(restaurantConfig.superCategories))
        : [];
    (restaurantConfig.superCategories || []).forEach((sc) => {
        if (Array.isArray(sc.cats)) {
            sc.cats = sc.cats.filter((entry) => entry !== cat);
        }
    });
    delete catEmojis[cat];
    delete categoryTranslations[cat];
    delete categoryImages[cat];
    window.categoryImages = categoryImages;
    const saved = await saveAndRefresh();
    if (saved) {
        showToast('Category removed.');
        return;
    }
    menu = previousMenu;
    catEmojis = previousCatEmojis;
    categoryTranslations = previousCategoryTranslations;
    categoryImages = previousCategoryImages;
    window.categoryImages = categoryImages;
    restaurantConfig.superCategories = previousSuperCategories;
    if (window.restaurantConfig) {
        window.restaurantConfig.superCategories = previousSuperCategories;
    }
    refreshUI();
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
    ['wifiSSID', 'wifiPassInput'].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.oninput = () => {
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
    const previousImages = Array.isArray(item.images) ? [...item.images] : [];
    const previousImg = item.img || '';

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
        const saved = await saveAndRefresh();
        if (saved) {
            renderModalImages();
            showToast(input.id === 'modalImgCapture' ? 'Photo added.' : 'Images added.');
        } else {
            item.images = previousImages;
            item.img = previousImg;
            renderModalImages();
        }
    } catch (err) {
        console.error('Modal upload failed:', err);
        item.images = previousImages;
        item.img = previousImg;
        const failure = getAdminRequestFailureState(err);
        setAdminSaveState(failure.type, failure.message);
        showToast(failure.message);
        renderModalImages();
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

async function deleteModalImage(index) {
    const item = menu.find(m => m.id == currentEditingId);
    if (!item || !item.images) return;

    const previousImages = [...item.images];
    const previousImg = item.img || '';
    item.images.splice(index, 1);

    // SYNC: Keep main img updated after deletion
    item.img = item.images.length > 0 ? item.images[0] : '';

    const saved = await saveAndRefresh();
    if (saved) {
        renderModalImages();
        showToast('Image removed.');
        return;
    }
    item.images = previousImages;
    item.img = previousImg;
    renderModalImages();
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
    const previousImages = Array.isArray(item.images) ? [...item.images] : [];
    const previousImg = item.img || '';

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
        if (!response.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }
        if (!data.ok || !data.url) {
            throw createAdminRequestError(data.error || 'AI image generation failed.', data.error || 'ai_image_generation_failed');
        }

        if (!item.images) item.images = item.img ? [item.img] : [];
        item.images = [data.url, ...item.images.filter((value) => value && value !== data.url)];
        item.img = item.images[0] || data.url;

        const saved = await saveAndRefresh();
        if (saved) {
            renderModalImages();
            showToast('AI image generated and added to the item.');
            return;
        }
        item.images = previousImages;
        item.img = previousImg;
        renderModalImages();
    } catch (error) {
        console.error('Menu item AI image generation error:', error);
        reflectAdminRequestFailure(error);
        item.images = previousImages;
        item.img = previousImg;
        renderModalImages();
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
    if (!categoryName) {
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
        if (!response.ok) {
            throw buildAdminRequestErrorFromResponse(response, data);
        }
        if (!data.ok || !data.url) {
            throw createAdminRequestError(data.error || 'AI category image generation failed.', data.error || 'ai_category_image_generation_failed');
        }

        setCategoryImageDraftValue(data.url);
        updateCategoryImagePreview();
        showToast('AI image generated for the category.');
    } catch (error) {
        console.error('Category AI image generation error:', error);
        reflectAdminRequestFailure(error);
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


// ═══════════════════════ HOURS MANAGEMENT ═══════════════════════
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
            const previousHours = cloneAdminDraft(restaurantConfig._hours || []);
            const previousHoursNote = restaurantConfig._hoursNote || '';
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
                restaurantConfig._hours = previousHours || [];
                restaurantConfig._hoursNote = previousHoursNote;
                if (window.restaurantConfig) {
                    window.restaurantConfig._hours = restaurantConfig._hours;
                    window.restaurantConfig._hoursNote = restaurantConfig._hoursNote;
                }
                setInfoSaveButtonState(saveButton, 'error');
            }
        };
    }

    renderInfoWorkspaceSummary();
}

// ═══════════════════════ GALLERY MANAGEMENT ═══════════════════════

function initGalleryForm() {
    const form = document.getElementById('galleryForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('galleryFileInput');
        if (!fileInput) return;

        if (!restaurantConfig.gallery) restaurantConfig.gallery = [];
        const previousGallery = Array.isArray(restaurantConfig.gallery) ? [...restaurantConfig.gallery] : [];
        const nextGallery = [...previousGallery];
        const saveButton = e.submitter || document.getElementById('brandingGallerySaveBtn');
        void saveButton;

        if (fileInput.files.length === 0) {
            showToast('Upload at least one image.');
            return;
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
                    const failure = getAdminRequestFailureState(err);
                    setAdminSaveState(failure.type, failure.message);
                    showToast(failure.message);
                    setGallerySaveButtonState('error');
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
            setGallerySaveButtonState('error');
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
