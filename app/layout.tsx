import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import './lab.css'
import { Analytics } from '@vercel/analytics/next'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { LabNav } from '@/components/lab/nav'
import { RevealObserver } from '@/components/lab/reveal-observer'
import { SoundHost } from '@/components/lab/sound/sound-host'
import { navItems, profile } from '@/content/lab'
import {
  isIndexable,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from '@/lib/site'

/**
 * Headlines: Bricolage Grotesque, whose optical-size axis draws large type
 * with real character and small type cleanly — one face, set with care.
 */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
  variable: '--font-display',
})

/** Everything people read: Instrument Sans, crisp at every size. */
const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

/** Numbers and indices only. */
const mono = JetBrains_Mono({
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
    'Creative Developer',
    'MERN',
    'Next.js',
    'React',
    'Three.js',
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

export const viewport: Viewport = {
  themeColor: '#8B6BFF',
  colorScheme: 'light',
}

/**
 * Runs before the first paint: decides the motion mode — the hidden starting
 * state of scroll reveals only exists under "full" — and, should the reveal
 * observer never boot, shows everything after four seconds.
 */
const prePaint = `(function(){try{var r=document.currentScript.parentElement;var m=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;r.setAttribute('data-motion',m?'reduce':'full');setTimeout(function(){if(!window.__labReveal)r.setAttribute('data-reveal-all','')},4000)}catch(e){}})()`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable}`}
      >
        <a href="#main" className="l-skip">
          Skip to content
        </a>

        <SmoothScroll>
          <div data-lab="" className="lab" suppressHydrationWarning>
            <script dangerouslySetInnerHTML={{ __html: prePaint }} />
            <LabNav
              items={navItems}
              fullName={profile.fullName}
              resumeUrl={profile.resumeUrl}
              email={profile.email}
            />
            <main id="main">{children}</main>
          </div>
        </SmoothScroll>

        <RevealObserver />
        <SoundHost />
        <Analytics />
      </body>
    </html>
  )
}
