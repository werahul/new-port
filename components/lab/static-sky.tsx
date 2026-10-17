/**
 * The world's sky and grid without the world: the same CSS atmosphere the
 * home page shows before (or instead of) its 3D, for pages that have no scene.
 */
export function StaticSky() {
  return (
    <div className="l-world" aria-hidden="true">
      <div className="l-atmos" />
    </div>
  )
}
