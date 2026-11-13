# 03 — Service ("Book an appointment")

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`615:4850`** (content `615:4851`).

Two-column section: text + service picker on the left, image on the right.

## Layout
- `Section` `bg="surface"`, `id="service"`. Inner grid: 2 cols (`grid grid-cols-2 gap-xl`), each ~600px.
- **Left** (`615:4852`), stacked `gap-l`:
  - Header: eyebrow `store.service.eyebrow` (`text-action-s` uppercase) + title `store.service.title` (`text-display-s`).
  - Body paragraph `store.service.body` (`text-body-l text-base-text-muted`).
  - **Service booking** (`615:4859`): sub-heading `store.service.bookHeading` (`text-heading-m`), then a
    wrapping row of `FeatureChip`-style selectable chips from `store.service.services` (icon + label, bordered pill).
    Then a primary `Button` (size 48) = `store.service.cta`.
- **Right** (`615:4873`): single image (`store.service.image`), fills column, `rounded-[8px]`, `object-cover`, full height.

## Data
`store.service` (`eyebrow, title, body, bookHeading, services[], cta, image`).

## Tokens
`text-action-s`, `text-display-s`, `text-body-l`, `text-heading-m`, chips bordered `border-base-border rounded-full px-s py-xxs`, `gap-xl/l/s`.

## Responsive
≤768px: stack to 1 column (image below text); chips wrap.

## Checklist
- [ ] `Service.tsx` 2-col, chips render from data, CTA button
- [ ] Image fills right column
- [ ] Stacks on mobile

**Done when:** matches node `615:4850`; selecting chips is purely visual (no logic required).
