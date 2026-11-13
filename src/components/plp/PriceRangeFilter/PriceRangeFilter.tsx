'use client'

import './PriceRangeFilter.css'

import { formatPrice, PRICE_STEP } from '../../../lib/format'

interface PriceRangeFilterProps {
  bounds: { min: number; max: number }
  priceMin: number | null
  priceMax: number | null
  onChange: (next: { priceMin: number | null; priceMax: number | null }) => void
}

/** Two overlapping range inputs; a value at the bounds means "no limit" (null). */
export default function PriceRangeFilter({ bounds, priceMin, priceMax, onChange }: PriceRangeFilterProps) {
  const min = priceMin ?? bounds.min
  const max = priceMax ?? bounds.max
  const range = bounds.max - bounds.min
  const minPercent = range > 0 ? ((min - bounds.min) / range) * 100 : 0
  const maxPercent = range > 0 ? ((max - bounds.min) / range) * 100 : 100

  return (
    <div className="price-range-filter" id="price-range-filter">
      <div className="price-range-filter__values">
        <span className="price-range-filter__value text-body-m" id="price-min-output">{formatPrice(min)}</span>
        <span className="price-range-filter__value text-body-m" id="price-max-output">{formatPrice(max)}</span>
      </div>
      <div className="price-range-filter__track-wrap">
        <div className="price-range-filter__track">
          <div
            className="price-range-filter__fill"
            id="price-range-fill"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
        </div>
        <input
          type="range"
          id="price-range-min"
          className="price-range-filter__input"
          aria-label="Minimum price"
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={min}
          // Raise the min thumb above the max thumb once they meet, so it stays grabbable.
          style={{ zIndex: min >= max ? 3 : 1 }}
          onChange={(event) => {
            const nextMin = Number(event.target.value)
            if (nextMin >= max) return
            onChange({ priceMin: nextMin <= bounds.min ? null : nextMin, priceMax })
          }}
        />
        <input
          type="range"
          id="price-range-max"
          className="price-range-filter__input"
          aria-label="Maximum price"
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={max}
          style={{ zIndex: 2 }}
          onChange={(event) => {
            const nextMax = Number(event.target.value)
            if (nextMax <= min) return
            onChange({ priceMin, priceMax: nextMax >= bounds.max ? null : nextMax })
          }}
        />
      </div>
    </div>
  )
}
