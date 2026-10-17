'use client'

/**
 * Four portals the camera flies through in "Approach", one per principle —
 * glossy rings in the live site's colours, each with a fine ink inner hoop
 * and an outer crown of ticks that turns like a loading spinner.
 * They open (bloom from nothing) as the visitor arrives at the section, so the
 * tunnel is never sitting in the distance before it is needed.
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PALETTE } from './environment'
import { RINGS_Z, RING_RADIUS, RING_Y } from './keyframes'
import { live } from './rig'

const COLORS = [PALETTE.violet, PALETTE.coral, PALETTE.yellow, PALETTE.cyan]
const TICKS = 36

export function Rings({ lowTier }: { lowTier: boolean }) {
  const root = useRef<THREE.Group>(null)
  const rings = useRef<(THREE.Group | null)[]>([])

  const res = useMemo(() => {
    const torus = new THREE.TorusGeometry(RING_RADIUS, 0.26, lowTier ? 20 : 36, lowTier ? 72 : 140)
    const hoop = new THREE.TorusGeometry(RING_RADIUS - 0.42, 0.018, 8, 120)
    const mats = COLORS.map(
      (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.5 }),
    )
    // fine ink detail, softened so it draws the eye without shouting
    const hoopMat = new THREE.MeshBasicMaterial({ color: PALETTE.ink, transparent: true, opacity: 0.45 })
    const tick = new THREE.BoxGeometry(0.035, 0.18, 0.035)
    // the ticks' layout never changes: write it once
    const tickMatrices = Array.from({ length: TICKS }, (_, i) => {
      const a = (i / TICKS) * Math.PI * 2
      const r = RING_RADIUS + 0.62
      return new THREE.Matrix4().compose(
        new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a - Math.PI / 2),
        new THREE.Vector3(1, i % 3 === 0 ? 1.5 : 1, 1),
      )
    })
    return { torus, hoop, mats, hoopMat, tick, tickMatrices }
  }, [lowTier])

  useEffect(
    () => () => {
      res.torus.dispose()
      res.hoop.dispose()
      res.mats.forEach((m) => m.dispose())
      res.hoopMat.dispose()
      res.tick.dispose()
    },
    [res],
  )

  const ticks = useRef<(THREE.InstancedMesh | null)[]>([])
  useEffect(() => {
    ticks.current.forEach((m) => {
      if (!m) return
      res.tickMatrices.forEach((mx, i) => m.setMatrixAt(i, mx))
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    })
  }, [res])

  const open = useRef(0)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 10)
    const r = root.current
    if (!r) return
    const target = Number.isFinite(live.approachAt) && live.s > live.approachAt - 0.8 ? 1 : 0
    open.current += (target - open.current) * (1 - Math.exp(-3 * dt))
    r.visible = open.current > 0.01
    if (!r.visible) return
    rings.current.forEach((g, i) => {
      if (!g) return
      // a staggered opening, then a slow wobble so they feel suspended
      const o = Math.min(1, Math.max(0, open.current * 1.6 - i * 0.2))
      g.scale.setScalar(0.001 + o * o * (3 - 2 * o))
      g.rotation.set(Math.sin(live.time * 0.4 + i) * 0.06, Math.cos(live.time * 0.35 + i) * 0.08, live.time * 0.1 * (i % 2 ? -1 : 1))
      const t = ticks.current[i]
      if (t) t.rotation.z = -live.time * 0.5 * (i % 2 ? -1 : 1)
    })
  })

  return (
    <group ref={root} visible={false}>
      {RINGS_Z.map((z, i) => (
        <group
          key={z}
          position={[0, RING_Y, z]}
          ref={(el) => {
            rings.current[i] = el
          }}
        >
          <mesh geometry={res.torus} material={res.mats[i]} />
          <mesh geometry={res.hoop} material={res.hoopMat} />
          <instancedMesh
            ref={(el) => {
              ticks.current[i] = el
            }}
            args={[res.tick, res.hoopMat, TICKS]}
          />
        </group>
      ))}
    </group>
  )
}
