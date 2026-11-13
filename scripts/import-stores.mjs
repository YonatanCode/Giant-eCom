// Giant's NL retailer network, taken from the store finder's own dataset.
//
// `src/data/stores-nl.ts` is the store finder's scrape of
// giant-bicycles.com/nl/stores/dealers. Reading it — rather than calling Giant again — is
// what keeps the store finder and the listing on one set of store ids: a store's `slug` there is its `id`
// here, so a store page can hand `?store=<slug>` to the listing and the listing knows it.
//
// ponytail: the file is parsed as text, not imported. It is a typed `export const` wrapped
// round a plain JSON array, so slicing out the array needs no TypeScript loader. If that
// file ever stops being pure JSON inside the brackets, this throws rather than guessing.
//
// Usage: node scripts/import-stores.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'src/data/stores-nl.ts')
const OUT = join(ROOT, 'public/giant-stores-nl.json')
const MARKER = 'export const nlStores'

async function readListings() {
  let text
  try {
    text = await readFile(SOURCE, 'utf8')
  } catch (error) {
    throw new Error(`Cannot read ${SOURCE} (${error.message})`)
  }

  const declaration = text.indexOf(MARKER)
  const start = text.indexOf('= [', declaration)
  const end = text.lastIndexOf(']')
  if (declaration < 0 || start < 0 || end < start) throw new Error(`No \`${MARKER}\` array found in ${SOURCE}`)

  const listings = JSON.parse(text.slice(start + 2, end + 1))
  if (!Array.isArray(listings) || !listings.length) throw new Error(`\`${MARKER}\` in ${SOURCE} is empty`)
  return listings
}

/** A few dealers are entered in capitals ("AMSTERDAM"); a label should not shout. */
function tidyCity(city) {
  const trimmed = String(city ?? '').trim()
  if (trimmed !== trimmed.toUpperCase()) return trimmed
  return trimmed.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase())
}

/** The record shape the locator has always read, so nothing downstream changes. */
function toStoreRecord(listing) {
  return {
    id: String(listing.slug ?? ''),
    name: String(listing.name ?? '').trim(),
    address: String(listing.street ?? '').trim(),
    city: tidyCity(listing.city),
    // Blank on purpose: the two-letter province code ("NH") reads as noise in a label.
    state: '',
    zip: String(listing.postcode ?? '').toUpperCase().replace(/\s+/g, ' ').trim(),
    latitude: Number(listing.lat),
    longitude: Number(listing.lng),
    website: String(listing.website ?? '').trim(),
    phone: String(listing.phone ?? '').trim(),
    isGiantStore: Boolean(listing.isGiantStore),
    country: 'Netherlands',
  }
}

const stores = (await readListings())
  .map(toStoreRecord)
  .filter((store) => store.id && store.name && Number.isFinite(store.latitude) && Number.isFinite(store.longitude))
  .sort((a, b) => a.name.localeCompare(b.name))

await writeFile(OUT, `${JSON.stringify(stores, null, 1)}\n`)

console.log(`${stores.length} NL stores -> ${OUT.replace(`${ROOT}/`, '')}`)
console.log(`  Giant Stores: ${stores.filter((s) => s.isGiantStore).length}`)
console.log(`  with postcode: ${stores.filter((s) => s.zip).length}`)
console.log(`  distinct cities: ${new Set(stores.map((s) => s.city)).size}`)
