'use client'

import { Fragment, useEffect, useRef } from 'react'
import { Container, MagneticButton, SkillTag } from '@/components/primitives'
import { HeroCaptions } from './hero-captions'
import { scrollToId } from '@/components/ui/smooth-scroll'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { EASE, MQ } from '@/lib/animation/config'
import { worldPath } from '@/lib/world/store'
import { stations, stationCount } from '@/content/world'
import { heroCopy } from '@/content/journey'
import { profile } from '@/content/profile'

/**
 * The hero is not a section with a 3D object in it — the world is mounted behind
 * the whole page. What lives here is the *entry*: a tall scroll range that gives
 * the camera room to travel the first six stations, and a GSAP-orchestrated
 * opening sequence that reveals the identity while the establishing shot settles,
 * then hands control to the scroll.
 *
 * Two things here are deliberately *not* React state:
 *
 *  - The shell's height and the frame's stickiness are CSS, keyed on the
 *    pre-paint `html[data-world]` stamp. They used to key off a store flag that
 *    arrived after the first paint, so every load jumped from one screen to six.
 *  - The active station is read from `worldPath` in a single rAF and written
 *    straight to the DOM. It used to come from the store, published by the
 *    canvas — which meant that if the canvas ever stopped, the value froze, and
 *    a hero that had scrolled past station 0 stayed at `opacity: 0` forever.
 *    `worldPath` is driven by ScrollTrigger and does not care whether the
 *    canvas is alive.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // ---- opening sequence -------------------------------------------------
  const heroRef = useGsapScope<HTMLDivElement>(
    ({ gsap, scope, mm }) => {
      // Drop the pre-paint attribute rather than pinning opacity inline — the
      // wrapper still needs its `data-[receded]` class to fade it on scroll.
      const reveal = () => scope.removeAttribute('data-anim-init')

      mm.add({ reduce: MQ.reduce, ok: MQ.motionOk }, (c) => {
        if (c.conditions?.reduce) {
          reveal()
          gsap.set(scope.querySelectorAll('.jr-word, .jr-item'), {
            clearProps: 'all',
          })
          return
        }

        reveal()
        const tl = gsap.timeline({
          defaults: { ease: EASE.out },
          delay: 0.15,
        })

        tl.from('.jr-kicker', { autoAlpha: 0, y: 14, duration: 0.5 }, 0)
          .from(
            '.jr-word',
            {
              yPercent: 118,
              duration: 0.9,
              ease: EASE.expo,
              stagger: 0.08,
            },
            0.1,
          )
          .from('.jr-sub', { autoAlpha: 0, y: 18, duration: 0.6 }, 0.5)
          .from(
            '.jr-pos',
            { autoAlpha: 0, duration: 0.4 },
            0.6,
          )
          .from(
            '.jr-pos > *',
            { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.05 },
            0.62,
          )
          .from('.jr-cta', { autoAlpha: 0, y: 14, duration: 0.5 }, 0.74)

        // Let a visitor who is already scrolling skip straight to the end.
        const skip = () => {
          tl.progress(1)
          teardown()
        }
        const teardown = () => {
          window.removeEventListener('wheel', skip)
          window.removeEventListener('keydown', skip)
          window.removeEventListener('pointerdown', skip)
          window.removeEventListener('touchstart', skip)
        }
        window.addEventListener('wheel', skip, { passive: true, once: true })
        window.addEventListener('keydown', skip, { once: true })
        window.addEventListener('pointerdown', skip, { once: true })
        window.addEventListener('touchstart', skip, { passive: true, once: true })

        return () => {
          teardown()
          tl.kill()
        }
      })
    },
    [],
    // Above the fold: never leave the first screen blank for four seconds.
    { failSafeMs: 900 },
  )

  // ---- follow the camera, without re-rendering ---------------------------
  useEffect(() => {
    if (document.documentElement.dataset.world !== 'cinematic') return
    const section = sectionRef.current
    const copy = heroRef.current
    if (!section || !copy) return

    let raf = 0
    let lastIdx = -1
    let lastReceded: string | null = null

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const f = worldPath.current * (stationCount - 1)

      const idx = Math.max(0, Math.min(stations.length - 1, Math.round(f)))
      if (idx !== lastIdx) {
        lastIdx = idx
        section.dataset.accent = stations[idx].accent
      }

      // A little past the first station, the identity has been read and the
      // world takes the frame. The threshold is on the continuous value, not a
      // rounded index, so it cannot be tripped by a half-measured anchor.
      const receded = f > 0.55 ? 'true' : 'false'
      if (receded !== lastReceded) {
        lastReceded = receded
        copy.dataset.receded = receded
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [heroRef])

  return (
    <section
      ref={sectionRef}
      id="home"
      data-accent="violet"
      // Phones get a shorter descent: the same six stations, but ~50vh of
      // travel each instead of ~85vh. See the `.jr-hero-shell` rules.
      className="jr-hero-shell relative transition-[--accent] duration-700"
    >
      <div className="jr-hero-frame relative flex h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden
          className="jr-cinematic-only pointer-events-none absolute inset-0 -z-[1]"
        >
          <div className="hero-scrim absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <Container className="relative flex flex-1 flex-col">
          <div
            ref={heroRef}
            data-anim-init="hero"
            data-receded="false"
            className="jr-hero flex flex-1 flex-col justify-center transition-[opacity,transform] duration-700 ease-editorial data-[receded=true]:pointer-events-none data-[receded=true]:-translate-y-6 data-[receded=true]:opacity-0 motion-reduce:transition-none"
          >
            <div className="jr-item jr-kicker flex items-center gap-2.5 type-metadata">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {heroCopy.kicker}
            </div>

            <h1 className="jr-title mt-7 type-display text-foreground">
              {heroCopy.titleWords.map((word, i) => (
                <Fragment key={word}>
                  <span className="jr-mask inline-block overflow-hidden align-bottom">
                    <span className="jr-word inline-block pb-[0.08em]">{word}</span>
                  </span>
                  {i < heroCopy.titleWords.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </h1>

            <p className="jr-item jr-sub mt-8 max-w-measure text-pretty text-[1.0625rem] leading-[1.65] text-muted-foreground">
              {heroCopy.statement}
            </p>

            <div className="jr-item jr-pos mt-8 flex flex-wrap gap-1.5">
              {heroCopy.positioning.map((p) => (
                <SkillTag key={p} emphasis>
                  {p}
                </SkillTag>
              ))}
            </div>

            <div className="jr-item jr-cta mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton
                href="#works"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId('works')
                }}
                variant="primary"
                withArrow
              >
                View selected work
              </MagneticButton>
              <MagneticButton
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId('contact')
                }}
                variant="line"
              >
                Start a conversation
              </MagneticButton>
              <MagneticButton
                href={profile.resumeUrl}
                target="_blank"
                variant="ghost"
                withArrow
              >
                Résumé
              </MagneticButton>
            </div>
          </div>
        </Container>

        <HeroCaptions />
      </div>

      {/* No world (reduced motion, or a device with no WebGL at all): the same
          journey, readable as an index. Hidden by CSS in cinematic mode, where
          the captions narrate the stations as the camera reaches them. */}
      <Container className="jr-flat-only relative z-10 pb-24">
        <ol className="border-t border-line">
          {stations.map((s) => (
            <li
              key={s.id}
              data-accent={s.accent}
              className="grid gap-3 border-b border-line py-7 sm:grid-cols-[7rem_1fr] sm:gap-8"
            >
              <div className="flex items-start gap-3">
                <span className="type-metadata text-muted-foreground">{s.index}</span>
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              <div>
                <div className="type-engineering text-foreground">{s.label}</div>
                <div className="type-technology mt-2 text-muted-foreground">
                  {s.stack}
                </div>
                <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {s.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
