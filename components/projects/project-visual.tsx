import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Project } from '@/content/projects'

interface ProjectVisualProps {
  project: Project
  priority?: boolean
  sizes?: string
  className?: string
}

/**
 * The single visual for a project — a real screenshot from `/public` when one
 * exists, otherwise an abstract architecture motif built from the project's own
 * layer data. The motif is clearly diagrammatic, never a faked screenshot.
 *
 * The motif sets its own `data-accent`, so it carries the project's hue no
 * matter which section it is rendered into. Always fills its positioned parent.
 */
export function ProjectVisual({
  project,
  priority,
  sizes,
  className,
}: ProjectVisualProps) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`${project.title} — interface preview`}
        fill
        priority={priority}
        sizes={sizes ?? '(min-width: 1024px) 42vw, 100vw'}
        className={cn('object-cover', className)}
      />
    )
  }

  const layers =
    project.caseStudy?.architecture?.slice(0, 4).map((l) => l.layer) ??
    ['Frontend', 'Shared UI', 'Services']
  const widths = ['92%', '78%', '86%', '64%']

  return (
    <div
      aria-hidden
      data-accent={project.accent}
      className={cn(
        'absolute inset-0 flex flex-col justify-center gap-3 bg-surface-2 bg-grid-sm px-6 py-8 sm:px-9',
        className,
      )}
    >
      {/* the project's hue, as light rather than as fill */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_10%_0%,rgb(var(--accent)/0.22),transparent_70%)]" />

      <div className="type-metadata relative mb-1">{project.context} · system</div>
      {layers.map((layer, i) => (
        <div key={layer} className="relative flex items-center gap-3">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
          <div
            className="relative h-9 overflow-hidden rounded-md border border-line"
            style={{ width: widths[i] ?? '70%' }}
          >
            <span className="absolute inset-0 bg-accent opacity-[0.14]" />
            <span className="type-technology absolute left-3 top-1/2 -translate-y-1/2 text-foreground/75">
              {layer}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
