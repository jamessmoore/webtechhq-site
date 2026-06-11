import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-8 pb-[15px]">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#071830' }}>
              ABOUT
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Hi, I&apos;m James Moore.
            </h1>

            <div
              className="overflow-hidden w-[220px] mb-4"
              style={{ border: '0.8px solid #162D5A', borderRadius: '2px' }}
            >
              <Image
                src="/james-moore.png"
                alt="James Moore"
                width={932}
                height={1061}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Sub-headline */}
            <p
              className="font-mono text-[11px] tracking-widest"
              style={{ color: '#EEF6FF' }}
            >
              AI INNOVATOR · AGENTIC CURATOR · ENTREPRENEUR
            </p>
          </div>
        </section>

        {/* Bio */}
        <section className="px-10 py-[15px]" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <p className="font-mono text-[15px] leading-relaxed" style={{ color: '#3D7FD4' }}>
              If your infrastructure is held together with duct tape and hope, you&apos;re in the
              right place. I&apos;m an innovator with 15+ years
              of experience building, scaling, and automating cloud infrastructure for companies
              ranging from startups to Fortune 500s. I help forward-thinking businesses get their
              technology working for them instead of against them.
            </p>
            <p className="font-mono text-[15px] leading-relaxed" style={{ color: '#3D7FD4' }}>
              I offer a handful of core services — from infrastructure audits and intelligent
              automation to engineering augmentation and AI consulting. Take a look at the{' '}
              <Link
                href="/services"
                className="underline transition-colors duration-150 hover:text-[#89D4FF]"
                style={{ color: '#89D4FF' }}
              >
                Services page
              </Link>{' '}
              for the full breakdown.
            </p>
            <p className="font-mono text-[15px] leading-relaxed" style={{ color: '#3D7FD4' }}>
              Whether you&apos;re a founder who needs a trusted technical partner or an
              engineering team that needs senior-level firepower on demand, I work remotely, I
              move fast, and I build things that last. Take a look around — and if something
              resonates,{' '}
              <Link
                href="/contact"
                className="underline transition-colors duration-150 hover:text-[#89D4FF]"
                style={{ color: '#89D4FF' }}
              >
                let&apos;s talk
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
