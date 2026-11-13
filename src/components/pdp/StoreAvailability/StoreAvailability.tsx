'use client'

import './StoreAvailability.css'

import { useEffect, useId, useState } from 'react'
import type { Product } from '../../../data/categories'
import { nearbyStoresTo, searchStores, type StoreRecord } from '../../../lib/store-locator'
import { storeStockFor, type StoreStock } from '../../../lib/store-stock'

/** How far from the picked store to look for one that has the bike, and how many to show. */
const ALTERNATIVES_RADIUS_KM = 50
const ALTERNATIVES_LIMIT = 3

/** Shorter than this the search offers nothing, so it has nothing to say about a miss either. */
const MIN_QUERY_LENGTH = 2

interface Alternative {
  store: StoreRecord
  km: number
  stock: StoreStock
}

interface StoreAvailabilityProps {
  /** The store from the link, once it has resolved. Null reads as "no store chosen". */
  store: StoreRecord | null
  /** What that store holds of this bike. Null whenever there is no store. */
  stock: StoreStock | null
  /** The bike, for the sizes it comes in and for finding the stores that do hold it. */
  product: Product
  /** The size the shopper asked for, from the link or a click, so the line can speak about it
   * rather than the whole range — including when this store cannot supply it. */
  selectedSize: string | null
  isLoading: boolean
  /** Owned by the page, so the hint under the sizes can open the search too. */
  isSearching: boolean
  onSearchingChange: (isSearching: boolean) => void
  onStoreChange: (store: StoreRecord) => void
}

/** A size asked for can be one the store lacks (a link carried it in), so it says so. */
function describeStock(stock: StoreStock, allSizes: string[], selectedSize: string | null, storeName: string) {
  if (selectedSize) {
    if (stock.sizes.includes(selectedSize)) return { ok: true, text: `Size ${selectedSize} is in stock` }
    if (stock.clickAndCollect) {
      return { ok: true, text: `Size ${selectedSize} is not in stock, but can be ordered in for collection` }
    }
    return { ok: false, text: `Size ${selectedSize} is not in stock at ${storeName}` }
  }
  if (stock.isComplete) return { ok: true, text: 'In stock in every size' }
  const missing = allSizes.filter((size) => !stock.sizes.includes(size))
  if (stock.sizes.length && missing.length === 1) {
    return { ok: true, text: `In stock in every size except ${missing[0]}` }
  }
  if (stock.sizes.length) return { ok: true, text: `In stock in ${stock.sizes.join(', ')}` }
  if (stock.clickAndCollect) return { ok: true, text: 'Not in stock, but can be ordered in for collection' }
  return { ok: false, text: `Not in stock at ${storeName}` }
}

/** The same store glyph the listing's location suggestions use, so a store reads the same here. */
function StoreIcon() {
  return (
    <span className="store-availability__icon">
      <img className="store-availability__icon-asset" src="/icons/store-icon.svg" alt="" />
    </span>
  )
}

/**
 * Where the shopper can collect this bike. A store carried over from the listing is already
 * chosen here, so the first thing the module says is where the bike is — not a question.
 *
 * The search is the listing's location box, minus the locations: it only ever offers stores
 * (found by name, town or postcode), because this page has no circle to draw — places belong
 * to the listing.
 */
