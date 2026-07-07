/**
 * Accounts that can never be deleted from the admin panel. The list itself
 * is private data (real account emails) and lives only in PROTECTED_ACCOUNT_EMAILS
 * (comma-separated) in the environment - never hardcoded here, so it stays
 * out of the public repo. Unset means no accounts are protected.
 */
export function isProtectedAccount(email: string | null | undefined): boolean {
  if (!email) return false;

  const protectedEmails = (process.env.PROTECTED_ACCOUNT_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return protectedEmails.includes(email.toLowerCase());
}
