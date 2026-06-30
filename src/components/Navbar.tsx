'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoLockup from './LogoLockup'

const navLinks = [
  { href: '/services',  label: 'SERVICES' },
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/use-cases', label: 'USE CASES' },
  { href: '/about',     label: 'ABOUT' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav
      aria-label="Primary"
      className="fixed top-0 left-0 right-0 z-50 h-[58px] flex items-center px-4 sm:px-6"
      style={{ backgroundColor: '#030B18', borderBottom: '0.5px solid #162D5A' }}
    >
      {/* Logo lockup */}
      <Link href="/" className="flex items-center shrink-0">
        <LogoLockup height={40} />
      </Link>

      {/* Vertical rule */}
      <div
        className="hidden sm:block mx-5 self-stretch"
        style={{ width: '0.5px', backgroundColor: '#162D5A', marginTop: '10px', marginBottom: '10px' }}
      />

      {/* Nav links */}
      <div className="hidden sm:flex items-center gap-6">
        {navLinks.map(({ href, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`font-sans text-[12.5px] tracking-widest transition-colors duration-150 relative hover:text-[#89D4FF] ${
                active ? 'nav-active text-[#89D4FF]' : 'text-[#EEF6FF]'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* CTA */}
      <div className="hidden sm:block ml-auto">
        <Link
          href="/questionnaire"
          className="font-sans text-[12.5px] tracking-widest px-5 py-2 transition-colors duration-150"
          style={{
            background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)',
            border: '1px solid #3D7FD4',
            color: '#89D4FF',
            borderRadius: '6px',
          }}
        >
          LET&apos;S GO ›
        </Link>
      </div>

      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="sm:hidden ml-auto flex items-center justify-center w-8 h-8 shrink-0 transition-colors duration-150"
        style={{
          border: '1px solid #3D7FD4',
          borderRadius: '6px',
          color: '#89D4FF',
          backgroundColor: open ? '#0E3A9A' : 'transparent',
        }}
      >
        <span className="font-sans text-[14px] leading-none">{open ? '✕' : '☰'}</span>
      </button>

      {/* Mobile dropdown panel */}
      {open && (
        <div
          className="sm:hidden absolute left-0 right-0 top-full flex flex-col"
          style={{ backgroundColor: '#030B18', borderBottom: '0.5px solid #162D5A' }}
        >
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`font-sans text-[12.5px] tracking-widest px-6 py-3 transition-colors duration-150 ${
                  active ? 'text-[#89D4FF]' : 'text-[#EEF6FF]'
                }`}
                style={{ borderTop: '0.5px solid #162D5A' }}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/questionnaire"
            onClick={() => setOpen(false)}
            className="font-sans text-[12.5px] tracking-widest px-6 py-3 text-center"
            style={{
              background: 'linear-gradient(180deg, #1A4FC4, #0E3A9A)',
              color: '#89D4FF',
              borderTop: '0.5px solid #162D5A',
            }}
          >
            LET&apos;S GO ›
          </Link>
        </div>
      )}
    </nav>
  )
}
