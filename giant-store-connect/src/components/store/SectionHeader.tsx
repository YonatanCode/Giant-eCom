// Eyebrow (uppercase action) + heading, with an optional right-aligned description.

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}) {
  const centered = align === 'center'
  return (
    <div
      className={`flex flex-col gap-m md:flex-row md:items-end md:justify-between ${className ?? ''}`}
    >
      <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
        {eyebrow && (
          <p className="mb-xs text-action-s uppercase tracking-wide text-base-text-emphasis font-action">
            {eyebrow}
          </p>
        )}
        <h2 className="text-display-s uppercase text-base-text-heading">{title}</h2>
      </div>
      {description && (
        <p className="max-w-md text-body-l text-base-text-muted md:text-right">{description}</p>
      )}
    </div>
  )
}
