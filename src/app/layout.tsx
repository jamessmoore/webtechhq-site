import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moore Solutions | James S. Moore — AI · SRE · Cloud',
  description:
    'I help businesses solve problems with AI. Senior AI/ML Engineer, SRE, and Cloud Architect with 20+ years of experience. Phoenix, AZ.',
  keywords: ['AI consulting', 'SRE', 'DevOps', 'cloud engineering', 'MCP', 'agentic AI', 'James Moore'],
  authors: [{ name: 'James S. Moore' }],
  openGraph: {
    title: 'Moore Solutions | James S. Moore',
    description: 'I help businesses solve problems with AI.',
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
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
