import { Section, SectionHeading } from '@/components/primitives'
import { ProjectIndex } from '@/components/projects'

export function ProjectsSection() {
  return (
    <Section id="works" tone="dark" accent="coral">
      <SectionHeading
        index="03"
        label="Selected work"
        accent="coral"
        title="Five builds, told properly"
        description="Every one has a full case study — the problem, the architecture, the engineering that was actually hard, and what shipped."
      />
      <ProjectIndex />
    </Section>
  )
}
