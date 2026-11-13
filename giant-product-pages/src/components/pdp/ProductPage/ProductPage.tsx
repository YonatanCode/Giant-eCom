'use client'

import './ProductPage.css'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CATEGORY_BASE_PATH, DEFAULT_CATEGORY_SLUG, type Category, type Product, type ProductPrice } from '../../../data/categories'
import { optimizeProductImageSrc, PRICE_DISCLAIMER } from '../../../lib/format'
import { findStoreById, type StoreRecord } from '../../../lib/store-locator'
import { COLOR_PARAM, productHref, SIZE_PARAM, STORE_PARAM, withStoreParam } from '../../../lib/store-link'
import { storeStockFor } from '../../../lib/store-stock'
import StoreAvailability from '../StoreAvailability/StoreAvailability'

function priceText(price: ProductPrice) {
  const from = price.mode === 'from' || price.mode === 'from-discount' ? 'From ' : ''
  return `${from}${price.amount}`
}

/** The listing's own idea of "best for", e.g. `best-for-aero-race` -> "Aero Race". */
function bestFor(product: Product): string | null {
  const facet = product.facets.find((name) => name.startsWith('best-for-'))
  if (!facet) return null
  return facet
    .replace('best-for-', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** A neighbour on the same use, else the next bike along. Never the bike being looked at. */
function similarProduct(category: Category, product: Product): Product | undefined {
  const others = category.products.filter((candidate) => candidate.id !== product.id)
  const use = product.facets.find((name) => name.startsWith('best-for-'))
  return others.find((candidate) => use && candidate.facets.includes(use)) ?? others[0]
}

const USPS = [
  {
    title: 'Free delivery',
    detail: 'On most models',
    icon: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5" />,
  },
  {
    title: 'Free returns',
    detail: 'Within 30 days',
    icon: <path d="M4 6.5h16V20H4zM4 11h16M8 3.5v5M16 3.5v5" />,
  },
  {
    title: '0% finance available',
    detail: 'Starting from € 40',
    icon: <path d="M4 7.5h16V20H4zM4 7.5 16 4v3.5M15 13.5h5v3h-5z" />,
  },
]

interface ProductPageProps {
  category: Category
  product: Product
}

/**
 * The prototype's product page, laid out like the live one. It exists to show one thing: a
 * store picked on the listing arrives already chosen. The store and colour come from the URL,
 * so the page is a pure function of its link and a refresh, a shared link or a back-forward
 * all land in the same place.
 *
 * ponytail: the live page is one build per colour (title "…0-Red", its own price). The catalogue
 * holds the family, so the title and "from" price are the family's. Add to basket, Compare and
 * "What is my size?" are drawn but not wired — they are not what this prototype tests.
 */
export default function ProductPage({ category, product }: ProductPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const colorKey = searchParams.get(COLOR_PARAM)
  const selectedColor = product.colors.find((color) => color.key === colorKey) ?? product.colors[0]
  const storeId = searchParams.get(STORE_PARAM)

  // The id in the link is all we have; the record (name, address) comes from the dealer list.
  // `resolved` pairs the answer with the id it was for, so a stale answer never shows for a new id.
  const [resolved, setResolved] = useState<{ id: string; store: StoreRecord | null } | null>(null)
  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    findStoreById(storeId)
      .then((store) => !cancelled && setResolved({ id: storeId, store }))
      .catch(() => !cancelled && setResolved({ id: storeId, store: null }))
    return () => {
      cancelled = true
    }
  }, [storeId])

  const isLoading = Boolean(storeId) && resolved?.id !== storeId
  // An id the network does not know (a stale or edited link) reads as no store, not as an error.
  const store = storeId && resolved?.id === storeId ? resolved.store : null
  const stock = store ? storeStockFor(product, store.id) : null

  // The size is in the link too, so one ticked on the listing arrives picked.
  const pickedSize = product.sizes.find((size) => size === searchParams.get(SIZE_PARAM)) ?? null
  const [isChangingStore, setIsChangingStore] = useState(false)
  // A size the picked store does not have in stock is crossed out and cannot be picked — every size,
  // when the store has none of the bike. One in the link (or picked before the store changed)
  // simply stops counting as selected.
  const isSizeAvailable = (size: string) => !stock || stock.sizes.includes(size)
  const selectedSize = pickedSize && isSizeAvailable(pickedSize) ? pickedSize : null
  const hasUnavailableSize = product.sizes.some((size) => !isSizeAvailable(size))
  const [imageIndex, setImageIndex] = useState(0)

  function replaceParams(params: URLSearchParams) {
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const images = selectedColor.images.map(optimizeProductImageSrc).filter((src): src is string => Boolean(src))
  const mainImage = images[Math.min(imageIndex, images.length - 1)]
  const categoryHref = `${CATEGORY_BASE_PATH}/${category.slug}`
  const similar = similarProduct(category, product)
  const similarUse = similar ? bestFor(similar) : null

  return (
    <main className="pdp">
      <nav className="pdp__breadcrumb text-body-s" aria-label="Breadcrumb">
        <a className="pdp__crumb" href={`${CATEGORY_BASE_PATH}/${DEFAULT_CATEGORY_SLUG}`}>Bikes</a>
        <span className="pdp__crumb-separator" aria-hidden="true">&gt;</span>
        {/* Back to the listing with the same store still picked. */}
        <a className="pdp__crumb" href={store ? `${categoryHref}?${STORE_PARAM}=${encodeURIComponent(store.id)}` : categoryHref}>
          {category.title}
        </a>
        <span className="pdp__crumb-separator" aria-hidden="true">&gt;</span>
        <span className="pdp__crumb pdp__crumb--current" aria-current="page">{product.title}</span>
      </nav>

      <div className="pdp__layout">
        <div className="pdp__gallery">
          <div className="pdp__gallery-bar">
            {product.tag ? (
              <span className={`pdp__tag pdp__tag--${product.tag.type} text-action-s`}>{product.tag.label}</span>
            ) : (
              <span />
            )}
            <button type="button" className="pdp__compare text-action-s">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h10v14H4zM10 8h10v14H10z" />
              </svg>
              Compare
            </button>
          </div>

          <div className="pdp__media">
            {mainImage && <img className="pdp__image" src={mainImage} alt={`${product.title} in ${selectedColor.label}`} />}
          </div>

          {images.length > 1 && (
            <div className="pdp__thumbs">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className={`pdp__thumb${index === imageIndex ? ' is-selected' : ''}`}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === imageIndex}
                  onClick={() => setImageIndex(index)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__summary">
          <p className="pdp__rating text-body-s">
            <span className="pdp__stars" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <svg key={index} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.2 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z" />
                </svg>
              ))}
            </span>
            No reviews yet
          </p>

          <h1 className="pdp__title text-product-title-l">{product.title}</h1>
          <p className="pdp__price text-price-l">{priceText(product.price)}</p>
          <p className="pdp__note text-body-s">Save up to 40% with Cyclescheme</p>
          <p className="pdp__note text-body-s">{PRICE_DISCLAIMER}</p>

          <div className="pdp__group">
            <p className="pdp__label text-body-m">Colour: {selectedColor.label}</p>
            <div className="pdp__swatches">
              {product.colors.map((color) => {
                const [colorA, colorB] = color.colors
                return (
                  <button
                    key={color.key}
                    type="button"
                    className={`pdp__swatch${color.key === selectedColor.key ? ' is-selected' : ''}`}
                    aria-label={color.label}
                    aria-pressed={color.key === selectedColor.key}
                    style={
                      {
                        '--swatch-color-a': colorA,
                        ...(colorB ? { '--swatch-color-b': colorB } : {}),
                      } as React.CSSProperties
                    }
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.set(COLOR_PARAM, color.key)
                      setImageIndex(0)
                      replaceParams(params)
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div className="pdp__group">
            <div className="pdp__size-head">
              <p className="pdp__label pdp__label--caps text-body-m">Choose your size</p>
              <button type="button" className="pdp__size-help text-body-m">What is my size?</button>
            </div>
            <div className="pdp__sizes">
              {product.sizes.map((size) => {
                const isAvailable = isSizeAvailable(size)
                return (
                  <button
                    key={size}
                    type="button"
                    className={`pdp__size text-action-m${size === selectedSize ? ' is-selected' : ''}${isAvailable ? '' : ' pdp__size--unavailable'}`}
                    aria-pressed={size === selectedSize}
                    aria-disabled={!isAvailable}
                    aria-label={isAvailable ? size : `Size ${size}, not available at ${store?.name}`}
                    onClick={() => {
                      if (!isAvailable) return
                      const params = new URLSearchParams(searchParams)
                      if (size === selectedSize) params.delete(SIZE_PARAM)
                      else params.set(SIZE_PARAM, size)
                      replaceParams(params)
                    }}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {store && hasUnavailableSize && (
              <p className="pdp__hint text-body-s">
                Looking for a different size?{' '}
                <button type="button" className="pdp__hint-link" onClick={() => setIsChangingStore(true)}>
                  Change the store.
                </button>
              </p>
            )}
          </div>

          <StoreAvailability
            store={store}
            stock={stock}
            product={product}
            selectedSize={pickedSize}
            isLoading={isLoading}
            isSearching={isChangingStore}
            onSearchingChange={setIsChangingStore}
            onStoreChange={(next) => {
              // The size follows the shopper only to a store that has it in stock. Otherwise it is
              // dropped, so the page does not carry a choice the new store cannot supply.
              const keepsSize = !pickedSize || storeStockFor(product, next.id).sizes.includes(pickedSize)
              replaceParams(withStoreParam(searchParams, next.id, keepsSize))
            }}
          />

          <button type="button" className="pdp__basket text-action-l">Add to basket</button>

          {similar && (
            <section className="pdp__similar" aria-label="Similar products">
              <h2 className="pdp__similar-heading text-heading-m">Similar Products</h2>
              <a
                className="pdp__similar-card"
                href={productHref({
                  categoryHref,
                  productId: similar.id,
                  storeId: store?.id,
                })}
              >
                <img
                  className="pdp__similar-image"
                  src={optimizeProductImageSrc(similar.colors[0].images[0])}
                  alt=""
                />
                <span className="pdp__similar-copy">
                  {similarUse && <span className="pdp__similar-use text-body-s">Best for: <strong>{similarUse.toUpperCase()}</strong></span>}
                  <span className="pdp__similar-title text-action-m">{similar.title}</span>
                  <span className="pdp__similar-price text-body-m">{priceText(similar.price)}</span>
                </span>
              </a>
            </section>
          )}

          <ul className="pdp__usps">
            {USPS.map((usp) => (
              <li key={usp.title} className="pdp__usp">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
                  {usp.icon}
                </svg>
                <span>
                  <span className="pdp__usp-title text-action-m">{usp.title}</span>
                  <span className="pdp__usp-detail text-body-m">{usp.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="pdp__description text-body-m">{product.description}</p>
        </div>
      </div>
    </main>
  )
}
