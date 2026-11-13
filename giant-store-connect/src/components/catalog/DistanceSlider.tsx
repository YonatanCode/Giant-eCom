'use client'

import { useState } from 'react'

// Distance slider for the "Available near me" filter. Output reads "Exact location"
// until the user drags off 0, then "<n> km away". Track fill follows the value via
// the --range-fill-percent custom property (styled in globals.css, ported from PLP).
const MAX_KM = 300

export default function DistanceSlider() {
  const [km, setKm] = useState(0)

  return (
    <div className="distance-filter">
      <div className="distance-filter__row">
        <label className="distance-filter__label" htmlFor="distance-range">Distance</label>
        <output className="distance-filter__value" htmlFor="distance-range">
          {km === 0 ? 'Exact location' : `${km} km away`}
        </output>
      </div>
      <input
        id="distance-range"
        type="range"
        min={0}
        max={MAX_KM}
        value={km}
        onChange={(e) => setKm(Number(e.target.value))}
        style={{ ['--range-fill-percent' as string]: `${(km / MAX_KM) * 100}%` }}
      />
    </div>
  )
}
