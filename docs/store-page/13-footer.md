# 13 — Footer (DARK)

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`822:6666`** (doormat `822:6667`, base `822:6707`).
> There's a `Spacer` (`554:3458`, 64px) above the footer — add `mt`/padding to match.

**Dark section.** A 4-column link "doormat" + a base bar (logo, language, socials, copyright).

## Layout
- Full-bleed `Section bg="dark"` (or a plain `<footer className="dark bg-base-surface">`).
- **Doormat** (`822:6667`): 4 columns (`grid grid-cols-4 gap-xl`): Support, Resources, Features, Company.
  Each: column heading (`text-heading-m`) + a stack of text links (`text-body-s`, `text-action-text-link`).
  For the mock, hardcode the link labels here (they're not store-specific) — e.g.
  Support: Contact, Service, Warranty, Returns, FAQ, Track order, Manuals, Sizing.
  Resources: Bike finder, Blog, Stories, Events, Newsletter, Community, App. Features: Brands, Gear, Sale, New.
  Company: About, Careers, Press, Sustainability, Investors, Stores, Legal, Privacy.
- **Base** (`822:6707`): brand wordmark/logo left; right side: language switcher (`World` icon + "EN"),
  divider, social icons (`Facebook`, `Youtube`, `Instagram`, `Strava`), and copyright line
  ("© 2026 Giant. All rights reserved.", `text-body-s text-base-text-muted`).

## Data
Not store-specific — hardcode link groups + socials inside the component. (No `store` fields needed; keep
the footer link data as a local const so it could later move to config.)

## Tokens
Dark root, `text-heading-m`, `text-body-s`, `text-action-text-link`, `text-base-text-muted`, icons 24px, `gap-xl`.

## Responsive
≤768px: doormat → 2 cols then 1; base stacks (logo, then socials, then copyright).

## Checklist
- [ ] `Footer.tsx` with 4 link columns + base bar
- [ ] Social + language icons (inline SVG)
- [ ] Dark theme; stacks on mobile
- [ ] Matches node `822:6666`

**Done when:** footer renders the 4-column doormat and base bar, dark-themed.

---

### Note on nav/footer placement
Built as store-page components for now. Once stable, consider promoting `Navigation` (01) and this `Footer`
into `LayoutShell.tsx` so they're shared across routes. Flagged in the plan; decide before reusing elsewhere.
