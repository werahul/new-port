'use client'

/**
 * The hero's 3D piece: a cluster of flat-shaded primitives — cube, pyramid,
 * ring, ball, drum, diamond — each outlined in thick ink like a printed poster.
 * They bob, lean toward the cursor, can be dragged (fine pointers only) and
 * spin when clicked.
 *
 * No environment maps and no drei <Text>: both fetch from CDNs the site's CSP
 * blocks. Toon shading with two lights is all the look needs.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'
import { C } from './palette'
import { InkHull } from './ink-hull'

export interface SceneProps {
  active: boolean
  onReady: () => void
}

interface ShapeProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color: string
  speed?: number
  /** builds the shape's geometry once; shared by the fill and its ink hull */
  make: () => THREE.BufferGeometry
}

function Shape({ position, rotation = [0, 0, 0], color, speed = 1.4, make }: ShapeProps) {
  const ref = useRef<THREE.Mesh>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geometry = useMemo(make, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  const spin = useRef(0)
  const [hovered, setHovered] = useState(false)

  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    // ease the extra spin back to rest; a click adds a full turn
    const step = spin.current * Math.min(1, dt * 5)
    m.rotation.y += step
    spin.current -= step
    const s = hovered ? 1.12 : 1
    m.scale.x += (s - m.scale.x) * Math.min(1, dt * 12)
    m.scale.y = m.scale.z = m.scale.x
  })

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.9}>
      <mesh
        ref={ref}
        geometry={geometry}
        position={position}
        rotation={rotation}
        onClick={(e) => {
          e.stopPropagation()
          spin.current += Math.PI * 2
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshToonMaterial color={color} />
        <InkHull geometry={geometry} />
      </mesh>
    </Float>
  )
}

/** Leans the whole cluster toward the cursor, wherever it is on the page. */
function Lean({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const k = Math.min(1, dt * 3)
    g.rotation.y += (pointer.current.x * 0.35 - g.rotation.y) * k
    g.rotation.x += (pointer.current.y * 0.2 - g.rotation.x) * k
  })

  return <group ref={ref}>{children}</group>
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

export default function HeroScene({ active, onReady }: SceneProps) {
  const [canDrag, setCanDrag] = useState(false)
  useEffect(() => {
    setCanDrag(window.matchMedia('(pointer: fine)').matches)
  }, [])

  return (
    <Canvas
      flat
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[-4, 6, 6]} intensity={2.2} />

      <PresentationControls
        enabled={canDrag}
        global={false}
        snap
        speed={1.4}
        polar={[-0.5, 0.5]}
        azimuth={[-0.9, 0.9]}
      >
        <Lean>
          <Shape position={[-1.25, 0.65, 0]} rotation={[0.5, 0.7, 0]} color={C.yellow} speed={1.2} make={() => new THREE.BoxGeometry(1.7, 1.7, 1.7)} />
          <Shape position={[1.45, 1.35, -0.6]} rotation={[0.15, 0.6, -0.2]} color={C.pink} speed={1.6} make={() => new THREE.ConeGeometry(1.1, 1.8, 4)} />
          <Shape position={[1.35, -1.15, 0.4]} rotation={[0.9, 0.3, 0]} color={C.cobalt} speed={1.3} make={() => new THREE.TorusGeometry(0.78, 0.32, 20, 56)} />
          <Shape position={[-1.7, -1.35, 0.8]} color={C.emerald} speed={1.8} make={() => new THREE.SphereGeometry(0.66, 40, 40)} />
          <Shape position={[0.25, 2.25, -1.4]} rotation={[0.6, 0, 0.5]} color={C.coral} speed={1.5} make={() => new THREE.CylinderGeometry(0.45, 0.45, 1.2, 36)} />
          <Shape position={[-0.1, -2.15, -0.8]} rotation={[0.3, 0.4, 0]} color={C.violet} speed={1.7} make={() => new THREE.OctahedronGeometry(0.72)} />
        </Lean>
      </PresentationControls>

      <ContactShadows
        position={[0, -3.1, 0]}
        scale={12}
        far={6}
        blur={0.6}
        opacity={0.75}
        resolution={512}
        color={C.ink}
      />
      <FirstFrame onReady={onReady} />
    </Canvas>
  )
}
