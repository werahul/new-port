/**
 * Copy for the site's sections (components/lab).
 *
 * SOURCING RULE (same as content/projects.ts): nothing here is invented. Every
 * fact is either re-exported from the existing content modules or rewritten
 * from them, so the pages and the case studies cannot drift apart. Anything
 * that would need the owner's confirmation is marked PLACEHOLDER.
 */
import { experience } from './experience'
import { profile, socials } from './profile'
import { featuredProjects, secondaryProjects, type Project } from './projects'
import { proficiencyMeta, skillDomains, type Proficiency } from './skills'

export { experience, profile, socials, proficiencyMeta }

/* ---- journey ------------------------------------------------------------- */

/** Order matters: it is the order the camera travels. */
export const stages = [
  { id: 'top', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'work', label: 'Work' },
  { id: 'approach', label: 'Approach' },
  { id: 'contact', label: 'Contact' },
] as const


const labNav = stages.filter((s) => s.id !== 'top' && s.id !== 'capabilities')

/*
 * CLIENT BOUNDARY. Client components never import this module's values — it
 * pulls in every project's case-study text. Server components hand them the
 * small, serialisable views below as props instead, which keeps the
 * client bundle lean.
 */

export interface NavItem {
  id: string
  label: string
  /** matches the number printed in the section's own label */
  num: string
}

export const navItems: NavItem[] = labNav.map((s) => ({
  id: s.id,
  label: s.label,
  num: `0${stages.findIndex((x) => x.id === s.id) + 1}`,
}))

export const railStages = stages.map((s) => ({ id: s.id, label: s.label }))

/* ---- hero ---------------------------------------------------------------- */

export const hero = {
  kicker: 'Full-stack engineer & creative developer',
  /** The last word is set in the serif italic. */
  headline: ['Engineering', 'digital'] as const,
  accentWord: 'worlds.',
  statement:
    'I build complete digital products — interface to infrastructure — and the motion, 3D and performance work that makes them feel alive.',
  status: 'Open to work',
}

/* ---- about --------------------------------------------------------------- */

export const about = {
  title: ['The engineer', 'behind the'] as const,
  accentWord: 'interface.',
  lead: profile.summary,
  /** a real photo, so the page is visibly made by a person */
  portrait: {
    src: '/portrait-rahul.png',
    width: 738,
    height: 822,
    name: profile.fullName,
    role: profile.role,
    location: profile.location,
  },
  body: [
    'My work sits where systems thinking meets visual craft. I care about the architecture that keeps a product coherent as it scales — shared component libraries, micro-frontends, clean APIs — and equally about how it feels in the hand: considered motion, real-time 3D where it earns its place, and performance measured rather than assumed.',
    'Recently that has meant a three-app micro-frontend CRM platform at Jasper Colin; before it, 15+ client products delivered end to end at Melange Digital. Along the way, the browser-based 3D front end for GenVR’s generative-AI product.',
  ],
  stats: profile.stats,
}

/* ---- capabilities -------------------------------------------------------- */

const levelOf = new Map<string, Proficiency>(
  skillDomains.flatMap((d) => d.skills.map((s) => [s.name, s.level] as const)),
)

/** Look a skill up in content/skills.ts so the honesty rating is never restated by hand. */
function skill(name: string, fallback?: Proficiency) {
  const level = levelOf.get(name) ?? fallback
  if (!level) throw new Error(`lab.ts: "${name}" is not in content/skills.ts`)
  return { name, level }
}

export interface Capability {
  id: string
  index: string
  name: string
  summary: string
  skills: { name: string; level: Proficiency }[]
}

