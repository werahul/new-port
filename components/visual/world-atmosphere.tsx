import { cn } from '@/lib/utils'

/**
 * THE FALLBACK THAT IS NOT A FALLBACK.
 *
 * A composed dark environment built entirely from gradients and one masked
 * grid: a horizon lift, a receding ground plane, three slow accent fields, and
 * a vignette that closes the frame. It costs nothing, needs no JavaScript, and
 * is complete on its own — so a device with no WebGL, a visitor who asked for
 * reduced motion, and a scene that failed to start all get a considered
 * composition rather than an empty box.
 *
 * When the canvas does come up it cross-fades *over* this, and because the
 * renderer clears with alpha 0 the layer keeps showing through the fog. It is
 * scenery in both cases, not a placeholder for one of them.
 *
 * Every animation here is a CSS keyframe, so the global `prefers-reduced-motion`
 * rule in globals.css stops all of it without this component knowing.
 */
export function WorldAtmosphere({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* horizon: the light the space is lit from, above and behind */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-15%,rgb(var(--surface-3)/0.8),transparent_62%)]" />

      {/* the ground plane, in perspective — the single strongest cue that this
          is a space rather than a backdrop */}
      <div className="atmos-ground" />

      {/* three accent fields on slow, unequal drifts, so the composition never
          repeats within a visit */}
      <div className="atmos-field atmos-field-a" />
      <div className="atmos-field atmos-field-b" />
      <div className="atmos-field atmos-field-c" />

      {/* depth haze — pulls the far distance toward the page colour the way the
          scene's fog does */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(105%_78%_at_50%_42%,transparent_32%,rgb(var(--base)/0.82)_100%)]" />
    </div>
  )
}
