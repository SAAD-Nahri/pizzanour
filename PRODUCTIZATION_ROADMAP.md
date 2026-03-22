# Productization Roadmap

This file is the working plan for turning this project from a single restaurant demo into a professional white-label product that can be sold repeatedly to many restaurants.

The project is already live on Coolify, so every iteration should be deploy-safe, reversible, and validated before rollout.

## Current Audit

### Latest Progress

- The menu builder is being converted from always-open forms into a drill-down owner flow: the admin now starts from a super-category table, drills into categories, then drills into items, with add/edit forms opening in a modal instead of filling the whole page
- The drill-down item table now keeps the core product controls visible instead of hiding them behind the old legacy list: likes remain visible as a signal, promo and featured toggles stay inline, and image management stays in the item actions column
- The new menu builder modals are being trimmed down for owner use: translations and advanced/media fields now sit behind disclosure panels, the primary form actions are reduced to save/cancel, and the old owner-facing `Reset All Data` action is no longer exposed inside the item editor
- The owner-facing admin is being collapsed into three top-level areas instead of a spread of separate pages: `Menu`, `Info`, and `Branding`. The menu builder now stages super-categories, categories, and items inside one workspace, while hours, WiFi, contact/access, and gallery are being regrouped under simpler owner flows
- The `Info` and `Branding` areas are being reduced to common owner tasks first: contact basics stay visible, while social links, homepage layout/copy, extended theme colors, and extra hero media now sit behind disclosure panels instead of filling the page by default
- The owner-facing admin now treats low-frequency panels as opt-in surfaces instead of always-open forms: hours, WiFi, admin access, and gallery sit inside collapsible cards, and the new owner flow no longer keeps the old hidden menu/category/product tables refreshed in the background
- Branding save now accepts bundled local asset paths like `images/...` in addition to absolute URLs and `/uploads/...`, so saving a new logo no longer fails just because the current hero image still points at a packaged default asset
- The public menu no longer polls `/api/data` every 15 seconds: it now syncs once on load and only refreshes on tab resume/focus with a cooldown, which removes the constant background fetch noise from the live customer-facing page
- The public history modal no longer crashes on open: `renderHistory()` now keeps the shared `t()` translation helper intact instead of shadowing it with a loop variable, so the history delete title/button can render without throwing `TypeError: t is not a function`
- The public menu runtime is now safer for imported data: item interactions use string-safe ids instead of assuming numeric ids, so imported dishes can open detail/add-to-cart correctly, and background `/api/data` sync now retries hydration safely while polling less aggressively instead of hammering the server every 2 seconds
- The public menu now self-heals when saved super-categories are stale or incomplete: it derives effective runtime super-category cards from the actual live menu categories, so imports/reset states cannot leave the first menu sheet pointing at dead default groups that no longer match the current dishes
- The seller importer now does stronger deterministic cleanup before review/apply: OCR/mojibake text is normalized, inline name/description text is split more safely, missing prices are recovered from extracted menu text when possible, duplicate menu items are collapsed, duplicate ids are rebuilt, fallback super-categories are generated to keep the public menu navigable, and the review gate now blocks apply on duplicate ids, orphan super-category refs, duplicate item names inside a category, and weak fallback-only translations
- The seller importer is now being tightened into a menu-scoped workflow instead of a broad website generator: the review UI now highlights extraction quality and apply scopes, and the apply path is being limited to menu items plus optional category structure so branding, landing copy, gallery, and site identity stay under explicit manual control
- The admin is being simplified toward launch-ready client use: seller-only tools are now behind server capabilities, AI media can be disabled independently, and the client-facing configuration path is being consolidated under a single `Parameters` entry instead of scattering identity settings across multiple top-level nav items
- Public/admin deployment verification is stronger now: both services expose a build fingerprint in `/health` and `/build.json`, and HTML/JS/CSS responses are sent with no-store headers so stale public assets are easier to detect and less likely to stick after redeploy
- The seller-only importer now accepts menu PDFs as well as menu images, persists each run into a local `seller-jobs/` workspace, and can prefill imported menu items with approved local-library product images before seller apply
- The seller-side local media-library foundation now exists: generated hero/gallery images are registered into a reusable local catalog under `media-library/`, and applying one in `AI Media Studio` marks that asset approved for future reuse instead of leaving it only in `/uploads`
- A new `LOCAL_IMAGE_LIBRARY_PLAN.md` now captures the concrete architecture for deterministic local asset reuse, recipe-key matching, approval states, and controlled AI generation so future contributors can continue the image-library path without re-deciding the model
- A new `SELLER_BUNDLE_PIPELINE.md` now defines the correct multi-stage seller workflow: intake, extraction, normalization, brand pack, product-image resolution, review gate, apply, and library reuse
- A seller-only `AI Media Studio` now exists for hero and generic gallery visuals: it uses the current restaurant branding plus optional uploaded references, generates an image server-side, stores it locally under `/uploads`, and can apply it directly to the hero or gallery flow
- The importer quality layer is stronger now too: after the initial draft, the server preserves uploaded logo/venue media as homepage/gallery fallback, runs a second translation-completion pass for menu/category/super-category text, and the apply step auto-assigns managed menu placeholders when imported items still have no images
- The first seller-only AI importer slice is now hardened against malformed model output: `AI Import Studio` uses the Responses API with a strict JSON schema, normalizes imported categories back into the live runtime shape, and logs the raw model text when a parse failure still occurs
- The first seller-only AI importer slice now exists in `Seller Tools` as `AI Import Studio`: menu images plus optional logo/venue photos can be uploaded, sent to OpenAI server-side, turned into a reviewable schema draft, copied as JSON, and applied only after explicit seller confirmation
- The admin shell now has a real FR / EN / AR translation foundation for login, sidebar navigation, seller tools, launch-readiness copy, handoff-summary labels, security messaging, and quick-launch/security form labels, so the i18n system no longer stops at public pages and menu data
- The admin form layer now also covers the main menu-item, category, WiFi, stats, branding, and landing configuration labels and placeholders in FR / EN / AR, which removes another large batch of seller-facing hardcoded frontend text
- Public menu wrappers have been tightened further too: the super-menu selection sheet and the remaining visible game helper headings are now on translation keys instead of fixed page text, keeping the frontend focus on user-facing I18 clean-up
- The public menu shell has been tightened further too: the Who Pays logo words are now translated, and the landing phone/hours starter markup no longer flashes fake demo values before runtime restaurant data loads
- The public menu shell now also localizes its first-paint title surfaces better: the hero fallback title is on `nav_menu`, and the browser tab title for menu pages now uses the active language instead of a fixed `Menu | ...` string
- The generated menu UI has been tightened further too: the featured header now renders from translation keys at generation time, and the add-to-cart toast now uses the shared translation layer instead of a fixed French message
- Category and super-category editing is clearer too: the admin now labels the top fields as fallback/internal values instead of a second visible source of truth, and super-category FR fields are prefilled from fallback data when older records do not yet carry explicit translations
- Category and super-category management is also safer now: categories have a real edit path in the table, and super-category edits keep a stable internal id so renaming a row updates it instead of silently creating a duplicate
- Menu translation fallback is stronger now too: starter super-categories ship with explicit FR / EN / AR names and descriptions, and category/super-category lookup now tolerates older key mismatches so public menu labels stop falling back to French unnecessarily
- Public frontend i18n has been tightened further: remaining visible hardcoded labels/placeholders in the homepage, menu landing, game modal, cart drawer, history, ticket flow, event booking flow, social modals, and WhatsApp/order prompts have been moved into the shared FR / EN / AR translation layer or cleared from static HTML when those fields are runtime-driven
- Categories and super-categories now have the same FR / EN / AR translation foundation as menu items, including shared runtime helpers, server sanitization, admin form fields, and public menu rendering for localized names
- Starter runtime/contact defaults are now safer for live preview: fake phone/address/WiFi values have been removed from the shared seed and fallback storage, the homepage now falls back to empty-state behavior instead of leaking false public details, and the directions CTA uses a proper disabled class instead of inline state styling
- The admin seller flow is a bit tighter too: the branding preview no longer falls back to `Maison`, quick-launch now correctly returns to `Seller Tools`, and the floating save action now reads `Publish Changes` to better match the actual delivery workflow
- The preset/theme system now persists a real `presetId` plus additional theme tokens for public surfaces, text, and menu atmosphere instead of relying on only three colors
- The dead legacy demo seed has been removed from `shared.js`, so the repo now matches the active white-label runtime instead of carrying a large commented historical block
- The product now includes a first internal menu-image library with local tagged SVG placeholders plus a Data Tools action to assign missing item images quickly before client photos or future AI generation
- The menu-image library now covers more seller-relevant buckets such as grill, seafood, and bakery, and the Data Tools suggestion run reports confidence levels so placeholder assignments are easier to review
- The shared runtime now exposes a slot-level media audit for branding, gallery, promo, featured, and menu imagery, and the handoff summary includes those slot states so future importer work has explicit targets
- The importer foundation now includes a concrete `IMPORTER_PAYLOAD_SPEC.md` contract that maps directly to the live save payload plus separate seller-only review metadata
- Media slot policy is now explicit too: logo and primary hero must be truly ready before delivery, missing item images still block handoff, and gallery/promo/featured/extra-slide gaps are treated as warnings instead of hard blockers
- The admin launch-readiness card now surfaces media blockers and warnings directly in the dashboard, so delivery risk is visible before generating the handoff summary
- The media rows in the launch-readiness card now include direct section actions, so a seller can jump straight to Branding, Menu, or Gallery from a blocker instead of hunting through the sidebar
- The launch-readiness card now also shows compact media counts for blockers, warnings, managed slots, and missing/partial coverage, which makes delivery status faster to scan
- The core readiness rows now include direct actions too, so contact data, hours, menu, gallery, branding, and security issues can all be opened from the audit itself
- The public design now has a stronger polish layer too: homepage sections have better rhythm and reveal motion, and the menu shell/cards/promos have improved spacing and gentler staged motion
- The latest public refinement pass tightened homepage spacing further and moved the menu landing/navigation/item motion to a rerender-safe observer pattern, so staged reveals still work after dynamic menu/category refreshes
- The admin seller surfaces now have a cleaner desktop pass too: `Seller Tools` has stronger hierarchy, `Admin Security` now uses the shared card system instead of one-off inline layout, the floating admin actions are cleaner, and the stray broken helper text/legacy security path have been removed
- The starter restaurant now ships with managed dish visuals, a managed gallery set, and a less burger-specific `Signatures` category, so first-launch demos look more complete while the audit still treats those assets as non-final placeholders
- The deployment workflow now has a concrete Coolify configure-and-deploy path, including a shared env template and a single `npm run predeploy` gate before pushing live changes
- The repo is now also prepared for a separate product deployment target, with a dedicated `matsco.ibnbatoutaweb.com` Coolify env template using 4xxx ports so live QA can happen in an isolated project
- The admin boot path no longer collides with `shared.js` on section-order constants, which fixes the live `Identifier 'SECTION_ORDER_KEYS' has already been declared` error on the admin page
- Presets are now first-class in the branding flow: the admin can review and save a real preset choice plus the deeper surface/text/menu theme tokens instead of only three colors
- The homepage hero slider now follows the selected preset and brand hero media instead of shipping only fixed static slide images, which makes the public shell align better with the saved branding state
- The branding preview now includes a homepage hero mock and a menu-shell mock, which makes preset/theme decisions easier to review against something closer to the real public experience
- Branding media now supports multiple homepage hero slides through the server-backed branding model, admin form, and homepage slider, which makes final client delivery less dependent on one single cover image
- Presets now also have distinct public styling on homepage and menu surfaces, so `fast_food`, `cafe`, and `traditional` no longer feel like the same template with only different color values
- Starter naming and onboarding defaults are now more seller-safe, with `Maison / Assiette signature` starter content, neutral admin examples, and cleaner WiFi defaults instead of internal/demo wording
- New local white-label hero assets now replace the old hardcoded/default stock mix on the homepage and menu landing, which makes first-launch media feel more intentional even before client assets are added
- The active starter menu seed is less tied to sandwich/burger framing, with a more neutral `Maison / Assiette signature` structure for first-launch demos and resets
- Internal operational naming is less tied to the old Foody product, with package/runtime/session/compose labels now reading like a reusable restaurant seller base
- A new `MEDIA_IMPORT_BASIS.md` file now documents the future asset-library and PDF/image importer direction against the existing live schema, so future automation work has a concrete starting point
- Admin credential storage now follows the Docker data volume model, with `AUTH_FILE` pointing to persisted storage so Security-tab password changes survive redeploys instead of living only in the container filesystem
- Repo documentation has been refreshed so the README, deployment guide, seller handoff checklist, and roadmap now describe the current white-label product state instead of the older Foody-only framing
- Homepage gallery/social/contact fallbacks are now more intentional, with reusable empty-state UI and cleaner actionable-card behavior when restaurant setup data is incomplete
- Menu landing info rows now degrade more gracefully too, with translated fallback text and cleaner actionable/empty states for missing address, phone, WiFi, or social data
- Admin now includes a launch-readiness audit inside Data Tools, which gives a faster go/no-go review for branding, contact data, menu completeness, media coverage, translations, and security before handoff
- Admin Data Tools now also generates a handoff summary from the current instance, which reduces manual seller prep before delivery or internal review
- The handoff summary can now also be downloaded as a text file and includes inferred website/admin URLs plus the current admin username for faster delivery prep
- Shared brand defaults are now more neutral and less tied to the original demo identity
- Public WhatsApp, social, gallery, and WiFi fallbacks are more resilient when a restaurant has incomplete setup data
- Menu landing page labels now use the shared i18n system for better French / English / Arabic delivery
- Admin title branding is now driven by restaurant branding instead of a fixed demo label
- Homepage copy now has a server-backed multilingual override path that can be edited from admin and later filled by AI
- Menu items now have a real admin-editable translation path for French / English / Arabic, backed by a normalized server schema
- Browser fallback data and bundled reset data now point to a smaller neutral multilingual starter pack instead of one restaurant concept
- Branding admin now supports direct logo and hero uploads plus a live preview before publish
- Landing and branding forms now include safer validation for core URLs, phone numbers, and uploaded asset paths
- Neutral starter menu content is less tied to burger naming, which makes the first demo safer for a wider range of restaurants
- Payment and facilities are now handled as configurable informational website data, including simple restaurant-facing options like Cash and TPE
- Footer copy is now editable through the multilingual content system, and homepage sections can be turned on or off per restaurant
- Homepage section order is now configurable from admin, and a few public empty states are cleaner when optional data is intentionally left blank
- The admin now supports JSON backup export and import, which is a much better base for cloning, restoring, and moving restaurant setups
- The admin now includes quick launch presets for fast food, cafe, and traditional restaurants so a new client can start from a stronger first-pass setup
- Public homepage and menu links now validate external URLs and phone actions more safely, and broken public images degrade more gracefully instead of leaving dead UI blocks
- The repo now has a lightweight smoke-check script that boots both servers and verifies key public and admin endpoints before deployment
- Admin security now uses hashed credential storage, login throttling, session invalidation after credential changes, and a clearer security status panel for handoff checks
- The admin now has a visible save-state banner so sellers can see whether the current instance is idle, saving, saved, or blocked by an error
- A dedicated seller handoff checklist now documents the cloning, setup, validation, and delivery workflow for future contributors
- The admin shell no longer depends on one hardcoded live website URL at runtime, and the shared starter-data file now clearly documents which dataset is actually active for white-label use
- The admin save logic no longer relies on shadowed duplicate function definitions, which makes the codebase safer to continue refactoring
- The old demo starter block in `shared.js` has now been removed entirely, leaving the white-label starter seed as the only default path in both runtime behavior and the repo itself
- Default branding labels and the quick-service onboarding preset are now more neutral, so the first delivered setup is less tied to burger-only positioning before client customization
- Browser storage is now wrapped in shared helper functions so only explicit user-state data stays in local storage: language, likes, cart, order history, and the admin category filter
- Shared public theme tokens now include clearer surfaces, shadows, radii, and menu palette values, and the public language dropdown styling has been moved out of page-level `<style>` blocks into the main stylesheet
- The menu WiFi and social modals now use reusable shared CSS classes instead of large inline style blocks inside `menu.js`, which keeps the design system easier to extend
- The menu cart drawer now uses reusable CSS classes for its header, line items, service choices, delivery field, and order summary instead of carrying most of that presentation inline in JavaScript
- The history overlay and ticket sheet now rely much more on reusable CSS classes instead of inline styling, which makes the order flow easier to restyle and safer to keep refining
- The admin save-state banner and category-filter count badges now use reusable admin CSS classes instead of inline styling inside `admin.js`, which keeps the dashboard UI easier to maintain
- The admin sidebar save/logout controls now use reusable CSS classes instead of hardcoded inline button styling, which is another step toward a cleaner seller-facing design system
- The main admin menu-item form now uses reusable classes for its two-column layout, checkbox rows, multi-price panel, helper note, file-input spacing, and reset button styling instead of inline layout fragments
- The admin hours editor now uses reusable grid and checkbox classes for its repeated day rows instead of duplicating the same inline layout styles across the whole section
- The landing copy grid and super-category editor now use reusable admin panel/layout classes instead of one-off inline wrappers, which keeps more of the content-management UI aligned with the shared admin styling direction
- The landing settings subsections, copy-language helper chips, and gallery form/grid now rely more on reusable admin classes instead of repeated inline spacing and panel styles
- The data-tools/onboarding area now also uses shared muted-copy and auto-width button classes instead of repeating those inline styles across quick-launch and backup actions
- Shared admin cards and CTA buttons now have a more deliberate polished treatment, with consistent gradients, shadows, hover lift, and border behavior across translation, branding, landing, and data-tool panels
- The public homepage CTA system is now more polished too: the main order, hero, directions, and side-menu buttons have a more consistent premium treatment with rounded shapes, softer borders, and stronger lift/shadow behavior
- Public section headers and key homepage info cards now have a more premium treatment too, with stronger header chips, richer divider lines, and more deliberate card depth/hover behavior across about, events, hours, and contact blocks

