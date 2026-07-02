---
name: nav-link
description: Add, remove, or reorder a link in the site's primary navigation, keeping the top nav and footer nav in sync. Use when the user asks to change what's in "the nav", "the navbar", "the footer nav", or asks for the same nav change to apply site-wide.
---

# Nav Link

The site has two independent nav link arrays that are expected to stay in sync: `navLinks` in `src/components/Navbar.tsx` and `footerLinks` in `src/components/Footer.tsx`. There is no shared source of truth between them, so every add/remove/reorder request implicitly means "in both places" unless the user explicitly scopes it to just one.

## Where the arrays live

```tsx
// src/components/Navbar.tsx
const navLinks = [
  { href: '/tools',     label: 'TOOLS' },
  { href: '/use-cases', label: 'USE CASES' },
  { href: '/services',  label: 'SERVICES' },
  { href: '/about',     label: 'ABOUT' },
]
```

```tsx
// src/components/Footer.tsx
const footerLinks = [
  { href: '/tools',     label: 'TOOLS' },
  { href: '/use-cases', label: 'USE CASES' },
  { href: '/services',  label: 'SERVICES' },
  { href: '/about',     label: 'ABOUT' },
  { href: '/contact',   label: 'CONTACT' },
]
```

Note `footerLinks` has one extra entry (`CONTACT`) that `navLinks` doesn't — the footer is not required to be a strict superset/mirror, just consistent on the entries both actually share. Don't force `CONTACT` into the top nav or remove it from the footer unless asked.

## Steps

1. **Edit both arrays identically** for the requested change (add/remove/reorder), preserving each array's alignment/formatting style (the existing entries are column-aligned with padded spaces; match it).
2. **Desktop and mobile are already covered by one edit.** Both `Navbar.tsx`'s desktop row and its mobile dropdown panel map over the same `navLinks` array — there's no separate mobile list to update. Same for the footer (single `footerLinks` array, no responsive variant).
3. **Verify visually.** Navigate to `/` in the browser tool and screenshot/zoom the top nav; scroll to the bottom and do the same for the footer. Confirm order and labels in both places match.
4. **Don't delete the target page** when removing a nav entry unless explicitly asked — "remove from nav" means unlink, not delete. (Precedent: Portfolio was removed from both navs while `/portfolio` itself was left fully intact for linking another way.)

## Notes

- Labels are uppercase by convention (`TOOLS`, not `Tools`) — match existing casing.
- If a requested link points somewhere behind auth (e.g. `/tools`), that's fine as-is; unauthenticated visitors get redirected to `/signup` by the page itself, no special-casing needed in the nav component.
