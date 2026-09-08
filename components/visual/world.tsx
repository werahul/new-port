'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { stations, stationCount } from '@/content/world'
import { detectCapability, type Tier } from '@/lib/world/quality'
import { worldPath, useWorldStore } from '@/lib/world/store'
import { loadGsap } from '@/lib/animation/gsap'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'

const WorldCanvas = dynamic(() => import('./world-canvas'), { ssr: false })

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
 */
function measureAnchors(): number[] {
  const doc = document.documentElement
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
  const vh = window.innerHeight

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

/**
 * The world is mounted once, at the layout level, behind every section — not
 * inside the hero. That is the whole point: one environment the page scrolls
 * through, rather than a 3D object parked in one section.
 */
export function World() {
  const [tier, setTier] = useState<Tier | null>(null)
  const [reduced, setReduced] = useState(false)
  const [failed, setFailed] = useState(false)
  const anchorsRef = useRef<number[]>([])
  const setEnabled = useWorldStore((s) => s.setEnabled)
  const setEntered = useWorldStore((s) => s.setEntered)

  // ---- decide whether this device gets the world at all -------------------
  useEffect(() => {
    const r = prefersReducedMotion()
    setReduced(r)
    if (r) {
      // No travel, no establishing shot — the page is fully readable without it.
      setEntered(true)
      return
    }
    const cap = detectCapability()
    if (!cap.webgl) {
      setEntered(true)
      return
    }
    setTier(cap.tier)
  }, [setEntered])

  useEffect(() => {
    const on = !!tier && !failed && !reduced
    setEnabled(on)
    const root = document.documentElement
    if (on) root.dataset.world = 'on'
    else delete root.dataset.world
    return () => {
      delete root.dataset.world
    }
  }, [tier, failed, reduced, setEnabled])

  // ---- drive the camera from document scroll ------------------------------
  useEffect(() => {
    if (!tier || failed || reduced) return
    let disposed = false
    let cleanup: (() => void) | null = null

    loadGsap().then(({ ScrollTrigger }) => {
      if (disposed) return

      const remeasure = () => {
        anchorsRef.current = measureAnchors()
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
          worldPath.current = pathFor(self.progress, anchorsRef.current)
        },
      })

      // section heights settle after fonts and images land
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      document.fonts?.ready.then(onLoad).catch(() => {})
      const t = window.setTimeout(onLoad, 600)

      cleanup = () => {
        window.removeEventListener('load', onLoad)
        clearTimeout(t)
        st.kill()
      }
    })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [tier, failed, reduced])

  if (!tier || failed || reduced) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-[100svh] w-full"
    >
      <WorldCanvas tier={tier} reduced={reduced} onFailure={() => setFailed(true)} />
    </div>
  )
}
