'use client'

import { useEffect, useMemo, useState } from 'react'
import { nlStores } from '../../data/stores-nl'
import FilterChips from './FilterChips'
import { matchesAllActiveFilters } from './filters'
import SearchInput, { type FinderLocation, type GeocodeStatus } from './SearchInput'
import StoreFinderMap from './StoreFinderMap'
import StoreList from './StoreList'
import type { StoreCardListing } from './StoreCard'
import {
  boundsAroundLocation,
  boundsForDeselectedMarker,
  haversineKm,
  NL_BOUNDS,
  storePanelResults,
  toggleSelectedSlug,
  type MapBounds,
} from './utils'

export default function StoreFinder() {
  const [location, setLocation] = useState<FinderLocation | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(() => new Set())
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [geocodeStatus, setGeocodeStatus] = useState<GeocodeStatus>('idle')
  const [viewportBounds, setViewportBounds] = useState<MapBounds | null>(null)
  const [deselectedRegionBounds, setDeselectedRegionBounds] = useState<MapBounds | null>(null)
  const [showViewportStores, setShowViewportStores] = useState(false)

  const filtered = useMemo(
    () => nlStores.filter((store) => matchesAllActiveFilters(store, activeFilters)),
    [activeFilters],
  )

  const withDistance = useMemo<StoreCardListing[]>(() => {
    if (!location) return []

    return filtered
      .map((store) => ({
        ...store,
        distanceKm: haversineKm(location, store),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [filtered, location])

  const selectedStore = useMemo(
    () => filtered.find((store) => store.slug === selectedSlug) ?? null,
    [filtered, selectedSlug],
  )

  const panelStores = useMemo(
    () =>
      storePanelResults(filtered, {
        location,
        viewportBounds,
        selectedSlug,
        showViewportStores,
      }),
    [filtered, location, selectedSlug, showViewportStores, viewportBounds],
  )

  useEffect(() => {
    if (selectedSlug && !selectedStore) {
      setSelectedSlug(null)
    }
  }, [selectedSlug, selectedStore])

  const view = useMemo(() => {
    if (selectedStore) {
      return { center: [selectedStore.lng, selectedStore.lat] as [number, number], zoom: 14 }
    }

    if (location) {
      return { bounds: boundsAroundLocation(location) }
    }

    if (showViewportStores && deselectedRegionBounds) {
      return { bounds: deselectedRegionBounds }
    }

    return { bounds: NL_BOUNDS }
  }, [deselectedRegionBounds, location, selectedStore, showViewportStores])

  function handleLocationChange(nextLocation: FinderLocation) {
    setLocation(nextLocation)
    setSelectedSlug(null)
    setDeselectedRegionBounds(null)
    setShowViewportStores(false)
    setViewportBounds(boundsAroundLocation(nextLocation))
  }

  function handleClearLocation() {
    setLocation(null)
    setSelectedSlug(null)
    setDeselectedRegionBounds(null)
    setShowViewportStores(false)
    setViewportBounds(null)
    setGeocodeStatus('idle')
  }

  function handleBoundsChange(bounds: MapBounds) {
    setViewportBounds(bounds)
  }

  function handleMapSelect(slug: string) {
    const nextSelectedSlug = toggleSelectedSlug(selectedSlug, slug)
    const deselecting = nextSelectedSlug === null

    if (deselecting && selectedStore) {
      const regionBounds = boundsForDeselectedMarker(location, selectedStore)
      setDeselectedRegionBounds(regionBounds)
      setViewportBounds(regionBounds)
    } else {
      setDeselectedRegionBounds(null)
    }

    setSelectedSlug(nextSelectedSlug)
    setShowViewportStores(deselecting)
  }

  function handleListSelect(slug: string) {
    const nextSelectedSlug = toggleSelectedSlug(selectedSlug, slug)
    const deselecting = nextSelectedSlug === null

    if (deselecting && selectedStore) {
      const regionBounds = boundsForDeselectedMarker(location, selectedStore)
      setDeselectedRegionBounds(regionBounds)
      setViewportBounds(regionBounds)
    } else {
      setDeselectedRegionBounds(null)
    }

    setSelectedSlug(nextSelectedSlug)
    setShowViewportStores(deselecting)
  }

  function handleViewportInteraction() {
    if (selectedSlug) {
      setDeselectedRegionBounds(null)
      setShowViewportStores(true)
    }
  }

  function handleToggleFilter(label: string) {
    setActiveFilters((current) => {
      if (label === 'All') return new Set()

      const next = new Set(current)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.delete('All')
        next.add(label)
      }

      return next
    })
  }

  const hasResults = !!(location || selectedStore || showViewportStores)

  // Mobile (Figma 1246:927): fixed-height viewport — 240px map, then a
  // grow-to-fill panel whose card list is the only scrolling region. md+ keeps
  // the map full-bleed with the panel floating over it.
  return (
    <section className="relative isolate flex h-[calc(100svh-4rem)] flex-col overflow-hidden bg-base-surface-subtle">
      {/* Wrapper owns the height: StoreFinderMap's own h-full fills whatever
          box it gets (240px block on mobile, full-bleed inset on md+). */}
      <div className="h-60 shrink-0 md:absolute md:inset-0 md:z-0 md:h-auto">
        <StoreFinderMap
          stores={location ? withDistance : filtered}
          selectedSlug={selectedSlug}
          onSelect={handleMapSelect}
          onViewportInteraction={handleViewportInteraction}
          onBoundsChange={handleBoundsChange}
          view={view}
        />
      </div>

      {/* Keep the ${} interpolation on its own token: Tailwind's scanner drops
          an arbitrary-value class that touches the template boundary. */}
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-base-surface md:absolute md:left-m md:right-auto md:top-m md:z-20 md:w-[440px] md:max-w-[calc(100vw_-_(var(--spacing-m)*2))] md:flex-none md:rounded-[8px] md:shadow-[0_12px_64px_rgba(0,0,0,0.1)] ${
          hasResults ? 'md:bottom-m' : ''
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Figma 1246:1183 — panel padding 16 mobile / 24 desktop. Title and
              search stay put; only the card list below scrolls. */}
          <div className="flex shrink-0 flex-col gap-s px-sm py-sm md:px-m md:py-m">
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading-l text-base-text-heading">Find a Giant retailer</h1>

              <SearchInput
                location={location}
                status={geocodeStatus}
                onStatusChange={setGeocodeStatus}
                onLocationChange={handleLocationChange}
                onClearLocation={handleClearLocation}
              />
            </div>

            <FilterChips active={activeFilters} onToggle={handleToggleFilter} />
          </div>

          {hasResults ? (
            <StoreList stores={panelStores} selectedSlug={selectedSlug} onSelect={handleListSelect} />
          ) : null}
        </div>
      </div>
    </section>
  )
}
