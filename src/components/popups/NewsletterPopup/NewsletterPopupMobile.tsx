"use client";

import React, { useState, useEffect, useRef } from "react";
import "./NewsletterPopupMobile.scss";
import { useToast } from "@/components/ui/ToastProvider";
import type { NewsletterPopupConfig } from "@/types/analysis";

function parsePrice(priceStr: string): number | null {
  const num = parseFloat(String(priceStr).replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(num) ? null : num;
}

function formatPrice(num: number): string {
  return num.toFixed(2).replace(".", ",") + " zł";
}

interface Props {
  visible: boolean;
  previewMode?: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  config: NewsletterPopupConfig;
}

export function NewsletterPopupMobile({ visible, previewMode = false, onClose, onSubmit, config }: Props) {
  const { showToast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const reappearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = visible && !dismissed;

  function handleClose() {
    setDismissed(true);
    onClose();
    reappearTimer.current = setTimeout(() => setDismissed(false), 3000);
  }

  function handleAddToCart() {
    showToast("Dodałeś produkt");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showToast("Zapisano! Sprawdź swoją skrzynkę");
    onSubmit?.(e);
  }

  useEffect(() => {
    return () => {
      if (reappearTimer.current) clearTimeout(reappearTimer.current);
    };
  }, []);

  const rootClass = [
    "newsletter-popup-mobile",
    isVisible ? "active" : "",
    previewMode ? "preview-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const product = config.products[0];
  const priceNum = product ? parsePrice(product.price) : null;

  return (
    <div className={rootClass}>
      <div className="nlm-card">

        {/* Top row: tytuł + X */}
        <div className="nlm-top">
          <div className="nlm-top-text">
            <p className="nlm-title">{config.title}</p>
            <p className="nlm-subtitle">{config.subtitle}</p>
          </div>
          <button type="button" className="nlm-close" aria-label="Zamknij" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 1 produkt */}
        {product && (
          <div className="nlm-product">
            <div className="nlm-product-image">
              {product.image ? (
                <img src={product.image} alt={product.name} className="nlm-product-img" />
              ) : (
                <div className="nlm-product-placeholder" style={{ background: product.background }} />
              )}
            </div>
            <div className="nlm-product-body">
              <p className="nlm-product-name">{product.name}</p>
              <div className="nlm-product-footer">
                <div className="nlm-product-pricing">
                  {priceNum ? (
                    <>
                      <span className="nlm-price-old">{formatPrice(priceNum)}</span>
                      <span className="nlm-price-new">{formatPrice(priceNum * 0.9)}</span>
                    </>
                  ) : (
                    <span className="nlm-price-new">{product.price}</span>
                  )}
                </div>
                <button type="button" className="nlm-product-btn" onClick={handleAddToCart}>Do koszyka</button>
              </div>
            </div>
          </div>
        )}

        <div className="nlm-divider" />

        {/* Form */}
        <form className="nlm-form" onSubmit={handleSubmit}>
          <p className="nlm-form-note">
            Zapisz się i odbierz <strong>-10%</strong> na pierwsze zamówienie
          </p>
          <div className="nlm-form-row">
            <input
              name="email"
              type="email"
              className="nlm-input"
              placeholder="Twój e-mail"
              required
            />
            <button type="submit" className="nlm-submit">
              Zapisz się
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
