import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getFaqJsonLd } from '@/lib/structuredData'

export const metadata: Metadata = {
  title: 'FAQ | Moore Solutions',
  description:
    "Answers to what people ask most before getting started with Moore Solutions: how the free Opportunity Finder and paid Business Audit work, who does the work, and what it costs to get going.",
}

type Faq = {
  question: string
  answer: string
}

type FaqCategory = {
  id: string
  title: string
  items: Faq[]
}

const categories: FaqCategory[] = [
  {
    id: 'getting-started',
    title: 'GETTING STARTED',
    items: [
      {
        question: 'What does Moore Solutions actually do?',
        answer:
          'I help small business owners find where AI can save real time or money, then build it, so you get the results without becoming the person who has to manage the tech.',
      },
      {
        question: 'Do I need to understand AI to work with you?',
        answer:
          'No. The Opportunity Finder just asks a few plain-English questions about how your business runs, then hands you a custom AI action plan in minutes.',
      },
      {
        question: 'What kind of businesses do you work with?',
        answer:
          'Local service businesses, retailers and restaurants, and solo professionals: plumbers, cleaning companies, realtors, boutiques, and coaches, among others.',
      },
    ],
  },
  {
    id: 'how-it-works',
    title: 'HOW IT WORKS',
    items: [
      {
        question: "What's the first step?",
        answer:
          'The free Opportunity Finder. No meetings, no sales pitch, just a few questions and a custom AI action plan built around your business.',
      },
      {
        question: 'What happens after the Opportunity Finder?',
        answer:
          'Most people move into the Business Audit, a full written report on exactly where AI could save you time or make you money.',
      },
      {
        question: 'How fast do I get my audit report?',
        answer: 'Within 48 hours of finishing the questionnaire.',
      },
      {
        question: 'What comes after the audit?',
        answer:
          'Usually a custom AI assistant trained on your business, handling inquiries and follow-ups while you sleep.',
      },
      {
        question: 'Do I have to book a call to get started?',
        answer: 'No. There are no meetings anywhere in the process. You start online and move at your own pace.',
      },
    ],
  },
  {
    id: 'trust-credibility',
    title: 'TRUST & CREDIBILITY',
    items: [
      {
        question: 'Who actually does the work?',
        answer: 'I do. Everything goes direct to me, the founder, not a call center or an outsourced team.',
      },
      {
        question: "What's your background?",
        answer:
          '20+ years building, scaling, and automating production systems, for everyone from scrappy startups to Fortune 500s, before I started applying that same rigor to AI for small businesses.',
      },
      {
        question: 'Is pricing predictable, or does scope creep happen?',
        answer: 'Flat-rate, no surprises. You know the cost before you start.',
      },
      {
        question: 'Am I locked into a long contract?',
        answer: 'No long contracts.',
      },
      {
        question: 'If I pay for the Business Audit, does that money just disappear if I move forward with an implementation?',
        answer:
          'No. The audit fee credits in full toward any implementation work you engage from your report.',
      },
    ],
  },
]

const allFaqs: Faq[] = categories.flatMap((c) => c.items)

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqJsonLd(allFaqs)) }}
      />
      <Navbar />
      <main className="min-h-screen pt-[58px]" style={{ backgroundColor: '#040C1C' }}>
        {/* Page header */}
        <section className="px-10 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.75em', color: '#1A3D7A' }}>
              FAQ
            </span>
            <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', marginTop: '4px', marginBottom: '24px' }} />
            <h1 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '2rem', color: '#EEF6FF' }}>
              Questions people ask <span style={{ color: '#BCE5FF' }}>before getting started.</span>
            </h1>
            <p className="font-sans text-[24px] leading-relaxed">
              Straight answers, no sales pitch. If you don&apos;t see what you&apos;re looking for
              here, reach out directly.
            </p>
          </div>
        </section>

        {/* FAQ categories */}
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="px-10 py-[15px] scroll-mt-[58px]"
            style={{ borderTop: '0.5px solid #162D5A' }}
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="font-sans font-bold text-[24px] tracking-widest mb-4" style={{ color: '#BCE5FF' }}>
                {category.title}
              </h2>

              <div className="flex flex-col gap-4">
                {category.items.map((faq) => (
                  <div
                    key={faq.question}
                    className="card-accent p-5"
                    style={{ backgroundColor: '#071525', border: '0.8px solid #162D5A', borderRadius: '2px' }}
                  >
                    <h3 className="font-sans font-bold text-[21px] leading-snug mb-2" style={{ color: '#EEF6FF' }}>
                      {faq.question}
                    </h3>
                    <p className="font-sans text-[19px] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Closing CTA */}
        <section className="px-10 py-16 text-center" style={{ borderTop: '0.5px solid #162D5A' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-sans font-black leading-tight mb-4" style={{ fontSize: '1.75rem', color: '#EEF6FF' }}>
              Still have questions?
            </h2>
            <p className="font-sans text-[21px] leading-relaxed mb-8">
              The fastest way to get a straight answer for your business is to run the free
              Opportunity Finder yourself.
            </p>
            <Link
              href="/tools"
              className="inline-block font-sans text-[12.5px] tracking-widest px-7 py-3 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
              style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#BCE5FF', borderRadius: '6px' }}
            >
              TRY THE OPPORTUNITY FINDER ›
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
