"use client";

import { useState, useEffect } from "react";
import {
  Clock, CheckCircle2, ArrowRight, RotateCcw, Infinity,
} from "lucide-react";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

interface Props {
  analysisId: string;
  websiteUrl: string;
}

const TARGET_DATE = new Date("2026-05-01T00:00:00.000Z");
const LAUNCH_DATE = "1 lipca 2026";

function useCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    function calc() {
      const diff = TARGET_DATE.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    }
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold tabular-nums"
        style={{ background: "#BBEA00", color: "#080808", fontFamily: "Brockmann, sans-serif" }}>
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Satoshi, sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

const TIMELINE_STEPS = [
  {
    num: "1",
    label: "Teraz",
    title: "Kupujesz w przedsprzedaży",
    desc: "Zyskujesz dostęp w najniższej cenie, jaka kiedykolwiek będzie dostępna.",
    color: "#BBEA00",
    textColor: "#080808",
  },
  {
    num: "2",
    label: "1 lipca 2026",
    title: "Premiera catchly",
    desc: "W dniu zyskujesz dostęp do Catchly i testujesz rezultaty na swojej stronie.",
    color: "rgba(146,178,242,0.15)",
    textColor: "#92B2F2",
    border: "rgba(146,178,242,0.25)",
  },
  {
    num: "3",
    label: "14 dni na decyzję",
    title: "Testujesz bez ryzyka",
    desc: "Masz 14 dni, żeby sprawdzić, jak Catchly działa u Ciebie. Jeśli nie spełni oczekiwań, zwracamy 100% środków.",
    color: "rgba(146,178,242,0.15)",
    textColor: "#92B2F2",
    border: "rgba(146,178,242,0.25)",
  },
  {
    num: "4",
    label: "Na zawsze",
    title: "Dostęp na całe życie",
    desc: "Płacisz tylko raz i korzystasz bez ograniczeń. Wszystkie przyszłe aktualizacje otrzymujesz w cenie.",
    color: "rgba(146,178,242,0.15)",
    textColor: "#92B2F2",
    border: "rgba(146,178,242,0.25)",
  },
];


