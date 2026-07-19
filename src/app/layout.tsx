import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moore Solutions | James S. Moore · Founder & Entrepreneur',
  description:
    'James S. Moore, founder of Moore Solutions. I help small businesses cut the noise and get real results with AI, backed by 20+ years building and scaling production systems. Phoenix, AZ.',
  keywords: ['AI coaching', 'business automation', 'entrepreneur', 'founder', 'Moore Solutions', 'James Moore'],
  authors: [{ name: 'James S. Moore' }],
  openGraph: {
    title: 'Moore Solutions | James S. Moore',
    description: 'You focus on your growth. I handle the noise.',
    url: 'https://webtechhq.com',
    siteName: 'Moore Solutions',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en">
      <body>{children}</body>
      {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
    </html>
  )
}
