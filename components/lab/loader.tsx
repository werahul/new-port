'use client'

/**
 * The intro: the first visit of a session to the home page, while the world
 * loads behind it. Progress is real — each line of the boot log ticks when
 * its work is actually done:
 *
 *   typefaces       document.fonts.ready
 *   the 3D world    the scene's chunk loaded and its first frame drawn
 *   project screens the screenshots fetched (the 3D screens reuse the cache)
 *
 * Meanwhile the world uploads textures and compiles every shader in advance
 * (`world.preload`), so the journey never stalls on first sight of anything.
 *
 * It never traps anyone. The pre-paint script only raises it with JavaScript
 * running, motion welcome, no #section in the address, and once per
 * session — and drops it after fifteen seconds if this component never boots.
 * The page underneath is complete server HTML throughout. After twelve
 * seconds the buttons appear whatever is still loading, Esc enters quietly,
 * and "Skip" is there from the start.
 *
 * Sound starts only from the "Enter with sound" click — a real gesture, as
 * browsers require — and the nav's switch turns it off at any time.
 */
import { Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getLenis } from '@/components/ui/smooth-scroll'
import { optimisedUrl, screenTextureWidth } from './img-url'
import { setSound } from './sound/sound'
import { useWorldSupport } from './world/world-host'
import { world } from './world/world-state'

type Step = 'fonts' | 'world' | 'screens'
const WEIGHT: Record<Step, number> = { fonts: 0.15, world: 0.55, screens: 0.3 }
const GIVE_UP_MS = 12000
const MIN_MS = 1400

function labRoot() {
  return document.querySelector<HTMLElement>('[data-lab]')
}

/** The page behind the dialog: unreachable by keyboard and screen readers while it is up. */
function setBackground(inert: boolean) {
  document.querySelectorAll<HTMLElement>('.l-nav, .l-content').forEach((el) => {
    el.inert = inert
  })
}

