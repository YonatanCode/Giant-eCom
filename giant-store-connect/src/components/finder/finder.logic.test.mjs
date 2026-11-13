import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function loadTsModule(filename) {
  const source = readFileSync(join(__dirname, filename), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  })

  return import(`data:text/javascript,${encodeURIComponent(outputText)}`)
}

test('finder utilities slugify, measure distance, and provide useful bounds fallbacks', async () => {
  const { NL_BOUNDS, boundsOf, haversineKm, slugify } = await loadTsModule('utils.ts')

  assert.equal(slugify("Giant Store Arie's Bike Shop"), 'giant-store-arie-s-bike-shop')
  assert.equal(slugify('Fietsenwinkel Héél & Co.'), 'fietsenwinkel-heel-co')

  const amsterdam = { lat: 52.3676, lng: 4.9041 }
  const utrecht = { lat: 52.0907, lng: 5.1214 }
  const distanceKm = haversineKm(amsterdam, utrecht)
  assert.ok(distanceKm > 33 && distanceKm < 36)

  assert.deepEqual(boundsOf([]), NL_BOUNDS)
  assert.deepEqual(boundsOf([
    { lat: 52, lng: 5 },
  ]), [[4.9, 51.9], [5.1, 52.1]])
  assert.deepEqual(boundsOf([
    { lat: 52, lng: 5 },
    { lat: 53, lng: 6 },
  ]), [[5, 52], [6, 53]])
})

test('finder utilities create regional bounds around a searched location', async () => {
  const { boundsAroundLocation, NL_BOUNDS } = await loadTsModule('utils.ts')
  const amsterdam = { lat: 52.3676, lng: 4.9041 }

  const bounds = boundsAroundLocation(amsterdam)
  const [[west, south], [east, north]] = bounds

  assert.notDeepEqual(bounds, NL_BOUNDS)
  assert.ok(west < amsterdam.lng && east > amsterdam.lng)
  assert.ok(south < amsterdam.lat && north > amsterdam.lat)
  assert.ok(east - west < 0.9)
  assert.ok(north - south < 0.6)
})

test('finder utilities expose smooth map camera animation options', async () => {
  const { MAP_CAMERA_ANIMATION } = await loadTsModule('utils.ts')

  assert.equal(MAP_CAMERA_ANIMATION.duration, 850)
  assert.equal(MAP_CAMERA_ANIMATION.essential, false)
  assert.equal(MAP_CAMERA_ANIMATION.easing(0), 0)
  assert.equal(MAP_CAMERA_ANIMATION.easing(1), 1)
  assert.ok(MAP_CAMERA_ANIMATION.easing(0.5) > 0.5)
})

test('finder utilities derive initial map camera options from the first view', async () => {
  const { initialMapCameraForView } = await loadTsModule('utils.ts')
  const bounds = [[3.3, 50.7], [7.3, 53.6]]
  const center = [4.9041, 52.3676]

  const desktopCanvas = { width: 1440, height: 836 }

  assert.deepEqual(initialMapCameraForView({ bounds }, desktopCanvas), {
    bounds,
    fitBoundsOptions: {
      padding: { left: 480, top: 40, right: 40, bottom: 40 },
    },
  })
  assert.deepEqual(initialMapCameraForView({ center, zoom: 14 }, desktopCanvas), {
    center,
    zoom: 14,
  })
})

