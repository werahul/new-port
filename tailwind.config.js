/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '2rem',
        lg: '3rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
      },
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--accent) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        /* The active section's hue. `data-accent` on a section re-points it,
           so one attribute re-tints every rule, bullet and glow inside. */
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
          strong: 'rgb(var(--accent) / <alpha-value>)',
        },
        /* Neutral foundation */
        surface: {
          DEFAULT: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong: 'rgb(var(--line-strong) / <alpha-value>)',
        },
        faint: 'rgb(var(--fg-faint) / <alpha-value>)',
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        /* Legacy surface aliases — still resolve, now to the new foundation */
        paper: 'rgb(var(--paper) / <alpha-value>)',
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        graphite: 'rgb(var(--graphite) / <alpha-value>)',
        /* The accent family. Reach for these only when a specific hue is
           meant regardless of section; otherwise use `accent`. */
        violet: 'rgb(var(--violet) / <alpha-value>)',
        cobalt: 'rgb(var(--cobalt) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        emerald: 'rgb(var(--emerald) / <alpha-value>)',
        coral: 'rgb(var(--coral) / <alpha-value>)',
        pink: 'rgb(var(--pink) / <alpha-value>)',
      },
      maxWidth: {
        content: '1280px',
        prose: '68ch',
        measure: '46ch',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 6px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
        '3xl': 'calc(var(--radius) + 20px)',
      },
      letterSpacing: {
        tightest: '-0.045em',
        tighter: '-0.032em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-down': 'fadeInDown 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        /* Cinematic depth: long, soft, and genuinely dark rather than a grey haze */
        soft: '0 1px 2px rgb(0 0 0 / 0.25), 0 12px 32px -20px rgb(0 0 0 / 0.6)',
        raised: '0 2px 8px rgb(0 0 0 / 0.3), 0 32px 70px -30px rgb(0 0 0 / 0.75)',
        edge: '0 1px 0 0 rgb(var(--fg) / 0.06) inset',
      },
    },
  },
  plugins: [],
}
