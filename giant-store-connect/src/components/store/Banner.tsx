import type { Store } from '../../data/store'
import Section from './Section'
import Button from './Button'

// Promo banner — a white "passe-partout" frame (base/surface) wrapping a dark
// banner card. The card is `dark` so the same token classes read light-on-image:
// a full-bleed object-cover image, a left-anchored radial gradient for text
// contrast, then headline/sub-title and primary + secondary CTAs. Figma 661:3516.
export default function Banner({ store }: { store: Store }) {
  const { banner } = store
  if (!banner) return null

  const { title, body, cta, ctaSecondary, image } = banner

  return (
    <Section
      bg="surface"
      container="full"
      innerClassName="h-[calc(100svh_-_56px)] min-h-[min(480px,calc(((100vw_-_(var(--layout-page-padding)*2))*2/3)_+_(var(--layout-page-padding)*2)))] max-h-[calc(((100vw_-_(var(--layout-page-padding)*2))*2/3)_+_(var(--layout-page-padding)*2))] !py-(--layout-page-padding)"
    >
      {/* Height restrictions apply to this padded frame; the dark card fills the
          remaining inner area so the top/bottom gutters stay inside the viewport. */}
      <div className="dark relative isolate flex h-full w-full flex-col justify-center overflow-hidden bg-base-surface p-xl">
        {/* Full-bleed background image, set to fill */}
        <img src={image} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
        {/* Radial gradient (rgba(0,0,0,0.5) → 0) anchored left-center for contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_50%,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_100%)]"
        />

        <div className="relative z-10 flex max-w-120 w-full flex-col gap-m pb-sm">
          <div className="flex flex-col">
            <h2 className="font-display text-display-m uppercase text-base-text-heading">{title}</h2>
            <p className="font-heading text-heading-m text-base-text">{body}</p>
          </div>

          <div className="flex items-center gap-sm">
            {/* size=40 gives the correct action-m text + px-m; force the 48px height */}
            <Button variant="primary" size={40} href="#" className="min-h-12 uppercase">
              {cta}
            </Button>
            {ctaSecondary && (
              <Button variant="secondary" size={40} href="#" className="min-h-12 uppercase">
                {ctaSecondary}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
