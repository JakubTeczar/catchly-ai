// ─── A/B Test Configuration ───────────────────────────────────────────────────
//
// Zmień AB_VARIANT_CONFIG, żeby kontrolować który wariant widzą użytkownicy:
//   "A"      → zawsze wariant A  (email po propozycjach popupów)
//   "B"      → zawsze wariant B  (email gate przed propozycjami)
//   "random" → losowy podział 50/50

export const AB_VARIANT_CONFIG: "A" | "B" | "random" = "random";

export function getVariant(): "A" | "B" {
  if (AB_VARIANT_CONFIG === "A") return "A";
  if (AB_VARIANT_CONFIG === "B") return "B";
  return Math.random() < 0.5 ? "A" : "B";
}
