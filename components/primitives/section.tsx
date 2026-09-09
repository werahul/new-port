import { cn } from '@/lib/utils'
import { Sequence } from '@/components/motion/sequence'
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
  /**
   * Hold the moving environment back behind the content so the text keeps a
   * steady contrast ratio. On by default: every section built from this
   * component is one somebody has to read.
   */
  veil?: boolean
  /**
   * Play the section's `data-seq` elements in as one ordered sequence — one
   * beat at a time — rather than letting every reveal in view fire at once.
   */
  sequence?: boolean
}

/**
 * Vertical rhythm, container, the section's colour world, and the two things
 * that make a section readable while the environment behind it is moving: a
 * veil under the content, and one ordered entrance instead of several
 * simultaneous ones.
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
  veil = true,
  sequence = true,
  className,
  children,
  ...props
}: SectionProps) {
  const content = sequence ? <Sequence>{children}</Sequence> : children

  return (
    <section
      data-accent={accent}
      className={cn('relative isolate', spacingMap[spacing], className)}
      {...props}
    >
      {/* Order matters: both layers sit at z-index -1, so the accent field
          paints over the veil and the section keeps its hue. */}
      {veil && <div className="section-veil" aria-hidden />}
      {atmosphere && <div className="atmosphere" aria-hidden />}
      {contained ? (
        <Container size={containerSize} className={containerClassName}>
          {content}
        </Container>
      ) : (
        content
      )}
    </section>
  )
}
