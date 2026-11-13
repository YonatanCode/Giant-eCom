import assert from 'node:assert/strict'
import test from 'node:test'

import { getUnselectedMarkerStyleForZoom, scaleMarkersByViewport } from './markerScaling.ts'

const stores = [
  { slug: 'selected-store', lat: 52.1, lng: 4.3 },
  { slug: 'other-store', lat: 52.2, lng: 4.4 },
]

function scaleAtZoom(zoom, selectedSlug = 'selected-store') {
  return scaleMarkersByViewport(stores, {
    selectedSlug,
    zoom,
    project: (store) => ({ x: store.lng, y: store.lat }),
  })
}

test('unselected pin marker scale gets smaller before switching to dots', () => {
  const highZoomMarker = scaleAtZoom(10).find((marker) => marker.id === 'other-store')
  const mediumZoomMarker = scaleAtZoom(8).find((marker) => marker.id === 'other-store')
  const lowZoomMarker = scaleAtZoom(7).find((marker) => marker.id === 'other-store')

  assert.ok(highZoomMarker)
  assert.ok(mediumZoomMarker)
  assert.ok(lowZoomMarker)
  assert.equal(lowZoomMarker.presentation, 'smallPin')
  assert.equal(highZoomMarker.scale, 1)
  assert.ok(mediumZoomMarker.scale < highZoomMarker.scale)
  assert.ok(lowZoomMarker.scale < mediumZoomMarker.scale)
})

test('selected markers stay full-size for emphasis', () => {
  const selectedMarker = scaleAtZoom(6).find((marker) => marker.id === 'selected-store')

  assert.ok(selectedMarker)
  assert.equal(selectedMarker.presentation, 'pin')
  assert.equal(selectedMarker.scale, 1)
})

test('dot markers use their own scale range once zoomed out', () => {
  const dotMarker = scaleAtZoom(6).find((marker) => marker.id === 'other-store')
  const farZoomDotMarker = scaleAtZoom(5).find((marker) => marker.id === 'other-store')

  assert.ok(dotMarker)
  assert.ok(farZoomDotMarker)
  assert.equal(dotMarker.presentation, 'dot')
  assert.equal(dotMarker.scale, 0.75)
  assert.equal(farZoomDotMarker.scale, 0.5)
})

test('marker style can be computed from zoom without projecting stores', () => {
  assert.deepEqual(getUnselectedMarkerStyleForZoom(8), {
    presentation: 'smallPin',
    scale: 0.64,
  })
})
