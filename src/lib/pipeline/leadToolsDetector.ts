import { openai } from "@/lib/openai";
import type { LeadTool } from "@/types/analysis";

/**
 * Funkcja wycina fragmenty tekstu wokół słów kluczowych
 * i łączy je, jeśli na siebie nachodzą.
 */
function reduceText(text: string, limit: number = 12000): string {
  if (text.length <= limit) return text;

  const roots = [
    "kontakt", "telef", "dzwon", "napisz",
    "konsultac", "doradz", "rozmow", "umow",
    "darmo", "bezpłat", "gratis", "prezent",
    "oferuj", "ofert", "wycen", "koszt", "cennik",
    "pobierz", "pobrania", "ebook", "poradnik", "pdf",
    "zapis", "subskryb", "newslett", "biuletyn",
    "demo", "trial", "testuj", "sprawdz", "dostęp",
    "webinar", "szkolen", "warsztat", "konf",
    "oblicz", "kalkul", "wynik",
    "czat", "chat", "wiadomośc", "pomoc"
  ];

  const regex = new RegExp(`(${roots.join('|')})`, 'gi');
  const contextRange = 340;
  const matches: { start: number; end: number }[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: Math.max(0, match.index - contextRange),
      end: Math.min(text.length, match.index + match[0].length + contextRange)
    });
  }

  if (matches.length === 0) return text.slice(0, limit);

  const merged: { start: number; end: number }[] = [];
  matches.sort((a, b) => a.start - b.start);
  
  let current = matches[0];
  for (let i = 1; i < matches.length; i++) {
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

  const processedText = reduceText(cleanText);

  const prompt = `Jesteś ekspertem Conversion Rate Optimization (CRO) i Lead Generation. 
  Twoim zadaniem jest rygorystyczna analiza dostarczonej treści pod kątem aktywnych mechanizmów pozyskiwania kontaktów (leadów).
  Odpowiedź zwróć po polsku.
  
  URL: ${url}
  WYBRANA TREŚĆ STRONY:
  ${processedText}

  ### ZADANIA:
  1. **Identyfikacja**: Znajdź wyłącznie ISTNIEJĄCE na stronie elementy (formularze, newslettery, demo, CTA kontaktu, kalkulatory, chaty, ebooki, wyceny).
  2. **Weryfikacja**: Nie wymyślaj elementów. Jeśli czegoś nie ma w tekście — nie dodawaj tego.
  3. **Kontekst**: Znajdź fragment tekstu otaczający element (sourceText) Pod żadnym pozorem nie dodawaj tutaj żanych informacji (jeśli wykryjesz że claudlare ukrył dane i jest np coś typu  [email protected] to nie zwracaj takich słów te jedynie możesz pominąć).

tutaj masz informacj co odpwoieda jakiemu typowi 
type = {
  contact_form: "Formularz kontaktowy",
  direct_contact: "Bezpośredni kontakt",
  newsletter: "Zapis na newsletter",
  chat: "Czat na stronie",
  quote_request: "Zapytanie ofertowe",
  callback: "Prośba o kontakt zwrotny",
  booking: "Rezerwacja terminu",
  application: "Formularz zgłoszeniowy",
  download: "Pobranie materiałów",
  event_signup: "Zapis na wydarzenie",
  account: "Założenie konta",
  other: "Inne",
};

  ### FORMAT WYJŚCIOWY (JSON ONLY):
  {
    "found": [
      {
        "type": "contact_form|direct_contact|newsletter|chat|quote_request|callback|booking|application|download|event_signup|account|other",
        "label": "string",
        "sourceText": "string (50-120 znaków)",
        "sourceUrl": "${url}"
      }
    ],
    "suggestion": "string lub null"
  }`;

  const res = await openai.chat.completions.create({
    model: "gpt-5.4-nano",// Szybka ekstrakcja
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const parsed = JSON.parse(res.choices[0].message.content || "{}");
  
  const found: LeadTool[] = (parsed.found || []).map((t: any) => ({
    ...t,
    sourceUrl: url,
    suggestion: false,
  }));

  if (found.length === 0 && parsed.suggestion) {
    return [{
      type: "other",
      label: "Rekomendacja",
      sourceText: "",
      sourceUrl: url,
      suggestion: true,
      suggestionText: parsed.suggestion,
    }];
  }

  return found;
}

async function aggregateResults(allFound: any[], allSuggestions: string[]): Promise<LeadTool[]> {
  const prompt = `Jesteś ekspertem ds. marketingu i wzrostu sprzedaży. Przeglądasz raport z audytu strony klienta. 
Twoim zadaniem jest wybranie najważniejszych elementów i przedstawienie ich w profesjonalny, zrozumiały sposób.

### 📝 ZASADY STYLU I KATEGORYZACJI (BARDZO WAŻNE):
1. **Precyzja nazewnictwa**: Zwykły adres e-mail (np. biuro@...) lub numer telefonu to NIE JEST formularz. Używaj dla nich typu "Informacje kontaktowe" i nazywaj je w polu label naturalnie, np. "Bezpośredni kontakt (e-mail i telefon)". Słowa "formularz" używaj TYLKO dla faktycznych, fizycznych formularzy do wypełnienia na stronie.
2. **Język**: Zawsze odpowiadaj po polsku.
3. **Brak żargonu**: Nie używaj słów takich jak "via", "lead", "CTA", "magnet". Zamiast sztucznych nazw, pisz prostym, biznesowym polskim (np. "Zapytanie ofertowe", "Zapis na newsletter").
4. **Brak długich myślników**: Nigdy nie używaj długich myślników (—). Stosuj zwykłe myślniki (-) lub przecinki.
5. **Ton**: Pisz profesjonalnie, jak doradca do właściciela firmy.
6. **Czystość**: Usuń elementy techniczne: logowanie, koszyk, weryfikację zamówień (to nie są narzędzia zdobywania klientów).
7. **Pełna widoczność danych**: W polach "label" oraz "sourceText" ZAWSZE podawaj pełne numery telefonów i adresy e-mail znalezione w źródle. Zabrania się ich maskowania lub pomijania.

### ZADANIA:
1. Z LISTY ZNALEZISK: Wybierz max 4 najważniejsze, prawdziwe sposoby kontaktu - jeśli jest ten sam typ pozyskania klienta to niepowtażaj go klika razy (Chyba że i tak się znacząco różnią). Scal duplikaty (jeśli jest ten sam e-mail i telefon w 3 miejscach, zrób z tego jeden punkt).
2. Z LISTY SUGESTII: Wybierz 2-3 najciekawsze propozycje rozwoju.
3. Połącz wszystko w jedną listę.
4. Wszyskie opisy i teksty muszą być po polsku 

LISTA ZNALEZISK:
${JSON.stringify(allFound, null, 2)}

LISTA SUGESTII:
${JSON.stringify(allSuggestions, null, 2)}

tutaj masz informacj co odpwoieda jakiemu typowi 
type = {
  contact_form: "Formularz kontaktowy",
  direct_contact: "Bezpośredni kontakt",
  newsletter: "Zapis na newsletter",
  chat: "Czat na stronie",
  quote_request: "Zapytanie ofertowe",
  callback: "Prośba o kontakt zwrotny",
  booking: "Rezerwacja terminu",
  application: "Formularz zgłoszeniowy",
  download: "Pobranie materiałów",
  event_signup: "Zapis na wydarzenie",
  account: "Założenie konta",
  other: "Inne",
};

ZWRÓĆ DOKŁADNIE TEN FORMAT JSON:
{
  "finalTools": [
    {
      "type": "contact_form|direct_contact|newsletter|chat|quote_request|callback|booking|application|download|event_signup|account|other",
      "label": "string (np. 'Bezpośredni kontakt telefoniczny', 'Formularz kontaktowy', 'Propozycja: Zapis na newsletter')",
      "sourceText": "string (cytat dla istniejących, pusty dla propozycji)",
      "sourceUrl": "string",
      "suggestion": boolean,
      "suggestionText": "string (treść porady lub null)"
    }
  ]
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const parsed = JSON.parse(res.choices[0].message.content || "{}");
  return parsed.finalTools || [];
}
export async function detectLeadTools(
  pageTexts: Map<string, string>
): Promise<LeadTool[]> {
  const tasks = Array.from(pageTexts.entries()).map(([url, text]) =>
    analyzePageForLeadTools(url, text)
  );

  const results = await Promise.allSettled(tasks);

  const rawFound: any[] = [];
  const rawSuggestions: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      result.value.forEach(item => {
        if (item.suggestion) {
          if (item.suggestionText) rawSuggestions.push(item.suggestionText);
        } else {
          rawFound.push(item);
        }
      });
    }
  }

  if (rawFound.length === 0 && rawSuggestions.length === 0) return [];

  return await aggregateResults(rawFound, rawSuggestions);
}