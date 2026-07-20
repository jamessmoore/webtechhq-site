// JSON-LD structured data builders. Facts here must stay traceable to
// copy already on the site (Hero.tsx, ProofBar.tsx, about/page.tsx,
// Footer.tsx) — don't invent client names, numbers, or profile URLs.

export const SITE_URL = 'https://webtechhq.com'

// Mirrors the social links rendered in src/components/Footer.tsx. Keep
// these two lists in sync if a profile is added, removed, or renamed.
export const SOCIAL_LINKS = [
  'https://www.youtube.com/@realjamesmoore',
  'https://instagram.com/real.james.moore',
  'https://x.com/webtechhq',
  'https://linkedin.com/in/thejamesmoore',
  'https://github.com/jamessmoore',
]

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Moore Solutions',
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    description:
      'Moore Solutions helps small businesses cut the noise and get real results with AI, backed by 20+ years building and scaling production systems.',
    founder: {
      '@type': 'Person',
      name: 'James S. Moore',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Phoenix',
      addressRegion: 'AZ',
      addressCountry: 'US',
    },
    sameAs: SOCIAL_LINKS,
  }
}

export function getPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'James S. Moore',
    jobTitle: 'Founder',
    description:
      "20+ years building and running infrastructure at scale, now applying that same rigor to build AI solutions for small business owners.",
    url: `${SITE_URL}/about`,
    worksFor: {
      '@type': 'Organization',
      name: 'Moore Solutions',
      url: SITE_URL,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Phoenix',
      addressRegion: 'AZ',
      addressCountry: 'US',
    },
    sameAs: SOCIAL_LINKS,
  }
}

type ServiceSummary = {
  id: string
  title: string
  content: string
}

// Mirrors the `sections` array in src/app/services/page.tsx. Pass the
// same data in from that page rather than re-typing it here, so the two
// never drift apart.
export function getServiceJsonLd(services: ServiceSummary[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, i) => ({
      '@type': 'Service',
      position: i + 1,
      name: s.title,
      description: s.content,
      provider: {
        '@type': 'Organization',
        name: 'Moore Solutions',
        url: SITE_URL,
      },
      areaServed: 'US',
      url: `${SITE_URL}/services#${s.id}`,
    })),
  }
}
