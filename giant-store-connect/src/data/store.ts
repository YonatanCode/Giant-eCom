// Static mock store data for the store page (/store/:id).
// ponytail: one hand-authored store (Bennebroek) is the shared template; every other official
// Giant Store is synthesized from real finder data over it. Swap for a per-store fetch later.

import { giantBennebroek } from "./bennebroek";
import {
  officialStoreDetails,
  type OfficialStoreDetail,
} from "./official-store-details";
import { scrapedStoreContent } from "./store-content.generated";
import { storeContentOverrides } from "./store-content-overrides";
import type { ScrapedStoreContent } from "./store-content";

export type StoreType = "flagship" | "store" | "partner";

export interface Feature {
  icon: string; // icon key, see src/components/store/icons
  label: string;
}

export interface ContactDetails {
  /** Short open-status line, e.g. "Open until 18:00" */
  openStatus: string;
  address: string;
  phone: string;
  email: string;
}

export interface Service {
  icon: string;
  label: string;
  /** Optional detail shown when selected, e.g. "From € 149,00" */
  description?: string;
}

export interface Stat {
  value: string; // e.g. "40+"
  label: string; // e.g. "years of experience"
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description?: string;
  photo: string;
}

export interface CollectionCard {
  title: string;
  href: string;
  /** Product image; omit for text-only cards (the "Other" column in Figma) */
  image?: string;
  /** Secondary underlined line under the title, e.g. "Markplaats" */
  subtitle?: string;
}

export interface CollectionGroup {
  title: string; // "Bikes" | "Gear" | "Other"
  cards: CollectionCard[];
}

export interface TimelineStep {
  title: string;
  description: string;
}

export interface DcfTier {
  eyebrow: string; // "DCF TIER"
  title: string; // "Certified DCF Supreme Partner"
  body: string;
  image: string;
  cta: string;
}

export interface DcfSection {
  eyebrow: string; // "DCF" (uses logo in design)
  title: string; // "Find your perfect position"
  intro: string;
  body: string;
  steps: TimelineStep[];
  tier: DcfTier;
}

export interface OpeningHour {
  day: string; // "Wednesday"
  hours: string; // "09:00 – 18:00" | "Closed"
}

export interface MapInfo {
  /** Static map image (mock) */
  image: string;
  lat: number;
  lng: number;
}

export interface FaqItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export interface Article {
  title: string;
  body: string;
  ctaLabel: string;
  image: string;
  href: string;
}

export interface Brand {
  name: string;
  logo: string;
}

export interface Store {
  id: string;
  slug: string; // url slug, e.g. "giant-bennebroek"
  name: string; // "Giant Bennebroek"
  type: StoreType;
  brand: "giant" | "liv";
  hero: {
    image: string;
    /** small label above the title, e.g. "Giant Store" */
    label: string;
  };
  contact: ContactDetails;
  features: Feature[];
  /** Optional — some stores invest less in content; see hasSection() in getStore. */
  intro?: string;

  service: {
    eyebrow: string; // "SERVICE"
    title: string; // "Book an appointment"
    body: string;
    bookHeading: string; // "Book a service"
    services: Service[];
    cta: string; // "Book a service"
    image: string;
  };

  banner?: {
    eyebrow?: string;
    title: string;
    body: string;
    cta: string;
    ctaSecondary?: string;
    image: string;
  };

  about: {
    eyebrow: string; // "ABOUT US"
    title: string;
    specialtiesLabel: string; // "Our specialties"
    specialties: Feature[];
    paragraphs: string[];
    stats?: Stat[];
    gallery?: GalleryImage[];
  };

  team?: {
    title: string; // "Meet the team"
    members: TeamMember[];
  };

  inventory: {
    eyebrow: string; // "OUR COLLECTION"
    title: string; // "Store inventory"
    groups: CollectionGroup[];
  };

  dcf?: DcfSection;

  directions: {
    eyebrow: string; // "DIRECTIONS"
    title: string; // "Visit the store"
    intro: string;
    map: MapInfo;
    openingHours: OpeningHour[];
    byTransport: string;
    byCar: string;
    parking: string;
  };

  faq: {
    eyebrow: string; // "GOOD TO KNOW"
    title: string; // "Frequently Asked Questions"
    contact: {
      question: string;
      note: string;
      phone: string;
      email: string;
    };
    items: FaqItem[];
  };

  articles?: {
    eyebrow: string; // "News"
    title: string; // "Latest Articles"
    viewAllLabel: string;
    items: Article[];
  };

  brands: {
    title: string; // "Our brands"
    primary: Brand[];
    gearTitle: string; // "Gear & components"
    gear: Brand[];
  };
}

