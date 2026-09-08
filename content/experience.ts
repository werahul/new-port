export interface ExperienceEntry {
  id: string
  /** running index on the journey rail, e.g. "01" */
  index: string
  company: string
  role: string
  period: string
  location: string
  /** one line on what the company / product actually is */
  context: string
  /** accent hue keyed to the design tokens */
  accent: 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink'
  /** the engineering problems this role put in front of me */
  challenges: string[]
  /** what got built to answer them */
  systems: string[]
  technologies: string[]
  /** outcomes — only figures the résumé actually supports */
  impact: string[]
}

/**
 * Two roles, presented as an engineering journey rather than a résumé.
 * The Melange Digital entry covers the full tenure there (intern → developer).
 * Every figure below is taken from the résumé — nothing is invented.
 */
export const experience: ExperienceEntry[] = [
  {
    id: 'jasper-colin',
    index: '01',
    company: 'Jasper Colin',
    role: 'Frontend Developer',
    period: 'Oct 2025 — Present',
    location: 'Noida, India',
    context:
      'B2B market research, data insights and analytics — a multi-application CRM platform plus an AI-powered lead-generation product.',
    accent: 'cobalt',
    challenges: [
      'Three CRM applications — Admin, Client and Supplier — had to ship and deploy independently without fragmenting the interface or duplicating UI code across teams.',
      'The AI lead-generation product needed UI workflows wired directly into backend intelligence services while staying responsive.',
      'A marketing site that marketing could turn into campaign-ready pages without waiting on engineering.',
    ],
    systems: [
      'A micro-frontend CRM platform composed of independently deployable Admin, Client and Supplier applications.',
      'A shared, reusable UI component library consumed by all three micro-frontends as the single source of interface truth.',
      'The front end for an AI-powered lead-generation product, connecting UI workflows to backend intelligence services.',
      'The public marketing site, structured for fast, campaign-ready page delivery.',
    ],
    technologies: ['React', 'Next.js', 'TailwindCSS', 'Micro-frontends'],
    impact: [
      'Shared component library removed duplicated UI code across the three apps and cut new-feature build time by an estimated 40%.',
      'Marketing site ships at a Lighthouse performance score of 98.',
    ],
  },
  {
    id: 'melange-digital',
    index: '02',
    company: 'Melange Digital',
    role: 'Frontend Web Developer',
    period: 'Jan 2023 — Sep 2025',
    location: 'Goa — Remote',
    context:
      'A digital studio shipping client web products across industries on an agency delivery cadence.',
    accent: 'emerald',
    challenges: [
      'Client sites had to stay fast and visually consistent across browsers while being built and iterated on tight agency timelines.',
      'Marketing teams needed to edit live copy and data without a deploy — a spreadsheet standing in for a lightweight CMS.',
      'Motion and interaction had to feel considered, not bolted on, across a wide range of brands.',
    ],
    systems: [
      'Scalable client websites delivered end to end, from build through cross-browser testing to launch.',
      'Reusable UI systems and shared front-end standards carried from project to project.',
      'A content pipeline backed by the Google Sheets API so non-technical teams could update live content directly.',
      'Scroll and interaction layers built with GSAP and Framer Motion.',
    ],
    technologies: [
      'React',
      'Next.js',
      'TailwindCSS',
      'GSAP',
      'Framer Motion',
      'Google Sheets API',
      'Git / GitHub',
    ],
    impact: [
      'Delivered 15+ client projects end to end across a range of industries.',
      'Shared components and review practice raised code consistency and maintainability across the team.',
      'Cross-browser testing and an Agile workflow kept releases predictable on an agency schedule.',
    ],
  },
]
