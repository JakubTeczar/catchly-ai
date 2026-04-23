"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const LOADING_STEPS = [
  { delay: 0,    message: "Sprawdzamy dostępność Twojej strony..." },
  { delay: 1800, message: "Analizujemy obecny styl i design strony..." },
  { delay: 3600, message: "Pobieramy informacje o tym, co sprzedajesz..." },
  { delay: 5400, message: "Identyfikujemy Twoje unikalne przewagi rynkowe..." },
  { delay: 7200, message: "Przygotowujemy spersonalizowany raport..." },
];

export function UrlInputForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCompletedSteps([]);
      setActiveStep(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOADING_STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setActiveStep(i);
        if (i > 0) setCompletedSteps((prev) => [...prev, i - 1]);
      }, step.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: url.trim(),
          width: window.innerWidth,
          height: window.innerHeight 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Coś poszło nie tak");
        setLoading(false);
        return;
      }
      setTimeout(() => router.push(`/analiza/${data.id}`), 2000);
    } catch {
      setError("Błąd połączenia z serwerem");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div
          className="flex  items-center gap-2 rounded-full px-4 py-2"
          style={{ background: "#272725", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <input
            type="text"
            placeholder="www.twojastrona.pl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="flex-1  bg-transparent text-white placeholder:text-white/30 text-sm outline-none py-1.5"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
      </form>

      {/* Loading steps */}
      {loading && (
        <div className="space-y-1.5 pt-1">
          {LOADING_STEPS.map((step, i) => {
            if (i > activeStep) return null;
            const isCompleted = completedSteps.includes(i);
            const isActive = activeStep === i;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-all duration-500 ${
                  isCompleted ? "text-white/30" : isActive ? "text-white/70" : "text-white/20"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" />
                )}
                {step.message}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
