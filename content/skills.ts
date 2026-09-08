/**
 * The engineering capability map. Eight domains, each a layer of full-stack
 * delivery. Proficiency is deliberately honest — `core` is day-to-day shipped
 * work, `working` is used in real projects but not yet deep, `exploring` is
 * active study not production ownership. Technologies are drawn from the
 * portfolio projects and résumé, not invented.
 */

export type Proficiency = 'core' | 'working' | 'exploring'

export interface Skill {
  name: string
  level: Proficiency
}

export interface SkillDomain {
  id: string
  index: string
  /** full domain name shown in the rail + panel */
  name: string
  /** one engineering sentence — what the work at this layer actually is */
  tagline: string
  accent: 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink'
  skills: Skill[]
}

export const proficiencyMeta: Record<
  Proficiency,
  { label: string; hint: string }
> = {
  core: {
    label: 'Core',
    hint: 'Day-to-day, shipped to production repeatedly.',
  },
  working: {
    label: 'Working knowledge',
    hint: 'Used in real projects; comfortable, still deepening.',
  },
  exploring: {
    label: 'Exploring',
    hint: 'Active study and prototypes — not production ownership yet.',
  },
}

/** Header positioning words. */
export const skillPillars = [
  'Frontend',
  'Backend',
  'Database',
  'AI',
  'Architecture',
  'Performance',
  'Cloud',
  'Security',
] as const

export const skillDomains: SkillDomain[] = [
  {
    id: 'frontend',
    index: '01',
    name: 'Frontend Engineering',
    tagline:
      'Component architectures and motion systems that stay fast and coherent as a product scales — including a shared library spanning three micro-frontends.',
    accent: 'violet',
    skills: [
      { name: 'React.js', level: 'core' },
      { name: 'Next.js', level: 'core' },
      { name: 'TypeScript', level: 'core' },
      { name: 'JavaScript', level: 'core' },
      { name: 'TailwindCSS', level: 'core' },
      { name: 'Redux', level: 'core' },
      { name: 'Zustand', level: 'core' },
      { name: 'Context API', level: 'core' },
      { name: 'GSAP', level: 'core' },
      { name: 'Framer Motion', level: 'core' },
      { name: 'HTML5', level: 'core' },
      { name: 'CSS3', level: 'core' },
      { name: 'Responsive Design', level: 'core' },
      { name: 'Zod', level: 'working' },
      { name: 'Three.js', level: 'working' },
      { name: 'TanStack Form', level: 'exploring' },
      { name: 'TanStack Table', level: 'exploring' },
    ],
  },
  {
    id: 'backend',
    index: '02',
    name: 'Backend & APIs',
    tagline:
      'REST services, authentication and transactional email standing behind the products I ship end to end.',
    accent: 'cobalt',
    skills: [
      { name: 'Node.js', level: 'core' },
      { name: 'Express.js', level: 'core' },
      { name: 'REST API Design', level: 'core' },
      { name: 'API Integration', level: 'core' },
      { name: 'Nodemailer', level: 'core' },
      { name: 'JWT Authentication', level: 'working' },
    ],
  },
  {
    id: 'database',
    index: '03',
    name: 'Database',
    tagline:
      'Modelling data around real access patterns and indexing for the queries that actually run.',
    accent: 'emerald',
    skills: [
      { name: 'MongoDB', level: 'core' },
      { name: 'PostgreSQL', level: 'working' },
    ],
  },
  {
    id: 'ai',
    index: '04',
    name: 'AI & Agentic Systems',
    tagline:
      'Wiring language-model capability into product surfaces as observable workflows — shipped an AI lead-generation front end; going deeper on agentic tooling.',
    accent: 'coral',
    skills: [
      { name: 'Python', level: 'working' },
      { name: 'Prompt Engineering', level: 'working' },
      { name: 'RAG', level: 'exploring' },
      { name: 'Vector Databases', level: 'exploring' },
      { name: 'LangChain', level: 'exploring' },
      { name: 'LangGraph', level: 'exploring' },
      { name: 'MCP Server', level: 'exploring' },
      { name: 'Agentic AI', level: 'exploring' },
    ],
  },
  {
    id: 'performance',
    index: '05',
    name: 'Performance & SEO',
    tagline:
      'Measurement-led work — a recent marketing site reached a Lighthouse performance score of 98.',
    accent: 'cobalt',
    skills: [
      { name: 'Core Web Vitals', level: 'core' },
      { name: 'Lighthouse', level: 'core' },
      { name: 'Lazy Loading', level: 'core' },
      { name: 'Image Optimization', level: 'core' },
      { name: 'Semantic HTML', level: 'core' },
      { name: 'Technical SEO', level: 'working' },
    ],
  },
  {
    id: 'cloud',
    index: '06',
    name: 'Cloud & DevOps',
    tagline:
      'Deploying and delivering on managed platforms with reproducible, lockfile-driven pipelines.',
    accent: 'emerald',
    skills: [
      { name: 'Vercel', level: 'core' },
      { name: 'Netlify', level: 'core' },
      { name: 'Firebase', level: 'core' },
      { name: 'AWS', level: 'working' },
      { name: 'Render', level: 'working' },
      { name: 'Docker', level: 'working' },
      { name: 'CI/CD', level: 'working' },
      { name: 'Azure', level: 'exploring' },
    ],
  },
  {
    id: 'engineering',
    index: '07',
    name: 'Engineering & Security',
    tagline:
      'Tooling, standards and scanning kept inside the build — micro-frontend boundaries, and security treated as a build-time constraint.',
    accent: 'violet',
    skills: [
      { name: 'Git', level: 'core' },
      { name: 'GitHub', level: 'core' },
      { name: 'Micro-Frontend Architecture', level: 'core' },
      { name: 'Postman', level: 'core' },
      { name: 'Chrome DevTools', level: 'core' },
      { name: 'Linux', level: 'working' },
      { name: 'SonarQube', level: 'exploring' },
      { name: 'OWASP ZAP', level: 'exploring' },
      { name: 'GitLeaks', level: 'exploring' },
      { name: 'Trivy', level: 'exploring' },
      { name: 'Dependency Check', level: 'exploring' },
    ],
  },
  {
    id: 'ai-assisted',
    index: '08',
    name: 'AI-Assisted Development',
    tagline:
      'Using AI tooling for review, debugging and throughput — without handing over authorship of the system.',
    accent: 'coral',
    skills: [
      { name: 'Claude', level: 'core' },
      { name: 'GitHub Copilot', level: 'core' },
      { name: 'AI-assisted Code Review', level: 'core' },
      { name: 'AI-assisted Debugging', level: 'core' },
      { name: 'Codex', level: 'working' },
    ],
  },
]

export const proficiencyOrder: Proficiency[] = ['core', 'working', 'exploring']
