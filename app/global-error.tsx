'use client'

import { useEffect } from 'react'
import './globals.css'

/**
 * The last boundary: this one replaces the root layout, so it renders its own
 * document and imports the stylesheet itself. Deliberately dependency-free —
 * whatever failed badly enough to get here may well be a component.
 *
 * The inline `style` is not belt-and-braces for its own sake: if the failure
 * happened before the stylesheet resolved, tokens would not be available, and a
 * white page is the one thing a dark-only site must never show.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          background: 'rgb(14 15 19)',
          color: 'rgb(240 241 245)',
          fontFamily: 'system-ui, sans-serif',
          colorScheme: 'dark',
        }}
      >
        <div style={{ maxWidth: '46ch', padding: '0 1.25rem', margin: '0 auto' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.6875rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgb(149 108 255)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            Error
          </p>
          <h1
            style={{
              margin: '1.5rem 0 0',
              fontSize: 'clamp(2rem, 1rem + 3vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontWeight: 500,
            }}
          >
            The page could not start.
          </h1>
          <p
            style={{
              margin: '1.5rem 0 0',
              lineHeight: 1.65,
              color: 'rgb(154 159 172)',
            }}
          >
            Something failed before the site could render. Reloading usually
            clears it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2.5rem',
              border: 0,
              cursor: 'pointer',
              borderRadius: 999,
              padding: '0.875rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'rgb(240 241 245)',
              color: 'rgb(14 15 19)',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
