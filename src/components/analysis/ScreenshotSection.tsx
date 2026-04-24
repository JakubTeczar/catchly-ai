"use client";

import { Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScannerBar } from "./ScannerBar";

interface Props {
  screenshotUrl: string | null;
  done: boolean;
  allDone: boolean;
  url: string;
}

const PROGRESS_DURATION = 30000; // 10s

export function ScreenshotSection({ screenshotUrl, done, allDone, url }: Props) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Animate progress 0→100 over PROGRESS_DURATION while screenshot isn't loaded
  useEffect(() => {
    if (done && screenshotUrl) return; // already loaded

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const pct = Math.min((elapsed / PROGRESS_DURATION) * 100, 99);
      setProgress(pct);
      if (pct < 99) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Jump to 100 when done
  useEffect(() => {
    if (done && screenshotUrl) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setProgress(100);
    }
  }, [done, screenshotUrl]);

  const showProgress = !(done && screenshotUrl);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4" style={{ color: "#92B2F2" }} />
        <h2 className="text-base font-medium text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
          Wygląd strony
        </h2>
        <span className="ml-auto text-xs truncate max-w-[200px]"
          style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Satoshi, sans-serif" }}>
          {url}
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden relative"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Vertical scanner while not all done */}
        {!allDone && (
          <>
            <style>{`
              @keyframes scanner-v {
                0%   { left: -3px; opacity: 0; }
                8%   { opacity: 1; }
                92%  { opacity: 1; }
                100% { left: calc(100% + 3px); opacity: 0; }
              }
            `}</style>
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 10 }}>
              <div style={{
                position: "absolute", top: 0, bottom: 0, width: "3px",
                background: "#BBEA00", borderRadius: "2px",
                animation: "scanner-v 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
              }} />
              <div style={{
                position: "absolute", top: 0, bottom: 0, width: "28px",
                marginLeft: "-12px",
                background: "linear-gradient(to right, transparent, rgba(187,234,0,0.10), transparent)",
                animation: "scanner-v 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
              }} />
            </div>
          </>
        )}

        {done && screenshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={screenshotUrl} alt="Screenshot strony" className="w-full h-auto block" />
        ) : (
          <div className="w-full aspect-video relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            {/* Placeholder lines */}
            <div className="absolute inset-0 flex flex-col justify-around px-8 py-6 pointer-events-none">
              {[0.04, 0.025, 0.035, 0.02, 0.03, 0.025, 0.04].map((op, i) => (
                <div key={i} className="rounded-full"
                  style={{
                    height: i % 3 === 0 ? "10px" : "6px",
                    width: `${55 + (i * 13) % 35}%`,
                    background: `rgba(255,255,255,${op})`,
                  }} />
              ))}
            </div>

              {/* WYŚRODKOWANY TEKST */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#BBEA00] text-2xl font-medium text-center whitespace-nowrap">
              {Math.round(progress)}%
            </span>
            {/* Progress bar overlay */}
            {showProgress && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "0.75rem 1rem",
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                zIndex: 5,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "0.35rem",
                }}>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontFamily: "Satoshi, sans-serif" }}>
                    Skanowanie ekranu...
                  </span>
                  {/* <span style={{ fontSize: "0.7rem", color: "#BBEA00", fontFamily: "Satoshi, sans-serif", fontWeight: 600 }}>
                    {Math.round(progress)}%
                  </span> */}
                </div>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "#BBEA00",
                    borderRadius: "2px",
                    transition: "width 0.1s linear",
                  }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
