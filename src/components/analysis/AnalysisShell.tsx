"use client";

import { useState, useEffect } from "react";
import { useAnalysisPolling } from "@/hooks/useAnalysisPolling";
import { SectionWrapper } from "./SectionWrapper";
import { ScreenshotSection } from "./ScreenshotSection";
import { StyleSection } from "./StyleSection";
import { SubpagesSection } from "./SubpagesSection";
import { LeadToolsSection } from "./LeadToolsSection";
import { PopupSection } from "./PopupSection";
import { ProductsSection } from "./ProductsSection";
import { OfferSection } from "./OfferSection";
import { EmailGate } from "./EmailGate";
import { getVariant } from "@/lib/abTest";
import { AlertCircle, Loader2 } from "lucide-react";

interface Props {
  id: string;
}

const STEPS = [
  { key: "screenshotDone", label: "Skanujemy Twoją stronę..." },
  { key: "styleDone", label: "Analizujemy styl i kolory marki..." },
  { key: "subpagesDone", label: "Skanujemy podstrony i zbieramy informacje..." },
  { key: "leadToolsDone", label: "Wykrywamy narzędzia lead generation..." },
] as const;

const STEP_NAMES = ["Skanowanie wizualne", "Identyfikacja marki", "Mapowanie struktury", "Zdobywania klientów"];

export function AnalysisShell({ id }: Props) {
  const { state, error } = useAnalysisPolling(id);
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  useEffect(() => {
    const v = getVariant();
    setVariant(v);
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId: id, variant: v }),
    }).catch(() => {});
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl text-sm"
        style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff6b6b" }}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center gap-2 text-white/30 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Łączenie...
      </div>
    );
  }

  const doneFlags = [state.screenshotDone, state.styleDone, state.subpagesDone, state.leadToolsDone];
  const activeStepIndex = doneFlags.findIndex((d) => !d);
  const currentStep = activeStepIndex === -1 ? null : STEPS[activeStepIndex];

  return (
    <div className="space-y-5">

      {/* Progress */}
      {state.status !== "COMPLETED" && state.status !== "FAILED" && (
        <div className="p-4 rounded-2xl space-y-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: "#BBEA00" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span style={{ fontFamily: "Satoshi, sans-serif", color: "rgba(255,255,255,0.6)" }}>
              {currentStep?.label || "Finalizujemy analizę..."}
            </span>
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <div key={step.key} className="h-0.5 flex-1 rounded-full transition-all duration-700"
                style={{ background: doneFlags[i] ? "#BBEA00" : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
          <div className="flex justify-between text-xs" style={{ fontFamily: "Satoshi, sans-serif" }}>
            {STEPS.map((step, i) => (
              <span key={step.key} style={{ color: doneFlags[i] ? "#BBEA00" : "rgba(255,255,255,0.2)" }}>
                {STEP_NAMES[i]}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.status === "FAILED" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl text-sm"
          style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff6b6b" }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          Wystąpił problem z analizą. Sprawdź czy URL jest prawidłowy.
        </div>
      )}

      {/* Section 1: Screenshot */}
      <SectionWrapper visible={true} ready={true}>
        <ScreenshotSection screenshotUrl={state.screenshotUrl} done={state.screenshotDone} allDone={state.status === "COMPLETED"} url={state.url} />
      </SectionWrapper>

      {/* Section 2: Style */}
      <SectionWrapper visible={state.screenshotDone} ready={true}>
        <StyleSection styleData={state.styleData} done={state.styleDone} />
      </SectionWrapper>

      {/* Section 3.1: Subpages */}
      <SectionWrapper visible={state.styleDone} ready={true}>
        <SubpagesSection subpagesData={state.subpagesData} done={state.subpagesDone} />
      </SectionWrapper>

      {/* Section 3.2: Lead Tools */}
      <SectionWrapper visible={state.subpagesDone} ready={true}>
        <LeadToolsSection leadToolsData={state.leadToolsData} done={state.leadToolsDone} />
      </SectionWrapper>

      {/* ── WARIANT A: normalny flow ──────────────────────────────────── */}
      {variant === "A" && (
        <>
          <SectionWrapper visible={state.leadToolsDone} ready={true}>
            <ProductsSection productsData={state.productsData} done={state.productsDone} />
          </SectionWrapper>

          <SectionWrapper visible={state.productsDone} ready={state.popupDone}>
            {state.popupData && (
              <PopupSection data={state.popupData} screenshotUrl={state.screenshotUrl} leadToolsData={state.leadToolsData} analysisId={id} variant={variant} />
            )}
          </SectionWrapper>

          {state.popupDone && (
            <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.07)" }} />
          )}

          <SectionWrapper visible={state.popupDone} ready={state.popupDone}>
            <OfferSection analysisId={id} websiteUrl={state.url} />
          </SectionWrapper>
        </>
      )}

      {/* ── WARIANT B: email gate przed propozycjami ──────────────────── */}
      {variant === "B" && state.leadToolsDone && (
        !emailUnlocked ? (
          <EmailGate analysisId={id} variant="B" onUnlock={() => setEmailUnlocked(true)} />
        ) : (
          <>
            <SectionWrapper visible={true} ready={true}>
              <ProductsSection productsData={state.productsData} done={state.productsDone} />
            </SectionWrapper>

            <SectionWrapper visible={state.productsDone} ready={state.popupDone}>
              {state.popupData && (
                <PopupSection data={state.popupData} screenshotUrl={state.screenshotUrl} leadToolsData={state.leadToolsData} hideEmailSave analysisId={id} variant={variant} />
              )}
            </SectionWrapper>

            <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.07)" }} />

            <SectionWrapper visible={true} ready={true}>
              <OfferSection analysisId={id} websiteUrl={state.url} />
            </SectionWrapper>
          </>
        )
      )}
    </div>
  );
}
