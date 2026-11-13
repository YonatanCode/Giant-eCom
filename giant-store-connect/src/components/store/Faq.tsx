import type { Store } from '../../data/store'
import Section from './Section'
import { Icon } from './icons'

// FAQ — two-column: header + contact note (left), native <details>/<summary> accordion (right).
// No JS state: expand/collapse and keyboard toggle come free from <details>.
export default function Faq({ store }: { store: Store }) {
  const { eyebrow, title, contact, items } = store.faq

  return (
    <Section bg="surface" id="faq" innerClassName="lg:!py-xxl">
      <div className="grid gap-xl lg:grid-cols-[minmax(0,418px)_minmax(0,1fr)]">
        {/* Left: header + contact note */}
        <div className="flex flex-col gap-[10px]">
          <p className="font-action text-action-s uppercase text-base-text-emphasis">
            {eyebrow}
          </p>
          <h2 className="text-display-s uppercase text-base-text-heading">{title}</h2>
          <div className="flex flex-col gap-[21px] py-xxs text-body-m text-base-text">
            <p>
              {contact.question}
              <br />
              {contact.note}
            </p>
            <p className="flex flex-col text-action-text-link">
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </div>
        </div>

        {/* Right: accordion list */}
        <ul className="flex flex-col">
          {items.map((item, i) => (
            <li key={i} className="border-t border-base-border-dark/20 last:border-b">
              <details className="group" open={item.defaultOpen}>
                <summary className="flex cursor-pointer list-none items-center gap-m py-m font-heading text-heading-s text-base-text-heading group-open:items-start group-open:pb-xs [&::-webkit-details-marker]:hidden">
                  <span className="flex-1">{item.question}</span>
                  {/* Marker: plus when closed, close when open. */}
                  <Icon
                    name="plus"
                    size={24}
                    className="shrink-0 text-base-icon transition-transform group-open:hidden"
                  />
                  <Icon
                    name="close"
                    size={24}
                    className="hidden shrink-0 text-base-icon group-open:block"
                  />
                </summary>
                {item.answer ? (
                  <p className="max-w-[670px] pb-m font-body text-body-m text-base-text">
                    {item.answer}
                  </p>
                ) : null}
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
