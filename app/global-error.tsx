'use client'

import { useEffect } from 'react'
import './globals.css'

/**
 * The last boundary: this one replaces the root layout, so it renders its own
 * document and imports the stylesheet itself. Deliberately dependency-free —
 * whatever failed badly enough to get here may well be a component.
 *
 * The inline `style` is not belt-and-braces for its own sake: if the failure
 * happened before the stylesheet resolved, tokens would not be available —
 * the colours are the palette's literal values.
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
          background: 'rgb(255 244 224)',
          color: 'rgb(10 10 10)',
          fontFamily: 'system-ui, sans-serif',
          colorScheme: 'light',
        }}
      >
        <div
          style={{
            maxWidth: '46ch',
            padding: '2rem',
            margin: '0 1rem',
            background: '#fff',
            border: '3px solid rgb(10 10 10)',
            boxShadow: '8px 8px 0 0 rgb(10 10 10)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.6875rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgb(10 10 10)',
              background: 'rgb(255 214 10)',
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              border: '2px solid rgb(10 10 10)',
              fontWeight: 700,
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
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            The page could not start.
          </h1>
          <p
            style={{
              margin: '1.5rem 0 0',
              lineHeight: 1.65,
              color: 'rgb(70 66 60)',
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
              border: '3px solid rgb(10 10 10)',
              boxShadow: '4px 4px 0 0 rgb(10 10 10)',
              cursor: 'pointer',
              padding: '0.875rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              background: 'rgb(255 214 10)',
              color: 'rgb(10 10 10)',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
