import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_ANALYSIS } from "@/lib/mockData";
import type { AnalysisState, StyleData, SubpageSummary, LeadTool, ProductsData, PopupData } from "@/types/analysis";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id === "mock") {
    return NextResponse.json(MOCK_ANALYSIS, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const analysis = await prisma.analysis.findUnique({ where: { id } });
  if (!analysis) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const state: AnalysisState = {
    id: analysis.id,
    status: analysis.status as AnalysisState["status"],
    url: analysis.url,
    screenshotDone: analysis.screenshotDone,
    styleDone: analysis.styleDone,
    subpagesDone: analysis.subpagesDone,
    leadToolsDone: analysis.leadToolsDone,
    screenshotUrl: analysis.screenshotUrl,
    styleData: analysis.styleData ? (JSON.parse(analysis.styleData) as StyleData) : null,
    subpagesData: analysis.subpagesData
      ? (JSON.parse(analysis.subpagesData) as SubpageSummary[])
      : null,
    leadToolsData: analysis.leadToolsData
      ? (JSON.parse(analysis.leadToolsData) as LeadTool[])
      : null,
    productsDone: analysis.productsDone,
    productsData: analysis.productsData
      ? (JSON.parse(analysis.productsData) as ProductsData)
      : null,
    popupDone: analysis.popupDone,
    popupData: analysis.popupData
      ? (JSON.parse(analysis.popupData) as PopupData)
      : null,
  };

  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store" },
  });
}
