"use client";

/** Cienki pasek skanera na górze sekcji — przesuwa się od lewej do prawej. */
export function ScannerBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: "2px", zIndex: 10 }}>
      <div style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "45%",
        background: "linear-gradient(to right, transparent, #BBEA00, transparent)",
        animation: "scanner-top 1.8s ease-in-out infinite",
      }} />
    </div>
  );
}
