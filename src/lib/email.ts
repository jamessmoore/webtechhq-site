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

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  token: string,
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password/${token}`;
  const sg = getSendGrid();

  await sg.send({
    to,
    from: FROM,
    subject: "Reset your Moore Solutions password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F0F0F">
        <h2 style="margin-bottom:8px">Hi ${firstName},</h2>
        <p style="margin-bottom:20px">
          We received a request to reset your password. Click below to choose a new
          one. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 28px;background:#1A4FC4;color:#fff;
                  text-decoration:none;border-radius:4px;font-weight:bold">
          Reset my password
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6B6660">
          If you didn't request this, you can safely ignore this email — your password
          won't be changed.
        </p>
        <p style="font-size:13px;color:#6B6660">— James Moore, Moore Solutions</p>
      </div>
    `,
  });
}

export async function sendGoogleAccountNoticeEmail(
  to: string,
  firstName: string,
): Promise<void> {
  const sg = getSendGrid();

  await sg.send({
    to,
    from: FROM,
    subject: "Password reset request — Moore Solutions",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F0F0F">
        <h2 style="margin-bottom:8px">Hi ${firstName},</h2>
        <p style="margin-bottom:20px">
          Someone requested a password reset for this email address, but this account
          signs in with Google and doesn't have a password set. Use the
          "Continue with Google" button on the sign-in page instead.
        </p>
        <p style="margin-top:24px;font-size:13px;color:#6B6660">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="font-size:13px;color:#6B6660">— James Moore, Moore Solutions</p>
      </div>
    `,
  });
}
