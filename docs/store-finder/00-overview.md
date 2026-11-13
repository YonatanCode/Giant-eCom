# Store Finder — Overview (read this first)

Shared context for every `NN-*.md` step. Each step spec assumes you've read this file. **Execute the steps
in numeric order**, inline, in a single agent session each. No subagents, no worktrees, no branches, nothing
committed/pushed unless the user asks.

## Status

- **Status maintenance rule:** after every completed step, update this overview and the completed step's
  own `## Status` section before moving on.
- **Step 01 — Fetch live dealer data:** complete. `scripts/scrape-stores.mjs` now generates
  `src/data/stores-nl.ts` from Giant's live `/nl/stores/dealers` locator endpoint. Current dataset: 225
  dealers, including exactly 57 official Giant Stores. Validation passes; `Audise sprl` is the only expected
  near-border coordinate warning.
- **Step 02 — Map component:** complete. Shared OpenFreeMap style/pin helpers now live in
  `src/components/store/mapStyle.ts`; `OpenFreeMap` imports them unchanged; `StoreFinderMap` and
  `boundsOf()` are ready for the finder shell.
- **Step 03 — Finder shell + search:** complete. `/` now renders the client-side finder shell over
  `StoreFinderMap`, with shared finder utilities, browser geocoding, best-effort geolocation, clear-location
  handling, and selected-marker state. Verification passed with the finder logic test, `pnpm build`, and a
  browser smoke check against a fresh preview.
- **Step 04 — Filters:** complete. The updated Figma chip row is wired into `StoreFinder` with the current
  labels (`All`, `Giant bikes`, `Liv bikes`, `Test ride`, `Bike fitting`, `E-bike`, `Service & repair`) and
  AND filtering semantics. `Giant bikes`, `Liv bikes`, and `Service & repair` are cosmetic no-op chips.
  Verification passed with the finder logic test, `pnpm build`, and a browser
  measurement against the updated Figma panel metrics.
- **Step 05 — Results panel + store card:** complete. The located state now renders viewport-filtered,
  official-first, distance-sorted, scrollable store cards with official/partner avatars and active selection
  sync between list and map. Markers distinguish official, partner, selected, 60% zoom-band, and low-zoom dot variants; cards
  include real source tag pills, static open status, address/phone rows, and Giant/partner detail CTAs.
  Verification passed with the finder logic test, `pnpm build`, and browser smoke checks for landing/no-list,
  located/list, card-to-marker selection sync, and dynamic list updates after map zoom.
- **Step 06 — Detail page integration:** complete. `getStore` synthesizes every official Giant Store from
  `nlStores` over the authored Bennebroek template (real header/contact/map; shared placeholder body);
  partner/unknown slugs 404. Bennebroek slug unified to `giant-store-bennebroek`; `generateStaticParams`
  sources `officialStoreSlugs`. `pnpm build` generates all 57 official pages; verified Amsterdam renders real
  data and a partner slug is not generated.
- **Step 07 — States, polish & verification:** not started.
- **Step 08 — Real per-store content:** backlog (not scheduled). Documents the step-06 shortcut where 56 of
  57 official pages reuse the Bennebroek template body; only name/contact/map are real per store.

## What we're building

The **store finder** — the app's home page at `/` (`src/app/page.tsx`, currently a stub). From the Figma
file `W7HSN3Dg73m7QLr6Gplzgl`, three states of one screen:

1. **Landing** (node `490-1536`) — no location entered. All store pins on the map; the left panel shows
   only the title + search field + filter chips, **no result list**. Toggling filters changes **map markers
   only**.
2. **Location entered** (node `490-1537`) — map zooms to the searched region; matching stores are now
   listed in the panel, sorted by distance. Filters apply to **both** the map and the list.
3. **Store selected** (node `490-1535`) — clicking a list card or a map marker zooms the map to that store
   and gives the list card an **active state**.

A separate data task (step 01) fills the prototype with **real Dutch store data** from Giant's existing
`/nl/stores` locator endpoint (currently 225 dealers: 57 official Giant Stores + partner retailers). The
endpoint already returns the same coordinates and campaign/tag metadata used by the live Google Maps locator,
so we do **not** geocode addresses one by one.

During implementation, call the Figma MCP `get_design_context` on the three node IDs above for exact
spacing/typography. Screenshots confirm the layout: a 440px-wide left panel floating over a full-bleed map,
both below the existing site header.

## Tech & conventions

- **React 19 + Next.js 16 (App Router) + TypeScript + Tailwind v4 + maplibre-gl.** No component library.
  **No new npm dependencies** (org policy) — built-in `fetch` + Node stdlib only. If a dep ever were needed:
  `pnpm` with `--ignore-scripts`, and ask first.
- Style with **semantic token utility classes only** (never raw hex). The full token cheat-sheet lives in
  `docs/store-page/00-overview.md` ("Token cheat-sheet") — typography (`text-display-*`, `text-heading-*`,
  `text-body-*`, `text-action-*`), colors (`bg-base-surface`, `text-base-text-heading`, `border-base-border`,
  `bg-action-surface`, `text-action-text`, …), spacing (`gap-xs|s|sm|m|ml|l|xl`, `px-(--layout-page-padding)`).
- Icons are **inline SVG** in `src/components/store/icons/index.tsx` (a `PATHS` registry + `<Icon name size className/>`).
  Existing names: `service test-ride dcf coffee parking tune check arrow-right arrow-up-right chevron-down clock map-pin phone mail plus minus close`.
  The finder needs two more — add `search` and `locate` (my-location crosshair) to `PATHS` (step 03).
