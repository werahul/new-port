import { Shuffle } from '@/components/reactbits/shuffle'
import { cn } from '@/lib/utils'
import type { AccentName } from './section'

interface SectionHeadingProps {
  /** running index, e.g. "01" — printed in a solid accent block */
  index?: string
  /** small mono label next to the index */
  label: string
  /** the poster headline — keep it short, it renders in caps */
  title: string
  description?: React.ReactNode
  accent?: AccentName
  id?: string
  className?: string
}

/**
 * The canonical section header: an index block + mono label, a huge shuffling
 * headline, and an optional standfirst with a thick accent rule, pushed right.
 */
export function SectionHeading({
  index,
  label,
  title,
  description,
  accent,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div data-accent={accent} className={cn('relative', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {index && (
          <span className="h-title inline-flex h-11 min-w-[2.75rem] items-center justify-center border-3 border-ink bg-accent px-2 text-lg text-ink shadow-b-sm">
            {index}
          </span>
        )}
        <span className="label">{label}</span>
        <span aria-hidden className="h-[3px] w-16 bg-fg" />
      </div>

      <Shuffle
        as="h2"
        id={id}
        text={title}
        className="h-display mt-6 block max-w-[16ch] text-[clamp(2.6rem,8vw,6.5rem)]"
      />

      {description && (
        <p className="mt-8 max-w-xl border-l-[6px] border-accent pl-5 text-lg leading-relaxed text-muted sm:ml-[10%]">
          {description}
        </p>
      )}
    </div>
  )
}
