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

function monthKey(isoDate: string): string {
  const [year, month] = isoDate.split('-')
  return `${year}-${month}`
}

function monthLabel(isoDate: string): string {
  // Parse as UTC so the displayed month matches the YYYY-MM-DD folder name
  // regardless of the server's local timezone.
  const [year, month] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1))
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' })
    .toUpperCase()
}

function firstSentenceOf(content: string): string {
  const firstParagraph = content.split(/\n\s*\n/)[0]?.trim() ?? ''
  const sentenceMatch = firstParagraph.match(/^.*?[.!?](?=\s|$)/)
  const sentence = sentenceMatch ? sentenceMatch[0] : firstParagraph
  if (sentence.length <= 220) return sentence
  return `${sentence.slice(0, 220).trimEnd()}...`
}

type MonthGroup = {
  key: string
  label: string
  entries: ReturnType<typeof getAllJournalEntries>
}

function groupByMonth(entries: ReturnType<typeof getAllJournalEntries>): MonthGroup[] {
  // Entries arrive sorted by entry_date DESC, so consecutive entries
  // sharing a key can just be appended to the running group.
  const groups: MonthGroup[] = []
  for (const entry of entries) {
    const key = monthKey(entry.entryDate)
    const current = groups[groups.length - 1]
    if (current && current.key === key) {
      current.entries.push(entry)
    } else {
      groups.push({ key, label: monthLabel(entry.entryDate), entries: [entry] })
    }
  }
  return groups
}

const ENTRY_GLOW = 'hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]'

export default function JournalIndexPage() {
  const entries = getAllJournalEntries()
  const monthGroups = groupByMonth(entries)

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
            The Founder Journey
          </h1>
          <p className="font-sans mb-12" style={{ fontSize: '21px', color: '#FFFFFF' }}>
            My thoughts on AI and building a small business.
          </p>

          {entries.length === 0 ? (
            <p className="font-sans" style={{ color: '#A9CFFA' }}>
              No entries yet. Check back soon.
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              {monthGroups.map((group) => (
                <div
                  key={group.key}
                  className={`p-5 transition-all duration-200 ${ENTRY_GLOW}`}
                  style={{ backgroundColor: '#071830', border: '0.8px solid #162D5A', borderRadius: '4px' }}
                >
                  <div className="text-right mb-2">
                    <span
                      className="font-sans font-bold text-[12px] tracking-widest"
                      style={{ color: '#A9CFFA' }}
                    >
                      {group.label}
                    </span>
                  </div>
                  <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '100%', marginBottom: '8px' }} />
                  <div>
                    <div className="md:hidden flex flex-col">
                      {group.entries.map((entry, i) => (
                        <Link
                          key={entry.id}
                          href={`/journal/${entry.slug}`}
                          className={`group flex flex-col gap-2 py-4 ${i === group.entries.length - 1 ? 'pb-0' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <h2
                              className="font-sans font-bold leading-snug text-left whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200 group-hover:[text-shadow:0_0_6px_#3D9FFF,0_0_14px_#3D9FFF]"
                              style={{ fontSize: 'calc(1.05rem + 1px)', color: '#FFFFFF' }}
                            >
                              {entry.title}
                            </h2>
                            {entry.entryType === 'monthly-recap' && (
                              <span
                                className="font-sans font-bold text-[11px] tracking-widest px-2 py-[2px]"
                                style={{ color: '#89D4FF', border: '0.6px solid #1A3D7A', borderRadius: '3px' }}
                              >
                                MONTHLY RECAP
                              </span>
                            )}
                          </div>
                          <p
                            className="font-sans text-left transition-all duration-200 group-hover:[text-shadow:0_0_6px_#3D9FFF,0_0_14px_#3D9FFF]"
                            style={{ color: '#A9CFFA' }}
                          >
                            {firstSentenceOf(entry.content)}
                          </p>
                        </Link>
                      ))}
                    </div>

                    <div
                      className="hidden md:grid md:items-start md:gap-x-10 md:gap-y-0"
                      style={{ gridTemplateColumns: 'minmax(0, max-content) 1fr' }}
                    >
                      {group.entries.map((entry, i) => (
                        <Link
                          key={entry.id}
                          href={`/journal/${entry.slug}`}
                          className="group contents"
                        >
                          <div className={`flex items-center gap-3 py-4 max-w-[420px] ${i === group.entries.length - 1 ? 'pb-0' : ''}`}>
                            <h2
                              className="font-sans font-bold leading-snug text-left whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200 group-hover:[text-shadow:0_0_6px_#3D9FFF,0_0_14px_#3D9FFF]"
                              style={{ fontSize: 'calc(1.05rem + 1px)', color: '#FFFFFF' }}
                            >
                              {entry.title}
                            </h2>
                            {entry.entryType === 'monthly-recap' && (
                              <span
                                className="font-sans font-bold text-[11px] tracking-widest px-2 py-[2px] shrink-0"
                                style={{ color: '#89D4FF', border: '0.6px solid #1A3D7A', borderRadius: '3px' }}
                              >
                                MONTHLY RECAP
                              </span>
                            )}
                          </div>
                          <p
                            className={`font-sans text-left py-4 transition-all duration-200 group-hover:[text-shadow:0_0_6px_#3D9FFF,0_0_14px_#3D9FFF] ${i === group.entries.length - 1 ? 'pb-0' : ''}`}
                            style={{ color: '#A9CFFA' }}
                          >
                            {firstSentenceOf(entry.content)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
