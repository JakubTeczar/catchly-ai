import { openai } from "@/lib/openai";
import { scrapeUrl } from "./scraper";
import type { ProductItem, ProductsData, LeadTool } from "@/types/analysis";
import type { LogFn } from "./logger";

// ─── Konfiguracja ─────────────────────────────────────────────────────────────

const PRICE_REGEX  = /(?:zł|PLN|złot[ych|ego]+|€|EUR|USD|price|cen[ay])/gi;
const WINDOW       = 2000;  // znaków w każdą stronę od poszlaki cenowej
const MIN_CLUES    = 16;     // min poszlak na stronie żeby nie szukać dalej
const MAX_PRODUCTS = 6;    // max produktów w wyniku końcowym
const MAX_WINDOWS  = 60;    // max okien wycinanych per strona
const MAX_BATCHES  = 6;     // max batchy GPT per wywołanie
const BATCH_SIZE   = 6;     // okien per batch GPT

// ─── Helper: cleanHtmlForGpt ─────────────────────────────────────────────────
// Bezpieczne czyszczenie: usuwa tylko bloki bez wartości produktowej
// (skrypty, style, SVG, komentarze). Struktura HTML zostaje nienaruszona.

function cleanHtmlForGpt(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Helper: extractWindows ───────────────────────────────────────────────────
// Czyści HTML z whitespace, znajduje poszlaki cenowe regexem,
// wycina okna ±WINDOW znaków, scala nakładające się.

function extractWindows(html: string): string[] {
  // 1. Wyciągnij tylko zawartość body (jeśli istnieje)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch || !bodyMatch[1]) {
    console.warn("Nie znaleziono <body>");
  }

  // 2. Usuń SVG, skrypty, style, komentarze — zachowaj strukturę HTML
  let content = cleanHtmlForGpt(bodyMatch ? bodyMatch[1] : html);

  const regex = new RegExp(PRICE_REGEX.source, "gi");

  console.log("Content LENGTH",content.length);

  const positions: number[] = [];
  let m: RegExpExecArray | null;
  
  // 3. Szukaj pozycji wewnątrz oczyszczonego contentu
  while ((m = regex.exec(content)) !== null) positions.push(m.index);
  if (positions.length === 0) return [];

  positions.sort((a, b) => a - b);
  const ranges: { s: number; e: number }[] = [];
  for (const pos of positions) {
    const s = Math.max(0, pos - WINDOW);
    const e = Math.min(content.length, pos + WINDOW);
    if (ranges.length > 0 && s <= ranges[ranges.length - 1].e) {
      ranges[ranges.length - 1].e = Math.max(ranges[ranges.length - 1].e, e);
    } else {
      ranges.push({ s, e });
    }
  }

  return ranges.slice(0, MAX_WINDOWS).map((r) => content.slice(r.s, r.e));
}

// ─── Helper: gptExtractProducts ──────────────────────────────────────────────
// Bierze gotowe okna HTML, wysyła do GPT w batchach, zwraca produkty.
// imageUrl jest konwertowany na absolutny URL względem pageUrl.

