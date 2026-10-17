import { principles } from "@/content/lab";

/**
 * Four principles, four thresholds: the camera passes through one gate per
 * principle. Each claim carries its evidence from the real work.
 */
export function Approach() {
  return (
    <section
      id="approach"
      className="l-sec l-approach"
      aria-labelledby="approach-title"
    >
      {/* the previous site's address for this section, so old links still land */}
      <span id="security" className="l-alias" aria-hidden="true" />
      <header data-anchor="approach" className="l-wrap l-approach-head">
        <p className="l-label" data-reveal>
          <span className="l-ember">05</span>
          <span>Approach</span>
        </p>
        <h2 id="approach-title" className="l-title" data-reveal="lines">
          <span className="l-line">
            <span>How the work</span>
          </span>
          <span
            className="l-line"
            style={{ "--d": "0.08s" } as React.CSSProperties}
          >
            <span>
              gets <em className="l-serif">made.</em>
            </span>
          </span>
        </h2>
      </header>

      <ol className="l-wrap l-principles">
        {principles.map((p, i) => (
          <li key={p.id} data-anchor={`principle-${i}`} className="l-principle">
            <div className="l-principle-text l-scrim" data-reveal>
              <span className="l-principle-i" aria-hidden="true">
                {p.index}
              </span>
              <h3 className="l-h3">{p.title}</h3>
              <p className="l-body">{p.body}</p>
              <p className="l-evidence">
                <span className="l-sr">Evidence: </span>
                {p.evidence}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
