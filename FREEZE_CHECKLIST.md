# Freeze Checklist

Use this file when you want to stop feature work, freeze the current instance, and deploy with minimal risk.

## Target Mode

Recommended production mode for a client handoff:

- `SELLER_TOOLS_ENABLED=false`
- `AI_MEDIA_TOOLS_ENABLED=false`

Optional owner-facing AI image mode:

- keep `SELLER_TOOLS_ENABLED=false`
- set `AI_MEDIA_TOOLS_ENABLED=true` only if you want the per-item AI image button inside the item image modal

## Environment

Confirm these values in Coolify before freeze:

- `PRODUCT_DOMAIN=matsco.ibnbatoutaweb.com`
- `ADMIN_DOMAIN=admin.matsco.ibnbatoutaweb.com`
- `WEBSITE_PORT=4002`
- `ADMIN_PORT=4102`
- `COOKIE_SECURE=true`
- `DATA_FILE=/app/data/data.json`
- `UPLOADS_DIR=/app/uploads`
- `AUTH_FILE=/app/data/auth.json`
- `ADMIN_USER=<final-admin-user>`
- `ADMIN_PASS=<final-strong-password>`

If AI import or AI item-image generation is enabled during setup:

- `OPENAI_API_KEY=<server-side-key>`
- `OPENAI_IMPORT_MODEL=gpt-4o`
- `OPENAI_IMPORT_PDF_MODEL=gpt-4o`
- `OPENAI_ITEM_MEDIA_MODEL=dall-e-3`

## Content Freeze

Before deploy:

- confirm logo, hero, and gallery are final enough for launch
- confirm restaurant name and branding colors are final
- confirm phone, address, map, social links, and hours are correct
- confirm menu categories, items, prices, and translations are correct
- confirm uploaded images render from `/uploads/...`

## Functional Check

Run:

```bash
npm run predeploy
```

Then verify manually:

- homepage loads
- menu landing loads
- category navigation works
- item detail opens
- cart works
- language switch works in FR / EN / AR
- admin login works
- owner can save menu/info/branding
- item image modal works

## Backup

Before final deploy:

1. export a JSON backup if the instance contains important data
2. preserve the current uploads directory
3. note the final deploy commit sha

## Deploy

Use this order:

1. push final commit
2. redeploy both Coolify services
3. verify `/health` and `/build.json` on public and admin domains
4. hard refresh browser/mobile
5. recheck homepage, menu, and admin

## Freeze Rule

After this point:

- only accept bug fixes
- do not reopen structural admin/menu redesign work
- defer cosmetic tweaks unless they block launch
