'use client'

import { useState } from 'react'
import type { Store, Brand } from '../../data/store'
import Section from './Section'

// "Our brands" — a featured brand row plus a "Gear & components" row.
// Logos are mock SVG paths; if one fails to load the tile falls back to the brand name.

function LogoTile({ brand, height, className }: { brand: Brand; height: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`flex ${height} items-center justify-center overflow-clip bg-base-surface ${className ?? ''}`}
    >
      {failed || !brand.logo ? (
        <span className="text-center text-body-m font-medium text-base-text">{brand.name}</span>
      ) : (
        <img
          src={brand.logo}
          alt={brand.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      )}
    </div>
  )
}

export default function Brands({ store }: { store: Store }) {
  const { title, primary, gearTitle, gear } = store.brands

  return (
    <Section bg="subtle" id="brands" innerClassName="flex flex-col gap-ml">
      <h2 className="text-display-s uppercase text-base-text-heading">{title}</h2>
      <div className="grid grid-cols-2 gap-ml sm:grid-cols-4">
        {primary.map((brand, i) => (
          <LogoTile
            key={brand.name}
            brand={brand}
            height="h-[200px]"
            className={i === 0 ? 'col-span-2' : undefined}
          />
        ))}
      </div>

      <h3 className="text-heading-l text-base-text-heading">{gearTitle}</h3>
      <div className="grid grid-cols-1 gap-ml min-[512px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {gear.map((brand) => (
          <LogoTile key={brand.name} brand={brand} height="h-[150px]" />
        ))}
      </div>
    </Section>
  )
}
