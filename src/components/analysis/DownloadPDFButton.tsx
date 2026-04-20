"use client";

import { useState } from "react";

interface Props {
  analysisId: string;
}

export function DownloadPDFButton({ analysisId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf?analysisId=${encodeURIComponent(analysisId)}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`PDF error ${res.status}: ${text.slice(0, 200)}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `catchly-audyt.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "36px",
        padding: "0 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "8px",
        color: loading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
        fontSize: "0.8rem",
        fontFamily: "Satoshi, sans-serif",
        fontWeight: 500,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {loading ? "Generuję PDF..." : "Pobierz PDF"}
    </button>
  );
}
