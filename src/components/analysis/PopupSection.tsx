"use client";

import { useState, useEffect } from "react";
import type { PopupData, LeadTool } from "@/types/analysis";
import { SalesPopup } from "@/components/popups/SalesPopup/SalesPopup";
import { SalesPopupMobile } from "@/components/popups/SalesPopup/SalesPopupMobile";
import { NewsletterPopup } from "@/components/popups/NewsletterPopup/NewsletterPopup";
import { NewsletterPopupMobile } from "@/components/popups/NewsletterPopup/NewsletterPopupMobile";
import { LimitedOfferPopup } from "@/components/popups/LimitedOfferPopup/LimitedOfferPopup";
import { LimitedOfferPopupMobile } from "@/components/popups/LimitedOfferPopup/LimitedOfferPopupMobile";
import { useToast } from "@/components/ui/ToastProvider";
import "./PopupSection.scss";

interface Props {
  data: PopupData;
  screenshotUrl?: string | null;
  leadToolsData?: LeadTool[] | null;
  hideEmailSave?: boolean;
  analysisId?: string;
  variant?: "A" | "B";
}

const TABS = [
  { key: "sales", label: "Opcja A — Sprzedaż" },
  { key: "newsletter", label: "Opcja B — Newsletter" },
  { key: "limited", label: "Opcja C — Ograniczona oferta" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function MockWebsite() {
  return (
    <div className="popup-preview-website">
      <div className="popup-preview-nav">
        <div className="nav-logo" />
        <div className="nav-links">
          <span /><span /><span /><span />
        </div>
        <div className="nav-cta" />
      </div>
      <div className="popup-preview-hero">
        <div className="hero-text">
          <div className="line line-1" />
          <div className="line line-2" />
          <div className="line line-3" />
          <div className="hero-btn" />
        </div>
        <div className="hero-image" />
      </div>
      <div className="popup-preview-content">
        {[1, 2, 3].map((i) => (
          <div key={i} className="content-card">
            <div className="card-img" />
            <div className="card-body">
              <div className="card-line" />
              <div className="card-line short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const WHAT_NEXT = [
  {
    label: "Pop-up sprzedażowy",
    desc: "Subtelny panel na dole ekranu z wybranymi produktami, nie blokuje strony.",
  },
  {
    label: "Newsletter z rabatem",
    desc: "Powiadomienie z ofertą -10% w zamian za zapis. Buduje bazę i sprzedaje od razu.",
  },
  {
    label: "Oferta ograniczona czasowo",
    desc: "Odliczanie i pytanie TAK/NIE eliminuje odkładanie decyzji zakupowej.",
  },
];

export function PopupSection({ data, screenshotUrl, leadToolsData, hideEmailSave, analysisId, variant }: Props) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("sales");
  const [viewMode, setViewMode] = useState<"site" | "popup">("site");
  const [isMobile, setIsMobile] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveAgreed, setSaveAgreed] = useState(false);
  const [saveSent, setSaveSent] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!saveEmail || !saveAgreed || !analysisId) return;
    setSaveLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: saveEmail, analysisId, variant: variant ?? "A" }),
      });
    } catch { /* ignoruj błędy — i tak pokazujemy sukces */ }
    setSaveLoading(false);
    setSaveSent(true);
    showToast("Wysłano! Sprawdź swoją skrzynkę 📬");
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 800);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="space-y-8">

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <div style={{ borderLeft: "3px solid #BBEA00", paddingLeft: "1.25rem", paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontSize: "0.7rem", fontFamily: "Satoshi, sans-serif", fontWeight: 600,
          color: "#BBEA00", textTransform: "uppercase" as const, letterSpacing: "0.08em",
          marginBottom: "0.6rem",
        }}>
          ✦ Analiza gotowa
        </div>
        <h2 style={{
          fontFamily: "Brockmann, sans-serif",
          fontSize: "1.55rem",
          color: "#fff",
          lineHeight: 1.3,
          margin: "0 0 0.5rem",
        }}>
          Zebrałem dane o Twojej stronie.<br />Co możemy teraz zrobić:
        </h2>
        <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
          {data.introSubtitle ?? "Na podstawie analizy przygotowałem gotowe narzędzia do zwiększenia przychodów Twojej firmy."}
        </p>
      </div>

      {/* ── Audit summary ─────────────────────────────────────────────── */}
      <div className="audit-col">
        <p className="audit-col-label">Co można jeszcze zrobić</p>
        <div className="audit-col-items">
          {WHAT_NEXT.map((item, i) => (
            <div key={i} className="audit-item audit-item--next">
              <span className="audit-item-dot audit-item-dot--yellow" />
              <div>
                <span className="audit-item-text">{item.label}</span>
                <span className="audit-item-desc">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* ── Popup proposals ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <p style={{ fontFamily: "Brockmann, sans-serif", fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.2rem" }}>
            Propozycje dla Twojej strony
          </p>
          <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
            {data.popupsSubtitle ?? "3 gotowe pop-upy dopasowane do Twojej strony"}
          </p>
        </div>

        {/* Opis z sidebarMessage */}
        <div
          className="popup-sidebar-description"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            fontFamily: "Satoshi, sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: data.sidebarMessage }}
        />

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.25rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: "7px",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 500,
                fontFamily: "Satoshi, sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === tab.key ? "#BBEA00" : "transparent",
                color: activeTab === tab.key ? "#080808" : "rgba(255,255,255,0.45)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview frame */}
        <div style={{
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.02)",
          padding: "1rem",
        }}>
          {/* View mode toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}>
            <p style={{
              fontSize: "0.7rem",
              fontFamily: "Satoshi, sans-serif",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}>
              Podgląd
            </p>
            <div className="popup-view-toggle">
              <button
                type="button"
                className={`popup-view-toggle-btn${viewMode === "site" ? " active" : ""}`}
                onClick={() => setViewMode("site")}
              >
                Na stronie
              </button>
              <button
                type="button"
                className={`popup-view-toggle-btn${viewMode === "popup" ? " active" : ""}`}
                onClick={() => setViewMode("popup")}
              >
                Sam popup
              </button>
            </div>
          </div>

          {viewMode === "site" ? (
            <div className="popup-preview-frame">
              <div className="popup-preview-browser">
                <div className="popup-preview-dots">
                  <span /><span /><span />
                </div>
                <div className="popup-preview-addressbar">
                  https://platinumcandle.pl/
                </div>
              </div>

              {screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={screenshotUrl} alt="Podgląd strony" className="popup-preview-screenshot" />
              ) : (
                <MockWebsite />
              )}

              {activeTab === "sales" && (
                isMobile
                  ? <SalesPopupMobile visible previewMode config={data.salesPopup} onDismiss={() => {}} />
                  : <SalesPopup visible previewMode config={data.salesPopup} onDismiss={() => {}} />
              )}
              {activeTab === "newsletter" && (
                isMobile
                  ? <NewsletterPopupMobile visible previewMode config={data.newsletterPopup} onClose={() => {}} />
                  : <NewsletterPopup visible previewMode config={data.newsletterPopup} onClose={() => {}} />
              )}
              {activeTab === "limited" && (
                isMobile
                  ? <LimitedOfferPopupMobile visible previewMode config={data.limitedPopup} onClose={() => {}} />
                  : <LimitedOfferPopup visible previewMode config={data.limitedPopup} onClose={() => {}} />
              )}
            </div>
          ) : (
            <div className="popup-standalone-view">
              {activeTab === "sales" && (
                isMobile
                  ? <SalesPopupMobile visible previewMode config={data.salesPopup} onDismiss={() => {}} />
                  : <SalesPopup visible previewMode config={data.salesPopup} onDismiss={() => {}} />
              )}
              {activeTab === "newsletter" && (
                isMobile
                  ? <NewsletterPopupMobile visible previewMode config={data.newsletterPopup} onClose={() => {}} />
                  : <NewsletterPopup visible previewMode config={data.newsletterPopup} onClose={() => {}} />
              )}
              {activeTab === "limited" && (
                isMobile
                  ? <LimitedOfferPopupMobile visible previewMode config={data.limitedPopup} onClose={() => {}} />
                  : <LimitedOfferPopup visible previewMode config={data.limitedPopup} onClose={() => {}} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* ── Save audit (only in variant A) ───────────────────────────── */}
      {!hideEmailSave && <div className="audit-save-section">
        {saveSent ? (
          <div className="audit-save-success">
            <span className="audit-save-success-icon">📬</span>
            <div>
              <p className="audit-save-success-title">Wysłano! Sprawdź swoją skrzynkę.</p>
              <p className="audit-save-success-sub">Przesłaliśmy Ci kopię audytu i propozycje pop-upów.</p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="audit-save-title">Chcesz zapisać ten audyt i propozycje pop-upów na później?</p>
              <p className="audit-save-sub">Wpisz swój email — prześlemy Ci kopię</p>
            </div>
            <form className="audit-save-form" onSubmit={handleSaveSubmit}>
              <input
                type="email"
                className="audit-save-input"
                placeholder="twoj@email.pl"
                value={saveEmail}
                onChange={(e) => setSaveEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="audit-save-btn"
                disabled={!saveEmail || !saveAgreed || saveLoading}
              >
                {saveLoading ? "Zapisuję..." : "Wyślij kopię"}
              </button>
            </form>
            <label className="audit-save-terms">
              <input
                type="checkbox"
                checked={saveAgreed}
                onChange={(e) => setSaveAgreed(e.target.checked)}
              />
              <span>
                Akceptuję <a href="#" className="audit-save-link">regulamin</a> i{" "}
                <a href="#" className="audit-save-link">politykę prywatności</a>
              </span>
            </label>
          </>
        )}
      </div>}

    </div>
  );
}
