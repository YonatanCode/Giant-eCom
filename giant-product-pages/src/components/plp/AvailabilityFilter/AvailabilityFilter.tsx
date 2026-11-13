'use client'

import '../../CompareTooltip/CompareTooltip.css'
import './AvailabilityFilter.css'

import { Fragment, useEffect, useId, useRef, useState } from 'react'
import {
  findNearbyStores,
  locationSuggestions,
  SEARCH_DEBOUNCE_MS,
  type Coords,
  type PlaceSuggestion,
} from '../../../lib/store-locator'
import { CheckboxFilter, FilterGroup } from '../FilterGroup/FilterGroup'
import {
  AVAILABILITY_DELIVERY,
  RADIUS_MAX_KM,
  RADIUS_MIN_KM,
  RADIUS_STEP_KM,
} from '../filter-config'
import type { NearFilter } from '../filters'

// Not a `filters.checked` key: this one maps to `nearOnly`, so the id is only a DOM handle.
const NEAR_OPTION = {
  id: 'availability:near',
  label: 'Available on location',
  info: 'Held by at least one dealer inside the radius above, in at least one size.',
}

const DELIVERY_OPTION = {
  id: AVAILABILITY_DELIVERY,
  label: 'Available for home delivery',
  info: 'In stock for delivery from Giant, in at least one size.',
}

interface AvailabilityFilterProps {
  near: NearFilter
  onNearChange: (near: NearFilter) => void
  /** The "Available on location" tick, which gates filtering and nothing else. */
  isNearOnly: boolean
  onNearOnlyChange: (nearOnly: boolean) => void
  checked: Record<string, boolean>
  onCheckedChange: (id: string, checked: boolean) => void
  isDisabled: (id: string) => boolean
}

/**
 * Availability: a place and a radius, plus home delivery.
 *
 * The radius only appears once a place has resolved — until then there is no circle to size.
 * Resolving means turning what was typed into the dealers inside the circle, which every card
 * then names. The tick below only decides whether that circle also narrows the grid, so a
 * shopper can see what is near them without losing the rest of the range.
 */
