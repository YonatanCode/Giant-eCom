// Filter options are no longer authored here — each category ships its own groups, scraped
// from Giant's filter sidebar (see src/data/categories.ts), and Size and Colour are derived
// from the catalogue. What is left is the shapes those share and the sort options.

export interface CheckboxOption {
  id: string
  label: string
  /** Info tooltip copy, shown behind an (i) button. */
  info?: string
}

export interface ColorOption {
  id: string
  label: string
  hex: string
  count: number
}

/**
 * Checkbox ids are namespaced by what they filter on, because they share one `checked`
 * map: a facet option is named after Giant's own tile class, so it needs no prefix.
 */
export const SIZE_PREFIX = 'size:'
export const COLOR_PREFIX = 'color:'

/**
 * Availability is a location and a radius ("Available on location") plus one checkbox for
 * delivery, so unlike the scraped groups it is declared here rather than coming from
 * Giant's sidebar. Only the delivery half is a checkbox; the radius lives in FiltersState.
 */
export const AVAILABILITY_DELIVERY = 'availability:delivery'

/** The "km away" slider. 100 reaches a dealer from anywhere in the Netherlands. */
export const RADIUS_MIN_KM = 5
export const RADIUS_MAX_KM = 100
export const RADIUS_STEP_KM = 5
export const RADIUS_DEFAULT_KM = 25

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']
