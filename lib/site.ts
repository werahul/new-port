/**
 * One source of truth for the canonical origin, used by metadata, canonical
 * links, Open Graph, the sitemap and robots.txt.
 *
 * Resolution order is deliberate: an explicit override wins, then Netlify's
 * build-time variables (`URL` is the site's primary domain, `DEPLOY_PRIME_URL`
 * is a branch/preview deploy), then localhost for `next dev`. That means a
 * Netlify deploy emits correct absolute URLs with no configuration at all.
 */
const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  'http://localhost:3000'

export const siteUrl = raw.replace(/\/+$/, '')

/** True only for the real production domain — used to gate indexing. */
export const isIndexable =
  !siteUrl.includes('localhost') && !siteUrl.includes('deploy-preview')

export const siteName = 'Rahul Kumar'
export const siteTitle = 'Rahul Kumar — Full-Stack Engineer'
export const siteDescription =
  'Full-stack engineer building sophisticated products across the MERN stack, Next.js, and AI-assisted systems — from interface engineering to APIs, data and production architecture.'
