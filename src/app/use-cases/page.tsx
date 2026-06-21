import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const marqueeItems = [
  'AI AUTOMATION',
  'SMALL BUSINESS',
  'PLUMBING',
  'RESTAURANTS',
  'REAL ESTATE',
  'CLEANING',
  'RETAIL',
  'COACHING',
  'LEAD QUALIFICATION',
  'AFTER-HOURS COVERAGE',
  'AUTONOMOUS BOOKING',
  'CUSTOMER FOLLOW-UP',
]

type UseCase = {
  id: string
  headline: string
  category: string
  image: string
  problem: string
  solution: string
  result: string
}

const useCases: UseCase[] = [
  {
    id: 'plumbing',
    headline: 'The Plumber Who Missed Leads After Hours',
    category: 'LOCAL SERVICE — HVAC/PLUMBING',
    image: '/images/use-cases/plumbing.jpg',
    problem: 'Calls coming in at 9pm go to voicemail. Half never call back.',
    solution: 'AI answers after hours, collects job details, books a callback slot.',
    result: 'Captured leads that used to disappear overnight.',
  },
  {
    id: 'restaurant',
    headline: 'The Restaurant That Stopped Answering the Same Question 40 Times a Day',
    category: 'RETAIL & RESTAURANT',
    image: '/images/use-cases/restaurant.jpg',
    problem: 'Staff fielding constant calls about hours, reservations, and the menu.',
    solution: 'AI handles those inquiries via the website and Google listing.',
    result: 'Front-of-house staff freed up during peak service hours.',
  },
  {
    id: 'real-estate',
    headline: 'The Realtor Drowning in Unqualified Leads',
    category: 'SOLO PROFESSIONAL',
    image: '/images/use-cases/real-estate.jpg',
    problem: 'Spending hours on calls with people not ready to buy or sell.',
    solution:
      'AI pre-qualifies inquiries — timeline, budget, motivation — before you ever pick up the phone.',
    result: 'Only serious prospects make it to a real conversation.',
  },
  {
    id: 'cleaning',
    headline: "The Cleaning Company That Couldn't Keep Up With Booking Requests",
    category: 'LOCAL SERVICE',
    image: '/images/use-cases/cleaning.jpg',
    problem: 'Owner was personally texting quotes and scheduling every job.',
    solution: 'AI handles intake, sends quotes based on job type, books the slot.',
    result: 'Owner reclaimed evenings and weekends.',
  },
  {
    id: 'boutique',
    headline: 'The Boutique That Lost Customers Between Visits',
    category: 'RETAIL',
    image: '/images/use-cases/boutique.jpg',
    problem: 'Customers bought once and disappeared — no follow-up system.',
    solution: 'AI sends personalized follow-ups based on what they bought, with relevant offers.',
    result: 'Repeat visit rate climbed without any manual effort.',
  },
  {
    id: 'coaching',
    headline: "The Business Coach Who Couldn't Scale Her Discovery Calls",
    category: 'SOLO PROFESSIONAL',
    image: '/images/use-cases/coaching.jpg',
    problem: "Running 10+ free discovery calls a week — most didn't convert.",
    solution: 'AI handled the first conversation, answered FAQs, and only passed through serious prospects.',
    result: 'Discovery calls cut in half, conversion rate doubled.',
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Marquee */}
        <div className="overflow-hidden whitespace-nowrap py-[10px]" style={{ borderBottom: '0.5px solid #162D5A' }}>
          <div className="marquee-track inline-flex">
            {[0, 1].map((rep) => (
              <span key={rep} className="inline-flex shrink-0">
                {marqueeItems.map((item, i) => (
                  <span key={i} className="font-sans text-[10px] tracking-widest" style={{ color: '#FFFFFF', padding: '0 2rem' }}>
                    {item}
                    <span style={{ color: '#1A3D7A', margin: '0 0.5rem' }}>·</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Page header */}
        <section className="px-10 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#162D5A' }}>
              USE CASES
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Real problems. <span style={{ color: '#BCE5FF' }}>Practical AI solutions.</span>
            </h1>
            <p className="font-sans text-[24px] leading-relaxed" style={{ color: '#80AEE0' }}>
              Here&apos;s what AI actually looks like when it&apos;s working inside a small
              business — not the hype, just the everyday problems it solves.
            </p>
          </div>
        </section>

        {/* Use case sections */}
        {useCases.map((u) => (
          <section
            key={u.id}
            className="px-10 py-[15px]"
            style={{ borderTop: '0.5px solid #162D5A' }}
          >
            <div className="max-w-3xl mx-auto">
              {/* Headline */}
              <h2 className="font-sans font-bold text-[24px] tracking-widest mb-4" style={{ color: '#BCE5FF' }}>
                {u.headline}
              </h2>

              {/* Category label */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-block w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: '#3D7FD4' }}
                />
                <span className="font-sans text-[18px] tracking-widest" style={{ color: '#80AEE0' }}>
                  {u.category}
                </span>
              </div>

              {/* Image */}
              <div
                className="relative w-full aspect-[16/9] overflow-hidden mb-4"
                style={{ border: '0.8px solid #162D5A', borderRadius: '2px' }}
              >
                <Image src={u.image} alt={u.headline} fill className="object-cover" />
              </div>

              {/* Use case box */}
              <div
                className="card-accent p-5"
                style={{ backgroundColor: '#071525', border: '0.8px solid #162D5A', borderRadius: '2px' }}
              >
                <div className="mb-4">
                  <span className="font-sans text-[16px] tracking-widest block mb-1" style={{ color: '#2D5A9E' }}>
                    THE PROBLEM
                  </span>
                  <p className="font-sans text-[21px] leading-relaxed" style={{ color: '#EEF6FF' }}>
                    {u.problem}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="font-sans text-[16px] tracking-widest block mb-1" style={{ color: '#2D5A9E' }}>
                    THE SOLUTION
                  </span>
                  <p className="font-sans text-[21px] leading-relaxed" style={{ color: '#EEF6FF' }}>
                    {u.solution}
                  </p>
                </div>

                <div className="flex gap-3 items-start pt-4" style={{ borderTop: '0.5px solid #162D5A' }}>
                  <span className="font-sans text-[21px] leading-relaxed" style={{ color: '#4ADE80' }}>
                    ›
                  </span>
                  <p className="font-sans text-[21px] leading-relaxed font-bold" style={{ color: '#4ADE80' }}>
                    {u.result}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Disclaimer */}
        <section className="px-10 py-[15px]" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto">
            <p className="font-sans text-[13.5px] leading-relaxed tracking-wide" style={{ color: '#2D5A9E' }}>
              NOTE: The scenarios above are illustrative — based on the types of problems I
              commonly see small businesses face, not specific past client engagements. Every
              business is different, and that&apos;s exactly the kind of thing worth talking through.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="px-10 py-16 text-center" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '1.75rem', color: '#EEF6FF' }}>
              See what this looks like for your business.
            </h2>
            <p className="font-sans text-[21px] leading-relaxed mb-8" style={{ color: '#5B90C8' }}>
              Let&apos;s talk about where AI could actually move the needle for you.
            </p>
            <Link
              href="/contact"
              className="inline-block font-sans text-[12.5px] tracking-widest px-7 py-3 transition-colors duration-150"
              style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#BCE5FF', borderRadius: '6px' }}
            >
              LET&apos;S TALK ›
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
