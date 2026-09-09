'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { getLenis, scrollToId } from '@/components/ui/smooth-scroll'
import { navItems } from '@/content/nav'
import { socials } from '@/content/profile'
import { cn } from '@/lib/utils'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Focusable descendants, in DOM order, for the drawer's focus trap. */
function focusables(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null)
}

export function Sidebar() {
  const { currentSection, setCurrentSection, isSidebarOpen, setSidebarOpen } =
    useUIStore()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const pathname = usePathname()
  const onHome = pathname === '/'

  const railRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy — only meaningful on the home page, where the sections exist.
  useEffect(() => {
    if (!onHome) return
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setCurrentSection(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [setCurrentSection, onHome])

  // Slide the active pill to the current item. Replaces framer-motion's
  // layoutId with one measured transform — no layout animation runtime.
  useIsoLayoutEffect(() => {
    const rail = railRef.current
    const pill = pillRef.current
    if (!rail || !pill) return
    const active = rail.querySelector<HTMLElement>('[data-nav-active="true"]')
    if (!active || !onHome) {
      pill.style.opacity = '0'
      return
    }
    pill.style.opacity = '1'
    pill.style.width = `${active.offsetWidth}px`
    pill.style.transform = `translateX(${active.offsetLeft}px)`
  }, [currentSection, mounted, onHome])

  // Drawer: lock scroll (Lenis included), trap focus, Esc to close, restore focus.
  useEffect(() => {
    if (!isSidebarOpen) return
    const drawer = drawerRef.current
    const opener = openerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    // `overflow: hidden` alone does not stop Lenis — it drives scroll itself.
    const lenis = getLenis()
    lenis?.stop()
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        return
      }
      if (e.key !== 'Tab' || !drawer) return
      const items = focusables(drawer)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const raf = requestAnimationFrame(() => {
      if (drawer) focusables(drawer)[0]?.focus()
    })
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      // Return focus to the control that opened the drawer.
      ;(opener ?? previouslyFocused)?.focus?.()
    }
  }, [isSidebarOpen, setSidebarOpen])

  /**
   * Nav items are real anchors. On the home page we intercept and hand the
   * scroll to Lenis; anywhere else (a case study) the `/#id` href navigates
   * home properly — previously these were buttons calling `scrollToId` for
   * sections that don't exist off the home page, so the nav was simply dead.
   */
  const onNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      setSidebarOpen(false)
      if (!onHome) return // let the browser navigate to /#id
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()
      scrollToId(id)
      setCurrentSection(id)
      history.replaceState(null, '', `#${id}`)
    },
    [onHome, setCurrentSection, setSidebarOpen],
  )

  const hrefFor = (id: string) => (onHome ? `#${id}` : `/#${id}`)

  return (
    <>
      {/* Desktop floating bar */}
      <div className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 lg:block">
        <nav
          aria-label="Primary"
          className={cn(
            'animate-fade-in-down flex items-center gap-1 surface rounded-full px-2 py-2 transition-shadow duration-300 ease-editorial',
            scrolled && 'shadow-soft',
          )}
        >
          <Link
            href="/"
            className="px-3 type-metadata text-foreground"
            aria-label="Home"
          >
            R<span className="text-muted-foreground">/</span>
          </Link>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />

          <div ref={railRef} className="relative flex items-center gap-1">
            {/* the sliding active pill */}
            <span
              ref={pillRef}
              aria-hidden
              className="absolute inset-y-0 left-0 -z-10 rounded-full border border-accent/25 bg-surface-3 opacity-0 shadow-edge transition-[transform,width,opacity] duration-500 ease-editorial motion-reduce:transition-none"
            />
            {navItems.map((item) => {
              const isActive = onHome && currentSection === item.id
              return (
                <Link
                  key={item.id}
                  href={hrefFor(item.id)}
                  data-nav-active={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={(e) => onNavClick(e, item.id)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium tracking-tight transition-colors duration-300',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-background/80 px-5 py-3.5 backdrop-blur-xl lg:hidden">
        <Link href="/" className="type-metadata text-foreground" aria-label="Home">
          RAHUL<span className="text-muted-foreground">/</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            ref={openerRef}
            type="button"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isSidebarOpen}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {isSidebarOpen && (
        <div
          ref={drawerRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="animate-fade-in fixed inset-0 z-40 flex flex-col bg-background/95 px-5 pb-10 pt-24 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Primary" className="flex flex-col divide-y divide-border border-y border-line">
            {navItems.map((item, i) => {
              const isActive = onHome && currentSection === item.id
              return (
                <Link
                  key={item.id}
                  href={hrefFor(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={(e) => onNavClick(e, item.id)}
                  className="animate-fade-in-up flex items-baseline justify-between py-5 text-left"
                  style={{ animationDelay: `${40 * i}ms` }}
                >
                  <span
                    className={cn(
                      'text-2xl font-medium tracking-tight',
                      isActive ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="type-metadata">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex gap-2.5 pt-10">
            {socials.map((social) => {
              const Icon = social.icon
              const external = social.href.startsWith('http')
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
