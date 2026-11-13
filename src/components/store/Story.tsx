import type { Store, Stat, GalleryImage } from '../../data/store'
import Section from './Section'

// About / Story — uses the shared page container, with Figma-matched internal rhythm.
// Three stacked blocks: about text (2-col), store stats (3 + dividers), image gallery (1 large + 4 small).

// Local: thin divider line between stats. Uses semantic divider token.
function Divider() {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="hidden h-20 w-px bg-base-border-divider md:block"
    />
  )
}

// Local: a single store stat (value + label).
function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex flex-col gap-sm">
      <p className="text-body-m text-base-text">{stat.label}</p>
      <p className="font-display text-display-s text-action-text">{stat.value}</p>
    </div>
  )
}

export default function Story({ store }: { store: Store }) {
  const { eyebrow, title, paragraphs, stats, gallery } = store.about
  const allParagraphs = [`A warm welcome to ${store.name}. ${paragraphs[0]}`, ...paragraphs.slice(1)]

  return (
    <Section bg="surface" id="about">
      <div className="flex flex-col gap-xl">
        {/* About text: left header column + right paragraph column */}
        <div className="flex flex-col gap-l md:flex-row md:gap-xxl lg:gap-51">
          <div className="flex shrink-0 flex-col gap-2.5 md:w-55">
            <p className="font-action text-action-s uppercase text-base-text-emphasis">{eyebrow}</p>
            <h2 className="text-display-s uppercase text-base-text-heading">{title}</h2>
          </div>

          <div className="flex flex-1 flex-col gap-sm md:pt-sm">
            {allParagraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'text-body-l font-semibold text-base-text-heading'
                    : 'whitespace-pre-line text-body-m text-base-text'
                }
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Store stats: row of 3 separated by vertical dividers; stack ≤768px */}
        {stats && stats.length > 0 && (
          <div className="flex flex-col gap-m py-m md:grid md:grid-cols-[auto_1px_auto_1px_auto] md:items-start md:justify-between md:gap-0 md:pr-40.5">
            {stats.map((stat, i) => (
              <div key={stat.label} className="contents">
                {i > 0 && <Divider />}
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        )}

        {/* Gallery: 1 large image (cols 1-2) + 4 small in a 2x2 (cols 3-4) */}
        {gallery && gallery.length > 0 && (
          <div className="grid grid-cols-2 gap-sm overflow-hidden md:h-109.75 md:grid-cols-4 md:grid-rows-2">
            <GalleryTile
              image={gallery[0]}
              className="col-span-2 row-span-2 aspect-4/3 md:aspect-auto md:h-full"
            />
            {gallery.slice(1, 5).map((img) => (
              <GalleryTile key={img.src} image={img} className="aspect-4/3 md:aspect-auto md:h-full" />
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

function GalleryTile({ image, className }: { image: GalleryImage; className?: string }) {
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <img src={image.src} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}
