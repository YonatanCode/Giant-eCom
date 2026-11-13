# Step 03 — Finder shell + search

**Goal:** the stateful client container that owns the state machine, plus the location search field.
Read `00-overview.md` first. Depends on 01 (`nlStores`) and 02 (`StoreFinderMap`).

## Status

**Complete.** Added the shared finder utilities, stateful `StoreFinder` shell, Nominatim-backed
`SearchInput`, search/locate icons, and `/` route wiring. The filter predicate exists so the shell can derive
`filtered`; the visible chip row remains step 04, and the result list remains step 05.

Verification: `node --test src/components/finder/finder.logic.test.mjs` and `pnpm build` pass. Browser smoke
check on a fresh `next start` preview confirmed `/` renders the panel over the full-NL map with 225 markers,
and searching `Utrecht` reaches the located state with a clear-location affordance.

## 3a. Shared utils — `src/components/finder/utils.ts`

- `slugify(name): string` — per the 00-overview rule (used by step 01 too; keep one copy and import it
  there if convenient, else keep identical logic).
- `haversineKm(a, b): number` — great-circle distance between `{lat,lng}` points.
- `boundsOf(stores): [[minLng,minLat],[maxLng,maxLat]]` — with a sensible fallback for 0/1 stores
  (e.g. a small box around the single point; for 0 stores return NL bounds `[[3.3,50.7],[7.3,53.6]]`).
- `NL_BOUNDS` constant for the Landing camera.

## 3b. Container — `src/components/finder/StoreFinder.tsx` (`'use client'`)

State (per 00-overview state machine):
```ts
location: { lat:number, lng:number, label:string } | null
activeFilters: Set<string>            // Figma chip labels
selectedSlug: string | null
geocodeStatus: 'idle' | 'loading' | 'error'
```
Derived (memoized):
- `filtered` = `nlStores` filtered by `matchesAllActiveFilters` (step 04's `filters.ts`).
- `withDistance` = `location ? filtered.map(s => ({...s, distanceKm: haversineKm(location, s)})).sort by distanceKm : filtered`.
- `view` for the map: `selectedSlug` → `{center:[lng,lat], zoom:14}` of the selected store; else `location`
  → `{bounds: boundsOf(filtered)}`; else → `{bounds: NL_BOUNDS}`.

Handlers:
- `onLocationChange({lat,lng,label})` → set `location`, clear `selectedSlug`.
- `onClearLocation()` → `location=null`, `selectedSlug=null` (back to Landing).
- `onToggleFilter(label)` → add/remove in `activeFilters` (new `Set`).
- `onSelect(slug)` → set `selectedSlug` (from list OR map; keep both in sync — the same handler).

Layout (match Figma; reuse existing tokens):
- Full-bleed region under the site header. `StoreFinderMap` fills the background; the **panel** is an
  absolutely-positioned card, `w-[440px]`, top-left with `m-m`-ish offset, `bg-base-surface`, rounded,
  `shadow`, max-height to viewport with the list area scrolling.
- Panel contents top→bottom: title **"Find a Giant retailer"** (`text-heading-l`/`text-display-s` per
  design), `<SearchInput/>`, `<FilterChips/>` (step 04), then `<StoreList/>` (step 05) **only when
  `location !== null`**.
- Note: `LayoutShell` already renders the top header for non-`/store/` routes, so the finder sits beneath it.
  Ensure the full-bleed map height accounts for the header (e.g. `h-[calc(100vh-<header>)]`).

Pass `filtered` (Landing) or `withDistance` (Located/Selected) to the map and list as appropriate, plus
`selectedSlug`, `onSelect`, and `view`.

## 3c. Search — `src/components/finder/SearchInput.tsx` (`'use client'`)

Matches Figma input (node `0:45`): rounded field, placeholder **"Plaats of postcode"** (NL) with a
**my-location** icon, a divider, and a **search** icon on the right.

- First add two icons to `src/components/store/icons/index.tsx` `PATHS`: `search` (magnifier) and `locate`
  (crosshair / my-location). Keep the registry's stroke style (24×24, `currentColor`, `strokeWidth 1.75`).
- On submit (Enter or search-icon click): set status `loading`, geocode the typed text via Nominatim from
  the **browser**:
  `https://nominatim.openstreetmap.org/search?format=jsonc&limit=1&countrycodes=nl&q=<text>` →
  call `onLocationChange({lat,lng,label: text})`. On no result/error → status `error`, show a small inline
  message. // ponytail: no debounce/autocomplete — submit-to-geocode is enough for the prototype; add
  typeahead only if asked.
- My-location button → `navigator.geolocation.getCurrentPosition` → `onLocationChange({...coords, label:'Mijn locatie'})`.
  // ponytail: best-effort — if denied/unsupported, no-op with a tooltip; don't block the field.
- When a location is set, show a clear/× affordance to return to Landing (`onClearLocation`).

## Files
- **Create:** `src/components/finder/utils.ts`, `src/components/finder/StoreFinder.tsx`, `src/components/finder/SearchInput.tsx`.
- **Modify:** `src/app/page.tsx` (replace the stub with `<StoreFinder/>`), `src/components/store/icons/index.tsx` (add `search`, `locate`).

## Done when
`/` shows the panel over a full-NL map with all pins (Landing). Typing a place + submit geocodes, sets
`location`, and the map fits the region (list appears once step 05 is in). My-location works or fails
gracefully.
