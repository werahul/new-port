import { ArrowDown } from 'lucide-react'
import { Button, Container, MarqueeBand } from '@/components/primitives'
import { RotatingText } from '@/components/reactbits/rotating-text'
import { Shuffle } from '@/components/reactbits/shuffle'
import { SceneHost } from '@/components/three/scene-host'
import { heroCopy, profile } from '@/content/profile'

/**
 * Poster-scale opening. The name runs huge and off-axis on the left; the 3D
 * shape cluster sits on a tilted "stage" card on the right and leans toward
 * the cursor. A velocity marquee cuts across the bottom edge.
 */
export function HeroSection() {
  return (
    <section
      id="home"
      data-tone="light"
      className="relative isolate overflow-hidden bg-bg text-fg"
    >
      <div aria-hidden className="pattern-grid pointer-events-none absolute inset-0 -z-10" />
      {/* loose geometry in the margins */}
      <span aria-hidden className="clip-burst absolute -left-10 top-24 -z-10 hidden h-40 w-40 bg-yellow lg:block" />
      <span aria-hidden className="absolute bottom-24 right-[46%] -z-10 hidden h-16 w-16 rotate-12 border-3 border-ink bg-pink lg:block" />

      <Container size="wide" className="grid items-center gap-12 pb-24 pt-10 sm:pt-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-6 lg:pb-28">
        <div className="relative z-10 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <span data-accent="emerald" className="sticker -rotate-3">
              <span className="h-2 w-2 animate-pulse bg-ink" aria-hidden />
              Open to work
            </span>
            <span data-accent="cyan" className="sticker rotate-2">
              {profile.location}
            </span>
          </div>

          <h1 className="mt-8">
            <span className="sr-only">
              {profile.fullName} — {heroCopy.kicker}
            </span>
            <span aria-hidden className="block">
              <span className="label block">{heroCopy.kicker} · Portfolio ’26</span>
              <Shuffle
                text="Rahul"
                className="h-display mt-3 block text-[clamp(3.5rem,15vw,9.5rem)]"
              />
              <span className="flex items-end gap-4 sm:ml-[14%]">
                <Shuffle
                  text="Kumar"
                  className="h-display block text-[clamp(3.5rem,15vw,9.5rem)] [-webkit-text-stroke:3px_rgb(var(--ink))] text-transparent"
                />
                <span className="clip-star mb-3 hidden h-14 w-14 shrink-0 animate-spin-slow bg-pink sm:block" />
              </span>
            </span>
          </h1>

          <p className="h-title mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl sm:text-4xl">
            <span>I build</span>
            <RotatingText
              texts={heroCopy.builds}
              boxClassName="border-3 border-ink bg-yellow px-3 py-1 shadow-b-sm"
            />
          </p>

          <p className="b-box mt-8 max-w-xl -rotate-1 p-5 text-lg leading-relaxed sm:p-6">
            {heroCopy.statement}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/#works" accent="yellow">
              See the work
              <ArrowDown aria-hidden className="h-4 w-4" strokeWidth={3} />
            </Button>
            <Button href="/#contact" accent="pink">
              Say hello
            </Button>
            <Button href={profile.resumeUrl} variant="ghost" withArrow>
              Résumé
            </Button>
          </div>
        </div>

        {/* the stage */}
        <div className="relative mx-auto w-full max-w-[560px] lg:col-span-5 lg:max-w-none">
          <div className="b-box relative rotate-2 bg-paper shadow-b-xl">
            <div className="flex items-center justify-between border-b-3 border-ink bg-ink px-3 py-2 text-cream">
              <span className="label">fig. 01 — shapes of work</span>
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-3 w-3 border-2 border-cream bg-pink" />
                <span className="h-3 w-3 border-2 border-cream bg-yellow" />
                <span className="h-3 w-3 border-2 border-cream bg-emerald" />
              </span>
            </div>
            <div className="pattern-dots relative aspect-square w-full" data-tone="light">
              <SceneHost scene="hero" className="absolute inset-0" />
            </div>
          </div>
          <span data-accent="violet" className="sticker absolute -bottom-4 -left-2 -rotate-6 sm:-left-6">
            drag · click a shape
          </span>
        </div>
      </Container>

      <MarqueeBand
        className="!my-0"
        accent="yellow"
        tilt={-1.5}
        items={[...heroCopy.positioning, 'Full-stack', 'Performance', 'Interfaces']}
      />
    </section>
  )
}
