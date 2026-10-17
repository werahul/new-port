import { ImageResponse } from 'next/og'
import { getProject } from '@/content/projects'
import { OgCard, ogSize } from '@/lib/og-card'
import { siteDescription, siteName } from '@/lib/site'

// see app/opengraph-image.tsx
export const runtime = 'edge'

export const alt = `Case study by ${siteName}`
export const size = ogSize
export const contentType = 'image/png'

/**
 * Each case study shares as its own card — title, outcome and stack — instead
 * of a multi-megabyte screenshot cropped unpredictably by each platform.
 */
export default function ProjectOpengraphImage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  return new ImageResponse(
    project ? (
      <OgCard
        kicker={`Case study · ${siteName}`}
        title={project.title}
        line={project.outcome}
        tags={project.tech.slice(0, 4)}
      />
    ) : (
      <OgCard title={siteName} line={`${siteDescription.split(' — ')[0]}.`} tags={[]} />
    ),
    size,
  )
}
