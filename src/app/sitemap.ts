import type { MetadataRoute } from 'next'
import { getAllJournalEntries } from '@/lib/journal'

const SITE_URL = 'https://webtechhq.com'

// This route now reads journal entries from the DB with no request-derived
// input, so Next would otherwise prerender it once at build time and bake
// in whatever entries existed then. That's wrong here for the same reason
// src/app/journal/page.tsx forces dynamic: `npm run import:journal-entry`
// writes new/updated entries straight into the production DB as a separate
// action from a code deploy, so a freshly imported entry needs to show up
// in the sitemap immediately instead of waiting for the next deploy to
// regenerate the static snapshot.
export const dynamic = 'force-dynamic'

// Only genuinely public marketing pages belong here. Everything gated
// behind a session (auth pages, /admin, /tools/*, /business-audit) is
// excluded and noindexed instead — see the robots metadata on those routes.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Individual journal entry pages get their own sitemap entries, one per
  // row, with lastModified set from that entry's real entryDate (not the
  // build-time `lastModified` above) so the sitemap gives crawlers an
  // accurate freshness signal instead of a fake "changed at build time" date.
  const journalEntries: MetadataRoute.Sitemap = getAllJournalEntries().map((entry) => ({
    url: `${SITE_URL}/journal/${entry.slug}`,
    lastModified: new Date(entry.entryDate),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/use-cases`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...journalEntries,
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
