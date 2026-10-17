'use client'

/**
 * Turns scroll position into the state of the world, once per frame, before
 * anything else draws (negative priority runs first and keeps R3F's automatic
 * render on).
 *
 *   scrollY ──pathParam──▶ s ──damped──▶ curves + scalar keyframes ──▶ `live`
 *
 * Every other scene component reads `live` instead of computing its own idea
 * of where the visitor is, so the whole world moves as one.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { keyframes, type Keyframe } from './keyframes'
import { pathParam, world } from './world-state'

const SCALARS = ['coreScale', 'morph', 'orbit', 'frame', 'frameUp', 'sky', 'cluster', 'dolly'] as const

const BASE_FOV = 34
type Scalar = (typeof SCALARS)[number]

export const live = {
  s: 0,
  time: 0,
  core: new THREE.Vector3(0, 1.6, 0),
  coreScale: 1,
  morph: 0.35,
  orbit: 0,
  /** position along the sky palette */
  sky: 0,
  cluster: 0,
  /** 0..1 per featured exhibit — how much the camera is "at" it */
  exhibit: [0, 0, 0, 0, 0],
  /** 0..1 per featured exhibit — whether it is on stage at all (fades neighbours out) */
  presence: [0, 0, 0, 0, 0],
  /** s at which the work section begins, for lazy loading */
  workAt: Infinity,
  /** s at which the approach section begins */
  approachAt: Infinity,
  /** s at which the capabilities section begins */
  capsAt: Infinity,
  /** narrow (single-column) layout */
  narrow: false,
  /** a case study page's exhibit; -1 on the scroll journey */
  focus: -1,
}

const smooth = (t: number) => t * t * (3 - 2 * t)
const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt))

interface Path {
  version: number
  frames: Keyframe[]
  cam: THREE.CatmullRomCurve3
  look: THREE.CatmullRomCurve3
  core: THREE.CatmullRomCurve3
  exhibitAt: number[]
}

function buildPath(): Path | null {
  const named = world.anchors.filter((a) => keyframes[a.name])
  if (named.length < 2) return null
  // Anchors without a keyframe would desync indices; pathParam uses all of them.
  const frames = world.anchors.map((a, i) => keyframes[a.name] ?? keyframes[named[Math.min(i, named.length - 1)].name])
  const curve = (pick: (f: Keyframe) => [number, number, number]) =>
    new THREE.CatmullRomCurve3(frames.map((f) => new THREE.Vector3(...pick(f))), false, 'centripetal')
  const exhibitAt = [0, 1, 2, 3, 4].map((i) => world.anchors.findIndex((a) => a.name === `project-${i}`))
  live.workAt = world.anchors.findIndex((a) => a.name === 'work')
  live.approachAt = world.anchors.findIndex((a) => a.name === 'approach')
  live.capsAt = world.anchors.findIndex((a) => a.name === 'capabilities')
  return {
    version: world.version,
    frames,
    cam: curve((f) => f.cam),
    look: curve((f) => f.look),
    core: curve((f) => f.core),
    exhibitAt,
  }
}

interface RigProps {
  /** pointer parallax — fine pointers only */
  parallax: boolean
}

