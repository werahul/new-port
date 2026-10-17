/**
 * The world's layout and the camera's journey through it.
 *
 * Coordinates: y is up, the journey runs toward -z. A pearl "core" waits at
 * the origin; the capability planets orbit further on; then a sky gallery of
 * floating exhibits, four portal rings, and a sunset at the end.
 *
 * Each keyframe is keyed by the `data-anchor` name of a DOM element. When that
 * element reaches the top of the viewport the world is exactly in this state;
 * between anchors everything interpolates.
 */

export type V3 = [number, number, number]

export interface Keyframe {
  cam: V3
  look: V3
  /** where the core floats — it travels with the visitor as a guide */
  core: V3
  coreScale: number
  /** how alive the core's surface is, 0 calm … 1 turbulent */
  morph: number
  /** radius the core orbits its keyframe position at, 0 for none */
  orbit: number
  /** wide screens: horizontal subject placement, -1 left … 1 right */
  frame: number
  /** narrow screens: vertical subject placement, 0 centre … 1 up */
  frameUp: number
  /** position along the sky palette (see SKY in environment.tsx) */
  sky: number
  /** how strongly the planets answer the capability tabs */
  cluster: number
  /**
   * portrait screens: how much of the narrow-screen dolly-back to apply.
   * Near 0 inside the ring tunnel, where backing up would put a ring in the lens.
   */
  dolly: number
}

const base: Omit<Keyframe, 'cam' | 'look' | 'core'> = {
  coreScale: 1,
  morph: 0.35,
  orbit: 0,
  frame: 0,
  frameUp: 0.35,
  sky: 0,
  cluster: 0,
  dolly: 1,
}

const k = (p: Partial<Keyframe> & Pick<Keyframe, 'cam' | 'look' | 'core'>): Keyframe => ({
  ...base,
  ...p,
})

/* ---- layout -------------------------------------------------------------- */

export const CORE_HOME: V3 = [0, 1.6, 0]

/** the capability planets orbit the core here */
export const PLANETS_CENTER: V3 = [0, 2.2, -14]
export const PLANET_RING = 2.6

/** the platform model of the Jasper Colin CRM — exhibit 2 */
export const ARCH_POS: V3 = [2.5, 0.4, -60]

/** device exhibits; the gallery alternates sides so the path weaves between them */
export const SCREENS = [
  { exhibit: 0, pos: [3, 2.4, -34] as V3, rotY: -0.36, width: 4.4 },
  { exhibit: 1, pos: [-3, 2.4, -46] as V3, rotY: 0.4, width: 3.8 },
  { exhibit: 3, pos: [-3, 2.4, -78] as V3, rotY: 0.36, width: 4.8 },
  { exhibit: 4, pos: [3, 2.5, -90] as V3, rotY: -0.3, width: 3.5 },
]

export const RINGS_Z = [-118, -130, -142, -154]
export const RING_Y = 2.4
export const RING_RADIUS = 2.3

export const FINALE: V3 = [0, 2.6, -180]

/** the blueprint grid everything floats above */
export const FLOOR_Y = -1.2

/** every focal subject, so the floating field keeps clear of them */
export const SUBJECTS: { at: V3; clear: number }[] = [
  { at: CORE_HOME, clear: 3.4 },
  { at: PLANETS_CENTER, clear: 4.6 },
  { at: [ARCH_POS[0], 1.6, ARCH_POS[2]], clear: 5.2 },
  ...SCREENS.map((s) => ({ at: s.pos, clear: 4.2 })),
  ...RINGS_Z.map((z) => ({ at: [0, RING_Y, z] as V3, clear: 3.4 })),
  { at: FINALE, clear: 3.6 },
]

/* ---- journey ------------------------------------------------------------- */

