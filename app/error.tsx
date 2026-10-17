'use client'

import { useEffect } from 'react'
import { StaticSky } from '@/components/lab/static-sky'

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
    <>
      <StaticSky />
      <div className="l-content">
        <section className="l-wrap l-oops" aria-labelledby="oops-title">
          <p className="l-label">Error — something broke</p>
          <h1 id="oops-title" className="l-display l-oops-title">
            <span className="l-line">
              <span>This one&apos;s on</span>
            </span>
            <span className="l-line">
              <span>
                the <em className="l-serif">site.</em>
              </span>
            </span>
          </h1>
          <p className="l-lead">
            Not on you. Try again — and if it keeps happening, the email on the home page always works.
          </p>


          <div className="l-actions">
            <button type="button" onClick={reset} className="l-btn l-btn-solid">
              Try again
            </button>
            <a href="/" className="l-btn">
              Back to the start
            </a>
          </div>
          {error.digest && <p className="l-label l-oops-ref">Reference {error.digest}</p>}
        </section>
      </div>
    </>
  )
}
