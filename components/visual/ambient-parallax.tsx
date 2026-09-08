'use client'

import { useEffect } from 'react'
import { loadGsap } from '@/lib/animation/gsap'
import { MQ } from '@/lib/animation/config'

/**
 * Drifts the fixed background light-pools against overall page scroll so the
 * layered backdrop gains a little depth. Because the targets are `position:
 * fixed`, this is driven by document scroll progress rather than a per-element
 * ScrollTrigger. Desktop + motion only.
 */
export function AmbientParallax() {
  useEffect(() => {
    let ctx: { revert: () => void } | undefined
    let cancelled = false

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia()
        mm.add(
          { ok: MQ.motionOk, desktop: MQ.desktop },
          (c) => {
            if (!c.conditions?.ok || !c.conditions?.desktop) return
            const a = document.getElementById('bg-pool-a')
            const b = document.getElementById('bg-pool-b')
            if (!a && !b) return
            const trig = {
              trigger: document.documentElement,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.2,
            }
            if (a)
              gsap.to(a, { yPercent: 26, xPercent: -6, ease: 'none', scrollTrigger: trig })
            if (b)
              gsap.to(b, { yPercent: -22, xPercent: 8, ease: 'none', scrollTrigger: trig })
          },
        )
      })
      ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])

  return null
}
