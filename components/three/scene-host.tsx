'use client'

/**
 * Mounts a 3D scene only when it is worth it.
 *
 *  - The scene's chunk (three + R3F + drei) is fetched the first time the host
 *    nears the viewport, never on the server and never up front.
 *  - The render loop stops whenever the host scrolls out of view.
 *  - The flat SVG version shows until the canvas has actually drawn a frame,
 *    and stays for good without WebGL or under reduced motion.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { hasWebGL } from '@/lib/three/capability'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'
import { ShapesFallback } from './shapes-fallback'
import type { SceneProps } from './hero-scene'

const scenes = {
  hero: dynamic<SceneProps>(() => import('./hero-scene'), { ssr: false }),
  contact: dynamic<SceneProps>(() => import('./contact-scene'), { ssr: false }),
}

interface SceneHostProps {
  scene: keyof typeof scenes
  className?: string
}

export function SceneHost({ scene, className }: SceneHostProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setEnabled(hasWebGL() && !prefersReducedMotion())
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting)
        if (e.isIntersecting) setNear(true)
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [enabled])

  const onReady = useCallback(() => setReady(true), [])
  const Scene = scenes[scene]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          ready ? 'opacity-0' : 'opacity-100',
        )}
      >
        <ShapesFallback variant={scene} />
      </div>
      {enabled && near && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            ready ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Scene active={visible} onReady={onReady} />
        </div>
      )}
    </div>
  )
}
