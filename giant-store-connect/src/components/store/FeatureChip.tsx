import { Icon, type IconName } from './icons'

// Icon + label pill (store features / specialties).
export default function FeatureChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-xs rounded-full border border-base-border px-s py-xxs font-action text-action-m text-base-text">
      <Icon name={icon as IconName} size={16} className="shrink-0 text-base-text-emphasis" />
      {label}
    </span>
  )
}
