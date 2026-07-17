/**
 * Standard local@domain.tld format check (loosely based on the character
 * classes used by the HTML5 <input type="email"> spec, tightened further -
 * see below). Not RFC 5322-exhaustive.
 *
 * The domain half is restricted to DNS-label characters (letters, digits,
 * hyphens, dots) only - no "@", "?", "=", "&", whitespace, or control
 * characters.
 *
 * The local half deliberately excludes `?`, `&`, `=`, and `#`, even though
 * RFC 5322 technically permits them there. Those four characters are
 * mailto: URI syntax (RFC 6068 splits a `mailto:` href on the first
 * unescaped `?`, then parses `&`-separated `key=value` header pairs), so an
 * address like `victim?cc=someone-else@x.com` or
 * `victim?subject=Hi&body=whatever@x.com` is syntactically a valid RFC 5322
 * local part but, once rendered as `mailto:${email}`, gets parsed by the
 * browser as "to: victim" plus attacker-controlled cc/subject/body headers.
 * Rejecting these four characters rules out that whole injection class
 * before storage, at the cost of rejecting a vanishingly rare handful of
 * technically-valid addresses that use them.
 */
export const EMAIL_FORMAT_REGEX =
  /^[a-zA-Z0-9.!$%'*+/^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_FORMAT_REGEX.test(email);
}
