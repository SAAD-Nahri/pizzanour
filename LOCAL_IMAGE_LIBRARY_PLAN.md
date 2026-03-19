# Local Image Library Automation Plan

This file defines the best practical path for building a local, automatic, seller-only image library that can be reused across restaurant projects.

Current repo status:

- the local library foundation now exists under `media-library/`
- generated hero/gallery assets can now be registered into the local catalog
- applying a generated hero/gallery image marks that catalog asset approved for future reuse
- product-image recipe matching is the next implementation slice

The goal is:

- no third-party runtime dependency for delivered client sites
- no API keys in the client admin
- automatic reuse when an image already exists
- automatic generation only when the image does not exist
- local storage and local matching for future projects

## Decision

The right model is not:

- generate every image on every project
- rely on remote stock-image URLs at runtime
- let the restaurant owner manage this process

The right model is:

1. keep a local reusable library
2. assign existing approved assets first
3. generate only when no approved asset exists
4. save generated outputs locally with metadata so they become reusable assets for future projects

## What Should Be Generated vs Reused

### Hero and generic website images

Use seller-only AI generation aggressively here.

Reason:

- these images set mood and quality
- they do not need to represent one exact dish with legal/menu accuracy
- they benefit most from references such as logo, venue photos, colors, and cuisine notes

### Product images

Do not default to AI generation for every dish.

Reason:

- cost grows fast
- quality review becomes slow
- dish accuracy becomes weaker
- many restaurants only need strong coverage, not one bespoke image per line item

Recommended order:

1. client dish photos
2. approved local library match
3. AI generation only for uncovered items that matter

## Best Architecture

Use local files for assets and a local index for metadata.

### Storage

Recommended structure:

```text
media-library/
  catalog/
    catalog.sqlite
  assets/
    hero/
      curated/
      generated/
    gallery/
      curated/
      generated/
    product/
      curated/
      generated/
  prompts/
  reviews/
```

Why this is better than plain folders only:

- fast local lookup
- deduping by hash
- reusable metadata
- generation history
- approval state per asset

If you want the fastest first implementation, start with:

- local files under `media-library/assets/...`
- one local JSON manifest

Then move to SQLite once the volume grows.

## Core Data Model

Each asset should have:

- `asset_id`
- `slot_type`
  - `hero`
  - `gallery`
  - `product`
- `source_type`
  - `client`
  - `curated`
  - `generated`
  - `placeholder`
- `filepath`
- `sha256`
- `width`
- `height`
- `mime`
- `approved`
- `quality_score`
- `created_at`
- `prompt_version`
- `model`
- `notes`

Each product recipe should have:

- `recipe_key`
- `normalized_name`
- `normalized_description`
- `category_key`
- `cuisine_tags`
- `language_variants`
- `preferred_asset_ids`

Each matching record should have:

- `recipe_key`
- `asset_id`
- `match_score`
- `match_reason`
- `approved_for_auto_use`

## Deterministic Matching Strategy

For every menu item:

1. build a canonical recipe key
2. look for an exact approved match
3. look for a strong semantic/tag match
4. if found, reuse the asset
5. if not found, enqueue generation

### Canonical recipe key

The key should be built from:

- normalized FR name
- normalized EN name if available
- category
- core dish tokens

Example:

```text
product:burger:chicken-club-sandwich
product:drink:mint-lemonade
product:dessert:chocolate-fondant
```

This is how the library becomes reusable across projects.

If two restaurants both sell `chicken club sandwich`, the second project should reuse the existing approved image automatically.

## Generation Workflow

When no approved asset exists:

1. create a generation job
2. use the item/category/cuisine metadata to build the prompt
3. generate the image server-side
4. save it locally
5. write metadata into the catalog
6. mark it as:
   - `generated_unreviewed`
7. allow seller review
8. once approved:
   - mark `approved_for_auto_use=true`

This approval step matters. Without it, the library fills with low-quality or inconsistent images and reuse gets worse over time.

## Recommended Product-Image Automation Policy

For menu imports:

- never auto-generate all missing items by default
- auto-reuse approved library matches
- auto-assign managed placeholders where no approved match exists
- generate only for:
  - featured items
  - promo items
  - top 3 to 8 uncovered key products

This keeps cost and review manageable.

## Recommended Hero / Generic Image Policy

For hero and generic gallery images:

- auto-generate is acceptable
- use logo + venue photos + cuisine hint + style notes as references
- save results locally
- allow seller to apply the chosen result to hero/gallery

This is already the right place to spend AI image budget.

## Free Library vs AI vs Manual Curation

### Best practical mix

Use all three, but in this order:

1. start with a manually curated local base library
2. use AI to fill real gaps
3. do not depend on free-image APIs at runtime

### My recommendation

Build the first 150 to 300-image product library from:

- curated downloadable stock/free images that you locally store and tag
- your own generated images for missing important categories
- later, client-provided photos that you choose to reuse internally when appropriate and permitted

This is better than relying on free APIs every time.

## Why Not Use Free Image APIs Directly In Production

Because this product is delivered to clients and should be stable:

- runtime hotlinking is brittle
- licenses and API terms can change
- external URLs can disappear
- image style will be inconsistent

So even when you use free sources for seeding, the result should become part of your local seller library, not a runtime dependency.

## Best Road To Follow

### Phase 1

Build the local library foundation.

- create local folder structure
- create a catalog file or SQLite index
- define asset metadata
- define recipe keys
- define approved vs generated vs placeholder states

### Phase 2

Expand the current placeholder matcher into a real asset matcher.

- menu item -> recipe key
- recipe key -> approved asset
- if no approved asset -> managed placeholder

### Phase 3

Add generation jobs.

- generate hero/gallery immediately
- generate product images only for selected uncovered items
- save outputs locally into the library

### Phase 4

Add seller review.

- approve generated assets
- reject bad ones
- regenerate with refined prompt
- once approved, enable automatic reuse

### Phase 5

Only then make it more autonomous.

- batch generation
- quality scoring
- duplicate detection
- style-family presets per cuisine

## Immediate Next Implementation Step

The next code step should be:

1. create a real local asset manifest/index
2. add seller-side asset states
3. connect importer item matching to that local index before any broad AI dish generation

That is the correct road.
