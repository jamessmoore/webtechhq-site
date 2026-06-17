import Link from 'next/link'
import HexMark from './HexMark'

const footerLinks = [
  { href: '/services',  label: 'SERVICES' },
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/use-cases', label: 'USE CASES' },
  { href: '/about',     label: 'ABOUT' },
  { href: '/contact',   label: 'CONTACT' },
]

const iconLinks = [
  {
    href: 'https://instagram.com/real.james.moore',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.087 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.039.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.444.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.039 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.444-.445.719-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
      </svg>
    ),
  },
  {
    href: 'https://github.com/jamessmoore',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
  },
  {
    href: 'https://linkedin.com/in/thejamesmoore',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M14.82 0H1.18C.53 0 0 .53 0 1.18v13.64C0 15.47.53 16 1.18 16h13.64c.65 0 1.18-.53 1.18-1.18V1.18C16 .53 15.47 0 14.82 0zM4.75 13.4H2.4V6.1h2.35v7.3zM3.58 5.1c-.76 0-1.37-.62-1.37-1.38 0-.76.61-1.38 1.37-1.38.76 0 1.38.62 1.38 1.38 0 .76-.62 1.38-1.38 1.38zM13.6 13.4h-2.35V9.85c0-.85-.02-1.94-1.18-1.94-1.19 0-1.37.93-1.37 1.88v3.61H6.35V6.1h2.26v1h.03c.32-.6 1.08-1.23 2.23-1.23 2.38 0 2.82 1.57 2.82 3.6v3.93z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/@realjamesmoore',
    label: 'YouTube',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.07 9.82l-.008-.104A31.4 31.4 0 0 1-.02 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#020810', borderTop: '0.5px solid #162D5A' }}>
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        {/* Logo lockup */}
        <Link href="/" className="flex items-center gap-3 shrink-0 mb-4">
          <HexMark size={28} />
          <div className="flex flex-col justify-center leading-none">
            <span
              className="font-sans font-black text-[14px] tracking-[0.22em]"
              style={{ color: '#EEF6FF' }}
            >
              MOORE
            </span>
            <div style={{ borderTop: '0.5px solid #1A3D7A', marginTop: '2px', paddingTop: '2px' }}>
              <span
                className="font-mono text-[7px] tracking-[0.3em]"
                style={{ color: '#A9CFFA' }}
              >
                SOLUTIONS
              </span>
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div style={{ height: '0.5px', backgroundColor: '#0D1E3A', marginBottom: '16px' }} />

        {/* Links row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <nav className="flex flex-wrap gap-5">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-[9px] tracking-widest transition-all duration-200 text-[#EEF6FF] hover:text-[#89D4FF] hover:[text-shadow:0_0_6px_#89D4FF,0_0_14px_#3D9FFF]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {iconLinks.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex items-center justify-center w-7 h-7 border-[0.6px] border-[#1A3D7A] text-[#3A6AAA] transition-colors duration-150 hover:border-[#3D7FD4] hover:text-[#89D4FF]"
                style={{ backgroundColor: '#071830', borderRadius: '2px' }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '0.5px', backgroundColor: '#0D1E3A', marginBottom: '12px' }} />

        {/* Copyright — domain tucked here, very quiet */}
        <p
          className="font-mono text-[8px] tracking-widest"
          style={{ color: '#A9CFFA' }}
        >
          © 2026 JAMES S. MOORE · PHOENIX, AZ
          <span style={{ color: '#A9CFFA', marginLeft: '8px' }}>
            · WEBTECHHQ.COM
          </span>
        </p>
      </div>
    </footer>
  )
}
