import * as THREE from 'three'

/**
 * The scene reads its colours from the same CSS custom properties the rest of
 * the site uses, so the world and the interface are lit from one palette and
 * can never drift apart.
 */
const VARS = [
  '--violet',
  '--cobalt',
  '--cyan',
  '--emerald',
  '--coral',
  '--pink',
] as const

export type AccentKey = 'violet' | 'cobalt' | 'cyan' | 'emerald' | 'coral' | 'pink'

export interface Palette {
  accents: Record<AccentKey, THREE.Color>
  /** page background — also the fog colour, so geometry dissolves into the page */
  base: THREE.Color
  /** foreground, for neutral structure lines */
  fg: THREE.Color
}

function read(name: string, fallback: string): THREE.Color {
  if (typeof window === 'undefined') return new THREE.Color(fallback)
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  const parts = raw.split(/[\s,]+/).map(Number)
  if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
    return new THREE.Color().setStyle(`rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`)
  }
  return new THREE.Color().setStyle(fallback)
}

export function readPalette(): Palette {
  const accents = {} as Record<AccentKey, THREE.Color>
  for (const v of VARS) {
    accents[v.slice(2) as AccentKey] = read(v, '#8b5cf6')
  }
  return {
    accents,
    base: read('--base', '#0e0f13'),
    fg: read('--fg', '#f0f1f5'),
  }
}
