import { capabilities, capabilityLevels } from "@/content/lab";
import { CapabilitiesTabs } from "../capabilities-tabs";

/**
 * Stage 2 → 3. The pearl becomes a sun with five planets in orbit, one per
 * discipline; the tabs below decide which planet swells toward the visitor.
 */
export function Capabilities() {
  return (
    <section
      id="capabilities"
      data-anchor="capabilities"
      className="l-sec l-caps"
      aria-labelledby="caps-title"
    >
      {/* the previous site's address for this section, so old links still land */}
      <span id="skills" className="l-alias" aria-hidden="true" />
      <div className="l-wrap">
        <header className="l-caps-head">
          <p className="l-label" data-reveal>
            <span className="l-ember">03</span>
            <span>Capabilities</span>
          </p>
          <h2 id="caps-title" className="l-title" data-reveal="lines">
            <span className="l-line">
              <span>Built across</span>
            </span>
            <span
              className="l-line"
              style={{ "--d": "0.08s" } as React.CSSProperties}
            >
              <span>
                the <em className="l-serif">stack.</em>
              </span>
            </span>
          </h2>
          <p className="l-body l-caps-intro" data-reveal>
            Five disciplines, rated honestly — what I ship every day, what I use
            in real projects, and what I&rsquo;m actively studying.
          </p>
        </header>
        <div data-reveal>
          <CapabilitiesTabs
            capabilities={capabilities}
            levels={capabilityLevels}
          />
        </div>
      </div>
    </section>
  );
}
