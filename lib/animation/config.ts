/**
 * Shared vocabulary for the scroll animation system. Every timeline, reveal and
 * ScrollTrigger pulls its easing, duration and stagger from here so the whole
 * site moves with one hand.
 */

/** Easings — string references so no CustomEase registration is needed. */
export const EASE = {
  /** primary entrance — decisive, editorial settle */
  out: 'power3.out',
  /** heavier settle for large type / hero-scale elements */
  expo: 'expo.out',
  /** symmetric — scrubbed parallax reversals, pinned camera moves */
  inOut: 'power2.inOut',
  /** linear — anything tied directly to scroll progress */
  none: 'none',
  /** tiny overshoot — chips, counters, small affordances only */
  pop: 'back.out(1.6)',
} as const

/** Durations in seconds. Entrances are fast; storytelling beats are longer. */
export const DUR = {
  xs: 0.4,
  sm: 0.55,
  md: 0.8,
  lg: 1.1,
  /** cinematic project / section transition */
  cinematic: 0.7,
} as const

/** Stagger steps in seconds. */
export const STAGGER = {
  tight: 0.05,
  base: 0.08,
  loose: 0.13,
} as const

/** Media queries used with gsap.matchMedia across every primitive. */
export const MQ = {
  reduce: '(prefers-reduced-motion: reduce)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  /** anything that is not a phone — where heavier sequences are allowed */
  gteTablet: '(min-width: 768px)',
  finePointer: '(pointer: fine)',
} as const

/** Default ScrollTrigger positions — one start line for the whole site. */
export const ST = {
  /** element enters — reveals */
  revealStart: 'top 82%',
  /** element enters — larger blocks that need more runway */
  blockStart: 'top 88%',
  /** scrubbed range for parallax layers */
  parallax: { start: 'top bottom', end: 'bottom top' } as const,
} as const

/** Distance (px) a subtle parallax layer travels across its full scrub range. */
export const PARALLAX_TRAVEL = {
  subtle: 40,
  base: 80,
  deep: 140,
} as const
