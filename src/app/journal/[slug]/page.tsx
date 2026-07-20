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
        <article className="px-6 md:px-10 py-16 max-w-2xl mx-auto">
          <Link
            href="/journal"
            className="font-sans font-bold tracking-widest text-[12px] inline-block mb-8"
            style={{ color: '#3A6AAA' }}
          >
            &larr; BACK TO JOURNAL
          </Link>

          <span className="font-sans text-[12px] tracking-widest block mb-3" style={{ color: '#A9CFFA' }}>
            {formatEntryDate(entry.entryDate)}
          </span>

          <h1 className="font-sans font-black leading-tight mb-6" style={{ fontSize: '2rem', color: '#89D4FF' }}>
            {entry.title}
          </h1>

          {entry.youtubeUrl && (
            <a
              href={entry.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-sans font-bold text-[13px] tracking-widest mb-10 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]"
              style={{ color: '#040C1C', backgroundColor: '#89D4FF', borderRadius: '6px', padding: '10px 18px' }}
            >
              WATCH THE VIDEO
            </a>
          )}

          <div className="flex flex-col gap-5 mb-14">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="font-sans" style={{ fontSize: '17px', lineHeight: 1.7 }}>
                {paragraph}
              </p>
            ))}
          </div>

          <ShareBar url={entryUrl} text={entry.title} />
        </article>
      </main>
      <Footer />
    </>
  )
}
