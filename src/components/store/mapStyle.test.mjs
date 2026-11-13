import assert from 'node:assert/strict'
import test from 'node:test'

import { createBrandPinElement } from './mapStyle.ts'

class FakeStyle {
  #properties = new Map()

  setProperty(name, value) {
    this.#properties.set(name, String(value))
  }

  getPropertyValue(name) {
    return this.#properties.get(name) ?? ''
  }
}

class FakeElement {
  style = new FakeStyle()
  attributes = new Map()
  innerHTML = ''
  type = ''
  className = ''

  setAttribute(name, value) {
    this.attributes.set(name, value)
  }
}

globalThis.document = {
  createElement() {
    return new FakeElement()
  },
}

test('markers without an explicit scale inherit the shared marker scale', () => {
  const marker = createBrandPinElement({ type: 'giant', presentation: 'smallPin' })

  assert.equal(marker.style.getPropertyValue('--store-marker-scale'), '')
  assert.match(marker.innerHTML, /var\(--store-marker-scale, var\(--store-marker-shared-scale, 1\)\)/)
})

test('markers with an explicit scale keep their own marker scale', () => {
  const marker = createBrandPinElement({ type: 'selected', scale: 1 })

  assert.equal(marker.style.getPropertyValue('--store-marker-scale'), '1')
})
