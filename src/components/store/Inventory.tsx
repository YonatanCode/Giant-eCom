import type { Store, CollectionCard as CollectionCardData } from '../../data/store'
import Section from './Section'
import SectionHeader from './SectionHeader'
import { Icon } from './icons'

// Store inventory — three category groups (Bikes / Gear / Other) of collection cards
// laid out in an asymmetric grid. Figma node 791:2959.

// The bike cards that have a product listing (src/app/(shop)/nl/bikes), by card title ->
// category slug. Gear and Other have no listing yet, so those cards are shown but are not links.
const LISTING_SLUGS: Record<string, string> = {
  'road bikes': 'road-bikes',
  'mountain bikes': 'mountain-bikes',
  'cross & gravel bikes': 'cross-and-gravel-bikes',
  'city bikes': 'fitness-and-city-bikes',
  'e-bikes': 'e-bikes',
  'kids bikes': 'kids-bikes',
}

// The listing for a card, pinned to this store: the listing reads `?store=<slug>` and opens
// with the store pre-filled under Availability. Undefined when the card has no listing.
function listingHref(card: CollectionCardData, storeSlug: string): string | undefined {
  const category = LISTING_SLUGS[card.title.trim().toLowerCase()]
  if (!category) return undefined
  return `/nl/bikes/${category}?store=${encodeURIComponent(storeSlug)}`
}

// A single collection card. Image cards (Bikes/Gear) show the product image on top
// with a hover-only arrow; text-only cards (the "Other" column) are fixed-height with
// the title pinned to the bottom, an always-visible arrow and an optional sub-link.
// A card with a listing is a link; one without is a plain, non-interactive tile with no
// arrow and no hover lift, so it does not promise a page that is not there.
function CollectionCard({ card, storeSlug }: { card: CollectionCardData; storeSlug: string }) {
  const textOnly = !card.image
  const href = listingHref(card, storeSlug)
  const className = `group flex flex-col gap-sm overflow-hidden rounded-[8px] bg-base-surface px-sm pt-sm pb-s ${
    href ? 'transition-shadow hover:shadow-md' : ''
  } ${textOnly ? 'h-[146.25px] justify-end' : ''}`

  const content = (
    <>
      {!textOnly && (
        <div className="flex w-full flex-1 items-center justify-center">
          <img
            src={card.image}
            alt={card.title}
            className="h-[82px] max-w-full object-contain"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex w-full items-center gap-xs">
        <div className="flex-1">
          <p className="text-action-m font-action uppercase text-base-text">{card.title}</p>
          {card.subtitle && (
            <p className="text-product-title-s font-product-title underline text-base-text">{card.subtitle}</p>
          )}
        </div>
        {href && (
          <Icon
            name="arrow-right"
            size={16}
            className={`shrink-0 text-base-text transition-opacity ${
              textOnly ? '' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        )}
      </div>
    </>
  )

  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  )
}

// Internal grid column-spans + per-group card grid configuration.
// Bikes is widest (3-col internal grid), Gear narrower (2-col), Other a single tall column.
const GROUP_LAYOUT = [
  { span: 'md:col-span-3', grid: 'grid-cols-2 sm:grid-cols-3' },
  { span: 'md:col-span-2', grid: 'grid-cols-2' },
  { span: 'md:col-span-1', grid: 'grid-cols-1' },
] as const

export default function Inventory({ store }: { store: Store }) {
  const { eyebrow, title, groups } = store.inventory

  return (
    <Section bg="subtle" id="inventory" innerClassName="flex flex-col gap-ml">
      <SectionHeader eyebrow={eyebrow} title={title} />

      <div className="grid grid-cols-1 gap-ml md:grid-cols-6">
        {groups.map((group, i) => {
          const layout = GROUP_LAYOUT[i] ?? GROUP_LAYOUT[GROUP_LAYOUT.length - 1]
          return (
            <div key={group.title} className={`flex flex-col gap-sm ${layout.span}`}>
              <h3 className="text-heading-l text-base-text-heading">{group.title}</h3>
              <div className={`grid gap-xs ${layout.grid}`}>
                {group.cards.map((card) => (
                  <CollectionCard key={card.title} card={card} storeSlug={store.slug} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
