import { openai } from "@/lib/openai";
import { scrapeUrl, extractText } from "./scraper";
import type { SubpageSummary } from "@/types/analysis";

const JUNK_PATTERNS =
  /\/(login|logowanie|koszyk|cart|checkout|kasa|rejestracja|register|search|szukaj|tag|autor|author|sitemap|404|403)\b|\?page=|\/page\/\d|\/p\/\d/i;

/**
 * KROK 1 (kod): usuwa śmieciowe URL-e i ogranicza duplikaty wzorcowe.
 * ≤100 linków → bez grupowania, wszystko leci do AI.
 * >100 linków → grupuje po segmencie ścieżki (max 2 z grupy).
 *   Jeśli jeden segment dominuje w ≥80% linków (np. /pl/, /en/), jest traktowany
 *   jako prefix i grupowanie odbywa się po kolejnym segmencie.
 */
function preFilterLinks(links: string[]): string[] {
  // Step 1: dedup + junk removal
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const url of links) {
    if (seen.has(url)) continue;
    seen.add(url);
    if (JUNK_PATTERNS.test(url)) continue;
    try { new URL(url); } catch { continue; }
    clean.push(url);
  }

  // Step 2: ≤100 → AI poradzi sobie sam
  if (clean.length <= 100) {
    console.log(`[preFilter] ${links.length} → ${clean.length} (bez grupowania)`);
    return clean;
  }

  // Step 3: >100 → wykryj dominujący prefix (≥80% linków)
  const segCount = new Map<string, number>();
  for (const url of clean) {
    try {
      const seg = new URL(url).pathname.split("/").filter(Boolean)[0] || "__root__";
      segCount.set(seg, (segCount.get(seg) ?? 0) + 1);
    } catch {}
  }
  const [topSeg, topCount] = [...segCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const useSecondSegment = topCount / clean.length >= 0.8;

  if (useSecondSegment) {
    console.log(`[preFilter] wykryto dominujący prefix "/${topSeg}/" (${topCount}/${clean.length} linków) → grupuję po 2. segmencie`);
  }

  // Step 4: grupowanie max 2 z grupy
  const groups = new Map<string, number>();
  const result: string[] = [];
  for (const url of clean) {
    try {
      const segments = new URL(url).pathname.split("/").filter(Boolean);
      const groupKey = useSecondSegment
        ? (segments[1] || segments[0] || "__root__")
        : (segments[0] || "__root__");
      const count = groups.get(groupKey) ?? 0;
      if (count >= 2) continue;
      groups.set(groupKey, count + 1);
      result.push(url);
    } catch {}
  }

  console.log(`[preFilter] ${links.length} → ${result.length} linków po grupowaniu`);
  return result;
}

async function summarizePage(url: string): Promise<{ summary: SubpageSummary; text: string; html: string } | null> {
  try {
    const html = await scrapeUrl(url);
    const text = extractText(html);

    if (text.length < 50) return null;

    const prompt = `Na podstawie treści poniższej strony internetowej napisz w języku polskim:
        1. Krótką nazwę/tytuł tej podstrony (max 5 słów)
        2. Opis w 1-2 zdaniach co oferuje/zawiera ta strona
        3. Maksymalnie 3 unikalne, ciekawe informacje o firmie/ofercie (tylko jeśli są naprawdę wartościowe i specyficzne dla tej strony)

Zasady pisania: nie używaj długich myślników (—). Zamiast nich używaj przecinka lub przepisz zdanie bez myślnika.

Tekst strony (${url}):
${text}

Zwróć JSON: {"name": "...", "description": "...", "bullets": ["...", "..."]}`;

    const res = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 400,
    });

    const parsed = JSON.parse(res.choices[0].message.content || "{}");
    return {
      summary: {
        url,
        name: parsed.name || url,
        description: parsed.description || "",
        bullets: parsed.bullets || [],
      },
      text,
      html,
    };
  } catch {
    return null;
  }
}

/** Scrape only — no summary, just raw text for lead gen analysis */
async function scrapeTextOnly(url: string): Promise<{ url: string; text: string; html: string } | null> {
  try {
    const html = await scrapeUrl(url);
    const text = extractText(html);
    if (text.length < 50) return null;
    return { url, text, html };
  } catch {
    return null;
  }
}

/**
 * KROK 2 (AI): wybiera max 6 najlepszych linków z przefiltrowanej listy.
 * KROK 3 (kod): weryfikuje że AI zwróciło tylko linki z wejściowej listy.
 */
async function selectBestLinks(links: string[], baseUrl: string): Promise<string[]> {
  const inputSet = new Set(links);

  const prompt = `Jesteś ekspertem od analizy biznesowej. Otrzymasz listę linków z danej strony internetowej (${baseUrl}).
Wybierz maksymalnie 6 najbardziej wartościowych podstron, które najlepiej pomogą zrozumieć:
- Czym zajmuje się firma i co oferuje
- Unikalne przewagi konkurencyjne
- Podejście, proces, case studies
- Cennik, kontakt, oferta

WAŻNE: Zwróć WYŁĄCZNIE URL-e z poniższej listy — nie dodawaj żadnych nowych, nie modyfikuj istniejących.

Zwróć JSON: {"best_links": ["url1", "url2", ...]}

Lista linków:
${links.join("\n")}`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 400,
    });

    const parsed = JSON.parse(res.choices[0].message.content || "{}");
    const aiResult: string[] = parsed.best_links || [];

    // Weryfikacja: tylko URL-e które faktycznie były na wejściu
    const verified = aiResult.filter((u) => inputSet.has(u));
    const rejected = aiResult.filter((u) => !inputSet.has(u));
    if (rejected.length > 0) {
      console.warn(`[selectBestLinks] AI wymyśliło ${rejected.length} URL-i spoza listy:`, rejected);
    }
    console.log(`[selectBestLinks] AI wybrało ${verified.length} z ${inputSet.size} dostępnych`);
    return verified.slice(0, 6);
  } catch (e) {
    console.error("[selectBestLinks] Błąd AI, fallback na pierwsze 6:", e);
    return links.slice(0, 6);
  }
}

