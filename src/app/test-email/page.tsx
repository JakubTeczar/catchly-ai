"use client";

import { useState } from "react";

type EmailType = "lead" | "admin";

interface DebugResult {
  ok: boolean;
  error?: string;
  stack?: string;
  logs?: string[];
  httpStatus: number;
  rawBody: string;
  fetchError?: string;
  timestamp: string;
}

export default function TestEmailPage() {
  const [type, setType] = useState<EmailType>("lead");
  const [to, setTo] = useState("kontakt@catchly.pl");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com");
  const [analysisId, setAnalysisId] = useState("test-id-123");
  const [variant, setVariant] = useState("A");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);

  async function handleSend() {
    setLoading(true);
    setResult(null);
    const timestamp = new Date().toISOString();
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, to, websiteUrl, analysisId, variant }),
      });
      const rawBody = await res.text();
      let parsed: Record<string, unknown> = {};
      try { parsed = JSON.parse(rawBody); } catch { /* nie JSON */ }
      setResult({
        ok: res.ok && parsed.ok === true,
        error: parsed.error as string | undefined,
        stack: parsed.stack as string | undefined,
        logs: parsed.logs as string[] | undefined,
        httpStatus: res.status,
        rawBody,
        timestamp,
      });
    } catch (e) {
      setResult({
        ok: false,
        fetchError: e instanceof Error ? e.message : String(e),
        httpStatus: 0,
        rawBody: "",
        timestamp,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080808", padding: "40px 16px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 24px" }}>Test wysylki maila</h1>

        <div style={cardStyle}>
          <label style={labelStyle}>Typ maila</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(["lead", "admin"] as EmailType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: type === t ? "#BBEA00" : "#333",
                  background: type === t ? "#BBEA00" : "transparent",
                  color: type === t ? "#111" : "#aaa",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {t === "lead" ? "Lead (do klienta)" : "Admin (do siebie)"}
              </button>
            ))}
          </div>

          <label style={labelStyle}>Do (email odbiorcy)</label>
          <input style={inputStyle} value={to} onChange={(e) => setTo(e.target.value)} placeholder="email@example.com" />

          <label style={labelStyle}>URL strony</label>
          <input style={inputStyle} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />

          <label style={labelStyle}>ID analizy</label>
          <input style={inputStyle} value={analysisId} onChange={(e) => setAnalysisId(e.target.value)} placeholder="test-id-123" />

          {type === "admin" && (
            <>
              <label style={labelStyle}>Wariant (opcjonalnie)</label>
              <input style={inputStyle} value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="A" />
            </>
          )}

          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              marginTop: 8,
              background: "#BBEA00",
              color: "#111",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Wysylanie..." : "Wyslij testowego maila"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 24 }}>
            {/* Status bar */}
            <div style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 16,
              background: result.ok ? "#0d2200" : "#220000",
              border: `1px solid ${result.ok ? "#BBEA00" : "#ff4d4d"}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{result.ok ? "✓" : "✗"}</span>
              <div>
                <div style={{ color: result.ok ? "#BBEA00" : "#ff4d4d", fontWeight: 700, fontSize: 15 }}>
                  {result.ok ? "Mail wysłany pomyślnie" : "Błąd wysyłki"}
                </div>
                <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{result.timestamp}</div>
              </div>
              <div style={{ marginLeft: "auto", background: result.httpStatus >= 200 && result.httpStatus < 300 ? "#1a3300" : "#330000", color: result.ok ? "#BBEA00" : "#ff6666", padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                HTTP {result.httpStatus || "BRAK"}
              </div>
            </div>

            {/* Fetch error (problem sieci / CORS / DNS) */}
            {result.fetchError && (
              <DebugSection title="Blad fetch (siec / CORS / DNS)" color="#ff4d4d">
                <pre style={preStyle}>{result.fetchError}</pre>
              </DebugSection>
            )}

            {/* Error message */}
            {result.error && (
              <DebugSection title="Blad SMTP" color="#ff4d4d">
                <pre style={preStyle}>{result.error}</pre>
              </DebugSection>
            )}

            {/* Stack trace */}
            {result.stack && (
              <DebugSection title="Stack trace" color="#ff8800">
                <pre style={preStyle}>{result.stack}</pre>
              </DebugSection>
            )}

            {/* Server logs */}
            {result.logs && result.logs.length > 0 && (
              <DebugSection title={`Logi serwera (${result.logs.length})`} color="#888">
                <pre style={preStyle}>{result.logs.join("\n")}</pre>
              </DebugSection>
            )}

            {/* Raw response */}
            <DebugSection title="Surowa odpowiedz HTTP" color="#555">
              <pre style={preStyle}>{result.rawBody || "(pusta odpowiedz)"}</pre>
            </DebugSection>
          </div>
        )}
      </div>
    </main>
  );
}

function DebugSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12, border: "1px solid #222", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ background: "#161616", padding: "8px 14px", fontSize: 11, color, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ padding: "12px 14px", background: "#0d0d0d" }}>
        {children}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 12,
  padding: 32,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#888",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  marginBottom: 16,
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
  fontSize: 14,
  boxSizing: "border-box",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  color: "#ccc",
  fontSize: 12,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  fontFamily: "monospace",
};
