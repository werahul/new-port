'use client'

import { ArrowUpRight } from 'lucide-react'
import { ScrollReveal } from '@/components/motion'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { MQ } from '@/lib/animation/config'
import { cn } from '@/lib/utils'
import { featuredProjects, secondaryProjects } from '@/content/projects'
import { TransitionLink } from './transition-link'
import { ProjectVisual } from './project-visual'

export function ProjectIndex() {
  const scopeRef = useGsapScope<HTMLDivElement>(({ gsap, scope, mm, onCleanup }) => {
    mm.add(
      { hover: '(hover: hover) and (pointer: fine)', reduce: MQ.reduce },
      (c) => {
        const cond = c.conditions ?? {}
        if (cond.reduce || !cond.hover) return

        const preview = scope.querySelector<HTMLElement>('[data-preview]')
        const list = scope.querySelector<HTMLElement>('[data-project-list]')
        if (!preview || !list) return

        const layers = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll('[data-preview-layer]'),
        )
        const rows = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll('[data-project-row]'),
        )

        gsap.set(preview, { xPercent: -50, yPercent: -55, autoAlpha: 0, scale: 0.94 })
        gsap.set(layers, { autoAlpha: 0 })

        const xTo = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' })
        const yTo = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' })
        let active = -1

        const onMove = (e: PointerEvent) => {
          xTo(e.clientX)
          yTo(e.clientY)
        }
        const show = (i: number) => {
          if (i === active) return
          active = i
          layers.forEach((layer, li) =>
            gsap.to(layer, { autoAlpha: li === i ? 1 : 0, duration: 0.3 }),
          )
          gsap.to(preview, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power3.out',
          })
        }
        const hide = () => {
          active = -1
          gsap.to(preview, { autoAlpha: 0, scale: 0.94, duration: 0.3 })
        }

        window.addEventListener('pointermove', onMove, { passive: true })
        list.addEventListener('pointerleave', hide)
        const enters = rows.map((row, i) => {
          const fn = () => show(i)
          row.addEventListener('pointerenter', fn)
          return fn
        })

        onCleanup(() => {
          window.removeEventListener('pointermove', onMove)
          list.removeEventListener('pointerleave', hide)
          rows.forEach((row, i) => row.removeEventListener('pointerenter', enters[i]))
        })
      },
    )
  }, [])

  return (
    <div ref={scopeRef} className="mt-14 lg:mt-16">
      {/* cursor-following preview — desktop pointer only */}
      <div
        data-preview
        aria-hidden
        className="invisible pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[4/3] w-[min(30vw,420px)] overflow-hidden rounded-xl border border-line bg-surface-2 opacity-0 shadow-raised lg:block"
      >
        {featuredProjects.map((p) => (
          <div key={p.slug} data-preview-layer className="absolute inset-0">
            <ProjectVisual project={p} sizes="420px" />
          </div>
        ))}
      </div>

      <div data-project-list>
        <ScrollReveal as="ul" stagger variant="fade-up" distance={22}>
          {featuredProjects.map((p) => (
            <li key={p.slug} data-project-row className="border-t border-line last:border-b">
              <TransitionLink
                href={`/projects/${p.slug}`}
                data-cursor
                className="group relative grid grid-cols-1 gap-4 py-8 outline-none lg:grid-cols-[4.5rem_1fr_auto] lg:items-center lg:gap-8 lg:py-11"
              >
                {/* index + (mobile) category */}
                <div className="flex items-center justify-between lg:block">
                  <span className="font-display text-3xl font-medium text-muted-foreground transition-colors duration-500 ease-editorial group-hover:text-muted-foreground lg:text-[2.75rem] lg:leading-none">
                    {p.number}
                  </span>
                  <span className="type-metadata lg:hidden">{p.category}</span>
                </div>

                {/* mobile visual */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-2 lg:hidden">
                  <ProjectVisual project={p} sizes="100vw" />
                </div>

                {/* main */}
                <div className="min-w-0">
                  <div className="type-metadata hidden lg:block">
                    {p.category}
                    <span className="text-muted-foreground"> · {p.context}</span>
                  </div>
                  <h3 className="type-project text-foreground transition-transform duration-500 ease-editorial group-hover:translate-x-2 lg:mt-2">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                    {p.outcome}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                    {p.tech.map((t) => (
                      <li
                        key={t}
                        className="type-technology text-muted-foreground transition-colors duration-500 ease-editorial group-hover:text-foreground/70"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* cta */}
                <div className="mt-1 flex items-center gap-2 text-sm font-medium tracking-tight text-muted-foreground transition-colors duration-500 ease-editorial group-hover:text-foreground lg:mt-0 lg:flex-col lg:items-end lg:gap-3">
                  <span className="whitespace-nowrap">View case study</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>

                {/* hover underline */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent-strong transition-transform duration-700 ease-editorial group-hover:scale-x-100"
                />
              </TransitionLink>
            </li>
          ))}
        </ScrollReveal>
      </div>

      {/* secondary work */}
      <div className="mt-20 border-t border-line pt-10">
        <div className="type-metadata">Also shipped</div>
        <ul className="mt-5 grid gap-x-12 sm:grid-cols-2">
          {secondaryProjects.map((p) => (
            <li key={p.slug}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between gap-4 border-b border-line/70 py-4"
              >
                <span className="min-w-0">
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-accent-strong">
                    {p.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.category}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 translate-y-1 text-muted-foreground transition-transform duration-300 ease-editorial group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
