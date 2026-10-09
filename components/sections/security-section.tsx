'use client'

import { useId, useRef, useState } from 'react'
import { Section, SectionHeading } from '@/components/primitives'
import { Cubes } from '@/components/reactbits/cubes'
import { securityTopics } from '@/content/approach'
import { cn } from '@/lib/utils'

/**
 * Seventeen security practices as a wrapping tablist of chips over one panel,
 * with the Cubes field beside it. Arrow keys / Home / End move between chips
 * (roving tabindex), per the WAI-ARIA tabs pattern.
 */
export function SecuritySection() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const topic = securityTopics[active]
  const Icon = topic.icon

  const focusTab = (i: number) => {
    const n = securityTopics.length
    const next = (i + n) % n
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: securityTopics.length - 1,
    }
    if (e.key in map) {
      e.preventDefault()
      focusTab(map[e.key])
    }
  }

  return (
    <Section id="security" tone="dark" accent="violet" pattern="grid">
      <SectionHeading
        index="05"
        label="Approach"
        accent="violet"
        title="Security is a build constraint"
        description="Not a checklist at the end. How I handle auth, input, headers, secrets and dependencies — pick a topic."
      />

      <div
        role="tablist"
        aria-label="Security topics"
        onKeyDown={onKeyDown}
        className="mt-14 flex flex-wrap gap-2.5"
      >
        {securityTopics.map((t, i) => {
          const selected = i === active
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                'border-2 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide transition-[transform,background-color,color] duration-150',
                selected
                  ? '-translate-y-0.5 border-ink bg-violet text-ink shadow-[4px_4px_0_0_rgb(var(--cream))]'
                  : 'border-cream/40 text-fg hover:border-cream hover:bg-cream hover:text-ink',
              )}
            >
              {t.title}
            </button>
          )
        })}
      </div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-12">
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${topic.id}`}
          data-tone="light"
          className="b-box text-fg lg:col-span-8"
        >
          <div className="flex items-center justify-between border-b-3 border-ink bg-violet px-5 py-3 text-ink">
            <span className="label">
              Topic {String(active + 1).padStart(2, '0')} / {securityTopics.length}
            </span>
            <Icon aria-hidden className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div key={topic.id} className="p-5 sm:p-8">
            <h3 className="h-display text-3xl sm:text-5xl">{topic.title}</h3>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{topic.myApproach}</p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {topic.myBestPractices.map((p, i) => (
                <li
                  key={p}
                  className={cn(
                    'border-3 border-ink p-4 text-[0.95rem] leading-relaxed shadow-[4px_4px_0_0_rgb(var(--ink))]',
                    ['bg-yellow', 'bg-cyan', 'bg-emerald'][i % 3],
                  )}
                >
                  <span className="h-title block text-2xl">0{i + 1}</span>
                  <span className="mt-2 block text-ink">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <div className="b-box rotate-2 bg-night p-6">
            <Cubes gridSize={7} />
          </div>
          <p className="label mt-6 text-muted">Hover the field — every cube is a layer of defence.</p>
        </div>
      </div>
    </Section>
  )
}
