import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackAnalysisStart } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const { analysisId, variant } = await req.json() as { analysisId: string; variant: string };
    if (!analysisId || !variant) return NextResponse.json({ ok: false });

    const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
    if (!analysis) return NextResponse.json({ ok: false });

    trackAnalysisStart(analysis.url, analysisId, variant);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
