import { cn } from '@/lib/utils'

/**
 * The flat poster version of the 3D scenes — shown before the canvas has drawn,
 * when WebGL is unavailable, and under reduced motion. Same shapes, same
 * colours, hard offset shadows in place of lighting.
 */
export function ShapesFallback({
  variant = 'hero',
  className,
}: {
  variant?: 'hero' | 'contact'
  className?: string
}) {
  const ink = 'rgb(var(--ink))'
  const sw = 5

  if (variant === 'contact') {
    return (
      <svg viewBox="0 0 400 400" aria-hidden className={cn('h-full w-full', className)}>
        <g transform="translate(10 10)">
          <circle cx="200" cy="200" r="120" fill={ink} />
          <circle cx="200" cy="200" r="52" fill={ink} />
        </g>
        <circle cx="200" cy="200" r="120" fill="rgb(var(--pink))" stroke={ink} strokeWidth={sw} />
        <circle cx="200" cy="200" r="52" fill="rgb(var(--yellow))" stroke={ink} strokeWidth={sw} />
        <rect x="300" y="70" width="44" height="44" fill="rgb(var(--cyan))" stroke={ink} strokeWidth={sw} transform="rotate(18 322 92)" />
        <rect x="56" y="290" width="40" height="40" fill="rgb(var(--emerald))" stroke={ink} strokeWidth={sw} transform="rotate(-14 76 310)" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 500 500" aria-hidden className={cn('h-full w-full', className)}>
      {/* shadows */}
      <g fill={ink} transform="translate(10 10)">
        <rect x="90" y="120" width="170" height="170" transform="rotate(-12 175 205)" />
        <polygon points="370,50 450,210 290,210" />
        <circle cx="360" cy="340" r="78" />
        <circle cx="120" cy="390" r="56" />
      </g>
      <rect x="90" y="120" width="170" height="170" fill="rgb(var(--yellow))" stroke={ink} strokeWidth={sw} transform="rotate(-12 175 205)" />
      <polygon points="370,50 450,210 290,210" fill="rgb(var(--pink))" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="360" cy="340" r="78" fill="rgb(var(--cobalt))" stroke={ink} strokeWidth={sw} />
      <circle cx="360" cy="340" r="30" fill="rgb(var(--cream))" stroke={ink} strokeWidth={sw} />
      <circle cx="120" cy="390" r="56" fill="rgb(var(--emerald))" stroke={ink} strokeWidth={sw} />
      <polygon points="240,400 280,450 240,500 200,450" fill="rgb(var(--violet))" stroke={ink} strokeWidth={sw} transform="translate(0 -40)" />
    </svg>
  )
}
