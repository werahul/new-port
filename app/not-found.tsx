import type { Metadata } from 'next'
import Link from 'next/link'
import { LabFooter } from '@/components/lab/footer'
import { StaticSky } from '@/components/lab/static-sky'

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <StaticSky />
      <div className="l-content">
        <section className="l-wrap l-oops" aria-labelledby="oops-title">
          <p className="l-label">404 — not found</p>
          <h1 id="oops-title" className="l-display l-oops-title">
            <span className="l-line">
              <span>That page isn&apos;t</span>
            </span>
            <span className="l-line">
              <span>
                part of the <em className="l-serif">build.</em>
              </span>
            </span>
          </h1>
          <p className="l-lead">
            The address doesn&apos;t match any route on this site. It may have been renamed, or the link that brought
            you here is out of date.
          </p>


          <div className="l-actions">
            <Link href="/" className="l-btn l-btn-solid">
              Back to home
            </Link>
            <Link href="/#work" className="l-btn">
              See selected work
            </Link>
          </div>
        </section>
        <LabFooter topHref="#main" />
      </div>
    </>
  )
}
