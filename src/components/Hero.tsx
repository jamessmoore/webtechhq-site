import Link from 'next/link'
import HexMark from './HexMark'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen pt-[58px] flex flex-col justify-center overflow-hidden br-grid"
      style={{ backgroundColor: '#040C1C' }}
    >
      {/* BR corner ticks */}
      <div className="br-corner-tr" />
      <div className="br-corner-bl" />

      {/* Watermark hex — behind text, 25% overlap */}
      <div className="absolute opacity-[0.065] pointer-events-none select-none" style={{ left: '450px', top: '50%', transform: 'translateY(calc(-25% - 160px))' }}>
        <HexMark size={320} />
      </div>

      <div className="relative z-10 px-10 py-20 max-w-2xl">
        {/* Status badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 font-mono text-[9px] tracking-widest"
          style={{ backgroundColor: '#071830', border: '0.8px solid #1A3D7A', borderRadius: '2px', color: '#3D7FD4' }}
        >
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: '#5BA8F0' }}
          />
          AVAILABLE FOR CONTRACTS
        </div>

        {/* Headline */}
        <h1 className="font-sans font-black leading-tight mb-2" style={{ fontSize: '2.4rem' }}>
          <span style={{ color: '#EEF6FF' }}>I help businesses solve</span>
          <br />
          <span style={{ color: '#89D4FF' }}>problems by using AI.</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="font-mono text-[11px] tracking-widest mt-5 mb-1"
          style={{ color: '#3A6AAA' }}
        >
          AI INNOVATOR · AGENTIC CURATOR · ENTREPRENEUR
        </p>

        {/* Rule */}
        <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '220px', marginBottom: '24px' }} />

        {/* Body copy */}
        <p
          className="font-mono text-[21px] leading-relaxed mb-8 max-w-lg"
          style={{ color: '#2D5A9E' }}
        >
          12+ years building and running infrastructure at scale. Now applying
          that same battle-tested rigor to AI integration, agentic systems, and
          MCP-powered automation. I build and ship independently — no hand-holding,
          just results.
        </p>

        {/* Credential chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['12+ YRS EXP', 'ANTHROPIC CERTIFIED', 'MCP BUILDER', 'AWS · GCP · K8S'].map((chip) => (
            <span
              key={chip}
              className="font-mono text-[8px] tracking-widest px-3 py-1"
              style={{
                backgroundColor: '#071830',
                border: '0.6px solid #1A3D7A',
                color: '#3D7FD4',
                borderRadius: '2px',
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            href="/services"
            className="font-mono text-[10px] tracking-widest px-7 py-3 transition-colors duration-150"
            style={{ backgroundColor: '#0E3A9A', border: '1px solid #3D7FD4', color: '#89D4FF', borderRadius: '2px' }}
          >
            VIEW SERVICES ›
          </Link>
          <Link
            href="/portfolio"
            className="font-mono text-[10px] tracking-widest px-7 py-3 transition-colors duration-150"
            style={{ backgroundColor: 'transparent', border: '1px solid #1A3D7A', color: '#3A6AAA', borderRadius: '2px' }}
          >
            SEE MY WORK ›
          </Link>
        </div>

        {/* Tagline */}
        <p
          className="font-mono text-[10px] tracking-widest"
          style={{ color: '#5B90C8' }}
        >
          FORGED IN EXPERIENCE. BUILT FOR WHAT&apos;S NEXT.
        </p>
      </div>
    </section>
  )
}
