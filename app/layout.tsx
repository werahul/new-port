import type { Metadata } from 'next'
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { Sidebar } from '@/components/layout/sidebar'
import { Grain } from '@/components/primitives'
import { AmbientParallax } from '@/components/visual/ambient-parallax'
import { World } from '@/components/visual/world'
import { JourneyProgress } from '@/components/visual/journey-progress'
import {
  isIndexable,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-display',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Set theme before paint to avoid a flash of the wrong color scheme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('theme-storage')||'{}');var t=(s&&s.state&&s.state.theme)||'dark';var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground antialiased`}
      >
        {/*
          Ambient environment, four layers deep: graphite ground, a lift toward
          the horizon, an engineering grid that fades out, two slow-drifting
          light pools, and a vignette that pulls the eye to the centre. All of
          it sits behind the content and none of it is interactive.
        */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-background"
        >
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgb(var(--surface-2)/0.85),transparent_70%)]" />
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
          <div
            id="bg-pool-a"
            className="absolute -top-[22%] left-1/2 h-[62vh] w-[80vw] max-w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--violet)/calc(0.26*var(--atmos))),transparent)] blur-3xl will-change-transform"
          />
          <div
            id="bg-pool-b"
            className="absolute bottom-[-18%] right-[-12%] h-[50vh] w-[60vw] max-w-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--cobalt)/calc(0.2*var(--atmos))),transparent)] blur-3xl will-change-transform"
          />
          <div className="absolute inset-0 bg-[radial-gradient(100%_75%_at_50%_45%,transparent_35%,rgb(var(--base)/0.75)_100%)]" />
        </div>

        <a
          href="#main"
          className="sr-only rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>

        <ThemeProvider>
          <SmoothScroll>
            {/* One persistent 3D environment behind every section. The page
                scrolls *through* it; it is never mounted inside a section. */}
            <World />
            <AmbientParallax />
            <Sidebar />
            <JourneyProgress />
            <main id="main">{children}</main>
          </SmoothScroll>
        </ThemeProvider>

        <Grain />
      </body>
    </html>
  )
}
