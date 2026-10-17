'use client'

/**
 * Restrained navigation: monogram, four destinations, the sound switch and
 * the résumé. Below 1024px the links fold into a full-screen menu with a focus
 * trap, Esc to close and focus returned to the opener.
 *
 * On the home page a destination glides there through Lenis; on any other
 * page it is an ordinary link to /#section.
 */
import Link from 'next/link'
import { ArrowUpRight, VolumeX } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getLenis, scrollToId } from '@/components/ui/smooth-scroll'
import type { NavItem } from '@/content/lab'
import { setSound, soundSupported, useSoundOn } from './sound/sound'

interface LabNavProps {
  items: NavItem[]
  fullName: string
  resumeUrl: string
  email: string
}

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
}

/** Sound on or off. Visible wherever Web Audio exists; it never starts by itself. */
function SoundSwitch() {
  const on = useSoundOn()
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported(soundSupported()), [])
  if (!supported) return null
  return (
    <button
      type="button"
      className="l-chip l-sound"
      aria-pressed={on}
      onClick={() => setSound(!on)}
      title={on ? 'Turn the ambient music off' : 'Turn the ambient music on'}
    >
      {on ? (
        <span className="l-eq" data-on="true" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <VolumeX aria-hidden="true" size={16} strokeWidth={2} />
      )}
      <span className="l-hide-sm">Sound</span>
      <span className="l-sr"> — ambient music</span>
    </button>
  )
}

export function LabNav({ items, fullName, resumeUrl, email }: LabNavProps) {
  const [open, setOpen] = useState(false)
  const onHome = usePathname() === '/'
  const menuRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    const opener = openerRef.current
    const lenis = getLenis()
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => menu && focusables(menu)[0]?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setOpen(false)
      if (e.key !== 'Tab' || !menu) return
      const items = focusables(menu)
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      opener?.focus()
    }
  }, [open])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setOpen(false)
    if (!onHome || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    requestAnimationFrame(() => scrollToId(id))
    history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`)
  }

  return (
    <>
      <header className="l-nav">
        {/* no aria-label: the accessible name must contain the visible text */}
        <Link href="/" onClick={(e) => go(e, 'top')} className="l-mark">
          <span className="l-mark-glyph">RK</span>
          <span className="l-mark-name">{fullName}</span>
          <span className="l-sr">{onHome ? ' — back to the top' : ' — home'}</span>
        </Link>

        <nav aria-label="Sections" className="l-nav-links">
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/#${item.id}`} onClick={(e) => go(e, item.id)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="l-nav-end">
          <SoundSwitch />
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="l-chip l-hide-sm">
            Résumé
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={2.25} />
          </a>
          <button
            ref={openerRef}
            type="button"
            className="l-chip l-menu-btn"
            aria-expanded={open}
            aria-controls="lab-menu"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      {open && (
        <div ref={menuRef} id="lab-menu" role="dialog" aria-modal="true" aria-label="Menu" className="l-menu">
          <div className="l-menu-top">
            <span className="l-label">Menu</span>
            <button type="button" className="l-chip" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav aria-label="Sections">
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={`/#${item.id}`} onClick={(e) => go(e, item.id)}>
                    <span className="l-label">{item.num}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="l-menu-foot">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="l-btn">
              Résumé
            </a>
            <a href={`mailto:${email}`} className="l-btn">
              Email
            </a>
          </div>
        </div>
      )}
    </>
  )
}
