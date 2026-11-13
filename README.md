# Giant eCom prototype

Two Next.js prototypes that link into one journey:

| Folder | What it is | Local port |
| --- | --- | --- |
| `giant-store-connect/` | Store finder and store pages (the journey starts here) | 3001 |
| `giant-product-pages/` | Product listing (PLP) and product page (PDP) | 3002 |

**Journey:** store finder → store page → a bike card under "Store inventory" → PLP with that
store pre-filled under Availability → PDP showing the same store under "Collect in store".
"Find a store" in the PLP/PDP header leads back to the store finder.

This is a prototype, not production code. Prices are GB prices converted to euros at a flat
rate, and store stock is invented. See each folder's README for detail.

## Run locally

```bash
cd giant-store-connect && pnpm install --ignore-scripts && pnpm dev -p 3001
cd giant-product-pages && pnpm install --ignore-scripts && pnpm dev -p 3002
```

Then open http://localhost:3001.

## Host on Vercel

The two apps are separate, so create **two Vercel projects from this one repository**, each
with its own Root Directory:

| Vercel project | Root Directory | Environment variable |
| --- | --- | --- |
| Store finder | `giant-store-connect` | `NEXT_PUBLIC_PRODUCT_PAGES_URL` = URL of the product pages project |
| Product pages | `giant-product-pages` | `NEXT_PUBLIC_STORE_FINDER_URL` = URL of the store finder project |

Each app needs the other's URL, and the variables are read at build time, so:

1. Deploy both projects once to get their URLs.
2. Add the variable to each project (no trailing slash needed).
3. Redeploy both.

Share the store finder URL; that is where the journey begins.

These copies are synced from the two source repositories; the original commit history
lives there.
