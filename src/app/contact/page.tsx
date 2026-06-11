import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-16 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono text-[8px] tracking-[0.3em]" style={{ color: '#1A3D7A' }}>
              CONTACT
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Let&apos;s talk.
            </h1>
            <p className="font-mono text-[20px] leading-relaxed" style={{ color: '#5B90C8' }}>
              Tell me about what you&apos;re working on — AI integration, cloud infrastructure,
              or an SRE need.
            </p>
          </div>
        </section>

        {/* Form + alternative contact */}
        <section className="px-10 py-12" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
            <ContactForm />

            <div
              className="flex flex-col gap-3 p-5 self-start"
              style={{ backgroundColor: '#071525', border: '0.8px solid #162D5A', borderRadius: '2px' }}
            >
              <h2 className="font-mono font-bold text-[12px] tracking-widest" style={{ color: '#89D4FF' }}>
                PREFER LINKEDIN?
              </h2>
              <p className="font-mono text-[11px] leading-relaxed" style={{ color: '#3D7FD4' }}>
                Connect or send a message directly through LinkedIn.
              </p>
              <a
                href="https://linkedin.com/in/thejamesmoore"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-widest px-5 py-2 text-center transition-colors duration-150"
                style={{ backgroundColor: '#0E3A9A', border: '1px solid #3D7FD4', color: '#89D4FF', borderRadius: '2px' }}
              >
                VIEW LINKEDIN PROFILE ›
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
