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
              Hi, I&apos;m James Moore.
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
              AI INNOVATOR · AGENTIC CURATOR · ENTREPRENEUR
            </p>
          </div>
        </section>

        {/* Bio */}
        <section className="px-10 py-[15px]" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <p className="font-sans leading-relaxed">
              If your business is running on sticky notes, spreadsheets, and hope, you&apos;re in
              the right place. I&apos;m an AI/ML engineer with a senior SRE background — 20+ years
              building, scaling, and automating production systems for everyone from scrappy
              startups to Fortune 500s. These days most of that experience goes toward a different
              kind of client: local service businesses, retailers and restaurants, and solo
              professionals who know AI could help but aren&apos;t sure where to start.
            </p>
            <p className="font-sans leading-relaxed">
              The way in is simple: a flat-rate AI Business Audit — a working session plus a
              written report on where AI could actually save you time or make you money, no hype
              attached. From there, the most common next step is an AI assistant trained on your
              business that handles inquiries and follow-ups while you sleep. See what that looks
              like in the{' '}
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
            <p className="font-sans leading-relaxed">
              Whether you&apos;re a plumber tired of missing after-hours calls, a coach who can&apos;t
              scale discovery calls, or a founder who wants senior-level technical judgment without
              hiring a team, I work remotely, I move fast, and I build things that last. Take a
              look around — and if something resonates,{' '}
              <Link
                href="/tools"
                className="underline transition-all duration-200 hover:text-[#BCE5FF] hover:[text-shadow:0_0_6px_#BCE5FF,0_0_14px_#3D9FFF] active:!text-white"
                style={{ color: '#BCE5FF' }}
              >
                let&apos;s go
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
