'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Lock,
  Key,
  FileCode,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Server,
  EyeOff,
  Settings,
  Package,
  Layers,
  FileUp,
  MousePointer,
  HardDrive,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { Section, SectionHeading } from '@/components/primitives'
import { usePinnedSequence } from '@/components/motion'

/**
 * How much scroll each practice owns while the rail is pinned, as a share of
 * the viewport. Seventeen is a lot of steps, so this is well under the Skills
 * map's 0.55 — at 0.3 the whole set runs to a little over five screens, which
 * is about as long as a held section can hold attention.
 */
const SCROLL_PER_PRACTICE = 0.3

interface Topic {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  myApproach: string
  myBestPractices: string[]
}

const securityTopics: Topic[] = [
  {
    id: 'auth',
    title: 'Authentication & Authorization',
    icon: UserCheckIcon,
    myApproach:
      'In client projects and enterprise portals I build state-driven authorization: session state managed reactively in the frontend store to show or hide UI, with every API request routed through interceptors that enforce cryptographic verification on the backend. Rich client interactivity, strict server-side policy.',
    myBestPractices: [
      'Silent token refresh that runs asynchronously before JWTs expire.',
      'Hide structural components and actions reactively to guide users at the UI layer.',
      'Enforce identical authorization mappings in the API layer — never trust client logic.',
    ],
  },
  {
    id: 'route-protection',
    title: 'Route Protection & RBAC',
    icon: Lock,
    myApproach:
      'Route-level protection via Next.js edge middleware that checks claims and token metadata before page chunks load. Unauthorized users are redirected at the edge, before any sensitive JavaScript is downloaded or hydrated.',
    myBestPractices: [
      'Intercept restricted endpoints at the edge to protect code-split assets.',
      'Group routes under access tiers (e.g. /admin/*).',
      'Re-check tokens during layout render before components mount.',
    ],
  },
  {
    id: 'token-handling',
    title: 'Secure Token Handling',
    icon: Key,
    myApproach:
      'To mitigate session hijacking and XSS token harvesting, access tokens live only in application memory (store / React state) and refresh tokens sit in Secure, SameSite=Strict, HttpOnly cookies — unreadable by client scripts.',
    myBestPractices: [
      'Short expiry (5–15 min) on in-memory access tokens.',
      'HttpOnly on auth cookies to shield them from document.cookie.',
      'Prompt server-side revocation to invalidate compromised credentials.',
    ],
  },
  {
    id: 'validation',
    title: 'Input Validation & Sanitization',
    icon: FileCode,
    myApproach:
      'Never trust user input. Validation schemas with Zod for form processing; DOMPurify before rendering or storing anything user-provided, neutralising injection risk at the point of capture.',
    myBestPractices: [
      'Map Zod validation to form controls for real-time feedback.',
      'Sanitize input at point of capture with DOMPurify.',
      'Reject values outside logical bounds.',
    ],
  },
  {
    id: 'xss',
    title: 'XSS Protection',
    icon: ShieldAlert,
    myApproach:
      "Lean on React's default string escaping. Where raw rich text is unavoidable, pass it through a strict DOMPurify config that strips scripts, event handlers and javascript: protocols.",
    myBestPractices: [
      'Avoid dangerouslySetInnerHTML unless wrapped in a sanitised helper.',
      'Verify hyperlinks resolve to http/https schemes.',
      'Ship a strict Content Security Policy to block inline execution.',
    ],
  },
  {
    id: 'csrf',
    title: 'CSRF Prevention',
    icon: ShieldCheck,
    myApproach:
      'APIs rely on custom headers (Bearer authorization) that browsers do not auto-send cross-site. For cookie-based setups, SameSite=Strict is enforced.',
    myBestPractices: [
      'Bearer headers instead of session cookies for cross-origin calls.',
      'Confirm SameSite policies on every server-issued session token.',
      'Validate CORS pre-flight origin for state-changing methods.',
    ],
  },
  {
    id: 'csp',
    title: 'Content Security Policy',
    icon: Globe,
    myApproach:
      'Restrictive CSP delivered via HTTP headers: execution limited to first-party and trusted CDNs, single-use nonces for inline scripts, no unsafe-inline or unsafe-eval.',
    myBestPractices: [
      "default-src 'self' to lock down connections by default.",
      'Server-generated nonces for trusted inline scripts.',
      'report-only directives during staging to catch violations early.',
    ],
  },
  {
    id: 'api-security',
    title: 'Secure API Communication',
    icon: Server,
    myApproach:
      'All traffic over HTTPS (TLS 1.3). CORS scoped to explicit frontend origins — never a wildcard for authenticated endpoints.',
    myBestPractices: [
      'Enforce TLS 1.3 for encryption in transit.',
      'Whitelist client domains explicitly in CORS.',
      'Request timeouts on HTTP clients to manage bottlenecks gracefully.',
    ],
  },
  {
    id: 'sensitive-data',
    title: 'Sensitive Data Handling',
    icon: EyeOff,
    myApproach:
      'Credentials, password inputs and PII stay out of global stores and persisted files. Passwords live in transient variables cleared once the request completes; console leaks are stripped at build time.',
    myBestPractices: [
      'Clear passwords from memory immediately after the auth request.',
      'Never write credentials or profiles to local logs.',
      'Strip console output at compile time (Terser).',
    ],
  },
  {
    id: 'env-variables',
    title: 'Environment Variables & Secrets',
    icon: Settings,
    myApproach:
      'Strict separation of secrets and config. Server keys never reach the client bundle — only NEXT_PUBLIC_ public parameters are compiled in.',
    myBestPractices: [
      'Database URLs, payment secrets and JWT keys stay server-side.',
      'All .env files listed in .gitignore.',
      'Validate required keys at build time to catch misconfiguration.',
    ],
  },
  {
    id: 'dependency-security',
    title: 'Dependency Security',
    icon: Package,
    myApproach:
      'Third-party supply-chain risk managed by scanning. npm audit plus Snyk in CI to flag and block insecure upgrades before they reach production.',
    myBestPractices: [
      'Lockfile installs (npm ci) for reproducible pipelines.',
      'Automated vulnerability audits in pre-commit hooks.',
      'Check project health and support status before adopting a package.',
    ],
  },
  {
    id: 'security-headers',
    title: 'Security Headers',
    icon: Layers,
    myApproach:
      'Hardened HTTP headers at the host (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, HSTS) on every route.',
    myBestPractices: [
      'nosniff to mitigate MIME-type sniffing.',
      'Strict-Transport-Security to force HTTPS.',
      'strict-origin referrer policy to limit referrer leakage.',
    ],
  },
  {
    id: 'file-upload',
    title: 'File Upload Security',
    icon: FileUp,
    myApproach:
      'Uploads checked for size, MIME category and magic bytes on the client, then routed to isolated storage buckets where files are renamed to random hashes to prevent execution.',
    myBestPractices: [
      'Validate size and real binary header (magic bytes).',
      'Restrict selectable file types on the input.',
      'Never store user uploads in the application root.',
    ],
  },
  {
    id: 'clickjacking',
    title: 'Clickjacking Protection',
    icon: MousePointer,
    myApproach:
      'Block embedding with X-Frame-Options: DENY and CSP frame-ancestors, so other origins cannot render the app in a hidden frame.',
    myBestPractices: [
      'X-Frame-Options: DENY against third-party framing.',
      "CSP frame-ancestors 'none' as a second barrier.",
      'Frame-busting in base layouts for older browsers.',
    ],
  },
  {
    id: 'storage-security',
    title: 'Browser Storage Security',
    icon: HardDrive,
    myApproach:
      'A strict storage classification: sensitive data (JWTs, refresh keys, PII) in HttpOnly cookies; non-sensitive preferences (locale, theme) in local or session storage.',
    myBestPractices: [
      'Keep access credentials out of localStorage.',
      'Clear sessionStorage on sign-out.',
      'Encrypt any local data that must persist.',
    ],
  },
  {
    id: 'error-handling',
    title: 'Secure Error Handling',
    icon: AlertCircle,
    myApproach:
      'Error boundaries keep stack traces and database errors out of the browser. Users see generic messages; full traces go to a secure service like Sentry.',
    myBestPractices: [
      'Return generic messages instead of raw API errors.',
      'Keep stack details, SQL and traces on secure servers.',
      'Global React error boundaries to prevent client crashes.',
    ],
  },
  {
    id: 'best-practices',
    title: 'General Practice',
    icon: CheckCircle,
    myApproach:
      'Security as a build-time constraint: eslint-plugin-security in the lint step, threat review before release, interfaces designed against the OWASP Top 10.',
    myBestPractices: [
      'ESLint security presets to catch unsafe patterns in development.',
      'Monthly audit of third-party package security.',
      'Security checklists baked into release templates.',
    ],
  },
]

function UserCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}

export function SecuritySection() {
  const [activeTopicId, setActiveTopicId] = useState(securityTopics[0].id)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const railRef = useRef<HTMLDivElement>(null)

  const activeTopic =
    securityTopics.find((t) => t.id === activeTopicId) || securityTopics[0]

  /**
   * Keep the newly selected desktop tab inside its own scroll area. Scoped to
   * the rail rather than `scrollIntoView`, which also walks up and scrolls the
   * page — fighting Lenis and yanking the section around.
   */
  const revealTab = useCallback((index: number) => {
    const rail = railRef.current
    const tab = tabRefs.current[index]
    if (!rail || !tab) return
    const top = tab.offsetTop
    const bottom = top + tab.offsetHeight
    if (top < rail.scrollTop) rail.scrollTop = top
    else if (bottom > rail.scrollTop + rail.clientHeight) {
      rail.scrollTop = bottom - rail.clientHeight
    }
  }, [])

  const select = useCallback(
    (id: string, index: number) => {
      setActiveTopicId(id)
      revealTab(index)
    },
    [revealTab],
  )

  /**
   * THE RAIL IS PINNED AND THE SCROLL WALKS THE PRACTICES.
   *
   * The stage holds still while the page scrolls through it, one practice at a
   * time from Authentication through to the last, then releases. `revealTab`
   * keeps the rail's own scroll area following along, so the highlighted entry
   * is always visible even though the rail holds seventeen of them.
   *
   * Desktop only — this whole two-column stage is `hidden lg:grid`, and below
   * that breakpoint the practices are an accordion that is left alone.
   */
  const {
    ref: stageRef,
    goTo,
    pinned: scrollDriven,
  } = usePinnedSequence<HTMLDivElement>({
    count: securityTopics.length,
    scrollPerStep: SCROLL_PER_PRACTICE,
    onIndex: useCallback(
      (i: number) => {
        select(securityTopics[i].id, i)
      },
      [select],
    ),
  })

  /**
   * Selection first so the rail answers immediately, then the page moves onto
   * that practice's slice — `goTo` mutes the scroll updates it is about to
   * cause, and does nothing at all when the rail is not pinned.
   */
  const goToTopic = useCallback(
    (i: number) => {
      const topic = securityTopics[i]
      if (!topic) return
      select(topic.id, i)
      goTo(i)
    },
    [select, goTo],
  )

  const activeIndex = Math.max(
    0,
    securityTopics.findIndex((t) => t.id === activeTopicId),
  )

  // Roving-tabindex keyboard support, matching the Skills rail.
  const onRailKeyDown = (e: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const i = securityTopics.findIndex((t) => t.id === activeTopicId)
    let next = i
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight')
      next = (i + 1) % securityTopics.length
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
      next = (i - 1 + securityTopics.length) % securityTopics.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = securityTopics.length - 1
    goToTopic(next)
    // preventScroll: the tab lives inside the pinned stage, so the browser's
    // own scroll-into-view would fight the scroll we just started.
    tabRefs.current[next]?.focus({ preventScroll: true })
  }

  return (
    <Section id="security" accent="cobalt" atmosphere>
      <SectionHeading
        index="05"
        label="Approach"
        question="How do I keep it safe?"
        title="How I keep production systems safe"
        description="Security handled as a build-time constraint, not an afterthought — from token handling and RBAC to CSP, headers and dependency hygiene."
      />

      {/* Desktop: the pinned stage — tab rail + detail panel. It holds still
          in the viewport while the page scrolls through all seventeen. */}
      <div
        ref={stageRef}
        className="rhythm-lead hidden gap-10 lg:grid lg:grid-cols-12"
      >
        <div data-seq className="min-w-0 lg:col-span-4">
          <div className="sticky top-28">
            {/* Pinned, the rail is the only thing telling the visitor that
                scrolling is still going somewhere — so it says how far
                through the seventeen they have got. */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="type-metadata text-foreground">
                  {securityTopics.length} practices
                </span>
                <span className="type-metadata">
                  {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(securityTopics.length).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-2.5 h-px w-full bg-line">
                <div
                  aria-hidden
                  className="h-px origin-left bg-accent-strong transition-transform duration-500 ease-editorial"
                  style={{
                    transform: `scaleX(${(activeIndex + 1) / securityTopics.length})`,
                  }}
                />
              </div>
              {scrollDriven && (
                <p className="type-metadata mt-2.5 text-muted-foreground">
                  Scroll to advance
                </p>
              )}
            </div>
            <div
              ref={railRef}
              role="tablist"
              aria-orientation="vertical"
              aria-label="Security practices"
              onKeyDown={onRailKeyDown}
              className="custom-scrollbar flex max-h-[62vh] flex-col overflow-y-auto pr-2"
            >
              {securityTopics.map((topic, i) => {
                const Icon = topic.icon
                const isActive = activeTopicId === topic.id
                return (
                  <button
                    key={topic.id}
                    ref={(el) => {
                      tabRefs.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`sec-tab-${topic.id}`}
                    aria-selected={isActive}
                    aria-controls="sec-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => goToTopic(i)}
                    className={`flex items-center gap-3 border-l-2 py-3 pl-4 pr-3 text-left text-sm transition-colors duration-300 ease-editorial ${
                      isActive
                        ? 'border-accent-strong font-medium text-foreground'
                        : 'border-line text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{topic.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div data-seq className="min-w-0 lg:col-span-8">
          {/* `key` remounts the panel, so the CSS enter animation replays on
              every change — the crossfade without an animation runtime. */}
          <div
            key={activeTopic.id}
            role="tabpanel"
            id="sec-panel"
            aria-labelledby={`sec-tab-${activeTopic.id}`}
            tabIndex={0}
            className="animate-fade-in-up surface-accent rounded-2xl p-8 focus-visible:outline-none md:p-10 lg:min-h-[520px]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-line bg-background p-3 text-accent-strong">
                <activeTopic.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="type-metadata">Practice</span>
                <h3 className="type-engineering mt-1 text-foreground">
                  {activeTopic.title}
                </h3>
              </div>
            </div>

            <div className="mt-7">
              <span className="type-metadata">Approach</span>
              <p className="mt-2 text-[0.975rem] leading-relaxed text-muted-foreground">
                {activeTopic.myApproach}
              </p>
            </div>

            <div className="mt-7 rounded-xl border border-line bg-[rgb(var(--accent)/0.09)] p-6">
              <span className="type-metadata flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5" /> In practice
              </span>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {activeTopic.myBestPractices.map((practice, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent-strong" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: accordion. Height animates via the 0fr→1fr grid technique —
          pure CSS, no measurement, and it collapses correctly on resize. */}
      <div className="rhythm-lead flex flex-col gap-3 lg:hidden">
        {securityTopics.map((topic) => {
          const Icon = topic.icon
          const isExpanded = activeTopicId === topic.id
          return (
            <div
              key={topic.id}
              data-seq
              className="surface overflow-hidden rounded-xl"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setActiveTopicId(isExpanded ? '' : topic.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`sec-acc-${topic.id}`}
                  className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors ${
                    isExpanded ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{topic.title}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </h3>

              <div
                id={`sec-acc-${topic.id}`}
                data-open={isExpanded}
                className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-editorial motion-reduce:transition-none data-[open=true]:grid-rows-[1fr]"
              >
                <div className="overflow-hidden">
                  <div className="space-y-4 border-t border-line p-5">
                    <div>
                      <span className="type-metadata">Approach</span>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {topic.myApproach}
                      </p>
                    </div>
                    <div className="rounded-lg border border-line bg-[rgb(var(--accent)/0.09)] p-4">
                      <span className="type-metadata text-muted-foreground">
                        In practice
                      </span>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {topic.myBestPractices.map((practice, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent-strong" />
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
