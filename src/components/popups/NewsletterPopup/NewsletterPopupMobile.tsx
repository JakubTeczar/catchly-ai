"use client";

import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import stylów Swipera
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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

  // Logika podziału na produkty i usługi
  const productsToShow = (config.products || []).slice(0, 3);
  const servicesToShow = (config.services || []).slice(0, 3);
  
  const hasProducts = productsToShow.length > 0;
  const hasServices = servicesToShow.length > 0 && !hasProducts;

  function handleClose() {
    setDismissed(true);
    onClose();
    reappearTimer.current = setTimeout(() => setDismissed(false), 3000);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showToast("Zapisano! Sprawdź swoją skrzynkę");
    onSubmit?.(e);
  }

  const rootClass = ["newsletter-popup-mobile", isVisible ? "active" : "", previewMode ? "preview-mode" : ""].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="nlm-card">
        <button type="button" className="nlm-close" onClick={handleClose}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="nlm-header">
          <h2 className="nlm-title">{config.title}</h2>
          <p className="nlm-subtitle">{config.subtitle}</p>
        </div>

        {/* --- SEKCJA PRODUKTÓW (SWIPER) --- */}
        {hasProducts && (
          <div className="nlm-slider-container">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                  nextEl: '.nlm-next',
                  prevEl: '.nlm-prev',
              }}
              className="nlm-swiper"
            >
              {productsToShow.map((product, idx) => {
                const priceNum = parsePrice(product.price);
                return (
                  <SwiperSlide key={idx}>
                    <div className="nlm-product-slide">
                      <div className="nlm-image-wrapper">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="nlm-placeholder" style={{ background: product.background }} />
                        )}
                      </div>
                      <p className="nlm-product-name">
                         {product.name.length > 40 
                            ? product.name.substring(0, 40) + "..." 
                            : product.name}
                      </p>
                      <div className="nlm-pricing">
                        {priceNum ? (
                          <>
                            <span className="nlm-old-price">{formatPrice(priceNum)}</span>
                            <span className="nlm-new-price">{formatPrice(priceNum * 0.9)}</span>
                          </>
                        ) : (
                          <span className="nlm-new-price">{product.price}</span>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <button className="nlm-nav-btn nlm-prev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="nlm-nav-btn nlm-next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}

        {/* --- SEKCJA USŁUG (SWIPER) --- */}
        {hasServices && (
          <div className="nlm-slider-container nlm-service-slider-container">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                  nextEl: '.nlm-service-next',
                  prevEl: '.nlm-service-prev',
              }}
              className="nlm-swiper"
            >
              {servicesToShow.map((service, idx) => (
                <SwiperSlide key={idx}>
                  <div className="nlm-service-slide">
                    {/* <div className="nlm-service-number-large">{idx + 1}</div> */}
                    <h4 className="nlm-service-title">{service.title}</h4>
                    <p className="nlm-service-description">{service.shortDescription}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Osobne klasy dla strzałek usług, by nie konflikotwały z produktami */}
            <button className="nlm-nav-btn nlm-service-prev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="nlm-nav-btn nlm-service-next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}

        {/* --- STOPKA I FORMULARZ --- */}
        <div className="nlm-footer">
          <p 
            className="nlm-form-note" 
            dangerouslySetInnerHTML={{ __html: config.note || "Zapisz się na nasz newsletter, aby być na bieżąco." }} 
          />
          <form className="nlm-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Wpisz swój email" required className="nlm-input" />
            <button type="submit" className="nlm-submit">Zapisz się</button>
          </form>
        </div>
      </div>
    </div>
  );
}