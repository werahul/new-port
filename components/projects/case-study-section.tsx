import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  n: string
  label: string
  children: ReactNode
  className?: string
}

/** Numbered case-study section: an accent index block and a heavy caps label. */
export function CaseStudySection({ id, n, label, children, className }: Props) {
  return (
    <section id={id} className={cn('scroll-mt-36 lg:scroll-mt-24', className)}>
      <div className="flex items-center gap-4 border-b-3 border-edge pb-3">
        <span className="h-title flex h-10 min-w-[2.5rem] items-center justify-center border-3 border-ink bg-accent px-1.5 text-base text-ink">
          {n}
        </span>
        <h2 className="h-title text-3xl sm:text-4xl">{label}</h2>
      </div>
      <div className="mt-6 lg:mt-8">{children}</div>
    </section>
  )
}