async function gptExtractProducts(
  windows: string[],
  pageUrl: string,
  log: LogFn = console.log
): Promise<ProductItem[]> {
  if (windows.length === 0) return [];

  const allProducts: ProductItem[] = [];
  
  log(`[ALL WINDOWS] ${windows}`);
  const totalBatches = Math.min(MAX_BATCHES, Math.ceil(windows.length / BATCH_SIZE));

  for (let i = 0; i < totalBatches * BATCH_SIZE; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batchWindows = windows.slice(i, i + BATCH_SIZE);
    if (batchWindows.length === 0) break;

    const snippets = batchWindows
      .map((w, idx) => `<Fragment ${idx + 1} Html>\n${w}\n</Fragment ${idx + 1} Html>`)
      .join("\n\n");

    const prompt =
        `Jesteś precyzyjnym ekstraktorem danych produktowych. Przeanalizuj fragmenty HTML i wyciągnij produkty.

        Zasady:
        1. name: Pełna nazwa produktu (max 80 znaków), oczyszczona ze znaczników HTML.
        2. price: Aktualna cena z walutą (np. "29,99 zł"). Ignoruj ceny przekreślone i raty.
        3. imageUrl: URL zdjęcia z atrybutu src/data-src/srcset w <img>. Jeśli brak → null. Nie wymyślaj.

        WAŻNE: Jeden fragment może zawierać więcej niż jeden produkt — wyciągnij wszystkie.
        Filtruj: koszty dostawy, elementy nawigacji, banery bez produktu.

        Fragmenty:
        ${snippets}

        Zwróć WYŁĄCZNIE JSON: {"products": [{"name": "...", "price": "...", "imageUrl": "..."}]}`;

        log(`[GPT] batch ${batchNum}/${totalBatches} | okna ${i + 1}-${i + batchWindows.length}\n${"─".repeat(60)}\n${prompt}\n${"─".repeat(60)}`);

    try {
      const res = await openai.chat.completions.create({
        model: "gpt-5.4-nano",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 12000,
      });
      
      log(`[GPT] batch ${batchNum} tokens: prompt=${res.usage?.prompt_tokens} completion=${res.usage?.completion_tokens} total=${res.usage?.total_tokens}`);

      const parsed = JSON.parse(res.choices[0].message.content || "{}");
      const batch = (parsed.products || []).filter(
        (p: { name?: string; price?: string }) => p.name && p.price
      );
      log(`[GPT] batch ${batchNum}/${totalBatches} → ${batch.length} produktów`);

      for (const p of batch) {
        let imageUrl: string | undefined;
        if (typeof p.imageUrl === "string" && p.imageUrl) {
          try { imageUrl = new URL(p.imageUrl, pageUrl).href; } catch { /* ignore */ }
        }
        allProducts.push({
          name: String(p.name).slice(0, 120),
          price: String(p.price),
          imageUrl,
          pageUrl,
        });
      }

      const complete = allProducts.filter(p => p.name && p.price && p.imageUrl);
      log(`[GPT] batch ${batchNum}/${totalBatches} | kompletne (name+price+image): ${complete.length}`);
      if (complete.length >= MAX_PRODUCTS) {
        log(`[GPT] Zebrano ${complete.length} kompletnych produktów → przerywam batche`);
        break;
      }
    } catch (e) {
      log(`[GPT] batch ${batchNum}/${totalBatches} BŁĄD: ${e}`);
    }
  }

  const seen = new Set<string>();
  return allProducts.filter((p) => {
    const key = p.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Helper: scanPage ─────────────────────────────────────────────────────────
// Łączy extractWindows + gptExtractProducts dla jednej strony.

async function scanPage(
  html: string,
  pageUrl: string,
  log: LogFn = console.log
): Promise<{ windows: string[]; products: ProductItem[] }> {
  const windows = extractWindows(html);
  log(`[scan] ${pageUrl} | ${html.length} znaków | poszlaki: ${windows.length}`);
  windows.forEach((w, i) => log(`[scan] okno [${i + 1}/${windows.length}]: ${w}`));

  if (windows.length === 0) return { windows: [], products: [] };

  const products = await gptExtractProducts(windows, pageUrl, log);
  log(`[scan] ${pageUrl} → ${products.length} produktów`);
  return { windows, products };
}

// ─── Helper: findProductLinks ────────────────────────────────────────────────
// Pyta GPT: "czy jest tu 8+ linków do bezpośrednich produktów? jeśli tak daj je.
// Jeśli nie — daj 1 link do kategorii/listingu z wieloma produktami."

type ProductLinksResult =
  | { type: "direct"; links: string[] }
  | { type: "category"; link: string }
  | { type: "none" };

async function findProductLinks(
  links: string[],
  baseUrl: string,
  usedLinks: Set<string>,
  previouslyChosen: string[],
  log: LogFn = console.log
): Promise<ProductLinksResult> {
  const sample = links.filter(l => !usedLinks.has(l)).slice(0, 100);
  if (sample.length === 0) return { type: "none" };

  log(`[findLinks] Analizuję ${sample.length} linków (użyte: ${usedLinks.size})`);
  log(`[findLinks] Linki:\n${sample.join("\n")}`);

  const historyNote = previouslyChosen.length > 0
    ? `\nKONTEKST: Poprzednio próbowaliśmy tych linków, ale nie znaleźliśmy produktów:\n${previouslyChosen.join("\n")}\n Idź w podobnym kierunku (ta sama kategoria/sekcja sklepu).\n`
    : "";

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{
        role: "user",
        content:
          `Strona: ${baseUrl}
          Lista linków:
          ${sample.join("\n")}
          ${historyNote}
          Zadanie: pomóż znaleźć produkty na tej stronie. Odpowiedz w formacie JSON.

          OPCJA A — jeśli widzisz w tej liście co najmniej 8 linków prowadzących bezpośrednio do pojedynczych stron produktów (np. /produkt/nazwa, /p/123, /item/) → zwróć je:
          {"type": "direct", "links": ["url1", "url2", ...]}

          OPCJA B — jeśli nie ma 8 bezpośrednich linków produktowych, ale jest link do strony z listingiem/kategorią produktów (np. /sklep, /produkty, /kategoria, /shop) → zwróć 1 taki link:
          {"type": "category", "link": "url"}

          OPCJA C — jeśli nie ma nic użytecznego:
          {"type": "none"}

          WAŻNE: Zwracaj WYŁĄCZNIE URL-e z podanej listy. Nie wymyślaj nowych.`,
      }],
      response_format: { type: "json_object" },
      max_completion_tokens: 800,
      temperature: 0,
    });
    log(`[findLinks] Message: Strona: ${baseUrl}
          Lista linków:
          ${sample.join("\n")}
          ${historyNote}
          Zadanie: pomóż znaleźć produkty na tej stronie. Odpowiedz w formacie JSON.

          OPCJA A — jeśli widzisz w tej liście co najmniej 8 linków prowadzących bezpośrednio do pojedynczych stron produktów (np. /produkt/nazwa, /p/123, /item/) → zwróć je:
          {"type": "direct", "links": ["url1", "url2", ...]}

          OPCJA B — jeśli nie ma 8 bezpośrednich linków produktowych, ale jest link do strony z listingiem/kategorią produktów (np. /sklep, /produkty, /kategoria, /shop) → zwróć 1 taki link:
          {"type": "category", "link": "url"}

          OPCJA C — jeśli nie ma nic użytecznego:
          {"type": "none"}

          WAŻNE: Zwracaj WYŁĄCZNIE URL-e z podanej listy. Nie wymyślaj nowych.`);

    const parsed = JSON.parse(res.choices[0].message.content || "{}");
    const inputSet = new Set(sample);

    if (parsed.type === "direct" && Array.isArray(parsed.links)) {
      const verified = parsed.links.filter((l: string) => inputSet.has(l));
      log(`[findLinks] OPCJA A: ${verified.length} bezpośrednich linków produktowych`);
      if (verified.length >= 2) return { type: "direct", links: verified };
    }

    if (parsed.type === "category" && typeof parsed.link === "string") {
      if (inputSet.has(parsed.link)) {
        log(`[findLinks] OPCJA B: kategoria → ${parsed.link}`);
        return { type: "category", link: parsed.link };
      }
      log(`[findLinks] AI wymyśliło link spoza listy: ${parsed.link}`);
    }

    log(`[findLinks] OPCJA C: brak użytecznych linków`);
    return { type: "none" };
  } catch (e) {
    log(`[findLinks] BŁĄD GPT: ${e}`);
    return { type: "none" };
  }
}

