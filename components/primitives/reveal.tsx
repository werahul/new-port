'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements
  /** translateY offset in px before reveal */
  y?: number
  /** ms delay */
  delay?: number
  /** viewport threshold */
  amount?: number
  once?: boolean
}

/**
 * Lightweight IntersectionObserver reveal — one shared enter animation for the
 * whole site. Respects prefers-reduced-motion, reveals content that is already
 * on screen at mount, and can never leave content permanently hidden (fail-safe
 * timer). Replaces the scattered `motion.div initial/whileInView` blocks.
 */
export function Reveal({
  as: Tag = 'div',
  y = 20,
  delay = 0,
  amount = 0.18,
  once = true,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    // Already in view at mount → reveal straight away.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true)
      if (once) return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setShown(false)
          }
        })
      },
      { threshold: amount, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)

    // Fail-safe: content must never stay invisible.
    const failSafe = window.setTimeout(() => setShown(true), 1600)

    return () => {
      observer.disconnect()
      window.clearTimeout(failSafe)
    }
  }, [amount, once])

  const Component = Tag as React.ElementType

  return (
    <Component
      ref={ref}
      data-shown={shown}
      className={cn(
        'transition-[opacity,transform] duration-[900ms] ease-editorial motion-reduce:transition-none',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0',
        className,
      )}
      style={{
        transitionDelay: shown ? `${delay}ms` : '0ms',
        transform: shown ? undefined : `translateY(${y}px)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