### What already exists

- Public homepage
- Public menu / ordering flow
- Admin panel
- File uploads
- Docker / Coolify deployment setup
- Shared persisted data through the server

### Main product gaps discovered so far

- Brand identity is still partly hardcoded across the public pages and menu
- Public pages still mix server data with browser-only `localStorage` fallbacks
- Design tokens are not yet managed as a true white-label system
- Admin can edit content, but not enough of the brand/theme system
- CSS and UI styling are spread across large files plus many inline styles
- Social/profile fields are inconsistent across storage and frontend rendering
- The product is still structured like one restaurant site, not a reusable SaaS-like template
- The importer is only partially implemented yet: image inputs work, but PDF parsing and stricter structured-output validation are still missing

## Working Rules For Each Iteration

Every work cycle should follow this order:

1. Analyze the affected flow before editing
2. Implement one vertical slice that improves the reusable product foundation
3. Validate locally with syntax checks and quick behavior checks
4. Keep the live deployment in mind and avoid risky unrelated rewrites
5. Update this roadmap when we discover new blockers or priorities

## Execution Priority

The priority is not "build everything."

The priority is:

1. Make this current website robust enough to sell and deliver confidently
2. Make this current website easy to customize without touching code
3. Create a repeatable internal setup workflow for the next restaurant
4. Only then expand into more templates, automation, and AI onboarding