export function Rig({ parallax }: RigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const path = useRef<Path | null>(null)
  const sSmooth = useRef<number | null>(null)
  const goal = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), core: new THREE.Vector3() })
  const lookNow = useRef(new THREE.Vector3(0, 1.55, 0))
  const scal = useRef<Record<Scalar, number>>({ ...keyframes.top })
  const offset = useRef({ x: 0, y: 0 })
  const fov = useRef(BASE_FOV)
  const par = useRef({ x: 0, y: 0 })
  const first = useRef(true)

  useFrame((state, rawDt) => {
    // real time down to 10 fps, so a slow device never shows the wrong exhibit
    const dt = Math.min(rawDt, 1 / 10)
    live.time += dt
    if (!path.current || path.current.version !== world.version) path.current = buildPath()
    const p = path.current
    if (!p) return

    const n = p.frames.length
    const target = pathParam(window.scrollY)
    sSmooth.current = sSmooth.current === null ? target : damp(sSmooth.current, target, 7, dt)
    const s = Math.min(n - 1, Math.max(0, sSmooth.current))
    live.s = s

    const t = s / (n - 1)
    p.cam.getPoint(t, goal.current.pos)
    p.look.getPoint(t, goal.current.look)
    p.core.getPoint(t, goal.current.core)

    const i = Math.min(n - 2, Math.floor(s))
    const e = smooth(s - i)
    const a = p.frames[i]
    const b = p.frames[i + 1]
    for (const key of SCALARS) scal.current[key] = a[key] + (b[key] - a[key]) * e

    live.coreScale = scal.current.coreScale
    live.morph = scal.current.morph
    live.orbit = scal.current.orbit
    live.sky = scal.current.sky
    live.cluster = scal.current.cluster
    for (let j = 0; j < 5; j++) {
      const at = p.exhibitAt[j]
      const d = at < 0 ? Infinity : Math.abs(s - at)
      live.exhibit[j] = Math.max(0, 1 - d * 1.15)
      live.presence[j] = Math.min(1, Math.max(0, (0.95 - d) / 0.4))
    }

    // the core: its path plus a slow orbit where a keyframe asks for one
    const o = live.orbit
    live.core.set(
      goal.current.core.x + Math.cos(live.time * 0.32) * o * 0.7,
      goal.current.core.y + Math.sin(live.time * 0.5) * 0.35 * Math.min(1, o),
      goal.current.core.z + Math.sin(live.time * 0.32) * o,
    )

    // Portrait screens see a far narrower slice of the world. Widen the lens a
    // little and step back a little, rather than either alone — a wide lens
    // distorts, a long dolly walks the camera into things.
    const { width: w, height: h } = state.size
    const aspect = w / h
    const zoom = aspect < 1.2 ? Math.min(1.6, Math.sqrt(1.2 / aspect)) : 1
    const dolly = 1 + (zoom - 1) * scal.current.dolly
    goal.current.pos.sub(goal.current.look).multiplyScalar(dolly).add(goal.current.look)
    const fovGoal = aspect < 1 ? BASE_FOV * (1 + 0.5 * (1 - aspect)) : BASE_FOV
    fov.current = damp(fov.current, fovGoal, 6, dt)
    if (Math.abs(camera.fov - fov.current) > 0.01) camera.fov = fov.current

    // pointer parallax, damped so it never twitches
    const px = parallax ? world.pointer.x : 0
    const py = parallax ? world.pointer.y : 0
    par.current.x = damp(par.current.x, px, 2.5, dt)
    par.current.y = damp(par.current.y, py, 2.5, dt)
    goal.current.pos.x += par.current.x * 0.32
    goal.current.pos.y += par.current.y * 0.18

    if (first.current) {
      camera.position.copy(goal.current.pos)
      lookNow.current.copy(goal.current.look)
      first.current = false
    } else {
      const k = 1 - Math.exp(-5 * dt)
      camera.position.lerp(goal.current.pos, k)
      lookNow.current.lerp(goal.current.look, k)
    }
    camera.lookAt(lookNow.current)

    // Subject placement: shift the projection rather than the camera, so the
    // focal object sits beside the text column without changing perspective.
    live.narrow = w < 1024
    const fx = live.narrow ? 0 : scal.current.frame
    const fy = live.narrow ? scal.current.frameUp : 0
    offset.current.x = damp(offset.current.x, -fx * w * 0.2, 6, dt)
    offset.current.y = damp(offset.current.y, fy * h * 0.17, 6, dt)
    camera.setViewOffset(w, h, offset.current.x, offset.current.y, w, h)
  }, -1)

  return null
}
