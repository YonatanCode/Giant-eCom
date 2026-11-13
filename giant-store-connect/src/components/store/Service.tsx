import type { Store } from '../../data/store'
import Section from './Section'
import ServiceBooking from './ServiceBooking'

// "Book an appointment" service section (Figma node 615:4850).
// Two columns: text + service picker (left), image (right). Stacks ≤768px.
export default function Service({ store }: { store: Store }) {
  const { service } = store

  return (
    <Section bg="subtle" id="service" innerClassName="py-xxl">
      <div className="grid grid-cols-1 gap-l md:grid-cols-2 md:gap-0 md:items-stretch">
        {/* Left: text + service picker */}
        <div className="flex flex-col gap-m md:pr-xxl">
          <div className="flex flex-col gap-sm">
            <div className="flex flex-col gap-[10px]">
              <p className="font-action text-action-s uppercase text-base-text-emphasis">
                {service.eyebrow}
              </p>
              <h2 className="text-display-s uppercase text-base-text-heading">{service.title}</h2>
            </div>

            <p className="text-body-m text-base-text">{service.body}</p>
          </div>

          <ServiceBooking heading={service.bookHeading} services={service.services} />
        </div>

        {/* Right: image fills the column */}
        <div className="h-[280px] md:h-[408px]">
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full rounded-[8px] object-cover"
          />
        </div>
      </div>
    </Section>
  )
}
