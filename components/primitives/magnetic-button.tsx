'use client'

import { useCallback, useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'line' | 'ghost'

/**
 * Buttons stay deliberately colourless — an inverted neutral for primary, a
 * hairline for secondary. The accent only ever arrives as *light*: a soft bloom
 * under the button on hover. That is what keeps colour in the environment
 * instead of scattering it across every control.
 */
const variantMap: Record<Variant, string> = {
  primary: 'btn-solid rounded-full px-7 py-3.5 text-sm font-medium tracking-tight',
  line: 'rounded-full border border-line-strong px-7 py-3.5 text-sm font-medium tracking-tight text-foreground hover:border-accent/55 hover:bg-accent/[0.06] hover:glow-accent-sm',
  ghost:
    'px-1 py-1 text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground',
}

/**
 * One live media-query pair for the whole page, evaluated once.
 *
 * The previous implementation allocated two `window.matchMedia()` objects on
 * every single `mousemove` — thousands of throwaway objects during one pass
 * across a button, to answer a question whose answer almost never changes.
 */
let pointerFine: MediaQueryList | null = null
let motionOk: MediaQueryList | null = null
function canMagnetise() {
  if (typeof window === 'undefined') return false
  pointerFine ??= window.matchMedia('(pointer: fine)')
  motionOk ??= window.matchMedia('(prefers-reduced-motion: reduce)')
  return pointerFine.matches && !motionOk.matches
}

interface MagneticButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: (e: React.MouseEvent) => void
  type?: 'button' | 'submit'
  target?: string
  rel?: string
  variant?: Variant
  strength?: number
  withArrow?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * Pointer-following button with a restrained magnetic pull.
 *
 * The pull is smoothed in a rAF loop and written straight to `transform`. It
 * used to be written on every pointer event into an element that *also* carried
 * a 300ms CSS transition on `transform` — so the browser restarted an easing
 * curve on every mouse move and the pull felt like it was dragging behind the
 * cursor through treacle. `transform` is now off the transition list entirely
 * and the smoothing is explicit.
 *
 * The effect is disabled for coarse pointers and reduced-motion users; the
 * element still works as a plain link/button in every case.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = 'button',
  target,
  rel,
  variant = 'primary',
  strength = 0.28,
  withArrow = false,
  disabled = false,
  className,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null)
  const state = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0 })

  const stop = useCallback(() => {
    cancelAnimationFrame(state.current.raf)
    state.current.raf = 0
  }, [])

  useEffect(() => stop, [stop])

  const run = useCallback(() => {
    const s = state.current
    if (s.raf) return
    const step = () => {
      const el = ref.current
      if (!el) {
        s.raf = 0
        return
      }
      s.x += (s.tx - s.x) * 0.18
      s.y += (s.ty - s.y) * 0.18
      const settled =
        Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05
      if (settled) {
        s.x = s.tx
        s.y = s.ty
      }
      el.style.transform =
        s.x === 0 && s.y === 0 ? '' : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`
      // Idle at rest rather than burning a frame forever.
      if (settled && s.tx === 0 && s.ty === 0) {
        s.raf = 0
        return
      }
      s.raf = requestAnimationFrame(step)
    }
    s.raf = requestAnimationFrame(step)
  }, [])

  const handleMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse' || !canMagnetise()) return
    const rect = el.getBoundingClientRect()
    state.current.tx = (e.clientX - (rect.left + rect.width / 2)) * strength
    state.current.ty = (e.clientY - (rect.top + rect.height / 2)) * strength
    run()
  }

  const handleLeave = () => {
    state.current.tx = 0
    state.current.ty = 0
    run()
  }

  const content = (
    <span className="relative z-10 inline-flex items-center gap-2">
      {children}
      {withArrow && (
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </span>
  )

  const shared = cn(
    'group relative inline-flex items-center justify-center gap-2 outline-none will-change-transform',
    // `transform` is deliberately absent: it is driven per-frame above.
    'transition-[color,background-color,border-color,box-shadow] duration-300 ease-editorial',
    'hover:shadow-soft disabled:pointer-events-none disabled:opacity-50',
    variantMap[variant],
    className,
  )

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        onClick={onClick}
        aria-label={ariaLabel}
        className={shared}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
      onClick={onClick}
      aria-label={ariaLabel}
      className={shared}
    >
      {content}
    </button>
  )
}
