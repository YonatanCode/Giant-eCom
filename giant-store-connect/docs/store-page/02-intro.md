# 02 — Intro

> Read [`00-overview.md`](./00-overview.md) first. Figma node **`554:3342`** (text `554:3343`).

A single centered intro paragraph band — the simplest section.

## Layout
- `Section` with `bg="surface"`, generous vertical padding (`py-xl`).
- One large paragraph, centered, constrained to ~960px (`max-w-[960px] mx-auto text-center`).
- Type: `text-display-s` (or `text-heading-l` if display reads too large), `text-base-text`.

## Data
`store.intro` (string).

## Tokens
`bg-base-surface`, `text-base-text`, `text-display-s`, `py-xl`.

## Responsive
Naturally fluid; reduce side padding on mobile (already via `px-(--layout-page-padding)`).

## Checklist
- [ ] `Intro.tsx` renders `store.intro` centered
- [ ] Matches node `554:3342`

**Done when:** the welcome paragraph renders centered with correct type scale.
