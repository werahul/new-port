'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { loadGsap, queueRefresh } from '@/lib/animation/gsap'

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

    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.1,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      touchMultiplier: 1.6,
      infinite: false,
    })
    lenisInstance = lenis

    // Drive Lenis with a plain rAF until GSAP arrives, then hand the loop to
    // gsap.ticker and wire ScrollTrigger to Lenis' scroll events.
    let handedOff = false
    let rafId = requestAnimationFrame(function raf(time) {
      if (handedOff) return
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

    let disposed = false
    let removeTick: (() => void) | null = null
    let cancelRefresh: (() => void) | undefined

    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (disposed) return
        handedOff = true
        cancelAnimationFrame(rafId)
        lenis.on('scroll', ScrollTrigger.update)
        const onTick = (time: number) => lenis.raf(time * 1000)
        gsap.ticker.add(onTick)
        gsap.ticker.lagSmoothing(0)
        removeTick = () => {
          gsap.ticker.remove(onTick)
          // `lagSmoothing(0)` is a global mutation on the shared ticker. Leaving
          // it off after this component goes away changes the behaviour of every
          // animation that outlives it.
          gsap.ticker.lagSmoothing(500, 33)
        }
        cancelRefresh = queueRefresh(ScrollTrigger)
      })
      // GSAP never arriving is survivable — Lenis keeps its own rAF below.
      .catch(() => {})

    return () => {
      disposed = true
      handedOff = true
      cancelAnimationFrame(rafId)
      cancelRefresh?.()
      removeTick?.()
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
