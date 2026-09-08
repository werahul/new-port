import { Section, SectionHeading } from '@/components/primitives'
import { ProjectIndex } from '@/components/projects'

export function ProjectsSection() {
  return (
    // The chapter card immediately above already asked the question and set the
    // context, so this opens compact rather than restating it at full height.
    <Section id="works" accent="coral" spacing="compact" atmosphere>
      <SectionHeading
        index="03"
        label="Selected Work"
        title="Five builds, told properly"
        description="Every one of them has a full case study — the problem, the architecture, the engineering that was actually hard, and what shipped."
      />

      <ProjectIndex />
    </Section>
  )
}
