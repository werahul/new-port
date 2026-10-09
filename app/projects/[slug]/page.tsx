import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button, Container, Reveal, SkillTag } from '@/components/primitives'
import { Footer } from '@/components/layout/footer'
import { CountUp } from '@/components/reactbits/count-up'
import {
  CaseStudyNav,
  CaseStudySection,
  ProjectVisual,
  TransitionLink,
  type NavSection,
} from '@/components/projects'
import { adjacentProjects, caseStudySlugs, getProject } from '@/content/projects'
import { cn } from '@/lib/utils'

export const dynamicParams = false

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
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

/** A ruled list with square ink bullets. */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-4 text-[1.0125rem] leading-relaxed">
          <span aria-hidden className="mt-2 h-3 w-3 shrink-0 border-2 border-ink bg-accent" />
          <span className="text-muted">{item}</span>
        </li>
      ))}
    </ul>
  )
}

const RESULT_FILLS = ['bg-yellow', 'bg-pink', 'bg-cyan']

export default function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  if (!project || !project.caseStudy) notFound()
  const cs = project.caseStudy
  const { prev, next } = adjacentProjects(project.slug)
  if (!prev || !next) notFound()

  const raw = [
    { id: 'overview', label: 'Overview', show: Boolean(cs.overview) },
    { id: 'problem', label: 'Problem', show: Boolean(cs.problem) },
    { id: 'role', label: 'My Role', show: cs.role.length > 0 },
    { id: 'architecture', label: 'Architecture', show: Boolean(cs.architecture?.length) },
    { id: 'technology', label: 'Technology', show: cs.tech.length > 0 },
    { id: 'challenges', label: 'Challenges', show: cs.challenges.length > 0 },
    { id: 'solution', label: 'Solution', show: cs.challenges.length > 0 },
    { id: 'performance', label: 'Performance', show: Boolean(cs.performance?.length) },
    {
      id: 'experience',
      label: 'Product Experience',
      show: Boolean(cs.experience?.length || cs.gallery?.length),
    },
    { id: 'results', label: 'Results', show: Boolean(cs.results?.length) },
    { id: 'links', label: 'Links', show: Boolean(cs.links?.length || cs.linkNote) },
  ]
  const sections: NavSection[] = raw
    .filter((s) => s.show)
    .map((s, i) => ({ ...s, n: String(i + 1).padStart(2, '0') }))
  const nOf = (id: string) => sections.find((s) => s.id === id)?.n ?? ''

  return (
    <>
      {/* The case study takes the project's own accent as its world. */}
      <article data-accent={project.accent}>
        {/* ---- hero ---------------------------------------------------- */}
        <header data-tone="light" className="relative isolate overflow-hidden bg-bg pb-16 pt-8 text-fg sm:pt-12">
          <div aria-hidden className="pattern-grid pointer-events-none absolute inset-0 -z-10" />
          <Container>
            <TransitionLink
              href="/#works"
              className="label inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 shadow-[3px_3px_0_0_rgb(var(--ink))] transition-transform hover:-translate-x-1"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={3} />
              All projects
            </TransitionLink>

            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="sticker -rotate-2 text-base">#{project.number}</span>
                  <span className="label">{project.category}</span>
                  <span className="label text-muted">
                    {project.context}
                    {project.year && ` · ${project.year}`}
                  </span>
                </div>
                <h1 className="h-display mt-6 break-words text-[clamp(2.3rem,5.4vw,4.75rem)]">{project.title}</h1>
                <p className="mt-6 max-w-2xl border-l-[6px] border-accent pl-5 text-xl leading-relaxed">
                  {project.outcome}
                </p>
              </div>

              <dl className="b-box grid gap-0 divide-y-3 divide-ink p-0 lg:col-span-5">
                <div className="p-4">
                  <dt className="label text-muted">Role</dt>
                  <dd className="h-title mt-1 text-xl">{project.role}</dd>
                </div>
                <div className="p-4">
                  <dt className="label text-muted">Primary stack</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {project.tech.slice(0, 5).map((t) => (
                      <SkillTag key={t} accent={project.accent}>
                        {t}
                      </SkillTag>
                    ))}
                  </dd>
                </div>
                {project.href && (
                  <div className="p-4">
                    <dt className="label text-muted">Live</dt>
                    <dd className="mt-1">
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-title inline-flex items-center gap-1.5 text-xl underline decoration-accent decoration-[4px] underline-offset-4"
                      >
                        {hostOf(project.href)}
                        <ArrowUpRight aria-hidden className="h-5 w-5" strokeWidth={3} />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="b-box relative mt-14 -rotate-1 overflow-hidden shadow-b-xl">
              <div className="flex items-center justify-between border-b-3 border-ink bg-ink px-3 py-2 text-cream">
                <span className="label">{project.title}</span>
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-3 w-3 border-2 border-cream bg-pink" />
                  <span className="h-3 w-3 border-2 border-cream bg-yellow" />
                  <span className="h-3 w-3 border-2 border-cream bg-emerald" />
                </span>
              </div>
              <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                <ProjectVisual project={project} priority sizes="(min-width: 1320px) 1240px, 100vw" />
              </div>
            </div>
          </Container>
        </header>

        {/* ---- body ---------------------------------------------------- */}
        <div data-tone="light" className="border-t-3 border-ink bg-paper text-fg [--card:var(--cream)]">
          <Container className="py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
              <CaseStudyNav sections={sections} />

              <div className="min-w-0 space-y-16 lg:space-y-24">
                {cs.overview && (
                  <CaseStudySection id="overview" n={nOf('overview')} label="Overview">
                    <p className="max-w-prose text-lg leading-relaxed">{cs.overview}</p>
                  </CaseStudySection>
                )}

                {cs.problem && (
                  <CaseStudySection id="problem" n={nOf('problem')} label="Problem">
                    <Reveal tilt={-1}>
                      <p className="b-box max-w-3xl bg-accent p-6 text-xl font-medium leading-relaxed text-ink sm:p-8 sm:text-2xl">
                        {cs.problem}
                      </p>
                    </Reveal>
                  </CaseStudySection>
                )}

                {cs.role.length > 0 && (
                  <CaseStudySection id="role" n={nOf('role')} label="My Role">
                    <BulletList items={cs.role} />
                  </CaseStudySection>
                )}

                {cs.architecture?.length ? (
                  <CaseStudySection id="architecture" n={nOf('architecture')} label="Architecture">
                    <ol className="space-y-4">
                      {cs.architecture.map((layer, i) => (
                        <Reveal as="li" key={layer.layer} delay={i * 0.05}>
                          <div
                            className="b-box flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-5"
                            style={{ marginLeft: `${Math.min(i, 4) * 3}%` }}
                          >
                            <span className="h-title shrink-0 text-lg sm:w-48">{layer.layer}</span>
                            <span className="leading-relaxed text-muted">{layer.detail}</span>
                          </div>
                        </Reveal>
                      ))}
                    </ol>
                  </CaseStudySection>
                ) : null}

                {cs.tech.length > 0 && (
                  <CaseStudySection id="technology" n={nOf('technology')} label="Technology">
                    <div className="grid gap-5 sm:grid-cols-2">
                      {cs.tech.map((group) => (
                        <div key={group.group} className="border-3 border-ink p-4">
                          <div className="label">{group.group}</div>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {group.items.map((item) => (
                              <SkillTag as="li" key={item}>
                                {item}
                              </SkillTag>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CaseStudySection>
                )}

                {cs.challenges.length > 0 && (
                  <CaseStudySection id="challenges" n={nOf('challenges')} label="Engineering Challenges">
                    <div className="grid gap-5 md:grid-cols-2">
                      {cs.challenges.map((c, i) => (
                        <Reveal key={c.title} delay={i * 0.05} tilt={i % 2 ? 2 : -2}>
                          <div className="b-box h-full p-5">
                            <span className="label text-muted">C{i + 1}</span>
                            <h3 className="h-title mt-2 text-xl">{c.title}</h3>
                            <p className="mt-3 leading-relaxed text-muted">{c.challenge}</p>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </CaseStudySection>
                )}

                {cs.challenges.length > 0 && (
                  <CaseStudySection id="solution" n={nOf('solution')} label="Solution">
                    <div className="space-y-4">
                      {cs.challenges.map((c, i) => (
                        <div key={c.title} className="flex gap-4 border-3 border-ink bg-card p-5">
                          <span className="h-title flex h-10 w-10 shrink-0 items-center justify-center border-3 border-ink bg-accent text-ink">
                            S{i + 1}
                          </span>
                          <div>
                            <h3 className="h-title text-xl">{c.title}</h3>
                            <p className="mt-2 leading-relaxed text-muted">{c.solution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CaseStudySection>
                )}

                {cs.performance?.length ? (
                  <CaseStudySection id="performance" n={nOf('performance')} label="Performance">
                    <BulletList items={cs.performance} />
                  </CaseStudySection>
                ) : null}

                {(cs.experience?.length || cs.gallery?.length) && (
                  <CaseStudySection id="experience" n={nOf('experience')} label="Product Experience">
                    {cs.experience?.length ? (
                      <div className="mb-10">
                        <BulletList items={cs.experience} />
                      </div>
                    ) : null}
                    {cs.gallery?.length ? (
                      <div className="space-y-10">
                        {cs.gallery.map((shot, i) => (
                          <Reveal as="figure" key={shot.src} tilt={i % 2 ? 1.5 : -1.5}>
                            <div className="b-box relative aspect-[16/10] w-full overflow-hidden">
                              <Image
                                src={shot.src}
                                alt={shot.caption ?? `${project.title} screen`}
                                fill
                                sizes="(min-width: 1024px) 900px, 100vw"
                                className="object-cover object-top"
                              />
                            </div>
                            {shot.caption && (
                              <figcaption className="label mt-4 inline-block bg-ink px-2 py-1 text-cream">
                                {shot.caption}
                              </figcaption>
                            )}
                          </Reveal>
                        ))}
                      </div>
                    ) : null}
                  </CaseStudySection>
                )}

                {cs.results?.length ? (
                  <CaseStudySection id="results" n={nOf('results')} label="Results">
                    <div className="grid gap-6 sm:grid-cols-3">
                      {cs.results.map((metric, i) => (
                        <Reveal key={metric.label} delay={i * 0.06} tilt={i % 2 ? 3 : -3}>
                          <div
                            className={cn(
                              'h-full border-3 border-ink p-5 text-ink shadow-[6px_6px_0_0_rgb(var(--ink))]',
                              RESULT_FILLS[i % RESULT_FILLS.length],
                            )}
                          >
                            <CountUp value={metric.value} className="h-display block text-6xl" />
                            <div className="label mt-3 leading-relaxed">{metric.label}</div>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </CaseStudySection>
                ) : null}

                {(cs.links?.length || cs.linkNote) && (
                  <CaseStudySection id="links" n={nOf('links')} label="Links">
                    {cs.links?.length ? (
                      <div className="flex flex-wrap gap-4">
                        {cs.links.map((link) => (
                          <Button key={link.href} href={link.href} withArrow>
                            {link.label}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="inline-block border-3 border-dashed border-ink px-4 py-3 font-mono text-sm">
                        {cs.linkNote}
                      </p>
                    )}
                  </CaseStudySection>
                )}
              </div>
            </div>
          </Container>
        </div>

        {/* ---- prev / next ------------------------------------------- */}
        <nav aria-label="More case studies" data-tone="dark" className="border-t-3 border-ink bg-bg text-fg">
          <Container className="grid gap-6 py-14 sm:grid-cols-2">
            <TransitionLink
              href={`/projects/${prev.slug}`}
              data-accent={prev.accent}
              className="b-box b-lift group flex flex-col p-6"
            >
              <span className="label inline-flex items-center gap-2 text-muted">
                <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={3} /> Previous
              </span>
              <span className="h-title mt-3 text-2xl decoration-accent decoration-[4px] underline-offset-4 group-hover:underline sm:text-3xl">
                {prev.title}
              </span>
            </TransitionLink>
            <TransitionLink
              href={`/projects/${next.slug}`}
              data-accent={next.accent}
              className="b-box b-lift group flex flex-col p-6 sm:items-end sm:text-right"
            >
              <span className="label inline-flex items-center gap-2 text-muted">
                Next <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="h-title mt-3 text-2xl decoration-accent decoration-[4px] underline-offset-4 group-hover:underline sm:text-3xl">
                {next.title}
              </span>
            </TransitionLink>
          </Container>
        </nav>
      </article>

      <Footer />
    </>
  )
}
