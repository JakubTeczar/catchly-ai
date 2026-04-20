import type { AnalysisState, PopupData } from "@/types/analysis";

// ─── Wariant: Produkty (e-commerce) ──────────────────────────────────────────

export const MOCK_POPUP_DATA_PRODUKTY: PopupData = {
  introSubtitle: "Na podstawie analizy przygotowałem gotowe narzędzia do zwiększenia sprzedaży w Twoim sklepie.",
  popupsSubtitle: "3 gotowe pop-upy dopasowane do produktów i stylu Platinumcandle",
  sidebarMessage: `
    <p class="desc-intro">Na podstawie analizy Platinumcandle przygotowaliśmy 3 gotowe pop-upy dopasowane do Twojego sklepu.</p>
    <div class="desc-options">

      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">A</span>
          <span class="desc-title">Sprzedaż bez irytowania użytkownika</span>
        </div>
        <p class="desc-why">Subtelny pop-up w rogu ekranu — pojawia się, nie blokuje. Klient sam decyduje kiedy kliknąć, przez co jest bardziej skłonny do zakupu.</p>
        <p class="desc-stat">↑ Subtelna forma konwertuje 2–3× lepiej niż wyskakujące okienko blokujące stronę i wydłuża czas wizyty</p>
      </div>

      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">B</span>
          <span class="desc-title">Zapis do newslettera z ofertą</span>
        </div>
        <p class="desc-why">Wizualizacja produktów z -10% rabatem sprawia, że użytkownik widzi konkretną korzyść, zanim jeszcze wpisze e-mail.</p>
        <p class="desc-stat">↑ Konkretna zniżka przy zapisie działa ~35% skuteczniej niż samo pole e-mail</p>
      </div>

      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">C</span>
          <span class="desc-title">Oferta ograniczona czasowo</span>
        </div>
        <p class="desc-why">Odliczanie + jasne pytanie TAK/NIE eliminuje odkładanie decyzji. FOMO działa i klient kupuje teraz albo traci okazję.</p>
        <p class="desc-stat">↑ Widoczne odliczanie skraca czas podjęcia decyzji o ~47% klient kupuje tu i teraz</p>
      </div>

    </div>
  `,

  salesPopup: {
    brand: "platinumcandle",
    title: "Nie tylko świece",
    subtitle: "Naturalny wosk sojowy do twojego kominka",
    products: [
      {
        id: 1,
        name: "Absynt z whisky i czarnym rumem",
        price: "6,99 zł",
        oldPrice: "12,99 zł",
        emoji: "",
        background:
          "url('https://platinumcandle.pl/public/upload/catalog/product/37/minigallery/thumb_large_1685276476WOSK_ZAPACHOWY_ABSYNT_Z_WHISKY_I_CZARNYM_RUMEM_1-jpg.webp') no-repeat center center / cover",
      },
      {
        id: 2,
        name: "Drzewo sandałowe z cedrem i wanilią",
        price: "6,99 zł",
        oldPrice: "12,99 zł",
        emoji: "",
        background:
          "url('https://platinumcandle.pl/public/upload/catalog/product/44/minigallery/thumb_large_1685275519WOSK_ZAPACHOWY_DRZEWO_SANDA_OWE_Z_CEDREM_I_WANILI__1-jpg.webp') no-repeat center center / cover",
      },
    ],
  },

  newsletterPopup: {
    title: "Zapisz się do newslettera",
    subtitle: "Te i inne produkty kupisz u nas taniej",
    note: "Dołącz do nas i <b>otrzymaj 10%</b> zniżki.",
    products: [
      {
        id: 1,
        name: "Czarna porzeczka z bergamotką",
        price: "69.00",
        background:
          "url('https://platinumcandle.pl/public/upload/catalog/product/22/minigallery/thumb_xlarge_1700403986CZARNA_PORZECZKA_Z_BERGAMOTK__220G_4-jpg.webp') no-repeat center center / cover",
      },
      {
        id: 2,
        name: "Diamond gift box",
        price: "289.99",
        background:
          "url('https://platinumcandle.pl/public/upload/catalog/product/217/minigallery/thumb_large_1698593693DIAMOND_BOX_WIOSENNO_LETNI-jpg.webp') no-repeat center center / cover",
      },
      {
        id: 3,
        name: "Kominek kwadraty",
        price: "39.99",
        background:
          "url('https://platinumcandle.pl/public/upload/catalog/product/67/minigallery/thumb_xlarge_1686215614Kominek_zapachowy_kwadraty-jpg.webp') no-repeat center center / cover",
      },
      {
        id: 4,
        name: "Grzaniec galicyjski",
        price: "6.99",
        background:
          "url('https://platinumcandle.pl/public/upload/catalog/product/147/minigallery/thumb_large_1685274772WOSK_ZAPACHOWY_GRZANIEC_GALICYJSKI_1-jpg.webp') no-repeat center center / cover",
      },
    ],
  },

  limitedPopup: {
    brand: "",
    titleLine1: "Czy chcesz zapłacić 19.99 zł zamiast 35 zł?",
    ctaLabel: "Zobacz świecę",
    productImage:
      "https://platinumcandle.pl/public/upload/catalog/product/108/minigallery/thumb_xlarge_1700508909drewno_agarowe_3-jpg.webp",
    productName: "Świeca sojowa drewno agarowe z wanilią",
    newPrice: "19,99 zł",
    oldPrice: "35,00 zł",
    durationHours: 4,
  },
};

