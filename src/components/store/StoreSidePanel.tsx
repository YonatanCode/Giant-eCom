'use client'

import { useState } from 'react'
import type { Store } from '../../data/store'
import StoreInfoCard, { WeeklyOpeningHours } from './StoreInfoCard'

// Store type + title, contact rows, feature check-list, primary actions.
// Shared by Hero (01) and Directions (09).
const TYPE_LABEL: Record<Store['type'], string> = {
  flagship: 'Flagship store',
  store: 'Giant Store',
  partner: 'Partner store',
}

export default function StoreSidePanel({ store, className }: { store: Store; className?: string }) {
  const { contact } = store
  const openingHours = store.directions.openingHours
  const [hoursExpanded, setHoursExpanded] = useState(false)

  return (
    <StoreInfoCard
      label={store.hero.label || TYPE_LABEL[store.type]}
      name={store.name}
      rows={[
        {
          icon: 'clock',
          text: contact.openStatus,
          showStatus: true,
          showChevron: true,
          expanded: hoursExpanded,
          details: hoursExpanded ? <WeeklyOpeningHours openingHours={openingHours} /> : null,
          onToggle: () => setHoursExpanded((expanded) => !expanded),
          label: 'Opening hours',
        },
        { icon: 'map-pin', text: contact.address, href: '#directions', label: 'Address' },
        { icon: 'phone', text: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}`, label: 'Phone' },
        { icon: 'mail', text: contact.email, href: `mailto:${contact.email}`, label: 'Email' },
      ]}
      features={store.features}
      actions={[
        { label: 'Directions', href: '#directions', variant: 'secondary' },
        { label: 'Book an appointment', href: '#service' },
      ]}
      className={className}
    />
  )
}
