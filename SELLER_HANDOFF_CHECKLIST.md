# Seller Handoff Checklist

This file is the operational workflow for turning the codebase into a deliverable restaurant website instance.

Use it together with:

- [README.md](./README.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [PRODUCTIZATION_ROADMAP.md](./PRODUCTIZATION_ROADMAP.md)
- [MEDIA_IMPORT_BASIS.md](./MEDIA_IMPORT_BASIS.md)

## 1. Confirm The Sale Scope

Before touching setup, confirm what was sold:

- basic restaurant website
- restaurant website + QR menu
- restaurant website + support/update package

Also confirm what is not included yet:

- internal AI onboarding
- automated PDF import
- custom code-level template changes beyond the agreed package

## 2. Gather Client Inputs

Collect:

- restaurant name
- short brand name if different
- logo
- hero/cover image if available
- extra hero/homepage images if available
- phone
- WhatsApp
- address
- map URL
- social links
- opening hours
- payment methods such as Cash and TPE
- facilities such as parking, terrace, WiFi, accessibility, family area
- menu source: PDF, photos, spreadsheet, or text
- restaurant photos
- preferred tone or style
- preferred languages and copy expectations

## 3. Create Or Clone The Instance

Recommended current workflow:

1. Start from the current white-label base.
2. Export a clean JSON backup from the source instance if cloning from an existing one.
3. Import into the target instance when needed.
4. Apply the closest `Quick Launch Preset`.
5. Replace all brand identity data immediately.

Replace:

- restaurant name
- short name
- preset / theme pack
- logo
- hero image
- hero slide 2 and hero slide 3 when the client has enough strong visuals
- theme colors
- WiFi display name and code if the restaurant wants WiFi shown publicly

Before saving branding, use the preview panel to review:

- homepage hero mood
- CTA contrast
- menu shell/card mood
- logo fallback behavior

## 4. Configure The Website Properly

From admin, review and fill:

- branding
- landing/homepage copy
- about content
- events/services content
- footer note and rights text
- section visibility
- section order
- payment/facilities
- gallery

Do not leave demo-looking placeholders if client assets already exist.

## 5. Build The Menu Carefully

Before publishing the menu:

- normalize categories
- use super-categories only when they improve navigation
- review category names and super-category labels in FR / EN / AR
- review menu landing labels, cart/ticket flow, social/WiFi modals, and game/event prompts in FR / EN / AR
- review admin seller-facing screens in FR / EN / AR too: login, sidebar, Seller Tools, Launch Readiness, handoff summary, and security text
- review the main admin setup forms in FR / EN / AR too: menu item editor, categories, branding, landing, WiFi, and business overview labels/placeholders
- confirm prices
- confirm promo flags
- confirm featured flags
- confirm images

If item images are missing:

- use admin `Data Tools` -> `Menu Image Suggestions` to assign managed local placeholders quickly
- treat those placeholders as an internal delivery aid, not a final substitute for strong client-specific visuals
- use the confidence levels in the suggestion summary to replace fallback placeholders first
- starter instances may also already include managed local menu and gallery visuals; treat them the same way during review

If you want a faster first menu draft:

- use admin `Seller Tools` -> `AI Import Studio`
- upload menu images first
- add logo and restaurant photos when they are available
- review the generated summary and raw JSON before clicking apply
- treat the importer as a seller draft assistant, not as direct auto-publish
- use admin `Seller Tools` -> `AI Media Studio` for hero or generic gallery visuals only
- when an AI media result is applied, it is also marked approved in the local seller-side media library for future reuse

For each item, review:

- default name
- default description
- FR name and description
- EN name and description
- AR name and description

If translations are not client-approved yet, use the best available reviewed version and note the remaining content review work.

## 6. Media Quality Review

Priority order:

1. real restaurant photos
2. curated placeholders
3. AI-generated visuals only where necessary

Check:

- hero looks professional
- logo is crisp
- gallery has no broken items
- dish images feel consistent
- missing images degrade gracefully
- public address, phone, map, and WiFi details do not show fake starter values when the client has not provided them yet
- managed starter visuals are replaced where the client has stronger real media
- if using temporary static media, keep it aligned with the current preset/theme and log what still needs client-specific replacement
- remember that seller-generated hero/gallery assets now have a reusable local-library path; dish/drink imagery should still prefer real photos or curated approved assets before AI generation

Current blocker policy:

- do not hand off if the logo is missing
- do not hand off if the primary hero is still a managed preset asset
- do not hand off if any menu item still has no image at all
- gallery, promo coverage, featured coverage, and extra hero slides can remain warnings instead of blockers

## 7. Security And Admin Review

Before handoff:

- open the admin security section
- change default credentials
- verify the default-credentials warning is gone
- confirm login still works after the change
- confirm the deployment uses `AUTH_FILE=/app/data/auth.json` so future password changes persist across redeploys
- export a fresh final backup

Never deliver with fallback credentials still active.

## 8. Pre-Launch Validation

Run locally or against the deployment as appropriate:

```bash
npm run predeploy
```

Manual review list:

- admin `Data Tools` launch-readiness audit
- visible media blocker/warning status inside the launch-readiness card
- direct launch-readiness actions that jump to Branding, Menu, or Gallery from media blockers
- compact media counts for blockers, warnings, managed slots, and missing/partial coverage
- direct core-readiness actions that jump to Branding, Landing, Hours, Menu, Gallery, or Security
- admin `Data Tools` handoff summary generation
- admin `Data Tools` handoff summary download
- handoff summary media-slot review for logo, hero, gallery, promo, featured, and menu imagery
- admin `Data Tools` menu image suggestions when dish media is incomplete
- homepage
- menu landing
- category navigation
- one item detail view
- cart/order flow
- gallery
- history/ticket flow
- contact actions
- admin branding save
- admin menu save
- admin backup export

## 9. Stage On Coolify Before Handoff

Before final delivery, put the instance on a live Coolify preview:

1. Copy the values from [coolify.env.example](./coolify.env.example) into the target Coolify project.
   For the current target deployment, start from [coolify.matsco.env.example](./coolify.matsco.env.example).
2. Replace the placeholder domains and admin credentials with the client values.
3. Deploy first on generated Coolify domains.
4. Open the live website and admin URLs.
5. Re-run the manual review list above against the live instance.
6. Only then switch the final custom domains or send the site to the client.

## 10. Delivery Package

Deliver:

- website URL
- admin URL
- admin username
- admin password
- final backup export

Operational note:

- if the client changes credentials later from the Security tab, the saved auth file becomes the active login source and overrides the original Coolify `ADMIN_USER` / `ADMIN_PASS` values

Explain what the client can safely edit:

- logo
- hero image
- hours
- phone
- address
- menu items
- gallery
- homepage copy

Explain what should stay under your control:

- deployment
- domain and DNS
- backups strategy
- code-level template changes
- future AI-assisted import/onboarding tooling

## 11. Internal Notes After Delivery

Record:

- client package sold
- preset used
- missing assets
- manual fixes made
- translation quality concerns
- future upsell opportunities
- whether this client is a good future importer/launcher test case

## Current Practical Recommendation

At this stage of the product:

- use the admin for normal client edits
- use export/import for cloning and recovery
- keep AI workflows private and internal
- use `IMPORTER_PAYLOAD_SPEC.md` as the contract for any future intake/import automation
- keep one deployable instance per restaurant

That is the safest and fastest way to sell the first wave of websites while the internal launcher and importer are still being designed.