// ─── Wariant: Usługi (agencja / B2B) ─────────────────────────────────────────

export const MOCK_POPUP_DATA_USLUGI: PopupData = {
  introSubtitle: "Na podstawie analizy przygotowałem gotowe narzędzia do pozyskiwania klientów dla Twojej firmy.",
  popupsSubtitle: "3 gotowe pop-upy dopasowane do oferty i stylu esoy.pl",
  sidebarMessage: `
    <p class="desc-intro">Na podstawie analizy esoy.pl przygotowaliśmy 3 gotowe pop-upy dopasowane do Twojej oferty usług.</p>
    <div class="desc-options">

      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">A</span>
          <span class="desc-title">Pokaż usługi bez nachalności</span>
        </div>
        <p class="desc-why">Subtelny panel na dole ekranu z wybranymi usługami i ceną — nie blokuje strony, pojawia się w odpowiednim momencie.</p>
        <p class="desc-stat">↑ Subtelna forma konwertuje 2–3× lepiej niż wyskakujące okienko blokujące stronę</p>
      </div>

      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">B</span>
          <span class="desc-title">Lead magnet z darmowym materiałem</span>
        </div>
        <p class="desc-why">Bezpłatny poradnik lub e-book w zamian za e-mail — budujesz bazę kontaktów i pokazujesz ekspertyzę jednocześnie.</p>
        <p class="desc-stat">↑ Lead magnet zwiększa współczynnik zapisu o ~60% vs samo pole e-mail</p>
      </div>

      <div class="desc-option">
        <div class="desc-header">
          <span class="desc-badge">C</span>
          <span class="desc-title">Oferta ograniczona czasowo</span>
        </div>
        <p class="desc-why">Rabat na audyt lub konsultację ważny tylko przez X godzin — eliminuje odkładanie decyzji i przyspiesza kontakt.</p>
        <p class="desc-stat">↑ Widoczne odliczanie skraca czas podjęcia decyzji o ~47%</p>
      </div>

    </div>
  `,

  salesPopup: {
    brand: "esoy.pl",
    title: "Sprawdź nasze usługi",
    subtitle: "Projektujemy strony i sklepy, które sprzedają",
    products: [
      {
        id: 1,
        name: "Audyt SEO i UX strony",
        price: "299 zł",
        oldPrice: "499 zł",
        emoji: "🔍",
        background: "#1e293b",
      },
      {
        id: 2,
        name: "Konsultacja strategiczna 60 min",
        price: "bezpłatna",
        oldPrice: "199 zł",
        emoji: "💬",
        background: "#0f172a",
      },
    ],
  },

  newsletterPopup: {
    title: "Pobierz bezpłatny poradnik",
    subtitle: "Jak zdobywać klientów z Google bez reklam",
    note: "Zapisz się i odbierz <b>bezpłatny e-book</b> o SEO dla firm usługowych.",
    products: [
      {
        id: 1,
        name: "SEO dla firm usługowych — poradnik 2024",
        price: "bezpłatny",
        oldPrice: "49 zł",
        emoji: "📖",
        background: "#1e3a5f",
      },
      {
        id: 2,
        name: "Case study: +40% konwersji w 3 miesiące",
        price: "bezpłatny",
        emoji: "📊",
        background: "#1a2e1a",
      },
      {
        id: 3,
        name: "Checklista: audyt strony w 15 minut",
        price: "bezpłatna",
        emoji: "✅",
        background: "#2d1b4e",
      },
      {
        id: 4,
        name: "Szablon briefu projektowego",
        price: "bezpłatny",
        emoji: "📝",
        background: "#1c2d3a",
      },
    ],
  },

  limitedPopup: {
    brand: "esoy.pl",
    titleLine1: "Czy chcesz zapłacić 299 zł zamiast 499 zł za audyt?",
    ctaLabel: "Chcę skorzystać",
    productImage: "",
    productName: "Audyt SEO + UX + plan działania na 3 miesiące",
    newPrice: "299 zł",
    oldPrice: "499 zł",
    durationHours: 48,
  },
};

// ─── Alias dla kompatybilności wstecznej ──────────────────────────────────────

export const MOCK_POPUP_DATA = MOCK_POPUP_DATA_PRODUKTY;

