import assert from 'node:assert/strict'
import test from 'node:test'

import type { Category, Product } from '../../data/categories.ts'
import { bucketForHex, getColorOptions } from '../../lib/color-buckets.ts'
import { storeStockFor } from '../../lib/store-stock.ts'
import {
  createFilters,
  describeNearbyStock,
  getActiveFiltersCount,
  getFilteredProducts,
  getOptionCounts,
  sizeToCarry,
} from './filters.ts'
import { AVAILABILITY_DELIVERY, COLOR_PREFIX, SIZE_PREFIX } from './filter-config.ts'

function product(id: string, over: Partial<Product> = {}): Product {
  return {
    id,
    availabilityMiles: 10,
    title: id,
    url: `https://example.test/${id}`,
    description: '',
    price: { mode: 'regular', amount: '£1,000' },
    stock: { skus: 4, inStock: 4, sizes: ['M'] },
    secondary: '',
    tag: null,
    facets: [],
    sizes: ['M'],
    colors: [{ key: 'black', label: 'Black', colors: ['#151515'], images: ['a.jpg'] }],
    ...over,
  }
}

const GROUPS: Category['filterGroups'] = [
  {
    id: 'bestfor',
    label: 'Best For',
    options: [
      { id: 'best-for-enduro', label: 'Enduro' },
      { id: 'best-for-trail', label: 'Trail' },
      // Offered by the category but carried by none of the products below.
      { id: 'best-for-downhill', label: 'Downhill' },
    ],
  },
  {
    id: 'framematerial',
    label: 'Frame Material',
    options: [
      { id: 'frame-material-composite-carbon', label: 'Carbon' },
      { id: 'frame-material-aluminium', label: 'Aluminium' },
    ],
  },
]

const BOUNDS = { min: 0, max: 10000 }

const enduroCarbon = product('enduro-carbon', {
  facets: ['best-for-enduro', 'frame-material-composite-carbon'],
})
const trailAlloy = product('trail-alloy', {
  facets: ['best-for-trail', 'frame-material-aluminium'],
})
const enduroAlloy = product('enduro-alloy', {
  facets: ['best-for-enduro', 'frame-material-aluminium'],
})
const CATALOGUE = [enduroCarbon, trailAlloy, enduroAlloy]

function filterWith(checked: Record<string, boolean>, products = CATALOGUE) {
  return getFilteredProducts(products, { ...createFilters(), checked }, 'featured', BOUNDS, GROUPS).map(
    (p) => p.id,
  )
}

test('no filters shows everything', () => {
  assert.deepEqual(filterWith({}), ['enduro-carbon', 'trail-alloy', 'enduro-alloy'])
})

test('options within a group widen, groups narrow', () => {
  // One option in one group.
  assert.deepEqual(filterWith({ 'best-for-enduro': true }), ['enduro-carbon', 'enduro-alloy'])

  // Two options in the same group are an OR.
  assert.deepEqual(filterWith({ 'best-for-enduro': true, 'best-for-trail': true }), [
    'enduro-carbon',
    'trail-alloy',
    'enduro-alloy',
  ])

  // A second group is an AND against the first.
  assert.deepEqual(filterWith({ 'best-for-enduro': true, 'frame-material-aluminium': true }), [
    'enduro-alloy',
  ])

  // An impossible combination is empty rather than unfiltered.
  assert.deepEqual(filterWith({ 'best-for-trail': true, 'frame-material-composite-carbon': true }), [])
})

test('option counts react to the other groups but not to their own', () => {
  const counts = (checked: Record<string, boolean>) =>
    getOptionCounts(CATALOGUE, { ...createFilters(), checked }, BOUNDS, GROUPS)

  const unfiltered = counts({})
  assert.equal(unfiltered['best-for-enduro'], 2)
  assert.equal(unfiltered['best-for-downhill'], 0, 'an option no product carries is already a dead end')
  assert.equal(unfiltered['frame-material-composite-carbon'], 1)

  // Enduro narrows Frame Material: only the carbon and alloy enduros are left.
  const enduro = counts({ 'best-for-enduro': true })
  assert.equal(enduro['frame-material-composite-carbon'], 1)
  assert.equal(enduro['frame-material-aluminium'], 1)

  // ...but its own group still counts as if nothing there were ticked, so Trail stays pickable.
  assert.equal(enduro['best-for-trail'], 1)
  assert.equal(enduro['best-for-enduro'], 2)

  // Carbon leaves one enduro and no trail bike at all.
  const carbon = counts({ 'frame-material-composite-carbon': true })
  assert.equal(carbon['best-for-enduro'], 1)
  assert.equal(carbon['best-for-trail'], 0)

  // Size and colour are counted the same way, against the facet groups.
  assert.equal(carbon[`${SIZE_PREFIX}M`], 1)
  assert.equal(carbon[`${COLOR_PREFIX}black`], 1)
})

