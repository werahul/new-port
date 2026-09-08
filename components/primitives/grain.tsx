/**
 * Fixed, non-interactive film-grain overlay. Styling lives in globals.css
 * (`.grain-layer`) so the SVG noise is inlined once and blend mode / opacity
 * adapt to light vs dark.
 */
export function Grain() {
  return <div className="grain-layer" aria-hidden />
}
