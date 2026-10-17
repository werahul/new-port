'use client'

/**
 * The camera for a case study page. The page is one exhibit of the home
 * journey, so the world is put in exactly the state the journey has at that
 * exhibit's anchor — same subject, same framing, same light — and the camera
 * parks there. Scrolling the hero away drifts it back and down a little, so
 * the subject rises with the page rather than sitting still behind it.
 *
 * It writes the same `live` state the journey rig writes, which is what every
 * scene component reads; nothing else needs to know which page it is on.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { keyframes } from './keyframes'
import { live } from './rig'
import { world } from './world-state'

const BASE_FOV = 34
/** a virtual journey: "work" at 3, so exhibit i sits at 4 + i */
const WORK = 3

const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt))

export function CaseRig({ exhibit, parallax }: { exhibit: number; parallax: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const kf = keyframes[`project-${exhibit}`]
  const v = useRef({
    cam: new THREE.Vector3(...kf.cam),
    look: new THREE.Vector3(...kf.look),
    pos: new THREE.Vector3(),
    aim: new THREE.Vector3(),
    lookNow: new THREE.Vector3(...kf.look),
    first: true,
    drift: 0,
    par: { x: 0, y: 0 },
    off: { x: 0, y: 0 },
    fov: BASE_FOV,
  })

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 10)
    const r = v.current
    live.time += dt

    // the journey's state at this exhibit
    live.workAt = WORK
    live.capsAt = -100
    live.approachAt = Infinity
    live.s = WORK + 1 + exhibit
    live.focus = exhibit
    for (let j = 0; j < 5; j++) {
      live.exhibit[j] = j === exhibit ? 1 : 0
      live.presence[j] = j === exhibit ? 1 : 0
    }
    live.coreScale = kf.coreScale
    live.morph = kf.morph
    live.orbit = kf.orbit
    live.sky = kf.sky
    live.cluster = 0
    const o = kf.orbit
    live.core.set(
      kf.core[0] + Math.cos(live.time * 0.32) * o * 0.7,
      kf.core[1] + Math.sin(live.time * 0.5) * 0.35 * Math.min(1, o),
      kf.core[2] + Math.sin(live.time * 0.32) * o,
    )

    // scroll drift, through the first screen and a half
    const p = Math.min(1.6, window.scrollY / Math.max(1, window.innerHeight))
    r.drift = damp(r.drift, p, 6, dt)
    r.aim.copy(r.look)
    r.aim.y -= 1.6 * r.drift
    r.pos.copy(r.cam).sub(r.look).multiplyScalar(1 + 0.22 * r.drift).add(r.aim)
    r.pos.y -= 0.6 * r.drift

    // portrait screens: the same widen-and-step-back as the journey rig
    const { width: w, height: h } = state.size
    const aspect = w / h
    const zoom = aspect < 1.2 ? Math.min(1.6, Math.sqrt(1.2 / aspect)) : 1
    r.pos.sub(r.aim).multiplyScalar(1 + (zoom - 1) * kf.dolly).add(r.aim)
    r.fov = damp(r.fov, aspect < 1 ? BASE_FOV * (1 + 0.5 * (1 - aspect)) : BASE_FOV, 6, dt)
    if (Math.abs(camera.fov - r.fov) > 0.01) camera.fov = r.fov

    r.par.x = damp(r.par.x, parallax ? world.pointer.x : 0, 2.5, dt)
    r.par.y = damp(r.par.y, parallax ? world.pointer.y : 0, 2.5, dt)
    r.pos.x += r.par.x * 0.32
    r.pos.y += r.par.y * 0.18

    if (r.first) {
      camera.position.copy(r.pos)
      r.lookNow.copy(r.aim)
      r.first = false
    } else {
      const k = 1 - Math.exp(-5 * dt)
      camera.position.lerp(r.pos, k)
      r.lookNow.lerp(r.aim, k)
    }
    camera.lookAt(r.lookNow)

    // the subject beside the text on wide screens, above it on narrow ones
    live.narrow = w < 1024
    const fx = live.narrow ? 0 : kf.frame
    const fy = live.narrow ? kf.frameUp : 0
    r.off.x = damp(r.off.x, -fx * w * 0.2, 6, dt)
    r.off.y = damp(r.off.y, fy * h * 0.17, 6, dt)
    camera.setViewOffset(w, h, r.off.x, r.off.y, w, h)
  }, -1)

  return null
}
