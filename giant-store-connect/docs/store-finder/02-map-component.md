# Step 02 — Map component

**Goal:** a multi-marker, brand-styled finder map that reuses the existing OpenFreeMap implementation.
Read `00-overview.md` first. Depends on step 01 (`StoreListing`).

## Status

**Complete.** Extracted the shared OpenFreeMap style/pin helpers to `src/components/store/mapStyle.ts`,
rewired `OpenFreeMap.tsx` with no behavior change, and added `src/components/finder/StoreFinderMap.tsx`
plus `boundsOf()` in `src/components/finder/utils.ts`.

Verification: `pnpm build` passes. `/store/giant-bennebroek#directions` was checked on a fresh
`next start` preview; the Directions map rendered branded OpenFreeMap tiles and the shared brand pin.

## 2a. Extract the shared map style (no behavior change to the store page)

`src/components/store/OpenFreeMap.tsx` currently holds the tile style + brand styling inline. Move the
**reusable, non-component** parts into a new `src/components/store/mapStyle.ts` and import them back:

- `OPENFREEMAP_STYLE` (`'https://tiles.openfreemap.org/styles/liberty'`)
- `TEXT_LAYERS` array
- `applyBrandMapStyle(map)`, `getBrandMapPalette()`, `isWaterwayLayer`, `isRoadLayer`, `setPaint`, `rgba`

Also export the **brand pin factory** so both maps share the Figma map pin variants:

```ts
// mapStyle.ts
export type StorePinType = 'giant' | 'partner' | 'selected' | 'selectedPartner' | 'giantDot' | 'partnerDot'
export function createBrandPinElement(opts?: {
  selected?: boolean
  label?: string
  type?: StorePinType
  presentation?: 'pin' | 'smallPin' | 'dot'
}): HTMLElement
```
Official pins use `--color-primary` with the Rush mark, non-Giant pins use `--color-base-icon-subtle`
with a `--color-light` dot, selected official/non-Giant stores render as separate Figma variants, and unselected
markers step from full pins to 60% pins to compact dots as the map zooms out.

After extraction, `OpenFreeMap.tsx` imports from `mapStyle.ts` and behaves identically — **verify the store
page Directions map still renders** (`/store/giant-store-bennebroek` → Directions section).

## 2b. `src/components/finder/StoreFinderMap.tsx` (`'use client'`)

Reuses `mapStyle.ts`. Props:

```ts
{
  stores: StoreListing[]          // already filtered by the parent
  selectedSlug: string | null
  onSelect: (slug: string) => void
  view: { bounds: [[number,number],[number,number]] }   // Landing/Located: fit these
        | { center: [number,number], zoom: number }       // Selected: fly here
}
```

Behavior:
- Create the map once (`maplibregl.Map` with `OPENFREEMAP_STYLE`, `attributionControl: false`), add a
  `NavigationControl({ showCompass: false })`, and on `load` call `applyBrandMapStyle(map)`. Mirror the
  setup in `OpenFreeMap.tsx`.
- **Markers:** one `maplibregl.Marker` per `stores[i]` via `createBrandPinElement` +
  `getStorePinType(store, selected, presentation)`. `scaleMarkersByViewport` keeps selected stores as pins
  and uniformly steps unselected stores from full pins (`zoom >= 10`) to 60% pins (`8 <= zoom < 10`) to
  center-anchored dots (`zoom < 8`). Marker click → `onSelect(store.slug)`.
  Keep a `slug → marker` map in a ref so updates are diffable. // ponytail: DOM markers are fine for a few
  hundred pins; if it grows, switch to a GeoJSON source + symbol layer.
- **Reconcile on prop change** (in a `useEffect` on `stores`): add markers for new slugs, remove markers for
  gone slugs. On `selectedSlug` change, swap that marker's element for the official `selected` or
  non-Giant `selectedPartner` variant (and the previously-selected back to normal).
- **Camera:** when `view` is `bounds` → `map.fitBounds(bounds, { padding: { left: 480, top: 40, right: 40, bottom: 40 } })`
  (left padding clears the 440px panel). When `view` is `center/zoom` → `map.flyTo({ center, zoom })`.
  Guard camera moves until the style has loaded.
- Clean up with `map.remove()` on unmount.

Compute the `bounds` for a set of stores with a small helper in `utils.ts`
(`boundsOf(stores): [[minLng,minLat],[maxLng,maxLat]]`); the parent decides whether to pass bounds (Landing/
Located) or center/zoom (Selected).

## Files
- **Create:** `src/components/store/mapStyle.ts`, `src/components/finder/StoreFinderMap.tsx`.
- **Modify:** `src/components/store/OpenFreeMap.tsx` (import the extracted helpers; no visual change).

## Done when
The store-page Directions map is unchanged, and `StoreFinderMap` (dropped onto a scratch page or wired in
step 03) renders all pins, fits bounds, recolors the selected pin, and fires `onSelect` on marker click.
