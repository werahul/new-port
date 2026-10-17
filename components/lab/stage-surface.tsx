'use client'

/**
 * The hand on an exhibit. The canvas sits behind the DOM and never takes
 * pointer input, so manipulation happens on this transparent surface over the
 * stage window instead — which also makes it keyboard-operable.
 *
 * `touch-action: pan-y` keeps vertical swipes scrolling the page; only a
 * sideways drag turns the model, so the visitor is never scroll-trapped.
 */
import { useRef } from 'react'
import { world } from './world/world-state'

const YAW = 1.1
const PITCH = 0.35
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))

export function StageSurface({ index, label }: { index: number; label: string }) {
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; id: number } | null>(null)

  const nudge = (dyaw: number, dpitch: number) => {
    world.exhibitYaw[index] = clamp(world.exhibitYaw[index] + dyaw, YAW)
    world.exhibitPitch[index] = clamp(world.exhibitPitch[index] + dpitch, PITCH)
  }

  return (
    <div
      className="l-surface"
      tabIndex={0}
      role="group"
      aria-roledescription="3D viewer"
      aria-label={`${label}. Drag sideways or use the arrow keys to turn it; Home resets.`}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, yaw: world.exhibitYaw[index], pitch: world.exhibitPitch[index], id: e.pointerId }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.id !== e.pointerId) return
        const w = e.currentTarget.clientWidth || 1
        world.exhibitYaw[index] = clamp(d.yaw + ((e.clientX - d.x) / w) * 2.2, YAW)
        if (e.pointerType === 'mouse') world.exhibitPitch[index] = clamp(d.pitch + ((e.clientY - d.y) / w) * 1.2, PITCH)
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        const step = 0.18
        if (e.key === 'ArrowLeft') nudge(-step, 0)
        else if (e.key === 'ArrowRight') nudge(step, 0)
        else if (e.key === 'ArrowUp') nudge(0, -step / 2)
        else if (e.key === 'ArrowDown') nudge(0, step / 2)
        else if (e.key === 'Home') {
          world.exhibitYaw[index] = 0
          world.exhibitPitch[index] = 0
        } else return
        e.preventDefault()
      }}
    >
      <span className="l-surface-hint" aria-hidden="true">
        <span className="l-hint-fine">Drag to turn</span>
        <span className="l-hint-touch">Swipe sideways to turn</span>
      </span>
    </div>
  )
}
