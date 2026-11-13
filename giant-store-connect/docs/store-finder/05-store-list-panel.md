# Step 05 — Results panel + store card

**Goal:** the scrollable results list and the selectable store card with its active state. Read
`00-overview.md` first. Depends on 01–04. Figma: "Selectable card" node `480:1106`; active state in `490-1535`.

## Status

**Complete.** `StoreFinder` now renders a viewport-filtered, official-first, distance-sorted, scrollable
results list after a location is set, with selectable cards, official/partner avatars, active-card
scroll-into-view, real tag pills, static open status, address/phone rows, and Giant/partner detail CTAs. Map
markers now distinguish official, partner, selected, 60% zoom-band, and low-zoom dot variants. Verification passed with the
finder logic test, `pnpm build`, and browser smoke checks for landing/no-list, located/list, card-to-marker
selection sync, and dynamic list updates after map zoom.

## 5a. `src/components/finder/StoreList.tsx`

- Renders **only when a location is set** (Landing shows no list — `StoreFinder` already gates this).
- Scrollable column (`overflow-y-auto`, the panel caps height) of `StoreCard`s, in the distance-sorted
  order passed in.
- Props: `{ stores: (StoreListing & { distanceKm:number })[]; selectedSlug: string|null; onSelect:(slug)=>void }`.
- **Empty state:** when `stores.length === 0` (filters excluded everything in the region), show a short
  message ("No stores match these filters") instead of an empty scroll area.

## 5b. `src/components/finder/StoreCard.tsx`

One card per store. Structure (top→bottom), reusing existing tokens/components:

1. **Header row:** brand badge (the small `--color-action-surface` circle with `/images/giant-logo-mark.svg`,
   as in `Directions.tsx`'s `StoreTypeBadge`) + a two-line block — small type label + store name — and the
   **distance** right-aligned (`{distanceKm.toFixed(1)} km`).
   - Type label: `isGiantStore` → **"Official Giant Retailer"**; else **"Authorised Partner"**.
2. **Address** line (`text-body-m`): `"<street>, <postcode> <city>"`.
3. **Tag pills:** render the store's real `tags` as pills — reuse **`FeatureChip`** styling (or its markup)
   for the rounded-pill look. (These are the real NL tags, e.g. `E-bike Testcenter`, `DCF Premium`.)
4. **Info rows** with `Icon`s: `clock` + open-status (use a static "Open now" style line — there are no
   real opening hours in the data; // ponytail: static status, swap for real hours if ever scraped),
   `map-pin` + address, `phone` + phone.
5. **CTA** — `Button` "View store details" linking to `store.detailHref`:
   - `isGiantStore` → internal `/store/<slug>` (plain link is fine; it's same-origin).
   - else → external `website` with `target="_blank" rel="noreferrer"` (fallback: hide the button if no website).

**Selectable behavior:**
- The whole card is clickable → `onSelect(store.slug)` (also selects the matching map marker via shared
  state). Keep the CTA link click from double-firing (stopPropagation on the link, or make the card a
  button and the CTA a nested link).
- **Active state** when `store.slug === selectedSlug`: emphasized border (`border-action-border`) /
  subtle background, matching Figma `490-1535`. Scroll the active card into view when it becomes selected
  (e.g. `ref.scrollIntoView({ block:'nearest' })`).

## Files
- **Create:** `src/components/finder/StoreList.tsx`, `src/components/finder/StoreCard.tsx`.
- **Modify:** `src/components/finder/StoreFinder.tsx` (render `StoreList` when `location` set; pass
  `withDistance`, `selectedSlug`, `onSelect`).

## Done when
With a location entered, the panel lists distance-sorted cards; clicking a card flies the map to that store
and marks the card active; the map marker click marks the same card; Giant Store CTAs go in-app and partner
CTAs open the external site in a new tab.
