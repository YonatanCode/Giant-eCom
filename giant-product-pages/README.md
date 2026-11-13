# Giant PLP Prototype

Next.js prototype of the Giant product listing page, using the design system from
[`../giant-store-connect`](../giant-store-connect) — its generated tokens, self-hosted
fonts and Tailwind v4 setup.

It covers all six of Giant's bike categories, each with the filter groups Giant offers
for that bike type, under `/nl/bikes/`: `road-bikes`, `mountain-bikes`,
`cross-and-gravel-bikes`, `fitness-and-city-bikes`, `e-bikes`, `kids-bikes`. `/` redirects
to road bikes.

## Market: Netherlands

The prototype is set in the Netherlands so it joins up with the store finder
(`../giant-store-connect`) as one journey:

- **Stores** are the 224 NL dealers from the store finder's own dataset, and a store's id
  here is its slug there. `pnpm import:stores` copies them across.
- **Prices are not Giant's Dutch prices.** The catalogue is still the GB range, scraped in
  pounds; each price is converted at a flat rate and tidied (`toEuroPrice` in
  `src/lib/format.ts`). Product names, copy and filters are the GB ones too.
- **Distances** are in kilometres.

### Arriving from a store page

`/nl/bikes/<category>?store=<store slug>` opens the listing with that store filled in under
Availability and "Available on location" ticked. Every product tile then carries the store
on to the product page, where it shows under "Collect in store". An unknown slug is ignored.
The store finder builds these links from its store-page inventory cards; it finds this app
through its `NEXT_PUBLIC_PRODUCT_PAGES_URL` setting (default `http://localhost:3002`), so
run this one with `pnpm dev -p 3002` when clicking through locally.

The way back is "Find a store" in the header, which opens the store finder at
`NEXT_PUBLIC_STORE_FINDER_URL` (default `http://localhost:3001`). A hosted build needs it
set at build time.

Contact @timvandevelde-hypersolid

## Stack

- React 19
- TypeScript
- Next.js App Router
- Tailwind CSS v4
- Design tokens in `src/design-system/` (generated, copied from `../giant-store-connect`)

## Getting Started

```bash
pnpm install --ignore-scripts
pnpm dev
```

## Scripts

```bash
pnpm dev     # Start Next.js locally
pnpm build   # Type-check and create a production build
pnpm start   # Serve the production build
pnpm test    # Filter + scroll behaviour tests (node:test, no dependencies)
pnpm import        # Re-scrape all categories from giant-bicycles.com/gb
pnpm import:stores # Copy the NL retailer network from ../giant-store-connect
pnpm import:places # Rebuild the NL gazetteer behind the location box
```

`pnpm import` writes `src/data/categories/<slug>.json`. Pass a slug to do just one
(`node scripts/import-category.mjs road-bikes`). Responses are cached in `.cache/`, so
re-runs are free — delete it to refetch.

`pnpm import:stores` writes `public/giant-stores-nl.json` from
`../giant-store-connect/src/data/stores-nl.ts`, so that repo must be checked out next to
this one. No network request.

