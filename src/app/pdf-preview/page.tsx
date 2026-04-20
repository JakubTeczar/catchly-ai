import {
  MOCK_ANALYSIS_USLUGI,
  MOCK_POPUP_DATA_USLUGI,
} from "@/lib/mockData";
import { PopupVisualsClient } from "./PopupVisualsClient";
import { PopupSection } from "@/components/analysis/PopupSection";

// ─── Stałe ────────────────────────────────────────────────────────────────────

const C = {
  dark:   "#0a0a0a",
  accent: "#BBEA00",
  white:  "#FFFFFF",
  muted:  "#888888",
  border: "#e5e5e5",
  bg:     "#f7f7f7",
};

const DIFF = [
  {
    title: "Samouczący się silnik konwersji",
    desc: "To nie są zwykłe popupy. Catchly analizuje, w którym momencie użytkownik chce wyjść ze strony i w milisekundę dopasowuje komunikat (rabat, darmowa konsultacja, lead magnet), który go zatrzyma. Im więcej masz wizyt, tym mądrzejszy staje się Twój Agent.",
  },
  {
    title: "Zarządzanie przez WhatsApp i Email",
    desc: "Zapomnij o skomplikowanych panelach i logowaniu. Chcesz zmienić promocję? Napisz do swojego Agenta na WhatsAppie: \"Zmień rabat na 15% do końca weekendu\". Catchly zajmie się resztą w minutę.",
  },
  {
    title: "Radar Konkurencji i Analityk w jednym",
    desc: "Agent nie tylko pilnuje Twojej strony, ale też monitoruje ruchy konkurencji. Jeśli Twoi rywale odpalą nową promocję, dostaniesz powiadomienie z propozycją kontrreakcji.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    label: "AI analizuje",
    desc: "Catchly skanuje Twoją stronę, analizuje zachowanie użytkowników i wykrywa momenty, w których odwiedzający są bliscy rezygnacji.",
  },
  {
    step: "02",
    label: "AI proponuje",
    desc: "Na podstawie danych Agent przygotowuje gotowe warianty popupów dopasowane do Twojej oferty, stylu i grupy docelowej.",
  },
  {
    step: "03",
    label: "Ty decydujesz",
    desc: "Akceptujesz propozycje jednym kliknięciem. System przeprowadza testy A/B i zostawia tylko wersje, które przynoszą konwersje.",
  },
];

// ─── Logo SVG ─────────────────────────────────────────────────────────────────

