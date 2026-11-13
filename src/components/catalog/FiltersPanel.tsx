import { Icon } from '../store/icons'
import DistanceSlider from './DistanceSlider'
import PriceRange from './PriceRange'

// Filter sidebar — design ported verbatim from the PLP prototype, wired to this
// project's design tokens & text-styles (see the .catalog-filters block in globals.css).
// Collapsible groups use native <details>; checkboxes/chips/swatches/toggle/tooltips are
// pure CSS. The two sliders (distance, price) are small client islands.
// ponytail: filters are visual-only — selecting them doesn't yet filter the grid.

const SIZES = ['XS', 'S', 'M', 'ML', 'L', 'XL']

const BEST_FOR = [
  { label: 'XC racing', tip: 'For cross-country racers chasing low weight, fast acceleration, and efficient power transfer.' },
  { label: 'Fast climbs', tip: 'For riders who want a featherweight feel, quick response, and confidence on steep ascents.' },
  { label: 'Daily trails', tip: 'For everyday trail rides where balanced comfort, control, and all-round versatility matter most.' },
  { label: 'Custom bike builds', tip: 'For riders starting with a premium platform they can tailor with their preferred fit and components.' },
]
const SALE = ['On sale', 'New arrivals', 'Best sellers']
const FRAME = ['ALUXX aluminum', 'Advanced composite', 'Advanced SL composite']
const BRAKE = ['Hydraulic disc', 'Mechanical disc', 'Race-spec braking']
const SEATPOST = ['Dropper seatpost', 'Standard seatpost', 'Integrated seat mast']
const COLORS = [
  { name: 'Black', hex: '#000000', count: 42 },
  { name: 'White', hex: '#ffffff', count: 38 },
  { name: 'Red', hex: '#c83317', count: 24 },
  { name: 'Blue', hex: '#0050fc', count: 42 },
  { name: 'Green', hex: '#00a316', count: 12 },
  { name: 'Yellow', hex: '#e0b400', count: 8 },
  { name: 'Orange', hex: '#ec6046', count: 15 },
  { name: 'Grey', hex: '#58626e', count: 31 },
]

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="4.75" r="1" fill="currentColor" />
    <path d="M8 7.1V11.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
)

// A plain checkbox row, optionally with an info tooltip button.
function CheckboxRow({ label, tip }: { label: string; tip?: string }) {
  return (
    <label className={`filter-checkbox${tip ? ' filter-checkbox--with-info' : ''}`}>
      <span className="compare-toggle__box">
        <input type="checkbox" />
        <span className="checkbox-ui" aria-hidden="true" />
      </span>
      <span className="filter-checkbox__label">{label}</span>
      {tip && (
        <button className="filter-checkbox__info-btn" type="button" aria-label={`More info about ${label}`}>
          <InfoIcon />
          <span className="compare-tooltip" role="tooltip">{tip}</span>
        </button>
      )}
    </label>
  )
}

// A collapsible filter group. `open` sets the initial expanded state.
function Group({ title, open = false, bodyClassName = '', children }: {
  title: string
  open?: boolean
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <details className="filter-group" open={open}>
      <summary className="filter-group__header filter-group__header--compact">
        <h2 className="filter-group__title">{title}</h2>
        <span className="filter-group__symbol" aria-hidden="true" />
      </summary>
      <div className={`filter-group__body${bodyClassName ? ` ${bodyClassName}` : ''}`}>
        <div className="filter-group__body-inner">{children}</div>
      </div>
    </details>
  )
}

export default function FiltersPanel({ storeName }: { storeName?: string }) {
  return (
    <aside aria-label="Product filters" className="filters-panel catalog-filters">
      <div className="filters-panel__groups">
        {/* Available near me — always-open group with a toggle that reveals location + distance */}
        <section className="filter-group filter-group--availability">
          <label className="filter-group__header filter-group__header--compact filter-group__header--toggle" htmlFor="availability-toggle">
            <h2 className="filter-group__title">Available near me</h2>
            <span className="switch-field filter-group__switch-field">
              <input id="availability-toggle" type="checkbox" defaultChecked />
              <span className="switch-ui" aria-hidden="true">
                <span className="switch-ui__thumb" />
              </span>
            </span>
          </label>
          <div className="filter-group__body">
            <div className="filter-group__body-inner">
              <div className="availability-details">
                <div className="location-field-wrap">
                  <label className="location-field">
                    <span className="sr-only">Enter location</span>
                    <input type="text" defaultValue={storeName ?? ''} placeholder="Enter location" />
                    <span className="location-field__actions" aria-hidden="true">
                      <span className="location-field__icon">
                        <Icon name="locate" size={16} />
                      </span>
                    </span>
                  </label>
                </div>
                {!storeName && (
                  <p className="availability-helper">Enter ZIP code or city to see nearby availability.</p>
                )}
                <DistanceSlider />
              </div>
            </div>
          </div>
        </section>

        <Group title="Size" open>
          <p className="size-filter__help">
            <span>What is my size?</span>
            <span className="size-filter__help-icon" aria-hidden="true"><InfoIcon /></span>
          </p>
          <div className="size-filter__chip-grid" role="group" aria-label="Size options">
            {SIZES.map((s) => (
              <label key={s} className="size-chip">
                <input className="size-chip__input" type="checkbox" />
                <span className="size-chip__label">{s}</span>
              </label>
            ))}
          </div>
        </Group>

        <Group title="Best for">
          {BEST_FOR.map((b) => <CheckboxRow key={b.label} label={b.label} tip={b.tip} />)}
        </Group>

        <Group title="Sale">
          {SALE.map((label) => <CheckboxRow key={label} label={label} />)}
        </Group>

        <Group title="Price range">
          <PriceRange />
        </Group>

        <Group title="Color" bodyClassName="filter-group__body--color">
          {COLORS.map((c) => (
            <label key={c.name} className="filter-color-option">
              <input className="filter-color-option__input" type="checkbox" />
              <span className="filter-color-option__swatch" style={{ ['--filter-color-a' as string]: c.hex }} aria-hidden="true" />
              <span className="filter-color-option__text">
                <span className="filter-color-option__name">{c.name}</span>
                <span className="filter-color-option__count">({c.count})</span>
              </span>
            </label>
          ))}
        </Group>

        <Group title="Frame material">
          {FRAME.map((label) => <CheckboxRow key={label} label={label} />)}
        </Group>

        <Group title="Brake type">
          {BRAKE.map((label) => <CheckboxRow key={label} label={label} />)}
        </Group>

        <Group title="Seatpost type">
          {SEATPOST.map((label) => <CheckboxRow key={label} label={label} />)}
        </Group>
      </div>
    </aside>
  )
}
