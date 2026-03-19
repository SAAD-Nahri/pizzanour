# Seller Image Pipeline

This file defines the practical seller-only image workflow for the white-label restaurant product.

The goal is to generate or assign strong visuals quickly without turning the client admin into a media-production tool.

## Core Rule

Keep image generation and sourcing private to the seller workflow.

- API keys stay server-side only
- generation happens in `Seller Tools`
- the client admin stays focused on review and small edits

## Recommended Source Order

Use this order for every delivery:

1. client-provided restaurant photos
2. curated local library matches
3. seller-only AI generation for hero and generic atmosphere images
4. AI dish-image generation only when the first three options fail

This keeps quality and trust higher than trying to synthesize every image from scratch.

## Slot Strategy

### Hero and generic atmosphere images

Use seller-only AI generation here first.

These slots benefit the most from generation because:

- they set mood and polish
- they do not need to match a single exact plated dish
- they can follow brand colors, tone, and venue cues

Current implementation path:

- `Seller Tools -> AI Media Studio`
- generates a hero or gallery image
- saves the result into `/uploads`
- allows applying it directly to:
  - `branding.heroImage` and `branding.heroSlides`
  - `gallery[]`

### Menu item images

Do not default to AI generation here.

Recommended path:

- use client dish photos when available
- otherwise use the local tagged library and matcher
- only generate AI dish images for uncovered high-value items later

This means the current product should keep using:

- `shared.js` menu image library
- seller-side menu image suggestions
- managed placeholder review before final handoff

## Scalable Product-Image Plan

For dish and drink imagery, the right medium-term solution is:

- build a tagged local library of 150+ vetted images
- store them locally, not as runtime third-party URLs
- tag each asset by:
  - cuisine
  - dish type
  - drink type
  - usage slot
  - visual mood
  - color palette
- keep a reviewable matcher result and confidence level

This is better than giving every restaurant fully generated dish images by default.

## Practical Workflow

1. Import menu images, logo, and venue photos through `AI Import Studio`
2. Review the imported structure
3. Generate or refine hero/gallery visuals in `AI Media Studio`
4. Run menu image suggestions to fill missing product imagery
5. Replace the most visible managed placeholders with stronger client or curated assets
6. Review launch readiness and handoff summary

## Current Implementation Notes

- `AI Media Studio` is intended for hero and generic atmosphere visuals only
- generated images are saved locally under `/uploads`
- menu item placeholder assignment remains a separate seller tool
- the next product-image step should be library expansion, not immediate full AI generation

## Next Recommended Expansion

1. Add a real local asset manifest for menu, hero, and gallery assets
2. Expand the menu-image library from SVG placeholders to a curated real-photo set
3. Add seller-side media review states:
   - client media
   - curated local asset
   - AI generated
   - managed placeholder
4. Only after that, add AI dish-image generation for missing high-value items
