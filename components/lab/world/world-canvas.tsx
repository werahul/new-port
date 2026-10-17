'use client'

/**
 * The single canvas. Loaded as its own chunk (three + R3F + drei) only after
 * the page has painted and the browser is idle — see world-host.tsx.
 *
 * One renderer, one render loop, no post-processing, no shadow maps. The
 * device tier decides pixel ratio, instance counts and material cost, and
 * PerformanceMonitor drops the pixel ratio further if frames start to slip.
 */
import type { SceneData } from '@/content/lab'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Architecture } from './architecture'
import { Core } from './core'
import { World } from './environment'
import { Field } from './field'
import { keyframes } from './keyframes'
import { Planets } from './planets'
import { Rig } from './rig'
import { Rings } from './rings'
import { Screens } from './screens'
import { CaseRig } from './case-rig'
import { Precompile } from './precompile'

export interface WorldCanvasProps {
  scene: SceneData
  lowTier: boolean
  finePointer: boolean
  onReady: () => void
  /**
   * A case study page: park the camera at this exhibit instead of running
   * the scroll journey. Omitted on the home page.
   */
  exhibit?: number
}

/** Report readiness only once a real frame has been drawn. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    // a couple of frames in, so the environment bake and textures are settled
    if (frames.current === 3) onReady()
  })
  return null
}

export default function WorldCanvas({ scene, lowTier, finePointer, onReady, exhibit }: WorldCanvasProps) {
  const maxDpr = lowTier ? 1.25 : 1.5
  const [dpr, setDpr] = useState(maxDpr)
  const [hidden, setHidden] = useState(false)
  const [resting, setResting] = useState(false)
  const journey = exhibit === undefined

  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // A case study is read, not travelled: once the hero has scrolled away the
  // scene stops animating and renders only when something asks it to (a
  // resize, say) — the long read costs the GPU nothing.
  useEffect(() => {
    if (journey) return
    const onScroll = () => setResting(window.scrollY > window.innerHeight * 1.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [journey])

  return (
    <Canvas
      dpr={dpr}
      frameloop={hidden ? 'never' : resting ? 'demand' : 'always'}
      camera={{ fov: 34, near: 0.1, far: 1200, position: [0, 1.85, 8.2] }}
      gl={{
        antialias: !lowTier,
        alpha: false,
        stencil: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1
      }}
      // the canvas never receives pointer input; the DOM owns interaction
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(maxDpr)}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      {exhibit === undefined ? <Rig parallax={finePointer} /> : <CaseRig exhibit={exhibit} parallax={finePointer} />}
      <World lowTier={lowTier} />
      <Core lowTier={lowTier} />
      <Field lowTier={lowTier} keepClear={exhibit === undefined ? undefined : keyframes[`project-${exhibit}`]} />
      {scene.architecture && <Architecture {...scene.architecture} />}
      <Screens screens={scene.screens} lowTier={lowTier} tiltWithPointer={finePointer} />
      {journey && (
        <>
          <Planets />
          <Rings lowTier={lowTier} />
        </>
      )}
      <Precompile />
      <FirstFrame onReady={onReady} />
    </Canvas>
  )
}
