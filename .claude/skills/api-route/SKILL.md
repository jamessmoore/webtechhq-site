---
name: api-route
description: Scaffold a new Next.js App Router API route handler under src/app/api, following this repo's auth/admin/reCAPTCHA/error-response conventions. Use when adding a new endpoint to webtechhq-site.
---

# API Route

Scaffolds a new route handler consistent with the existing ones in `src/app/api/**/route.ts` (see `questionnaire/submit/route.ts` and `admin/submissions/[id]/route.ts` as reference implementations).

## File placement

- Static resource: `src/app/api/<resource>/route.ts`
- Dynamic segment: `src/app/api/<resource>/[id]/route.ts` — in Next 16, `params` is a `Promise`, so handlers take `{ params }: { params: Promise<{ id: string }> }` and must `await params` before use.

## Standard shape

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // ...body parsing, validation, and the actual work...

  return NextResponse.json({ success: true });
}
```

## Conventions to match

- **Auth check:** `const session = await auth();` then gate on `session?.user?.id` (401 if missing). Pull the full user record via `getUserById` from `@/lib/users` only if you need fields beyond the session (e.g. `emailVerified`).
- **Admin gating:** if the endpoint is admin-only, use the same local pattern as `admin/submissions/[id]/route.ts`:
  ```ts
  function isAdmin(email: string | null | undefined): boolean {
    return !!email && email === process.env.ADMIN_EMAIL;
  }
  ```
  Return 403 (`{ error: "Forbidden." }`) if it fails. If a second admin route is being added, consider (ask the user first) whether to extract this into a shared helper rather than duplicating it a third time.
- **reCAPTCHA:** only for endpoints that accept a public-facing form submission. Gate on `process.env.RECAPTCHA_SECRET_KEY` being set, POST to `https://www.google.com/recaptcha/api/siteverify` with `secret` + the token from the body, and 400 on `!success`. Copy the exact block from `questionnaire/submit/route.ts` rather than reinventing it.
- **Body parsing:** `const body = (await request.json()) as { ... };` with an explicit inline type for the expected shape — no runtime schema library is used in this repo.
- **Validation:** manual per-field checks (e.g. `if (!body.field?.trim())`), each returning a specific 400 message rather than a generic "invalid input."
- **Success/error response shape:** always `NextResponse.json({ success: true, ... })` or `NextResponse.json({ error: "..." }, { status: N })` — don't introduce a different envelope.
- **DB mutation errors:** wrap the mutating call in `try/catch` and specifically check `err.message.includes("UNIQUE constraint failed")` when the operation has a uniqueness constraint (see the questionnaire submit race-condition handling), returning 409. Re-throw anything else.

## After creating the route

- Wire up the corresponding `fetch()` call from the client component/form that will call it.
- If it's part of a page-level user flow (not just an admin action), consider whether `tests/e2e/` needs a new spec or an addition to an existing one.
