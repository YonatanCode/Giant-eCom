// Button / button-link. Renders <a> when href is set, else <button>.

const SIZE = {
  32: 'h-8 px-m text-action-s',
  40: 'h-10 px-m text-action-m',
  '40ActionS': 'h-10 px-m text-action-s',
  48: 'h-12 px-ml text-action-l',
} as const

const VARIANT = {
  primary:
    'bg-action-surface text-action-text-on-dark hover:bg-action-surface-hover border border-action-border',
  secondary:
    'bg-transparent text-action-text hover:bg-base-surface-subtle border border-action-border',
  secondaryStrong:
    'bg-transparent text-action-text hover:bg-base-surface-subtle border-2 border-action-border',
} as const

const DISABLED =
  'cursor-not-allowed border-base-border bg-action-surface-disabled text-action-text-disabled-high-contrast hover:bg-action-surface-disabled'

type Props = {
  variant?: keyof typeof VARIANT
  size?: keyof typeof SIZE
  href?: string
  className?: string
  children: React.ReactNode
} & (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
)

export default function Button({
  variant = 'primary',
  size = 40,
  href,
  className,
  children,
  ...rest
}: Props) {
  const disabled = href ? false : (rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled === true
  const cls = `inline-flex items-center justify-center gap-xs rounded-full font-action whitespace-nowrap transition-colors ${SIZE[size]} ${disabled ? DISABLED : VARIANT[variant]} ${className ?? ''}`
  if (href) {
    return (
      <a href={href} className={cls} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }
  return (
    <button className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
