'use client'

import { FILTER_CHIPS } from './filters'

type FilterChipsProps = {
  active: Set<string>
  onToggle: (label: string) => void
}

export default function FilterChips({ active, onToggle }: FilterChipsProps) {
  return (
    <div className="flex flex-col gap-s">
      <p className="text-body-m text-base-text-heading">I’m looking for</p>
      {/* Mobile scrolls the row horizontally (Figma 1246:927); md+ wraps. */}
      <div className="-mx-sm flex gap-xs overflow-x-auto px-sm scrollbar-none md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {FILTER_CHIPS.map((label) => {
          const selected = label === 'All' ? active.size === 0 : active.has(label)

          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(label)}
              className={`h-[34px] shrink-0 whitespace-nowrap rounded-full px-sm font-action text-action-s uppercase transition-colors ${
                selected
                  ? 'bg-action-surface text-action-text-on-dark'
                  : 'border-2 border-action-border-subtle text-action-text-subtle hover:border-action-border hover:text-action-text'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
