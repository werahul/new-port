'use client'

import { useState, useEffect } from 'react'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/primitives'
import { getLenis } from '@/components/ui/smooth-scroll'
import { Parallax, ScrollReveal, TextReveal } from '@/components/motion'
import { navItems } from '@/content/nav'
import { profile, socials } from '@/content/profile'

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 700)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
    <footer className="relative isolate border-t border-line">
      {/* The world keeps moving behind the footer too, and the email is the
          one string on the page a visitor has to read character by character. */}
      <div className="section-veil" aria-hidden />
      <Container className="py-16 lg:py-20">
        <Parallax travel={44} className="flex flex-col gap-4">
          <span className="type-metadata">Get in touch</span>
          <a
            href={`mailto:${profile.email}`}
            className="type-display-sm group inline-flex w-fit items-center gap-3 text-foreground transition-colors hover:text-accent-strong"
          >
            <TextReveal as="span" split="chars" className="inline-block">
              {profile.email}
            </TextReveal>
            <ArrowUpRight className="h-6 w-6 transition-transform duration-300 ease-editorial group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
        </Parallax>

        <ScrollReveal
          stagger
          variant="fade-up"
          distance={20}
          className="mt-16 grid gap-10 border-t border-line pt-10 sm:grid-cols-2"
        >
          <div>
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              {profile.fullName}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {profile.role} — building considered digital products across the
              stack.
            </p>
            <div className="mt-5 flex gap-2.5">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      social.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors duration-300 ease-editorial hover:border-foreground/30 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          <nav className="sm:justify-self-end">
            <span className="type-metadata">Index</span>
            <ul className="mt-4 space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollReveal>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 type-metadata sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {currentYear} {profile.fullName}
          </span>
          <span>Built with Next.js · GSAP · Three.js</span>
        </div>
      </Container>

      {/* Kept mounted and toggled with CSS so it fades both ways without an
          animation library, and stays out of the tab order while hidden. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={showBackToTop ? 0 : -1}
        aria-hidden={!showBackToTop}
        data-shown={showBackToTop}
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center surface rounded-full text-foreground transition-[opacity,transform,background-color] duration-300 ease-editorial hover:bg-background motion-reduce:transition-none data-[shown=false]:pointer-events-none data-[shown=false]:scale-90 data-[shown=false]:opacity-0"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </footer>
  )
}
