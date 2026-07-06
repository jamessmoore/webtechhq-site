import sgMail from "@sendgrid/mail";

function getSendGrid() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error("SENDGRID_API_KEY is not set");
  sgMail.setApiKey(key);
  return sgMail;
}

const FROM = process.env.SENDGRID_FROM_EMAIL ?? "noreply@webtechhq.com";
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
    from: { email: FROM, name: "Moore Solutions" },
    trackingSettings: { clickTracking: { enable: false } },
    subject: "Verify your Moore Solutions account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F0F0F">
        <h2 style="margin-bottom:8px">Hi ${firstName},</h2>
        <p style="margin-bottom:20px">
          Click below to verify your email and jump straight into your Opportunity Finder
          questionnaire. This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 28px;background:#1A4FC4;color:#fff;
                  text-decoration:none;border-radius:4px;font-weight:bold">
          Verify my email
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6B6660">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="font-size:13px;color:#6B6660">James Moore, Moore Solutions</p>
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
    from: { email: FROM, name: "Moore Solutions" },
    trackingSettings: { clickTracking: { enable: false } },
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
          If you didn't request this, you can safely ignore this email. Your password
          won't be changed.
        </p>
        <p style="font-size:13px;color:#6B6660">James Moore, Moore Solutions</p>
      </div>
    `,
  });
}

export async function sendPromptEmail(
  to: string,
  firstName: string,
  prompt: string,
): Promise<void> {
  const toolUrl = `${BASE_URL}/tools/opportunity-finder`;
  const finishSignupUrl = `${BASE_URL}/tools/finish-signup`;
  const sg = getSendGrid();

  await sg.send({
    to,
    from: { email: FROM, name: "Moore Solutions" },
    trackingSettings: { clickTracking: { enable: false } },
    subject: "Your Opportunity Finder prompt is ready",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0F0F0F">
        <h2 style="margin-bottom:8px">Hi ${firstName},</h2>
        <p style="margin-bottom:16px">
          Based on what you shared, we've built a prompt specifically for your business.
          Copy it below and paste it into the AI chat tool of your choice (ChatGPT, Claude,
          Gemini, or whatever you already use) to start exploring where AI could help.
        </p>
        <pre style="white-space:pre-wrap;font-family:'Courier New',monospace;font-size:13px;
                    background:#F4F6FA;border:1px solid #D8DEE9;border-radius:4px;
                    padding:16px;margin-bottom:20px">${escapeHtml(prompt)}</pre>
        <a href="${toolUrl}"
           style="display:inline-block;padding:12px 28px;background:#1A4FC4;color:#fff;
                  text-decoration:none;border-radius:4px;font-weight:bold">
          View my prompt
        </a>
        <hr style="margin:28px 0;border:none;border-top:1px solid #E5E5E5" />
        <p style="margin-bottom:12px;font-weight:bold">Want the full picture?</p>
        <p style="margin-bottom:16px">
          The Opportunity Finder is just a starting point. The full Business Audit takes your
          answers further: a ranked breakdown of your best opportunities, what each one is
          worth, and a concrete plan to act on it.
        </p>
        <p style="margin-bottom:20px">
          To move forward with the Business Audit, you'll need to finish creating your account
          by setting a password. Until you do, this result isn't saved anywhere. If you come
          back later without finishing account creation, you'll need to answer the
          questionnaire again from scratch.
        </p>
        <a href="${finishSignupUrl}"
           style="display:inline-block;padding:12px 28px;background:#238636;color:#fff;
                  text-decoration:none;border-radius:4px;font-weight:bold">
          Finish creating my account
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6B6660">James Moore, Moore Solutions</p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactFormEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { name, email, subject, message } = params;
  const sg = getSendGrid();

  await sg.send({
    to: process.env.CONTACT_EMAIL ?? FROM,
    from: { email: FROM, name: "Moore Solutions" },
    replyTo: email,
    trackingSettings: { clickTracking: { enable: false } },
    subject,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0F0F0F">
        <p style="margin-bottom:16px">
          <strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;
        </p>
        <p style="white-space:pre-wrap;margin-bottom:16px">${escapeHtml(message)}</p>
      </div>
    `,
  });
}

export async function sendAuditReportEmail(
  to: string,
  firstName: string,
  businessName: string,
  pdfBuffer: Buffer,
): Promise<void> {
  const sg = getSendGrid();

  await sg.send({
    to,
    from: { email: FROM, name: "Moore Solutions" },
    trackingSettings: { clickTracking: { enable: false } },
    subject: `Your Business Audit for ${businessName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F0F0F">
        <h2 style="margin-bottom:8px">Hi ${firstName},</h2>
        <p style="margin-bottom:20px">
          Attached is your Business Audit for ${businessName}, built from your Opportunity Finder
          answers. You can also view it anytime from your Client Tools dashboard.
        </p>
        <p style="margin-top:24px;font-size:13px;color:#6B6660">James Moore, Moore Solutions</p>
      </div>
    `,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `Business Audit - ${businessName}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  });
}

export async function sendGoogleAccountNoticeEmail(
  to: string,
  firstName: string,
): Promise<void> {
  const sg = getSendGrid();

  await sg.send({
    to,
    from: { email: FROM, name: "Moore Solutions" },
    trackingSettings: { clickTracking: { enable: false } },
    subject: "Password reset request | Moore Solutions",
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
        <p style="font-size:13px;color:#6B6660">James Moore, Moore Solutions</p>
      </div>
    `,
  });
}
