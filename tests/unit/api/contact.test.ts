import { beforeEach, describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/email", () => ({ sendContactFormEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/recaptcha", () => ({ verifyRecaptcha: vi.fn() }));

let sendContactMessage: typeof import("@/app/contact/actions").sendContactMessage;
let auth: { auth: ReturnType<typeof vi.fn> };
let email: { sendContactFormEmail: ReturnType<typeof vi.fn> };
let recaptcha: { verifyRecaptcha: ReturnType<typeof vi.fn> };

beforeEach(async () => {
  vi.resetModules();
  ({ sendContactMessage } = await import("@/app/contact/actions"));
  auth = (await import("@/auth")) as unknown as typeof auth;
  email = (await import("@/lib/email")) as unknown as typeof email;
  recaptcha = (await import("@/lib/recaptcha")) as unknown as typeof recaptcha;

  auth.auth.mockReset().mockResolvedValue(null);
  email.sendContactFormEmail.mockReset().mockResolvedValue(undefined);
  recaptcha.verifyRecaptcha.mockReset();
});

const validFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Question about the audit",
  message: "How does the founding rate work?",
};

function formData(overrides: Partial<typeof validFields & { recaptchaToken: string }> = {}) {
  const fd = new FormData();
  const merged = { ...validFields, recaptchaToken: "a-token", ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    fd.set(key, value);
  }
  return fd;
}

describe("sendContactMessage (server action, /contact)", () => {
  it("rejects a submission when reCAPTCHA verification fails, before sending any email", async () => {
    recaptcha.verifyRecaptcha.mockResolvedValue(false);

    const result = await sendContactMessage({ status: "idle" }, formData());

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/CAPTCHA/i);
    expect(email.sendContactFormEmail).not.toHaveBeenCalled();
  });

  it("passes the submitted recaptchaToken through to server-side verification", async () => {
    recaptcha.verifyRecaptcha.mockResolvedValue(true);

    await sendContactMessage({ status: "idle" }, formData({ recaptchaToken: "solved-token" }));

    expect(recaptcha.verifyRecaptcha).toHaveBeenCalledWith("solved-token");
  });

  it("sends the contact email once reCAPTCHA verification succeeds", async () => {
    recaptcha.verifyRecaptcha.mockResolvedValue(true);

    const result = await sendContactMessage({ status: "idle" }, formData());

    expect(result.status).toBe("success");
    expect(email.sendContactFormEmail).toHaveBeenCalledWith({
      name: validFields.name,
      email: validFields.email,
      subject: validFields.subject,
      message: validFields.message,
      isRegisteredUser: false,
    });
  });

  it("rejects a submission missing required fields without calling reCAPTCHA verification", async () => {
    const result = await sendContactMessage({ status: "idle" }, formData({ message: "" }));

    expect(result.status).toBe("error");
    expect(recaptcha.verifyRecaptcha).not.toHaveBeenCalled();
    expect(email.sendContactFormEmail).not.toHaveBeenCalled();
  });

  it("degrades to a generic error (not a thrown exception) if reCAPTCHA verification itself fails, e.g. a network error", async () => {
    recaptcha.verifyRecaptcha.mockRejectedValue(new Error("fetch failed: connection closed"));

    const result = await sendContactMessage({ status: "idle" }, formData());

    expect(result.status).toBe("error");
    expect(email.sendContactFormEmail).not.toHaveBeenCalled();
  });

  it("flags isRegisteredUser when the submitter has a signed-in session", async () => {
    recaptcha.verifyRecaptcha.mockResolvedValue(true);
    auth.auth.mockResolvedValue({ user: { id: "user-1" } });

    await sendContactMessage({ status: "idle" }, formData());

    expect(email.sendContactFormEmail).toHaveBeenCalledWith(
      expect.objectContaining({ isRegisteredUser: true }),
    );
  });
});
