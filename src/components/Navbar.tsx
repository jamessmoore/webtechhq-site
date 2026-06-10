'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HexMark from './HexMark'

const navLinks = [
  { href: '/services',  label: 'SERVICES' },
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/about',     label: 'ABOUT' },
  { href: '/blog',      label: 'BLOG' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[58px] flex items-center px-6"
      style={{ backgroundColor: '#030B18', borderBottom: '0.5px solid #162D5A' }}
    >
      {/* Logo lockup */}
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <HexMark size={39} />
        <div className="flex flex-col justify-center leading-none">
          <span
            className="font-sans font-black text-[19px] tracking-[0.22em]"
            style={{ color: '#EEF6FF' }}
          >
            MOORE
          </span>
          <div style={{ borderTop: '0.5px solid #1A3D7A', marginTop: '2px', paddingTop: '2px' }}>
            <span
              className="font-mono text-[7px] tracking-[0.3em]"
              style={{ color: '#2D5A9E' }}
            >
              METHODS
            </span>
          </div>
        </div>
      </Link>

      {/* Vertical rule */}
      <div
        className="mx-5 self-stretch"
        style={{ width: '0.5px', backgroundColor: '#162D5A', marginTop: '10px', marginBottom: '10px' }}
      />

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {navLinks.map(({ href, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`font-mono text-[10px] tracking-widest transition-colors duration-150 relative pb-2 ${
                active ? 'nav-active' : ''
              }`}
              style={{ color: active ? '#89D4FF' : '#3A6AAA' }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* CTA */}
      <div className="ml-auto">
        <Link
          href="/#contact"
          className="font-mono text-[10px] tracking-widest px-5 py-2 transition-colors duration-150"
          style={{
            backgroundColor: '#0E3A9A',
            border: '1px solid #3D7FD4',
            color: '#89D4FF',
            borderRadius: '2px',
          }}
        >
          LET&apos;S TALK ›
        </Link>
      </div>
    </nav>
  )
}
