import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { SkillsSection } from '@/components/sections/skills-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { TimelineSection } from '@/components/sections/timeline-section'
import { SecuritySection } from '@/components/sections/security-section'
import { ContactSection } from '@/components/sections/contact-section'
import { Footer } from '@/components/layout/footer'
import { ChapterEdge } from '@/components/motion'

/**
 * The page is scored, not stacked. Reading down:
 *
 *   cinematic opening (the hero's six-station descent)
 *   → quiet introduction        About
 *   → interactive world         Skills
 *   → LOUD                      "What have I built?"
 *   → showcase                  Projects
 *   → quiet                     Experience
 *   → quiet                     Approach
 *   → LOUD                      "What can we build next?"
 *   → calm ending               Contact
 *
 * Only two of the five transitions are loud. Everything else is deliberately
 * under-played so those two land.
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ChapterEdge from="cobalt" to="cyan" />
      <SkillsSection />

      <ChapterEdge
        variant="loud"
        from="cyan"
        to="coral"
        index="03"
        question="What have I built?"
        caption="Five builds — analytics, generative AI, fintech, marketing. Each one taken from interface through to backend."
      />
      <ProjectsSection />

      <ChapterEdge from="coral" to="emerald" />
      <TimelineSection />
      <ChapterEdge from="emerald" to="cobalt" />
      <SecuritySection />

      <ChapterEdge
        variant="loud"
        from="cobalt"
        to="violet"
        index="06"
        question="What can we build next?"
        caption="Open to full-time roles and selective freelance work."
      />
      <ContactSection />
      <Footer />
    </>
  )
}