export const stores = [giantBennebroek];
const authoredStoresBySlug = new Map(
  stores.map((store) => [store.slug, store] as const),
);
const officialStoreDetailsBySlug = new Map<string, OfficialStoreDetail>(
  officialStoreDetails.map((store) => [store.slug, store] as const),
);

// Real per-store capability tags (from nlStores) → hero check-list features.
// `Giant Store` is the store type itself (shown in the hero label), so it's not listed here.
const TAG_FEATURE: Record<string, Feature> = {
  "Premium Retailer": { icon: "check", label: "Premium Retailer" },
  "E-bike certificaat": { icon: "check", label: "E-bike specialist" },
  "E-bike Testcenter": { icon: "test-ride", label: "E-bike test center" },
  "DCF Supreme": { icon: "dcf", label: "DCF Supreme" },
  "DCF Premium": { icon: "dcf", label: "DCF Premium" },
  "DCF Essential": { icon: "dcf", label: "DCF Essential" },
  "Giant B2B Lease": { icon: "check", label: "Giant B2B Lease" },
};

const TAG_INTRO_TEXT: Record<string, string> = {
  "Premium Retailer": "expert product advice",
  "E-bike certificaat": "certified e-bike support",
  "E-bike Testcenter": "test rides",
  "DCF Supreme": "extensive custom bike fitting",
  "DCF Premium": "professional bike fitting",
  "DCF Essential": "bike fitting",
  "Giant B2B Lease": "lease solutions",
};

const DCF_TIER_TAGS = ["DCF Supreme", "DCF Premium", "DCF Essential"] as const;
type DcfTierTag = (typeof DCF_TIER_TAGS)[number];

const DCF_TIER_COPY: Record<DcfTierTag, Pick<DcfTier, "title" | "body">> = {
  "DCF Supreme": {
    title: "Certified DCF Supreme Partner",
    body: "This store offers the full Dynamic Cycling Fit experience, using advanced motion analysis to fine-tune comfort, efficiency and performance.",
  },
  "DCF Premium": {
    title: "Certified DCF Premium Partner",
    body: "This store offers an advanced Dynamic Cycling Fit service for riders who want a more comfortable, efficient position on the bike.",
  },
  "DCF Essential": {
    title: "Certified DCF Essential Partner",
    body: "This store offers an entry-level Dynamic Cycling Fit service to help riders improve comfort and confidence on every ride.",
  },
};

const PLACEHOLDER_TEAM = {
  title: "Meet the team",
  members: [
    {
      name: "Alex de Vries",
      role: "Store manager",
      description:
        "A friendly store lead who helps riders find the right bike, gear and service plan for everyday use and weekend adventures.",
      photo: "/images/employees/placeholder-1.svg",
    },
    {
      name: "Sam Jansen",
      role: "Bike specialist",
      description:
        "A product specialist focused on matching each rider with the right frame, fit and accessories.",
      photo: "/images/employees/placeholder-2.svg",
    },
    {
      name: "Robin Bakker",
      role: "Workshop mechanic",
      description:
        "A mechanic who keeps bikes running smoothly, from quick checks to more detailed service appointments.",
      photo: "/images/employees/placeholder-3.svg",
    },
    {
      name: "Jamie Smit",
      role: "Service advisor",
      description:
        "A service advisor who helps plan repairs, test rides and fitting appointments around each rider's needs.",
      photo: "/images/employees/placeholder-4.svg",
    },
  ],
} satisfies Store["team"];

const templateDcf = giantBennebroek.dcf as DcfSection;
const scrapedStoreContentBySlug = scrapedStoreContent as unknown as Record<
  string,
  ScrapedStoreContent
>;
const storeContentOverridesBySlug = storeContentOverrides as Record<
  string,
  ScrapedStoreContent
>;

// Deterministic per-store section availability. Mocks stores investing more or less in content:
// each store consistently has (or lacks) a section across builds. Bennebroek is authored and
// returned earlier in getStore(), so it always keeps everything.
// ponytail: probabilities are approximate over a finite store set, not exact quotas — fine for a mock.
function hashUnit(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return (h >>> 0) / 0xffffffff; // 0..1
}

// Stores forced to the bare minimum — every optional section off, regardless of the hash.
const MINIMAL_STORES = new Set(["giant-store-stevens"]);

function hasSection(
  slug: string,
  section: string,
  probability: number,
): boolean {
  if (MINIMAL_STORES.has(slug)) return false;
  return hashUnit(`${slug}:${section}`) < probability;
}

function formatList(items: string[]) {
  const uniqueItems = [...new Set(items)];
  if (uniqueItems.length === 0) return "quality bikes, gear and service";
  if (uniqueItems.length === 1) return uniqueItems[0];
  if (uniqueItems.length === 2)
    return `${uniqueItems[0]} and ${uniqueItems[1]}`;

  return `${uniqueItems.slice(0, -1).join(", ")}, and ${uniqueItems.at(-1)}`;
}

