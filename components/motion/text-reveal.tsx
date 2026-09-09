'use client'

import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { queueRefresh } from '@/lib/animation/gsap'
import { DUR, EASE, MQ, ST, STAGGER } from '@/lib/animation/config'

type SplitUnit = 'lines' | 'words' | 'chars'

interface TextRevealProps {
  children: ReactNode
  as?: ElementType
  /** which units slide in (default: lines) */
  split?: SplitUnit
  /** clip each unit so it rises out of a mask (default: true) */
  mask?: boolean
  /** 'scroll' waits for the element to enter; 'mount' plays on load */
  trigger?: 'scroll' | 'mount'
  delay?: number
  duration?: number
  stagger?: number
  start?: string
  className?: string
  style?: CSSProperties
  id?: string
}

/**
 * Masked line / word / char reveal built on GSAP SplitText. The element renders
 * as normal semantic markup (SplitText restores `aria`), is hidden pre-paint by
 * CSS, and animates once after fonts settle. Reduced-motion / no-JS: plain text.
 */
export function TextReveal({
  children,
  as = 'p',
  split = 'lines',
  mask = true,
  trigger = 'scroll',
  delay = 0,
  duration,
  stagger,
  start,
  className,
  style,
  id,
}: TextRevealProps) {
  const ref = useGsapScope<HTMLElement>(
    ({ gsap, scope, mm, SplitText, ScrollTrigger }) => {
      const reveal = () => {
        gsap.set(scope, { opacity: 1 })
        scope.removeAttribute('data-anim-init')
      }
      if (!SplitText) {
        reveal()
        return
      }

      mm.add({ reduce: MQ.reduce, mobile: MQ.mobile, motionOk: MQ.motionOk }, (c) => {
        const cond = c.conditions ?? {}
        if (cond.reduce) {
          reveal()
          return
        }
        const mobile = !!cond.mobile

        let instance: InstanceType<typeof SplitText> | null = null
        let tween: gsap.core.Tween | null = null
        let killed = false

        const build = () => {
          if (killed || !scope.isConnected) return
          instance = new SplitText(scope, {
            type: split,
            mask: mask ? split : undefined,
            linesClass: 'tr-line',
            aria: 'auto',
          })
          const units =
            split === 'chars'
              ? instance.chars
              : split === 'words'
                ? instance.words
                : instance.lines
          reveal()
          tween = gsap.from(units, {
            yPercent: mask ? 116 : 0,
            y: mask ? 0 : mobile ? 20 : 30,
            opacity: mask ? 1 : 0,
            duration: duration ?? (mobile ? DUR.sm : DUR.md),
            ease: EASE.out,
            delay,
            stagger:
              stagger ??
              (split === 'chars' || mobile ? STAGGER.tight : STAGGER.base),
            scrollTrigger:
              trigger === 'mount'
                ? undefined
                : { trigger: scope, start: start ?? ST.revealStart, once: true },
          })
          // Every SectionHeading, every CaseStudySection and the footer email
          // renders one of these, and `document.fonts.ready` resolves for all of
          // them at once — so a direct `refresh()` here meant a dozen full,
          // synchronous re-measures of the whole page in a single frame.
          queueRefresh(ScrollTrigger)
        }

        if (
          typeof document !== 'undefined' &&
          document.fonts &&
          document.fonts.status !== 'loaded'
        ) {
          document.fonts.ready.then(build).catch(build)
        } else {
          build()
        }

        return () => {
          killed = true
          tween?.scrollTrigger?.kill()
          tween?.kill()
          instance?.revert()
        }
      })
    },
    [split, mask, trigger, delay, duration, stagger, start],
    { splitText: true },
  )

  return createElement(
    as,
    { ref, id, 'data-anim-init': 'text', className: cn(className), style },
    children,
  )
}
