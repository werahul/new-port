'use client'

/**
 * ClickSpark — adapted from ReactBits (reactbits.dev/animations/click-spark).
 *
 * Every click throws a ring of short, thick spark strokes from the pointer.
 * One fixed, pointer-transparent canvas for the whole site; it only runs a
 * frame loop while sparks are alive. Off entirely under reduced motion.
 */
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'

interface Spark {
  x: number
  y: number
  angle: number
  start: number
}

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
}

export function ClickSpark({
  sparkColor = '#FF63A8',
  sparkSize = 14,
  sparkRadius = 26,
  sparkCount = 8,
  duration = 420,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || prefersReducedMotion()) return

    let sparks: Spark[] = []
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ease = (t: number) => t * (2 - t)

    const frame = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      sparks = sparks.filter((s) => {
        const elapsed = now - s.start
        if (elapsed >= duration) return false
        const p = ease(elapsed / duration)
        const dist = p * sparkRadius
        const len = sparkSize * (1 - p)
        const x1 = s.x + dist * Math.cos(s.angle)
        const y1 = s.y + dist * Math.sin(s.angle)
        const x2 = s.x + (dist + len) * Math.cos(s.angle)
        const y2 = s.y + (dist + len) * Math.sin(s.angle)
        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 3.5
        ctx.lineCap = 'square'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        return true
      })
      raf = sparks.length ? requestAnimationFrame(frame) : 0
    }

    const onClick = (e: MouseEvent) => {
      // keyboard-activated clicks report 0,0 — nothing to burst from
      if (e.detail === 0) return
      const now = performance.now()
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          start: now,
        })
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('click', onClick)
    }
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] h-full w-full"
    />
  )
}
