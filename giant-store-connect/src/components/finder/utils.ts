type Point = {
  lat: number
  lng: number
}

export type MapBounds = [[number, number], [number, number]]

export type StoreFinderMapView =
  | { bounds: MapBounds }
  | { center: [number, number]; zoom: number }

export const NL_BOUNDS: MapBounds = [
  [3.3, 50.7],
  [7.3, 53.6],
]

export const STORE_FINDER_MAP_PADDING = { left: 480, top: 40, right: 40, bottom: 40 }

// The 480px left inset only makes sense when the panel floats over the map
// (md+). On mobile the panel sits below a short map, so that inset — and even
// the 40px default — can exceed the canvas and make fitBounds throw
// "Map cannot fit within canvas", leaving the map fully zoomed out.
// Padding is clamped to a third of each axis so a fit always has room.
export function storeFinderMapPadding(canvas: { width: number; height: number }) {
  const panelOverlaps = canvas.width >= 768
  const cap = (value: number, extent: number) =>
    Math.max(0, Math.min(value, Math.floor(extent / 3)))

  return {
    left: cap(panelOverlaps ? 480 : 24, canvas.width),
    right: cap(panelOverlaps ? 40 : 24, canvas.width),
    top: cap(panelOverlaps ? 40 : 24, canvas.height),
    bottom: cap(panelOverlaps ? 40 : 24, canvas.height),
  }
}

export const MAP_CAMERA_ANIMATION = {
  duration: 850,
  essential: false,
  easing: easeOutCubic,
}

const SEARCH_REGION_RADIUS_KM = 30

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function haversineKm(a: Point, b: Point): number {
  const radiusKm = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * radiusKm * Math.asin(Math.sqrt(h))
}

export function boundsOf(stores: Point[]): MapBounds {
  if (stores.length === 0) {
    return NL_BOUNDS
  }

  if (stores.length === 1) {
    const [store] = stores
    return [
      [store.lng - 0.1, store.lat - 0.1],
      [store.lng + 0.1, store.lat + 0.1],
    ]
  }

  let minLng = stores[0].lng
  let minLat = stores[0].lat
  let maxLng = stores[0].lng
  let maxLat = stores[0].lat

  for (const store of stores.slice(1)) {
    minLng = Math.min(minLng, store.lng)
    minLat = Math.min(minLat, store.lat)
    maxLng = Math.max(maxLng, store.lng)
    maxLat = Math.max(maxLat, store.lat)
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export function expandBounds(bounds: MapBounds, ratio: number): MapBounds {
  const [[west, south], [east, north]] = bounds
  const lngPadding = ((east - west) * ratio) / 2
  const latPadding = ((north - south) * ratio) / 2

  return [
    [west - lngPadding, south - latPadding],
    [east + lngPadding, north + latPadding],
  ]
}

export function boundsAroundLocation(
  location: Point,
  radiusKm = SEARCH_REGION_RADIUS_KM,
): MapBounds {
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.max(Math.cos(toRadians(location.lat)), 0.1))

  return [
    [location.lng - lngDelta, location.lat - latDelta],
    [location.lng + lngDelta, location.lat + latDelta],
  ]
}

export function boundsForDeselectedMarker(location: Point | null, selectedStore: Point): MapBounds {
  return boundsAroundLocation(location ?? selectedStore)
}

export function initialMapCameraForView(
  view: StoreFinderMapView,
  canvas: { width: number; height: number },
) {
  if ('bounds' in view) {
    return {
      bounds: view.bounds,
      fitBoundsOptions: {
        padding: storeFinderMapPadding(canvas),
      },
    }
  }

  return { center: view.center, zoom: view.zoom }
}

export function boundsCenter(bounds: MapBounds): Point {
  const [[west, south], [east, north]] = bounds
  return { lng: (west + east) / 2, lat: (south + north) / 2 }
}

export function storesInBounds<T extends Point>(stores: T[], bounds: MapBounds): T[] {
  const [[west, south], [east, north]] = bounds

  return stores.filter(
    (store) =>
      store.lng >= west &&
      store.lng <= east &&
      store.lat >= south &&
      store.lat <= north,
  )
}

export function toggleSelectedSlug(currentSlug: string | null, nextSlug: string): string | null {
  return currentSlug === nextSlug ? null : nextSlug
}

export function storePanelResults<T extends Point & { slug: string; isGiantStore: boolean }>(
  stores: T[],
  options: {
    location: Point | null
    viewportBounds: MapBounds | null
    selectedSlug: string | null
    showViewportStores?: boolean
  },
): Array<T & { distanceKm?: number }> {
  const {
    location,
    viewportBounds,
    selectedSlug,
    showViewportStores = false,
  } = options

  if (!location) {
    if (showViewportStores && viewportBounds) {
      const center = boundsCenter(viewportBounds)
      // ponytail: sort by centre distance but don't attach distanceKm — the pill only shows for a real location
      return [...storesInBounds(stores, viewportBounds)].sort((a, b) => {
        if (a.isGiantStore !== b.isGiantStore) return a.isGiantStore ? -1 : 1
        return haversineKm(center, a) - haversineKm(center, b)
      })
    }

    const selectedStore = selectedSlug
      ? stores.find((store) => store.slug === selectedSlug)
      : undefined

    if (selectedStore) return [selectedStore]

    return []
  }

  const withDistance = stores.map((store) => ({
    ...store,
    distanceKm: haversineKm(location, store),
  }))

  return orderStoreResults(
    storesInBounds(withDistance, viewportBounds ?? boundsAroundLocation(location)),
  )
}

export function orderStoreResults<T extends { isGiantStore: boolean; distanceKm: number }>(
  stores: T[],
): T[] {
  return [...stores].sort((a, b) => {
    if (a.isGiantStore !== b.isGiantStore) {
      return a.isGiantStore ? -1 : 1
    }

    return a.distanceKm - b.distanceKm
  })
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3
}
