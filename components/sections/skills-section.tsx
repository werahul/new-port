'use client'

import { useId, useRef, useState } from 'react'
import { Reveal, Section, SectionHeading } from '@/components/primitives'
import { FallingText, type FallingWord } from '@/components/reactbits/falling-text'
import {
  proficiencyMeta,
  proficiencyOrder,
  skillDomains,
  type Proficiency,
} from '@/content/skills'
import { cn } from '@/lib/utils'

const PLAYGROUND_ACCENTS = ['yellow', 'pink', 'cyan', 'emerald', 'violet', 'coral', 'cobalt']

/** The words that fall: everything marked `core`, minus near-duplicates. */
const playgroundWords: FallingWord[] = Array.from(
  new Set(
    skillDomains
      .flatMap((d) => d.skills)
      .filter((s) => s.level === 'core')
      .map((s) => s.name),
  ),
)
  .slice(0, 22)
  .map((text, i) => ({ text, accent: PLAYGROUND_ACCENTS[i % PLAYGROUND_ACCENTS.length] }))

const LEVEL_TAG: Record<Proficiency, string> = {
  core: 'border-ink bg-accent text-ink shadow-[3px_3px_0_0_rgb(var(--ink))]',
  working: 'border-ink bg-paper text-ink',
  exploring: 'border-dashed border-ink/70 bg-transparent text-fg',
}

/**
 * The capability map as a proper tablist: eight domains on the left, one bold
 * panel on the right. Arrow keys / Home / End move between tabs (roving
 * tabindex), per the WAI-ARIA tabs pattern.
 */
export function SkillsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const domain = skillDomains[activeIndex]

  const focusTab = (i: number) => {
    const n = skillDomains.length
    const next = (i + n) % n
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => focusTab(activeIndex + 1),
      ArrowRight: () => focusTab(activeIndex + 1),
      ArrowUp: () => focusTab(activeIndex - 1),
      ArrowLeft: () => focusTab(activeIndex - 1),
      Home: () => focusTab(0),
      End: () => focusTab(skillDomains.length - 1),
    }
    const fn = keys[e.key]
    if (fn) {
      e.preventDefault()
      fn()
    }
  }

  return (
    <Section id="skills" tone="light" accent="cyan" pattern="dots">
      <SectionHeading
        index="02"
        label="Skills"
        accent="cyan"
        title="The capability map"
        description="Eight layers of full-stack delivery. Proficiency is honest: core is shipped weekly, working is used in real projects, exploring is active study."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-12">
        <div
          role="tablist"
          aria-label="Skill domains"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 pt-1 lg:col-span-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {skillDomains.map((d, i) => {
            const selected = i === activeIndex
            return (
              <button
                key={d.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                id={`${baseId}-tab-${d.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                data-accent={d.accent}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'flex shrink-0 items-center gap-3 border-3 border-ink px-3 py-2.5 text-left transition-[transform,box-shadow,background-color] duration-150',
                  selected
                    ? 'translate-x-1 bg-accent text-ink shadow-[5px_5px_0_0_rgb(var(--ink))] lg:translate-x-3'
                    : 'bg-paper text-ink hover:bg-accent/40',
                )}
              >
                <span className="font-mono text-xs font-bold">{d.index}</span>
                <span className="h-title whitespace-nowrap text-base lg:whitespace-normal lg:text-lg">
                  {d.name}
                </span>
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${domain.id}`}
          data-accent={domain.accent}
          className="b-box lg:col-span-8"
        >
          <div className="flex items-center justify-between gap-4 border-b-3 border-ink bg-accent px-5 py-3 text-ink">
            <span className="label">Domain {domain.index} / 0{skillDomains.length}</span>
            <span className="label">{domain.skills.length} skills</span>
          </div>
          <div key={domain.id} className="p-5 sm:p-8">
            <h3 className="h-display text-4xl sm:text-6xl">{domain.name}</h3>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{domain.tagline}</p>

            <div className="mt-8 space-y-6">
              {proficiencyOrder.map((level) => {
                const items = domain.skills.filter((s) => s.level === level)
                if (!items.length) return null
                return (
                  <div key={level}>
                    <div className="flex items-baseline gap-3">
                      <span className="label">{proficiencyMeta[level].label}</span>
                      <span className="hidden text-sm text-muted sm:inline">
                        {proficiencyMeta[level].hint}
                      </span>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-2.5">
                      {items.map((s) => (
                        <li
                          key={s.name}
                          className={cn(
                            'border-2 px-3 py-1.5 font-mono text-sm font-bold uppercase tracking-wide',
                            LEVEL_TAG[level],
                          )}
                        >
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Reveal className="mt-20">
        <div className="b-box overflow-hidden bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-3 border-ink bg-ink px-4 py-2.5 text-cream">
            <span className="label">Core stack — drops on arrival</span>
            <span className="label hidden text-yellow sm:inline">grab · throw · stack</span>
          </div>
          <FallingText words={playgroundWords} className="h-[420px] sm:h-[340px]" />
        </div>
      </Reveal>
    </Section>
  )
}
