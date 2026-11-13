// Editor changes live in localStorage until there's a backend. The store page reads them on mount.
// ponytail: per-slug JSON blob, no versioning/migration — add when the EditorData shape stops moving.
import type { Store } from '../../data/store'
import type { EditorData } from './model'

const key = (slug: string) => `store-editor:${slug}`

export function saveOverrides(data: EditorData) {
  try {
    localStorage.setItem(key(data.slug), JSON.stringify(data))
  } catch {
    // Private mode / quota: the mockup is not worth blowing up over.
  }
}

export function loadOverrides(slug: string): EditorData | null {
  try {
    const raw = localStorage.getItem(key(slug))
    return raw ? (JSON.parse(raw) as EditorData) : null
  } catch {
    return null
  }
}

export function clearOverrides(slug: string) {
  localStorage.removeItem(key(slug))
}

/** Inverse of toEditorData: fold the editable fields back onto the base store. */
export function applyEditorData(store: Store, d: EditorData): Store {
  return {
    ...store,
    name: d.storeName,
    hero: { ...store.hero, image: d.hero },
    intro: d.intro,
    contact: {
      ...store.contact,
      address: [d.street, d.city].filter(Boolean).join(' - '),
      phone: d.phone,
      email: d.email,
    },
    features: d.services.filter((s) => s.on).map((s) => ({ icon: 'check', label: s.label })),
    banner: d.promoTitle
      ? {
          ...store.banner,
          title: d.promoTitle,
          body: d.promoSub,
          cta: d.promoBtn,
          image: d.promoImage,
        }
      : undefined,
    about: {
      ...store.about,
      title: d.aboutHeading,
      paragraphs: d.aboutBody.split(/\n{2,}/).filter(Boolean),
      stats: d.stats,
      gallery: d.gallery.map((g) => ({ src: g.src, alt: g.caption })),
    },
    team: store.team && {
      ...store.team,
      members: d.team.map((m) => ({
        name: m.name,
        role: m.role,
        description: m.bio,
        photo: m.avatar,
      })),
    },
    directions: {
      ...store.directions,
      openingHours: d.hours.map((h) => ({
        day: h.day,
        hours: h.closed ? 'Closed' : `${h.open} – ${h.close}`,
      })),
    },
    faq: {
      ...store.faq,
      items: d.faq.map((f) => ({ question: f.q, answer: f.a })),
    },
  }
}
