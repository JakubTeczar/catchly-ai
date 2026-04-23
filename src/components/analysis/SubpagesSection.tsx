"use client";

import { useState } from "react";
import { Globe, ExternalLink, ChevronRight } from "lucide-react";
import type { SubpageSummary } from "@/types/analysis";
import { ScannerBar } from "./ScannerBar";

interface Props {
  subpagesData: SubpageSummary[] | null;
  done: boolean;
}

const INITIAL_COUNT = 4;

function SubpageCard({ page }: { page: SubpageSummary }) {
  const shortUrl = page.url.replace(/^https?:\/\/[^/]+/, "") || "/";
  return (
    <div className="p-4 rounded-xl space-y-2 transition-colors"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-white text-sm" style={{ fontFamily: "Brockmann, sans-serif" }}>
          {page.name}
        </h3>
        <a href={page.url} target="_blank" rel="noopener noreferrer"
          className="shrink-0 transition-colors"
          style={{ color: "rgba(255,255,255,0.2)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#92B2F2")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{shortUrl}</p>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Satoshi, sans-serif" }}>
        {page.description}
      </p>
      {page.bullets.length > 0 && (
        <ul className="space-y-1 pt-1">
          {page.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Satoshi, sans-serif" }}>
              <ChevronRight className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#BBEA00" }} />
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl space-y-2"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="h-4 w-32 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="h-3 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="h-8 w-full rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
    </div>
  );
}

export function SubpagesSection({ subpagesData, done }: Props) {
  const [showAll, setShowAll] = useState(false);

  const hasMore = (subpagesData?.length ?? 0) > INITIAL_COUNT;
  const visiblePages = showAll ? subpagesData : subpagesData?.slice(0, INITIAL_COUNT);

  return (
    <div className="rounded-2xl relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <ScannerBar active={!done} />
      <div className="p-5 space-y-4">

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" style={{ color: "#92B2F2" }} />
          <h2 className="text-base font-medium text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
          {done 
              ? "Sprawdziłem Twoją stronę i mam kilka ważnych informacji"
              : "Sprawdzam Twoje podstrony..."
            }
          </h2>
          {done && subpagesData && (
            <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Satoshi, sans-serif" }}>
              {subpagesData.length} podstron
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!done
            ? [0,1,2,3].map(i => <SkeletonCard key={i} />)
            : visiblePages?.map((page, i) => <SubpageCard key={i} page={page} />)
          }
        </div>

        {done && hasMore && (
          <button
            onClick={() => setShowAll(prev => !prev)}
            className="w-full py-2 text-xs rounded-lg transition-colors"
            style={{
              color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "transparent",
              fontFamily: "Satoshi, sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {showAll ? "Zwiń" : `Rozwiń wszystkie (${subpagesData!.length - INITIAL_COUNT} więcej)`}
          </button>
        )}

      </div>
    </div>
  );
}