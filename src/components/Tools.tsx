import Link from 'next/link'

const tools = [
  {
    title: 'OPPORTUNITY FINDER',
    subtitle: 'START HERE · FREE',
    badge: 'MOST POPULAR',
    description:
      "Answer a few plain-English questions about how your business runs. In minutes you'll get a custom AI action plan pointing straight at your biggest time and money wins.",
    href: '/tools',
    featured: true,
  },
  {
    title: 'BUSINESS AUDIT',
    subtitle: 'GO DEEPER',
    badge: 'FOUNDING RATE',
    description:
      "A fully automated deep-dive that builds you a complete opportunity report for your operations. The audit fee credits in full toward any work you take on from it.",
    href: '/tools',
    featured: false,
  },
  {
    title: 'CONTENT ASSISTANT',
    subtitle: 'COMING SOON',
    description:
      "Draft social posts, emails, and customer replies in your own voice, in seconds. No more staring at a blank page before the workday even starts.",
    href: '/tools',
    featured: false,
  },
  {
    title: 'REVIEW RESPONDER',
    subtitle: 'COMING SOON',
    description:
      "Friendly, on-brand replies to every review you get, drafted for you and ready to post. Turn feedback into relationships without the back-and-forth.",
    href: '/tools',
    featured: false,
  },
]

export default function Tools() {
  return (
    <section
      id="tools"
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
            TOOLS
          </span>
          <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px' }} />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className={`card-accent${t.featured ? ' featured' : ''} group relative flex flex-col p-5 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]`}
              style={{
                backgroundColor: t.featured ? '#071830' : '#071525',
                border: t.featured ? '1px solid #3D7FD4' : '0.8px solid #162D5A',
                borderRadius: '2px',
                minHeight: '200px',
              }}
            >
              {t.badge && (
                <span
                  className="font-sans text-[7px] tracking-widest mb-2 block transition-all duration-200 group-active:!text-white"
                  style={{ color: '#2D5A9E' }}
                >
                  {t.badge}
                </span>
              )}
              <h3
                className="font-sans font-bold text-[10px] tracking-widest mb-1 transition-all duration-200 group-hover:[text-shadow:0_0_6px_#89D4FF,0_0_14px_#3D9FFF]"
                style={{ color: '#89D4FF' }}
              >
                {t.title}
              </h3>
              <p className="font-sans text-[8px] tracking-widest mb-4">
                {t.subtitle}
              </p>
              <p className="font-sans text-[19px] leading-relaxed flex-1 text-white">
                {t.description}
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