test('an option the category offers but no product carries yields no results', () => {
  assert.deepEqual(filterWith({ 'best-for-downhill': true }), [])
})

test('size filter matches any selected size', () => {
  const small = product('small', { sizes: ['S'] })
  const large = product('large', { sizes: ['L', 'XL'] })
  const catalogue = [small, large]

  assert.deepEqual(filterWith({ [`${SIZE_PREFIX}S`]: true }, catalogue), ['small'])
  assert.deepEqual(filterWith({ [`${SIZE_PREFIX}XL`]: true }, catalogue), ['large'])
  assert.deepEqual(filterWith({ [`${SIZE_PREFIX}S`]: true, [`${SIZE_PREFIX}L`]: true }, catalogue), [
    'small',
    'large',
  ])
})

test('colour filter matches the bucket a colourway falls in, including two-tone', () => {
  const red = product('red', {
    colors: [{ key: 'r', label: 'Tiger Red', colors: ['#c8321c'], images: ['a.jpg'] }],
  })
  const blackAndBlue = product('black-and-blue', {
    colors: [{ key: 'bb', label: 'Carbon/Navy', colors: ['#2b2b2d', '#1d2b4a'], images: ['a.jpg'] }],
  })
  const catalogue = [red, blackAndBlue]

  assert.deepEqual(filterWith({ [`${COLOR_PREFIX}red`]: true }, catalogue), ['red'])
  // Two-tone lands in both buckets, so either swatch finds it.
  assert.deepEqual(filterWith({ [`${COLOR_PREFIX}black`]: true }, catalogue), ['black-and-blue'])
  assert.deepEqual(filterWith({ [`${COLOR_PREFIX}blue`]: true }, catalogue), ['black-and-blue'])
})

test('price range and sorting still apply alongside facets', () => {
  const cheap = product('cheap', { price: { mode: 'regular', amount: '£500' }, facets: ['best-for-enduro'] })
  const dear = product('dear', { price: { mode: 'regular', amount: '£9,000' }, facets: ['best-for-enduro'] })
  const catalogue = [dear, cheap]

  const state = { ...createFilters(), checked: { 'best-for-enduro': true }, priceMin: 0, priceMax: 1000 }
  assert.deepEqual(
    getFilteredProducts(catalogue, state, 'featured', BOUNDS, GROUPS).map((p) => p.id),
    ['cheap'],
  )

  const sorted = getFilteredProducts(catalogue, createFilters(), 'price-low', BOUNDS, GROUPS)
  assert.deepEqual(sorted.map((p) => p.id), ['cheap', 'dear'])
})

test('lightness and saturation decide a bucket before hue does', () => {
  assert.equal(bucketForHex('#151515'), 'black')
  assert.equal(bucketForHex('#2b2b2d'), 'black', 'carbon is a dark neutral, so it reads as black')
  assert.equal(bucketForHex('#1d2b4a'), 'blue', 'navy is as dark as carbon but is plainly blue')
  assert.equal(bucketForHex('#f5f5f3'), 'white')
  assert.equal(bucketForHex('#8b9095'), 'grey', 'a desaturated colour is grey, not a washed-out hue')
  assert.equal(bucketForHex('#c8321c'), 'red')
  assert.equal(bucketForHex('#1f4e9c'), 'blue')
  assert.equal(bucketForHex('#2f6b3f'), 'green')
  assert.equal(bucketForHex('#5b2f7a'), 'purple')
  assert.equal(bucketForHex('not-a-hex'), null)
})