test('finder map padding always fits inside the canvas', async () => {
  const { storeFinderMapPadding } = await loadTsModule('utils.ts')

  // Desktop: the floating panel needs the wide left inset.
  assert.deepEqual(storeFinderMapPadding({ width: 1440, height: 836 }), {
    left: 480,
    right: 40,
    top: 40,
    bottom: 40,
  })

  // Mobile: no overlapping panel, so no left inset. Regression guard for
  // "Map cannot fit within canvas" on the 240px-tall mobile map.
  assert.deepEqual(storeFinderMapPadding({ width: 390, height: 240 }), {
    left: 24,
    right: 24,
    top: 24,
    bottom: 24,
  })

  // Padding never exceeds a third of either axis, so a fit always has room.
  for (const canvas of [
    { width: 1440, height: 836 },
    { width: 768, height: 400 },
    { width: 390, height: 240 },
    { width: 320, height: 60 },
    { width: 0, height: 0 },
  ]) {
    const padding = storeFinderMapPadding(canvas)
    assert.ok(
      padding.left + padding.right < canvas.width || canvas.width === 0,
      `horizontal padding must fit ${canvas.width}`,
    )
    assert.ok(
      padding.top + padding.bottom < canvas.height || canvas.height === 0,
      `vertical padding must fit ${canvas.height}`,
    )
    for (const value of Object.values(padding)) assert.ok(value >= 0)
  }
})

test('finder utilities choose regional bounds when deselecting a selected map marker', async () => {
  const { boundsAroundLocation, boundsForDeselectedMarker } = await loadTsModule('utils.ts')
  const searchedLocation = { lat: 52.0907, lng: 5.1214 }
  const selectedStore = { lat: 52.3676, lng: 4.9041 }

  assert.deepEqual(
    boundsForDeselectedMarker(searchedLocation, selectedStore),
    boundsAroundLocation(searchedLocation),
  )
  assert.deepEqual(
    boundsForDeselectedMarker(null, selectedStore),
    boundsAroundLocation(selectedStore),
  )
})

test('finder utilities filter stores to the current map bounds', async () => {
  const { storesInBounds } = await loadTsModule('utils.ts')
  const bounds = [[4.8, 52.2], [5.1, 52.5]]
  const visible = { slug: 'amsterdam', lat: 52.3676, lng: 4.9041 }
  const outside = { slug: 'utrecht', lat: 52.0907, lng: 5.1214 }

  assert.deepEqual(storesInBounds([outside, visible], bounds), [visible])
})

test('finder utilities expand map bounds with extra breathing room', async () => {
  const { expandBounds } = await loadTsModule('utils.ts')

  assert.deepEqual(
    expandBounds(
      [
        [4, 52],
        [6, 54],
      ],
      0.25,
    ),
    [
      [3.75, 51.75],
      [6.25, 54.25],
    ],
  )
})

test('marker scaling turns unselected stores into dots at low zoom', async () => {
  const { scaleMarkersByViewport } = await loadTsModule('markerScaling.ts')
  const selected = { slug: 'selected', lat: 52, lng: 5 }
  const points = new Map([
    ['selected', { x: 100, y: 100 }],
    ['nearby', { x: 180, y: 100 }],
  ])
  const nearby = { slug: 'nearby', lat: 52.01, lng: 5.01 }

  const markers = scaleMarkersByViewport([selected, nearby], {
    selectedSlug: selected.slug,
    zoom: 7,
    project: (store) => points.get(store.slug),
  })

  assert.deepEqual(markers.map((marker) => [marker.id, marker.presentation]), [
    ['selected', 'pin'],
    ['nearby', 'dot'],
  ])
})

test('marker scaling turns unselected stores into small pins at middle zoom', async () => {
  const { scaleMarkersByViewport } = await loadTsModule('markerScaling.ts')
  const selected = { slug: 'selected', lat: 52, lng: 5 }
  const nearby = { slug: 'nearby', lat: 52.01, lng: 5.01 }
  const points = new Map([
    ['selected', { x: 100, y: 100 }],
    ['nearby', { x: 180, y: 100 }],
  ])

  const markers = scaleMarkersByViewport([selected, nearby], {
    selectedSlug: selected.slug,
    zoom: 9,
    project: (store) => points.get(store.slug),
  })

  assert.deepEqual(markers.map((marker) => [marker.id, marker.presentation]), [
    ['selected', 'pin'],
    ['nearby', 'smallPin'],
  ])
})

