import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

// The locator fetches its datasets at runtime, so serve the real files from disk. That keeps
// this a check on the shipped NL data too, not just on the matching logic.
globalThis.fetch = (async (url: string) => ({
  ok: true,
  status: 200,
  json: async () => JSON.parse(await readFile(`public${url}`, 'utf8')),
})) as unknown as typeof fetch

const { findNearbyStores, findStoreById, locationSuggestions, nearbyStoresTo, SUGGESTION_LIMIT } = await import('./store-locator.ts')

test('the bundled dataset is the NL network', async () => {
  const stores = JSON.parse(await readFile('public/giant-stores-nl.json', 'utf8'))

  assert.ok(stores.length > 200, `expected the full dealer network, got ${stores.length}`)
  assert.ok(
    stores.every((store: { country: string }) => store.country === 'Netherlands'),
    'every store should be in the Netherlands',
  )
  assert.ok(
    stores.some((store: { name: string }) => store.name.startsWith('Giant Store')),
    'Giant’s own stores should be present — they are what the stock row names',
  )
})

test('the near-me circle resolves a town and holds only what is inside it', async () => {
  const tight = await findNearbyStores('Utrecht', null, 10)
  assert.ok(tight, 'Utrecht should resolve to a place to centre on')
  assert.equal(tight.label, 'Utrecht')
  assert.ok(tight.matches.length > 0, 'Utrecht has dealers within 10 km')
  assert.ok(
    tight.matches.every((match) => match.distanceKm <= 10),
    'nothing outside the radius should survive',
  )

  // Widening only ever adds, and the nearest dealer stays the nearest.
  const wide = await findNearbyStores('Utrecht', null, 40)
  assert.ok(wide)
  assert.ok(wide.matches.length > tight.matches.length)
  assert.equal(wide.matches[0].store.id, tight.matches[0].store.id)
  const wideIds = new Set(wide.matches.map((match) => match.store.id))
  assert.ok(tight.matches.every((match) => wideIds.has(match.store.id)))
})

test('the circle comes back nearest first — the card names the first of them', async () => {
  const circle = await findNearbyStores('Haarlem', null, 50)
  assert.ok(circle)

  const distances = circle.matches.map((match) => match.distanceKm)
  assert.deepEqual(distances, [...distances].sort((a, b) => a - b), 'results must be nearest first')
  assert.match(circle.matches[0].store.city, /Haarlem/i)
})

test('a four-digit postcode centres the circle on its store', async () => {
  const circle = await findNearbyStores('2121', null, 5)
  assert.ok(circle)
  assert.match(circle.matches[0].store.zip, /^2121/, `expected a 2121 store first, got ${circle.matches[0].store.zip}`)
})

test('a radius with nothing in it resolves the place but holds no dealer', async () => {
  // A typed town always holds at least the dealer it resolved to, so the empty circle only
  // arises from a browser fix somewhere remote — out in the North Sea here.
  const none = await findNearbyStores('', { latitude: 54.6, longitude: 4.0 }, 25)
  assert.ok(none, 'a fix always centres a circle, however empty')
  assert.deepEqual(none.matches, [], 'an empty circle is empty, not unfiltered')
  // Named after the nearest dealer even though it falls outside, so the panel can say which
  // place it found nothing near.
  assert.equal(none.label, 'West-Terschelling')
})

test('a town with no Giant dealer still resolves — that is what the gazetteer is for', async () => {
  const stores = JSON.parse(await readFile('public/giant-stores-nl.json', 'utf8'))
  const cities = new Set(stores.map((store: { city: string }) => store.city.toLowerCase()))
  assert.ok(!cities.has('heemstede'), 'pick a different dealerless town — Giant has one here now')

  const circle = await findNearbyStores('Heemstede', null, 25)
  assert.ok(circle, 'the old dealer-only match returned nothing here')
  assert.equal(circle.label, 'Heemstede', 'the box should read back the town, not a dealer elsewhere')
  assert.ok(circle.matches.length > 0, 'Heemstede has dealers within 25 km')
})

test('a picked dealer still centres on itself, not on the town it sits in', async () => {
  const pinpoint = await findNearbyStores('Giant Store Bennebroek', null, 0)
  assert.ok(pinpoint)
  assert.equal(pinpoint.matches.length, 1)
  assert.equal(pinpoint.matches[0].distanceKm, 0)
  assert.equal(pinpoint.matches[0].store.name, 'Giant Store Bennebroek')
})

test('coordinates override the typed place and borrow the nearest dealer’s town', async () => {
  // Central Amsterdam, with Utrecht still sitting in the box.
  const fix = await findNearbyStores('Utrecht', { latitude: 52.3731, longitude: 4.8922 }, 20)
  assert.ok(fix)
  assert.match(fix.label, /Amsterdam/i, 'the browser fix wins over the stale text')
  assert.equal(fix.label, fix.matches[0].store.city)
})

