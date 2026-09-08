/**
 * Security headers. The site argues for hardened headers in its own "Approach"
 * section, so it sets them on itself.
 *
 * On CSP: this app has no nonce middleware by design — adding one forces every
 * route to render dynamically and throws away static generation on a site that
 * is entirely static. So `script-src` keeps `'unsafe-inline'` (Next's bootstrap
 * and the pre-paint theme script are inline) and the policy instead spends its
 * strictness where it is free and effective: no framing, no plugins, no
 * arbitrary base tag, no off-site form posts.
 */
const isDev = process.env.NODE_ENV !== 'production'

// The contact form may POST to an external form backend; if one is configured,
// its origin has to be allowed through connect-src or the fetch is blocked.
let contactOrigin = ''
try {
  if (process.env.NEXT_PUBLIC_CONTACT_ENDPOINT) {
    contactOrigin = ' ' + new URL(process.env.NEXT_PUBLIC_CONTACT_ENDPOINT).origin
  }
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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
