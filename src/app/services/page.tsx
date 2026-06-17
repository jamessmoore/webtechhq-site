import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const sections = [
  {
    id: 'business-analytics',
    title: 'BUSINESS ANALYTICS',
    image: '/images/services/business-analytics.jpg',
    content:
      'Turn your data into decisions. I help you identify the right metrics, surface the right insights, and act on them.',
  },
  {
    id: 'ai-consulting',
    altId: 'ai-integration',
    title: 'AI CONSULTING & AGENT DEVELOPMENT',
    image: '/images/services/ai-consulting.jpg',
    content:
      'I help you figure out where AI actually fits in your business — then build it, from strategy through working prototype.',
  },
  {
    id: 'automation',
    title: 'INTELLIGENT AUTOMATION',
    image: '/images/services/automation.jpg',
    content:
      "If a human on your team is doing something repeatedly, a system should probably be doing it instead. Let's find those gaps.",
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#162D5A' }}>
              SERVICES
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Senior-level execution. No hand-holding required.
            </h1>
            <p className="font-mono text-[20px] leading-relaxed" style={{ color: '#80AEE0' }}>
              Every engagement below draws on the same foundation — 20+ years running production
              systems, plus hands-on experience building real AI agents and MCP integrations. Pick
              the lane that fits, or combine them. Either way, you get a senior engineer who ships.
            </p>
          </div>
        </section>

        {/* Service detail sections */}
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="px-10 py-[15px]"
            style={{ borderTop: '0.5px solid #162D5A' }}
          >
            {s.altId && <span id={s.altId} />}
            <div className="max-w-3xl mx-auto">
              <h2
                className="font-mono font-bold text-[24px] tracking-widest mb-4"
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
              <p
                className="font-mono text-[15px] leading-relaxed"
                style={{ color: '#5B90C8' }}
              >
                {s.content}
              </p>
            </div>
          </section>
        ))}

        {/* Link to technical services */}
        <section className="px-10 py-10 text-center" style={{ borderTop: '0.5px solid #162D5A' }}>
          <Link
            href="/services/technical"
            className="font-mono text-[12px] tracking-widest transition-colors duration-150 hover:text-[#89D4FF]"
            style={{ color: '#5B90C8' }}
          >
            See more technical services ›
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
