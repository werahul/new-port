import { VelocityRow } from '@/components/reactbits/scroll-velocity'
import { cn } from '@/lib/utils'
import type { AccentName } from './section'

type Seam = 'cream' | 'night' | 'yellow'

interface MarqueeBandProps {
  items: string[]
  accent?: AccentName
  /** degrees; bands are tilted so they cut across the page */
  tilt?: number
  /** px/s at rest; negative runs the other way */
  velocity?: number
  /** a sentence for screen readers — the band itself is decorative */
  label?: string
  /**
   * The palette colours of the sections above and below. The tilted band
   * leaves wedges at its ends; painting them in the neighbours' colours makes
   * the band read as laid on top of the seam.
   */
  between?: [Seam, Seam]
  className?: string
}

/**
 * A tilted, full-bleed ticker band laid across a section boundary. Moves with
 * scroll velocity (ReactBits ScrollVelocity).
 */
export function MarqueeBand({
  items,
  accent = 'yellow',
  tilt = -2,
  velocity = 70,
  label,
  between,
  className,
}: MarqueeBandProps) {
  return (
    <div
      data-accent={accent}
      className={cn('relative z-10 -my-8 overflow-hidden py-8', className)}
      style={
        between
          ? {
              background: `linear-gradient(rgb(var(--${between[0]})) 50%, rgb(var(--${between[1]})) 50%)`,
            }
          : undefined
      }
    >
      {label && <p className="sr-only">{label}</p>}
      <div
        aria-hidden
        className="-mx-[5%] border-y-3 border-ink bg-accent py-3 text-ink shadow-[0_7px_0_0_rgb(var(--ink))] sm:py-4"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <VelocityRow baseVelocity={velocity}>
          {items.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="h-display px-5 text-3xl sm:text-5xl">{item}</span>
              <span className="text-2xl sm:text-4xl">✦</span>
            </span>
          ))}
        </VelocityRow>
      </div>
    </div>
  )
}
