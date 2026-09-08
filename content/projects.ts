/**
 * Project data.
 *
 * SOURCING RULE: every concrete claim here — responsibilities, technologies,
 * metrics, links — traces to the existing codebase (previous `projects.ts`
 * copy, `content/experience.ts`, `content/profile.ts`). Nothing about clients,
 * numbers, scope or URLs is invented. Where a fact isn't in the source it is
 * left out (e.g. no repositories are linked because none are recorded, and
 * older projects carry no dates).
 */

export type Accent = 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink'

export interface ProjectLink {
  label: string
  href: string
}

export interface ArchLayer {
  layer: string
  detail: string
}

export interface TechGroup {
  group: string
  items: string[]
}

export interface Challenge {
  title: string
  challenge: string
  solution: string
}

export interface Metric {
  value: string
  label: string
}

export interface GalleryItem {
  src: string
  caption?: string
}

export interface CaseStudy {
  /** 01 — what was built and why */
  overview: string
  /** 02 — the problem the product solved */
  problem: string
  /** 03 — engineering contribution, as concrete bullets */
  role: string[]
  /** 04 — architecture layers, only those that apply */
  architecture?: ArchLayer[]
  /** 05 — grouped technologies */
  tech: TechGroup[]
  /** 06 + 07 — challenge paired with its solution */
  challenges: Challenge[]
  /** 08 — performance work, only where the source supports it */
  performance?: string[]
  /** 09 — product-experience notes (paired with gallery where present) */
  experience?: string[]
  /** 09 — visuals from existing project assets */
  gallery?: GalleryItem[]
  /** 10 — verified results only */
  results?: Metric[]
  /** 11 — real links only */
  links?: ProjectLink[]
  /** shown in place of links when the work isn't publicly linkable */
  linkNote?: string
}

export interface Project {
  slug: string
  number: string
  category: string
  title: string
  /** one-line outcome for the index */
  outcome: string
  /** company / product context, from the codebase */
  context: string
  /** short role label, from experience.ts titles */
  role: string
  /** only where the source records it */
  year?: string
  /** primary technologies for the index card */
  tech: string[]
  /** screenshot asset, when one exists in /public */
  image?: string
  /** external live URL, only when real */
  href?: string
  featured: boolean
  accent: Accent
  caseStudy?: CaseStudy
}

