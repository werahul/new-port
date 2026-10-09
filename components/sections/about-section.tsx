import { Reveal, Section, SectionHeading } from '@/components/primitives'
import { CountUp } from '@/components/reactbits/count-up'
import { Squares } from '@/components/reactbits/squares'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

/** Three ways of working, stated plainly. */
const principles = [
  {
    title: 'Architecture',
    copy: 'Micro-frontends, shared component libraries and boundaries that let teams ship independently without drift.',
    accent: 'cyan',
  },
  {
    title: 'Performance',
    copy: 'Rendering strategy, asset discipline and measurement — recent work took a Lighthouse score to 98.',
    accent: 'emerald',
  },
  {
    title: 'Product thinking',
    copy: 'Deciding what to build and what to leave out, so the interface earns its complexity.',
    accent: 'coral',
  },
] as const

const STAT_STYLE = [
  { accent: 'pink', offset: 'lg:mt-0', tilt: '-rotate-2' },
  { accent: 'yellow', offset: 'lg:mt-12', tilt: 'rotate-1' },
  { accent: 'cobalt', offset: 'lg:mt-4', tilt: '-rotate-1' },
] as const

export function AboutSection() {
  return (
    <Section id="about" tone="dark" accent="pink">
      <Squares className="-z-10" />

      <SectionHeading
        index="01"
        label="About"
        accent="pink"
        title="Frontend depth, full-stack range"
        description="I started in the browser and worked outward — into APIs, data models and the architecture that keeps a product coherent as it grows."
      />

      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <Reveal tilt={-2} className="lg:col-span-7">
          <p className="b-box p-6 text-xl leading-relaxed sm:p-8 sm:text-2xl">{profile.summary}</p>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9 lg:mt-20">
          <p className="border-l-[6px] border-yellow pl-5 leading-relaxed text-muted">
            I care about code that lasts: clear boundaries, honest naming and interfaces that stay
            calm under real data. Good engineering, to me, is as much about what you decide not to
            build.
          </p>
        </Reveal>
      </div>

      {/* stats — staggered, tilted, flooded with colour */}
      <ul className="mt-16 grid gap-8 sm:grid-cols-3 lg:mt-20">
        {profile.stats.map((stat, i) => {
          const s = STAT_STYLE[i % STAT_STYLE.length]
          return (
            <Reveal as="li" key={stat.label} delay={i * 0.08} tilt={i % 2 ? 4 : -4} className={s.offset}>
              <div
                data-accent={s.accent}
                className={cn(
                  'border-3 border-ink bg-accent p-6 text-ink shadow-[8px_8px_0_0_rgb(var(--cream))]',
                  s.tilt,
                )}
              >
                <CountUp value={stat.value} className="h-display block text-7xl lg:text-8xl" />
                <span className="label mt-4 block max-w-[22ch] leading-relaxed">{stat.label}</span>
              </div>
            </Reveal>
          )
        })}
      </ul>

      <div className="mt-20 grid gap-5 md:grid-cols-3 lg:mt-28">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <article data-accent={p.accent} className="b-box b-lift h-full p-6">
              <div className="flex items-center gap-3">
                <span className="h-title flex h-9 w-9 items-center justify-center border-3 border-ink bg-accent text-ink">
                  {i + 1}
                </span>
                <h3 className="h-title text-2xl">{p.title}</h3>
              </div>
              <p className="mt-4 leading-relaxed text-muted">{p.copy}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
