'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Container } from '@/components/primitives'

/**
 * Route-level boundary. Before this existed there was none anywhere in `app/`,
 * so a single rejected dynamic import — the 3D chunk on a flaky connection, say
 * — escaped to Next's default error UI and took the whole page with it. The
 * world already degrades on its own; this catches everything that cannot.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Keep the real error in the console — the visitor gets prose, the
    // developer gets the stack.
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[100svh] items-center">
      <Container>
        <div className="max-w-measure">
          <p className="type-metadata type-metadata-accent">Error</p>
          <h1 className="mt-6 type-display-sm text-foreground">
            Something broke on the way in.
          </h1>
          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
            This one is on the site, not on you. Try again — and if it keeps
            happening, the contact form on the home page still works.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="btn-solid group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-tight transition-shadow duration-300 ease-editorial"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:-rotate-90" />
              Try again
            </button>
            <a
              href="/"
              className="rounded-full border border-line-strong px-7 py-3.5 text-sm font-medium tracking-tight text-foreground transition-colors duration-300 ease-editorial hover:border-accent/60 hover:bg-accent/[0.07]"
            >
              Back to the start
            </a>
          </div>
          {error.digest && (
            <p className="type-metadata mt-10 text-faint">
              Reference {error.digest}
            </p>
          )}
        </div>
      </Container>
    </main>
  )
}
