// Inline SVG icon registry. currentColor, 24x24 viewBox, stroke-based.
// Add new icons by adding a key to PATHS — keep the design system's line style.
// ponytail: one registry file beats 20 one-icon files; agents extend PATHS.

export type IconName =
  | 'service' | 'test-ride' | 'dcf' | 'coffee' | 'parking'
  | 'tune' | 'check' | 'arrow-right' | 'arrow-up-right' | 'chevron-down'
  | 'clock' | 'map-pin' | 'phone' | 'mail' | 'plus' | 'minus' | 'close'
  | 'search' | 'locate' | 'store'

// Each value is the inner markup of a 24x24 <svg>. Stroke uses currentColor.
const PATHS: Record<IconName, React.ReactNode> = {
  'service': <path d="M14.7 6.3a4 4 0 0 1-5 5l-7 7 2 2 7-7a4 4 0 0 0 5-5l-2 2-2-.5-.5-2 2.5-1.5Z" />,
  'test-ride': <><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M5.5 17.5 10 7h4l3 7m-9 3.5h7" /></>,
  'dcf': <><path d="M12 3v4m0 10v4m9-9h-4M7 12H3" /><circle cx="12" cy="12" r="4" /></>,
  'coffee': <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a2 2 0 0 1 0 4h-2M7 3v2m4-2v2" />,
  'parking': <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 17V8h3.5a2.5 2.5 0 0 1 0 5H9" /></>,
  'tune': <path d="M4 8h10M18 8h2M4 16h2M10 16h10M14 5v6M6 13v6" />,
  'check': <path d="m5 12 5 5 9-11" />,
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  'arrow-up-right': <path d="M7 17 17 7m0 0H8m9 0v9" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'clock': <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  'map-pin': <><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  'phone': <path d="M6 3h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />,
  'mail': <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  'plus': <path d="M12 5v14M5 12h14" />,
  'minus': <path d="M5 12h14" />,
  'close': <path d="m6 6 12 12M18 6 6 18" />,
  'search': <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  'locate': <><circle cx="12" cy="12" r="3" /><path d="M12 3v3m0 12v3M3 12h3m12 0h3" /></>,
  'store': <><path d="M5 10h14l-1-5H6l-1 5Z" /><path d="M6 10v9h12v-9M9 19v-5h6v5" /></>,
}

export function Icon({
  name,
  size = 24,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  )
}
