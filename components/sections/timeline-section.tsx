import { MagneticButton, Section, SectionHeading } from '@/components/primitives'
import { ExperienceJourney } from './experience-journey'
import { profile } from '@/content/profile'

export function TimelineSection() {
  return (
    <Section id="timeline" accent="emerald" atmosphere>
      <SectionHeading
        index="04"
        label="Experience"
        question="Where have I applied it?"
        title="Two roles, deeper each time"
        description="From shipping client sites on an agency cadence to owning a multi-application platform — each step further into systems, not screens. Scroll to follow it."
      />

      <ExperienceJourney />

      <div data-seq className="rhythm-lead border-t border-line pt-10">
        <MagneticButton href={profile.resumeUrl} target="_blank" variant="line" withArrow>
          Download full résumé
        </MagneticButton>
      </div>
    </Section>
  )
}
