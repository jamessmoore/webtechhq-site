import type { MetadataRoute } from 'next'

const SITE_URL = 'https://webtechhq.com'

// Auth/account flows and admin/API surfaces have no public content to
// index and are gated behind a session anyway (see src/proxy.ts). Keep
// this list in sync with that matcher when new gated routes are added.
const DISALLOWED_PATHS = [
  '/admin',
  '/api',
  '/signin',
  '/signup',
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
