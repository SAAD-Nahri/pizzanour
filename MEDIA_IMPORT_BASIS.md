# Media Import Basis

This document defines the practical base for future seller-side media and import automation for the white-label restaurant product.

The concrete importer payload contract now lives in [IMPORTER_PAYLOAD_SPEC.md](./IMPORTER_PAYLOAD_SPEC.md).

## Current Manual Customization Scope

For each new client, the current delivery workflow should still handle these items manually or semi-manually:

- restaurant name and short brand name
- logo
- hero image and other static top-of-page images
- About / Notre Histoire / A Propos content
- top menu static images and other featured visuals
- restaurant tone, language polish, and final copy review

This keeps the first sellable website fast to launch while preserving quality control before handoff.

## Asset Library Strategy

The long-term media system should use a tagged asset library before it falls back to AI generation.

Recommended approach:

- store reusable image assets with tags for cuisine type, dish type, mood, color, language, and usage slot
- allow matching by category, super-category, and keywords from the menu source
- prefer exact or close matches for static website images and menu thumbnails
- keep a small curated fallback set for generic launch images
- only generate new visuals when the library has no reasonable match

Current basis already in the codebase:

- a first local menu-image library lives in `shared.js`
- local SVG placeholder assets live under `images/menu-lib-*.svg`
- admin `Data Tools` can now assign those placeholders to menu items that still have no image
- the local matcher now reports confidence levels, which is the right basis for a future importer review queue
- the shared runtime now exposes a slot-level media audit for branding, hero slides, gallery, featured items, promo items, and menu item imagery
- managed library images are intentionally internal seller placeholders, not final proof that client media work is complete

This gives faster delivery, lower cost, and more consistent visual quality than generating everything from scratch.

## Future Importer Contract

The future importer should normalize PDF or image menu input into the existing restaurant schema instead of inventing a separate format.

Target fields:

- `branding`
- `contentTranslations`
- `menu[].translations.fr`
- `menu[].translations.en`
- `menu[].translations.ar`

Practical importer output should include:

- restaurant identity fields
- clean menu categories and items
- translated item names and descriptions
- guessed or reviewed static images for the website
- missing-data flags that need human review

### Slot-Level Media Targets

The importer should think in terms of explicit media slots, not just a loose image bag.

Current target slots already implied by the live product are:

- `branding.logoImage`
- `branding.heroImage`
- `branding.heroSlides[1]`
- `branding.heroSlides[2]`
- `gallery[]`
- `promoIds[] + menu[].img`
- `menu[].featured + menu[].img`
- `menu[].img / menu[].images[]`

Operational meaning:

- `branding.logoImage`: required client logo
- `branding.heroImage`: required primary homepage and menu-landing hero visual
- `branding.heroSlides[1..2]`: optional extra hero visuals for richer delivery
- `gallery[]`: restaurant atmosphere / interior / exterior / service visuals
- `promoIds[] + menu[].img`: promo carousel items that need strong imagery
- `menu[].featured + menu[].img`: featured rail items used near the top of the menu experience
- `menu[].img / menu[].images[]`: full item-level dish imagery coverage

The importer should write these fields directly and attach review notes when a slot is:

- `ready`: client-specific or strong final media is present
- `managed`: still using preset or managed placeholder media
- `partial`: the slot exists but coverage is weaker than recommended
- `missing`: no usable media was assigned

Current seller handoff policy in the product:

- `branding.logoImage`: blocks handoff unless `ready`
- `branding.heroImage`: blocks handoff unless `ready`
- `menu[].img / menu[].images[]`: blocks handoff only when `missing`
- `gallery[]`, `promoIds[] + menu[].img`, `menu[].featured + menu[].img`, and extra hero slides: warnings only, not hard blockers

The importer should also preserve the current manual editing model so the admin remains the final review surface, not the AI source of truth.

## Image Sourcing Priority

Use this order for any client delivery:

1. real restaurant photos
2. tagged asset-library matches
3. AI-generated visuals only when needed

This rule should apply to hero images, static homepage visuals, menu top images, and featured content images.

### Practical split

The strongest split for this product is:

- hero and generic atmosphere images: seller-only AI generation is acceptable and useful
- menu item images: keep client photos and curated library matches ahead of AI generation

This avoids spending generation cost on every dish while still giving the website a polished top-level visual identity quickly.

## Operational Guardrails

- AI tools should stay internal to the seller workflow.
- Do not expose API keys or generation controls inside the live restaurant admin.
- Keep the client-facing admin focused on review, correction, and small edits only.
- Treat imported content as draft data until a human approves it.
- Keep the importer writable only to the normalized schema already used by the product.

## Implementation Direction

When we build this later, the right path is:

- first define the asset tags and importer schema
- then map PDF/image extraction into that schema
- then connect the importer to a private launcher or onboarding tool
- only after that, consider any AI-assisted review or enrichment

That keeps the current product stable while creating a clean path to faster future launches.
