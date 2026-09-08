export type Tier = 'high' | 'medium' | 'low'

export interface QualityProfile {
  tier: Tier
  /** device pixel ratio ceiling */
  dpr: number
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

const PROFILES: Record<Tier, Omit<QualityProfile, 'tier'>> = {
  high: {
    dpr: 1.75,
    antialias: true,
    density: 1,
    streamCount: 1400,
    fogDensity: 0.0125,
    cullDistance: 120,
    cameraSway: true,
  },
  medium: {
    dpr: 1.5,
    antialias: false,
    density: 0.55,
    streamCount: 650,
    fogDensity: 0.016,
    cullDistance: 90,
    cameraSway: true,
  },
  low: {
    dpr: 1.25,
    antialias: false,
    density: 0.3,
    streamCount: 260,
    fogDensity: 0.021,
    cullDistance: 70,
    cameraSway: false,
  },
}

export function profileFor(tier: Tier): QualityProfile {
  return { tier, ...PROFILES[tier] }
}

export interface Capability {
  webgl: boolean
  tier: Tier
}

/**
 * Decide what this device should be asked to render, before anything is
 * imported. Errs downward: a phone that could have handled `medium` losing a
 * few particles costs nothing, a laptop dropping frames costs the whole
 * impression.
 */
export function detectCapability(): Capability {
  if (typeof window === 'undefined') return { webgl: false, tier: 'low' }

  let webgl = false
  let renderer = ''
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') ||
      c.getContext('webgl')) as WebGLRenderingContext | null
    webgl = !!gl
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      if (dbg) renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
    }
  } catch {
    webgl = false
  }
  if (!webgl) return { webgl: false, tier: 'low' }

  const cores = navigator.hardwareConcurrency || 4
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const w = window.innerWidth
  const software = /swiftshader|llvmpipe|software/i.test(renderer)

  if (software || cores <= 2 || (mem !== undefined && mem <= 2)) {
    return { webgl: true, tier: 'low' }
  }
  // Phones and small tablets get the simplified world, never a shrunk desktop one.
  if (coarse || w < 900) return { webgl: true, tier: 'low' }
  if (w < 1280 || cores <= 4 || (mem !== undefined && mem <= 4)) {
    return { webgl: true, tier: 'medium' }
  }
  return { webgl: true, tier: 'high' }
}
