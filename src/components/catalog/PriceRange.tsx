'use client'

import { useState } from 'react'

// Dual-handle price slider ported from the PLP prototype. Two overlapping range
// inputs drive a fill bar between the min/max thumbs; values render as $X,XXX.
const MIN = 0
const MAX = 10000
const STEP = 100

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

export default function PriceRange() {
  const [min, setMin] = useState(MIN)
  const [max, setMax] = useState(MAX)

  // ponytail: clamp so the handles can't cross; one step of separation.
  const onMin = (v: number) => setMin(Math.min(v, max - STEP))
  const onMax = (v: number) => setMax(Math.max(v, min + STEP))

  const left = ((min - MIN) / (MAX - MIN)) * 100
  const right = ((max - MIN) / (MAX - MIN)) * 100

  return (
    <div className="price-range-filter">
      <div className="price-range-filter__values">
        <span className="price-range-filter__value">{fmt(min)}</span>
        <span className="price-range-filter__value">{fmt(max)}</span>
      </div>
      <div className="price-range-filter__track-wrap">
        <div className="price-range-filter__track">
          <div className="price-range-filter__fill" style={{ left: `${left}%`, right: `${100 - right}%` }} />
        </div>
        <input
          className="price-range-filter__input"
          type="range"
          aria-label="Minimum price"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={(e) => onMin(Number(e.target.value))}
        />
        <input
          className="price-range-filter__input"
          type="range"
          aria-label="Maximum price"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={(e) => onMax(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
