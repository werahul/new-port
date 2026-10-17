/**
 * Project data.
 *
 * SOURCING RULE: every concrete claim here — responsibilities, technologies,
 * metrics, links — traces to a source: the project's own README (public or
 * supplied by the owner), what its live site visibly does, or for older work
 * the previous `projects.ts` copy, `content/experience.ts` and
 * `content/profile.ts`. Nothing about clients, numbers, scope or URLs is
 * invented. Where a fact isn't in a source it is left out (e.g. repositories
 * are linked only when public, and older projects carry no dates).
 */


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
  caseStudy?: CaseStudy
}

/**
 * The five featured projects, in journey order — each is a staged exhibit on
 * the home page (see `exhibits` in content/lab.ts) with a full case study.
 */
const featured: Project[] = [
  {
    slug: 'holidays-journey',
    number: '01',
    category: 'Travel · Web Platform',
    title: 'Holidays Journey — Char Dham & India Tours',
    outcome:
      'A travel company’s full platform: a scroll-led site through the Himalaya, packages served from a database, and an enquiry pipeline with its own admin.',
    context: 'Holidays Journey',
    role: 'Full-stack Developer',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Supabase', 'Drizzle'],
    image: '/proHolidays.png',
    href: 'https://www.holidaysjourney.in/',
    featured: true,
    caseStudy: {
      overview:
        'The website and back office for Holidays Journey, a Haridwar tours and travel company built around the Char Dham Yatra, Uttarakhand holidays, pilgrimage journeys and custom tours across India. Visitors travel through sixteen destinations ordered by altitude, follow the four shrines across a schematic Himalayan terrain, and filter packages by kind of trip. Behind it, every enquiry is emailed, stored and worked from an admin.',
      problem:
        'A pilgrimage is a big, considered purchase, and most people plan it with family over WhatsApp. The site had to make the journey feel real before anyone spoke to the agency, keep package details correct without a developer in the loop, and make sure no enquiry was ever lost on its way in.',
      role: [
        'Built the site end to end on Next.js 16 and React 19: the design system, the scroll-led sections and the content model.',
        'Modelled destinations, packages, itineraries, categories, gallery, FAQs and testimonials as typed schemas behind one data-access layer.',
        'Moved packages into a Supabase Postgres database with Drizzle migrations and a seed script, so listings are edited as data, not code.',
        'Built the enquiry pipeline: email through a choice of providers, a database record, an optional Turnstile check and a staff-only admin.',
        'Generated canonicals, the sitemap, Open Graph tags and JSON-LD structured data from one configured site origin.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail:
            'Next.js 16 App Router, React 19 and TypeScript, styled with Tailwind v4 tokens and shadcn/ui on Radix. Motion runs through one provider with GSAP and Motion.',
        },
        {
          layer: 'Content',
          detail:
            'Typed schemas for every content type, read through a single data-access module, with business identity and messaging held in config.',
        },
        {
          layer: 'Database',
          detail:
            'Supabase Postgres via Drizzle. Once a database is configured, packages are read only from it.',
        },
        {
          layer: 'Enquiries',
          detail:
            'Swappable email delivery (Resend, SMTP, SendGrid or SES), stored records and an optional Cloudflare Turnstile check.',
        },
        {
          layer: 'Admin',
          detail:
            'Supabase Auth login with staff roles granted from the command line; enquiries are reviewed in the admin.',
        },
        {
          layer: 'SEO',
          detail: 'Canonicals, sitemap, robots, Open Graph and JSON-LD built from the production origin.',
        },
      ],
      tech: [
        {
          group: 'Interface',
          items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Radix UI', 'GSAP', 'Motion'],
        },
        { group: 'Data', items: ['Supabase', 'PostgreSQL', 'Drizzle ORM'] },
        { group: 'Enquiries', items: ['Resend', 'SMTP', 'SendGrid', 'Amazon SES', 'Cloudflare Turnstile'] },
        { group: 'Quality', items: ['Vitest', 'PGlite', 'ESLint', 'Prettier'] },
      ],
      challenges: [
        {
          title: 'An enquiry must never disappear',
          challenge:
            'A form that shows “thank you” while the email silently fails is worse than no form at all: the customer waits and the agency never knows they asked.',
          solution:
            'Each enquiry is both emailed and saved to the database. In production, if neither succeeds the visitor is told plainly and offered WhatsApp or a phone call instead.',
        },
        {
          title: 'Packages the agency can change without a deploy',
          challenge:
            'Routes, durations and starting prices change with the season, and hard-coded listings would turn every change into a developer task.',
          solution:
            'Packages, categories and the fleet live in Postgres behind Drizzle migrations and a seed script, with staff access managed through Supabase roles.',
        },
        {
          title: 'Making a mountain route feel real',
          challenge:
            'Four shrines at over 3,000 metres are hard to picture from a list of names and prices.',
          solution:
            'Destinations are laid out in order of altitude, and the Char Dham sits on a schematic terrain that traces the route from Yamunotri to Badrinath, each stop marked with its height.',
        },
        {
          title: 'Search visibility for a local business',
          challenge:
            'For a Haridwar agency, being found for the Char Dham Yatra is the business. One wrong origin breaks canonicals, the sitemap and share cards together.',
          solution:
            'Every SEO surface is generated from one configured site URL, and a production build refuses to run without it.',
        },
      ],
      performance: [
        'Images go through Next.js image optimisation. Stock photos sit at the same paths the agency’s own photography replaces, one for one.',
        'Database tests run against PGlite, so the data layer is tested without a live server.',
      ],
      experience: [
        'Sixteen destinations, from Varanasi to Kedarnath, ordered by altitude.',
        'Package routes show duration, starting point and a starting price, and filter by Char Dham Yatra, Uttarakhand or pan-India tours.',
        'WhatsApp is never more than a tap away, through a floating button and in-page links.',
      ],
      gallery: [
        { src: '/proHolidays.png', caption: 'The Char Dham, traced across a schematic Himalayan terrain.' },
        { src: '/proHolidaysCover.png', caption: 'Places, people and culture: the journey in frames.' },
      ],
      links: [{ label: 'Live site', href: 'https://www.holidaysjourney.in/' }],
    },
  },
  {
    slug: 'rush',
    number: '02',
    category: 'E-commerce · Full-stack',
    title: 'RUSH — Men’s Streetwear Store',
    outcome:
      'A full-stack streetwear store: catalogue, cart, checkout, order tracking and an admin dashboard on one monorepo.',
    context: 'RUSH',
    role: 'Full-stack Developer',
    tech: ['Next.js', 'TypeScript', 'Express', 'MongoDB', 'Zustand', 'Tailwind CSS'],
    image: '/proRush.png',
    href: 'https://rushfashion.shop/',
    featured: true,
    caseStudy: {
      overview:
        'RUSH sells men’s streetwear: gym fits, everyday essentials and accessories. I built the store as a monorepo, with a Next.js 15 storefront, an Express REST API on MongoDB and a shared package of types and constants. It covers the whole shopping loop, from browsing and variants to checkout, order tracking and the admin behind it.',
      problem:
        'A fashion brand lives on drops. The store had to feel premium on a phone, find a product quickly in a growing catalogue, take an order from cart to confirmation, and give the team one place to run products, orders and customers.',
      role: [
        'Built the storefront, the API and the shared package, all in one npm-workspaces monorepo.',
        'Implemented auth with JWTs, refresh tokens and HttpOnly cookies, plus password reset and user and admin roles.',
        'Built the catalogue with debounced search, filters, sort and pagination, and product pages with size and colour variants.',
        'Built cart, wishlist and checkout with tax, shipping and coupons, then order tracking on a timeline.',
        'Built the admin dashboard for stats, products, orders and users.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail:
            'Next.js 15 App Router and TypeScript, with Tailwind CSS, shadcn-style components and Framer Motion. Client state lives in Zustand.',
        },
        {
          layer: 'API',
          detail: 'Node.js and Express REST API with role-based access for users and admins.',
        },
        { layer: 'Database', detail: 'MongoDB with Mongoose models, hosted on MongoDB Atlas.' },
        {
          layer: 'Shared',
          detail: 'A shared TypeScript package of types and constants used by both web and API.',
        },
        {
          layer: 'Integrations',
          detail:
            'Payments (Stripe and Razorpay) and uploads (Cloudinary) are structured in, ready to be switched on.',
        },
        { layer: 'Hosting', detail: 'Storefront on Vercel, API on Render.' },
      ],
      tech: [
        {
          group: 'Interface',
          items: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'React Hook Form', 'Zod'],
        },
        { group: 'API & data', items: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT'] },
        { group: 'Delivery', items: ['Vercel', 'Render', 'MongoDB Atlas', 'npm workspaces'] },
      ],
      challenges: [
        {
          title: 'Sessions that stay out of JavaScript',
          challenge:
            'A store holds addresses and order history, and tokens kept in browser storage are one XSS bug away from being stolen.',
          solution:
            'Short-lived JWTs with refresh tokens, both in HttpOnly cookies, and role checks on the API so admin routes are closed to everyone else.',
        },
        {
          title: 'Finding the right fit fast',
          challenge:
            'As the catalogue grows, a search request on every keystroke makes listings jumpy and loads the API.',
          solution:
            'Debounced search combined with filters, sort and pagination on the API, and size and colour handled as variants of one product rather than separate listings.',
        },
        {
          title: 'A storefront that never shows blank',
          challenge:
            'The API runs on a host that can be slow to wake or briefly unavailable, and an empty shop window loses the sale.',
          solution:
            'The storefront falls back to mock data when the API is offline, so the catalogue still renders.',
        },
        {
          title: 'One contract across web and API',
          challenge:
            'Two apps describing the same products and orders drift apart one field at a time.',
          solution:
            'A shared package of TypeScript types and constants, with Zod validating forms on the way in.',
        },
      ],
      experience: [
        'Dark and light themes, a search bar in the header, and wishlist, account and cart one tap away.',
        'Featured drops and new arrivals carry discount and “new” badges with quick view.',
        'Orders are tracked on a timeline from placement to delivery.',
      ],
      gallery: [
        { src: '/proRush.png', caption: 'The storefront on desktop and phone: hero, categories and featured drops.' },
      ],
      links: [{ label: 'Live site', href: 'https://rushfashion.shop/' }],
    },
  },
  {
    slug: 'affiliate-platform',
    number: '03',
    category: 'CRM Platform · Micro-frontends',
    title: 'Affiliate CRM & Campaign Analytics Platform',
    outcome:
      'A three-app micro-frontend CRM — I built the Admin and Client applications, and the component library all three render from.',
    context: 'Jasper Colin',
    role: 'Frontend Developer',
    year: '2025 — Now',
    tech: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Micro-frontends'],
    featured: true,
    caseStudy: {
      overview:
        'A CRM platform for B2B market research, data insights and analytics, assembled from three independently deployable applications — Admin, Client and Supplier. I built two of them: Admin, where campaigns and accounts are managed and configured, and Client, where external users work through campaign and analytics workflows. Underneath all three sits the shared component library I own.',
      problem:
        'Three products with heavily overlapping interface needs had to ship on their own cadence without the UI drifting apart — and without three teams rebuilding the same screens three times.',
      role: [
        'Built the Admin and Client applications within the three-app micro-frontend platform.',
        'Architected and maintain the shared, versioned UI component library consumed by all three micro-frontends.',
        'Established the patterns that let each application deploy modularly and independently.',
        'Wired UI workflows into backend intelligence services for an AI-powered lead-generation product.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail:
            'Admin and Client as separate React + Next.js applications, each deployed independently of the others.',
        },
        {
          layer: 'Shared UI',
          detail:
            'A versioned component library — the interface contract every micro-frontend renders from.',
        },
        {
          layer: 'Composition',
          detail: 'Admin, Client and Supplier composed into one coherent CRM platform.',
        },
        {
          layer: 'Services',
          detail: 'UI workflows connected to backend intelligence services powering lead generation.',
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
          title: 'Independent deployment without UI drift',
          challenge:
            'Each application shipped on its own schedule, so shared surfaces risked diverging in behaviour and style over time.',
          solution:
            'A single versioned component library became the contract between apps — interaction and visual patterns change in one place and propagate on upgrade, so coherence is a dependency bump rather than a manual sync.',
        },
        {
          title: 'A library three apps depend on',
          challenge:
            'Once every application consumes the same primitives, a careless change breaks all three — and common patterns were still being rebuilt per app.',
          solution:
            'Consolidated those patterns into the library, versioned it and kept its surface deliberate, so consumers adopt changes on their own schedule. It cut duplicate code and reduced new-feature time by an estimated 40%.',
        },
        {
          title: 'Role-appropriate interfaces without forking',
          challenge:
            'Admin, client and supplier users need different things from what is often the same underlying screen.',
          solution:
            'Composed those screens from shared primitives with role-specific arrangement, rather than maintaining parallel implementations.',
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
    slug: 'twinkle-portfolio',
    number: '04',
    category: 'Portfolio · Creative Development',
    title: 'Product Designer Portfolio — Twinkle Khandelwal',
    outcome:
      'A neobrutalist portfolio for a UI/UX designer, with her Behance work pulled in live and music synthesised in the browser.',
    context: 'Twinkle Khandelwal',
    role: 'Creative Developer',
    tech: ['Next.js', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'Lenis', 'Web Audio API'],
    image: '/proTwinkle.png',
    href: 'https://twinkle-ux-portfolio.vercel.app/',
    featured: true,
    caseStudy: {
      overview:
        'A portfolio for Twinkle Khandelwal, a UI/UX designer at Melange Digital. The visual language is light, minimal and neobrutalist: thick ink borders, hard offset shadows, draggable stickers and a palette of six accents. Her Behance projects flow in on their own, and the site has its own soundtrack, generated live in the browser.',
      problem:
        'A designer’s portfolio is itself a design sample, so it has to show personality without getting in the way of the work. It also had to stay current without her touching code, because new case studies go to Behance first.',
      role: [
        'Built the whole site on Next.js 15 with server components and incremental static regeneration.',
        'Wrote a server-side Behance integration with a dependency-free RSS parser and a static fallback.',
        'Turned the brief into a token-based design system in Tailwind CSS 4: colours, brutalist borders, offset shadows, highlighter boxes and outlined type.',
        'Choreographed the motion: a real-progress preloader, a kinetic variable-font hero, pinned scroll scenes and a horizontal work gallery.',
        'Built a generative lo-fi ambient engine on the Web Audio API.',
      ],
      architecture: [
        {
          layer: 'Framework',
          detail: 'Next.js 15.5 App Router. An async server component fetches Behance and renders every section.',
        },
        {
          layer: 'Content',
          detail:
            'All personal copy lives in one file, drawn from her résumé, so every section updates without touching a component.',
        },
        {
          layer: 'Behance',
          detail:
            'The profile’s RSS feed, fetched on the server, parsed with a small regex parser and revalidated every six hours, with a snapshot as fallback.',
        },
        {
          layer: 'Motion',
          detail: 'GSAP and ScrollTrigger for pinned scenes, Framer Motion for springs, and Lenis driven by the GSAP ticker.',
        },
        {
          layer: 'Sound',
          detail: 'A Web Audio engine: chord pads, bass, a randomised pluck melody, delay, reverb and tape hiss.',
        },
      ],
      tech: [
        { group: 'Framework', items: ['Next.js', 'React', 'JavaScript', 'Tailwind CSS'] },
        { group: 'Motion', items: ['GSAP', 'ScrollTrigger', 'Framer Motion', 'Lenis'] },
        { group: 'Platform', items: ['Web Audio API', 'Behance RSS', 'ISR', 'Vercel'] },
      ],
      challenges: [
        {
          title: 'Live work without an API',
          challenge:
            'Behance shut down its public API, but the portfolio still had to show her latest projects without anyone editing the site.',
          solution:
            'The server reads her profile’s RSS feed with a browser-like user agent, extracts title, link, date and a higher-resolution cover, and regenerates the page every six hours. If the feed fails, a static snapshot keeps the grid full.',
        },
        {
          title: 'A loader that tells the truth',
          challenge:
            'Most preloaders count to 100 on a timer, whether or not anything has loaded.',
          solution:
            'The counter tracks real work: fonts, page resources and the key Behance covers. It reaches 100 only when they have loaded, with a 1.6-second minimum and a 10-second safety cap.',
        },
        {
          title: 'Music with no audio files',
          challenge:
            'Background music normally means licensing, a large download and a loop you can hear repeat.',
          solution:
            'The soundtrack is synthesised live, so it never repeats exactly. It starts only from a click, remembers the visitor’s choice and fades out when the tab is hidden.',
        },
        {
          title: 'Smooth scroll that keeps pins in sync',
          challenge:
            'Smooth scrolling and pinned ScrollTrigger scenes run on separate clocks, and pins drift or jitter.',
          solution:
            'Lenis is driven by the GSAP ticker, and every animation is cleaned up on unmount through gsap.context and gsap.matchMedia.',
        },
      ],
      performance: [
        'Behance covers go through next/image, and the page is statically generated, then revalidated.',
        'Reduced motion turns off the intro, scroll pinning, marquees and the custom cursor, and shows content in its final state.',
      ],
      experience: [
        'Letters of her name swell, thin and tilt away from the cursor along the variable font’s weight and width axes. Without a cursor, a soft wave drifts through instead.',
        'Process cards stack and spread on scroll, a pinned word switcher floods the screen with colour, and the work gallery scrolls sideways with 3D tilt.',
        'Client projects link to their Behance case study automatically when one exists.',
      ],
      gallery: [
        { src: '/proTwinkle.png', caption: 'Brand identity case study: bold type, stickers and colour.' },
      ],
      links: [{ label: 'Live site', href: 'https://twinkle-ux-portfolio.vercel.app/' }],
    },
  },
  {
    slug: 'task-time-tracker',
    number: '05',
    category: 'Productivity · Full-stack App',
    title: 'Task & Time Tracker',
    outcome:
      'A full-stack time tracker whose clock stays honest across tabs, reloads, devices and midnight.',
    context: 'Personal project',
    role: 'Full-stack Engineer',
    year: '2026',
    tech: ['Next.js', 'TypeScript', 'Express', 'PostgreSQL', 'Prisma', 'TanStack Query'],
    image: '/proTracker.png',
    href: 'https://task-time-tracker-nk77.vercel.app/',
    featured: true,
    caseStudy: {
      overview:
        'A small productivity app: write down tasks, run a timer while you work on them, and see where the time went each day and week. A Next.js front end talks to an Express and PostgreSQL API, in one npm-workspaces repo. The feature list is short on purpose — the effort went into the parts that are easy to get subtly wrong.',
      problem:
        'Time trackers fail quietly. A browser clock drifts or sleeps, two tabs start two timers, a session runs past midnight or through a daylight-saving change — and the numbers stop adding up. Get any of it wrong and the one thing the product promises, an honest record of time, is gone.',
      role: [
        'Designed and built the whole product: Next.js front end, Express API, PostgreSQL schema and deployment.',
        'Pushed every rule I could into the database — a partial unique index, a composite foreign key and CHECK constraints, hand-written into versioned migrations.',
        'Wrote the daily and weekly analytics as timezone-aware SQL instead of client-side arithmetic.',
        'Built cookie-based auth with Argon2id hashing and refresh tokens that rotate on every use.',
        'Added an optional AI helper that turns a rough note into a clean task title and description, with Gemini or Claude behind one interface.',
      ],
      architecture: [
        {
          layer: 'Frontend',
          detail:
            'Next.js 16 and React 19 with Tailwind v4 and shadcn/ui. TanStack Query is the only client-side copy of server state; forms run on React Hook Form and Zod.',
        },
        {
          layer: 'API',
          detail:
            'Express 5 in four modules, each shaped routes → controller → service → repository. An architecture test fails the build if a layer reaches past its neighbour.',
        },
        {
          layer: 'Database',
          detail:
            'PostgreSQL through Prisma 6, with the constraints the app depends on written as raw SQL in the migrations. CI replays every migration and fails on drift.',
        },
        {
          layer: 'Shared',
          detail:
            'One package of Zod schemas, response types and formatters used by both apps — and the source of the generated OpenAPI document.',
        },
        {
          layer: 'Hosting',
          detail:
            'Web on Vercel, API on Render. Next.js proxies the API path so session cookies stay first-party.',
        },
      ],
      tech: [
        {
          group: 'Interface',
          items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'React Hook Form', 'Zod'],
        },
        { group: 'API & data', items: ['Express', 'Prisma', 'PostgreSQL', 'Argon2id', 'JWT', 'pino'] },
        { group: 'AI', items: ['Gemini', 'Claude'] },
        { group: 'Delivery', items: ['Vercel', 'Render', 'npm workspaces', 'OpenAPI'] },
      ],
      challenges: [
        {
          title: "A timer the browser can't get wrong",
          challenge:
            'Client clocks drift, sleep and can be changed. A reload, a sleeping laptop and a second tab would each tell a different story.',
          solution:
            'The server owns the clock. Start and stop take no body — the server stamps both ends and computes the duration. The client anchors to the elapsed time the API reports and renders forward from it, refetching on focus, on reconnect and once a minute to catch a timer stopped on another device.',
        },
        {
          title: 'Exactly one running timer, even under a race',
          challenge:
            'Two start requests arriving together would both pass an "is anything running?" check written in application code.',
          solution:
            "A partial unique index on each user's running log lets the database reject the second start — returned as a 409, its transaction rolled back. Stop is a conditional update, so two concurrent stops can't both succeed.",
        },
        {
          title: "Days that aren't 24 hours long",
          challenge:
            "Sessions cross midnight, daylight-saving days are 23 or 25 hours, and the viewer's day isn't the server's.",
          solution:
            "A day is a half-open range in the viewer's IANA timezone, computed by PostgreSQL. Sessions are split across the days they touch, a running timer counts up to now, and a week is seven of those windows.",
        },
        {
          title: "No one sees anyone else's data",
          challenge: 'One missing WHERE clause turns a task tracker into a data leak.',
          solution:
            "The user id always comes from the verified session, every query is scoped by owner, someone else's task returns the same 404 as a missing one, and an authorization suite checks every task endpoint in both directions.",
        },
      ],
      performance: [
        'Analytics are aggregated in SQL, so the browser receives a small JSON summary instead of every time log.',
        'Indexes are written for the queries the app actually runs.',
      ],
      experience: [
        'Dark interface with an orange accent — a sidebar on desktop, a drawer on phones — and it respects reduced-motion settings.',
        'Starting a timer on a pending task moves it to in progress; completing a task stops its timer.',
        'The selected week lives in the URL, so a week of work can be shared as a link.',
        'The AI helper only fills in the form; you still review and save the task. With no provider configured, everything else keeps working.',
      ],
      gallery: [
        {
          src: '/proTracker.png',
          caption: 'Dashboard, task list and a running timer, on desktop and phone.',
        },
      ],
      links: [
        { label: 'Live Demo', href: 'https://task-time-tracker-nk77.vercel.app/' },
        { label: 'Source on GitHub', href: 'https://github.com/werahul/task-time-tracker' },
      ],
    },
  },
]

