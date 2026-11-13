import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const storeDir = __dirname
const componentsDir = dirname(storeDir)

test('store finder and store detail share the same top navigation component', () => {
  const heroSource = readFileSync(join(storeDir, 'Hero.tsx'), 'utf8')
  const layoutShellSource = readFileSync(join(componentsDir, 'LayoutShell.tsx'), 'utf8')
  const topNavSource = readFileSync(join(storeDir, 'StoreTopNav.tsx'), 'utf8')

  assert.match(heroSource, /import StoreTopNav from '\.\/StoreTopNav'/)
  assert.match(heroSource, /<StoreTopNav hidden=\{navHidden\} \/>/)
  assert.match(layoutShellSource, /import StoreTopNav from '\.\/store\/StoreTopNav'/)
  assert.match(layoutShellSource, /const storeFinder = currentPathname === '\/'/)
  assert.match(layoutShellSource, /\{storeFinder \? \(\s*<StoreTopNav \/>/)
  assert.match(topNavSource, /\{ label: 'Find a store', href: '\/' \}/)
  assert.match(topNavSource, /href=\{item\.href\}/)
  assert.match(topNavSource, /sticky top-0 z-20 flex h-16/)
})