const featured: Project[] = [
  {
    slug: 'affiliate-analytics',
    number: '01',
    category: 'Analytics Platform',
    title: 'Affiliate Campaign Analytics Platform',
    outcome:
      'The client-facing analytics application inside a three-app micro-frontend CRM.',
    context: 'Jasper Colin',
    role: 'Frontend Developer',
    year: '2025 — Now',
    tech: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Micro-frontends'],
    featured: true,
    accent: 'cobalt',
    caseStudy: {
      overview:
        'One of three independently deployable applications — Admin, Client and Supplier — that make up a CRM platform for B2B market research, data insights and analytics. This is the client-facing surface, where external users work through campaign and analytics workflows on top of shared platform infrastructure.',
      problem:
        'Three products with heavily overlapping interface needs had to evolve and deploy on their own cadence without the UI drifting apart or the teams rebuilding the same things three times.',
      role: [
        'Built and scaled the client-facing application within the micro-frontend architecture.',
        'Co-architected the shared, reusable UI component library that all three micro-frontends consume.',
        'Wired UI workflows into backend intelligence services for an AI-powered lead-generation product.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail:
            'React + Next.js application, composed as an independently deployable micro-frontend.',
        },
        {
          layer: 'Shared UI',
          detail:
            'A versioned component library used as the single interface source of truth across Admin, Client and Supplier.',
        },
        {
          layer: 'Services',
          detail:
            'UI workflows connected to backend intelligence services powering lead generation.',
        },
      ],
      tech: [
        { group: 'Interface', items: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'] },
        {
          group: 'Architecture',
          items: ['Micro-frontends', 'Shared component library', 'Independent deployment'],
        },
      ],
      challenges: [
        {
          title: 'Independent deployment without UI drift',
          challenge:
            'Each application shipped on its own schedule, so shared surfaces risked diverging in behaviour and style over time.',
          solution:
            'A single versioned component library became the contract between apps — interaction and visual patterns changed in one place and propagated on upgrade.',
        },
        {
          title: 'Three teams, one interface language',
          challenge:
            'Common patterns were being rebuilt per application, multiplying maintenance.',
          solution:
            'Consolidating primitives into the shared library cut duplicate code and reduced new-feature time by an estimated 40%.',
        },
        {
          title: 'Driving AI services from the UI',
          challenge:
            'Lead-generation intelligence lived in backend services the interface had to orchestrate predictably.',
          solution:
            'Modelled the UI workflows around those service calls so the product surface stayed responsive and observable as the data moved.',
        },
      ],
      performance: [
        'Campaign-ready marketing pages for the platform reached a Lighthouse performance score of 98.',
      ],
      experience: [
        'Navigation, data views and forms behave identically across all three applications because they render from the same library.',
      ],
      results: [
        { value: '3', label: 'Independently deployable applications' },
        { value: '~40%', label: 'Less time to ship a new feature' },
        { value: '98', label: 'Lighthouse performance — marketing pages' },
      ],
      linkNote: 'Client engagement at Jasper Colin — not publicly linkable.',
    },
  },
  {
    slug: 'affiliate-admin',
    number: '02',
    category: 'Internal Portal',
    title: 'Affiliate Admin & Campaign Management Portal',
    outcome:
      'The admin surface of the micro-frontend CRM, plus the component library the platform is built on.',
    context: 'Jasper Colin',
    role: 'Frontend Developer',
    year: '2025 — Now',
    tech: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Micro-frontends'],
    featured: true,
    accent: 'violet',
    caseStudy: {
      overview:
        'The administrative application in the same three-app platform — management and configuration for campaigns and accounts. Alongside building it, I own the shared component library that Admin, Client and Supplier all render from.',
      problem:
        'A platform assembled from three independently built applications still has to feel like one product. That coherence has to come from somewhere without forcing the apps back into a single deployable.',
      role: [
        'Built the Admin application within the three-app micro-frontend platform.',
        'Architected and maintain the shared reusable UI component library consumed by all three micro-frontends.',
        'Established the patterns that let each application deploy modularly and independently.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail:
            'React + Next.js Admin application, deployed independently of the Client and Supplier apps.',
        },
        {
          layer: 'Shared UI',
          detail:
            'Component library owned here and versioned out to the other micro-frontends as the interface contract.',
        },
        {
          layer: 'Composition',
          detail:
            'Three separately built applications composed into one coherent CRM platform.',
        },
      ],
      tech: [
        { group: 'Interface', items: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'] },
        {
          group: 'Architecture',
          items: [
            'Micro-frontend architecture',
            'Shared component library',
            'Modular, independent deployment',
          ],
        },
      ],
      challenges: [
        {
          title: 'One coherent platform from three codebases',
          challenge:
            'Admin, Client and Supplier are built and shipped independently, which normally means three slowly diverging interfaces.',
          solution:
            'A shared component library carries the interface language between them, so coherence is a dependency upgrade rather than a manual sync.',
        },
        {
          title: 'A library three teams depend on',
          challenge:
            'Once every application consumes the same primitives, a careless change breaks all three.',
          solution:
            'Versioned the library and kept its surface deliberate, so consumers adopt changes on their own schedule.',
        },
        {
          title: 'Role-appropriate interfaces without forking',
          challenge:
            'Admin, client and supplier users need different things from what is often the same underlying screen.',
          solution:
            'Composed those screens from shared primitives with role-specific arrangement, rather than maintaining parallel implementations.',
        },
      ],
      results: [
        { value: '3', label: 'Micro-frontends sharing one UI library' },
        { value: '~40%', label: 'Faster feature delivery via shared components' },
      ],
      linkNote: 'Client engagement at Jasper Colin — not publicly linkable.',
    },
  },
  {
    slug: 'ai-3d-avatars',
    number: '03',
    category: 'Generative AI · SaaS',
    title: 'AI-Powered 3D Avatars & Immersive Experiences',
    outcome:
      'The web front end for a generative-AI product — real-time 3D asset rendering and avatar generation in the browser.',
    context: 'GenVR Research',
    role: 'Frontend Engineer',
    tech: ['Next.js', 'TypeScript', 'React Redux', 'Three.js', 'WaveSurfer.js', 'Django'],
    image: '/proGenvr.png',
    href: 'https://app.genvrresearch.com/',
    featured: true,
    accent: 'coral',
    caseStudy: {
      overview:
        'The web client for a generative-AI SaaS product that renders 3D assets and generates avatars directly in the browser, backed by a Django API.',
      problem:
        'Generative 3D and avatar output has to feel immediate in the browser, despite large assets to load and model-backed generation steps that take time.',
      role: [
        'Built the front end for the SaaS product.',
        'Implemented real-time asset loading and 3D rendering with Three.js.',
        'Integrated avatar generation and audio (WaveSurfer.js) against the Django backend.',
        'Managed client state with React Redux.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail: 'Next.js + React application with Redux for client state.',
        },
        { layer: 'Rendering', detail: 'Three.js scene for 3D asset and avatar display.' },
        { layer: 'Media', detail: 'WaveSurfer.js for audio waveform handling.' },
        { layer: 'Backend', detail: 'Django API serving generation and asset endpoints.' },
      ],
      tech: [
        {
          group: 'Interface',
          items: ['Next.js', 'TypeScript', 'TailwindCSS', 'React Redux'],
        },
        { group: '3D & media', items: ['Three.js', 'WaveSurfer.js'] },
        { group: 'Backend', items: ['Django'] },
      ],
      challenges: [
        {
          title: 'Real-time loading of large 3D assets',
          challenge:
            'Immersive assets are heavy, and a blank screen while they arrive breaks the sense of a live product.',
          solution:
            'Progressive loading states around the Three.js scene so it stays interactive while assets stream in.',
        },
        {
          title: 'Keeping 3D rendering smooth in the browser',
          challenge:
            'A long-lived WebGL scene leaks memory and drops frames without careful lifecycle management.',
          solution:
            'Disciplined Three.js scene setup and disposal so the render loop stays predictable across sessions.',
        },
        {
          title: 'Coordinating async generation with the UI',
          challenge:
            'Avatar and asset generation is asynchronous and multi-step on the Django side.',
          solution:
            'Modelled the workflow in Redux so the interface could reflect each stage without blocking.',
        },
      ],
      performance: [
        'Work centred on perceived performance — progressive asset loading and rendering so the interface never blocks on a generation step.',
      ],
      gallery: [
        { src: '/proGenvr.png', caption: 'Generative avatar and 3D asset workspace.' },
      ],
      links: [{ label: 'Live Demo', href: 'https://app.genvrresearch.com/' }],
    },
  },
  {
    slug: 'ai-trading',
    number: '04',
    category: 'Fintech · Marketing Site',
    title: 'AI-Powered Trading Platform',
    outcome:
      'The marketing and onboarding site for an AI-driven trading platform, with personalised course recommendations.',
    context: 'NeoTrader',
    role: 'Frontend Engineer',
    tech: ['JavaScript', 'HTML/CSS', 'TailwindCSS', 'PHP'],
    image: '/proNeo.png',
    href: 'https://neotrader.in/',
    featured: true,
    accent: 'emerald',
    caseStudy: {
      overview:
        'The marketing and onboarding site for an AI-driven trading platform, including a surface that recommends courses to each visitor.',
      problem:
        'Turn first-time visitors into onboarded users, and put the right learning path in front of each person rather than a generic catalogue.',
      role: [
        'Architected the marketing and onboarding site.',
        'Built the personalised course-recommendation interface.',
        'Implemented the front end in vanilla JavaScript and TailwindCSS on a PHP backend.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail: 'Hand-written HTML, CSS and JavaScript with TailwindCSS — no framework.',
        },
        { layer: 'Backend', detail: 'PHP.' },
        {
          layer: 'Feature',
          detail: 'Personalised course-recommendation surface in the onboarding flow.',
        },
      ],
      tech: [
        { group: 'Interface', items: ['JavaScript', 'HTML/CSS', 'TailwindCSS'] },
        { group: 'Backend', items: ['PHP'] },
      ],
      challenges: [
        {
          title: 'Framework-free interactivity at scale',
          challenge:
            'A full marketing and onboarding experience with no framework to lean on for structure.',
          solution:
            'Structured vanilla-JS modules for the onboarding flow so behaviour stayed maintainable as the site grew.',
        },
        {
          title: 'Personalised recommendations in a lean stack',
          challenge:
            'Per-visitor course recommendations without a heavy client runtime.',
          solution:
            'Drove the recommendation UI from the PHP backend and kept the front end progressive and fast.',
        },
      ],
      results: [
        { value: '+40%', label: 'User engagement — first quarter' },
        { value: '+25%', label: 'Course sales — first quarter' },
      ],
      links: [{ label: 'Live Demo', href: 'https://neotrader.in/' }],
    },
  },
  {
    slug: 'marketing-platform',
    number: '05',
    category: 'Marketing · Web Platform',
    title: 'Digital Marketing Agency Website',
    outcome:
      'A 50+ page marketing website with an integrated blog, a careers module and server-side application handling.',
    context: 'Melange Digital',
    role: 'Frontend Engineer',
    tech: ['React', 'TailwindCSS', 'GSAP', 'Framer Motion', 'Node.js', 'Express', 'Nodemailer'],
    image: '/proMelange.jpg',
    href: 'https://melangedigital.co/',
    featured: true,
    accent: 'violet',
    caseStudy: {
      overview:
        'A 50+ page marketing website for a digital agency, with an integrated blog, a careers module and Nodemailer-based application handling on an Express backend.',
      problem:
        'A large content surface — 50+ pages, a blog, a careers section — still had to feel fast and considered, with reliable handling of inbound applications and enquiries.',
      role: [
        'Engineered the 50+ page site end to end.',
        'Built the integrated blog and the careers module.',
        'Implemented Nodemailer-based application and enquiry handling on Node.js + Express.',
        'Owned motion and interaction with GSAP and Framer Motion.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail: 'React + TailwindCSS, with motion via GSAP and Framer Motion.',
        },
        { layer: 'Backend', detail: 'Node.js + Express.' },
        {
          layer: 'Mail',
          detail: 'Nodemailer pipeline for application and enquiry submissions.',
        },
        { layer: 'Content', detail: 'Integrated blog and careers module.' },
      ],
      tech: [
        {
          group: 'Interface',
          items: ['React', 'TailwindCSS', 'GSAP', 'Framer Motion'],
        },
        { group: 'Backend', items: ['Node.js', 'Express', 'Nodemailer'] },
      ],
      challenges: [
        {
          title: '50+ pages without a performance cliff',
          challenge:
            'Content surfaces this large tend to accumulate weight page by page until the whole site feels slow.',
          solution:
            'A shared layout and component system, asset discipline, lazy loading and image optimisation applied across the page set.',
        },
        {
          title: 'Reliable inbound handling',
          challenge:
            'Job applications and enquiries had to arrive intact, every time.',
          solution:
            'A Nodemailer pipeline on Express with validation on the server before anything is sent.',
        },
        {
          title: "Motion that doesn't cost interactivity",
          challenge:
            'Agency sites lean on motion, which easily turns into jank and input lag.',
          solution:
            'Used GSAP and Framer Motion deliberately — on the moments that carry meaning, not on everything.',
        },
      ],
      performance: [
        'Performance and interaction were improved throughout the build — asset discipline, lazy loading and image optimisation across the full page set.',
      ],
      gallery: [{ src: '/proMelange.jpg', caption: 'Agency marketing site.' }],
      results: [{ value: '50+', label: 'Pages engineered end to end' }],
      links: [{ label: 'Live Demo', href: 'https://melangedigital.co/' }],
    },
  },
]

