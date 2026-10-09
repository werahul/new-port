'use client'

import React, { useRef, useState } from 'react'
import { Send, Mail, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react'
import { Button, Reveal, Section, SectionHeading } from '@/components/primitives'
import { SceneHost } from '@/components/three/scene-host'
import { contactChannels, profile, socials } from '@/content/profile'

type Status = 'idle' | 'success' | 'error' | 'mailto'

/**
 * Web3Forms posts straight from the browser and authenticates with an access
 * key rather than a secret, which is why the key is `NEXT_PUBLIC_`. It is not a
 * credential in the usual sense — it identifies the destination inbox, and the
 * worst it can be used for is submitting to that same inbox. Web3Forms applies
 * its own spam filtering on top of the honeypot below.
 */
const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

/**
 * An explicit endpoint still wins, so swapping to Formspree/Basin/an API route
 * of your own stays a one-variable change and needs no code edit here.
 */
const ENDPOINT =
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || (WEB3FORMS_KEY ? WEB3FORMS_URL : undefined)
const IS_WEB3FORMS = !!WEB3FORMS_KEY && ENDPOINT === WEB3FORMS_URL

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<Status>('idle')
  const honeypotRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Posts to Web3Forms when NEXT_PUBLIC_WEB3FORMS_KEY is set, or to whatever
   * NEXT_PUBLIC_CONTACT_ENDPOINT names (Formspree / Basin / Getform / a route
   * of your own all accept this shape). With neither configured we hand off to
   * the visitor's mail client and say so plainly — the form never silently
   * swallows a message, and never claims to have sent one it did not.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypotRef.current?.value) return // bot filled the hidden field

    setIsSubmitting(true)
    setSubmitStatus('idle')

    if (!ENDPOINT) {
      // No spinner and no "Sending…" here. Nothing is being sent — the message
      // is being handed to the visitor's mail client, and they still have to
      // press send in it. Showing a success tick for this (which is what this
      // branch used to do) tells them their message is on its way when it is
      // sitting in a draft.
      const body = `${formData.message}

— ${formData.name} (${formData.email})`
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        formData.subject || 'Portfolio enquiry',
      )}&body=${encodeURIComponent(body)}`
      setIsSubmitting(false)
      setSubmitStatus('mailto')
      return
    }

    try {
      const payload: Record<string, string> = { ...formData }
      if (IS_WEB3FORMS) {
        payload.access_key = WEB3FORMS_KEY as string
        // What the notification email shows as sender and subject. Without
        // these every message arrives titled "New Submission".
        payload.from_name = formData.name || 'Portfolio contact'
        payload.subject =
          formData.subject || `Portfolio enquiry from ${formData.name || 'a visitor'}`
        // Web3Forms' own honeypot, alongside the one below. Empty = human.
        payload.botcheck = ''
      }

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })

      // Web3Forms answers 200 with `{ success: false }` for a bad access key or
      // a rejected submission, so status alone is not enough to trust.
      const data: unknown = await res.json().catch(() => null)
      const ok =
        res.ok &&
        (data === null ||
          typeof data !== 'object' ||
          (data as { success?: boolean }).success !== false)

      if (!ok) {
        const reason =
          (data as { message?: string } | null)?.message ?? `HTTP ${res.status}`
        throw new Error(`Contact form rejected: ${reason}`)
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      // The visitor gets prose and a working alternative; the console keeps the
      // actual reason, which is the difference between a five-minute fix and an
      // afternoon.
      console.error(err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Section id="contact" tone="accent" accent="yellow">
      <SectionHeading
        index="06"
        label="Contact"
        accent="pink"
        title="Let's build something"
        description="Open to full-time roles and selective freelance work. Email is fastest — the form goes to the same inbox."
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ul className="space-y-4">
            {contactChannels.map((c, i) => {
              const inner = (
                <>
                  <span className="label">{c.title}</span>
                  <span className="mt-1 flex items-center gap-2 break-all text-lg font-bold sm:text-xl">
                    {c.value}
                    {c.href && <ArrowUpRight aria-hidden className="h-5 w-5 shrink-0" strokeWidth={3} />}
                  </span>
                </>
              )
              const tilt = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]'][i % 3]
              return (
                <li key={c.title} className={tilt}>
                  {c.href ? (
                    <a href={c.href} className="b-box b-lift flex flex-col p-4">
                      {inner}
                    </a>
                  ) : (
                    <div className="b-box flex flex-col p-4">{inner}</div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {socials.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="b-lift flex h-12 w-12 items-center justify-center border-3 border-ink bg-paper shadow-b-sm"
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </a>
              )
            })}
          </div>

          <SceneHost scene="contact" className="mx-auto mt-6 aspect-square w-full max-w-[380px]" />
        </div>

        <Reveal className="lg:col-span-7" tilt={2}>
          <form onSubmit={handleSubmit} className="b-box relative bg-paper" data-tone="light">
            <div className="flex items-center justify-between border-b-3 border-ink bg-ink px-5 py-3 text-cream">
              <span className="label">New message</span>
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-3 w-3 border-2 border-cream bg-pink" />
                <span className="h-3 w-3 border-2 border-cream bg-yellow" />
                <span className="h-3 w-3 border-2 border-cream bg-emerald" />
              </span>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label mb-2 block">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                    className="b-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    className="b-field"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="subject" className="label mb-2 block">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="b-field"
                  placeholder="Project inquiry"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="label mb-2 block">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="b-field resize-none"
                  placeholder="Tell me about what you're building…"
                />
              </div>

              {/* Honeypot — invisible to people, tempting to bots. */}
              <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
                <label htmlFor="company">Company</label>
                <input
                  ref={honeypotRef}
                  id="company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                {/* The label tells the truth about what the click will do. With no
                    form backend configured this composes a draft; promising to
                    "send" a message the site cannot send is the one thing a
                    contact form must never do. */}
                <Button type="submit" accent="pink" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin border-[3px] border-ink/30 border-t-ink" />
                      Sending…
                    </>
                  ) : ENDPOINT ? (
                    <>
                      <Send aria-hidden className="h-4 w-4" strokeWidth={3} />
                      Send message
                    </>
                  ) : (
                    <>
                      <Mail aria-hidden className="h-4 w-4" strokeWidth={3} />
                      Compose email
                    </>
                  )}
                </Button>

                {/* One live region that stays mounted, so screen readers reliably
                    announce the result instead of racing a newly-inserted node. */}
                <p
                  role="status"
                  aria-live="polite"
                  data-shown={submitStatus !== 'idle'}
                  className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium"
                >
                  {submitStatus === 'success' && (
                    <span className="flex items-center gap-2 border-2 border-ink bg-emerald px-3 py-2">
                      <CheckCircle aria-hidden className="h-4 w-4 shrink-0" />
                      Message sent — I&apos;ll be in touch.
                    </span>
                  )}
                  {submitStatus === 'mailto' && (
                    <span className="flex items-start gap-2 border-2 border-ink bg-cyan px-3 py-2">
                      <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Your mail app should now be open with this message ready — it is not sent
                        until you send it there. If nothing opened, write to{' '}
                        <a href={`mailto:${profile.email}`} className="font-bold underline underline-offset-4">
                          {profile.email}
                        </a>
                        .
                      </span>
                    </span>
                  )}
                  {submitStatus === 'error' && (
                    <span className="flex items-center gap-2 border-2 border-ink bg-coral px-3 py-2">
                      <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
                      Couldn&apos;t send. Email {profile.email} directly.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
