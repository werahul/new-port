'use client'

/**
 * CountUp — adapted from ReactBits (reactbits.dev/text-animations/count-up).
 *
 * Springs a number up from zero the first time it enters the viewport. Accepts
 * display strings like "20+", "~40%" or "98" and only animates the numeric
 * part, so the copy in `content/` never has to change shape.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

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
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  })

  // Start from zero once we know motion is allowed; until then the real figure shows.
  useEffect(() => {
    if (parsed && !reduce && ref.current && !inView) ref.current.textContent = (0).toFixed(parsed.decimals)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, reduce])

  useEffect(() => {
    if (inView && parsed && !reduce) motionValue.set(parsed.number)
  }, [inView, parsed, motionValue, reduce])

  useEffect(() => {
    if (!parsed) return
    return spring.on('change', (latest) => {
      if (ref.current) ref.current.textContent = latest.toFixed(parsed.decimals)
    })
  }, [spring, parsed])

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