This means we should not spend too much time polishing secondary templates too early.

We should first finish one strong, dependable product.

## Current Goal

Deliver one professional restaurant website template that is:

- stable
- configurable
- fast to onboard
- easy for you to deliver
- simple for the restaurant to edit after handoff

If a task does not directly improve those goals, it should usually wait.

## Phase 1: White-Label Foundation

- [x] Add server-backed branding data model
- [x] Add admin form for core brand settings
- [x] Make public pages read server-backed branding data
- [x] Start replacing hardcoded identity with configurable values
- [ ] Remove remaining hardcoded brand strings from homepage, menu, and admin
- [x] Replace remaining browser-only config dependencies with server-backed state
- [ ] Centralize design tokens for colors, imagery, typography, spacing, and buttons
- [x] Add brand preview behavior inside admin

## Phase 2: Professional Design System

- [ ] Define reusable theme tokens: primary, secondary, accent, surfaces, text, borders, shadows
- [ ] Refactor repeated inline styles into reusable CSS classes/components
- [ ] Break the giant stylesheet into clearer sections or modular files
- [ ] Create 2-3 sellable visual presets:
- [ ] Fast food / street food
- [ ] Cafe / brunch
- [ ] Traditional / family restaurant
- [ ] Standardize buttons, cards, banners, section headers, nav, badges, and modals
- [ ] Improve desktop polish so the site feels premium beyond mobile-only usage
- [ ] Improve image treatment so hero, logo, gallery, and dish media feel consistent