function CatchlyLogo({ width = 66, color = "white" }: { width?: number; color?: string }) {
  const fill = color;
  const h = Math.round((width * 28) / 99);
  return (
    <svg width={width} height={h} viewBox="0 0 99 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0954 21.4839C4.12992 21.4839 0 16.9519 0 11.1865C0 5.39249 4.12992 0.889186 10.0954 0.889186C14.3687 0.889186 17.5808 3.15518 19.1009 6.53982L16.4336 7.974C15.4011 5.5359 13.1354 3.8149 10.0954 3.8149C5.82204 3.8149 3.06876 7.11349 3.06876 11.1865C3.06876 15.2596 5.85072 18.5582 10.0954 18.5582C13.2215 18.5582 15.5445 16.7224 16.5483 14.1409L19.1869 15.5464C17.7529 19.0745 14.4834 21.4839 10.0954 21.4839Z" fill={fill}/>
      <path d="M25.7266 21.5126C22.7726 21.5126 20.6216 19.6195 20.6216 16.9232C20.6216 14.3417 22.4284 12.4773 25.7553 12.2478L30.1147 11.961V11.7889C30.1147 10.3834 28.8241 8.77713 26.4723 8.77713C24.2066 8.77713 23.1454 10.24 22.7726 11.33L20.5069 10.1826C21.1665 8.34688 23.002 6.19562 26.501 6.19562C30.6882 6.19562 32.954 9.09265 32.954 11.9036V21.2257H30.1147V19.5334C29.3403 20.7094 27.6195 21.5126 25.7266 21.5126ZM23.4896 16.8659C23.4896 18.1853 24.5794 18.9884 26.0134 18.9884C28.6233 18.9884 30.172 17.2101 30.172 15.2883V14.3704L25.9561 14.6572C24.5507 14.7433 23.4896 15.4604 23.4896 16.8659Z" fill={fill}/>
      <path d="M37.3617 21.2257V8.97792H34.7232V6.45377H37.4478V2.63888H40.2297V6.45377H44.0442V8.97792H40.2297V18.5295H44.1015V21.2257H37.3617Z" fill={fill}/>
      <path d="M53.0322 21.4839C48.9023 21.4839 45.432 18.4435 45.432 13.8254C45.432 9.23607 48.8162 6.19562 53.0322 6.19562C56.8753 6.19562 58.9976 8.46161 59.8007 10.4981L57.3055 11.7889C56.7893 10.326 55.384 8.86318 53.0322 8.86318C50.2502 8.86318 48.3287 10.9571 48.3287 13.8254C48.3287 16.6364 50.2502 18.845 53.0322 18.845C55.2979 18.845 56.7893 17.4395 57.3055 15.9767L59.8007 17.2674C58.9976 19.2466 56.7606 21.4839 53.0322 21.4839Z" fill={fill}/>
      <path d="M62.268 21.2257V0H65.136V8.28951C65.9678 7.02744 67.4304 6.19562 69.438 6.19562C72.7076 6.19562 74.9446 8.63372 74.9446 11.8176V21.2257H72.0766V12.506C72.0766 10.2113 70.5566 8.89187 68.6063 8.89187C66.6274 8.89187 65.136 10.326 65.136 12.506V21.2257H62.268Z" fill={fill}/>
      <path d="M78.0869 21.2257V0H80.9548V21.2257H78.0869Z" fill={fill}/>
      <path d="M85.8878 27.7943L88.7558 21.111L82.5036 6.45377H85.7157L90.3619 17.7837L94.8073 6.45377H98.1055L89.1 27.7943H85.8878Z" fill={fill}/>
    </svg>
  );
}

// ─── Komponenty pomocnicze ─────────────────────────────────────────────────────

function PageHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: C.dark,
        padding: "11px 32px",
        marginBottom: 24,
        flexShrink: 0,
      }}
    >
      <CatchlyLogo width={52} />
      <span style={{ fontSize: 8, color: "#666" }}>{label}</span>
    </div>
  );
}

function PageFooter({ url, pageNum, total }: { url: string; pageNum: number; total: number }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 32,
        right: 32,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 7, color: "#aaa" }}>
        catchly.pl · {url} · {pageNum} / {total}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 8,
        color: C.muted,
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Dane ─────────────────────────────────────────────────────────────────────

const TOTAL_PAGES = 4;
const analysis = MOCK_ANALYSIS_USLUGI;
const popupData = MOCK_POPUP_DATA_USLUGI;
const generatedAt = "19.04.2026";
const domain = "esoy.pl";

// ─── Strona 1: Okładka ────────────────────────────────────────────────────────

function CoverPage() {
  return (
    <A4Page noPadding>
      <div
        style={{
          flex: 1,
          backgroundColor: C.dark,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CatchlyLogo width={99} />
        <div>
          <div style={{ fontSize: 8, color: C.accent, marginBottom: 12 }}>RAPORT AUDYTU AI</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.white,
              lineHeight: 1.3,
              marginBottom: 10,
            }}
          >
            Analiza {domain}
          </div>
          <div style={{ fontSize: 9, color: "#666" }}>Wygenerowano: {generatedAt}</div>
        </div>
        <div style={{ fontSize: 8, color: "#555" }}>
          catchly.pl · Przedsprzedaż, premiera 1 lipca 2026
        </div>
      </div>
    </A4Page>
  );
}

// ─── Strona 2: Identyfikacja wizualna ────────────────────────────────────────

