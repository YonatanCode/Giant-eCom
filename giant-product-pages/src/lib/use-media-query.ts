'use client'

import { useSyncExternalStore } from 'react'

/** SSR-safe media query hook; the server render assumes the query does not match. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/* The two switch points the design system uses (tokens.css swaps its layout and
   typography tokens at exactly these widths). Every @media in the app CSS uses
   them too, so JS and CSS flip on the same pixel.
   desktop >= 1025 | tablet 641-1024 | mobile <= 640 */
export const TABLET_MAX = 1024
export const MOBILE_MAX = 640

export const MOBILE_FILTERS_DRAWER_QUERY = `(max-width: ${TABLET_MAX}px)`
export const MOBILE_STICKY_TOOLBAR_QUERY = `(max-width: ${MOBILE_MAX}px)`
export const DESKTOP_SPLIT_SCROLL_QUERY = `(min-width: ${TABLET_MAX + 1}px)`
