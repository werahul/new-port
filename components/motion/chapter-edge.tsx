'use client'

import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { EASE, MQ } from '@/lib/animation/config'
// Imported from the files directly rather than the barrel: `primitives/index`
// pulls in SectionHeading, which imports from `components/motion` — going
// through the barrel here would close that loop.
import { Container } from '@/components/primitives/container'
import type { AccentName } from '@/components/primitives/section'
import { cn } from '@/lib/utils'

interface ChapterEdgeProps {
  /** hue leaving the section above */
  from: AccentName
  /** hue entering the section below */
  to: AccentName
  /**
   * `quiet` — a hairline seam, for the beats between two calm sections.
   * `loud` — a full-bleed chapter card that asks the next section's question at
   * architectural scale. Used twice on the whole page; that is the point.
   */
  variant?: 'quiet' | 'loud'
  /** loud only — chapter number, e.g. "03" */
  index?: string
  /** loud only — the question the next chapter answers */
  question?: string
  /** loud only — one mono line of context beneath it */
  caption?: string
  className?: string
}

/**
 * The seam between two accent worlds — the page's pacing instrument.
 *
 * Every section transition runs through here, but they are not equal: three are
 * hairlines you barely register, and two open into a full-bleed card where the
 * type changes register entirely. That contrast is what stops a continuously
 * animated page flattening into one texture.
 */
