import type { MetadataRoute } from 'next'
import { isIndexable, siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Deploy previews and local builds must never be indexed — otherwise a
  // preview domain can outrank the real site for the same content.
  if (!isIndexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
