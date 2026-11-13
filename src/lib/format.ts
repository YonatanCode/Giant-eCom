import type { Product, ProductPrice } from '../data/categories'

/**
 * Prices arrive as display strings ("£4,500", "€ 4.499"); filtering/sorting needs numbers.
 * Whole units only: "," and "." are both read as thousands separators, because the two
 * markets disagree on which is which and no price in the catalogue carries cents.
 */
export function parseCurrencyAmount(value: string | undefined): number | null {
  if (!value) return null
  const digits = String(value).replace(/[.,]\d{1,2}$/, '').replace(/\D/g, '')
  if (!digits) return null
  const numericValue = Number(digits)
  return Number.isFinite(numericValue) ? numericValue : null
}

/** The prototype's market: the Netherlands, in euros, written the Dutch way ("€ 4.499"). */
export const MARKET = 'NL'
export const CURRENCY = 'EUR'
// ponytail: `nl-NL` rather than `en-NL` — Node and browsers disagree on how `en-NL` groups
// digits, and a server/client mismatch on a price is a hydration error.
const PRICE_LOCALE = 'nl-NL'

export function formatPrice(value: number, currency = CURRENCY): string {
  return new Intl.NumberFormat(PRICE_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

// ── Mock euro prices: edit these numbers ─────────────────────────────────────────────────
// ponytail: the catalogue is still Giant's GB range, imported in pounds. These are NOT
// Giant's Dutch prices — each one is the GB price multiplied by a flat rate and tidied to a
// shop-style figure ending in 49 or 99. Re-import from giant-bicycles.com/nl for real ones.
const GBP_TO_EUR = 1.15
const EURO_PRICE_STEP = 50
// ─────────────────────────────────────────────────────────────────────────────────────────

/** A GB display price as its euro stand-in: "£9,999" -> "€ 11.499". Anything unreadable is kept. */
export function toEuroPrice(gbpAmount: string): string {
  const pounds = parseCurrencyAmount(gbpAmount)
  if (!pounds) return gbpAmount
  const euros = Math.max(EURO_PRICE_STEP, Math.round((pounds * GBP_TO_EUR) / EURO_PRICE_STEP) * EURO_PRICE_STEP) - 1
  return formatPrice(euros)
}

/** Reduction of `amount` against a reference price, rounded — null when there is no saving. */
export function getDiscountPercentage(amount: string | undefined, reference: string | undefined): number | null {
  const currentAmount = parseCurrencyAmount(amount)
  const referenceAmount = parseCurrencyAmount(reference)
  if (!currentAmount || !referenceAmount || referenceAmount <= currentAmount) return null
  return Math.round(((referenceAmount - currentAmount) / referenceAmount) * 100)
}

export interface PriceDisclosure {
  label: string
  amount: string
  percentage: number
  /** The regular price is shown struck through; the 30-day reference is not. */
  struck: boolean
}

/**
 * EU Omnibus (Directive 2019/2161) price disclosure, as lines under a reduced price.
 *
 * `oldAmount` is the lowest price of the previous 30 days and is always disclosed. Where
 * the regular selling price sits above it — the item was already reduced inside the window
 * — the deeper saving against the regular price is disclosed on a second line, so neither
 * figure can be read as the only reference. An undiscounted price discloses nothing.
 */
export function getPriceDisclosures(price: ProductPrice): PriceDisclosure[] {
  if (price.mode !== 'discount' && price.mode !== 'from-discount') return []

  const lowestSaving = getDiscountPercentage(price.amount, price.oldAmount)
  if (!lowestSaving || !price.oldAmount) return []

  const disclosures: PriceDisclosure[] = [
    { label: 'Lowest price past 30 days', amount: price.oldAmount, percentage: lowestSaving, struck: false },
  ]

  const regularSaving = getDiscountPercentage(price.amount, price.regularAmount)
  if (price.regularAmount && regularSaving && regularSaving > lowestSaving) {
    disclosures.push({ label: 'Regular price', amount: price.regularAmount, percentage: regularSaving, struck: true })
  }

  return disclosures
}
const PRODUCT_TILE_IMAGE_TRANSFORM = 'b_white%2Cc_pad%2Ch_600%2Cq_80%2Cw_800'

/** Product images are authored at h_2000; tiles only need the smaller CDN transform. */
export function optimizeProductImageSrc(src: string | undefined): string | undefined {
  if (!src) return src
  return src.replace(/b_white%2Cc_pad%2Ch_\d+%2Cq_\d+/, PRODUCT_TILE_IMAGE_TRANSFORM)
}

export const PRICE_STEP = 50
export const PRICE_DISCLAIMER = '0% APR Finance'
export const MAX_COMPARE_ITEMS = 3

export function getPriceBounds(products: Product[]) {
  const prices = products.map((p) => parseCurrencyAmount(p.price.amount)).filter((v): v is number => Boolean(v))
  return {
    min: prices.length ? Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP : 0,
    max: prices.length ? Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP : 10000,
  }
}
