"use client";

import "../../Checkbox/Checkbox.css";
import "../../CompareTooltip/CompareTooltip.css";
import "./ProductCard.css";

import { useState } from "react";
import type {
  Product,
  ProductColor,
  ProductPrice,
} from "../../../data/categories";
import {
  getPriceDisclosures,
  optimizeProductImageSrc,
  PRICE_DISCLAIMER,
} from "../../../lib/format";
import { productHref } from "../../../lib/store-link";
import type { NearFilter } from "../filters";
import StockRows from "./StockRows";

function Swatch({
  color,
  isSelected,
  onSelect,
}: {
  color: ProductColor;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [colorA, colorB] = color.colors;
  return (
    <button
      type="button"
      className={`swatch${isSelected ? " is-selected" : ""}`}
      aria-label={color.label}
      aria-pressed={isSelected}
      style={
        {
          "--swatch-color-a": colorA,
          ...(colorB ? { "--swatch-color-b": colorB } : {}),
        } as React.CSSProperties
      }
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect();
        event.currentTarget.blur();
      }}
    />
  );
}

function PriceLine({ price }: { price: ProductPrice }) {
  if (price.mode === "discount") {
    return (
      <div className="price-line price-line--discounted">
        <span className="price-current price-current--sale text-price-l">
          {price.amount}
        </span>
        <span className="price-old text-price-l">{price.oldAmount}</span>
      </div>
    );
  }

  if (price.mode === "from") {
    return (
      <div className="price-line price-line--from">
        <span className="price-current text-price-l">From {price.amount}</span>
      </div>
    );
  }

  if (price.mode === "from-discount") {
    return (
      <div className="price-line price-line--from-discount">
        <span className="price-prefix text-price-l">From</span>
        <span className="price-current price-current--sale text-price-l">
          {price.amount}
        </span>
        <span className="price-old text-price-l">{price.oldAmount}</span>
      </div>
    );
  }

  return (
    <div className="price-line">
      <span className="price-current text-price-l">{price.amount}</span>
    </div>
  );
}

function SecondaryCopy({ price }: { price: ProductPrice }) {
  return (
    <>
      <p className="finance-copy text-body-s">{PRICE_DISCLAIMER}</p>
      {getPriceDisclosures(price).map((disclosure) => (
        <p key={disclosure.label} className="disclaimer text-body-s">
          {disclosure.label}:{" "}
          {disclosure.struck ? (
            <span className="price-old">{disclosure.amount}</span>
          ) : (
            disclosure.amount
          )}{" "}
          -{disclosure.percentage}%
        </p>
      ))}
    </>
  );
}

interface ProductCardProps {
  product: Product;
  /** The category's own path, which the product page nests under. */
  categoryHref: string;
  near: NearFilter;
  /** The size the shopper is filtering on, when it is one for this bike. */
  size?: string | null;
  isCompareSelected: boolean;
  isCompareDisabled: boolean;
  onCompareChange: (selected: boolean) => void;
}

export default function ProductCard({
  product,
  categoryHref,
  near,
  size,
  isCompareSelected,
  isCompareDisabled,
  onCompareChange,
}: ProductCardProps) {
  const [selectedColorKey, setSelectedColorKey] = useState(
    product.colors[0].key,
  );
  const selectedColor =
    product.colors.find((color) => color.key === selectedColorKey) ??
    product.colors[0];
  // The picked colour, size and dealer ride along so the product page opens on both (see lib/store-link).
  const pickedStore = near.kind === "store" ? near.stores[0] : undefined;
  const href = productHref({
    categoryHref,
    productId: product.id,
    colorKey: selectedColor.key,
    size,
    storeId: pickedStore?.id,
  });
  const [mainImage, hoverImage] = selectedColor.images.map(
    optimizeProductImageSrc,
  );

  return (
    <article
      className={`product-card${hoverImage ? " has-hover-media" : ""}`}
      data-product-id={product.id}
      aria-label={`${product.title} product tile`}
    >
      <a
        className="product-card__link"
        href={href}
        aria-label={`Open ${product.title} product page`}
      />

      <div className="product-card__badges">
        {product.tag && (
          <div
            className={`card-tag text-action-s card-tag--${product.tag.type}`}
          >
            <span className="card-tag__label">{product.tag.label}</span>
          </div>
        )}
        {product.award && (
          <div className="award-badge-wrap">
            <img
              className="award-badge"
              src={product.award.src}
              alt={product.award.alt}
            />
          </div>
        )}
      </div>

      <div className="product-card__media">
        <div className="product-card__media-frame">
          <img
            className="product-card__image"
            src={mainImage}
            alt={`${product.title} in ${selectedColor.label}`}
          />
          {hoverImage && (
            <img
              className="product-card__hover-image"
              src={hoverImage}
              alt={`${product.title} alternate view in ${selectedColor.label}`}
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className="product-card__topline">
        <div className="selector-group" aria-label="Available colors">
          {product.colors.map((color) => (
            <Swatch
              key={color.key}
              color={color}
              isSelected={color.key === selectedColor.key}
              onSelect={() => setSelectedColorKey(color.key)}
            />
          ))}
        </div>
        {/* ponytail: tooltip placement is CSS-only — the prototype's viewport-edge nudging is dropped. */}
        <label
          className={`checkbox-wrapper${isCompareDisabled ? " is-disabled" : ""}`}
          aria-disabled={isCompareDisabled || undefined}
        >
          <span className="text-body-m">Compare</span>
          <span className="checkbox-wrapper__box">
            <input
              type="checkbox"
              name="compare"
              data-product-id={product.id}
              checked={isCompareSelected}
              disabled={isCompareDisabled}
              onChange={(event) => onCompareChange(event.target.checked)}
            />
            <span className="checkbox-ui" aria-hidden="true" />
            <span className="compare-tooltip text-body-s" role="tooltip">
              You can compare up to 3 products. Deselect one to add this item.
            </span>
          </span>
        </label>
      </div>

      <div className="product-card__copy">
        <a
          className="product-card__text-link"
          href={href}
          aria-label={`Read more about ${product.title}`}
        >
          <div className="title-group">
            <h2 className="product-title text-product-title-m">
              {product.title}
            </h2>
            <p className="product-description text-body-m">
              {product.description}
            </p>
          </div>
        </a>
        <div className="product-card__pricing">
          <PriceLine price={product.price} />
          <SecondaryCopy price={product.price} />
        </div>
        <StockRows product={product} near={near} />
      </div>
    </article>
  );
}
