# 12 — Brands ("Our brands")

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`627:5060`**.
> Sub-nodes: primary logos `627:5065`, gear header `627:5072`, gear logos `627:5076`.

Two logo rows: featured brands, then gear & components.

## Layout
- `Section bg="surface" id="brands"`.
- **Our brands**: title `store.brands.title` (`text-display-s`), then a row of 3 logo cells
  (`grid grid-cols-3`), each centering a brand logo (`store.brands.primary[]`) in a bordered/subtle tile.
- **Gear & components**: title `store.brands.gearTitle` (`text-heading-l`), then a 6-up row
  (`grid grid-cols-6 gap-sm`) of smaller logo tiles from `store.brands.gear[]`.
- Logos: `object-contain`, grayscale-ish, centered, fixed tile height. Use placeholder `<img>` for the mock.

## Data
`store.brands` (`title, primary[], gearTitle, gear[]` → `{ name, logo }`).

## Tokens
`text-display-s`, `text-heading-l`, tiles `bg-base-surface-subtle rounded-[8px]` (optional), `gap-sm`.

## Responsive
≤768px: primary → 1–2 per row; gear → 3 per row then 2.

## Checklist
- [ ] `Brands.tsx`
- [ ] Two logo rows (3-up primary, 6-up gear)
- [ ] Logos centered/contained; stacks on mobile
- [ ] Matches node `627:5060`

**Done when:** brand and gear logo rows render centered in tiles.
