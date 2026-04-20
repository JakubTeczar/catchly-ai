"use client";

import React, { useEffect, useState } from "react";
import "./LimitedOfferPopup.scss";
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

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return { hours, minutes, seconds };
}

interface Props {
  visible: boolean;
  previewMode?: boolean;
  onClose: () => void;
  config: LimitedPopupConfig;
}

export function LimitedOfferPopup({ visible, previewMode = false, onClose, config }: Props) {
  const durationSeconds = (config.durationHours || 2) * 60 * 60;
  const { hours, minutes, seconds } = useCountdown(durationSeconds);

  const rootClass = [
    "limited-popup",
    visible ? "active" : "",
    previewMode ? "preview-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="limited-popup-content">
        {config.brand && <p className="limited-brand">{config.brand}</p>}

        <h2 className="limited-title">{config.titleLine1}</h2>

        {(config.productImage || config.productName || config.newPrice) && (
          <div className="limited-product">
            {config.productImage && (
              <img
                src={config.productImage}
                alt={config.productName || "Produkt"}
                className="product-image"
              />
            )}
            {config.productName && (
              <p className="product-name">{config.productName}</p>
            )}
            {(config.oldPrice || config.newPrice) && (
              <div className="limited-pricing">
                {config.oldPrice && <span className="price-old">{config.oldPrice}</span>}
                {config.newPrice && <span className="price-new">{config.newPrice}</span>}
              </div>
            )}
          </div>
        )}

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
          <button type="button" className="limited-cta cta-no" onClick={onClose}>
            Nie
          </button>
          <button type="button" className="limited-cta cta-yes" onClick={onClose}>
            Tak
          </button>
        </div>
      </div>
    </div>
  );
}