test('gibberish resolves to no circle rather than a wrong one', async () => {
  assert.equal(await findNearbyStores('zzzzqqq', null, 50), null)
  assert.equal(await findNearbyStores('', null, 50), null, 'an empty box centres nothing')
})

test('the autocomplete offers matching places, best first and deduped', async () => {
  const places = await locationSuggestions('utr')

  assert.ok(places.length > 0 && places.length <= SUGGESTION_LIMIT * 2, 'each group is capped on its own')
  assert.equal(places[0].label, 'Utrecht', 'the town beats the dealers named after it')
  assert.equal(places[0].secondary, 'Utrecht', 'a gazetteer town says its province')
  assert.equal(new Set(places.map((place) => place.label)).size, places.length, 'no repeated place')
})

test('the autocomplete groups towns above dealers, each capped on its own', async () => {
  // The dropdown draws these as two labelled groups and the keyboard walks them in one pass,
  // so every town must come back before the first dealer, not interleaved by score.
  const places = await locationSuggestions('amst')

  const firstStore = places.findIndex((place) => place.kind === 'store')
  assert.ok(firstStore > 0, 'Amsterdam should offer both its town and its dealers')
  assert.ok(
    places.slice(firstStore).every((place) => place.kind === 'store'),
    'a town below a dealer would draw a second “Stores” heading',
  )
  assert.ok(places.filter((place) => place.kind === 'place').length <= SUGGESTION_LIMIT)
  assert.ok(places.filter((place) => place.kind === 'store').length <= SUGGESTION_LIMIT)
})

test('the autocomplete stays quiet until there is enough to go on', async () => {
  assert.deepEqual(await locationSuggestions(''), [])
  assert.deepEqual(await locationSuggestions('b'), [], 'one letter would offer half the country')
})

test('dealer names and postcodes are offered too, and every offer resolves', async () => {
  const byName = await locationSuggestions('Giant Store Benne')
  assert.ok(
    byName.some((place) => place.label === 'Giant Store Bennebroek'),
    'a dealer the shopper knows by name should be findable',
  )
  const dealer = byName.find((place) => place.label === 'Giant Store Bennebroek')!
  assert.equal(dealer.kind, 'store')
  // A dealer is picked by sight off its street, not by its country.
  assert.ok(dealer.secondary.length > 0 && !dealer.secondary.endsWith('Netherlands'), 'a dealer says its address')

  const byPostcode = await locationSuggestions('2121')
  assert.ok(byPostcode.some((place) => /^2121/.test(place.label)))

  // The list comes from the same dataset the circle is centred on, so nothing offered here
  // can be a dead end.
  for (const place of [...byName, ...byPostcode]) {
    assert.ok(await findNearbyStores(place.label, null, 25), `${place.label} was offered but resolves to nothing`)
  }
})

test('a half-typed dealer name matches across its words, closest spelling first', async () => {
  // "Giant Z" is two fragments landing on two different words of the name, which a plain
  // substring test cannot see at all.
  const stores = (await locationSuggestions('Giant Z'))
    .filter((place) => place.kind === 'store')
    .map((place) => place.label)

  assert.deepEqual(
    stores.slice(0, 2),
    ['Giant Store Zeist', 'Giant Store Zutphen'],
    'the two dealers whose town starts "Z" should lead',
  )
  // "van Giezen" only carries the letter inside a word, so it follows rather than vanishes.
  assert.ok(
    stores.includes('Giant Store van Giezen Tweewielers'),
    `looser matches should still be offered, got ${stores}`,
  )

  // Loosening the match must not start resolving text that means nothing.
  assert.equal(await findNearbyStores('Giant Zq', null, 50), null)
})

test('the dealers near a dealer come nearest first, within range, and never include it', async () => {
  const stores = JSON.parse(await readFile('public/giant-stores-nl.json', 'utf8'))
  const bennebroek = stores.find((store: { id: string }) => store.id === 'giant-store-bennebroek')

  const near = await nearbyStoresTo(bennebroek, 40)
  assert.ok(near.length > 0, 'a city dealer should have neighbours inside 40 km')
  assert.ok(near.every((match) => match.store.id !== bennebroek.id), 'the dealer is not its own neighbour')
  assert.ok(near.every((match) => match.distanceKm <= 40))
  assert.deepEqual(
    near.map((match) => match.distanceKm),
    near.map((match) => match.distanceKm).sort((left, right) => left - right),
    'nearest first',
  )
  assert.ok((await nearbyStoresTo(bennebroek, 5)).length <= near.length, 'a smaller radius never finds more')
})

test('a store finder slug finds its store — the handoff from a store page', async () => {
  const store = await findStoreById('giant-store-bennebroek')
  assert.equal(store?.name, 'Giant Store Bennebroek')
  assert.equal(await findStoreById('not-a-store'), null, 'a stale link finds nothing rather than a neighbour')
})
