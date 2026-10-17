/**
 * One source of truth for the canonical origin, used by metadata, canonical
 * links, Open Graph, the sitemap and robots.txt.
 *
 * Resolution order is deliberate: an explicit override wins, then the host's
 * own build-time variables — Netlify's (on Netlify only), then Vercel's — then
 * localhost for `next dev`. That means a deploy on either host emits correct absolute URLs
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

/**
 * Netlify's variables are read only on Netlify. `URL` is far too generic a name
 * to trust anywhere else: a build environment that set it to an opaque id once
 * published `https://25e102d6-…/` as every canonical and sitemap entry, and
 * Search Console could not fetch the sitemap.
 */
const onNetlify = process.env.NETLIFY === 'true'

const candidates = [
  process.env.NEXT_PUBLIC_SITE_URL,
  onNetlify ? process.env.URL : undefined, // Netlify: the site's primary domain
  onNetlify ? process.env.DEPLOY_PRIME_URL : undefined, // Netlify: a branch / preview deploy
  vercelHost,
]

const LOCAL = 'http://localhost:3000'

/**
 * Normalise before parsing. A bare hostname is much the most common way this
 * gets configured by hand (`my-site.vercel.app`, `www.example.com`), so a
 * missing scheme is assumed to be https.
 *
 * Anything that isn't a public hostname — unparseable, or with no dot in it
 * (an id, a typo) — is rejected, and the next candidate is tried. With none
 * left the origin is localhost, which also keeps the build out of the index
 * (see `isIndexable`) instead of publishing a broken canonical. It never throws:
 * a wrong canonical URL is a bad deploy; an exception here is no deploy at all.
 */
function toOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/+$/, '')
  if (!trimmed) return undefined
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    return url.hostname.includes('.') ? url.origin : undefined
  } catch {
    return undefined
  }
}

export const siteUrl = candidates.map(toOrigin).find(Boolean) ?? LOCAL

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
