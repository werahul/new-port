/**
 * THE WORLD — nine locations inside one continuous environment.
 *
 * This is the single source of truth shared by the 3D scene, the hero's
 * caption choreography and the station rail. Each station owns a position in
 * world space, an accent hue from the design system, and the copy that appears
 * when the camera arrives.
 *
 * `anchor` names the DOM element whose scroll position pins this station.
 * Stations with the same anchor are distributed across that element's scroll
 * range in order — that is how the tall hero holds six stations while the
 * later sections hold one each.
 */
export type StationId =
  | 'entry'
  | 'frontend'
  | 'backend'
  | 'data'
  | 'ai'
  | 'cloud'
  | 'projects'
  | 'experience'
  | 'contact'

export type DistrictKind =
  | 'gateway'
  | 'surfaces'
  | 'pipelines'
  | 'strata'
  | 'lattice'
  | 'regions'
  | 'monoliths'
  | 'ascent'
  | 'convergence'

export interface Station {
  id: StationId
  index: string
  label: string
  /** short technical line — TECHNOLOGY tier */
  stack: string
  /** one confident sentence about the work at this location */
  note: string
  accent: 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink'
  /** which district geometry represents this location */
  kind: DistrictKind
  /** id of the DOM section that pins this station to the scroll */
  anchor: string
  /** station centre in world space */
  position: [number, number, number]
  /** where the camera sits relative to the station centre */
  camera: [number, number, number]
}

export const stations: Station[] = [
  {
    id: 'entry',
    index: '01',
    label: 'Entry',
    stack: 'The way in',
    note: 'Every product starts as an empty space and a decision about what belongs in it.',
    accent: 'violet',
    kind: 'gateway',
    anchor: 'home',
    position: [0, 4, 42],
    camera: [0, 6, 66],
  },
  {
    id: 'frontend',
    index: '02',
    label: 'Frontend',
    stack: 'React · Next.js · TypeScript',
    note: 'Interface surfaces that stay calm under real data — composed, responsive, and consistent across every viewport.',
    accent: 'cobalt',
    kind: 'surfaces',
    anchor: 'home',
    position: [-15, 1, 12],
    camera: [-6, 3, 32],
  },
  {
    id: 'backend',
    index: '03',
    label: 'Backend',
    stack: 'Node · APIs · Services',
    note: 'Requests become contracts. Services stay small, boundaries stay honest, and traffic keeps moving.',
    accent: 'coral',
    kind: 'pipelines',
    anchor: 'home',
    position: [13, -4, -18],
    camera: [2, -1, 2],
  },
  {
    id: 'data',
    index: '04',
    label: 'Data',
    stack: 'Postgres · Mongo · Modelling',
    note: 'Storage shaped around the questions the product will actually ask of it.',
    accent: 'emerald',
    kind: 'strata',
    anchor: 'home',
    position: [-11, -11, -50],
    camera: [1, -7, -28],
  },
  {
    id: 'ai',
    index: '05',
    label: 'AI',
    stack: 'Retrieval · Agents · Inference',
    note: 'Prompt, retrieval, reasoning, response — a pipeline like any other, with latency and failure modes to design for.',
    accent: 'pink',
    kind: 'lattice',
    anchor: 'home',
    position: [12, -17, -84],
    camera: [-1, -14, -60],
  },
  {
    id: 'cloud',
    index: '06',
    label: 'Cloud',
    stack: 'CI/CD · Edge · Observability',
    note: 'Infrastructure that makes shipping boring — distributed, observable, and reversible.',
    accent: 'cyan',
    kind: 'regions',
    anchor: 'home',
    position: [-8, -22, -118],
    camera: [3, -20, -94],
  },
  {
    id: 'projects',
    index: '07',
    label: 'Projects',
    stack: 'Five builds, end to end',
    note: 'The work itself — analytics platforms, generative AI, fintech and marketing surfaces.',
    accent: 'coral',
    kind: 'monoliths',
    anchor: 'works',
    position: [14, -28, -156],
    camera: [0, -25, -130],
  },
  {
    id: 'experience',
    index: '08',
    label: 'Experience',
    stack: 'Two roles, deeper each time',
    note: 'From agency cadence to owning a multi-application platform.',
    accent: 'emerald',
    kind: 'ascent',
    anchor: 'timeline',
    position: [-13, -33, -194],
    camera: [1, -31, -170],
  },
  {
    id: 'contact',
    index: '09',
    label: 'Contact',
    stack: 'The way out',
    note: 'Open to full-time roles and selective freelance work.',
    accent: 'violet',
    kind: 'convergence',
    anchor: 'contact',
    position: [0, -37, -232],
    camera: [0, -35, -206],
  },
]

export const stationCount = stations.length

/** Stations that live inside the tall hero scroll — the engineering descent. */
export const heroStations = stations.filter((s) => s.anchor === 'home')
