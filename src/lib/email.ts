import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.catchly.pl",
  port: 465,
  secure: true,
  auth: {
    user: "kontakt@catchly.pl",
    pass: "ND2ubrWDqBFqDdyNXMkW",
  },
});

const FROM = `"Catchly" <kontakt@catchly.pl>`;

export async function sendLeadConfirmation(to: string, websiteUrl: string, analysisId: string) {
  const baseUrl = "https://kreator.catchly.pl";
  const analysisUrl = `${baseUrl}/analiza/${analysisId}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Twój audyt Catchly jest gotowy",
    html: `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%">

          <tr>
            <td style="background:#080808;padding:28px 40px">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">Catchly</span>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 28px">
              <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">Audyt gotowy</p>
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#111;line-height:1.3">Twoja analiza strony jest gotowa</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.6">Przeanalizowaliśmy stronę <strong style="color:#111">${websiteUrl}</strong> i przygotowaliśmy konkretne propozycje poprawek konwersji.</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#BBEA00;border-radius:8px">
                    <a href="${analysisUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:300;color:#111;text-decoration:none">Zobacz swój audyt →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#999">Nie działa przycisk? Skopiuj link:<br><a href="${analysisUrl}" style="color:#666;word-break:break-all">${analysisUrl}</a></p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;border-top:1px solid #eee">
              <p style="margin:0;font-size:12px;color:#aaa">Masz pytania? Odpowiedz na tego maila — odpisujemy w ciągu 24h.</p>
              <p style="margin:8px 0 0;font-size:12px;color:#ccc">Catchly · kreator.catchly.pl</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendAdminLeadNotification(email: string, websiteUrl: string, analysisId: string, variant?: string | null) {
  const admin = "kontakt@catchly.pl";
  const baseUrl = "https://kreator.catchly.pl";
  const analysisUrl = `${baseUrl}/analiza/${analysisId}`;

  await transporter.sendMail({
    from: FROM,
    to: admin,
    subject: `[Catchly] Nowy lead: ${email}`,
    html: `<!DOCTYPE html>
<html lang="pl">
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f5f5f5;padding:32px">
  <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:28px;max-width:500px">
    <tr><td><h2 style="margin:0 0 20px;color:#111">Nowy lead</h2></td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#444"><b style="color:#111">Email:</b> ${email}</td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#444"><b style="color:#111">Strona:</b> ${websiteUrl}</td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#444"><b style="color:#111">Wariant:</b> ${variant ?? "—"}</td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#444"><b style="color:#111">Czas:</b> ${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</td></tr>
    <tr><td style="padding:16px 0 0">
      <a href="${analysisUrl}" style="background:#BBEA00;color:#111;font-weight:700;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">Zobacz audyt →</a>
    </td></tr>
  </table>
</body>
</html>`,
  });
}