test('colour options only list buckets with stock, and count products not colourways', () => {
  const twoBlacks = product('two-blacks', {
    colors: [
      { key: 'a', label: 'Black', colors: ['#151515'], images: ['a.jpg'] },
      { key: 'b', label: 'Abyss Black', colors: ['#121316'], images: ['b.jpg'] },
    ],
  })
  const options = getColorOptions([twoBlacks])

  assert.deepEqual(
    options.map((o) => [o.id, o.count]),
    [['black', 1]],
    'one product with two black colourways counts once, and no empty buckets appear',
  )
})

const BRISTOL = { id: '15808', name: 'Giant Store Bristol' }
const REMEDY = { id: '16437', name: 'Bike Remedy' }
const NEARBY = { label: 'London', radiusKm: 25, stores: [BRISTOL, REMEDY] }

test('home delivery filters on the real per-SKU stock', () => {
  const deliverable = product('deliverable', { stock: { skus: 4, inStock: 2, sizes: ['M'] } })
  const backordered = product('backordered', { stock: { skus: 4, inStock: 0, sizes: [] } })
  const catalogue = [deliverable, backordered]

  const checked = { [AVAILABILITY_DELIVERY]: true }
  const ids = getFilteredProducts(catalogue, { ...createFilters(), checked }, 'featured', BOUNDS, GROUPS)

  assert.deepEqual(ids.map((p) => p.id), ['deliverable'])
})

test('the near-me circle does nothing until a place resolves', () => {
  // The toggle is on but nothing has resolved yet: no circle, so the catalogue is untouched.
  const pending = { ...createFilters(), near: { label: '', radiusKm: 25, stores: [] }, nearOnly: true }
  assert.deepEqual(
    getFilteredProducts(CATALOGUE, pending, 'featured', BOUNDS, GROUPS).map((p) => p.id),
    ['enduro-carbon', 'trail-alloy', 'enduro-alloy'],
  )

  // A place with no dealer inside the radius is empty rather than unfiltered — that is the
  // honest answer to "what can I get near here".
  const empty = {
    ...createFilters(),
    near: { label: 'Lerwick', radiusKm: 5, stores: [] },
    nearOnly: true,
  }
  assert.deepEqual(getFilteredProducts(CATALOGUE, empty, 'featured', BOUNDS, GROUPS), [])
})

test('the near-me circle keeps what any dealer in it holds, and agrees with the card', () => {
  const state = { ...createFilters(), near: NEARBY, nearOnly: true }
  const shown = getFilteredProducts(CATALOGUE, state, 'featured', BOUNDS, GROUPS)

  for (const item of shown) {
    assert.ok(
      NEARBY.stores.some((store) => storeStockFor(item, store.id).sizes.length > 0),
      `${item.id} is shown but no dealer in range holds it`,
    )
  }
  for (const item of CATALOGUE.filter((c) => !shown.includes(c))) {
    for (const store of NEARBY.stores) {
      assert.equal(
        storeStockFor(item, store.id).sizes.length,
        0,
        `${item.id} is hidden but ${store.name} holds it`,
      )
    }
  }
})

test('the circle widens a wider radius, never narrows it', () => {
  const near = (stores: typeof NEARBY.stores) => ({
    ...createFilters(),
    near: { ...NEARBY, stores },
    nearOnly: true,
  })
  const tight = getFilteredProducts(CATALOGUE, near([BRISTOL]), 'featured', BOUNDS, GROUPS)
  const wide = getFilteredProducts(CATALOGUE, near([BRISTOL, REMEDY]), 'featured', BOUNDS, GROUPS)

  for (const item of tight) {
    assert.ok(wide.includes(item), `${item.id} dropped out when the radius grew`)
  }
})

test('availability widens: the circle and delivery are an OR', () => {
  const onlyDelivery = product('only-delivery', { stock: { skus: 2, inStock: 2, sizes: ['M'] } })
  const catalogue = [onlyDelivery]
  const checked = { [AVAILABILITY_DELIVERY]: true }

  // Delivery alone finds it.
  assert.deepEqual(
    getFilteredProducts(catalogue, { ...createFilters(), checked }, 'featured', BOUNDS, GROUPS).map((p) => p.id),
    ['only-delivery'],
  )

  // Adding a circle that holds none of it must not remove it.
  assert.deepEqual(
    getFilteredProducts(
      catalogue,
      { ...createFilters(), checked, near: { ...NEARBY, stores: [] }, nearOnly: true },
      'featured',
      BOUNDS,
      GROUPS,
    ).map((p) => p.id),
    ['only-delivery'],
  )
})

