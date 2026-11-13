# 09 — Directions ("Visit the store")

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`554:3390`**.
> Sub-nodes: header `554:3391`, map `554:3399` (embedded panel `822:6552`, pin `560:2724`), store data `554:3402`.

Header + a map area + a 3-column data block (hours / directions / parking).

## Layout
- `Section bg="surface" id="directions"`.
- **Header** (`554:3392`): 2-col — left eyebrow `store.directions.eyebrow` (`text-action-s`) + title (`text-display-s`); right intro `store.directions.intro` (`text-body-l`).
- **Map** (`554:3399`): full-width static map image (`store.directions.map.image`, `rounded-[8px]`, ~390px tall).
  Overlay a compact **`StoreSidePanel`** variant (reuse the shared component, smaller) + a `MapPin` icon.
  For the mock, a static image + overlaid panel is fine (no live map SDK — flag if a real map is wanted later).
- **Store data** (`554:3402`): 3 columns (`grid grid-cols-3 gap-xl`):
  - **Opening hours**: heading (`text-heading-l`) + a 2-column day/hours table from `store.directions.openingHours[]` (`text-body-s`).
  - **Directions**: heading + "By public transport" (`store.directions.byTransport`) + "By car" (`store.directions.byCar`) paragraphs.
  - **Parking**: heading + `store.directions.parking`.

## Data
`store.directions` (`eyebrow, title, intro, map, openingHours[]`, `byTransport, byCar, parking`) + `store` (for the reused side panel).

## Tokens
`text-action-s`, `text-display-s`, `text-heading-l`, `text-body-l/s`, `text-base-text-muted`, `gap-xl`.

## Responsive
≤768px: header → 1 col; data columns stack; map full-width, panel below or static.

## Checklist
- [ ] `Directions.tsx` reusing shared `StoreSidePanel`
- [ ] Opening-hours table, directions, parking columns
- [ ] Stacks on mobile
- [ ] Matches node `554:3390`

**Done when:** map with overlaid store panel + 3 info columns render. (Real map SDK is out of scope — static image.)
