'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

/** Copies the address; the status is announced politely to screen readers. */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2200)
  }

  return (
    <button type="button" className="l-btn" onClick={copy} data-state={state}>
      {state === 'copied' ? (
        <Check aria-hidden="true" size={16} strokeWidth={2.25} />
      ) : (
        <Copy aria-hidden="true" size={16} strokeWidth={2} />
      )}
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed — select it above' : 'Copy address'}
      </span>
    </button>
  )
}