export const keyframes: Record<string, Keyframe> = {
  top: k({
    cam: [0, 1.7, 8.6],
    look: CORE_HOME,
    core: CORE_HOME,
    morph: 0.35,
    frame: 1.15,
    // phones: the pearl rides high, above the headline block, never behind it
    frameUp: 1.85,
    sky: 0,
  }),
  about: k({
    cam: [5.4, 2.7, 6.2],
    look: CORE_HOME,
    core: CORE_HOME,
    coreScale: 1.06,
    morph: 0.55,
    frame: -0.95,
    frameUp: 0.5,
    sky: 1,
  }),
  capabilities: k({
    cam: [0, 4.9, -1.8],
    look: [0, 2, -14],
    core: PLANETS_CENTER,
    coreScale: 0.72,
    morph: 0.55,
    cluster: 1,
    frame: 1.2,
    frameUp: 0.45,
    sky: 2,
  }),
  work: k({
    cam: [0, 3.4, -20],
    look: [1, 2, -34],
    core: [-3.5, 4.4, -30],
    coreScale: 0.42,
    morph: 0.3,
    sky: 3,
  }),
  // Holidays Journey — device on the right, seen from the left
  'project-0': k({
    cam: [-3.72, 3.24, -25.12],
    look: [3, 2.3, -34],
    core: [-1.6, 5.1, -34],
    coreScale: 0.32,
    frame: 0.85,
    frameUp: 0.5,
    sky: 3,
  }),
  // Rush — device on the left, seen from the right
  'project-1': k({
    cam: [3.72, 3, -36.88],
    look: [-3, 2.3, -46],
    core: [-0.5, 5.2, -44],
    coreScale: 0.32,
    frame: 0.85,
    frameUp: 0.5,
    sky: 3.2,
  }),
  // Affiliate platform — the architecture model, from above and to the right
  'project-2': k({
    cam: [10.6, 5.6, -50.4],
    look: [2.5, 1.6, -60],
    core: [-4.5, 4.6, -70],
    coreScale: 0.4,
    frame: 0.85,
    frameUp: 0.5,
    sky: 3.4,
  }),
  // Twinkle portfolio — the core circles the device; the path stays right of the model
  'project-3': k({
    cam: [3.4, 3.1, -67.6],
    look: [-3, 2.3, -78],
    core: [-3, 2.6, -78],
    coreScale: 0.42,
    orbit: 2.2,
    frame: 0.85,
    frameUp: 0.5,
    sky: 3.6,
  }),
  // Task & Time Tracker — device on the right, seen from the left
  'project-4': k({
    cam: [-3.72, 3.34, -81.12],
    look: [3, 2.4, -90],
    core: [-1.6, 5.2, -90],
    coreScale: 0.32,
    frame: 0.85,
    frameUp: 0.5,
    sky: 3.8,
  }),
  also: k({
    cam: [0, 6.4, -96],
    look: [0, 2.6, -118],
    core: [4.4, 2.8, -114],
    coreScale: 0.42,
    frameUp: 0.2,
    sky: 4,
  }),
  approach: k({
    cam: [0, 2.8, -106],
    look: [0, RING_Y, -118],
    core: [0, 2.4, -168],
    coreScale: 0.55,
    frame: 0.6,
    sky: 4,
  }),
  'principle-0': k({
    cam: [0.6, RING_Y, -110],
    look: [0, RING_Y, -118],
    core: [0, 2.4, -168],
    coreScale: 0.55,
    frame: 0.95,
    frameUp: 0.45,
    dolly: 0.1,
    sky: 4.2,
  }),
  'principle-1': k({
    cam: [-0.6, RING_Y, -122],
    look: [0, RING_Y, -130],
    core: [0, 2.4, -170],
    coreScale: 0.6,
    frame: 0.95,
    frameUp: 0.45,
    dolly: 0.1,
    sky: 4.4,
  }),
  'principle-2': k({
    cam: [0.6, RING_Y, -134],
    look: [0, RING_Y, -142],
    core: [0, 2.5, -174],
    coreScale: 0.75,
    frame: 0.95,
    frameUp: 0.45,
    dolly: 0.1,
    sky: 4.6,
  }),
  'principle-3': k({
    cam: [-0.6, RING_Y, -146],
    look: [0, RING_Y, -154],
    core: [0, 2.6, -178],
    coreScale: 0.95,
    frame: 0.95,
    frameUp: 0.45,
    dolly: 0.1,
    sky: 4.8,
  }),
  contact: k({
    cam: [0, 2, -168],
    // looking a little above the pearl seats it low, between the title and the cards
    look: [0, 3.55, -180],
    core: FINALE,
    coreScale: 0.95,
    morph: 0.6,
    // phones: up into the gap between the title and the cards
    frameUp: 0.75,
    sky: 5,
    // backing up further would put the last ring (z -154) back in the lens
    dolly: 0.45,
  }),
}

/** The anchors in page order — used to plan the floating field around the path. */
export const ANCHOR_ORDER = [
  'top',
  'about',
  'capabilities',
  'work',
  'project-0',
  'project-1',
  'project-2',
  'project-3',
  'project-4',
  'also',
  'approach',
  'principle-0',
  'principle-1',
  'principle-2',
  'principle-3',
  'contact',
]
