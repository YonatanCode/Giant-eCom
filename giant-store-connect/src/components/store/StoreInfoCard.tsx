import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import Button from './Button'
import { Icon, type IconName } from './icons'

export type StoreInfoCardBadgeVariant = 'giant' | 'store'
type StoreInfoCardBadgeSize = 'default' | 'compact'
type StoreInfoCardHeaderAlign = 'center' | 'start'
type StoreInfoCardFeatureVariant = 'checklist' | 'pills'
type StoreInfoCardFeaturePosition = 'afterRows' | 'beforeRows'

const BADGE_SIZE: Record<StoreInfoCardBadgeSize, { frame: string; logo: string; storeIcon: number }> = {
  default: { frame: 'h-l w-l', logo: 'h-[22px] w-[17px]', storeIcon: 22 },
  compact: { frame: 'h-8 w-8', logo: 'h-[18px] w-[14px]', storeIcon: 18 },
}

const HEADER_ALIGN: Record<StoreInfoCardHeaderAlign, string> = {
  center: 'items-center',
  start: 'items-start',
}

export type StoreInfoCardRow = {
  icon: Extract<IconName, 'clock' | 'map-pin' | 'phone' | 'mail'>
  text: string
  href?: string
  showStatus?: boolean
  showChevron?: boolean
  expanded?: boolean
  details?: ReactNode
  onToggle?: MouseEventHandler<HTMLButtonElement>
  label?: string
}

export type StoreInfoCardFeature = {
  label: string
}

