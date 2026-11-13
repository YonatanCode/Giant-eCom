#!/usr/bin/env node
// Scrapes Giant's GB bike listings into the per-category data files the PLP prototype
// renders, so the prototype can show any bike type instead of only mountain bikes.
//
//   node scripts/import-category.mjs              # every category
//   node scripts/import-category.mjs road-bikes   # just one
//
// Writes src/data/categories/<slug>.json. Every response is cached under .cache/, so
// re-runs and tweaks cost no requests — delete .cache/ to refetch.
//
// Giant's GB pages need three levels to get everything the prototype's filters want:
//
//   /gb/bikes/<slug>              listing → tile facets, price range, tag, image
//     └─ /gb/bikes-<series>       series  → marketing copy, serie-compare-table
//          └─ /gb/<model>         model   → sizes, colourway names, per-colour renders
//
// The listing's own filter sidebar is scraped too: it names the groups, the options and
// the tooltip copy, and it differs per bike type — which is exactly the per-category
// filtering the prototype needs, with nothing hand-written.
//
// ponytail: regex, not a DOM parser — a build-time script with no dependency only has to
// survive Giant's current markup, and it throws loudly the day that markup moves.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const GIANT = 'https://www.giant-bicycles.com'
const CACHE = join(ROOT, '.cache')
const OUT_DIR = join(ROOT, 'src/data/categories')

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/**
 * Categories whose tiles link straight to a bike's own page rather than its series page.
 * Giant's listing always points at the series, so this is a choice the prototype makes.
 */
const LINK_TO_MODEL = new Set(['road-bikes'])

/** Giant's six bike listings, with the breadcrumb/heading copy the prototype shows. */
const CATEGORIES = {
  'road-bikes': 'Road bikes',
  'mountain-bikes': 'Mountain bikes',
  'cross-and-gravel-bikes': 'Cross & gravel bikes',
  'fitness-and-city-bikes': 'Fitness & city bikes',
  'e-bikes': 'E-bikes',
  'kids-bikes': 'Kids bikes',
}

const CURRENCY = 'GBP'
const PRICE_DISCLAIMER = 'MSRP excluding sales tax and dealer fees'
/** Requests in flight. Five is what the guided-selling importer settled on. */
const CONCURRENCY = 5

// ---------------------------------------------------------------------------
// fetching
// ---------------------------------------------------------------------------

