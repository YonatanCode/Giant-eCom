import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

import { COLOR_PARAM, productHref, SIZE_PARAM, STORE_PARAM, withStoreParam } from './store-link.ts'

const link = { categoryHref: '/gb/bikes/road-bikes', productId: 'propel-advanced-sl-2027' }

test('no colour or store leaves a bare product path', () => {
  assert.equal(productHref(link), '/gb/bikes/road-bikes/propel-advanced-sl-2027')
  assert.equal(productHref({ ...link, storeId: '', colorKey: null }), productHref(link))
})

test('a picked store and colour ride along as query params', () => {
  const url = new URL(productHref({ ...link, colorKey: 'superspeed-blue', storeId: '1234' }), 'http://x')
  assert.equal(url.pathname, '/gb/bikes/road-bikes/propel-advanced-sl-2027')
  assert.equal(url.searchParams.get(STORE_PARAM), '1234')
  assert.equal(url.searchParams.get(COLOR_PARAM), 'superspeed-blue')
})

test('a size the shopper was filtering on rides along too', () => {
  const url = new URL(productHref({ ...link, size: 'M/L', storeId: '1234' }), 'http://x')
  assert.equal(url.searchParams.get(SIZE_PARAM), 'M/L')
  assert.equal(productHref({ ...link, size: null }), productHref(link))
})

test('changing the store keeps the other params and replaces a stale store', () => {
  const next = withStoreParam(new URLSearchParams('color=red&store=1'), '99')
  assert.equal(next.get(COLOR_PARAM), 'red')
  assert.deepEqual(next.getAll(STORE_PARAM), ['99'])
  assert.equal(withStoreParam(next, null).has(STORE_PARAM), false)
})

test('a size is dropped when the new store cannot supply it, and kept otherwise', () => {
  const params = new URLSearchParams('color=red&size=M&store=1')
  assert.equal(withStoreParam(params, '99').get(SIZE_PARAM), 'M', 'kept by default')
  assert.equal(withStoreParam(params, '99', true).get(SIZE_PARAM), 'M')

  const dropped = withStoreParam(params, '99', false)
  assert.equal(dropped.has(SIZE_PARAM), false)
  assert.equal(dropped.get(STORE_PARAM), '99')
  assert.equal(dropped.get(COLOR_PARAM), 'red', 'everything else stays')
})

test('every product in every category has its own page path', async () => {
  const dir = 'src/data/categories'
  for (const file of (await readdir(dir)).filter((name) => name.endsWith('.json'))) {
    const { products } = JSON.parse(await readFile(`${dir}/${file}`, 'utf8')) as { products: { id: string }[] }
    const ids = products.map((product) => product.id)
    assert.equal(new Set(ids).size, ids.length, `${file} has duplicate product ids`)
    assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)), `${file} has an id that is not path-safe`)
  }
})
