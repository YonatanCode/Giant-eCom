# 01 — Hero (+ top navigation + in-page nav)

> Read [`00-overview.md`](./00-overview.md) first. Figma file `W7HSN3Dg73m7QLr6Gplzgl`.
> Nodes: **Hero `554:3279`**, top nav `554:3314`, in-page anchor nav `554:3315`, side panel `554:3283`.
> Pull the visual: `get_design_context` / `get_screenshot` with those node ids.

This is the biggest section — it contains three pieces. Build the side panel as a **shared** component
(`StoreSidePanel`) because the Directions section (09) reuses it.

## Pieces

### A. Top navigation — `Navigation.tsx` (node `554:3314`)
- Full-width bar, 64px tall, on `bg-base-surface`, bottom `border-base-border`.
- Left: burger icon (`icons/Burger`), menu items (`text-nav-s`): Bikes, Gear, Service, Brands, Stores.
- Center: Giant signature/logo (uppercase `font-display`, `text-heading-l text-primary`) — reuse the look from `LayoutShell.tsx` header.
- Right: "Find a store" `Button` (secondary, size 32), profile icon, cart icon + count badge.
- Mobile: collapse menu behind the burger (no dropdown logic needed for mock — just show burger, hide inline menu ≤768px).

### B. In-page anchor nav — `InPageNav.tsx` (node `554:3315`)
- Sticky bar (`sticky top-0 z-10`), 64px, `bg-base-surface` + bottom border, jump-links to section ids.
- Links (`text-nav-s`, `text-action-text-navigation`): Service, About, Inventory, DCF, Directions, FAQ, News, Brands.
- Active/hover underline via `text-action-text-hover`. Horizontal-scroll on overflow (mobile), no wrap.
- Targets: give each `Section` an `id` matching these anchors (`#service`, `#about`, …).

### C. Hero — `Hero.tsx` (node `554:3279` / image `554:3280`)
- Full-bleed hero image (`store.hero.image`), ~480px tall, rounded corners, slight dark overlay.
- Overlaid **side panel** (top-left, ~440px wide) = `StoreSidePanel`, on a translucent/blurred light surface
  (`bg-base-surface/90` + `backdrop-blur`), rounded `rounded-[8px]`, padding `p-m`.

### D. Shared — `StoreSidePanel.tsx` (node `554:3283`) — used here and in Directions
- **Header:** store-type icon (`icons/StoreType`, 48px) + title block: label (`store.hero.label`, `text-action-s` uppercase, muted) and store name (`store.name`, `text-heading-l`).
- **Detail rows** (`text-body-s`, icon 16px + text, `gap-xs`):
  - Clock → `store.contact.openStatus` (+ small status dot + chevron-down)
  - Location → `store.contact.address`
  - Phone → `store.contact.phone`
  - Message → `store.contact.email`
- **Features:** 2-column grid of `FeatureChip` from `store.features` (icon 16 + label `text-body-s`).
- **Action row:** two `Button`s — primary "Directions" + secondary "Call" (or "Contact"), size 40.

## Data
`store.hero`, `store.name`, `store.contact`, `store.features`. (`Store` from `src/data/store.ts`.)

## Tokens
Surface `bg-base-surface`, borders `border-base-border`, nav text `text-nav-s`, heading `text-heading-l`,
detail text `text-body-s text-base-text`, muted `text-base-text-muted`. Spacing `gap-xs`/`gap-s`, panel `p-m`.

## Responsive
≤768px: hero image shorter; side panel becomes full-width below/over the image (not absolutely positioned).
Top nav collapses to burger + logo + cart. In-page nav scrolls horizontally.

## Checklist
- [ ] `Navigation.tsx`, `InPageNav.tsx`, `Hero.tsx`, shared `StoreSidePanel.tsx`
- [ ] Anchor links scroll to section `id`s (offset for the sticky bar)
- [ ] Brand switch (Giant/Liv) still recolors logo/buttons
- [ ] No horizontal overflow on mobile

**Done when:** hero matches node `554:3279`, nav + sticky in-page nav render, side panel is reusable by Directions.
