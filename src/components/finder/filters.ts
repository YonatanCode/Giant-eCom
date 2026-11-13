import type { StoreListing } from '../../data/stores-nl'

export const FILTER_CHIPS = [
  'All',
  'Giant bikes',
  'Liv bikes',
  'Test ride',
  'Bike fitting',
  'E-bike',
  'Service & repair',
] as const

export type FilterLabel = (typeof FILTER_CHIPS)[number]

const MATCHERS: Record<FilterLabel, (tags: string[]) => boolean> = {
  'All': () => true,
  // ponytail: Giant/Liv/service have no distinguishing source tags; keep visual chips as no-ops.
  'Giant bikes': () => true,
  'Liv bikes': () => true,
  'Test ride': (tags) => tags.includes('E-bike Testcenter'),
  'Bike fitting': (tags) => tags.some((tag) => tag.startsWith('DCF')),
  'E-bike': (tags) => tags.includes('E-bike certificaat') || tags.includes('E-bike Testcenter'),
  'Service & repair': () => true,
}

export function matchesAllActiveFilters(
  store: Pick<StoreListing, 'tags'>,
  active: Set<string>,
): boolean {
  for (const label of active) {
    const matcher = MATCHERS[label as FilterLabel]
    if (!matcher?.(store.tags)) return false
  }

  return true
}