// ─── Helper: validateImageUrl ─────────────────────────────────────────────────
// Sprawdza czy URL obrazka faktycznie istnieje (HEAD request).

async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const content = await scrapeUrl(imageUrl, false, false);
    return content.length > 0;
  } catch {
    return false;
  }
}

// ─── Helper: filterValidProducts ─────────────────────────────────────────────
// Dla produktów z name+price+imageUrl sprawdza czy obrazek faktycznie istnieje.
// Produkty bez imageUrl przechodzą bez walidacji.
const imageValidationCache = new Map<string, boolean>();

// Zaktualizowana funkcja filterValidProducts
async function filterValidProducts(
  products: ProductItem[],
  targetCount: number, // <--- NOWOŚĆ: podajemy ile produktów potrzebujemy
  log: LogFn = console.log
): Promise<ProductItem[]> {
  const CONCURRENCY_LIMIT = 5;
  const DELAY_BETWEEN_BATCHES = 300;
  const validProducts: ProductItem[] = [];

  for (let i = 0; i < products.length; i += CONCURRENCY_LIMIT) {
    // 🛑 EARLY EXIT: Jeśli mamy już wymaganą liczbę produktów, przerywamy weryfikację!
    if (validProducts.length >= targetCount) {
      log(`[imgValidate] Zebrano już ${targetCount} produktów z działającymi obrazkami. Przerywam skanowanie reszty.`);
      break;
    }

    const batch = products.slice(i, i + CONCURRENCY_LIMIT);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (p) => {
        if (!p.imageUrl) return p;
        
        if (imageValidationCache.has(p.imageUrl)) {
          return imageValidationCache.get(p.imageUrl) ? p : null;
        }

        const valid = await validateImageUrl(p.imageUrl);
        imageValidationCache.set(p.imageUrl, valid);
        log(`[imgValidate] ${valid ? "✓" : "✗"} ${p.imageUrl}`);
        
        return valid ? p : null;
      })
    );

    // Wyciąganie poprawnych wyników z batcha
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value !== null) {
        validProducts.push(r.value);
        
        // Możemy dorzucić bezpiecznik wewnątrz samego batcha, 
        // żeby nie dodać np. 8 produktów, jeśli chcemy 6.
        if (validProducts.length >= targetCount) break;
      }
    }

    // Odczekaj chwilę tylko, jeśli pętla ma iść dalej
    if (i + CONCURRENCY_LIMIT < products.length && validProducts.length < targetCount) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  return validProducts;
}
// ─── Helper: deduplicateProducts ─────────────────────────────────────────────

