import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/primitives'

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <Container className="flex min-h-[100svh] flex-col justify-center py-32">
      <span className="type-metadata text-muted-foreground">Error 404</span>
      <h1 className="type-display-sm mt-5 max-w-[18ch] text-foreground">
        That page isn&apos;t part of the build
      </h1>
      <p className="mt-5 max-w-prose text-[0.975rem] leading-relaxed text-muted-foreground">
        The URL doesn&apos;t match any route in this project. It may have been
        renamed, or the link that brought you here is out of date.
      </p>
      <div className="mt-9 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-medium tracking-tight text-primary-foreground transition-shadow duration-300 ease-editorial hover:shadow-soft"
        >
          Back to home
        </Link>
        <Link
          href="/#works"
          className="inline-flex items-center justify-center rounded-full border border-foreground/20 px-7 py-3.5 text-sm font-medium tracking-tight text-foreground transition-colors duration-300 ease-editorial hover:border-foreground/45"
        >
          See selected work
        </Link>
      </div>
    </Container>
  )
}
