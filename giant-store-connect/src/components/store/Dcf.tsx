import type { Store, TimelineStep as TimelineStepData } from '../../data/store'
import Section from './Section'
import Button from './Button'

// Numbered step in the DCF process timeline. Local to this section.
function TimelineStep({
  step,
  index,
  isLast,
}: {
  step: TimelineStepData
  index: number
  isLast: boolean
}) {
  return (
    <div className="flex flex-col gap-ml">
      {/* Marker row: circle + connecting line */}
      <div className="flex h-[88px] items-center">
        <div className="flex size-[88px] shrink-0 items-center justify-center rounded-full border border-base-border-dark font-display text-display-s text-base-text-emphasis">
          {index + 1}
        </div>
        {!isLast && (
          <span aria-hidden className="ml-xs hidden h-px flex-1 bg-base-border-dark md:block" />
        )}
      </div>
      <div className="flex flex-col gap-xs">
        <p className="font-heading text-heading-m text-base-text">{step.title}</p>
        <p className="text-body-m text-base-text-muted">{step.description}</p>
      </div>
    </div>
  )
}

export default function Dcf({ store }: { store: Store }) {
  const { dcf } = store
  if (!dcf) return null

  const { intro, body, steps, tier } = dcf

  return (
    <Section bg="dark" id="dcf" innerClassName="flex flex-col gap-xxl">
      {/* Header: logo + title left, intro/body right */}
      <div className="grid gap-ml md:grid-cols-5">
        <div className="flex flex-col gap-ml md:col-span-2">
          <img src="/images/DCF-logo.svg" alt="Dynamic Cycling Fit" className="h-6 w-auto self-start" />
          <h2 className="text-display-s uppercase text-base-text">{dcf.title}</h2>
        </div>
        <div className="flex flex-col gap-sm md:col-span-3 md:pt-sm">
          <p className="text-body-l text-base-text">{intro}</p>
          <p className="text-body-m text-base-text">{body}</p>
        </div>
      </div>

      {/* Process timeline */}
      <div className="grid grid-cols-1 gap-ml sm:grid-cols-2 md:grid-cols-5">
        {steps.map((step, i) => (
          <TimelineStep key={step.title} step={step} index={i} isLast={i === steps.length - 1} />
        ))}
      </div>

      {/* DCF tier: image left, text right */}
      <div className="grid gap-ml md:grid-cols-5">
        <div className="aspect-[707/424] overflow-hidden md:col-span-3">
          <img
            src={tier.image}
            alt={tier.title}
            className="h-full w-full object-cover object-left-top"
          />
        </div>
        <div className="flex flex-col gap-sm md:col-span-2">
          <p className="text-action-s font-action uppercase text-base-text-emphasis">
            {tier.eyebrow}
          </p>
          <h3 className="text-display-s uppercase text-base-text-heading">{tier.title}</h3>
          <p className="text-body-m text-base-text">{tier.body}</p>
          <Button variant="primary" size={48} className="mt-xs self-start">
            {tier.cta}
          </Button>
        </div>
      </div>
    </Section>
  )
}