export type StoreInfoCardAction = {
  label: string
  href: string
  presentation?: 'button' | 'link'
  variant?: 'primary' | 'secondary' | 'secondaryStrong'
  size?: 32 | 40 | 48 | '40ActionS'
  external?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

type StoreInfoCardProps = {
  as?: 'article' | 'div'
  label: string
  name: string
  description?: string
  labelClassName?: string
  titleLevel?: 1 | 2 | 3
  titleClassName?: string
  badgeVariant?: StoreInfoCardBadgeVariant
  badgeSize?: StoreInfoCardBadgeSize
  headerAlign?: StoreInfoCardHeaderAlign
  rows: StoreInfoCardRow[]
  features?: StoreInfoCardFeature[]
  featureVariant?: StoreInfoCardFeatureVariant
  featurePosition?: StoreInfoCardFeaturePosition
  actions?: StoreInfoCardAction[]
  rightMeta?: ReactNode
  className?: string
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

export default function StoreInfoCard({
  as = 'div',
  label,
  name,
  description,
  labelClassName,
  titleLevel = 1,
  titleClassName,
  badgeVariant = 'giant',
  badgeSize = 'default',
  headerAlign = 'center',
  rows,
  features = [],
  featureVariant = 'checklist',
  featurePosition = 'afterRows',
  actions = [],
  rightMeta,
  className,
  ...containerProps
}: StoreInfoCardProps) {
  const Component = as
  const featureList =
    features.length > 0 ? (
      featureVariant === 'pills' ? (
        <FeaturePills features={features} />
      ) : (
        <></>
        // <FeatureChecklist features={features} />
      )
    ) : null

  return (
    <Component
      {...containerProps}
      className={`flex flex-col gap-sm rounded-[8px] bg-base-surface p-m text-base-text ${className ?? ''}`}
    >
      <div className="flex flex-col gap-xs">
        <div className={`flex ${HEADER_ALIGN[headerAlign]} gap-s`}>
          <StoreTypeBadge variant={badgeVariant} size={badgeSize} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className={`font-body text-body-s ${labelClassName ?? 'text-base-text-emphasis'}`}>{label}</p>
            <Title level={titleLevel} className={titleClassName}>
              {name}
            </Title>
          </div>
          {rightMeta ? <div className="shrink-0">{rightMeta}</div> : null}
        </div>

        {description ? <p className="text-body-m text-base-text">{description}</p> : null}
      </div>

      {featurePosition === 'beforeRows' ? featureList : null}

      <dl className="flex flex-col gap-xxs text-body-m">
        {rows.map((row) => (
          <InfoRow key={`${row.icon}-${row.text}`} row={row} />
        ))}
      </dl>

      {featurePosition === 'afterRows' ? featureList : null}

      {actions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-s">
          {actions.map((action) =>
            action.presentation === 'link' ? (
              <ActionLink key={`${action.href}-${action.label}`} action={action} />
            ) : (
              <Button
                key={`${action.href}-${action.label}`}
                href={action.href}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noreferrer' : undefined}
                variant={action.variant}
                size={action.size ?? 40}
                className={`uppercase ${action.className ?? ''}`}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ),
          )}
        </div>
      ) : null}
    </Component>
  )
}

export function WeeklyOpeningHours({ openingHours }: { openingHours: { day: string; hours: string }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-sm gap-y-xxs rounded-[4px] bg-base-surface-subtle p-s text-body-s">
      {openingHours.map((row) => (
        <div key={row.day} className="contents">
          <dt className="text-base-text-muted">{row.day}</dt>
          <dd className="text-right text-base-text-heading">{row.hours}</dd>
        </div>
      ))}
    </dl>
  )
}

function ActionLink({ action }: { action: StoreInfoCardAction }) {
  return (
    <a
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noreferrer' : undefined}
      className={`inline-flex h-7 items-center gap-xxs py-xxs font-nav text-[14px] font-semibold leading-5 text-base-text-heading transition-colors hover:text-action-text-hover ${action.className ?? ''}`}
      onClick={action.onClick}
    >
      {action.label}
      <Icon name="arrow-right" size={16} className="shrink-0" />
    </a>
  )
}

// function FeatureChecklist({ features }: { features: StoreInfoCardFeature[] }) {
//   return (
//     <ul className="grid grid-cols-2 gap-x-xs gap-y-xxs rounded-[4px] bg-base-surface-subtle p-s text-body-m">
//       {features.map((feature) => (
//         <li key={feature.label}>
//           <span className="flex items-center gap-xs">
//             <Icon name="check" size={16} className="shrink-0 text-action-text" />
//             <span>{feature.label}</span>
//           </span>
//         </li>
//       ))}
//     </ul>
//   )
// }

function FeaturePills({ features }: { features: StoreInfoCardFeature[] }) {
  return (
    <ul className="flex flex-wrap gap-xxs">
      {features.map((feature) => (
        <li key={feature.label}>
          <span className="inline-flex min-h-[26px] items-center rounded-[4px] border border-base-border bg-base-surface px-xs pb-[5px] pt-[3px] text-body-s text-base-text">
            {feature.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

function StoreTypeBadge({
  variant,
  size,
}: {
  variant: StoreInfoCardBadgeVariant
  size: StoreInfoCardBadgeSize
}) {
  const badgeSize = BADGE_SIZE[size]

  if (variant === 'store') {
    return (
      <span className={`flex ${badgeSize.frame} mt-1 shrink-0 items-center justify-center rounded-full bg-base-text-heading`}>
        <Icon name="store" size={badgeSize.storeIcon} className="text-base-icon-on-dark" />
      </span>
    )
  }

  return (
    <span className={`flex ${badgeSize.frame} mt-1 shrink-0 items-center justify-center rounded-full bg-action-surface`}>
      <img src="/images/giant-logo-mark.svg" alt="" className={`${badgeSize.logo} translate-y-[2px]`} />
    </span>
  )
}

function InfoRow({ row }: { row: StoreInfoCardRow }) {
  const content = (
    <>
      <Icon name={row.icon} size={16} className="mt-xxxs shrink-0 text-base-icon" />
      {row.showStatus ? (
        <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-feedback-icon-success" aria-hidden="true" />
      ) : null}
      <span>{row.text}</span>
      {row.showChevron ? (
        <Icon
          name="chevron-down"
          size={16}
          className={`mt-xxxs shrink-0 text-base-icon transition-transform ${row.expanded ? 'rotate-180' : ''}`}
        />
      ) : null}
    </>
  )

  return (
    <div className="flex items-start gap-xs">
      <dt className="sr-only">{row.label ?? row.icon}</dt>
      <dd className="min-w-0 flex-1">
        {row.onToggle ? (
          <>
            <button
              type="button"
              className="flex w-full min-w-0 items-start gap-xs text-left transition-colors hover:text-action-text-hover"
              aria-expanded={row.expanded}
              onClick={row.onToggle}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {content}
            </button>
            {row.expanded && row.details ? <div className="mt-xs">{row.details}</div> : null}
          </>
        ) : row.href ? (
          <a href={row.href} className="flex min-w-0 items-start gap-xs underline underline-offset-2 hover:text-action-text-hover">
            {content}
          </a>
        ) : (
          <span className="flex min-w-0 items-start gap-xs">{content}</span>
        )}
      </dd>
    </div>
  )
}

function Title({
  level,
  className,
  children,
}: {
  level: 1 | 2 | 3
  className?: string
  children: ReactNode
}) {
  const cls = className ?? 'text-heading-l text-base-text-heading'

  if (level === 1) return <h1 className={cls}>{children}</h1>
  if (level === 3) return <h3 className={cls}>{children}</h3>
  return <h2 className={cls}>{children}</h2>
}
