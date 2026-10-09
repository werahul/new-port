/** @type {import('tailwindcss').Config} */

/** Every colour is an `r g b` triple in globals.css, so `/opacity` works everywhere. */
const rgb = (v) => `rgb(var(--${v}) / <alpha-value>)`

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        /* fixed palette */
        ink: rgb('ink'),
        cream: rgb('cream'),
        paper: rgb('paper'),
        night: rgb('night'),
        yellow: rgb('yellow'),
        pink: rgb('pink'),
        violet: rgb('violet'),
        cobalt: rgb('cobalt'),
        cyan: rgb('cyan'),
        emerald: rgb('emerald'),
        coral: rgb('coral'),
        /* tone-driven — re-pointed by `data-tone` on a section */
        bg: rgb('bg'),
        fg: rgb('fg'),
        card: rgb('card'),
        edge: rgb('edge'),
        muted: rgb('muted'),
        /* the element's own hue — re-pointed by `data-accent` */
        accent: rgb('accent'),
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'b-sm': '3px 3px 0 0 rgb(var(--shadow-c))',
        b: '6px 6px 0 0 rgb(var(--shadow-c))',
        'b-lg': '10px 10px 0 0 rgb(var(--shadow-c))',
        'b-xl': '14px 14px 0 0 rgb(var(--shadow-c))',
      },
      maxWidth: {
        content: '1320px',
        prose: '65ch',
      },
      letterSpacing: {
        crush: '-0.05em',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(0.2, 0.9, 0.1, 1)',
      },
      keyframes: {
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        wobble: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 14s linear infinite',
        wobble: 'wobble 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
