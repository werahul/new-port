/**
 * Schema.org JSON-LD for the site, built only from the content modules — the
 * same sourcing rule as content/projects.ts: nothing here is stated that the
 * page doesn't already say. Server-only (it reads lib/site.ts).
 *
 * Every page describes the same Person and WebSite by `@id`, so search and
 * answer engines resolve one entity rather than one per page.
 */
import { experience } from '@/content/experience'
import { profile, socials } from '@/content/profile'
import type { Project } from '@/content/projects'
import { skillDomains } from '@/content/skills'
import { siteDescription, siteName, siteUrl } from '@/lib/site'

const personId = `${siteUrl}/#person`
const websiteId = `${siteUrl}/#website`

const abs = (path: string) => new URL(path, siteUrl).toString()

/** Day-to-day, shipped skills from the build-facing domains — not tooling or study. */
const knowsAbout = skillDomains
  .filter((d) => ['frontend', 'backend', 'database', 'performance'].includes(d.id))
  .flatMap((d) => d.skills.filter((s) => s.level === 'core').map((s) => s.name))
  .concat('Micro-Frontend Architecture')

function person() {
  const current = experience.find((e) => /present/i.test(e.period))
  return {
    '@type': 'Person',
    '@id': personId,
    name: profile.fullName,
    url: `${siteUrl}/`,
    image: abs('/portrait-rahul.png'),
    jobTitle: profile.role,
    description: siteDescription,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Noida', addressCountry: 'IN' },
    sameAs: socials.filter((s) => s.href.startsWith('http')).map((s) => s.href),
    knowsAbout,
    ...(current && { worksFor: { '@type': 'Organization', name: current.company } }),
  }
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: `${siteUrl}/`,
    name: siteName,
    description: siteDescription,
    inLanguage: 'en',
    publisher: { '@id': personId },
  }
}

/** The home page: who the site is about. */
export function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(),
      website(),
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/#profile`,
        url: `${siteUrl}/`,
        name: `${siteName} — ${profile.role}`,
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        about: { '@id': personId },
        inLanguage: 'en',
      },
    ],
  }
}

/**
 * A case study: the page, its place in the site, and the work it describes.
 * Client and team work credits Rahul as a contributor; only his own projects
 * name him as the creator.
 */
export function caseStudyJsonLd(project: Project, description: string) {
  const url = `${siteUrl}/projects/${project.slug}`
  const live = project.caseStudy?.links?.[0]?.href ?? project.href
  const personal = /personal/i.test(project.context)
  const year = project.year && /^\d{4}$/.test(project.year) ? project.year : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${siteUrl}/#work` },
          { '@type': 'ListItem', position: 3, name: project.title, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: `${project.title} — Case Study`,
        description,
        isPartOf: { '@id': websiteId },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#work` },
        author: { '@id': personId },
        inLanguage: 'en',
      },
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        name: project.title,
        description: project.outcome,
        genre: project.category,
        keywords: project.tech.join(', '),
        ...(live && { url: live }),
        ...(project.image && { image: abs(project.image) }),
        ...(year && { dateCreated: year }),
        [personal ? 'creator' : 'contributor']: { '@id': personId },
      },
      // referenced by @id above; repeated so each page stands on its own
      person(),
      website(),
    ],
  }
}
