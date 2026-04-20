import OpenAI from "openai";
import type { ProductItem, ProductsData } from "@/types/analysis";
import type { LogFn } from "./logger";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function smartExtractWithWebSearch(
  homepageUrl: string,
  log: LogFn = console.log
): Promise<ProductsData> {
  log(`[AgenticSearch] ═══ START ═══`);
  log(`[AgenticSearch] homepageUrl: ${homepageUrl}`);
  log(`[AgenticSearch] OPENAI_API_KEY present: ${!!process.env.OPENAI_API_KEY}`);

  let domain: string;
  try {
    domain = new URL(homepageUrl).hostname.replace("www.", "");
    log(`[AgenticSearch] domena: ${domain}`);
  } catch (e) {
    log(`[AgenticSearch] BŁĄD parsowania URL: ${e}`);
    return { businessType: "service", products: [] };
  }

  log(`[AgenticSearch] Wywołuję client.responses.create...`);
  log(`[AgenticSearch] client.responses istnieje: ${typeof (client as any).responses}`);

  try {
    // @ts-ignore
    const  domain = new URL(homepageUrl).hostname.replace("www.", "");
    const response = await (client as any).responses.create({
      model: "gpt-5.4-nano",
      reasoning: { "effort": "low" }, 
      "tools": [ { "type": "web_search", "filters": { "allowed_domains": [ `${domain}` ] } } ],
      tool_choice: "auto",
      input:
          `Przeszukaj witrynę ${homepageUrl} oraz jesli bedzie trzeba to podstrony.

          Twoim celem jest znalezienie listy produktów (kategorie, listingi sklepu).
          Dla każdego znalezionego produktu (max 12) wyciągnij:
          1. name: Pełna nazwa produktu (max 30 znaków - jak jest dłuzsze to skróc go zachowujac sens nic nie wymyślaj).
          2. price: Aktualna cena z walutą (np. "29,99 zł"). Ignoruj ceny przekreślone.
          3. imageUrl: Absolutny URL zdjęcia produktu (Sprawdz czy moge wyswietlic ten link do zjecie i czy to zdjecie faktycznie istnieje )

          Jeśli strona nie jest sklepem — zwróć pustą tablicę products.
          Zwraaj tylko produkty które mają nazwę cene i zdjęcie

          Odpowiedz WYŁĄCZNIE poprawnym JSON (bez markdown, bez backticks):
          {"products": [{"name": "...", "price": "...", "imageUrl": "..."}]}`,
    });

    log(`[AgenticSearch] Odpowiedź otrzymana`);
    log(`[AgenticSearch] response: ${JSON.stringify(response)}`);
    log(`[AgenticSearch] response keys: ${Object.keys(response || {}).join(", ")}`);

    const outputText = response?.output_text;
    log(`[AgenticSearch] output_text: ${outputText}`);

    if (!outputText) {
      log(`[AgenticSearch] BŁĄD: output_text jest pusty/undefined`);
      log(`[AgenticSearch] Pełna odpowiedź: ${JSON.stringify(response)}`);
      return { businessType: "service", products: [] };
    }

    let parsed: { products?: unknown[] };
    try {
      parsed = JSON.parse(outputText);
      log(`[AgenticSearch] JSON sparsowany, products: ${(parsed.products || []).length}`);
    } catch (e) {
      log(`[AgenticSearch] BŁĄD parsowania JSON: ${e}`);
      log(`[AgenticSearch] raw output_text: ${outputText}`);
      return { businessType: "service", products: [] };
    }

    const products: ProductItem[] = (parsed.products || [])
      .filter((p: any) => p.name && p.price)
      .map((p: any) => ({
        name: String(p.name).slice(0, 120),
        price: String(p.price),
        imageUrl: typeof p.imageUrl === "string" && p.imageUrl ? p.imageUrl : undefined,
        pageUrl: homepageUrl,
      }));

    log(`[AgenticSearch] Produkty po filtracji: ${products.length}`);
    products.forEach((p, i) => log(`[AgenticSearch] [${i + 1}] ${p.name} | ${p.price} | ${p.imageUrl}`));

    return {
      businessType: products.length > 0 ? "product" : "service",
      products,
    };
  } catch (error: any) {
    log(`[AgenticSearch] BŁĄD wywołania API: ${error}`);
    log(`[AgenticSearch] error.message: ${error?.message}`);
    log(`[AgenticSearch] error.status: ${error?.status}`);
    log(`[AgenticSearch] error.code: ${error?.code}`);
    log(`[AgenticSearch] Pełny error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return { businessType: "service", products: [] };
  }
}
