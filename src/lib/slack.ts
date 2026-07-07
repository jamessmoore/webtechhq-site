const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// No-ops when unset (local dev/CI without the webhook configured) rather
// than throwing, since a missing Slack ping should never break the request
// that triggered it.
export async function sendSlackNotification(text: string): Promise<void> {
  if (!WEBHOOK_URL) return;

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook responded with ${res.status}`);
  }
}
