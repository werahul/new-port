import { create } from 'zustand'

/**
 * Scroll progress lives in a module-level ref, not in React state. The camera
 * needs it every frame; re-rendering the tree 60 times a second to deliver a
 * float would be indefensible.
 */
export const worldPath = { current: 0 }

/**
 * THE WORLD'S LIFECYCLE.
 *
 *   idle → probing → loading → ready
 *                        ↓        ↓
 *                     fallback ←──┘
 *
 * The important property is that `ready` is *reported by the scene* once it has
 * rendered a real frame into a canvas with a real size — it is never predicted
 * from "this device supports WebGL". The previous design flipped an `enabled`
 * flag the moment capability detection passed, which is why a chunk that never
 * arrived, or a `getContext` that failed once, left the visitor looking at six
 * screens of empty scrim with no way out but a manual refresh.
 *
 * `fallback` is a state, not a latch. Anything that can fail can be retried,
 * and a restored WebGL context returns the world to `ready`.
 */
export type WorldStatus = 'idle' | 'probing' | 'loading' | 'ready' | 'fallback'

interface WorldState {
  status: WorldStatus
  setStatus: (v: WorldStatus) => void
  /**
   * Client-side navigation does not re-evaluate this module, so a visitor
   * returning from a case study would otherwise mount with the camera still
   * parked at the end of the journey — and the hero fades its own headline out
   * anywhere past the first station. Call on mount.
   */
  reset: () => void
}

/**
 * Note what is *not* in here: the current station. Every consumer that needs it
 * derives it from `worldPath` inside its own rAF instead. Publishing it from
 * the canvas meant the value froze wherever the canvas did, and a frozen
 * station is what left the hero invisible after a scene failure.
 */
export const useWorldStore = create<WorldState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
  reset: () => {
    worldPath.current = 0
    set({ status: 'idle' })
  },
}))
