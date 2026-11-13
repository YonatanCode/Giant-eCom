# 06 — Team ("Meet the team") (DARK)

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`554:3379`** (team grid `554:3385`, employee `554:3386`).

**Dark section** (continues the Story band). A header + a row of employee cards.

## Layout
- `Section bg="dark"` (or render inside the same dark band as Story if you prefer — they're adjacent).
- Header: title `store.team.title` (`text-display-s`). (Optional eyebrow is hidden in the design.)
- **Team grid**: 4 equal columns (`grid grid-cols-4 gap-ml`), one `EmployeeCard` each (~276×413).
- **`EmployeeCard`**: portrait photo (`rounded-[8px] aspect-[3/4] object-cover`), name (`text-heading-m`),
  role (`text-body-s text-base-text-muted`).

## Data
`store.team` (`title`, `members[]` → `{ name, role, photo }`).

## Tokens
Dark root, `text-display-s`, `text-heading-m`, `text-body-s`, `text-base-text-muted`, `gap-ml`.

## Responsive
≤768px: 2 columns, then 1; or horizontal scroll. Keep card aspect ratio.

## Checklist
- [ ] `Team.tsx` + `EmployeeCard.tsx`
- [ ] 4-up grid, stacks on mobile
- [ ] Matches node `554:3379`

**Done when:** four team cards render in a row under "Meet the team", dark-themed.
