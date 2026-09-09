import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Container, MagneticButton } from '@/components/primitives'
import { Footer } from '@/components/layout/footer'
import { ScrollReveal, TextReveal, Parallax } from '@/components/motion'
import {
  CaseStudyNav,
  CaseStudySection,
  ProjectVisual,
  TransitionLink,
  type NavSection,
} from '@/components/projects'
import {
  adjacentProjects,
  caseStudySlugs,
  getProject,
} from '@/content/projects'

export const dynamicParams = false

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const project = getProject(params.slug)
  if (!project) return {}
  const title = `${project.title} — Case Study`
  const url = `/projects/${project.slug}`
  return {
    title,
    description: project.outcome,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description: project.outcome,
      images: project.image ? [{ url: project.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: project.outcome,
      images: project.image ? [project.image] : undefined,
    },
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function ProjectCaseStudyPage({
  params,
}: {
  params: { slug: string }
}) {
  const project = getProject(params.slug)
  if (!project || !project.caseStudy) notFound()
  const cs = project.caseStudy
  const { prev, next } = adjacentProjects(project.slug)
  if (!prev || !next) notFound()

  const raw = [
    { id: 'overview', label: 'Overview', show: Boolean(cs.overview) },
    { id: 'problem', label: 'Problem', show: Boolean(cs.problem) },
    { id: 'role', label: 'My Role', show: cs.role.length > 0 },
    {
      id: 'architecture',
      label: 'Architecture',
      show: Boolean(cs.architecture?.length),
    },
    { id: 'technology', label: 'Technology', show: cs.tech.length > 0 },
    { id: 'challenges', label: 'Challenges', show: cs.challenges.length > 0 },
    { id: 'solution', label: 'Solution', show: cs.challenges.length > 0 },
    {
      id: 'performance',
      label: 'Performance',
      show: Boolean(cs.performance?.length),
    },
    {
      id: 'experience',
      label: 'Product Experience',
      show: Boolean(cs.experience?.length || cs.gallery?.length),
    },
    { id: 'results', label: 'Results', show: Boolean(cs.results?.length) },
    {
      id: 'links',
      label: 'Links',
      show: Boolean(cs.links?.length || cs.linkNote),
    },
  ]
  const sections: NavSection[] = raw
    .filter((s) => s.show)
    .map((s, i) => ({ ...s, n: String(i + 1).padStart(2, '0') }))
  const nOf = (id: string) => sections.find((s) => s.id === id)?.n ?? ''

  return (
    <>
      {/* The case study takes the project's own accent as its world. */}
      <article data-accent={project.accent} className="relative pb-24">
        <div className="atmosphere" aria-hidden />
      {/* ---- hero ------------------------------------------------------ */}
      <header className="relative isolate pt-24 sm:pt-28 lg:pt-32">
        <Container>
          <TransitionLink
            href="/#works"
            className="type-metadata inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </TransitionLink>

          <div className="type-metadata mt-9 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-muted-foreground">{project.number}</span>
            <span>{project.category}</span>
            <span className="text-muted-foreground">·</span>
            <span>{project.context}</span>
            {project.year && (
              <>
                <span className="text-muted-foreground">·</span>
                <span>{project.year}</span>
              </>
            )}
          </div>

          <TextReveal
            as="h1"
            split="lines"
            trigger="mount"
            className="type-display mt-5 max-w-[15ch] text-foreground"
          >
            {project.title}
          </TextReveal>

          <ScrollReveal
            as="p"
            variant="fade-up"
            delay={0.05}
            className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            {project.outcome}
          </ScrollReveal>

          <ScrollReveal
            as="dl"
            variant="fade-up"
            delay={0.1}
            className="mt-9 flex flex-wrap gap-x-10 gap-y-4"
          >
            <div>
              <dt className="type-metadata text-muted-foreground">Role</dt>
              <dd className="mt-1 text-sm text-foreground">{project.role}</dd>
            </div>
            <div>
              <dt className="type-metadata text-muted-foreground">Primary stack</dt>
              <dd className="mt-1 text-sm text-foreground">
                {project.tech.slice(0, 4).join('  ·  ')}
              </dd>
            </div>
            {project.href && (
              <div>
                <dt className="type-metadata text-muted-foreground">Live</dt>
                <dd className="mt-1 text-sm">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground hover:text-accent-strong"
                  >
                    {hostOf(project.href)}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </dd>
              </div>
            )}
          </ScrollReveal>
        </Container>

        <Container className="rhythm-lead">
          <Parallax
            travel={64}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 sm:aspect-[16/9]"
          >
            <ProjectVisual
              project={project}
              priority
              sizes="(min-width: 1024px) 1120px, 100vw"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/[0.06]"
            />
          </Parallax>
        </Container>
      </header>

      {/* ---- body --------------------------------------------------- */}
      <Container className="rhythm-block">
        <div className="grid gap-10 lg:grid-cols-[190px_1fr] lg:gap-16">
          <CaseStudyNav sections={sections} />

          <div className="min-w-0 space-y-16 lg:space-y-24">
            {cs.overview && (
              <CaseStudySection id="overview" n={nOf('overview')} label="Overview">
                <ScrollReveal
                  as="p"
                  variant="fade-up"
                  className="max-w-prose text-[1.0625rem] leading-relaxed text-muted-foreground"
                >
                  {cs.overview}
                </ScrollReveal>
              </CaseStudySection>
            )}

            {cs.problem && (
              <CaseStudySection id="problem" n={nOf('problem')} label="Problem">
                <ScrollReveal
                  as="p"
                  variant="fade-up"
                  className="max-w-2xl text-pretty text-xl leading-relaxed text-foreground/85"
                >
                  {cs.problem}
                </ScrollReveal>
              </CaseStudySection>
            )}

            {cs.role.length > 0 && (
              <CaseStudySection id="role" n={nOf('role')} label="My Role">
                <ScrollReveal as="ul" stagger variant="fade-up" distance={16}>
                  {cs.role.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border-b border-line/60 py-3.5 text-[0.975rem] leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-strong" />
                      {item}
                    </li>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            )}

            {cs.architecture?.length ? (
              <CaseStudySection
                id="architecture"
                n={nOf('architecture')}
                label="Architecture"
              >
                <ScrollReveal
                  as="div"
                  stagger
                  variant="fade-up"
                  distance={16}
                  className="relative space-y-3 border-l border-line pl-6"
                >
                  {cs.architecture.map((layer) => (
                    <div key={layer.layer} className="relative">
                      <span className="absolute -left-[27px] top-4 h-2 w-2 rounded-full bg-background ring-1 ring-accent-strong" />
                      <div className="surface rounded-xl p-4 sm:p-5">
                        <div className="type-metadata text-accent-strong">
                          {layer.layer}
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {layer.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            ) : null}

            {cs.tech.length > 0 && (
              <CaseStudySection
                id="technology"
                n={nOf('technology')}
                label="Technology"
              >
                <ScrollReveal as="div" stagger variant="fade-up" distance={14} className="space-y-6">
                  {cs.tech.map((group) => (
                    <div key={group.group}>
                      <div className="type-metadata text-muted-foreground">
                        {group.group}
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="rounded-md border border-line px-2.5 py-1.5 text-[0.8rem] font-medium tracking-tight text-foreground/80"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            )}

            {cs.challenges.length > 0 && (
              <CaseStudySection
                id="challenges"
                n={nOf('challenges')}
                label="Engineering Challenges"
              >
                <ScrollReveal as="div" stagger variant="fade-up" distance={16}>
                  {cs.challenges.map((c, i) => (
                    <div
                      key={c.title}
                      className="flex gap-4 border-t border-line/60 py-5 first:border-t-0 first:pt-0"
                    >
                      <span className="type-metadata shrink-0 text-muted-foreground">
                        C{i + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          {c.title}
                        </h3>
                        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                          {c.challenge}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            )}

            {cs.challenges.length > 0 && (
              <CaseStudySection
                id="solution"
                n={nOf('solution')}
                label="Solution"
              >
                <ScrollReveal as="div" stagger variant="fade-up" distance={16}>
                  {cs.challenges.map((c, i) => (
                    <div
                      key={c.title}
                      className="flex gap-4 border-t border-line/60 py-5 first:border-t-0 first:pt-0"
                    >
                      <span className="type-metadata shrink-0 text-accent-strong">
                        S{i + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          {c.title}
                        </h3>
                        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                          {c.solution}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            )}

            {cs.performance?.length ? (
              <CaseStudySection
                id="performance"
                n={nOf('performance')}
                label="Performance"
              >
                <ScrollReveal as="ul" stagger variant="fade-up" distance={16}>
                  {cs.performance.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border-b border-line/60 py-3.5 text-[0.975rem] leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-strong" />
                      {item}
                    </li>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            ) : null}

            {(cs.experience?.length || cs.gallery?.length) && (
              <CaseStudySection
                id="experience"
                n={nOf('experience')}
                label="Product Experience"
              >
                {cs.experience?.length ? (
                  <ScrollReveal as="ul" stagger variant="fade-up" distance={16} className="mb-8">
                    {cs.experience.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 border-b border-line/60 py-3.5 text-[0.975rem] leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-strong" />
                        {item}
                      </li>
                    ))}
                  </ScrollReveal>
                ) : null}

                {cs.gallery?.length ? (
                  <div className="space-y-8">
                    {cs.gallery.map((shot) => (
                      <Parallax
                        key={shot.src}
                        travel={40}
                        as="figure"
                        className="overflow-hidden"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-surface-2">
                          <Image
                            src={shot.src}
                            alt={shot.caption ?? `${project.title} screen`}
                            fill
                            sizes="(min-width: 1024px) 860px, 100vw"
                            className="object-cover"
                          />
                        </div>
                        {shot.caption && (
                          <figcaption className="type-metadata mt-3 text-muted-foreground">
                            {shot.caption}
                          </figcaption>
                        )}
                      </Parallax>
                    ))}
                  </div>
                ) : null}
              </CaseStudySection>
            )}

            {cs.results?.length ? (
              <CaseStudySection id="results" n={nOf('results')} label="Results">
                <ScrollReveal
                  as="div"
                  stagger
                  variant="fade-up"
                  distance={18}
                  className="grid gap-4 sm:grid-cols-3"
                >
                  {cs.results.map((metric) => (
                    <div key={metric.label} className="surface rounded-xl p-5 sm:p-6">
                      <div className="font-display text-3xl font-medium tracking-tight text-foreground">
                        {metric.value}
                      </div>
                      <div className="mt-2 text-xs leading-snug text-muted-foreground">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </ScrollReveal>
              </CaseStudySection>
            ) : null}

            {(cs.links?.length || cs.linkNote) && (
              <CaseStudySection id="links" n={nOf('links')} label="Links">
                {cs.links?.length ? (
                  <ScrollReveal as="div" variant="fade-up" className="flex flex-wrap gap-3">
                    {cs.links.map((link) => (
                      <MagneticButton
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        variant="line"
                        withArrow
                      >
                        {link.label}
                      </MagneticButton>
                    ))}
                  </ScrollReveal>
                ) : (
                  <ScrollReveal
                    as="p"
                    variant="fade"
                    className="text-sm text-muted-foreground"
                  >
                    {cs.linkNote}
                  </ScrollReveal>
                )}
              </CaseStudySection>
            )}
          </div>
        </div>
      </Container>

      {/* ---- prev / next ------------------------------------------- */}
      <Container className="rhythm-block">
        <div className="grid gap-6 border-t border-line pt-10 sm:grid-cols-2">
          <TransitionLink
            href={`/projects/${prev.slug}`}
            className="group"
          >
            <span className="type-metadata text-muted-foreground">Previous</span>
            <span className="type-project mt-2 block text-foreground transition-colors group-hover:text-accent-strong">
              {prev.title}
            </span>
          </TransitionLink>
          <TransitionLink
            href={`/projects/${next.slug}`}
            className="group sm:text-right"
          >
            <span className="type-metadata text-muted-foreground">Next</span>
            <span className="type-project mt-2 block text-foreground transition-colors group-hover:text-accent-strong">
              {next.title}
            </span>
          </TransitionLink>
        </div>
      </Container>
      </article>

      <Footer />
    </>
  )
}
