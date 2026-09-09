'use client'

import type { CSSProperties } from 'react'
import { SkillTag } from '@/components/primitives'
import { ScrollReveal } from '@/components/motion'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { DUR, EASE, MQ } from '@/lib/animation/config'
import { experience } from '@/content/experience'

const TOTAL = String(experience.length).padStart(2, '0')

/**
 * The Experience section as an engineering journey: a rail that progressively
 * draws on scroll, a node that lights as each role is reached, a background hue
 * that shifts per role, and content that reveals in sequence.
 *
 * Content reveal uses the shared <ScrollReveal> (proven on every breakpoint).
 * The rail / node / wash are a thin decorative layer on top — if the animation
 * chunk never loads, nothing is hidden, the rail is just a static hairline.
 */
export function ExperienceJourney() {
  const ref = useGsapScope<HTMLDivElement>(({ gsap, ScrollTrigger, scope, mm }) => {
    const fill = scope.querySelector<HTMLElement>('[data-jr-fill]')
    const entries = gsap.utils.toArray<HTMLElement>('[data-jr-entry]', scope)
    const washes = gsap.utils.toArray<HTMLElement>('[data-jr-wash]', scope)

    /**
     * Built up front and paused, then played from the trigger.
     *
     * `gsap.context()` only captures animations created *synchronously* inside
     * its body — anything created later, from a ScrollTrigger callback, is
     * invisible to `ctx.revert()`. The previous version created these tweens
     * inside `onEnter`, so killing the triggers on unmount left the tweens
     * running and their inline styles written into a tree that was on its way
     * out. Creating them here, paused, puts them back under the context.
     */
    const arrivalTimeline = (entry: HTMLElement, i: number) => {
      const tl = gsap.timeline({ paused: true })
      tl.to(
        entry.querySelectorAll('[data-jr-node-ring]'),
        { opacity: 1, scale: 1, duration: DUR.sm, ease: EASE.out },
        0,
      )
        .to(
          entry.querySelectorAll('[data-jr-node-core]'),
          { opacity: 1, scale: 1, duration: DUR.sm, ease: EASE.pop },
          0,
        )
        .to(washes[i], { opacity: 0.7, duration: DUR.lg, ease: EASE.inOut }, 0)
      if (i > 0) {
        tl.to(washes[i - 1], { opacity: 0, duration: DUR.lg, ease: EASE.inOut }, 0)
      }
      return tl
    }

    mm.add({ reduce: MQ.reduce, motionOk: MQ.motionOk }, (c) => {
      const reduce = !!(c.conditions ?? {}).reduce

      // Reduced motion → rail full, last hue up, every node lit. No triggers.
      if (reduce) {
        if (fill) gsap.set(fill, { scaleY: 1 })
        gsap.set(washes, { opacity: (i: number) => (i === washes.length - 1 ? 0.7 : 0) })
        entries.forEach((entry) => {
          gsap.set(entry.querySelectorAll('[data-jr-node-ring],[data-jr-node-core]'), {
            opacity: 1,
            scale: 1,
          })
        })
        return
      }

      const triggers: Array<{ kill: () => void }> = []

      // 1 — the rail draws as the section scrolls through the viewport.
      if (fill) {
        gsap.set(fill, { scaleY: 0, transformOrigin: 'top' })
        const draw = gsap.to(fill, {
          scaleY: 1,
          ease: EASE.none,
          scrollTrigger: {
            trigger: scope,
            start: 'top 66%',
            end: 'bottom 82%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        if (draw.scrollTrigger) triggers.push(draw.scrollTrigger)
      }

      // 2 — per role: light the node, bring its hue up, drop the previous one.
      const arrivals: Array<{ kill: () => void }> = []
      entries.forEach((entry, i) => {
        gsap.set(entry.querySelectorAll('[data-jr-node-ring],[data-jr-node-core]'), {
          opacity: 0,
          scale: 0.5,
        })
        const tl = arrivalTimeline(entry, i)
        arrivals.push(tl)
        const st = ScrollTrigger.create({
          trigger: entry,
          start: 'top 78%',
          once: true,
          onEnter: () => tl.play(),
        })
        triggers.push(st)
      })

      return () => {
        triggers.forEach((t) => t.kill())
        arrivals.forEach((t) => t.kill())
      }
    })
  }, [])

  return (
    <div ref={ref} className="rhythm-lead relative">
      {/* per-role background wash — subtle, one hue at a time */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {experience.map((item) => (
          <div
            key={item.id}
            data-jr-wash
            className="absolute inset-0 opacity-0"
            style={
              {
                '--jr-accent': 'var(--accent)',
                backgroundImage:
                  'radial-gradient(52% 42% at 12% 20%, rgb(var(--jr-accent) / 0.16), transparent 72%)',
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative pl-8 sm:pl-11">
        {/* the rail */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 top-0 w-px sm:left-1"
        >
          <div className="absolute inset-0 bg-border" />
          <div
            data-jr-fill
            className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-accent-strong"
          />
        </div>

        {experience.map((item) => (
          <article
            key={item.id}
            data-jr-entry
            className="relative border-t border-line/70 py-11 first:border-t-0 sm:py-14"
          >
            {/* node on the rail */}
            <span
              aria-hidden
              className="absolute -left-8 top-[3.4rem] block h-3 w-3 sm:-left-[calc(2.75rem-1px)] sm:top-[3.9rem]"
              style={{ '--jr-accent': 'var(--accent)' } as CSSProperties}
            >
              <span
                data-jr-node-ring
                className="absolute inset-[-7px] rounded-full border border-[rgb(var(--jr-accent)/0.55)]"
              />
              <span className="absolute inset-0 rounded-full border border-line bg-background" />
              <span
                data-jr-node-core
                className="absolute inset-[3px] rounded-full bg-[rgb(var(--jr-accent))]"
              />
            </span>

            <div className="grid gap-6 lg:grid-cols-[190px_1fr] lg:gap-12">
              <ScrollReveal
                variant="fade-up"
                distance={18}
                className="flex flex-col gap-1.5"
              >
                <span className="type-metadata text-muted-foreground">
                  {item.index} / {TOTAL}
                </span>
                <span className="type-metadata">{item.period}</span>
                <span className="type-metadata text-muted-foreground">
                  {item.location}
                </span>
              </ScrollReveal>

              <ScrollReveal as="div" stagger={0.07} distance={20}>
                <h3 className="type-engineering text-foreground">
                  {item.role}
                  <span className="text-muted-foreground"> · {item.company}</span>
                </h3>
                <p className="mt-3 max-w-prose text-[0.975rem] leading-relaxed text-muted-foreground">
                  {item.context}
                </p>

                <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  <JourneyGroup label="Engineering challenges" items={item.challenges} />
                  <JourneyGroup label="Systems built" items={item.systems} />
                </div>

                <div className="mt-8">
                  <p className="type-metadata">Impact</p>
                  <ul className="mt-3 space-y-2">
                    {item.impact.map((line, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm leading-relaxed text-foreground/80"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.5rem] h-1 w-4 flex-shrink-0 bg-accent-strong"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-wrap gap-1.5">
                  {item.technologies.map((t) => (
                    <SkillTag key={t}>{t}</SkillTag>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function JourneyGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="type-metadata">{label}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((line, idx) => (
          <li
            key={idx}
            className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden
              className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/50"
            />
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
