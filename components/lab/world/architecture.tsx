'use client'

/**
 * A model of the Jasper Colin CRM platform — the stand-in for screenshots
 * that don't exist: three independently deployable applications (Admin,
 * Client, Supplier) docked onto the shared UI library they all render from.
 *
 * It is literal on purpose — the composition *is* the case study. At rest
 * every part wears a soft tint of its colour on a dark server plinth; the
 * parts a project owns flood with full colour and lift off the library,
 * which is the picture of "deploys on its own".
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import { ARCH_POS } from './keyframes'
import { PALETTE } from './environment'
import { live } from './rig'
import { makeLabelTexture } from './textures'
import { world } from './world-state'

type Part = 'admin' | 'client' | 'supplier' | 'library'

const BLOCKS: { id: Exclude<Part, 'library'>; x: number; label: string }[] = [
  { id: 'admin', x: -2.25, label: 'Admin' },
  { id: 'client', x: 0, label: 'Client' },
  { id: 'supplier', x: 2.25, label: 'Supplier' },
]

const HUE: Record<Part, string> = {
  admin: PALETTE.pink,
  client: PALETTE.yellow,
  supplier: PALETTE.cyan,
  library: PALETTE.violet,
}

const WHITE = new THREE.Color('#FFFFFF')
/** how much of its hue a part wears at rest */
const REST_TINT = 0.32

/** `exhibit`: the journey slot this model stands in; `highlight`: the parts that project owns. */
export function Architecture({ exhibit, highlight }: { exhibit: number; highlight: string[] }) {
  const H = useMemo(() => new Set(highlight), [highlight])
  const shown = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const blockRefs = useRef<(THREE.Group | null)[]>([])
  const linkRefs = useRef<(THREE.Mesh | null)[]>([])

  const res = useMemo(() => {
    const mk = () =>
      new THREE.MeshPhysicalMaterial({
        color: WHITE.clone(),
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.3,
      })
    const mats: Record<Part, THREE.MeshPhysicalMaterial> = { admin: mk(), client: mk(), supplier: mk(), library: mk() }
    const plinth = new THREE.MeshPhysicalMaterial({ color: '#232040', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 })
    const link = new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.4 })
    const geo = {
      block: new RoundedBoxGeometry(1.7, 1.05, 1.7, 4, 0.16),
      slab: new RoundedBoxGeometry(6.6, 0.3, 2.6, 4, 0.12),
      plinth: new RoundedBoxGeometry(7.4, 0.34, 3.4, 4, 0.16),
      link: new THREE.CylinderGeometry(0.035, 0.035, 1, 10).translate(0, 0.5, 0),
      plane: new THREE.PlaneGeometry(1, 1),
    }
    const labels = Object.fromEntries(
      [...BLOCKS.map((b) => b.label), 'Shared UI library'].map((l) => [l, makeLabelTexture(l, PALETTE.ink)]),
    ) as Record<string, ReturnType<typeof makeLabelTexture>>
    const labelMats = Object.fromEntries(
      Object.entries(labels).map(([k, l]) => [k, new THREE.MeshBasicMaterial({ map: l.texture, transparent: true, depthWrite: false })]),
    ) as Record<string, THREE.MeshBasicMaterial>
    return { mats, plinth, link, geo, labels, labelMats }
  }, [])

  useEffect(
    () => () => {
      Object.values(res.mats).forEach((m) => m.dispose())
      res.plinth.dispose()
      res.link.dispose()
      Object.values(res.geo).forEach((g) => g.dispose())
      Object.values(res.labels).forEach((l) => l.texture.dispose())
      Object.values(res.labelMats).forEach((m) => m.dispose())
    },
    [res],
  )

  const yaw = useRef(-0.35)
  const pitch = useRef(0)
  const heat = useRef<Record<Part, number>>({ admin: 0, client: 0, supplier: 0, library: 0 })
  const hue = useMemo(
    () => Object.fromEntries(Object.entries(HUE).map(([k, v]) => [k, new THREE.Color(v)])) as Record<Part, THREE.Color>,
    [],
  )

  useFrame((_, rawDt) => {
    // on stage from the exhibit before it until just past its own; on a case
    // study page, only its own
    const at = live.workAt + 1 + exhibit
    const on = live.focus >= 0 ? live.focus === exhibit : live.s > at - 1.75 && live.s < at + 0.9
    if (shown.current) shown.current.visible = on
    if (!on) return
    const dt = Math.min(rawDt, 1 / 10)
    const w = live.exhibit[exhibit]
    const k = 1 - Math.exp(-4 * dt)

    const targetYaw = -0.35 + w * world.exhibitYaw[exhibit] + Math.sin(live.time * 0.25) * 0.06
    yaw.current += (targetYaw - yaw.current) * k
    pitch.current += (w * world.exhibitPitch[exhibit] - pitch.current) * k
    if (root.current) {
      root.current.rotation.set(pitch.current, yaw.current, 0)
      root.current.position.y = Math.sin(live.time * 0.5) * 0.12
    }

    for (const part of ['admin', 'client', 'supplier', 'library'] as Part[]) {
      const target = H.has(part) ? w : 0
      heat.current[part] += (target - heat.current[part]) * k
      res.mats[part].color.copy(WHITE).lerp(hue[part], REST_TINT + (1 - REST_TINT) * heat.current[part])
    }
    BLOCKS.forEach((b, i) => {
      const lift = 0.7 * heat.current[b.id] + Math.sin(live.time * 0.8 + i) * 0.04
      const g = blockRefs.current[i]
      if (g) g.position.y = 1.62 + lift
      const l = linkRefs.current[i]
      if (l) l.scale.y = 0.4 + lift
    })
  })

  const label = (text: string, width: number) => {
    const l = res.labels[text]
    return <mesh geometry={res.geo.plane} material={res.labelMats[text]} scale={[width, width / l.aspect, 1]} />
  }

  return (
    <group ref={shown} position={ARCH_POS} visible={false}>
      <group ref={root}>
        <mesh geometry={res.geo.plinth} material={res.plinth} position={[0, 0.17, 0]} />
        <group position={[0, 0.56, 0]}>
          <mesh geometry={res.geo.slab} material={res.mats.library} />
          <group position={[0, 0, 1.31]}>{label('Shared UI library', 2.3)}</group>
        </group>
        {BLOCKS.map((b, i) => (
          <group key={b.id}>
            <mesh
              ref={(el) => {
                linkRefs.current[i] = el
              }}
              geometry={res.geo.link}
              material={res.link}
              position={[b.x, 0.71, 0]}
            />
            <group
              ref={(el) => {
                blockRefs.current[i] = el
              }}
              position={[b.x, 1.62, 0]}
            >
              <mesh geometry={res.geo.block} material={res.mats[b.id]} />
              <group position={[0, 0, 0.86]}>{label(b.label, b.label.length > 6 ? 1.3 : 1.0)}</group>
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}
