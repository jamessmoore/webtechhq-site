import { getDb } from "./db";

/**
 * The "gold standard" test account is the one account allowed to bypass
 * payment gates and reset its own tool output in production, so the full
 * signup -> tool -> paid-tool funnel can be exercised repeatedly without
 * creating throwaway accounts or paying real money. The email is private
 * data set via TEST_ACCOUNT_EMAIL only - no default, so it's never
 * hardcoded in committed code. Unset means the bypass matches no one.
 */
export function isGoldStandardTestAccount(email: string | null | undefined): boolean {
  const testEmail = process.env.TEST_ACCOUNT_EMAIL;
  return !!email && !!testEmail && email.toLowerCase() === testEmail.toLowerCase();
}

/**
 * Wipes every tool's stored output for one user so the gold-standard test
 * account can restart the full funnel from scratch. Callers must check
 * isGoldStandardTestAccount() before invoking this - it is not itself
 * restricted to that account.
 *
 * Purchases are deliberately left alone: reset clears generated output, not
 * access. Wiping purchases would force the account back through the
 * complimentary-purchase grant on every reset and can desync a tool's
 * "purchased" status from its (now missing) output.
 *
 * STANDARD FOR FUTURE TOOLS: every new tool that persists its own per-user
 * result table must add a `DELETE FROM <table> WHERE user_id = ?` line here.
 */
export function resetAllToolDataForUser(userId: string): void {
  const db = getDb();
  const reset = db.transaction((id: string) => {
    db.prepare("DELETE FROM submissions WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM audit_reports WHERE user_id = ?").run(id);
  });
  reset(userId);
}
