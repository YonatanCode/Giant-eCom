import type { Store } from '../../data/store'
import Section from './Section'

// Intro — single centered welcome paragraph. Figma node 554:3342 (text 554:3343).
export default function Intro({ store }: { store: Store }) {
  const { intro } = store
  if (!intro) return null

  return (
    <Section bg="subtle" innerClassName="pb-0">
      <p className="mx-auto max-w-[960px] text-center font-heading text-heading-l text-base-text-heading">
        {intro}
      </p>
    </Section>
  )
}
