'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import './globals.css'

export default function GlobalError({
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
    <html lang="en">
      <body>
        <main
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: '#040C1C' }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 font-sans text-[9px] tracking-widest"
            style={{ backgroundColor: '#071830', border: '0.8px solid #1A3D7A', borderRadius: '4px', color: '#FFFFFF' }}
          >
            <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ backgroundColor: '#FF6B6B' }} />
            ERROR 500
          </div>

          <h1
            className="font-sans font-black leading-none mb-3"
            style={{ fontSize: 'clamp(4.5rem, 16vw, 8rem)', color: '#89D4FF' }}
          >
            500
          </h1>

          <h2
            className="font-sans font-black leading-tight mb-4"
            style={{ fontSize: '1.6rem', color: '#EEF6FF' }}
          >
            Something broke on our end, not yours.
          </h2>

          <p
            className="font-sans text-[16px] leading-relaxed mb-10 max-w-md"
            style={{ color: '#D3D3D3' }}
          >
            The whole page failed to load. Try again, or head back to the homepage.
          </p>

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
          </div>
        </main>
      </body>
    </html>
  )
}
