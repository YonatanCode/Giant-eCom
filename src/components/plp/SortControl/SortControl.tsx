'use client'

import './SortControl.css'

import { useEffect, useRef, useState } from 'react'
import { SORT_OPTIONS, type SortValue } from '../filter-config'

export default function SortControl({
  value,
  onChange,
}: {
  value: SortValue
  onChange: (value: SortValue) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const label = SORT_OPTIONS.find((option) => option.value === value)?.label ?? 'Featured'

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!controlRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="sort-control" id="sort-control" ref={controlRef}>
      <button
        className="sort-control__trigger text-action-m"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sort products"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="sort-control__label">Sort by:</span>
        <span className="sort-control__mobile-label">Sort</span>
        <span className="sort-control__value">{label}</span>
        <span className="sort-control__icon sort-control__icon--desktop" aria-hidden="true">
          <img className="sort-control__asset" src="/icons/chevron-down.svg" alt="" />
        </span>
        <span className="sort-control__icon sort-control__icon--mobile" aria-hidden="true">
          <img className="sort-control__asset sort-control__asset--mobile" src="/icons/sort-icon.svg" alt="" />
        </span>
      </button>
      <ul className="sort-dropdown" role="listbox" aria-label="Sort options" hidden={!isOpen}>
        {SORT_OPTIONS.map((option) => (
          <li
            key={option.value}
            className="sort-dropdown__item text-body-m"
            role="option"
            aria-selected={option.value === value}
            onClick={() => {
              onChange(option.value)
              setIsOpen(false)
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
