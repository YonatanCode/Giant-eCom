import type { Category, Product } from '../../data/categories'
import { productColorBuckets } from '../../lib/color-buckets'
import { parseCurrencyAmount } from '../../lib/format'
import { deliveryStateFor, storeStockFor } from '../../lib/store-stock'
import {
  AVAILABILITY_DELIVERY,
  COLOR_PREFIX,
  RADIUS_DEFAULT_KM,
  SIZE_PREFIX,
  type SortValue,
} from './filter-config'

/** A dealer inside the circle. The name comes along so the card can say where a bike is. */
export interface NearbyStore {
  id: string
  name: string
  /** Giant's own store, which the card names ahead of any independent dealer. */
  isGiant?: boolean
}

/** Where the shopper is and how far they will go, with the dealers that fall inside it. */
export interface NearFilter {
  /** Blank until a place resolves — the radius slider only appears once it is set. */
  label: string
  radiusKm: number
  /** A picked dealer is a circle of one; a town or postcode is an area the radius sizes. */
  kind?: 'store' | 'place'
  /**
   * Dealers inside the circle, nearest first.
   * ponytail: resolved by the panel and carried in filter state rather than passed
   * alongside it, because the store list only loads over fetch and this keeps filtering
   * pure — and keeps the mobile drawer's Apply moving the circle with everything else.
   */
  stores: NearbyStore[]
}

export interface FiltersState {
  /** Every ticked checkbox, keyed by option id. See filter-config for how ids are shaped. */
  checked: Record<string, boolean>
  priceMin: number | null
  priceMax: number | null
  /** The circle. It is drawn on every card as soon as a place resolves, filtering or not. */
  near: NearFilter
  /**
   * The "Available on location" toggle. Off still names the nearby dealers on each card; it only
   * stops the circle narrowing the grid, so the shopper keeps the rest of the range in view.
   */
  nearOnly: boolean
}

export function createFilters(): FiltersState {
  return {
    checked: {},
    priceMin: null,
    priceMax: null,
    near: { label: '', radiusKm: RADIUS_DEFAULT_KM, stores: [] },
    nearOnly: false,
  }
}

export function getActiveFiltersCount(filters: FiltersState): number {
  let count = Object.values(filters.checked).filter(Boolean).length
  if (filters.priceMin !== null || filters.priceMax !== null) count += 1
  if (filters.nearOnly && filters.near.label) count += 1
  return count
}

/**
 * The dealers in range that hold this bike, nearest first. One implementation so the grid
 * and the card can never disagree about what is where.
 */
export function stockingStores(product: Product, near: NearFilter): NearbyStore[] {
  if (!near.label) return []
  return near.stores.filter((store) => storeStockFor(product, store.id).sizes.length > 0)
}

/** The card's stock line, split so each dealer name can be kept unbreakable in the markup. */
export interface NearbyStockLine {
  inStock: boolean
  /** Dealers to name outright — at most two, joined with "and". */
  names: string[]
  /** What follows the names, or the whole line when nothing in range holds it. */
  rest: string
}

/**
 * What the card says about the circle. One dealer is named and the rest are counted, since
 * "and 3 other stores in range" is all a shopper needs before clicking through. A picked
 * dealer is the whole answer instead: it is either holding the bike or it is not.
 */
export function describeNearbyStock(product: Product, near: NearFilter): NearbyStockLine {
  const stocking = stockingStores(product, near)

  if (near.kind === 'store') {
    const name = near.stores[0]?.name ?? near.label
    if (!stocking.length) return { inStock: false, names: [], rest: `Not in stock at ${name}` }
    // A dealer short of a size says which, so the card and the product page tell the same story.
    const held = storeStockFor(product, near.stores[0].id).sizes
    const missing = product.sizes.filter((size) => !held.includes(size))
    return { inStock: true, names: [name], rest: missing.length ? `(not in size ${missing.join(', ')})` : '' }
  }

  // A Giant store is named first even when a closer dealer also holds it. `sort` is stable,
  // so the rest keep their nearest-first order.
  const names = [...stocking]
    .sort((left, right) => Number(Boolean(right.isGiant)) - Number(Boolean(left.isGiant)))
    .map((store) => store.name)

  if (!names.length) {
    return { inStock: false, names: [], rest: `Not in stock within ${near.radiusKm} km` }
  }
  if (names.length === 1) return { inStock: true, names, rest: '' }

  const others = names.length - 1
  return { inStock: true, names: [names[0]], rest: `and ${others} other store${others > 1 ? 's' : ''} in range` }
}

function checkedWithPrefix(filters: FiltersState, prefix: string): string[] {
  return Object.keys(filters.checked)
    .filter((id) => filters.checked[id] && id.startsWith(prefix))
    .map((id) => id.slice(prefix.length))
}

