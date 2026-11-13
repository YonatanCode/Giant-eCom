import type maplibregl from 'maplibre-gl'

export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export const TEXT_LAYERS = [
  'waterway_line_label',
  'water_name_point_label',
  'water_name_line_label',
  'poi_r20',
  'poi_r7',
  'poi_r1',
  'poi_transit',
  'highway-name-path',
  'highway-name-minor',
  'highway-name-major',
  'airport',
  'label_other',
  'label_village',
  'label_town',
  'label_state',
  'label_city',
  'label_city_capital',
  'label_country_3',
  'label_country_2',
  'label_country_1',
]

type PaintValue = string | number
type StyleLayer = {
  id: string
  type?: string
  paint?: Record<string, PaintValue>
}
type BrandableStyle = {
  layers?: StyleLayer[]
}
type BrandMapPalette = ReturnType<typeof getBrandMapPalette>
type PaintUpdate = {
  layerId: string
  property: string
  value: PaintValue
}

export type StorePinPresentation = 'pin' | 'smallPin' | 'dot'
export type StorePinType = 'giant' | 'partner' | 'selected' | 'selectedPartner' | 'giantDot' | 'partnerDot'

export function getStorePinType(
  store: { isGiantStore: boolean },
  selected: boolean,
  presentation: StorePinPresentation = 'pin',
): StorePinType {
  if (selected) return store.isGiantStore ? 'selected' : 'selectedPartner'
  if (presentation === 'dot') return store.isGiantStore ? 'giantDot' : 'partnerDot'

  return store.isGiantStore ? 'giant' : 'partner'
}

export function shouldReplaceStorePinElement(
  currentType: StorePinType | undefined,
  nextType: StorePinType,
): boolean {
  return currentType !== nextType
}

export function isStoreDotPinType(type: StorePinType): boolean {
  return type === 'giantDot' || type === 'partnerDot'
}

export function getStorePinZIndex(
  store: { isGiantStore: boolean },
  selected: boolean,
): number {
  if (selected) return 30

  return store.isGiantStore ? 20 : 10
}

export function getStorePinFrame(type: StorePinType): {
  width: number
  height: number
  viewBox: string
} {
  if (isStoreDotPinType(type)) {
    return { width: 12, height: 12, viewBox: '0 0 12 12' }
  }

  if (type === 'selected' || type === 'selectedPartner') {
    return { width: 49, height: 68, viewBox: '-2 -2 49 68' }
  }

  return { width: 34, height: 48, viewBox: '0 0 34 48' }
}

