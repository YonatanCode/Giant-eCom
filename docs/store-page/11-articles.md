# 11 — Articles ("Latest Articles")

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`554:3413`** (cards `559:3210`, item `560:4019`).

Header with a "view all" link + a row of 3 article cards. Note the design has a top `Divider` line above this section (`827:8810`).

## Layout
- `section#news` uses `bg-base-surface`, `border-t border-base-border-divider`, and `scroll-mt-[120px]`.
  The inner frame is `max-w-[1296px] px-(--layout-page-padding)` so the content area is 1200px after the shared 48px desktop page gutters.
  Desktop top padding is `calc(var(--spacing-xxl)-1px)` so the CSS top border matches Figma's inside stroke while keeping the visible content at 96px.
- **Header** (`554:3414`): left — eyebrow `store.articles.eyebrow` (`text-action-s`) + title `store.articles.title` (`text-display-s`);
  right — `CtaLink` = `store.articles.viewAllLabel` (text + arrow-right, bottom-aligned).
- **Cards** (`559:3210`): 3 columns (`grid grid-cols-3 gap-ml`) of `ArticleCard`.
  - **`ArticleCard`**: image (`h-[165px] object-cover`), title (`text-heading-l`), body
    (`text-body-m`), and `CtaLink` (`text-action-m`, `gap-xxs`). CTA links to `item.href`.

## Data
`store.articles` (`eyebrow, title, viewAllLabel, items[]` → `{ title, body, ctaLabel, image, href }`).

## Tokens
`text-action-s`, `text-action-m`, `text-action-l`, `text-display-s`, `text-heading-l`, `text-body-m`, `gap-ml`, `gap-xxs`, `CtaLink`.

## Responsive
≤768px: cards → 1 col (or horizontal scroll); header stacks (view-all under title).

## Checklist
- [ ] `Articles.tsx` + `ArticleCard.tsx`
- [ ] 3-up cards, view-all CtaLink, top divider
- [ ] Stacks on mobile
- [ ] Matches node `554:3413`

**Done when:** three article cards render with header + "View all news" link.
