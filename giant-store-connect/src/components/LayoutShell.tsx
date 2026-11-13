'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import BrandSwitch from './BrandSwitch'
import StoreTopNav from './store/StoreTopNav'

// Light/Dark is NOT system-level: add className="dark" on any section/component
// that should use the dark semantic surface (the .dark variant cascades to children).
export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const currentPathname = pathname ?? '/'
  // Store page renders full-bleed colored bands -> no <main> padding there.
  const fullBleed = currentPathname.startsWith('/store/')
  const fullBleedMain = fullBleed || currentPathname === '/' || currentPathname === '/catalog'
  const storeFinder = currentPathname === '/' || currentPathname === '/catalog'

  return (
    <div className="min-h-screen bg-base-surface text-base-text">
      {/* Store page has its own nav (Hero, Figma 554:3314) -> hide this scaffold header there. */}
      {storeFinder ? (
        <StoreTopNav />
      ) : !fullBleed ? (
        <header className="flex items-center justify-between border-b border-base-border px-(--layout-page-padding) py-m">
          <Link href="/" className="font-display text-heading-l uppercase text-action-text">
            Store&nbsp;Connect
          </Link>
          <BrandSwitch />
        </header>
      ) : null}
      <main className={fullBleedMain ? '' : 'px-(--layout-page-padding) py-l'}>{children}</main>
    </div>
  )
}
