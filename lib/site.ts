/**
 * One source of truth for the canonical origin, used by metadata, canonical
 * links, Open Graph, the sitemap and robots.txt.
 *
 * Resolution order is deliberate: an explicit override wins, then the host's
 * own build-time variables — Netlify's, then Vercel's — then localhost for
 * `next dev`. That means a deploy on either host emits correct absolute URLs
 * with no configuration at all.
 *
 * Every name below is read on the server only (metadata, robots, sitemap and
 * the OG image), so the un-prefixed host variables are available. Do not import
 * this from a client component: outside `NEXT_PUBLIC_*`, they inline as
 * undefined in the browser bundle.
 */

/**
 * Vercel exposes hostnames with no scheme (`my-app.vercel.app`), and sets
 * `VERCEL_PROJECT_PRODUCTION_URL` on *every* deploy — previews included. Taking
 * it unconditionally would make a preview claim the production domain as its
 * canonical, so it is only trusted on a production deploy; a preview describes
 * itself by its own per-deployment URL and stays out of the index below.
 */
const vercelEnv = process.env.VERCEL_ENV
const vercelHost =
  vercelEnv === 'production'
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
    : process.env.VERCEL_URL

const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL || // Netlify: the site's primary domain
  process.env.DEPLOY_PRIME_URL || // Netlify: a branch / preview deploy
  vercelHost ||
  'http://localhost:3000'

const LOCAL = 'http://localhost:3000'

/**
 * Normalise before parsing. A bare hostname is much the most common way this
 * gets configured by hand (`my-site.vercel.app`, `www.example.com`), and
 * `new URL()` throws on one — which failed the build inside Next's
 * `collectGenerateParams` with nothing to go on but
 * `TypeError: Invalid URL` / `Failed to collect page data for /_not-found`.
 *
 * So: a missing scheme is assumed to be https, and anything still unparseable
 * degrades to localhost instead of taking the build down. A wrong canonical URL
 * is a bad deploy; an exception here is no deploy at all.
 */
function toOrigin(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return LOCAL
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return new URL(withScheme).origin
  } catch {
    return LOCAL
  }
}

export const siteUrl = toOrigin(raw)

/**
 * True only for the real production domain — used to gate indexing, so that a
 * preview domain can never outrank the real site for the same content.
 */
export const isIndexable =
  !siteUrl.includes('localhost') &&
  !siteUrl.includes('deploy-preview') && // Netlify preview
  vercelEnv !== 'preview' &&
  vercelEnv !== 'development'

export const siteName = 'Rahul Kumar'
export const siteTitle = 'Rahul Kumar — Full-Stack Engineer'
export const siteDescription =
  'Full-stack engineer building sophisticated products across the MERN stack, Next.js, and AI-assisted systems — from interface engineering to APIs, data and production architecture.'
