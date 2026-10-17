'use client'

/**
 * Capabilities as an indexed instrument rather than a badge wall: five tabs,
 * one detail panel. Engaging a tab (hover, focus, click, arrow keys) also
 * lights that capability's cluster in the world behind.
 */
import { useEffect, useRef, useState } from 'react'
import type { Capability } from '@/content/lab'
import { world } from './world/world-state'

interface Level {
  id: 'core' | 'working' | 'exploring'
  label: string
  hint: string
}

export function CapabilitiesTabs({ capabilities, levels }: { capabilities: Capability[]; levels: Level[] }) {
  const labelOf = (id: Level['id']) => levels.find((l) => l.id === id)?.label ?? id
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    world.capability = active
  }, [active])
  useEffect(
    () => () => {
      world.capability = -1
    },
    [],
  )

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = capabilities.length
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? (i + 1) % n
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? (i - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : -1
    if (next < 0) return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  const cap = capabilities[active]

  return (
    <div className="l-caps-ui">
      <div role="tablist" aria-label="Capabilities" aria-orientation="vertical" className="l-tabs">
        {capabilities.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            role="tab"
            type="button"
            id={`cap-tab-${c.id}`}
            aria-selected={i === active}
            aria-controls={`cap-panel-${c.id}`}
            tabIndex={i === active ? 0 : -1}
            className="l-tab"
            onClick={() => setActive(i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="l-tab-i">{c.index}</span>
            <span className="l-tab-name">{c.name}</span>
            <span className="l-tab-n" aria-hidden="true">
              {c.skills.length}
            </span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`cap-panel-${cap.id}`}
        aria-labelledby={`cap-tab-${cap.id}`}
        className="l-panel"
       
        key={cap.id}
      >
        <p className="l-label">
          {cap.index} — {cap.name}
        </p>
        <p className="l-panel-summary">{cap.summary}</p>
        <ul className="l-skills">
          {cap.skills.map((s) => (
            <li key={s.name}>
              <span className="l-level" data-level={s.level} aria-hidden="true" />
              <span>{s.name}</span>
              <span className="l-sr">— {labelOf(s.level)}</span>
            </li>
          ))}
        </ul>
        <dl className="l-legend">
          {levels.map((l) => (
            <div key={l.id}>
              <dt>
                <span className="l-level" data-level={l.id} aria-hidden="true" />
                {l.label}
              </dt>
              <dd>{l.hint}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
