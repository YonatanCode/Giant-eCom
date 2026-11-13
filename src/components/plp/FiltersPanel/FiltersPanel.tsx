"use client";

import "./FiltersPanel.css";

import { useMemo } from "react";
import type { Category } from "../../../data/categories";
import { getColorOptions } from "../../../lib/color-buckets";
import AvailabilityFilter from "../AvailabilityFilter/AvailabilityFilter";
import {
  CheckboxFilter,
  ColorFilter,
  FilterGroup,
  SizeChips,
} from "../FilterGroup/FilterGroup";
import PriceRangeFilter from "../PriceRangeFilter/PriceRangeFilter";
import { COLOR_PREFIX, SIZE_PREFIX } from "../filter-config";
import type { FiltersState } from "../filters";

/**
 * Giant lists its groups in its own order, but the prototype's panel leads with Best For and
 * Availability, then Price and Size, with Sale and Colour between them and the technical
 * groups. Everything else this category offers follows in Giant's order.
 */
const LEADING_GROUPS = ["bestfor", "sale"];

interface FiltersPanelProps {
  category: Category;
  filters: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
  priceBounds: { min: number; max: number };
  /** How many products each option would leave; 0 greys it out. See getOptionCounts. */
  optionCounts: Record<string, number>;
  isDrawerMode: boolean;
  isVisible: boolean;
  onDrawerClose: () => void;
  onDrawerApply: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
  groupsRef: React.RefObject<HTMLDivElement | null>;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function FiltersPanel({
  category,
  filters,
  onChange,
  priceBounds,
  optionCounts,
  isDrawerMode,
  isVisible,
  onDrawerClose,
  onDrawerApply,
  panelRef,
  groupsRef,
  closeButtonRef,
}: FiltersPanelProps) {
  const setChecked = (id: string, checked: boolean) =>
    onChange({ checked: { ...filters.checked, [id]: checked } });

  // A ticked option stays clickable even at zero, or there would be no way to untick it.
  const isDisabled = (id: string) =>
    optionCounts[id] === 0 && !filters.checked[id];

  const colorOptions = useMemo(
    () =>
      getColorOptions(category.products).map((bucket) => ({
        id: `${COLOR_PREFIX}${bucket.id}`,
        label: bucket.label,
        hex: bucket.hex,
        count: bucket.count,
      })),
    [category.products],
  );

  const sizeOptions = useMemo(
    () =>
      category.sizes.map((size) => ({
        id: `${SIZE_PREFIX}${size}`,
        label: size,
      })),
    [category.sizes],
  );

  const findGroups = (ids: string[]) =>
    ids
      .map((id) => category.filterGroups.find((group) => group.id === id))
      .filter((group) => group !== undefined);
  const bestFor = findGroups(["bestfor"]);
  const sale = findGroups(["sale"]);
  const trailing = category.filterGroups.filter(
    (group) => !LEADING_GROUPS.includes(group.id),
  );

  const renderGroup = (
    group: Category["filterGroups"][number],
    defaultOpen = false,
  ) => (
    <FilterGroup title={group.label} key={group.id} defaultOpen={defaultOpen}>
      {group.options.map((option) => (
        <CheckboxFilter
          key={option.id}
          option={option}
          checked={Boolean(filters.checked[option.id])}
          disabled={isDisabled(option.id)}
          onChange={(checked) => setChecked(option.id, checked)}
        />
      ))}
    </FilterGroup>
  );

  return (
    <aside
      className={`filters-panel${isDrawerMode && isVisible ? " filters-panel--drawer-open" : ""}`}
      id="filters-panel"
      ref={panelRef}
      aria-label="Product filters"
      aria-hidden={!isVisible}
      inert={!isVisible}
      role={isDrawerMode ? "dialog" : undefined}
      aria-modal={isDrawerMode ? true : undefined}
      aria-labelledby={isDrawerMode ? "filters-drawer-title" : undefined}
    >
      <div className="filters-panel__drawer-header">
        <h2
          className="filters-panel__drawer-title text-heading-m"
          id="filters-drawer-title"
        >
          Filters
        </h2>
        <button
          className="filters-panel__drawer-close"
          type="button"
          aria-label="Close filters"
          ref={closeButtonRef}
          onClick={onDrawerClose}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="filters-panel__groups" ref={groupsRef}>
        {bestFor.map((group) => renderGroup(group, true))}

        <AvailabilityFilter
          near={filters.near}
          // A newly set place or store switches "Available on location" on; nudging the radius
          // keeps the same label, so it never overrides an unticked box.
          onNearChange={(near) =>
            onChange({
              near,
              nearOnly: near.label && near.label !== filters.near.label ? true : filters.nearOnly,
            })
          }
          isNearOnly={filters.nearOnly}
          onNearOnlyChange={(nearOnly) => onChange({ nearOnly })}
          checked={filters.checked}
          onCheckedChange={setChecked}
          isDisabled={isDisabled}
        />

        <FilterGroup title="Price range">
          <PriceRangeFilter
            bounds={priceBounds}
            priceMin={filters.priceMin}
            priceMax={filters.priceMax}
            onChange={(next) => onChange(next)}
          />
        </FilterGroup>

        {sizeOptions.length > 0 && (
          <FilterGroup title="Size" modifier="filter-group--size">
            <SizeChips
              options={sizeOptions}
              checked={filters.checked}
              isDisabled={isDisabled}
              onChange={setChecked}
            />
          </FilterGroup>
        )}

        {sale.map((group) => renderGroup(group))}

        {colorOptions.length > 0 && (
          <FilterGroup title="Color" bodyModifier="filter-group__body--color">
            {colorOptions.map((option) => (
              <ColorFilter
                key={option.id}
                // The count follows the other filters, so a swatch shows what it would leave.
                option={{
                  ...option,
                  count: optionCounts[option.id] ?? option.count,
                }}
                checked={Boolean(filters.checked[option.id])}
                disabled={isDisabled(option.id)}
                onChange={(checked) => setChecked(option.id, checked)}
              />
            ))}
          </FilterGroup>
        )}

        {trailing.map((group) => renderGroup(group))}
      </div>

      <div className="filters-panel__drawer-footer">
        <button
          className="filters-panel__apply text-action-l"
          type="button"
          onClick={onDrawerApply}
        >
          Apply
        </button>
      </div>
    </aside>
  );
}
