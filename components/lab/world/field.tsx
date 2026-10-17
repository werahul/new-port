'use client'

/**
 * The floating field: glossy candy shapes and solid code punctuation —
 * spheres, rings, capsules, soft cubes, </>, { }, ( ), [ ] — in the live
 * site's colours, scattered through the whole journey. They are what makes
 * the page feel like a world rather than a backdrop: near ones slide past the
 * lens, far ones melt into the haze.
 *
 * Placement is planned once from the keyframes themselves. Nothing is put
 *   · within reach of the camera's path — including the stepped-back path
 *     portrait screens take (see the dolly in rig.tsx),
 *   · inside the cone between the camera and what it is looking at, so no
 *     shape ever sits in front of a subject,
 *   · within a subject's clearance, or below the floor.
 * One InstancedMesh per kind, so the whole field is eight draw calls.
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import { PALETTE } from './environment'
import { makeGlyphs } from './glyphs'
import { ANCHOR_ORDER, FLOOR_Y, SUBJECTS, keyframes } from './keyframes'
import { live } from './rig'

interface Item {
  pos: THREE.Vector3
  rot: THREE.Euler
  spin: THREE.Vector3
  scale: number
  bob: number
  color: THREE.Color
}

const COLORS = [
  PALETTE.yellow,
  PALETTE.pink,
  PALETTE.violet,
  PALETTE.cobalt,
  PALETTE.cyan,
  PALETTE.emerald,
  PALETTE.coral,
  PALETTE.grape,
  PALETTE.hot,
]

/** small deterministic PRNG, so the field is the same on every visit */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** the furthest a portrait screen steps the camera back (matches rig.tsx) */
const MAX_DOLLY = 1.6

const _ab = new THREE.Vector3()
const _ap = new THREE.Vector3()

/** distance from p to segment a→b; `t.along` receives how far along it the nearest point is */
function distToSegment(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, t: { along: number }) {
  _ab.subVectors(b, a)
  const len2 = _ab.lengthSq()
  const u = len2 > 0 ? Math.max(0, Math.min(1, _ap.subVectors(p, a).dot(_ab) / len2)) : 0
  t.along = u * Math.sqrt(len2)
  return _ap.copy(a).addScaledVector(_ab, u).distanceTo(p)
}

function plan(count: number, seed: number): Item[] {
  const rand = rng(seed)
  const frames = ANCHOR_ORDER.map((n) => keyframes[n])
  const curve = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts, false, 'centripetal').getSpacedPoints(220)
  const cams = curve(frames.map((f) => new THREE.Vector3(...f.cam)))
  const looks = curve(frames.map((f) => new THREE.Vector3(...f.look)))
  // where a portrait screen puts the camera: stepped back along the view line
  const dollied = curve(
    frames.map((f) => {
      const look = new THREE.Vector3(...f.look)
      const back = 1 + (MAX_DOLLY - 1) * f.dolly
      return new THREE.Vector3(...f.cam).sub(look).multiplyScalar(back).add(look)
    }),
  )
  // sightlines, sampled more sparsely — each is a cone from the lens to the subject
  const sights = cams.filter((_, i) => i % 3 === 0).map((c, i) => ({ from: c, to: looks[i * 3] }))
  const subjects = SUBJECTS.map((s) => ({ at: new THREE.Vector3(...s.at), clear: s.clear }))

  const items: Item[] = []
  const p = new THREE.Vector3()
  const t = { along: 0 }
  let guard = 0
  while (items.length < count && guard++ < count * 80) {
    p.set(-18 + rand() * 36, FLOOR_Y + 1.4 + rand() * 11, 12 - rand() * 208)
    // nothing near the lens: a close shape fills the frame and covers the words laid over it
    if (cams.some((q) => q.distanceToSquared(p) < 7.5 * 7.5)) continue
    if (dollied.some((q) => q.distanceToSquared(p) < 6 * 6)) continue
    if (subjects.some((s) => s.at.distanceToSquared(p) < s.clear * s.clear)) continue
    if (sights.some((s) => distToSegment(p, s.from, s.to, t) < 1.3 + t.along * 0.12)) continue
    items.push({
      pos: p.clone(),
      rot: new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
      spin: new THREE.Vector3((rand() - 0.5) * 0.4, (rand() - 0.5) * 0.4, (rand() - 0.5) * 0.3),
      scale: 0.38 + Math.pow(rand(), 1.6) * 1.25,
      bob: rand() * Math.PI * 2,
      color: new THREE.Color(COLORS[Math.floor(rand() * COLORS.length)]),
    })
  }
  return items
}

