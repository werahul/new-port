import { ArrowDown, MapPin } from "lucide-react";
import { hero, profile } from "@/content/lab";
import { CoreOrb } from "../fallbacks";
import { ScrollLink } from "../scroll-link";

/**
 * Stage 1 — the invitation. Calm and sparse: who, what, one sentence of
 * position, and the core waiting in the space beside it. The entrance is
 * pure CSS, so the headline never waits on JavaScript.
 */
export function Hero() {
  return (
    <section
      id="top"
      data-anchor="top"
      className="l-sec l-hero"
      aria-labelledby="hero-title"
    >
      {/* the previous site's address for this section, so old links still land */}
      <span id="home" className="l-alias" aria-hidden="true" />
      <CoreOrb className="l-fallback l-hero-orb" />

      <div className="l-wrap l-hero-inner">
        <p className="l-hero-kicker">
          <span className="l-status">
            <span className="l-status-dot" aria-hidden="true" />
            {hero.status}
          </span>
          <span className="l-hero-role">{hero.kicker}</span>
        </p>

        <h1 id="hero-title" className="l-display l-hero-title">
          <span className="l-hero-name">{profile.fullName}</span>
          {hero.headline.map((w, i) => (
            <span
              key={w}
              className="l-line"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span>{w}</span>
            </span>
          ))}
          <span
            className="l-line"
            style={{ "--i": hero.headline.length } as React.CSSProperties}
          >
            <span>
              <em className="l-serif">{hero.accentWord}</em>
            </span>
          </span>
        </h1>

        <p className="l-lead l-hero-statement">{hero.statement}</p>

        <div className="l-hero-meta">
          <ScrollLink to="work" className="l-btn l-btn-solid">
            See selected work
            <ArrowDown aria-hidden="true" size={16} strokeWidth={2.25} />
          </ScrollLink>
          <ScrollLink to="contact" className="l-btn">
            Get in touch
          </ScrollLink>
          <span className="l-hero-place">
            <MapPin aria-hidden="true" size={15} strokeWidth={2} />
            {profile.location}
          </span>
        </div>
      </div>

      <ScrollLink to="about" className="l-cue" aria-label="Scroll to explore">
        <span className="l-cue-line" aria-hidden="true" />
        <span aria-hidden="true">Scroll</span>
      </ScrollLink>
    </section>
  );
}
