import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllJournalEntries } from '@/lib/journal'

export const metadata: Metadata = {
  title: 'Journal | Moore Solutions',
  description:
    "James Moore's founder-journey journal: personal essays on building Moore Solutions, told from the actual stories behind each week's video.",
}

function formatEntryDate(isoDate: string): string {
  // Parse as UTC so the displayed date matches the YYYY-MM-DD folder name
  // regardless of the server's local timezone.
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
  if (firstParagraph.length <= 220) return firstParagraph
  return `${firstParagraph.slice(0, 220).trimEnd()}...`
}

export default function JournalIndexPage() {
  const entries = getAllJournalEntries()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px] br-grid" style={{ backgroundColor: '#040C1C' }}>
        <section className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.1em', color: '#1A3D7A' }}>
              JOURNAL
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', margin: '4px 0 0' }} />
          </div>

          <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#89D4FF' }}>
            The founder journey, in writing
          </h1>
          <p className="font-sans mb-12" style={{ fontSize: '21px', color: '#FFFFFF' }}>
            Personal essays behind the videos, in my own words.
          </p>

          {entries.length === 0 ? (
            <p className="font-sans" style={{ color: '#A9CFFA' }}>
              No entries yet. Check back soon.
            </p>
          ) : (
            <ul className="flex flex-col gap-8">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/journal/${entry.slug}`}
                    className="block p-5 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]"
                    style={{ backgroundColor: '#071830', border: '0.8px solid #162D5A', borderRadius: '4px' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="font-sans text-[12px] tracking-widest"
                        style={{ color: '#A9CFFA' }}
                      >
                        {formatEntryDate(entry.entryDate)}
                      </span>
                      {entry.entryType === 'monthly-recap' && (
                        <span
                          className="font-sans font-bold text-[11px] tracking-widest px-2 py-[2px]"
                          style={{ color: '#89D4FF', border: '0.6px solid #1A3D7A', borderRadius: '3px' }}
                        >
                          MONTHLY RECAP
                        </span>
                      )}
                    </div>
                    <h2 className="font-sans font-bold leading-snug mb-2" style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>
                      {entry.title}
                    </h2>
                    <p className="font-sans" style={{ color: '#A9CFFA' }}>
                      {excerptOf(entry.content)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
