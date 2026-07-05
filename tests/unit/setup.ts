// Unit tests must be deterministic regardless of what secrets happen to be
// exported in the developer's shell — never rely on a real .env.local.
delete process.env.RECAPTCHA_SECRET_KEY;
delete process.env.SENDGRID_API_KEY;
delete process.env.PAYPAL_CLIENT_ID;
delete process.env.PAYPAL_CLIENT_SECRET;
delete process.env.PAYPAL_WEBHOOK_ID;