export function OfferSection({ analysisId }: Props) {
  const t = useCountdown();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, analysisId }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Coś poszło nie tak. Spróbuj ponownie.");
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(187,234,0,0.1)", border: "1px solid rgba(187,234,0,0.25)", color: "#BBEA00", fontFamily: "Satoshi, sans-serif" }}>
          ✦ Przedsprzedaż — tylko do 1 maja 2026
        </div>
        <h2 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
          Kup dostęp na całe życie
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Satoshi, sans-serif" }}>
          Nowe podejście AI agent, który uczy się razem z Twoją stroną
        </p>
      </div>

      {/* Countdown */}
      <div className="p-5 rounded-2xl space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 text-sm"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Satoshi, sans-serif" }}>
            <Clock className="w-3.5 h-3.5" />
            Cena przedsprzedażowa wygasa za:
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Satoshi, sans-serif" }}>
            Premiera produktu: <span style={{ color: "rgba(255,255,255,0.45)" }}>{LAUNCH_DATE}</span>
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <CountdownBlock value={t.days} label="dni" />
          <div className="text-xl self-center pb-6" style={{ color: "rgba(255,255,255,0.2)" }}>:</div>
          <CountdownBlock value={t.hours} label="godz" />
          <div className="text-xl self-center pb-6" style={{ color: "rgba(255,255,255,0.2)" }}>:</div>
          <CountdownBlock value={t.minutes} label="min" />
          <div className="text-xl self-center pb-6" style={{ color: "rgba(255,255,255,0.2)" }}>:</div>
          <CountdownBlock value={t.seconds} label="sek" />
        </div>
      </div>

      {/* Catchly jest dla Ciebie */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>
        <p style={{ margin: 0, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", fontFamily: "Satoshi, sans-serif" }}>
          Catchly jest dla Ciebie
        </p>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "Brockmann, sans-serif", color: "#fff", lineHeight: 1.35 }}>
          Jeśli chcesz zatrudnić handlowca,<br />który pracuje na poprawę konwersji 24/7
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            "Nie masz czasu na sprawdzanie co działa na klientów, a co nie",
            "Nie chcesz logować się do paneli i nimi zarządzać",
            "Chcesz żeby Twoja strona zarabiała więcej bez dodatkowej pracy z Twojej strony",
            "Nie masz budżetu na pełnoetatowego specjalistę ds. konwersji",
            "Chcesz testować i wdrażać zmiany bez angażowania deweloperów",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#BBEA00", flexShrink: 0, marginTop: "0.35rem" }} />
              <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", fontFamily: "Satoshi, sans-serif", lineHeight: 1.6 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <ArrowRight style={{ width: 15, height: 15, flexShrink: 0, color: "#BBEA00" }} />
          <span style={{ fontSize: "0.9rem", fontFamily: "Brockmann, sans-serif", fontWeight: 600, color: "#BBEA00" }}>
            ...to Catchly jest dla Ciebie.
          </span>
        </div>
      </div>

      {/* Pełna autonomia */}
      <div className="p-5 rounded-2xl space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

        <h3 className="text-xl text-white m-0" style={{ fontFamily: "Brockmann, sans-serif" }}>
          Pełna autonomia pod Twoją kontrolą
        </h3>
        <p className="text-sm m-0" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Satoshi, sans-serif", lineHeight: 1.7 }}>
          AI nie działa samowolnie. Każda propozycja trafia najpierw do Ciebie. Ty decydujesz, czy ją wdrożyć. Masz pełną kontrolę nad tym, co pojawia się na Twojej stronie. Zawsze.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "0.5rem", marginBottom: "0.25rem" }} className="offer-steps-grid">
          {[
            { num: "01", title: "AI analizuje", desc: "Agent zbiera dane o odwiedzających, zachowaniach użytkowników i ruchach konkurencji w czasie rzeczywistym." },
            { num: "02", title: "AI proponuje", desc: "Na podstawie analizy tworzy konkretne propozycje dopasowane do Twojej strony i oferty." },
            { num: "03", title: "Ty decydujesz", desc: "Otrzymujesz powiadomienie i jednym słowem zatwierdzasz: \"Tak\" lub \"Nie\". Finalna decyzja zawsze należy do Ciebie." },
          ].map((step) => (
            <div key={step.num} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px",
              padding: "1.25rem 1.25rem 1.25rem 1rem",
            }}>
              <div style={{
                fontSize: "3.2rem",
                fontFamily: "Brockmann, sans-serif",
                fontWeight: 700,
                color: "#BBEA00",
                lineHeight: 1,
                marginLeft: "-2px",
                marginBottom: "0.75rem",
              }}>
                {step.num}
              </div>
              <p style={{ fontFamily: "Brockmann, sans-serif", fontSize: "0.95rem", color: "#fff", margin: "0 0 6px", fontWeight: 600 }}>
                {step.title}
              </p>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "Satoshi, sans-serif", fontSize: "0.8rem", marginTop: "20px", color: "rgba(255,255,255,0.68)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Twoje dane i ustawienia nigdy nie są zmieniane bez Twojej zgody</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-5 rounded-2xl space-y-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Satoshi, sans-serif" }}>
          Jak to działa krok po kroku
        </p>
        <div className="space-y-3">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              {/* connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: step.color,
                    color: step.textColor,
                    border: step.border ? `1px solid ${step.border}` : undefined,
                    fontFamily: "Brockmann, sans-serif",
                  }}>
                  {step.num}
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className="w-px flex-1 mt-1 mb-0" style={{ background: "rgba(255,255,255,0.07)", minHeight: "16px" }} />
                )}
              </div>
              <div className="pb-3">
                <p className="text-xs mb-0.5" style={{ color: step.num === "1" ? "#BBEA00" : "rgba(255,255,255,0.25)", fontFamily: "Satoshi, sans-serif" }}>
                  {step.label}
                </p>
                <p className="text-sm font-medium text-white mb-0.5" style={{ fontFamily: "Brockmann, sans-serif" }}>
                  {step.title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Satoshi, sans-serif" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee bar */}
        <div className="flex items-center gap-2 pt-1 px-3 py-2 rounded-xl"
          style={{ background: "rgba(187,234,0,0.05)", border: "1px solid rgba(187,234,0,0.12)" }}>
          <RotateCcw className="w-3.5 h-3.5 shrink-0" style={{ color: "#BBEA00" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Satoshi, sans-serif" }}>
            <span style={{ color: "#BBEA00" }}>14 dni na pełny zwrot</span> po premierze
          </span>
        </div>
      </div>

      {/* Differentiators — animated features section */}
      <FeaturesSection compact />

      {/* Price + CTA */}
      <div className="p-6 md:p-8 rounded-2xl space-y-5"
        style={{ background: "rgba(187,234,0,0.06)", border: "1px solid rgba(187,234,0,0.2)" }}>
        {submitted ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: "#BBEA00" }} />
            <h3 className="text-xl text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
              Świetnie! Jesteś na liście
            </h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Satoshi, sans-serif" }}>
              Wyślemy Ci link do płatności na:{" "}
              <span style={{ color: "#BBEA00" }}>{email}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Infinity className="w-5 h-5" style={{ color: "#BBEA00" }} />
                <h3 className="text-2xl text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
                  1 190 zł{" "}
                  <span className="text-base font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>jednorazowo</span>
                </h3>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Satoshi, sans-serif" }}>
                Dostęp na zawsze · Cena wzrośnie po premierze
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
              <input
                type="text"
                placeholder="Twoje imię (opcjonalnie)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontFamily: "Satoshi, sans-serif",
                }}
              />
              <input
                type="email"
                placeholder="Twój adres email *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontFamily: "Satoshi, sans-serif",
                }}
              />
              {error && <p className="text-xs" style={{ color: "#ff6b6b" }}>{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                style={{ background: "#BBEA00", color: "#080808", fontFamily: "Brockmann, sans-serif" }}
              >
                {loading ? "Zapisuję..." : (
                  <>Chcę kupić za 1 190 zł <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Satoshi, sans-serif" }}>
                74 dni na pełny zwrot · Bez ryzyka
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
