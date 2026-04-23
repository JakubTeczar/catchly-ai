import { openai } from "@/lib/openai";
import type { ProductsData, ProductItem, PopupData, PopupProduct } from "@/types/analysis";
import type { LogFn } from "./logger";
import type { SubpageSummary } from "@/types/analysis";

// ─── Price helpers ────────────────────────────────────────────────────────────

function parsePrice(str: string): number | null {
  const cleaned = str.replace(/[^0-9.,]/g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}


interface PopupOption {
  title: string;
  why: string;
  when: string;
  how: string;
}

interface ServiceDescription {
  title: string;
  shortDescription: string;
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

// ─── Sidebar/Kafelki template ──────────────────────────────────────────────────

function buildSidebarMessage(
  brand: string,
  options: Array<PopupOption> // Używamy nowego typu
): string {
  const badges = ["A", "B", "C"];
  
  const htmlOptions = options.map((opt, i) => `
      <div class="desc-option" style="margin-bottom: 20px; border-left: 3px solid #bbea00; padding-left: 12px;">
        <div class="desc-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="desc-badge" style="background: #bbea00; color: black; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">${badges[i]}</span>
          <span class="desc-title" style="font-weight: 600; color: #f8fafc;">${opt.title}</span>
        </div>
        
        <div class="desc-strategy" style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 0.8rem;"><span style="color: #a3e635; font-weight: 500;">Dlaczego:</span> <span style="color: #94a3b8;">${opt.why}</span></p>
          <p style="margin: 0; font-size: 0.8rem;"><span style="color: #a3e635; font-weight: 500;">Kiedy:</span> <span style="color: #94a3b8;">${opt.when}</span></p>
          <p style="margin: 0; font-size: 0.8rem;"><span style="color: #a3e635; font-weight: 500;">Jak:</span> <span style="color: #94a3b8;">${opt.how}</span></p>
        </div>
      </div>`).join("\n");

  return `
    <p class="desc-intro" style="margin-bottom: 16px;">Na podstawie analizy <strong>${brand}</strong> przygotowaliśmy strategię konwersji:</p>
    <div class="desc-options">${htmlOptions}</div>
  `;
}

// ─── Product Mapping Helper ──────────────────────────────────────────────────

function toPopupProduct(product: ProductItem, id: number, discountPct: number): PopupProduct {
  const prices = withDiscount(product.price ?? "", discountPct);
  return {
    id,
    name: product.name.split(',')[0].slice(0, 40), // Inteligentne cięcie nazwy
    price: prices?.discounted ?? product.price ?? "",
    oldPrice: prices?.original,
    background: product.imageUrl ? `url('${product.imageUrl}') no-repeat center center / cover` : "#1e293b",
    image: product.imageUrl || undefined,
  };
}

// ─── AI response schema ───────────────────────────────────────────────────────

interface PopupAIResponse {
  brand: string;
  
  optionA: PopupOption; 
  optionB: PopupOption;
  optionC: PopupOption;
  
  salesTitle: string;
  salesSubtitle: string;
  salesProductIndexes: number[] | null; // Zmiana tutaj
  salesServices: ServiceDescription[] | null;

  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterNote: string;
  newsletterProductIndexes: number[] | null; // Zmiana tutaj
  newsletterServices: ServiceDescription[] | null;

  limitedHeadline: string; 
  limitedCtaLabel: string;
  limitedProductIndex: number | null; // Zmiana tutaj
  limitedServices: ServiceDescription[];
}



// ─── Main generator ───────────────────────────────────────────────────────────

export async function generatePopupData(
  productsData: ProductsData,
  websiteUrl: string,
  subpagesData: SubpageSummary[],
  log: LogFn,
): Promise<PopupData> {
  const { businessType, products } = productsData;
  const DISCOUNT_SALES = 15;
  const DISCOUNT_NL = 10;
  const DISCOUNT_LIMITED = 25;

  const summariesForPrompt = subpagesData.map(page => {
    return `
    ---
    Tytuł/Nazwa: ${page.name}
    URL: ${page.url}
    Opis: ${page.description}
    Kluczowe informacje: ${page.bullets.join(", ")}
    ---`;
  }).join("\n");

  let domain = websiteUrl;
  try { domain = new URL(websiteUrl).hostname.replace(/^www\./, ""); } catch { /* ignore */ }

  log(`[popupGenerator] START | type: ${businessType}`);

  const productLines = products.length > 0
    ? products.slice(0, 8).map((p, i) => `[${i}] "${p.name}" | cena: ${p.price ?? "—"}`).join("\n")
    : "(brak produktów)";

    const systemPrompt = `Jesteś ekspertem CRO i Copywriterem. Twoim zadaniem jest przygotowanie tekstów do trzech popupów.

    ### STRUKTURA I CELE:
    1.[optionA] SALES (Subtelny Asystent): Mała karta na dole. Cel: Upselling/Cross-selling. Styl doradczy.
      - W przypadku typu biznesu Usługi: Proponuj pakiety uzupełniające, darmowe wyceny lub konsultacje.
      - W przypadku typu biznesu Sklep: Proponuj produkty komplementarne do obecnego koszyka (cross-selling, np. akcesoria do głównego produktu), pokazuj powiązane bestsellery lub informuj o zbliżającym się progu darmowej dostawy ("Brakuje Ci X zł...").
      W JSONIE [salesTitle,salesProductIndexes,newsletterTitle] to są pola popupu a optionA{title,why,when,how} to jest opis tego popupa wiec musi to być spójne
    2.[optionB] NEWSLETTER (Wymiana Wartości): "Coś za coś". Cel: Budowa bazy mailowej.
      - Usługi: Lead Magnet (ebook, checklisty, audyt PDF, poradnik).
      - W przypadku typu biznesu Sklep: Oferuj bezpośrednią korzyść finansową na pierwsze zakupy (obowiązkowo użyj zmiennej ${DISCOUNT_NL}%), darmową dostawę pierwszego zamówienia lub ekskluzywny wcześniejszy dostęp do wyprzedaży/nowych kolekcji (VIP Club).
      W JSONIE [newsletterTitle,newsletterTitle,newsletterSubtitle,newsletterNote,newsletterProductIndexes] to są pola popupu a optionB{title,why,when,how} to jest opis tego popupa wiec musi to być spójne
    3.[optionC] LIMITED (FOMO/Urgency): Full screen overlay z licznikiem. Cel: Natychmiastowa konwersja.
      - Usługi: Limitowane miejsca na konsultację, oferta ważna tylko teraz promocja czasowa.
      - W przypadku typu biznesu Sklep: Stosuj mechanizmy Flash Sale (błyskawiczna wyprzedaż z rabatem ${DISCOUNT_LIMITED}%), alerty o ostatnich sztukach w magazynie (Low Stock Alert) lub agresywne ratowanie porzuconego koszyka z ekstra zniżką ważną np. tylko przez 15 minut.
      W JSONIE [limitedHeadline,limitedCtaLabel,limitedProductIndex] to są pola popupu a optionC{title,why,when,how} to jest opis tego popupa wiec musi to być spójne

    ### RYGORYSTYCZNE ZASADY:
    - BEZ CEN: Nigdy nie używaj kwot walutowych (np. zł, USD). Używaj wyłącznie wartości procentowych (%).
    - CZYSTY TEKST: Teksty nie mogą zawierać wielokrotnych spacji, długich myśliników, niepotrzebnych tabulacji ani znaków nowej linii wewnątrz stringów.
    - JĘZYK: Dopasuj słownictwo do typu biznesu. Ale jak opisujesz działania popupu to nie używaj słowa popup tylko bardziej reklama czy coś w tym stylu.
    - FORMAT: Zwracaj wyłącznie poprawny kod JSON. 

    `;


const userPrompt = `
    Strona: ${websiteUrl}
    Marka: ${domain}
    Typ Biznesu ${businessType === "product" ? "Sklep/E-commerce" : "Usługowy"}
    Rabat newsletter: ${DISCOUNT_NL}%
    Rabat oferta limitowana: ${DISCOUNT_LIMITED}%
    Rabat bestsellery: ${DISCOUNT_SALES}%

    Kontekst strony:
    ${summariesForPrompt}

    ${businessType === "product" ? `Lista produktów: ${productLines}` : "" }

    ${businessType !== "product" ? `Na podstawie kontekstu strony wymyśl co możemy oferować w popupach` : "" }

    ${businessType !== "product" ? `
      Sugestie zapisuj w takim formacie czyli obiekt z dwoma stringami gdzie title to będzie opisł usługi lub czegoś co oferujemy w popupie a shortDesciption to jej opis
      ServiceDescription {
        title: string (maksymalnie 30znaków);
        shortDescription: string (maksymalnie 70 znaków);
      }  
    ` : "" }
    Wypełnij schemat JSON, dbając o brak zbędnych spacji w tekstach:

    ${businessType === "product" ? `
      {
      "brand": "Nazwa marki",
      "salesTitle": "Tytuł popupu sprzedaży",
      "salesSubtitle": "Podtytuł popupu sprzedaży",
      "salesProductIndexes": [0, 1],
      "newsletterTitle": "Tytuł newslettera",
      "newsletterSubtitle": "Podtytuł newslettera",
      "newsletterNote": "HTML z info o ${DISCOUNT_NL}%",
      "newsletterProductIndexes": [0, 1, 2, 3],
      "limitedHeadline": "Hasło limitowane",
      "limitedCtaLabel": "Odbierz teraz",
      "limitedProductIndex": 0,
      "optionA": {
        "title": "Nazwa popupa SALES Jak nie masz pasującego pomysłu do kontekstu użyj 'Subtelna sprzedaż'",
        "why": "Dlaczego wyświetlamy ten popup z analogią np. Nie chcemy wyganiać klienta który czyta o naszej ofercie [XYZ - to dopasowane do kontekstu] tylko podsuwamy mu pasujace rozwiązanie. (max 200 znaków)",
        "when": "Kiedy pokazywać ten subtelny popup wymyśl konkretną sytuacje kiedy ona ma sens np. Ktoś spędze sporo czasu na sklepie lub chcemy polecić upselling który pasuje do obecnego koszyka (max 200 znaków)",
        "how": "Co zawiera? Krótko opisz co zawiera dany popup np. Że Proponujac nasze bestsellery, darmowe konsutlacje w przypadku usług itd opisz popostu co posiada popup i dlaczego zadziała (max 200 znaków)"
      },
      "optionB": {
        "title": "Nazwa popupa NEWSLETTER Jak nie masz pasującego pomysłu do kontekstu użyj 'Wymiana wartości'",
        "why": "Dlaczego to robimy? Opisz zasadę wzajemności: oferujemy konkretną wartość (np. zniżkę na start, unikalną wiedzę) w zamian za adres e-mail, by budować długofalową relację z marką. (max 200 znaków)",
        "when": "Kiedy pokazać ten popup? Wymyśl idealny moment, np. gdy klient chce opuścić stronę (exit-intent) lub po przewinięciu 50% treści, by nie atakować go od razu po wejściu. (max 200 znaków)",
        "how": "Co zawiera? Opisz mechanikę: wyraźna obietnica korzyści (rabat), proste pole na e-mail, uspokajająca nota o prywatności i jednoznaczne CTA zachęcające do odebrania nagrody. (max 200 znaków)"
      },
      "optionC": {
        "title": "Nazwa popupa SALES Jak nie masz pasującego pomysłu do kontekstu użyj 'Limitowana oferta'",
        "why": "Dlaczego to działa? Opisz regułę niedostępności i FOMO. Pokazujemy, że okazja na [XYZ] jest wyjątkowa i zaraz zniknie, co naturalnie przyspiesza proces podejmowania decyzji. (max 200 znaków)",
        "when": "Kiedy użyć tej presji? Wskaż sensowną sytuację: np. dla powracających użytkowników, jako ratowanie porzuconego koszyka lub podczas flash-sales. Nie chcemy być nachalni bez powodu. (max 200 znaków)",
        "how": "Co posiada? Wymień elementy budujące pilność: np. licznik odliczający czas, przyciągający uwagę nagłówek o ograniczonej dostępności i bardzo kontrastowy przycisk szybkiej akcji CTA. (max 200 znaków)"
      }
    }
     `: `
        "brand": "Nazwa marki",
        "salesTitle": "Tytuł popupu sprzedaży",
        "salesSubtitle": "Podtytuł popupu sprzedaży",
        "salesServices": ServiceDescription[ma być dokładnie 2],
        "newsletterTitle": "Tytuł newslettera",
        "newsletterSubtitle": "Podtytuł newslettera",
        "newsletterNote": "HTML z info o ${DISCOUNT_NL}%",
        "newsletterServices": ServiceDescription[maksymanie 3], 
        "limitedHeadline": "Hasło limitowane",
        "limitedCtaLabel": "Odbierz teraz",
        "limitedServices": ServiceDescription[Ma być dokladnie 1] - niepowtarzaj w tytule ilości procent zniżki tylko wymyś nazwe poprostu,
        "optionA": {
          "title": "Nazwa popupa SALES Jak nie masz pasującego pomysłu do kontekstu użyj 'Subtelna sprzedaż'",
          "why": "Dlaczego wyświetlamy ten popup z analogią np. Nie chcemy wyganiać klienta który czyta o naszej ofercie [XYZ - to dopasowane do kontekstu] tylko podsuwamy mu pasujace rozwiązanie. (max 200 znaków)",
          "when": "Kiedy pokazywać ten subtelny popup wymyśl konkretną sytuacje kiedy ona ma sens np. Ktoś spędze sporo czasu na sklepie lub chcemy polecić upselling który pasuje do obecnego koszyka (max 200 znaków)",
          "how": "Co zawiera? Krótko opisz co zawiera dany popup np. Że Proponujac nasze bestsellery, darmowe konsutlacje w przypadku usług itd opisz popostu co posiada popup i dlaczego zadziała (max 200 znaków)"
        },
        "optionB": {
          "title": "Nazwa popupa NEWSLETTER Jak nie masz pasującego pomysłu do kontekstu użyj 'Wymiana wartości'",
          "why": "Dlaczego to robimy? Opisz zasadę wzajemności: oferujemy konkretną wartość (np. zniżkę na start, unikalną wiedzę) w zamian za adres e-mail, by budować długofalową relację z marką. (max 200 znaków)",
          "when": "Kiedy pokazać ten popup? Wymyśl idealny moment, np. gdy klient chce opuścić stronę (exit-intent) lub po przewinięciu 50% treści, by nie atakować go od razu po wejściu. (max 200 znaków)",
          "how": "Co zawiera? Opisz mechanikę: wyraźna obietnica korzyści (rabat), proste pole na e-mail, uspokajająca nota o prywatności i jednoznaczne CTA zachęcające do odebrania nagrody. (max 200 znaków)"
        },
        "optionC": {
          "title": "Nazwa popupa SALES Jak nie masz pasującego pomysłu do kontekstu użyj 'Limitowana oferta'",
          "why": "Dlaczego to działa? Opisz regułę niedostępności i FOMO. Pokazujemy, że okazja na [XYZ] jest wyjątkowa i zaraz zniknie, co naturalnie przyspiesza proces podejmowania decyzji. (max 200 znaków)",
          "when": "Kiedy użyć tej presji? Wskaż sensowną sytuację: np. dla powracających użytkowników, jako ratowanie porzuconego koszyka lub podczas flash-sales. Nie chcemy być nachalni bez powodu. (max 200 znaków)",
          "how": "Co posiada? Wymień elementy budujące pilność: np. licznik odliczający czas, przyciągający uwagę nagłówek o ograniczonej dostępności i bardzo kontrastowy przycisk szybkiej akcji CTA. (max 200 znaków)"
        }
      }
     `}
    `;

  let ai: PopupAIResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    ai = JSON.parse(completion.choices[0].message.content ?? "{}") as PopupAIResponse;
  } catch (e) {
    log(`[popupGenerator] AI ERROR: ${e}`);
    throw e;
  }

  // ── Validation & Clamping ──────────────────────────────────────────────────
  const maxIdx = products.length - 1;
  const clamp = (arr: number[] | null | undefined, cnt: number) => 
      (arr || []).filter(i => i >= 0 && i <= maxIdx).slice(0, cnt);

    // 2. Wywołujemy bez problemu
    const salesIdxs = clamp(ai.salesProductIndexes, 2);
    const nlIdxs = clamp(ai.newsletterProductIndexes, 4);
    const limitedIdx = (ai.limitedProductIndex !== null && ai.limitedProductIndex <= maxIdx) 
        ? ai.limitedProductIndex 
        : 0;
  // ── Final Data Assembly ─────────────────────────────────────────────────────
  // ── Final Data Assembly ─────────────────────────────────────────────────────
  const limitedProduct = products[limitedIdx];
  const limitedPrices = limitedProduct ? withDiscount(limitedProduct.price ?? "", DISCOUNT_LIMITED) : null;

  const popupData: PopupData = {
    // Dynamiczny podtytuł w zależności od typu biznesu
    popupsSubtitle: businessType === "product" 
      ? "Gotowe pop-upy dopasowane do produktów i stylu sklepu" 
      : "Gotowe pop-upy dopasowane do Twoich usług i stylu strony",
      
    sidebarMessage: buildSidebarMessage(ai.brand || domain, [ai.optionA, ai.optionB, ai.optionC]),
    
    salesPopup: {
      brand: ai.brand || domain,
      title: ai.salesTitle,
      subtitle: ai.salesSubtitle,
      // Mapujemy produkty tylko dla e-commerce
      products: businessType === "product" 
        ? salesIdxs.map((idx, n) => toPopupProduct(products[idx], n + 1, DISCOUNT_SALES)) 
        : [],
      // Przekazujemy usługi tylko dla usług (fallback do pustej tablicy)
      services: businessType !== "product" ? (ai.salesServices || []) : [],
    },
    
    newsletterPopup: {
      title: ai.newsletterTitle,
      subtitle: ai.newsletterSubtitle,
      note: ai.newsletterNote,
      products: businessType === "product" 
        ? nlIdxs.map((idx, n) => toPopupProduct(products[idx], n + 1, DISCOUNT_NL)) 
        : [],
      services: businessType !== "product" ? (ai.newsletterServices || []) : [],
    },
    
    limitedPopup: {
      brand: ai.brand || domain,
      // Dla usług używamy po prostu nagłówka z AI, bo nie mamy starej/nowej ceny
      titleLine1: businessType === "product" && limitedPrices 
        ? `Czy chcesz zapłacić ${limitedPrices.discounted} zamiast ${limitedPrices.original}?` 
        : ai.limitedHeadline,
      ctaLabel: ai.limitedCtaLabel,
      
      // Pola czysto produktowe (mogą zostać puste dla usług)
      productImage: limitedProduct?.imageUrl ?? "",
      productName: limitedProduct?.name.slice(0, 60) ?? "",
      newPrice: limitedPrices?.discounted ?? "",
      oldPrice: limitedPrices?.original ?? "",
      
      // Przekazujemy usługi
      services: businessType !== "product" ? (ai.limitedServices || []) : [],
      
      durationHours: businessType === "product" ? 4 : 48,
    },
  };

  log(`[popupGenerator] DONE`);
  return popupData;
}