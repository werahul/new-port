'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

interface SmoothScrollProps {
  children: React.ReactNode
}

let lenisInstance: Lenis | null = null

/** Access the active Lenis instance (null when reduced-motion or not mounted). */
export function getLenis() {
  return lenisInstance
}

/** Smoothly scroll to an element id, falling back to native behaviour. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.1 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    // Lenis runs its own requestAnimationFrame loop; nothing else needs to
    // share a ticker with it.
    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.1,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      touchMultiplier: 1.6,
      infinite: false,
      autoRaf: true,
    })
    lenisInstance = lenis

    return () => {
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
