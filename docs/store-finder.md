# Store finder and store pages

> Part of the merged app — see the root README. This half's routes live in
> `src/app/(finder)/`.

Next.js prototype for Giant store discovery and store-detail experiences. The current app includes a store finder route and a Figma-driven store landing page for the mock store `Giant Bennebroek`.

## Stack

- React 19
- TypeScript
- Next.js App Router
- Tailwind CSS v4
- Generated design tokens in `src/app/globals.css`

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open the app at the local Next.js URL. Useful routes:

- `/` — store finder
- `/store/giant-store-bennebroek` — a store page

### Joined journey with the product pages

The six bike cards under "Store inventory" on a store page open the product listing with
the store attached (`/nl/bikes/<category>?store=<slug>`). Gear and Other cards have no
listing yet and are not links.

## Scripts

```bash
pnpm dev       # Start Next.js locally
pnpm build     # Type-check and create a production build
pnpm start     # Serve the production build
pnpm tokens    # Regenerate CSS tokens from token source data
```

There is also a focused hero-design regression check:

```bash
node scripts/assert-hero-figma.mjs
```

## Project Structure

```text
src/
  app/
    layout.tsx      Next.js root layout
    page.tsx        Store finder route (/)
    store/[id]/     Store detail route (/store/:id)
  components/
    LayoutShell.tsx Next-compatible app shell and brand toggle
    store/          Store-page sections and shared store UI components
  data/
    store.ts        Static mock store data
  app/globals.css   Generated design tokens and global styles for Next.js
docs/store-page/    Figma implementation notes per store-page section
scripts/            Token and design regression utilities
```

## Design Notes

The store page is implemented from the Figma file documented in `docs/store-page/00-overview.md`. Keep styling aligned with the semantic token utilities from `src/app/globals.css`; avoid hard-coded hex values when a token exists.

Token values in `src/app/globals.css` are generated. Prefer updating the token source and running `pnpm tokens` instead of hand-editing generated values.

Icons are inline SVGs under `src/components/store/icons/`. Avoid adding icon packages unless the project direction changes.