- Client interactivity requires `'use client'` at the top of the file (the finder + map + search are client).

## Reuse map (don't reinvent — these already exist)

| Need | Reuse | Path |
|------|-------|------|
| Map tiles + brand styling | `OpenFreeMap` internals — tile style URL `https://tiles.openfreemap.org/styles/liberty`, `applyBrandMapStyle`, palette, `setPaint`, `rgba` | `src/components/store/OpenFreeMap.tsx` (step 02 extracts these to `mapStyle.ts`) |
| The brand map pin variants | `createBrandPinElement`, `getStorePinType`, and shared map tokens in `mapStyle.ts` | `src/components/store/mapStyle.ts` |
| Filter chip | `ServiceChip` (`label`, `selected`, `onClick`; `aria-pressed`) | `src/components/store/ServiceChip.tsx` |
| Service/tag pill | `FeatureChip` (`icon`, `label`) | `src/components/store/FeatureChip.tsx` |
| Button / button-link | `Button` (`variant` primary\|secondary, `size` 32\|40\|48, `href` → `<a>`) | `src/components/store/Button.tsx` |
| Store detail data + lookup | `Store` type, `getStore(slug)`, `stores` | `src/data/store.ts` |

New finder code lives in **`src/components/finder/`**. Generated/derived data lives in **`src/data/`**.

## Data model (produced by step 01, consumed by 02–07)

```ts
// src/data/stores-nl.ts (generated)
export interface StoreListing {
  slug: string            // slugify(name), e.g. "giant-store-amsterdam"
  name: string
  isGiantStore: boolean   // has the "Giant Store" tag → official; else partner
  street: string
  postcode: string        // "1054 HT"
  city: string
  province: string        // 2-letter, e.g. "NH"
  phone: string
  email?: string
  website?: string        // normalized to https URL
  lat: number
  lng: number
  tags: string[]          // raw NL tags (see taxonomy below)
  detailHref: string      // Giant Store → `/store/<slug>`; partner → website URL (or "#")
}
export const nlStores: StoreListing[]
```

### Real tag taxonomy (from the source data)
`Giant Store` · `Premium Retailer` · `E-bike certificaat` · `E-bike Testcenter` · `DCF Supreme` ·
`DCF Essential` · `DCF Premium` · `Giant B2B Lease`. A store may have any subset (or none).

### Store classification (one rule, used everywhere)
**`isGiantStore` = `tags` includes `"Giant Store"`.** No partner retailer carries this tag, and it lines up
with the `Giant Store …` name prefix — so it cleanly isolates the **57 official stores**.
- Badge / type label: `isGiantStore` → **"Official Giant Retailer"**; else **"Authorised Partner"** (or
  "Premium Retailer" if the store has that tag — your call, keep it simple).
- `detailHref`: `isGiantStore` → **`/store/<slug>` (in-app)**; else → the store's **external `website`**
  (`target="_blank" rel="noreferrer"`), falling back to `"#"` when no website.

### Slug rule
`slugify(name)` = lowercase, strip accents/diacritics, replace non-alphanumerics with `-`, collapse repeats,
trim. e.g. `"Giant Store Arie's Bike Shop"` → `"giant-store-arie-s-bike-shop"`. Slugs must be unique; on a
collision append `-2`, `-3`, … Keep one shared `slugify()` in `src/components/finder/utils.ts`.

## Filter chips → tag mapping (decided with the user: keep Figma labels, map onto real tags)

The chips display the **Figma labels**; each maps to real `tags` for filtering:

| Chip label (Figma) | Matches a store when its `tags`… |
|--------------------|----------------------------------|
| `Giant bikes`      | all stores carry Giant bikes → **cosmetic/no-op** (never excludes) |
| `Liv bikes`        | — no data → **cosmetic/no-op** (never excludes) |
| `Test ride`        | include `E-bike Testcenter` |
| `Bike fitting`     | include any `DCF *` |
| `E-bike`           | include `E-bike certificaat` **or** `E-bike Testcenter` |
| `Service & repair` | always match (every shop services) → **effective no-op** |

Multiple active chips combine with **AND**. Keep this mapping in one place (`src/components/finder/filters.ts`
or `utils.ts`) so steps 04 and 02 share it. Document the no-op chips in a `// ponytail:` comment.

## State machine (owned by `StoreFinder`, step 03)

```
state = { location: {lat,lng,label} | null, activeFilters: Set<string>, selectedSlug: string | null }

filtered      = nlStores.filter(matchesAllActiveFilters)
withDistance  = location ? filtered.map(addHaversineKm(location)).sort(byDistance) : filtered

Landing   (location === null):      map shows `filtered` pins, fitBounds to NL; panel = no list
Located   (location !== null):      map shows `filtered` pins, fitBounds to region; panel lists `withDistance`
Selected  (selectedSlug !== null):  map flyTo selected store; that list card = active
```
Selecting from the list or the map sets `selectedSlug` (both stay in sync). Entering a new location clears
`selectedSlug`. Clearing the search returns to Landing.

## Data source note (for step 01)

Use Giant's live locator endpoint as the source of truth:
`POST https://www.giant-bicycles.com/nl/stores/dealers`. The `/nl/stores` page calls this endpoint after a
location search, and the response includes dealer coordinates, contact fields, `IsGiantStore`, and
`CampaignCodes`. `docs/store-finder/nl-stores.raw.txt` remains useful as a human-readable fallback snapshot,
but the generator should prefer the endpoint so we avoid slow and lossy per-address geocoding.
