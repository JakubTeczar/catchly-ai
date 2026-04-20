import { readFile } from "fs/promises";
import { openai } from "@/lib/openai";
import type { StyleData, ColorSwatch } from "@/types/analysis";

// ─── FONTS ────────────────────────────────────────────────────────────────────

const GENERIC_FAMILIES = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy",
  "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded",
  "inherit", "initial", "unset", "revert", "revert-layer",
  "-apple-system", "blinkmacsystemfont",
]);

function parseFontFamilyValue(value: string, counts: Map<string, number>) {
  const families = value
    .split(",")
    .map((f) => f.trim().replace(/['"]/g, "").replace(/\s*!important\s*$/, "").trim())
    .filter((f) => f.length > 0 && !GENERIC_FAMILIES.has(f.toLowerCase()));

  for (const family of families) {
    const key = family.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
}

function extractFontsFromSources(html: string, css: string): string[] {
  const counts = new Map<string, number>();

  // 1. font-family: ... w CSS (properties + @font-face)
  const fontFamilyRegex = /font-family\s*:\s*([^;{}]+)/gi;
  let m;
  while ((m = fontFamilyRegex.exec(css)) !== null) {
    parseFontFamilyValue(m[1], counts);
  }

  // 2. Skrót font: <weight> <size> <family> w CSS
  const fontShorthandRegex = /(?<![a-z-])font\s*:\s*[^;{}]+?(?:[\d.]+(?:px|em|rem|%|pt|vh|vw)[\s/\w.]*)\s+([^;{}]+)/gi;
  while ((m = fontShorthandRegex.exec(css)) !== null) {
    parseFontFamilyValue(m[1], counts);
  }

  // 3. Atrybuty style="" w HTML — font-family
  const inlineStyleRegex = /style\s*=\s*["'][^"']*font-family\s*:\s*([^;"']+)/gi;
  while ((m = inlineStyleRegex.exec(html)) !== null) {
    parseFontFamilyValue(m[1], counts);
  }

  // 4. Google Fonts <link> w HTML — np. ?family=Inter:wght@400|Roboto
  const googleFontsRegex = /fonts\.googleapis\.com\/css[^"']*[?&]family=([^"'&]+)/gi;
  while ((m = googleFontsRegex.exec(html)) !== null) {
    const families = decodeURIComponent(m[1])
      .split("|")
      .map((f) => f.split(":")[0].replace(/\+/g, " ").trim());
    for (const family of families) {
      if (family.length > 0) {
        const key = family.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name.replace(/\b\w/g, (c) => c.toUpperCase()));
}

// ─── BORDER RADIUS ────────────────────────────────────────────────────────────

interface BorderRadiusResult {
  count: number;
  style: "rounded" | "sharp";
  px: number;
}

/**
 * Szuka border-radius w CSS i inline stylach HTML.
 * Zlicza wystąpienia i wyciąga wartości px.
 * > 7 wystąpień → rounded, domyślnie 16px jeśli nie wykryto inaczej.
 */
export function analyzeBorderRadius(css: string, html: string): BorderRadiusResult {
  const pxValues: number[] = [];

  /**
   * REGEX wyjaśnienie:
   * border(?:-(?:top|bottom)-(?:left|right))?-radius
   * - Wyłapuje: border-radius
   * - Wyłapuje: border-top-left-radius
   * - Wyłapuje: border-bottom-right-radius, itd.
   */
  const brRegex = /border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*([^;}"']+)/gi;

  function convertToPx(value: string): number | null {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    const unit = value.toLowerCase();
    
    if (unit.includes('px')) return num;
    if (unit.includes('rem') || unit.includes('em')) return num * 16;
    if (unit.includes('vw')) return num * 19.2; // przy założeniu viewportu 1920px
    if (unit.includes('%')) return 9999; // flaga dla pigułek/kół
    
    // Jeśli brak jednostki (częste w inline), traktujemy jako px
    return num;
  }

  function collectMatches(source: string) {
    let m;
    while ((m = brRegex.exec(source)) !== null) {
      // Rozbijamy wartości, bo border-radius może mieć np. "10px 20px"
      const parts = m[1].trim().split(/\s+/);
      for (const part of parts) {
        const px = convertToPx(part);
        if (px !== null) pxValues.push(px);
      }
    }
    brRegex.lastIndex = 0;
  }

  // 1. Przeszukaj CSS (zewnętrzny i tagi <style>)
  collectMatches(css);

  // 2. Przeszukaj style inline w HTML
  const inlineRegex = /style\s*=\s*["']([^"']+)["']/gi;
  let im;
  while ((im = inlineRegex.exec(html)) !== null) {
    collectMatches(im[1]);
  }

  const count = pxValues.length;

  // Jeśli brak jakichkolwiek reguł - ostre krawędzie
  if (count === 0) {
    return { count: 0, style: "sharp", px: 0 };
  }

  // Separacja wartości rzeczywistych i "pigułek"
  const realPx = pxValues.filter(v => v < 9999);
  const pillCount = pxValues.filter(v => v === 9999).length;

  let basePx = 0;

  if (realPx.length > 0) {
    // Używamy mediany, aby odsiać anomalie (np. 1px obramowania)
    const sorted = [...realPx].sort((a, b) => a - b);
    basePx = sorted[Math.floor(sorted.length / 2)];
  } else if (pillCount > 0) {
    // Jeśli są tylko procenty, zakładamy styl Rounded (pigułka)
    basePx = 48; 
  }

  // Zaokrąglanie do standardowych kroków projektowych
  const steps = [0, 4, 8, 12, 16, 20, 24, 32, 48, 64];
  const dominantPx = steps.reduce((prev, curr) =>
    Math.abs(curr - basePx) < Math.abs(prev - basePx) ? curr : prev
  );

  // Zwracamy wynik zgodny z Twoim interfejsem
  return {
    count,
    style: dominantPx > 2 ? "rounded" : "sharp",
    px: dominantPx
  };
}

// ─── COLORS ───────────────────────────────────────────────────────────────────

function hexNormalize(hex: string): string {
  const h = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  return "#" + h.toUpperCase();
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function parseColorValue(value: string): string | null {
  const trimmed = value.trim().replace(/\s*!important\s*$/, "").trim();

  // Pomijamy gradienty, url(), none, transparent, currentColor, zmienne CSS
  if (/gradient|url\s*\(|^none$|^transparent$|^currentcolor$|var\s*\(/i.test(trimmed)) {
    return null;
  }

  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (hexMatch) return hexNormalize(hexMatch[1]);

  const rgbMatch = trimmed.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (rgbMatch) return rgbToHex(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]);

  // rgba z alpha > 0.1 (pomijamy prawie przezroczyste)
  const rgbaMatch = trimmed.match(
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)$/
  );
  if (rgbaMatch && +rgbaMatch[4] > 0.1) {
    return rgbToHex(+rgbaMatch[1], +rgbaMatch[2], +rgbaMatch[3]);
  }

  return null;
}

/**
 * Wyciąga top 5 kolorów z CSS na podstawie liczby wystąpień:
 * - background-color ze wszystkich reguł
 * - background (prosty kolor, nie gradient) ze wszystkich reguł
 * - color z reguł których selektor zawiera a / button / .btn
 */
function extractTop5Colors(css: string): string[] {
  const counts = new Map<string, number>();

  const ruleRegex = /([^{}]*)\{([^{}]+)\}/g;
  let m;

  while ((m = ruleRegex.exec(css)) !== null) {
    const selector = m[1].trim();
    const props = m[2];

    // background-color z każdej reguły
    const bgColorMatch = props.match(/background-color\s*:\s*([^;]+)/i);
    if (bgColorMatch) {
      const hex = parseColorValue(bgColorMatch[1]);
      if (hex) counts.set(hex, (counts.get(hex) || 0) + 1);
    }

    // background (skrót) — tylko gdy prosty kolor
    const bgMatch = props.match(/(?<![a-z-])background\s*:\s*([^;]+)/i);
    if (bgMatch) {
      const hex = parseColorValue(bgMatch[1]);
      if (hex) counts.set(hex, (counts.get(hex) || 0) + 1);
    }

    // color w linkach i buttonach
    if (/\ba\b|button|\.btn|link/i.test(selector)) {
      const colorMatch = props.match(/(?<![a-z-])color\s*:\s*([^;]+)/i);
      if (colorMatch) {
        const hex = parseColorValue(colorMatch[1]);
        if (hex) counts.set(hex, (counts.get(hex) || 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => hex);
}

// ─── WALIDACJA ODPOWIEDZI AI ──────────────────────────────────────────────────

const VALID_LABELS = new Set(["primary", "secondary", "accent"]);
const HEX_RE = /^#[0-9A-F]{6}$/;

function validateAIColors(parsed: unknown): ColorSwatch[] | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;
  if (!Array.isArray(p.colors) || p.colors.length === 0) return null;

  const colors: ColorSwatch[] = [];

  for (const item of p.colors) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;

    const hex =
      typeof c.hex === "string" ? c.hex.trim().toUpperCase() : null;
    const label =
      typeof c.label === "string" ? c.label.trim().toLowerCase() : null;

    if (!hex || !HEX_RE.test(hex)) continue;
    if (!label || !VALID_LABELS.has(label)) continue;

    colors.push({ hex, label, source: "css+vision" });
  }

  // Wymagamy przynajmniej koloru primary
  const hasPrimary = colors.some((c) => c.label === "primary");
  if (!hasPrimary || colors.length === 0) return null;

  return colors.slice(0, 4);
}

// ─── GŁÓWNA FUNKCJA ───────────────────────────────────────────────────────────

export async function extractStyle(
  html: string,
  css: string,
  screenshotFilePath?: string
): Promise<StyleData> {

  // console.log("DOWNLADED CSS",css);
  // console.log("DOWNLADED html",html);
  const fonts = extractFontsFromSources(html, css);
  const borderRadiusResult = analyzeBorderRadius(css, html);
  const top5Colors = extractTop5Colors(css);

  let colors: ColorSwatch[] = [];

  try {
    // Wczytaj screenshot jako base64 (jeśli dostępny)
    let imageBase64: string | null = null;
    if (screenshotFilePath) {
      try {
        const buf = await readFile(screenshotFilePath);
        imageBase64 = buf.toString("base64");
      } catch {
        // screenshot niedostępny — kontynuuj bez obrazka
      }
    }

    const colorList =
      top5Colors.length > 0 ? top5Colors.join(", ") : "brak wykrytych kolorów";

    type ContentPart =
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail: "low" } };

    const content: ContentPart[] = [
      {
        type: "text",
        text: [
          imageBase64
            ? "Masz screenshot strony głównej — to GŁÓWNE źródło prawdy o kolorach marki. Zidentyfikuj kolory dominujące wizualnie: przyciski, nagłówki, tła sekcji, akcenty. UWAGA: screenshot może być częściowo zasłonięty banerem cookie lub przyciemniony overlayem — ignoruj te elementy i szukaj kolorów marki pod nimi (np. w nagłówku, tle, przyciskach widocznych za banerem)."
            : "Brak screenshota — opierasz się wyłącznie na CSS.",
          "",
          `Kolory wykryte automatycznie z CSS (background-color, color linków/buttonów) — pomocniczo:`,
          colorList,
          "",
          "Wybierz kolory brandingowe marki:",
          "- dokładnie 1 kolor primary (główny kolor marki — najczęściej na buttonach, nagłówkach, logo)",
          "- 1 lub 2 kolory secondary (wspierające — tła sekcji, ramki)",
          "- dokładnie 1 kolor accent (wyróżniający CTA lub ważne elementy — może być taki sam jak primary)",
          "",
          "ZASADY:",
          "- Jeśli screenshot wskazuje inny kolor niż CSS — zaufaj screenshotowi.",
          "- Pomiń czyste biele/czarne/szarości jeśli istnieją kolory brandingowe.",
          "- Jeśli CSS nie ma wyraźnych kolorów marki, wyciągnij je ze screenshota.",
          "",
          `Zwróć TYLKO JSON: {"colors": [{"hex": "#XXXXXX", "label": "primary|secondary|accent"}]}`,
        ]
          .filter((l) => l !== "")
          .join("\n"),
      },
    ];

    if (imageBase64) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
          detail: "low",
        },
      });
    }

    const res = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      max_completion_tokens: 400,
    });

    const parsed = JSON.parse(res.choices[0].message.content || "{}");
    const validated = validateAIColors(parsed);

    if (validated) {
      colors = validated;
    } else {
      throw new Error("Nieprawidłowa odpowiedź AI — fallback");
    }
  } catch {
    // Fallback: użyj top 5 kolorów bezpośrednio
    colors = top5Colors.slice(0, 4).map((hex, i) => ({
      hex,
      label: (["primary", "secondary", "accent", "secondary"] as const)[i] ?? "accent",
      source: "css",
    }));
  }

  return {
    colors,
    fonts: fonts.length > 0 ? fonts : ["Nie wykryto"],
    borderRadius: borderRadiusResult.style,
    borderRadiusCount: borderRadiusResult.count,
    borderRadiusPx: borderRadiusResult.px,
  };
}
