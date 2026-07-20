import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ShareBar from '@/components/ShareBar'
import { getJournalEntryBySlug } from '@/lib/journal'

const SITE_URL = 'https://webtechhq.com'

function formatEntryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function excerptOf(content: string): string {
  const firstParagraph = content.split(/\n\s*\n/)[0]?.trim() ?? ''
  if (firstParagraph.length <= 200) return firstParagraph
  return `${firstParagraph.slice(0, 200).trimEnd()}...`
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getJournalEntryBySlug(slug)
  if (!entry) {
    return { title: 'Journal | Moore Solutions' }
  }
  return {
    title: `${entry.title} | Moore Solutions Journal`,
    description: excerptOf(entry.content),
  }
}

export default async function JournalEntryPage({ params }: Props) {
  const { slug } = await params
  const entry = getJournalEntryBySlug(slug)
  if (!entry) notFound()

  const entryUrl = `${SITE_URL}/journal/${entry.slug}`
  const paragraphs = entry.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px] br-grid" style={{ backgroundColor: '#040C1C' }}>
        <article className="px-6 md:px-10 py-16 max-w-5xl mx-auto">
          {/*
            Two-column layout (desktop, md+):
              row 1: Title              (col 1 only)
              row 2: full-width divider (spans both columns)
              row 3: Body (col 1)  |  Sidebar: Date, Watch Video, Back link, Share (col 2)
            Mobile: single column, DOM order below (Title, Divider, Body, Sidebar)
            handles the stacking automatically via flex-col.

            Sidebar is sticky on desktop (md+) so it stays in view while the
            body copy in the left column scrolls past it. top offset clears
            the fixed 58px navbar plus a 20px gap.
          */}
          <div className="flex flex-col gap-10 md:grid md:grid-cols-[2fr_1fr] md:gap-x-16 md:gap-y-10">
            <h1
              className="font-sans font-black leading-tight md:col-start-1 md:row-start-1"
              style={{ fontSize: '2rem', color: '#89D4FF' }}
            >
              {entry.title}
            </h1>

            <div
              className="md:col-start-1 md:col-span-2 md:row-start-2"
              style={{ height: '0.5px', backgroundColor: '#162D5A', width: '100%' }}
            />

            <div className="flex flex-col gap-5 md:col-start-1 md:row-start-3">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="font-sans" style={{ fontSize: '17px', lineHeight: 1.7 }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="flex flex-col gap-6 md:col-start-2 md:row-start-3 md:self-start md:sticky md:top-[78px]">
              <span className="font-sans text-[12px] tracking-widest" style={{ color: '#A9CFFA' }}>
                {formatEntryDate(entry.entryDate)}
              </span>

              {entry.youtubeUrl && (
                <a
                  href={entry.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center font-sans font-bold text-[13px] tracking-widest transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]"
                  style={{ color: '#040C1C', backgroundColor: '#89D4FF', borderRadius: '6px', padding: '10px 18px' }}
                >
                  WATCH THE VIDEO
                </a>
              )}

              <Link
                href="/journal"
                className="font-sans font-bold tracking-widest text-[12px] inline-block"
                style={{ color: '#3A6AAA' }}
              >
                &larr; BACK TO JOURNAL
              </Link>

              <ShareBar url={entryUrl} text={entry.title} />
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
