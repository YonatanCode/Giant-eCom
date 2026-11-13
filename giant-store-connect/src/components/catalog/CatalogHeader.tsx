import Link from 'next/link'
import { Icon } from '../store/icons'

// Breadcrumb + H1 + results count + static sort/filter toolbar. Toolbar is visual only (MVP).

const CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Bikes', href: '#' },
  { label: 'Mountain bikes' },
]

export default function CatalogHeader({ count }: { count: number }) {
  return (
    <section className="search-page__hero">
      <div className="results-heading">
        <div className="results-title-group">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
              {CRUMBS.map((crumb, i) => (
                <li
                  key={crumb.label}
                  className={`breadcrumb__item${!crumb.href ? ' breadcrumb__item--current' : ''}`}
                  aria-current={!crumb.href ? 'page' : undefined}
                >
                  {i > 0 && (
                    <span className="breadcrumb__separator" aria-hidden="true">
                      <Icon name="chevron-down" size={16} />
                    </span>
                  )}
                  {crumb.href ? (
                    <Link href={crumb.href} className="breadcrumb__link">
                      {crumb.label}
                    </Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="results-title">Mountain bikes</h1>
        </div>

        <div className="results-toolbar" aria-label="Search results actions">
          <button className="results-action" type="button" aria-pressed="true">
            <span>Hide filters</span>
            <span className="results-action__icon" aria-hidden="true">
              <Icon name="tune" size={16} />
            </span>
          </button>
        </div>
      </div>

      <div className="results-meta">
        <p className="results-count">{count} products</p>
        <span className="results-meta__separator" aria-hidden="true">|</span>
        <div className="sort-control">
          <button className="sort-control__trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Sort products">
            <span className="sort-control__label">Sort by:</span>
            <span className="sort-control__mobile-label">Sort</span>
            <span className="sort-control__value">Featured</span>
            <span className="sort-control__icon sort-control__icon--desktop" aria-hidden="true">
              <Icon name="chevron-down" size={16} />
            </span>
            <span className="sort-control__icon sort-control__icon--mobile" aria-hidden="true">
              <Icon name="tune" size={16} />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
