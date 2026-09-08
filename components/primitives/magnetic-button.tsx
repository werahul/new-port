'use client'

import { useCallback, useRef } from 'react'
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
  primary:
    'btn-solid rounded-full px-7 py-3.5 text-sm font-medium tracking-tight',
  line: 'rounded-full border border-line-strong px-7 py-3.5 text-sm font-medium tracking-tight text-foreground hover:border-accent/60 hover:bg-accent/[0.07] hover:glow-accent-sm',
  ghost:
    'px-1 py-1 text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground',
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
 * Pointer-following button with a restrained magnetic pull. Effect is disabled
 * for coarse pointers and reduced-motion users; the element still works as a
 * plain link/button in every case.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = 'button',
  target,
  rel,
  variant = 'primary',
  strength = 0.32,
  withArrow = false,
  disabled = false,
  className,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null)

  const canMagnetise = useCallback(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }, [])

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el || !canMagnetise()) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
  }

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {withArrow && (
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </span>
    </>
  )

  const shared = cn(
    'group relative inline-flex items-center justify-center gap-2 outline-none',
    'transition-[transform,color,background-color,border-color,box-shadow] duration-300 ease-editorial',
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
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
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
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      aria-label={ariaLabel}
      className={shared}
    >
      {content}
    </button>
  )
}
