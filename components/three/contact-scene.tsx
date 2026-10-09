'use client'

/**
 * The contact block's 3D piece: one fat ink-outlined torus knot with three
 * small cubes orbiting it, on a transparent canvas over the yellow block.
 */
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { C } from './palette'
import { InkHull } from './ink-hull'
import type { SceneProps } from './hero-scene'

function Knot() {
  const ref = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(1.05, 0.36, 160, 20), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.x += dt * 0.25
    ref.current.rotation.y += dt * 0.4
  })
  return (
    <Float speed={1.6} floatIntensity={0.8}>
      <mesh ref={ref} geometry={geometry}>
        <meshToonMaterial color={C.pink} />
        <InkHull geometry={geometry} scale={1.05} />
      </mesh>
    </Float>
  )
}

function Orbiters() {
  const ref = useRef<THREE.Group>(null)
  const geometry = useMemo(() => new THREE.BoxGeometry(0.42, 0.42, 0.42), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame((state, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.7
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime / 2.4) * 0.35
  })
  const colors = [C.cyan, C.emerald, C.paper]
  return (
    <group ref={ref}>
      {colors.map((color, i) => {
        const a = (i / colors.length) * Math.PI * 2
        return (
          <mesh
            key={color}
            geometry={geometry}
            position={[Math.cos(a) * 2.35, Math.sin(a * 2) * 0.4, Math.sin(a) * 2.35]}
            rotation={[a, a, 0]}
          >
            <meshToonMaterial color={color} />
            <InkHull geometry={geometry} scale={1.14} />
          </mesh>
        )
      })}
    </group>
  )
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    onReady()
  })
  return null
}

export default function ContactScene({ active, onReady }: SceneProps) {
  return (
    <Canvas
      flat
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 9.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[-4, 6, 6]} intensity={2.2} />
      <Knot />
      <Orbiters />
      <FirstFrame onReady={onReady} />
    </Canvas>
  )
}
