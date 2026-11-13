import type { CatalogProduct } from '../../data/catalog-products'

// Single product tile: tag/award badges, first-color image (static), static color
// swatches (visual only), title, description, price, and the store availability line.
// ponytail: no hover-image swap or color switching — first color/image only, per the MVP spec.

const TAG_CLASS = {
  new: 'card-tag--new',
  sale: 'card-tag--sale',
  'best-seller': 'card-tag--best-seller',
} as const

export default function ProductCard({
  product,
  storeName,
}: {
  product: CatalogProduct
  storeName?: string
}) {
  const { title, url, description, price, tag, award, colors } = product
  const image = colors[0]?.image

  return (
    <article className="product-card" aria-label={`${title} product tile`}>
      <a className="product-card__link" href={url} aria-label={`Open ${title} product page`} />

      {(tag || award) && (
        <div className="product-card__badges">
          {tag && (
            <div className={`card-tag ${TAG_CLASS[tag.type]}`}>
              <span className="card-tag__label">{tag.label}</span>
            </div>
          )}
          {award && (
            <div className="award-badge-wrap">
              <img src="/badge.png" alt={award} className="award-badge" />
            </div>
          )}
        </div>
      )}

      <div className="product-card__media">
        <div className="product-card__media-frame">
          {image && (
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="product-card__image"
            />
          )}
        </div>
      </div>

      <div className="product-card__topline">
        <div className="selector-group swatches" aria-label="Available colors">
          {colors.map((color, i) => (
            <span
              key={color.label}
              title={color.label}
              aria-label={color.label}
              className={`swatch${i === 0 ? ' is-selected' : ''}`}
              style={{ ['--swatch-color-a' as string]: color.hex }}
            />
          ))}
        </div>
        <label className="compare-toggle">
          <span>Compare</span>
          <span className="compare-toggle__box">
            <input type="checkbox" name="compare" />
            <span className="checkbox-ui" aria-hidden="true" />
          </span>
        </label>
      </div>

      <div className="product-card__copy">
        <a className="product-card__text-link" href={url} aria-label={`Read more about ${title}`}>
          <div className="title-group">
            <h2 className="product-title">{title}</h2>
            <p className="product-description">{description}</p>
          </div>
        </a>

        <div className="product-card__pricing">
          <div className={`price-line${price.oldAmount ? ' price-line--discounted' : ''}`}>
            <span className={`price-current${price.oldAmount ? ' price-current--sale' : ''}`}>{price.amount}</span>
            {price.oldAmount && <span className="price-old">{price.oldAmount}</span>}
          </div>
          {price.oldAmount && (
            <>
              <p className="finance-copy">MSRP excluding sales tax and dealer fees</p>
              <p className="disclaimer">Regular price: {price.oldAmount}</p>
            </>
          )}
          {!price.oldAmount && <p className="finance-copy">MSRP excluding sales tax and dealer fees</p>}
          {storeName && <p className="finance-copy finance-copy--availability">Available at {storeName}</p>}
        </div>
      </div>
    </article>
  )
}
