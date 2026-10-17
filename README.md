# Rahul Kumar — portfolio

The portfolio of a full-stack engineer: one scroll-driven 3D world behind a
fully server-rendered page. Every word, link and project fact is in the HTML;
the WebGL scene is an enhancement layered behind it, never a gate in front of it.

## Stack

- **Next.js 14** (App Router, static generation) and **TypeScript**
- **three.js** via **React Three Fiber** and **drei** for the world
- **Lenis** for smooth scrolling, **lucide-react** for icons
- **Web Audio** for the optional generative ambient score (no audio files)
- Hand-written CSS (`app/lab.css`, every class `l-` prefixed); no CSS framework

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the build
npm run lint
```

Copy `.env.example` to `.env.local` for the canonical URL, the résumé link and
the contact form backend. Everything is optional in development.

## Layout

```
app/
  layout.tsx              fonts, nav, smooth scroll, sound, analytics
  page.tsx                the home journey
  projects/[slug]/        case studies
  globals.css             reset and document-level rules
  lab.css                 the design system
components/
  lab/                    nav, loader, sections, case-study parts
  lab/world/              the 3D world: canvas, camera rigs, keyframes, scene objects
  lab/sound/              ambient score and its controls
  ui/smooth-scroll.tsx    Lenis
content/
  lab.ts                  the home page's copy and scene data
  projects.ts             every project and case study
  profile.ts, experience.ts, skills.ts
lib/                      site URL, capability and motion checks
```

## How the world runs

- The page renders and paints without any 3D. The canvas chunk loads on an
  idle moment after first paint (on weaker devices, at the first interaction).
- Each section carries a `data-anchor`; `components/lab/world/keyframes.ts`
  pins the camera to a keyframe per anchor and the rig interpolates between
  them as you scroll.
- `data-world` on the page root (`off` → `pending` → `on`) lets CSS swap the
  static fallbacks for the live scene once it has rendered a real frame.
- Without WebGL, or when the system asks for reduced motion, the page is the
  flat, art-directed version — same content, same structure.

## Deployment

Vercel. Set `NEXT_PUBLIC_SITE_URL` to the custom domain for production (see
`.env.example`); previews are kept out of the index automatically. Security
headers, the CSP and redirects (`/resume`, retired case-study URLs) live in
`next.config.js`.

## Search

- Metadata, canonicals, `robots.txt` and `sitemap.xml` all derive from one
  origin in `lib/site.ts`.
- JSON-LD (`lib/structured-data.ts`): Person, WebSite and ProfilePage on the
  home page; BreadcrumbList, WebPage and CreativeWork on each case study —
  built from `content/`, so it can't say anything the pages don't.
- Social cards are generated per page (`opengraph-image.tsx`, `lib/og-card.tsx`).
