'use client'

import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { Container } from '@/components/primitives'
import { heroStations, stationCount } from '@/content/world'
import { worldPath, useWorldStore } from '@/lib/world/store'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'

const smoothstep = (t: number) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

/**
 * The hero location captions, scrubbed directly by the camera path rather than
 * crossfaded on a rounded station index. Each engineering domain's caption rises
 * as the camera approaches its district, holds while the camera is there, and is
 * displaced out as the camera moves on — so the type and the 3D travel are the
 * same motion. One rAF loop, driven imperatively; nothing re-renders.
 */
export function HeroCaptions() {
  const enabled = useWorldStore((s) => s.enabled)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current
    if (!root) return
    const reduced = prefersReducedMotion()
    const caps = Array.from(root.querySelectorAll<HTMLElement>('[data-cap]'))
    const hint = root.querySelector<HTMLElement>('[data-cap-hint]')
    const span = 0.82 // how many stations either side a caption is visible for

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const stationF = worldPath.current * (stationCount - 1)

      if (hint) {
        const h = Math.max(0, 1 - stationF / 0.55)
        hint.style.opacity = String(h)
        hint.style.transform = `translateY(${(1 - h) * 12}px)`
      }

      for (let i = 0; i < caps.length; i++) {
        const el = caps[i]
        if (i === 0) {
          el.style.opacity = '0'
          continue
        }
        const d = stationF - i
        let o = 0
        let y = 24
        let blur = 3
        if (d > -span && d < span) {
          const k = 1 - Math.abs(d) / span
          o = smoothstep(k)
          y = (d < 0 ? 1 : -1) * (1 - o) * 24
          blur = (1 - o) * 3
        }
        if (reduced) {
          el.style.opacity = Math.round(stationF) === i ? '1' : '0'
          el.style.transform = 'none'
          el.style.filter = 'none'
        } else {
          el.style.opacity = o.toFixed(3)
          el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
          el.style.filter = `blur(${blur.toFixed(2)}px)`
        }
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-14 lg:pb-20"
    >
      <Container>
        <div className="relative h-[176px] max-w-lg">
          <div
            data-cap-hint
            className="absolute inset-0 flex items-end will-change-transform"
          >
            <span className="flex items-center gap-2 type-metadata">
              Scroll to travel the stack
              <ArrowDown className="h-3.5 w-3.5" />
            </span>
          </div>
          {heroStations.map((s) => (
            <div
              key={s.id}
              data-cap
              data-accent={s.accent}
              className="absolute inset-0 will-change-transform"
              style={{ opacity: 0 }}
            >
              <div className="type-metadata type-metadata-accent">
                {s.index} · Location
              </div>
              <div className="type-engineering mt-1 text-foreground">{s.label}</div>
              <div className="type-technology mt-2 text-muted-foreground">
                {s.stack}
              </div>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
