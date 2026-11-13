'use client'

import './SiteHeader.css'

import { useEffect, useRef } from 'react'
import { getHeaderVisibilityState } from '../../lib/scroll-behavior-logic.js'
import { MOBILE_STICKY_TOOLBAR_QUERY } from '../../lib/use-media-query'

// The store finder's numbers: ignore under 8px of travel, and never hide within the first 64px.
const HEADER_SCROLL_DELTA_THRESHOLD = 8
const HEADER_HIDE_MIN_SCROLL = 64

// Where the store finder prototype (giant-store-connect) is served. The two prototypes are
// separate apps; this and that app's NEXT_PUBLIC_PRODUCT_PAGES_URL are what join them.
const STORE_FINDER_URL = (process.env.NEXT_PUBLIC_STORE_FINDER_URL ?? 'http://localhost:3001').replace(/\/+$/, '')

// Only "Find a store" goes anywhere real; the rest are placeholders that return home.
const NAV_LINKS = [
  { label: 'Bikes', href: '/' },
  { label: 'Gear', href: '/' },
  { label: 'Discover', href: '/' },
  { label: 'Clearance Sale', href: '/' },
  { label: 'Find a store', href: `${STORE_FINDER_URL}/` },
]

/**
 * Sticky header that hides on downward scroll and returns on the way up. Markup, look and
 * timing follow the store finder's top nav (giant-store-connect) so the two read as one site.
 * It also publishes --Site-Header-Height / --Mobile-Sticky-Offset, which the mobile
 * results toolbar sticks to.
 */
export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    let isHeaderVisible = true
    let lastScrollY = Math.max(window.scrollY, 0)
    let direction: string | null = null
    let directionStartY = lastScrollY

    function syncHeaderOffsetVariables() {
      const headerHeight = Math.round(header!.getBoundingClientRect().height)
      const isStickyToolbarMode = window.matchMedia(MOBILE_STICKY_TOOLBAR_QUERY).matches
      const stickyOffset = isHeaderVisible && isStickyToolbarMode ? headerHeight : 0
      document.documentElement.style.setProperty('--Site-Header-Height', `${headerHeight}px`)
      document.documentElement.style.setProperty('--Mobile-Sticky-Offset', `${stickyOffset}px`)
    }

    function updateHeaderVisibility() {
      const currentY = Math.max(window.scrollY, 0)
      const next = getHeaderVisibilityState({
        currentY,
        previousY: lastScrollY,
        lastDirection: direction,
        directionStartY,
        isHeaderVisible,
        threshold: HEADER_SCROLL_DELTA_THRESHOLD,
        minScrollY: HEADER_HIDE_MIN_SCROLL,
      })

      direction = next.lastDirection
      directionStartY = next.directionStartY
      lastScrollY = currentY

      if (next.isHeaderVisible !== isHeaderVisible) {
        isHeaderVisible = next.isHeaderVisible
        header!.classList.toggle('site-header--hidden', !isHeaderVisible)
        syncHeaderOffsetVariables()
      }
    }

    const resizeObserver = new ResizeObserver(syncHeaderOffsetVariables)
    resizeObserver.observe(header)
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true })
    window.addEventListener('resize', syncHeaderOffsetVariables)
    syncHeaderOffsetVariables()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', updateHeaderVisibility)
      window.removeEventListener('resize', syncHeaderOffsetVariables)
    }
  }, [])

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <div className="site-header__left">
          <button className="header-icon-button" type="button" aria-label="Open menu">
            <img className="header-icon-button__asset" src="/icons/burger-icon.svg" alt="" width={24} height={24} />
          </button>
          <nav className="site-nav" aria-label="Primary">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} className="text-nav-s" href={href}>{label}</a>
            ))}
          </nav>
        </div>

        <a className="brand-mark" href="/" aria-label="Giant home">
          <img className="brand-mark__asset" src="/icons/giant-signature.svg" alt="Giant" width={148} height={28} />
        </a>

        <div className="site-header__right">
          <button className="header-search text-action-s" type="button">
            <img className="header-search__asset" src="/icons/search-icon.svg" alt="" width={16} height={16} />
            Search
          </button>
          <button className="header-icon-button header-icon-button--profile" type="button" aria-label="Profile">
            <img className="header-icon-button__asset" src="/icons/profile-icon.svg" alt="" width={24} height={24} />
          </button>
          <button className="header-cart" type="button" aria-label="Cart, 1 item">
            <img className="header-cart__asset" src="/icons/cart-icon.svg" alt="" width={24} height={24} />
            <span className="header-cart__count text-action-s">1</span>
          </button>
        </div>
      </div>
    </header>
  )
}