/**
 * The size a card hands to the product page: the one ticked size this bike comes in. Two ticked
 * sizes it comes in leave the choice to the shopper, and a ticked size it lacks is not its to carry.
 */
export function sizeToCarry(filters: FiltersState, product: Product): string | null {
  const fits = checkedWithPrefix(filters, SIZE_PREFIX).filter((size) => product.sizes.includes(size))
  return fits.length === 1 ? fits[0] : null
}

export function getFilteredProducts(
  products: Product[],
  filters: FiltersState,
  sortBy: SortValue,
  priceBounds: { min: number; max: number },
  filterGroups: Category['filterGroups'] = [],
): Product[] {
  let visible = [...products]

  // Availability behaves like any other group — having both widens. The circle only narrows
  // anything once its toggle is on and a place has resolved.
  const availability: Array<(product: Product) => boolean> = []
  if (filters.nearOnly && filters.near.label) {
    availability.push((product) => stockingStores(product, filters.near).length > 0)
  }
  if (filters.checked[AVAILABILITY_DELIVERY]) {
    availability.push((product) => deliveryStateFor(product) === 'available')
  }
  if (availability.length) {
    visible = visible.filter((product) => availability.some((matches) => matches(product)))
  }

  // Options within a group widen the results; each group narrows them. Ticking Enduro and
  // Trail shows both, but adding Carbon keeps only the carbon ones among those.
  for (const group of filterGroups) {
    const selected = group.options.map((option) => option.id).filter((id) => filters.checked[id])
    if (!selected.length) continue
    visible = visible.filter((product) => selected.some((facet) => product.facets.includes(facet)))
  }

  const sizes = checkedWithPrefix(filters, SIZE_PREFIX)
  if (sizes.length) {
    visible = visible.filter((product) => sizes.some((size) => product.sizes.includes(size)))
  }

  const colors = checkedWithPrefix(filters, COLOR_PREFIX)
  if (colors.length) {
    visible = visible.filter((product) => {
      const buckets = productColorBuckets(product)
      return colors.some((color) => buckets.has(color))
    })
  }

  if (filters.priceMin !== null || filters.priceMax !== null) {
    const min = filters.priceMin ?? priceBounds.min
    const max = filters.priceMax ?? priceBounds.max
    visible = visible.filter((product) => {
      const amount = parseCurrencyAmount(product.price.amount)
      return amount !== null && amount >= min && amount <= max
    })
  }

  if (sortBy === 'price-low') {
    visible.sort((a, b) => (parseCurrencyAmount(a.price.amount) || 0) - (parseCurrencyAmount(b.price.amount) || 0))
  }

  if (sortBy === 'price-high') {
    visible.sort((a, b) => (parseCurrencyAmount(b.price.amount) || 0) - (parseCurrencyAmount(a.price.amount) || 0))
  }

  return visible
}

/**
 * What each option would still leave, so the panel can grey out the dead ends. An option is
 * counted against every *other* group's selections but not its own — otherwise ticking
 * Enduro would zero Trail and lock the group to one choice. Price and the near-me radius are
 * not counted: neither has options to disable.
 */
export function getOptionCounts(
  products: Product[],
  filters: FiltersState,
  priceBounds: { min: number; max: number },
  filterGroups: Category['filterGroups'] = [],
): Record<string, number> {
  const counts: Record<string, number> = {}

  // One pass per group: drop that group's ticks, apply the rest, then count each option.
  const tally = (ids: string[], matches: (product: Product, id: string) => boolean) => {
    if (!ids.length) return
    const checked = { ...filters.checked }
    for (const id of ids) delete checked[id]
    const pool = getFilteredProducts(
      products,
      { ...filters, checked },
      'featured',
      priceBounds,
      filterGroups,
    )
    for (const id of ids) counts[id] = pool.filter((product) => matches(product, id)).length
  }

  for (const group of filterGroups) {
    tally(
      group.options.map((option) => option.id),
      (product, id) => product.facets.includes(id),
    )
  }

  const sizes = [...new Set(products.flatMap((product) => product.sizes))]
  tally(
    sizes.map((size) => `${SIZE_PREFIX}${size}`),
    (product, id) => product.sizes.includes(id.slice(SIZE_PREFIX.length)),
  )

  const colors = [...new Set(products.flatMap((product) => [...productColorBuckets(product)]))]
  tally(
    colors.map((color) => `${COLOR_PREFIX}${color}`),
    (product, id) => productColorBuckets(product).has(id.slice(COLOR_PREFIX.length)),
  )

  tally([AVAILABILITY_DELIVERY], (product) => deliveryStateFor(product) === 'available')

  return counts
}
