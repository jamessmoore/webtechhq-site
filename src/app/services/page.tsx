import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getServiceJsonLd } from '@/lib/structuredData'

export const metadata: Metadata = {
  title: 'Services | Moore Solutions',
  description:
    'AI coaching and agent development, intelligent automation, and business analytics, backed by 20+ years running production systems. Pick the lane that fits your business.',
}

const sections = [
  {
    id: 'ai-consulting',
    altId: 'ai-integration',
    title: 'AI COACHING & AGENT DEVELOPMENT',
    image: '/images/services/ai-consulting.jpg',
    content:
      'I help you figure out where AI actually fits in your business, then I implement it, from strategy through working prototype.',
  },
  {
    id: 'automation',
    title: 'INTELLIGENT AUTOMATION',
    image: '/images/services/automation.jpg',
    content:
      "If a human on your team is doing something repeatedly, a system should probably be doing it instead. Let's find those gaps and reduce your operational costs.",
  },
  {
    id: 'business-analytics',
    title: 'BUSINESS ANALYTICS',
    image: '/images/services/business-analytics.jpg',
    content:
      'Eliminate the noise and make informed decisions based on your data. I help you identify the right metrics, surface the right insights and act on them.',
  },
]

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getServiceJsonLd(sections)) }}
      />
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#1A3D7A' }}>
              SERVICES
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Professional execution. <span style={{ color: '#BCE5FF' }}>No hand-holding required.</span>
            </h1>
            <p className="font-sans text-[24px] leading-relaxed">
              Every engagement below draws on the same foundation: 20+ years keeping real business
              systems running, plus hands-on experience building AI tools that actually work. Pick
              the lane that fits your business or combine them, and you get a solution sized to
              your budget, built to last, and easy to run without a dedicated IT team.
            </p>
          </div>
        </section>

        {/* Service detail sections */}
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="px-10 py-[15px] scroll-mt-[58px]"
            style={{ borderTop: '0.5px solid #162D5A' }}
          >
            {s.altId && <span id={s.altId} className="block scroll-mt-[58px]" />}
            <div className="max-w-3xl mx-auto">
              <h2
                className="font-sans font-bold text-[24px] tracking-widest mb-4"
                style={{ color: '#BCE5FF' }}
              >
                {s.title}
              </h2>
              <div
                className="mb-4 overflow-hidden"
                style={{ border: '0.8px solid #162D5A', borderRadius: '2px' }}
              >
                <Image
                  src={s.image}
                  alt={s.title}
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                />
              </div>
              <p className="font-sans text-[21px] leading-relaxed">
                {s.content}
              </p>
            </div>
          </section>
        ))}

        {/* Closing CTA */}
        <section className="px-10 py-16" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '1.75rem', color: '#EEF6FF' }}>
              Not sure where to start?
            </h2>
            <p className="font-sans text-[20px] leading-relaxed mb-8">
              Run the free Opportunity Finder and get a custom AI prompt built around your
              business, no meetings, no sales pitch.
            </p>
            <Link
              href="/signup"
              className="inline-block font-sans font-bold text-[15px] tracking-widest px-7 py-3 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
              style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#89D4FF', borderRadius: '6px' }}
            >
              TRY THE OPPORTUNITY FINDER ›
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
