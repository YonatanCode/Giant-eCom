import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/data/store.ts', import.meta.url), 'utf8')
const sidePanelSource = readFileSync(new URL('../src/components/store/StoreSidePanel.tsx', import.meta.url), 'utf8')

const featuresMatch = source.match(/features:\s*\[([\s\S]*?)\],\n\s*intro:/)

if (!featuresMatch) {
  throw new Error('Could not find the hero features block in src/data/store.ts')
}

const labels = [...featuresMatch[1].matchAll(/label:\s*'([^']+)'/g)].map((match) => match[1])
const icons = [...featuresMatch[1].matchAll(/icon:\s*'([^']+)'/g)].map((match) => match[1])

const expectedLabels = [
  'Repairs and servicing',
  'New bike pick-up',
  'Dynamic Cycling Fit',
  'Bike customisation',
  'Test rides',
]

if (JSON.stringify(labels) !== JSON.stringify(expectedLabels)) {
  throw new Error(`Hero feature labels do not match Figma.\nExpected: ${expectedLabels.join(', ')}\nReceived: ${labels.join(', ')}`)
}

const nonCheckIcons = icons.filter((icon) => icon !== 'check')

if (nonCheckIcons.length > 0) {
  throw new Error(`Hero feature icons should all use the Figma check icon, found: ${nonCheckIcons.join(', ')}`)
}

if (sidePanelSource.includes('name="arrow-right"')) {
  throw new Error('Hero panel buttons should not render arrow icons.')
}
