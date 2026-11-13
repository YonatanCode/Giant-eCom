# 07 — Inventory ("Store inventory")

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`791:2959`** (grid `791:2963`, card `791:2967`).

Three category groups (Bikes / Gear / Other) of collection cards, side by side, each group internally a grid.

## Layout
- `Section bg="surface" id="inventory"`.
- Header (`791:2960`): eyebrow `store.inventory.eyebrow` (`text-action-s`) + title `store.inventory.title` (`text-display-s`).
- **Collection grid** (`791:2963`): 3 columns of differing widths — Bikes (widest, 3-col internal grid),
  Gear (2-col internal grid), Other (1-col). Use `grid grid-cols-[584px_379px_173px]` or
  `grid-cols-[3fr_2fr_1fr]` desktop with `gap-ml`.
- Each group: group title (`text-heading-l`) + a grid of `CollectionCard`.
- **`CollectionCard`**: image (`rounded-[8px] object-cover`), title overlaid or below (`text-product-title-m`),
  optional `badge` (`store.inventory…cards[].badge`) styled `bg-commerce-surface-new text-commerce-text-new`
  (or `dcf` variant). Cards link to `card.href`.

## Data
`store.inventory` (`eyebrow, title, groups[]` → `{ title, cards[] }`, card `{ title, image, href, badge? }`).

## Tokens
`text-action-s`, `text-display-s`, `text-heading-l`, `text-product-title-m`, commerce badge colors, `gap-ml/sm`.

## Responsive
≤768px: stack the 3 groups vertically; each group's internal grid → 2 cols then 1.

## Checklist
- [ ] `Inventory.tsx` + `CollectionCard.tsx`
- [ ] 3 groups with differing widths; badges render
- [ ] Stacks on mobile
- [ ] Matches node `791:2959`

**Done when:** Bikes/Gear/Other groups render their cards in the asymmetric layout.
