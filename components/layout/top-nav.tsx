'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { getLenis, scrollToId } from '@/components/ui/smooth-scroll'
import { navItems } from '@/content/nav'
import { profile, socials } from '@/content/profile'
import { cn } from '@/lib/utils'

const MENU_COLORS = ['bg-yellow', 'bg-pink', 'bg-cyan', 'bg-emerald', 'bg-violet', 'bg-coral', 'bg-cobalt']

/** Focusable descendants, in DOM order, for the menu's focus trap. */
function focusables(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
  ).filter((el) => el.offsetParent !== null)
}

/**
 * Sticky top bar: a logo block, bordered section links with the current one
 * filled, and a résumé button. Below `lg` it collapses into a full-screen menu
 * of huge coloured links.
 */
export function TopNav() {
  const pathname = usePathname()
  const onHome = pathname === '/'
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)

  // Scroll-spy, home page only.
  useEffect(() => {
    if (!onHome) return
    const els = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => Boolean(el))
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [onHome])

  // Menu: lock scroll (Lenis too), trap focus, Esc closes, focus returns.
  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    const opener = openerRef.current
    const lenis = getLenis()
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => menu && focusables(menu)[0]?.focus())

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setOpen(false)
      if (e.key !== 'Tab' || !menu) return
      const items = focusables(menu)
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
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      opener?.focus()
    }
  }, [open])

  // Same-page jumps glide through Lenis; elsewhere the href goes to /#id.
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setOpen(false)
    if (!onHome || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    setActive(id)
    // let the menu's scroll lock release first
    requestAnimationFrame(() => scrollToId(id))
    history.replaceState(null, '', id === 'home' ? '/' : `#${id}`)
  }

  const href = (id: string) => (id === 'home' ? '/' : `/#${id}`)

  return (
    <>
      <header
        data-tone="light"
        className="sticky top-0 z-50 border-b-3 border-ink bg-cream text-ink"
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
          <Link
            href="/"
            onClick={(e) => go(e, 'home')}
            className="group flex items-center gap-3"
            aria-label={`${profile.fullName} — home`}
          >
            <span className="h-title flex h-10 w-10 items-center justify-center border-3 border-ink bg-yellow text-lg shadow-b-sm transition-transform duration-150 group-hover:-rotate-6">
              RK
            </span>
            <span className="h-title hidden text-lg sm:block">{profile.fullName}</span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1.5">
              {navItems
                .filter((n) => n.id !== 'home')
                .map((item) => {
                  const isActive = onHome && active === item.id
                  return (
                    <li key={item.id}>
                      <a
                        href={href(item.id)}
                        onClick={(e) => go(e, item.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'label block border-2 px-3 py-2 transition-[background-color,transform,border-color] duration-150',
                          isActive
                            ? 'border-ink bg-ink text-cream'
                            : 'border-transparent hover:-translate-y-0.5 hover:border-ink hover:bg-yellow',
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-accent="pink"
              className="b-btn hidden !px-4 !py-2 sm:inline-flex"
            >
              Résumé
              <ArrowUpRight aria-hidden className="h-4 w-4" strokeWidth={3} />
            </a>
            <button
              ref={openerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center border-3 border-ink bg-paper shadow-b-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          ref={menuRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-tone="light"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-cream text-ink lg:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b-3 border-ink px-4 sm:px-8">
            <span className="label">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center border-3 border-ink bg-pink shadow-b-sm"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
          <nav aria-label="Primary" className="flex-1 px-4 py-6 sm:px-8">
            <ul className="flex flex-col gap-3">
              {navItems.map((item, i) => (
                <li key={item.id} style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
                  <a
                    href={href(item.id)}
                    onClick={(e) => go(e, item.id)}
                    className={cn(
                      'h-display flex items-center justify-between border-3 border-ink px-4 py-3 text-4xl shadow-b sm:text-5xl',
                      MENU_COLORS[i % MENU_COLORS.length],
                    )}
                  >
                    {item.label}
                    <span className="font-mono text-base">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap gap-3 border-t-3 border-ink px-4 py-5 sm:px-8">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-accent="yellow"
              className="b-btn"
            >
              Résumé
            </a>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="b-btn b-btn-ghost"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