function VisualIdentityPage() {
  const style = analysis.styleData!;
  // szerokość treści: 794 - 64 = 730px → wysokość 16:9 = 411px
  const screenshotHeight = Math.round((730 * 9) / 16);
  return (
    <A4Page>
      <PageHeader label="IDENTYFIKACJA WIZUALNA" />

      {analysis.screenshotUrl && (
        <div style={{ paddingInline: 32, marginBottom: 18 }}>
          <SectionLabel>ZRZUT EKRANU — STRONA GLOWNA</SectionLabel>
          <div
            style={{
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
              width: "100%",
              height: screenshotHeight,
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={analysis.screenshotUrl}
              alt={`Zrzut ekranu ${domain}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            />
          </div>
        </div>
      )}

      <div style={{ paddingInline: 32, marginBottom: 16 }}>
        <SectionLabel>KOLORY STRONY</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {style.colors.map((c, i) => (
            <div key={i} style={{ width: 60, marginRight: 8, marginBottom: 6, textAlign: "center" }}>
              <div style={{ width: 56, height: 32, borderRadius: 5, backgroundColor: c.hex, marginBottom: 3 }} />
              <div style={{ fontSize: 7.5, color: C.dark, marginBottom: 1 }}>{c.label}</div>
              <div style={{ fontSize: 7, color: C.muted }}>{c.hex}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingInline: 32, marginBottom: 16 }}>
        <SectionLabel>TYPOGRAFIA</SectionLabel>
        <div style={{ display: "flex" }}>
          {style.fonts.map((f, i) => (
            <div
              key={i}
              style={{
                backgroundColor: C.bg,
                borderRadius: 4,
                padding: "5px 10px",
                marginRight: 8,
                fontSize: 8.5,
                color: C.dark,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingInline: 32 }}>
        <SectionLabel>ZAOKRAGLENIE ELEMENTOW</SectionLabel>
        <div style={{ backgroundColor: C.bg, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.dark, marginBottom: 3 }}>
            {style.borderRadius === "rounded" ? "Zaokraglony styl" : "Ostry styl"}
            {"  ·  "}{style.borderRadiusPx}px border-radius
          </div>
          <div style={{ fontSize: 8.5, color: "#444", lineHeight: 1.5 }}>
            Wykryto {style.borderRadiusCount} elementow z zaokraglonymi naroznikami.
          </div>
        </div>
      </div>

      <PageFooter url={domain} pageNum={2} total={TOTAL_PAGES} />
    </A4Page>
  );
}

// ─── Strona 3: Struktura + Narzędzia (razem) ─────────────────────────────────

function StructureAndToolsPage() {
  const subpages = (analysis.subpagesData ?? []).slice(0, 6);
  const tools = (analysis.leadToolsData ?? []).slice(0, 8);
  return (
    <A4Page>
      <PageHeader label="ANALIZA STRONY" />

      <div style={{ paddingInline: 32, marginBottom: 16 }}>
        <SectionLabel>PRZEANALIZOWANE PODSTRONY ({subpages.length})</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {subpages.map((sp, i) => (
            <div key={i} style={{ backgroundColor: C.bg, borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.dark, marginBottom: 3 }}>{sp.name}</div>
              <div style={{ fontSize: 7.5, color: "#444", lineHeight: 1.5, marginBottom: 4 }}>{sp.description}</div>
              {sp.bullets.slice(0, 3).map((b, j) => (
                <div key={j} style={{ fontSize: 7, color: "#555", lineHeight: 1.4 }}>· {b}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingInline: 32 }}>
        <SectionLabel>ZIDENTYFIKOWANE NARZEDZIA POZYSKIWANIA ({tools.length})</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {tools.map((tool, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "8px 10px",
                backgroundColor: C.bg,
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  marginTop: 3,
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: C.dark, marginBottom: 2 }}>{tool.label}</div>
                <div style={{ fontSize: 7, color: C.muted, lineHeight: 1.4 }}>{tool.sourceText}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageFooter url={domain} pageNum={3} total={TOTAL_PAGES} />
    </A4Page>
  );
}

// ─── Podgląd popupów (poza A4) ────────────────────────────────────────────────

function PopupPreviewSection() {
  return (
    <div
      style={{
        width: 794,
        backgroundColor: "#0a0a0a",
        borderRadius: 12,
        padding: "32px 32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 10, color: "#BBEA00", fontWeight: 700, marginBottom: 16, fontFamily: "Helvetica, Arial, sans-serif", textTransform: "uppercase" as const }}>
        Podgląd popupów — dokładnie jak w /analiza
      </div>
      <PopupSection
        data={popupData}
        screenshotUrl={analysis.screenshotUrl}
        leadToolsData={analysis.leadToolsData}
      />
    </div>
  );
}

// ─── Strona 5: Dlaczego Catchly + Jak to działa + Przedsprzedaż ──────────────

function WhyCatchlyPage() {
  return (
    <A4Page>
      <PageHeader label="CO WYRÓZNIA CATCHLY" />

      <div style={{ paddingInline: 32, marginBottom: 16 }}>
        <SectionLabel>DLACZEGO CATCHLY, A NIE ZWYKLE POP-UPY</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DIFF.map((d, i) => (
            <div key={i} style={{ backgroundColor: C.bg, borderRadius: 6, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: C.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontWeight: 700,
                  color: C.dark,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.dark, marginBottom: 3 }}>{d.title}</div>
                <div style={{ fontSize: 8, color: "#444", lineHeight: 1.55 }}>{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingInline: 32, marginBottom: 16 }}>
        <SectionLabel>JAK TO DZIALA KROK PO KROKU</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: C.dark,
                borderRadius: 8,
                padding: "14px 14px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  position: "absolute",
                  top: 6,
                  right: 10,
                  lineHeight: 1,
                }}
              >
                {step.step}
              </div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: C.accent,
                  marginBottom: 6,
                  textTransform: "uppercase" as const,
                }}
              >
                {step.label}
              </div>
              <div style={{ fontSize: 8, color: "#aaa", lineHeight: 1.55 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Przedsprzedaż */}
      <div style={{ paddingInline: 32 }}>
        <div
          style={{
            background: `linear-gradient(135deg, #111 0%, #1a1a00 100%)`,
            border: `1px solid ${C.accent}33`,
            borderRadius: 10,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 7.5, color: C.accent, fontWeight: 700, marginBottom: 5 }}>
              PRZEDSPRZEDAZ · PREMIERA 1 LIPCA 2026
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4 }}>
              Kup dostep na cale zycie
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 6 }}>
              1 190 zl jednorazowo · bez abonamentu · 74 dni na zwrot
            </div>
            <div style={{ fontSize: 8, color: "#555" }}>
              Cena po premierze: 2 490 zl/rok
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                backgroundColor: C.accent,
                borderRadius: 6,
                padding: "8px 18px",
                fontSize: 9,
                fontWeight: 700,
                color: C.dark,
                marginBottom: 6,
              }}
            >
              catchly.pl
            </div>
            <div style={{ fontSize: 7, color: "#555" }}>Kup teraz</div>
          </div>
        </div>
      </div>

      <PageFooter url={domain} pageNum={5} total={TOTAL_PAGES} />
    </A4Page>
  );
}

// ─── A4 wrapper ───────────────────────────────────────────────────────────────

function A4Page({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div
      style={{
        width: 794,
        height: 1123,
        backgroundColor: C.white,
        fontFamily: "Helvetica, Arial, sans-serif",
        color: C.dark,
        position: "relative",
        paddingBottom: noPadding ? 0 : 52,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}

// ─── Główna strona podglądu ───────────────────────────────────────────────────

export default function PdfPreviewPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#525659",
        padding: "40px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}
    >
      <div style={{ fontSize: 12, color: "#ccc", fontFamily: "monospace" }}>
        PDF PREVIEW · {TOTAL_PAGES} stron · A4 (794×1123px)
      </div>

      <CoverPage />
      <VisualIdentityPage />
      <StructureAndToolsPage />
      <PopupPreviewSection />
      <WhyCatchlyPage />
    </div>
  );
}
