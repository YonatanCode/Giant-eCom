'use client'

import { useEffect, useState } from 'react'
import type { Store } from '../../data/store'
import StoreTopNav from './StoreTopNav'
import StoreSidePanel from './StoreSidePanel'

// Hero section (Figma node 554:3279). Three pieces:
//  - Top navigation (554:3314)
//  - Full-bleed hero image with overlaid StoreSidePanel (554:3280 / 554:3283)
//  - Sticky in-page anchor nav (554:3315)
// Reuses the shared StoreTopNav and StoreSidePanel. Nav icons/logo are the
// exported Figma assets under /public/images.

// `has` gates optional sections; anchors without it are always present.
const ANCHORS: { label: string; href: string; has?: (store: Store) => boolean }[] = [
  { label: 'Service', href: '#service' },
  { label: 'About', href: '#about' },
  { label: 'Inventory', href: '#inventory' },
  { label: 'DCF', href: '#dcf', has: (s) => !!s.dcf },
  { label: 'Directions', href: '#directions' },
  { label: 'FAQ', href: '#faq' },
  { label: 'News', href: '#news', has: (s) => !!s.articles },
  { label: 'Brands', href: '#brands' },
]

export default function Hero({ store }: { store: Store }) {
  const navHidden = useHideOnScrollDown()
  const anchors = ANCHORS.filter((a) => !a.has || a.has(store))
  return (
    <>
      <StoreTopNav hidden={navHidden} />

      {/* Hero frame: 70svh with side page gutters and no vertical outer padding. */}
      <section className="h-[70svh] min-h-[min(480px,calc((100vw-(var(--layout-page-padding)*2))*2/3))] max-h-[calc((100vw-(var(--layout-page-padding)*2))*2/3)] bg-base-surface px-(--layout-page-padding)">
        <div className="relative grid h-full w-full overflow-hidden bg-base-surface p-m md:p-l">
          <img
            src={store.hero.image}
            alt={`${store.name} storefront`}
            className="absolute inset-0 size-full object-cover"
          />

          {/* Side panel: overlaid bottom-left within the padded image card. */}
          <div className="relative z-1 w-full max-w-110 self-end">
            <StoreSidePanel
              store={store}
              className="shadow-[0_4px_32px_rgba(0,0,0,0.25)] backdrop-blur"
            />
          </div>
        </div>
      </section>

      <InPageNav hidden={navHidden} anchors={anchors} />
    </>
  )
}

type Anchor = (typeof ANCHORS)[number]

// Reveal the top nav only when scrolling up; hide on scroll down past its height.
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - last) < 8) return // ignore jitter
      setHidden(y > last && y > 64)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}

const TOP_NAV_H = 64 // h-16
const IN_PAGE_NAV_H = 56 // h-14

function InPageNav({ hidden, anchors }: { hidden: boolean; anchors: Anchor[] }) {
  const activeHref = useActiveAnchor(anchors)

  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    const el = document.getElementById(href.slice(1))
    if (!el) return
    const elTop = el.getBoundingClientRect().top + window.scrollY
    const scrollingDown = elTop > window.scrollY
    const offset = (scrollingDown ? 0 : TOP_NAV_H) + IN_PAGE_NAV_H
    window.scrollTo({ top: elTop - offset, behavior: 'smooth' })
  }

  return (
    <nav
      className={`sticky z-10 h-14 border-b border-base-border bg-base-surface/90 backdrop-blur transition-[top] duration-300 ${hidden ? 'top-0' : 'top-16'}`}
    >
      <ul className="container mx-auto flex h-full max-w-page! items-center justify-center gap-ml overflow-x-auto px-(--layout-page-padding) font-nav text-nav-s scrollbar-none">
        {anchors.map((a) => {
          const active = activeHref === a.href
          return (
            <li key={a.href} className="shrink-0">
              <a
                href={a.href}
                onClick={(e) => scrollTo(e, a.href)}
                aria-current={active ? 'location' : undefined}
                className={`group flex h-full items-center whitespace-nowrap transition-colors duration-200 ${active ? 'text-action-text-active' : 'text-action-text-navigation hover:text-action-text-hover'}`}
              >
                <span
                  className={`relative block before:absolute before:-bottom-1.25 before:left-0 before:h-0.5 before:bg-action-border before:transition-[width] before:duration-250 before:ease-in-out before:content-[''] ${active ? 'before:w-full' : 'before:w-0 group-hover:before:w-full'}`}
                >
                  {a.label}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function useActiveAnchor(anchors: Anchor[]) {
  const [activeHref, setActiveHref] = useState('')
  const anchorKey = anchors.map((a) => a.href).join() // stable dep; anchors is a fresh array each render

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      let nextHref = ''
      for (const anchor of anchors) {
        const section = document.getElementById(anchor.href.slice(1))
        if (section && sectionMatchesActiveRule(section.getBoundingClientRect(), window.innerHeight)) {
          nextHref = anchor.href
          break
        }
      }

      setActiveHref((current) => (current === nextHref ? current : nextHref))
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorKey])

  return activeHref
}

function sectionMatchesActiveRule(rect: DOMRect, viewportHeight: number) {
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0))
  return visibleHeight > viewportHeight / 2 || (rect.top >= 0 && rect.bottom <= viewportHeight)
}
