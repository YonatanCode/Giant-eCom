import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import type { Product } from '../data/categories.ts'
import { deliveryStateFor, storeStockFor } from './store-stock.ts'

function product(id: string, sizes = ['S', 'M', 'L', 'XL'], inStock = 4): Product {
  return {
    id,
    availabilityMiles: 10,
    stock: { skus: 4, inStock, sizes: inStock ? sizes : [] },
    title: id,
    url: `https://example.test/${id}`,
    description: '',
    price: { mode: 'regular', amount: '£1,000' },
    secondary: '',
    tag: null,
    facets: [],
    sizes,
    colors: [{ key: 'black', label: 'Black', colors: ['#151515'], images: ['a.jpg'] }],
  }
}

test('store stock is stable for a product and store, and differs between stores', () => {
  const bike = product('trance')

  const first = storeStockFor(bike, '15808')
  const second = storeStockFor(bike, '15808')
  assert.deepEqual(first, second, 'the same pair must read the same every time — the demo relies on it')

  // Across a spread of stores the same bike should not be identical everywhere, or the
  // "change store" affordance would look broken.
  // Sampled wide: most shops hold nothing of a given model, so a handful of ids can all
  // come back empty without anything being wrong.
  const shapes = new Set(
    Array.from({ length: 40 }, (_, id) => JSON.stringify(storeStockFor(bike, `store-${id}`).sizes)),
  )
  assert.ok(shapes.size > 1, 'stock should vary between stores')
})

test('held sizes are always a subset of the sizes the bike is made in', () => {
  const bike = product('defy', ['XS', 'S', 'M', 'L'])

  for (let id = 0; id < 200; id += 1) {
    const stock = storeStockFor(bike, String(id))
    for (const size of stock.sizes) {
      assert.ok(bike.sizes.includes(size), `${size} is not a size this bike comes in`)
    }
    assert.equal(stock.isComplete, stock.sizes.length === bike.sizes.length)
  }
})

test('a store that holds a bike is short of one size at most', () => {
  const range = product('tcr', ['XS', 'S', 'M', 'ML', 'L', 'XL'])

  for (let id = 0; id < 500; id += 1) {
    const stock = storeStockFor(range, `store-${id}`)
    assert.ok(
      [0, range.sizes.length, range.sizes.length - 1].includes(stock.sizes.length),
      `store-${id} holds ${stock.sizes.length} of ${range.sizes.length} sizes`,
    )
  }

  // A bike made in one size is held whole or not at all — there is no size to be short of.
  const single = product('propel', ['M'])
  for (let id = 0; id < 200; id += 1) {
    assert.ok(storeStockFor(single, String(id)).sizes.length <= 1)
  }
})

test('the missing size varies, and any size in the run can be the one', () => {
  // A signed shift loses the pick for half the seeds, which shows up as one size that is never
  // missing, or a rack that is empty rather than short.
  const range = product('tcr', ['XS', 'S', 'M', 'ML', 'L', 'XL'])
  const missing = new Set<string>()
  for (let id = 0; id < 2000; id += 1) {
    const stock = storeStockFor(range, `store-${id}`)
    if (stock.sizes.length === range.sizes.length - 1) {
      missing.add(range.sizes.find((size) => !stock.sizes.includes(size))!)
    }
  }
  assert.deepEqual([...missing].sort(), [...range.sizes].sort())
})

test('a store floor reads like a real one: mostly not held, rarely the full run', () => {
  const bike = product('tcr', ['XS', 'S', 'M', 'ML', 'L', 'XL'])
  const floors = Array.from({ length: 2000 }, (_, id) => storeStockFor(bike, `store-${id}`))

  const held = floors.filter((stock) => stock.sizes.length > 0)
  const complete = floors.filter((stock) => stock.isComplete)

  assert.ok(held.length / floors.length > 0.1, 'a fair share of models should be on a floor')
  assert.ok(held.length / floors.length < 0.4, 'most models are not held anywhere near')
  assert.ok(complete.length / floors.length < 0.1, 'the full size run is a hero-model exception')
})

test('a bike with no sizes at all does not crash', () => {
  const stock = storeStockFor(product('frameset', []), '15808')
  assert.deepEqual(stock.sizes, [])
  assert.equal(stock.isComplete, false)
})

test('delivery reads the real per-SKU stock, not a hash', () => {
  assert.equal(deliveryStateFor(product('in', ['M'], 3)), 'available')
  assert.equal(deliveryStateFor(product('out', ['M'], 0)), 'unavailable')
})

test('the catalogue carries real stock for every product', () => {
  const mountain = JSON.parse(readFileSync('src/data/categories/mountain-bikes.json', 'utf8'))

  for (const item of mountain.products as Product[]) {
    assert.ok(item.stock, `${item.id} has no stock block`)
    assert.ok(item.stock.skus > 0, `${item.id} has no SKUs`)
    assert.ok(item.stock.inStock <= item.stock.skus, `${item.id} claims more in stock than it has SKUs`)
    for (const size of item.stock.sizes) {
      assert.ok(item.sizes.includes(size), `${item.id}: in-stock size ${size} is not one of its sizes`)
    }
  }
})
