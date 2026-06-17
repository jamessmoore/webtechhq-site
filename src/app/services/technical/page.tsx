import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const sections = [
  {
    id: 'devops',
    title: 'DEVOPS & CLOUD INFRASTRUCTURE AUDITS',
    image: '/images/services/technical/devops.jpg',
    content:
      "AWS, Kubernetes, and Terraform — I'll tell you what's broken, what's expensive, and what's quietly waiting to fail.",
  },
  {
    id: 'saas',
    title: 'SAAS DEVELOPMENT',
    image: '/images/services/technical/saas.jpg',
    content:
      "Got a product idea that solves a real problem? I'll help you architect and ship it without building a team first.",
  },
  {
    id: 'cloud-management',
    title: 'CLOUD MANAGEMENT',
    image: '/images/services/technical/cloud-management.jpg',
    content:
      'Ongoing oversight, optimization, and incident response for cloud infrastructure that needs to stay healthy and cost-efficient.',
  },
  {
    id: 'sre',
    title: 'SRE CONTRACT — REMOTE · SENIOR',
    image: '/images/services/technical/sre.jpg',
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
        <section className="px-10 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/services"
              className="font-mono text-[10px] tracking-widest transition-colors duration-150 hover:text-[#BCE5FF]"
              style={{ color: '#5B90C8' }}
            >
              ‹ BACK TO SERVICES
            </Link>
            <span
              className="font-mono font-bold tracking-[0.3em] block mt-4"
              style={{ fontSize: '1.75em', color: '#162D5A' }}
            >
              TECHNICAL SERVICES
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Infrastructure, automation, and AI — built and operated by a senior engineer.
            </h1>
            <p className="font-mono text-[20px] leading-relaxed" style={{ color: '#80AEE0' }}>
              These engagements draw on 20+ years running production systems, plus hands-on
              experience building real AI agents and MCP integrations. Pick the lane that fits,
              or combine them.
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
      </main>
      <Footer />
    </>
  )
}
