import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { TextReveal } from '@/components/motion/text-reveal'

interface SectionHeadingProps {
  /** running index, e.g. "01" — rendered as a ghost chapter mark, not a label */
  index?: string
  /** METADATA-tier eyebrow */
  label: string
  /**
   * The one question this chapter answers. Carrying it in the heading is what
   * lets the story be read from the headings alone; the two loud chapter cards
   * ask theirs at display scale instead.
   */
  question?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  titleClassName?: string
}

/**
 * The single canonical section header: a METADATA eyebrow that names the chapter
 * and the question it answers, an oversized ghost numeral, and a DISPLAY title
 * that rises out of a mask line-by-line.
 *
 * The numeral and the soft accent bloom behind it are the section's colour
 * identity. They matter more than they look: the `.atmosphere` field is
 * suppressed while the 3D world is running (it would seam at every boundary), so
 * without this a section had no hue of its own on the primary experience.
 */
export function SectionHeading({
  index,
  label,
  question,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  id,
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {/* chapter mark — the section's hue, at a scale you feel rather than read */}
      {index && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-[0.42em] select-none font-display text-[7rem] font-semibold leading-none tracking-tighter text-accent/[0.08] sm:text-[9rem] lg:text-[12rem]',
            align === 'center' ? 'left-1/2 -translate-x-1/2' : '-left-2 lg:-left-4',
          )}
        >
          {index}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-24 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/calc(0.16*var(--atmos))),transparent)] blur-2xl',
          align === 'center' ? 'left-1/2 -translate-x-1/2' : '-left-16',
        )}
      />

      <Reveal className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="type-metadata text-foreground">{label}</span>
        <span className="rule-accent w-10" aria-hidden />
        {question && (
          <span className="type-metadata type-metadata-accent">{question}</span>
        )}
      </Reveal>

      <TextReveal
        as={Tag}
        id={id}
        split="lines"
        className={cn(
          'relative mt-6 type-display-sm max-w-[20ch] text-balance text-foreground',
          align === 'center' && 'max-w-[18ch]',
          titleClassName,
        )}
      >
        {title}
      </TextReveal>

      {description && (
        <Reveal
          as="p"
          delay={90}
          className={cn(
            'relative mt-6 max-w-prose text-pretty text-[1.0125rem] leading-[1.75] text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </Reveal>
      )}
    </div>
  )
}
