'use client'

import { useEffect, useRef } from 'react'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { createBrandPinElement, loadBrandedMapStyle } from './mapStyle'

const MARKER_SCREEN_POSITION = { x: 0.6, y: 0.3 }

export default function OpenFreeMap({
  lat,
  lng,
  label,
  className,
}: {
  lat: number
  lng: number
  label: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let map: MaplibreMap | null = null
    let cancelled = false
    const controller = new AbortController()

    async function initializeMap() {
      try {
        const [{ default: maplibregl }, style] = await Promise.all([
          import('maplibre-gl'),
          loadBrandedMapStyle(controller.signal),
        ])
        if (cancelled || !containerRef.current) return

        const mapInstance = new maplibregl.Map({
          container: containerRef.current,
          style,
          center: [lng, lat],
          zoom: 15.35,
          attributionControl: false,
        })
        map = mapInstance

        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')

        const marker = createBrandPinElement({ label })

        new maplibregl.Marker({ element: marker, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(mapInstance)

        const positionMarkerInView = () => {
          const { width, height } = mapInstance.getContainer().getBoundingClientRect()
          const markerPoint = mapInstance.project([lng, lat])
          const targetPoint = {
            x: width * MARKER_SCREEN_POSITION.x,
            y: height * MARKER_SCREEN_POSITION.y,
          }
          const centerPoint = {
            x: markerPoint.x - (targetPoint.x - width / 2),
            y: markerPoint.y - (targetPoint.y - height / 2),
          }

          mapInstance.setCenter(mapInstance.unproject([centerPoint.x, centerPoint.y]))
        }

        mapInstance.once('load', positionMarkerInView)
        mapInstance.on('resize', positionMarkerInView)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to initialize store map', error)
        }
      }
    }

    initializeMap()

    return () => {
      cancelled = true
      controller.abort()
      map?.remove()
    }
  }, [label, lat, lng])

  return (
    <div className={`h-full w-full overflow-hidden bg-base-surface ${className ?? ''}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