## Phase 3: Content System

- [x] Make homepage content blocks configurable from admin
- [x] Hero section content
- [x] About section content
- [x] Events / services section
- [x] Add a per-item multilingual menu translation layer for FR / EN / AR
- [x] Add multilingual category and super-category naming support for FR / EN / AR
- [x] Payment / facilities section
- [x] Footer content
- [x] Make section visibility toggleable per restaurant
- [x] Add better empty states when a section has no data
- [x] Add copy and starter menu defaults that are neutral and reusable across many restaurant types
- [ ] Stop relying on opinionated starter wording in the default public experience

## Phase 4: Seller-Ready Admin Experience

- [ ] Add a dedicated "Brand & Website" workspace in admin
- [x] Add image upload support for logo and cover images
- [x] Add content preview before publish
- [x] Add clearer success/error states after saves
- [x] Add safe validation for links, phone numbers, and colors
- [x] Add section ordering controls
- [x] Add onboarding defaults for creating a new restaurant quickly

## Phase 5: Product Robustness

- [x] Remove legacy `localStorage` dependence for site configuration
- [ ] Normalize all server data shapes
- [x] Add better sanitization for extended config fields
- [x] Add automated smoke checks for key entry files
- [x] Add safer handling for missing images and broken URLs
- [x] Improve session/auth handling further for production use
- [x] Add backups/export-import for restaurant data

