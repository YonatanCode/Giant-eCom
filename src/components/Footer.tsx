import BrandSwitch from './BrandSwitch'
import BrandLogo from './BrandLogo'

// Footer (Figma 822:6666) - non store-specific doormat links + base bar.
// World/social icons aren't in the shared registry, so they're inlined here.

type LinkGroup = { heading: string; links: string[] }

// The editor mockup edits one store's content, so it needs a slug; /catalog has none -> template store.
const EDITOR_LINK = 'Store page editor'
const DEFAULT_EDITOR_SLUG = 'giant-store-bennebroek'

const LINK_GROUPS: LinkGroup[] = [
  {
    heading: 'Support',
    links: [
      'Customer support',
      'Warranty Policy',
      'Online Return policy',
      'Financing',
      'Home Delivery Service',
      'E-Bike Tampering Policy',
      'Recall Information',
      'Contact Us',
    ],
  },
  {
    heading: 'Resources',
    links: [
      'Find A Giant Retailer',
      'Bike Archive',
      'Bike Registration',
      'Product Manuals',
      'Composite Confidence',
      'Tire Pressure Calculator',
      'RideLink App',
    ],
  },
  {
    heading: 'Features',
    links: ['News', 'Events', 'Technology', 'Teams & Riders','Store page editor'],
  },
  {
    heading: 'Company',
    links: [
      'About Giant',
      'Advocacy',
      'Privacy Policy',
      'About Cookies',
      'Accessibility',
      'Careers at Giant',
      'Terms & Conditions',
      'Transparency in Coverage Rule',
    ],
  },
]

// 24x24 inline SVGs, currentColor - matches the design system's icon sizing.
function WorldIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.5 7.2a3 3 0 0 0-2.1-2.12C19.5 4.55 12 4.55 12 4.55s-7.5 0-9.4.53A3 3 0 0 0 .5 7.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.12c1.9.53 9.4.53 9.4.53s7.5 0 9.4-.53a3 3 0 0 0 2.1-2.12A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-4.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function StravaIcon({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M10.3 2 4.5 13.4h3.46L10.3 8.6l2.32 4.8h3.45L10.3 2Zm3.9 11.4-1.7 3.4-1.74-3.4H8.06L12.5 22l4.43-8.6h-2.73Z" />
    </svg>
  )
}

const SOCIALS = [
  { name: 'Facebook', Icon: FacebookIcon, href: '#' },
  { name: 'YouTube', Icon: YoutubeIcon, href: '#' },
  { name: 'Instagram', Icon: InstagramIcon, href: '#' },
  { name: 'Strava', Icon: StravaIcon, href: '#' },
] as const

export default function Footer({ storeSlug }: { storeSlug?: string } = {}) {
  const editorHref = `/store/${storeSlug ?? DEFAULT_EDITOR_SLUG}/editor`
  return (
    <footer className="dark bg-base-surface-brand">
      <div className="container mx-auto flex w-full !max-w-page flex-col gap-xl px-(--layout-page-padding) pt-l">
        <nav
          aria-label="Footer"
          className="grid grid-cols-4 gap-xxs max-md:grid-cols-2 max-md:gap-ml max-[480px]:grid-cols-1"
        >
          {LINK_GROUPS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-sm">
              <h2 className="font-heading text-heading-m text-base-text-heading">{group.heading}</h2>
              <ul className="flex flex-col gap-xs">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href={link === EDITOR_LINK ? editorHref : '#'}
                      className="block font-body text-body-m text-action-text-link hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex h-[111px] items-end justify-between gap-m overflow-hidden max-md:h-auto max-md:flex-col max-md:items-start max-md:overflow-visible">
          <BrandLogo variant="footer" />

          <div className="flex w-[453px] flex-col items-end gap-m pb-m max-md:w-full max-md:items-start">
            <div className="flex items-center gap-m">
              <span className="flex items-center gap-xxs text-base-icon">
                <WorldIcon className="size-6" />
                <span className="font-nav text-[14px] leading-5">USA</span>
              </span>
              <span aria-hidden="true" className="h-4 w-0.5 bg-base-icon" />
              <ul className="flex items-center gap-sm">
                {SOCIALS.map(({ name: label, Icon, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="block text-base-icon hover:text-base-text-heading"
                    >
                      <Icon className="size-6" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-s max-[480px]:flex-col max-[480px]:items-start">
              <p className="font-body text-[12px] leading-4 tracking-[0.02em] text-base-text">
                Copyright © 2026 Giant. All rights reserved.
              </p>
              <BrandSwitch variant="footer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
