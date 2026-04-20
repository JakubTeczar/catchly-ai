"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import "./BanditVisualization.scss";

// ─── Config ───────────────────────────────────────────────────────────────────

const EPSILON = 0.14;

const VARIANTS = [
  { key: "A", trueRate: 0.15, color: "#BBEA00" },
  { key: "B", trueRate: 0.80, color: "#60a5fa" },
  { key: "C", trueRate: 0.35, color: "#f472b6" },
];

const AUTO_TOTAL = 80;
const AUTO_INTERVAL_MS = 500;

interface VariantStats { visits: number; conversions: number; }

const EMPTY_STATS = (): VariantStats[] => VARIANTS.map(() => ({ visits: 0, conversions: 0 }));

function epsilonGreedy(stats: VariantStats[], epsilon: number): number {
  if (Math.random() < epsilon) return Math.floor(Math.random() * 3);
  const crs = stats.map(s => s.visits === 0 ? -1 : s.conversions / s.visits);
  const max = Math.max(...crs);
  if (max < 0) return Math.floor(Math.random() * 3);
  const best = crs.reduce<number[]>((a, cr, i) => cr === max ? [...a, i] : a, []);
  return best[Math.floor(Math.random() * best.length)];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BanditVisualization() {
  const [stats, setStats] = useState<VariantStats[]>(EMPTY_STATS());

  const statsRef = useRef<VariantStats[]>(EMPTY_STATS());
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCountRef = useRef(0);

  const stopAuto = useCallback(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    if (autoIntervalRef.current) return;

    autoIntervalRef.current = setInterval(() => {
      // Restart when cycle complete
      if (autoCountRef.current >= AUTO_TOTAL) {
        autoCountRef.current = 0;
        statsRef.current = EMPTY_STATS();
        setStats(EMPTY_STATS());
        return;
      }

      const idx = epsilonGreedy(statsRef.current, EPSILON);
      const converted = Math.random() < VARIANTS[idx].trueRate;
      statsRef.current = statsRef.current.map((s, i) =>
        i !== idx ? s : { visits: s.visits + 1, conversions: s.conversions + (converted ? 1 : 0) }
      );
      autoCountRef.current++;
      setStats([...statsRef.current]);
    }, AUTO_INTERVAL_MS);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => startAuto(), 600);
    return () => {
      clearTimeout(t);
      stopAuto();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalVisits = stats.reduce((s, v) => s + v.visits, 0);
  const leaderIndex = (() => {
    const crs = stats.map(s => s.visits === 0 ? -1 : s.conversions / s.visits);
    const max = Math.max(...crs);
    if (max <= 0) return -1;
    return crs.indexOf(max);
  })();

  return (
    <div style={{ fontFamily: "Satoshi, sans-serif", color: "#fff" }}>

      {/* Label */}
      <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "0 0 0.75rem", textAlign: "center" }}>
        Symulacja testów A/B w czasie rzeczywistym
      </p>

      {/* Cards */}
      <div className="bandit-cards">
        {VARIANTS.map((variant, i) => {
          const s = stats[i];
          const cr = s.visits === 0 ? 0 : s.conversions / s.visits;
          const share = totalVisits === 0 ? 1 / VARIANTS.length : s.visits / totalVisits;
          const isLeader = i === leaderIndex;

          return (
            <div key={variant.key} style={{
              background: isLeader ? variant.color + "0d" : "rgba(255,255,255,0.03)",
              border: `1px solid ${isLeader ? variant.color + "40" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "12px",
              padding: "0.9rem",
              transition: "border-color 0.4s, background 0.4s",
              position: "relative",
            }}>
              {isLeader && (
                <div style={{
                  position: "absolute", top: "0.5rem", right: "0.5rem",
                  background: variant.color, color: "#080808",
                  fontSize: "0.55rem", fontWeight: 700, padding: "0.15rem 0.45rem",
                  borderRadius: "4px", letterSpacing: "0.06em",
                }}>NAJLEPSZY</div>
              )}

              {/* Popup card preview */}
              <div style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "0.5rem 0.6rem",
                marginBottom: "0.7rem",
                borderTop: `2px solid ${variant.color}`,
              }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, color: variant.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
                  Pop-up {variant.key}
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", marginBottom: "4px" }} />
                <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", width: "70%", marginBottom: "6px" }} />
                <div style={{ height: "18px", background: isLeader ? variant.color + "33" : "rgba(255,255,255,0.06)", borderRadius: "4px", border: `1px solid ${isLeader ? variant.color + "55" : "rgba(255,255,255,0.1)"}` }} />
              </div>

              {/* Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.6rem" }}>
                <Row label="Odwiedzający" value={String(s.visits)} />
                <Row label="Kliknięcia" value={String(s.conversions)} color={variant.color} />
                <Row label="Skuteczność" value={`${(cr * 100).toFixed(1)}%`} color={variant.color} large />
              </div>

              {/* Share bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)" }}>Kierowany ruch</span>
                  <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{Math.round(share * 100)}%</span>
                </div>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${share * 100}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ height: "100%", background: variant.color, borderRadius: "2px" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalVisits > 0 && (
        <p style={{ textAlign: "center", marginTop: "0.6rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.18)" }}>
          Przeszło: <strong style={{ color: "rgba(255,255,255,0.35)" }}>{totalVisits}</strong> osób
        </p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Row({ label, value, color, large }: { label: string; value: string; color?: string; large?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>{label}</span>
      <span style={{ fontSize: large ? "0.95rem" : "0.78rem", fontWeight: large ? 700 : 600, color: color ?? "rgba(255,255,255,0.7)" }}>
        {value}
      </span>
    </div>
  );
}
