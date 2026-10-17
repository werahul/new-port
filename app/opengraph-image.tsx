import { ImageResponse } from 'next/og'
import { OgCard, ogSize } from '@/lib/og-card'
import { siteDescription, siteName } from '@/lib/site'

// The edge runtime is the supported path for ImageResponse; the node build of
// @vercel/og cannot resolve its bundled assets on Windows.
export const runtime = 'edge'

export const alt = `${siteName} — Full-Stack Engineer & Creative Developer`
export const size = ogSize
export const contentType = 'image/png'

/**
 * The social card is generated at build time rather than shipped as a binary,
 * so it can never drift from the copy it advertises.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        title={siteName}
        line={`${siteDescription.split(' — ')[0]}.`}
        tags={['React', 'Next.js', 'Three.js', 'Node']}
      />
    ),
    size,
  )
}
