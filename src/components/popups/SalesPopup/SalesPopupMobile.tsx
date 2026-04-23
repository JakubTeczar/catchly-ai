"use client";

import React, { useState, useEffect, useRef } from "react";
import "./SalesPopupMobile.scss";
import { useToast } from "@/components/ui/ToastProvider";
import type { SalesPopupConfig } from "@/types/analysis";

interface Props {
  visible: boolean;
  previewMode?: boolean;
  onDismiss: () => void;
  config: SalesPopupConfig;
}

export function SalesPopupMobile({ visible, previewMode = false, onDismiss, config }: Props) {
  const { showToast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const reappearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = visible && !dismissed;

  // Logika sprawdzania czy wyświetlamy produkty czy usługi
  const hasProducts = config.products && config.products.length > 0;
  const hasServices = config.services && config.services.length > 0;

  function handleClose() {
    setDismissed(true);
    onDismiss();
    reappearTimer.current = setTimeout(() => setDismissed(false), 3000);
  }

  function handleAdd() {
    showToast("Dodałeś produkt do koszyka");
  }

  function handleServiceClick() {
    showToast("Przekierowuję do usługi...");
  }

  useEffect(() => {
    return () => {
      if (reappearTimer.current) clearTimeout(reappearTimer.current);
    };
  }, []);

  const rootClass = [
    "sales-popup-mobile",
    isVisible ? "active" : "",
    previewMode ? "preview-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="spm-card">

        <div className="spm-header">
          <div className="spm-header-text">
            {config.brand && <p className="spm-brand">{config.brand}</p>}
            <h2 className="spm-title">{config.title}</h2>
          </div>
          <button type="button" className="spm-close" onClick={handleClose} aria-label="Zamknij">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* --- SEKCJA PRODUKTÓW --- */}
        {hasProducts && (
          <div className="spm-products">
            {config.products.map((product) => (
              <div key={product.id} className="spm-product">
                <div className="spm-product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="spm-product-img" />
                  ) : (
                    <div className="spm-product-placeholder" style={{ background: product.background }}>
                      <span className="spm-product-emoji">{product.emoji}</span>
                    </div>
                  )}
                </div>
                <div className="spm-product-body">
                  <h3 className="spm-product-name">{product.name}</h3>
                  <div className="spm-product-footer">
                    <div className="spm-product-pricing">
                      {product.oldPrice && <span className="spm-price-old">{product.oldPrice}</span>}
                      <span className="spm-price-new">{product.price}</span>
                    </div>
                  </div>
                  <button type="button" className="spm-product-btn" onClick={handleAdd}>Dodaj</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- SEKCJA USŁUG --- */}
        {!hasProducts && hasServices && (
          <div className="spm-services">
            {config.services!.map((service, idx) => (
              <div key={idx} className="spm-service">
                <div className="spm-service-content">
                  <h3 className="spm-service-title">{service.title}</h3>
                  <p className="spm-service-desc">{service.shortDescription}</p>
                </div>
                {/* Używamy klasy przycisku z produktów, by zachować spójność wizualną */}
                <button type="button" className="spm-product-btn" onClick={handleServiceClick}>
                  Sprawdź
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}