'use client'

/**
 * Squares — adapted from ReactBits (reactbits.dev/backgrounds/squares).
 *
 * A canvas grid that drifts diagonally; the cell under the cursor fills solid.
 * Pauses when off-screen and stays still under reduced motion.
 */
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'

interface SquaresProps {
  /** px per frame */
  speed?: number
  squareSize?: number
  direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right'
  borderColor?: string
  hoverFillColor?: string
  className?: string
}

export function Squares({
  speed = 0.35,
  squareSize = 56,
  direction = 'diagonal',
  borderColor = 'rgba(255,244,224,0.12)',
  hoverFillColor = 'rgba(255,214,10,0.9)',
  className,
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    const offset = { x: 0, y: 0 }
    let hover: { x: number; y: number } | null = null
    let raf = 0
    let visible = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      const sx = Math.floor(offset.x / squareSize) * squareSize
      const sy = Math.floor(offset.y / squareSize) * squareSize
      ctx.lineWidth = 1.5
      for (let x = sx; x < w + squareSize; x += squareSize) {
        for (let y = sy; y < h + squareSize; y += squareSize) {
          const px = x - (offset.x % squareSize)
          const py = y - (offset.y % squareSize)
          if (
            hover &&
            Math.floor((x - sx) / squareSize) === hover.x &&
            Math.floor((y - sy) / squareSize) === hover.y
          ) {
            ctx.fillStyle = hoverFillColor
            ctx.fillRect(px, py, squareSize, squareSize)
          }
          ctx.strokeStyle = borderColor
          ctx.strokeRect(px, py, squareSize, squareSize)
        }
      }
    }

    const tick = () => {
      const s = Math.max(speed, 0.1)
      switch (direction) {
        case 'right':
          offset.x = (offset.x - s + squareSize) % squareSize
          break
        case 'left':
          offset.x = (offset.x + s + squareSize) % squareSize
          break
        case 'up':
          offset.y = (offset.y + s + squareSize) % squareSize
          break
        case 'down':
          offset.y = (offset.y - s + squareSize) % squareSize
          break
        default:
          offset.x = (offset.x - s + squareSize) % squareSize
          offset.y = (offset.y - s + squareSize) % squareSize
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (still || raf) return
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    // The canvas sits behind content, so track the pointer on the section.
    const host = canvas.parentElement ?? canvas
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left
      const my = e.clientY - r.top
      // offsets stay inside one cell, so cell i spans [i*size - offset, (i+1)*size - offset)
      hover = {
        x: Math.floor((mx + offset.x) / squareSize),
        y: Math.floor((my + offset.y) / squareSize),
      }
      if (still) draw()
    }
    const onLeave = () => {
      hover = null
      if (still) draw()
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(canvas)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    if (window.matchMedia('(hover: hover)').matches) {
      host.addEventListener('pointermove', onMove)
      host.addEventListener('pointerleave', onLeave)
    }

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [speed, squareSize, direction, borderColor, hoverFillColor])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}
