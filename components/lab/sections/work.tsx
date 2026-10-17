import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { alsoBuilt, exhibits, type Exhibit } from "@/content/lab";
import { CroppedImage } from "../cropped-image";
import { ArchitectureDiagram } from "../fallbacks";
import { StageSurface } from "../stage-surface";

function ExhibitBlock({ exhibit, i }: { exhibit: Exhibit; i: number }) {
  const p = exhibit.project;
  const results = p.caseStudy?.results ?? [];
  const live = p.caseStudy?.links?.[0]?.href ?? p.href;

  return (
    <article
      id={`exhibit-${p.slug}`}
      data-anchor={`project-${i}`}
      className="l-exhibit"
      data-side={i % 2 ? "alt" : undefined}
      aria-labelledby={`exhibit-title-${p.slug}`}
    >
      <div className="l-stage" data-kind={exhibit.kind}>
        <div className="l-fallback l-stage-fallback">
          {exhibit.kind === "architecture" ? (
            <ArchitectureDiagram highlight={exhibit.highlight} />
          ) : p.image ? (
            <CroppedImage
              src={p.image}
              alt={`${p.title} — ${p.context}`}
              sizes="(min-width: 1024px) 50vw, 100vw"
              widths={[640, 828, 1080, 1200]}
            />
          ) : null}
        </div>
        <StageSurface index={i} label={`${p.title}: ${exhibit.stageNote}`} />
        <p className="l-stage-note">{exhibit.stageNote}</p>
      </div>

      <div className="l-exhibit-text l-scrim" data-reveal>
        <p className="l-label">
          <span className="l-ember">{p.number}</span>
          <span>{p.category}</span>
        </p>
        <h3 id={`exhibit-title-${p.slug}`} className="l-h3">
          {p.title}
        </h3>
        <p className="l-exhibit-meta">
          {p.context} <span aria-hidden="true">·</span> {p.role}
          {p.year ? (
            <>
              {" "}
              <span aria-hidden="true">·</span> {p.year}
            </>
          ) : null}
        </p>
        <p className="l-body">{p.outcome}</p>

        {results.length > 0 && (
          <dl className="l-results">
            {results.map((r) => (
              <div key={r.label}>
                <dt>{r.value}</dt>
                <dd>{r.label}</dd>
              </div>
            ))}
          </dl>
        )}

        <ul className="l-tags" aria-label="Technologies">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className="l-actions">
          {p.caseStudy && (
            <Link href={`/projects/${p.slug}`} className="l-btn l-btn-solid">
              Read the case study
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2.25} />
            </Link>
          )}
          {live ? (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="l-btn"
            >
              Live site
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2.25} />
              <span className="l-sr"> (opens in a new tab)</span>
            </a>
          ) : p.caseStudy?.linkNote ? (
            <span className="l-note">{p.caseStudy.linkNote}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/**
 * Stage 3 — the centerpiece. The camera leaves the planets and drifts through a
 * sky gallery of floating exhibits; each project is staged differently (see
 * screens.tsx and architecture.tsx). Every fact is here in the DOM.
 */
export function Work() {
  return (
    <section id="work" className="l-sec l-work" aria-labelledby="work-title">
      {/* the previous site's address for this section, so old links still land */}
      <span id="works" className="l-alias" aria-hidden="true" />
      <header data-anchor="work" className="l-wrap l-work-head">
        <p className="l-label" data-reveal>
          <span className="l-ember">04</span>
          <span>Selected work</span>
        </p>
        <h2 id="work-title" className="l-title" data-reveal="lines">
          <span className="l-line">
            <span>Five products,</span>
          </span>
          <span
            className="l-line"
            style={{ "--d": "0.08s" } as React.CSSProperties}
          >
            <span>
              each <em className="l-serif">staged.</em>
            </span>
          </span>
        </h2>
        <p className="l-lead l-work-intro" data-reveal>
          From a Himalayan travel brand to a micro-frontend CRM platform.
          Each one opens into a full case study.
        </p>
      </header>

      <div className="l-wrap">
        {exhibits.map((e, i) => (
          <ExhibitBlock key={e.project.slug} exhibit={e} i={i} />
        ))}
      </div>

      <div data-anchor="also" className="l-wrap l-also">
        <div className="l-also-inner l-scrim">
          <h3 id="also-title" className="l-label" data-reveal>
            Also built
          </h3>
          <ul className="l-also-list">
            {alsoBuilt.map((p) => {
              const study = Boolean(p.caseStudy);
              const row = (
                <>
                  <span className="l-also-n">{p.number}</span>
                  <span className="l-also-title">{p.title}</span>
                  <span className="l-also-cat">{p.category}</span>
                  <span className="l-also-go" aria-hidden="true">
                    {study ? (
                      <ArrowRight size={18} strokeWidth={2.25} />
                    ) : (
                      <ArrowUpRight size={18} strokeWidth={2.25} />
                    )}
                  </span>
                  <span className="l-sr">
                    {" "}
                    — {p.outcome}
                    {study ? " (case study)" : " (opens in a new tab)"}
                  </span>
                  {p.image && (
                    <span className="l-also-thumb" aria-hidden="true">
                      <CroppedImage
                        src={p.image}
                        alt=""
                        sizes="320px"
                        widths={[384, 640]}
                      />
                    </span>
                  )}
                </>
              );
              return (
                <li key={p.slug} data-reveal>
                  {study ? (
                    <Link href={`/projects/${p.slug}`} className="l-also-row">
                      {row}
                    </Link>
                  ) : (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="l-also-row"
                    >
                      {row}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
