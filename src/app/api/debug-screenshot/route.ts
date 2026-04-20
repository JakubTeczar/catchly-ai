import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";

const SCRAPE_API_KEY = process.env.SCRAPE_DO_API_KEY;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") ?? "https://example.com";
  const debug: Record<string, unknown> = {};

  // 1. Env vars
  debug.env = {
    SCRAPE_DO_API_KEY: SCRAPE_API_KEY ? `SET (${SCRAPE_API_KEY.slice(0, 6)}...)` : "MISSING",
    cwd: process.cwd(),
  };

  // 2. Sprawdź czy można pisać do public/screenshots
  const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
  try {
    await mkdir(screenshotsDir, { recursive: true });
    const testFile = path.join(screenshotsDir, "_test.txt");
    await writeFile(testFile, "ok");
    debug.filesystem = { screenshotsDir, writable: true };
  } catch (e: any) {
    debug.filesystem = { screenshotsDir, writable: false, error: e.message };
  }

  if (!SCRAPE_API_KEY) {
    return NextResponse.json({ ...debug, error: "Brak SCRAPE_DO_API_KEY" }, { status: 500 });
  }

  // 3. Wywołaj scrape.do
  const params = new URLSearchParams({
    token: SCRAPE_API_KEY,
    url,
    super: "true",
    render: "true",
    waitUntil: "networkidle2",
    customWait: "2000",
    width: "1920",
    height: "1080",
    returnJSON: "true",
    screenShot: "true",
  });

  const apiUrl = `http://api.scrape.do/?${params.toString()}`;
  debug.scrapeDoUrl = apiUrl.replace(SCRAPE_API_KEY, "***");

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
    debug.scrapeDoStatus = res.status;
    debug.scrapeDoStatusText = res.statusText;
    debug.contentType = res.headers.get("content-type");

    if (!res.ok) {
      const text = await res.text();
      debug.scrapeDoError = text.slice(0, 500);
      return NextResponse.json(debug, { status: 500 });
    }

    const json = await res.json();
    debug.scrapeDoKeys = Object.keys(json);
    debug.screenShotsField = json.screenShots;
    debug.screenShotsLength = json.screenShots?.[0]?.image?.length ?? 0;
    debug.screenShotsError = json.screenShots?.[0]?.error ?? null;

    const b64 = json.screenShots?.[0]?.image || json.screenShot || json.screenshot || json.data;
    if (!b64) {
      debug.result = "BRAK b64 - screenshot nie zwrócony";
      return NextResponse.json(debug, { status: 500 });
    }

    // Zapisz testowy screenshot
    const testPath = path.join(screenshotsDir, "_debug.jpg");
    await writeFile(testPath, Buffer.from(b64, "base64"));
    debug.savedTo = testPath;
    debug.result = "OK - screenshot zapisany";

    return NextResponse.json(debug);
  } catch (e: any) {
    debug.fetchError = e.message;
    return NextResponse.json(debug, { status: 500 });
  }
}
