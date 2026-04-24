/**
 * CSS Cleanup Script – Removes unused CSS after Tailwind migration.
 *
 * Safety measures:
 * 1. Comprehensive safelist for ALL JS-injected, i18n, and RTL state classes.
 * 2. Backs up original CSS files to ./css-backup/ before overwriting.
 * 3. Logs exact size savings per file.
 * 4. Does NOT purge: style.css (relied on by admin panel / legacy paths),
 *    tailwind-out.css, game.css, event-modal.css (standalone features).
 */

'use strict';

const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');
const { glob } = require('node:fs/promises');

// ── 1. CSS files to clean ─────────────────────────────────────────────────────
const CSS_TARGETS = [
  'home-shell.css',
  'home-polish.css',
  'laruche.css',
  'menu-shell.css',
  'menu-page.css',
];

// ── 2. Content source files (explicit list – use relative paths from cwd) ────
const getAllContentFiles = () => {
  const extensions = ['.html', '.js'];
  const files = [];
  for (const file of fs.readdirSync('.')) {
    const ext = path.extname(file);
    if (extensions.includes(ext)) {
      files.push(file);
    }
  }
  return files;
};

// ── 3. Safelist – every class applied dynamically or by i18n must be here ───
const SAFELIST = {
  standard: [
    // JS-toggled modal / overlay states
    'open',
    'visible',
    'hidden',
    // General interactive states
    'active',
    'active-link',
    'active-lang',
    'scrolled',
    // Mobile nav toggle states
    'mobile-open',
    'is-open',
    'home-header-scrolled',
    // Utility / actionability flags
    'is-disabled',
    'is-actionable',
    'is-empty',
    'is-previewable',
    'is-landing',
    // Social modal variants
    'is-social',
    'is-gallery',
    // Form / card states
    'is-notice',
    'is-danger',
    'is-invalid',
    'is-warning',
    'is-saving',
    'is-saved',
    'is-error',
    // Hero / slider states
    'slide-active',
    'dot-active',
    // Toast animation
    'show',
    // Menu JS-injected content classes
    'menu-reveal-observe',
    'dish-page-img-animate',
    'gallery-flip',
    // Injected by homepage-extras.js – renderPaymentFacilities
    'pf-icon-item',
    'pf-icon',
    'pf-label',
    // Injected by homepage-extras.js – renderGallery
    'gallery-item',
    // Injected by homepage-extras.js – renderHours
    'hours-row',
    'highlight-row',
    'hours-day',
    'hours-dash',
    'hours-time',
    // Injected by homepage-extras.js – renderSocialLinks
    'social-link-item',
    'instagram',
    'facebook',
    'tiktok',
    'whatsapp',
    'footer-social-icon',
    'social-btn',
    // Empty state divs injected by homepage-extras.js
    'website-empty-state',
    // RTL document-level class
    'rtl',
    // Swiper carousel (if used by menu or gallery)
    'swiper',
    'swiper-wrapper',
    'swiper-slide',
    'swiper-pagination',
    'swiper-button-next',
    'swiper-button-prev',
    'swiper-initialized',
    'swiper-horizontal',
    'swiper-vertical',
    // Menu JS components
    'super-sheet-close',
    'super-sheet-title',
    'overlay',
    'super-cat-sheet',
  ],
  deep: [
    // Keep any selector containing these patterns
    /^swiper-/,
    /^lang-/,
    /^status-/,
    /^menu-reveal/,
    /^toast/,
    /^modal/,
    /^cart-/,
    /^history-/,
    /^featured-/,
    /^super-cat/,
    /^nav-breadcrumb/,
    /^dish-/,
    /^ticket-/,
    /^lightbox/,
    /^game-/,
    /^social-icon/,
    /^info-row/,
    /^social-links/,
    /^home-floating/,
    /^status-open/,
    /^status-closed/,
    /^dot-/,
    /^pf-/,
    /^hours-/,
    /^gallery-/,
    /^side-/,
    /^footer-/,
    /^landing-/,
    /^section-/,
    /^utility-/,
    /^view-menu/,
    /^about-/,
    /^event-/,
    /^contact-/,
    /^wifi-/,
    /^social-/,
    /^slide-/,
    /^hero-/,
    /^info-/,
    /^menu-nav/,
    /^menu-content/,
    /^cat-nav/,
    /^mobile-/,
    /^nav-icon/,
    /^nav-cart/,
    /^nav-back/,
    /^top-nav/,
  ],
  keyframes: true,  // Never remove @keyframes
  variables: true,  // Never remove CSS custom properties
};

// ── 4. Backup + Run ───────────────────────────────────────────────────────────
const BACKUP_DIR = path.join(__dirname, 'css-backup');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  console.log('\n🧹 CSS Cleanup – Purging unused rules after Tailwind migration\n');
  console.log('='.repeat(64));

  const contentFiles = getAllContentFiles();
  console.log(`  📂  Scanning ${contentFiles.length} source files for used selectors…\n`);

  let totalSavedBytes = 0;

  for (const cssFile of CSS_TARGETS) {
    const cssPath = path.join(__dirname, cssFile);
    if (!fs.existsSync(cssPath)) {
      console.warn(`  ⚠️  ${cssFile} not found – skipping.`);
      continue;
    }

    const originalSize = fs.statSync(cssPath).size;

    // Back up original
    fs.copyFileSync(cssPath, path.join(BACKUP_DIR, cssFile));

    let results;
    try {
      results = await new PurgeCSS().purge({
        content: contentFiles.map(f => ({ raw: fs.readFileSync(f, 'utf8'), extension: path.extname(f).replace('.', '') })),
        css: [cssFile],   // relative path so PurgeCSS resolves from cwd
        safelist: SAFELIST,
      });
    } catch (err) {
      console.error(`  ❌  ${cssFile} – Error: ${err.message}`);
      continue;
    }

    if (!results || results.length === 0 || typeof results[0].css !== 'string') {
      console.error(`  ❌  ${cssFile} – PurgeCSS returned no result. Keeping original.`);
      continue;
    }

    const purgedCss = results[0].css;
    const newSize = Buffer.byteLength(purgedCss, 'utf8');
    const savedBytes = originalSize - newSize;
    const pct = Math.round(100 - (newSize / originalSize * 100));

    fs.writeFileSync(cssPath, purgedCss, 'utf8');

    const bar = pct > 0 ? `▓`.repeat(Math.floor(pct / 5)) : '░';
    console.log(`  ✅  ${cssFile.padEnd(22)} ${kb(originalSize).padStart(8)} → ${kb(newSize).padStart(8)}  (-${pct}%) ${bar}`);
    totalSavedBytes += savedBytes;
  }

  console.log('\n' + '='.repeat(64));
  console.log(`\n  💾  Total CSS saved: ${kb(totalSavedBytes)}`);
  console.log(`  📁  Originals backed up to: ./css-backup/\n`);
  console.log('  🔒  style.css       — intentionally kept intact (admin panel uses it)');
  console.log('  🔒  tailwind-out.css — not touched (managed by tailwind build)');
  console.log('  🔒  game.css        — not touched (standalone feature)');
  console.log('  🔒  event-modal.css  — not touched (standalone feature)\n');
  console.log('  ✔️   Complete. Run "npm start" and verify all pages visually.\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message || err);
  process.exit(1);
});
