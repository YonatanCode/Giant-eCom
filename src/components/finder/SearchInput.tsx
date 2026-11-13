'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Icon } from '../store/icons'

export type FinderLocation = {
  lat: number
  lng: number
  label: string
}

export type GeocodeStatus = 'idle' | 'loading' | 'error'

type SearchInputProps = {
  location: FinderLocation | null
  status: GeocodeStatus
  onStatusChange: (status: GeocodeStatus) => void
  onLocationChange: (location: FinderLocation) => void
  onClearLocation: () => void
}

type NominatimResult = {
  lat: string
  lon: string
}

export default function SearchInput({
  location,
  status,
  onStatusChange,
  onLocationChange,
  onClearLocation,
}: SearchInputProps) {
  const [query, setQuery] = useState(location?.label ?? '')

  useEffect(() => {
    setQuery(location?.label ?? '')
  }, [location])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = query.trim()
    if (!text || status === 'loading') return

    onStatusChange('loading')

    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        limit: '1',
        countrycodes: 'nl',
        q: text,
      })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      if (!response.ok) throw new Error('Geocoding failed')

      const [result] = (await response.json()) as NominatimResult[]
      if (!result) {
        onStatusChange('error')
        return
      }

      onLocationChange({
        lat: Number(result.lat),
        lng: Number(result.lon),
        label: text,
      })
      onStatusChange('idle')
    } catch {
      onStatusChange('error')
    }
  }

  function handleLocate() {
    if (!navigator.geolocation || status === 'loading') return

    onStatusChange('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onLocationChange({
          lat: coords.latitude,
          lng: coords.longitude,
          label: 'Mijn locatie',
        })
        onStatusChange('idle')
      },
      () => onStatusChange('idle'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    )
  }

  return (
    <div className="flex flex-col gap-xs">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-[53px] items-center rounded-[8px] border border-base-border bg-base-surface px-sm focus-within:border-action-border"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter location..."
          aria-label="Enter location"
          className="min-w-0 flex-1 bg-transparent font-body text-body-m text-base-text outline-none placeholder:text-base-text-muted"
        />
        {location && (
          <button
            type="button"
            onClick={onClearLocation}
            aria-label="Wis locatie"
            className="grid size-8 place-items-center rounded-full text-base-icon hover:bg-base-surface-subtle"
          >
            <Icon name="close" size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={handleLocate}
          title="Gebruik mijn locatie"
          aria-label="Gebruik mijn locatie"
          className="grid size-8 place-items-center rounded-full text-base-icon hover:bg-base-surface-subtle"
        >
          <Icon name="locate" size={20} />
        </button>
        <span className="mx-xs h-6 w-px bg-base-border-divider" aria-hidden="true" />
        <button
          type="submit"
          disabled={status === 'loading'}
          aria-label="Zoeken"
          className="grid size-8 place-items-center rounded-full text-base-icon hover:bg-base-surface-subtle disabled:cursor-wait disabled:text-action-text-disabled-high-contrast"
        >
          <Icon name="search" size={20} />
        </button>
      </form>
      {status === 'error' && (
        <p className="px-sm text-body-s text-feedback-text-error">
          Geen locatie gevonden. Probeer een plaats of postcode in Nederland.
        </p>
      )}
    </div>
  )
}
