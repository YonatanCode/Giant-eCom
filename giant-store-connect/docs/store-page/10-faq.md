# 10 — FAQ ("Frequently Asked Questions")

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`559:3139`** (accordion `559:3148`).

Two-column: header + contact note on the left, accordion list on the right.

## Layout
- `Section bg="surface" id="faq"`. 2-col (`grid grid-cols-[418px_1fr] gap-xl`).
- **Left** (`559:3140`): eyebrow `store.faq.eyebrow` (`text-action-s`) + title `store.faq.title` (`text-display-s`)
  + contact note `store.faq.contactNote` (`text-body-m text-base-text-muted`).
- **Right** (`559:3145`): accordion list from `store.faq.items[]`.
  - **Use native `<details>/<summary>`** — no JS state. Each item: `<summary>` = question (`text-heading-m`) with a
    plus/close icon that flips on `open` (`group-open:rotate-…` or `[&[open]>summary_.icon]`), divider between items
    (`border-base-border-divider`), answer (`text-body-m text-base-text-muted`) in the body.

## Data
`store.faq` (`eyebrow, title, contactNote, items[]` → `{ question, answer }`).

## Tokens
`text-action-s`, `text-display-s`, `text-heading-m`, `text-body-m`, `border-base-border-divider`, `text-base-text-muted`.

## Responsive
≤768px: stack to 1 col (header above accordion).

## Checklist
- [ ] `Faq.tsx` using `<details>/<summary>` (accessible, keyboard-toggle for free)
- [ ] Icon flips open/closed; dividers between items
- [ ] Matches node `559:3139`

**Done when:** questions expand/collapse natively; no JS state, no a11y regressions.
