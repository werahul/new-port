/**
 * The flat versions of the world, for no WebGL, reduced motion, the 3D
 * switch turned off, and the moment before the scene arrives. They are drawn
 * in the same palette and placed where the 3D subjects sit, so the page reads
 * as the same composition either way.
 */

/** The core, flattened: a pearl drawn in CSS gradients, with its three moons. */
export function CoreOrb({ className }: { className?: string }) {
  return (
    <div className={`l-orb ${className ?? ''}`} aria-hidden="true">
      <span className="l-orb-body" />
      <span className="l-orb-moon l-orb-moon-a" />
      <span className="l-orb-moon l-orb-moon-b" />
      <span className="l-orb-moon l-orb-moon-c" />
    </div>
  )
}

type Part = 'admin' | 'client' | 'supplier' | 'library'

/** The Jasper Colin platform as a flat diagram — what the 3D model shows. */
export function ArchitectureDiagram({ highlight = [] }: { highlight?: Part[] }) {
  const on = (p: Part) => highlight.includes(p)
  const apps: { id: Part; x: number; label: string }[] = [
    { id: 'admin', x: 30, label: 'ADMIN' },
    { id: 'client', x: 160, label: 'CLIENT' },
    { id: 'supplier', x: 290, label: 'SUPPLIER' },
  ]
  const names = apps.filter((a) => on(a.id)).map((a) => a.label.toLowerCase())
  const described = [...names.map((n) => `the ${n} application`), ...(on('library') ? ['the shared UI library'] : [])]
  return (
    <svg
      viewBox="0 0 420 260"
      className="l-diagram"
      role="img"
      aria-label={`Diagram: Admin, Client and Supplier applications, each deployed independently on a shared UI library.${
        described.length ? ` Highlighted: ${described.join(' and ')}.` : ''
      }`}
    >
      {apps.map((a) => (
        <g key={a.id} transform={`translate(${a.x} ${on(a.id) ? 38 : 58})`}>
          <line x1="50" y1="70" x2="50" y2={on(a.id) ? 132 : 112} className="l-dg-link" data-on={on(a.id)} />
          <rect width="100" height="70" className="l-dg-box" data-on={on(a.id)} />
          <text x="50" y="40" className="l-dg-text">
            {a.label}
          </text>
        </g>
      ))}
      <rect x="20" y="170" width="380" height="44" className="l-dg-box" data-on={on('library')} />
      <text x="210" y="197" className="l-dg-text">
        SHARED UI LIBRARY
      </text>
      <rect x="10" y="222" width="400" height="12" className="l-dg-plinth" />
    </svg>
  )
}
