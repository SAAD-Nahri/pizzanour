# Deployment Notes

See [README.md](./README.md) for the full deployment workflow.

Recommended production domains for this app:

- website: `foody.ibnbatoutaweb.com`
- admin: `admin.foody.ibnbatoutaweb.com`

Recommended Coolify process:

1. Deploy with generated domains first.
2. Verify both generated HTTPS URLs work.
3. Switch website to `https://foody.ibnbatoutaweb.com:3002`.
4. Switch admin to `https://admin.foody.ibnbatoutaweb.com:3102`.
5. Enable GitHub auto-deploy with `COOLIFY_WEBHOOK_PROD` and `COOLIFY_TOKEN_PROD`.
