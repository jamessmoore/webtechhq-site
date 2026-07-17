import { describe, it, expect } from "vitest";
import { isValidEmailFormat } from "@/lib/emailFormat";

describe("isValidEmailFormat", () => {
  it("accepts a plain, ordinary address", () => {
    expect(isValidEmailFormat("ada@example.com")).toBe(true);
  });

  it("rejects a string with no @ at all", () => {
    expect(isValidEmailFormat("not-an-email")).toBe(false);
  });

  it("rejects the original two-@ mailto injection PoC", () => {
    expect(isValidEmailFormat("real@x.com?bcc=attacker@evil.com")).toBe(false);
  });

  // Argus's follow-up repro cases: single-@ addresses whose *local part*
  // (RFC 5322-legal, but mailto-URI-meaningful) contains `?`/`&`/`=`, which
  // the original regex's local-part character class let through. A browser's
  // mailto: parser splits on the first unescaped `?`, so either of these,
  // once stored and rendered as `mailto:${email}`, hijacks the admin's mail
  // client with attacker-controlled headers.
  it("rejects a single-@ address whose local part carries mailto query params (subject/body)", () => {
    expect(isValidEmailFormat("victim?subject=Hi&body=whatever@x.com")).toBe(false);
  });

  it("rejects a single-@ address whose local part carries a mailto cc param", () => {
    expect(isValidEmailFormat("victim?cc=someone-else-entirely@x.com")).toBe(false);
  });

  it("still accepts local parts using the RFC 5322 special characters that aren't mailto-syntax-meaningful", () => {
    expect(isValidEmailFormat("first.last+tag'name@example.com")).toBe(true);
  });
});
