import Link from 'next/link'

const services = [
  {
    title: 'BUSINESS ANALYTICS',
    subtitle: 'METRICS & INSIGHT',
    description:
      'Finding the metrics that actually predict outcomes, then building the dashboards and reports that make the next decision obvious.',
    href: '/services#business-analytics',
    featured: false,
  },
  {
    title: 'AI CONSULTING',
    subtitle: '& AGENT DEV',
    badge: 'MOST REQUESTED',
    description:
      'Mapping where AI actually moves the needle in your business, then shipping it — agents, MCP servers, and integrations that do real work.',
    href: '/services#ai-consulting',
    featured: true,
  },
  {
    title: 'INTELLIGENT',
    subtitle: 'AUTOMATION',
    description:
      "Repetitive manual work is a system waiting to be built. I find where your team is doing it by hand and replace it with one that isn't.",
    href: '/services#automation',
    featured: false,
  },
  {
    title: 'DEVOPS & CLOUD',
    subtitle: 'INFRA AUDITS',
    description:
      "AWS, Kubernetes, Terraform — a senior SRE's read on what's fragile, overpriced, or quietly one bad deploy from taking down production.",
    href: '/services/technical#devops',
    featured: false,
  },
]

export default function Services() {
  return (
    <section
      id="services"
      className="py-16 px-6"
      style={{ backgroundColor: '#030912', borderTop: '0.5px solid #162D5A' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-8">
          <span
            className="font-sans font-bold tracking-[0.3em]"
            style={{ fontSize: '1.75em', color: '#071830' }}
          >
            SERVICES
          </span>
          <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px' }} />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className={`card-accent${s.featured ? ' featured' : ''} group relative flex flex-col p-5 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]`}
              style={{
                backgroundColor: s.featured ? '#071830' : '#071525',
                border: s.featured ? '1px solid #3D7FD4' : '0.8px solid #162D5A',
                borderRadius: '2px',
                minHeight: '200px',
              }}
            >
              {s.badge && (
                <span
                  className="font-sans text-[7px] tracking-widest mb-2 block transition-all duration-200 group-active:!text-white"
                  style={{ color: '#2D5A9E' }}
                >
                  {s.badge}
                </span>
              )}
              <h3
                className="font-sans font-bold text-[10px] tracking-widest mb-1 transition-all duration-200 group-hover:[text-shadow:0_0_6px_#89D4FF,0_0_14px_#3D9FFF]"
                style={{ color: '#89D4FF' }}
              >
                {s.title}
              </h3>
              <p
                className="font-sans text-[8px] tracking-widest mb-4 transition-all duration-200 group-active:!text-white"
                style={{ color: '#2D5A9E' }}
              >
                {s.subtitle}
              </p>
              <p
                className="font-sans text-[19px] leading-relaxed flex-1 transition-all duration-200 group-active:!text-white"
                style={{ color: '#3A6AAA' }}
              >
                {s.description}
              </p>
              <span
                className="font-sans text-[9px] tracking-widest mt-5 block transition-all duration-200 group-hover:text-brand-blue group-hover:[text-shadow:0_0_6px_#3D7FD4,0_0_14px_#3D9FFF]"
                style={{ color: '#7EC8F4' }}
              >
                LEARN MORE ›
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
