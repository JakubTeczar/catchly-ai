import React, { useEffect, useState } from "react";
import "./LimitedOfferPopup.scss";

function useCountdown(initialSeconds) {
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

function LimitedOfferPopup({ visible, onClose, config }) {
  if (!config) return null;

  const durationSeconds = (config.durationHours || 2) * 60 * 60;
  const { hours, minutes, seconds } = useCountdown(durationSeconds);

  const onSave = () =>{
    alert("Realizacja promocji ...")
  }

  return (
    <div className={"limited-popup" + (visible ? " active" : "")}>
      <div className="limited-popup-content">
        {/* <button
          type="button"
          className="limited-close"
          aria-label="Zamknij"
          onClick={onClose}
        >
          ×
        </button> */}

        {config.brand && <p className="popup-brand">{config.brand}</p>}

        <h2 className="limited-title">
          {config.titleLine1}
          <br />
          {/* {config.titleLine2} */}
        </h2>

        {/* Sekcja Produktu z Cenami */}
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

            {/* Renderowanie cen, jeśli zostały przekazane w config */}
            {(config.oldPrice || config.newPrice) && (
              <div className="limited-pricing">
                {config.oldPrice && (
                  <span className="price-old">{config.oldPrice}</span>
                )}
                {config.newPrice && (
                  <span className="price-new">{config.newPrice}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="limited-countdown">
          <div className="time-box">
            <span className="time-value">
              {String(hours).padStart(2, "0")}
            </span>
            <span className="time-label">GODZIN</span>
          </div>
          <div className="time-box">
            <span className="time-value">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="time-label">MINUT</span>
          </div>
          <div className="time-box">
            <span className="time-value">
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="time-label">SEKUND</span>
          </div>
        </div>

        <div className="limited-actions">
          <button 
            type="button" 
            className="limited-cta cta-no" 
            onClick={onClose}
          >
            Nie
          </button>
          <button 
            type="button" 
            className="limited-cta cta-yes"
            onClick={onClose}
          >
            Tak
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default LimitedOfferPopup;