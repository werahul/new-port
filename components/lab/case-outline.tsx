'use client'

/**
 * A case study's outline: a sticky column on
 * wide screens, a sticky row of chips under the nav on narrow ones. Scroll
 * spy via IntersectionObserver; the links are real anchors, upgraded to a
 * Lenis glide on a plain click.
 */
import { useEffect, useRef, useState } from 'react'
import { scrollToId } from '@/components/ui/smooth-scroll'

export interface OutlineItem {
  id: string
  n: string
  label: string
}

export function CaseOutline({ items }: { items: OutlineItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const list = useRef<HTMLUListElement>(null)

  // narrow screens: the chip row follows along, so the current part stays in view
  useEffect(() => {
    const ul = list.current
    const a = ul?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!ul || !a || ul.scrollWidth <= ul.clientWidth) return
    ul.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const els = items.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.5, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    setActive(id)
    scrollToId(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label="Case study sections" className="l-outline">
      <div className="l-outline-card">
        <p className="l-outline-t">On this page</p>
        <ul ref={list}>
          {items.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={(e) => go(e, s.id)} aria-current={active === s.id ? 'true' : undefined}>
                <span className="l-outline-n">{s.n}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
