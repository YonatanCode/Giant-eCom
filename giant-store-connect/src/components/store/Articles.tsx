import type { Store, Article } from '../../data/store'
import Section from './Section'
import CtaLink from './CtaLink'
import { Icon } from './icons'

// "Latest Articles" — Figma node 554:3413.
export default function Articles({ store }: { store: Store }) {
  if (!store.articles) return null
  const { eyebrow, title, viewAllLabel, items } = store.articles

  return (
    <Section
      bg="surface"
      id="news"
      className="scroll-mt-[120px] border-t border-base-border-divider bg-base-surface"
      innerClassName="flex flex-col gap-ml lg:!pt-[calc(var(--spacing-xxl)-1px)] lg:!pb-xxl"
    >
      <header className="flex flex-col gap-m md:flex-row md:items-stretch md:justify-between">
        <div className="flex flex-1 flex-col gap-[10px]">
          <p className="font-action text-action-s uppercase text-base-text-emphasis">
            {eyebrow}
          </p>
          <h2 className="text-display-s uppercase text-base-text-heading">{title}</h2>
        </div>

        <CtaLink
          label={viewAllLabel}
          href="#news"
          size="l"
          tone="heading"
          className="self-start uppercase md:self-end"
        />
      </header>

      <ul className="grid grid-cols-1 gap-ml md:grid-cols-3">
        {items.map((item) => (
          <li key={item.title}>
            <ArticleCard article={item} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

// Local card: image, title, body, and CTA.
function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.href}
      className="group flex cursor-pointer flex-col gap-m focus:outline-none focus-visible:ring-2 focus-visible:ring-action-border focus-visible:ring-offset-2"
    >
      <div className="h-[165px] overflow-hidden bg-base-surface-subtle">
        <img
          src={article.image}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <h3 className="text-heading-l text-commerce-text-product">{article.title}</h3>
        <p className="text-body-m text-base-text">{article.body}</p>
        <span className="inline-flex h-8 items-center gap-xxs self-start font-action text-action-m uppercase text-base-text-heading group-hover:text-action-text-hover">
          {article.ctaLabel}
          <Icon
            name="arrow-right"
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </a>
  )
}