export function createBrandPinElement(opts?: {
  selected?: boolean
  label?: string
  type?: StorePinType
  presentation?: StorePinPresentation
  scale?: number
}): HTMLElement {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = 'group relative cursor-pointer border-0 bg-transparent p-0'

  if (opts?.label) {
    marker.setAttribute('aria-label', opts.label)
  }

  const type = opts?.type ?? (opts?.selected ? 'selected' : 'giant')
  const selectedPartner = type === 'selectedPartner'
  const selected = type === 'selected' || selectedPartner
  const partner = type === 'partner' || selectedPartner
  const { width, height, viewBox } = getStorePinFrame(type)
  const markerScale = opts?.scale

  if (markerScale !== undefined) {
    marker.style.setProperty('--store-marker-scale', String(markerScale))
  }

  if (isStoreDotPinType(type)) {
    const fill = type === 'giantDot' ? 'var(--color-primary)' : 'var(--color-base-icon-subtle)'

    marker.innerHTML = `
      <span style="display: block; width: 12px; height: 12px; border: 2px solid var(--color-light); border-radius: 999px; background: ${fill}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24); transform: scale(var(--store-marker-scale, var(--store-marker-shared-scale, 1))); transform-origin: center; transition: transform 120ms linear;" aria-hidden="true"></span>
    `

    return marker
  }

  const bgPath = selected
    ? 'M22.5 0C10.0736 0 0 10.0736 0 22.5C0 39.375 22.5 64 22.5 64C22.5 64 45 39.375 45 22.5C45 10.0736 34.9264 0 22.5 0Z'
    : 'M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 48 17 48C17 48 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z'
  const pinFill = selected
    ? 'var(--color-light)'
    : partner
      ? 'var(--color-base-icon-subtle)'
      : 'var(--color-primary)'
  const pinStrokeColor = selectedPartner ? 'var(--color-base-icon-subtle)' : 'var(--color-primary)'
  const pinStroke = selected
    ? `stroke="${pinStrokeColor}" stroke-width="3.5"`
    : ''
  let content =
    '<img src="/images/giant-logo-mark.svg" alt="" style="position: absolute; left: 10px; top: 13px; width: 14px; height: 18px;" />'

  if (type === 'partner') {
    content =
      '<span style="position: absolute; left: 10px; top: 10px; width: 14px; height: 14px; border-radius: 999px; background: var(--color-light);" aria-hidden="true"></span>'
  } else if (selectedPartner) {
    content =
      '<span style="position: absolute; left: 18px; top: 20px; width: 12px; height: 12px; border-radius: 999px; background: var(--color-base-icon-subtle);" aria-hidden="true"></span>'
  } else if (selected) {
    content = `<span style="position: absolute; left: 15px; top: 20px; width: 19px; height: 24px; background: var(--color-primary); mask: url('/images/giant-logo-mark.svg') center / contain no-repeat; -webkit-mask: url('/images/giant-logo-mark.svg') center / contain no-repeat;" aria-hidden="true"></span>`
  }

  marker.innerHTML = `
    <div style="position: relative; width: ${width}px; height: ${height}px; overflow: visible; transform: scale(var(--store-marker-scale, var(--store-marker-shared-scale, 1))); transform-origin: center bottom; transition: transform 120ms linear;">
      <svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display: block; overflow: visible; filter: drop-shadow(0 8px 18px rgba(0, 0, 0, ${selected ? '0.28' : '0.18'}));">
        <path d="${bgPath}" fill="${pinFill}" ${pinStroke}/>
      </svg>
      ${content}
    </div>
  `

  return marker
}

export function applyBrandMapStyle(map: maplibregl.Map) {
  const updates = getBrandMapPaintUpdates(map.getStyle() as BrandableStyle, getBrandMapPalette())

  for (const update of updates) {
    setPaint(map, update.layerId, update.property, update.value)
  }
}

export async function loadBrandedMapStyle(signal?: AbortSignal) {
  const response = await fetch(OPENFREEMAP_STYLE, { signal })

  if (!response.ok) {
    throw new Error(`Failed to load map style: ${response.status}`)
  }

  return brandMapStyle(await response.json())
}

export function brandMapStyle<T extends BrandableStyle>(style: T, palette = getBrandMapPalette()): T {
  const updates = getBrandMapPaintUpdates(style, palette)
  const updatesByLayer = new Map<string, PaintUpdate[]>()

  for (const update of updates) {
    const layerUpdates = updatesByLayer.get(update.layerId) ?? []
    layerUpdates.push(update)
    updatesByLayer.set(update.layerId, layerUpdates)
  }

  return {
    ...style,
    layers: style.layers?.map((layer) => {
      const layerUpdates = updatesByLayer.get(layer.id)
      if (!layerUpdates) return layer

      return {
        ...layer,
        paint: {
          ...layer.paint,
          ...Object.fromEntries(layerUpdates.map((update) => [update.property, update.value])),
        },
      }
    }),
  } as T
}

function getBrandMapPaintUpdates(style: BrandableStyle, palette: BrandMapPalette): PaintUpdate[] {
  const updates: PaintUpdate[] = []

  for (const layer of style.layers ?? []) {
    updates.push(...getLayerBrandPaintUpdates(layer, palette))
  }

  return updates
}

