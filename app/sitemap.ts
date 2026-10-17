import type { MetadataRoute } from 'next'
import { caseStudySlugs } from '@/content/projects'
import { siteUrl } from '@/lib/site'

/**
 * Canonical, indexable URLs only. No `lastModified`: the content carries no
 * real edit dates, and stamping every URL with the build time teaches search
 * engines to ignore the field. (`changefreq` and `priority` are ignored by
 * Google, so they are left out too.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/` },
    ...caseStudySlugs.map((slug) => ({ url: `${siteUrl}/projects/${slug}` })),
  ]
}
