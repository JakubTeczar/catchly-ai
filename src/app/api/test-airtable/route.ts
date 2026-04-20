import { NextResponse } from "next/server";

export async function GET() {
  const PAT = process.env.VITE_AIRTABLE_PAT;
  const BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;

  if (!PAT || !BASE_ID) {
    return NextResponse.json({ error: "Brak env vars", PAT: PAT ? "OK" : "BRAK", BASE_ID: BASE_ID ? "OK" : "BRAK" });
  }

  const headers = { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" };

  // 0. Lista wszystkich baz dostępnych dla tokenu
  const basesRes = await fetch(`https://api.airtable.com/v0/meta/bases`, { headers });
  const basesData = await basesRes.json();
  const allBases = (basesData.bases as Array<{ id: string; name: string }> ?? []).map(b => ({ id: b.id, name: b.name }));

  // 1. Sprawdź dostęp do bazy (lista tabel)
  const metaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, { headers });
  const metaData = await metaRes.json();

  if (!metaRes.ok) {
    return NextResponse.json({ step: "meta (lista tabel)", status: metaRes.status, error: metaData, wszystkie_bazy: allBases });
  }

  const tableNames = (metaData.tables as Array<{ name: string }> ?? []).map(t => t.name);

  // 2. Próba zapisu do tabeli
  const TABLE = "Catchly AB";
  if (!tableNames.includes(TABLE)) {
    return NextResponse.json({ step: "zapis", error: `Tabela "${TABLE}" nie istnieje`, dostepne_tabele: tableNames, wszystkie_bazy: allBases });
  }

  const writeRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ fields: { Event: "TEST", URL: "https://test.pl", AnalysisId: "test-123", At: new Date().toISOString() } }),
  });
  const writeData = await writeRes.json();

  return NextResponse.json({ step: "zapis", status: writeRes.status, dostepne_tabele: tableNames, airtable: writeData });
}