## Phase 6: Sales And Operations Readiness

- [ ] Define the exact product packages to sell
- [ ] Basic restaurant site
- [ ] Restaurant site + QR menu
- [ ] Restaurant site + admin updates package
- [ ] Decide onboarding workflow for a new client
- [ ] Decide what is customized manually vs through admin
- [x] Add documentation for cloning a new restaurant instance
- [x] Add branding/content checklist for onboarding a new restaurant
- [ ] Add analytics, lead tracking, and conversion hooks

## Recommended Delivery Model

The stronger system is not to give every restaurant an AI button in the live admin.

The better system is:

- A private internal launcher or onboarding tool used by you
- It prepares the restaurant website fast
- Then you deliver a near-finished website
- The restaurant admin only uses the normal admin for small edits later

This keeps quality high, costs predictable, and avoids exposing AI settings or API keys to clients.

## Recommended AI-Assisted Onboarding Flow

### Input collected from the client

- Restaurant name
- Domain / subdomain
- Logo
- Menu photos or PDF
- Restaurant photos if available
- Address
- Phone / WhatsApp
- Social links
- Working hours
- Restaurant type / style
- Preferred tone: premium, family, modern, fast-food, café, etc.

### Internal launcher workflow

1. Upload the client assets into a local or internal onboarding tool
2. Extract menu content from photos/PDF
3. Normalize it into structured JSON
4. Generate the restaurant brand settings
5. Generate homepage copy and section content
6. Choose or generate missing visuals
7. Create preview data package
8. Review manually
9. Publish to the target domain

