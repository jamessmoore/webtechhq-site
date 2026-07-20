'use client'

import { useState } from 'react'

interface ShareBarProps {
  /** The canonical URL being shared (this page's own URL, not always the site root). */
  url: string;
  /** Share text, e.g. a title or short line describing what's being shared. */
  text: string;
  /** Optional label above the icon row. Defaults to "SHARE". */
  label?: string;
}

/**
 * Row of social-share icon links (X, Facebook, LinkedIn, WhatsApp, Email,
 * Instagram, Copy Link). Extracted from /share/page.tsx so any page can
 * share its own URL/text rather than always pointing at the site homepage.
 *
 * Instagram and Copy Link don't have a share-intent URL like the others —
 * neither platform (nor "copy") has one — so both copy `url` to the
 * clipboard and show a brief toast confirmation instead of navigating out.
 */
export default function ShareBar({ url, text, label = 'SHARE' }: ShareBarProps) {
  const [toast, setToast] = useState<string | null>(null)

  async function copyLink(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleInstagramClick() {
    const copied = await copyLink()
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
    showToast(copied ? 'Link copied — paste it into your bio or story' : 'Could not copy link')
  }

  async function handleCopyLinkClick() {
    const copied = await copyLink()
    showToast(copied ? 'Copied!' : 'Could not copy link')
  }

  const iconButtonClass =
    'flex items-center justify-center w-10 h-10 border-[0.6px] border-[#1A3D7A] text-[#3A6AAA] transition-colors duration-150 hover:border-[#3D7FD4] hover:text-[#89D4FF]'
  const iconButtonStyle = { backgroundColor: '#071830', borderRadius: '6px' }

  return (
    <div className="w-full flex flex-col items-center gap-4 pt-2">
      <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '100%' }} />
      <p className="font-sans font-bold text-[12px] tracking-widest" style={{ color: '#BCE5FF' }}>
        {label}
      </p>
      <div className="relative flex items-center gap-2">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          title="Share on X"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M9.53 6.78 15.24 0h-1.35L8.93 5.88 4.9 0H0l5.98 8.89L0 16h1.35l5.24-6.19L10.82 16H16L9.53 6.78zM7.66 9 7.05 8.1 1.83 1.04h2.08l4.13 5.87.61.87 5.44 7.87H11.99L7.66 9z" />
          </svg>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          title="Share on Facebook"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
          </svg>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M14.82 0H1.18C.53 0 0 .53 0 1.18v13.64C0 15.47.53 16 1.18 16h13.64c.65 0 1.18-.53 1.18-1.18V1.18C16 .53 15.47 0 14.82 0zM4.75 13.4H2.4V6.1h2.35v7.3zM3.58 5.1c-.76 0-1.37-.62-1.37-1.38 0-.76.61-1.38 1.37-1.38.76 0 1.38.62 1.38 1.38 0 .76-.62 1.38-1.38 1.38zM13.6 13.4h-2.35V9.85c0-.85-.02-1.94-1.18-1.94-1.19 0-1.37.93-1.37 1.88v3.61H6.35V6.1h2.26v1h.03c.32-.6 1.08-1.23 2.23-1.23 2.38 0 2.82 1.57 2.82 3.6v3.93z" />
          </svg>
        </a>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.336-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </a>

        <a
          href={`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
          aria-label="Share via Email"
          title="Share via Email"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
          </svg>
        </a>

        {/* Instagram has no web share-intent URL scheme, so this copies the
            link and opens instagram.com instead, with a toast explaining
            why. */}
        <button
          type="button"
          onClick={handleInstagramClick}
          aria-label="Share on Instagram"
          title="Share on Instagram"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" />
            <circle cx="8" cy="8" r="3.3" />
            <circle cx="11.7" cy="4.3" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleCopyLinkClick}
          aria-label="Copy link"
          title="Copy link"
          className={iconButtonClass}
          style={iconButtonStyle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
            <path d="M6.5 9.5 9.5 6.5" />
            <path d="M6.9 10.6 5.6 11.9a2.2 2.2 0 0 1-3.1-3.1l1.9-1.9a2.2 2.2 0 0 1 3.1 0" />
            <path d="M9.1 5.4 10.4 4.1a2.2 2.2 0 0 1 3.1 3.1l-1.9 1.9a2.2 2.2 0 0 1-3.1 0" />
          </svg>
        </button>

        {toast && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[12px] font-bold px-3 py-1"
            style={{ backgroundColor: '#89D4FF', color: '#040C1C', borderRadius: '4px' }}
            role="status"
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
