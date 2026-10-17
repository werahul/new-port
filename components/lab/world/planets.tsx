'use client'

/**
 * Capabilities as a small solar system: five glossy planets orbit the core,
 * one per discipline (the tabs name them). Engaging a tab in the DOM swells that
 * planet, rings it, and draws it toward the visitor.
 *
 * Only on stage around the capabilities section; it grows in and out.
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PALETTE } from './environment'
import { PLANETS_CENTER, PLANET_RING } from './keyframes'
import { live } from './rig'
import { world } from './world-state'

const COLORS = [PALETTE.violet, PALETTE.pink, PALETTE.cobalt, PALETTE.coral, PALETTE.emerald]

export function Planets() {
  const root = useRef<THREE.Group>(null)
  const bodies = useRef<(THREE.Group | null)[]>([])
  const rings = useRef<(THREE.Mesh | null)[]>([])

  const res = useMemo(() => {
    const sphere = new THREE.SphereGeometry(1, 48, 32)
    const ring = new THREE.TorusGeometry(1.55, 0.05, 12, 96)
    const mats = COLORS.map(
      (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4 }),
    )
    const ringMat = new THREE.MeshBasicMaterial({ color: PALETTE.ink, transparent: true, opacity: 0.8 })
    return { sphere, ring, mats, ringMat }
  }, [])

  useEffect(
    () => () => {
      res.sphere.dispose()
      res.ring.dispose()
      res.mats.forEach((m) => m.dispose())
      res.ringMat.dispose()
    },
    [res],
  )

  const heat = useRef([0, 0, 0, 0, 0])
  const bloom = useRef(0)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 10)
    const r = root.current
    if (!r) return
    // bloom in around the section, out on either side of it
    const d = Math.abs(live.s - live.capsAt)
    const target = Number.isFinite(d) ? Math.min(1, Math.max(0, (1.15 - d) / 0.5)) : 0
    bloom.current += (target - bloom.current) * (1 - Math.exp(-5 * dt))
    r.visible = bloom.current > 0.01
    if (!r.visible) return
    r.scale.setScalar(bloom.current)

    const k = 1 - Math.exp(-5 * dt)
    const spin = live.time * 0.12
    for (let i = 0; i < 5; i++) {
      const body = bodies.current[i]
      if (!body) continue
      const active = world.capability === i ? live.cluster : 0
      heat.current[i] += (active - heat.current[i]) * k
      const h = heat.current[i]
      const a = spin + (i / 5) * Math.PI * 2
      const rad = PLANET_RING + h * 0.35
      body.position.set(Math.cos(a) * rad, Math.sin(a * 2 + i) * 0.25 + h * 0.3, Math.sin(a) * rad * 0.62 + h * 0.9)
      body.scale.setScalar(0.5 + h * 0.28)
      body.rotation.y += dt * 0.4
      // only the engaged planet wears a ring
      const ring = rings.current[i]
      if (ring) {
        ring.visible = h > 0.02
        ring.rotation.set(Math.PI / 2.4, 0, live.time * 0.3)
        ring.scale.setScalar(0.6 + h * 0.4)
      }
    }
  })

  return (
    <group ref={root} position={PLANETS_CENTER} rotation={[0.18, 0, 0]} visible={false}>
      {res.mats.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            bodies.current[i] = el
          }}
        >
          <mesh geometry={res.sphere} material={m} />
          <mesh
            ref={(el) => {
              rings.current[i] = el
            }}
            geometry={res.ring}
            material={res.ringMat}
            visible={false}
          />
        </group>
      ))}
    </group>
  )
}
