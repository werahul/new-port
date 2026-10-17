'use client'

/**
 * An in-page link that glides (through Lenis) instead of jumping — a jump
 * through the 3D journey would teleport the camera. Still a real anchor:
 * modified clicks and no-JS behave as links always do.
 */
import { scrollToId } from '@/components/ui/smooth-scroll'

export function ScrollLink({
  to,
  className,
  children,
  ...rest
}: { to: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        scrollToId(to)
        history.replaceState(null, '', `#${to}`)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
