import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import path from "path";
import type { AnalysisState, PopupData } from "@/types/analysis";

// ─── Font registration (Satoshi — supports Polish characters) ─────────────────

const FONTS_DIR = path.join(process.cwd(), "public", "satoshi-fonts", "fonts");

Font.register({
  family: "Satoshi",
  fonts: [
    { src: path.join(FONTS_DIR, "Satoshi-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS_DIR, "Satoshi-Medium.ttf"),  fontWeight: 500 },
    { src: path.join(FONTS_DIR, "Satoshi-Bold.ttf"),    fontWeight: 700 },
  ],
});

// Disable hyphenation so Polish words aren't broken oddly
Font.registerHyphenationCallback((word) => [word]);

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  dark:   "#0a0a0a",
  accent: "#BBEA00",
  white:  "#FFFFFF",
  muted:  "#888888",
  border: "#e5e5e5",
  bg:     "#f7f7f7",
};

// ─── Logo (SVG encoded as base64 data URI) ────────────────────────────────────
// White catchly wordmark, 99×28 viewBox

const LOGO_URI =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTkiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCA5OSAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAuMDk1NCAyMS40ODM5QzQuMTI5OTIgMjEuNDgzOSAwIDE2Ljk1MTkgMCAxMS4xODY1QzAgNS4zOTI0OSA0LjEyOTkyIDAuODg5MTg2IDEwLjA5NTQgMC44ODkxODZDMTQuMzY4NyAwLjg4OTE4NiAxNy41ODA4IDMuMTU1MTggMTkuMTAwOSA2LjUzOTgyTDE2LjQzMzYgNy45NzRDMTUuNDAxMSA1LjUzNTkgMTMuMTM1NCAzLjgxNDkgMTAuMDk1NCAzLjgxNDlDNS44MjIwNCAzLjgxNDkgMy4wNjg3NiA3LjExMzQ5IDMuMDY4NzYgMTEuMTg2NUMzLjA2ODc2IDE1LjI1OTYgNS44NTA3MiAxOC41NTgyIDEwLjA5NTQgMTguNTU4MkMxMy4yMjE1IDE4LjU1ODIgMTUuNTQ0NSAxNi43MjI0IDE2LjU0ODMgMTQuMTQwOUwxOS4xODY5IDE1LjU0NjRDMTcuNzUyOSAxOS4wNzQ1IDE0LjQ4MzQgMjEuNDgzOSAxMC4wOTU0IDIxLjQ4MzlaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0yNS43MjY2IDIxLjUxMjZDMjIuNzcyNiAyMS41MTI2IDIwLjYyMTYgMTkuNjE5NSAyMC42MjE2IDE2LjkyMzJDMjAuNjIxNiAxNC4zNDE3IDIyLjQyODQgMTIuNDc3MyAyNS43NTUzIDEyLjI0NzhMMzAuMTE0NyAxMS45NjFWMTEuNzg4OUMzMC4xMTQ3IDEwLjM4MzQgMjguODI0MSA4Ljc3NzEzIDI2LjQ3MjMgOC43NzcxM0MyNC4yMDY2IDguNzc3MTMgMjMuMTQ1NCAxMC4yNCAyMi43NzI2IDExLjMzTDIwLjUwNjkgMTAuMTgyNkMyMS4xNjY1IDguMzQ2ODggMjMuMDAyIDYuMTk1NjIgMjYuNTAxIDYuMTk1NjJDMzAuNjg4MiA2LjE5NTYyIDMyLjk1NCA5LjA5MjY1IDMyLjk1NCAxMS45MDM2VjIxLjIyNTdIMzAuMTE0N1YxOS41MzM0QzI5LjM0MDMgMjAuNzA5NCAyNy42MTk1IDIxLjUxMjYgMjUuNzI2NiAyMS41MTI2Wk0yMy40ODk2IDE2Ljg2NTlDMjMuNDg5NiAxOC4xODUzIDI0LjU3OTQgMTguOTg4NCAyNi4wMTM0IDE4Ljk4ODRDMjguNjIzMyAxOC45ODg0IDMwLjE3MiAxNy4yMTAxIDMwLjE3MiAxNS4yODgzVjE0LjM3MDRMMjUuOTU2MSAxNC42NTcyQzI0LjU1MDcgMTQuNzQzMyAyMy40ODk2IDE1LjQ2MDQgMjMuNDg5NiAxNi44NjU5WiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMzcuMzYxNyAyMS4yMjU3VjguOTc3OTJIMzQuNzIzMlY2LjQ1Mzc3SDM3LjQ0NzhWMi42Mzg4OEg0MC4yMjk3VjYuNDUzNzdINDQuMDQ0MlY4Ljk3NzkySDQwLjIyOTdWMTguNTI5NUg0NC4xMDE1VjIxLjIyNTdIMzcuMzYxN1oiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTUzLjAzMjIgMjEuNDgzOUM0OC45MDIzIDIxLjQ4MzkgNDUuNDMyIDE4LjQ0MzUgNDUuNDMyIDEzLjgyNTRDNDUuNDMyIDkuMjM2MDcgNDguODE2MiA2LjE5NTYyIDUzLjAzMjIgNi4xOTU2MkM1Ni44NzUzIDYuMTk1NjIgNTguOTk3NiA4LjQ2MTYxIDU5LjgwMDcgMTAuNDk4MUw1Ny4zMDU1IDExLjc4ODlDNTYuNzg5MyAxMC4zMjYgNTUuMzg0IDguODYzMTggNTMuMDMyMiA4Ljg2MzE4QzUwLjI1MDIgOC44NjMxOCA0OC4zMjg3IDEwLjk1NzEgNDguMzI4NyAxMy44MjU0QzQ4LjMyODcgMTYuNjM2NCA1MC4yNTAyIDE4Ljg0NSA1My4wMzIyIDE4Ljg0NUM1NS4yOTc5IDE4Ljg0NSA1Ni43ODkzIDE3LjQzOTUgNTcuMzA1NSAxNS45NzY3TDU5LjgwMDcgMTcuMjY3NEM1OC45OTc2IDE5LjI0NjYgNTYuNzYwNiAyMS40ODM5IDUzLjAzMjIgMjEuNDgzOVoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTYyLjI2OCAyMS4yMjU3VjBINjUuMTM2VjguMjg5NTFDNjUuOTY3OCA3LjAyNzQ0IDY3LjQzMDQgNi4xOTU2MiA2OS40MzggNi4xOTU2MkM3Mi43MDc2IDYuMTk1NjIgNzQuOTQ0NiA4LjYzMzcyIDc0Ljk0NDYgMTEuODE3NlYyMS4yMjU3SDcyLjA3NjZWMTIuNTA2QzcyLjA3NjYgMTAuMjExMyA3MC41NTY2IDguODkxODcgNjguNjA2MyA4Ljg5MTg3QzY2LjYyNzQgOC44OTE4NyA2NS4xMzYgMTAuMzI2IDY1LjEzNiAxMi41MDZWMjEuMjI1N0g2Mi4yNjhaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik03OC4wODY5IDIxLjIyNTdWMEg4MC45NTQ4VjIxLjIyNTdINzguMDg2OVoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTg1Ljg4NzggMjcuNzk0M0w4OC43NTU4IDIxLjExMUw4Mi41MDM2IDYuNDUzNzdIODUuNzE1N0w5MC4zNjE5IDE3Ljc4MzdMOTQuODA3MyA2LjQ1Mzc3SDk4LjEwNTVMODkuMSAyNy43OTQzSDg1Ljg4NzhaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==";

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Satoshi",
    color: C.dark,
    paddingBottom: 52,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.dark,
    paddingHorizontal: 32,
    paddingVertical: 11,
    marginBottom: 24,
  },
  headerLogo: { width: 52, height: 15 },
  headerRight: { fontSize: 8, color: "#666" },

  // ── Cover ─────────────────────────────────────────────────────────────────
  cover: { flex: 1, backgroundColor: C.dark, padding: 40, justifyContent: "space-between" },
  coverLogo: { width: 99, height: 28 },
  coverBadge: { fontSize: 8, color: C.accent, marginBottom: 12 },
  coverTitle: {
    fontSize: 28, fontFamily: "Satoshi", fontWeight: 700, color: C.white,
    lineHeight: 1.3, marginBottom: 10,
  },
  coverUrl: { fontSize: 9, color: "#666" },
  coverFooter: { fontSize: 8, color: "#555" },

  // ── Section wrapper ───────────────────────────────────────────────────────
  section: { paddingHorizontal: 32, marginBottom: 16 },
  sectionLabel: {
    fontSize: 8, color: C.muted,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: "solid",
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: { backgroundColor: C.bg, borderRadius: 6, padding: 10, marginBottom: 6 },
  cardTitle: { fontSize: 9, fontFamily: "Satoshi", fontWeight: 700, color: C.dark, marginBottom: 3 },
  cardDesc: { fontSize: 7.5, color: "#444", lineHeight: 1.5, marginBottom: 4 },
  bullet: { fontSize: 7, color: "#555", lineHeight: 1.4 },

  // ── Colors ────────────────────────────────────────────────────────────────
  colorsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  colorChip: { alignItems: "center", width: 60, marginRight: 8, marginBottom: 6 },
  colorSwatch: { width: 56, height: 32, borderRadius: 5, marginBottom: 3 },
  colorHex: { fontSize: 7, color: C.muted, textAlign: "center" },
  colorLabel: { fontSize: 7.5, color: C.dark, textAlign: "center", marginBottom: 1 },

  // ── Fonts ─────────────────────────────────────────────────────────────────
  fontsRow: { flexDirection: "row", marginBottom: 4 },
  fontChip: {
    backgroundColor: C.bg, borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 5, marginRight: 8,
  },
  fontName: { fontSize: 8.5, color: C.dark },

  // ── Lead tools ────────────────────────────────────────────────────────────
  leadRow: {
    flexDirection: "row", alignItems: "flex-start",
    padding: 8, backgroundColor: C.bg, borderRadius: 5, marginBottom: 4,
  },
  leadDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#22c55e", marginTop: 3, marginRight: 8, flexShrink: 0,
  },
  leadLabel: { fontSize: 8.5, fontFamily: "Satoshi", fontWeight: 700, color: C.dark, marginBottom: 2 },
  leadSource: { fontSize: 7, color: C.muted, lineHeight: 1.4 },

  // ── Popup label ───────────────────────────────────────────────────────────
  popupLabel: { fontSize: 7.5, fontFamily: "Satoshi", fontWeight: 700, color: C.accent, marginBottom: 5 },

  // ── SalesPopup ────────────────────────────────────────────────────────────
  spCard: {
    backgroundColor: C.white, borderRadius: 12, padding: 20, marginBottom: 8,
    maxWidth: 360, alignSelf: "center", width: "100%",
    borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid",
  },
  spHeader: { alignItems: "center", marginBottom: 16 },
  spBrand: { fontSize: 7, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  spTitle: { fontSize: 16, fontFamily: "Satoshi", fontWeight: 700, color: "#1e293b", marginBottom: 3, textAlign: "center" },
  spSubtitle: { fontSize: 9, color: "#64748b", textAlign: "center" },
  spProductsRow: { flexDirection: "row", marginBottom: 14 },
  spProduct: { flex: 1, marginRight: 10, alignItems: "center" },
  spProductImage: { width: 76, height: 76, borderRadius: 8, marginBottom: 6 },
  spProductName: { fontSize: 8, fontFamily: "Satoshi", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: 3, lineHeight: 1.3 },
  spProductPrice: { fontSize: 9, fontFamily: "Satoshi", fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: 6 },
  spBtn: { backgroundColor: "#1e293b", borderRadius: 6, paddingVertical: 5, paddingHorizontal: 0, width: "100%", alignItems: "center" },
  spBtnText: { fontSize: 7, fontFamily: "Satoshi", fontWeight: 700, color: C.white },
  spDismiss: { alignItems: "center", marginTop: 8 },
  spDismissText: { fontSize: 7, color: "#1e293b", textDecoration: "underline" },

  // ── NewsletterPopup ───────────────────────────────────────────────────────
  nlCard: {
    backgroundColor: C.white, borderRadius: 12, padding: 20, marginBottom: 8,
    maxWidth: 300, alignSelf: "center", width: "100%",
    borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid",
  },
  nlHeader: { marginBottom: 14, paddingRight: 16 },
  nlTitle: { fontSize: 14, fontFamily: "Satoshi", fontWeight: 700, color: "#1e293b", marginBottom: 3 },
  nlSubtitle: { fontSize: 8.5, color: "#64748b" },
  nlBestsellerList: { marginBottom: 12 },
  nlBestsellerItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  nlBestsellerImg: { width: 44, height: 44, borderRadius: 6, marginRight: 8, flexShrink: 0 },
  nlBestsellerInfo: { flex: 1 },
  nlBestsellerName: { fontSize: 8, fontFamily: "Satoshi", fontWeight: 700, color: "#1e293b", marginBottom: 2 },
  nlBestsellerPriceOld: { fontSize: 7, color: "#94a3b8", textDecoration: "line-through", marginBottom: 1 },
  nlBestsellerPriceNew: { fontSize: 7.5, color: "#16a34a", fontFamily: "Satoshi", fontWeight: 700, marginBottom: 4 },
  nlBestsellerPrice: { fontSize: 7, color: "#64748b", marginBottom: 4 },
  nlBestsellerCta: { backgroundColor: "#1e293b", borderRadius: 99, paddingVertical: 3, paddingHorizontal: 8, alignSelf: "flex-start" },
  nlBestsellerCtaText: { fontSize: 6.5, fontFamily: "Satoshi", fontWeight: 700, color: C.white },
  nlDiscountNote: { fontSize: 7.5, color: "#475569", marginBottom: 6 },
  nlInput: { borderWidth: 1.5, borderColor: "#e2e8f0", borderStyle: "solid", borderRadius: 6, padding: 7, marginBottom: 6 },
  nlInputText: { fontSize: 8, color: "#64748b" },
  nlSubmit: { backgroundColor: "#1e293b", borderRadius: 6, padding: 9, alignItems: "center" },
  nlSubmitText: { fontSize: 8, fontFamily: "Satoshi", fontWeight: 700, color: C.white },

  // ── LimitedOfferPopup ─────────────────────────────────────────────────────
  loCard: {
    backgroundColor: C.white, borderRadius: 12, paddingVertical: 20, paddingHorizontal: 24, marginBottom: 8,
    maxWidth: 300, alignSelf: "center", width: "100%", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid",
  },
  loBrand: { fontSize: 7, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  loTitle: { fontSize: 13, fontFamily: "Satoshi", fontWeight: 700, color: "#111827", marginBottom: 14, textAlign: "center", lineHeight: 1.4 },
  loProductImg: { width: 90, height: 90, borderRadius: 8, marginBottom: 6 },
  loProductName: { fontSize: 9, fontFamily: "Satoshi", fontWeight: 700, color: "#1f2933", marginBottom: 6, textAlign: "center" },
  loPricing: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  loPriceOld: { fontSize: 9, color: "#9ca3af", marginRight: 8, textDecoration: "line-through" },
  loPriceNew: { fontSize: 14, fontFamily: "Satoshi", fontWeight: 700, color: "#059669" },
  loCountdown: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  loTimeBox: { alignItems: "center", marginHorizontal: 8, minWidth: 44 },
  loTimeValue: { fontSize: 20, fontFamily: "Satoshi", fontWeight: 700, color: "#111827", marginBottom: 2 },
  loTimeLabel: { fontSize: 6, color: "#6b7280", letterSpacing: 1.5 },
  loActions: { flexDirection: "row", width: "100%" },
  loBtn: { flex: 1, borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  loBtnNo: { backgroundColor: "#f1f5f9", marginRight: 8 },
  loBtnYes: { backgroundColor: "#111827" },
  loBtnNoText: { fontSize: 8, color: "#4b5563" },
  loBtnYesText: { fontSize: 8, fontFamily: "Satoshi", fontWeight: 700, color: C.white },

  // ── Popup page helpers ────────────────────────────────────────────────────
  popupDesc: { fontSize: 8.5, color: "#555", lineHeight: 1.55, marginBottom: 10 },
  previewLabel: { fontSize: 7, color: C.muted, letterSpacing: 0.8, marginBottom: 6 },

  // Preview frame (screenshot bg + overlay + popup)
  previewFrame: {
    position: "relative", height: 210, borderRadius: 8, overflow: "hidden",
    marginBottom: 10,
  },
  previewBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" },
  previewOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.25)" },

  // Mini Sales popup (bottom-left)
  miniSalesCard: {
    position: "absolute", bottom: 10, left: 10,
    backgroundColor: C.white, borderRadius: 8, padding: 8, width: 160,
  },
  miniTitle: { fontSize: 7.5, fontFamily: "Satoshi", fontWeight: 700, color: "#1e293b", marginBottom: 5, textAlign: "center" },
  miniProductsRow: { flexDirection: "row" },
  miniProduct: { flex: 1, alignItems: "center", marginRight: 6 },
  miniProductImg: { width: 50, height: 50, borderRadius: 5, marginBottom: 3 },
  miniProductPrice: { fontSize: 6, color: "#1e293b", fontFamily: "Satoshi", fontWeight: 700, textAlign: "center", marginBottom: 3 },
  miniBtn: { backgroundColor: "#1e293b", borderRadius: 4, paddingVertical: 3, width: "100%", alignItems: "center" },
  miniBtnText: { fontSize: 5.5, fontFamily: "Satoshi", fontWeight: 700, color: C.white },

  // Mini Newsletter popup (top-right)
  miniNlCard: {
    position: "absolute", top: 10, right: 10,
    backgroundColor: C.white, borderRadius: 8, padding: 8, width: 150,
  },
  miniNlItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  miniNlImg: { width: 28, height: 28, borderRadius: 4, marginRight: 5 },
  miniNlName: { fontSize: 6, color: "#1e293b", flex: 1 },
  miniNlInput: { borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid", borderRadius: 4, padding: 4, marginBottom: 4 },
  miniNlInputText: { fontSize: 6, color: "#94a3b8" },
  miniNlBtn: { backgroundColor: "#1e293b", borderRadius: 4, paddingVertical: 4, alignItems: "center" },

  // Mini Limited popup (center)
  miniLoCard: {
    position: "absolute", top: "15%", left: "20%", right: "20%",
    backgroundColor: C.white, borderRadius: 8, padding: 10, alignItems: "center",
  },
  miniLoTitle: { fontSize: 7, fontFamily: "Satoshi", fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 6, lineHeight: 1.3 },
  miniCountdown: { flexDirection: "row", marginBottom: 6 },
  miniTimeBox: { alignItems: "center", marginHorizontal: 4 },
  miniTimeVal: { fontSize: 11, fontFamily: "Satoshi", fontWeight: 700, color: "#111827" },
  miniTimeLabel: { fontSize: 5, color: "#6b7280" },
  miniLoActions: { flexDirection: "row", width: "100%" },
  miniLoBtn: { flex: 1, borderRadius: 4, paddingVertical: 4, alignItems: "center", marginHorizontal: 2 },
  miniLoBtnNo: { fontSize: 6, color: "#4b5563" },
  miniLoBtnYes: { fontSize: 6, fontFamily: "Satoshi", fontWeight: 700, color: C.white },

  // ── Differentiators ───────────────────────────────────────────────────────
  diffCard: {
    backgroundColor: C.bg, borderRadius: 6, padding: 10,
    marginBottom: 6, flexDirection: "row",
  },
  diffBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.accent,
    alignItems: "center", justifyContent: "center",
    marginRight: 10, flexShrink: 0, marginTop: 1,
  },
  diffBadgeText: { fontSize: 8, fontFamily: "Satoshi", fontWeight: 700, color: C.dark },
  diffTitle: { fontSize: 9, fontFamily: "Satoshi", fontWeight: 700, color: C.dark, marginBottom: 3 },
  diffDesc: { fontSize: 8, color: "#444", lineHeight: 1.55 },

  // ── How it works ──────────────────────────────────────────────────────────
  howRow: { flexDirection: "row" },
  howCard: { flex: 1, backgroundColor: C.dark, borderRadius: 8, padding: 14, marginRight: 8 },
  howStep: { fontSize: 28, fontFamily: "Satoshi", fontWeight: 700, color: "#1a1a1a", marginBottom: 6 },
  howLabel: { fontSize: 8, fontFamily: "Satoshi", fontWeight: 700, color: C.accent, marginBottom: 5 },
  howDesc: { fontSize: 8, color: "#aaa", lineHeight: 1.55 },

  // ── CTA bar ───────────────────────────────────────────────────────────────
  ctaBar: {
    marginHorizontal: 32, backgroundColor: "#111",
    borderRadius: 10, padding: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: "#333", borderStyle: "solid",
  },
  ctaBarBadge: { fontSize: 7.5, fontFamily: "Satoshi", fontWeight: 700, color: C.accent, marginBottom: 5 },
  ctaBarTitle: { fontSize: 13, fontFamily: "Satoshi", fontWeight: 700, color: C.white, marginBottom: 4 },
  ctaBarSub: { fontSize: 9, color: "#aaa", marginBottom: 4 },
  ctaBarSub2: { fontSize: 8, color: "#555" },
  ctaBarBtn: { backgroundColor: C.accent, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 18, marginBottom: 6 },
  ctaBarBtnText: { fontSize: 9, fontFamily: "Satoshi", fontWeight: 700, color: C.dark },
  ctaBarBtnSub: { fontSize: 7, color: "#555", textAlign: "center" },

  // ── Footer (fixed) ────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 16, left: 32, right: 32,
    flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: "#aaa" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePrice(priceStr: string): number | null {
  const num = parseFloat(String(priceStr).replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(num) ? null : num;
}
function formatPrice(num: number): string {
  return num.toFixed(2).replace(".", ",") + " zł";
}

function extractImgUrl(background: string | undefined): string | null {
  if (!background) return null;
  const m = background.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  return m ? m[1] : null;
}

function PageHeader({ label }: { label: string }) {
  return (
    <View style={s.header} fixed>
      <Image src={LOGO_URI} style={s.headerLogo} />
      <Text style={s.headerRight}>{label}</Text>
    </View>
  );
}

function PageFooter({ url }: { url: string }) {
  return (
    <View style={s.footer} fixed>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `catchly.pl · ${url}  ·  ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF = [
  {
    title: "Samouczący się silnik konwersji",
    desc: "To nie są zwykłe popupy. Catchly analizuje, w którym momencie użytkownik chce wyjść ze strony i w milisekundę dopasowuje komunikat (rabat, darmowa konsultacja, lead magnet), który go zatrzyma. Im więcej masz wizyt, tym mądrzejszy staje się Twój Agent.",
  },
  {
    title: "Zarządzanie przez WhatsApp i Email",
    desc: "Zapomnij o skomplikowanych panelach i logowaniu. Chcesz zmienić promocję? Napisz do swojego Agenta na WhatsAppie: \"Zmień rabat na 15% do końca weekendu\". Catchly zajmie się resztą w minutę.",
  },
  {
    title: "Radar Konkurencji i Analityk w jednym",
    desc: "Agent nie tylko pilnuje Twojej strony, ale też monitoruje ruchy konkurencji. Jeśli Twoi rywale odpalą nową promocję, dostaniesz powiadomienie z propozycją kontrreakcji.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    label: "AI ANALIZUJE",
    desc: "Catchly skanuje Twoją stronę, analizuje zachowanie użytkowników i wykrywa momenty, w których odwiedzający są bliscy rezygnacji.",
  },
  {
    step: "02",
    label: "AI PROPONUJE",
    desc: "Na podstawie danych Agent przygotowuje gotowe warianty popupów dopasowane do Twojej oferty, stylu i grupy docelowej.",
  },
  {
    step: "03",
    label: "TY DECYDUJESZ",
    desc: "Akceptujesz propozycje jednym kliknięciem. System przeprowadza testy A/B i zostawia tylko wersje, które przynoszą konwersje.",
  },
];

// ─── Popup visual components (react-pdf) ─────────────────────────────────────

function PdfSalesPopup({ popup }: { popup: PopupData["salesPopup"] }) {
  const products = popup.products.slice(0, 2);
  return (
    <View style={s.spCard} wrap={false}>
      <View style={s.spHeader}>
        {popup.brand ? <Text style={s.spBrand}>{popup.brand}</Text> : null}
        <Text style={s.spTitle}>{popup.title}</Text>
        <Text style={s.spSubtitle}>{popup.subtitle}</Text>
      </View>
      <View style={s.spProductsRow}>
        {products.map((p, i) => {
          const imgUrl = p.image ?? extractImgUrl(typeof p.background === "string" ? p.background : undefined);
          const isColor = !imgUrl && typeof p.background === "string" && !p.background.startsWith("url");
          const bgColor = isColor ? (p.background as string) : "#e2e8f0";
          const isLast = i === products.length - 1;
          return (
            <View key={i} style={[s.spProduct, isLast ? { marginRight: 0 } : {}]}>
              {imgUrl ? (
                <Image src={imgUrl} style={s.spProductImage} />
              ) : (
                <View style={[s.spProductImage, { backgroundColor: bgColor }]} />
              )}
              <Text style={s.spProductName}>{p.name}</Text>
              <Text style={s.spProductPrice}>{p.price}</Text>
              <View style={s.spBtn}>
                <Text style={s.spBtnText}>Dodaj do koszyka</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={s.spDismiss}>
        <Text style={s.spDismissText}>Odrzuć</Text>
      </View>
    </View>
  );
}

function PdfNewsletterPopup({ popup }: { popup: PopupData["newsletterPopup"] }) {
  return (
    <View style={s.nlCard} wrap={false}>
      <View style={s.nlHeader}>
        <Text style={s.nlTitle}>{popup.title}</Text>
        <Text style={s.nlSubtitle}>{popup.subtitle}</Text>
      </View>
      <View style={s.nlBestsellerList}>
        {popup.products.slice(0, 3).map((p, i) => {
          const imgUrl = p.image ?? extractImgUrl(typeof p.background === "string" ? p.background : undefined);
          const isColor = !imgUrl && typeof p.background === "string" && !p.background.startsWith("url");
          const bgColor = isColor ? (p.background as string) : "#e5e5e5";
          return (
            <View key={i} style={s.nlBestsellerItem}>
              {imgUrl ? (
                <Image src={imgUrl} style={s.nlBestsellerImg} />
              ) : (
                <View style={[s.nlBestsellerImg, { backgroundColor: bgColor }]} />
              )}
              <View style={s.nlBestsellerInfo}>
                <Text style={s.nlBestsellerName}>{p.name}</Text>
                {(() => {
                  const num = parsePrice(p.price);
                  return num ? (
                    <>
                      <Text style={s.nlBestsellerPriceOld}>{formatPrice(num)}</Text>
                      <Text style={s.nlBestsellerPriceNew}>{formatPrice(num * 0.9)}</Text>
                    </>
                  ) : (
                    <Text style={s.nlBestsellerPrice}>{p.price}</Text>
                  );
                })()}
                <View style={s.nlBestsellerCta}>
                  <Text style={s.nlBestsellerCtaText}>Dodaj do koszyka</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={s.nlDiscountNote}>
        Zapisz się i zyskaj <Text style={{ fontFamily: "Satoshi", fontWeight: 700 }}>-10%</Text> na produkty
      </Text>
      <View style={s.nlInput}>
        <Text style={s.nlInputText}>Wpisz swój e-mail</Text>
      </View>
      <View style={s.nlSubmit}>
        <Text style={s.nlSubmitText}>Zapisz się do newslettera</Text>
      </View>
    </View>
  );
}

function PdfLimitedPopup({ popup }: { popup: PopupData["limitedPopup"] }) {
  const h = String(popup.durationHours ?? 2).padStart(2, "0");
  const imgUrl = popup.productImage ?? null;
  return (
    <View style={s.loCard} wrap={false}>
      {popup.brand ? <Text style={s.loBrand}>{popup.brand}</Text> : null}
      <Text style={s.loTitle}>{popup.titleLine1}</Text>
      {(imgUrl || popup.productName || popup.newPrice) && (
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          {imgUrl ? <Image src={imgUrl} style={s.loProductImg} /> : null}
          {popup.productName ? <Text style={s.loProductName}>{popup.productName}</Text> : null}
          {(popup.oldPrice || popup.newPrice) && (
            <View style={s.loPricing}>
              {popup.oldPrice ? <Text style={s.loPriceOld}>{popup.oldPrice}</Text> : null}
              {popup.newPrice ? <Text style={s.loPriceNew}>{popup.newPrice}</Text> : null}
            </View>
          )}
        </View>
      )}
      <View style={s.loCountdown}>
        {[h, "00", "00"].map((val, i) => (
          <View key={i} style={s.loTimeBox}>
            <Text style={s.loTimeValue}>{val}</Text>
            <Text style={s.loTimeLabel}>{["GODZIN", "MINUT", "SEKUND"][i]}</Text>
          </View>
        ))}
      </View>
      <View style={s.loActions}>
        <View style={[s.loBtn, s.loBtnNo]}>
          <Text style={s.loBtnNoText}>Nie, dziękuję</Text>
        </View>
        <View style={[s.loBtn, s.loBtnYes]}>
          <Text style={s.loBtnYesText}>{popup.ctaLabel || "Tak, chcę!"}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface AuditPDFData {
  analysis: AnalysisState;
  popupData: PopupData | null;
  generatedAt: string;
}

export function AuditPDF({ data }: { data: AuditPDFData }) {
  const { analysis, popupData, generatedAt } = data;
  const domain = (() => {
    try { return new URL(analysis.url).hostname.replace(/^www\./, ""); }
    catch { return analysis.url; }
  })();

  return (
    <Document
      title={`Audyt Catchly — ${domain}`}
      author="Catchly AI"
      subject="Raport audytu AI"
    >

      {/* ── OKŁADKA ─────────────────────────────────────────────────────── */}
      <Page size="A4" style={{ ...s.page, paddingBottom: 0 }}>
        <View style={s.cover}>
          <Image src={LOGO_URI} style={s.coverLogo} />
          <View>
            <Text style={s.coverBadge}>RAPORT AUDYTU AI</Text>
            <Text style={s.coverTitle}>Analiza {domain}</Text>
            <Text style={s.coverUrl}>Wygenerowano: {generatedAt}</Text>
          </View>
          <Text style={s.coverFooter}>catchly.pl  ·  Przedsprzedaż — premiera 1 lipca 2026</Text>
        </View>
      </Page>

      {/* ── IDENTYFIKACJA WIZUALNA ───────────────────────────────────────── */}
      {analysis.styleData && (
        <Page size="A4" style={s.page}>
          <PageHeader label="IDENTYFIKACJA WIZUALNA" />
          <PageFooter url={domain} />

          {analysis.screenshotUrl && (
            <View style={s.section} wrap={false}>
              <Text style={s.sectionLabel}>ZRZUT EKRANU — STRONA GŁÓWNA</Text>
              <Image
                src={analysis.screenshotUrl}
                style={{ width: "100%", height: 200, borderRadius: 6 }}
              />
            </View>
          )}

          <View style={s.section} wrap={false}>
            <Text style={s.sectionLabel}>KOLORY STRONY</Text>
            <View style={s.colorsRow}>
              {analysis.styleData.colors.map((c, i) => (
                <View key={i} style={s.colorChip}>
                  <View style={[s.colorSwatch, { backgroundColor: c.hex }]} />
                  <Text style={s.colorLabel}>{c.label}</Text>
                  <Text style={s.colorHex}>{c.hex}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.section} wrap={false}>
            <Text style={s.sectionLabel}>TYPOGRAFIA</Text>
            <View style={s.fontsRow}>
              {analysis.styleData.fonts.map((f, i) => (
                <View key={i} style={s.fontChip}>
                  <Text style={s.fontName}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.section} wrap={false}>
            <Text style={s.sectionLabel}>ZAOKRĄGLENIE ELEMENTÓW</Text>
            <View style={s.card}>
              <Text style={s.cardTitle}>
                {analysis.styleData.borderRadius === "rounded" ? "Zaokrąglony styl" : "Ostry styl"}
                {"  ·  "}{analysis.styleData.borderRadiusPx}px border-radius
              </Text>
              <Text style={s.cardDesc}>
                Wykryto {analysis.styleData.borderRadiusCount} elementów z zaokrąglonymi narożnikami.
              </Text>
            </View>
          </View>
        </Page>
      )}

      {/* ── STRUKTURA + NARZĘDZIA ────────────────────────────────────────── */}
      {((analysis.subpagesData && analysis.subpagesData.length > 0) ||
        (analysis.leadToolsData && analysis.leadToolsData.length > 0)) && (
        <Page size="A4" style={s.page}>
          <PageHeader label="ANALIZA STRONY" />
          <PageFooter url={domain} />

          {analysis.subpagesData && analysis.subpagesData.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>
                PRZEANALIZOWANE PODSTRONY ({analysis.subpagesData.length})
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {analysis.subpagesData.map((sp, i) => (
                  <View
                    key={i}
                    wrap={false}
                    style={[
                      s.card,
                      { width: "47%", marginRight: i % 2 === 0 ? "3%" : 0 },
                    ]}
                  >
                    <Text style={s.cardTitle}>{sp.name}</Text>
                    <Text style={s.cardDesc}>{sp.description}</Text>
                    {sp.bullets.slice(0, 3).map((b, j) => (
                      <Text key={j} style={s.bullet}>· {b}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}

          {analysis.leadToolsData && analysis.leadToolsData.filter(t => !t.suggestion).length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>
                ZIDENTYFIKOWANE NARZĘDZIA POZYSKIWANIA ({analysis.leadToolsData.filter(t => !t.suggestion).length})
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {analysis.leadToolsData.filter(t => !t.suggestion).map((tool, i) => (
                  <View
                    key={i}
                    wrap={false}
                    style={[
                      s.leadRow,
                      { width: "47%", marginRight: i % 2 === 0 ? "3%" : 0, marginBottom: 6 },
                    ]}
                  >
                    <View style={s.leadDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.leadLabel}>{tool.label}</Text>
                      <Text style={s.leadSource}>{tool.sourceText}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Page>
      )}

      {/* ── OPCJA A — POP-UP SPRZEDAŻOWY ────────────────────────────────── */}
      {popupData && (
        <Page size="A4" style={s.page}>
          <PageHeader label="PROPOZYCJE POP-UPÓW" />
          <PageFooter url={domain} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>OPCJA A — POP-UP SPRZEDAŻOWY</Text>
            <Text style={s.popupDesc}>
              Subtelny panel w dolnym lewym rogu ekranu z wybranymi produktami. Nie blokuje strony i zachęca do zakupu w odpowiednim momencie.
            </Text>
          </View>

          {/* Preview: popup on website background */}
          <View style={s.section}>
            <Text style={s.previewLabel}>PODGLĄD NA STRONIE</Text>
            <View style={s.previewFrame}>
              {analysis.screenshotUrl
                ? <Image src={analysis.screenshotUrl} style={s.previewBg} />
                : <View style={[s.previewBg, { backgroundColor: "#e8edf2" }]} />
              }
              <View style={s.previewOverlay} />
              {/* Mini sales popup — bottom left */}
              <View style={s.miniSalesCard}>
                <Text style={s.miniTitle}>{popupData.salesPopup.title}</Text>
                <View style={s.miniProductsRow}>
                  {popupData.salesPopup.products.slice(0, 2).map((p, i) => {
                    const imgUrl = p.image ?? extractImgUrl(typeof p.background === "string" ? p.background : undefined);
                    const bgColor = (!imgUrl && typeof p.background === "string") ? (p.background as string) : "#dde";
                    return (
                      <View key={i} style={[s.miniProduct, i === 1 ? { marginRight: 0 } : {}]}>
                        {imgUrl
                          ? <Image src={imgUrl} style={s.miniProductImg} />
                          : <View style={[s.miniProductImg, { backgroundColor: bgColor }]} />
                        }
                        <Text style={s.miniProductPrice}>{p.price}</Text>
                        <View style={s.miniBtn}><Text style={s.miniBtnText}>Kup</Text></View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Standalone popup */}
          <View style={s.section}>
            <Text style={s.previewLabel}>SAM POP-UP</Text>
            <PdfSalesPopup popup={popupData.salesPopup} />
          </View>
        </Page>
      )}

      {/* ── OPCJA B — NEWSLETTER Z RABATEM ──────────────────────────────── */}
      {popupData && (
        <Page size="A4" style={s.page}>
          <PageHeader label="PROPOZYCJE POP-UPÓW" />
          <PageFooter url={domain} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>OPCJA B — NEWSLETTER Z RABATEM</Text>
            <Text style={s.popupDesc}>
              Karta wyskakująca w prawym górnym rogu. Pokazuje bestsellerowe produkty i oferuje rabat w zamian za zapis do newslettera.
            </Text>
          </View>

          {/* Preview */}
          <View style={s.section}>
            <Text style={s.previewLabel}>PODGLĄD NA STRONIE</Text>
            <View style={s.previewFrame}>
              {analysis.screenshotUrl
                ? <Image src={analysis.screenshotUrl} style={s.previewBg} />
                : <View style={[s.previewBg, { backgroundColor: "#e8edf2" }]} />
              }
              <View style={s.previewOverlay} />
              {/* Mini newsletter popup — top right */}
              <View style={s.miniNlCard}>
                <Text style={s.miniTitle}>{popupData.newsletterPopup.title}</Text>
                {popupData.newsletterPopup.products.slice(0, 2).map((p, i) => {
                  const imgUrl = p.image ?? extractImgUrl(typeof p.background === "string" ? p.background : undefined);
                  const bgColor = (!imgUrl && typeof p.background === "string") ? (p.background as string) : "#dde";
                  return (
                    <View key={i} style={s.miniNlItem}>
                      {imgUrl
                        ? <Image src={imgUrl} style={s.miniNlImg} />
                        : <View style={[s.miniNlImg, { backgroundColor: bgColor }]} />
                      }
                      <Text style={s.miniNlName}>{p.name}</Text>
                    </View>
                  );
                })}
                <View style={s.miniNlInput}><Text style={s.miniNlInputText}>e-mail...</Text></View>
                <View style={s.miniNlBtn}><Text style={s.miniBtnText}>Zapisz się</Text></View>
              </View>
            </View>
          </View>

          {/* Standalone */}
          <View style={s.section}>
            <Text style={s.previewLabel}>SAM POP-UP</Text>
            <PdfNewsletterPopup popup={popupData.newsletterPopup} />
          </View>
        </Page>
      )}

      {/* ── OPCJA C — OFERTA OGRANICZONA CZASOWO ────────────────────────── */}
      {popupData && (
        <Page size="A4" style={s.page}>
          <PageHeader label="PROPOZYCJE POP-UPÓW" />
          <PageFooter url={domain} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>OPCJA C — OFERTA OGRANICZONA CZASOWO</Text>
            <Text style={s.popupDesc}>
              Centralna nakładka z odliczaniem czasu. Tworzy poczucie pilności i motywuje do natychmiastowego skorzystania z oferty.
            </Text>
          </View>

          {/* Preview */}
          <View style={s.section}>
            <Text style={s.previewLabel}>PODGLĄD NA STRONIE</Text>
            <View style={s.previewFrame}>
              {analysis.screenshotUrl
                ? <Image src={analysis.screenshotUrl} style={s.previewBg} />
                : <View style={[s.previewBg, { backgroundColor: "#e8edf2" }]} />
              }
              <View style={[s.previewOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]} />
              {/* Mini limited popup — centered */}
              <View style={s.miniLoCard}>
                <Text style={s.miniLoTitle}>{popupData.limitedPopup.titleLine1}</Text>
                <View style={s.miniCountdown}>
                  {[String(popupData.limitedPopup.durationHours ?? 2).padStart(2,"0"), "00", "00"].map((v, i) => (
                    <View key={i} style={s.miniTimeBox}>
                      <Text style={s.miniTimeVal}>{v}</Text>
                      <Text style={s.miniTimeLabel}>{["H","M","S"][i]}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.miniLoActions}>
                  <View style={[s.miniLoBtn, { backgroundColor: "#f1f5f9" }]}><Text style={s.miniLoBtnNo}>Nie</Text></View>
                  <View style={[s.miniLoBtn, { backgroundColor: "#111827" }]}><Text style={s.miniLoBtnYes}>{popupData.limitedPopup.ctaLabel || "Tak"}</Text></View>
                </View>
              </View>
            </View>
          </View>

          {/* Standalone */}
          <View style={s.section}>
            <Text style={s.previewLabel}>SAM POP-UP</Text>
            <PdfLimitedPopup popup={popupData.limitedPopup} />
          </View>
        </Page>
      )}

      {/* ── CO WYRÓŻNIA CATCHLY ──────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <PageHeader label="CO WYRÓŻNIA CATCHLY" />
        <PageFooter url={domain} />

        <View style={s.section}>
          <Text style={s.sectionLabel}>DLACZEGO CATCHLY, A NIE ZWYKŁE POP-UPY</Text>
          {DIFF.map((d, i) => (
            <View key={i} style={s.diffCard} wrap={false}>
              <View style={s.diffBadge}>
                <Text style={s.diffBadgeText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.diffTitle}>{d.title}</Text>
                <Text style={s.diffDesc}>{d.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.sectionLabel}>JAK TO DZIAŁA KROK PO KROKU</Text>
          <View style={s.howRow}>
            {HOW_IT_WORKS.map((step, i) => (
              <View
                key={i}
                style={[s.howCard, i === HOW_IT_WORKS.length - 1 ? { marginRight: 0 } : {}]}
              >
                <Text style={s.howStep}>{step.step}</Text>
                <Text style={s.howLabel}>{step.label}</Text>
                <Text style={s.howDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.ctaBar} wrap={false}>
          <View style={{ flex: 1 }}>
            <Text style={s.ctaBarBadge}>PRZEDSPRZEDAŻ · PREMIERA 1 LIPCA 2026</Text>
            <Text style={s.ctaBarTitle}>Kup dostęp na całe życie</Text>
            <Text style={s.ctaBarSub}>1 190 zł jednorazowo · bez abonamentu · 74 dni na zwrot</Text>
            <Text style={s.ctaBarSub2}>Cena po premierze: 2 490 zł/rok</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <View style={s.ctaBarBtn}>
              <Text style={s.ctaBarBtnText}>catchly.pl</Text>
            </View>
            <Text style={s.ctaBarBtnSub}>Kup teraz</Text>
          </View>
        </View>
      </Page>

    </Document>
  );
}
