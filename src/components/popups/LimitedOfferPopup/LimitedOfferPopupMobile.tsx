"use client";

import React, { useEffect, useState, useRef } from "react";
import "./LimitedOfferPopupMobile.scss";
import { useToast } from "@/components/ui/ToastProvider";
import type { LimitedPopupConfig } from "@/types/analysis";

function useCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  return {
    hours: Math.floor(secondsLeft / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  };
}

interface Props {
  visible: boolean;
  previewMode?: boolean;
  onClose: () => void;
  config: LimitedPopupConfig;
}

export function LimitedOfferPopupMobile({ visible, previewMode = false, onClose, config }: Props) {
  const { showToast } = useToast();
  const { hours, minutes, seconds } = useCountdown((config.durationHours || 2) * 3600);
  const [dismissed, setDismissed] = useState(false);
  const reappearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = visible && !dismissed;

  // Logika sprawdzania czy wyświetlamy produkty czy usługi
  const hasProduct = Boolean(config.productImage || config.productName || config.newPrice);
  const hasServices = Boolean(config.services && config.services.length > 0);

  function handleNo() {
    setDismissed(true);
    onClose();
    reappearTimer.current = setTimeout(() => setDismissed(false), 3000);
  }

  function handleYes() {
    showToast("Świetnie! Przekierujemy Cię dalej");
    setDismissed(true);
    reappearTimer.current = setTimeout(() => setDismissed(false), 3000);
  }

  useEffect(() => {
    return () => {
      if (reappearTimer.current) clearTimeout(reappearTimer.current);
    };
  }, []);

  const rootClass = [
    "limited-popup-mobile",
    isVisible ? "active" : "",
    previewMode ? "preview-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="lpm-overlay" />
      <div className="limited-popup-content">
        {config.brand && <p className="limited-brand">{config.brand}</p>}

        <h2 className="limited-title">{config.titleLine1}</h2>

        {/* --- SEKCJA PRODUKTU (E-COMMERCE) --- */}
        {hasProduct && (
          <div className="limited-product">
            {config.productImage && (
              <img src={config.productImage} alt={config.productName || "Produkt"} className="product-image" />
            )}
            {config.productName && <p className="product-name">{config.productName}</p>}
            {(config.oldPrice || config.newPrice) && (
              <div className="limited-pricing">
                {config.oldPrice && <span className="price-old">{config.oldPrice}</span>}
                {config.newPrice && <span className="price-new">{config.newPrice}</span>}
              </div>
            )}
          </div>
        )}

        {/* --- SEKCJA USŁUG (USŁUGOWE) --- */}
        {!hasProduct && hasServices && (
          <div className="limited-services-mobile">
            {config.services!.map((service, idx) => (
              <div key={idx} className="lsm-item">
                <div className="lsm-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="lsm-info">
                  <h4 className="lsm-title">{service.title}</h4>
                  {service.shortDescription && (
                    <p className="lsm-desc">{service.shortDescription}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- LICZNIK CZASU --- */}
        <div className="limited-countdown">
          <div className="time-box">
            <span className="time-value">{String(hours).padStart(2, "0")}</span>
            <span className="time-label">GODZIN</span>
          </div>
          <div className="time-box">
            <span className="time-value">{String(minutes).padStart(2, "0")}</span>
            <span className="time-label">MINUT</span>
          </div>
          <div className="time-box">
            <span className="time-value">{String(seconds).padStart(2, "0")}</span>
            <span className="time-label">SEKUND</span>
          </div>
        </div>

        <div className="limited-actions">
          <button type="button" className="limited-cta cta-no" onClick={handleNo}>Nie</button>
          <button type="button" className="limited-cta cta-yes" onClick={handleYes}>
            {config.ctaLabel || "Tak"}
          </button>
        </div>
      </div>
    </div>
  );
}