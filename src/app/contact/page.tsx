import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import HexMark from '@/components/HexMark'

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px] br-grid" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-[32px] pb-[15px]">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Let&apos;s go.
            </h1>
            <p className="font-sans text-[24px] leading-relaxed" style={{ color: '#80AEE0' }}>
              Tell me about what you&apos;re working on — AI agents, automation, business
              analytics, or cloud and SRE infrastructure.
            </p>
          </div>
        </section>

        {/* Form + alternative contact */}
        <section className="px-10 pt-0 pb-12">
          <div className="max-w-3xl mx-auto relative overflow-hidden">
            {/* Hex watermark — behind form top fields + LinkedIn box */}
            <div
              className="absolute opacity-[0.065] pointer-events-none select-none"
              style={{ right: '162px', top: '0px' }}
            >
              <HexMark size={320} />
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
              <ContactForm />

              <div
                className="flex flex-col gap-3 p-5 self-start"
                style={{ backgroundColor: '#071525', border: '0.8px solid #162D5A', borderRadius: '2px' }}
              >
                <h2 className="font-sans font-bold text-[12px] tracking-widest" style={{ color: '#BCE5FF' }}>
                  PREFER LINKEDIN?
                </h2>
                <p className="font-sans text-[15px] leading-relaxed" style={{ color: '#5B90C8' }}>
                  Connect or send a message directly through LinkedIn.
                </p>
                <a
                  href="https://linkedin.com/in/thejamesmoore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[12.5px] tracking-widest px-5 py-2 text-center transition-colors duration-150"
                  style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#BCE5FF', borderRadius: '6px' }}
                >
                  VIEW LINKEDIN PROFILE ›
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