export const capabilities: Capability[] = [
  {
    id: 'interface',
    index: '01',
    name: 'Interface engineering',
    summary:
      'Component architectures that stay fast and coherent as a product scales — including the shared library three micro-frontends render from.',
    skills: [
      skill('React.js'),
      skill('Next.js'),
      skill('TypeScript'),
      skill('TailwindCSS'),
      skill('Redux'),
      skill('Zustand'),
      skill('Micro-Frontend Architecture'),
      skill('Responsive Design'),
    ],
  },
  {
    id: 'motion',
    index: '02',
    name: 'Motion & 3D',
    summary:
      'Scroll choreography and interaction layers built with intent, and real-time 3D in the browser — shipped on the GenVR avatar platform and on this page.',
    skills: [
      skill('GSAP'),
      skill('Framer Motion'),
      skill('Three.js'),
      // Not listed in skills.ts; used for the 3D scenes of this portfolio itself.
      // PLACEHOLDER — confirm the level, or remove.
      skill('React Three Fiber', 'working'),
    ],
  },
  {
    id: 'backend',
    index: '03',
    name: 'Backend & data',
    summary:
      'REST services, authentication and transactional email standing behind the products I ship end to end.',
    skills: [
      skill('Node.js'),
      skill('Express.js'),
      skill('REST API Design'),
      skill('Nodemailer'),
      skill('MongoDB'),
      skill('JWT Authentication'),
      skill('PostgreSQL'),
    ],
  },
  {
    id: 'ai',
    index: '04',
    name: 'AI product surfaces',
    summary:
      'Language-model capability wired into interfaces as observable workflows — shipped an AI lead-generation front end, going deeper on agentic tooling.',
    skills: [
      skill('Prompt Engineering'),
      skill('Python'),
      skill('RAG'),
      skill('LangChain'),
      skill('LangGraph'),
      skill('MCP Server'),
    ],
  },
  {
    id: 'performance',
    index: '05',
    name: 'Performance & delivery',
    summary:
      'Measurement-led work and reproducible delivery — a recent marketing site ships at a Lighthouse performance score of 98.',
    skills: [
      skill('Core Web Vitals'),
      skill('Lighthouse'),
      skill('Lazy Loading'),
      skill('Image Optimization'),
      skill('Technical SEO'),
      skill('Vercel'),
      skill('Docker'),
      skill('CI/CD'),
    ],
  },
]

/* ---- work ---------------------------------------------------------------- */

/**
 * How each featured project is staged in the 3D world. Compositions differ on
 * purpose: the Jasper Colin platform has no screenshots, so it is shown as a
 * model of its actual architecture instead.
 */
export type ExhibitKind = 'architecture' | 'screen-orbit' | 'screen-stack' | 'screen-fan'

export interface Exhibit {
  project: Project
  kind: ExhibitKind
  /** architecture exhibits: which parts of the platform this project owns */
  highlight?: ('admin' | 'client' | 'supplier' | 'library')[]
  /** one-line caption for the stage — describes the composition, not a claim */
  stageNote: string
}

const bySlug = (slug: string) => {
  const p = featuredProjects.find((f) => f.slug === slug)
  if (!p) throw new Error(`lab.ts: unknown project "${slug}"`)
  return p
}

/** Order matters: index i is the journey's `project-i` anchor (see world/keyframes.ts). */
export const exhibits: Exhibit[] = [
  {
    project: bySlug('holidays-journey'),
    kind: 'screen-fan',
    stageNote: 'Sixteen destinations, one route',
  },
  {
    project: bySlug('rush'),
    kind: 'screen-stack',
    stageNote: 'A storefront, layered',
  },
  {
    project: bySlug('affiliate-platform'),
    kind: 'architecture',
    highlight: ['admin', 'client', 'library'],
    stageNote: 'Platform model — Admin, Client and the shared UI library',
  },
  {
    project: bySlug('twinkle-portfolio'),
    kind: 'screen-orbit',
    stageNote: 'A designer’s work, in orbit',
  },
  {
    project: bySlug('task-time-tracker'),
    kind: 'screen-stack',
    stageNote: 'Tasks, timer and analytics, layered',
  },
]

export const alsoBuilt = secondaryProjects

/**
 * Most screenshots are lifestyle mockups with solid white bands above and below
 * the photo. On a dark stage those read as broken images, so each is cropped to
 * its photographic area (fractions of image height, measured from the files).
 * Presentation data only — the files themselves are untouched.
 */
