import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAnalysisPipeline } from "@/lib/pipeline";

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return new URL(url).origin + new URL(url).pathname.replace(/\/$/, "") || url;
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isMock = searchParams.get("mock") === "true";

    const body = await req.json();
    const rawUrl = body.url as string;

    if (!rawUrl || rawUrl.length < 4) {
      return NextResponse.json({ error: "Podaj prawidłowy URL" }, { status: 400 });
    }

    if (isMock) {
      return NextResponse.json({ id: "mock" });
    }

    let url: string;
    try {
      url = normalizeUrl(rawUrl);
    } catch {
      return NextResponse.json({ error: "Nieprawidłowy adres URL" }, { status: 400 });
    }

    const analysis = await prisma.analysis.create({
      data: { url, status: "RUNNING" },
    });

    // Fire and forget - do not await
    runAnalysisPipeline(analysis.id, url).catch(console.error);

    return NextResponse.json({ id: analysis.id });
  } catch (e) {
    console.error("[api/analyze]", e);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
