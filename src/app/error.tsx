'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HexMark from '@/components/HexMark'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px] flex flex-col" style={{ backgroundColor: '#040C1C' }}>
        <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden br-grid px-6 py-24 sm:py-32 text-center">
          <div className="br-corner-tr" />
          <div className="br-corner-bl" />

          {/* Watermark hex */}
          <div
            className="absolute opacity-[0.06] pointer-events-none select-none"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <HexMark size={420} />
          </div>

          <div className="relative z-10 max-w-xl">
            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 font-sans text-[9px] tracking-widest"
              style={{ backgroundColor: '#071830', border: '0.8px solid #1A3D7A', borderRadius: '4px', color: '#FFFFFF' }}
            >
              <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ backgroundColor: '#FF6B6B' }} />
              ERROR 500
            </div>

            {/* Numeral */}
            <h1
              className="font-sans font-black leading-none mb-3"
              style={{ fontSize: 'clamp(4.5rem, 16vw, 8rem)', color: '#89D4FF' }}
            >
              500
            </h1>

            {/* Headline */}
            <h2
              className="font-sans font-black leading-tight mb-4"
              style={{ fontSize: '1.6rem', color: '#EEF6FF' }}
            >
              Something broke on our end, not yours.
            </h2>

            {/* Rule */}
            <div className="h-[0.5px] w-[220px] mx-auto my-5" style={{ backgroundColor: '#162D5A' }} />

            {/* Body copy */}
            <p
              className="font-sans text-[16px] sm:text-[18px] leading-relaxed mb-10"
              style={{ color: '#D3D3D3' }}
            >
              An unexpected error hit the server. Try again — if it keeps
              happening, James would genuinely like to know about it.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => reset()}
                className="font-sans font-bold text-[15px] tracking-widest px-7 py-3 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white cursor-pointer"
                style={{ background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)', border: '1px solid #3D7FD4', color: '#89D4FF', borderRadius: '6px' }}
              >
                TRY AGAIN ›
              </button>
              <Link
                href="/"
                className="font-sans font-bold text-[15px] tracking-widest px-7 py-3 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                style={{ backgroundColor: 'transparent', border: '1px solid #1A3D7A', color: '#89D4FF', borderRadius: '6px' }}
              >
                BACK TO HOME ›
              </Link>
              <Link
                href="/contact"
                className="font-sans font-bold text-[15px] tracking-widest px-7 py-3 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                style={{ backgroundColor: 'transparent', border: '1px solid #1A3D7A', color: '#89D4FF', borderRadius: '6px' }}
              >
                CONTACT JAMES ›
              </Link>
            </div>

            {/* Tagline */}
            <p
              className="font-sans text-[12px] tracking-widest mt-12"
              style={{ color: '#80AEE0' }}
            >
              FORGED IN EXPERIENCE. BUILT FOR WHAT&apos;S NEXT.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
