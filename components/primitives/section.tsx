import { cn } from '@/lib/utils'
import { Container } from './container'

type Spacing = 'default' | 'compact' | 'loose' | 'none'

/** The controlled accent family. One hue owns one section. */
export type AccentName =
  | 'violet'
  | 'cobalt'
  | 'cyan'
  | 'emerald'
  | 'coral'
  | 'pink'

const spacingMap: Record<Spacing, string> = {
  default: 'py-28 sm:py-36 lg:py-44',
  compact: 'py-16 sm:py-20 lg:py-24',
  loose: 'py-36 sm:py-44 lg:py-56',
  none: '',
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: Spacing
  /** Wrap children in a Container automatically. Set false for full-bleed layouts. */
  contained?: boolean
  containerSize?: 'default' | 'narrow' | 'wide' | 'flush'
  containerClassName?: string
  /**
   * The section's accent world. Sets `--accent` for everything inside, so
   * rules, bullets, focus rings and glows all re-tint from one attribute.
   */
  accent?: AccentName
  /** Render the soft atmospheric field of the accent hue behind the content. */
  atmosphere?: boolean
}

/**
 * Vertical rhythm, container, and the section's colour world.
 *
 * Colour enters the page through this component rather than through individual
 * buttons and cards — that is what keeps the ratio at roughly 75% neutral
 * foundation to 25% expressive colour.
 */
export function Section({
  spacing = 'default',
  contained = true,
  containerSize = 'default',
  containerClassName,
  accent,
  atmosphere = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-accent={accent}
      className={cn('relative isolate', spacingMap[spacing], className)}
      {...props}
    >
      {atmosphere && <div className="atmosphere" aria-hidden />}
      {contained ? (
        <Container size={containerSize} className={containerClassName}>
          {children}
        </Container>
      ) : (
        children
      )}
    </section>
  )
}
