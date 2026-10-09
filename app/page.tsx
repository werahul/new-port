import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { SkillsSection } from '@/components/sections/skills-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { TimelineSection } from '@/components/sections/timeline-section'
import { SecuritySection } from '@/components/sections/security-section'
import { ContactSection } from '@/components/sections/contact-section'
import { Footer } from '@/components/layout/footer'
import { MarqueeBand } from '@/components/primitives'

/**
 * Light and dark sections alternate down the page; two tilted marquee bands
 * cut across the boundaries where the page asks its two loud questions.
 *
 *   Hero (light) → About (dark) → Skills (light)
 *   ── "What have I built?" ──
 *   Work (dark) → Experience (light) → Approach (dark)
 *   ── "What can we build next?" ──
 *   Contact (yellow) → Footer (dark)
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />

      <MarqueeBand
        accent="pink"
        tilt={2}
        velocity={-80}
        label="What have I built?"
        between={['cream', 'night']}
        items={['What have I built?', 'Selected work', 'Case studies']}
      />
      <ProjectsSection />

      <TimelineSection />
      <SecuritySection />

      <MarqueeBand
        accent="emerald"
        tilt={-2}
        velocity={80}
        label="What can we build next?"
        between={['night', 'yellow']}
        items={['What can we build next?', 'Open to work', 'Say hello']}
      />
      <ContactSection />
      <Footer />
    </>
  )
}
