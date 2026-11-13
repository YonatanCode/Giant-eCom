// The handoff from the listing to the product page: which bike, which colour, and the store
// the shopper picked, all in the URL.
//
// ponytail: PROTOTYPE contract. The live PDP on giant-bicycles.com reads none of this — it has no
// way to take a store from a link — so the prototype ships its own product page to show what
// the live one would do with it. The store is the dealer id from `pnpm import:stores`.

export const STORE_PARAM = 'store'
export const COLOR_PARAM = 'color'
export const SIZE_PARAM = 'size'

interface ProductLink {
  /** The category's own path, e.g. `/nl/bikes/road-bikes`. */
  categoryHref: string
  productId: string
  colorKey?: string | null
  /** The size the shopper was already filtering on, so the page opens with it picked. */
  size?: string | null
  storeId?: string | null
}

/** The product page for a bike. Colour, size and store only appear once there is one to carry. */
export function productHref({ categoryHref, productId, colorKey, size, storeId }: ProductLink): string {
  const params = new URLSearchParams()
  if (colorKey) params.set(COLOR_PARAM, colorKey)
  if (size) params.set(SIZE_PARAM, size)
  if (storeId) params.set(STORE_PARAM, storeId)
  const query = params.toString()
  return `${categoryHref}/${productId}${query ? `?${query}` : ''}`
}

/**
 * `params` with the store set, or removed when there is none. Everything else is kept, except
 * the size when `keepSize` is false — a size does not follow the shopper to a store that
 * cannot supply it.
 */
export function withStoreParam(params: URLSearchParams, storeId: string | null, keepSize = true): URLSearchParams {
  const next = new URLSearchParams(params)
  if (storeId) next.set(STORE_PARAM, storeId)
  else next.delete(STORE_PARAM)
  if (!keepSize) next.delete(SIZE_PARAM)
  return next
}