const secondary: Project[] = [
  {
    slug: 'pr-agency',
    number: '06',
    category: 'Brand · Editorial',
    title: 'PR Agency — Strategic Brand Showcase',
    outcome:
      'A scroll-driven site telling a 19-year agency journey — animated statistics and smooth chapter transitions.',
    context: 'Brandit Communications',
    role: 'Frontend Engineer',
    tech: ['Next.js', 'TailwindCSS', 'Framer Motion', 'GSAP', 'EmailJS'],
    image: '/proBrandit.png',
    href: 'https://www.branditcommunications.com/',
    featured: false,
    accent: 'cobalt',
  },
  {
    slug: 'broking-platform',
    number: '07',
    category: 'Finance · Brand Site',
    title: 'Broking Platform — Financial Brand Site',
    outcome:
      'A responsive landing experience with scroll-based UI and animated metrics for a broker with 30,000+ clients.',
    context: 'AC Agarwal',
    role: 'Frontend Engineer',
    tech: ['React', 'TailwindCSS', 'Framer Motion'],
    image: '/proAc.png',
    href: 'https://www.acagarwal.com/',
    featured: false,
    accent: 'emerald',
  },
  {
    slug: 'house-of-tales',
    number: '08',
    category: 'Brand · Landing',
    title: 'House of Tales — Wedding Brand Landing',
    outcome:
      'A mobile-first landing page tuned for speed and SEO, with a Nodemailer-backed contact flow.',
    context: 'House of Tales',
    role: 'Frontend Engineer',
    tech: ['Next.js', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'GSAP', 'Nodemailer'],
    image: '/proHouse.png',
    href: 'https://www.houseoftales.co/',
    featured: false,
    accent: 'coral',
  },
  {
    slug: 'aartech-solonics',
    number: '09',
    category: 'Corporate · Engineering',
    title: 'Aartech Solonics — Energy Engineering',
    outcome:
      'A corporate site for an R&D engineering firm: live stock-price API, dynamic product modules and a configurator.',
    context: 'Aartech Solonics',
    role: 'Frontend Engineer',
    tech: ['React', 'TailwindCSS', 'Node.js', 'Express', 'API Integration'],
    image: '/proAartech.png',
    href: 'https://aartechsolonics.com/',
    featured: false,
    accent: 'cobalt',
  },
  {
    slug: 'devboost',
    number: '10',
    category: 'Product · Data',
    title: 'DevBoost — Engineering Intelligence',
    outcome:
      'A product site for an AI-powered engineering-intelligence tool — predictive insight and performance visibility.',
    context: 'DevBoost',
    role: 'Frontend Engineer',
    tech: ['React', 'TypeScript', 'TailwindCSS', 'Data Visualization'],
    image: '/proDev.png',
    href: 'https://devboost.co/',
    featured: false,
    accent: 'emerald',
  },
]

export const projects: Project[] = [...featured, ...secondary]
export const featuredProjects = featured
export const secondaryProjects = secondary
export const caseStudySlugs = featured.map((p) => p.slug)

export function getProject(slug: string): Project | undefined {
  return featured.find((p) => p.slug === slug)
}

export function adjacentProjects(slug: string) {
  const i = featured.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: undefined, next: undefined }
  return {
    prev: i > 0 ? featured[i - 1] : featured[featured.length - 1],
    next: i < featured.length - 1 ? featured[i + 1] : featured[0],
  }
}

export const sectionLabels = [
  'Overview',
  'Problem',
  'My Role',
  'Architecture',
  'Technology',
  'Challenges',
  'Solution',
  'Performance',
  'Product Experience',
  'Results',
  'Links',
] as const
