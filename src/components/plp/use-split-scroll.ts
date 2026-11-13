'use client'

import { useEffect } from 'react'
import {
  getFiltersAreaWheelPlan,
  getProductsAreaWheelPlan,
  shouldHandleSplitWheel,
} from '../../lib/scroll-behavior-logic.js'
import { DESKTOP_SPLIT_SCROLL_QUERY } from '../../lib/use-media-query'

const MIN_SPLIT_SCROLL_HEIGHT = 320
const STICKY_SCROLL_TOLERANCE = 12

interface SplitScrollRefs {
  searchContent: React.RefObject<HTMLElement | null>
  filtersPanel: React.RefObject<HTMLElement | null>
  filtersGroups: React.RefObject<HTMLElement | null>
  productsArea: React.RefObject<HTMLElement | null>
}

function normalizeWheelDelta(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
  return event.deltaY
}

function scrollContainerBy(container: HTMLElement | null, deltaY: number): number {
  if (!container || deltaY === 0) return deltaY
  const previousTop = container.scrollTop
  container.scrollTop += deltaY
  return deltaY - (container.scrollTop - previousTop)
}

function canUseInternalScroll(container: HTMLElement | null): boolean {
  if (!container) return false
  const overflowY = window.getComputedStyle(container).overflowY
  if (!['auto', 'scroll', 'overlay'].includes(overflowY)) return false
  return container.scrollHeight - container.clientHeight > 1
}

/**
 * Anything inside the panel that scrolls itself — the location dropdown — from the wheel's
 * target up to the panel. The panel's own handler would otherwise swallow the wheel and move
 * the filters underneath an open list. Paired with `overscroll-behavior: contain` on the list,
 * so reaching its end stops rather than jumping the page.
 */
function hasOwnScroll(target: EventTarget | null, until: HTMLElement | null): boolean {
  let node = target instanceof Element ? target : null
  while (node && node !== until) {
    if (node instanceof HTMLElement && canUseInternalScroll(node)) return true
    node = node.parentElement
  }
  return false
}

function getPageScrollContainer(): HTMLElement {
  return (document.scrollingElement as HTMLElement) || document.documentElement
}

function canUsePageScroll(): boolean {
  const page = getPageScrollContainer()
  return page.scrollHeight - page.clientHeight > 1
}

function scrollPageBy(deltaY: number) {
  if (deltaY !== 0) window.scrollBy(0, deltaY)
}

function distributeScrollDelta(primary: HTMLElement | null, secondary: HTMLElement | null, deltaY: number) {
  let remaining = scrollContainerBy(primary, deltaY)
  if (Math.abs(remaining) <= 0.5) return
  remaining = scrollContainerBy(secondary, remaining)
  if (Math.abs(remaining) <= 0.5) return
  scrollPageBy(remaining)
}

/**
 * Desktop split-scroll: filters and products scroll as two panes that hand off to the
 * page. The handoff rules live in lib/scroll-behavior-logic.js and are covered by
 * scroll-behavior.test.js — see the scroll behavior contract in README.md.
 * `refreshKey` re-measures after any filter UI height change.
 */
