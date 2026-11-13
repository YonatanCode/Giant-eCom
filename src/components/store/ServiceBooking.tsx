'use client'

import { useState } from 'react'
import type { Service as StoreService } from '../../data/store'
import Button from './Button'
import ServiceChip from './ServiceChip'

export default function ServiceBooking({
  heading,
  services,
}: {
  heading: string
  services: StoreService[]
}) {
  const [selected, setSelected] = useState<StoreService | null>(null)

  return (
    <div className="flex flex-col gap-m">
      <div className="flex flex-col gap-sm">
        <h3 className="font-heading text-[20px] leading-6 text-base-text-heading">
          {heading}
        </h3>

        <div className="flex max-w-[408px] flex-wrap gap-xs">
          {services.map((service) => (
            <ServiceChip
              key={service.label}
              label={service.label}
              selected={selected?.label === service.label}
              onClick={() => setSelected(service)}
            />
          ))}
        </div>
      </div>

      {selected?.description && (
        <p className="max-w-[408px] text-body-m text-base-text">{selected.description}</p>
      )}

      <div>
        <Button
          variant="primary"
          size={48}
          type="button"
          disabled={!selected}
          className="!px-m border-[0.4px] uppercase"
        >
          {selected ? `Book ${selected.label}` : 'Select a service'}
        </Button>
      </div>
    </div>
  )
}
