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
 * exists, otherwise a flat architecture diagram built from the project's own
 * layer data (clearly a diagram, never a faked screenshot). Always fills its
 * positioned parent.
 */
export function ProjectVisual({ project, priority, sizes, className }: ProjectVisualProps) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`${project.title} — interface preview`}
        fill
        priority={priority}
        sizes={sizes ?? '(min-width: 1024px) 50vw, 100vw'}
        className={cn('object-cover object-top', className)}
      />
    )
  }

  const layers =
    project.caseStudy?.architecture?.slice(0, 4).map((l) => l.layer) ?? [
      'Frontend',
      'Shared UI',
      'Services',
    ]
  const widths = ['94%', '76%', '86%', '62%']

  return (
    <div
      aria-hidden
      data-accent={project.accent}
      className={cn(
        'pattern-grid absolute inset-0 flex flex-col justify-center gap-3 bg-accent px-6 py-8 text-ink sm:px-10',
        className,
      )}
      data-tone="accent"
    >
      <div className="label mb-1">{project.context} · system diagram</div>
      {layers.map((layer, i) => (
        <div
          key={layer}
          className="flex h-11 items-center border-3 border-ink bg-paper px-3 font-mono text-xs font-bold uppercase shadow-[4px_4px_0_0_rgb(var(--ink))] sm:text-sm"
          style={{ width: widths[i] ?? '70%', marginLeft: i % 2 ? '6%' : 0 }}
        >
          <span className="mr-3 h-3 w-3 shrink-0 bg-ink" />
          {layer}
        </div>
      ))}
    </div>
  )
}
