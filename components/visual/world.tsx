'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { stations, stationCount } from '@/content/world'
import { detectCapability, type Tier } from '@/lib/world/quality'
import type { WorldCapability } from '@/lib/world/capability-script'
import { worldPath, useWorldStore } from '@/lib/world/store'
import { loadGsap, queueRefresh } from '@/lib/animation/gsap'
import { WorldAtmosphere } from './world-atmosphere'
import { cn } from '@/lib/utils'

export interface WorldCanvasProps {
  tier: Tier
  /** the scene rendered a real frame into a real-sized canvas */
  onReady: () => void
  /** the scene could not start — the host should stop waiting for it */
  onFailure: () => void
}

/**
 * Stands in for the canvas when its chunk could not be fetched. It reports the
 * failure rather than throwing, so a flaky network degrades to the atmospheric
 * hero instead of tripping the route's error boundary.
 */
function CanvasUnavailable({ onFailure }: WorldCanvasProps) {
  useEffect(() => {
    onFailure()
  }, [onFailure])
  return null
}

const CHUNK_RETRY_MS = 400

/**
 * A chunk that fails to arrive is the single most common reason the hero never
 * appeared on a first visit: the old loader had no `.catch`, no retry, and an
 * implicit Suspense fallback of `null`, so a transient network failure or a
 * hash rotated by a mid-session deploy produced six screens of empty scrim.
 */
const WorldCanvas = dynamic<WorldCanvasProps>(
  async () => {
    try {
      return (await import('./world-canvas')).default
    } catch {
      await new Promise((r) => setTimeout(r, CHUNK_RETRY_MS))
      try {
        return (await import('./world-canvas')).default
      } catch {
        return CanvasUnavailable
      }
    }
  },
  { ssr: false, loading: () => null },
)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * Anchor each station to where its section actually sits in the document, then
 * map raw scroll progress onto the camera path.
 *
 * Two details make the travel feel authored rather than linear:
 *  - stations sharing an anchor (the six inside the tall hero) are spread
 *    across that element's own scrollable range;
 *  - progress between anchors is eased with smoothstep, so the camera settles
 *    at each location and accelerates through the space between them.
 *
 * Returns `null` when the document is not laid out enough to measure — see the
 * degenerate-hero guard below.
 */
function measureAnchors(): number[] | null {
  const doc = document.documentElement
  const vh = window.innerHeight

  // The six hero stations are spread across `Math.max(0, height - vh)`. If the
  // hero has not reached its full height yet, that term is 0, all six collapse
  // onto one anchor, and the monotonicity fixup below spreads them 0.0025
  // apart — so ~200px of scroll drives the camera past station 6 and the hero
  // fades its own headline out. Refuse the measurement and wait for a refresh.
  if (doc.dataset.world === 'cinematic') {
    const hero = document.getElementById('home')
    if (!hero || hero.offsetHeight < vh * 1.5) return null
  }

  const maxScroll = Math.max(1, doc.scrollHeight - vh)

  // group stations by the element that pins them
  const groups: Record<string, number[]> = {}
  stations.forEach((s, i) => {
    ;(groups[s.anchor] ||= []).push(i)
  })

  const out = new Array<number>(stationCount).fill(0)
  for (const anchor of Object.keys(groups)) {
    const idx = groups[anchor]
    const el = document.getElementById(anchor)
    if (!el) {
      // missing section — spread these stations evenly as a safe fallback
      idx.forEach((i: number) => (out[i] = i / (stationCount - 1)))
      continue
    }
    const top = el.getBoundingClientRect().top + window.scrollY
    const height = el.offsetHeight
    const m = idx.length
    idx.forEach((stationIndex: number, k: number) => {
      const scrollAt =
        m > 1
          ? // spread across the element's scrollable travel
            top + (Math.max(0, height - vh) * k) / (m - 1)
          : // centre a single-station section in the viewport
            top + height / 2 - vh / 2
      out[stationIndex] = clamp(scrollAt / maxScroll)
    })
  }

  // guarantee monotonicity — a non-increasing anchor would reverse the camera
  for (let i = 1; i < out.length; i++) {
    if (out[i] <= out[i - 1]) out[i] = Math.min(1, out[i - 1] + 0.0025)
  }
  return out
}

function pathFor(progress: number, anchors: number[]): number {
  const n = anchors.length
  if (progress <= anchors[0]) return 0
  if (progress >= anchors[n - 1]) return 1
  let i = 0
  while (i < n - 2 && progress > anchors[i + 1]) i++
  const span = anchors[i + 1] - anchors[i] || 1
  const local = clamp((progress - anchors[i]) / span)
  return (i + smoothstep(local)) / (n - 1)
}

