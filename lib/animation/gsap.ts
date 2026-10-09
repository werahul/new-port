import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export interface GsapBundle {
  gsap: typeof GsapType
  ScrollTrigger: typeof ScrollTriggerType
}

let core: Promise<GsapBundle> | null = null

/**
 * Load GSAP + ScrollTrigger on demand, register the plugin once, and cache the
 * promise so every caller shares one async chunk. Keeps ~40 KB of animation code
 * out of the initial bundle — it only arrives when something animates.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!core) {
    core = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([gsapMod, stMod]) => {
        const { gsap } = gsapMod
        const { ScrollTrigger } = stMod
        gsap.registerPlugin(ScrollTrigger)
        // One set of defaults for every ScrollTrigger created site-wide.
        ScrollTrigger.config({ ignoreMobileResize: true })
        return { gsap, ScrollTrigger }
      },
    )
  }
  return core
}

let refreshFrame = 0

/**
 * Coalesce the ScrollTrigger.refresh() calls that fire as many animation scopes
 * mount at once on load into a single refresh on the next frame.
 *
 * A full `refresh()` is synchronous and re-measures every trigger on the page,
 * so firing one per caller would stall the page on load.
 *
 * Returns a canceller. Callers that can be torn down before the frame arrives
 * should use it: a refresh firing into a half-unmounted tree measures elements
 * that are on their way out.
 */
export function queueRefresh(ScrollTrigger: typeof ScrollTriggerType) {
  if (refreshFrame) cancelAnimationFrame(refreshFrame)
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0
      ScrollTrigger.refresh()
    })
  })
  return () => {
    if (refreshFrame) {
      cancelAnimationFrame(refreshFrame)
      refreshFrame = 0
    }
  }
}
