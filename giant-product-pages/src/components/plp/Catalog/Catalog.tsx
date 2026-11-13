'use client'

import './Catalog.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORY_BASE_PATH, DEFAULT_CATEGORY_SLUG, type Category } from '../../../data/categories'
import { getPriceBounds, MAX_COMPARE_ITEMS } from '../../../lib/format'
import { STORE_PARAM } from '../../../lib/store-link'
import { findStoreById } from '../../../lib/store-locator'
import {
  MOBILE_FILTERS_DRAWER_QUERY,
  MOBILE_STICKY_TOOLBAR_QUERY,
  useMediaQuery,
} from '../../../lib/use-media-query'
import FiltersPanel from '../FiltersPanel/FiltersPanel'
import ProductCard from '../ProductCard/ProductCard'
import SortControl from '../SortControl/SortControl'
import type { SortValue } from '../filter-config'
import {
  createFilters,
  getActiveFiltersCount,
  getFilteredProducts,
  getOptionCounts,
  sizeToCarry,
  type FiltersState,
} from '../filters'
import { useSplitScroll } from '../use-split-scroll'


function BreadcrumbSeparator() {
  return (
    <span className="breadcrumb__separator" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6.5 4.5L9.5 8L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function Catalog({ category }: { category: Category }) {
  const products = category.products
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Bikes', href: `${CATEGORY_BASE_PATH}/${DEFAULT_CATEGORY_SLUG}` },
    { label: category.title },
  ]

  const priceBounds = useMemo(() => getPriceBounds(products), [products])

  // `filters` is what the panel shows; `appliedFilters` is what the grid uses. They only
  // diverge while the mobile drawer is open, where changes land on Apply.
  const [filters, setFilters] = useState<FiltersState>(() => createFilters())
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>(filters)
  const [sortBy, setSortBy] = useState<SortValue>('featured')
  const [desktopFiltersVisible, setDesktopFiltersVisible] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [compareSelection, setCompareSelection] = useState<string[]>([])

  const isDrawerMode = useMediaQuery(MOBILE_FILTERS_DRAWER_QUERY)
  const isStickyToolbarMode = useMediaQuery(MOBILE_STICKY_TOOLBAR_QUERY)
  const filtersVisible = isDrawerMode ? isDrawerOpen : desktopFiltersVisible

  const searchContentRef = useRef<HTMLElement>(null)
  const filtersPanelRef = useRef<HTMLElement>(null)
  const filtersGroupsRef = useRef<HTMLDivElement>(null)
  const productsAreaRef = useRef<HTMLElement>(null)
  const filtersToggleRef = useRef<HTMLButtonElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const mobileToolbarRef = useRef<HTMLDivElement>(null)

  const splitScrollRefs = useMemo(
    () => ({
      searchContent: searchContentRef,
      filtersPanel: filtersPanelRef,
      filtersGroups: filtersGroupsRef,
      productsArea: productsAreaRef,
    }),
    [],
  )
  useSplitScroll(splitScrollRefs, filtersVisible, filters)

  const activeFiltersCount = getActiveFiltersCount(filters)
  const visibleProducts = useMemo(
    () => getFilteredProducts(products, appliedFilters, sortBy, priceBounds, category.filterGroups),
    [products, appliedFilters, sortBy, priceBounds, category.filterGroups],
  )

  // The panel greys out options that would leave nothing, counted against what the panel
  // currently shows rather than what the grid has applied.
  const optionCounts = useMemo(
    () => getOptionCounts(products, filters, priceBounds, category.filterGroups),
    [products, filters, priceBounds, category.filterGroups],
  )

  // Compare selections only survive while their product is on screen.
  const visibleIds = useMemo(() => new Set(visibleProducts.map((product) => product.id)), [visibleProducts])
  useEffect(() => {
    setCompareSelection((selection) => {
      const next = selection.filter((id) => visibleIds.has(id))
      return next.length === selection.length ? selection : next
    })
  }, [visibleIds])

  // Arriving from a store page (`?store=<id>`): open with that store picked and "Available on
  // location" ticked, as if the shopper had chosen it in the panel themselves.
  // ponytail: read from `window.location` in an effect, not `useSearchParams`, so the listing
  // stays statically prerendered; the store list is a client-side fetch either way. An unknown
  // id — a stale link — is ignored and the listing opens unfiltered.
  const [arrivedStoreId, setArrivedStoreId] = useState<string | null>(null)
  useEffect(() => {
    const storeId = new URLSearchParams(window.location.search).get(STORE_PARAM)
    if (!storeId) return
    let cancelled = false

    findStoreById(storeId)
      .then((store) => {
        if (cancelled || !store) return
        const withStore = (current: FiltersState): FiltersState => ({
          ...current,
          near: {
            label: store.city || store.name,
            radiusKm: current.near.radiusKm,
            kind: 'store',
            stores: [{ id: store.id, name: store.name, isGiant: store.isGiantStore }],
          },
          nearOnly: true,
        })
        setFilters(withStore)
        setAppliedFilters(withStore)
        setArrivedStoreId(store.id)
      })
      .catch(() => {
        // The store list did not load; the listing is still usable without the preset.
      })

    return () => {
      cancelled = true
    }
  }, [])

  function updateFilters(patch: Partial<FiltersState>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    if (!(isDrawerMode && isDrawerOpen)) setAppliedFilters(next)
  }

  function clearAllFilters() {
    const cleared = createFilters()
    setFilters(cleared)
    if (!(isDrawerMode && isDrawerOpen)) setAppliedFilters(cleared)
  }

  function openDrawer() {
    setIsDrawerOpen(true)
    requestAnimationFrame(() => drawerCloseRef.current?.focus())
  }

  function closeDrawer({ restoreApplied = true } = {}) {
    if (restoreApplied) setFilters(appliedFilters)
    setIsDrawerOpen(false)
    requestAnimationFrame(() => filtersToggleRef.current?.focus())
  }

  function applyDrawerFilters() {
    setAppliedFilters(filters)
    setIsDrawerOpen(false)
    requestAnimationFrame(() => filtersToggleRef.current?.focus())
  }

  // Leaving drawer mode discards a half-finished drawer edit, as in the prototype.
  useEffect(() => {
    if (!isDrawerMode && isDrawerOpen) {
      setFilters(appliedFilters)
      setIsDrawerOpen(false)
    }
  }, [isDrawerMode, isDrawerOpen, appliedFilters])

  useEffect(() => {
    const isLocked = isDrawerMode && isDrawerOpen
    document.body.classList.toggle('body--scroll-locked', isLocked)
    return () => document.body.classList.remove('body--scroll-locked')
  }, [isDrawerMode, isDrawerOpen])

  useEffect(() => {
    if (!(isDrawerMode && isDrawerOpen)) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  // The sticky mobile toolbar gains a bottom border once it sticks under the header.
  useEffect(() => {
    const toolbar = mobileToolbarRef.current
    if (!isStickyToolbarMode || !toolbar) return

    function syncStuckState() {
      const stickyOffset = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--Mobile-Sticky-Offset'),
      ) || 0
      toolbar!.classList.toggle('mobile-results-toolbar--stuck', toolbar!.getBoundingClientRect().top <= stickyOffset + 1)
    }

    window.addEventListener('scroll', syncStuckState, { passive: true })
    window.addEventListener('resize', syncStuckState)
    syncStuckState()
    return () => {
      window.removeEventListener('scroll', syncStuckState)
      window.removeEventListener('resize', syncStuckState)
    }
  }, [isStickyToolbarMode])

  const filtersToggleLabel = isDrawerMode
    ? activeFiltersCount > 0
      ? `Filters (${activeFiltersCount})`
      : 'Filters'
    : filtersVisible
      ? 'Hide filters'
      : 'Show filters'

  const filtersToggle = (
    <button
      className="results-action text-action-m"
      type="button"
      ref={filtersToggleRef}
      aria-pressed={filtersVisible}
      aria-label={isDrawerMode ? (filtersVisible ? 'Close filters' : 'Open filters') : filtersToggleLabel}
      onClick={() => {
        if (isDrawerMode) {
          if (isDrawerOpen) closeDrawer()
          else openDrawer()
          return
        }
        setDesktopFiltersVisible((visible) => !visible)
      }}
    >
      <span>{filtersToggleLabel}</span>
      <span className="results-action__icon" aria-hidden="true">
        <img className="results-action__asset" src="/icons/filter-icon.svg" alt="" />
      </span>
    </button>
  )

  const sortControl = <SortControl value={sortBy} onChange={setSortBy} />

  return (
    <main className="search-page">
      <section className="search-page__hero" aria-labelledby="page-heading">
        <div className="results-heading">
          <div className="page-heading-group">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                {breadcrumbs.map((crumb, index) => (
                  <li
                    key={crumb.label}
                    className={`breadcrumb__item text-body-m${crumb.href ? '' : ' breadcrumb__item--current'}`}
                    aria-current={crumb.href ? undefined : 'page'}
                  >
                    {index > 0 && <BreadcrumbSeparator />}
                    {crumb.href ? <a className="breadcrumb__link" href={crumb.href}>{crumb.label}</a> : crumb.label}
                  </li>
                ))}
              </ol>
            </nav>
            <h1 className="page-heading text-display-s" id="page-heading">{category.title}</h1>
          </div>

          <div className="results-toolbar" aria-label="Search results actions">
            {!isStickyToolbarMode && filtersToggle}
            <div className="filters-panel__active-summary" hidden={activeFiltersCount === 0}>
              <span className="filters-panel__active-count">
                <span className="filters-panel__active-count-value text-action-s">{activeFiltersCount}</span>
              </span>
              <button className="filters-panel__clear text-action-m" type="button" aria-label="Clear all filters" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          </div>
        </div>

        <div className="results-meta">
          <p className="results-count text-body-m">{visibleProducts.length} products</p>
          <span className="results-meta__separator" aria-hidden="true">|</span>
          {!isStickyToolbarMode && sortControl}
        </div>
      </section>

      <div className="mobile-results-toolbar" ref={mobileToolbarRef} hidden={!isStickyToolbarMode} aria-label="Filter and sort">
        <div className="mobile-results-toolbar__inner">
          {isStickyToolbarMode && filtersToggle}
          {isStickyToolbarMode && sortControl}
        </div>
      </div>

      <section
        className={`search-page__content${!isDrawerMode && !filtersVisible ? ' search-page__content--filters-hidden' : ''}`}
        ref={searchContentRef}
      >
        <FiltersPanel
          // The location box keeps its own text, so it is remounted to pick up a store that
          // arrived in the URL after the first render.
          key={arrivedStoreId ?? 'no-arrived-store'}
          category={category}
          filters={filters}
          onChange={updateFilters}
          priceBounds={priceBounds}
          optionCounts={optionCounts}
          isDrawerMode={isDrawerMode}
          isVisible={filtersVisible}
          onDrawerClose={() => closeDrawer()}
          onDrawerApply={applyDrawerFilters}
          panelRef={filtersPanelRef}
          groupsRef={filtersGroupsRef}
          closeButtonRef={drawerCloseRef}
        />

        <section className="products-area" aria-label="Products" ref={productsAreaRef}>
          <div className="products-grid" hidden={visibleProducts.length === 0}>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryHref={`${CATEGORY_BASE_PATH}/${category.slug}`}
                near={appliedFilters.near}
                size={sizeToCarry(appliedFilters, product)}
                isCompareSelected={compareSelection.includes(product.id)}
                isCompareDisabled={compareSelection.length >= MAX_COMPARE_ITEMS && !compareSelection.includes(product.id)}
                onCompareChange={(selected) =>
                  setCompareSelection((selection) =>
                    selected ? [...selection, product.id] : selection.filter((id) => id !== product.id),
                  )
                }
              />
            ))}
          </div>
          <div className="empty-state" hidden={visibleProducts.length > 0}>
            <h2 className="text-heading-l">No results found</h2>
            <p className="text-body-m">Try adjusting your filters to find what you&apos;re looking for.</p>
          </div>
        </section>
      </section>

      <div className="filters-drawer-backdrop" hidden={!(isDrawerMode && isDrawerOpen)} onClick={() => closeDrawer()} />
    </main>
  )
}
