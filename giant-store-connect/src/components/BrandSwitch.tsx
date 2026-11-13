'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type BrandSwitchProps = {
  variant?: 'header' | 'footer'
}

// Brand (Giant/Liv) is system-level -> driven by ?brand=liv on <html data-brand> (giant default).
export default function BrandSwitch({ variant = 'header' }: BrandSwitchProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [liv, setLiv] = useState(false)
  const currentPathname = pathname ?? '/'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setLiv(params.get('brand') === 'liv')
  }, [currentPathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', liv ? 'liv' : 'giant')
  }, [liv])

  function toggleBrand() {
    const nextLiv = !liv
    const params = new URLSearchParams(window.location.search)
    document.documentElement.setAttribute('data-brand', nextLiv ? 'liv' : 'giant')

    if (nextLiv) params.set('brand', 'liv')
    else params.delete('brand')

    const query = params.toString()
    router.replace(query ? `${currentPathname}?${query}` : currentPathname, { scroll: false })
    setLiv(nextLiv)
  }

  if (variant === 'footer') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={liv}
        aria-label={`Switch to ${liv ? 'Giant' : 'Liv'} brand`}
        onClick={toggleBrand}
        className="inline-flex items-center gap-xs rounded-full border border-white/30 px-xs py-xxs font-nav text-[11px] leading-4 text-base-text/80 transition-colors hover:border-white/60 hover:text-base-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-border"
      >
        <span className={liv ? 'opacity-55' : 'opacity-100'}>Giant</span>
        <span
          aria-hidden="true"
          className="relative h-[14px] w-[26px] rounded-full bg-white/25 transition-colors"
        >
          <span
            className={`absolute left-[3px] top-[3px] size-2 rounded-full bg-base-text transition-transform ${
              liv ? 'translate-x-[12px]' : 'translate-x-0'
            }`}
          />
        </span>
        <span className={liv ? 'opacity-100' : 'opacity-55'}>Liv</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleBrand}
      className="rounded-full border border-base-border px-m py-xs text-action-s font-action hover:bg-base-surface-subtle"
    >
      {liv ? 'Liv' : 'Giant'}
    </button>
  )
}
