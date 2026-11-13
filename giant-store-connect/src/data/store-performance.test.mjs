import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcRoot = resolve(__dirname, '..')

async function loadTsModule(pathFromRoot) {
  const source = readFileSync(join(srcRoot, pathFromRoot), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  })

  return import(`data:text/javascript,${encodeURIComponent(outputText)}`)
}

function readSource(pathFromRoot) {
  return readFileSync(join(srcRoot, pathFromRoot), 'utf8')
}

test('store detail route params come from lightweight official store details', async () => {
  const routeSource = readSource('app/store/[slug]/page.tsx')
  const storeSource = readSource('data/store.ts')
  const detailSource = readSource('data/official-store-details.ts')
  const { officialStoreDetails, officialStoreSlugs } = await loadTsModule(
    'data/official-store-details.ts',
  )

  assert.match(
    routeSource,
    /import\s+\{\s*officialStoreSlugs\s*\}\s+from\s+['"]\.\.\/\.\.\/\.\.\/data\/official-store-details['"]/,
  )
  assert.match(routeSource, /export\s+const\s+dynamicParams\s*=\s*false/)
  assert.doesNotMatch(storeSource, /from ['"]\.\/stores-nl['"]/)
  assert.doesNotMatch(detailSource, /from ['"]\.\/(?:stores-nl|bennebroek)['"]/)
  assert.equal(officialStoreDetails.length, 57)
  assert.deepEqual(
    officialStoreSlugs,
    officialStoreDetails.map((store) => ({ slug: store.slug })),
  )
  assert.ok(officialStoreDetails.some((store) => store.slug === 'giant-store-oppelaar'))
})

test('store detail map does not import maplibre on the route module path', () => {
  const source = readSource('components/store/OpenFreeMap.tsx')

  assert.doesNotMatch(source, /import\s+maplibregl\s+from\s+['"]maplibre-gl['"]/)
  assert.match(source, /import\(['"]maplibre-gl['"]\)/)
})

test('synthesized stores use neutral placeholder team members', () => {
  const storeSource = readSource('data/store.ts')
  const bennebroekSource = readSource('data/bennebroek.ts')
  const placeholderImages = [
    'placeholder-1.svg',
    'placeholder-2.svg',
    'placeholder-3.svg',
    'placeholder-4.svg',
  ]

  assert.match(bennebroekSource, /Olaf Verhoeve/)
  assert.match(storeSource, /const PLACEHOLDER_TEAM/)
  assert.match(storeSource, /team:\s*PLACEHOLDER_TEAM/)

  for (const image of placeholderImages) {
    assert.ok(
      existsSync(join(srcRoot, '..', 'public/images/employees', image)),
      `missing ${image}`,
    )
  }
})
