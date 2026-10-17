'use client'

/**
 * While the intro loader is up, compile every material's shader program in
 * advance — including the planets, screens and portals that are hidden until
 * the visitor reaches them. Otherwise each would compile the first time it
 * appears, and that is a visible stall in the middle of a scroll.
 *
 * `renderer.compile` only visits visible objects, so everything is shown for
 * the call and put back straight after. It repeats every half second while
 * the loader is up, because textures arriving late change some programs.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'
import { world } from './world-state'

export function Precompile() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const last = useRef(-1)

  useFrame((state) => {
    if (!world.preload) return
    const t = state.clock.elapsedTime
    if (last.current >= 0 && t - last.current < 0.5) return
    last.current = t
    const hidden: THREE.Object3D[] = []
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o)
        o.visible = true
      }
    })
    gl.compile(scene, camera)
    hidden.forEach((o) => (o.visible = false))
  })

  return null
}
