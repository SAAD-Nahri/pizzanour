# Deployment Guide

Use this file for production deployment and redeployment decisions.

This project is already live on Coolify, so every rollout should be:

- deploy-safe
- reversible
- validated before release

Read [README.md](./README.md) first for the product overview and [SELLER_HANDOFF_CHECKLIST.md](./SELLER_HANDOFF_CHECKLIST.md) for client-delivery workflow.

## Deployment Model

Current recommended model:

- one website service for the public site
- one admin service for the protected admin
- one restaurant instance per deployment

Typical domain pattern:

- website: `restaurant.example.com`
- admin: `admin.restaurant.example.com`

## Current Target Deployment

Prepared live-preview target:

- website: `matsco.ibnbatoutaweb.com`
- admin: `admin.matsco.ibnbatoutaweb.com`
- website port: `4002`
- admin port: `4102`

If the admin subdomain DNS record is not created yet, deploy the admin first on its generated Coolify domain and only switch to `admin.matsco.ibnbatoutaweb.com` after the DNS record exists.

## Required Environment Variables

Set these in Coolify. You can start from [`coolify.env.example`](./coolify.env.example) or the prepared target file [`coolify.matsco.env.example`](./coolify.matsco.env.example):

- `WEBSITE_PORT=3015`
- `ADMIN_PORT=3115`
- `PRODUCT_DOMAIN=<public-domain>`
- `ADMIN_DOMAIN=<admin-domain>`
- `ADMIN_USER=<admin-username>`
- `ADMIN_PASS=<strong-password>`
- `ALLOW_DEFAULT_ADMIN_CREDENTIALS=false`
- `SECURITY_HEADERS_HSTS=true`
- `OPENAI_API_KEY=<server-side-key>` if you want seller-side menu import or per-item AI image generation
- `OPENAI_IMPORT_MODEL=gpt-4o` optional override for image-based menu imports; recommended for reliability
- `OPENAI_IMPORT_PDF_MODEL=gpt-4o` optional override for PDF menu imports; use a stronger model here
- `OPENAI_ITEM_MEDIA_MODEL=gpt-image-1-mini` recommended default for per-item AI dish/drink images when you want lower cost
- `OPENAI_ITEM_MEDIA_QUALITY=low` recommended default for the cheapest owner-facing image path
- `SELLER_TOOLS_ENABLED=false` for clean client handoff admin; enable only on seller setup instances
- `AI_MEDIA_TOOLS_ENABLED=false` unless you explicitly want the per-item AI image button available inside the item image modal
- `COOKIE_SECURE=true`
- `DATA_FILE=/app/data/data.json`
- `DATA_BACKUP_DIR=/app/data/data-backups`
- `DATA_BACKUP_LIMIT=20`
- `UPLOADS_DIR=/app/uploads`
- `AUTH_FILE=/app/data/auth.json`

Recommended production rule:

- never leave `ADMIN_PASS` on the fallback default
- `NODE_ENV=production` refuses to start with the built-in default admin credentials unless `ALLOW_DEFAULT_ADMIN_CREDENTIALS=true`; keep that override off for real deployments
- keep `SECURITY_HEADERS_HSTS=true` after HTTPS is active on the final domains
- keep `AUTH_FILE` inside the persisted `/app/data` volume so Security-tab password changes survive redeploys
- keep `DATA_BACKUP_DIR` inside the persisted `/app/data` volume; every admin save/reset keeps a rolling JSON backup
- keep `OPENAI_API_KEY` server-side only; do not expose it to the client or browser

## Configure In Coolify

Use this order when creating or updating the live project:

1. Create a new Coolify application from this repo.
2. Use the repository root `docker-compose.yml`.
3. Create or confirm two services:
   - `website`
   - `admin`
4. Set the environment variables from [`coolify.env.example`](./coolify.env.example), replacing the domain and credential placeholders with the real client values.
5. Confirm both services keep the persisted volumes:
   - `/app/data`
   - `/app/uploads`
6. Start with generated Coolify domains first, before switching DNS to the final client domains.
7. Keep the public site and admin on separate domains/subdomains when possible.

For the current `matsco` target, use:

- website service domain: `matsco.ibnbatoutaweb.com`
- admin service domain: `admin.matsco.ibnbatoutaweb.com`
- website service port env: `4002`
- admin service port env: `4102`

Minimum env review before clicking deploy:

