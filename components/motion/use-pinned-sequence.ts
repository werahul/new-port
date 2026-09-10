'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import { getLenis } from '@/components/ui/smooth-scroll'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { MQ } from '@/lib/animation/config'

type ScrollTriggerInstance = InstanceType<typeof ScrollTriggerType>

/**
 * How long a click- or key-driven jump mutes scroll updates before giving up.
 * A jump that never lands where it was aimed — interrupted by a wheel gesture
 * halfway there — must not leave the sequence deaf to scrolling for good.
 */
const JUMP_RELEASE_MS = 1400

/**
 * Breathing room, in px, required above *and* below the stage before it may pin.
 *
 * A pin holds the stage still, so anything hanging past the fold can never be
 * scrolled to — the scroll that would normally get you there is busy driving
 * the sequence. The stage therefore has to be comfortably shorter than the
 * viewport, and this is what "comfortably" is worth.
 */
const FIT_MARGIN = 24

interface PinnedSequenceOptions {
  /** how many steps the pinned range is divided into */
  count: number
  /** called when the scroll moves onto a new step */
  onIndex: (index: number) => void
  /** scroll each step owns, as a share of the viewport height */
  scrollPerStep?: number
  /**
   * An *extra* hard floor on viewport height, as a media query. Off by default:
   * whether the stage fits is measured, which is strictly better than any
   * number guessed here. Reach for this only to hold a pin back for some
   * reason other than fit.
   */
  minHeight?: string
  /** viewport the pin is allowed in (default: desktop) */
  viewport?: string
}

interface PinnedSequence<T extends HTMLElement> {
  /** attach to the element that should hold still */
  ref: RefObject<T>
  /** move the page onto a step; a no-op when the sequence is not pinned */
  goTo: (index: number) => void
  /** true while the pin is live and the scroll is actually driving the steps */
  pinned: boolean
}

/**
 * A STAGE THAT HOLDS STILL WHILE THE PAGE SCROLLS THROUGH IT.
 *
 * The referenced element pins in the viewport, and the scroll travel it holds
 * for is divided into `count` equal slices — each one selecting a step through
 * `onIndex` — before the section releases and the page carries on.
 *
 * The one rule that makes this work, and the reason a caller cannot just set
 * its own state: **while pinned, scroll position is the source of truth.** A
 * click that only sets state gets snapped straight back by the next scroll
 * tick, so a click has to be a scroll — `goTo` moves the page to the middle of
 * that step's slice and lets `onIndex` do the selecting. Scroll updates are
 * muted until the page arrives, so jumping from the first step to the last does
 * not riffle through everything in between.
 *
 * Not every visitor gets this. Under reduced motion, on a narrow viewport, or
 * on a screen too short to hold the stage, no pin is created at all and `pinned`
 * stays false — the caller is expected to keep working as a plain control there.
 */
export function usePinnedSequence<T extends HTMLElement = HTMLDivElement>({
  count,
  onIndex,
  scrollPerStep = 0.55,
  minHeight,
  viewport = MQ.desktop,
}: PinnedSequenceOptions): PinnedSequence<T> {
  const [pinned, setPinned] = useState(false)

  const triggerRef = useRef<ScrollTriggerInstance | null>(null)
  const indexRef = useRef(0)
  const jumpToRef = useRef<number | null>(null)
  const jumpTimerRef = useRef(0)

  // The trigger is built once; neither of these may be a stale closure.
  const onIndexRef = useRef(onIndex)
  onIndexRef.current = onIndex
  const countRef = useRef(count)
  countRef.current = count

  const ref = useGsapScope<T>(
    ({ ScrollTrigger, scope, mm }) => {
      const conditions: Record<string, string> = { reduce: MQ.reduce, viewport }
      if (minHeight) conditions.tall = minHeight

      mm.add(
        conditions,
        (c) => {
          const cond = c.conditions ?? {}
          if (cond.reduce || !cond.viewport) return
          if (minHeight && !cond.tall) return

          /**
           * Does the stage fit on screen with room to spare?
           *
           * Measured, never guessed. This used to be a fixed
           * `(min-height: 680px)` media query, and a fixed number is wrong in
           * both directions: it withheld the pin from laptops whose stage fits
           * easily — a 1440x900 screen browses at roughly 647px of viewport
           * once the browser's own chrome is taken out, comfortably under that
           * floor while the stage itself is only ~520px — and it would equally
           * have waved through a viewport that cleared 680px carrying a stage
           * taller than that. The element's own height is the only honest
           * input.
           */
          const fits = () =>
            scope.offsetHeight + FIT_MARGIN * 2 <= window.innerHeight

          const trigger = ScrollTrigger.create({
            trigger: scope,
            // Centred when the stage fits the viewport, flush to the top when
            // it does not — a stage taller than the screen must not end up
            // with its own header pinned off the top of it.
            start: () =>
              'top ' +
              Math.max(
                16,
                Math.round((window.innerHeight - scope.offsetHeight) / 2),
              ) +
              'px',
            end: () =>
              '+=' +
              Math.round(window.innerHeight * scrollPerStep * countRef.current),
            pin: scope,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // The pin puts its spacer in the document and moves everything
            // below it, so it has to be measured before those triggers are.
            refreshPriority: 1,
            onUpdate: (self) => {
              const n = countRef.current
              const i = Math.min(n - 1, Math.max(0, Math.floor(self.progress * n)))
              if (jumpToRef.current !== null) {
                // Still travelling to a chosen step — say nothing until the
                // page is actually there.
                if (i !== jumpToRef.current) return
                jumpToRef.current = null
              }
              if (i === indexRef.current) return
              indexRef.current = i
              onIndexRef.current(i)
            },
          })
          let live = fits()
          triggerRef.current = live ? trigger : null
          if (!live) trigger.disable(true)
          setPinned(live)

          /**
           * `fits()` is not settled for the life of the page: a resize, a
           * browser zoom, a late-loading font and a longer panel all move the
           * answer. Every one of those already ends in a ScrollTrigger
           * refresh, so that is where it gets re-checked.
           *
           * Deferred a frame because `enable()` itself refreshes — toggling
           * straight from inside the refresh that called us would re-enter it.
           */
          let frame = 0
          const syncFit = () => {
            if (frame) return
            frame = requestAnimationFrame(() => {
              frame = 0
              const ok = fits()
              if (ok === live) return
              live = ok
              if (ok) trigger.enable()
              else trigger.disable(true)
              triggerRef.current = ok ? trigger : null
              setPinned(ok)
            })
          }
          ScrollTrigger.addEventListener('refresh', syncFit)

          return () => {
            if (frame) cancelAnimationFrame(frame)
            ScrollTrigger.removeEventListener('refresh', syncFit)
            triggerRef.current = null
            setPinned(false)
            trigger.kill()
          }
        },
      )
    },
    [scrollPerStep, minHeight, viewport],
  )

  const goTo = useCallback((index: number) => {
    const trigger = triggerRef.current
    if (!trigger) return

    indexRef.current = index
    jumpToRef.current = index

    const span = trigger.end - trigger.start
    const target = trigger.start + ((index + 0.5) / countRef.current) * span
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target, { duration: 0.7 })
    else window.scrollTo({ top: target, behavior: 'smooth' })

    window.clearTimeout(jumpTimerRef.current)
    jumpTimerRef.current = window.setTimeout(() => {
      jumpToRef.current = null
    }, JUMP_RELEASE_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(jumpTimerRef.current), [])

  return { ref, goTo, pinned }
}
