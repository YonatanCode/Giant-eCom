import { Icon } from './icons'

const SIZE = {
  m: 'text-action-m',
  l: 'text-action-l',
} as const

const TONE = {
  link: 'text-action-text-link hover:text-action-text-hover',
  heading: 'text-base-text-heading hover:text-action-text-hover',
} as const

const GAP = {
  xxs: 'gap-xxs',
  xs: 'gap-xs',
} as const

// Text + arrow-right link.
export default function CtaLink({
  label,
  href = '#',
  size = 'm',
  tone = 'link',
  gap = 'xs',
  className,
}: {
  label: string
  href?: string
  size?: keyof typeof SIZE
  tone?: keyof typeof TONE
  gap?: keyof typeof GAP
  className?: string
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center ${GAP[gap]} ${SIZE[size]} font-action ${TONE[tone]} ${className ?? ''}`}
    >
      {label}
      <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
    </a>
  )
}
