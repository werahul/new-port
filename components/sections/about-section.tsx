import { ArrowDown } from 'lucide-react'
import { Section, SectionHeading } from '@/components/primitives'
import { ScrollReveal } from '@/components/motion'
import { profile } from '@/content/profile'

/**
 * Three ways of working, stated plainly. Previously an icon-card triptych —
 * the single most template-like block on the page. The claims are unchanged;
 * only the form is, from boxed cards to a ruled editorial index.
 */
const principles = [
  {
    title: 'Architecture',
    copy: 'Micro-frontends, shared component libraries and boundaries that let teams ship independently without drift.',
  },
  {
    title: 'Performance',
    copy: 'Rendering strategy, asset discipline and measurement — recent work took a Lighthouse score to 98.',
  },
  {
    title: 'Product thinking',
    copy: 'Deciding what to build and what to leave out, so the interface earns its complexity.',
  },
]

export function AboutSection() {
  return (
    <Section id="about" accent="cobalt" spacing="loose" atmosphere>
      <SectionHeading
        index="01"
        label="About"
        question="How do I think?"
        title="Frontend depth, full-stack range"
        description="I started in the browser and worked outward — into APIs, data models and the architecture that keeps a product coherent as it grows."
      />

      {/* The quiet beat of the page: one statement, given room. */}
      <ScrollReveal
        variant="fade-up"
        className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-16"
      >
        <p className="text-pretty text-[1.35rem] leading-[1.5] tracking-tight text-foreground/90 lg:col-span-7 lg:text-[1.6rem]">
          {profile.summary}
        </p>
        <div className="space-y-5 text-[0.975rem] leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9 lg:pt-2">
          <p>
            I care about code that lasts: clear boundaries, honest naming and
            interfaces that stay calm under real data. Good engineering, to me,
            is as much about what you decide not to build.
          </p>
          <a
            href="#skills"
            className="type-metadata inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            See the full capability map
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </div>
      </ScrollReveal>

      {/* Figures at a scale that reads as confidence rather than a stat strip. */}
      <ScrollReveal
        stagger
        variant="fade-up"
        distance={18}
        className="mt-20 grid border-t border-line lg:mt-28 sm:grid-cols-3"
      >
        {profile.stats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-line py-8 sm:border-b-0 sm:border-r sm:px-8 sm:py-10 sm:last:border-r-0 sm:first:pl-0 sm:last:pr-0"
          >
            <div className="font-display text-[3.5rem] font-medium leading-none tracking-tighter text-foreground lg:text-[4.5rem]">
              {stat.value}
            </div>
            <div className="type-metadata mt-4 max-w-[22ch] leading-relaxed">
              {stat.label}
            </div>
          </div>
        ))}
      </ScrollReveal>

      <ScrollReveal
        as="ol"
        stagger
        variant="fade-up"
        distance={22}
        className="mt-20 grid gap-x-10 gap-y-12 lg:mt-28 md:grid-cols-3"
      >
        {principles.map((p, i) => (
          <li key={p.title} className="relative border-t border-line pt-7">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px w-12 bg-accent"
            />
            <span className="type-metadata type-metadata-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-4 text-[1.2rem] font-semibold tracking-tight text-foreground">
              {p.title}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              {p.copy}
            </p>
          </li>
        ))}
      </ScrollReveal>
    </Section>
  )
}
