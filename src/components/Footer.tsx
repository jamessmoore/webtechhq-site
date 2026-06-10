import Link from 'next/link'
import HexMark from './HexMark'

const footerLinks = [
  { href: '/services',  label: 'SERVICES' },
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/about',     label: 'ABOUT' },
  { href: '/blog',      label: 'BLOG' },
  { href: '/#contact',  label: 'CONTACT' },
]

const socialLinks = [
  { href: 'https://instagram.com/real.james.moore', label: '@REAL.JAMES.MOORE' },
  { href: 'https://linkedin.com/in/thejamesmoore', label: 'LINKEDIN' },
  { href: 'https://github.com/jamessmoore', label: 'GITHUB' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#020810', borderTop: '0.5px solid #162D5A' }}>
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        {/* Logo lockup */}
        <div className="flex items-center gap-3 mb-4">
          <HexMark size={28} />
          <div>
            <span
              className="font-sans font-black text-[14px] tracking-[0.22em] block leading-none"
              style={{ color: '#EEF6FF' }}
            >
              MOORE
            </span>
            <div style={{ borderTop: '0.5px solid #162D5A', marginTop: '2px', paddingTop: '2px' }}>
              <span
                className="font-mono text-[7px] tracking-[0.3em]"
                style={{ color: '#162D5A' }}
              >
                METHODS
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '0.5px', backgroundColor: '#0D1E3A', marginBottom: '16px' }} />

        {/* Links row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <nav className="flex flex-wrap gap-5">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-[9px] tracking-widest transition-colors duration-150"
                style={{ color: '#1A3D7A' }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-5">
            {socialLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] tracking-widest transition-colors duration-150"
                style={{ color: '#0D1E3A' }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '0.5px', backgroundColor: '#0D1E3A', marginBottom: '12px' }} />

        {/* Copyright — domain tucked here, very quiet */}
        <p
          className="font-mono text-[8px] tracking-widest"
          style={{ color: '#0A1630' }}
        >
          © 2026 JAMES S. MOORE · PHOENIX, AZ
          <span style={{ color: '#091428', marginLeft: '8px' }}>
            · WEBTECHHQ.COM
          </span>
        </p>
      </div>
    </footer>
  )
}
