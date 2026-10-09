'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Container } from '@/components/primitives'

/**
 * Route-level boundary: catches anything that escapes a section (a rejected
 * chunk on a flaky connection, say) so it doesn't take the whole page with it.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // The visitor gets prose, the developer gets the stack.
    console.error(error)
  }, [error])

  return (
    <div data-tone="light" className="pattern-grid flex min-h-[calc(100svh-4rem)] items-center bg-bg text-fg">
      <Container>
        <div className="b-box max-w-2xl -rotate-1 p-6 sm:p-10">
          <span data-accent="coral" className="sticker rotate-2">
            Error
          </span>
          <h1 className="h-display mt-6 text-5xl sm:text-7xl">Something broke.</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            This one is on the site, not on you. Try again — and if it keeps happening, the contact
            form on the home page still works.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={reset} data-accent="yellow" className="b-btn">
              <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={3} />
              Try again
            </button>
            <a href="/" className="b-btn b-btn-ghost">
              Back to the start
            </a>
          </div>
          {error.digest && <p className="label mt-8 text-muted">Reference {error.digest}</p>}
        </div>
      </Container>
    </div>
  )
}
