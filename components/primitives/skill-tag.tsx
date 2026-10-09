import { cn } from '@/lib/utils'
import type { AccentName } from './section'

interface SkillTagProps {
  children: React.ReactNode
  /** filled with an accent hue; otherwise a plain card-coloured chip */
  accent?: AccentName
  as?: 'span' | 'li'
  className?: string
}

/** A small bordered chip for technologies. */
export function SkillTag({ children, accent, as: Tag = 'span', className }: SkillTagProps) {
  const Component = Tag as React.ElementType
  return (
    <Component
      data-accent={accent}
      className={cn(
        'inline-flex items-center border-2 px-2.5 py-1 font-mono text-[0.72rem] font-bold uppercase tracking-wide',
        accent ? 'border-ink bg-accent text-ink' : 'border-edge bg-card text-fg',
        className,
      )}
    >
      {children}
    </Component>
  )
}
