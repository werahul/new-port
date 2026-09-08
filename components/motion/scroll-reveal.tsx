'use client'

import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { DUR, EASE, MQ, ST, STAGGER } from '@/lib/animation/config'

export type RevealVariant =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-right'
  | 'fade-left'
  | 'scale'
  | 'clip-up'
  | 'blur'

interface ScrollRevealProps {
  children: ReactNode
  as?: ElementType
  variant?: RevealVariant
  /** animate the element's direct children in sequence instead of the element */
  stagger?: boolean | number
  /** px of travel; also feeds the pre-paint CSS via --anim-y / --anim-x */
  distance?: number
  delay?: number
  duration?: number
  /** ScrollTrigger start position; defaults to the shared site reveal line */
  start?: string
  /** re-hide + replay when scrolled back past (default: play once) */
  replay?: boolean
  className?: string
  style?: CSSProperties
  id?: string
}

function variantVars(
  v: RevealVariant,
  d: number,
): { from: gsap.TweenVars; to: gsap.TweenVars } {
  switch (v) {
    case 'fade':
      return { from: { opacity: 0 }, to: { opacity: 1 } }
    case 'fade-up':
      return { from: { opacity: 0, y: d }, to: { opacity: 1, y: 0 } }
    case 'fade-down':
      return { from: { opacity: 0, y: -d }, to: { opacity: 1, y: 0 } }
    case 'fade-right':
      return { from: { opacity: 0, x: -d }, to: { opacity: 1, x: 0 } }
    case 'fade-left':
      return { from: { opacity: 0, x: d }, to: { opacity: 1, x: 0 } }
    case 'scale':
      return { from: { opacity: 0, scale: 0.955 }, to: { opacity: 1, scale: 1 } }
    case 'blur':
      return {
        from: { opacity: 0, filter: 'blur(12px)' },
        to: { opacity: 1, filter: 'blur(0px)' },
      }
    case 'clip-up':
      return {
        from: { opacity: 1, y: d, clipPath: 'inset(100% 0 0 0)' },
        to: { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' },
      }
  }
}

/**
 * The workhorse scroll reveal. Fade / slide / scale / clip-path / blur, with an
 * optional child stagger. Pre-paint state is CSS (`[data-anim-init]`), so there
 * is no flash before the animation chunk arrives; reduced-motion and no-JS
 * clients render it fully visible.
 */
export function ScrollReveal({
  children,
  as = 'div',
  variant = 'fade-up',
  stagger = false,
  distance,
  delay = 0,
  duration,
  start,
  replay = false,
  className,
  style,
  id,
}: ScrollRevealProps) {
  const baseDistance = distance ?? (variant === 'clip-up' ? 24 : 28)

  const ref = useGsapScope<HTMLElement>(
    ({ gsap, scope, mm }) => {
      const strip = () => {
        scope.removeAttribute('data-anim-init')
      }

      mm.add(
        { reduce: MQ.reduce, mobile: MQ.mobile, motionOk: MQ.motionOk },
        (c) => {
          const cond = c.conditions ?? {}
          const targets: HTMLElement[] = stagger
            ? (gsap.utils.toArray(scope.children) as HTMLElement[])
            : [scope]

          if (cond.reduce || !targets.length) {
            gsap.set(targets, {
              clearProps: 'opacity,transform,filter,clipPath',
            })
            strip()
            return
          }

          const mobile = !!cond.mobile
          const d = baseDistance * (mobile ? 0.62 : 1)
          const { from, to } = variantVars(variant, d)
          const step =
            stagger === true ? STAGGER.base : typeof stagger === 'number' ? stagger : 0

          const tween = gsap.fromTo(targets, from, {
            ...to,
            duration: duration ?? (mobile ? DUR.sm : DUR.md),
            ease: EASE.out,
            delay,
            stagger: mobile ? Math.min(step, STAGGER.tight) : step,
            scrollTrigger: {
              trigger: scope,
              start: start ?? ST.revealStart,
              toggleActions: replay
                ? 'play none none reverse'
                : 'play none none none',
              once: !replay,
            },
            onComplete: strip,
          })

          return () => {
            tween.scrollTrigger?.kill()
            tween.kill()
          }
        },
      )
    },
    [variant, stagger, baseDistance, delay, duration, start, replay],
  )

  const initAttr = stagger ? 'stagger' : variant
  const cssVars = {
    '--anim-y': `${baseDistance}px`,
    // fade-right starts to the left, so its offset is negative
    '--anim-x': variant === 'fade-right' ? `-${baseDistance}px` : `${baseDistance}px`,
  } as CSSProperties

  return createElement(
    as,
    {
      ref,
      id,
      'data-anim-init': initAttr,
      className: cn(className),
      style: { ...cssVars, ...style },
    },
    children,
  )
}
