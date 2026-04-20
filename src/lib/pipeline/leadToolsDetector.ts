import { openai } from "@/lib/openai";
import type { LeadTool } from "@/types/analysis";

/**
 * Funkcja wycina fragmenty tekstu wokół słów kluczowych
 * i łączy je, jeśli na siebie nachodzą.
 */
function reduceText(text: string, limit: number = 12000): string {
  if (text.length <= limit) return text;

  // Używamy rdzeni słów, aby złapać wszystkie odmiany (np. "konf" złapie "konferencja", "konferencji")
  const roots = [
    "kontakt", "telef", "dzwon", "napisz", // kontakt
    "konsultac", "doradz", "rozmow", "umow", // konsultacje/rozmowy
    "darmo", "bezpłat", "gratis", "prezent", // darmowe rzeczy
    "oferuj", "ofert", "wycen", "koszt", "cennik", // oferta/wycena
    "pobierz", "pobrania", "ebook", "poradnik", "pdf", // content gate
    "zapis", "subskryb", "newslett", "biuletyn", // newsletter
    "demo", "trial", "testuj", "sprawdz", "dostęp", // demo/trial
    "webinar", "szkolen", "warsztat", "konf", // wydarzenia
    "oblicz", "kalkul", "wynik", // kalkulatory
    "czat", "chat", "wiadomośc", "pomoc" // chat
  ];

  // Regex szuka rdzeni, które zaczynają się od litery (pomija środek słowa dla precyzji)
  // Szukamy fraz, które zaczynają się od naszych rdzeni
  const regex = new RegExp(`(${roots.join('|')})`, 'gi');
  const contextRange = 200; // Zwiększony kontekst, żeby złapać pełne zdania (ok. 50-150 znaków)
  const matches: { start: number; end: number }[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: Math.max(0, match.index - contextRange),
      end: Math.min(text.length, match.index + match[0].length + contextRange)
    });
  }

  if (matches.length === 0) return text.slice(0, limit);

  // Inteligentne łączenie nakładających się fragmentów
  const merged: { start: number; end: number }[] = [];
  matches.sort((a, b) => a.start - b.start);
  
  let current = matches[0];
  for (let i = 1; i < matches.length; i++) {
    // Jeśli fragmenty nachodzą na siebie lub są bardzo blisko (do 100 znaków), łączymy je
    if (matches[i].start <= current.end + 100) {
      current.end = Math.max(current.end, matches[i].end);
    } else {
      merged.push(current);
      current = matches[i];
    }
  }
  merged.push(current);

  return merged
    .map(m => text.slice(m.start, m.end).trim())
    .join("\n\n[...] ")
    .slice(0, limit);
}

async function analyzePageForLeadTools(url: string, text: string): Promise<LeadTool[]> {
  const cleanText = text.trim();
  if (!cleanText) return [];

  // Wywołanie naszej redukcji
  const processedText = reduceText(cleanText);

  const prompt = `Analizujesz treść podstrony firmy pod kątem lead generation.

URL: ${url}
Treść strony (wyselekcjonowane fragmenty):
${processedText}

ZADANIE 1 — Znajdź istniejące narzędzia lead gen:
Szukaj: formularzy, newsletterów, demo/triala, CTA do kontaktu, kalkulatorów, chatów, ebooków, webinarów, darmowych konsultacji, wycen.
Zwróć tylko to, co FAKTYCZNIE istnieje. 

Wymóg techniczny: "sourceText" MUSI być dosłownym cytatem ze strony o długości od 50 do 150 znaków, pokazującym kontekst danego elementu.

ZADANIE 2 — Jeśli nic nie znaleziono:
Zaproponuj JEDEN konkretny lead gen (max 2 zdania).

Zwróć JSON:
{
  "found": [
    {
      "type": "consultation|newsletter|demo|trial|ebook|webinar|calculator|chat|contact_form|other",
      "label": "nazwa przycisku/elementu",
      "sourceText": "dosłowny cytat 50-150 znaków",
      "sourceUrl": "${url}"
    }
  ],
  "suggestion": "tekst sugestii lub null"
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 800, // Zwiększone dla dłuższych cytatów
    temperature: 0,
  });

  const parsed = JSON.parse(res.choices[0].message.content || "{}");
  
  // Mapowanie wyników
  const found: LeadTool[] = (parsed.found || []).map((t: any) => ({
    ...t,
    sourceUrl: url,
    suggestion: false,
  }));

  if (found.length === 0 && parsed.suggestion) {
    return [{
      type: "other",
      label: "Propozycja dla tej podstrony",
      sourceText: "",
      sourceUrl: url,
      suggestion: true,
      suggestionText: parsed.suggestion,
    }];
  }

  return found;
}

export async function detectLeadTools(
  pageTexts: Map<string, string>
): Promise<LeadTool[]> {
  const tasks = Array.from(pageTexts.entries()).map(([url, text]) =>
    analyzePageForLeadTools(url, text)
  );

  const results = await Promise.allSettled(tasks);

  const allTools: LeadTool[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allTools.push(...result.value);
    }
  }

  // Deduplicate real findings by label; deduplicate suggestions by content
  const seenLabels = new Set<string>();
  const seenSuggestions = new Set<string>();
  const realTools: LeadTool[] = [];
  const suggestions: LeadTool[] = [];

  for (const tool of allTools) {
    if (tool.suggestion) {
      const key = (tool.suggestionText ?? "").toLowerCase().slice(0, 60);
      if (!seenSuggestions.has(key)) {
        seenSuggestions.add(key);
        suggestions.push(tool);
      }
    } else {
      const key = tool.label.toLowerCase().trim();
      if (!seenLabels.has(key)) {
        seenLabels.add(key);
        realTools.push(tool);
      }
    }
  }

  return [...realTools, ...suggestions.slice(0, 4)];
}
