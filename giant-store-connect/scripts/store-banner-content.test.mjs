import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { buildStoreContentFromBannerHtml } from './store-banner-content.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

test('extracts Dutch hero and promo banners by official store slug', () => {
  const html = readFileSync(join(root, 'src/scraped/giant_hero_banners.html'), 'utf8')
  const officialStores = [
    { slug: 'giant-store-amsterdam', name: 'Giant Store Amsterdam' },
    { slug: 'giant-store-van-der-woude', name: 'Giant Store van der Woude' },
  ]

  const content = buildStoreContentFromBannerHtml(html, officialStores)

  assert.equal(
    content['giant-store-amsterdam'].hero?.image,
    'https://static.giant-bicycles.com/Images/StoreSites/Banners/GSAmsterdamheader_1744789767.jpg',
  )
  assert.equal(
    content['giant-store-van-der-woude'].hero?.image,
    'https://static.giant-bicycles.com/Images/StoreSites/Banners/BannerGSvanderWoude_1779200350.jpg',
  )
  assert.equal(
    content['giant-store-van-der-woude'].banner?.image,
    'https://images2.giant-bicycles.com/b_white%2Cc_fill%2Ch_1000%2Cq_95%2Cw_1920/j7euprnzbxy2hpagu0rz/Vanderwoudehomepagebanner.jpg',
  )
  assert.equal(content['giant-store-van-der-woude'].banner?.cta, 'Discover')
  assert.ok(!content['giant-store-amsterdam'].banner)
})
