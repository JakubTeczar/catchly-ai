import { NextResponse } from "next/server";
import { sendAdminLeadNotification, sendLeadConfirmation } from "@/lib/email";

export async function GET() {
  const admin = process.env.SMTP_ADMIN_EMAIL;
  if (!admin) {
    return NextResponse.json({ error: "Brak SMTP_ADMIN_EMAIL w env" }, { status: 500 });
  }

  try {
    await sendLeadConfirmation(admin, "https://example.com");
    await sendAdminLeadNotification(admin, "https://example.com", "test-id-123", "A");
    return NextResponse.json({ ok: true, sentTo: admin });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
