import type { Tier, WorldCapability } from './capability-script'

export type { Tier }

export interface QualityProfile {
  tier: Tier
  /** device pixel ratio ceiling */
  dpr: number
  /**
   * The resolution the adaptive stepper may never go below.
   *
   * Sharpness is the single biggest contributor to how expensive this world
   * looks, and it is the last thing that should be sacrificed. Shedding pixels
   * to buy frames is a trade that makes the scene look cheap long before it
   * makes it feel slow.
   */
  dprFloor: number
  antialias: boolean
  /** multiplier applied to every district's instance/particle budget */
  density: number
  /** points in the connective stream between districts */
  streamCount: number
  /** how far the camera can see before fog fully occludes */
  fogDensity: number
  /** districts further than this many units from the camera stop updating */
  cullDistance: number
  /** allow the subtle camera sway / roll */
  cameraSway: boolean
}

/**
 * The budget is spent on RESOLUTION, not on object count.
 *
 * A district drawn at full device resolution with half the instances reads as
 * precise and expensive. The same district at 1x with every instance present
 * reads as a cheap render — the linework aliases, the fine grid crawls, and the
 * particles turn to mush. So every tier now buys pixels first and geometry
 * second, and antialiasing is on wherever the device can plausibly afford it.
 */
const PROFILES: Record<Tier, Omit<QualityProfile, 'tier'>> = {
  high: {
    dpr: 2,
    dprFloor: 1.5,
    antialias: true,
    density: 0.6,
    streamCount: 900,
    fogDensity: 0.0125,
    cullDistance: 120,
    cameraSway: true,
  },
  medium: {
    dpr: 1.75,
    dprFloor: 1.25,
    antialias: true,
    density: 0.42,
    streamCount: 520,
    fogDensity: 0.016,
    cullDistance: 95,
    cameraSway: true,
  },
  low: {
    dpr: 1.5,
    dprFloor: 1,
    antialias: false,
    density: 0.26,
    streamCount: 240,
    fogDensity: 0.021,
    cullDistance: 75,
    cameraSway: false,
  },
}

export function profileFor(tier: Tier): QualityProfile {
  return { tier, ...PROFILES[tier] }
}

const FALLBACK: WorldCapability = { webgl: false, tier: 'low', reduced: false }

/**
 * What this device should be asked to render.
 *
 * The decision itself is made pre-paint by WORLD_CAPABILITY_SCRIPT, because the
 * hero's layout depends on it and a post-paint answer means a visible jump. All
 * this does is read the stamp. The re-probe below is a genuine fallback for the
 * one case the script cannot cover — it was blocked, or threw before assigning
 * — and it releases its context immediately, which the old implementation
 * never did.
 */
export function detectCapability(): WorldCapability {
  if (typeof window === 'undefined') return FALLBACK
  if (window.__worldCap) return window.__worldCap

  let webgl = false
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') ||
      c.getContext('webgl')) as WebGLRenderingContext | null
    webgl = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webgl = false
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cap: WorldCapability = {
    webgl,
    reduced,
    // No renderer string to go on here, so take the conservative tier.
    tier: webgl && window.innerWidth >= 1280 ? 'medium' : 'low',
  }
  window.__worldCap = cap
  return cap
}
