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
    <nav
      aria-label="Case study sections"
      className="min-w-0 lg:sticky lg:top-28 lg:self-start"
    >
      <div className="sticky top-[3.5rem] z-30 -mx-5 border-b border-line bg-background/85 px-5 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="type-metadata mb-3 hidden lg:block">Contents</div>
        <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-0 lg:overflow-visible">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors duration-300 ease-editorial',
                    'lg:shrink lg:rounded-none lg:border-0 lg:border-l-2 lg:px-3.5 lg:py-2 lg:text-[0.82rem]',
                    isActive
                      ? 'border-foreground/25 bg-foreground/[0.04] text-foreground lg:border-l-accent-strong lg:bg-transparent'
                      : 'border-line text-muted-foreground hover:text-foreground lg:border-l-border',
                  )}
                >
                  <span className="type-metadata text-muted-foreground">{s.n}</span>
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
