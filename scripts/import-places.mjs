// An NL gazetteer for the location box, so a shopper's town resolves even where Giant has no
// dealer. Two free GeoNames files, no key, no per-keystroke API call:
//
//   export/zip/NL.txt   four-digit postcodes ("2121") with the place each covers
//   export/dump/NL.txt  every NL feature, with population
//
// The dump is used only as a sieve: a place from the postal file is kept when an NL settlement
// of that name has 1,000+ people. That drops the hamlets and leaves the places someone would
// actually type.
//
// Both files are CC BY 4.0 — the attribution rides along in the JSON and must stay visible
// somewhere in the UI.
//
// Usage: node scripts/import-places.mjs

import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/nl-places.json')
const POSTAL_URL = 'https://download.geonames.org/export/zip/NL.zip'
const FEATURES_URL = 'https://download.geonames.org/export/dump/NL.zip'
const SOURCE = 'GeoNames (CC BY 4.0) — https://www.geonames.org/'

/** Below this a settlement is a hamlet, and nobody centres a store search on it. */
const MIN_POPULATION = 1000
/** ~110m. A radius filter measured in kilometres has no use for more. */
const COORD_DP = 3

/**
 * ponytail: the system `unzip` rather than a ZIP reader — this is a dev-machine script, run by
 * hand when the gazetteer is refreshed, and the output is committed. Swap in a `zlib.inflateRaw`
 * reader if it ever has to run somewhere without the binary.
 */
async function fetchTable(url, name) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`)

  const archive = join(tmpdir(), `geonames-${name}.zip`)
  await writeFile(archive, Buffer.from(await res.arrayBuffer()))

  return execFileSync('unzip', ['-p', archive, 'NL.txt'], { encoding: 'utf8', maxBuffer: 1 << 28 })
    .trim()
    .split('\n')
    .map((line) => line.split('\t'))
}

/** Names of NL settlements big enough to be worth offering. Both spellings, ascii and local. */
function settlementNames(features) {
  const names = new Set()
  for (const columns of features) {
    if (columns[6] !== 'P' || Number(columns[14]) < MIN_POPULATION) continue
    names.add(columns[1])
    names.add(columns[2])
  }
  return names
}

const [postal, features] = await Promise.all([
  fetchTable(POSTAL_URL, 'postal'),
  fetchTable(FEATURES_URL, 'features'),
])

const worthOffering = settlementNames(features)

// Each entry is the mean of the rows that carry its name, which turns a city's scattered
// postcodes into one centre. Keyed on name *and* province: averaging two villages of one name
// together would drop the circle in a field between them.
const entries = new Map()

function collect(key, label, region, latitude, longitude) {
  const entry = entries.get(key) ?? { label, region, latitude: 0, longitude: 0, rows: 0 }
  entry.latitude += Number(latitude)
  entry.longitude += Number(longitude)
  entry.rows += 1
  entries.set(key, entry)
}

for (const [, postcode, place, province, , , , , , latitude, longitude] of postal) {
  if (!latitude || !longitude) continue
  // A postcode says which place it is; a place says which province.
  collect(`postcode:${postcode}`, postcode, place || province, latitude, longitude)
  if (worthOffering.has(place)) collect(`place:${place}|${province}`, place, province, latitude, longitude)
}

// Regions repeat across many rows, so they are stored once and referenced by index.
const regions = [...new Set([...entries.values()].map((entry) => entry.region))]
const places = [...entries.values()]
  // Namesakes collapse to the first offered, so the largest — most postcodes — leads.
  .sort((left, right) => right.rows - left.rows || left.label.localeCompare(right.label))
  .map((entry) => [
    entry.label,
    regions.indexOf(entry.region),
    Number((entry.latitude / entry.rows).toFixed(COORD_DP)),
    Number((entry.longitude / entry.rows).toFixed(COORD_DP)),
  ])

await writeFile(OUT, `${JSON.stringify({ source: SOURCE, regions, places })}\n`)

const postcodes = places.filter(([label]) => /^\d{4}$/.test(label)).length
console.log(`${places.length} NL places -> ${OUT.replace(`${ROOT}/`, '')}`)
console.log(`  postcodes: ${postcodes}`)
console.log(`  towns: ${places.length - postcodes}`)
console.log(`  regions: ${regions.length}`)
