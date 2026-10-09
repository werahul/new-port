'use client'

import { useEffect, useState } from 'react'
import { scrollToId } from '@/components/ui/smooth-scroll'
import { cn } from '@/lib/utils'

export interface NavSection {
  id: string
  n: string
  label: string
}

/**
 * Case-study section index. A sticky vertical rail on desktop, a sticky
 * horizontal chip scroller (under the site header) on mobile. Scroll-spy via
 * IntersectionObserver; jumps route through the shared Lenis `scrollToId`.
 */
export function CaseStudyNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActive(visible.target.id)
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.5, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  // Real anchors, so the contents list is keyboard-, middle-click- and
  // share-friendly; the handler only upgrades the jump to a Lenis glide.
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    setActive(id)
    scrollToId(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label="Case study sections" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <div className="sticky top-16 z-30 -mx-4 border-b-3 border-ink bg-bg px-4 py-2.5 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
        <div className="label mb-3 hidden lg:block">Contents</div>
        <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-1.5 lg:overflow-visible">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide transition-[background-color,transform] duration-150',
                    isActive
                      ? 'border-ink bg-accent text-ink shadow-[3px_3px_0_0_rgb(var(--ink))] lg:translate-x-2'
                      : 'border-transparent text-fg hover:border-edge',
                  )}
                >
                  <span className="opacity-60">{s.n}</span>
                  {s.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
