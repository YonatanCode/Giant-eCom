# Step 04 — Filters

**Goal:** the filter chips and the filtering logic. Read `00-overview.md` first (the chip→tag mapping table
lives there). Depends on 01 (`nlStores`/`tags`) and 03 (`activeFilters` state).

## Status

**Complete.** Added `filters.ts`, the token-aligned `FilterChips` row, and filter toggle wiring in
`StoreFinder`. Labels were synced to the updated Figma copy: `All`, `Giant bikes`, `Liv bikes`, `Test ride`,
`Bike fitting`, `E-bike`, `Service & repair`.

`Giant bikes`, `Liv bikes`, and `Service & repair` are cosmetic no-op chips; all listed retailers carry
Giant bikes, and the source data does not distinguish Liv/service availability.

Verification: `node --test src/components/finder/finder.logic.test.mjs` and `pnpm build` pass. Browser
measurement on a fresh preview confirmed the updated panel metrics from Figma: 440×272 panel, 392×53 input,
24/30 heading, 34px filter chips, and 225 map markers on Landing.

## 4a. Mapping + predicate — `src/components/finder/filters.ts`

Encode the mapping table from `00-overview` once:

```ts
export const FILTER_CHIPS = [
  'All', 'Giant bikes', 'Liv bikes', 'Test ride', 'Bike fitting', 'E-bike', 'Service & repair',
] as const

// Figma label → predicate over a store's tags. // ponytail: Giant/Liv/service have no distinguishing source
// tags → always-true no-ops; kept for visual parity with the Figma chip row.
const MATCHERS: Record<string, (tags: string[]) => boolean> = {
  'All':              () => true,
  'Giant bikes':      () => true,
  'Liv bikes':        () => true,
  'Test ride':        t => t.includes('E-bike Testcenter'),
  'Bike fitting':     t => t.some(x => x.startsWith('DCF')),
  'E-bike':           t => t.includes('E-bike certificaat') || t.includes('E-bike Testcenter'),
  'Service & repair': () => true,
}

export function matchesAllActiveFilters(store: StoreListing, active: Set<string>): boolean {
  for (const label of active) if (!MATCHERS[label]?.(store.tags)) return false
  return true   // AND across active chips; empty set → everything matches
}
```

## 4b. Chip row — `src/components/finder/FilterChips.tsx`

- Render a chip per `FILTER_CHIPS` using the existing **`ServiceChip`** (`src/components/store/ServiceChip.tsx`)
  — pass `label`, `selected={active.has(label)}`, `onClick={() => onToggle(label)}`. The chip already
  handles `aria-pressed` and the selected border style.
- Layout: wrapping flex row matching Figma (two rows of chips, `gap-xs`/`gap-s`). Optional small "Looking
  for:" label above (Figma node `480:1096`).
- Props: `{ active: Set<string>; onToggle: (label:string)=>void }`.

## 4c. Wire-up

`StoreFinder` already derives `filtered = nlStores.filter(s => matchesAllActiveFilters(s, activeFilters))`.
Confirm:
- **Landing:** filters change **map pins only** (no list rendered).
- **Located/Selected:** the same `filtered` (then distance-sorted) drives **both** map and list.
- If the active filters exclude the currently `selectedSlug` store, clear `selectedSlug`.

## Files
- **Create:** `src/components/finder/filters.ts`, `src/components/finder/FilterChips.tsx`.
- **Modify:** `src/components/finder/StoreFinder.tsx` (consume `matchesAllActiveFilters`).

## Done when
Toggling chips changes the visible pins on Landing, and changes both pins and the list once a location is
set. `Giant bikes` / `Liv bikes` / `Service & repair` never reduce results (documented no-ops).
