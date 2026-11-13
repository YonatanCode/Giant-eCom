# Consistency & DRY Audit

Scope: design tokens, Tailwind classes, and text styles across `src/components/store` plus the shared app shell. No changes made — findings only.

The token system itself (`src/app/globals.css`) is clean and complete. The inconsistencies are all in **components bypassing it** with raw values.

## Text styles hardcoded instead of using `--text-*` tokens

Each of these has a defined token that should replace the raw px:

| File | Current | Should be | Note |
|------|---------|-----------|------|
| `Footer.tsx:166` | `font-nav text-[14px] leading-5 font-semibold` | `text-nav-s` | token is 14/18, this is 14/**20**; `font-semibold` is redundant (font-nav already = 600) |
| `Footer.tsx:183` | `font-body text-[12px] leading-4 tracking-[0.02em]` | `text-body-s` | token is 12/18, this is 12/**16** |
| `ServiceChip.tsx:16` | `font-nav text-[14px] font-semibold leading-5` | `text-nav-s` | same redundant `font-semibold` |
| `ServiceBooking.tsx:22` | `font-heading text-[20px] font-bold leading-6` | `text-heading-m` | token is 20/28, this is 20/**24**; `font-bold` (700) actually **downgrades** font-heading's 800 |
| `ServiceBooking.tsx:44` | `text-[14px] leading-4 uppercase` on `<Button size={48}>` | drop it | Button size 48 already sets `text-action-l` (16/24); this silently overrides it |

The line-height mismatches (20 vs 18, 16 vs 18, 24 vs 28) should be confirmed against Figma — either the component is wrong or the token is, but they shouldn't disagree.

## Redundant/conflicting font-weight utilities

`font-nav`/`font-heading`/`font-action` already carry their weight via `--font-weight-*`. Adding `font-semibold`/`font-bold` on top either no-ops or fights the token (the `ServiceBooking` h3 is the bad case — it renders lighter than every other heading).

## Foundation colors used where semantic tokens exist

Most store components correctly use semantic tokens (`base-*`, `action-*`, `commerce-*`, `feedback-*`). A few places still reach for foundation or brand tokens directly:

| File | Current | Prefer | Why |
|------|---------|--------|-----|
| `LayoutShell.tsx:43` | `border-grey-10` | `border-base-border` | shell should follow semantic border theme |
| `LayoutShell.tsx:44` | `text-primary` | `text-base-text-emphasis` or `text-action-text` | `primary` differs from emphasis/action in Liv |
| `LayoutShell.tsx:49` | `border-grey-30` | `border-base-border` or `border-action-border` | avoid foundation grey in component UI |
| `Story.tsx:23` | `text-primary` | `text-base-text-emphasis` | stat color should brand-switch semantically |
| `Team.tsx:30`, `Team.tsx:121` | `text-primary` | `text-base-text-emphasis` | same role style appears twice |
| `Team.tsx` focus rings | `outline-primary` | `outline-action-border` | aligns with action/focus treatment elsewhere |
| `Directions.tsx:54` | `text-forest-500` | `text-feedback-text-success` or `text-commerce-text-new` | raw green bypasses semantic success/new token |

This matters most for the Liv theme: `primary` is `#570054`, while `base-text-emphasis` is `#b800ae`, so direct brand tokens can drift from the semantic design intent.

## Off-grid spacing (no matching token)

- `gap-[64px]` (`Directions.tsx:43`) → **`gap-xl`** already exists (64px). Clear miss.
- `gap-[10px]` ×4 (Directions, Service, Articles, Faq) → between `xs`(8) and `s`(12); pick one.
- `gap-[10px]` also appears as `gap-2.5` in `Story.tsx:36`; include it in the same decision.
- `gap-[21px]` (`Faq.tsx:19`), plus scattered `-mt-[2px]`, `mt-[7px]`, `bottom-[21px]`, `left-[23px]` micro-nudges.
- `scroll-mt-[120px]` appears in `Articles.tsx:14` and `Directions.tsx:13`; if anchor offset is intentional, it should be owned by `Section` or a named utility.

## Not problems (flagged so they don't get chased)

- `OpenFreeMap.tsx` hex values are CSS-var fallbacks for the JS map style — legitimate.
- `Hero.tsx:20` `#dcf` is an anchor href, not a color.
- `rounded-[8px]`/`rounded-[4px]` are used **consistently** (5× and 2×) but there's no radius token in the DS. Consistent, so low priority — only worth a `--radius-*` token if Figma defines one.

## DRY opportunities

**1. Eyebrow + title header — the one real win.** The exact block (`<div gap-[10px]>` + uppercase eyebrow `<p>` + title) is copy-pasted in **Directions, Service, Articles, Faq**, with a close variant in **Story** and the DCF tier block. Meanwhile `SectionHeader.tsx` already does this — but is only used by `Inventory`, and uses *different* spacing (`gap-m`/`mb-xs`) and does not uppercase the title. So there are two competing implementations plus several hand-rolled copies. Consolidating them onto `SectionHeader` (likely with `uppercase`, `actions`, and maybe a split-layout option) removes the duplication and kills the `gap-[10px]` inconsistency in one move.

**2. Store identity / badge block.** `StoreSidePanel.tsx` and `Directions.tsx` both define a private `StoreTypeBadge`, then render the same badge + label + store name block. They differ only by size (`h-l w-l` vs `h-8 w-8`) and heading level. Extract `StoreTypeBadge({ size })` and optionally `StoreIdentity({ store, compact, headingLevel })`. This also gives the map marker logo sizing in `OpenFreeMap.tsx` a single visual reference point.

**3. Directions compact card duplicates shared primitives.** `Directions.tsx` manually builds a floating card, address row, and primary pill link. It could compose `StoreTypeBadge`/`StoreIdentity`, an extracted `IconTextRow` from `StoreSidePanel`, and the existing `Button` (`size={32}`) instead of hardcoding the link classes.

**4. Directions bypasses `Section`.** Most store bands use `Section.tsx`; `Directions.tsx` manually repeats the page container (`container mx-auto w-full !max-w-page px-(--layout-page-padding)`). Moving it to `Section bg="subtle"` with an `innerClassName` would keep the page rhythm in one place. If `scroll-mt-[120px]` is needed, consider a `Section` prop or shared class.

**5. Article card CTA duplicates `CtaLink`.** `Articles.tsx` already uses `CtaLink` for the header action, but `ArticleCard` recreates the arrow-link span inline (`gap-xxs`, `font-action`, `text-action-m`, arrow hover translate). Either use `CtaLink` there too or extract the arrow label part so links stay visually consistent.

**6. Team role label** — `-mt-[2px] text-body-l font-semibold text-primary` is duplicated verbatim at `Team.tsx:30` and `:121` (card + modal). Minor, but if Team is touched it's a trivial extract.

**7. Contact URL helpers.** `tel:${contact.phone.replace(/\s/g, '')}` and `mailto:${contact.email}` are repeated in `StoreSidePanel.tsx` and `Faq.tsx`; Google Maps direction URL construction lives in `Directions.tsx`. A tiny `src/lib/contact.ts` would make this boring and testable.

**8. Repeated circular icon buttons.** Team modal close/prev/next buttons repeat long focus, border, sizing, and hover class strings. A local `IconCircleButton` is enough; no need for a global component unless the pattern appears elsewhere.

**Not worth abstracting:** the Footer social icons are acceptable as local inline SVGs per the file comment unless they need reuse in other components. The chip components (`FeatureChip`/`ServiceChip`) look similar but have genuinely different shape/behavior — merging them would cost more than it saves. `FeatureChip` is currently unused, though, so either wire it into the features UI or delete it later.

## Suggested order

1. Safe mechanical fixes: `gap-[64px]→gap-xl`, semantic color swaps in `LayoutShell`/`Story`/`Team`, remove redundant `font-semibold`/`font-bold`.
2. Consolidate section headers onto `SectionHeader`; decide whether titles are always uppercase.
3. Refactor `Directions` to use `Section`, `Button`, and shared store identity pieces.
4. Line-height values (Footer:166/183, ServiceBooking:22): confirm against Figma before changing.
