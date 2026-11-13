# Step 07 — States, polish & verification

**Goal:** make the three Figma states feel right end-to-end, handle edges, and verify the whole flow. Read
`00-overview.md` first. Depends on 01–06.

## Status

**Not started.** Final verification step; blocked until steps 02–06 are complete. After completing this step,
update this section and the tracker in `00-overview.md`.

## State transitions (confirm against Figma)

- **Landing → Located:** entering a location (search submit or my-location) sets `location`, clears
  `selectedSlug`; map animates from NL bounds to the region bounds; the list fades in.
- **Located → Selected:** clicking a card or marker flies the map to `zoom ~14` on that store and marks the
  card active (and scrolls it into view).
- **Selected → Located:** clicking the active card again, selecting another, or clicking empty map
  deselects/reselects sensibly (at minimum: selecting another store works; deselect-on-empty-map is optional).
- **Any → Landing:** clearing the search returns to all-pins/no-list.

## Edges & polish

- **Empty results** in a region (filters too strict): list shows the empty message (step 05); map shows
  whatever pins remain (possibly none).
- **Geocode failure:** inline error on the search field; stay in the previous state.
- **Responsive:** the 440px panel must degrade on narrow screens — e.g. below `lg`, panel becomes a
  full-width sheet/stack above or over the map; map stays full-bleed. Use the existing breakpoints/tokens;
  don't introduce a new system. // ponytail: a simple stacked layout under `lg` is enough for the prototype.
- **A11y:** chips already expose `aria-pressed` (ServiceChip); ensure cards are keyboard-activatable
  (button semantics) and the search field has a label; map markers have `aria-label` (the pin factory sets one).
- **Performance:** ~240 DOM markers is fine; if you notice jank, that's the cue for the GL-layer upgrade
  noted in step 02 — don't pre-optimize.

## Verification (run inline)

1. **Data:** `node scripts/scrape-stores.mjs --check` → ~240 records, exactly 57 Giant Stores, coords in NL
   bounds, spot-checks plausible.
2. **`pnpm dev`**, open `/`:
   - Landing: all pins, no list. Toggle `Bike Fitting` → only DCF stores remain as pins. Toggle off.
   - Search "Amsterdam" → map zooms; list appears sorted by distance; toggling a chip now filters pins **and**
     list together.
   - Click a list card → map flies to it, card active, card scrolled into view. Click a different marker →
     selection moves to that card.
   - "View store details" on a Giant Store → in-app `/store/<slug>` with that store's header/contact/map.
     On a partner → external site opens in a new tab.
3. **`pnpm build`** → succeeds; the 57 official store pages generate.
4. Existing store page sanity: `/store/giant-store-bennebroek` Directions map still renders (step 02 didn't
   regress `OpenFreeMap`).

## Done when
All three states behave as in Figma, the verification walk passes, and `pnpm build` is clean.