export default function AvailabilityFilter({
  near,
  onNearChange,
  isNearOnly,
  onNearOnlyChange,
  checked,
  onCheckedChange,
  isDisabled,
}: AvailabilityFilterProps) {
  const listId = useId()
  const radiusLabelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  // ponytail: the typed text is local, not part of the filter state, so a keystroke doesn't
  // re-filter the catalogue. Only the resolved circle below is shared upward.
  // A picked store reads back as its own name; `near.label` holds its town, which would
  // resolve to the town's circle rather than to the store.
  const initialText = (near?.kind === 'store' ? near.stores[0]?.name : undefined) ?? near?.label ?? ''
  const [query, setQuery] = useState(initialText)
  // ponytail: only a committed place — a picked suggestion or Enter — resolves. Typing and
  // blurring leave it alone, so the circle never moves on a half-typed town.
  const [committed, setCommitted] = useState({ text: initialText, isStore: near?.kind === 'store' })
  const [origin, setOrigin] = useState<Coords | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isListOpen, setIsListOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // Only raised by ticking "Available on location" with no place set; typing answers it.
  const [needsLocation, setNeedsLocation] = useState(false)

  const radiusKm = near.radiusKm
  const radiusPercent =
    ((radiusKm - RADIUS_MIN_KM) / (RADIUS_MAX_KM - RADIUS_MIN_KM)) * 100
  const showList = isListOpen && suggestions.length > 0

  // The dealer list is a one-off fetch, so matching against it after that is a memory scan —
  // no debounce, the list keeps up with typing.
  useEffect(() => {
    if (!isListOpen) return
    let cancelled = false
    locationSuggestions(query)
      .then((places) => !cancelled && setSuggestions(places))
      .catch(() => setSuggestions([]))
    return () => {
      cancelled = true
    }
  }, [isListOpen, query])

  // Resolve the circle whenever the committed place or the radius moves. `onNearChange` and `near` are
  // left out of the deps on purpose: they are re-made every render, and this must not re-run
  // on its own result.
  useEffect(() => {
    if (!committed.text.trim() && !origin) {
      setMessage(null)
      if (near.label) onNearChange({ label: '', radiusKm, kind: 'place', stores: [] })
      return
    }

    // Already holding this very store — it was picked before this mount, or arrived by id in
    // the URL. Resolving it again by name could land on a namesake: several dealers share one.
    if (committed.isStore && near.kind === 'store' && near.stores[0]?.name === committed.text) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      findNearbyStores(committed.text, origin, radiusKm)
        .then((result) => {
          if (cancelled) return
          if (!result) {
            setMessage(`No store matches “${committed.text.trim()}”.`)
            onNearChange({ label: '', radiusKm, kind: 'place', stores: [] })
            return
          }
          setMessage(
            result.matches.length ? null : `No store within ${radiusKm} km of ${result.label}.`,
          )
          // A picked dealer anchors the circle on itself, so it is `matches[0]` at zero
          // km — keeping just that one is what makes the card speak about it alone.
          const stores = result.matches.map((match) => ({
            id: match.store.id,
            name: match.store.name,
            isGiant: match.store.isGiantStore,
          }))
          onNearChange({
            label: result.label,
            radiusKm,
            kind: committed.isStore ? 'store' : 'place',
            stores: committed.isStore ? stores.slice(0, 1) : stores,
          })
        })
        .catch(() => {
          if (!cancelled) setMessage('Store list unavailable. Try again.')
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committed, origin, radiusKm])

  // Click or Enter — the only two ways a place is set. A typed place and a picked dealer
  // commit the same way; only `isStore` differs, and with it whether a radius applies.
  function commit(text: string, isStore: boolean) {
    setCommitted({ text, isStore })
    // A committed place wins over a stale fix from the location button.
    setOrigin(null)
    setIsListOpen(false)
    setActiveIndex(-1)
  }

  function pick(place: PlaceSuggestion) {
    setQuery(place.label)
    commit(place.label, place.kind === 'store')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsListOpen(false)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (showList && activeIndex >= 0) pick(suggestions[activeIndex])
      // Unchanged text is already committed; re-committing it would turn a picked store
      // back into a typed place and bring the radius back.
      else if (query !== committed.text) commit(query, false)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    if (!showList) {
      setIsListOpen(true)
      return
    }
    const step = event.key === 'ArrowDown' ? 1 : -1
    setActiveIndex((index) =>
      index === -1
        ? step === 1
          ? 0
          : suggestions.length - 1
        : (index + step + suggestions.length) % suggestions.length,
    )
  }

  function useMyLocation() {
    setIsListOpen(false)
    if (!navigator.geolocation) {
      setMessage('This browser cannot share your location.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // The fix is the place now, so the typed text stops anchoring the circle.
        setCommitted({ text: '', isStore: false })
        setOrigin({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setMessage(null)
      },
      () => setMessage('Could not get your location. Type a town or postcode instead.'),
      { timeout: 8000 },
    )
  }

  // A browser fix has no text of its own, so the resolved town fills the box for it.
  useEffect(() => {
    if (origin && near.label) setQuery(near.label)
  }, [origin, near.label])

  return (
    <FilterGroup title="Availability" modifier="filter-group--availability" defaultOpen>
      <div className="availability-near">
        <div className="availability-near__search">
          <input
            className="availability-near__input text-body-m"
            ref={inputRef}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-label="Town, postcode or store name"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            placeholder="Town, postcode or store name"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setNeedsLocation(false)
              setIsListOpen(true)
              setActiveIndex(-1)
            }}
            onFocus={() => setIsListOpen(true)}
            // Focus alone doesn't fire again once the box already has it, so a second
            // click on a filled box has to reopen the list itself.
            onClick={() => setIsListOpen(true)}
            onBlur={() => {
              setIsListOpen(false)
              setNeedsLocation(false)
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="availability-near__locate"
            type="button"
            aria-label="Use my current location"
            onClick={useMyLocation}
          >
            <img className="availability-near__locate-asset" src="/icons/location-icon.svg" alt="" />
          </button>
          {needsLocation && (
            <p className="availability-near__hint compare-tooltip text-body-s" role="status">
              Enter location to show availability
            </p>
          )}
          {showList && (
            <ul className="availability-near__suggestions" id={listId} role="listbox" aria-label="Places">
              {suggestions.map((place, index) => (
                <Fragment key={`${place.kind}:${place.label}`}>
                  {/* Dealers are headed off from the towns above. Only the first one carries it,
                      and the list is ordered so that is the only place the groups change. */}
                  {place.kind === 'store' && suggestions[index - 1]?.kind !== 'store' && (
                    <li className="availability-near__group text-body-m" role="presentation">
                      Stores
                    </li>
                  )}
                  <li
                    className={`availability-near__suggestion${index === activeIndex ? ' availability-near__suggestion--active' : ''}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    // Keeps focus in the input, so blur doesn't close the list before the click.
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    // A click is done with the box, so let go of it (and the mobile keyboard).
                    // Keyboard picks keep focus so the shopper isn't dropped to the page.
                    onClick={() => {
                      pick(place)
                      inputRef.current?.blur()
                    }}
                  >
                    <span className="availability-near__suggestion-icon">
                      <img
                        className={`availability-near__suggestion-asset${place.kind === 'store' ? ' availability-near__suggestion-asset--store' : ''}`}
                        src={place.kind === 'store' ? '/icons/store-icon.svg' : '/icons/pin-icon.svg'}
                        alt=""
                      />
                    </span>
                    <span className="availability-near__suggestion-text">
                      <span className="availability-near__suggestion-name text-body-m">{place.label}</span>
                      <span className="availability-near__suggestion-where text-body-s">{place.secondary}</span>
                    </span>
                  </li>
                </Fragment>
              ))}
            </ul>
          )}
        </div>

        {message && (
          <p className="availability-near__message text-body-s" role="status">
            {message}
          </p>
        )}

        {near.label && !committed.isStore && (
          <div className="availability-near__radius">
            <p className="availability-near__distance text-body-m" id={radiusLabelId}>
              {radiusKm} km away
            </p>
            <input
              className="availability-near__range"
              type="range"
              aria-labelledby={radiusLabelId}
              min={RADIUS_MIN_KM}
              max={RADIUS_MAX_KM}
              step={RADIUS_STEP_KM}
              value={radiusKm}
              style={{ '--range-progress': `${radiusPercent}%` } as React.CSSProperties}
              onChange={(event) => onNearChange({ ...near, radiusKm: Number(event.target.value) })}
            />
          </div>
        )}
      </div>

      <CheckboxFilter
        option={NEAR_OPTION}
        checked={isNearOnly}
        // Stays tickable without a place: ticking then sends the shopper to the box to set
        // one, rather than leaving a dead control with no hint of what unlocks it.
        onChange={(next) => {
          if (!near.label) {
            setNeedsLocation(true)
            inputRef.current?.focus()
            return
          }
          onNearOnlyChange(next)
        }}
      />

      <CheckboxFilter
        option={DELIVERY_OPTION}
        checked={Boolean(checked[DELIVERY_OPTION.id])}
        disabled={isDisabled(DELIVERY_OPTION.id)}
        onChange={(next) => onCheckedChange(DELIVERY_OPTION.id, next)}
      />
    </FilterGroup>
  )
}
