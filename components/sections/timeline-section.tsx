import { Button, Reveal, Section, SectionHeading, SkillTag } from '@/components/primitives'
import { experience } from '@/content/experience'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { key: 'challenges', label: 'The problem', marker: '?' },
  { key: 'systems', label: 'What I built', marker: '→' },
  { key: 'impact', label: 'What it did', marker: '✓' },
] as const

export function TimelineSection() {
  return (
    <Section id="timeline" tone="light" accent="emerald">
      <SectionHeading
        index="04"
        label="Experience"
        accent="emerald"
        title="Two roles, deeper each time"
        description="From shipping client sites on an agency cadence to owning a multi-application platform — each step further into systems, not screens."
      />

      <ol className="mt-16 space-y-20 lg:mt-20">
        {experience.map((job, i) => (
          <Reveal as="li" key={job.id} tilt={i % 2 ? 1.5 : -1.5}>
            <article
              data-accent={job.accent}
              className={cn('relative', i % 2 === 1 && 'lg:ml-[8%]', i % 2 === 0 && 'lg:mr-[8%]')}
            >
              {/* huge index, half behind the card */}
              <span
                aria-hidden
                className="h-display pointer-events-none absolute -top-14 right-2 select-none text-[8rem] text-accent [-webkit-text-stroke:3px_rgb(var(--ink))] sm:-top-20 sm:text-[12rem]"
              >
                {job.index}
              </span>

              <div className="b-box relative">
                <header className="flex flex-col gap-4 border-b-3 border-ink bg-accent p-5 text-ink sm:flex-row sm:items-end sm:justify-between sm:p-7">
                  <div>
                    <span className="label">
                      {job.period} · {job.location}
                    </span>
                    <h3 className="h-display mt-2 text-4xl sm:text-6xl">{job.company}</h3>
                  </div>
                  <span className="h-title w-fit border-3 border-ink bg-paper px-3 py-1.5 text-lg shadow-[4px_4px_0_0_rgb(var(--ink))]">
                    {job.role}
                  </span>
                </header>

                <div className="p-5 sm:p-7">
                  <p className="max-w-3xl text-lg leading-relaxed">{job.context}</p>

                  <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {COLUMNS.map((col) => (
                      <div key={col.key} className="border-3 border-ink p-4">
                        <div className="flex items-center gap-2 border-b-3 border-ink pb-2">
                          <span className="h-title flex h-7 w-7 items-center justify-center bg-ink text-cream">
                            {col.marker}
                          </span>
                          <span className="label">{col.label}</span>
                        </div>
                        <ul className="mt-3 space-y-3">
                          {job[col.key].map((item) => (
                            <li key={item} className="text-[0.95rem] leading-relaxed text-muted">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {job.technologies.map((t) => (
                      <SkillTag as="li" key={t} accent={job.accent}>
                        {t}
                      </SkillTag>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>

      <div className="mt-16 flex justify-center">
        <Button href={profile.resumeUrl} accent="yellow" withArrow>
          Download full résumé
        </Button>
      </div>
    </Section>
  )
}