export function useSplitScroll(refs: SplitScrollRefs, filtersVisible: boolean, refreshKey: unknown) {
  useEffect(() => {
    const isActive = () => window.matchMedia(DESKTOP_SPLIT_SCROLL_QUERY).matches

    function updateSplitScrollLayout() {
      const searchContent = refs.searchContent.current
      if (!searchContent) return
      if (!isActive()) {
        searchContent.style.setProperty('--Search-Content-Height', 'auto')
        return
      }
      const { top } = searchContent.getBoundingClientRect()
      const nextHeight = Math.max(MIN_SPLIT_SCROLL_HEIGHT, Math.floor(window.innerHeight - top))
      searchContent.style.setProperty('--Search-Content-Height', `${nextHeight}px`)
    }

    function getFiltersContentHeight(): number {
      const groups = refs.filtersGroups.current
      if (!groups) return refs.filtersPanel.current?.scrollHeight ?? 0
      const lastGroup = groups.lastElementChild
      if (!(lastGroup instanceof HTMLElement)) return 0
      const paddingBottom = Number.parseFloat(window.getComputedStyle(groups).paddingBottom) || 0
      return Math.ceil(
        lastGroup.getBoundingClientRect().bottom - groups.getBoundingClientRect().top + groups.scrollTop + paddingBottom,
      )
    }

    function updateFiltersStickyState() {
      const panel = refs.filtersPanel.current
      if (!panel) return

      if (!isActive() || !filtersVisible) {
        panel.classList.remove('filters-panel--desktop-sticky', 'filters-panel--desktop-scroll')
        panel.style.removeProperty('--Filters-Viewport-Height')
        return
      }

      const stickyOffset = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--foundation-spacing-xxs'),
      ) || 0
      const availableViewportHeight = Math.max(0, window.innerHeight - stickyOffset)
      const panelHeight = getFiltersContentHeight()
      const isAlreadyScrollable = panel.classList.contains('filters-panel--desktop-scroll')
      // Hysteresis: the tolerance keeps the panel from flip-flopping at the boundary.
      const needsScrollableStickyContent = isAlreadyScrollable
        ? panelHeight > availableViewportHeight - STICKY_SCROLL_TOLERANCE
        : panelHeight > availableViewportHeight + STICKY_SCROLL_TOLERANCE

      panel.style.setProperty('--Filters-Viewport-Height', `${availableViewportHeight}px`)
      panel.classList.add('filters-panel--desktop-sticky')
      panel.classList.toggle('filters-panel--desktop-scroll', needsScrollableStickyContent)
    }

    function refresh() {
      updateSplitScrollLayout()
      updateFiltersStickyState()
    }

    function handleFiltersAreaWheel(event: WheelEvent) {
      if (!shouldHandleSplitWheel({
        isDesktopSplitScrollActive: isActive(),
        ctrlKey: event.ctrlKey,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
      })) return

      const groups = refs.filtersGroups.current
      if (hasOwnScroll(event.target, groups)) return

      const plan = getFiltersAreaWheelPlan({
        isFiltersSticky: refs.filtersPanel.current?.classList.contains('filters-panel--desktop-sticky'),
        canScrollFilters: canUseInternalScroll(groups),
        canScrollPage: canUsePageScroll(),
      })

      if (!plan.handled) return
      event.preventDefault()

      const deltaY = normalizeWheelDelta(event)
      if (plan.mode === 'page-only') return scrollPageBy(deltaY)
      if (plan.mode === 'filters-only') return void scrollContainerBy(groups, deltaY)
      if (plan.mode === 'filters-and-page') {
        scrollContainerBy(groups, deltaY)
        scrollPageBy(deltaY)
      }
    }

    function handleProductsAreaWheel(event: WheelEvent) {
      if (!shouldHandleSplitWheel({
        isDesktopSplitScrollActive: isActive(),
        ctrlKey: event.ctrlKey,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
      })) return

      const groups = refs.filtersGroups.current
      const plan = getProductsAreaWheelPlan({
        deltaY: event.deltaY,
        canScrollFilters: canUseInternalScroll(groups),
        canScrollPage: canUsePageScroll(),
      })

      if (!plan.handled) return
      // Product-side scrolling uses a handoff model: page first downward, filters first upward.
      event.preventDefault()
      distributeScrollDelta(
        plan.primary === 'page' ? getPageScrollContainer() : groups,
        plan.secondary === 'page' ? getPageScrollContainer() : groups,
        normalizeWheelDelta(event),
      )
    }

    const groups = refs.filtersGroups.current
    const productsArea = refs.productsArea.current
    groups?.addEventListener('wheel', handleFiltersAreaWheel, { passive: false })
    productsArea?.addEventListener('wheel', handleProductsAreaWheel, { passive: false })

    const resizeObserver = new ResizeObserver(refresh)
    ;[refs.filtersGroups.current, refs.searchContent.current].forEach((element) => {
      if (element) resizeObserver.observe(element)
    })

    const desktopQuery = window.matchMedia(DESKTOP_SPLIT_SCROLL_QUERY)
    desktopQuery.addEventListener('change', refresh)
    window.addEventListener('resize', refresh)
    refresh()

    return () => {
      groups?.removeEventListener('wheel', handleFiltersAreaWheel)
      productsArea?.removeEventListener('wheel', handleProductsAreaWheel)
      resizeObserver.disconnect()
      desktopQuery.removeEventListener('change', refresh)
      window.removeEventListener('resize', refresh)
    }
  }, [refs, filtersVisible, refreshKey])
}
