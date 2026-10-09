'use client'

/**
 * ScrollVelocity — adapted from ReactBits (reactbits.dev/text-animations/scroll-velocity).
 *
 * An endless marquee whose speed and direction follow the page's scroll
 * velocity. Scrolling down pushes it forward, scrolling up throws it back.
 * Under reduced motion it renders as a still band.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react'
import { cn } from '@/lib/utils'

interface VelocityRowProps {
  children: ReactNode
  /** px per second at rest; sign sets the resting direction */
  baseVelocity?: number
  /** how many copies to lay end to end — enough to overfill the widest screen */
  copies?: number
  className?: string
  itemClassName?: string
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.offsetWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}

export function VelocityRow({
  children,
  baseVelocity = 60,
  copies = 6,
  className,
  itemClassName,
}: VelocityRowProps) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  })

  const copyRef = useRef<HTMLSpanElement>(null)
  const copyWidth = useElementWidth(copyRef)

  const x = useTransform(baseX, (v) =>
    copyWidth === 0 ? '0px' : `${wrap(-copyWidth, 0, v)}px`,
  )

  const direction = useRef(baseVelocity < 0 ? -1 : 1)
  useAnimationFrame((_, delta) => {
    if (reduce) return
    let moveBy = direction.current * Math.abs(baseVelocity) * (delta / 1000)
    const vf = velocityFactor.get()
    if (vf < 0) direction.current = baseVelocity < 0 ? 1 : -1
    else if (vf > 0) direction.current = baseVelocity < 0 ? -1 : 1
    moveBy += direction.current * moveBy * vf
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div className="flex w-max flex-nowrap whitespace-nowrap" style={{ x }}>
        {Array.from({ length: copies }, (_, i) => (
          <span
            key={i}
            ref={i === 0 ? copyRef : undefined}
            aria-hidden={i > 0 ? true : undefined}
            className={cn('flex shrink-0 items-center', itemClassName)}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
