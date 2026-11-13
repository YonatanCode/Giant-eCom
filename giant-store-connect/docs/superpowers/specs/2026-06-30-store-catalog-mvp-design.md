# Store-pinned category catalog (MVP)

**Date:** 2026-06-30
**Status:** Approved design — ready for implementation plan
**Type:** PoC / prototype-quality feature (mock data, no backend)

## Goal

Inventory cards on the store page link to an e-commerce catalog page that is
pinned to that store via a "range" filter, so the visitor sees only that store's
inventory. The catalog page is ported from the standalone `../Giant-PLP`
prototype (one HTML file + a ~100KB JS file) and rebuilt to this project's
standards: design-system tokens, text styles, React/Next components, no raw hex,
no Google Fonts link.

## Scope (decisions)

- **Fidelity:** Minimal MVP. Product grid + the store-pin "range" state. Filter
  UI renders but is **static / non-interactive** for now.
- **One category:** Mountain bikes is the only catalog in the prototype, so every
  inventory card links to the same page. No dynamic category routing.
- **Range pin:** query param `?store=<slug>`. The catalog reads it, resolves the
  store name, shows the "Available near me" filter pre-pinned to that store, and
  labels each product "Available at <store name>".
- **Products:** the 8 mock bike products from the prototype, reused as-is. Remote
  giant-bicycles.com CDN image URLs kept.
- **Availability semantics (mock):** pinning shows **all** products as in-stock at
  the store with an "Available at <store>" line. No distance math, no per-store
  stock data.

## Architecture

Plain Next build (no static export), so dynamic `searchParams` and server
components work normally. Because the MVP filter UI is static, **the whole page is
server-rendered with zero client JS.**

### Route
`src/app/catalog/page.tsx` — server component.
- Reads `searchParams.store`.
- Resolves the store via existing `getStore(slug)` → store name. No/invalid
  `store` → page still renders, just without the pinned state and availability
  line.
- Title hardcoded "Mountain bikes". Static breadcrumb: Home › Bikes › Mountain
  bikes.

### Inventory wiring
`src/components/store/Inventory.tsx`: each `CollectionCard` href is derived in the
component as `/catalog?store=${store.slug}` (replaces today's `href: '#'`). The
`href` field in `bennebroek.ts` data is left untouched — derived at render, so no
per-card data edits.

### Components — `src/components/catalog/`
- `ProductCard.tsx` — tag/award badge, product image (first color, static),
  static color swatches (visual only), title, description, price, the
  "Available at <store>" line.
- `FiltersPanel.tsx` — static, non-interactive filter groups using tokens:
  Available near me (pinned chip), Size, Sale, Price range, Color. Visual only.
- `CatalogHeader.tsx` — breadcrumb + H1 + results count + static sort/filter
  toolbar.
- `ProductGrid.tsx` — maps products → `ProductCard`.

### Data
`src/data/catalog-products.ts` — the 8 products ported and trimmed to the card's
needs: `{ id, title, url, description, price, tag?, award?, colors[{ label, hex,
image }] }`.

### Nav
Reuse existing `StoreTopNav` (Bikes/Gear/Discover/Find-a-store already matches the
prototype header). One line in `LayoutShell` to render it on `/catalog`.

### Assets
Copy `badge.png` (award badge) to `public/`. Product photos load from the remote
CDN via plain `<img>` (matches the existing `Inventory.tsx` pattern).

### Tokens
All spacing/color/type from `globals.css`: `text-product-title-m`, `text-price-l`,
`text-base-text-muted`, commerce badge colors (`bg-commerce-surface-new` /
`text-commerce-text-new` for "New"), `gap-sm`/`gap-ml`, etc. No raw hex, no
external font links.

## Explicitly skipped (add when needed)

Functional sort, working filters, mobile filter drawer, compare + tooltips,
hover-image swap, color switching, distance slider, the prototype's split-scroll
wheel choreography. The filter panel renders so the page reads as complete;
interactivity is a later pass.

## Done when

- An inventory card on a store page links to `/catalog?store=<that store>`.
- `/catalog?store=giant-bennebroek` renders the Mountain bikes catalog: header,
  breadcrumb, static filter panel with the store pinned, and the 8 products each
  showing "Available at Giant Bennebroek".
- Everything uses project tokens/text styles; no Google Fonts link, no raw hex.
- Page builds and renders with no client-JS errors.
