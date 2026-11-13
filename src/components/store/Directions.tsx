import type { Store } from '../../data/store'
import OpenFreeMap from './OpenFreeMap'
import { Icon } from './icons'

export default function Directions({ store }: { store: Store }) {
  const { directions } = store
  const mapAddress = store.contact.address.replace(' - ', ',\n')
  const mapLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${store.contact.address} (${directions.map.lat},${directions.map.lng})`,
  )}`

  return (
    <section id="directions" className="scroll-mt-[120px] bg-base-surface-subtle">
      <div className="container mx-auto flex w-full !max-w-page flex-col gap-xl px-(--layout-page-padding) pb-xl pt-xxl">
        <div className="flex flex-col gap-ml">
          <header className="grid gap-m lg:grid-cols-[minmax(0,461px)_minmax(0,1fr)] lg:gap-ml">
            <div className="flex flex-col gap-[10px]">
              <p className="text-action-s font-action uppercase text-base-text-emphasis">
                {directions.eyebrow}
              </p>
              <h2 className="text-display-s uppercase text-base-text-heading">{directions.title}</h2>
            </div>
            <p className="text-body-l text-base-text lg:pt-sm">{directions.intro}</p>
          </header>

          <div className="grid gap-ml lg:grid-cols-2">
            <div className="relative h-[392px] min-h-[320px] overflow-hidden">
              <OpenFreeMap
                lat={directions.map.lat}
                lng={directions.map.lng}
                label={`Map showing ${store.name} at ${store.contact.address}`}
              />
              <CompactStoreCard store={store} address={mapAddress} mapLink={mapLink} />
            </div>
            <img
              src={store.hero.image}
              alt={`${store.name} interior`}
              className="h-[392px] min-h-[320px] w-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-3 lg:gap-xl">
          <div className="flex flex-col gap-xs">
            <h3 className="text-heading-m text-base-text-heading">Opening hours</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-sm text-body-m text-base-text">
              {directions.openingHours.map((row, i) => {
                const isToday = i === 0
                const closed = /closed/i.test(row.hours)
                return (
                  <div key={row.day} className="contents">
                    <dt className={isToday ? 'font-bold' : ''}>{row.day}</dt>
                    <dd
                      className={`${isToday ? 'font-bold text-feedback-text-success' : ''} ${
                        closed ? 'text-base-text' : ''
                      }`}
                    >
                      {row.hours}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          <div className="flex flex-col gap-xs">
            <h3 className="text-heading-m text-base-text-heading">Directions</h3>
            <div className="flex flex-col gap-s text-body-m text-base-text">
              <div>
                <p className="font-bold">By public transport</p>
                <p>{directions.byTransport}</p>
              </div>
              <div>
                <p className="font-bold">By car</p>
                <p>{directions.byCar}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <h3 className="text-heading-m text-base-text-heading">Parking</h3>
            <p className="text-body-m text-base-text">{directions.parking}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CompactStoreCard({
  store,
  address,
  mapLink,
}: {
  store: Store
  address: string
  mapLink: string
}) {
  return (
    <aside
      className="absolute bottom-[21px] left-[23px] flex w-[305px] max-w-[calc(100%-46px)] flex-col gap-s rounded-[8px] bg-base-surface p-sm text-base-text shadow-[0_4px_32px_rgba(0,0,0,0.16)]"
      aria-label={`${store.name} address`}
    >
      <div className="flex items-center gap-s">
        <StoreTypeBadge />
        <div className="min-w-0">
          <p className="text-body-s text-base-text-emphasis">{store.hero.label}</p>
          <h3 className="text-heading-m text-base-text-heading">{store.name}</h3>
        </div>
      </div>

      <p className="flex items-start gap-xs whitespace-pre-line text-body-m text-base-text">
        <Icon name="map-pin" size={16} className="mt-[2px] shrink-0 text-base-icon" />
        <span>{address}</span>
      </p>

      <a
        href={mapLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 w-fit items-center justify-center rounded-full bg-action-surface px-sm font-action text-action-s uppercase text-action-text-on-dark transition-colors hover:bg-action-surface-hover"
      >
        Get directions
      </a>
    </aside>
  )
}

function StoreTypeBadge() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action-surface">
      <img src="/images/giant-logo-mark.svg" alt="" className="h-[18px] w-[14px] translate-y-[2px]" />
    </span>
  )
}
