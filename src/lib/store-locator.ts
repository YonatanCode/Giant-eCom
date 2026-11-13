// Location search for the "Available on location" filter. Everything is derived client-side from
// two bundled datasets: the NL dealer network (`pnpm import:stores`) and an NL gazetteer of
// towns and four-digit postcodes (`pnpm import:places`).
//
// ponytail: no geocoding service. A typed place is looked up in the gazetteer, which centres
// the circle on the town itself rather than on whichever dealer happened to match the text —
// and resolves towns Giant has no dealer in. A dealer name still resolves to that dealer.
// `origin` overrides both once the browser has handed us real coordinates.
//
// Neither dataset is fetched until the box is typed in, and nothing typed leaves the browser.

export interface StoreRecord {
  id: string
  name: string
  address: string
  city: string
  /** Blank for NL — the two-letter province code reads as noise in a label. */
  state: string
  zip: string
  latitude: number
  longitude: number
  website: string
  phone: string
  /** Giant's own stores, as opposed to independent dealers that stock the brand. */
  isGiantStore: boolean
  country: string
}

export interface Coords {
  latitude: number
  longitude: number
}

export interface StoreMatch {
  store: StoreRecord
  distanceKm: number
}

export const SEARCH_DEBOUNCE_MS = 180
export const MIN_LOCATION_QUERY_LENGTH = 2
/** Rows per group. The list shows towns and dealers under their own headings, not one pool. */
export const SUGGESTION_LIMIT = 3

const STORE_DATA_URL = '/giant-stores-nl.json'
const PLACE_DATA_URL = '/nl-places.json'

function normalizeSearchText(value: string): string {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Every letter of `typed` in order, but not necessarily together: "bl" is in "barnsley". */
function isScattered(word: string, typed: string): boolean {
  let index = 0
  for (const letter of word) if (letter === typed[index] && ++index === typed.length) return true
  return false
}

/** All worse than any whole-string tier below, so a solid match never loses to a spread one. */
const STARTS_WORD = 4
const INSIDE_WORD = 5
const SCATTERED_IN_WORD = 6

/**
 * ponytail: "giant bl" is two words landing on two different words of "Giant Store - Blackburn",
 * which no single substring test can see. Each typed word claims the best word not already
 * spoken for and the costs add up, so Blackburn and Blackpool (two word-starts) lead Barnsley
 * and Bristol (one start, one scatter) without shutting them out. Word order is free; a typo
 * inside a word is not forgiven — that needs edit distance, and nobody has asked for it.
 */
function spreadScore(text: string, query: string): number {
  const words = text.split(' ')
  const claimed = new Set<number>()
  let total = 0

  for (const typed of query.split(' ')) {
    let best = Number.POSITIVE_INFINITY
    let bestWord = -1

    words.forEach((word, index) => {
      if (claimed.has(index)) return
      const score = word.startsWith(typed)
        ? STARTS_WORD
        : word.includes(typed)
          ? INSIDE_WORD
          // A single letter is scattered through half the gazetteer, so it has to sit at a
          // word's start or inside one to count.
          : typed.length > 1 && isScattered(word, typed)
            ? SCATTERED_IN_WORD
            : Number.POSITIVE_INFINITY

      if (score < best) {
        best = score
        bestWord = index
      }
    })

    // A typed word nothing answers means this is not the place, however well the rest fit.
    if (bestWord < 0) return Number.POSITIVE_INFINITY
    claimed.add(bestWord)
    total += best
  }

  return total
}

/** Ranks a candidate: exact < prefix < token-prefix < substring < words spread across it. */
function getQueryMatchScore(text: string, query: string): number {
  const normalizedText = normalizeSearchText(text)
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedText || !normalizedQuery) return Number.POSITIVE_INFINITY
  if (normalizedText === normalizedQuery) return 0
  if (normalizedText.startsWith(normalizedQuery)) return 1
  if (normalizedText.split(' ').some((token) => token.startsWith(normalizedQuery))) return 2
  if (normalizedText.includes(normalizedQuery)) return 3
  return spreadScore(normalizedText, normalizedQuery)
}

/** An NL town or four-digit postcode, and where to centre a circle on it. */
interface GazetteerPlace {
  label: string
  /** The province (or, for a postcode, its town) — the grey second line. */
  region: string
  coords: Coords
}

/** "2121" and friends: a gazetteer row that is a postcode rather than a town. */
const POSTCODE = /^\d{4}$/