async function get(path) {
  const url = path.startsWith('http') ? path : `${GIANT}${path}`
  const key = join(CACHE, `${createHash('sha1').update(url).digest('hex')}.html`)

  try {
    return await readFile(key, 'utf8')
  } catch {
    // Not cached yet — fall through and fetch.
  }

  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en-GB,en' } })
  if (!res.ok) throw new Error(`${url} returned ${res.status}`)
  const html = await res.text()
  await mkdir(CACHE, { recursive: true })
  await writeFile(key, html)
  return html
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// ---------------------------------------------------------------------------
// html helpers
// ---------------------------------------------------------------------------

/** Giant serves minified HTML with unquoted attributes, hence every `["']?` below. */
function attrValue(html, name) {
  const m = html.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : ''
}

const NAMED_ENTITIES = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', times: '×', pound: '£', mdash: '—' }

/** Giant leans on numeric entities — prices arrive as `&#163;4,549`. */
function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&(\w+);/g, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    // House style: no em-dashes in shopper-facing copy, so Giant's become commas.
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

/** Two sentences is what the prototype's product card has room for. */
function twoSentences(text) {
  return text.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// colour swatches
// ---------------------------------------------------------------------------

/**
 * Giant renders every swatch as an *image* and publishes no hex anywhere in the markup,
 * so these are read off their swatches by hand. Seeded from the guided-selling importer
 * and the prototype's own mountain-bike catalogue.
 */
const SWATCH = {
  'abyss black': '#121316',
  'amber glow': '#e0a144',
  'arctic light': '#dfe7ec',
  'asphalt green': '#004814',
  black: '#151515',
  'black diamond': '#141416',
  'blue dragonfly': '#2e5f8a',
  carbon: '#2b2b2d',
  'carbon smoke': '#3a3b3d',
  carnival: '#d4432f',
  chameleon: '#4b5f7a',
  'chameleon neptune': '#3f6b7d',
  'chameleon saturn': '#6d5a86',
  charcoal: '#3c3f41',
  cobalt: '#1b3a6b',
  'cold night': '#1f2a3c',
  'concrete grey': '#8d8f8c',
  'cool grey': '#9ba0a3',
  'cosmic dust': '#a9a4a0',
  'dark blue': '#16294a',
  'dried matcha': '#97936b',
  'good green': '#2f6b3f',
  howlite: '#e7e5df',
  'icicle white': '#eef2f4',
  'luminous lagoon': '#1f7a8c',
  'mariana blue': '#1c3f6e',
  'metallic black': '#1b1c1e',
  'metallic navy': '#1d2b4a',
  'milky way': '#ece9e2',
  'milky white': '#f1efe9',
  'obsidian pulse': '#1d1f24',
  opal: '#dfe3e6',
  'pearl white': '#f2f1ec',
  'plasma blue': '#1a6fd4',
  'polar tide': '#a8c8d8',
  'pure red': '#ff170d',
  'purple storm': '#4b2e6b',
  'raw carbon': '#2b2b2d',
  'solar prominence': '#d53700',
  spruce: '#2f4f3a',
  'starry night': '#232c46',
  'stealth chrome': '#4a4d52',
  'supernova grey': '#8f9296',
  'turbo teal': '#167f7f',
  'unicorn white': '#f4f3ef',
  white: '#f5f5f3',
}

/**
 * Base colour words, for names the map above has not been taught yet. Giant's names read
 * "<flourish> <colour>" or "<colour> <flourish>" ("Purple Haze", "Metallic Navy"), so a
 * guess picks whichever colour word is in there and shades it by any modifier alongside.
 *
 * ponytail: a guess, not a reading — good enough for a prototype's swatch, and every
 * guessed name is printed at the end of the run so it can be promoted into SWATCH.
 */
const COLOR_WORDS = {
  airglow: '#5f8f8a',
  aluminium: '#b9bcc0',
  aluminum: '#b9bcc0',
  amber: '#e0a144',
  aqua: '#3aa6a6',
  aquarium: '#2e7f9e',
  arctic: '#dfe7ec',
  artic: '#dfe7ec',
  azure: '#2f6fb5',
  beeswax: '#d9a441',
  beige: '#ded4c0',
  black: '#151515',
  blue: '#1f4e9c',
  bronze: '#a1713c',
  brown: '#6b4a32',
  burgundy: '#6b1f30',
  carbon: '#2b2b2d',
  chameleon: '#4b5f7a',
  champion: '#f0efec',
  charcoal: '#3c3f41',
  chili: '#a8332a',
  chrome: '#b8bcc0',
  cloud: '#b6bbc0',
  copper: '#a35f38',
  coral: '#e2705a',
  cream: '#f0e9da',
  crimson: '#9e1b32',
  cyan: '#26a5c4',
  dune: '#cbb490',
  dust: '#b9b2a6',
  eclipse: '#1b1b22',
  foil: '#c6cacd',
  forest: '#2c4a3a',
  gold: '#c9a227',
  graphite: '#3a3d40',
  gray: '#8b9095',
  green: '#2f6b3f',
  grey: '#8b9095',
  gunmetal: '#4a4f55',
  ice: '#dce8ee',
  indigo: '#3b3b7a',
  iridescence: '#9ab0c4',
  iris: '#6b5bb5',
  iron: '#55606b',
  ivory: '#f2ecdd',
  jade: '#2f7a5f',
  jungle: '#2b4a32',
  kelp: '#2c4a3a',
  khaki: '#9a9060',
  lagoon: '#1f7a8c',
  lake: '#2a6b8f',
  lavender: '#9a8fc0',
  lime: '#8bc34a',
  magenta: '#a8306e',
  maroon: '#5e2130',
  mars: '#a4502b',
  matcha: '#97936b',
  mercury: '#b4b8bc',
  meteor: '#6b625c',
  mint: '#8fc9ac',
  moon: '#c9cbc7',
  moonstone: '#dcdce4',
  navy: '#1d2b4a',
  nebula: '#2a2a5a',
  ocean: '#1d5a7a',
  olive: '#6b6b3a',
  orange: '#e0642c',
  panther: '#1a1a1c',
  peach: '#f0b394',
  pewter: '#7d8287',
  phoenix: '#d8502a',
  pink: '#d9739a',
  plum: '#5d2f52',
  prism: '#cfd6e0',
  prismatic: '#cfd6e0',
  purple: '#5b2f7a',
  quarry: '#8d8f8c',
  quicksilver: '#c2c6ca',
  red: '#c8321c',
  rose: '#c76b7e',
  rosso: '#c8102e',
  ruby: '#9b1c33',
  rust: '#a4502b',
  sage: '#9aa88c',
  sand: '#d6c7a8',
  sandstorm: '#c9b287',
  sangria: '#7b1f33',
  sapphire: '#1f4b8f',
  scarlet: '#c22b1f',
  sea: '#2b8fa8',
  shield: '#5a646e',
  silver: '#c2c6ca',
  slate: '#5a646e',
  smoke: '#6e7275',
  snow: '#f0f4f6',
  soap: '#e8f0f2',
  sparkle: '#2b8fa8',
  stealth: '#3a3d42',
  steel: '#6b7780',
  stone: '#a8a49c',
  storm: '#6a7078',
  suds: '#e8f0f2',
  sunset: '#e0783c',
  teal: '#167f7f',
  tempest: '#5b4f7a',
  terracotta: '#b0563a',
  thundercloud: '#6b7076',
  turquoise: '#2ca6a4',
  twilight: '#3c4a6b',
  violet: '#6b3a9c',
  white: '#f5f5f3',
  yellow: '#e0b400',
}

/** Words that shade the colour word they sit next to. Positive lightens, negative darkens. */
const MODIFIERS = {
  bright: 0.18,
  dark: -0.32,
  deep: -0.28,
  electric: 0.2,
  light: 0.3,
  metallic: -0.08,
  midnight: -0.42,
  neon: 0.26,
  pale: 0.38,
  pastel: 0.34,
  soft: 0.2,
}

function shade(hex, amount) {
  if (!amount) return hex
  const n = Number.parseInt(hex.slice(1), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const next = amount > 0 ? c + (255 - c) * amount : c * (1 + amount)
    return Math.max(0, Math.min(255, Math.round(next)))
  })
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Finish words Giant prefixes to an otherwise ordinary colour name ("Gloss Arctic Light").
 * They say nothing about the hue, so they are stripped before the name is looked up.
 */
const FINISHES = /^(?:gloss|glossy|satin|matte|matt|rainbow|pearl|pearlescent)\s+/

/** @returns {{hex: string, source: 'known'|'guessed'|'fallback'}} */
function swatchFor(name) {
  const raw = name.toLowerCase().trim()
  if (SWATCH[raw]) return { hex: SWATCH[raw], source: 'known' }

  const key = raw.replace(FINISHES, '')
  if (SWATCH[key]) return { hex: SWATCH[key], source: 'known' }

  const words = key.split(/[^a-z]+/).filter(Boolean)
  // Last colour word wins: "Metallic Navy" is navy, "Purple Haze" is purple.
  const colorIndex = words.map((w) => Boolean(COLOR_WORDS[w])).lastIndexOf(true)
  if (colorIndex >= 0) {
    const modifier = words.reduce((total, word) => total + (MODIFIERS[word] ?? 0), 0)
    return { hex: shade(COLOR_WORDS[words[colorIndex]], modifier), source: 'guessed' }
  }
  return { hex: '#6b7280', source: 'fallback' }
}

/**
 * Giant writes a two-tone colourway as "Carbon/Blue Dragonfly", and the prototype's swatch
 * already draws two halves when given two colours — so split rather than flatten.
 */
function swatchColors(label, report) {
  const parts = label
    .split('/')
    .map((part) => part.replace(/([a-z])([A-Z])/g, '$1 $2').trim())
    .filter(Boolean)

  return parts.map((part) => {
    const { hex, source } = swatchFor(part)
    if (source !== 'known') report[source].add(`${part} → ${hex}`)
    return hex
  })
}

// ---------------------------------------------------------------------------
// listing page
// ---------------------------------------------------------------------------

/**
 * Giant's own filter sidebar, which is the whole reason the prototype can be
 * category-aware: the groups, their options and their tooltip copy all differ per bike
 * type, and each option's `value` is literally the class its matching tiles carry.
 */
function parseFilterGroups(html) {
  const start = html.indexOf('<div class=bike-filtering-vertical')
  if (start < 0) throw new Error('no filter sidebar found — Giant changed their markup')
  const sidebar = html.slice(start, html.indexOf('</form>', start))

  const groups = []
  for (const block of sidebar.split(/(?=<fieldset )/)) {
    const id = block.match(/<fieldset[^>]*\bid=([\w-]+)/)?.[1]
    if (!id) continue

    // The sr-only legend reads "Choose your Wheel Size" — the most reliable label source,
    // since the visible heading's class list varies between the first group and the rest.
    const label = decode(block.match(/<legend[^>]*>([^<]*)<\/legend>/i)?.[1] ?? '').replace(
      /^Choose your\s*/i,
      '',
    )

    const options = []
    for (const m of block.matchAll(
      /<div class=checkbox\b([^>]*)>\s*<input[^>]*\bvalue=\.([\w-]+)[^>]*>\s*<label[^>]*>\s*<span>([^<]*)<\/span>/gi,
    )) {
      const [, wrapper, facet, text] = m
      const info = decode(attrValue(wrapper, 'title'))
      options.push({ id: facet, label: decode(text), ...(info ? { info } : {}) })
    }

    if (options.length) groups.push({ id, label: label || id, options })
  }

  if (!groups.length) throw new Error('filter sidebar matched no groups')
  return groups
}

/**
 * One `<div class="tile … product mix …">` per model, in the order Giant lists them.
 *
 * Split rather than match: the grid's last tile is followed by neither another tile nor a
 * closing marker, so matching up to a lookahead silently drops it — one product per
 * category, which is exactly the kind of loss that never announces itself.
 */
function parseTiles(html) {
  const chunks = html.split(/(?=<div class="tile [^"]*product mix)/i).slice(1)
  // Each chunk but the last ends where the next tile starts; the last runs on past the
  // grid, so it is cut at whatever follows.
  return chunks.map(
    (chunk) => chunk.split(/<!-- end tiles|<\/section>|<div class=row style=display:none/i)[0],
  )
}

/**
 * The listing shows a range when a series has several builds ("£7,800 - £8,000"). Giant
 * flags a sale with `.discountprice` but never prints the pre-discount figure, so there is
 * no honest way to fill the prototype's `discount` modes — a range becomes `from`, and
 * everything else `regular`.
 */
function parsePrice(tile) {
  const span = tile.match(/<span class="?price([^">]*)"?>([^<]*)<\/span>/i)
  const shown = decode(span?.[2] ?? '')
  const [low, high] = shown.split(/\s*[-–]\s*/)
  return {
    mode: high ? 'from' : 'regular',
    amount: low.trim(),
    // Giant marks a reduced price on the tile but never prints what it was reduced from;
    // the pre-discount figure lives on the model pages, and is paired up in importCategory.
    discounted: /\bdiscountprice\b/.test(span?.[1] ?? ''),
  }
}

