import { openai } from "@/lib/openai";
import type { ProductsData, ProductItem, PopupData, PopupProduct } from "@/types/analysis";
import type { LogFn } from "./logger";

// ─── Price helpers ────────────────────────────────────────────────────────────

function parsePrice(str: string): number | null {
  const cleaned = str.replace(/[^0-9.,]/g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

function formatPricePL(num: number): string {
  return num.toFixed(2).replace(".", ",") + " zł";
}

function withDiscount(priceStr: string, pct: number): { original: string; discounted: string } | null {
  const num = parsePrice(priceStr);
  if (!num) return null;
  return {
    original: formatPricePL(num),
    discounted: formatPricePL(Math.round(num * (1 - pct / 100) * 100) / 100),
  };
}

// ─── sidebarMessage template ──────────────────────────────────────────────────

function buildSidebarMessage(
  brand: string,
  businessType: "product" | "service",
  optionTitles: [string, string, string],
  optionWhys: [string, string, string],
): string {
  const intro =
    businessType === "product"
      ? `Na podstawie analizy <strong>${brand}</strong> przygotowaliśmy 3 gotowe pop-upy dopasowane do Twojego sklepu.`
      : `Na podstawie analizy <strong>${brand}</strong> przygotowaliśmy 3 gotowe pop-upy dopasowane do oferty Twojej firmy.`;

  const stats =
    businessType === "product"
      ? [
          "↑ Subtelna forma konwertuje 2–3× lepiej niż wyskakujące okienko blokujące stronę",
          "↑ Konkretna zniżka przy zapisie działa ~35% skuteczniej niż samo pole e-mail",
          "↑ Widoczne odliczanie skraca czas podjęcia decyzji o ~47%",
        ]
      : [
          "↑ Subtelna forma konwertuje 2–3× lepiej niż wyskakujące okienko blokujące stronę",
          "↑ Lead magnet zwiększa współczynnik zapisu o ~60% vs samo pole e-mail",
          "↑ Widoczne odliczanie skraca czas podjęcia decyzji o ~47%",
        ];

  const badges = ["A", "B", "C"];

  const options = ([0, 1, 2] as const).map((i) => `
      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">${badges[i]}</span>
          <span class="desc-title">${optionTitles[i]}</span>
        </div>
        <p class="desc-why">${optionWhys[i]}</p>
        <p class="desc-stat">${stats[i]}</p>
      </div>`).join("\n");

  return `<p class="desc-intro">${intro}</p>
    <div class="desc-options">${options}
    </div>`;
}

// ─── Product → PopupProduct helpers ──────────────────────────────────────────

function toPopupProduct(
  product: ProductItem,
  id: number,
  discountPct: number,
): PopupProduct {
  const prices = withDiscount(product.price ?? "", discountPct);
  const imgUrl = product.imageUrl;
  return {
    id,
    name: product.name.slice(0, 40),
    price: prices?.discounted ?? product.price ?? "",
    oldPrice: prices?.original,
    emoji: "",
    background: imgUrl ? `url('${imgUrl}') no-repeat center center / cover` : "#1e293b",
    image: imgUrl || undefined,
  };
}

function toNewsletterProduct(
  product: ProductItem,
  id: number,
  discountPct: number,
): PopupProduct {
  const prices = withDiscount(product.price ?? "", discountPct);
  const imgUrl = product.imageUrl;
  return {
    id,
    name: product.name.slice(0, 40),
    price: prices?.discounted ?? product.price ?? "",
    oldPrice: prices?.original,
    background: imgUrl ? `url('${imgUrl}') no-repeat center center / cover` : "#1e293b",
    image: imgUrl || undefined,
  };
}

// ─── AI response schema (what we ask OpenAI to return) ───────────────────────

interface PopupAIResponse {
  brand: string;
  introSubtitle: string;
  popupsSubtitle: string;
  salesTitle: string;
  salesSubtitle: string;
  salesProductIndexes: number[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterNote: string;
  newsletterProductIndexes: number[];
  limitedTitleLine1: string;
  limitedCtaLabel: string;
  limitedProductIndex: number;
  optionATitle: string;
  optionAWhy: string;
  optionBTitle: string;
  optionBWhy: string;
  optionCTitle: string;
  optionCWhy: string;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generatePopupData(
  productsData: ProductsData,
  websiteUrl: string,
  log: LogFn,
): Promise<PopupData> {
  const { businessType, products } = productsData;

  let domain = websiteUrl;
  try { domain = new URL(websiteUrl).hostname.replace(/^www\./, ""); } catch { /* ignore */ }

  log(`[popupGenerator] START | domain: ${domain} | type: ${businessType} | products: ${products.length}`);

  // ── Build product list for AI ──────────────────────────────────────────────
  const productLines = products.length > 0
    ? products
        .slice(0, 8)
        .map((p, i) => {
          const prices = withDiscount(p.price ?? "", 15);
          return `[${i}] "${p.name}" | cena: ${p.price ?? "—"} | -15%: ${prices?.discounted ?? "—"} | img: ${p.imageUrl ? "TAK" : "NIE"}`;
        })
        .join("\n")
    : "(brak produktów — firma usługowa)";

  // ── Prompt ────────────────────────────────────────────────────────────────
  const systemPrompt = `Jesteś ekspertem od konwersji i copywritingu. Piszesz teksty do popupów dla polskich stron internetowych. Zawsze odpowiadasz w języku polskim. Zwracasz TYLKO poprawny JSON bez żadnego markdown. Nigdy nie używaj długich myślników (—). Zamiast nich stosuj przecinek, kropkę lub przepisz zdanie bez myślnika.`;

  const userPrompt = `Strona: ${websiteUrl}
Typ: ${businessType === "product" ? "sklep / produkty" : "firma usługowa"}
Domena (marka): ${domain}

Lista produktów/ofert (maks. 8):
${productLines}

Wybierz produkty do każdego popupa i napisz polskie teksty marketingowe.
Zwróć TYLKO JSON zgodny ze schematem poniżej. Żadnych komentarzy, żadnego markdown.

SCHEMAT (wypełnij wszystkie pola):
{
  "brand": "krótka nazwa marki ze strony (max 20 znaków)",
  "introSubtitle": "zdanie wprowadzające dla użytkownika (max 120 znaków)",
  "popupsSubtitle": "krótki podtytuł sekcji popupów (max 80 znaków)",

  "salesTitle": "chwytliwy nagłówek pop-upu sprzedażowego (max 30 znaków)",
  "salesSubtitle": "podtytuł (max 50 znaków)",
  "salesProductIndexes": [0, 1],  // 2 indeksy z listy (lub mniej jeśli brak)

  "newsletterTitle": "nagłówek newslettera (max 35 znaków)",
  "newsletterSubtitle": "podtytuł (max 60 znaków)",
  "newsletterNote": "HTML, np. 'Dołącz i <b>otrzymaj 10%</b> zniżki' (max 80 znaków)",
  "newsletterProductIndexes": [0, 1, 2, 3],  // 2-4 indeksy z listy

  "limitedTitleLine1": "pytanie z ceną, np. 'Czy chcesz zapłacić X zł zamiast Y zł?' (max 60 znaków)",
  "limitedCtaLabel": "tekst przycisku TAK (max 20 znaków)",
  "limitedProductIndex": 0,  // 1 indeks — najlepszy produkt

  "optionATitle": "tytuł opcji A — popup sprzedażowy (max 40 znaków)",
  "optionAWhy": "dlaczego ta forma działa (max 100 znaków)",
  "optionBTitle": "tytuł opcji B — newsletter (max 40 znaków)",
  "optionBWhy": "dlaczego ta forma działa (max 100 znaków)",
  "optionCTitle": "tytuł opcji C — ograniczona czasowo (max 40 znaków)",
  "optionCWhy": "dlaczego ta forma działa (max 100 znaków)"
}

PRZYKŁAD WYPEŁNIONEGO SCHEMATU (wzorzec długości i stylu):
{
  "brand": "Platinumcandle",
  "introSubtitle": "Na podstawie analizy przygotowałem gotowe narzędzia do zwiększenia sprzedaży w Twoim sklepie.",
  "popupsSubtitle": "3 gotowe pop-upy dopasowane do produktów i stylu sklepu",

  "salesTitle": "Nie tylko świece",
  "salesSubtitle": "Naturalny wosk sojowy do Twojego kominka",
  "salesProductIndexes": [0, 1],

  "newsletterTitle": "Zapisz się do newslettera",
  "newsletterSubtitle": "Te i inne produkty kupisz u nas taniej",
  "newsletterNote": "Dołącz do nas i <b>otrzymaj 10%</b> zniżki.",
  "newsletterProductIndexes": [0, 1, 2, 3],

  "limitedTitleLine1": "Czy chcesz zapłacić 19,99 zł zamiast 35,00 zł?",
  "limitedCtaLabel": "Tak, chcę!",
  "limitedProductIndex": 2,

  "optionATitle": "Sprzedaż bez irytowania użytkownika",
  "optionAWhy": "Subtelny pop-up w rogu ekranu, pojawia się i nie blokuje strony.",
  "optionBTitle": "Zapis do newslettera z ofertą",
  "optionBWhy": "Wizualizacja produktów z rabatem sprawia, że klient widzi korzyść przed podaniem e-maila.",
  "optionCTitle": "Oferta ograniczona czasowo",
  "optionCWhy": "Odliczanie i pytanie TAK/NIE eliminuje odkładanie decyzji."
}`;

  // ── AI call ───────────────────────────────────────────────────────────────
  let ai: PopupAIResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    ai = JSON.parse(completion.choices[0].message.content ?? "{}") as PopupAIResponse;
    log(`[popupGenerator] AI OK | brand: ${ai.brand}`);
  } catch (e) {
    log(`[popupGenerator] AI FAILED: ${e}`);
    throw e;
  }

  // ── Validate & clamp indexes ───────────────────────────────────────────────
  const maxIdx = products.length - 1;
  const clamp = (arr: number[], count: number) =>
    (Array.isArray(arr) ? arr : []).filter((i) => typeof i === "number" && i >= 0 && i <= maxIdx).slice(0, count);

  const salesIdxs    = clamp(ai.salesProductIndexes,      2).length ? clamp(ai.salesProductIndexes,      2) : [0];
  const nlIdxs       = clamp(ai.newsletterProductIndexes, 4).length ? clamp(ai.newsletterProductIndexes, 4) : [0];
  const limitedIdx   = typeof ai.limitedProductIndex === "number" && ai.limitedProductIndex >= 0 && ai.limitedProductIndex <= maxIdx
                       ? ai.limitedProductIndex : 0;

  // ── Build PopupProducts ───────────────────────────────────────────────────
  const salesProducts = products.length > 0
    ? salesIdxs.map((i, n) => toPopupProduct(products[i], n + 1, 15))
    : [];

  const nlProducts = products.length > 0
    ? nlIdxs.map((i, n) => toNewsletterProduct(products[i], n + 1, 10))
    : [];

  const limitedProduct: ProductItem | undefined = products[limitedIdx];
  const limitedPrices = limitedProduct ? withDiscount(limitedProduct.price ?? "", 25) : null;

  // ── Build sidebarMessage from template ────────────────────────────────────
  const sidebarMessage = buildSidebarMessage(
    ai.brand || domain,
    businessType,
    [ai.optionATitle ?? "Pop-up sprzedażowy", ai.optionBTitle ?? "Newsletter z rabatem", ai.optionCTitle ?? "Oferta ograniczona"],
    [ai.optionAWhy  ?? "Subtelna forma nie blokuje strony.", ai.optionBWhy  ?? "Rabat za e-mail buduje bazę.", ai.optionCWhy  ?? "Odliczanie eliminuje odkładanie."],
  );

  // ── Assemble final PopupData ──────────────────────────────────────────────
  const popupData: PopupData = {
    introSubtitle: ai.introSubtitle,
    popupsSubtitle: ai.popupsSubtitle,
    sidebarMessage,
    salesPopup: {
      brand: ai.brand || domain,
      title: ai.salesTitle,
      subtitle: ai.salesSubtitle,
      products: salesProducts,
    },
    newsletterPopup: {
      title: ai.newsletterTitle,
      subtitle: ai.newsletterSubtitle,
      note: ai.newsletterNote,
      products: nlProducts,
    },
    limitedPopup: {
      brand: ai.brand || domain,
      titleLine1: ai.limitedTitleLine1,
      ctaLabel: ai.limitedCtaLabel || "Tak, chcę!",
      productImage: limitedProduct?.imageUrl ?? "",
      productName: limitedProduct ? limitedProduct.name.slice(0, 60) : "",
      newPrice: limitedPrices?.discounted ?? limitedProduct?.price ?? "",
      oldPrice: limitedPrices?.original ?? "",
      durationHours: businessType === "product" ? 4 : 48,
    },
  };

  log(`[popupGenerator] DONE`);
  return popupData;
}