- `ADMIN_PASS` is strong and not the fallback value
- `ALLOW_DEFAULT_ADMIN_CREDENTIALS=false` or unset
- `COOKIE_SECURE=true`
- `SECURITY_HEADERS_HSTS=true` after HTTPS is confirmed
- `DATA_FILE=/app/data/data.json`
- `DATA_BACKUP_DIR=/app/data/data-backups`
- `UPLOADS_DIR=/app/uploads`
- `AUTH_FILE=/app/data/auth.json`
- `OPENAI_API_KEY` is set if you want the seller-only importer or AI media generation enabled

Importer note:

- the current importer supports both uploaded images and PDFs
- it produces a review draft that must be explicitly applied by the seller
- it is intended for setup/import time, not for the delivered owner workflow

AI item-image note:

- the owner admin can expose per-item AI image generation from the item image modal when `AI_MEDIA_TOOLS_ENABLED=true`
- the owner-facing item-image flow uses `OPENAI_ITEM_MEDIA_MODEL` and `OPENAI_ITEM_MEDIA_QUALITY`
- recommended low-cost path:
  - `OPENAI_ITEM_MEDIA_MODEL=gpt-image-1-mini`
  - `OPENAI_ITEM_MEDIA_QUALITY=low`
- if your OpenAI org cannot use that model, the server automatically falls back to `dall-e-3`
- this does not require `SELLER_TOOLS_ENABLED=true`
- importer routes, backup import/export, and reset remain seller-only when `SELLER_TOOLS_ENABLED=false`

## Deploy To See It Live

Use this sequence whenever you want a live preview or release candidate in Coolify:

1. Run locally:
   ```bash
   npm run predeploy
   ```
2. Push the branch/commit you want to test.
3. In Coolify, trigger `Deploy`.
4. Wait for both services to become healthy.
5. Open the generated website domain and admin domain.
6. Confirm the live instance matches the current restaurant data and media.
7. Only after that, continue with DNS/custom-domain changes or client handoff.

## Pre-Deploy Checklist

Before pushing or deploying:

1. Run:
   ```bash
   npm run predeploy
   ```
2. Confirm no intentional work-in-progress admin credentials remain.
3. Confirm the active restaurant data is the intended one.
4. Confirm uploads referenced by branding/menu/gallery exist.
5. Export a backup from admin if the instance already contains important live data.

## Coolify Workflow

Recommended order:

1. Deploy the services with generated Coolify domains first.
2. Confirm both services boot correctly.
3. Confirm HTTPS works on both generated domains.
4. Confirm admin login works.
5. Confirm public homepage and menu load with restaurant data.
6. Only then switch to final custom domains.

Do not change custom DNS and deployment settings at the same time if you can avoid it.

## Post-Deploy Validation

After each deployment, verify:

- public homepage loads
- menu landing loads
- menu navigation works
- gallery opens
- public contact actions behave correctly
- admin login works
- admin save works
- uploads still resolve
- security panel does not show unexpected warnings

Minimum command validation:

```bash
npm run check
npm run smoke
```

Minimum manual browser validation:

- homepage
- menu page
- one menu item detail view
- one admin save action
- one uploaded image display

Build verification:

- check `https://<public-domain>/health` and `https://<admin-domain>/health`
- confirm both return a `build` value
- if the public site still behaves like an older deploy, compare `https://<public-domain>/build.json` and `https://<admin-domain>/build.json`
- stale public behavior with a mismatched `build` means the website service or domain routing is not on the same deploy as admin

## Security Requirements

Before considering a deployment ready:

- change default credentials
- verify the security panel warning is gone
- verify `AUTH_FILE` points to persisted storage and not the container root filesystem
- keep `COOKIE_SECURE=true` in production
- keep admin on a separate domain/subdomain when possible
- avoid exposing internal automation or AI credentials anywhere in the client-facing admin

## Backup And Rollback

Before risky deployment or content migration work:

1. export a JSON backup from admin
2. copy or preserve the live `data.json`
3. preserve the current uploads directory

Rollback priority:

1. restore the previous application image/version in Coolify
2. restore the matching `data.json`
3. restore the matching uploads set

## Common Operational Notes

- Some remaining inline attributes in `menu.html` are intentional visibility hooks driven by JS.
- The smoke check will warn if fallback admin credentials are still in use.
- After the client changes credentials in the Security tab, the saved auth file becomes the active source of truth and overrides the original env credentials.
- The product is not yet a multi-tenant SaaS; treat each deployment as a client instance.

## Recommended Next Operational Improvement

The next deployment-related improvement should be a clearer importer/onboarding contract plus a repeatable content/media quality review before client launch, not more infrastructure complexity yet.