test('marker scaling keeps every unselected store as a pin at high zoom', async () => {
  const { scaleMarkersByViewport } = await loadTsModule('markerScaling.ts')
  const closeA = { slug: 'close-a', lat: 52.01, lng: 5.01 }
  const closeB = { slug: 'close-b', lat: 52.02, lng: 5.02 }
  const isolated = { slug: 'isolated', lat: 53, lng: 6 }
  const points = new Map([
    ['close-a', { x: 100, y: 100 }],
    ['close-b', { x: 132, y: 100 }],
    ['isolated', { x: 240, y: 100 }],
  ])

  const markers = scaleMarkersByViewport([closeA, closeB, isolated], {
    selectedSlug: null,
    zoom: 10,
    project: (store) => points.get(store.slug),
  })

  assert.deepEqual(markers.map((marker) => [marker.id, marker.presentation]), [
    ['close-a', 'pin'],
    ['close-b', 'pin'],
    ['isolated', 'pin'],
  ])
})

test('finder utilities show a map-selected store in the panel before a location is entered', async () => {
  const { storePanelResults } = await loadTsModule('utils.ts')
  const unselected = { slug: 'utrecht', isGiantStore: false, lat: 52.0907, lng: 5.1214 }
  const selected = { slug: 'amsterdam', isGiantStore: true, lat: 52.3676, lng: 4.9041 }

  assert.deepEqual(
    storePanelResults([unselected, selected], {
      location: null,
      viewportBounds: null,
      selectedSlug: null,
    }),
    [],
  )
  assert.deepEqual(
    storePanelResults([unselected, selected], {
      location: null,
      viewportBounds: null,
      selectedSlug: 'amsterdam',
    }),
    [selected],
  )
})

test('finder utilities show current viewport stores after deselecting a landing map marker', async () => {
  const { storePanelResults } = await loadTsModule('utils.ts')
  const bounds = [[4.8, 52.2], [5.1, 52.5]]
  const visible = { slug: 'amsterdam', isGiantStore: true, lat: 52.3676, lng: 4.9041 }
  const outside = { slug: 'utrecht', isGiantStore: false, lat: 52.0907, lng: 5.1214 }

  assert.deepEqual(
    storePanelResults([outside, visible], {
      location: null,
      viewportBounds: bounds,
      selectedSlug: null,
      showViewportStores: true,
    }).map((store) => store.slug),
    ['amsterdam'],
  )
})

test('finder utilities sort viewport stores by distance to the viewport centre without a location', async () => {
  const { storePanelResults, boundsCenter, haversineKm } = await loadTsModule('utils.ts')
  const bounds = [[4.8, 52.0], [5.4, 52.6]]
  const center = boundsCenter(bounds)
  const nearCenter = { slug: 'near', isGiantStore: false, lat: 52.31, lng: 5.09 }
  const farCorner = { slug: 'far', isGiantStore: false, lat: 52.05, lng: 4.85 }

  const results = storePanelResults([farCorner, nearCenter], {
    location: null,
    viewportBounds: bounds,
    selectedSlug: null,
    showViewportStores: true,
  })

  assert.deepEqual(center, { lng: 5.1, lat: 52.3 })
  assert.deepEqual(results.map((store) => store.slug), ['near', 'far'])
  assert.ok(haversineKm(center, nearCenter) < haversineKm(center, farCorner))
})

test('finder utilities keep showing viewport stores after zooming a selected landing marker', async () => {
  const { storePanelResults } = await loadTsModule('utils.ts')
  const bounds = [[5, 52], [5.3, 52.3]]
  const selected = { slug: 'selected', isGiantStore: true, lat: 52.1, lng: 5.1 }
  const nearby = { slug: 'nearby', isGiantStore: false, lat: 52.2, lng: 5.2 }
  const outside = { slug: 'outside', isGiantStore: true, lat: 53.5, lng: 6.5 }

  assert.deepEqual(
    storePanelResults([selected, nearby, outside], {
      location: null,
      viewportBounds: bounds,
      selectedSlug: 'selected',
      showViewportStores: true,
    }).map((store) => store.slug),
    ['selected', 'nearby'],
  )
})

