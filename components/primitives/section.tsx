import { cn } from '@/lib/utils'
import { Container } from './container'

export type Tone = 'light' | 'dark' | 'accent'

/** The accent family. Names are kept from the content files; hues are new. */
export type AccentName = 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink' | 'yellow'

type Spacing = 'default' | 'compact' | 'none'

const spacingMap: Record<Spacing, string> = {
  default: 'py-20 sm:py-28 lg:py-32',
  compact: 'py-12 sm:py-16',
  none: '',
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** light cream, dark night, or flooded with the accent hue */
  tone?: Tone
  accent?: AccentName
  spacing?: Spacing
  /** wrap children in a Container; false for full-bleed layouts */
  contained?: boolean
  containerClassName?: string
  /** background texture behind the content */
  pattern?: 'dots' | 'grid'
  /** ink rule on the top edge — on by default so tone changes read as cuts */
  ruled?: boolean
}

/**
 * One page section. `tone` re-points every token inside (bg, fg, card, edge,
 * shadow) so children never need to know whether they sit on light or dark.
 */
export function Section({
  tone = 'light',
  accent,
  spacing = 'default',
  contained = true,
  containerClassName,
  pattern,
  ruled = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-tone={tone}
      data-accent={accent}
      className={cn(
        'relative isolate overflow-hidden bg-bg text-fg',
        ruled && 'border-t-3 border-ink',
        spacingMap[spacing],
        className,
      )}
      {...props}
    >
      {pattern && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 -z-10',
            pattern === 'dots' ? 'pattern-dots' : 'pattern-grid',
          )}
        />
      )}
      {contained ? <Container className={containerClassName}>{children}</Container> : children}
    </section>
  )
}
