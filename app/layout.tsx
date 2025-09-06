import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { Sidebar } from '@/components/layout/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rahul - MERN Stack Developer',
  description: 'Full-stack developer specializing in React, Node.js, and modern web technologies. Creating exceptional digital experiences with clean, efficient code.',
  keywords: ['MERN Stack', 'React', 'Node.js', 'Full Stack Developer', 'Web Development'],
  authors: [{ name: 'Rahul' }],
  creator: 'Rahul',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rahul-portfolio.com',
    title: 'Rahul - MERN Stack Developer',
    description: 'Full-stack developer specializing in React, Node.js, and modern web technologies.',
    siteName: 'Rahul Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahul - MERN Stack Developer',
    description: 'Full-stack developer specializing in React, Node.js, and modern web technologies.',
  },
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
        {/* Or use .png: <link rel="icon" type="image/png" href="/favicon.png" /> */}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SmoothScroll>
            <Sidebar />
            <main>
              {children}
            </main>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}