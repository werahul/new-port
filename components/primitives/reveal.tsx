'use client'

import { motion, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** seconds */
  delay?: number
  /** start rotated by this many degrees and snap straight — the sticker slap */
  tilt?: number
  as?: 'div' | 'li' | 'article' | 'figure'
}

/**
 * Snappy scroll entrance: a short rise on a stiff spring. The content is always
 * in the DOM; under reduced motion it simply appears.
 */
export function Reveal({ children, className, delay = 0, tilt = 0, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 36, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ type: 'spring', stiffness: 380, damping: 26, delay }}
    >
      {children}
    </Component>
  )
}