export const imageCrop: Record<string, { top: number; bottom: number }> = {
  '/proGenvr.png': { top: 0.168, bottom: 0.07 },
  '/proNeo.png': { top: 0.152, bottom: 0.152 },
  '/proMelange.jpg': { top: 0, bottom: 0 },
  '/proAartech.png': { top: 0.096, bottom: 0.094 },
  '/proAc.png': { top: 0.045, bottom: 0.078 },
  '/proBrandit.png': { top: 0, bottom: 0.021 },
  '/proDev.png': { top: 0, bottom: 0.082 },
  '/proHouse.png': { top: 0.016, bottom: 0.021 },
}

export function cropOf(src: string) {
  const c = imageCrop[src] ?? { top: 0, bottom: 0 }
  const visible = 1 - c.top - c.bottom
  return { ...c, visible, aspect: 1 / visible }
}

function hostOf(href: string | undefined, fallback: string) {
  try {
    return href ? new URL(href).host.replace(/^www\./, '') : fallback
  } catch {
    return fallback
  }
}

/** What the 3D world needs to know about the exhibits — and nothing more. */
export interface SceneData {
  screens: {
    exhibit: number
    kind: ExhibitKind
    src: string
    crop: { bottom: number; visible: number; aspect: number }
    /** the live site's address, for the device's browser bar */
    host: string
  }[]
  /** the architecture exhibit, if there is one */
  architecture: { exhibit: number; highlight: string[] } | null
}

export function sceneData(): SceneData {
  return {
    screens: exhibits.flatMap((e, i) =>
      e.kind !== 'architecture' && e.project.image
        ? [
            {
              exhibit: i,
              kind: e.kind,
              src: e.project.image,
              crop: cropOf(e.project.image),
              host: hostOf(e.project.caseStudy?.links?.[0]?.href ?? e.project.href, e.project.slug),
            },
          ]
        : [],
    ),
    architecture: (() => {
      const i = exhibits.findIndex((e) => e.kind === 'architecture')
      return i < 0 ? null : { exhibit: i, highlight: exhibits[i].highlight ?? [] }
    })(),
  }
}

/** The capability tabs' view: plain data, levels already resolved. */
export const capabilityLevels = (['core', 'working', 'exploring'] as const).map((l) => ({
  id: l,
  label: proficiencyMeta[l].label,
  hint: proficiencyMeta[l].hint,
}))

/* ---- approach ------------------------------------------------------------ */

export const principles = [
  {
    id: 'measure',
    index: '01',
    title: 'Performance is measured, not assumed',
    body: 'Core Web Vitals and Lighthouse are how the work gets judged — lazy loading, image discipline and lean bundles, so speed is a property of the product rather than a hope.',
    evidence: 'Jasper Colin marketing site — Lighthouse performance 98',
  },
  {
    id: 'systems',
    index: '02',
    title: 'Systems over screens',
    body: 'Interfaces are composed from shared, versioned primitives, so coherence is a dependency upgrade instead of a manual sync across teams.',
    evidence: 'Shared UI library across three micro-frontends — ~40% faster feature delivery',
  },
  {
    id: 'security',
    index: '03',
    title: 'Security is a build-time constraint',
    body: 'Edge route protection, HttpOnly session storage and hardened headers are designed in from the start — this site sets its own CSP.',
    evidence: 'OWASP-aware practice across auth, storage and error handling',
  },
  {
    id: 'motion',
    index: '04',
    title: 'Motion has to carry meaning',
    body: 'Animation is spent on the moments that explain something. Everything else stays still, readable and fast — and honours reduced-motion settings.',
    evidence: 'Scroll and interaction layers with GSAP and Framer Motion at Melange Digital',
  },
]

/* ---- contact ------------------------------------------------------------- */

export const contact = {
  title: ["Let's build", "what's"] as const,
  accentWord: 'next.',
  line: 'Open to full-time roles and selective freelance work. Email is fastest.',
  email: profile.email,
  phone: profile.phone,
  location: profile.location,
  resumeUrl: profile.resumeUrl,
}
