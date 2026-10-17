/** What the world can do on this device, decided once on the client. */
export interface Capability {
  /** WebGL works and motion is welcome */
  ok: boolean
  /** cheaper materials, fewer instances, lower pixel ratio */
  low: boolean
  /** a mouse or trackpad — enables parallax and pointer tilt */
  fine: boolean
}

let support: Capability | null = null
const supportListeners = new Set<() => void>()

export function setSupport(c: Capability) {
  support = c
  supportListeners.forEach((l) => l())
}
export function getSupport() {
  return support
}
export function subscribeSupport(fn: () => void) {
  supportListeners.add(fn)
  return () => {
    supportListeners.delete(fn)
  }
}
