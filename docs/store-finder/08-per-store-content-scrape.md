# Step 08 — Real per-store content (backlog)

**Status:** **Backlog — not scheduled, not part of the prototype scope.** This documents the shortcut taken
in step 06 so it's tracked instead of forgotten. Read `00-overview.md` and `06-detail-page-integration.md`
first. Don't start this without explicit sign-off — it's a real-data sourcing project, not a UI task.

## The shortcut this replaces

Step 06 synthesizes every official Giant Store page from the hand-authored **Bennebroek** template
(`giantBennebroek` in `src/data/store.ts`). Only three things are real per store:

- **identity** — `name`
- **contact** — `address`, `phone`, `email` (from `nlStores`)
- **map** — `lat`, `lng` (from `nlStores`)

Everything else is **shared placeholder content** copied from Bennebroek, flagged with a `// ponytail:`
comment in `getStore`:

> `intro`, `service`, `banner`, `about` (paragraphs/stats/gallery), `team`, `inventory`, `dcf`, `directions`
> (opening hours, by-transport/by-car/parking text), `faq`, `articles`, `brands`, `hero.image`.

So 57 stores currently show Bennebroek's team, photos, opening hours, and copy. Fine for a prototype; wrong
for production.

## Why this is hard (read before estimating)

The step-01 locator endpoint (`/nl/stores/dealers`) returns **only** the listing fields — no body content.
The rich content lives on each store's **own dealer website** (e.g. `giantstore-amsterdam.nl`,
`giantstore-zeist.nl`), which are independent sites with **no shared template or markup**. There is no single
authoritative source to scrape. That makes a uniform scrape unreliable; expect per-site special-casing or
manual entry for a meaningful subset.

Open questions to resolve **before** any code:
- Is there an official per-store content API/feed we haven't found (CMS, store-microsite generator)? Check
  what `giantstore-*.nl` sites are built on — if they share a platform, that platform may have one feed.
- Which fields are actually wanted real, and which stay shared? (Opening hours + address map are the
  highest-value, most-uniform; team bios/galleries are the hardest and least uniform.)
- Legal/ToS: scraping dealer sites is different from using Giant's own locator endpoint. Confirm this is
  allowed before fetching at scale. (Org legal ref in CLAUDE.md.)

## Suggested approach (phased, smallest valuable slice first)

1. **Opening hours only.** Highest value, often in machine-readable form (schema.org `OpeningHoursSpecification`
   JSON-LD is common on local-business sites). Scrape just that into a new optional field on `StoreListing`
   (`openingHours?`), fall back to the template when absent. One field, big realism win.
2. **Hero image + intro paragraph.** Per-store hero/about text where the site exposes it; template fallback.
3. **The rest (team, gallery, faq, articles)** — likely manual/curated per flagship store, or left as
   template. Don't scrape these speculatively.

Keep it a build-time generator like step 01 (`scripts/scrape-store-content.mjs`, plain ESM, no deps,
`--check` mode), writing into `src/data/` and merged in `getStore` over the template. **Per-field fallback to
the template** is mandatory — a missing scrape must never blank a section.

## Files (when/if built)
- **Create:** `scripts/scrape-store-content.mjs`, a generated `src/data/store-content-nl.ts` (or extend
  `stores-nl.ts` with optional fields).
- **Modify:** `src/data/store.ts` (`getStore` merges real per-store content over the template, field by field).

## Done when (per slice)
- The chosen field(s) render real per store where available and silently fall back to the template where not.
- `pnpm build` still statically generates all 57 official pages.
- The scrape script has a `--check` self-validation like `scrape-stores.mjs`.
