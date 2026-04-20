import React from "react";
import "./NewsletterPopup.scss";

function parsePrice(priceStr) {
  const num = parseFloat(String(priceStr).replace(/[^\d.,]/g, '').replace(',', '.'));
  return isNaN(num) ? null : num;
}

function formatPrice(num) {
  return num.toFixed(2).replace('.', ',') + ' zł';
}

function NewsletterPopup({ visible, onClose, onSubmit, config }) {
  if (!config) return null;

  return (
    <div className={"newsletter-popup" + (visible ? " active" : "")}>
      <div className="newsletter-content">
        <button
          type="button"
          className="newsletter-close"
          aria-label="Zamknij"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="newsletter-header">
          <h2 className="newsletter-title">{config.title}</h2>
          <p className="newsletter-subtitle">{config.subtitle}</p>
        </div>

        <div className="bestseller-list">
          {config.products?.map((item) => (
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
                          <div>{formatPrice(num * 0.9)}</div>
                        </>
                      ) : <span>{item.price}</span>;
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

        <form className="newsletter-form" onSubmit={onSubmit}>
          <p className="newsletter-discount-note">Zapisz się do newslettera i zyskaj <strong>-10%</strong> na produkty</p>
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

        {config.note && (
        <p 
          className="newsletter-note" 
          dangerouslySetInnerHTML={{ __html: config.note }} 
        />
        )}
      </div>
    </div>
  );
}

export default NewsletterPopup;


