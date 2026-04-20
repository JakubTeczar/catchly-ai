"use client";

import BanditVisualization from "@/components/analysis/BanditVisualization";
import { ChatAnimation } from "./ChatAnimation";
import type { ChatMessage } from "./ChatAnimation";
import "./FeaturesSection.scss";

const WHATSAPP_MESSAGES: ChatMessage[] = [
  { sender: "bot",  text: "Masz dziś 3 propozycje na stronie. Chcesz aktywować ofertę tygodnia z rabatem -15%?" },
  { sender: "user", text: "Tak" },
  { sender: "bot",  text: "Gotowe! Pop-up z ofertą pojawi się przez 48h. Powiadomię Cię o wynikach 🎯" },
];

const RADAR_MESSAGES: ChatMessage[] = [
  { sender: "bot",  text: "🔍 Firma XYZ podniosła ceny o 15%. Chcesz dodać podobną promocję na ten weekend?" },
  { sender: "user", text: "Tak, świetny pomysł" },
  { sender: "bot",  text: "Promocja zaplanowana na piątek–niedziela. Powiadomię Cię o wynikach 📊" },
];

const AUTONOMY_STEPS = [
  {
    icon: "🧠",
    title: "AI analizuje",
    desc: "Agent zbiera dane o odwiedzających, zachowaniach użytkowników i ruchach konkurencji w czasie rzeczywistym — 24/7.",
  },
  {
    icon: "💡",
    title: "AI proponuje",
    desc: "Na podstawie analizy tworzy konkretne propozycje — pop-upy, rabaty, zmiany komunikatów dopasowane do Twojej strony.",
  },
  {
    icon: "✅",
    title: "Ty decydujesz",
    desc: "Otrzymujesz powiadomienie i jednym słowem zatwierdzasz: \"Tak\" lub \"Nie\". Finalna decyzja zawsze należy do Ciebie.",
  },
];

interface Props {
  /** When true: no top border, reduced outer padding — for use inside analysis page */
  compact?: boolean;
}

export function FeaturesSection({ compact }: Props) {
  return (
    <section className={compact ? "fs-section fs-section--compact" : "fs-section"}>
      <div className="fs-container">

        {/* Header */}
        <div className="fs-header">
          <h2 className="fs-title mt-4">Co wyróżnia Catchly</h2>
          <p className="fs-subtitle">
            Pełna automatyzacja konwersji, od analizy po optymalizację w czasie rzeczywistym
          </p>
        </div>

        {/* ── Feature 1: Samouczący się silnik ──────────────────────────── */}
        <div className="fs-row">
          <div className="fs-copy">
            <h3 className="fs-feature-title">Samouczący się silnik konwersji</h3>
            <p className="fs-feature-desc">
              Agent testuje kilka wersji pop-upów jednocześnie i uczy się z każdą wizytą.
              Sam, z czasem, kieruje coraz więcej ruchu do tej wersji, która faktycznie
              przynosi sprzedaż. Bez żadnej konfiguracji z Twojej strony.
            </p>
          </div>
          <div className="fs-visual bandit-visualization-wrapper">
            <div className="fs-visual-box">
              <BanditVisualization />
            </div>
          </div>
        </div>

        {/* ── Feature 2: WhatsApp ────────────────────────────────────────── */}
        <div className="fs-row fs-row--reverse">
          <div className="fs-visual">
            <div className="fs-visual-box" style={{ padding: 0, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/whatsapp.gif" alt="Zarządzanie przez WhatsApp" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
          <div className="fs-copy">
            <h3 className="fs-feature-title">Zarządzanie przez WhatsApp & Email</h3>
            <p className="fs-feature-desc">
              Zmienisz promocję w minutę jedną wiadomością. Napisz do agenta na WhatsAppie
              lub odpowiedz na email, a on zajmie się resztą. Zero paneli, zero logowania,
              zero stresu.
            </p>
          </div>
        </div>

        {/* ── Feature 3: Radar Konkurencji ──────────────────────────────── */}
        <div className="fs-row">
          <div className="fs-copy">
            <h3 className="fs-feature-title">Radar Konkurencji & Analityk w jednym</h3>
            <p className="fs-feature-desc">
              Catchly śledzi ruchy konkurencji 24/7 i proaktywnie powiadamia Cię,
              gdy warto reagować. Nie musisz sam monitorować rynku. Agent robi to
              za Ciebie i podpowiada konkretne kroki.
            </p>
          </div>
          <div className="fs-visual">
            <div className="fs-visual-box" style={{ padding: 0, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Radar Konkurencji.png" alt="Radar Konkurencji" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
