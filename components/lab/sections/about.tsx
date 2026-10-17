import Image from "next/image";
import { about, experience } from "@/content/lab";

/**
 * Stage 2 begins. The camera swings round the pearl, which swells and churns
 * as the sky turns blush. The card sits on the right so the pearl has the
 * left of the frame.
 */
export function About() {
  return (
    <section
      id="about"
      data-anchor="about"
      className="l-sec l-about"
      aria-labelledby="about-title"
    >
      {/* the previous site's address for this section, so old links still land */}
      <span id="timeline" className="l-alias" aria-hidden="true" />
      <div className="l-wrap l-about-inner">
        <div className="l-about-col l-scrim">
          <p className="l-label" data-reveal>
            <span className="l-ember">02</span>
            <span>About</span>
          </p>
          <h2 id="about-title" className="l-title" data-reveal="lines">
            {about.title.map((w, i) => (
              <span
                key={w}
                className="l-line"
                style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
              >
                <span>{w}</span>
              </span>
            ))}
            <span
              className="l-line"
              style={{ "--d": "0.16s" } as React.CSSProperties}
            >
              <span>
                <em className="l-serif">{about.accentWord}</em>
              </span>
            </span>
          </h2>

          <figure className="l-about-me" data-reveal>
            <div className="l-about-photo">
              <Image
                src={about.portrait.src}
                width={about.portrait.width}
                height={about.portrait.height}
                sizes="(min-width: 1024px) 144px, 112px"
                alt={`Portrait of ${about.portrait.name}`}
              />
            </div>
            <figcaption>
              <span className="l-about-name">{about.portrait.name}</span>
              <span className="l-about-role">{about.portrait.role}</span>
              <span className="l-about-role">{about.portrait.location}</span>
            </figcaption>
          </figure>

          <p className="l-lead" data-reveal>
            {about.lead}
          </p>
          {about.body.map((p) => (
            <p key={p.slice(0, 24)} className="l-body" data-reveal>
              {p}
            </p>
          ))}

          <dl className="l-stats" data-reveal>
            {about.stats.map((s) => (
              <div key={s.label}>
                <dt className="l-stat-v">{s.value}</dt>
                <dd className="l-stat-l">{s.label}</dd>
              </div>
            ))}
          </dl>

          <div className="l-xp" data-reveal>
            <h3 className="l-label">Experience</h3>
            <ol>
              {experience.map((e) => (
                <li key={e.id}>
                  <span className="l-xp-period">{e.period}</span>
                  <span className="l-xp-role">
                    {e.role} <span className="l-xp-at">at</span> {e.company}
                  </span>
                  <span className="l-xp-ctx">{e.context}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