// ─── AnalysisState mock: Produkty ────────────────────────────────────────────

export const MOCK_ANALYSIS_PRODUKTY: AnalysisState = {
  id: "mock-produkty",
  status: "COMPLETED",
  url: "https://platinumcandle.pl",
  screenshotDone: true,
  styleDone: true,
  subpagesDone: true,
  leadToolsDone: true,
  screenshotUrl: null,
  styleData: {
    colors: [
      { hex: "#1a1a1a", label: "primary", source: "css" },
      { hex: "#c8a96e", label: "accent", source: "css" },
      { hex: "#f5f0e8", label: "background", source: "css" },
      { hex: "#6b4c2a", label: "secondary", source: "css" },
    ],
    fonts: ["Playfair Display", "Lato"],
    borderRadius: "rounded",
    borderRadiusCount: 12,
    borderRadiusPx: 6,
  },
  subpagesData: [
    {
      url: "https://platinumcandle.pl",
      name: "Strona główna",
      description: "Sklep ze świecami sojowymi i woskami zapachowymi premium — naturalne składniki, ręczna produkcja.",
      bullets: ["Ponad 200 zapachów w ofercie", "Wosk sojowy i kokosowy", "Wysyłka w 24h"],
    },
    {
      url: "https://platinumcandle.pl/kategoria/swiece",
      name: "Świece",
      description: "Kolekcja świec sojowych w szklanych pojemnikach — różne pojemności i zapachy.",
      bullets: ["Świece od 35 zł", "Czas palenia do 60h", "Bawełniany knot"],
    },
  ],
  leadToolsData: [
    {
      type: "newsletter",
      label: "Newsletter z rabatami",
      sourceText: "Zapisz się i otrzymaj -10% na pierwsze zamówienie",
      sourceUrl: "https://platinumcandle.pl",
    },
    {
      type: "loyalty",
      label: "Program lojalnościowy",
      sourceText: "Zbieraj punkty za zakupy i wymieniaj na rabaty",
      sourceUrl: "https://platinumcandle.pl",
    },
  ],
  productsDone: true,
  productsData: null,
  popupDone: true,
  popupData: MOCK_POPUP_DATA_PRODUKTY,
};

// ─── AnalysisState mock: Usługi ───────────────────────────────────────────────

export const MOCK_ANALYSIS_USLUGI: AnalysisState = {
  id: "mock-uslugi",
  status: "COMPLETED",
  url: "https://esoy.pl",
  screenshotDone: true,
  styleDone: true,
  subpagesDone: true,
  leadToolsDone: true,
  screenshotUrl: "/screenshots/cmo34x59q0000isvagaxc7xkf.jpg",
  styleData: {
    colors: [
      { hex: "#7C3AED", label: "primary", source: "css" },
      { hex: "#2563EB", label: "secondary", source: "css" },
      { hex: "#F97316", label: "accent", source: "css" },
      { hex: "#1A1A2E", label: "background", source: "css" },
    ],
    fonts: ["Inter", "Playfair Display"],
    borderRadius: "rounded",
    borderRadiusCount: 24,
    borderRadiusPx: 8,
  },
  subpagesData: [
    {
      url: "https://esoy.pl",
      name: "Strona główna",
      description: "Agencja kreatywna specjalizująca się w projektowaniu stron internetowych i brandingu dla MŚP.",
      bullets: ["Ponad 8 lat doświadczenia", "200+ zrealizowanych projektów", "Specjalizacja B2B i e-commerce"],
    },
    {
      url: "https://esoy.pl/oferta",
      name: "Oferta",
      description: "Strony internetowe, sklepy i identyfikacja wizualna.",
      bullets: ["Strony od 3 000 zł", "Sklepy WooCommerce i Shopify", "Google Ads i Meta Ads"],
    },
  ],
  leadToolsData: [
    {
      type: "consultation",
      label: "Bezpłatna konsultacja 30 min",
      sourceText: "Umów bezpłatną konsultację z naszym specjalistą",
      sourceUrl: "https://esoy.pl",
    },
    {
      type: "contact_form",
      label: "Formularz wyceny",
      sourceText: "Wypełnij formularz i otrzymaj bezpłatną wycenę w 24h",
      sourceUrl: "https://esoy.pl/kontakt",
    },
    {
      type: "newsletter",
      label: "Newsletter o trendach UX",
      sourceText: "Zapisz się i otrzymuj wskazówki o projektowaniu",
      sourceUrl: "https://esoy.pl",
    },
  ],
  productsDone: true,
  productsData: null,
  popupDone: true,
  popupData: MOCK_POPUP_DATA_USLUGI,
};

// ─── Alias ────────────────────────────────────────────────────────────────────

export const MOCK_ANALYSIS = MOCK_ANALYSIS_USLUGI;
