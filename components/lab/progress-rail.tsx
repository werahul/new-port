'use client'

/**
 * A slim vertical rail on wide screens: which part of the world you're in,
 * and how far through it. The fill is written straight to the DOM on scroll;
 * React only re-renders when the section changes.
 */
import { useEffect, useRef } from 'react'
import { useCurrentStage } from './use-current-stage'

export function ProgressRail({ stages }: { stages: { id: string; label: string }[] }) {
  const current = useCurrentStage(stages)
  const fill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        if (fill.current) fill.current.style.transform = `scaleY(${p.toFixed(4)})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="l-rail" aria-hidden="true">
      <span className="l-rail-i">0{current + 1}</span>
      <span className="l-rail-track">
        <span ref={fill} className="l-rail-fill" />
      </span>
      <span className="l-rail-label">{stages[current].label}</span>
    </div>
  )
}
