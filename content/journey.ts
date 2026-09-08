/**
 * The engineering-layer journey. Ordered top → bottom the way a request flows
 * and the way the 3D stack is built along the Y axis.
 * `accent` maps to a CSS custom property name in the pastel palette.
 */
export interface JourneyLayer {
  id: string
  index: string
  label: string
  /** short technical line — TECHNOLOGY tier */
  stack: string
  /** one confident sentence about the work at this layer */
  note: string
  accent: 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink'
  /** primitive the scene uses for this layer */
  shape: 'grid' | 'icosa' | 'torus' | 'octa' | 'discs' | 'points' | 'dodeca'
}

export const journeyLayers: JourneyLayer[] = [
  {
    id: 'ui',
    index: '01',
    label: 'User Interface',
    stack: 'Design systems · interaction · motion',
    note: 'Interfaces that stay calm under real data — accessible, fast, and consistent across every surface.',
    accent: 'violet',
    shape: 'grid',
  },
  {
    id: 'frontend',
    index: '02',
    label: 'Frontend',
    stack: 'React · Next.js · TypeScript',
    note: 'Rendering strategy, state boundaries and a component architecture teams can scale without drift.',
    accent: 'cobalt',
    shape: 'icosa',
  },
  {
    id: 'api',
    index: '03',
    label: 'API',
    stack: 'REST · auth · edge middleware',
    note: 'Contracts that are predictable to consume and enforced the same way on every request.',
    accent: 'cyan',
    shape: 'torus',
  },
  {
    id: 'backend',
    index: '04',
    label: 'Backend',
    stack: 'Node.js · Express · services',
    note: 'Business logic with clear seams — services that fail loudly in development and gracefully in production.',
    accent: 'coral',
    shape: 'octa',
  },
  {
    id: 'database',
    index: '05',
    label: 'Database',
    stack: 'MongoDB · PostgreSQL · modelling',
    note: 'Data models shaped around access patterns, indexed for the queries that actually run.',
    accent: 'emerald',
    shape: 'discs',
  },
  {
    id: 'ai',
    index: '06',
    label: 'AI',
    stack: 'LLM workflows · agentic systems',
    note: 'Language-model capability wired into product surfaces as reliable, observable workflows.',
    accent: 'pink',
    shape: 'points',
  },
  {
    id: 'cloud',
    index: '07',
    label: 'Cloud',
    stack: 'CI/CD · deployment · scale',
    note: 'Shipping pipelines, edge delivery and the monitoring that keeps all of the above honest.',
    accent: 'cyan',
    shape: 'dodeca',
  },
]

export const heroCopy = {
  kicker: 'Full-Stack Engineer',
  /** rendered word-by-word with a stagger */
  titleWords: ['Full', 'Stack', 'Engineer'],
  positioning: ['MERN', 'Next.js', 'AI', 'Product engineering'],
  statement:
    'I build complete products — interface to infrastructure — and the systems that keep them fast, secure and coherent as they scale.',
}