const LEAD_GEN_URL_PATTERNS =
  /\/(contact|kontakt|kontakty|contact-us|get-in-touch|formularz|form|pricing|cennik|price|demo|signup|sign-up|register|rejestracja|trial|wycena|oferta|offer|konsultacja|consultation|zapis|subscribe|newsletter|bezplatna|free)\b/i;

/** Wybiera linki specyficznie pod kątem lead gen.
 *  Dwa niezależne mechanizmy:
 *  1. Heurystyka URL — zawsze wyłapuje strony kontaktowe/formularzowe po słowach kluczowych
 *  2. AI — niezależnie szuka swoich 1-2 stron z potencjałem lead gen
 *  Wyniki są addytywne (nie uzupełniają się do limitu).
 */
async function selectLeadGenLinks(allLinks: string[], alreadySelected: string[]): Promise<string[]> {
  const inputSet = new Set(allLinks);
  const result = new Set<string>();

  // 1. Heurystyka: oczywiste URL-e lead gen z CAŁEJ listy linków
  const obvious = allLinks
    .filter((l) => !alreadySelected.includes(l) && LEAD_GEN_URL_PATTERNS.test(l))
    .slice(0, 2);
  for (const l of obvious) result.add(l);

  // 2. AI niezależnie szuka swoich kandydatów (z linków jeszcze niewybranych)
  const remaining = allLinks.filter((l) => !alreadySelected.includes(l) && !result.has(l));
  if (remaining.length > 0) {
    const prompt = `Masz listę URLi ze strony internetowej. Wybierz maksymalnie 2 linki, które mogą zawierać elementy lead generation inne niż oczywiste strony kontaktowe:
np. strony z cenami, landing page z ofertą, strona z demo/trial, zapis na webinar, strona z ebookiem, kalkulator wyceny, strona "Jak działamy" z formularzem itp.

Nie wybieraj jeśli żaden link nie pasuje — lepiej zwrócić pustą tablicę niż zgadywać.

WAŻNE: Zwróć WYŁĄCZNIE URL-e z poniższej listy — nie dodawaj żadnych nowych.

Linki:
${remaining.slice(0, 50).join("\n")}

Zwróć JSON: {"leadgen_links": ["url1", "url2"]}`;

    try {
      const res = await openai.chat.completions.create({
        model: "gpt-5.4-nano",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 200,
      });
      const parsed = JSON.parse(res.choices[0].message.content || "{}");
      for (const l of (parsed.leadgen_links || []).slice(0, 2)) {
        // Weryfikacja: tylko URL-e które były w oryginalnej liście
        if (inputSet.has(l)) {
          result.add(l);
        } else {
          console.warn(`[selectLeadGenLinks] AI wymyśliło URL spoza listy: ${l}`);
        }
      }
    } catch {
      // AI failed — heurystyka wystarczy
    }
  }

  return Array.from(result);
}

export async function analyzeSubpages(
  links: string[],
  baseUrl: string
): Promise<{ summaries: SubpageSummary[]; pageTexts: Map<string, string>; pageHtmls: Map<string, string> }> {
  // KROK 1 (kod): wstępna filtracja — usuwa śmieciowe URL-e i duplikaty wzorcowe
  const filteredLinks = preFilterLinks(links);

  // KROK 2 (AI): wybiera max 6 najlepszych z przefiltrowanej listy
  // KROK 3 (kod): weryfikuje że AI zwróciło tylko linki z filteredLinks
  console.log(`[AI Selection] Wybieranie najlepszych spośród ${filteredLinks.length} linków...`);
  const topLinks = await selectBestLinks(filteredLinks, baseUrl);

  // Homepage zawsze na początku
  const contentLinksToScrape = Array.from(new Set([baseUrl, ...topLinks]));
  console.log(`[Scraping] Podstrony do analizy treści:`, contentLinksToScrape);

  // Lead gen: heurystyka + AI, też tylko z filteredLinks
  const leadGenLinks = await selectLeadGenLinks(filteredLinks, contentLinksToScrape);
  console.log(`[Lead Gen] Dodatkowe podstrony dla lead gen:`, leadGenLinks);

  // KROK 5: Równoległe scrapowanie — content pages + lead gen pages
  const [contentResults, leadGenResults] = await Promise.all([
    Promise.allSettled(contentLinksToScrape.map(summarizePage)),
    Promise.allSettled(leadGenLinks.map(scrapeTextOnly)),
  ]);

  const summaries: SubpageSummary[] = [];
  const pageTexts = new Map<string, string>();
  const pageHtmls = new Map<string, string>();

  for (const result of contentResults) {
    if (result.status === "fulfilled" && result.value !== null) {
      summaries.push(result.value.summary);
      pageTexts.set(result.value.summary.url, result.value.text);
      pageHtmls.set(result.value.summary.url, result.value.html);
    }
  }

  // Lead gen pages — tylko tekst, nie idą do summaries (nie pokazujemy ich w SubpagesSection)
  for (const result of leadGenResults) {
    if (result.status === "fulfilled" && result.value !== null) {
      const { url, text, html } = result.value;
      if (!pageTexts.has(url)) {
        pageTexts.set(url, text);
      }
      if (!pageHtmls.has(url)) {
        pageHtmls.set(url, html);
      }
    }
  }

  return { summaries, pageTexts, pageHtmls };
}