test('finder utilities toggle selected store slugs', async () => {
  const { toggleSelectedSlug } = await loadTsModule('utils.ts')

  assert.equal(toggleSelectedSlug('selected', 'selected'), null)
  assert.equal(toggleSelectedSlug('selected', 'nearby'), 'nearby')
  assert.equal(toggleSelectedSlug(null, 'selected'), 'selected')
})

test('finder utilities show viewport stores before a location is entered', async () => {
  const { storePanelResults } = await loadTsModule('utils.ts')
  const visibleA = { slug: 'visible-a', isGiantStore: true, lat: 52.3676, lng: 4.9041 }
  const outside = { slug: 'outside', isGiantStore: false, lat: 52.0907, lng: 5.1214 }
  const visibleB = { slug: 'visible-b', isGiantStore: false, lat: 52.4, lng: 4.95 }

  assert.deepEqual(
    storePanelResults([visibleA, outside, visibleB], {
      location: null,
      viewportBounds: [[4.8, 52.2], [5.1, 52.5]],
      selectedSlug: null,
      showViewportStores: true,
    }),
    [visibleA, visibleB],
  )
})

test('finder utilities list official stores before partners while preserving distance order', async () => {
  const { orderStoreResults } = await loadTsModule('utils.ts')
  const partnerClosest = { slug: 'partner-closest', isGiantStore: false, distanceKm: 1 }
  const officialClosest = { slug: 'official-closest', isGiantStore: true, distanceKm: 5 }
  const officialFarther = { slug: 'official-farther', isGiantStore: true, distanceKm: 10 }
  const partnerFarther = { slug: 'partner-farther', isGiantStore: false, distanceKm: 2 }

  assert.deepEqual(
    orderStoreResults([partnerClosest, officialFarther, partnerFarther, officialClosest]).map(
      (store) => store.slug,
    ),
    ['official-closest', 'official-farther', 'partner-closest', 'partner-farther'],
  )
})

test('finder filters combine active chip predicates with AND semantics', async () => {
  const { FILTER_CHIPS, matchesAllActiveFilters } = await loadTsModule('filters.ts')
  const store = { tags: ['Giant Store', 'E-bike certificaat'] }
  const partnerStore = { tags: ['Premium Retailer'] }

  assert.deepEqual(FILTER_CHIPS, [
    'All',
    'Giant bikes',
    'Liv bikes',
    'Test ride',
    'Bike fitting',
    'E-bike',
    'Service & repair',
  ])
  assert.equal(matchesAllActiveFilters(store, new Set()), true)
  assert.equal(matchesAllActiveFilters(store, new Set(['Giant bikes', 'E-bike'])), true)
  assert.equal(matchesAllActiveFilters(partnerStore, new Set(['Giant bikes'])), true)
  assert.equal(matchesAllActiveFilters(store, new Set(['Test ride'])), false)
  assert.equal(matchesAllActiveFilters(store, new Set(['All', 'Liv bikes', 'Service & repair'])), true)
})

