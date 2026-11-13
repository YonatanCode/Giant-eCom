// Giant names colourways, it does not categorise them — "Purple Haze/Metallic Navy" is a
// product detail, not something anyone wants to tick in a filter. So the swatch hexes the
// importer resolves are sorted into the handful of buckets the filter panel shows, and
// each bucket's count comes from the catalogue rather than being authored.

import type { Product } from '../data/categories'

export interface ColorBucket {
  id: string
  label: string
  hex: string
}

/** The prototype's original swatch list, plus the two hues Giant's real range needs. */
export const COLOR_BUCKETS: ColorBucket[] = [
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'white', label: 'White', hex: '#ffffff' },
  { id: 'red', label: 'Red', hex: '#c83317' },
  { id: 'blue', label: 'Blue', hex: '#0050fc' },
  { id: 'green', label: 'Green', hex: '#00a316' },
  { id: 'yellow', label: 'Yellow', hex: '#e0b400' },
  { id: 'orange', label: 'Orange', hex: '#ec6046' },
  { id: 'purple', label: 'Purple', hex: '#6b3a9c' },
  { id: 'pink', label: 'Pink', hex: '#d9739a' },
  { id: 'grey', label: 'Grey', hex: '#58626e' },
]

function toHsl(hex: string): { hue: number; saturation: number; lightness: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null

  const value = Number.parseInt(match[1], 16)
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => c / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2

  if (!delta) return { hue: 0, saturation: 0, lightness }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  const hue =
    max === r
      ? ((g - b) / delta + (g < b ? 6 : 0)) * 60
      : max === g
        ? ((b - r) / delta + 2) * 60
        : ((r - g) / delta + 4) * 60

  return { hue, saturation, lightness }
}

/** Hue ranges, in the order they are tested. Upper bound is exclusive. */
const HUE_BUCKETS: Array<[max: number, id: string]> = [
  [15, 'red'],
  [45, 'orange'],
  [70, 'yellow'],
  [160, 'green'],
  [260, 'blue'],
  [290, 'purple'],
  [345, 'pink'],
]

export function bucketForHex(hex: string): string | null {
  const hsl = toHsl(hex)
  if (!hsl) return null

  // Lightness and saturation decide before hue does. Darkness alone is not enough to call
  // something black: navy is as dark as carbon but is plainly blue, so only a dark colour
  // with almost no saturation is black — and everything else unsaturated is grey.
  if (hsl.lightness >= 0.85) return 'white'
  if (hsl.lightness <= 0.1) return 'black'
  if (hsl.saturation < 0.14) return hsl.lightness <= 0.22 ? 'black' : 'grey'

  return HUE_BUCKETS.find(([max]) => hsl.hue < max)?.[1] ?? 'red'
}

/** Every bucket a product offers — a two-tone colourway can land in two. */
export function productColorBuckets(product: Product): Set<string> {
  const buckets = new Set<string>()
  for (const color of product.colors) {
    for (const hex of color.colors) {
      const bucket = bucketForHex(hex)
      if (bucket) buckets.add(bucket)
    }
  }
  return buckets
}

/** The buckets this category actually has stock in, with real counts. */
export function getColorOptions(products: Product[]): Array<ColorBucket & { count: number }> {
  const counts = new Map<string, number>()
  for (const product of products) {
    for (const bucket of productColorBuckets(product)) {
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
    }
  }

  return COLOR_BUCKETS.filter((bucket) => counts.has(bucket.id)).map((bucket) => ({
    ...bucket,
    count: counts.get(bucket.id) ?? 0,
  }))
}
