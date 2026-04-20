import React from "react";
import "./SalesPopup.scss";

function SalesPopup({ visible, onDismiss, config }) {
  if (!config) return null;

  return (
    <div className={"sales-popup" + (visible ? " active" : "")}>
      <div className="popup-content">
        <div className="popup-header">
          <p className="popup-brand">{config.brand}</p>
          <h2 className="popup-title">{config.title}</h2>
          <p className="popup-subtitle">{config.subtitle}</p>
        </div>

        <div className="popup-products">
          {config.products?.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-img" />
                ) : (
                  <div className="product-placeholder" style={{ background: product.background }}>
                    <div className="product-icon">{product.emoji}</div>
                  </div>
                )}
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{product.price}</p>
              <button type="button" className="product-btn">
                Dodaj do koszyka
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="popup-dismiss" onClick={onDismiss}>
          Odrzuć
        </button>
      </div>
    </div>
  );
}

export default SalesPopup;