### AI should generate

- Structured menu categories and items
- Cleaned dish names and descriptions
- French / English / Arabic website copy mapped into the shared translation override structure
- French / English / Arabic menu item names and descriptions mapped into a future per-item translation layer
- Suggested theme colors from the logo / photos
- Restaurant tagline
- About section draft
- Events/services draft
- SEO title and description
- Brand-ready homepage text

### AI should not be the default source for

- Every final dish image
- Business-critical facts without review
- Opening hours unless confirmed
- Pricing unless extracted clearly from the source menu

## Image Strategy Recommendation

Do not make "generate every dish image with AI" the default workflow.

Better order of priority:

1. Use the restaurant's real photos if available
2. Use a curated image library / stock set for generic placeholders
3. Use AI generation only for:
- missing hero images
- missing cover visuals
- a few featured dishes
- temporary launch placeholders

Why:

- Real restaurant photos build more trust
- Fully AI-generated dishes can look beautiful but inaccurate
- Generating every dish image increases cost and review time
- Many restaurants only need 3-8 strong visuals, not 80 product photos on day one

## Tooling Direction I Recommend

Short term:

- Build an internal localhost app or private setup tool
- Use it to create and launch a restaurant site quickly
- Keep AI and deployment tools under your control

Mid term:

- Turn that internal tool into a reusable "Restaurant Launcher"
- It should output:
- normalized `data.json` / config payload
- uploaded image set
- branding settings
- preview links
- deployment target info

Long term:

- Decide whether to keep one deployment per restaurant or evolve into multi-tenant SaaS

## Technical Architecture To Aim For

- Live restaurant site
  - normal admin for simple edits
  - multilingual homepage copy overrides stored on the server
- Internal onboarding tool
  - OpenAI key stays private here
  - menu extraction
  - content generation
  - FR / EN / AR translation generation
  - visual suggestions
  - image workflow
  - deployment automation
