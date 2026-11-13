// Full-bleed colored band with either a full-width or page-width inner container.
// Page-width sections match the Directions wrapper used across the store page.

const BG = {
  surface: 'bg-base-surface',
  subtle: 'bg-base-surface-subtle',
  dark: 'dark bg-base-surface',
} as const

const CONTAINER = {
  full: 'w-full max-w-full px-(--layout-page-padding) py-xl',
  page: 'container mx-auto w-full !max-w-page px-(--layout-page-padding) py-xl',
} as const

export default function Section({
  bg = 'surface',
  container = 'page',
  id,
  className,
  innerClassName,
  children,
}: {
  bg?: keyof typeof BG
  container?: keyof typeof CONTAINER
  id?: string
  className?: string
  innerClassName?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`${BG[bg]} ${className ?? ''}`}>
      <div className={`${CONTAINER[container]} ${innerClassName ?? ''}`}>
        {children}
      </div>
    </section>
  )
}
