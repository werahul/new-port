'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/primitives'
import { getLenis } from '@/components/ui/smooth-scroll'
import { navItems } from '@/content/nav'
import { profile, socials } from '@/content/profile'
import { cn } from '@/lib/utils'

const SOCIAL_FILLS = ['bg-yellow', 'bg-pink', 'bg-cyan']

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Route through Lenis when it is driving the page, so the two smooth-scroll
  // engines never fight over the same gesture.
  const scrollToTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.1 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const currentYear = new Date().getFullYear()

  return (
    <footer data-tone="dark" className="relative isolate overflow-hidden border-t-3 border-ink bg-bg text-fg">
      <Container className="pb-10 pt-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="label text-yellow">Get in touch</span>
            <a
              href={`mailto:${profile.email}`}
              className="group mt-4 flex w-fit max-w-full items-center gap-3 break-all font-display text-[clamp(1.4rem,4.4vw,3.2rem)] font-extrabold leading-tight decoration-yellow decoration-[5px] underline-offset-8 hover:underline"
            >
              {profile.email}
              <ArrowUpRight
                aria-hidden
                className="h-7 w-7 shrink-0 transition-transform duration-150 group-hover:-translate-y-1 group-hover:translate-x-1"
                strokeWidth={3}
              />
            </a>
            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map((social, i) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={social.label}
                    className={cn(
                      'b-lift flex h-12 w-12 items-center justify-center border-3 border-ink text-ink shadow-b-sm',
                      SOCIAL_FILLS[i % SOCIAL_FILLS.length],
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </a>
                )
              })}
            </div>
          </div>

          <nav aria-label="Footer" className="lg:col-span-4 lg:col-start-9">
            <span className="label text-yellow">Index</span>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.id === 'home' ? '/' : `/#${item.id}`}
                    className="label block border-2 border-edge/30 px-3 py-2.5 transition-colors hover:border-yellow hover:bg-yellow hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* the wordmark — cropped by the bottom edge on purpose */}
        <div
          aria-hidden
          className="h-display mt-16 select-none whitespace-nowrap text-[19vw] leading-[0.78] text-cream lg:text-[15.5rem]"
        >
          Rahul<span className="text-yellow">.</span>
        </div>

        <div className="label mt-6 flex flex-col gap-2 border-t-3 border-cream/20 pt-5 text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {currentYear} {profile.fullName}
          </span>
          <span>{profile.location}</span>
        </div>
      </Container>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={showBackToTop ? 0 : -1}
        aria-hidden={!showBackToTop}
        data-shown={showBackToTop}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center border-3 border-ink bg-yellow text-ink shadow-[4px_4px_0_0_rgb(var(--ink))] transition-[opacity,transform] duration-150 active:translate-x-1 active:translate-y-1 active:shadow-none data-[shown=false]:pointer-events-none data-[shown=false]:translate-y-4 data-[shown=false]:opacity-0"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={3} />
      </button>
    </footer>
  )
}
