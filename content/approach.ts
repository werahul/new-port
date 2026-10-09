/**
 * The "Approach" section's content: how I treat security across the stack.
 * Each topic pairs the approach with three concrete practices.
 */
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
  UserCheck,
  type LucideIcon,
} from 'lucide-react'

export interface Topic {
  id: string
  title: string
  icon: LucideIcon
  myApproach: string
  myBestPractices: string[]
}

export const securityTopics: Topic[] = [
  {
    id: 'auth',
    title: 'Authentication & Authorization',
    icon: UserCheck,
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