`pnpm import:places` writes `public/nl-places.json`: 4,100 four-digit postcodes and 1,150
towns with centroids, built from two free [GeoNames](https://www.geonames.org/) downloads. It
needs `unzip` on PATH. Re-run it once a year or so; postcodes move slowly.

The data is CC BY 4.0. There is no credit in the UI because this build is internal — the
attribution lives in the file's `source` field and here. **Put a visible credit back in the
suggestion list before this is shown outside the company.**

## Project Structure

```text
src/
  app/
    layout.tsx        Root layout + site header
    page.tsx          Mountain bikes PLP
    nl/bikes/[category]/              Listing; [productId]/ is the product page (prototype)
    globals.css       Imports, @font-face, :root primitives, element defaults — nothing else
  design-system/
    tokens.css        Generated colour/spacing/breakpoint tokens (do not hand-edit)
    text-styles.css   Generated .text-* type classes (do not hand-edit)
  components/
    SiteHeader/       Sticky header that hides on downward scroll
    Checkbox/         Shared checkbox box + tick (ProductCard, FilterGroup)
    CompareTooltip/   Shared tooltip (ProductCard, FilterGroup)
    pdp/              Prototype product page: ProductPage/ (gallery, colour, size) and
                      StoreAvailability/ (the collect-in-store module)
    plp/              Each folder holds its .tsx and its .css
      Catalog/          Page state: filters, sort, compare, mobile drawer
      FiltersPanel/     Filter sidebar / mobile drawer
      AvailabilityFilter/  Availability group; names the chosen store
      StorePicker/      Full-page store search modal, opened from the filter or a card
      PriceRangeFilter/ Dual-thumb price range
      FilterGroup/      Collapsible group, checkbox/size/color rows
      ProductCard/      Product tile + StockRows.tsx (the availability lines)
      SortControl/      Sort dropdown
      filter-config.ts  Shared filter shapes, id prefixes, sort options
      filters.ts        Filter state and the filtering/sorting rules
      use-split-scroll.ts  Desktop split-scroll wiring
  data/
    categories.ts     Catalogue types + the six category registry
    categories/       Generated per-category data (do not edit by hand)
  lib/                Price/availability helpers, colour buckets, store locator, scroll rules
scripts/
  import-category.mjs Scrapes giant-bicycles.com/gb into src/data/categories/
  ts-resolve.mjs      Lets `node --test` load the app's TypeScript directly
public/               Icons, badge, fonts, NL store + place datasets
```

## Catalogue Data

`scripts/import-category.mjs` builds each category from three levels of Giant's GB site:

| Page | Gives |
| --- | --- |
| `/gb/bikes/<slug>` listing | one card per series: facets, price, sale flag, image — **and Giant's own filter sidebar**, which is what makes the groups category-specific |
| `/gb/bikes-<series>` | marketing copy, frame sizes, the list of builds |
| `/gb/<model>` | colourway names, per-colour renders, pre-discount prices |

Each filter option is named after the class Giant puts on its own tiles
(`best-for-enduro`, `frame-material-aluminium`), so a product matches a filter by
membership in its `facets` array — no mapping table to maintain.

Colour swatches are the one hand-maintained piece: Giant renders swatches as images and
publishes no hex anywhere, so the importer resolves names against a lookup table, guesses
from colour words where it can, and prints everything it guessed at the end of a run.

### Stock

Two different things sit behind the availability rows, and the split matters:

| | Source | Real? |
| --- | --- | --- |
| Home delivery | `product.stock`, from the per-SKU JSON-LD `offers` on each model page | **Yes** — Giant's own live figures |
| In store / click & collect | `lib/store-stock.ts`, hashed from `(product, store)` | No — invented |

Giant publishes no dealer inventory anywhere: no endpoint on any page, and their own
product pages tell the shopper to ring the shop. So store-level stock is derived from a
hash, which keeps it stable for a given bike at a given store instead of flickering on
every render. Swap `storeStockFor` for a real lookup the day there is a feed.

Delivery stock is the only live field in the catalogue — a re-import on another day will
legitimately produce different numbers.

### Stores

`scripts/import-stores.mjs` copies the NL network from the store finder prototype —
**224 stores, 57 of them Giant Stores**. That prototype scraped them from Giant's
`POST /nl/stores/dealers`; if you ever call that endpoint directly again, two things about
it are not obvious and are worth not rediscovering:

- `campaigncodes` must be an **array**. Send the empty string the query builder produces
  and the response is a cheerful `{"dealers":[]}` with a 200.
- `keyword` must be **non-empty** or the server returns only Giant's own 37 stores and
  silently drops the ~220 independents. The value is never matched against anything — the
  bounding box does the filtering.

## Design System

Tokens and type classes come from `../giant-store-connect` and land in
`src/design-system/tokens.css` and `text-styles.css`. Both are **generated — never
hand-edit them**; to pull in an updated set, re-copy those two files.

Component CSS reads `--semantic-*` for colour and never reaches past it to
`--foundation-colors-*`; raw hex values do not belong anywhere. Type comes from the
`.text-*` classes in markup, so component CSS sets colour, not font size. Changing a token
therefore changes the page.

The primitives the design system does not tokenise yet — `--radius-*`, `--transition-fast`,
`--focus-outline`, `--scrim*`, `--elevation-*` and the fluid page gutters — live in the
`:root` block in `src/app/globals.css`. Reuse those rather than inventing new ones.

## CSS Conventions

Plain CSS, one file per component, imported by that component's `.tsx`. No CSS modules; BEM
class names carry the structure. Four rules, applied to every file:

**1. `globals.css` is globals only.** `@import`s, `@font-face`, the `:root` primitives and
bare element defaults (`*`, `html`, `body`, `img`, `a`, form elements) — nothing more.
Anything that styles a component lives in that component's folder next to its view. UI
shared by two components gets its own folder and both import it, which is what
`src/components/Checkbox/` and `src/components/CompareTooltip/` are.

**2. BEM order: block, element, modifier.**

```css
.block {}
.block__element {}
.block__element--modifier {}
```

A selector's states (`:hover`, `:focus-visible`, `[hidden]`, `.is-selected`) and contextual
overrides follow directly after it, so everything about one selector is in one place.
Prefer `.block--modifier` over `.block.block--modifier` — correct ordering already wins the
cascade.

**3. Media queries follow their selector.** No breakpoint dumps at the foot of the file.
Each `@media` / `@container` goes immediately after the rule it modifies, ascending.

```css
.block {}
@media (max-width: 640px) {
  .block {}
}
.block__element {}
```

**4. Property order.** Declarations run in seven groups, custom properties first:

1. Visibility — `content`, `display`, `opacity`, `visibility`
2. Position — `position`, `inset`, `top`/`right`/`bottom`/`left`, `z-index`, `transform`,
   `order`, `align-self`, `isolation`
3. External sizing — `margin`
4. Internal sizing — `padding`, `grid-*`, `flex-*`, `align-items`, `justify-content`,
   `gap`, `width`, `height`, `overflow`, `container-type`
5. Box styling — `background`, `border`, `border-radius`, `box-shadow`, `outline`,
   `object-fit`, `backdrop-filter`
6. Text styling — `color`, `font-*`, `letter-spacing`, `line-height`, `text-*`,
   `white-space`, `list-style`
7. Other — `appearance`, `cursor`, `pointer-events`, `user-select`, `transition`,
   `animation`, `will-change`, scroll/scrollbar properties

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

Reordering CSS can silently change which rule wins. When moving rules between files or
across a media query, check the equal-specificity conflicts instead of assuming.

## Known Gaps vs. the HTML prototype

- Award badges are gone: they were authored by hand on two mock products, and Giant
  publishes nothing to scrape them from. `ProductCard` still renders `product.award` if a
  product ever carries one.
- Three products have no description and a few colourways fall back to neutral grey —
  in every case because Giant publishes neither. The import run names them.
- Tooltips are positioned by CSS only; the viewport-edge nudging is gone.
- The optional Google geocoding path is dropped. A typed place is looked up in the bundled
  gazetteer (`public/gb-places.json`) and the network is ranked by distance from it, so a
  town resolves whether or not Giant has a dealer in it. No key, no per-keystroke API call,
  and nothing typed leaves the browser. What it does not do is street-level addresses or
  disambiguate namesakes: one "Newport" is offered, the largest, and a shopper who means
  another types its outward code. The crosshair uses the browser's own geolocation.
- In-store and click & collect stock are invented (see Stock above). Only home delivery
  reflects Giant's real figures.
- The design's third delivery state, "Available soon for delivery", is not built: Giant
  publishes no restock dates, so there is nothing to base it on. Cards show either
  "Available for delivery" or "Currently unavailable for delivery".
- "Available on location" — the toggle, distance slider and `availabilityMiles` — is replaced
  by the Availability group. `availabilityMiles` is still imported but nothing reads it.

## Scroll Behavior Contract

These rules are intentional and should stay true unless we explicitly redesign the experience:

1. Scrolling over the product area should move the page/cards first when going down, then hand off to the filters.
2. Scrolling back up over the product area should bring the filters back first, then the page.
3. Scrolling over the filters should move the page too once the filters are in sticky mode.
4. Any UI change that affects filter height must keep `useSplitScroll` re-measuring (it observes the filter panel and re-runs on filter state changes).

`pnpm test` covers the pure rules in `src/lib/scroll-behavior-logic.js`, plus the filter
and colour-bucket logic in `src/components/plp/filters.test.ts`.

## Manual Smoke Check

1. Open the page and confirm product cards render and titles are visible.
2. Switch between `/road-bikes` and `/mountain-bikes` and confirm the filter groups change
   (mountain adds Suspension and the battery groups; road has Brake Type instead).
3. Tick two options in one group and confirm results widen; add one from another group and
   confirm they narrow.
4. Hover the product side and scroll down until the cards finish moving; confirm the filters keep moving after that.
5. Hover the filters and scroll; confirm the page still moves and the filters do not get stranded.
6. Open and close several filter groups and confirm the `+ / -` icon does not jump.
7. With no store chosen, confirm cards show no availability rows and the Availability
   options read generically ("Available in store").
8. Tick "Available in store" and confirm the store modal opens instead of filtering, over
   the whole page, and that Escape or a click on the backdrop closes it.
9. Type "Cambridge" and confirm the list reorders nearest-first with a distance per row,
   then pick a store: every card gains two rows and the Availability labels name it.
10. Tick each Availability option in turn and confirm the product count drops.
11. Find a card reading "Out of stock in …", click its swap icon, and confirm the modal
    opens with the filters revealed — on a phone width it opens above the filter drawer.
12. Navigate to another category and confirm the store survives.

## Product page: preselecting the store

The live PDP on giant-bicycles.com cannot take a store from a link — it reads only
`?partnumber=`, finds nearby dealers from a `clientLocation` cookie on its own domain, and
its `store` variable is set server-side for retailer-branded sites. So this prototype ships
its own product page to show what the live one should do.

A card links to `/gb/bikes/<category>/<productId>?color=<key>&size=<size>&store=<dealerId>`. The store
is the dealer id from `pnpm import:stores`, and is only added when a *specific dealer* (not
a town or postcode circle) is picked. `size` is added when exactly one ticked size filter
applies to that bike (`sizeToCarry` in `filters.ts`); the page opens with it picked, unless
the store lacks it, in which case it shows crossed out. The page is a pure function of its URL: it looks the
id up in `public/giant-stores-gb.json`, names the store, crosses out the sizes it does not hold
(with a "Change the store" hint under them) and says what it has. An unknown or missing id reads as "no store chosen". Changing the store on the
page rewrites `?store=`; its search offers stores only (by name, town or postcode) — towns,
postcodes and "use my location" stay on the listing. A store holding none of the bike
is not left as a dead end: the module lists the nearest stores (within 100 miles, up to
three) that do hold it — and the picked size, if any — and one tap switches to it. Helpers live in `src/lib/store-link.ts`.

Not done on purpose: the PLP does not remember the picked store, so going back from a
product page returns to an unfiltered listing. In-store stock is the same invented hash as
on the cards.

Smoke check:

1. On a road-bikes card, pick "Giant Store - Bristol" in Availability, then click a card.
   The product page opens with Bristol named under "Collect in store" and the sizes it does
   not hold crossed out; "Change the store" under the sizes opens the store search.
2. Pick another colour swatch on a card first; confirm the page opens on that colour. Tick
   one size filter too; confirm the page opens with it picked (or crossed out if the store
   lacks it).
3. On the page, press "Change store", search "Leeds", and confirm only stores are offered;
   pick one and the URL's `store` changes.
4. Open a product page with no `?store=`; it asks you to choose a store.
5. Open one with `?store=999999999`; it behaves like no store, with no error.
6. Open `road-bikes/propel-advanced-pro-frameset-2027?store=28493` (Henley Cycles, which has
   none): it says "Not in stock at Henley Cycles Ltd" and lists nearby stores that have it.
   Pick a size and confirm the list narrows to stores holding that size; tap one to switch.

