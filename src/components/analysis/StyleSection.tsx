"use client";

import { Palette, Type, Square } from "lucide-react";
import type { StyleData } from "@/types/analysis";
import { ScannerBar } from "./ScannerBar";

interface Props {
  styleData: StyleData | null;
  done: boolean;
}

function ColorCircle({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-full shadow-lg"
        style={{ backgroundColor: hex, border: "2px solid rgba(255,255,255,0.1)" }} />
      <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Satoshi, sans-serif" }}>
        {label}
      </span>
      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{hex}</span>
    </div>
  );
}

function SkeletonCircle() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="w-10 h-2.5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

export function StyleSection({ styleData, done }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

      <ScannerBar active={!done} />

      <div className="p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4" style={{ color: "#BBEA00" }} />
        <h2 className="text-base font-medium text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
          Styl marki
        </h2>
      </div>

      {!done ? (
        <div className="space-y-5">
          <div className="flex gap-6">
            {[0,1,2,3].map(i => <SkeletonCircle key={i} />)}
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-3 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Colors */}
          {styleData && styleData.colors.length > 0 && (
            <div>
              <p className="text-xs mb-3 flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Satoshi, sans-serif" }}>
                <Palette className="w-3 h-3" /> Główne marki
              </p>
              <div className="flex flex-wrap gap-5">
                {styleData.colors.map((color, i) => (
                  <ColorCircle key={i} hex={color.hex} label={color.label} />
                ))}
              </div>
            </div>
          )}

          {/* Fonts */}
          {styleData && (
            <div>
              <p className="text-xs mb-2 flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Satoshi, sans-serif" }}>
                <Type className="w-3 h-3" /> Czcionki
              </p>
              <div className="flex flex-wrap gap-2">
                {styleData.fonts.map((font, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: "rgba(146,178,242,0.1)",
                      border: "1px solid rgba(146,178,242,0.2)",
                      color: "#92B2F2",
                      fontFamily: "Satoshi, sans-serif"
                    }}>
                    {font}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Border radius */}
          {styleData && (
            <div>
              <p className="text-xs mb-2 flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Satoshi, sans-serif" }}>
                <Square className="w-3 h-3" /> Styl krawędzi
              </p>
              <div className="flex items-center gap-3">

                <div className="text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  <span className="text-white">
                    {styleData.borderRadius === "rounded"
                      ? `Zaokrąglone krawędzie ~ (${styleData.borderRadiusPx}px)`
                      : "Ostre krawędzie"}
                  </span>
                  {/* <span className="ml-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                    ({styleData.borderRadiusCount}× border-radius)
                  </span> */}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
