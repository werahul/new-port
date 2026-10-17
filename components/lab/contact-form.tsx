'use client'

/**
 * The contact form, as an editor window ("message.md"). Same delivery as the
 * site has always had:
 *
 *   NEXT_PUBLIC_CONTACT_ENDPOINT  → posts there (Formspree, Basin, a route…)
 *   NEXT_PUBLIC_WEB3FORMS_KEY     → posts to Web3Forms
 *   neither                       → opens the visitor's mail app with the
 *                                   message drafted, and says exactly that
 *
 * Web3Forms authenticates with an access key rather than a secret, which is
 * why it is `NEXT_PUBLIC_`: it names the destination inbox, nothing more.
 * The form never claims to have sent a message it did not send.
 */
import { useRef, useState } from 'react'

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || (WEB3FORMS_KEY ? WEB3FORMS_URL : undefined)
const IS_WEB3FORMS = !!WEB3FORMS_KEY && ENDPOINT === WEB3FORMS_URL

type Status = 'idle' | 'sending' | 'success' | 'error' | 'mailto'

const EMPTY = { name: '', email: '', subject: '', message: '' }

export function ContactForm({ email }: { email: string }) {
  const [data, setData] = useState(EMPTY)
  const [status, setStatus] = useState<Status>('idle')
  const honeypot = useRef<HTMLInputElement>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [e.target.name]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot.current?.value) return // a bot filled the hidden field

    if (!ENDPOINT) {
      // nothing is being sent — the message is handed to the visitor's mail
      // app, and they still have to press send there
      const body = `${data.message}\n\n— ${data.name} (${data.email})`
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        data.subject || 'Portfolio enquiry',
      )}&body=${encodeURIComponent(body)}`
      setStatus('mailto')
      return
    }

    setStatus('sending')
    try {
      const payload: Record<string, string> = { ...data }
      if (IS_WEB3FORMS) {
        payload.access_key = WEB3FORMS_KEY as string
        payload.from_name = data.name || 'Portfolio contact'
        payload.subject = data.subject || `Portfolio enquiry from ${data.name || 'a visitor'}`
        payload.botcheck = ''
      }
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      // Web3Forms answers 200 with `{ success: false }` for a rejected
      // submission, so the status code alone is not enough to trust
      const json: unknown = await res.json().catch(() => null)
      const ok =
        res.ok && (json === null || typeof json !== 'object' || (json as { success?: boolean }).success !== false)
      if (!ok) throw new Error(`Contact form rejected: ${(json as { message?: string } | null)?.message ?? res.status}`)
      setStatus('success')
      setData(EMPTY)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <form className="l-form l-scrim" onSubmit={onSubmit}>
      <div className="l-form-row">
        <label className="l-field">
          <span className="l-field-l">Name</span>
          <input name="name" value={data.name} onChange={onChange} required autoComplete="name" placeholder="Your name" />
        </label>
        <label className="l-field">
          <span className="l-field-l">Email</span>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={onChange}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="l-field">
        <span className="l-field-l">Subject</span>
        <input name="subject" value={data.subject} onChange={onChange} required placeholder="Project enquiry" />
      </label>
      <label className="l-field">
        <span className="l-field-l">Message</span>
        <textarea
          name="message"
          value={data.message}
          onChange={onChange}
          required
          rows={5}
          placeholder="Tell me about what you're building…"
        />
      </label>

      {/* honeypot — invisible to people, tempting to bots */}
      <div className="l-hp" aria-hidden="true">
        <label>
          Company
          <input ref={honeypot} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="l-form-end">
        {/* the label says what the click will actually do */}
        <button type="submit" className="l-btn l-btn-solid" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : ENDPOINT ? 'Send message' : 'Open in my mail app'}
          <span aria-hidden="true">→</span>
        </button>
        {/* one live region that stays mounted, so the result is reliably announced */}
        <p className="l-form-status" role="status" aria-live="polite" data-tone={status}>
          {status === 'success' && 'Message sent — I’ll be in touch.'}
          {status === 'mailto' && (
            <>
              Your mail app should now be open with this message ready — it isn’t sent until you send it there. If
              nothing opened, write to <a href={`mailto:${email}`}>{email}</a>.
            </>
          )}
          {status === 'error' && (
            <>
              Couldn’t send. Email <a href={`mailto:${email}`}>{email}</a> directly.
            </>
          )}
        </p>
      </div>
    </form>
  )
}
