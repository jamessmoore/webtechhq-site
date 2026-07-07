#!/usr/bin/env node
// Gate: publicly-presentable files (.env.example, CLAUDE.md, README.md,
// .claude/skills/**) must never contain a real, resolvable email address -
// especially ones that designate a privileged account (admin, test-bypass,
// protected-account lists, etc). Real values belong only in .env.local
// (gitignored) or the production host's env, never in committed docs or
// example config. Run via `npm run lint`.
//
// Scoped to documentation/example files rather than all of src/, since
// src/ has legitimate real addresses that must stay real: the /privacy and
// /terms pages intentionally display real contact emails to site visitors,
// and src/lib/email.ts's SendGrid "from" fallback needs a real sending
// domain to function if the env var is unset.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SAFE_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.local",
  "localhost",
]);

// Specific, intentional exceptions: not real accounts, documented inline
// where they're used. Add here only with a one-line reason - this is not a
// general-purpose suppression mechanism.
const ALLOWLIST_LITERALS = new Set([
  // Deliberately not @example.com: Gmail flags that reserved domain as spam
  // via the Reply-To header. See .claude/skills/test-contact-form/SKILL.md.
  "webtechhq.test@yahoo.com",
]);

const TARGET_FILES = [".env.example", "CLAUDE.md", "README.md"];
const TARGET_DIRS = [".claude"];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      out.push(full);
    }
  }
}

function collectTargets() {
  const files = TARGET_FILES.map((f) => path.join(ROOT, f)).filter((f) =>
    fs.existsSync(f),
  );
  for (const dir of TARGET_DIRS) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full)) walk(full, files);
  }
  return files;
}

function main() {
  const violations = [];

  for (const file of collectTargets()) {
    const rel = path.relative(ROOT, file);
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const matches = line.match(EMAIL_RE) ?? [];
      for (const email of matches) {
        if (ALLOWLIST_LITERALS.has(email)) continue;
        const domain = email.split("@")[1]?.toLowerCase();
        if (!SAFE_DOMAINS.has(domain)) {
          violations.push({ file: rel, line: i + 1, email });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error(
      "Real-looking email address(es) found in publicly-presentable files:\n",
    );
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}  ${v.email}`);
    }
    console.error(
      "\nUse a placeholder on an example domain (example.com/.org/.net) instead," +
        "\nor test.local for local-only test accounts. Real values belong in" +
        "\n.env.local (gitignored) or the production host's env only - never in" +
        "\na committed file.",
    );
    process.exit(1);
  }

  console.log("check-example-emails: no real email addresses in public files.");
}

main();