/** One fetch per dataset, held for the session. A failure is not cached, so typing retries. */
function loadOnce<T>(url: string, parse: (payload: unknown) => T): () => Promise<T> {
  let pending: Promise<T> | null = null

  return () => {
    pending ??= fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${url} request failed: ${response.status}`)
        return response.json()
      })
      .then(parse)
      .catch((error) => {
        pending = null
        throw error
      })

    return pending
  }
}

const getStores = loadOnce(STORE_DATA_URL, (payload: unknown) =>
  Array.isArray(payload) ? (payload as StoreRecord[]) : [],
)

// The file stores regions once and each place points at one by index, rather than repeating
// "North Holland" on every row.
const getPlaces = loadOnce(PLACE_DATA_URL, (payload: unknown): GazetteerPlace[] => {
  const data = payload as { regions?: unknown; places?: unknown }
  if (!Array.isArray(data?.places)) return []
  const regions: string[] = Array.isArray(data.regions) ? data.regions : []

  return (data.places as [string, number, number, number][]).map(([label, region, latitude, longitude]) => ({
    label,
    region: regions[region] ?? '',
    coords: { latitude, longitude },
  }))
})

/** The gazetteer is an enhancement, so losing it narrows the search rather than breaking it. */
const getPlacesOrNone = () => getPlaces().catch((): GazetteerPlace[] => [])

const EARTH_RADIUS_KM = 6371

function kmBetween(from: Coords, to: Coords): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const deltaLat = toRadians(to.latitude - from.latitude)
  const deltaLng = toRadians(to.longitude - from.longitude)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

function coordsOf(store: StoreRecord | undefined): Coords | null {
  if (!store || !Number.isFinite(store.latitude) || !Number.isFinite(store.longitude)) return null
  return { latitude: store.latitude, longitude: store.longitude }
}

/** The dealer whose name, town or postcode best matches a typed place. */
function bestMatch(stores: StoreRecord[], query: string): { store: StoreRecord; score: number } | undefined {
  const trimmed = query.trim()
  if (normalizeSearchText(trimmed).length < MIN_LOCATION_QUERY_LENGTH) return undefined

  return stores
    .map((store) => ({
      store,
      score: Math.min(
        getQueryMatchScore(store.name, trimmed),
        getQueryMatchScore(store.city, trimmed),
        getQueryMatchScore(store.zip, trimmed),
      ),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort(
      (left, right) =>
        left.score - right.score ||
        Number(right.store.isGiantStore) - Number(left.store.isGiantStore) ||
        left.store.name.localeCompare(right.store.name),
    )[0]
}

/** The town or postcode that best matches a typed place. Namesakes keep the file's order,
 * which puts the largest first — "Newport" means the city before it means the hamlet. */
function bestPlace(places: GazetteerPlace[], query: string): { place: GazetteerPlace; score: number } | undefined {
  const trimmed = query.trim()
  if (normalizeSearchText(trimmed).length < MIN_LOCATION_QUERY_LENGTH) return undefined

  return places
    .map((place) => ({ place, score: getQueryMatchScore(place.label, trimmed) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => left.score - right.score || left.place.label.localeCompare(right.place.label))[0]
}

/** Every store measured from `anchor`, nearest first. Stores without coordinates drop out. */
function byDistanceFrom(stores: StoreRecord[], anchor: Coords): StoreMatch[] {
  return stores
    .map((store) => ({ store, coords: coordsOf(store) }))
    .filter((entry) => entry.coords !== null)
    .map((entry) => ({ store: entry.store, distanceKm: kmBetween(anchor, entry.coords!) }))
    .sort((left, right) => left.distanceKm - right.distanceKm)
}

export interface PlaceSuggestion {
  /** Goes into the box when the row is picked, and is what resolves the circle. */
  label: string
  /** The grey second line — where the place is. */
  secondary: string
  /** A dealer picks itself; a town or postcode picks an area, which a radius can size. */
  kind: 'store' | 'place'
}

/**
 * Places matching what has been typed, best first, for the autocomplete list. They come from
 * the same dataset the circle is resolved against, so anything offered here resolves.
 *
 * Towns lead, dealers follow: the list is drawn as two labelled groups, and the keyboard walks
 * it in one pass, so this order is the order on screen.
 */
export async function locationSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (normalizeSearchText(query).length < MIN_LOCATION_QUERY_LENGTH) return []
  const [stores, gazetteer] = await Promise.all([getStores(), getPlacesOrNone()])

  // A place offered by two dealers keeps its best score. Towns lead, then dealer names, then
  // postcodes — a nudge rather than a sort key, so an exact postcode still beats a loose town.
  const places = new Map<string, PlaceSuggestion & { score: number }>()
  const offer = (label: string, secondary: string, kind: PlaceSuggestion['kind'], score: number) => {
    if (!label || !Number.isFinite(score)) return
    const seen = places.get(label)
    if (!seen || score < seen.score) places.set(label, { label, secondary, kind, score })
  }

  // The gazetteer leads, so a town carries its province on the second line rather than the bare
  // country a dealer record holds — and so towns without a dealer are offered at all.
  for (const place of gazetteer) {
    const nudge = POSTCODE.test(place.label) ? 0.2 : 0
    offer(place.label, place.region, 'place', getQueryMatchScore(place.label, query) + nudge)
  }

  for (const store of stores) {
    const where = [store.city, store.country].filter(Boolean).join(', ')
    offer(store.city, store.country, 'place', getQueryMatchScore(store.city, query))
    // A dealer is picked by sight, so it says its street rather than its country.
    offer(store.name, [store.address, store.city].filter(Boolean).join(', '), 'store', getQueryMatchScore(store.name, query) + 0.1)
    offer(store.zip, where, 'place', getQueryMatchScore(store.zip, query) + 0.2)
  }

  const ranked = [...places.values()].sort(
    (left, right) => left.score - right.score || left.label.localeCompare(right.label),
  )
  const take = (kind: PlaceSuggestion['kind']) =>
    ranked.filter((entry) => entry.kind === kind).slice(0, SUGGESTION_LIMIT)

  return [...take('place'), ...take('store')].map(({ label, secondary, kind }) => ({ label, secondary, kind }))
}

export interface NearbyStores {
  /** The place the circle ended up centred on, as the input should read it back. */
  label: string
  /** Dealers inside the radius, nearest first. Empty means nothing is in range. */
  matches: StoreMatch[]
}

/**
 * Dealers within `radiusKm` of a typed place or a browser fix — what the "available near
 * me" filter runs on, and what names the stores on each product card.
 */
export async function findNearbyStores(
  query: string,
  origin: Coords | null,
  radiusKm: number,
): Promise<NearbyStores | null> {
  const [stores, places] = await Promise.all([getStores(), getPlacesOrNone()])

  // A browser fix wins outright. Otherwise the gazetteer and the dealer list are scored
  // against the same text and the better match centres the circle; a tie goes to the
  // gazetteer, so "Bristol" means the city rather than the first dealer named after it.
  const place = origin ? undefined : bestPlace(places, query)
  const dealer = origin ? undefined : bestMatch(stores, query)
  const anchorPlace = place && (!dealer || place.score <= dealer.score) ? place.place : undefined
  const anchorStore = anchorPlace ? undefined : dealer?.store
  const anchor = origin ?? anchorPlace?.coords ?? coordsOf(anchorStore)
  if (!anchor) return null

  const measured = byDistanceFrom(stores, anchor)
  // A typed place reads back as what it resolved to; a browser fix has no name of its own,
  // so it borrows the nearest dealer's town.
  const named = anchorStore ?? measured[0]?.store

  return {
    label: anchorPlace?.label ?? (named ? named.city || named.name : ''),
    matches: measured.filter((entry) => entry.distanceKm <= radiusKm),
  }
}

/** The dealer with this id, or null when the id is not in the network — a stale link, say. */
export async function findStoreById(id: string): Promise<StoreRecord | null> {
  if (!id) return null
  const stores = await getStores()
  return stores.find((store) => store.id === id) ?? null
}

/** Dealers by name, town or postcode, best first. What the product page's store search runs on. */
export async function searchStores(query: string, limit = 6): Promise<StoreRecord[]> {
  const trimmed = query.trim()
  if (normalizeSearchText(trimmed).length < MIN_LOCATION_QUERY_LENGTH) return []
  const stores = await getStores()

  return stores
    .map((store) => ({
      store,
      score: Math.min(
        getQueryMatchScore(store.name, trimmed),
        getQueryMatchScore(store.city, trimmed),
        getQueryMatchScore(store.zip, trimmed),
      ),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort(
      (left, right) =>
        left.score - right.score ||
        Number(right.store.isGiantStore) - Number(left.store.isGiantStore) ||
        left.store.name.localeCompare(right.store.name),
    )
    .slice(0, limit)
    .map((entry) => entry.store)
}

/** Dealers within `radiusKm` of a dealer, nearest first, leaving that dealer out. */
export async function nearbyStoresTo(store: StoreRecord, radiusKm: number): Promise<StoreMatch[]> {
  const anchor = coordsOf(store)
  if (!anchor) return []
  const stores = await getStores()
  return byDistanceFrom(stores, anchor).filter(
    (match) => match.store.id !== store.id && match.distanceKm <= radiusKm,
  )
}
