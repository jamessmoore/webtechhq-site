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
            <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#1A3D7A' }}>
              ABOUT
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Hi, I&apos;m <span style={{ color: '#BCE5FF' }}>James Moore</span>.
            </h1>

            <div
              className="overflow-hidden w-[220px] mb-4"
              style={{ border: '0.8px solid #162D5A', borderRadius: '2px' }}
            >
              <Image
                src="/james-moore.webp"
                alt="James Moore"
                width={700}
                height={797}
                sizes="220px"
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Sub-headline */}
            <p className="font-sans text-[12px] tracking-widest" style={{ color: 'var(--brand-blue)' }}>
              FOUNDER · ENTREPRENEUR · AGENTIC CURATOR
            </p>
          </div>
        </section>

        {/* Bio */}
        <section className="px-10 py-[15px]" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <p className="font-sans text-[21px] leading-relaxed">
              Most small business owners know AI could help, they just don&apos;t have time to
              figure out where to start. That&apos;s where I come in. I&apos;m the founder of Moore
              Solutions, backed by 20+ years
              building, scaling, and automating production systems for everyone from scrappy
              startups to Fortune 500s. These days that experience goes toward a different kind of
              client: local service businesses, retailers and restaurants, and solo professionals
              who want <span className="font-bold" style={{ color: '#BCE5FF' }}>results without becoming the person who has to manage the tech</span>.
            </p>
            <p className="font-sans text-[21px] leading-relaxed">
              The way in is simple: start with the free{' '}
              <Link
                href="/signup"
                className="underline transition-all duration-200 hover:text-[#BCE5FF] hover:[text-shadow:0_0_6px_#BCE5FF,0_0_14px_#3D9FFF] active:!text-white"
                style={{ color: '#BCE5FF' }}
              >
                Opportunity Finder
              </Link>
              , answer a few quick questions and walk away with a custom AI prompt built around
              your business. From there, most people move into the full{' '}
              <Link
                href="/tools/business-audit"
                className="underline transition-all duration-200 hover:text-[#BCE5FF] hover:[text-shadow:0_0_6px_#BCE5FF,0_0_14px_#3D9FFF] active:!text-white"
                style={{ color: '#BCE5FF' }}
              >
                Business Audit
              </Link>
              , a flat-rate written report on exactly where AI could save you time or make you
              money, no hype attached. The next step after that is usually an AI assistant trained on
              your business that handles inquiries and follow-ups while you sleep. See what that
              looks like in the{' '}
              <Link
                href="/use-cases"
                className="underline transition-all duration-200 hover:text-[#BCE5FF] hover:[text-shadow:0_0_6px_#BCE5FF,0_0_14px_#3D9FFF] active:!text-white"
                style={{ color: '#BCE5FF' }}
              >
                Use Cases
              </Link>{' '}
              or the full{' '}
              <Link
                href="/services"
                className="underline transition-all duration-200 hover:text-[#BCE5FF] hover:[text-shadow:0_0_6px_#BCE5FF,0_0_14px_#3D9FFF] active:!text-white"
                style={{ color: '#BCE5FF' }}
              >
                Services page
              </Link>{' '}
              breakdown.
            </p>
            <p className="font-sans text-[21px] leading-relaxed">
              Whether you&apos;re a plumber tired of missing after-hours calls, a coach who can&apos;t
              scale discovery calls, or a founder who wants professional technical judgment without
              hiring a team, I work remotely, I move fast, and I build things that last. Take a
              look around, and if something resonates,{' '}
              <Link
                href="/tools"
                className="underline transition-all duration-200 hover:text-[#BCE5FF] hover:[text-shadow:0_0_6px_#BCE5FF,0_0_14px_#3D9FFF] active:!text-white"
                style={{ color: '#BCE5FF' }}
              >
                let&apos;s go
              </Link>
              .
            </p>

            <div
              className="flex flex-col items-start gap-3 p-5 self-start"
              style={{ backgroundColor: '#071525', border: '0.8px solid #162D5A', borderRadius: '2px' }}
            >
              <h2 className="font-sans font-bold text-[12px] tracking-widest" style={{ color: '#BCE5FF' }}>
                SHARING THIS SITE?
              </h2>
              <p className="font-sans text-[15px] leading-relaxed">
                Grab a QR code that opens webtechhq.com on any phone.
              </p>
              <Link
                href="/share"
                className="font-sans text-[12.5px] tracking-widest px-5 py-2 text-center transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#BCE5FF', borderRadius: '6px' }}
              >
                GET SHAREABLE QR CODE ›
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
