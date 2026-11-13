export const MARKER_DOT_ZOOM_THRESHOLD = 8
export const MARKER_FULL_PIN_ZOOM_THRESHOLD = 10
export const MARKER_MIN_SCALE_ZOOM = 7
export const MARKER_MIN_ZOOM_SCALE = 0.1
export const MARKER_DOT_MIN_ZOOM_SCALE = 0.7

export type MarkerScalePoint = {
  x: number
  y: number
}

export type MarkerScaleStore = {
  slug: string
  lat: number
  lng: number
}

export type MarkerPresentation = 'pin' | 'smallPin' | 'dot'

export type MarkerZoomStyle = {
  presentation: MarkerPresentation
  scale: number
}

export type ScaledViewportMarker<T extends MarkerScaleStore> = {
  id: string
  store: T
  point: MarkerScalePoint
  presentation: MarkerPresentation
  scale: number
}

export function scaleMarkersByViewport<T extends MarkerScaleStore>(
  stores: T[],
  options: {
    selectedSlug: string | null
    zoom: number
    project: (store: T) => MarkerScalePoint | undefined
    dotZoomThreshold?: number
    fullPinZoomThreshold?: number
    minScaleZoom?: number
    minZoomScale?: number
    dotMinZoomScale?: number
  },
): ScaledViewportMarker<T>[] {
  const projected = stores
    .map((store) => ({ store, point: options.project(store) }))
    .filter((entry): entry is { store: T; point: MarkerScalePoint } => Boolean(entry.point))
  const unselectedStyle = getUnselectedMarkerStyleForZoom(options.zoom, options)

  return projected.map(({ store, point }) => ({
    id: store.slug,
    store,
    point,
    presentation: store.slug === options.selectedSlug ? 'pin' : unselectedStyle.presentation,
    scale: store.slug === options.selectedSlug ? 1 : unselectedStyle.scale,
  }))
}

export function getUnselectedMarkerStyleForZoom(
  zoom: number,
  options: {
    dotZoomThreshold?: number
    fullPinZoomThreshold?: number
    minScaleZoom?: number
    minZoomScale?: number
    dotMinZoomScale?: number
  } = {},
): MarkerZoomStyle {
  const dotZoomThreshold = options.dotZoomThreshold ?? MARKER_DOT_ZOOM_THRESHOLD
  const fullPinZoomThreshold = options.fullPinZoomThreshold ?? MARKER_FULL_PIN_ZOOM_THRESHOLD
  const minScaleZoom = options.minScaleZoom ?? MARKER_MIN_SCALE_ZOOM
  const minZoomScale = options.minZoomScale ?? MARKER_MIN_ZOOM_SCALE
  const dotMinZoomScale = options.dotMinZoomScale ?? MARKER_DOT_MIN_ZOOM_SCALE
  const presentation = getUnselectedMarkerPresentation(zoom, {
    dotZoomThreshold,
    fullPinZoomThreshold,
  })

  return {
    presentation,
    scale: getUnselectedMarkerScale(zoom, {
      presentation,
      dotZoomThreshold,
      fullPinZoomThreshold,
      minScaleZoom,
      minZoomScale,
      dotMinZoomScale,
    }),
  }
}

function getUnselectedMarkerPresentation(
  zoom: number,
  thresholds: {
    dotZoomThreshold: number
    fullPinZoomThreshold: number
  },
): MarkerPresentation {
  if (zoom < thresholds.dotZoomThreshold) return 'dot'
  if (zoom < thresholds.fullPinZoomThreshold) return 'smallPin'

  return 'pin'
}

function getUnselectedMarkerScale(
  zoom: number,
  thresholds: {
    presentation: MarkerPresentation
    dotZoomThreshold: number
    fullPinZoomThreshold: number
    minScaleZoom: number
    minZoomScale: number
    dotMinZoomScale: number
  },
) {
  if (thresholds.presentation === 'dot') {
    if (zoom >= thresholds.dotZoomThreshold) return 1
    if (zoom <= thresholds.minScaleZoom) return thresholds.dotMinZoomScale

    const zoomProgress =
      (zoom - thresholds.minScaleZoom) / (thresholds.dotZoomThreshold - thresholds.minScaleZoom)

    return thresholds.dotMinZoomScale + zoomProgress * (1 - thresholds.dotMinZoomScale)
  }

  if (zoom >= thresholds.fullPinZoomThreshold) return 1
  if (zoom <= thresholds.minScaleZoom) return thresholds.minZoomScale

  const zoomProgress =
    (zoom - thresholds.minScaleZoom) / (thresholds.fullPinZoomThreshold - thresholds.minScaleZoom)

  return thresholds.minZoomScale + zoomProgress * (1 - thresholds.minZoomScale)
}