export default function StoreAvailability({
  store,
  stock,
  product,
  selectedSize,
  isLoading,
  isSearching,
  onSearchingChange,
  onStoreChange,
}: StoreAvailabilityProps) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StoreRecord[]>([])
  const [isListOpen, setIsListOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const showSearch = isSearching || (!store && !isLoading)
  const showList = isListOpen && query.trim().length > 0
  const hasNoMatch = showList && results.length === 0 && query.trim().length >= MIN_QUERY_LENGTH

  useEffect(() => {
    if (!isListOpen) return
    let cancelled = false
    searchStores(query)
      .then((stores) => !cancelled && setResults(stores))
      .catch(() => setResults([]))
    return () => {
      cancelled = true
    }
  }, [isListOpen, query])

  // A store that has none of the bike is a dead end on its own, so offer the nearest ones that do.
  // `forKey` pairs the answer with what it was asked for, so a stale list never shows for a new
  // store or size.
  const [alternatives, setAlternatives] = useState<{ forKey: string; rows: Alternative[] } | null>(null)
  const needsAlternatives = Boolean(store && stock && !stock.sizes.length)
  const alternativesKey = `${store?.id}:${product.id}:${selectedSize ?? ''}`
  useEffect(() => {
    if (!store || !needsAlternatives) return
    let cancelled = false
    nearbyStoresTo(store, ALTERNATIVES_RADIUS_KM)
      .then((matches) => {
        if (cancelled) return
        const rows = matches
          .map((match) => ({ store: match.store, km: match.distanceKm, stock: storeStockFor(product, match.store.id) }))
          // Holding the bike, and the picked size when there is one.
          .filter((row) => row.stock.sizes.length > 0 && (!selectedSize || row.stock.sizes.includes(selectedSize)))
          .slice(0, ALTERNATIVES_LIMIT)
        setAlternatives({ forKey: alternativesKey, rows })
      })
      .catch(() => !cancelled && setAlternatives({ forKey: alternativesKey, rows: [] }))
    return () => {
      cancelled = true
    }
    // `store` and `product` are covered by the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alternativesKey, needsAlternatives])
  const shownAlternatives = alternatives?.forKey === alternativesKey ? alternatives.rows : null

  function pick(next: StoreRecord) {
    setIsListOpen(false)
    setActiveIndex(-1)
    setQuery('')
    onStoreChange(next)
    onSearchingChange(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsListOpen(false)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      // The top result is the best match, so Enter on typed text takes it.
      const chosen = results[activeIndex >= 0 ? activeIndex : 0]
      if (showList && chosen) pick(chosen)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    if (!showList || !results.length) {
      setIsListOpen(true)
      return
    }
    const step = event.key === 'ArrowDown' ? 1 : -1
    setActiveIndex((index) =>
      index === -1
        ? step === 1
          ? 0
          : results.length - 1
        : (index + step + results.length) % results.length,
    )
  }

  const status = stock && store ? describeStock(stock, product.sizes, selectedSize, store.name) : null

  return (
    <section className="store-availability" aria-label="Collect in store" aria-busy={isLoading}>
      <h2 className="store-availability__heading text-heading-s">Collect in store</h2>

      {store && !isSearching && (
        <div className="store-availability__store" data-store-id={store.id}>
          <div className="store-availability__identity">
            <StoreIcon />
            <div className="store-availability__text">
              <p className="store-availability__name text-action-m">{store.name}</p>
              <p className="store-availability__address text-body-s">{store.address}</p>
              {store.phone && <p className="store-availability__address text-body-s">{store.phone}</p>}
            </div>
          </div>
          {status && (
            <p
              className={`store-availability__status text-body-m${status.ok ? ' store-availability__status--ok' : ' store-availability__status--none'}`}
            >
              <span className="store-availability__dot" aria-hidden="true" />
              {status.text}
            </p>
          )}
          {needsAlternatives && shownAlternatives && (
            <div className="store-availability__alternatives">
              <p className="store-availability__alternatives-heading text-action-s">
                {shownAlternatives.length
                  ? selectedSize
                    ? `Size ${selectedSize} in stock nearby`
                    : 'In stock nearby'
                  : `No other store within ${ALTERNATIVES_RADIUS_KM} km has ${selectedSize ? `size ${selectedSize}` : 'it'} in stock.`}
              </p>
              {shownAlternatives.map((row) => (
                <button
                  key={row.store.id}
                  type="button"
                  className="store-availability__alternative"
                  onClick={() => onStoreChange(row.store)}
                >
                  <StoreIcon />
                  <span className="store-availability__text">
                    <span className="store-availability__alternative-name text-action-s">{row.store.name}</span>
                    <span className="store-availability__alternative-meta text-body-s">
                      {Math.max(1, Math.round(row.km))} km · {describeStock(row.stock, product.sizes, selectedSize, row.store.name).text}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="store-availability__change text-action-s"
            onClick={() => onSearchingChange(true)}
          >
            Change store
          </button>
        </div>
      )}

      {showSearch && (
        <div className="store-availability__search">
          {!store && (
            <p className="store-availability__empty text-body-s">
              Choose a store to see what it has in stock.
            </p>
          )}
          <div className="store-availability__field">
            <input
              className="store-availability__input text-body-m"
              type="text"
              role="combobox"
              autoComplete="off"
              // Password managers offer to fill any text box that sits near a login; this is not one.
              data-1p-ignore
              data-lpignore="true"
              aria-label="Store name, town or postcode"
              aria-autocomplete="list"
              aria-expanded={showList && results.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              placeholder="Store name, town or postcode"
              value={query}
              autoFocus={isSearching}
              onChange={(event) => {
                setQuery(event.target.value)
                setIsListOpen(true)
                setActiveIndex(-1)
              }}
              onFocus={() => setIsListOpen(true)}
              onClick={() => setIsListOpen(true)}
              onBlur={() => setIsListOpen(false)}
              onKeyDown={handleKeyDown}
            />
            {showList && results.length > 0 && (
              <ul className="store-availability__suggestions" id={listId} role="listbox" aria-label="Stores">
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    className={`store-availability__suggestion${index === activeIndex ? ' store-availability__suggestion--active' : ''}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    // Keeps focus in the input, so blur doesn't close the list before the click.
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pick(result)}
                  >
                    <StoreIcon />
                    <span className="store-availability__suggestion-text">
                      <span className="store-availability__suggestion-name text-body-m">{result.name}</span>
                      <span className="store-availability__suggestion-where text-body-s">
                        {[result.address, result.city].filter(Boolean).join(', ')}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {hasNoMatch && (
            <p className="store-availability__message text-body-s" role="status">
              No store matches “{query.trim()}”.
            </p>
          )}
          {isSearching && store && (
            <button
              type="button"
              className="store-availability__change text-action-s"
              onClick={() => onSearchingChange(false)}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </section>
  )
}