function Kind({
  geometry,
  material,
  items,
  glyph,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  items: Item[]
  /** glyphs turn gently rather than tumble, so they stay legible */
  glyph: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const m4 = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const scl = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach((it, i) => mesh.setColorAt(i, it.color))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const t = live.time
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (glyph) e.set(Math.sin(t * 0.3 + it.bob) * 0.25, it.rot.y + t * it.spin.y, Math.sin(t * 0.25 + it.bob) * 0.15)
      else e.set(it.rot.x + t * it.spin.x, it.rot.y + t * it.spin.y, it.rot.z + t * it.spin.z)
      q.setFromEuler(e)
      pos.copy(it.pos)
      pos.y += Math.sin(t * 0.6 + it.bob) * 0.25
      scl.setScalar(glyph ? it.scale * 0.9 : it.scale)
      m4.compose(pos, q, scl)
      mesh.setMatrixAt(i, m4)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />
}

/** A parked camera, for the case study pages: where it stands, what it looks at, how the subject is framed. */
export interface ParkedView {
  cam: [number, number, number]
  look: [number, number, number]
  frame: number
}

export function Field({ lowTier, keepClear }: { lowTier: boolean; keepClear?: ParkedView }) {
  const perKind = lowTier ? 9 : 22

  const res = useMemo(() => {
    const kinds = 8
    let all = plan(perKind * kinds, 7)
    // a parked camera (a case study) sees the same shapes for the whole visit:
    // keep a wider pocket of air around it, so nothing sits over the words
    if (keepClear) {
      const cam = new THREE.Vector3(...keepClear.cam)
      const fwd = new THREE.Vector3(...keepClear.look).sub(cam).normalize()
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize()
      const tanH = Math.tan(THREE.MathUtils.degToRad(17)) * (16 / 9)
      const v = new THREE.Vector3()
      all = all.filter((it) => {
        v.subVectors(it.pos, cam)
        if (v.length() < 12) return false
        const z = v.dot(fwd)
        if (z <= 0) return true
        // where it lands across a wide screen, with the subject framed to the right
        const sx = 0.5 + 0.5 * (v.dot(right) / z / tanH) + 0.2 * keepClear.frame
        return sx > 0.56
      })
    }
    const groups = Array.from({ length: kinds }, (_, g) => all.filter((_, i) => i % kinds === g))
    const geometries = [
      new THREE.SphereGeometry(0.62, lowTier ? 20 : 36, lowTier ? 14 : 28),
      new THREE.TorusGeometry(0.55, 0.2, lowTier ? 12 : 20, lowTier ? 32 : 56),
      new THREE.CapsuleGeometry(0.32, 0.7, lowTier ? 6 : 10, lowTier ? 14 : 24),
      new RoundedBoxGeometry(0.95, 0.95, 0.95, lowTier ? 2 : 4, 0.2),
      ...makeGlyphs(lowTier),
    ]
    const material = lowTier
      ? new THREE.MeshStandardMaterial({ roughness: 0.24, metalness: 0.05, envMapIntensity: 1.4 })
      : new THREE.MeshPhysicalMaterial({
          roughness: 0.2,
          metalness: 0.02,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          iridescence: 0.3,
          iridescenceIOR: 1.3,
          envMapIntensity: 1.5,
        })
    return { groups, geometries, material }
  // keepClear is a fixed keyframe position for the page's lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perKind, lowTier])

  useEffect(
    () => () => {
      res.geometries.forEach((g) => g.dispose())
      res.material.dispose()
    },
    [res],
  )

  return (
    <>
      {res.geometries.map((g, i) => (
        <Kind key={i} geometry={g} material={res.material} items={res.groups[i]} glyph={i >= 4} />
      ))}
    </>
  )
}
