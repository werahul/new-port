'use client'

import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/animation/reduced-motion'

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode
  }

type VTDoc = { startViewTransition?: (cb: () => void) => unknown }

/**
 * A Next `<Link>` that routes through the View Transitions API when the browser
 * supports it and motion is allowed — giving a cinematic cross-fade between the
 * project index and a case study with zero layout cost. Everywhere else it is a
 * plain client navigation. Modified clicks (new tab, etc.) fall straight
 * through to the native link.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, Props>(
  function TransitionLink({ href, children, onClick, ...rest }, ref) {
    const router = useRouter()

    return (
      <Link
        ref={ref}
        href={href}
        onClick={(e) => {
          onClick?.(e)
          if (
            e.defaultPrevented ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
          ) {
            return
          }
          const doc = document as unknown as VTDoc
          if (typeof href !== 'string' || !doc.startViewTransition || prefersReducedMotion()) {
            return
          }
          e.preventDefault()
          doc.startViewTransition(() => {
            router.push(href)
          })
        }}
        {...rest}
      >
        {children}
      </Link>
    )
  },
)
