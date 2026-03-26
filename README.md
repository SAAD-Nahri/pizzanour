# White-Label Restaurant Website

This repo is no longer just a single demo restaurant site.

It is now a seller-oriented white-label restaurant website template with:

- a public website
- a public menu and ordering flow
- a protected admin panel
- multilingual content support for French / English / Arabic
- admin shell i18n for login, seller tools, readiness, and security surfaces
- admin form i18n for the main menu/category/branding/landing configuration surfaces
- branding, hero, and media management
- support for multiple homepage hero slide images
- preset-aware branding controls for colors, surfaces, text, and menu mood
- a branding preview that mirrors homepage/menu mood more closely during setup
- preset-specific public styling so each main preset feels more distinct on homepage and menu
- a seller-only AI Import Studio that turns uploaded menu PDFs or menu images into a reviewable menu draft with staged source extraction and chunked structuring for larger menus
- section visibility and ordering controls
- quick-launch presets for new restaurants
- a local menu-image suggestion library for missing dish visuals
- backup export / import for cloning and recovery
- smoke checks for safer deployment work

The current goal is to turn this into a dependable first sellable product that can be reused for many restaurants with minimal code changes.

## Docs Map

- [PRODUCTIZATION_ROADMAP.md](./PRODUCTIZATION_ROADMAP.md): product direction, current status, next work slices
- [SELLER_HANDOFF_CHECKLIST.md](./SELLER_HANDOFF_CHECKLIST.md): operational workflow for cloning, configuring, reviewing, and delivering a restaurant instance
- [DEPLOYMENT.md](./DEPLOYMENT.md): Coolify deployment and validation workflow
- [coolify.env.example](./coolify.env.example): starter env values for configuring a new Coolify instance
- [coolify.matsco.env.example](./coolify.matsco.env.example): prepared Coolify env values for the `matsco.ibnbatoutaweb.com` deployment target
- [MEDIA_IMPORT_BASIS.md](./MEDIA_IMPORT_BASIS.md): future-facing basis for seller-side asset libraries, static media assignment, and PDF/image import
- [IMPORTER_PAYLOAD_SPEC.md](./IMPORTER_PAYLOAD_SPEC.md): implementable importer contract against the live restaurant schema
- [SELLER_IMAGE_PIPELINE.md](./SELLER_IMAGE_PIPELINE.md): seller-only image sourcing and generation workflow for hero, gallery, and product imagery
- [SELLER_BUNDLE_PIPELINE.md](./SELLER_BUNDLE_PIPELINE.md): staged seller-only job flow for turning menu source files into a reviewable restaurant setup bundle
- [LOCAL_IMAGE_LIBRARY_PLAN.md](./LOCAL_IMAGE_LIBRARY_PLAN.md): deeper architecture plan for deterministic local asset reuse and controlled AI generation

## Current Product Status

Already working in the codebase:

- server-backed restaurant branding
- server-backed homepage and menu configuration
- admin uploads for logo and hero assets
- admin-managed multi-slide homepage hero media
- preset selection and deeper theme-token editing in the branding form
- neutral starter defaults for branding, WiFi, and seed content
- per-item FR / EN / AR translations for menu items
- section visibility controls
- section ordering controls
- JSON backup export / import
- quick-launch presets
- persisted preset-aware theme tokens for public branding
- local menu-image suggestion rules, confidence-aware matching, and managed placeholder assets
- a starter restaurant seed with managed dish visuals and a managed gallery set, so first-launch demos do not open completely empty
- shared slot-level media audit for branding, gallery, promo, featured, and menu imagery
- stronger homepage/menu spacing and motion polish on the public-facing experience
- rerender-safe staged motion on the menu landing, promo, featured, category, and item flows instead of one-shot paint-only animation
- hashed admin credentials with throttling and security status
- safer public handling for broken URLs and missing images
- seller-side AI menu import drafts from uploaded menu PDFs or menu images
- importer apply scopes so menu data can be applied without touching branding or public-site identity
- local seller job folders that preserve importer inputs and draft artifacts for review/retry
- local seller-side media-library catalog foundation for reusable hero, gallery, and future product assets

Still not finished:

- launch-quality media/content pass for the first sellable package
- PDF ingestion for the seller importer
- stronger schema enforcement and review UX for the seller importer
- internal launcher / AI onboarding tooling
- stronger preset/theme system for different restaurant categories

## Project Structure

