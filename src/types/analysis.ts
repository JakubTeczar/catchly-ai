export type AnalysisStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface ColorSwatch {
  hex: string;
  label: string;
  source: string;
}

export interface StyleData {
  colors: ColorSwatch[];
  fonts: string[];
  borderRadius: "rounded" | "sharp";
  borderRadiusCount: number;
  borderRadiusPx: number;
}

export interface SubpageSummary {
  url: string;
  name: string;
  description: string;
  bullets: string[];
}

export interface LeadTool {
  type: string;
  label: string;
  sourceText: string;
  sourceUrl: string;
  suggestion?: boolean;
  suggestionText?: string;
}

export interface ProductItem {
  name: string;
  price: string;
  imageUrl?: string;
  pageUrl?: string;
}

export interface ProductsData {
  businessType: "product" | "service";
  products: ProductItem[];
}

export interface AnalysisState {
  id: string;
  status: AnalysisStatus;
  url: string;
  screenshotDone: boolean;
  styleDone: boolean;
  subpagesDone: boolean;
  leadToolsDone: boolean;
  productsDone: boolean;
  productsData: ProductsData | null;
  popupDone: boolean;
  popupData: PopupData | null;
  screenshotUrl: string | null;
  styleData: StyleData | null;
  subpagesData: SubpageSummary[] | null;
  leadToolsData: LeadTool[] | null;
}

// ─── Popup types ──────────────────────────────────────────────────────────────

export interface PopupProduct {
  id: number;
  name: string;
  price: string;
  oldPrice?: string;
  emoji?: string;
  background?: string;
  image?: string;
}

export interface SalesPopupConfig {
  brand: string;
  title: string;
  subtitle: string;
  products: PopupProduct[];
}

export interface NewsletterPopupConfig {
  title: string;
  subtitle: string;
  note: string;
  products: PopupProduct[];
}

export interface LimitedPopupConfig {
  brand?: string;
  titleLine1: string;
  ctaLabel: string;
  productImage: string;
  productName: string;
  newPrice: string;
  oldPrice: string;
  durationHours: number;
}

export interface PopupData {
  sidebarMessage: string;
  introSubtitle?: string;
  popupsSubtitle?: string;
  salesPopup: SalesPopupConfig;
  newsletterPopup: NewsletterPopupConfig;
  limitedPopup: LimitedPopupConfig;
}
