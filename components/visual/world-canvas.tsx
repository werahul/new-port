'use client'

import { useEffect, useRef } from 'react'
import { createWorld, type WorldHandle } from '@/lib/world/world-scene'
import { profileFor, type Tier } from '@/lib/world/quality'
import { worldPath, useWorldStore } from '@/lib/world/store'

interface Props {
  tier: Tier
  reduced: boolean
  /** the world could not start — host should stop pretending it exists */
  onFailure: () => void
}

/**
 * Owns the scene's lifetime. Deliberately thin: all the world logic is plain
 * Three.js in `lib/world`, so nothing here re-renders on scroll and the scene
 * never depends on React's timing.
 *
 * The <canvas> is created imperatively rather than rendered by React. Teardown
 * calls `forceContextLoss()` to hand GPU memory back immediately, which
 * permanently kills that canvas element — so a canvas React would reuse across
 * a remount (Strict Mode in development, or a quality-tier change) would come
 * back with a dead context. Owning the element here guarantees every world gets
 * a fresh one.
 */
export default function WorldCanvas({ tier, reduced, onFailure }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const failureRef = useRef(onFailure)
  failureRef.current = onFailure

  const setStation = useWorldStore((s) => s.setStation)
  const setEntered = useWorldStore((s) => s.setEntered)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)

    const world: WorldHandle | null = createWorld({
      canvas,
      quality: profileFor(tier),
      intro: true,
      reduced,
    })
    if (!world) {
      canvas.remove()
      failureRef.current()
      return
    }

    // The establishing shot runs on its own clock; the identity reveals after
    // it has settled, so the visitor arrives somewhere before being sold to.
    const enterTimer = window.setTimeout(() => setEntered(true), reduced ? 0 : 1500)

    // Feed the camera from the shared ref, and publish the (low-frequency)
    // station index for the UI.
    let raf = 0
    let lastStation = -1
    const pump = () => {
      raf = requestAnimationFrame(pump)
      world.setPath(worldPath.current)
      const s = Math.round(world.stationF)
      if (s !== lastStation) {
        lastStation = s
        setStation(s)
      }
    }
    raf = requestAnimationFrame(pump)

    const sync = () => {
      if (document.hidden) world.stop()
      else world.start()
    }
    sync()
    document.addEventListener('visibilitychange', sync)

    let rz = 0
    const onResize = () => {
      cancelAnimationFrame(rz)
      rz = requestAnimationFrame(() => world.resize())
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.clearTimeout(enterTimer)
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rz)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('resize', onResize)
      world.dispose()
      canvas.remove()
    }
  }, [tier, reduced, setStation, setEntered])

  return <div ref={hostRef} className="h-full w-full" />
}
