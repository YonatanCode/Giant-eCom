// Service booking option chip. Mirrors the Figma Feature/Large variant used in node 615:4862.
export default function ServiceChip({
  label,
  selected = false,
  onClick,
}: {
  label: string
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-[4px] border px-s font-nav text-[14px] leading-5 transition-colors ${
        selected
          ? 'border-base-surface-on-light bg-base-surface-on-light text-base-text-on-dark'
          : 'border-base-border bg-base-surface text-base-text hover:bg-base-surface-subtle'
      }`}
    >
      {label}
    </button>
  )
}
