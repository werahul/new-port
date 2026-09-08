import { cn } from '@/lib/utils'

interface SkillTagProps {
  children: React.ReactNode
  /** subtle emphasis for primary competencies */
  emphasis?: boolean
  as?: 'span' | 'li'
  className?: string
}

/**
 * TECHNOLOGY-tier label. Mono, uppercase, hairline border. Replaces the many
 * hand-rolled `<span className="px-3 py-1 ...">` tag pills across sections.
 */
export function SkillTag({
  children,
  emphasis = false,
  as: Tag = 'span',
  className,
}: SkillTagProps) {
  const Component = Tag as React.ElementType
  return (
    <Component
      className={cn(
        'type-technology inline-flex items-center rounded-full border px-3 py-1.5 transition-colors duration-300 ease-editorial',
        emphasis
          ? 'border-accent/35 bg-accent/[0.08] text-foreground'
          : 'border-line bg-surface-2/60 text-muted-foreground hover:border-accent/40 hover:text-foreground',
        className,
      )}
    >
      {children}
    </Component>
  )
}
