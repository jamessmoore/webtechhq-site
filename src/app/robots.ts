import type { MetadataRoute } from 'next'

const SITE_URL = 'https://webtechhq.com'

// These are public utility and auth-flow pages with no indexable content
// of their own (forms, redirects, admin surfaces) — they're noindexed for
// content-quality reasons, not because they're session-gated. This is a
// deliberately different list from src/proxy.ts's matcher: proxy.ts
// governs which routes require a signed-in session (/business-audit,
// /admin, /tools, /signin), which is unrelated to whether a page has
// crawlable content. /signup is NOT in this list even though it's no
// longer a real page (it's a permanent redirect to /tools/opportunity-finder,
// see next.config.js): AI crawlers still need to be able to fetch and
// follow that redirect rather than being blocked from it outright.
// /tools/opportunity-finder and /tools/prompt-pilot are also deliberately
// unaffected by this DISALLOWED_PATHS list (note it has no bare '/tools'
// entry at all): both are usable anonymously and are now each tool's own
// landing page, used as the "Prompt Pilot"/"Opportunity Finder" destination
// in llms.txt, and each overrides the /tools layout's default noindex with
// its own `robots: { index: true, follow: true }` page metadata. Every
// other /tools/* route stays noindexed via that layout default.
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