test('store finder stacks the panel above map markers', () => {
  const source = readFileSync(join(__dirname, 'StoreFinder.tsx'), 'utf8')

  assert.match(source, /className="absolute inset-0 z-0"/)
  assert.match(source, /className="[^"]*\bz-20\b[^"]*bg-base-surface/)
})

test('store finder map refreshes scaled markers after camera movement settles', () => {
  const source = readFileSync(join(__dirname, 'StoreFinderMap.tsx'), 'utf8')

  assert.doesNotMatch(source, /mapInstance\.on\('move', scheduleMarkerSync\)/)
  assert.match(source, /const handleViewportEnd = \(\) => \{[\s\S]*syncLatestStoreMarkers\(\)/)
  assert.match(source, /mapInstance\.on\('moveend', handleViewportEnd\)/)
})

test('store finder map refreshes scaled markers shortly after wheel scrolling stops', () => {
  const source = readFileSync(join(__dirname, 'StoreFinderMap.tsx'), 'utf8')

  assert.match(source, /const POST_SCROLL_MARKER_SYNC_DELAY_MS = 200/)
  assert.match(source, /schedulePostScrollMarkerSync = \(\) => \{[\s\S]*window\.setTimeout\(\(\) => \{[\s\S]*syncLatestStoreMarkers\(\)/)
  assert.match(source, /mapCanvas\.addEventListener\('wheel', schedulePostScrollMarkerSync, \{ passive: true \}\)/)
  assert.match(source, /mapCanvas\?\.removeEventListener\('wheel', schedulePostScrollMarkerSync\)/)
})

test('store finder map reports viewport bounds during camera movement', () => {
  const source = readFileSync(join(__dirname, 'StoreFinderMap.tsx'), 'utf8')

  assert.match(source, /const scheduleViewportSync = \(\) => \{/)
  assert.match(source, /mapInstance\.on\('move', scheduleViewportSync\)/)
  assert.match(source, /reportBounds\(mapInstance, onBoundsChangeRef\)/)
})

test('map zoom controls sit in the bottom-right corner', () => {
  const finderMapSource = readFileSync(join(__dirname, 'StoreFinderMap.tsx'), 'utf8')
  const storeMapSource = readFileSync(join(__dirname, '../store/OpenFreeMap.tsx'), 'utf8')

  assert.match(finderMapSource, /NavigationControl\(\{ showCompass: false \}\), 'bottom-right'\)/)
  assert.match(storeMapSource, /NavigationControl\(\{ showCompass: false \}\), 'bottom-right'\)/)
})

test('store finder map renders one scaled marker per store without cluster callbacks', () => {
  const mapSource = readFileSync(join(__dirname, 'StoreFinderMap.tsx'), 'utf8')
  const finderSource = readFileSync(join(__dirname, 'StoreFinder.tsx'), 'utf8')

  assert.match(mapSource, /scaleMarkersByViewport/)
  assert.doesNotMatch(mapSource, /onClusterSelect/)
  assert.doesNotMatch(mapSource, /createGroupedStoreMarker/)
  assert.doesNotMatch(mapSource, /groupMarkersByViewport/)
  assert.doesNotMatch(finderSource, /clusteredStoreSlugs/)
  assert.doesNotMatch(finderSource, /handleClusterSelect/)
})

test('store finder shows viewport results when the user moves a selected map', () => {
  const mapSource = readFileSync(join(__dirname, 'StoreFinderMap.tsx'), 'utf8')
  const finderSource = readFileSync(join(__dirname, 'StoreFinder.tsx'), 'utf8')

  assert.match(mapSource, /onViewportInteraction: \(\) => void/)
  assert.match(mapSource, /mapInstance\.on\('movestart', handleViewportInteraction\)/)
  assert.match(finderSource, /function handleViewportInteraction\(\) \{/)
  assert.match(finderSource, /if \(selectedSlug\) \{[\s\S]*setShowViewportStores\(true\)/)
  assert.match(finderSource, /onViewportInteraction=\{handleViewportInteraction\}/)
})

test('store finder toggles selected cards from the results list', () => {
  const finderSource = readFileSync(join(__dirname, 'StoreFinder.tsx'), 'utf8')

  assert.match(finderSource, /function handleListSelect\(slug: string\) \{[\s\S]*toggleSelectedSlug\(selectedSlug, slug\)/)
  assert.match(finderSource, /function handleListSelect\(slug: string\) \{[\s\S]*setSelectedSlug\(nextSelectedSlug\)/)
  assert.match(finderSource, /function handleListSelect\(slug: string\) \{[\s\S]*setShowViewportStores\(deselecting\)/)
})

test('store cards derive labels, address, distance, and CTA from store listing data', async () => {
  const {
    DEFAULT_STORE_OPENING_HOURS,
    formatDistanceKm,
    getStoreOpeningHours,
    getStoreOpeningHoursSummary,
    formatStoreAddress,
    getStoreDescription,
    getStoreAvatarVariant,
    getStoreCta,
    getStoreTypeLabel,
  } =
    await loadTsModule('storeCardModel.ts')

  const giantStore = {
    slug: 'giant-store-amsterdam',
    isGiantStore: true,
    street: 'Koningsplein 12',
    postcode: '1017 BB',
    city: 'Amsterdam',
    website: 'https://example.com',
    detailHref: '/store/giant-store-amsterdam',
    tags: ['Giant Store', 'E-bike certificaat', 'DCF Essential'],
  }
  const partnerStore = {
    slug: 'partner-bikes',
    isGiantStore: false,
    street: 'Dorpsstraat 1',
    postcode: '1234 AB',
    city: 'Utrecht',
    website: 'https://partner.example',
    detailHref: 'https://partner.example',
    tags: ['Premium Retailer'],
  }

  assert.equal(getStoreTypeLabel(giantStore), 'Official Giant Retailer')
  assert.equal(getStoreTypeLabel(partnerStore), 'Authorised Partner')
  assert.equal(getStoreAvatarVariant(giantStore), 'giant')
  assert.equal(getStoreAvatarVariant(partnerStore), 'store')
  assert.equal(formatStoreAddress(giantStore), 'Koningsplein 12, 1017 BB Amsterdam')
  assert.equal(getStoreDescription(giantStore), 'Official Giant retailer in Amsterdam offering e-bike certificaat and dcf essential.')
  assert.equal(getStoreDescription(partnerStore), 'Authorised Giant partner in Utrecht.')
  assert.equal(formatDistanceKm(1.24), '1.2 km')
  assert.equal(DEFAULT_STORE_OPENING_HOURS.length, 7)
  assert.deepEqual(getStoreOpeningHours({}), DEFAULT_STORE_OPENING_HOURS)
  assert.deepEqual(
    getStoreOpeningHours({
      openingHours: [
        { day: 'Monday', hours: 'Closed' },
        { day: 'Tuesday', hours: '10:00 - 19:30' },
      ],
    }),
    [
      { day: 'Monday', hours: 'Closed' },
      { day: 'Tuesday', hours: '10:00 - 19:30' },
    ],
  )
  assert.equal(getStoreOpeningHoursSummary([{ day: 'Tuesday', hours: '10:00 - 19:30' }]), 'Open now - closes 19:30')
  assert.equal(getStoreOpeningHoursSummary([{ day: 'Monday', hours: 'Closed' }]), 'Closed now')
  assert.deepEqual(getStoreCta(giantStore), {
    href: '/store/giant-store-amsterdam',
    external: false,
  })
  assert.deepEqual(getStoreCta(partnerStore), {
    href: 'https://partner.example',
    external: true,
  })
  assert.equal(getStoreCta({ ...partnerStore, website: undefined, detailHref: '#' }), null)
})

test('store hero and finder listing share the store card presentation', () => {
  const heroPanelSource = readFileSync(join(__dirname, '../store/StoreSidePanel.tsx'), 'utf8')
  const finderCardSource = readFileSync(join(__dirname, 'StoreCard.tsx'), 'utf8')
  const sharedCardSource = readFileSync(join(__dirname, '../store/StoreInfoCard.tsx'), 'utf8')
  const buttonSource = readFileSync(join(__dirname, '../store/Button.tsx'), 'utf8')

  assert.match(heroPanelSource, /import StoreInfoCard/)
  assert.match(finderCardSource, /import StoreInfoCard/)
  assert.match(sharedCardSource, /export default function StoreInfoCard/)
  assert.match(finderCardSource, /titleClassName="text-heading-m text-base-text-heading"/)
  assert.doesNotMatch(finderCardSource, /titleClassName="truncate/)
  assert.match(finderCardSource, /badgeSize="compact"/)
  assert.match(finderCardSource, /headerAlign="start"/)
  assert.match(finderCardSource, /labelClassName=\{store\.isGiantStore \? undefined : 'text-action-text-subtle'\}/)
  assert.match(sharedCardSource, /labelClassName \?\? 'text-base-text-emphasis'/)
  assert.match(sharedCardSource, /start: 'items-start'/)
  assert.match(finderCardSource, /description=\{getStoreDescription\(store\)\}/)
  assert.match(finderCardSource, /featureVariant="pills"/)
  assert.match(finderCardSource, /featurePosition="beforeRows"/)
  assert.match(finderCardSource, /store\.isGiantStore/)
  assert.match(finderCardSource, /label: 'Visite store website'/)
  assert.match(finderCardSource, /presentation: 'link'/)
  assert.match(finderCardSource, /variant: 'secondaryStrong'/)
  assert.match(finderCardSource, /size: '40ActionS'/)
  assert.match(sharedCardSource, /size=\{action\.size \?\? 40\}/)
  assert.match(sharedCardSource, /function ActionLink/)
  assert.match(sharedCardSource, /Icon name="arrow-right"/)
  assert.match(buttonSource, /'40ActionS': 'h-10 px-m text-action-s'/)
  assert.match(buttonSource, /secondaryStrong:[\s\S]*border-2 border-action-border/)
  assert.doesNotMatch(finderCardSource, /shadow-\[0_4px_32px/)
  assert.match(finderCardSource, /<DistanceMarker distanceKm=\{store\.distanceKm\} \/>/)
  assert.match(finderCardSource, /function DistanceMarker/)
  assert.match(finderCardSource, /Icon name="map-pin"/)
  assert.match(finderCardSource, /cursor-pointer border text-left/)
  assert.match(finderCardSource, /'border-\[1\.5px\] border-action-border'/)
  assert.doesNotMatch(finderCardSource, /cursor-pointer border-\[1\.5px\] text-left/)
  assert.doesNotMatch(finderCardSource, /\? 'border-action-border bg-base-surface-subtle'/)
  assert.match(sharedCardSource, /compact: \{ frame: 'h-8 w-8'/)
  assert.match(sharedCardSource, /function FeaturePills/)
  assert.doesNotMatch(finderCardSource, /function StoreTypeBadge/)
})

test('store cards expose an expandable weekly opening-hours row', () => {
  const finderCardSource = readFileSync(join(__dirname, 'StoreCard.tsx'), 'utf8')
  const sharedCardSource = readFileSync(join(__dirname, '../store/StoreInfoCard.tsx'), 'utf8')

  assert.match(finderCardSource, /useState/)
  assert.match(finderCardSource, /getStoreOpeningHours\(store\)/)
  assert.match(finderCardSource, /getStoreOpeningHoursSummary\(openingHours\)/)
  assert.match(finderCardSource, /showChevron: true/)
  assert.match(finderCardSource, /expanded: hoursExpanded/)
  assert.match(finderCardSource, /details: hoursExpanded \?/)
  assert.match(sharedCardSource, /aria-expanded=\{row\.expanded\}/)
  assert.match(sharedCardSource, /row\.onToggle/)
  assert.match(sharedCardSource, /rotate-180/)
})

test('map marker variants identify official, partner, selected, small, and dot states', async () => {
  const {
    getStorePinType,
    getStorePinFrame,
    getStorePinZIndex,
    isStoreDotPinType,
    createBrandPinElement,
    shouldReplaceStorePinElement,
  } =
    await loadTsModule('../store/mapStyle.ts')

  assert.equal(getStorePinType({ isGiantStore: true }, false), 'giant')
  assert.equal(getStorePinType({ isGiantStore: false }, false), 'partner')
  assert.equal(getStorePinType({ isGiantStore: true }, true), 'selected')
  assert.equal(getStorePinType({ isGiantStore: false }, true), 'selectedPartner')
  assert.equal(getStorePinType({ isGiantStore: true }, false, 'smallPin'), 'giant')
  assert.equal(getStorePinType({ isGiantStore: false }, false, 'smallPin'), 'partner')
  assert.equal(getStorePinType({ isGiantStore: true }, false, 'dot'), 'giantDot')
  assert.equal(getStorePinType({ isGiantStore: false }, false, 'dot'), 'partnerDot')
  assert.equal(isStoreDotPinType('giantDot'), true)
  assert.equal(isStoreDotPinType('partner'), false)
  assert.ok(getStorePinZIndex({ isGiantStore: true }, false) > getStorePinZIndex({ isGiantStore: false }, false))
  assert.ok(getStorePinZIndex({ isGiantStore: true }, true) > getStorePinZIndex({ isGiantStore: true }, false))
  assert.match(getStorePinFrame('selected').viewBox, /^-\d/)
  assert.match(getStorePinFrame('selectedPartner').viewBox, /^-\d/)
  assert.equal(shouldReplaceStorePinElement(undefined, 'selectedPartner'), true)
  assert.equal(shouldReplaceStorePinElement('selected', 'selectedPartner'), true)
  assert.equal(shouldReplaceStorePinElement('selectedPartner', 'selectedPartner'), false)

  globalThis.document = {
    createElement() {
      return {
        style: {},
        setAttribute() {},
      }
    },
  }

  const partnerPin = createBrandPinElement({ type: 'partner' })
  const smallPartnerPin = createBrandPinElement({ type: 'partner', presentation: 'smallPin' })
  const selectedPartnerPin = createBrandPinElement({ type: 'selectedPartner' })
  const giantDot = createBrandPinElement({ type: 'giantDot' })
  const partnerDot = createBrandPinElement({ type: 'partnerDot' })

  assert.match(partnerPin.innerHTML, /--color-base-icon-subtle/)
  assert.match(smallPartnerPin.innerHTML, /scale\(0\.6\)/)
  assert.match(selectedPartnerPin.innerHTML, /--color-base-icon-subtle/)
  assert.doesNotMatch(selectedPartnerPin.innerHTML, /--color-dark/)
  assert.match(giantDot.innerHTML, /width: 12px; height: 12px/)
  assert.match(giantDot.innerHTML, /--color-primary/)
  assert.match(partnerDot.innerHTML, /--color-base-icon-subtle/)
  assert.doesNotMatch(giantDot.innerHTML, /radial-gradient/)
  delete globalThis.document
})

test('map style helpers can brand the style before MapLibre renders it', async () => {
  const { brandMapStyle } = await loadTsModule('../store/mapStyle.ts')
  const palette = {
    land: '#land',
    road: '#road',
    majorRoad: '#major-road',
    border: '#border',
    building: '#building',
    rail: '#rail',
    text: '#text',
    mutedText: '#muted-text',
    labelHalo: '#halo',
    water: '#water',
    waterLine: '#water-line',
    brandTint: '#brand-tint',
    brandSoft: '#brand-soft',
  }
  const style = {
    version: 8,
    sources: {},
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#original' } },
      { id: 'water', type: 'fill', paint: { 'fill-color': '#original' } },
      { id: 'road_primary', type: 'line', paint: { 'line-color': '#original' } },
      { id: 'road_primary_casing', type: 'line', paint: { 'line-color': '#original' } },
      { id: 'waterway_river', type: 'line', paint: { 'line-color': '#original' } },
      { id: 'label_city', type: 'symbol', paint: { 'text-color': '#original' } },
    ],
  }

  const branded = brandMapStyle(style, palette)

  assert.equal(branded.layers[0].paint['background-color'], '#land')
  assert.equal(branded.layers[1].paint['fill-color'], '#water')
  assert.equal(branded.layers[2].paint['line-color'], '#major-road')
  assert.equal(branded.layers[3].paint['line-color'], '#border')
  assert.equal(branded.layers[4].paint['line-color'], '#water-line')
  assert.equal(branded.layers[5].paint['text-color'], '#text')
  assert.equal(branded.layers[5].paint['text-halo-color'], '#halo')
})
