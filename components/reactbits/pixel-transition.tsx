'use client'

/**
 * PixelTransition — adapted from ReactBits (reactbits.dev/animations/pixel-transition).
 *
 * A grid of square "pixels" floods in at random, the content underneath swaps,
 * and the pixels clear again. Triggered by hover or keyboard focus on the
 * nearest `[data-pixel-host]` ancestor (the whole card), not just the image.
 * Under reduced motion it swaps instantly.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { loadGsap } from '@/lib/animation/gsap'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'

interface PixelTransitionProps {
  first: ReactNode
  second: ReactNode
  gridSize?: number
  /** css colour of the pixels */
  pixelColor?: string
  /** seconds for the full flood */
  duration?: number
  className?: string
}

export function PixelTransition({
  first,
  second,
  gridSize = 9,
  pixelColor = 'rgb(var(--ink))',
  duration = 0.32,
  className,
}: PixelTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pixelsRef = useRef<HTMLDivElement>(null)
  const [showSecond, setShowSecond] = useState(false)
  const target = useRef(false)

  const cells = useMemo(() => Array.from({ length: gridSize * gridSize }, (_, i) => i), [gridSize])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const host = (root.closest('[data-pixel-host]') as HTMLElement | null) ?? root
    let disposed = false

    const run = async (to: boolean) => {
      target.current = to
      if (prefersReducedMotion()) {
        setShowSecond(to)
        return
      }
      const { gsap } = await loadGsap()
      if (disposed || target.current !== to) return
      const pixels = pixelsRef.current?.children
      if (!pixels) return
      gsap.killTweensOf(pixels)
      gsap.set(pixels, { autoAlpha: 0 })
      const step = duration / pixels.length
      gsap.to(pixels, {
        autoAlpha: 1,
        duration: 0,
        stagger: { each: step, from: 'random' },
      })
      gsap.delayedCall(duration, () => {
        if (disposed || target.current !== to) return
        setShowSecond(to)
        gsap.to(pixels, {
          autoAlpha: 0,
          duration: 0,
          stagger: { each: step, from: 'random' },
        })
      })
    }

    const on = () => run(true)
    const off = () => run(false)
    const onFocusOut = (e: FocusEvent) => {
      if (!host.contains(e.relatedTarget as Node)) off()
    }
    const fine = window.matchMedia('(hover: hover)').matches
    if (fine) {
      host.addEventListener('pointerenter', on)
      host.addEventListener('pointerleave', off)
    }
    host.addEventListener('focusin', on)
    host.addEventListener('focusout', onFocusOut)
    return () => {
      disposed = true
      host.removeEventListener('pointerenter', on)
      host.removeEventListener('pointerleave', off)
      host.removeEventListener('focusin', on)
      host.removeEventListener('focusout', onFocusOut)
    }
  }, [duration])

  return (
    <div ref={rootRef} className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0" aria-hidden={showSecond}>
        {first}
      </div>
      <div
        className={cn('absolute inset-0', showSecond ? 'visible' : 'invisible')}
        aria-hidden={!showSecond}
      >
        {second}
      </div>
      <div
        ref={pixelsRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {cells.map((i) => (
          <span key={i} className="invisible -m-px" style={{ background: pixelColor }} />
        ))}
      </div>
    </div>
  )
}
