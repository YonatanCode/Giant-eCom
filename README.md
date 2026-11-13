# Giant eCom prototype

One Next.js app covering a single shopping journey for Giant in the Netherlands:

**store finder → store page → product listing (PLP) → product page (PDP)**

1. `/` — the store finder.
2. `/store/<slug>` — a store page. The six bike cards under "Store inventory" open the
   listing for that category with the store attached.
3. `/nl/bikes/<category>?store=<slug>` — the PLP, opening with that store filled in under
   Availability and "Available on location" ticked.
4. `/nl/bikes/<category>/<product>?store=<slug>` — the PDP, showing the same store under
   "Collect in store".

"Find a store" in the PLP/PDP header leads back to the store finder.

This is a prototype, not production code. Prices are Giant's GB prices converted to euros at
a flat rate, the range and copy are the GB ones, and store stock is invented.

## Run

```bash
pnpm install --ignore-scripts
pnpm dev
```

`pnpm build` type-checks and builds; `pnpm test` runs the unit tests (`node:test`).

## Deploy

It is a standard Next.js app at the repository root: import the repo in Vercel and deploy.
No environment variables or root-directory setting are needed.

## How the two halves fit in one app

The app was merged from two prototypes that each have their own design-system stylesheet,
so each half keeps its own root layout and CSS through route groups:

| Route group | Routes | Stylesheet | Components |
| --- | --- | --- | --- |
| `src/app/(finder)/` | `/`, `/store/...`, `/catalog` | Tailwind tokens in its `globals.css` | `src/components/{finder,store,editor,catalog}` |
| `src/app/(shop)/` | `/nl/bikes/...` | plain CSS + `src/design-system/` | `src/components/{plp,pdp,SiteHeader,...}` |

Moving between the two halves is a full page load (different root layouts), which is what
keeps the two stylesheets from leaking into each other. Both halves share one store
dataset: `src/data/stores-nl.ts` is the source, and `pnpm import:stores` derives
`public/giant-stores-nl.json` from it, so a store's slug is its id everywhere.

More detail on each half: `docs/store-finder.md` and `docs/product-pages.md`. `CLAUDE.md`
holds the CSS conventions for the `(shop)` half.
