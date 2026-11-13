# Step 06 — Detail page integration

**Goal:** make every official Giant Store (the 57 with the `Giant Store` tag) resolve to an in-app
`/store/<slug>` page, reusing the existing rich template with that store's real header/contact. Partners are
never linked internally. Read `00-overview.md` first. Depends on 01 (`nlStores`).

## Status

**Complete.** `getStore` now returns the authored Bennebroek page directly and synthesizes every other
official Giant Store from `nlStores` over the Bennebroek template (real name, hero label, contact
address/phone/email, and map lat/lng; body sections stay shared placeholder content). Non-official slugs
return `undefined` → 404. `giantBennebroek.slug` is unified to `giant-store-bennebroek`; no old-slug links
remained outside `store.ts`. `generateStaticParams` now sources `officialStoreSlugs`. `pnpm build`
statically generates all 57 official store pages; verified `/store/giant-store-amsterdam` renders Amsterdam's
real name and phone (`0202376516`) and that the partner slug `viskercycles` is not generated.

## Current state

`src/app/store/[slug]/page.tsx` calls `getStore(slug)` and 404s if undefined. `getStore` (in
`src/data/store.ts`) only knows the one hand-authored `giantBennebroek` (slug `"giant-bennebroek"`,
`stores = [giantBennebroek]`). `generateStaticParams` returns `stores.map(s => ({slug}))`.

## Changes to `src/data/store.ts`

1. **Unify the Bennebroek slug** with the finder's naming: change `giantBennebroek.slug` from
   `"giant-bennebroek"` to **`"giant-store-bennebroek"`** (= `slugify("Giant Store Bennebroek")`). Update the
   home-page link in `src/app/page.tsx` if it still hardcodes the old slug (the finder replaces that stub
   anyway in step 03, but check for stragglers).

2. **Resolve any official Giant Store slug.** Extend `getStore(slug)`:
   - If `slug` matches an authored store in `stores` → return it (Bennebroek stays fully authored).
   - Else, look up `nlStores` (from `src/data/stores-nl.ts`) for a listing with that `slug` **and**
     `isGiantStore === true`. If found, **synthesize** a `Store` by merging the listing's real fields over a
     shared template:
     ```ts
     // template = the giantBennebroek object as the base (team, inventory, service, dcf, faq, articles,
     // brands, banner, about, intro stay as shared placeholder content). Override only the identity fields:
     {
       ...template,
       id, slug,
       name: listing.name,
       hero: { ...template.hero, label: listing.isGiantStore ? 'Official Giant store' : template.hero.label },
       contact: { ...template.contact, address: `${listing.street} - ${listing.city}`, phone: listing.phone, email: listing.email ?? template.contact.email },
       directions: { ...template.directions, map: { ...template.directions.map, lat: listing.lat, lng: listing.lng } },
     }
     ```
     `// ponytail:` the body sections are intentional shared placeholder content for the prototype — only the
     header, contact, and map location are real per store. Note `Directions.tsx` splits the address on
     `' - '`, so format `address` as `"<street> - <city>"`.
   - Else (partner slug or unknown) → `undefined` → the page 404s. Partners always link to their external
     `website`, never here.

3. **`generateStaticParams`:** return all official Giant Store slugs so they're statically generated:
   `nlStores.filter(s => s.isGiantStore).map(s => ({ slug: s.slug }))` (Bennebroek's slug is included since
   it now matches). Keep it a static export; importing `nlStores` here is fine (build-time).

## `src/app/store/[slug]/page.tsx`

No structural change needed — it already renders all sections from the `store` object and 404s on
`undefined`. Just confirm it works with the synthesized store. (Optionally relax: it already handles
everything via props.)

## Files
- **Modify:** `src/data/store.ts` (slug rename, `getStore` resolution, `generateStaticParams` source),
  `src/app/page.tsx` (only if an old-slug link remains).

## Done when
- `/store/giant-store-bennebroek` renders the full authored page.
- `/store/giant-store-amsterdam` (and any other official store slug) renders the template with Amsterdam's
  real name, address, phone, and map location.
- A partner slug (e.g. one for "Viskercycles") 404s, and partner cards never link here (they open the
  external site — verified in step 05).
- `pnpm build` statically generates the 57 official store pages without error.
