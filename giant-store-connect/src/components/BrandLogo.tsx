'use client'

import { useEffect, useState } from 'react'

export type Brand = 'giant' | 'liv'
type BrandLogoVariant = 'nav' | 'footer'

const LOGOS = {
  nav: {
    giant: {
      src: '/images/giant-logo.svg',
      alt: 'Giant',
      width: 148,
      height: 28,
      className: 'h-7 w-[148px]',
    },
    liv: {
      src: '/images/liv-logo.svg',
      alt: 'Liv',
      width: 70,
      height: 36,
      className: 'h-9 w-[70px] object-contain',
    },
  },
  footer: {
    giant: {
      src: '/images/footer-logo.svg',
      alt: 'Giant',
      width: 878,
      height: 111,
      className: 'h-[111px] w-[878px] max-w-[61vw] shrink-0 max-md:h-auto max-md:w-full max-md:max-w-full',
    },
    liv: {
      src: '/images/footer-logo-liv.svg',
      alt: 'Liv',
      width: 361,
      height: 140,
      className: 'h-[111px] w-auto max-w-[32vw] shrink-0 max-md:h-auto max-md:w-[min(361px,100%)] max-md:max-w-full',
    },
  },
} satisfies Record<BrandLogoVariant, Record<Brand, { src: string; alt: string; width: number; height: number; className: string }>>

function getCurrentBrand(): Brand {
  if (typeof window === 'undefined') return 'giant'

  const htmlBrand = document.documentElement.dataset.brand
  if (htmlBrand === 'liv' || htmlBrand === 'giant') return htmlBrand

  const params = new URLSearchParams(window.location.search)
  return params.get('brand') === 'liv' ? 'liv' : 'giant'
}

export function useBrand() {
  const [brand, setBrand] = useState<Brand>('giant')

  useEffect(() => {
    setBrand(getCurrentBrand())

    const observer = new MutationObserver(() => {
      setBrand(getCurrentBrand())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-brand'],
    })

    return () => observer.disconnect()
  }, [])

  return brand
}

export default function BrandLogo({ variant }: { variant: BrandLogoVariant }) {
  const brand = useBrand()

  const logo = LOGOS[variant][brand]

  return (
    <img
      key={`${variant}-${brand}`}
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      className={logo.className}
    />
  )
}
