'use client'

/**
 * The visitor's sound preference, and the one switch that applies it.
 *
 * "on" is only ever recorded from a click (the loader's "Enter with sound",
 * or the nav switch), and sound only ever starts inside a gesture: on a later
 * visit with the preference on, the score resumes at the visitor's first
 * click or key press — never on its own.
 */
import { useSyncExternalStore } from 'react'
import { ambient } from './ambient'

const KEY = 'lab:sound'
const listeners = new Set<() => void>()
let playing = false

function emit() {
  listeners.forEach((l) => l())
}

export function soundPreferred(): boolean {
  try {
    return window.localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

/** Call from a user gesture. */
export function setSound(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* session-only */
  }
  if (on) ambient.start()
  else ambient.stop()
  playing = on
  emit()
}

export function useSoundOn() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },
    () => playing,
    () => false,
  )
}

export function soundSupported() {
  return typeof window !== 'undefined' && !!(window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext)
}
