'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { StoreListing } from '../../data/stores-nl'
import { Icon } from '../store/icons'
import StoreInfoCard, { WeeklyOpeningHours } from '../store/StoreInfoCard'
import {
  formatDistanceKm,
  formatStoreAddress,
  getStoreOpeningHours,
  getStoreOpeningHoursSummary,
  getStoreDescription,
  getStoreAvatarVariant,
  getStoreCta,
  getStoreTypeLabel,
  type StoreOpeningHour,
} from './storeCardModel'

export type StoreCardListing = StoreListing & {
  distanceKm?: number
  openingHours?: StoreOpeningHour[]
}

type StoreCardProps = {
  store: StoreCardListing
  selected: boolean
  onSelect: (slug: string) => void
}

export default function StoreCard({ store, selected, onSelect }: StoreCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hoursExpanded, setHoursExpanded] = useState(false)
  const address = formatStoreAddress(store)
  const cta = getStoreCta(store)
  const openingHours = getStoreOpeningHours(store)
  const openingHoursSummary = getStoreOpeningHoursSummary(openingHours)

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [selected])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(store.slug)
  }

  function handleHoursToggle(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setHoursExpanded((expanded) => !expanded)
  }

  return (
    <div ref={ref}>
      <StoreInfoCard
        as="article"
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Select ${store.name}`}
        onClick={() => onSelect(store.slug)}
        onKeyDown={handleKeyDown}
        label={getStoreTypeLabel(store)}
        labelClassName={store.isGiantStore ? undefined : 'text-action-text-subtle'}
        name={store.name}
        description={getStoreDescription(store)}
        titleLevel={2}
        titleClassName="text-heading-m text-base-text-heading"
        badgeVariant={getStoreAvatarVariant(store)}
        badgeSize="compact"
        headerAlign="start"
        rightMeta={
          typeof store.distanceKm === 'number' ? (
            <DistanceMarker distanceKm={store.distanceKm} />
          ) : null
        }
        rows={[
          {
            icon: 'clock',
            text: openingHoursSummary,
            showStatus: !/^closed/i.test(openingHoursSummary),
            showChevron: true,
            expanded: hoursExpanded,
            details: hoursExpanded ? <WeeklyOpeningHours openingHours={openingHours} /> : null,
            onToggle: handleHoursToggle,
            label: 'Opening hours',
          },
          { icon: 'map-pin', text: address, label: 'Address' },
          { icon: 'phone', text: store.phone, label: 'Phone' },
          ...(store.email ? [{ icon: 'mail' as const, text: store.email, label: 'Email' }] : []),
        ]}
        features={store.tags.map((tag) => ({ label: tag }))}
        featureVariant="pills"
        featurePosition="beforeRows"
        actions={
          cta
            ? store.isGiantStore
              ? [
                  {
                    label: 'View store details',
                    href: cta.href,
                    external: cta.external,
                    variant: 'secondaryStrong',
                    size: '40ActionS',
                    className: 'w-fit',
                    onClick: (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation(),
                  },
                ]
              : [
                  {
                    label: 'Visite store website',
                    href: cta.href,
                    external: cta.external,
                    presentation: 'link',
                    onClick: (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation(),
                  },
                ]
            : []
        }
        className={`cursor-pointer border text-left transition-colors focus:outline-none focus-visible:border-action-border focus-visible:ring-2 focus-visible:ring-action-border ${
          selected
            ? 'border-[1.5px] border-action-border'
            : 'border-base-border hover:border-action-border-subtle'
        }`}
      />
    </div>
  )
}

function DistanceMarker({ distanceKm }: { distanceKm: number }) {
  const distance = formatDistanceKm(distanceKm)

  return (
    <span
      className="inline-flex h-8 items-center gap-xxs rounded-full bg-base-surface-subtle px-s font-action text-action-s text-base-text-heading"
      aria-label={`${distance} away`}
    >
      <Icon name="map-pin" size={14} className="shrink-0 text-base-icon" />
      <span>{distance}</span>
    </span>
  )
}
