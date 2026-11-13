# 05 — Story / About (DARK)

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`554:3365`** (parent `554:3816`).
> Sub-nodes: text `554:3366`, stats `554:3375`, gallery `554:3828`.

**Dark section.** Three stacked blocks: about text, store stats, image gallery.

## Layout
- `Section bg="dark" id="about"`. Root carries `dark` so semantic colors invert.
- **About text** (`554:3366`): 2-col — left header column (~220px), right text column (~776px).
  - Left: eyebrow `store.about.eyebrow` (`text-action-s`), title `store.about.title` (`text-display-s`),
    then **specialties**: label `store.about.specialtiesLabel` (`text-heading-s`) + list of `FeatureChip`
    (check icon + label) from `store.about.specialties`.
  - Right: paragraphs `store.about.paragraphs[]` (`text-body-l text-base-text`).
- **Store stats** (`554:3375`): horizontal row of 3 `StatCard` separated by vertical `Divider` lines.
  Each StatCard: value (`text-display-s`/`text-display-m`) + label (`text-body-s text-base-text-muted`).
- **Gallery** (`554:3828`): masonry-ish grid — 1 large image left (~592px) + 4 smaller images in a 2×2 grid right.
  Use CSS grid: `grid-cols-[592px_1fr]` desktop; images `rounded-[8px] object-cover`. From `store.about.gallery[]` (5 images).

## Data
`store.about` (`eyebrow, title, specialtiesLabel, specialties[], paragraphs[], stats[], gallery[]`).

## Tokens
Dark root. `text-action-s`, `text-display-s/m`, `text-body-l/s`, `text-base-text-muted`, divider `bg-base-border-divider`.
Spacing between blocks `gap-xl`/`mt-xl`.

## Responsive
≤768px: about text → 1 col; stats stack or scroll (drop dividers, use `gap`); gallery → simple 2-col then 1-col.

## Checklist
- [ ] `Story.tsx` + local `StatCard` (+ a small `Divider`)
- [ ] Dark colors correct (light text on dark surface)
- [ ] Gallery layout: 1 large + 4 small
- [ ] Matches node `554:3365`

**Done when:** dark about section renders text, 3 stats with dividers, and 5-image gallery.
