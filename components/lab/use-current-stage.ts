'use client'

import { useEffect, useState } from 'react'

/** Index of the stage whose section crosses the middle of the viewport. */
export function useCurrentStage(stages: { id: string }[] | undefined) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!stages?.length) return
    const els = stages.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = stages.findIndex((s) => s.id === e.target.id)
          if (i >= 0) setCurrent(i)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [stages])

  return current
}
