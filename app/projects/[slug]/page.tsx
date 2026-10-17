import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CaseOutline, type OutlineItem } from '@/components/lab/case-outline'
import { CroppedImage } from '@/components/lab/cropped-image'
import { ArchitectureDiagram } from '@/components/lab/fallbacks'
import { LabFooter } from '@/components/lab/footer'
import { StageSurface } from '@/components/lab/stage-surface'
import { WorldHost } from '@/components/lab/world/world-host'
import { CountUp } from '@/components/lab/count-up'
import { exhibits, sceneData } from '@/content/lab'
import { adjacentProjects, caseStudySlugs, getProject, type Project } from '@/content/projects'
import { JsonLd } from '@/components/lab/json-ld'
import { siteName } from '@/lib/site'
import { caseStudyJsonLd } from '@/lib/structured-data'

export const dynamicParams = false

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }))
}

/**
 * The outcome line, plus the primary stack when it still fits a search
 * snippet — so the description says what was built *and* with what.
 */
function describe(project: Project) {
  const withStack = `${project.outcome} Built with ${project.tech.slice(0, 3).join(', ')}.`
  return withStack.length <= 160 ? withStack : project.outcome
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getProject(params.slug)
  if (!project) return {}
  // the suffix only while the full title (template adds " — Rahul Kumar") fits a result line
  const study = `${project.title} — Case Study`
  const title = `${study} — ${siteName}`.length <= 60 ? study : project.title
  const description = describe(project)
  const url = `/projects/${project.slug}`
  // images come from ./opengraph-image.tsx; siteName and locale are restated
  // because a page-level openGraph object replaces the root one wholesale
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

/** Before paint: expect the world unless motion is reduced or 3D is switched off. */
const expectWorld = `(function(){try{var r=document.currentScript.parentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;r.setAttribute('data-world','pending')}catch(e){}})()`

/** A numbered section of the study, set as one editor window. */
function Part({
  id,
  n,
  label,
  children,
}: {
  id: string
  n: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="l-case-part" aria-labelledby={`${id}-title`}>
      <div className="l-case-part-head">
        <span className="l-case-n">{n}</span>
        <h2 id={`${id}-title`} className="l-case-h">
          {label}
        </h2>
      </div>
      <div className="l-case-body">{children}</div>
    </section>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="l-bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/**
 * A case study: the project's exhibit from the home journey, parked as the
 * hero's 3D scene (see world/case-rig.tsx), then the full study in editor
 * windows beside a sticky outline. Every word is server-rendered; the 3D is
 * an enhancement behind it.
 */
export default function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  if (!project || !project.caseStudy) notFound()
  const cs = project.caseStudy
  const { prev, next } = adjacentProjects(project.slug)
  if (!prev || !next) notFound()

  const exhibitIndex = exhibits.findIndex((e) => e.project.slug === project.slug)
  const exhibit = exhibits[exhibitIndex]
  const live = cs.links?.[0]?.href ?? project.href

  const raw = [
    { id: 'overview', label: 'Overview', show: Boolean(cs.overview) },
    { id: 'problem', label: 'Problem', show: Boolean(cs.problem) },
    { id: 'role', label: 'My role', show: cs.role.length > 0 },
    { id: 'architecture', label: 'Architecture', show: Boolean(cs.architecture?.length) },
    { id: 'technology', label: 'Technology', show: cs.tech.length > 0 },
    { id: 'challenges', label: 'Engineering challenges', show: cs.challenges.length > 0 },
    { id: 'solution', label: 'Solution', show: cs.challenges.length > 0 },
    { id: 'performance', label: 'Performance', show: Boolean(cs.performance?.length) },
    {
      id: 'experience',
      label: 'Product experience',
      show: Boolean(cs.experience?.length || cs.gallery?.length),
    },
    { id: 'results', label: 'Results', show: Boolean(cs.results?.length) },
    { id: 'links', label: 'Links', show: Boolean(cs.links?.length || cs.linkNote) },
  ]
  const items: OutlineItem[] = raw
    .filter((s) => s.show)
    .map((s, i) => ({ id: s.id, label: s.label, n: String(i + 1).padStart(2, '0') }))
  const at = (id: string) => items.find((s) => s.id === id)

  return (
    <div className="l-case" data-world="off" suppressHydrationWarning>
      <JsonLd data={caseStudyJsonLd(project, describe(project))} />
      {/* archived studies have no exhibit in the world, so they never expect one */}
      {exhibitIndex >= 0 && (
        <>
          <script dangerouslySetInnerHTML={{ __html: expectWorld }} />
          <WorldHost scene={sceneData()} exhibit={exhibitIndex} />
        </>
      )}

      <div className="l-content">
        {/* ---- hero ---------------------------------------------------- */}
        <header className="l-wrap l-case-hero">
          <div className="l-case-intro">
            <Link href="/#work" className="l-chip l-case-back">
              <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.25} />
              All projects
            </Link>


            <p className="l-label">
              <span className="l-ember">{project.number}</span>
              <span>{project.category}</span>
            </p>
            <h1 className="l-display l-case-title">{project.title}</h1>
            <p className="l-lead l-case-outcome">{project.outcome}</p>

            <dl className="l-case-facts l-scrim">
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Context</dt>
                <dd>
                  {project.context}
                  {project.year ? ` · ${project.year}` : ''}
                </dd>
              </div>
              {live && (
                <div>
                  <dt>Live</dt>
                  <dd>
                    <a href={live} target="_blank" rel="noopener noreferrer">
                      {hostOf(live)}
                      <ArrowUpRight aria-hidden="true" size={15} strokeWidth={2.25} />
                      <span className="l-sr"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              )}
              <div className="l-case-facts-wide">
                <dt>Primary stack</dt>
                <dd>
                  <ul className="l-tags">
                    {project.tech.slice(0, 6).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>

          {/* the stage: the 3D exhibit lives here; without WebGL, its flat version */}
          <div className="l-stage l-case-stage" data-kind={exhibit?.kind}>
            <div className="l-fallback l-stage-fallback">
              {exhibit?.kind === 'architecture' ? (
                <ArchitectureDiagram highlight={exhibit.highlight} />
              ) : project.image ? (
                <CroppedImage
                  src={project.image}
                  alt={`${project.title} — ${project.context}`}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  widths={[640, 828, 1080, 1200]}
                  priority
                />
              ) : null}
            </div>
            {exhibitIndex >= 0 && exhibit && (
              <>
                <StageSurface index={exhibitIndex} label={`${project.title}: ${exhibit.stageNote}`} />
                <p className="l-stage-note">{exhibit.stageNote}</p>
              </>
            )}
          </div>
        </header>

        {/* ---- the study ------------------------------------------------ */}
        <div className="l-wrap l-case-layout">
          <CaseOutline items={items} />

          <article className="l-case-main" aria-label={`${project.title} case study`}>
            {cs.overview && (
              <Part id="overview" n={at('overview')!.n} label="Overview">
                <p className="l-body l-case-lead">{cs.overview}</p>
              </Part>
            )}

            {cs.problem && (
              <Part id="problem" n={at('problem')!.n} label="Problem">
                <p className="l-case-problem">{cs.problem}</p>
              </Part>
            )}

            {cs.role.length > 0 && (
              <Part id="role" n={at('role')!.n} label="My role">
                <Bullets items={cs.role} />
              </Part>
            )}

            {cs.architecture?.length ? (
              <Part id="architecture" n={at('architecture')!.n} label="Architecture">
                <ol className="l-layers">
                  {cs.architecture.map((layer, i) => (
                    <li key={layer.layer} style={{ '--i': i } as React.CSSProperties}>
                      <span className="l-layer-name">{layer.layer}</span>
                      <span className="l-layer-detail">{layer.detail}</span>
                    </li>
                  ))}
                </ol>
              </Part>
            ) : null}

            {cs.tech.length > 0 && (
              <Part id="technology" n={at('technology')!.n} label="Technology">
                <div className="l-stack-groups">
                  {cs.tech.map((group) => (
                    <div key={group.group} className="l-stack-group">
                      <h3 className="l-label">{group.group}</h3>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Part>
            )}

            {cs.challenges.length > 0 && (
              <Part
                id="challenges"
                n={at('challenges')!.n}
                label="Engineering challenges"
               
              >
                <div className="l-challenges">
                  {cs.challenges.map((c, i) => (
                    <div key={c.title} className="l-challenge">
                      <span className="l-badge">C{i + 1}</span>
                      <h3 className="l-challenge-t">{c.title}</h3>
                      <p>{c.challenge}</p>
                    </div>
                  ))}
                </div>
              </Part>
            )}

            {cs.challenges.length > 0 && (
              <Part id="solution" n={at('solution')!.n} label="Solution">
                <ol className="l-solutions">
                  {cs.challenges.map((c, i) => (
                    <li key={c.title}>
                      <span className="l-badge l-badge-ok">S{i + 1}</span>
                      <div>
                        <h3 className="l-challenge-t">{c.title}</h3>
                        <p>{c.solution}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Part>
            )}

            {cs.performance?.length ? (
              <Part id="performance" n={at('performance')!.n} label="Performance">
                <Bullets items={cs.performance} />
              </Part>
            ) : null}

            {cs.experience?.length || cs.gallery?.length ? (
              <Part
                id="experience"
                n={at('experience')!.n}
                label="Product experience"
               
              >
                {cs.experience?.length ? <Bullets items={cs.experience} /> : null}
                {cs.gallery?.length ? (
                  <div className="l-gallery">
                    {cs.gallery.map((shot) => (
                      <figure key={shot.src}>
                        <div className="l-shot">
                          <Image
                            src={shot.src}
                            alt={shot.caption ?? `${project.title} screen`}
                            fill
                            sizes="(min-width: 1024px) 860px, 100vw"
                          />
                        </div>
                        {shot.caption && <figcaption>{shot.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                ) : null}
              </Part>
            ) : null}

            {cs.results?.length ? (
              <Part id="results" n={at('results')!.n} label="Results">
                <dl className="l-results l-case-results">
                  {cs.results.map((metric) => (
                    <div key={metric.label}>
                      <dt>
                        <CountUp value={metric.value} />
                      </dt>
                      <dd>{metric.label}</dd>
                    </div>
                  ))}
                </dl>
              </Part>
            ) : null}

            {cs.links?.length || cs.linkNote ? (
              <Part id="links" n={at('links')!.n} label="Links">
                {cs.links?.length ? (
                  <div className="l-actions">
                    {cs.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="l-btn l-btn-solid"
                      >
                        {link.label}
                        <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2.25} />
                        <span className="l-sr"> (opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="l-case-note">{cs.linkNote}</p>
                )}
              </Part>
            ) : null}
          </article>
        </div>

        {/* ---- prev / next --------------------------------------------- */}
        <nav aria-label="More case studies" className="l-wrap l-case-more">
          <Link href={`/projects/${prev.slug}`} className="l-more l-scrim">
            <span className="l-more-dir">
              <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.25} />
              Previous
            </span>
            <span className="l-more-t">{prev.title}</span>
          </Link>
          <Link href={`/projects/${next.slug}`} className="l-more l-more-next l-scrim">
            <span className="l-more-dir">
              Next
              <ArrowRight aria-hidden="true" size={15} strokeWidth={2.25} />
            </span>
            <span className="l-more-t">{next.title}</span>
          </Link>
        </nav>

        <LabFooter topHref="#main" />
      </div>
    </div>
  )
}
