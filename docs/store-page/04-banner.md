# 04 — Banner (promo)

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`661:3516`** (a component instance).
> This node is a library component instance — `get_design_context` on `661:3516` to see its real content/layout.

Full-width promotional banner band (~800px tall in the design).

## Layout
- `Section` full-bleed, no max-width constraint on the background image; content constrained inside.
- Background image (`store.banner.image`) with overlay; text block left- or center-aligned.
- Eyebrow (optional), title (`text-display-l` on dark), body (`text-body-l`), primary `Button`.
- Likely a **dark** treatment (light text on image) — confirm from the node screenshot.

## Data
`store.banner` (`eyebrow?, title, body, cta, image`).

## Tokens
`text-display-l`, `text-body-l`, on-image text via `dark` root (`text-base-text` remaps), `Button variant="primary"`.

## Responsive
≤768px: reduce banner height, title to `text-display-m`, keep text readable over image (overlay).

## Checklist
- [ ] `Banner.tsx` full-bleed with image + overlay + CTA
- [ ] Text legible on image (overlay/scrim)
- [ ] Matches instance `661:3516`

**Done when:** banner spans full width with title/body/CTA over the image.
