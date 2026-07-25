import type { MetadataRoute } from 'next'

const SITE_URL = 'https://webtechhq.com'

// These are public utility and auth-flow pages with no indexable content
// of their own (forms, redirects, admin surfaces) — they're noindexed for
// content-quality reasons, not because they're session-gated. This is a
// deliberately different list from src/proxy.ts's matcher: proxy.ts
// governs which routes require a signed-in session (/business-audit,
// /admin, /tools, /signin), which is unrelated to whether a page has
// crawlable content. Notably, /signup is NOT in this list even though
// it's a public page with no content of its own to index: it's still the
// generic, tool-agnostic default entry point (Hero CTA, proxy.ts auth-gate
// redirects), and AI crawlers need to be able to fetch it. Its page-level
// `robots: {index:false, follow:false}` metadata handles the "don't index
// this in search results" signal without blocking fetch.
// /prompt-pilot and /opportunity-finder are also deliberately absent from
// this list, but for a different reason than /signup: each is a real
// tool-specific landing page with its own copy (not a bare form), used as
// the "Prompt Pilot"/"Opportunity Finder" destination in llms.txt, so
// unlike /signup they're meant to be indexed too - their page metadata has
// no robots override, letting them fall through to the default `allow: '/'`
// below.
const DISALLOWED_PATHS = [
  '/admin',
  '/api',
  '/signin',
  '/forgot-password',
  '/reset-password',
  '/verify',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      // Explicitly welcome the major AI answer-engine crawlers. Several of
      // these already respect a generic "*" allow, but naming them keeps
      // intent legible and survives a future tightening of the "*" rule.
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