test('availability narrows against other groups', () => {
  const undeliverable = product('enduro-gone', {
    facets: ['best-for-enduro'],
    stock: { skus: 2, inStock: 0, sizes: [] },
  })
  const catalogue = [...CATALOGUE, undeliverable]

  const ids = getFilteredProducts(
    catalogue,
    { ...createFilters(), checked: { 'best-for-enduro': true, [AVAILABILITY_DELIVERY]: true } },
    'featured',
    BOUNDS,
    GROUPS,
  ).map((p) => p.id)

  assert.ok(!ids.includes('enduro-gone'), 'an enduro bike with no delivery stock should drop out')
  assert.ok(ids.includes('enduro-carbon'))
})

test('the near-me circle counts as one active filter, however wide', () => {
  assert.equal(getActiveFiltersCount(createFilters()), 0)
  // Toggled on but unresolved is not yet a filter.
  assert.equal(
    getActiveFiltersCount({ ...createFilters(), near: { label: '', radiusKm: 25, stores: [] }, nearOnly: true }),
    0,
  )
  // A resolved place the shopper is not filtering on is context, not a filter.
  assert.equal(getActiveFiltersCount({ ...createFilters(), near: NEARBY }), 0)
  assert.equal(getActiveFiltersCount({ ...createFilters(), near: NEARBY, nearOnly: true }), 1)
})

test('a picked dealer speaks for itself, in stock or not', () => {
  const holds = (storeId: string) => storeStockFor(enduroCarbon, storeId).sizes.length > 0
  const ids = Array.from({ length: 40 }, (_, index) => `store-${index}`)
  const holder = ids.find(holds)
  const empty = ids.find((id) => !holds(id))
  assert.ok(holder && empty, 'the synthetic stock should give both a holder and a non-holder')

  const at = (id: string) =>
    describeNearbyStock(enduroCarbon, {
      ...NEARBY,
      kind: 'store' as const,
      stores: [{ id, name: 'Giant Store Bristol' }],
    })

  // A holder short of a size names it; one with the full run says nothing more.
  const held = storeStockFor(enduroCarbon, holder!).sizes
  const missing = enduroCarbon.sizes.filter((size) => !held.includes(size))
  assert.deepEqual(at(holder!), {
    inStock: true,
    names: ['Giant Store Bristol'],
    rest: missing.length ? `(not in size ${missing.join(', ')})` : '',
  })
  assert.deepEqual(at(empty!), {
    inStock: false,
    names: [],
    rest: 'Not in stock at Giant Store Bristol',
  })
})

test('a Giant store is named first, however far out it is', () => {
  const holds = (storeId: string) => storeStockFor(enduroCarbon, storeId).sizes.length > 0
  const stocked = Array.from({ length: 40 }, (_, index) => `store-${index}`)
    .filter(holds)
    .slice(0, 2)
  assert.ok(stocked.length === 2, 'need two stocking dealers to see which one leads')

  // The Giant store is the further of the two, so only the flag can put it first.
  const line = describeNearbyStock(enduroCarbon, {
    ...NEARBY,
    stores: [
      { id: stocked[0], name: 'Bike Remedy' },
      { id: stocked[1], name: 'Giant Store Bristol', isGiant: true },
    ],
  })

  assert.deepEqual(line, {
    inStock: true,
    names: ['Giant Store Bristol'],
    rest: 'and 1 other store in range',
  })
})