function buildIntro(listing: OfficialStoreDetail) {
  const focus = formatList(
    listing.tags.map((tag) => TAG_INTRO_TEXT[tag]).filter(Boolean),
  );

  return `Welcome to ${listing.name}, an official Giant Store dedicated to ${focus}. Where passion for cycling meets personalized service.`;
}

function getDcfTierTag(tags: readonly string[]): DcfTierTag | undefined {
  return DCF_TIER_TAGS.find((tag) => tags.includes(tag));
}

function buildDcfSection(tags: readonly string[]): DcfSection | undefined {
  const tierTag = getDcfTierTag(tags);
  if (!tierTag) return undefined;

  return {
    ...templateDcf,
    tier: {
      ...templateDcf.tier,
      ...DCF_TIER_COPY[tierTag],
    },
  };
}

function applyScrapedContent(
  store: Store,
  content: ScrapedStoreContent | undefined,
): Store {
  if (!content) return store;

  return {
    ...store,
    ...(content.hero ? { hero: { ...store.hero, ...content.hero } } : {}),
    ...(content.banner ? { banner: content.banner } : {}),
  };
}

export function getStore(slug: string | undefined): Store | undefined {
  if (!slug) return undefined;
  const authored = authoredStoresBySlug.get(slug);
  if (authored) return authored;

  // Synthesize any official Giant Store from real finder data, generated scrape data, and placeholders.
  // ponytail: deeper body sections stay placeholder content until a reliable scrape/curation pass exists.
  const listing = officialStoreDetailsBySlug.get(slug);
  if (!listing) return undefined; // partner or unknown slug → 404; partners link to their external site

  const tagFeatures = listing.tags
    .map((tag) => TAG_FEATURE[tag])
    .filter(Boolean) as Feature[];
  const scrapedContent = scrapedStoreContentBySlug[listing.slug];
  const overrideContent = storeContentOverridesBySlug[listing.slug];
  // Every Giant Store does these; test ride / DCF appear only when the store's tags claim them.
  // Descriptions (shown when a service is selected) are reused from the authored template by label.
  const serviceDescriptions = new Map(
    giantBennebroek.service.services.map((s) => [s.label, s.description]),
  );
  const withDescription = (icon: string, label: string): Service => ({
    icon,
    label,
    description: serviceDescriptions.get(label),
  });
  const services: Service[] = [
    withDescription("tune", "Bike repair"),
    withDescription("tune", "Bike rental"),
    withDescription("tune", "Bike customization"),
    ...(listing.tags.includes("E-bike Testcenter")
      ? [withDescription("test-ride", "Test ride")]
      : []),
    ...(listing.tags.some((t) => t.startsWith("DCF"))
      ? [withDescription("dcf", "Dynamic Cycling Fit")]
      : []),
  ];

  const synthesized: Store = {
    ...giantBennebroek,
    id: listing.slug,
    slug: listing.slug,
    name: listing.name,
    intro: hasSection(listing.slug, "intro", 0.7)
      ? buildIntro(listing)
      : undefined,
    hero: { ...giantBennebroek.hero, label: "Official Giant store" },
    contact: {
      ...giantBennebroek.contact,
      // Directions.tsx splits address on ' - ', so keep the "<street> - <city>" format.
      address: `${listing.street} - ${listing.city}`,
      phone: listing.phone,
      email: listing.email ?? giantBennebroek.contact.email,
    },
    features: tagFeatures.length
      ? tagFeatures
      : [
          { icon: "tune", label: "Repairs and servicing" },
          { icon: "check", label: "New bike pick-up" },
        ],
    service: { ...giantBennebroek.service, services },
    banner: undefined,
    about: {
      ...giantBennebroek.about,
      title: listing.name,
      stats: hasSection(listing.slug, "storestats", 0.3)
        ? giantBennebroek.about.stats
        : undefined,
      gallery: MINIMAL_STORES.has(listing.slug)
        ? undefined
        : giantBennebroek.about.gallery,
    },
    team: hasSection(listing.slug, "team", 0.8) ? PLACEHOLDER_TEAM : undefined,
    articles: hasSection(listing.slug, "news", 0.25)
      ? giantBennebroek.articles
      : undefined,
    dcf: buildDcfSection(listing.tags),
    directions: {
      ...giantBennebroek.directions,
      map: {
        ...giantBennebroek.directions.map,
        lat: listing.lat,
        lng: listing.lng,
      },
    },
  };

  return applyScrapedContent(
    applyScrapedContent(synthesized, scrapedContent),
    overrideContent,
  );
}