/**
 * A model page's own price, as the pair the prototype's `discount` modes need. Giant lists
 * sibling builds further down the same page, so only the first of each is this model's.
 */
function parsePricePair(html) {
  const current = decode(html.match(/<span class=originalprice>([^<]*)<\/span>/i)?.[1] ?? '')
  const old = decode(html.match(/<span class=oldprice>([^<]*)<\/span>/i)?.[1] ?? '')
  return current && old ? { current, old } : null
}

/**
 * Tiles carry their badges as `<div class="facet facet-1 facet-sale" title=Sale>Sale</div>`.
 * GB runs two: a sale flag, which is the prototype's tag, and a finance line, which is the
 * prototype's `secondary` copy under the price.
 */
function parseFacetBadges(tile) {
  const badges = new Map()
  for (const m of tile.matchAll(/class="facet facet-\d+ facet-(\w+)"[^>]*>([^<]*)</gi)) {
    badges.set(m[1], decode(m[2]))
  }
  return badges
}

/**
 * Distance to the nearest dealer holding stock. Giant does not publish it and the
 * prototype's "Available on location" filter needs a number to bite on, so derive a stable one
 * from the id.
 *
 * ponytail: fake but deterministic — the same bike always sits the same distance away,
 * which is what makes the filter demo repeatable. Swap for real dealer inventory the day
 * there is an endpoint to ask.
 */
