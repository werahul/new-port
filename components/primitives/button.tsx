import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AccentName } from './section'

interface BaseProps {
  /** solid accent fill (default) or a card-coloured ghost */
  variant?: 'solid' | 'ghost'
  accent?: AccentName
  withArrow?: boolean
  className?: string
  children: React.ReactNode
}

type AsLink = BaseProps & {
  href: string
  'aria-label'?: string
}

type AsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined
  }

/** Off-site, mail/phone, or the /resume redirect (which lands on Drive). */
const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href) || href === '/resume'

/**
 * The brutal button: ink border, flat fill, hard shadow, presses flat on click.
 * Renders a Next <Link> for internal paths, an <a> for external ones (web links
 * open in a new tab), and a <button> otherwise.
 */
export function Button(props: AsLink | AsButton) {
  const { variant = 'solid', accent, withArrow, className, children } = props
  const classes = cn('b-btn', variant === 'ghost' && 'b-btn-ghost', className)
  const content = (
    <>
      {children}
      {withArrow && <ArrowUpRight aria-hidden className="h-4 w-4" strokeWidth={3} />}
    </>
  )

  if (props.href !== undefined) {
    const { href } = props
    if (!isExternal(href)) {
      return (
        <Link href={href} data-accent={accent} className={classes} aria-label={props['aria-label']}>
          {content}
        </Link>
      )
    }
    const newTab = /^https?:/.test(href) || href === '/resume'
    return (
      <a
        href={href}
        data-accent={accent}
        className={classes}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        aria-label={props['aria-label']}
      >
        {content}
      </a>
    )
  }

  const {
    variant: _variant,
    accent: _accent,
    withArrow: _withArrow,
    className: _className,
    children: _children,
    href: _href,
    ...rest
  } = props
  return (
    <button data-accent={accent} className={classes} {...rest}>
      {content}
    </button>
  )
}