- Shared schema
  - one normalized restaurant config format used by both systems
  - website copy overrides today, menu item translations next

## AI Implementation Notes

- Use structured JSON outputs for menu extraction and config generation
- Keep OpenAI API usage server-side only
- Store prompts/templates as part of your internal tool
- Add a human review step before publishing
- Track generation cost per client

## Phase 7: Longer-Term SaaS Direction

- [ ] Decide between multi-instance deployment vs true multi-tenant architecture
- [ ] If multi-tenant, redesign storage around restaurant IDs / slugs
- [ ] Add per-restaurant auth and isolation
- [ ] Add subscription/billing model
- [ ] Add template duplication flow for launching a new client quickly

## Immediate Next Recommended Slices

1. Validate the new seller-job importer flow end to end on the live deployment with real menu PDFs, menu images, and seller-generated hero/gallery assets
2. Expand the curated image library and move product-image matching from `shared.js` placeholders onto the local catalog before broad AI dish generation
3. Introduce seller-only capability gating so AI/import/image-library tools stay out of the client-facing admin surface by default
4. Add a stronger importer review UI around job artifacts, diff visibility, and partial apply instead of relying only on summary + raw JSON
5. Browser-QA the refreshed public site and admin on the live Coolify deployment, focusing on desktop spacing, motion restraint, and the rewritten seller-facing surfaces
6. Define the exact seller packages, what is customized manually, and what stays admin-editable after delivery

## Notes From This Iteration

