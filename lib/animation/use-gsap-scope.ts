'use client'

import { useEffect, useRef, type DependencyList, type RefObject } from 'react'
import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import type { SplitText as SplitTextType } from 'gsap/SplitText'
import { loadDrawSVG, loadGsap, loadSplitText, queueRefresh } from './gsap'
import { prefersReducedMotion } from './reduced-motion'

/** Minimal structural type for a gsap.matchMedia() instance. */
export interface MatchMediaLike {
  add(
    query: string | Record<string, string>,
    fn: (context: {
      conditions?: Record<string, boolean>
    }) => void | (() => void),
    scope?: Element | string | object,
  ): MatchMediaLike
  revert(): void
}

export interface GsapScopeApi {
  gsap: typeof GsapType
  ScrollTrigger: typeof ScrollTriggerType
  SplitText?: typeof SplitTextType
  /** the scope element — guaranteed present while setup runs */
  scope: HTMLElement
  /** shared gsap.matchMedia() — hang responsive / reduced-motion branches here */
  mm: MatchMediaLike
  /** true when the user asked for reduced motion */
  reduced: boolean
  /** register imperative teardown (listeners, observers) run before revert */
  onCleanup: (fn: () => void) => void
}

type SetupFn = (api: GsapScopeApi) => void

interface Options {
  /** load SplitText alongside the core bundle before running setup */
  splitText?: boolean
  /** load DrawSVGPlugin alongside the core bundle before running setup */
  drawSVG?: boolean
  /** don't run this render (e.g. a prop turned the animation off) */
  disabled?: boolean
}

/**
 * The one entry point every scroll animation goes through.
 *
 * - lazy-loads GSAP (+ optional plugins) so nothing ships in the initial bundle
 * - wraps `setup` in `gsap.context()` scoped to the returned ref, so every
 *   tween / ScrollTrigger / SplitText created inside is reverted together
 * - creates one `gsap.matchMedia()` per scope for responsive + reduced-motion
 *   branching, reverted with the context
 * - is React-Strict-Mode safe: the cancelled flag + context revert on the first
 *   (throwaway) mount means the second mount starts from a clean slate and no
 *   animation is ever created twice
 * - carries a pure-DOM fail-safe: if the animation chunk never loads, anything
 *   hidden via `[data-anim-init]` is force-shown after 4s
 */
export function useGsapScope<T extends HTMLElement = HTMLDivElement>(
  setup: SetupFn,
  deps: DependencyList = [],
  options: Options = {},
): RefObject<T> {
  const ref = useRef<T>(null)
  const setupRef = useRef(setup)
  setupRef.current = setup

  const { splitText = false, drawSVG = false, disabled = false } = options

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    let cancelled = false
    let ctx: { revert: () => void } | undefined
    const cleanups: Array<() => void> = []

    const revealAll = () => {
      el.querySelectorAll('[data-anim-init]').forEach((n) =>
        n.removeAttribute('data-anim-init'),
      )
      el.removeAttribute('data-anim-init')
    }
    const failSafe = window.setTimeout(() => {
      if (!cancelled && !ctx) revealAll()
    }, 4000)

    const loader = drawSVG
      ? loadDrawSVG()
      : splitText
        ? loadSplitText()
        : loadGsap()

    loader
      .then((bundle) => {
        if (cancelled || !ref.current) return
        window.clearTimeout(failSafe)
        const { gsap, ScrollTrigger } = bundle
        ctx = gsap.context(() => {
          const mm = gsap.matchMedia() as unknown as MatchMediaLike
          setupRef.current({
            gsap,
            ScrollTrigger,
            SplitText: (bundle as { SplitText?: typeof SplitTextType }).SplitText,
            scope: ref.current as HTMLElement,
            mm,
            reduced: prefersReducedMotion(),
            onCleanup: (fn) => cleanups.push(fn),
          })
        }, ref)
        queueRefresh(ScrollTrigger)
      })
      .catch(() => {
        window.clearTimeout(failSafe)
        revealAll()
      })

    return () => {
      cancelled = true
      window.clearTimeout(failSafe)
      cleanups.forEach((fn) => {
        try {
          fn()
        } catch {
          /* noop */
        }
      })
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
