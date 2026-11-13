// Store -> editor form model. Read-only projection: the editor is a UI mockup, nothing saves.
import type { Store } from '../../data/store'

export type HourRow = { day: string; open: string; close: string; closed: boolean }
export type Chip = { label: string; on: boolean }
export type LockedSection = { id: string; label: string; title: string; desc: string; rows: { label: string; value: string }[] }

export interface EditorData {
  slug: string
  storeName: string
  owner: { name: string; role: string; avatar: string }
  hero: string
  intro: string
  street: string
  city: string
  phone: string
  email: string
  services: Chip[]
  hours: HourRow[]
  hoursNote: string
  promoImage: string
  promoTitle: string
  promoSub: string
  promoBtn: string
  promoUrl: string
  aboutHeading: string
  aboutBody: string
  stats: { label: string; value: string }[]
  gallery: { src: string; caption: string }[]
  team: { avatar: string; name: string; role: string; bio: string }[]
  faq: { q: string; a: string }[]
  locked: LockedSection[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Every feature a store can advertise beside its address; the ones it doesn't have show as "off".
const FEATURE_CATALOG = [
  'Repairs and servicing',
  'New bike pick-up',
  'Dynamic Cycling Fit',
  'Bike customisation',
  'Test rides',
  'Bike rental',
  'Premium Retailer',
  'E-bike specialist',
  'E-bike test center',
  'Giant B2B Lease',
]

function splitHours(hours: string): { open: string; close: string; closed: boolean } {
  if (/closed/i.test(hours)) return { open: '', close: '', closed: true }
  const [open = '', close = ''] = hours.split(/\s*[–-]\s*/)
  // Store copy sometimes reads "Open – 18:00"; the editor wants clock times only.
  const time = (part: string) => (/^\d{1,2}[:.]\d{2}$/.test(part.trim()) ? part.trim() : '')
  return { open: time(open), close: time(close), closed: false }
}

export function toEditorData(store: Store): EditorData {
  const [street = '', city = ''] = store.contact.address.split(' - ')
  const owned = new Set(store.features.map((f) => f.label))
  const dcfTier = store.dcf?.tier

  const locked: LockedSection[] = [
    {
      id: 'service',
      label: store.service.title,
      title: store.service.title,
      desc: "The booking widget and its service types come from Giant's central appointment system. Your available slots are managed in the Service planner, not here.",
      rows: [
        { label: 'Intro copy', value: store.service.body },
        { label: 'Bookable services', value: store.service.services.map((s) => s.label).join(' · ') },
        { label: 'Calendar', value: 'Connected — Giant Service Planner' },
        { label: 'Confirmation email', value: 'Giant standard template (NL)' },
      ],
    },
    {
      id: 'inventory',
      label: store.inventory.title,
      title: store.inventory.title,
      desc: 'Categories follow the live product feed for your store. Add or remove a range in the dealer portal and it appears here within an hour.',
      rows: [
        ...store.inventory.groups.map((g) => ({
          label: g.title,
          value: g.cards.map((c) => c.title).join(' · '),
        })),
        { label: 'Feed status', value: 'Synced 27 Aug 2026, 06:12' },
      ],
    },
    ...(store.dcf
      ? [
          {
            id: 'dcf',
            label: 'Dynamic Cycling Fit',
            title: 'Dynamic Cycling Fit',
            desc: 'The DCF explainer and the five fitting steps are the same for every certified partner. Your tier badge is set by Giant when you certify.',
            rows: [
              { label: 'Your tier', value: dcfTier?.title ?? '' },
              { label: 'Steps shown', value: store.dcf.steps.map((s) => s.title).join(' → ') },
              { label: 'Booking button', value: `${dcfTier?.cta ?? ''} — links to your service form` },
              { label: 'Certified until', value: '31 March 2027' },
            ],
          },
        ]
      : []),
    {
      id: 'directions',
      label: 'Directions & parking',
      title: 'Directions & parking',
      desc: 'Route text and the map are generated from your address. Update the address under Hero & contact and this section follows.',
      rows: [
        {
          label: 'Map pin',
          value: `${store.directions.map.lat}, ${store.directions.map.lng} — from your address`,
        },
        { label: 'By public transport', value: store.directions.byTransport },
        { label: 'By car', value: store.directions.byCar },
        { label: 'Parking', value: store.directions.parking },
      ],
    },
    ...(store.articles
      ? [
          {
            id: 'news',
            label: 'News',
            title: 'News',
            desc: 'Articles are published by Giant and shown to every store. Local news is on the roadmap for spring 2027.',
            rows: [
              { label: 'Latest', value: store.articles.items[0]?.title ?? '' },
              { label: 'Also showing', value: store.articles.items.slice(1).map((a) => a.title).join(' · ') },
              { label: 'Articles shown', value: `${store.articles.items.length} most recent` },
            ],
          },
        ]
      : []),
    {
      id: 'brands',
      label: 'Brands',
      title: 'Brands',
      desc: 'Logos are drawn from the brands you are an authorised dealer for. Your dealer agreements decide what appears.',
      rows: [
        { label: 'Bikes', value: store.brands.primary.map((b) => b.name).join(' · ') },
        { label: store.brands.gearTitle, value: store.brands.gear.map((b) => b.name).join(' · ') },
        { label: 'Last reviewed', value: '12 Aug 2026' },
      ],
    },
  ]

  const firstMember = store.team?.members[0]

  return {
    slug: store.slug,
    storeName: store.name,
    owner: {
      name: firstMember?.name ?? 'Store owner',
      role: firstMember?.role ?? 'Store owner',
      avatar: firstMember?.photo ?? '/images/employees/Avatar.jpg',
    },
    hero: store.hero.image,
    intro: store.intro ?? '',
    street,
    city,
    phone: store.contact.phone,
    email: store.contact.email,
    services: FEATURE_CATALOG.map((label) => ({ label, on: owned.has(label) })),
    hours: [...store.directions.openingHours]
      .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
      .map((h) => ({ day: h.day, ...splitHours(h.hours) })),
    hoursNote: '',
    promoImage: store.banner?.image ?? '',
    promoTitle: store.banner?.title ?? '',
    promoSub: store.banner?.body ?? '',
    promoBtn: store.banner?.cta ?? '',
    promoUrl: '',
    aboutHeading: store.about.title,
    aboutBody: store.about.paragraphs.join('\n\n'),
    stats: (store.about.stats ?? []).map((s) => ({ label: s.label, value: s.value })),
    gallery: (store.about.gallery ?? []).map((g) => ({ src: g.src, caption: g.alt })),
    team: (store.team?.members ?? []).map((m) => ({
      avatar: m.photo,
      name: m.name,
      role: m.role,
      bio: m.description ?? '',
    })),
    faq: store.faq.items.map((f) => ({ q: f.question, a: f.answer })),
    locked,
  }
}
