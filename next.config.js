/**
 * Security headers. The site argues for hardened headers in its own "Approach"
 * section, so it sets them on itself.
 *
 * On CSP: this app has no nonce middleware by design — adding one forces every
 * route to render dynamically and throws away static generation on a site that
 * is entirely static. So `script-src` keeps `'unsafe-inline'` — Next's own
 * bootstrap needs it, as does the pre-paint capability script that decides the
 * hero's layout — and the policy instead spends its strictness where it is free
 * and effective: no framing, no plugins, no arbitrary base tag, no off-site
 * form posts.
 */
const isDev = process.env.NODE_ENV !== 'production'

/**
 * The resume lives on Google Drive, so its URL changes every time the file is
 * re-uploaded. `/resume` is the stable address — the one that goes on a CV, in
 * an email signature and on the site itself — and this is the only place the
 * Drive id appears.
 *
 * Deliberately a 307, not a 308: a permanent redirect gets cached hard by
 * browsers and CDNs, and this is a destination we expect to change.
 */
const RESUME_URL =
  process.env.NEXT_PUBLIC_RESUME_URL ||
  'https://drive.google.com/file/d/1IaRX6c10Fr3cf9RRN9N_yHXskA1ytQo6/view'

// The contact form POSTs to an external form backend; its origin has to be
// allowed through connect-src and form-action or the browser blocks the request
// before it leaves the page. Mirrors the resolution order in
// components/sections/contact-section.tsx: an explicit endpoint wins, otherwise
// Web3Forms if an access key is configured.
let contactOrigin = ''
try {
  const endpoint =
    process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
    (process.env.NEXT_PUBLIC_WEB3FORMS_KEY ? 'https://api.web3forms.com/submit' : '')
  if (endpoint) contactOrigin = ' ' + new URL(endpoint).origin
} catch {
  contactOrigin = ''
}

const csp = [
  "default-src 'self'",
  // next dev compiles with eval for HMR; production never needs it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${contactOrigin}${isDev ? ' ws: http://localhost:*' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self'${contactOrigin}`,
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Screenshots are the only images, and they all live in /public.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [{ source: '/resume', destination: RESUME_URL, permanent: false }]
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
