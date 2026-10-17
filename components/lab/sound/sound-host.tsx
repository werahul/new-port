'use client'

/**
 * Lets the score follow the visitor: brighter as they travel down a page, a
 * soft chime as each new section reaches the middle of the screen. Also
 * resumes the score — at the first click or key press, as browsers require —
 * for a visitor who chose sound on an earlier visit.
 */
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ambient } from './ambient'
import { setSound, soundPreferred } from './sound'

export function SoundHost() {
  const pathname = usePathname()

  // resume a remembered preference on the first gesture (the loader, when it
  // is showing, asks instead)
  useEffect(() => {
    if (!soundPreferred()) return
    const loading = () => document.querySelector('[data-lab]')?.hasAttribute('data-loading')
    const go = () => {
      if (!soundPreferred()) return off() // changed their mind meanwhile
      if (loading() || ambient.isPlaying) return
      setSound(true)
      off()
    }
    const events = ['pointerdown', 'keydown'] as const
    const off = () => events.forEach((e) => window.removeEventListener(e, go))
    events.forEach((e) => window.addEventListener(e, go))
    return off
  }, [])

  // mood: how far through the page
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        ambient.setMood(max > 0 ? window.scrollY / max : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  // a chime per section
  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]')
    let armed = false // not for the section the page opens on
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && armed) ambient.chime()
        armed = true
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [pathname])

  return null
}