function deduplicateProducts(products: ProductItem[]): ProductItem[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Per-domain render cache ──────────────────────────────────────────────────
// Śledzi czy domena wymaga render=true. Raz wykryte, cachuje na czas sesji.
const domainRenderCache = new Map<string, boolean>();

/**
 * Scrapuje URL z automatycznym wykrywaniem czy potrzebny jest render.
 * Przy pierwszej wizycie na domenie startuje OBA żądania równolegle.
 * Jeśli no-render ma poszlaki cenowe → używa go (szybciej), render ignoruje.
 * Jeśli no-render bez poszlak → czeka na render (który już się gotuje).
 * Kolejne scrape tej samej domeny → używa cache (1 żądanie).
 */
async function scrapeSmartRender(url: string, log: LogFn): Promise<string> {
  const domain = new URL(url).hostname;

  if (domainRenderCache.has(domain)) {
    const needsRender = domainRenderCache.get(domain)!;
    log(`[scrape] ${url} | render=${needsRender} (cache dla ${domain})`);
    return scrapeUrl(url, false, needsRender);
  }

  log(`[scrape] ${url} | nieznana domena → 2 równoległe żądania (render + no-render)`);
  const noRenderPromise = scrapeUrl(url, false, false).catch((e: unknown) => {
    log(`[scrape] no-render błąd: ${e}`);
    return null;
  });
  const renderPromise = scrapeUrl(url, false, true).catch((e: unknown) => {
    log(`[scrape] render błąd: ${e}`);
    return null;
  });

  // Czekaj na no-render (szybsze) i sprawdź poszlaki
  const noRenderHtml = await noRenderPromise;
  const noRenderClues = noRenderHtml ? extractWindows(noRenderHtml).length : 0;
  log(`[scrape] ${url} | no-render → ${noRenderClues} poszlak`);

  if (noRenderClues > 0) {
    domainRenderCache.set(domain, false);
    log(`[scrape] ${domain} → cache: render=false`);
    return noRenderHtml!;
  }

  // Brak poszlak bez render → czekaj na render (już się gotuje w tle)
  const renderHtml = await renderPromise;
  const renderClues = renderHtml ? extractWindows(renderHtml).length : 0;
  domainRenderCache.set(domain, true);
  log(`[scrape] ${url} | render → ${renderClues} poszlak | ${domain} → cache: render=true`);
  return renderHtml ?? noRenderHtml ?? "";
}

// ═══ MAIN: smartExtractProducts ══════════════════════════════════════════════
//
//  Flow:
//  1. Skanuj homepage → jeśli >= MIN_CLUES poszlak → zwróć
//  2. AI: "8 bezpośrednich linków produktowych ALBO 1 link do kategorii"
//     A) direct → scrapuj wszystkie → połącz z homepage → zwróć
//     B) category → scrapuj → jeśli brak → próba 2: zapytaj AI ponownie
//  3. Brak produktów → service

export async function smartExtractProducts(
  homepageHtml: string,
  homepageUrl: string,
  allLinks: string[],
  log: LogFn = console.log
): Promise<ProductsData> {
  log(`[smart] ═══ START | ${homepageUrl} | linki: ${allLinks.length} ═══`);

  // ── 1. Skan homepage ──────────────────────────────────────────────────────
  log(`[smart] ─── KROK 1: skan homepage ───`);
  const { windows: homeWindows, products: homeProducts } = await scanPage(homepageHtml, homepageUrl, log);
  
  const finalValidProducts: ProductItem[] = [];

  if (homeWindows.length >= MIN_CLUES) {
    log(`[smart] ✓ Wystarczy poszlak na homepage → walidacja`);
    const deduped = deduplicateProducts(homeProducts);
    const validated = await filterValidProducts(deduped, MAX_PRODUCTS, log);
    finalValidProducts.push(...validated);
    
    if (finalValidProducts.length >= MAX_PRODUCTS) {
      return { businessType: "product", products: finalValidProducts.slice(0, MAX_PRODUCTS) };
    }
  }

  // ── 2. Próby przez AI ─────────────────────────────────────────────────────
  const usedLinks = new Set<string>([homepageUrl]);
  const previouslyChosen: string[] = [];
  const backgroundTasks: Promise<void>[] = []; // Zadania kumulują się między próbami
  let stopRequested = false;

  for (let attempt = 1; attempt <= 5; attempt++) {
    if (stopRequested || finalValidProducts.length >= MAX_PRODUCTS) break;

    log(`[smart] ─── KROK 2 (próba ${attempt}/5): AI szuka linków ───`);
    const result = await findProductLinks(allLinks, homepageUrl, usedLinks, previouslyChosen, log);

    if (result.type === "none") {
      log(`[smart] Próba ${attempt}: AI nie znalazło nowych linków.`);
      // Jeśli AI nic nie znalazło, dajemy szansę zadaniom, które już działają w tle
      if (backgroundTasks.length > 0) {
        log(`[smart] Czekam na zadania z tła (ostatnia szansa)...`);
        await Promise.allSettled(backgroundTasks);
      }
      break;
    }

    const linksToScrape = (result.type === "direct" ? result.links : [result.link]).slice(0, 9);
    for (const link of linksToScrape) {
      usedLinks.add(link);
      previouslyChosen.push(link);
    }

    // Odpalamy linki z bieżącej próby
    for (const link of linksToScrape) {
      if (stopRequested || finalValidProducts.length >= MAX_PRODUCTS) break;

      log(`[smart] Scrapuję: ${link} (soft timeout 4s)`);

      const task = (async () => {
        if (stopRequested) return;
        try {
          // UWAGA: Tu możesz dodać twardy timeout dla samego scrapeUrl jeśli Twoja funkcja go nie ma
          const html = await scrapeSmartRender(link, log);
          if (stopRequested) return;
          
          const { products } = await scanPage(html, link, log);
          if (stopRequested || products.length === 0) return;

          const newProducts = products.filter(p => 
            !finalValidProducts.some(fp => fp.name.toLowerCase().trim() === p.name.toLowerCase().trim())
          );
          
          const missingCount = MAX_PRODUCTS - finalValidProducts.length;
          if (missingCount <= 0) { stopRequested = true; return; }

          const validatedFromPage = await filterValidProducts(newProducts, missingCount, log);
          
          for (const v of validatedFromPage) {
            if (finalValidProducts.length < MAX_PRODUCTS && 
                !finalValidProducts.some(fp => fp.name.toLowerCase().trim() === v.name.toLowerCase().trim())) {
              finalValidProducts.push(v);
            }
          }

          if (finalValidProducts.length >= MAX_PRODUCTS) stopRequested = true;
        } catch (e) {
          log(`[smart] BŁĄD linku ${link}: ${e}`);
        }
      })();

      backgroundTasks.push(task);

      // Miękki timeout - czekamy 4s, jeśli nie ma wyniku, idziemy do następnego linku
      const softTimeout = new Promise(resolve => setTimeout(() => resolve("TIMEOUT"), 4000));
      await Promise.race([task, softTimeout]);

      if (stopRequested) break;
    }

    // 🔥 KLUCZOWA ZMIANA: Zamiast czekać na WSZYSTKO (allSettled), dajemy tylko 2s "bonusowe"
    // i lecimy do kolejnej próby AI, żeby szukać innych linków.
    if (finalValidProducts.length < MAX_PRODUCTS) {
      log(`[smart] Próba ${attempt} nie dała kompletu. Krótkie czekanie na tło (2s) przed kolejnym zapytaniem AI...`);
      await Promise.race([
        Promise.allSettled(backgroundTasks),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
    }

    if (finalValidProducts.length >= MAX_PRODUCTS) {
      log(`[smart] Uzbierano komplet ${MAX_PRODUCTS} produktów.`);
      return { businessType: "product", products: finalValidProducts.slice(0, MAX_PRODUCTS) };
    }
  }

  log(`[smart] Koniec. Produkty: ${finalValidProducts.length}`);
  return finalValidProducts.length > 0 
    ? { businessType: "product", products: finalValidProducts } 
    : { businessType: "service", products: [] };
}
// ─── extractProducts (LEVEL 4) ────────────────────────────────────────────────

export async function extractProducts(
  pageHtmls: Map<string, string>,
  pageTexts: Map<string, string>,
  leadToolsData: LeadTool[],
  log: LogFn = console.log
): Promise<ProductsData> {
  const sample = Array.from(pageTexts.values()).slice(0, 4).join("\n\n---\n\n").slice(0, 6000);
  let businessType: "product" | "service" = "service";

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: `Czy firma sprzedaje produkty fizyczne/cyfrowe (sklep) czy usługi?\n${sample}\n\nJSON: {"type":"product"} lub {"type":"service"}` }],
      response_format: { type: "json_object" },
      max_completion_tokens: 200,
      temperature: 0,
    });
    const p = JSON.parse(res.choices[0].message.content || "{}");
    businessType = p.type === "product" ? "product" : "service";
  } catch { /* default: service */ }

  log(`[productExtractor] typ biznesu: ${businessType}`);
  if (businessType === "service") return { businessType: "service", products: [] };

  const allProducts: ProductItem[] = [];
  for (const [url, html] of pageHtmls.entries()) {
    const windows = extractWindows(html);
    if (windows.length > 0) {
      const products = await gptExtractProducts(windows, url, log);
      allProducts.push(...products);
    }
  }

  const deduped = deduplicateProducts(allProducts);
  const validated = await filterValidProducts(deduped, MAX_PRODUCTS, log);
  log(`[productExtractor] ${validated.length} produktów (po walidacji obrazków: ${deduped.length} → ${validated.length})`);
  return { businessType: "product", products: validated };
}
