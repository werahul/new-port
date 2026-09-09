'use client'

import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { DUR, EASE, MQ, ST, STAGGER } from '@/lib/animation/config'

interface SequenceProps {
  children: ReactNode
  as?: ElementType
  /** px of rise before settling — also feeds the pre-paint CSS via --anim-y */
  distance?: number
  /** seconds between one beat and the next */
  step?: number
  duration?: number
  /** ScrollTrigger start line; defaults to the shared site reveal line */
  start?: string
  className?: string
  style?: CSSProperties
  id?: string
}

/**
 * ONE SECTION, ONE ENTRANCE, PLAYED A BEAT AT A TIME.
 *
 * Every element inside marked `data-seq` is a beat. They enter in document
 * order, one after another, with the *same* movement every time: a short rise
 * and a fade. That uniformity is the point — a section whose parts each arrive
 * differently (one blurring, one wiping out of a mask, one sliding in from the
 * side) reads as several things happening at once, which is exactly what makes
 * a page hard to actually read.
 *
 * Why `ScrollTrigger.batch` rather than a trigger per element or one timeline
 * for the whole section:
 *
 *  - a trigger per element means everything sharing a screen fires at the same
 *    instant — the thing this component exists to stop;
 *  - one timeline for the section means beats near the bottom of a tall section
 *    play while they are still hundreds of pixels below the fold.
 *
 * Batching gives the behaviour both of those miss: beats that cross the reveal
 * line together are queued and released in order, and beats further down wait
 * until they are genuinely approaching.
 *
 * Pre-paint state is CSS (`[data-anim-init='sequence'] [data-seq]`), so nothing
 * flashes before the animation chunk lands. Reduced-motion and no-JS clients
 * get the section fully rendered, unmoved.
 */
export function Sequence({
  children,
  as = 'div',
  distance = 22,
  step = STAGGER.loose,
  duration,
  start,
  className,
  style,
  id,
}: SequenceProps) {
  const ref = useGsapScope<HTMLElement>(
    ({ gsap, ScrollTrigger, scope, mm }) => {
      /** beats still waiting their turn — the attribute *is* the queue */
      const pending = () => gsap.utils.toArray<HTMLElement>('[data-seq]', scope)

      // Once nothing is left to reveal the root attribute has no work to do.
      const sweep = () => {
        if (!pending().length) scope.removeAttribute('data-anim-init')
      }

      /** reveal without animating — reduced motion, and the safety net below */
      const settle = (els: HTMLElement[]) => {
        els.forEach((el) => el.removeAttribute('data-seq'))
        gsap.set(els, { clearProps: 'opacity,transform' })
        sweep()
      }

      mm.add(
        { reduce: MQ.reduce, mobile: MQ.mobile, motionOk: MQ.motionOk },
        (c) => {
          const cond = c.conditions ?? {}
          const beats = pending()

          if (cond.reduce || !beats.length) {
            settle(beats)
            scope.removeAttribute('data-anim-init')
            return
          }

          const mobile = !!cond.mobile
          const d = distance * (mobile ? 0.6 : 1)

          /**
           * Entrance tweens are created from a ScrollTrigger callback, which
           * means `gsap.context()` never sees them — it only captures what is
           * created synchronously inside its body. Killing the triggers on
           * unmount would leave any in-flight tween running and writing inline
           * styles into a tree on its way out, so they are tracked by hand.
           */
          const live = new Set<gsap.core.Tween>()

          const play = (targets: Element[]) => {
            // A beat leaves the queue the moment it starts, so a rescue and a
            // trigger firing for the same element cannot restart each other's
            // tween. `fromTo` renders its `from` values synchronously, so the
            // inline opacity is in place before the frame the CSS stopped
            // applying in — there is no flash between the two.
            const els = (targets as HTMLElement[]).filter((el) =>
              el.hasAttribute('data-seq'),
            )
            if (!els.length) return
            els.forEach((el) => el.removeAttribute('data-seq'))

            const tween = gsap.fromTo(
              els,
              { opacity: 0, y: d },
              {
                opacity: 1,
                y: 0,
                duration: duration ?? (mobile ? DUR.sm : DUR.md),
                ease: EASE.out,
                stagger: mobile ? STAGGER.base : step,
                overwrite: 'auto',
                onComplete: () => {
                  live.delete(tween)
                  gsap.set(els, { clearProps: 'opacity,transform' })
                  sweep()
                },
              },
            )
            live.add(tween)
          }

          const batches = ScrollTrigger.batch(beats, {
            start: start ?? ST.revealStart,
            once: true,
            // Anything crossing the line within 140ms of the beat before it
            // joins that queue and takes the next place in it, instead of
            // starting a concurrent tween of its own.
            interval: 0.14,
            // A queue is a promise that every beat still gets seen. Six is
            // where that stops being true: at this step, the seventh would
            // start its rise most of a second after the scroll that summoned
            // it, by which time a reader moving at any pace is already past.
            // Past six, split the queue and let the next batch run.
            batchMax: 6,
            onEnter: play,
          })

          /**
           * Two ways a beat can end up stranded with its pre-paint styles:
           *
           *  - it is `display: none` at this breakpoint (inside `lg:hidden`,
           *    say), so it has no box, its trigger never fires, and a later
           *    resize would reveal it invisible;
           *  - the page was restored mid-document, or an in-page anchor jumped
           *    past it, so its reveal line went by before the chunk arrived.
           *
           * Visible-without-its-entrance beats invisible in both cases.
           */
          const rescue = () => {
            const waiting = pending()
            if (!waiting.length) return
            // Matches ST.revealStart. This only decides whether a beat is
            // *overdue*, so it costs nothing if a caller passed a custom start.
            const line = window.innerHeight * 0.82
            const boxless: HTMLElement[] = []
            const overdue: HTMLElement[] = []
            waiting.forEach((el) => {
              if (el.getClientRects().length === 0) boxless.push(el)
              else if (el.getBoundingClientRect().top < line) overdue.push(el)
            })
            if (boxless.length) settle(boxless)
            if (overdue.length) play(overdue)
          }
          ScrollTrigger.addEventListener('refresh', rescue)
          rescue()

          return () => {
            ScrollTrigger.removeEventListener('refresh', rescue)
            batches.forEach((t) => t.kill())
            live.forEach((t) => t.kill())
            live.clear()
          }
        },
      )
    },
    [distance, step, duration, start],
  )

  return createElement(
    as,
    {
      ref,
      id,
      'data-anim-init': 'sequence',
      className: cn(className),
      style: { '--anim-y': `${distance}px`, ...style } as CSSProperties,
    },
    children,
  )
}