test('the card names the nearest dealer holding the bike, then counts the rest', () => {
  // The synthetic per-store stock is a hash, so pick dealers by what they actually hold.
  const holds = (storeId: string) => storeStockFor(enduroCarbon, storeId).sizes.length > 0
  const stocked = Array.from({ length: 40 }, (_, index) => `store-${index}`)
    .filter(holds)
    .slice(0, 3)
    .map((id, index) => ({ id, name: `Dealer ${index + 1}` }))
  assert.ok(stocked.length >= 3, 'need three stocking dealers to exercise every branch')

  const at = (stores: typeof stocked) => describeNearbyStock(enduroCarbon, { ...NEARBY, stores })

  // The names come back separately so the card can keep each one unbreakable.
  assert.deepEqual(at([stocked[0]]), { inStock: true, names: ['Dealer 1'], rest: '' })
  assert.deepEqual(at(stocked.slice(0, 2)), {
    inStock: true,
    names: ['Dealer 1'],
    rest: 'and 1 other store in range',
  })
  assert.deepEqual(at(stocked.slice(0, 3)), {
    inStock: true,
    names: ['Dealer 1'],
    rest: 'and 2 other stores in range',
  })
})

test('the card skips dealers in range that do not hold it, and says so when none do', () => {
  const holds = (storeId: string) => storeStockFor(enduroCarbon, storeId).sizes.length > 0
  const ids = Array.from({ length: 40 }, (_, index) => `store-${index}`)
  const holder = ids.find(holds)
  const empty = ids.find((id) => !holds(id))
  assert.ok(holder && empty, 'the synthetic stock should give both a holder and a non-holder')

  // A dealer in range that holds nothing is neither named nor counted among the others.
  assert.deepEqual(
    describeNearbyStock(enduroCarbon, {
      ...NEARBY,
      stores: [{ id: empty!, name: 'Empty Dealer' }, { id: holder!, name: 'Stocked Dealer' }],
    }),
    { inStock: true, names: ['Stocked Dealer'], rest: '' },
  )

  assert.deepEqual(describeNearbyStock(enduroCarbon, { ...NEARBY, stores: [] }), {
    inStock: false,
    names: [],
    rest: 'Not in stock within 25 km',
  })
})

test('the toggle gates the grid, never the circle on the cards', () => {
  // A circle narrow enough to leave at least one bike out, so "off" has something to restore.
  const partial = Array.from({ length: 60 }, (_, index) => ({ id: `store-${index}`, name: `Dealer ${index}` }))
    .find((store) =>
      CATALOGUE.some((item) => storeStockFor(item, store.id).sizes.length > 0) &&
      CATALOGUE.some((item) => storeStockFor(item, store.id).sizes.length === 0))
  assert.ok(partial, 'the synthetic stock should give a dealer that holds some but not all')

  const showing = { ...createFilters(), near: { ...NEARBY, stores: [partial!] }, nearOnly: true }
  const filtered = getFilteredProducts(CATALOGUE, showing, 'featured', BOUNDS, GROUPS)
  assert.ok(filtered.length < CATALOGUE.length, 'the circle should be narrowing something here')

  // Toggled off: the whole catalogue comes back...
  const off = { ...showing, nearOnly: false }
  assert.deepEqual(
    getFilteredProducts(CATALOGUE, off, 'featured', BOUNDS, GROUPS).map((p) => p.id),
    CATALOGUE.map((p) => p.id),
  )

  // ...and every card still knows where it is and what is near it.
  for (const item of CATALOGUE) {
    assert.deepEqual(describeNearbyStock(item, off.near), describeNearbyStock(item, showing.near))
  }
  assert.ok(
    CATALOGUE.some((item) => describeNearbyStock(item, off.near).inStock),
    'the kept circle should still name a dealer on at least one card',
  )
})

test('a card hands the product page the one ticked size its bike comes in', () => {
  const bike = product('road', { sizes: ['S', 'M', 'L'] })
  const ticked = (...sizes: string[]) => ({
    ...createFilters(),
    checked: Object.fromEntries(sizes.map((size) => [`${SIZE_PREFIX}${size}`, true])),
  })

  assert.equal(sizeToCarry(createFilters(), bike), null, 'no size ticked, nothing to carry')
  assert.equal(sizeToCarry(ticked('M'), bike), 'M')
  // The bike is shown for any ticked size it has, so only the ones it comes in count.
  assert.equal(sizeToCarry(ticked('M', 'XL'), bike), 'M')
  assert.equal(sizeToCarry(ticked('XL'), bike), null, 'a size the bike lacks is not its to carry')
  // Two it comes in leave the choice to the shopper.
  assert.equal(sizeToCarry(ticked('S', 'L'), bike), null)
})
