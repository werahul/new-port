'use client'

/**
 * CountUp — adapted from ReactBits (reactbits.dev/text-animations/count-up).
 *
 * Springs a number up from zero the first time it enters the viewport. Accepts
 * display strings like "20+", "~40%" or "98" and only animates the numeric
 * part, so the copy in `content/` never has to change shape.
 *
 * The spring is integrated here rather than through an animation library: it
 * is the only animated value on the page, and a dependency for it would ship
 * a whole motion runtime to animate one number.
 */
import { useEffect, useMemo, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'

interface CountUpProps {
  value: string
  className?: string
  /** spring duration, seconds */
  duration?: number
}

function parse(value: string) {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return null
  return { prefix: m[1], number: Number(m[2]), suffix: m[3], decimals: m[2].split('.')[1]?.length ?? 0 }
}

export function CountUp({ value, className, duration = 1.6 }: CountUpProps) {
  const parsed = useMemo(() => parse(value), [value])
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!parsed || !el || prefersReducedMotion()) return
    const target = parsed.number
    const show = (v: number) => {
      el.textContent = v.toFixed(parsed.decimals)
    }
    // Start from zero once we know motion is allowed; until then the real figure shows.
    show(0)

    // a damped spring: x'' = -k(x - target) - c·x'
    const k = 100 / duration
    const c = 20 + 40 / duration
    // small figures settle to a finer tolerance, or they would stop visibly short
    const fine = target < 5
    const restDelta = fine ? 0.005 : 0.5
    const restSpeed = fine ? 0.01 : 2

    let raf = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        let x = 0
        let v = 0
        let last = performance.now()
        const step = (now: number) => {
          // fixed sub-steps keep the spring stable through a slow frame
          let dt = Math.min(0.064, (now - last) / 1000)
          last = now
          while (dt > 0) {
            const h = Math.min(dt, 1 / 120)
            v += (-k * (x - target) - c * v) * h
            x += v * h
            dt -= h
          }
          if (Math.abs(target - x) < restDelta && Math.abs(v) < restSpeed) return show(target)
          show(x)
          raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      show(target)
    }
  }, [parsed, duration])

  if (!parsed) return <span className={className}>{value}</span>

  return (
    <span className={className} aria-label={value}>
      <span aria-hidden>
        {parsed.prefix}
        {/* SSR and reduced motion show the real figure; the spring overwrites it */}
        <span ref={ref}>{parsed.number.toFixed(parsed.decimals)}</span>
        {parsed.suffix}
      </span>
    </span>
  )
}