/** How many times a failed scene start is worth retrying before giving up. */
const MAX_ATTEMPTS = 1

/**
 * The world is mounted once, at the layout level, behind every section — not
 * inside the hero. That is the whole point: one environment the page scrolls
 * through, rather than a 3D object parked in one section.
 *
 * Two layers live here. The CSS atmosphere is always present and always
 * complete on its own. The canvas cross-fades over it only once the scene has
 * confirmed a real frame. There is therefore no moment — before, during or
 * after a failure — at which the page has nothing behind it.
 */
export function World() {
  const [cap, setCap] = useState<WorldCapability | null>(null)
  const [attemptKey, setAttemptKey] = useState(0)
  const attemptsRef = useRef(0)
  const retryFrameRef = useRef(0)
  const anchorsRef = useRef<number[]>([])

  const status = useWorldStore((s) => s.status)
  const setStatus = useWorldStore((s) => s.setStatus)
  const reset = useWorldStore((s) => s.reset)

  // ---- probe, and clear anything a previous route left behind --------------
  useEffect(() => {
    reset()
    const c = detectCapability()
    setCap(c)
    setStatus(c.webgl && !c.reduced ? 'loading' : 'fallback')
    return () => {
      cancelAnimationFrame(retryFrameRef.current)
    }
  }, [reset, setStatus])

  // ---- publish the lifecycle to CSS ---------------------------------------
  useEffect(() => {
    document.documentElement.setAttribute('data-world-status', status)
  }, [status])

  useEffect(
    () => () => {
      document.documentElement.removeAttribute('data-world-status')
    },
    [],
  )

  const onReady = useCallback(() => setStatus('ready'), [setStatus])

  const onFailure = useCallback(() => {
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      setStatus('fallback')
      return
    }
    attemptsRef.current += 1
    setStatus('loading')
    // One frame of separation before remounting. A context released by
    // `forceContextLoss` (Strict Mode's throwaway mount does exactly this) is
    // not reclaimed synchronously, and asking for a new one in the same tick is
    // precisely what makes the retry fail as well.
    cancelAnimationFrame(retryFrameRef.current)
    retryFrameRef.current = requestAnimationFrame(() =>
      setAttemptKey(attemptsRef.current),
    )
  }, [setStatus])

  // ---- drive the camera from document scroll ------------------------------
  const live = !!cap?.webgl && !cap.reduced
  useEffect(() => {
    if (!live) return
    let disposed = false
    let cleanup: (() => void) | null = null

    loadGsap()
      .then(({ ScrollTrigger }) => {
        if (disposed) return

        const remeasure = () => {
          const next = measureAnchors()
          if (next) anchorsRef.current = next
        }
        remeasure()

        const st = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: remeasure,
          onUpdate: (self) => {
            if (!anchorsRef.current.length) return
            worldPath.current = pathFor(self.progress, anchorsRef.current)
          },
        })

        // Section heights settle after fonts and images land. `load` may have
        // fired already by the time this chunk arrives — common, and the old
        // listener-only version simply never ran in that case.
        const refresh = () => {
          if (!disposed) queueRefresh(ScrollTrigger)
        }
        if (document.readyState === 'complete') refresh()
        else window.addEventListener('load', refresh, { once: true })
        // Not cancellable, so it has to check `disposed` itself.
        document.fonts?.ready.then(refresh).catch(() => {})

        cleanup = () => {
          window.removeEventListener('load', refresh)
          st.kill()
        }
      })
      .catch(() => {
        // Without ScrollTrigger the camera can never move: the scene would
        // render, frozen on station 01, for the whole descent. The static
        // atmosphere is the honest outcome.
        if (!disposed) setStatus('fallback')
      })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [live, setStatus])

  const showCanvas = live && status !== 'fallback'

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-[100svh] w-full overflow-hidden"
    >
      {/* Always present, always complete on its own. Dimmed rather than removed
          once the world is up, so it keeps supplying depth behind the fog. */}
      <WorldAtmosphere
        className={cn(
          'transition-opacity duration-1000 ease-editorial',
          status === 'ready' ? 'opacity-[0.55]' : 'opacity-100',
        )}
      />

      {showCanvas && cap && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-editorial',
            status === 'ready' ? 'opacity-100' : 'opacity-0',
          )}
        >
          <WorldCanvas
            key={attemptKey}
            tier={cap.tier}
            onReady={onReady}
            onFailure={onFailure}
          />
        </div>
      )}
    </div>
  )
}
