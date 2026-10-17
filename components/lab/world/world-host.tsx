'use client'

/**
 * Decides whether the world runs, and when it arrives.
 *
 *  - Server HTML carries every word of the page and a CSS atmosphere; the 3D
 *    world is an enhancement layered behind it, never a gate in front of it.
 *  - Nothing 3D is fetched until the page has painted and the browser is idle.
 *  - It always runs, on every device with WebGL — weaker ones get the light
 *    tier. Only without WebGL, or when the visitor's system asks for reduced
 *    motion, is the page the flat, art-directed version.
 *  - `data-world` on the page's own root ("off" | "pending" | "on") lets CSS
 *    swap the DOM fallbacks (screenshots, diagrams) for the live scene. It
 *    belongs to the page, so it leaves with it on client-side navigation.
 */
import { lazy, Suspense, useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { hasWebGL } from '@/lib/three/capability'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { getSupport, setSupport, subscribeSupport, type Capability } from './prefs'
import { measureAnchors, world } from './world-state'
import type { SceneData } from '@/content/lab'
import type { WorldCanvasProps } from './world-canvas'

function worldRoot() {
  return document.querySelector<HTMLElement>('[data-world]')
}
function setWorldState(state: 'off' | 'pending' | 'on') {
  const root = worldRoot()
  if (root) root.dataset.world = state
}

// React.lazy rather than next/dynamic: it is only ever rendered after an
// effect, so SSR is moot.
const WorldCanvas = lazy<React.ComponentType<WorldCanvasProps>>(() =>
  import('./world-canvas')
    // one retry: a flaky connection (or a server still compiling) often succeeds the second time
    .catch(() => new Promise((r) => setTimeout(r, 1500)).then(() => import('./world-canvas')))
    .catch(() => {
      // a chunk that fails to arrive leaves the plain page, not a broken one
      setWorldState('off')
      return { default: () => null }
    }),
)

function detect(): Capability {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency || 4
  const memory = nav.deviceMemory ?? 8
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const fine = window.matchMedia('(pointer: fine)').matches
  const narrow = window.innerWidth < 768
  const saveData = !!nav.connection?.saveData
  return {
    ok: hasWebGL() && !prefersReducedMotion(),
    low: coarse || narrow || cores <= 4 || memory <= 4 || saveData,
    fine,
  }
}

export function useWorldSupport() {
  return useSyncExternalStore(subscribeSupport, getSupport, () => null)
}

interface WorldHostProps {
  scene: SceneData
  /** a case study page: show this exhibit, not the scroll journey */
  exhibit?: number
}

export function WorldHost({ scene, exhibit }: WorldHostProps) {
  const support = useWorldSupport()
  const [idle, setIdle] = useState(false)
  const run = !!support?.ok

  // capability, once
  useEffect(() => {
    setSupport(detect())
  }, [])

  // reflect the decision for CSS
  useEffect(() => {
    if (!support) return
    setWorldState(run ? 'pending' : 'off')
  }, [support, run])

  // Wait for an idle moment after first paint before fetching the 3D. Low-tier
  // devices wait longer — for the visitor's first scroll, touch or key, or a
  // few seconds — so the entrance has the main thread to itself.
  useEffect(() => {
    if (!run || idle || !support) return
    // the intro loader is up and waiting on the world: load it now
    if (document.querySelector('[data-lab]')?.hasAttribute('data-loading')) {
      setIdle(true)
      return
    }
    if (support.low) {
      const go = () => setIdle(true)
      const events = ['pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const
      events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
      const t = window.setTimeout(go, 3500)
      return () => {
        window.clearTimeout(t)
        events.forEach((e) => window.removeEventListener(e, go))
      }
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(() => setIdle(true), 900)
    return () => window.clearTimeout(t)
  }, [run, idle, support])

  // anchors: on load, on resize, and whenever the document's height changes
  useEffect(() => {
    if (exhibit !== undefined) return // a case study has no journey to measure
    let raf = 0
    const remeasure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => measureAnchors())
    }
    remeasure()
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    window.addEventListener('resize', remeasure)
    document.fonts?.ready.then(remeasure).catch(() => {})
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', remeasure)
    }
  }, [exhibit])

  // pointer, normalised; only fine pointers drive parallax
  useEffect(() => {
    if (!support?.fine) return
    const onMove = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      world.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [support?.fine])

  const onReady = useCallback(() => setWorldState('on'), [])

  return (
    <div className="l-world" aria-hidden="true">
      <div className="l-atmos" />
      {run && idle && support && (
        <div className="l-canvas">
          <Suspense fallback={null}>
            <WorldCanvas
              scene={scene}
              lowTier={support.low}
              finePointer={support.fine}
              onReady={onReady}
              exhibit={exhibit}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
