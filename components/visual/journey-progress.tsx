'use client'

import { useEffect, useRef, useState } from 'react'
import { stations } from '@/content/world'
import { worldPath, useWorldStore } from '@/lib/world/store'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'

const LAST = stations.length - 1
const TOTAL = String(stations.length).padStart(2, '0')

/**
 * The journey indicator — a continuous "how far through the world am I".
 *
 * The camera path (`worldPath`, 0..1) is the source of truth when the world is
 * running; otherwise it falls back to raw document progress so the rail is still
 * a useful affordance on the no-WebGL / reduced-motion build. The continuous
 * fill is driven imperatively through a single CSS var (`--jp`) in one rAF loop —
 * never React state — so it costs nothing per frame. Only the discrete station
 * index goes through React, and that changes a handful of times per page.
 */
export function JourneyProgress() {
  const enabled = useWorldStore((s) => s.enabled)
  const storeStation = useWorldStore((s) => s.station)
  const rootRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)
  const [fallbackStation, setFallbackStation] = useState(0)

  useEffect(() => setReduced(prefersReducedMotion()), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let raf = 0
    let cur = 0
    let lastStation = -1
    const maxScroll = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const target = enabled
        ? worldPath.current
        : Math.min(1, Math.max(0, window.scrollY / maxScroll()))
      cur += (target - cur) * (reduced ? 1 : 0.1)
      if (Math.abs(target - cur) < 0.0004) cur = target
      root.style.setProperty('--jp', cur.toFixed(4))
      if (!enabled) {
        const s = Math.round(cur * LAST)
        if (s !== lastStation) {
          lastStation = s
          setFallbackStation(s)
        }
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [enabled, reduced])

  const active = enabled ? Math.min(LAST, storeStation) : fallbackStation
  const here = stations[active] ?? stations[0]
  const arrived = active >= LAST

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-arrived={arrived}
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700 ease-editorial data-[arrived=true]:opacity-0"
      style={{ ['--jp' as string]: 0 }}
    >
      {/* Desktop — a vertical chapter rail on the right edge.
          Only the chapter you are actually in is named; the rest are ticks. A
          permanently-listed table of contents reads as a menu, which this is
          not — it is a position indicator. */}
      <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 lg:block xl:right-8">
        <div className="relative flex flex-col items-end gap-[0.7rem] pr-4">
          {/* continuous fill track */}
          <span className="absolute bottom-1 right-[3px] top-1 w-px bg-line">
            <span
              className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
              style={{ transform: 'scaleY(var(--jp,0))' }}
            />
            <span
              className="absolute -right-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--accent)/0.7)]"
              style={{ top: 'calc(var(--jp,0) * 100%)' }}
            />
          </span>

          {stations.map((s, i) => {
            const isActive = i === active
            const isPast = i < active
            return (
              <div
                key={s.id}
                data-accent={s.accent}
                className="flex items-center justify-end gap-2.5"
              >
                <span
                  className={cn(
                    'type-metadata whitespace-nowrap transition-all duration-500 ease-editorial',
                    isActive
                      ? 'translate-x-0 text-foreground opacity-100'
                      : 'translate-x-2 opacity-0',
                  )}
                >
                  <span className="text-accent">{s.index}</span> {s.label}
                </span>
                <span
                  className={cn(
                    'h-px transition-all duration-500 ease-editorial',
                    isActive
                      ? 'w-8 bg-accent'
                      : isPast
                        ? 'w-4 bg-foreground/35'
                        : 'w-2.5 bg-foreground/15',
                  )}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile — the progress bar continues the header band rather than
          floating a bare hairline and two mono labels over live content. */}
      <div
        data-accent={here.accent}
        className="absolute inset-x-0 top-[3.25rem] border-b border-line bg-background/85 backdrop-blur-xl lg:hidden"
      >
        <div className="h-px w-full bg-line">
          <span
            className="block h-full origin-left bg-accent"
            style={{ transform: 'scaleX(var(--jp,0))' }}
          />
        </div>
        <div className="type-metadata flex items-center justify-between px-5 py-1.5">
          <span className="truncate text-foreground">
            <span className="text-accent">{here.index}</span> {here.label}
          </span>
          <span className="shrink-0 text-muted-foreground">/ {TOTAL}</span>
        </div>
      </div>
    </div>
  )
}
