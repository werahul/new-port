import { create } from 'zustand'

/**
 * Scroll progress lives in a module-level ref, not in React state. The camera
 * needs it every frame; re-rendering the tree 60 times a second to deliver a
 * float would be indefensible.
 */
export const worldPath = { current: 0 }

interface WorldState {
  /** the 3D world is mounted and running */
  enabled: boolean
  /** nearest station index — changes a handful of times per page, so state is fine */
  station: number
  /** the establishing shot has finished and the identity can reveal */
  entered: boolean
  setEnabled: (v: boolean) => void
  setStation: (v: number) => void
  setEntered: (v: boolean) => void
}

export const useWorldStore = create<WorldState>((set) => ({
  enabled: false,
  station: 0,
  entered: false,
  setEnabled: (enabled) => set({ enabled }),
  setStation: (station) => set({ station }),
  setEntered: (entered) => set({ entered }),
}))
