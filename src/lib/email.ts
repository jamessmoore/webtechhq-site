import sgMail from "@sendgrid/mail";

function getSendGrid() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error("SENDGRID_API_KEY is not set");
  sgMail.setApiKey(key);
  return sgMail;
}

const FROM = process.env.SENDGRID_FROM_EMAIL ?? "james@webtechhq.com";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  token: string,
): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/verify/${token}`;
  const sg = getSendGrid();

  await sg.send({
    to,
    from: FROM,
    subject: "Verify your Moore Solutions account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F0F0F">
        <h2 style="margin-bottom:8px">Hi ${firstName},</h2>
        <p style="margin-bottom:20px">
          Click below to verify your email and access your AI Opportunity questionnaire.
          This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 28px;background:#1A4FC4;color:#fff;
                  text-decoration:none;border-radius:4px;font-weight:bold">
          Verify my email
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6B6660">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="font-size:13px;color:#6B6660">— James Moore, Moore Solutions</p>
      </div>
    `,
  });
}
