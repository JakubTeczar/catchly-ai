"use client";

import { Magnet, ExternalLink, Quote, Lightbulb } from "lucide-react";
import type { LeadTool } from "@/types/analysis";
import { ScannerBar } from "./ScannerBar";

interface Props {
  leadToolsData: LeadTool[] | null;
  done: boolean;
}

const typeLabels: Record<string, string> = {
  consultation: "Konsultacja",
  newsletter: "Newsletter",
  demo: "Demo",
  trial: "Trial",
  ebook: "E-book",
  webinar: "Webinar",
  calculator: "Kalkulator",
  chat: "Czat",
  contact_form: "Formularz",
  other: "Inne",
};

function RealToolItem({ tool }: { tool: LeadTool }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "rgba(187,234,0,0.1)" }}>
        <Magnet className="w-3.5 h-3.5" style={{ color: "#BBEA00" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
            {tool.label}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "Satoshi, sans-serif"
            }}>
            {typeLabels[tool.type] || tool.type}
          </span>
        </div>
        {tool.sourceText && (
          <p className="text-xs italic flex items-start gap-1"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Satoshi, sans-serif" }}>
            <Quote className="w-3 h-3 shrink-0 mt-0.5" />
            {tool.sourceText}
          </p>
        )}
        {tool.sourceUrl && (
          <a href={tool.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 mt-1 transition-colors"
            style={{ color: "#92B2F2", fontFamily: "Satoshi, sans-serif" }}>
            <ExternalLink className="w-3 h-3" />
            {tool.sourceUrl.replace(/^https?:\/\/[^/]+/, "").slice(0, 40) || "/"}
          </a>
        )}
      </div>
    </div>
  );
}

function SuggestionItem({ tool }: { tool: LeadTool }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "rgba(246,176,36,0.04)", border: "1px solid rgba(246,176,36,0.12)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "rgba(246,176,36,0.1)" }}>
        <Lightbulb className="w-3.5 h-3.5" style={{ color: "#F6B024" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Satoshi, sans-serif" }}>
          {tool.suggestionText}
        </p>
        {tool.sourceUrl && (
          <a href={tool.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 mt-1.5 transition-colors"
            style={{ color: "rgba(246,176,36,0.6)", fontFamily: "Satoshi, sans-serif" }}>
            <ExternalLink className="w-3 h-3" />
            {tool.sourceUrl.replace(/^https?:\/\/[^/]+/, "").slice(0, 40) || "/"}
          </a>
        )}
      </div>
    </div>
  );
}

export function LeadToolsSection({ leadToolsData, done }: Props) {
  const realTools = leadToolsData?.filter((t) => !t.suggestion) ?? [];
  const suggestions = leadToolsData?.filter((t) => t.suggestion) ?? [];

  return (
    <div className="rounded-2xl relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <ScannerBar active={!done} />
      <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Magnet className="w-4 h-4" style={{ color: "#BBEA00" }} />
        <h2 className="text-base font-medium text-white" style={{ fontFamily: "Brockmann, sans-serif" }}>
          Aktualne sposoby zdobywania klientów
        </h2>
      </div>

      {!done ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-3 w-48 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Znalezione na stronie */}
          {realTools.length > 0 ? (
            <div className="space-y-2">
              {realTools.map((tool, i) => <RealToolItem key={i} tool={tool} />)}
            </div>
          ) : (
            <div className="p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Satoshi, sans-serif" }}>
                Aktualnie nie znaleźliśmy żadnych sposobów pozyskiwania klientów na tej stronie.
              </p>
            </div>
          )}

          {/* Sugestie */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-1">
                <div className="h-px flex-1" style={{ background: "rgba(246,176,36,0.15)" }} />
                <span className="text-xs px-2" style={{ color: "rgba(246,176,36,0.5)", fontFamily: "Satoshi, sans-serif" }}>
                  co można dodać
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(246,176,36,0.15)" }} />
              </div>
              {suggestions.map((tool, i) => <SuggestionItem key={i} tool={tool} />)}
            </div>
          )}

          {realTools.length === 0 && suggestions.length === 0 && (
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Satoshi, sans-serif" }}>
              Brak danych do wyświetlenia.
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
