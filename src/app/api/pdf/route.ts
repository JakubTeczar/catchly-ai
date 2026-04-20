import path from "path";
import fs from "fs";
import { renderToStream } from "@react-pdf/renderer";
import { createElement } from "react";
import type { NextRequest } from "next/server";
import { AuditPDF } from "@/lib/pdf/AuditPDF";
import type { AuditPDFData } from "@/lib/pdf/AuditPDF";
import {
  MOCK_ANALYSIS_PRODUKTY,
  MOCK_ANALYSIS_USLUGI,
  MOCK_POPUP_DATA_PRODUKTY,
  MOCK_POPUP_DATA_USLUGI,
} from "@/lib/mockData";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return d.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Converts a screenshotUrl to a base64 data URI that react-pdf can read reliably.
 * react-pdf's path resolver has issues with Windows paths (C: treated as protocol),
 * so we read the file ourselves and pass it as a data URI.
 */
function resolveScreenshotUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  try {
    const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    const buffer = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase();
    const mime = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const analysisId = searchParams.get("analysisId") ?? "";

  const id = analysisId.trim();
  let pdfData: AuditPDFData | null = null;

  // ── Mock data ─────────────────────────────────────────────────────────────
  if (id === "mock-produkty") {
    pdfData = {
      analysis: {
        ...MOCK_ANALYSIS_PRODUKTY,
        screenshotUrl: resolveScreenshotUrl(MOCK_ANALYSIS_PRODUKTY.screenshotUrl),
      },
      popupData: MOCK_POPUP_DATA_PRODUKTY,
      generatedAt: formatDate(new Date()),
    };
  } else if (id === "mock-uslugi") {
    pdfData = {
      analysis: {
        ...MOCK_ANALYSIS_USLUGI,
        screenshotUrl: resolveScreenshotUrl(MOCK_ANALYSIS_USLUGI.screenshotUrl),
      },
      popupData: MOCK_POPUP_DATA_USLUGI,
      generatedAt: formatDate(new Date()),
    };
  } else {
    // ── Real DB lookup ─────────────────────────────────────────────────────
    try {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.analysis.findUnique({ where: { id } });

      if (!row) {
        return new Response(`Analysis not found (id: "${analysisId}")`, { status: 404 });
      }

      pdfData = {
        analysis: {
          id: row.id,
          status: row.status as "PENDING" | "RUNNING" | "COMPLETED" | "FAILED",
          url: row.url,
          screenshotDone: row.screenshotDone,
          styleDone: row.styleDone,
          subpagesDone: row.subpagesDone,
          leadToolsDone: row.leadToolsDone,
          productsDone: row.productsDone,
          popupDone: row.popupDone,
          screenshotUrl: resolveScreenshotUrl(row.screenshotUrl),
          styleData: row.styleData ? JSON.parse(row.styleData) : null,
          subpagesData: row.subpagesData ? JSON.parse(row.subpagesData) : null,
          leadToolsData: row.leadToolsData ? JSON.parse(row.leadToolsData) : null,
          productsData: row.productsData ? JSON.parse(row.productsData) : null,
          popupData: row.popupData ? JSON.parse(row.popupData) : null,
        },
        popupData: row.popupData ? JSON.parse(row.popupData) : null,
        generatedAt: formatDate(new Date()),
      };
    } catch {
      return new Response("Internal error", { status: 500 });
    }
  }

  // ── Render PDF ─────────────────────────────────────────────────────────────
  if (!pdfData) {
    return new Response("Analysis not found", { status: 404 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(createElement(AuditPDF, { data: pdfData }) as any);

  const domain = (() => {
    try { return new URL(pdfData.analysis.url).hostname.replace("www.", ""); } catch { return "audyt"; }
  })();

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="catchly-audyt-${domain}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
