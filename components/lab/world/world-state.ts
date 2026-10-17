/**
 * The one channel between the DOM and the 3D world.
 *
 * A plain mutable object rather than React state: the scene reads it inside
 * `useFrame` sixty times a second, and routing that through React would
 * re-render the tree on every scroll tick. The DOM writes discrete facts into
 * it (anchor positions, the hovered capability, a drag on an exhibit) and the
 * scene derives everything else per frame.
 */

export interface Anchor {
  /** matches a keyframe name in keyframes.ts */
  name: string
  /** absolute document offset, clamped to the max scroll */
  top: number
}

export const world = {
  anchors: [] as Anchor[],
  /** normalised pointer, -1..1, y up */
  pointer: { x: 0, y: 0 },
  /** index into `capabilities`, -1 when none is engaged */
  capability: -1,
  /** user-applied rotation per exhibit, radians — from drag or arrow keys */
  exhibitYaw: [0, 0, 0, 0, 0] as number[],
  exhibitPitch: [0, 0, 0, 0, 0] as number[],
  /** bumped whenever anchors are re-measured, so the scene can rebuild its path */
  version: 0,
  /** the intro loader is up: fetch and upload everything now, not on arrival */
  preload: false,
}

/**
 * Continuous position along the journey: `i + f` means between anchor i and
 * anchor i+1, f of the way. Every keyframe is reached exactly when its anchor
 * element arrives at the top of the viewport.
 */
export function pathParam(scrollY: number): number {
  const a = world.anchors
  if (a.length < 2) return 0
  if (scrollY <= a[0].top) return 0
  for (let i = 0; i < a.length - 1; i++) {
    const from = a[i].top
    const to = a[i + 1].top
    if (scrollY < to) return i + (to > from ? (scrollY - from) / (to - from) : 0)
  }
  return a.length - 1
}

/**
 * Measure every `[data-anchor]` element. Called on load, on resize and when
 * the document height changes (fonts, images).
 */
export function measureAnchors(root: ParentNode = document) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-anchor]'))
  world.anchors = els.map((el) => ({
    name: el.dataset.anchor as string,
    top: Math.min(max, el.getBoundingClientRect().top + window.scrollY),
  }))
  world.version++
}
