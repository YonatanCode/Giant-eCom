'use client'

import Link from 'next/link'
import BrandLogo, { useBrand } from '../BrandLogo'

const NAV_ITEMS = [
  { label: 'Bikes', href: '#' },
  { label: 'Gear', href: '#' },
  { label: 'Discover', href: '#' },
  { label: 'Clearance Sale', href: '#' },
  { label: 'Find a store', href: '/' },
]

export default function StoreTopNav({ hidden = false }: { hidden?: boolean }) {
  const isLiv = useBrand() === 'liv'

  return (
    <nav
      className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b border-base-border bg-base-surface px-(--layout-page-padding) transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      {isLiv ? (
        <div className="flex min-w-0 flex-1 items-center gap-m py-xxs">
          <a href="#" className="shrink-0" aria-label="Liv home">
            <BrandLogo variant="nav" />
          </a>
          <button
            type="button"
            aria-label="Open menu"
            className="shrink-0 transition-opacity hover:opacity-70 xl:hidden"
          >
            <img src="/images/burger-menu.svg" alt="" width={24} height={24} />
          </button>
          <ul className="hidden items-center gap-m font-nav text-nav-s text-action-text-navigationP xl:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="whitespace-nowrap hover:text-action-text-hover">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {/* Left: burger + menu (gap 40px is not a spacing token in Figma).
              Menu needs ~600px of side space (Figma left bar = 622px @1440), so it
              only unfolds at xl; below that we collapse to the burger. min-w-0 keeps
              the column from overflowing into the centered logo. */}
          <div className="flex min-w-0 flex-1 items-center gap-10 py-xxs">
            <button
              type="button"
              aria-label="Open menu"
              className="shrink-0 transition-opacity hover:opacity-70"
            >
              <img src="/images/burger-menu.svg" alt="" width={24} height={24} />
            </button>
            <ul className="hidden items-center gap-m font-nav text-nav-s text-action-text-navigationP xl:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="whitespace-nowrap hover:text-action-text-hover">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: Giant signature/wordmark */}
          <a href="#" className="shrink-0" aria-label="Giant home">
            <BrandLogo variant="nav" />
          </a>
        </>
      )}

      {/* Right: search, profile, cart */}
      <div className={`flex min-w-0 items-center justify-end gap-m ${isLiv ? 'shrink-0' : 'flex-1'}`}>
        <button
          type="button"
          className="hidden h-8 items-center gap-xs rounded-full bg-base-surface-subtle pr-sm pl-sm font-action text-action-s uppercase text-action-text-navigation backdrop-blur-[10px] transition-opacity hover:opacity-70 sm:inline-flex"
        >
          <img src="/images/Icons/Search/16.svg" alt="" width={16} height={16} />
          Search
        </button>
        <button
          type="button"
          aria-label="Profile"
          className="hidden shrink-0 transition-opacity hover:opacity-70 sm:block"
        >
          <img src="/images/Icons/Profile/24.svg" alt="" width={24} height={24} />
        </button>
        <button
          type="button"
          aria-label="Cart, 1 item"
          className="relative flex shrink-0 items-center transition-opacity hover:opacity-70"
        >
          <img src="/images/Icons/Cart/24.svg" alt="" width={24} height={24} />
          <span className="flex size-4 items-center justify-center rounded-full bg-action-surface-accent font-action text-action-s leading-none text-action-text-on-dark">
            1
          </span>
        </button>
      </div>
    </nav>
  )
}
