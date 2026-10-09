'use client'

/**
 * Cubes — adapted from ReactBits (reactbits.dev/animations/cubes).
 *
 * A grid of CSS 3D cubes that tilt toward the cursor in a ripple around it.
 * When nobody is pointing at it, a phantom cursor wanders the grid so the piece
 * still moves on touch screens. Static under reduced motion.
 */
import { useEffect, useRef } from 'react'
import { loadGsap } from '@/lib/animation/gsap'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'

interface CubesProps {
  gridSize?: number
  maxAngle?: number
  radius?: number
  /** colours for the top / front / side faces */
  faceColors?: [string, string, string]
  className?: string
}

const FACES = [
  { t: 'translateZ(calc(var(--s) / 2))', c: 0 }, // front
  { t: 'rotateY(180deg) translateZ(calc(var(--s) / 2))', c: 0 }, // back
  { t: 'rotateY(90deg) translateZ(calc(var(--s) / 2))', c: 2 }, // right
  { t: 'rotateY(-90deg) translateZ(calc(var(--s) / 2))', c: 2 }, // left
  { t: 'rotateX(90deg) translateZ(calc(var(--s) / 2))', c: 1 }, // top
  { t: 'rotateX(-90deg) translateZ(calc(var(--s) / 2))', c: 1 }, // bottom
]

export function Cubes({
  gridSize = 8,
  maxAngle = 55,
  radius = 2.6,
  faceColors = ['rgb(var(--paper))', 'rgb(var(--yellow))', 'rgb(var(--pink))'],
  className,
}: CubesProps) {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || prefersReducedMotion()) return
    let disposed = false
    let cleanup = () => {}

    loadGsap().then(({ gsap }) => {
      if (disposed) return
      const cubes = Array.from(scene.querySelectorAll<HTMLElement>('[data-cube]'))
      let userActive = false
      let idleTimer = 0
      let wanderRaf = 0
      const phantom = { x: gridSize / 2, y: gridSize / 2 }
      const heading = { x: 1, y: 0.6 }

      const tiltAt = (row: number, col: number) => {
        for (const cube of cubes) {
          const r = Number(cube.dataset.row)
          const c = Number(cube.dataset.col)
          const dist = Math.hypot(r - row, c - col)
          if (dist <= radius) {
            const pct = 1 - dist / radius
            const angle = pct * maxAngle
            gsap.to(cube, {
              rotateX: -angle,
              rotateY: angle,
              duration: 0.3,
              ease: 'power3.out',
              overwrite: true,
            })
          } else {
            gsap.to(cube, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: true,
            })
          }
        }
      }

      const wander = () => {
        if (userActive) return
        phantom.x += heading.x * 0.045
        phantom.y += heading.y * 0.045
        if (phantom.x < 0 || phantom.x > gridSize - 1) heading.x *= -1
        if (phantom.y < 0 || phantom.y > gridSize - 1) heading.y *= -1
        if (Math.random() < 0.01) {
          heading.x = Math.random() * 2 - 1
          heading.y = Math.random() * 2 - 1
        }
        tiltAt(phantom.y, phantom.x)
        wanderRaf = window.setTimeout(wander, 60)
      }

      const onMove = (e: PointerEvent) => {
        userActive = true
        window.clearTimeout(idleTimer)
        window.clearTimeout(wanderRaf)
        const rect = scene.getBoundingClientRect()
        const col = ((e.clientX - rect.left) / rect.width) * gridSize - 0.5
        const row = ((e.clientY - rect.top) / rect.height) * gridSize - 0.5
        tiltAt(row, col)
        idleTimer = window.setTimeout(() => {
          userActive = false
          phantom.x = Math.max(0, Math.min(gridSize - 1, col))
          phantom.y = Math.max(0, Math.min(gridSize - 1, row))
          wander()
        }, 2500)
      }

      let visible = false
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting
        window.clearTimeout(wanderRaf)
        if (visible && !userActive) wander()
      })
      io.observe(scene)

      scene.addEventListener('pointermove', onMove)
      cleanup = () => {
        io.disconnect()
        window.clearTimeout(idleTimer)
        window.clearTimeout(wanderRaf)
        scene.removeEventListener('pointermove', onMove)
        gsap.killTweensOf(cubes)
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [gridSize, maxAngle, radius])

  // The wrapper is the size container, so `cqw` inside resolves to its width
  // and every face can push itself out by exactly half a cube.
  return (
    <div aria-hidden className={cn('w-full', className)} style={{ containerType: 'inline-size' }}>
      <div
        ref={sceneRef}
        className="grid aspect-square w-full"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: '3cqw',
          perspective: '900px',
          ['--s' as string]: `calc((100cqw - ${gridSize - 1} * 3cqw) / ${gridSize})`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, i) => {
          const row = Math.floor(i / gridSize)
          const col = i % gridSize
          return (
            <div
              key={i}
              data-cube
              data-row={row}
              data-col={col}
              className="relative aspect-square"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {FACES.map((f, j) => (
                <span
                  key={j}
                  className="absolute inset-0 border-2 border-ink"
                  style={{ transform: f.t, background: faceColors[f.c] }}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
