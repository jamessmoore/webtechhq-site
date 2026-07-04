---
name: test-contact-form
description: Autofill the public /contact page form (name, email, subject, message) with test data using the browser tool, then stop at reCAPTCHA for the user to solve and send. Use when asked to test the contact form, or verify a copy/UI change on the contact page.
---

# Test Contact Form

Fills out the `/contact` page form with placeholder data so the user only has to solve the reCAPTCHA and click send. Submitting sends a real email via SendGrid (`SENDGRID_API_KEY`/`SENDGRID_FROM_EMAIL` in `.env.local`) to `CONTACT_EMAIL`, with the submitter's address set as reply-to, so this skill never submits on its own — that's always the user's action.

## Step 1 — Load browser tools and navigate

Load the deferred Chrome tools if not already loaded (one batched `ToolSearch` call):
```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__form_input
```

Get tab context, then navigate to `http://localhost:3000/contact` (start the dev server first if it isn't already running).

## Step 2 — Fill the form

`read_page` with `filter: "interactive"` to get fresh element refs — the form is `src/components/ContactForm.tsx` and currently has four fields, in this order: `NAME` (text), `EMAIL` (email), `SUBJECT` (text), `MESSAGE` (textarea). There is no longer an "interested in" dropdown — if one shows up in `read_page`, the form has changed and this skill's field list is stale.

Use `form_input` on each field ref with placeholder test values, e.g.:
- name: `Test User`
- email: `webtechhq.test@yahoo.com` (do **not** use `test@example.com` or any `@example.com` address — it's a reserved, documentation-only domain (RFC 2606), and since it becomes the email's Reply-To header, Gmail flags it as spam. A normal domain with a made-up mailbox is fine and doesn't trigger that.)
- subject: `Test subject line`
- message: a short sentence describing what's being verified

## Step 3 — Stop before the reCAPTCHA

Do not click the "I'm not a robot" checkbox and do not click `SEND MESSAGE ›` — completing CAPTCHAs is off-limits, and sending is a real, user-visible action (an actual email lands in the inbox behind `CONTACT_EMAIL`). Tell the user the form is filled in and ready for them to solve the CAPTCHA and send.

## Notes

- To preview the post-submit success state (large "Message sent." confirmation, form hidden) without actually sending, temporarily set `initialState` in `ContactForm.tsx` to `{ status: 'success', message: "..." }`, screenshot, then revert — see the component for the exact shape of `ContactFormState`.
