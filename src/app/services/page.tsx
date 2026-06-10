import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const sections = [
  {
    id: 'ai-consulting',
    altId: 'ai-integration',
    title: 'AI CONSULTING & AGENT DEVELOPMENT',
    content:
      'I help you figure out where AI actually fits in your business — then build it, from strategy through working prototype.',
  },
  {
    id: 'devops',
    title: 'DEVOPS & CLOUD INFRASTRUCTURE AUDITS',
    content:
      "12+ years of AWS, Kubernetes, and Terraform — I'll tell you what's broken, what's expensive, and what's quietly waiting to fail.",
  },
  {
    id: 'sre',
    title: 'SRE CONTRACT — REMOTE · SENIOR',
    content:
      'Fractional or full-time remote SRE support for teams that need senior reliability engineering without a six-month hiring process. I step into on-call rotations, build out observability (Prometheus, Grafana, Datadog), tighten incident response processes, and bring Kubernetes/AWS infrastructure up to a standard that lets your team sleep at night. Engagements are scoped as contract or retainer, fully remote, starting with a short discovery call to align on priorities.',
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-16 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono text-[8px] tracking-[0.3em]" style={{ color: '#1A3D7A' }}>
              SERVICES
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Senior-level execution. No hand-holding required.
            </h1>
            <p className="font-mono text-[20px] leading-relaxed" style={{ color: '#5B90C8' }}>
              Every engagement below draws on the same foundation — 12+ years running production
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
            className="px-10 py-12"
            style={{ borderTop: '0.5px solid #162D5A' }}
          >
            {s.altId && <span id={s.altId} />}
            <div className="max-w-3xl mx-auto">
              <h2
                className="font-mono font-bold text-[24px] tracking-widest mb-4"
                style={{ color: '#89D4FF' }}
              >
                {s.title}
              </h2>
              <p
                className="font-mono text-[19px] leading-relaxed"
                style={{ color: '#3D7FD4' }}
              >
                {s.content ?? '[Content needed: description, deliverables, pricing/engagement model]'}
              </p>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
