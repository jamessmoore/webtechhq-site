import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ShareBar from '@/components/ShareBar'

export const metadata: Metadata = {
  title: 'Share This Site | Moore Solutions',
  description: 'Scan this QR code to open webtechhq.com on your phone.',
  robots: { index: false, follow: false },
}

const shareUrl = 'https://webtechhq.com'
const shareText = 'You focus on your growth. We handle the noise. — Moore Solutions'

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px] br-grid flex items-center" style={{ backgroundColor: '#040C1C' }}>
        <section className="px-10 py-16 w-full">
          <div className="max-w-md mx-auto flex flex-col items-center text-center gap-6">
            <div>
              <span className="font-sans font-bold tracking-[0.3em]" style={{ fontSize: '1.1em', color: '#1A3D7A' }}>
                SHARE THIS SITE
              </span>
              <div style={{ height: '0.5px', backgroundColor: '#162D5A', width: '80px', margin: '4px auto 0' }} />
            </div>

            <h1 className="font-sans font-black leading-tight" style={{ fontSize: '1.75rem' }}>
              Scan to open <span style={{ color: '#BCE5FF' }}>webtechhq.com</span>
            </h1>

            <div
              className="p-5"
              style={{ backgroundColor: '#FFFFFF', border: '0.8px solid #162D5A', borderRadius: '8px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/share-qr-logo.png"
                alt="QR code that opens webtechhq.com"
                width={280}
                height={280}
                className="block"
              />
            </div>

            <p className="font-sans text-[15px] tracking-widest" style={{ color: '#A9CFFA' }}>
              WEBTECHHQ.COM
            </p>

            <ShareBar
              url={shareUrl}
              text={shareText}
              label="OR SHARE VIA"
              emailSubject="Check out Moore Solutions"
            />
          </div>
        </section>
      </main>
      <Footer hideSocialLinks />
    </>
  )
}