- Branding is now part of persisted server data
- Admin now has a branding configuration section
- Public website and menu now consume the shared branding model
- Social data handling has been improved to preserve TripAdvisor too
- The menu page had a stale super-category reference problem; that has been corrected as part of the brand/settings sync work
- Product direction now explicitly includes a private AI-assisted launcher instead of exposing AI setup in the client admin
- Shared restaurant config is no longer persisted in browser localStorage
- Opening hours and hours note are now handled as server-backed website data instead of browser-only admin state
- Remaining localStorage usage is now mostly limited to user/session-style behavior: language, cart, history, likes, and admin UI filter state
- Browser-only user state is now routed through shared storage helpers, which makes the separation between restaurant configuration and visitor/session memory much clearer in the codebase
- Some repeated public-page styling is now centralized in `style.css`, which is a small but important step toward a real reusable design system
- Repeated menu modal UI now relies more on reusable classes and less on generated inline presentation, which should make future theme/template work simpler
- The cart drawer is now another reusable styled block instead of an inline-styled JS fragment, which is useful groundwork for future template presets and desktop polish
- The ticket and history views are now moving in the same direction as the rest of the menu flow, with less JS-owned presentation and more shared stylesheet ownership
- Small admin UI patterns are now following the same cleanup direction, so both the client-facing site and the seller/admin experience are becoming easier to theme consistently
- The admin shell itself is starting to lose one-off visual treatments in favor of reusable patterns, which will help if we later add more polished presets or a more deliberate seller dashboard theme
- The menu editor markup is also getting lighter, which makes the admin easier to continue refactoring without mixing form structure and presentation on every field block
- The hours editor follows the same pattern now, which makes one of the most repetitive admin sections easier to maintain and extend
- Nearby admin helper panels are now joining that same cleanup path, so content setup and category setup are becoming less tied to hardcoded layout fragments
- The landing and gallery tools are getting pulled into the same reusable layout system too, which is useful groundwork before we spend time on more visible visual-system polish
- The seller workflow area is now joining that same pattern, so onboarding and backup tools are gradually becoming easier to polish as one coherent admin experience
- The admin no longer feels only "cleaned up"; it is starting to look more intentionally designed, which is the right direction before we spend time on broader public-site visual polish
- That visual-polish pass has now started to cross over into the public site, so the seller-facing and customer-facing experiences are beginning to feel closer in quality
- Menu-item media now has an internal seller workflow too: missing images can be assigned from a managed local library, which gives the future importer and AI tooling a concrete non-AI fallback path
- Preset selection is now visible and editable inside the branding UI, which is a more realistic base for seller setup than keeping the preset/theme state mostly hidden in stored data
- Homepage hero slides now read from the preset-aware branding system instead of staying fixed in the markup, which removes one of the biggest remaining disconnects between saved theme state and the public shell
- The branding preview is now more than a simple card: it includes a homepage-like hero surface and a menu-like card shell, which should reduce guesswork during seller setup
- Homepage hero delivery is now stronger too, because branding can carry multiple hero slide images instead of forcing one uploaded image plus preset fallbacks
- The preset system is now starting to act like a true seller-facing template system, because the public homepage and menu have distinct visual treatments per preset instead of sharing one identical shell
- The public homepage is starting to gain a more coherent visual hierarchy now, which is important if this first template is going to feel professional enough to sell repeatedly
- The homepage payment/facilities block and key menu cards are now catching up visually too, which helps the template feel more consistently premium instead of polished only on the landing page
- The menu shell itself now has a stronger first impression too, with a more deliberate header, category navigation, and search treatment instead of those controls feeling flatter than the rest of the page
- The mobile menu action surfaces are starting to match that polish as well, with floating cart/home controls relying less on inline presentation and more on reusable premium styling
- The promo carousel is now visually closer to the refreshed menu system too, which reduces the feeling that promotional content belongs to a separate older template
- The overlay/detail layer is now starting to catch up too, with the dish detail page and super-category sheet moving closer to the same premium visual language as the rest of the menu
- The utility modal layer is now catching up as well, with history and gallery surfaces moving away from older flat styling toward the same premium system used elsewhere
- The order confirmation layer is now catching up too, with the ticket sheet moving closer to the same premium visual system instead of feeling like a separate older receipt view
- The landing/menu entry screen is also shedding more inline presentation now, especially around the landing nav, game banner, and clickable info rows, which makes future polish easier to continue
- The game modal has also started moving onto reusable classes instead of inline fragments, which should make the remaining menu cleanup less brittle for whoever continues next
- Remaining public/menu inline styling is getting squeezed down into a smaller set now; what is left is increasingly either JS visibility state or a few encoding-sensitive fragments rather than broad presentation debt
- The last easy presentation-only inline fragments in the game/landing flow are nearly gone now, so most remaining inline attributes in `menu.html` are intentional visibility hooks rather than styling shortcuts
- Opening hours and the hours note are now server-backed instead of browser-only admin state
- Runtime restaurant labels used in ordering/ticket flows are now based on shared branding instead of hardcoded demo names
- Multilingual copy has been made more generic in key white-label areas so the first sellable template is less tied to one restaurant identity
- Homepage hero messaging is now less fast-food specific and better aligned with a reusable restaurant template
- The menu landing logo now supports a clean initials fallback when no client logo has been uploaded yet
- Admin shell titles are now generic/client-brandable instead of being tied to the old Foody demo identity
- Remaining demo identity is now mostly concentrated in the starter menu dataset and placeholder media rather than the public/admin shell
- Visible public/admin shell placeholders are now neutralized so the site does not leak "Foody/Tanger" before live data loads
- Shared branding now also updates admin titles and keeps footer/about identity text aligned with the active language
- Admin now has a multilingual homepage copy editor that writes into a server-backed translation override structure
- That translation override structure is the intended future target for AI-generated FR / EN / AR website copy from menu PDFs, menu photos, and client assets
- Admin menu editing now supports FR / EN / AR names and descriptions per item while keeping the old base `name` / `desc` fallback intact
- The server now sanitizes a stable per-item `translations.fr/en/ar.{name,desc}` structure so AI import can target a real production schema later
- A remaining public demo leak has been reduced by replacing burger-specific About copy and generic starter placeholders on the menu landing
- Browser fallback data and bundled reset data now both use the same smaller starter menu, so first-load demos and admin resets no longer restore the old Nolasco-style concept
- Branding setup now includes upload-assisted logo and hero management with a live preview, which is a better base for faster client delivery and later AI-assisted onboarding
- Seller-facing admin forms now block broken asset URLs, malformed map/social links, and obviously incomplete phone numbers before publish
- The remaining starter menu is now less burger-branded, which helps the default demo feel more reusable before client-specific customization
- Homepage payment/facilities now come from structured restaurant data instead of hardcoded Visa/Mastercard placeholders, which better matches the real seller use case
- Footer note/legal copy and homepage section visibility are now server-backed controls, which makes first-client delivery and future cloning much cleaner
- Homepage section order can now be changed from admin, and some optional public UI elements now collapse more gracefully when left empty
- Admin backups can now be exported and imported as normalized JSON, which gives you a concrete cloning and recovery workflow for new restaurant launches
- Quick launch onboarding presets now stamp a stronger first-pass setup for different restaurant styles before manual refinement
