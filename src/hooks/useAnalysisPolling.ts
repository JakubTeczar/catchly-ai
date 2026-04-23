"use client";

import { useState, useEffect } from "react";
import type { AnalysisState } from "@/types/analysis";

export function useAnalysisPolling(id: string) {
  const [state, setState] = useState<AnalysisState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch(`/api/analyze/${id}`, { cache: "no-store" });
          if (!res.ok) {
            setError("Błąd podczas pobierania wyników");
            break;
          }
          const data: AnalysisState = await res.json();
          if (!cancelled) setState(data);

          if (data.status === "COMPLETED" || data.status === "FAILED") break;
        } catch {
          if (!cancelled) setError("Błąd połączenia z serwerem");
          break;
        }
        // Wait 2.5 seconds before next poll
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { state, error };
}
