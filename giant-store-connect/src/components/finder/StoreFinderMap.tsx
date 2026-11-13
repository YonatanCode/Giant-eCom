'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import maplibregl from 'maplibre-gl'
import type { StoreListing } from '../../data/stores-nl'
import { getUnselectedMarkerStyleForZoom, scaleMarkersByViewport, type MarkerPresentation } from './markerScaling'
import {
  initialMapCameraForView,
  MAP_CAMERA_ANIMATION,
  storeFinderMapPadding,
  type MapBounds,
  type StoreFinderMapView,
} from './utils'
import {
  createBrandPinElement,
  getStorePinType,
  getStorePinZIndex,
  isStoreDotPinType,
  loadBrandedMapStyle,
  shouldReplaceStorePinElement,
  type StorePinType,
} from '../store/mapStyle'

export type { StoreFinderMapView }

type StoreFinderMapProps = {
  stores: StoreListing[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
  onViewportInteraction: () => void
  onBoundsChange?: (bounds: MapBounds) => void
  view: StoreFinderMapView
  className?: string
}

type MarkerEntry = {
  marker: maplibregl.Marker
  selected: boolean
  type: StorePinType
  presentation: MarkerPresentation
  scale: number
}

export default function StoreFinderMap({
  stores,
  selectedSlug,
  onSelect,
  onViewportInteraction,
  onBoundsChange,
  view,
  className,
}: StoreFinderMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef(new Map<string, MarkerEntry>())
  const onSelectRef = useRef(onSelect)
  const onViewportInteractionRef = useRef(onViewportInteraction)
  const onBoundsChangeRef = useRef(onBoundsChange)
  const lastCameraViewRef = useRef<StoreFinderMapView | null>(null)
  const latestViewRef = useRef(view)
  const latestStoresRef = useRef(stores)
  const latestSelectedSlugRef = useRef(selectedSlug)
  const [isStyleReady, setIsStyleReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    onViewportInteractionRef.current = onViewportInteraction
  }, [onViewportInteraction])

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
  }, [onBoundsChange])

  useEffect(() => {
    latestViewRef.current = view
  }, [view])

  useEffect(() => {
    latestStoresRef.current = stores
  }, [stores])

  useEffect(() => {
    latestSelectedSlugRef.current = selectedSlug
  }, [selectedSlug])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: maplibregl.Map | null = null
    let cancelled = false
    let mapLoaded = false
    let viewportSyncFrame = 0
    let markerScaleFrame = 0
    let isUserViewportInteraction = false
    const controller = new AbortController()

    async function initializeMap() {
      try {
        const style = await loadBrandedMapStyle(controller.signal)
        if (cancelled || !containerRef.current || mapRef.current) return

        const initialView = latestViewRef.current
        const mapInstance = new maplibregl.Map({
          container: containerRef.current,
          style,
          attributionControl: false,
          ...initialMapCameraForView(initialView, containerRef.current.getBoundingClientRect()),
        })
        map = mapInstance
        mapRef.current = mapInstance
        lastCameraViewRef.current = initialView

        const syncLatestStoreMarkers = () => {
          if (!mapLoaded) return

          syncStoreMarkers(
            mapInstance,
            latestStoresRef.current,
            latestSelectedSlugRef.current,
            markersRef,
            onSelectRef,
          )
        }
        const scheduleMarkerScaleSync = () => {
          if (!mapLoaded || markerScaleFrame) return

          markerScaleFrame = window.requestAnimationFrame(() => {
            markerScaleFrame = 0
            if (!syncStoreMarkerScales(mapInstance, markersRef)) {
              syncLatestStoreMarkers()
            }
          })
        }
        const syncViewportBounds = () => {
          if (!mapLoaded) return

          reportBounds(mapInstance, onBoundsChangeRef)
        }
        const scheduleViewportSync = () => {
          if (!mapLoaded || viewportSyncFrame || !isUserViewportInteraction) return

          viewportSyncFrame = window.requestAnimationFrame(() => {
            viewportSyncFrame = 0
            syncViewportBounds()
          })
        }
        const handleViewportInteraction = (event: { originalEvent?: unknown }) => {
          if (event.originalEvent) {
            isUserViewportInteraction = true
            onViewportInteractionRef.current?.()
          }
        }
        const handleViewportEnd = () => {
          if (markerScaleFrame) {
            window.cancelAnimationFrame(markerScaleFrame)
            markerScaleFrame = 0
          }
          syncLatestStoreMarkers()
          if (viewportSyncFrame) {
            window.cancelAnimationFrame(viewportSyncFrame)
            viewportSyncFrame = 0
          }
          syncViewportBounds()
          isUserViewportInteraction = false
        }

        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
        mapInstance.on('movestart', handleViewportInteraction)
        mapInstance.on('move', scheduleViewportSync)
        mapInstance.on('zoom', scheduleMarkerScaleSync)
        mapInstance.on('moveend', handleViewportEnd)
        mapInstance.on('resize', () => {
          syncLatestStoreMarkers()
          syncViewportBounds()
        })

        mapInstance.once('load', () => {
          mapLoaded = true
          setIsStyleReady(true)
          syncLatestStoreMarkers()
          syncViewportBounds()
        })
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to initialize store finder map', error)
        }
      }
    }

    initializeMap()

    return () => {
      cancelled = true
      controller.abort()
      if (viewportSyncFrame) {
        window.cancelAnimationFrame(viewportSyncFrame)
      }
      if (markerScaleFrame) {
        window.cancelAnimationFrame(markerScaleFrame)
      }
      for (const entry of markersRef.current.values()) {
        entry.marker.remove()
      }
      markersRef.current.clear()
      map?.remove()
      if (mapRef.current === map) {
        mapRef.current = null
      }
      setIsStyleReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isStyleReady) return

    syncStoreMarkers(map, stores, selectedSlug, markersRef, onSelectRef)
  }, [isStyleReady, selectedSlug, stores])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isStyleReady) return
    if (lastCameraViewRef.current === view) return

    if ('bounds' in view) {
      map.fitBounds(view.bounds, {
        // Container rect, not getCanvas(): the canvas buffer is scaled by
        // devicePixelRatio, which would misread a 2x phone as desktop-wide.
        padding: storeFinderMapPadding(map.getContainer().getBoundingClientRect()),
        ...MAP_CAMERA_ANIMATION,
      })
      lastCameraViewRef.current = view
      return
    }

    map.flyTo({ center: view.center, zoom: view.zoom, ...MAP_CAMERA_ANIMATION })
    lastCameraViewRef.current = view
  }, [isStyleReady, view])

  return (
    <div className={`h-full w-full overflow-hidden bg-base-surface ${className ?? ''}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

function createStoreMarker(
  map: maplibregl.Map,
  store: StoreListing,
  selected: boolean,
  type: StorePinType,
  presentation: MarkerPresentation,
  scale: number,
  onSelectRef: RefObject<(slug: string) => void>,
): MarkerEntry {
  const element = createBrandPinElement({
    selected,
    type,
    presentation,
    scale: selected ? scale : undefined,
    label: `${selected ? 'Selected store' : 'Select store'}: ${store.name}`,
  })
  element.style.zIndex = String(getStorePinZIndex(store, selected))
  element.addEventListener('click', () => onSelectRef.current?.(store.slug))

  const marker = new maplibregl.Marker({ element, anchor: isStoreDotPinType(type) ? 'center' : 'bottom' })
    .setLngLat([store.lng, store.lat])
    .addTo(map)

  return { marker, selected, type, presentation, scale }
}

function syncStoreMarkers(
  map: maplibregl.Map,
  stores: StoreListing[],
  selectedSlug: string | null,
  markersRef: RefObject<Map<string, MarkerEntry>>,
  onSelectRef: RefObject<(slug: string) => void>,
) {
  setSharedStoreMarkerScale(map, getUnselectedMarkerStyleForZoom(map.getZoom()).scale)

  const scaledMarkers = scaleMarkersByViewport(stores, {
    selectedSlug,
    zoom: map.getZoom(),
    project: (store) => {
      const point = map.project([store.lng, store.lat])
      return { x: point.x, y: point.y }
    },
  })
  const nextIds = new Set(scaledMarkers.map((marker) => marker.id))

  for (const [id, entry] of markersRef.current) {
    if (!nextIds.has(id)) {
      entry.marker.remove()
      markersRef.current.delete(id)
    }
  }

  for (const scaledMarker of scaledMarkers) {
    const selected = scaledMarker.store.slug === selectedSlug
    const type = getStorePinType(scaledMarker.store, selected, scaledMarker.presentation)
    const entry = markersRef.current.get(scaledMarker.id)

    if (!entry) {
      markersRef.current.set(
        scaledMarker.id,
        createStoreMarker(
          map,
          scaledMarker.store,
          selected,
          type,
          scaledMarker.presentation,
          scaledMarker.scale,
          onSelectRef,
        ),
      )
      continue
    }

    entry.marker.setLngLat([scaledMarker.store.lng, scaledMarker.store.lat])

    if (shouldReplaceMarkerEntry(entry, selected, type, scaledMarker.presentation)) {
      entry.marker.remove()
      markersRef.current.set(
        scaledMarker.id,
        createStoreMarker(
          map,
          scaledMarker.store,
          selected,
          type,
          scaledMarker.presentation,
          scaledMarker.scale,
          onSelectRef,
        ),
      )
      continue
    }

    if (entry.scale !== scaledMarker.scale) {
      setStoreMarkerScale(entry, scaledMarker.scale)
    }
  }
}

function setStoreMarkerScale(entry: MarkerEntry, scale: number) {
  if (entry.selected) {
    entry.marker.getElement().style.setProperty('--store-marker-scale', String(scale))
  }

  entry.scale = scale
}

function syncStoreMarkerScales(map: maplibregl.Map, markersRef: RefObject<Map<string, MarkerEntry>>) {
  const unselectedStyle = getUnselectedMarkerStyleForZoom(map.getZoom())

  for (const entry of markersRef.current.values()) {
    if (!entry.selected && entry.presentation !== unselectedStyle.presentation) {
      return false
    }
  }

  setSharedStoreMarkerScale(map, unselectedStyle.scale)
  return true
}

function setSharedStoreMarkerScale(map: maplibregl.Map, scale: number) {
  const container = map.getContainer()
  // ponytail: snap to 0.05 steps so the equality guard skips most zoom frames; CSS transition smooths the gaps
  const nextScale = String(Math.round(scale * 20) / 20)

  if (container.style.getPropertyValue('--store-marker-shared-scale') !== nextScale) {
    container.style.setProperty('--store-marker-shared-scale', nextScale)
  }
}

function shouldReplaceMarkerEntry(
  entry: MarkerEntry,
  selected: boolean,
  type: StorePinType,
  presentation: MarkerPresentation,
) {
  return (
    entry.selected !== selected ||
    shouldReplaceStorePinElement(entry.type, type) ||
    entry.presentation !== presentation
  )
}

function reportBounds(
  map: maplibregl.Map,
  onBoundsChangeRef: RefObject<((bounds: MapBounds) => void) | undefined>,
) {
  const bounds = map.getBounds()
  onBoundsChangeRef.current?.([
    [bounds.getWest(), bounds.getSouth()],
    [bounds.getEast(), bounds.getNorth()],
  ])
}
