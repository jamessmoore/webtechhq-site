import Link from 'next/link'
import HexMark from './HexMark'

export default function Hero() {
  return (
    <section
      className="fixed inset-0 z-0 pt-[58px] flex flex-col justify-center overflow-hidden br-grid"
      style={{ backgroundColor: '#040C1C' }}
    >
      {/* BR corner ticks */}
      <div className="br-corner-tr" />
      <div className="br-corner-bl" />

      {/* Watermark hex — behind text, slow right-to-left drift */}
      <div className="absolute left-0 opacity-[0.065] pointer-events-none select-none" style={{ top: '50%', transform: 'translateY(calc(-25% - 160px))' }}>
        <div className="hex-watermark-drift">
          <HexMark size={320} />
        </div>
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-20 max-w-2xl">
        {/* Status badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-4 sm:mb-8 font-sans text-[9px] tracking-widest"
          style={{ backgroundColor: '#071830', border: '0.8px solid #1A3D7A', borderRadius: '4px', color: '#FFFFFF' }}
        >
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: '#5BA8F0' }}
          />
          AVAILABLE FOR CONTRACTS
        </div>

        {/* Headline */}
        <h1 className="font-sans font-black leading-tight mb-2 text-[1.75rem] sm:text-[2.4rem]">
          <span style={{ color: '#EEF6FF' }}>I help businesses</span>
          <br />
          <span style={{ color: '#89D4FF' }}>solve problems with AI.</span>
        </h1>

        {/* Rule */}
        <div className="h-[0.5px] w-[220px] mt-3 mb-3 sm:mt-5 sm:mb-6" style={{ backgroundColor: '#162D5A' }} />

        {/* Body copy */}
        <p
          className="font-sans text-[24px] leading-relaxed mb-4 sm:mb-8 max-w-lg"
          style={{ color: '#D3D3D3' }}
        >
          20+ years building and running infrastructure at scale. Now applying
          that same battle-tested rigor to AI integration, agentic systems, and
          MCP-powered automation. I build and ship independently — no hand-holding,
          just results.
        </p>

        {/* Credential chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-10">
          {['20+ YRS EXP', 'ANTHROPIC CERTIFIED', 'MCP BUILDER', 'AWS · GCP · K8S'].map((chip) => (
            <span
              key={chip}
              className="font-sans text-[10px] tracking-widest px-3 py-1"
              style={{
                backgroundColor: '#071830',
                border: '0.6px solid #1A3D7A',
                color: '#FFFFFF',
                borderRadius: '4px',
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-6 sm:mb-16">
          <Link
            href="/services"
            className="font-sans font-bold text-[15px] tracking-widest px-7 py-3 transition-colors duration-150"
            style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#89D4FF', borderRadius: '6px' }}
          >
            VIEW SERVICES ›
          </Link>
          <Link
            href="/portfolio"
            className="font-sans font-bold text-[15px] tracking-widest px-7 py-3 transition-colors duration-150"
            style={{ backgroundColor: 'transparent', border: '1px solid #1A3D7A', color: '#89D4FF', borderRadius: '6px' }}
          >
            SEE MY WORK ›
          </Link>
        </div>

        {/* Tagline */}
        <p
          className="font-sans text-[12px] tracking-widest"
          style={{ color: '#80AEE0' }}
        >
          FORGED IN EXPERIENCE. BUILT FOR WHAT&apos;S NEXT.
        </p>
      </div>
    </section>
  )
}
