# Giant eCom prototype — working notes

See `README.md` for how the app is laid out. The CSS and token rules below apply to the
`(shop)` half — the product listing and product pages (`src/app/(shop)`, `src/components/
{plp,pdp,SiteHeader,Checkbox,CompareTooltip}`, `src/design-system`). The store finder half
(`src/app/(finder)`) is styled with Tailwind utilities and has its own `globals.css`.

## CSS

Plain CSS, one file per component, imported by that component's `.tsx`. No CSS modules, no
utility soup — BEM class names carry the structure. Four rules keep it navigable; apply
them to every file you touch, not just new ones.

### 1. `globals.css` is globals only

`src/app/(shop)/globals.css` may contain **only**: `@import`s, `@font-face`, the `:root`
primitives, and bare element defaults (`*`, `html`, `body`, `img`, `a`, form elements).

Anything that styles a component belongs in that component's folder, next to its view. If
two components share a piece of UI, it gets its own folder and both import it — that is
what `src/components/Checkbox/` and `src/components/CompareTooltip/` are. Never park
shared styles in globals "for now".

### 2. BEM order: block, element, modifier

```css
/* good */
.block {}
.block__element {}
.block__element--modifier {}

/* bad — the deep selector leads */
.block__element--modifier {}
.block {}
.block__element {}
```

A selector's own states (`:hover`, `:focus-visible`, `[hidden]`, `.is-selected`) and
contextual overrides sit directly after it, so everything about one selector is in one
place. Prefer plain `.block--modifier` over `.block.block--modifier`; correct ordering
already wins the cascade, so the doubled class is noise.

### 3. Media queries follow their selector

No breakpoint dumps at the bottom of the file. Each `@media` / `@container` goes
immediately after the rule it modifies, ascending so the cascade still resolves in order.

```css
/* good */
.block {}
@media (max-width: 640px) {
  .block {}
}
.block__element {}

/* bad */
.block {}
.block__element {}
@media (max-width: 640px) {
  .block {}
  .block__element {}
}
```

### 4. Property order

Within a rule, declarations run in these seven groups. Custom properties
(`--range-thumb-size`) come first, before group 1.

| # | Group | Properties |
| --- | --- | --- |
| 1 | Visibility | `content`, `display`, `opacity`, `visibility` |
| 2 | Position | `position`, `inset`, `top`/`right`/`bottom`/`left`, `z-index`, `transform`, `order`, `align-self`, `justify-self`, `isolation` |
| 3 | External sizing | `margin` |
| 4 | Internal sizing | `padding`, `grid-*`, `flex-*`, `align-items`, `justify-content`, `gap`, `width`, `height`, `overflow`, `container-type` |
| 5 | Box styling | `background`, `border`, `border-radius`, `box-shadow`, `outline`, `object-fit`, `backdrop-filter` |
| 6 | Text styling | `color`, `font-*`, `letter-spacing`, `line-height`, `text-*`, `white-space`, `list-style` |
| 7 | Other | `appearance`, `cursor`, `pointer-events`, `user-select`, `transition`, `animation`, `will-change`, scroll/scrollbar properties |

```css
.block {
  display: flex;                            /* 1 */
  position: relative;                       /* 2 */
  margin: 0 auto;                           /* 3 */
  padding: var(--foundation-spacing-sm);    /* 4 */
  background: var(--semantic-base-surface); /* 5 */
  color: var(--semantic-base-text);         /* 6 */
  cursor: pointer;                          /* 7 */
}
```

## Design tokens

`src/design-system/tokens.css` and `text-styles.css` are **generated — never hand-edit
them**. Use `--semantic-*` for colour; do not reach past it to `--foundation-colors-*`, and
never write a raw hex. Type comes from the `.text-*` classes in markup, so component CSS
sets colour but not font size.

A handful of primitives the design system does not tokenise yet (`--radius-*`,
`--transition-fast`, `--focus-outline`, `--scrim*`, `--elevation-*`, the fluid gutters)
live in the `:root` block in `globals.css`. Reuse those rather than adding new ones, and
delete them when real tokens land.

## Dependencies

Keep them near zero — the test suite is `node:test`, no framework. `pnpm install
--ignore-scripts`. Do not add a package for something a few lines of CSS or stdlib can do.

## Before calling CSS work done

- `pnpm build` (type-checks too) and `pnpm test`.
- Re-read the diff against the four rules above; they are cheap to break in a hurry.
- A reorder can silently change which rule wins. When you move rules between files or
  across a media query, check the equal-specificity conflicts rather than assuming.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
