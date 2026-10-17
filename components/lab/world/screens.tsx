'use client'

/**
 * Screenshot exhibits. Each gets its own composition rather than a shared
 * card pattern:
 *
 *   fan   — Holidays Journey, sixteen destinations: a sheaf of tinted pages
 *           that fans open behind the device when the visitor arrives.
 *   stack — Rush and the Task & Time Tracker, layered products: tinted glass
 *           panels that step back behind the device and spread on arrival.
 *   orbit — Twinkle Khandelwal's portfolio: the core (see keyframes) circles
 *           it.
 *
 * Textures load only once the visitor nears the work section, at a width the
 * device warrants, and are disposed when the world unmounts.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import type { ExhibitKind, SceneData } from '@/content/lab'
import { SCREENS } from './keyframes'
import { PALETTE } from './environment'
import { live } from './rig'
import { screenTextureWidth } from '../img-url'
import { loadScreenTexture, makeChromeTexture, type Crop } from './textures'
import { world } from './world-state'

interface ScreenProps {
  exhibit: number
  kind: ExhibitKind
  src: string
  crop: Crop
  host: string
  pos: [number, number, number]
  rotY: number
  width: number
  load: boolean
  textureWidth: 828 | 1080 | 1200
  tiltWithPointer: boolean
}

function useScreenTexture(src: string, crop: Crop, load: boolean, width: 828 | 1080 | 1200) {
  const [tex, setTex] = useState<{ texture: THREE.Texture; aspect: number } | null>(null)
  useEffect(() => {
    if (!load) return
    let alive = true
    let loaded: THREE.Texture | null = null
    loadScreenTexture(src, width, crop)
      .then((t) => {
        loaded = t.texture
        if (alive) setTex(t)
        else t.texture.dispose()
      })
      .catch(() => {})
    return () => {
      alive = false
      loaded?.dispose()
    }
    // crop is plain data from the server and never changes after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, load, width])
  return tex
}

const PAGE_COLORS = [PALETTE.pink, PALETTE.violet, PALETTE.cyan, PALETTE.yellow, PALETTE.emerald, PALETTE.coral]

/** the browser bar above each screenshot */
const BAR = 0.3

