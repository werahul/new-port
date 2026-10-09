import type { Metadata } from 'next'
import { Archivo, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { TopNav } from '@/components/layout/top-nav'
import { ClickSpark } from '@/components/reactbits/click-spark'
import {
  isIndexable,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from '@/lib/site'

/** Headlines: a heavy grotesk with a width axis, so display type can run wide. */
const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--font-display',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  alternates: { canonical: '/' },
  keywords: [
    'Full-Stack Engineer',
    'MERN',
    'Next.js',
    'React',
    'Node.js',
    'TypeScript',
    'AI Engineering',
    'Web Performance',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: isIndexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      >
        <a
          href="#main"
          className="b-btn sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <TopNav />
          <main id="main">{children}</main>
        </SmoothScroll>

        <ClickSpark />
        <Analytics />
      </body>
    </html>
  )
}
