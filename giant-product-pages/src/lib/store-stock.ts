// Stock at a named store, for the rows on the product card.
//
// Two very different things meet here, and the split is deliberate:
//
//   Delivery  — REAL. `product.stock` comes from Giant's own per-SKU JSON-LD offers.
//   In store  — INVENTED. Giant publishes no dealer inventory anywhere: no endpoint, and
//               their own product pages tell you to ring the shop. So a bike's holding at
//               a given store is derived from a hash of (product, store).
//
// ponytail: a hash, not a random draw, so a bike reads the same at the same store on every
// render and across reloads — which is what makes the demo worth clicking through. Swap
// `storeStockFor` for a real lookup the day there is an inventory feed; nothing else here
// needs to change.

import type { Product } from '../data/categories'

// ── Mock store stock: edit these numbers ─────────────────────────────────────────────────
// Every value is a percentage, 0–100. Save and reload the page to see the change.
const MOCK_STOCK = {
  // Out of every 100 bikes, how many a store has in EVERY size.
  allSizesPercent: 4,

  // Out of every 100 bikes, how many a store has in every size but ONE.
  // Whatever is left over (100 minus these first two numbers) is not in the store at all.
  someSizesPercent: 16,

  // Of the bikes NOT in the store, how many can still be ordered in for click & collect.
  orderInPercent: 64,
}
// ─────────────────────────────────────────────────────────────────────────────────────────

export interface StoreStock {
  /** Sizes this store holds. Empty means the shopper sees "Out of stock in <store>". */
  sizes: string[]
  /** True when the store holds every size the bike comes in. */
  isComplete: boolean
  /** Reservable online, collected in store. Stores hold this more often than full stock. */
  clickAndCollect: boolean
}

/** FNV-1a. Small, stable, and good enough to spread ids evenly across buckets. */
function hash(text: string): number {
  let value = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 0x01000193) >>> 0
  }
  return value >>> 0
}

/**
 * A store holds a slice of the range, not all of it. The weighting is read off a real Giant
 * store availability check (Bridgwater, GB, road): most models are not on the floor at all — the
 * closest store with stock is tens of kilometres away. Of the ones that are, a store is short of one
 * size at most (a thin rack read as harsh on the page), and a few hero models are there in
 * the full run.
 */
export function storeStockFor(product: Product, storeId: string): StoreStock {
  const seed = hash(`${product.id}@${storeId}`)
  const sizes = product.sizes
  const { allSizesPercent, someSizesPercent, orderInPercent } = MOCK_STOCK
  // Not held, but most shops will still order one in for collection.
  const canOrderIn = (seed >>> 8) % 100 < orderInPercent

  if (!sizes.length) {
    return { sizes: [], isComplete: false, clickAndCollect: canOrderIn }
  }

  const roll = seed % 100
  if (roll >= allSizesPercent + someSizesPercent) {
    return { sizes: [], isComplete: false, clickAndCollect: canOrderIn }
  }

  // A bike made in one size has nothing to be short of, so once held it is held whole.
  if (roll < allSizesPercent || sizes.length === 1) {
    return { sizes: [...sizes], isComplete: true, clickAndCollect: true }
  }

  // Short of exactly one size, picked by index off the seed. `>>>` keeps it unsigned: `seed`
  // fills all 32 bits, and a signed shift would go negative and pick nothing.
  const missing = (seed >>> 7) % sizes.length
  return {
    sizes: sizes.filter((_, index) => index !== missing),
    isComplete: false,
    clickAndCollect: true,
  }
}

export type DeliveryState = 'available' | 'unavailable'

export function deliveryStateFor(product: Product): DeliveryState {
  return product.stock.inStock > 0 ? 'available' : 'unavailable'
}