export function Loader({ screens }: { screens: string[] }) {
  const [active, setActive] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [done, setDone] = useState<Record<Step, number>>({ fonts: 0, world: 0, screens: 0 })
  const [shown, setShown] = useState(0)
  const [ready, setReady] = useState(false)
  const support = useWorldSupport()
  const card = useRef<HTMLDivElement>(null)
  const started = useRef(0)

  const target = (Object.keys(WEIGHT) as Step[]).reduce((sum, k) => sum + WEIGHT[k] * done[k], 0)

  // boot: is the loader actually up?
  useEffect(() => {
    ;(window as Window & { __labLoader?: boolean }).__labLoader = true
    const root = labRoot()
    if (!root?.hasAttribute('data-loading')) {
      setActive(false)
      return
    }
    started.current = performance.now()
    world.preload = true
    setBackground(true)
    // focus into the dialog, so screen readers start with its title
    card.current?.focus()
    // smooth scroll is created by an ancestor, whose effects run after ours:
    // wait for it, then hold the page still behind the curtain
    let raf = 0
    const hold = () => {
      const lenis = getLenis()
      if (lenis) lenis.stop()
      else raf = requestAnimationFrame(hold)
    }
    hold()
    return () => {
      cancelAnimationFrame(raf)
      world.preload = false
      setBackground(false)
    }
  }, [])

  // typefaces
  useEffect(() => {
    if (!active) return
    let alive = true
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    ;(fonts ? fonts.ready : Promise.resolve()).then(() => alive && setDone((d) => ({ ...d, fonts: 1 })))
    return () => {
      alive = false
    }
  }, [active])

  // the 3D world: wait for the page's data-world to settle on "on" (or "off")
  useEffect(() => {
    if (!active) return
    const el = document.querySelector<HTMLElement>('[data-world]')
    if (!el) {
      setDone((d) => ({ ...d, world: 1 }))
      return
    }
    const check = () => {
      const s = el.dataset.world
      if (s === 'on' || (s === 'off' && support)) setDone((d) => ({ ...d, world: 1 }))
      else if (s === 'pending') setDone((d) => ({ ...d, world: Math.max(d.world, 0.25) }))
    }
    check()
    const mo = new MutationObserver(check)
    mo.observe(el, { attributes: true, attributeFilter: ['data-world'] })
    return () => mo.disconnect()
  }, [active, support])

  // project screens, at exactly the size the 3D will ask for
  useEffect(() => {
    if (!active || !support) return
    if (!support.ok || !screens.length) {
      setDone((d) => ({ ...d, screens: 1 }))
      return
    }
    let alive = true
    let count = 0
    const width = screenTextureWidth(support.low)
    const imgs = screens.map((src) => {
      const img = new Image()
      img.decoding = 'async'
      const tick = () => {
        count++
        if (alive) setDone((d) => ({ ...d, screens: count / screens.length }))
      }
      img.onload = tick
      img.onerror = tick
      img.src = optimisedUrl(src, width)
      return img
    })
    return () => {
      alive = false
      imgs.forEach((i) => (i.onload = i.onerror = null))
    }
  }, [active, support, screens])

  // the bar eases toward real progress; ready when everything is in (and a
  // beat has passed, so it never flashes), or when we stop waiting
  useEffect(() => {
    if (!active) return
    let raf = 0
    const loop = () => {
      setShown((v) => {
        const n = v + (target - v) * 0.08
        return Math.abs(target - n) < 0.002 ? target : n
      })
      const elapsed = performance.now() - started.current
      if ((target >= 0.999 && elapsed > MIN_MS) || elapsed > GIVE_UP_MS) setReady(true)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, target])

  // focus the way in as soon as there is one
  useEffect(() => {
    if (ready) card.current?.querySelector<HTMLButtonElement>('[data-primary]')?.focus()
  }, [ready])

  const enter = useCallback((withSound: boolean) => {
    // inside the click: the gesture browsers require. Choosing quiet is
    // remembered too, so a preference from an earlier visit doesn't override it
    setSound(withSound)
    try {
      sessionStorage.setItem('lab:entered', '1')
    } catch {
      /* fine — it simply shows again next visit */
    }
    world.preload = false
    const root = labRoot()
    root?.setAttribute('data-loading', 'leaving') // the hero's entrance plays as the curtain lifts
    setLeaving(true)
    window.setTimeout(() => {
      root?.removeAttribute('data-loading')
      setBackground(false)
      getLenis()?.start()
      setActive(false)
    }, 900)
  }, [])

  // Esc enters quietly; Tab stays inside the dialog
  useEffect(() => {
    if (!active || leaving) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return enter(false)
      if (e.key !== 'Tab' || !card.current) return
      const items = Array.from(card.current.querySelectorAll<HTMLElement>('button'))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, leaving, enter])

  if (!active) return null

  const pct = Math.round(shown * 100)
  const steps: [Step, string][] = [
    ['fonts', 'Typefaces'],
    ['world', '3D world & lighting'],
    ['screens', 'Project screens'],
  ]

  return (
    <div className="l-loader" role="dialog" aria-modal="true" aria-labelledby="loader-title" data-leaving={leaving}>
      <div ref={card} className="l-loader-card" tabIndex={-1}>
        <p className="l-loader-name">Rahul Kumar</p>
        <h2 id="loader-title" className="l-loader-title">
          Portfolio <span>— {new Date().getFullYear()}</span>
        </h2>

        <div className="l-loader-count" aria-hidden="true">
          {ready ? '100' : String(pct).padStart(2, '0')}
          <span>%</span>
        </div>

        <div
          className="l-loader-bar"
          role="progressbar"
          aria-label="Loading the 3D world"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ready ? 100 : pct}
        >
          <span style={{ transform: `scaleX(${ready ? 1 : shown.toFixed(3)})` }} />
        </div>

        <ul className="l-loader-steps" aria-hidden="true">
          {steps.map(([k, label]) => (
            <li key={k} data-state={done[k] >= 1 ? 'done' : done[k] > 0 ? 'busy' : 'wait'}>
              {label}
            </li>
          ))}
        </ul>

        <div className="l-loader-foot">
          {ready ? (
            <div className="l-loader-actions">
              <button type="button" className="l-btn l-btn-solid" data-primary onClick={() => enter(true)}>
                <Volume2 aria-hidden="true" size={16} strokeWidth={2.25} />
                Enter with sound
              </button>
              <button type="button" className="l-btn" onClick={() => enter(false)}>
                Enter without
              </button>
            </div>
          ) : (
            <button type="button" className="l-loader-skip" onClick={() => enter(false)}>
              Skip
            </button>
          )}
          <p className="l-loader-note">Ambient sound is optional — switch it off any time.</p>
        </div>
      </div>
    </div>
  )
}
