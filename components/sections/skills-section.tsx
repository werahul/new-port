'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Section } from '@/components/primitives'
import { ScrollReveal, TextReveal } from '@/components/motion'
import { loadGsap, type GsapBundle } from '@/lib/animation/gsap'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { EASE } from '@/lib/animation/config'
import { cn } from '@/lib/utils'
import {
  proficiencyMeta,
  proficiencyOrder,
  skillDomains,
  skillPillars,
  type Proficiency,
} from '@/content/skills'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const dotClass: Record<Proficiency, string> = {
  core: 'bg-accent-strong',
  working: 'bg-accent-strong/45',
  exploring: 'bg-transparent ring-1 ring-inset ring-muted-foreground/55',
}

const tokenClass: Record<Proficiency, string> = {
  core: 'border-foreground/25 text-foreground',
  working: 'border-line text-foreground/80',
  exploring: 'border-dashed border-line text-muted-foreground',
}

export function SkillsSection() {
  const [displayId, setDisplayId] = useState(skillDomains[0].id)
  const [activeId, setActiveId] = useState(skillDomains[0].id)

  const gsapRef = useRef<GsapBundle | null>(null)
  const reducedRef = useRef(false)
  const busyRef = useRef(false)
  /**
   * The exit tween has to be reachable. It lives outside any `gsap.context`
   * (it animates nodes that are about to be replaced, so it must survive the
   * render that replaces them), which means nothing else can kill it — and if
   * it is ever interrupted, its `onComplete` never runs, `busyRef` stays true,
   * and the guard in `selectDomain` turns every later tab click into a no-op.
   * The rail keeps highlighting; the panel never changes again.
   */
  const exitTweenRef = useRef<gsap.core.Tween | null>(null)
  const pendingIdRef = useRef(skillDomains[0].id)
  const firstRunRef = useRef(true)
  const listRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const totalTech = useMemo(
    () => skillDomains.reduce((n, d) => n + d.skills.length, 0),
    [],
  )

  const active = useMemo(
    () => skillDomains.find((d) => d.id === activeId) ?? skillDomains[0],
    [activeId],
  )

  const lanes = useMemo(
    () =>
      proficiencyOrder
        .map((level) => ({
          level,
          items: active.skills.filter((s) => s.level === level),
        }))
        .filter((lane) => lane.items.length > 0),
    [active],
  )

  useEffect(() => {
    reducedRef.current = prefersReducedMotion()
    let cancelled = false
    loadGsap()
      .then((bundle) => {
        if (!cancelled) gsapRef.current = bundle
      })
      .catch(() => {})
    return () => {
      cancelled = true
      exitTweenRef.current?.kill()
      exitTweenRef.current = null
      busyRef.current = false
    }
  }, [])

  // Animate the incoming domain in. Skips the first paint (rendered static) and
  // reduced-motion users. gsap.context keeps every tween scoped + reverted.
  useIsoLayoutEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false
      return
    }
    const bundle = gsapRef.current
    const list = listRef.current
    if (!bundle || !list || reducedRef.current) return
    const { gsap } = bundle
    const ctx = gsap.context(() => {
      const nodes = list.querySelectorAll('[data-skill-node]')
      const lanesEls = list.querySelectorAll('[data-skill-lane]')
      gsap.fromTo(
        lanesEls,
        { autoAlpha: 0, x: -12 },
        { autoAlpha: 1, x: 0, duration: 0.4, ease: EASE.out, stagger: 0.05 },
      )
      gsap.fromTo(
        nodes,
        { autoAlpha: 0, y: 14, filter: 'blur(6px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: EASE.out,
          stagger: { each: 0.022, from: 'start' },
          onComplete: () => {
            gsap.set(nodes, { clearProps: 'filter' })
          },
        },
      )
      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: EASE.out },
        )
      }
    }, list)
    return () => ctx.revert()
  }, [activeId])

  const selectDomain = useCallback(
    (id: string) => {
      if (id === displayId) return
      setDisplayId(id)
      pendingIdRef.current = id

      const bundle = gsapRef.current
      const list = listRef.current
      if (!bundle || !list || reducedRef.current) {
        setActiveId(id)
        return
      }
      // A transition is mid-flight — its onComplete will resolve to pendingIdRef.
      if (busyRef.current) return
      busyRef.current = true

      const { gsap } = bundle
      const nodes = list.querySelectorAll('[data-skill-node]')
      exitTweenRef.current?.kill()
      const release = () => {
        busyRef.current = false
        exitTweenRef.current = null
      }
      exitTweenRef.current = gsap.to(nodes, {
        autoAlpha: 0,
        y: -8,
        filter: 'blur(4px)',
        duration: 0.2,
        ease: 'power2.in',
        stagger: { each: 0.012, from: 'end' },
        overwrite: true,
        onComplete: () => {
          release()
          setActiveId(pendingIdRef.current)
        },
        // Killed or overwritten mid-flight, the panel simply stays where it is
        // — but the rail must not lock up because of it.
        onInterrupt: release,
      })
    },
    [displayId],
  )

  const onRailKeyDown = (e: React.KeyboardEvent) => {
    const nav = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
    if (!nav.includes(e.key)) return
    e.preventDefault()
    const i = skillDomains.findIndex((d) => d.id === displayId)
    let next = i
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight')
      next = (i + 1) % skillDomains.length
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
      next = (i - 1 + skillDomains.length) % skillDomains.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = skillDomains.length - 1
    selectDomain(skillDomains[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <Section id="skills" accent="cyan" atmosphere>
      {/* ---- positioning header ---------------------------------------- */}
      <div className="relative flex flex-col">
        {/* chapter mark + bloom, matching every other section header */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 -top-[0.42em] select-none font-display text-[7rem] font-semibold leading-none tracking-tighter text-accent/[0.08] sm:text-[9rem] lg:-left-4 lg:text-[12rem]"
        >
          02
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/calc(0.16*var(--atmos))),transparent)] blur-2xl"
        />

        <ScrollReveal
          as="div"
          variant="fade-right"
          className="relative flex flex-wrap items-center gap-x-3 gap-y-2"
        >
          <span className="type-metadata text-foreground">Capability</span>
          <span className="rule-accent w-10" aria-hidden />
          <span className="type-metadata type-metadata-accent">
            What can I build?
          </span>
        </ScrollReveal>

        <TextReveal
          as="h2"
          split="lines"
          className="relative type-display-sm mt-6 max-w-[20ch] text-foreground"
        >
          Full-stack engineer, end to end
        </TextReveal>

        <ScrollReveal
          as="p"
          variant="fade-up"
          delay={0.05}
          className="relative mt-5 max-w-prose text-pretty text-[0.975rem] leading-relaxed text-muted-foreground"
        >
          Not a badge wall — a map of where I actually operate across the stack,
          with honest depth markers. Pick a domain to move the system into it.
        </ScrollReveal>

        <ScrollReveal
          as="ul"
          variant="fade-up"
          delay={0.1}
          className="relative mt-7 flex flex-wrap gap-x-4 gap-y-1.5"
        >
          {skillPillars.map((pillar) => (
            <li key={pillar} className="type-technology text-muted-foreground">
              {pillar}
            </li>
          ))}
        </ScrollReveal>

        <ScrollReveal
          as="p"
          variant="fade"
          delay={0.15}
          className="type-metadata relative mt-6 text-muted-foreground"
        >
          {skillDomains.length} domains · {totalTech} technologies · 3 proficiency
          tiers
        </ScrollReveal>
      </div>

      {/* ---- interactive ecosystem ----------------------------------- */}
      <div className="rhythm-lead grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* rail */}
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="type-metadata mb-3 hidden lg:block">Domains</div>
            <div
              role="tablist"
              aria-label="Skill domains"
              onKeyDown={onRailKeyDown}
              className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {skillDomains.map((d, i) => {
                const selected = d.id === displayId
                return (
                  <button
                    key={d.id}
                    ref={(el) => {
                      tabRefs.current[i] = el
                    }}
                    role="tab"
                    id={`skills-tab-${d.id}`}
                    aria-selected={selected}
                    aria-controls="skills-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectDomain(d.id)}
                    className={cn(
                      'group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-left transition-colors duration-300 ease-editorial',
                      'lg:shrink lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-3',
                      selected
                        ? 'border-foreground/30 bg-foreground/[0.04] text-foreground lg:border-l-accent-strong lg:bg-transparent'
                        : 'border-line text-muted-foreground hover:border-foreground/25 hover:text-foreground lg:border-l-border',
                    )}
                  >
                    <span className="type-metadata text-muted-foreground">
                      {d.index}
                    </span>
                    <span className="flex-1 text-[0.86rem] font-medium tracking-tight lg:text-sm">
                      {d.name}
                    </span>
                    <span
                      aria-hidden
                      className="type-metadata hidden text-muted-foreground lg:block"
                    >
                      {d.skills.length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* panel */}
        <div className="min-w-0 lg:col-span-8">
          <p className="sr-only" role="status" aria-live="polite">
            {active.name}: {active.skills.length} technologies
          </p>
          <div
            role="tabpanel"
            id="skills-panel"
            aria-labelledby={`skills-tab-${active.id}`}
            tabIndex={0}
            className="surface-accent relative overflow-hidden rounded-2xl p-6 focus-visible:outline-none sm:p-8 lg:min-h-[440px]"
          >
            {/* engineering-system chrome */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid-sm opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_70%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-5 top-5 h-3 w-3 border-r border-t border-foreground/20"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-5 left-5 h-3 w-3 border-b border-l border-foreground/20"
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="type-metadata">{active.index} · Domain</div>
                  <h3 className="type-engineering mt-1.5 text-foreground">
                    {active.name}
                  </h3>
                </div>
                <div
                  className="shrink-0 rounded-lg border border-line bg-background/70 px-3 py-2 text-right"
                  aria-hidden
                >
                  <div className="font-display text-xl font-medium leading-none text-foreground">
                    {active.skills.length}
                  </div>
                  <div className="type-metadata mt-1 text-muted-foreground">
                    signals
                  </div>
                </div>
              </div>

              <p
                ref={taglineRef}
                className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground"
              >
                {active.tagline}
              </p>

              {/* legend */}
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {proficiencyOrder.map((level) => (
                  <li
                    key={level}
                    className="type-metadata flex items-center gap-2 text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className={cn('h-1.5 w-1.5 rounded-full', dotClass[level])}
                    />
                    {proficiencyMeta[level].label}
                  </li>
                ))}
              </ul>

              {/* lanes */}
              <div ref={listRef} className="mt-6 space-y-6">
                {lanes.map((lane) => (
                  <div
                    key={lane.level}
                    data-skill-lane
                    className="grid gap-x-4 gap-y-3 sm:grid-cols-[136px_1fr]"
                  >
                    <div className="type-metadata flex items-start gap-2 pt-1 text-muted-foreground">
                      <span
                        aria-hidden
                        className={cn(
                          'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                          dotClass[lane.level],
                        )}
                      />
                      {proficiencyMeta[lane.level].label}
                    </div>
                    <div className="flex flex-wrap gap-2 border-l border-line pl-4 sm:border-l-0 sm:pl-0">
                      {lane.items.map((s) => (
                        <span
                          key={s.name}
                          data-skill-node
                          className={cn(
                            'inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[0.8rem] font-medium tracking-tight',
                            tokenClass[s.level],
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              dotClass[s.level],
                            )}
                          />
                          {s.name}
                          <span className="sr-only">
                            {' '}
                            — {proficiencyMeta[s.level].label}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <dl className="mt-4 space-y-1.5">
            {proficiencyOrder.map((level) => (
              <div key={level} className="flex gap-2 text-xs text-muted-foreground">
                <dt className="type-metadata shrink-0 text-muted-foreground">
                  {proficiencyMeta[level].label}
                </dt>
                <dd>{proficiencyMeta[level].hint}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}