function availabilityMiles(id) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 100003
  return 5 + (hash % 116)
}

// ---------------------------------------------------------------------------
// series + model pages
// ---------------------------------------------------------------------------

/**
 * Marketing copy, from whichever of Giant's two templates served this URL: a series page
 * keeps it in `#bikeseries-introtext .lead`, a single-model page in its JSON-LD.
 */
function parseDescription(html) {
  const lead = html.match(/<div class="lead[^"]*">([\s\S]*?)<\/div>/i)?.[1]
  if (lead) {
    // The lead ends with a "Learn more" link and its inline SVG — text only.
    return twoSentences(decode(lead.replace(/<a\b[\s\S]*$/i, '').replace(/<[^>]+>/g, ' ')))
  }
  const jsonLd = html.match(/"description":"((?:[^"\\]|\\.)*)"/)?.[1]
  if (!jsonLd) return ''
  return twoSentences(decode(jsonLd.replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\\//g, '/')))
}

/**
 * The builds in a series, from the compare table. A GB listing tile always points at a
 * series page, and that table is the only place the individual models are named in the
 * server HTML — the rest of the page renders them with Vue.
 */
function parseSeriesModels(html) {
  const table = html.match(/<table class="?serie-compare-table"?[\s\S]*?<\/table>/i)?.[0] ?? ''
  return unique([...table.matchAll(/href=(?:"|')?(\/gb\/[a-z0-9-]+)/gi)].map((m) => m[1]))
}

/**
 * The compare table's builds with what each costs, read from the analytics payload on the
 * build's own link. A tile advertises the series' lowest price, so that is the build its
 * tile should open — not whichever the table happens to list first (usually the flagship).
 *
 * @returns {{path: string, price: number}[]}
 */
function parseSeriesModelPrices(html) {
  const table = html.match(/<table class="?serie-compare-table"?[\s\S]*?<\/table>/i)?.[0] ?? ''
  const seen = new Set()
  const models = []
  for (const m of table.matchAll(/<a href="?(\/gb\/[a-z0-9-]+)"?[^>]*data-ga4_items="([^"]*)"/gi)) {
    const [, path, payload] = m
    const price = Number(payload.match(/&quot;price&quot;:\s*([\d.]+)/)?.[1])
    if (seen.has(path) || !Number.isFinite(price)) continue
    seen.add(path)
    models.push({ path, price })
  }
  return models
}

/** A row from the model page's spec table, e.g. "Sizes" → "S, M, L, XL". */
function specRow(html, name) {
  const m = html.match(new RegExp(`>\\s*${name}\\s*</[^>]+>\\s*<[^>]*>([^<]{1,300})`, 'i'))
  return m ? decode(m[1]) : ''
}

/**
 * Per-colourway renders, keyed by the `_Color<slot>` token Giant puts in every filename.
 * The thumbnail strip is authored at h_2000, which is the size the prototype's data uses.
 */
function parseModelImages(html) {
  const strip = html.match(/<ul id=(?:"|')?thumb-images[\s\S]*?<\/ul>/i)?.[0] ?? ''
  const images = unique(
    [...strip.matchAll(/href=(?:"|')?(https:\/\/images2\.giant-bicycles\.com\/[^\s"'>]+\.jpg)/gi)].map(
      (m) => m[1],
    ),
  )

  const bySlot = new Map()
  for (const image of images) {
    const slot = image.replace(/^.*\//, '').match(/_Colou?r-?([A-Z])\b/)?.[1] ?? 'A'
    if (!bySlot.has(slot)) bySlot.set(slot, [])
    // Two is what the card's hover swap uses; more is dead weight in the data file.
    if (bySlot.get(slot).length < 2) bySlot.get(slot).push(image)
  }
  return bySlot
}

/**
 * Frame sizes. The geometry table heads each column with the size it describes, which is
 * the one size source present on every template — series pages included, where the spec
 * table is per-build and therefore absent. The spec row is the fallback for the handful of
 * pages that ship no geometry (framesets, mostly).
 */
/**
 * Giant qualifies a size with its wheel when one frame spans both ("M (29\")"), but the
 * prototype's chips are frame sizes and wheel size is its own filter group — so the
 * parenthetical is dropped and the duplicates collapse.
 *
 * Giant also spells the span sizes both ways ("ML" and "M/L") and cases "One Size" both
 * ways, which would otherwise show up as two chips for one size.
 */
const SIZE_ALIASES = { SM: 'S/M', ML: 'M/L', LXL: 'L/XL', 'ONE SIZE': 'One Size' }

function normalizeSize(size) {
  const clean = size.replace(/\s*\([^)]*\)/g, '').trim()
  return SIZE_ALIASES[clean.toUpperCase()] ?? clean
}

/** Frame sizes, smallest first. Anything unrecognised sorts after, in its own order. */
const SIZE_ORDER = ['XXS', 'XS', 'S', 'S/M', 'M', 'M/L', 'L', 'L/XL', 'XL', 'XXL', 'One Size']

function sortSizes(sizes) {
  const rank = (size) => {
    const known = SIZE_ORDER.indexOf(size)
    if (known >= 0) return known
    // Kids frames are named by wheel ("20\""), which orders numerically after the letters.
    const inches = Number.parseFloat(size)
    return Number.isFinite(inches) ? SIZE_ORDER.length + inches : Number.MAX_SAFE_INTEGER
  }
  return [...sizes].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

function parseSizes(html) {
  const geometry = [...html.matchAll(/<th[^>]*\bname=framesize[^>]*>([^<]*)<\/th>/gi)].map((m) =>
    normalizeSize(decode(m[1])),
  )
  if (geometry.length) return unique(geometry)

  return unique(specRow(html, 'Sizes?').split(/\s*,\s*/).map(normalizeSize))
}

function parseModel(html) {
  const sizes = parseSizes(html)

  const colorLabels = specRow(html, 'Colou?rs?')
    .split(/\s*,\s*/)
    .map((label) => label.trim())
    .filter(Boolean)

  const images = parseModelImages(html)
  const slots = [...images.keys()]

  // One model page is usually one colourway; a model offering several lists them in the
  // same order as its colour slots, so pair them off positionally.
  const colors = colorLabels.map((label, index) => ({
    label,
    images: images.get(slots[index]) ?? images.get(slots[0]) ?? [],
  }))

  return { sizes, colors }
}

/**
 * Real stock, at last. Every single-model page carries a JSON-LD `Product` whose `offers`
 * are one per SKU — size x colourway — each with a schema.org availability. That is Giant's
 * own delivery stock, so it needs no invention.
 *
 * Note this is the only genuinely live field in the catalogue: re-running the importer on a
 * different day will legitimately produce different numbers.
 */
function parseStock(pages, sizes) {
  const known = new Set(sizes)
  const inStockSizes = new Set()
  let skus = 0
  let inStock = 0

  for (const html of pages) {
    for (const block of html.matchAll(/<script type="?application\/ld\+json"?[^>]*>([\s\S]*?)<\/script>/gi)) {
      let data
      try {
        data = JSON.parse(block[1])
      } catch {
        continue // Giant occasionally ships a trailing comma; one bad block is not fatal.
      }

      const offers = Array.isArray(data.offers) ? data.offers : data.offers ? [data.offers] : []
      for (const offer of offers) {
        skus += 1
        if (!/InStock/i.test(offer.availability ?? '')) continue
        inStock += 1

        // Offer sizes drift from the spec tables ("ML" for "M/L"), so only keep the ones
        // that match a size the tile already lists — an unmatched name would render as a
        // size the shopper cannot pick anywhere else on the card.
        const size = normalizeSize(decode(String(offer.itemOffered?.size ?? '')))
        if (known.has(size)) inStockSizes.add(size)
      }
    }
  }

  return { skus, inStock, sizes: sortSizes([...inStockSizes]) }
}

// ---------------------------------------------------------------------------
// import
// ---------------------------------------------------------------------------

async function importCategory(slug, report) {
  const title = CATEGORIES[slug]
  const listing = await get(`/gb/bikes/${slug}`)

  const filterGroups = parseFilterGroups(listing)
  const knownFacets = new Set(filterGroups.flatMap((g) => g.options.map((o) => o.id)))

  const tiles = parseTiles(listing)
  if (!tiles.length) throw new Error(`${slug}: no product tiles matched — Giant changed their markup`)

  const products = await mapLimit(tiles, CONCURRENCY, async (tile) => {
    const href = attrValue(tile, 'href')
    if (!href) return null

    const id = href.replace(/^.*\//, '').replace(/^bikes-/, '')
    const tileName = decode(attrValue(tile, 'data-product-name'))
    const tileImage = attrValue(tile.match(/<img\b[^>]*>/i)?.[0] ?? '', 'src')

    // Every facet the sidebar knows about is already a class on the tile, so the two line
    // up without a prefix map of their own.
    const classes = tile.match(/<div class="tile ([^"]*)"/)?.[1]?.split(/\s+/) ?? []
    const facets = unique(classes.filter((cls) => knownFacets.has(cls)))

    const seriesHtml = await get(href)
    const description = parseDescription(seriesHtml)

    // The series page carries a colourway and a geometry table of its own, and plenty of
    // them list no builds at all — so it is always parsed, and the compare table's models
    // only add the colours and sizes the individual builds introduce on top.
    const modelPaths = parseSeriesModels(seriesHtml)

    // Cheapest build wins; Array.sort is stable, so a tie keeps the table's own order. A
    // series with one build has no table: Giant redirects its tile href to the bike's page,
    // and the canonical link on what comes back names it.
    const [cheapest] = parseSeriesModelPrices(seriesHtml).sort((a, b) => a.price - b.price)
    const canonical = attrValue(seriesHtml.match(/<link[^>]*rel="?canonical"?[^>]*>/i)?.[0] ?? '', 'href')
    const url = !LINK_TO_MODEL.has(slug)
      ? href
      : (cheapest?.path || canonical.replace(GIANT, '') || href)
    const modelPages = await mapLimit(modelPaths, CONCURRENCY, (path) => get(path))
    const pages = [seriesHtml, ...modelPages]
    // The series page is the first "model" and has no build of its own to link to.
    const models = pages.map((page, index) => ({
      ...parseModel(page),
      path: index ? modelPaths[index - 1] : null,
    }))

    // What each build costs now → what it cost before, so a sale tile can show both.
    const wasPriced = new Map(
      pages.map(parsePricePair).filter(Boolean).map(({ current, old }) => [current, old]),
    )

    const sizes = unique(models.flatMap((m) => m.sizes))
    // A colourway can show up on the series page and again on the build that sells it, so
    // images come from whichever lists it first but the link is the build's.
    const byLabel = new Map()
    for (const { path, colors } of models) {
      for (const { label, images } of colors) {
        const entry = byLabel.get(label) ?? { images, path: null }
        entry.path ??= path
        byLabel.set(label, entry)
      }
    }

    const colors = [...byLabel].map(([label, { images, path }]) => ({
      key: slugify(label),
      label,
      colors: swatchColors(label, report),
      images: images.length ? images : [tileImage],
      // The colour a shopper picked should open the build that comes in it. Where no build
      // claims it (a single-build series) the product's own page is the answer.
      ...(LINK_TO_MODEL.has(slug) ? { url: path ? `${GIANT}${path}` : `${GIANT}${url}` } : {}),
    }))

    if (!description) report.noDescription.push(id)
    if (!sizes.length) report.noSizes.push(id)
    if (!colors.length) report.noColors.push(id)

    const { discounted, ...price } = parsePrice(tile)
    const oldAmount = discounted ? wasPriced.get(price.amount) : undefined
    if (oldAmount) {
      price.oldAmount = oldAmount
      price.mode = price.mode === 'from' ? 'from-discount' : 'discount'
    } else if (discounted) {
      report.noOldPrice.push(id)
    }

    const badges = parseFacetBadges(tile)

    const stock = parseStock(pages, sizes)
    if (!stock.skus) report.noStock.push(id)

    return {
      id,
      availabilityMiles: availabilityMiles(id),
      stock,
      title: tileName,
      url: `${GIANT}${url}`,
      description,
      price,
      secondary: badges.get('zero_percent_finance') || PRICE_DISCLAIMER,
      tag: badges.has('sale') ? { type: 'sale', label: badges.get('sale') } : null,
      facets,
      sizes,
      colors: colors.length
        ? colors
        : [{ key: 'default', label: 'Default', colors: ['#6b7280'], images: [tileImage] }],
    }
  })

  const payload = {
    slug,
    title,
    market: 'GB',
    currency: CURRENCY,
    generatedAt: new Date().toISOString(),
    source: `${GIANT}/gb/bikes/${slug}`,
    filterGroups,
    sizes: sortSizes(unique(products.filter(Boolean).flatMap((p) => p.sizes))),
    products: products.filter(Boolean),
  }

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(join(OUT_DIR, `${slug}.json`), `${JSON.stringify(payload, null, 2)}\n`)
  console.log(
    `${slug}: ${payload.products.length} products, ${filterGroups.length} filter groups → src/data/categories/${slug}.json`,
  )
}

async function main() {
  const requested = process.argv[2]
  if (requested && !CATEGORIES[requested]) {
    console.error(`Unknown category "${requested}". Known: ${Object.keys(CATEGORIES).join(', ')}`)
    process.exit(1)
  }
  const slugs = requested ? [requested] : Object.keys(CATEGORIES)

  const report = {
    guessed: new Set(),
    fallback: new Set(),
    noDescription: [],
    noSizes: [],
    noColors: [],
    noOldPrice: [],
    noStock: [],
  }

  for (const slug of slugs) await importCategory(slug, report)

  if (report.guessed.size) {
    console.log(`\nGuessed swatches (promote into SWATCH to make them exact):`)
    for (const name of [...report.guessed].sort()) console.log(`  ${name}`)
  }
  if (report.fallback.size) {
    console.log(`\nNo colour word found, using neutral grey:`)
    for (const name of [...report.fallback].sort()) console.log(`  ${name}`)
  }
  for (const [label, ids] of [
    ['no description', report.noDescription],
    ['no sizes', report.noSizes],
    ['no colours', report.noColors],
    ['on sale but no pre-discount price found', report.noOldPrice],
    ['no stock data', report.noStock],
  ]) {
    if (ids.length) console.log(`\n${label}: ${ids.join(', ')}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
