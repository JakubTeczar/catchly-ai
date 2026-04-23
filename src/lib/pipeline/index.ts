import path from "path";
import { prisma } from "@/lib/prisma";
import { scrapeUrl, extractCSSLinks, extractInlineCSS, extractLinks, extractText } from "./scraper";
import { takeScreenshot } from "./screenshot";
import { extractStyle } from "./styleExtractor";
import { analyzeSubpages } from "./subpageAnalyzer";
import { detectLeadTools } from "./leadToolsDetector";
import { extractProducts, smartExtractProducts } from "./productExtractor";
import { smartExtractWithWebSearch } from "./productExtractWithAI";
import { generatePopupData } from "./popupGenerator";
import { createLogger } from "./logger";

// ─── POZIOMY ANALIZY (do testów) ─────────────────────────────────────────────
// 1 = screenshot + styl (kolory, czcionki, krawędzie)
// 2 = poziom 1 + podstrony
// 3 = poziom 1 + 2 + lead tools
// 4 = poziom 1 + 2 + 3 + wyciąganie produktów/usług (pełna analiza)
// 5 = TYLKO wyciąganie produktów (test izolowany — pomija screenshot/styl/subpages/leadtools)
const ANALYSIS_LEVEL: 1 | 2 | 3 | 4 | 5 = 4;
// ─────────────────────────────────────────────────────────────────────────────

export async function runAnalysisPipeline(
  id: string, 
  url: string, 
  screenWidth?: number, 
  screenHeight?: number
) {
  const { log, logFile } = createLogger(id);
  log(`[pipeline] START | level: ${ANALYSIS_LEVEL} | url: ${url}`);

  try {

    // ── POZIOM 5: izolowany test wyciągania produktów ─────────────────────────
    if (ANALYSIS_LEVEL === 5) {
      log(`[pipeline] LEVEL 5 START | url: ${url}`);

      const html5 = await scrapeUrl(url, false, true);
      const links5 = extractLinks(html5, url);
      const productsData = await smartExtractProducts(html5, url, links5, log);

      log(`[pipeline] LEVEL 5 DONE | businessType: ${productsData.businessType} | produkty: ${productsData.products.length}`);
      log(`[pipeline] Log zapisany w: ${logFile}`);

      await prisma.analysis.update({
        where: { id },
        data: {
          screenshotDone: true,
          styleDone: true,
          subpagesDone: true,
          leadToolsDone: true,
          productsDone: true,
          productsData: JSON.stringify(productsData),
          status: "COMPLETED",
        },
      });
      return;
    }

    // ── Step 1: Screenshot ────────────────────────────────────────────────────
    let screenshotUrl: string | undefined;
    try {
      screenshotUrl = await takeScreenshot(id, url, screenWidth, screenHeight);
      await prisma.analysis.update({
        where: { id },
        data: { screenshotUrl, screenshotDone: true },
      });
    } catch (e) {
      console.error("[pipeline] screenshot failed:", e);
      await prisma.analysis.update({
        where: { id },
        data: { screenshotDone: true },
      });
    }

    // ── Step 2: Style extraction ──────────────────────────────────────────────
    const html = await scrapeUrl(url);
    let fullCss = extractInlineCSS(html);

    const cssLinks = extractCSSLinks(html, url);
    console.log(`[pipeline] CSS links found: ${cssLinks.length}`, cssLinks);
    for (const cssUrl of cssLinks) {
      try {
        const externalCss = await scrapeUrl(cssUrl);
        fullCss += `\n/* Source: ${cssUrl} */\n` + externalCss;
      } catch (e) {
        console.error(`[pipeline] failed to fetch external css: ${cssUrl}`, e);
      }
    }

    const screenshotFilePath = screenshotUrl
      ? path.join(process.cwd(), "public", screenshotUrl)
      : undefined;
    const styleData = await extractStyle(html, fullCss, screenshotFilePath);
    await prisma.analysis.update({
      where: { id },
      data: { styleData: JSON.stringify(styleData), styleDone: true },
    });

    if (ANALYSIS_LEVEL < 2) {
      await prisma.analysis.update({
        where: { id },
        data: { subpagesDone: true, leadToolsDone: true, productsDone: true, status: "COMPLETED" },
      });
      return;
    }

    // ── Step 3: Subpage analysis ──────────────────────────────────────────────
    const links = extractLinks(html, url);
    const { summaries: subpagesData, pageTexts, pageHtmls } = await analyzeSubpages(links, url);

    // Add homepage HTML/text to the maps (already scraped above)
    if (!pageHtmls.has(url)) pageHtmls.set(url, html);
    if (!pageTexts.has(url)) pageTexts.set(url, extractText(html));

    await prisma.analysis.update({
      where: { id },
      data: { subpagesData: JSON.stringify(subpagesData), subpagesDone: true },
    });

    if (ANALYSIS_LEVEL < 3) {
      await prisma.analysis.update({
        where: { id },
        data: { leadToolsDone: true, productsDone: true, status: "COMPLETED" },
      });
      return;
    }

    // ── Step 4: Lead tools detection ──────────────────────────────────────────
    const leadToolsData = await detectLeadTools(pageTexts);
    await prisma.analysis.update({
      where: { id },
      data: {
        leadToolsData: JSON.stringify(leadToolsData),
        leadToolsDone: true,
      },
    });

    if (ANALYSIS_LEVEL < 4) {
      await prisma.analysis.update({
        where: { id },
        data: { productsDone: true, popupDone: true, status: "COMPLETED" },
      });
      return;
    }

    // ── Step 5: Product/service extraction ────────────────────────────────────
    const productsData = await smartExtractProducts(html, url, links, log);
    await prisma.analysis.update({
      where: { id },
      data: {
        productsData: JSON.stringify(productsData),
        productsDone: true,
      },
    });

    // ── Step 6: Popup generation ───────────────────────────────────────────────
    const popupData = await generatePopupData(productsData, url, subpagesData, log);
    await prisma.analysis.update({
      where: { id },
      data: {
        popupData: JSON.stringify(popupData),
        popupDone: true,
        status: "COMPLETED",
      },
    });

  } catch (e) {
    console.error("[pipeline] fatal error:", e);
    await prisma.analysis.update({
      where: { id },
      data: { status: "FAILED" },
    });
  }
}