export function ChapterEdge({
  from,
  to,
  variant = 'quiet',
  index,
  question,
  caption,
  className,
}: ChapterEdgeProps) {
  const ref = useGsapScope<HTMLDivElement>(
    ({ gsap, scope, mm }) => {
      const q = <T extends HTMLElement>(sel: string) =>
        scope.querySelector<T>(sel)

      mm.add({ reduce: MQ.reduce }, (c) => {
        const reduce = !!c.conditions?.reduce

        // ---- quiet: a line that draws itself, with a mote riding it --------
        if (variant === 'quiet') {
          const line = q('[data-edge-line]')
          const mote = q('[data-edge-mote]')
          if (!line || !mote) return

          if (reduce) {
            gsap.set(line, { scaleY: 1, opacity: 0.4 })
            gsap.set(mote, { opacity: 0 })
            return
          }
          gsap.set(line, { scaleY: 0, transformOrigin: 'top', opacity: 0.9 })
          gsap.set(mote, { yPercent: 0, opacity: 0 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: scope,
              start: 'top 92%',
              end: 'bottom 8%',
              scrub: 0.6,
            },
          })
          tl.to(line, { scaleY: 1, ease: EASE.none }, 0)
            .to(mote, { opacity: 1, duration: 0.1 }, 0)
            .to(mote, { yPercent: 100, ease: EASE.none }, 0)
            .to(mote, { opacity: 0, duration: 0.1 }, 0.9)

          return () => {
            tl.scrollTrigger?.kill()
            tl.kill()
          }
        }

        // ---- loud: the chapter card ---------------------------------------
        const rule = q('[data-edge-rule]')
        const field = q('[data-edge-field]')
        const word = q('[data-edge-word]')
        const ghost = q('[data-edge-ghost]')
        const meta = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll('[data-edge-meta]'),
        )

        // Nothing in the loud card is hidden by CSS — it renders complete and
        // the timelines below only ever add motion to it. So reduced motion is
        // a clean no-op rather than a set of undo instructions.
        if (reduce) return

        // Two passes over the same element set:
        //  1. a scrubbed depth pass — the solid word and its hollow twin drift
        //     at different rates, so the card has parallax of its own;
        //  2. a one-shot entrance — the question wipes up out of a clip.
        const depth = gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.9,
          },
        })
        if (field) depth.fromTo(field, { opacity: 0.25 }, { opacity: 1, ease: EASE.none }, 0)
        if (word) depth.fromTo(word, { yPercent: 7 }, { yPercent: -7, ease: EASE.none }, 0)
        if (ghost)
          depth.fromTo(
            ghost,
            { yPercent: -14, xPercent: -1.6 },
            { yPercent: 18, xPercent: 1.6, ease: EASE.none },
            0,
          )

        const enter = gsap.timeline({
          defaults: { ease: EASE.expo },
          scrollTrigger: { trigger: scope, start: 'top 72%', once: true },
        })
        if (rule) {
          gsap.set(rule, { scaleX: 0, transformOrigin: 'left' })
          enter.to(rule, { scaleX: 1, duration: 1.2, ease: EASE.inOut }, 0)
        }
        if (word) {
          gsap.set(word, { clipPath: 'inset(0 0 100% 0)' })
          enter.to(
            word,
            {
              clipPath: 'inset(0 0 0% 0)',
              duration: 1.15,
              onComplete: () => {
                // Leave no clip behind — the scrubbed drift owns it afterwards.
                gsap.set(word, { clearProps: 'clipPath' })
              },
            },
            0.1,
          )
        }
        if (ghost) enter.from(ghost, { autoAlpha: 0, duration: 1 }, 0.35)
        if (meta.length)
          enter.from(
            meta,
            { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08, ease: EASE.out },
            0.25,
          )

        return () => {
          depth.scrollTrigger?.kill()
          enter.scrollTrigger?.kill()
          depth.kill()
          enter.kill()
        }
      })
    },
    [from, to, variant],
  )

  if (variant === 'quiet') {
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn(
          'pointer-events-none relative mx-auto h-24 w-px sm:h-32',
          className,
        )}
      >
        <span
          data-edge-line
          className="absolute inset-0 block will-change-transform"
          style={{
            background: `linear-gradient(180deg, rgb(var(--${from})/0.55), rgb(var(--${to})/0.55))`,
          }}
        />
        <span
          data-edge-mote
          className="absolute -left-[3px] top-0 h-[7px] w-[7px] rounded-full will-change-transform"
          style={{
            background: `rgb(var(--${to}))`,
            boxShadow: `0 0 12px rgb(var(--${to})/0.8)`,
          }}
        />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-accent={to}
      className={cn(
        'relative isolate flex min-h-[340px] items-center overflow-hidden py-20 sm:min-h-[440px] sm:py-28 lg:min-h-[560px]',
        className,
      )}
    >
      {/* the two worlds meeting — a wash that arrives with the card */}
      <span
        data-edge-field
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(75% 60% at 12% 40%, rgb(var(--${from})/calc(0.18*var(--atmos))), transparent 70%), radial-gradient(70% 65% at 88% 70%, rgb(var(--${to})/calc(0.2*var(--atmos))), transparent 72%)`,
        }}
      />
      <span
        data-edge-rule
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px will-change-transform"
        style={{
          background: `linear-gradient(90deg, rgb(var(--${from})/0.75), rgb(var(--${to})/0.75) 70%, transparent)`,
        }}
      />

      <Container className="relative">
        <div>
          <div
            data-edge-meta
            className="type-metadata flex items-center gap-3 text-muted-foreground"
          >
            {index && <span className="type-metadata-accent">{index}</span>}
            <span className="rule-accent w-8" aria-hidden />
            <span>Next chapter</span>
          </div>

          <div className="relative mt-7">
            {/* the hollow second impression, drifting on its own rate */}
            <span
              data-edge-ghost
              aria-hidden
              className="type-edge type-ghost absolute inset-x-0 top-0 max-w-[13ch] select-none text-balance will-change-transform"
            >
              {question}
            </span>
            {/* A paragraph, not a heading: the question names the chapter for a
                screen reader without adding a second h2 above the real one. */}
            <p
              data-edge-word
              className="type-edge relative max-w-[13ch] text-balance text-foreground will-change-transform"
            >
              {question}
            </p>
          </div>

          {caption && (
            <p
              data-edge-meta
              className="type-technology mt-8 max-w-md text-muted-foreground"
            >
              {caption}
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}
