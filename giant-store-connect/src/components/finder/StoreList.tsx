'use client'

import { useEffect, useRef, useState } from 'react'
import { CustomScroll } from 'react-custom-scroll'

import StoreCard, { type StoreCardListing } from './StoreCard'

type StoreListProps = {
  stores: StoreCardListing[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

export default function StoreList({ stores, selectedSlug, onSelect }: StoreListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)

  useEffect(() => {
    const inner = ref.current?.querySelector<HTMLElement>('.rcs-inner-container')
    if (!inner) return
    const check = () =>
      setAtBottom(inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2)
    check()
    inner.addEventListener('scroll', check, { passive: true })
    // ResizeObserver re-checks after layout settles and when the list changes.
    const observer = new ResizeObserver(check)
    observer.observe(inner)
    return () => {
      inner.removeEventListener('scroll', check)
      observer.disconnect()
    }
  }, [stores])

  if (stores.length === 0) {
    return (
      <p className="mx-m rounded-[8px] border border-base-border bg-base-surface-subtle p-m text-body-m text-base-text">
        No stores match these filters
      </p>
    )
  }

  return (
    <div ref={ref} className="relative min-h-0 flex-1">
      <CustomScroll heightRelativeToParent="100%">
        {/* Figma 1246:1183 — Stores padding 16 mobile / 24 desktop. */}
        <div
          className="flex flex-col gap-xs pb-sm pl-sm pr-sm md:pb-m md:pl-m md:pr-m"
          aria-label="Store results"
        >
          {stores.map((store) => (
            <StoreCard
              key={store.slug}
              store={store}
              selected={store.slug === selectedSlug}
              onSelect={onSelect}
            />
          ))}
        </div>
      </CustomScroll>
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-black/8 transition-opacity duration-150 ${atBottom ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />
    </div>
  )
}
