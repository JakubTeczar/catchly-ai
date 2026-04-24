import { NextRequest, NextResponse } from "next/server";
import { sendAdminLeadNotification, sendLeadConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log("[test-email]", msg);
    logs.push(`${new Date().toISOString()} ${msg}`);
  };

  log(`NODE_ENV=${process.env.NODE_ENV}`);
  log(`SMTP host=smtp.catchly.pl port=587`);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy JSON", logs }, { status: 400 });
  }

  const { type, to, websiteUrl, analysisId, variant } = body;
  log(`type=${type} to=${to} websiteUrl=${websiteUrl} analysisId=${analysisId}`);

  if (!to || !websiteUrl || !analysisId) {
    return NextResponse.json({ ok: false, error: "Brak wymaganych pól: to, websiteUrl, analysisId", logs }, { status: 400 });
  }

  try {
    log("Łączenie z SMTP...");
    if (type === "lead") {
      log("Wysyłanie sendLeadConfirmation...");
      await sendLeadConfirmation(to, websiteUrl, analysisId);
      log("sendLeadConfirmation OK");
    } else if (type === "admin") {
      log("Wysyłanie sendAdminLeadNotification...");
      await sendAdminLeadNotification(to, websiteUrl, analysisId, variant || null);
      log("sendAdminLeadNotification OK");
    } else {
      return NextResponse.json({ ok: false, error: `Nieznany typ: '${type}'`, logs }, { status: 400 });
    }
    log("Gotowe — mail wysłany");
    return NextResponse.json({ ok: true, logs });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    log(`BŁĄD: ${msg}`);
    if (stack) log(`Stack: ${stack}`);
    return NextResponse.json({ ok: false, error: msg, stack, logs }, { status: 500 });
  }
}