function Screen({ exhibit, kind, src, crop, host, pos, rotY, width, load, textureWidth, tiltWithPointer }: ScreenProps) {
  const group = useRef<THREE.Group>(null)
  const fan = useRef<(THREE.Group | null)[]>([])
  const layers = useRef<(THREE.Mesh | null)[]>([])
  const tex = useScreenTexture(src, crop, load, textureWidth)
  const aspect = tex?.aspect ?? crop.aspect
  const w = width
  const h = w / aspect

  const mats = useMemo(
    () => ({
      bezel: new THREE.MeshPhysicalMaterial({
        color: PALETTE.ink,
        roughness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.5,
        transparent: true,
      }),
      screen: new THREE.MeshBasicMaterial({ color: '#E9E4F7', toneMapped: false, transparent: true }),
      layers: [PALETTE.pink, PALETTE.lilac, PALETTE.yellow].map(
        (c) =>
          new THREE.MeshPhysicalMaterial({
            color: c,
            roughness: 0.15,
            clearcoat: 1,
            transparent: true,
            opacity: 0.6,
            envMapIntensity: 1.2,
          }),
      ),
      pages: Array.from({ length: 10 }, (_, i) =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#FFFFFF').lerp(new THREE.Color(PAGE_COLORS[i % PAGE_COLORS.length]), 0.4 + i * 0.04),
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      ),
    }),
    [],
  )
  const geo = useMemo(
    () => ({
      plane: new THREE.PlaneGeometry(1, 1),
      bezel: new RoundedBoxGeometry(w + 0.34, h + 0.34 + BAR, 0.2, 4, 0.14),
      layer: new RoundedBoxGeometry(w, h, 0.05, 2, 0.12),
    }),
    [w, h],
  )
  useEffect(
    () => () => {
      mats.bezel.dispose()
      mats.screen.dispose()
      mats.layers.forEach((m) => m.dispose())
      mats.pages.forEach((m) => m.dispose())
    },
    [mats],
  )
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])

  const chrome = useMemo(() => {
    const texture = makeChromeTexture(host, w / (BAR * 0.86))
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false })
    return { texture, material }
  }, [host, w])
  useEffect(
    () => () => {
      chrome.texture.dispose()
      chrome.material.dispose()
    },
    [chrome],
  )

  // swap the placeholder colour for the screenshot once it arrives — uploaded
  // to the GPU straight away, so the first frame that shows it doesn't stall
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (tex) gl.initTexture(tex.texture)
    mats.screen.map = tex?.texture ?? null
    mats.screen.color.set(tex ? '#ffffff' : '#E9E4F7')
    mats.screen.needsUpdate = true
  }, [tex, mats, gl])

  const state = useRef({ yaw: 0, pitch: 0, spread: 0 })

  useFrame((_, rawDt) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(rawDt, 1 / 10)
    const k = 1 - Math.exp(-4 * dt)
    const weight = live.exhibit[exhibit]
    const presence = live.presence[exhibit]
    g.visible = presence > 0.001
    if (!g.visible) return
    mats.bezel.opacity = presence
    mats.screen.opacity = presence
    chrome.material.opacity = presence
    mats.layers.forEach((m) => (m.opacity = 0.6 * presence))
    mats.pages.forEach((m) => (m.opacity = 0.55 * presence))
    g.scale.setScalar(0.9 + 0.1 * presence)
    const s = state.current
    const py = tiltWithPointer ? world.pointer.x * 0.14 * weight : 0
    const px = tiltWithPointer ? -world.pointer.y * 0.08 * weight : 0
    s.yaw += (world.exhibitYaw[exhibit] * weight + py - s.yaw) * k
    s.pitch += (world.exhibitPitch[exhibit] * weight + px - s.pitch) * k
    s.spread += (weight - s.spread) * k
    g.rotation.set(s.pitch, rotY + s.yaw + Math.sin(live.time * 0.3 + exhibit) * 0.04, 0)
    g.position.y = pos[1] + Math.sin(live.time * 0.6 + exhibit) * 0.1

    if (kind === 'screen-stack') {
      layers.current.forEach((l, i) => {
        if (!l) return
        const n = i + 1
        l.position.set(n * (0.25 + 0.2 * s.spread), n * (0.18 + 0.14 * s.spread), -n * (0.35 + 0.3 * s.spread))
      })
    }
    if (kind === 'screen-fan') {
      fan.current.forEach((p, i) => {
        // the sheaf opens away from the viewer, behind the device — never across its screen
        if (p) p.rotation.y = (i + 1) * (0.02 + 0.045 * s.spread)
      })
    }
  })

  return (
    <group ref={group} position={pos}>
      {/* a floating device: glossy ink bezel, the screenshot as its screen */}
      <mesh geometry={geo.bezel} material={mats.bezel} position={[0, BAR / 2, -0.11]} />
      <mesh
        geometry={geo.plane}
        material={chrome.material}
        scale={[w, BAR * 0.86, 1]}
        position={[0, h / 2 + 0.04 + (BAR * 0.86) / 2, 0.005]}
      />
      <mesh geometry={geo.plane} material={mats.screen} scale={[w, h, 1]} position={[0, 0, 0.005]} />

      {kind === 'screen-stack' &&
        mats.layers.map((m, i) => (
          <mesh
            key={i}
            ref={(el) => {
              layers.current[i] = el
            }}
            geometry={geo.layer}
            material={m}
          />
        ))}

      {kind === 'screen-fan' &&
        mats.pages.map((m, i) => (
          <group
            key={i}
            ref={(el) => {
              fan.current[i] = el
            }}
            position={[-w / 2, 0, -0.24 - i * 0.015]}
          >
            <mesh geometry={geo.plane} material={m} scale={[w, h, 1]} position={[w / 2, 0, 0]} />
          </group>
        ))}
    </group>
  )
}

interface ScreensProps {
  screens: SceneData['screens']
  lowTier: boolean
  tiltWithPointer: boolean
}

export function Screens({ screens, lowTier, tiltWithPointer }: ScreensProps) {
  const [load, setLoad] = useState(false)
  const shown = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!load && (world.preload || live.s > live.workAt - 1.3)) setLoad(true)
    if (shown.current) shown.current.visible = live.s > live.workAt - 0.5
  })

  return (
    <group ref={shown} visible={false}>
      {SCREENS.map((cfg) => {
        const ex = screens.find((s) => s.exhibit === cfg.exhibit)
        if (!ex) return null
        return (
          <Screen
            key={cfg.exhibit}
            exhibit={cfg.exhibit}
            kind={ex.kind}
            src={ex.src}
            crop={ex.crop}
            host={ex.host}
            pos={cfg.pos}
            rotY={cfg.rotY}
            width={cfg.width}
            load={load}
            textureWidth={screenTextureWidth(lowTier)}
            tiltWithPointer={tiltWithPointer}
          />
        )
      })}
    </group>
  )
}
