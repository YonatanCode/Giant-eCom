'use client'

import '../../Checkbox/Checkbox.css'
import '../../CompareTooltip/CompareTooltip.css'
import './FilterGroup.css'

import { useId, useState } from 'react'
import type { CheckboxOption, ColorOption } from '../filter-config'

/**
 * The filters panel scrolls and clips, so the info tooltip is `position: fixed` and gets its
 * coordinates from the icon's own rect. Placement only — CSS :hover/:focus-visible shows it.
 */
function positionTooltip(event: React.SyntheticEvent<HTMLButtonElement>) {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  button.style.setProperty('--tooltip-left', `${rect.left + rect.width / 2}px`)
  button.style.setProperty('--tooltip-top', `${rect.top - 8}px`)
}

export function FilterGroup({
  title,
  modifier,
  bodyModifier,
  defaultOpen = false,
  children,
}: {
  title: string
  modifier?: string
  bodyModifier?: string
  /** Groups start collapsed; pass true for one that should be open on load. */
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className={`filter-group${isOpen ? ' filter-group--open' : ''}${modifier ? ` ${modifier}` : ''}`}>
      <button
        className="filter-group__header"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <h2 className="filter-group__title text-heading-s">{title}</h2>
        <span className="filter-group__symbol" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={`filter-group__body${bodyModifier ? ` ${bodyModifier}` : ''}`}>
        <div className="filter-group__body-inner">{children}</div>
      </div>
    </section>
  )
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="4.75" r="1" fill="currentColor" />
      <path d="M8 7.1V11.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  )
}

export function CheckboxFilter({
  option,
  checked,
  disabled = false,
  onChange,
}: {
  option: CheckboxOption
  checked: boolean
  /** No product left for this option under the other groups' filters. */
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  const tooltipId = useId()

  return (
    <label
      className={`filter-checkbox${option.info ? ' filter-checkbox--with-info' : ''}${disabled ? ' filter-option--disabled' : ''}`}
    >
      <span className="checkbox-wrapper__box">
        <input
          type="checkbox"
          id={option.id}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="checkbox-ui" aria-hidden="true" />
      </span>
      <span className="filter-checkbox__label text-body-m">{option.label}</span>
      {option.info && (
        <button
          className="filter-checkbox__info-btn"
          type="button"
          aria-describedby={tooltipId}
          aria-label={`More info about ${option.label}`}
          // The button sits inside the label, so a click would otherwise tick the checkbox.
          onClick={(event) => event.preventDefault()}
          onMouseEnter={positionTooltip}
          onFocus={positionTooltip}
        >
          <InfoIcon />
          <span className="compare-tooltip text-body-s" id={tooltipId} role="tooltip">
            {option.info}
          </span>
        </button>
      )}
    </label>
  )
}

export function SizeChips({
  options,
  checked,
  isDisabled,
  onChange,
}: {
  options: CheckboxOption[]
  checked: Record<string, boolean>
  isDisabled: (id: string) => boolean
  onChange: (id: string, checked: boolean) => void
}) {
  return (
    <>
      <p className="size-filter__help text-body-m">
        <span>What is my size?</span>
        <span className="size-filter__help-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="4.75" r="1" fill="currentColor" />
            <path d="M8 7.1V11.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
          </svg>
        </span>
      </p>
      <div className="size-filter__chip-grid" role="group" aria-label="Size options">
        {options.map((option) => (
          <label
            className={`size-chip${isDisabled(option.id) ? ' filter-option--disabled' : ''}`}
            key={option.id}
          >
            <input
              className="size-chip__input"
              type="checkbox"
              id={option.id}
              checked={Boolean(checked[option.id])}
              disabled={isDisabled(option.id)}
              onChange={(event) => onChange(option.id, event.target.checked)}
            />
            <span className="size-chip__label text-action-m">{option.label}</span>
          </label>
        ))}
      </div>
    </>
  )
}

export function ColorFilter({
  option,
  checked,
  disabled = false,
  onChange,
}: {
  option: ColorOption
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={`filter-color-option${disabled ? ' filter-option--disabled' : ''}`}>
      <input
        className="filter-color-option__input"
        type="checkbox"
        id={option.id}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className="filter-color-option__swatch"
        style={{ '--filter-color-a': option.hex } as React.CSSProperties}
        aria-hidden="true"
      />
      <span className="filter-color-option__text">
        <span className="filter-color-option__name text-body-m">{option.label}</span>
        <span className="filter-color-option__count text-body-s">({option.count})</span>
      </span>
    </label>
  )
}
