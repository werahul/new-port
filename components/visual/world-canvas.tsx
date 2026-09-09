'use client'

import { useEffect, useRef } from 'react'
import { createWorld, type WorldHandle } from '@/lib/world/world-scene'
import { profileFor } from '@/lib/world/quality'
import { worldPath } from '@/lib/world/store'
import type { WorldCanvasProps } from './world'

/**
 * Owns the scene's lifetime. Deliberately thin: all the world logic is plain
 * Three.js in `lib/world`, so nothing here re-renders on scroll and the scene
 * never depends on React's timing.
 *
 * The <canvas> is created imperatively rather than rendered by React. Teardown
 * calls `forceContextLoss()` to hand GPU memory back immediately, which
 * permanently kills that canvas element — so a canvas React would reuse across
 * a remount (Strict Mode in development, or a retry) would come back with a
 * dead context. Owning the element here guarantees every world gets a fresh one.
 *
 * Two things this component is careful about, both of which used to be silent
 * failures:
 *
 *  1. It does not build the scene until the host has a real size. The previous
 *     version fell back to `window.innerWidth` when `clientWidth` was 0, which
 *     avoided a NaN aspect but permanently framed the camera against the wrong
 *     box — with no path back, because only a window resize could correct it.
 *  2. It reports readiness from an actual rendered frame, not from the fact
 *     that construction did not throw.
 */
export default function WorldCanvas({ tier, onReady, onFailure }: WorldCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onReady)
  const onFailureRef = useRef(onFailure)
  onReadyRef.current = onReady
  onFailureRef.current = onFailure

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let world: WorldHandle | null = null
    let canvas: HTMLCanvasElement | null = null
    let raf = 0
    let sizeObserver: ResizeObserver | null = null
    let disposed = false

    const build = () => {
      if (disposed || world) return
      canvas = document.createElement('canvas')
      canvas.className = 'block h-full w-full'
      canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(canvas)

      world = createWorld({
        canvas,
        quality: profileFor(tier),
        intro: true,
        // The first frame the render loop completes — a real frame, into a
        // canvas with a real size. This is what `ready` means.
        onFirstFrame: () => {
          if (!disposed) onReadyRef.current()
        },
      })

      if (!world) {
        canvas.remove()
        canvas = null
        onFailureRef.current()
        return
      }

      // Feed the camera from the shared ref. Nothing is published back into
      // React — every consumer that needs the station derives it from
      // `worldPath` itself, so none of them depend on this loop still running.
      const pump = () => {
        raf = requestAnimationFrame(pump)
        world!.setPath(worldPath.current)
      }
      raf = requestAnimationFrame(pump)
      sync()
    }

    const sync = () => {
      if (!world) return
      if (document.hidden) world.stop()
      else world.start()
    }

    // A host with no layout box yet cannot be framed correctly, and a scene
    // built against a zero box never recovers. Wait for the box instead.
    if (host.clientWidth > 0 && host.clientHeight > 0) {
      build()
    }

    sizeObserver = new ResizeObserver(() => {
      if (disposed) return
      if (!world) {
        if (host.clientWidth > 0 && host.clientHeight > 0) build()
        return
      }
      world.resize()
    })
    sizeObserver.observe(host)

    document.addEventListener('visibilitychange', sync)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      sizeObserver?.disconnect()
      document.removeEventListener('visibilitychange', sync)
      world?.dispose()
      canvas?.remove()
    }
  }, [tier])

  return <div ref={hostRef} className="h-full w-full" />
}
