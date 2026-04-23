"use client";

import React from "react";
import "./NewsletterPopup.scss";
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

export function NewsletterPopup({ visible, previewMode = false, onClose, onSubmit, config }: Props) {
  // 1. Wyciągamy dane z configu i nadajemy domyślne puste tablice dla bezpieczeństwa TS
  const { 
    title, 
    subtitle, 
    products = [], 
    services = [], 
    note 
  } = config;

  console.log("NewsletterPopup - Products:", products);
  console.log("NewsletterPopup - Services:", services);

  const rootClass = [
    "newsletter-popup",
    visible ? "active" : "",
    previewMode ? "preview-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // 2. Flagi opieramy już na bezpiecznych zmiennych
  const hasProducts = products.length > 0;
  const hasServices = services.length > 0;

  return (
    <div className={rootClass}>
      <div className="newsletter-content">
        <button
          type="button"
          className="newsletter-close"
          aria-label="Zamknij"
          onClick={onClose}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="newsletter-header">
          <h2 className="newsletter-title">{title}</h2>
          <p className="newsletter-subtitle">{subtitle}</p>
        </div>

        {/* Wariant: Wyświetlanie Produktów */}
        {hasProducts && (
          <div className="bestseller-list">
            {products.map((item) => (
              <div key={item.id} className="bestseller-item">
                <div className="bestseller-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="bestseller-img" />
                  ) : (
                    <div className="bestseller-placeholder" style={{ background: item.background }} />
                  )}
                </div>
                <div className="bestseller-info">
                  <div className="bestseller-main">
                    <p className="bestseller-name">{item.name}</p>
                    <p className="bestseller-price">
                      {(() => {
                        const num = parsePrice(item.price);
                        return num ? (
                          <>
                            <span>{formatPrice(num)}</span>
                            <span>{formatPrice(num * 0.9)}</span>
                          </>
                        ) : (
                          <span>{item.price}</span>
                        );
                      })()}
                    </p>
                  </div>
                  <button type="button" className="bestseller-cta">
                    Dodaj do koszyka
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wariant: Wyświetlanie Usług (Services) */}
        {hasServices && (
          <div className="service-list">
            {services.map((service, index) => (
              <div key={index} className="service-item">
                {/* Numeracja (index + 1, żeby nie było od zera) */}
                <div className="service-number">{index + 1}</div>
                
                <div className="service-info">
                  <h4 className="service-title">{service.title}</h4>
                  <p className="service-description">{service.shortDescription}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form className="newsletter-form" onSubmit={onSubmit}>
          <p className="newsletter-discount-note">
            Zapisz się do newslettera i zyskaj <strong>-10%</strong> {hasServices && !hasProducts ? 'na pierwszą usługę' : 'na produkty'}
          </p>
          <div className="form-field">
            <input
              name="email"
              type="email"
              className="newsletter-input"
              placeholder="Wpisz swój e-mail"
              required
            />
          </div>
          <button type="submit" className="newsletter-submit">
            Zapisz się do newslettera
          </button>
        </form>

        {note && (
          <p
            className="newsletter-note"
            dangerouslySetInnerHTML={{ __html: note }}
          />
        )}
      </div>
    </div>
  );
}