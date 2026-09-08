'use client'

import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { MQ, PARALLAX_TRAVEL } from '@/lib/animation/config'

interface ParallaxProps {
  children: ReactNode
  as?: ElementType
  /** total px of travel across the scrub range; centred on the natural position */
  travel?: number
  axis?: 'y' | 'x'
  /** run on phones too (default: phones get no parallax) */
  onMobile?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Subtle scrubbed depth. The layer drifts ±travel/2 around its resting position
 * as it crosses the viewport, so it never ends up far from where it laid out.
 * Linear ease, `invalidateOnRefresh` for responsive recalculation.
 */
export function Parallax({
  children,
  as = 'div',
  travel = PARALLAX_TRAVEL.base,
  axis = 'y',
  onMobile = false,
  className,
  style,
}: ParallaxProps) {
  const ref = useGsapScope<HTMLElement>(
    ({ gsap, scope, mm }) => {
      mm.add({ reduce: MQ.reduce, mobile: MQ.mobile }, (c) => {
        const cond = c.conditions ?? {}
        if (cond.reduce) return
        if (cond.mobile && !onMobile) return

        const dist = cond.mobile ? travel * 0.5 : travel
        const tween = gsap.fromTo(
          scope,
          { [axis]: dist / 2 },
          {
            [axis]: -dist / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: scope,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
        return () => {
          tween.scrollTrigger?.kill()
          tween.kill()
        }
      })
    },
    [travel, axis, onMobile],
  )

  return createElement(
    as,
    { ref, className: cn('will-change-transform', className), style },
    children,
  )
}
