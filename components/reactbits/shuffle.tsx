'use client'

/**
 * Shuffle — adapted from ReactBits (reactbits.dev/text-animations/shuffle).
 *
 * Each character is a slot-machine reel: a strip of random glyphs that spins
 * down onto the real letter, left to right. It plays when the text scrolls into
 * view and again on hover.
 *
 * The server renders every reel already resting on its final letter, so the
 * heading is complete without JavaScript and for crawlers; the visible reels
 * are aria-hidden and the wrapper carries the real text as its label.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { loadGsap } from '@/lib/animation/gsap'
import { prefersReducedMotion, canHover } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=?!/<>'

interface ShuffleProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  className?: string
  /** random glyphs on each reel before it lands */
  reelLength?: number
  /** seconds per reel */
  duration?: number
  /** seconds between neighbouring reels */
  stagger?: number
  /** replay on pointer hover */
  replayOnHover?: boolean
  id?: string
}

/** Deterministic per-character pseudo-random glyphs, so SSR and client agree. */
function reelFor(char: string, seed: number, length: number) {
  const out: string[] = []
  let s = seed * 9301 + 49297
  for (let i = 0; i < length; i++) {
    s = (s * 9301 + 49297) % 233280
    out.push(GLYPHS[Math.floor((s / 233280) * GLYPHS.length)])
  }
  out.push(char)
  return out
}

export function Shuffle({
  text,
  as: Tag = 'span',
  className,
  reelLength = 6,
  duration = 0.55,
  stagger = 0.035,
  replayOnHover = true,
  id,
}: ShuffleProps) {
  const rootRef = useRef<HTMLElement>(null)
  const playing = useRef(false)

  const words = useMemo(() => {
    let n = 0
    return text.split(' ').map((word) =>
      word.split('').map((ch) => ({ ch, reel: reelFor(ch, n++, reelLength) })),
    )
  }, [text, reelLength])

  const play = useCallback(async () => {
    const root = rootRef.current
    if (!root || playing.current || prefersReducedMotion()) return
    playing.current = true
    const { gsap } = await loadGsap()
    const strips = root.querySelectorAll<HTMLElement>('[data-reel]')
    gsap.killTweensOf(strips)
    // The strip rests bottom-aligned (real glyph showing). Push it down so
    // the first random glyph shows, then let it run back up to rest.
    gsap.fromTo(
      strips,
      { yPercent: (100 * reelLength) / (reelLength + 1) },
      {
        yPercent: 0,
        duration,
        ease: 'power3.out',
        stagger,
        onComplete: () => {
          playing.current = false
        },
      },
    )
  }, [duration, reelLength, stagger])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [play])

  const onEnter = () => {
    if (replayOnHover && canHover()) play()
  }

  const Component = Tag as React.ElementType

  return (
    <Component
      ref={rootRef}
      id={id}
      aria-label={text}
      onPointerEnter={onEnter}
      className={cn(className)}
    >
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.map(({ ch, reel }, c) => (
            <span
              key={c}
              className="relative inline-block overflow-hidden align-top"
              style={{ height: '1em', lineHeight: 1 }}
            >
              {/* sizer — the reel's width is always the real glyph's width */}
              <span className="invisible">{ch}</span>
              <span
                data-reel
                className="absolute inset-x-0 bottom-0 flex flex-col"
              >
                {reel.map((g, i) => (
                  <span key={i} className="block text-center" style={{ height: '1em' }}>
                    {g}
                  </span>
                ))}
              </span>
            </span>
          ))}
          {w < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Component>
  )
}