function getLayerBrandPaintUpdates(layer: StyleLayer, palette: BrandMapPalette): PaintUpdate[] {
  const updates: Omit<PaintUpdate, 'layerId'>[] = []

  switch (layer.id) {
    case 'background':
      updates.push({ property: 'background-color', value: palette.land })
      break
    case 'water':
      updates.push({ property: 'fill-color', value: palette.water })
      break
    case 'park':
      updates.push(
        { property: 'fill-color', value: palette.brandTint },
        { property: 'fill-outline-color', value: palette.brandSoft },
      )
      break
    case 'park_outline':
      updates.push({ property: 'line-color', value: palette.brandSoft })
      break
    case 'landcover_wood':
    case 'landcover_grass':
    case 'landuse_pitch':
    case 'landuse_track':
    case 'landuse_cemetery':
    case 'landuse_school':
    case 'landuse_hospital':
      updates.push({ property: 'fill-color', value: palette.brandTint })
      break
    case 'landuse_residential':
      updates.push({ property: 'fill-color', value: palette.land })
      break
    case 'building':
      updates.push(
        { property: 'fill-color', value: palette.building },
        { property: 'fill-opacity', value: 0.45 },
        { property: 'fill-outline-color', value: palette.border },
      )
      break
    case 'building-3d':
      updates.push(
        { property: 'fill-extrusion-color', value: palette.building },
        { property: 'fill-extrusion-opacity', value: 0.35 },
      )
      break
  }

  if (layer.type === 'line' && isWaterwayLayer(layer.id)) {
    updates.push({ property: 'line-color', value: palette.waterLine })
  }

  if (layer.type === 'line' && isRoadLayer(layer.id)) {
    const isCasing = layer.id.includes('_casing')
    const isMajor = /motorway|trunk|primary|secondary|tertiary/.test(layer.id)
    updates.push({
      property: 'line-color',
      value: isCasing ? palette.border : isMajor ? palette.majorRoad : palette.road,
    })
  }

  if (layer.type === 'line' && layer.id.includes('rail')) {
    updates.push({ property: 'line-color', value: palette.rail })
  }

  if (TEXT_LAYERS.includes(layer.id)) {
    const isPlaceLabel = layer.id.startsWith('label_')
    updates.push(
      { property: 'text-color', value: isPlaceLabel ? palette.text : palette.mutedText },
      { property: 'text-halo-color', value: palette.labelHalo },
      { property: 'text-halo-width', value: 1 },
    )
  }

  return updates.map((update) => ({ layerId: layer.id, ...update }))
}

export function getBrandMapPalette() {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  const primary = token('--color-primary', '#06038d')
  const accent = token('--color-accent', '#0050fc')
  const surface = token('--color-base-surface', '#ffffff')
  const subtle = token('--color-base-surface-subtle', '#f2f2f5')
  const border = token('--color-base-border', '#dedee0')
  const text = token('--color-base-text', '#181616')
  const mutedText = token('--color-base-text-muted', '#58626e')

  return {
    land: subtle,
    road: surface,
    majorRoad: rgba(primary, 0.18),
    border,
    building: border,
    rail: rgba(mutedText, 0.45),
    text,
    mutedText,
    labelHalo: rgba(surface, 0.88),
    water: rgba(accent, 0.16),
    waterLine: rgba(accent, 0.4),
    brandTint: rgba(accent, 0.08),
    brandSoft: rgba(primary, 0.18),
  }
}

export function isWaterwayLayer(layerId: string) {
  return layerId.startsWith('waterway_')
}

export function isRoadLayer(layerId: string) {
  return (
    (layerId.startsWith('road_') ||
      layerId.startsWith('tunnel_') ||
      layerId.startsWith('bridge_')) &&
    !layerId.includes('one_way_arrow') &&
    !layerId.includes('shield') &&
    !layerId.includes('rail')
  )
}

export function setPaint(map: maplibregl.Map, layerId: string, property: string, value: string | number) {
  if (map.getLayer(layerId)) {
    map.setPaintProperty(layerId, property, value)
  }
}

export function rgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized
  const int = Number.parseInt(value, 16)

  if (Number.isNaN(int)) return hex

  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