- `website-server.js`: serves the public site and public APIs
- `admin-server.js`: serves the admin UI and protected admin APIs
- `site-store.js`: shared storage, normalization, and persistence rules
- `server-common.js`: shared auth/session helpers
- `index.html`: homepage
- `menu.html`: menu / ordering / landing flow
- `admin.html`: admin UI
- `app.js`: homepage behavior
- `menu.js`: menu / ordering / gallery / game behavior
- `admin.js`: admin behavior
- `shared.js`: shared defaults, i18n helpers, browser-state helpers
- `data.json`: persisted restaurant data
- `uploads/`: uploaded assets
- `media-library/`: seller-side reusable asset catalog and reusable media store
- `seller-jobs/`: seller-side job workspace for importer and future bundle-generation runs
- `scripts/smoke-check.js`: lightweight end-to-end sanity test
- `scripts/media-library-check.js`: validates the local seller media catalog structure and prints counts

## Local Development

Install dependencies:

```bash
npm ci
```

Run the public website:

```bash
npm run start:website
```

Run the admin:

```bash
ADMIN_USER=admin ADMIN_PASS=change-me-now npm run start:admin
```

Default local URLs:

- website: `http://localhost:3002`
- admin: `http://localhost:3102/admin`

## Validation Commands

Run these before deployment or handoff:

```bash
npm run check
npm run smoke
npm run media:check
npm run predeploy
```

What they do:

- `npm run check`: syntax-checks the main server and frontend entry files
- `npm run smoke`: boots the public and admin servers on test ports and checks key public/admin routes
- `npm run media:check`: ensures the local seller media catalog exists and prints asset counts
- `npm run predeploy`: runs the full local deploy gate before pushing to Coolify

## Security Notes

- Admin auth is server-side and cookie-based.
- Credentials should be changed before delivery.
- The app supports hashed password storage and login throttling.
- With the recommended deployment config, admin credential changes are persisted in `/app/data/auth.json`.
- Once a restaurant changes credentials from the Security tab, that stored auth file takes precedence over the original `ADMIN_USER` / `ADMIN_PASS` environment values.
- The admin security panel should not show the default-credentials warning at handoff time.
- Keep AI keys and future automation credentials out of the live restaurant admin.
- If you want to use `Seller Tools -> AI Import Studio`, set `OPENAI_API_KEY` server-side and optionally `OPENAI_IMPORT_MODEL`; for PDF-heavy workflows, also set `OPENAI_IMPORT_PDF_MODEL`.
- If you want to use per-item AI dish image generation inside the item image modal, set `OPENAI_API_KEY` server-side and optionally configure `OPENAI_ITEM_MEDIA_MODEL` and `OPENAI_ITEM_MEDIA_QUALITY`.

## Data And Product Model

This product is currently best treated as:

- one deployable restaurant instance per client
- one shared codebase
- one normalized restaurant data shape

That data shape already covers:

- brand identity
- homepage copy
- contact data
- hours
- payment / facilities
- social links
- gallery
- promotions
- menu items with translations

The future importer and launcher should write into that same normalized shape instead of creating a separate format.

Current importer status:

- PDF and image menu input work through `Seller Tools -> AI Import Studio`
- the importer UI only asks for menu files now; it uses the current restaurant identity already stored in admin instead of requesting extra branding inputs
- the importer is menu-scoped: it extracts dishes, prices, categories, super-categories, and FR / EN / AR translations without overwriting branding or landing identity
- extraction is now staged: uploaded menu assets are first turned into page-level menu source text, then the structured draft is built from that extracted text, with the older direct multimodal path kept as fallback
- the server generates a review draft against the live restaurant schema
- the draft must be reviewed and explicitly applied
- the other seller-only setup cards were removed from the visible admin interface so this internal flow stays focused on menu import

Current seller-side media status:

- per-item AI image generation can create dish/drink visuals directly from the item image modal
- low-cost default:
  - `OPENAI_ITEM_MEDIA_MODEL=gpt-image-1-mini`
  - `OPENAI_ITEM_MEDIA_QUALITY=low`
- generated images are saved locally under `/uploads`
- the recommended product-image path is still client photos first, local library second, AI later

## Recommended Working Mode

For now, the strongest delivery model is:

1. prepare a restaurant instance yourself
2. use presets, uploads, admin tools, and backups to speed up setup
3. deliver the finished site plus admin access
4. let the restaurant use admin for small edits only

Do not put raw AI onboarding or OpenAI credentials directly into the live client admin.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the deploy-safe Coolify flow.

## Handoff

See [SELLER_HANDOFF_CHECKLIST.md](./SELLER_HANDOFF_CHECKLIST.md) before cloning or delivering a restaurant instance.