/**
 * "Also built". The first three were featured before and keep their case
 * studies; the rest link straight to the live site.
 */
const secondary: Project[] = [
  {
    slug: 'ai-3d-avatars',
    number: '06',
    category: 'Generative AI · SaaS',
    title: 'AI-Powered 3D Avatars & Immersive Experiences',
    outcome:
      'The web front end for a generative-AI product — real-time 3D asset rendering and avatar generation in the browser.',
    context: 'GenVR Research',
    role: 'Frontend Engineer',
    tech: ['Next.js', 'TypeScript', 'React Redux', 'Three.js', 'WaveSurfer.js', 'Django'],
    image: '/proGenvr.png',
    href: 'https://app.genvrresearch.com/',
    featured: false,
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
    number: '07',
    category: 'Fintech · Marketing Site',
    title: 'AI-Powered Trading Platform',
    outcome:
      'The marketing and onboarding site for an AI-driven trading platform, with personalised course recommendations.',
    context: 'NeoTrader',
    role: 'Frontend Engineer',
    tech: ['JavaScript', 'HTML/CSS', 'TailwindCSS', 'PHP'],
    image: '/proNeo.png',
    href: 'https://neotrader.in/',
    featured: false,
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
    number: '08',
    category: 'Marketing · Web Platform',
    title: 'Digital Marketing Agency Website',
    outcome:
      'A 50+ page marketing website with an integrated blog, a careers module and server-side application handling.',
    context: 'Melange Digital',
    role: 'Frontend Engineer',
    tech: ['React', 'TailwindCSS', 'GSAP', 'Framer Motion', 'Node.js', 'Express', 'Nodemailer'],
    image: '/proMelange.jpg',
    href: 'https://melangedigital.co/',
    featured: false,
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
  {
    slug: 'pr-agency',
    number: '09',
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
  },
  {
    slug: 'broking-platform',
    number: '10',
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
  },
  {
    slug: 'house-of-tales',
    number: '11',
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
  },
  {
    slug: 'aartech-solonics',
    number: '12',
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
  },
  {
    slug: 'devboost',
    number: '13',
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
  },
]

export const projects: Project[] = [...featured, ...secondary]
export const featuredProjects = featured
export const secondaryProjects = secondary

/** every project with a case study page: featured first, then the archived ones */
const caseStudies = projects.filter((p) => p.caseStudy)
export const caseStudySlugs = caseStudies.map((p) => p.slug)

export function getProject(slug: string): Project | undefined {
  return caseStudies.find((p) => p.slug === slug)
}

export function adjacentProjects(slug: string) {
  const i = caseStudies.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: undefined, next: undefined }
  return {
    prev: caseStudies[(i - 1 + caseStudies.length) % caseStudies.length],
    next: caseStudies[(i + 1) % caseStudies.length],
  }
}
