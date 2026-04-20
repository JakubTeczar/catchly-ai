import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackLead } from "@/lib/airtable";
import { sendLeadConfirmation, sendAdminLeadNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, analysisId, variant } = body as {
      email: string;
      name?: string;
      analysisId: string;
      variant?: string;
    };

    if (!email || !analysisId) {
      return NextResponse.json({ error: "Brakuje danych" }, { status: 400 });
    }

    const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
    if (!analysis) {
      return NextResponse.json({ error: "Nie znaleziono analizy" }, { status: 404 });
    }

    // Check if lead already exists
    const existing = await prisma.lead.findUnique({ where: { analysisId } });
    if (existing) {
      return NextResponse.json({ success: true, id: existing.id });
    }

    const lead = await prisma.lead.create({
      data: {
        email,
        name: name || null,
        websiteUrl: analysis.url,
        analysisId,
        variant: variant || null,
      },
    });

    trackLead(email, analysisId);

    // Send emails (fire and forget)
    sendLeadConfirmation(email, analysis.url, analysisId).catch(console.error);
    sendAdminLeadNotification(email, analysis.url, analysisId, variant).catch(console.error);

    return NextResponse.json({ success: true, id: lead.id });
  } catch (e) {
    console.error("[api/leads]", e);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
