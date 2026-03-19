# Media Library

This folder is the local seller-side asset library workspace.

It is intended for:

- reusable hero images
- reusable gallery/atmosphere images
- reusable product images
- generated assets that become approved reusable assets later

Recommended next expansion:

- keep generated, curated, client, and placeholder assets under slot-based subfolders
- keep metadata in the local runtime file `catalog/catalog.json`
- use `catalog/catalog.example.json` as the committed schema/reference copy
- move toward deterministic recipe-key matching for product assets
- approve generated assets before allowing automatic reuse across projects

See [LOCAL_IMAGE_LIBRARY_PLAN.md](../LOCAL_IMAGE_LIBRARY_PLAN.md) for the planned architecture.
