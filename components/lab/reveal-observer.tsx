'use client'

/**
 * One IntersectionObserver for every `[data-reveal]` element on the page,
 * rebuilt on each route change. The hidden starting state only exists when
 * the pre-paint script has set `data-motion="full"` on the lab root, so
 * without JavaScript — or under reduced motion — everything is simply visible.
 */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-lab]')
    if (!root) return
    ;(window as Window & { __labReveal?: boolean }).__labReveal = true
    if (root.dataset.motion !== 'full') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    )
    root.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
