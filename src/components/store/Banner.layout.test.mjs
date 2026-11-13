import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

const __dirname = dirname(fileURLToPath(import.meta.url))
const bannerSource = readFileSync(join(__dirname, 'Banner.tsx'), 'utf8')
const faqSource = readFileSync(join(__dirname, 'Faq.tsx'), 'utf8')
const footerSource = readFileSync(join(__dirname, 'Footer.tsx'), 'utf8')
const heroSource = readFileSync(join(__dirname, 'Hero.tsx'), 'utf8')
const articlesSource = readFileSync(join(__dirname, 'Articles.tsx'), 'utf8')
const sectionSource = readFileSync(join(__dirname, 'Section.tsx'), 'utf8')

test('promo banner fills viewport width and clamps to a 3:2 portrait limit', () => {
  assert.match(bannerSource, /innerClassName="h-\[calc\(100svh_-_56px\)\]/)
  assert.match(bannerSource, /!py-\(--layout-page-padding\)/)
  assert.doesNotMatch(bannerSource, /!px-0|!py-0/)
  assert.match(bannerSource, /min-h-\[min\(480px,calc\(\(\(100vw_-_\(var\(--layout-page-padding\)\*2\)\)\*2\/3\)_\+_\(var\(--layout-page-padding\)\*2\)\)\)\]/)
  assert.match(bannerSource, /max-h-\[calc\(\(\(100vw_-_\(var\(--layout-page-padding\)\*2\)\)\*2\/3\)_\+_\(var\(--layout-page-padding\)\*2\)\)\]/)
  assert.match(bannerSource, /className="dark relative isolate flex h-full w-full/)
})

test('full-width sections avoid max-w-none because spacing-none resolves it to 0px', () => {
  assert.match(sectionSource, /full: 'w-full max-w-full px-\(--layout-page-padding\) py-xl'/)
  assert.doesNotMatch(sectionSource, /!max-w-none/)
})

test('page-width sections use the Directions container width', () => {
  assert.match(
    sectionSource,
    /page: 'container mx-auto w-full !max-w-page px-\(--layout-page-padding\) py-xl'/,
  )
  assert.match(bannerSource, /container="full"/)
})

test('faq and news do not use narrower custom containers', () => {
  assert.match(faqSource, /<Section bg="surface" id="faq" innerClassName="lg:!py-xxl">/)
  assert.match(faqSource, /lg:grid-cols-\[minmax\(0,418px\)_minmax\(0,1fr\)\]/)
  assert.doesNotMatch(faqSource, /!px-\[120px\]|max-w-\[1296px\]/)

  assert.match(articlesSource, /import Section from '\.\/Section'/)
  assert.match(
    articlesSource,
    /<Section[\s\S]*id="news"[\s\S]*innerClassName="flex flex-col gap-ml lg:!pt-\[calc\(var\(--spacing-xxl\)-1px\)\] lg:!pb-xxl"/,
  )
  assert.doesNotMatch(articlesSource, /container="full"|max-w-\[1296px\]/)
})

test('footer content uses the Directions container width', () => {
  assert.match(
    footerSource,
    /className="container mx-auto flex w-full !max-w-page flex-col gap-xl px-\(--layout-page-padding\) pt-l"/,
  )
  assert.doesNotMatch(footerSource, /px-\[120px\]|<div className="px-m">/)
  assert.match(footerSource, /src="\/images\/footer-logo\.svg"/)
  assert.match(footerSource, />USA<\/span>/)
  assert.match(footerSource, /className="block font-body text-body-m text-action-text-link hover:underline"/)
})

test('hero uses the same padded aspect behavior at 70svh', () => {
  assert.match(heroSource, /h-\[70svh\]/)
  assert.match(heroSource, /bg-base-surface px-\(--layout-page-padding\)">/)
  assert.doesNotMatch(heroSource, /bg-base-surface px-\(--layout-page-padding\) py-\(--layout-page-padding\)/)
  assert.match(heroSource, /min-h-\[min\(480px,calc\(\(100vw_-_\(var\(--layout-page-padding\)\*2\)\)\*2\/3\)\)\]/)
  assert.match(heroSource, /max-h-\[calc\(\(100vw_-_\(var\(--layout-page-padding\)\*2\)\)\*2\/3\)\]/)
  assert.match(heroSource, /className="relative grid h-full w-full/)
  assert.doesNotMatch(heroSource, /h-\[320px\]|sm:h-\[420px\]|md:min-h-\[480px\]/)
})

test('sticky in-page nav has a fixed height used by the banner viewport calculation', () => {
  assert.match(heroSource, /sticky z-10 h-14/)
  assert.match(heroSource, /hidden \? 'top-0' : 'top-16'/)
  assert.match(heroSource, /h-full/)
})
