import assert from 'node:assert/strict'
import test from 'node:test'
import { getPriceDisclosures, parseCurrencyAmount, toEuroPrice } from './format'

// The three states the pricing design specifies, EU Omnibus (Directive 2019/2161).
test('a regular price discloses nothing', () => {
  assert.deepEqual(getPriceDisclosures({ mode: 'regular', amount: '£1,000' }), [])
})

test('a discount discloses its 30-day reference', () => {
  assert.deepEqual(getPriceDisclosures({ mode: 'discount', amount: '£1,000', oldAmount: '£2,000' }), [
    { label: 'Lowest price past 30 days', amount: '£2,000', percentage: 50, struck: false },
  ])
})

test('a regular price above the 30-day reference is disclosed separately', () => {
  assert.deepEqual(
    getPriceDisclosures({
      mode: 'from-discount',
      amount: '£1,000',
      oldAmount: '£1,500',
      regularAmount: '£2,000',
    }),
    [
      { label: 'Lowest price past 30 days', amount: '£1,500', percentage: 33, struck: false },
      { label: 'Regular price', amount: '£2,000', percentage: 50, struck: true },
    ],
  )
})

test('a regular price equal to the 30-day reference is not repeated', () => {
  const disclosures = getPriceDisclosures({
    mode: 'discount',
    amount: '£1,000',
    oldAmount: '£2,000',
    regularAmount: '£2,000',
  })
  assert.equal(disclosures.length, 1)
})

test('a price reads the same number in either market\u2019s notation', () => {
  assert.equal(parseCurrencyAmount('£4,500'), 4500)
  assert.equal(parseCurrencyAmount('€ 4.499'), 4499)
  assert.equal(parseCurrencyAmount('€ 649'), 649)
  assert.equal(parseCurrencyAmount(''), null)
})

test('a GB price becomes a tidy euro stand-in that still parses', () => {
  // The space after the sign is a no-break space, so compare on the number.
  assert.match(toEuroPrice('£9,999'), /^€\s11\.499$/)
  assert.equal(parseCurrencyAmount(toEuroPrice('£9,999')), 11499)
  assert.ok(parseCurrencyAmount(toEuroPrice('£4,999'))! > parseCurrencyAmount(toEuroPrice('£3,999'))!, 'a saving survives')
  assert.equal(toEuroPrice('POA'), 'POA', 'anything unreadable is left alone')
})
