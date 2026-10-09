/**
 * Can this browser run the 3D scenes? Checked once and cached. A context that
 * fails to create (blocklisted GPU, WebGL disabled, headless) gets the static
 * SVG fallback instead of a blank box.
 */
let cached: boolean | null = null

export function hasWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}
