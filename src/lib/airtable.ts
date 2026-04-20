// ─── Airtable Analytics ───────────────────────────────────────────────────────
// Tabela: "Catchly AB"
// Wymagane kolumny w Airtable (wszystkie: Single line text):
//   Event, Email, Name, Variant, URL, AnalysisId, At

const BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;
const PAT = process.env.VITE_AIRTABLE_PAT;
const TABLE = "Catchly AB";

async function createRecord(fields: Record<string, string>) {
  if (!PAT || !BASE_ID) return;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("[airtable] błąd:", err);
    }
  } catch (e) {
    console.error("[airtable] wyjątek:", e);
  }
}

/** Wywołaj gdy użytkownik wchodzi w demo — wysyła URL + Variant + timestamp */
export function trackAnalysisStart(websiteUrl: string, analysisId: string, variant: string) {
  createRecord({
    Event: "Visit",
    URL: websiteUrl,
    AnalysisId: analysisId,
    Variant: variant,
    At: new Date().toISOString(),
  }).catch(console.error);
}

/** Wywołaj gdy użytkownik zostawia email — wysyła tylko email */
export function trackLead(email: string, analysisId: string) {
  createRecord({
    Event: "Lead",
    Email: email,
    AnalysisId: analysisId,
    At: new Date().toISOString(),
  }).catch(console.error);
}
