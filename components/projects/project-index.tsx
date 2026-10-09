import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Reveal, SkillTag } from '@/components/primitives'
import { PixelTransition } from '@/components/reactbits/pixel-transition'
import { featuredProjects, secondaryProjects, type Project } from '@/content/projects'
import { socials } from '@/content/profile'
import { cn } from '@/lib/utils'
import { TransitionLink } from './transition-link'
import { ProjectVisual } from './project-visual'

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** One featured build: a big framed visual and a poster-style caption, alternating sides. */
function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const flip = index % 2 === 1
  return (
    <Reveal tilt={flip ? 2 : -2}>
      <TransitionLink
        href={`/projects/${project.slug}`}
        data-pixel-host
        data-accent={project.accent}
        className={cn(
          'group grid items-center gap-6 lg:grid-cols-12 lg:gap-10',
          flip && 'lg:[&>*:first-child]:order-2',
        )}
        aria-label={`${project.title} — read the case study`}
      >
        <div className={cn('relative lg:col-span-7', flip ? 'lg:rotate-1' : 'lg:-rotate-1')}>
          <div className="b-box b-lift overflow-hidden bg-card shadow-b-lg">
            <div className="flex items-center justify-between border-b-3 border-ink bg-accent px-3 py-2 text-ink">
              <span className="label">{project.category}</span>
              <span className="label">{project.year ?? project.context}</span>
            </div>
            <PixelTransition
              className="aspect-[16/10] w-full"
              first={<ProjectVisual project={project} />}
              second={
                <div
                  data-tone="accent"
                  className="pattern-dots flex h-full w-full flex-col items-start justify-between bg-accent p-6 text-ink sm:p-8"
                >
                  <span className="h-display text-[7rem] leading-none sm:text-[9rem]">
                    {project.number}
                  </span>
                  <span className="h-title flex items-center gap-2 border-3 border-ink bg-paper px-4 py-2 text-lg shadow-[4px_4px_0_0_rgb(var(--ink))]">
                    Read the case study <ArrowRight className="h-5 w-5" strokeWidth={3} />
                  </span>
                </div>
              }
            />
          </div>
          <span className="sticker absolute -bottom-4 -right-2 rotate-6 text-base sm:-right-4">
            #{project.number}
          </span>
        </div>

        <div className="lg:col-span-5">
          <span className="label text-accent">{project.context}</span>
          <h3 className="h-title mt-3 text-3xl decoration-accent decoration-[5px] underline-offset-[6px] group-hover:underline sm:text-5xl">
            {project.title}
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-muted">{project.outcome}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <SkillTag as="li" key={t}>
                {t}
              </SkillTag>
            ))}
          </ul>
          <span className="b-btn mt-7">
            Case study
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
          </span>
        </div>
      </TransitionLink>
    </Reveal>
  )
}

/** Smaller builds — screenshot tiles that go straight to the live site. */
function MoreCard({ project, index }: { project: Project; index: number }) {
  const tilt = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-2', 'rotate-2'][index % 5]
  return (
    <Reveal delay={(index % 3) * 0.06}>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        data-accent={project.accent}
        className={cn('b-box b-lift group block h-full bg-card', tilt)}
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b-3 border-ink">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} — interface preview`}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ProjectVisual project={project} />
          )}
          <span className="sticker absolute left-3 top-3">{project.number}</span>
        </div>
        <div className="p-5">
          <span className="label text-muted">{project.category}</span>
          <h3 className="h-title mt-2 text-xl">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{project.outcome}</p>
          {project.href && (
            <span className="label mt-4 inline-flex items-center gap-1.5 bg-accent px-2 py-1 text-ink">
              {hostOf(project.href)}
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          )}
        </div>
      </a>
    </Reveal>
  )
}

const github = socials.find((s) => s.label === 'GitHub') ?? socials[0]

export function ProjectIndex() {
  return (
    <>
      <div className="mt-16 space-y-24 lg:mt-24 lg:space-y-32">
        {featuredProjects.map((p, i) => (
          <FeaturedCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="mt-28 lg:mt-36">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-3 border-edge pb-4">
          <h3 className="h-display text-4xl sm:text-6xl">More builds</h3>
          <span className="label text-muted">Live sites · opens in a new tab</span>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryProjects.map((p, i) => (
            <MoreCard key={p.slug} project={p} index={i} />
          ))}
          <Reveal delay={0.12}>
            <a
              href={github.href}
              target="_blank"
              rel="noopener noreferrer"
              className="b-lift pattern-dots flex h-full min-h-[260px] flex-col justify-between border-3 border-ink bg-yellow p-6 text-ink shadow-b"
              data-tone="accent"
            >
              <span className="label">Everything else</span>
              <span className="h-display text-5xl">
                More on
                <br />
                GitHub
              </span>
              <span className="label inline-flex items-center gap-1.5">
                github.com/werahul <ArrowUpRight aria-hidden className="h-4 w-4" strokeWidth={3} />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </>
  )
}
