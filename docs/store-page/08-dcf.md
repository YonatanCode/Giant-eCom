# 08 — DCF (Dynamic Cycling Fit) (DARK)

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`554:3925`**.
> Sub-nodes: header `554:3926`, process timeline `557:2654` (step `557:2655`), tier `559:2667`.

**Dark section.** Header + a 5-step horizontal timeline + a tier feature block.

## Layout
- `Section bg="dark" id="dcf"`.
- **Header** (`554:3926`): left — DCF logo (use `text-display-s` "DCF" text or a `Logo/DCF` placeholder) + title
  `store.dcf.title` (`text-display-s`); right — `store.dcf.intro` (`text-body-l`) and `store.dcf.body` (`text-body-m text-base-text-muted`). 2-col.
- **Process timeline** (`557:2654`): 5 `TimelineStep` in a row (`grid grid-cols-5 gap-ml`). Each step:
  step number/marker, title (`text-heading-m`), description (`text-body-s text-base-text-muted`). A connecting
  line between markers is a nice touch (border-top). From `store.dcf.steps[]`.
- **DCF tier** (`559:2667`): 2-col — image left (`559:2682`, `rounded-[8px]`) + text block right:
  eyebrow `store.dcf.tier.eyebrow` (`text-action-s`), title (`text-display-s`), body (`text-body-m`),
  primary `Button` (size 48) = `store.dcf.tier.cta`.

## Data
`store.dcf` (`eyebrow, title, intro, body, steps[]`, `tier{ eyebrow, title, body, image, cta }`).

## Tokens
Dark root, `text-action-s`, `text-display-s`, `text-body-l/m/s`, `text-base-text-muted`. DCF accent `bg-commerce-surface-dcf` (lime) for step markers if it matches the design.

## Responsive
≤768px: header → 1 col; timeline → 2-col or vertical list; tier → stack image above text.

## Checklist
- [ ] `Dcf.tsx` + `TimelineStep.tsx`
- [ ] 5-step timeline, tier block with image + CTA
- [ ] Dark theme correct
- [ ] Matches node `554:3925`

**Done when:** DCF header, 5 timeline steps, and tier feature block render dark-themed.
