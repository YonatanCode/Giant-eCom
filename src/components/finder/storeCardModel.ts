import type { StoreListing } from '../../data/stores-nl'

export type StoreCardCta = {
  href: string
  external: boolean
}

export type StoreAvatarVariant = 'giant' | 'store'

export type StoreOpeningHour = {
  day: string
  hours: string
}

type StoreHoursSource = {
  openingHours?: StoreOpeningHour[]
}

export const DEFAULT_STORE_OPENING_HOURS: StoreOpeningHour[] = [
  { day: 'Monday', hours: 'Closed' },
  { day: 'Tuesday', hours: '09:00 - 18:00' },
  { day: 'Wednesday', hours: '09:00 - 18:00' },
  { day: 'Thursday', hours: '09:00 - 18:00' },
  { day: 'Friday', hours: '09:00 - 18:00' },
  { day: 'Saturday', hours: '09:00 - 17:00' },
  { day: 'Sunday', hours: 'Closed' },
]

export function getStoreTypeLabel(store: Pick<StoreListing, 'isGiantStore'>): string {
  return store.isGiantStore ? 'Official Giant Retailer' : 'Authorised Partner'
}

export function getStoreAvatarVariant(store: Pick<StoreListing, 'isGiantStore'>): StoreAvatarVariant {
  return store.isGiantStore ? 'giant' : 'store'
}

export function formatStoreAddress(store: Pick<StoreListing, 'street' | 'postcode' | 'city'>): string {
  return `${store.street}, ${store.postcode} ${store.city}`
}

export function getStoreDescription(store: Pick<StoreListing, 'isGiantStore' | 'city' | 'tags'>): string {
  const storeKind = store.isGiantStore ? 'Official Giant retailer' : 'Authorised Giant partner'
  const services = store.tags
    .filter((tag) => !/giant store|premium retailer/i.test(tag))
    .slice(0, 2)
    .map((tag) => tag.toLowerCase())

  if (services.length === 0) {
    return `${storeKind} in ${store.city}.`
  }

  return `${storeKind} in ${store.city} offering ${services.join(' and ')}.`
}

export function formatDistanceKm(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`
}

export function getStoreOpeningHours(store: StoreHoursSource): StoreOpeningHour[] {
  return store.openingHours?.length ? store.openingHours : DEFAULT_STORE_OPENING_HOURS
}

export function getStoreOpeningHoursSummary(openingHours: StoreOpeningHour[]): string {
  const openRow = openingHours.find((row) => !/closed/i.test(row.hours))

  if (!openRow) return 'Closed now'

  const closingTime = openRow.hours.match(/(?:-|–|to)\s*(\d{1,2}:\d{2})\s*$/i)?.[1]

  return closingTime ? `Open now - closes ${closingTime}` : openRow.hours
}

export function getStoreCta(
  store: Pick<StoreListing, 'isGiantStore' | 'detailHref' | 'website'>,
): StoreCardCta | null {
  if (store.isGiantStore) {
    return { href: store.detailHref, external: false }
  }

  if (!store.website) return null

  return { href: store.website, external: true }
}
