import type { ReactNode } from 'react'
import { TextReveal } from '@/components/motion'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  n: string
  label: string
  children: ReactNode
  className?: string
}

/** Numbered case-study section — shared "engineering system" heading treatment. */
export function CaseStudySection({ id, n, label, children, className }: Props) {
  return (
    <section id={id} className={cn('scroll-mt-32 lg:scroll-mt-28', className)}>
      <div className="flex items-baseline gap-4 border-t border-line pt-5">
        <span className="type-metadata text-muted-foreground">{n}</span>
        <TextReveal
          as="h2"
          split="lines"
          className="type-engineering text-foreground"
        >
          {label}
        </TextReveal>
      </div>
      <div className="mt-6 lg:mt-8">{children}</div>
    </section>
  )
}
