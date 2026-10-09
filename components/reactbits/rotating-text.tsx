'use client'

/**
 * RotatingText — adapted from ReactBits (reactbits.dev/text-animations/rotating-text).
 *
 * Cycles through a list of words; each change drops the old characters out and
 * springs the new ones up from below, one character at a time. The full list is
 * exposed to assistive tech once, rather than announced on every rotation.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface RotatingTextProps {
  texts: string[]
  /** ms each word stays on screen */
  interval?: number
  /** seconds between characters */
  stagger?: number
  className?: string
  /** the clipping box around the word — put the brutal fill/border here */
  boxClassName?: string
}

export function RotatingText({
  texts,
  interval = 2200,
  stagger = 0.025,
  className,
  boxClassName,
}: RotatingTextProps) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce || texts.length < 2) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % texts.length),
      interval,
    )
    return () => window.clearInterval(id)
  }, [reduce, texts.length, interval])

  const word = texts[index]

  return (
    <span className={cn('inline-flex', className)}>
      <span className="sr-only">{texts.join(', ')}</span>
      <motion.span
        aria-hidden
        layout={!reduce}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        // clip vertically (the letters drop in from below) but never sideways
        style={{ overflowX: 'visible', overflowY: 'clip' }}
        className={cn('relative inline-flex', boxClassName)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={word}
            className="inline-flex whitespace-pre"
            exit={{ transition: { staggerChildren: stagger / 2 } }}
          >
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-120%', opacity: 0 }}
                transition={{
                  type: 'spring',
                  damping: 26,
                  stiffness: 420,
                  delay: i * stagger,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  )
}
