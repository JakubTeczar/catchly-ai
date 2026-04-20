"use client";

import { SalesPopup } from "@/components/popups/SalesPopup/SalesPopup";
import { NewsletterPopup } from "@/components/popups/NewsletterPopup/NewsletterPopup";
import { LimitedOfferPopup } from "@/components/popups/LimitedOfferPopup/LimitedOfferPopup";
import type { PopupData } from "@/types/analysis";
import "@/components/analysis/PopupSection.scss";

interface Props {
  data: PopupData;
}

const SCALE = 0.58;

function ScaledPopup({
  children,
  estimatedHeight,
}: {
  children: React.ReactNode;
  estimatedHeight: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: estimatedHeight * SCALE,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          width: `${100 / SCALE}%`,
        }}
      >
        <div className="popup-standalone-view" style={{ borderRadius: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const ACCENT = "#BBEA00";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 7.5,
        fontWeight: 700,
        color: ACCENT,
        marginBottom: 4,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export function PopupVisualsClient({ data }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Label>OPCJA A — POP-UP SPRZEDAZOWY</Label>
      <ScaledPopup estimatedHeight={480}>
        <SalesPopup visible config={data.salesPopup} onDismiss={() => {}} />
      </ScaledPopup>

      <Label>OPCJA B — NEWSLETTER Z RABATEM</Label>
      <ScaledPopup estimatedHeight={520}>
        <NewsletterPopup visible config={data.newsletterPopup} onClose={() => {}} />
      </ScaledPopup>

      <Label>OPCJA C — OFERTA OGRANICZONA CZASOWO</Label>
      <ScaledPopup estimatedHeight={420}>
        <LimitedOfferPopup visible config={data.limitedPopup} onClose={() => {}} />
      </ScaledPopup>
    </div>
  );
}
