"use client";

import React from "react";
import "./SalesPopup.scss";
import type { SalesPopupConfig } from "@/types/analysis";

interface Props {
  visible: boolean;
  previewMode?: boolean;
  onDismiss: () => void;
  config: SalesPopupConfig;
}

export function SalesPopup({ visible, previewMode = false, onDismiss, config }: Props) {
  const rootClass = [
    "sales-popup",
    visible ? "active" : "",
    previewMode ? "preview-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="sp-card">

        <div className="sp-header">
          <p className="sp-brand">{config.brand}</p>
          <h2 className="sp-title">{config.title}</h2>
          <p className="sp-subtitle">{config.subtitle}</p>
        </div>

        <div className="sp-products">
          {config.products.map((product) => (
            <div key={product.id} className="sp-product">
              <div className="sp-product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="sp-product-img" />
                ) : (
                  <div className="sp-product-placeholder" style={{ background: product.background }}>
                    <span className="sp-product-emoji">{product.emoji}</span>
                  </div>
                )}
              </div>
              <h3 className="sp-product-name">{product.name}</h3>
              <p className="sp-product-price">{product.price} zł</p>
              <button type="button" className="sp-product-btn">
                Dodaj do koszyka
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="sp-dismiss" onClick={onDismiss}>
          Odrzuć
        </button>

      </div>
    </div>
  );
}
