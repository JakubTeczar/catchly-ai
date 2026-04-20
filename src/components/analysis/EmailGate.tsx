"use client";

import { useState } from "react";

interface Props {
  analysisId: string;
  variant: "A" | "B";
  onUnlock: () => void;
}

export function EmailGate({ analysisId, variant, onUnlock }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, analysisId, variant }),
      });
      const data = await res.json();
      if (res.ok || data?.success) {
        onUnlock();
      } else {
        setError("Coś poszło nie tak. Spróbuj ponownie.");
      }
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "rgba(187,234,0,0.04)",
      border: "1px solid rgba(187,234,0,0.18)",
      borderRadius: "16px",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    }}>
      <div>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(187,234,0,0.1)",
          border: "1px solid rgba(187,234,0,0.25)",
          borderRadius: "99px",
          padding: "4px 14px",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#BBEA00",
          fontFamily: "Satoshi, sans-serif",
          marginBottom: "0.85rem",
        }}>
          ✦ Raport gotowy
        </div>
        <h3 style={{
          fontFamily: "Brockmann, sans-serif",
          fontSize: "1.25rem",
          color: "#fff",
          margin: "0 0 0.5rem",
          lineHeight: 1.3,
        }}>
          Wygenerowaliśmy propozycje popupów dla Twojej strony
        </h3>
        <p style={{
          fontFamily: "Satoshi, sans-serif",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.4)",
          margin: 0,
          lineHeight: 1.65,
        }}>
          Podaj swój email, żeby zobaczyć 3 gotowe pop-upy dopasowane do Twojej strony oraz możliwość pobrania pełnego raportu PDF.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: "420px" }}>
        <input
          type="text"
          placeholder="Twoje imię (opcjonalnie)"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "0.875rem",
            fontFamily: "Satoshi, sans-serif",
            outline: "none",
          }}
        />
        <input
          type="email"
          placeholder="Twój adres email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            padding: "10px 14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "0.875rem",
            fontFamily: "Satoshi, sans-serif",
            outline: "none",
          }}
        />
        {error && (
          <p style={{ color: "#ff6b6b", fontSize: "0.8rem", margin: 0, fontFamily: "Satoshi, sans-serif" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !email}
          style={{
            padding: "12px",
            background: "#BBEA00",
            color: "#080808",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: 700,
            fontFamily: "Brockmann, sans-serif",
            cursor: loading || !email ? "not-allowed" : "pointer",
            opacity: loading || !email ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Zapisuję..." : "Pokaż propozycje popupów →"}
        </button>
      </form>
    </div>
  );
}
