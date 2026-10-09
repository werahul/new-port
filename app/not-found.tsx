import type { Metadata } from 'next'
import { Button, Container } from '@/components/primitives'

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div data-tone="light" className="pattern-grid relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-bg py-20 text-fg">
      <Container>
        <div className="relative">
          <span
            aria-hidden
            className="h-display block select-none text-[38vw] leading-[0.8] text-yellow [-webkit-text-stroke:4px_rgb(var(--ink))] lg:text-[22rem]"
          >
            404
          </span>
          <span data-accent="pink" className="sticker absolute left-[8%] top-[12%] -rotate-12 text-sm">
            off the map
          </span>
        </div>
        <h1 className="h-display mt-6 max-w-[18ch] text-4xl sm:text-6xl">
          That page isn&apos;t part of the build
        </h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted">
          The URL doesn&apos;t match any route in this project. It may have been renamed, or the
          link that brought you here is out of date.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="/" accent="yellow">
            Back to home
          </Button>
          <Button href="/#works" variant="ghost">
            See selected work
          </Button>
        </div>
      </Container>
    </div>
  )
}
