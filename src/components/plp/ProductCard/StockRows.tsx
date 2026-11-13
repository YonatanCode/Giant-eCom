'use client'

import type { Product } from '../../../data/categories'
import { deliveryStateFor } from '../../../lib/store-stock'
import { describeNearbyStock, type NearbyStockLine, type NearFilter } from '../filters'

function StockRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={`stock-row text-body-s${ok ? ' stock-row--ok' : ' stock-row--none'}`}>
      <span className="stock-row__dot" aria-hidden="true" />
      <span className="stock-row__text">{children}</span>
    </p>
  )
}

/** Dealer names never break mid-name, so each is its own unbreakable run. */
function NearbyStock({ line }: { line: NearbyStockLine }) {
  if (!line.names.length) return <>{line.rest}</>

  return (
    <>
      In stock at{' '}
      {line.names.map((name, index) => (
        <span key={name}>
          {index > 0 && <>and{' '}</>}
          <span className="stock-row__store">{name}</span>{' '}
        </span>
      ))}
      {line.rest}
    </>
  )
}

interface StockRowsProps {
  product: Product
  /** The circle. It says nothing until a place resolves, whether or not it is filtering. */
  near: NearFilter
}

/**
 * The two availability lines under the description. They stay silent until a location is
 * filled in: the store line has no subject without one, and showing delivery on its own
 * would leave a card that changes height the moment a place resolves.
 */
export default function StockRows({ product, near }: StockRowsProps) {
  if (!near.label) return null

  const nearby = describeNearbyStock(product, near)
  const canDeliver = deliveryStateFor(product) === 'available'

  return (
    <div className="stock-info">
      <StockRow ok={nearby.inStock}>
        <NearbyStock line={nearby} />
      </StockRow>

      <StockRow ok={canDeliver}>
        {canDeliver ? 'Available for delivery' : 'Currently unavailable for delivery'}
      </StockRow>
    </div>
  )
}
