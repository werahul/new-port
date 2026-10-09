'use client'

/**
 * FallingText — adapted from ReactBits (reactbits.dev/text-animations/falling-text).
 *
 * Words laid out as stickers; once the block scrolls into view gravity switches
 * on and they tumble into a pile. With a fine pointer they can be grabbed and
 * thrown. Touch devices get the fall but no grabbing, so the block never traps
 * a finger that is trying to scroll the page. Reduced motion keeps the tidy
 * layout and never starts the physics.
 */
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'
import { cn } from '@/lib/utils'

export interface FallingWord {
  text: string
  accent?: string
}

interface FallingTextProps {
  words: FallingWord[]
  className?: string
  gravity?: number
}

export function FallingText({ words, className, gravity = 1.1 }: FallingTextProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [started, setStarted] = useState(false)

  // Start when a good part of the block is visible.
  useEffect(() => {
    const box = boxRef.current
    if (!box || prefersReducedMotion()) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.55 },
    )
    io.observe(box)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!active) return
    const box = boxRef.current
    if (!box) return
    let disposed = false
    let cleanup = () => {}

    import('matter-js').then((mod) => {
      if (disposed) return
      const Matter = mod.default ?? mod
      const { Engine, Runner, Bodies, World, Mouse, MouseConstraint, Body } = Matter

      const rect = box.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      const engine = Engine.create()
      engine.gravity.y = gravity

      const wallOpts = { isStatic: true }
      const T = 60
      World.add(engine.world, [
        Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, wallOpts),
        Bodies.rectangle(-T / 2, H / 2, T, H * 3, wallOpts),
        Bodies.rectangle(W + T / 2, H / 2, T, H * 3, wallOpts),
      ])

      // Measure every word before moving any of them — taking one out of the
      // flow would reflow the rest.
      const els = Array.from(box.querySelectorAll<HTMLElement>('[data-word]'))
      const rects = els.map((el) => el.getBoundingClientRect())
      const bodies = els.map((el, i) => {
        const r = rects[i]
        const x = r.left - rect.left + r.width / 2
        const y = r.top - rect.top + r.height / 2
        const body = Bodies.rectangle(x, y, r.width, r.height, {
          restitution: 0.35,
          friction: 0.4,
          frictionAir: 0.012,
          chamfer: { radius: 2 },
        })
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: 0 })
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12)
        return { el, body, w: r.width, h: r.height }
      })
      for (const { el, w } of bodies) {
        el.style.position = 'absolute'
        el.style.left = '0'
        el.style.top = '0'
        el.style.width = `${w}px`
      }
      World.add(
        engine.world,
        bodies.map((b) => b.body),
      )
      setStarted(true)

      let mouseConstraint: Matter.MouseConstraint | null = null
      if (window.matchMedia('(pointer: fine)').matches) {
        const mouse = Mouse.create(box)
        // Matter swallows wheel events by default — give the page its scroll back.
        const m = mouse as unknown as Record<string, EventListener>
        box.removeEventListener('wheel', m.mousewheel)
        box.removeEventListener('mousewheel', m.mousewheel)
        box.removeEventListener('DOMMouseScroll', m.mousewheel)
        mouseConstraint = MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.2, render: { visible: false } },
        })
        World.add(engine.world, mouseConstraint)
      }

      const runner = Runner.create()
      Runner.run(runner, engine)

      let raf = 0
      const draw = () => {
        for (const { el, body, w, h } of bodies) {
          el.style.transform = `translate(${body.position.x - w / 2}px, ${
            body.position.y - h / 2
          }px) rotate(${body.angle}rad)`
        }
        raf = requestAnimationFrame(draw)
      }
      draw()

      // Re-settle after a resize instead of leaving words outside the walls.
      const onResize = () => {
        for (const { body } of bodies) {
          if (body.position.x > box.clientWidth) {
            Body.setPosition(body, { x: box.clientWidth / 2, y: 0 })
          }
        }
      }
      window.addEventListener('resize', onResize)

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        Runner.stop(runner)
        if (mouseConstraint) World.remove(engine.world, mouseConstraint)
        World.clear(engine.world, false)
        Engine.clear(engine)
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [active, gravity])

  return (
    <div
      ref={boxRef}
      className={cn(
        'relative overflow-hidden',
        started && 'cursor-grab active:cursor-grabbing',
        className,
      )}
    >
      <div className="flex flex-wrap content-start items-start gap-2.5 p-4 sm:p-5">
        {words.map((w) => (
          <span
            key={w.text}
            data-word
            data-accent={w.accent}
            className="sticker select-none whitespace-nowrap !text-sm will-change-transform sm:!text-base"
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  )
}
