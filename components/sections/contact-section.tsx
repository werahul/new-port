'use client'

import React, { useRef, useState } from 'react'
import { Send, Mail, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react'
import {
  MagneticButton,
  Section,
  SectionHeading,
} from '@/components/primitives'
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

  const fieldClass =
    'w-full rounded-lg border border-line bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-foreground/30 focus:outline-none'

  return (
    <Section id="contact" accent="violet" spacing="loose" atmosphere>
      <SectionHeading
        index="06"
        label="Contact"
        title="Let's build something considered"
        description="The fastest way to reach me is email — the form below goes to the same place."
      />

      <div className="rhythm-lead grid gap-12 lg:grid-cols-12">
        <div data-seq className="lg:col-span-5">
          <div className="flex flex-col divide-y divide-border border-y border-line">
            {contactChannels.map((c) => {
              const inner = (
                <>
                  <span className="type-metadata">{c.title}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[0.975rem] text-foreground">
                    {c.value}
                    {c.href && (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    )}
                  </span>
                </>
              )
              return c.href ? (
                <a
                  key={c.title}
                  href={c.href}
                  className="group flex flex-col py-5 transition-colors hover:text-foreground"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.title} className="flex flex-col py-5">
                  {inner}
                </div>
              )
            })}
          </div>

          <div className="mt-10">
            <span className="type-metadata">Elsewhere</span>
            <div className="mt-4 flex gap-2.5">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      social.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors duration-300 ease-editorial hover:border-foreground/30 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div data-seq className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="relative surface rounded-2xl p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="type-metadata mb-2 block"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={fieldClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="type-metadata mb-2 block"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={fieldClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="subject" className="type-metadata mb-2 block">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className={fieldClass}
                placeholder="Project inquiry"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="message" className="type-metadata mb-2 block">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className={`${fieldClass} resize-none`}
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

            <div className="mt-7 flex flex-wrap items-center gap-4">
              {/* The label tells the truth about what the click will do. With no
                  form backend configured this composes a draft; promising to
                  "send" a message the site cannot send is the one thing a
                  contact form must never do. It flips back automatically once
                  NEXT_PUBLIC_CONTACT_ENDPOINT is set. */}
              <MagneticButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Sending…
                  </>
                ) : ENDPOINT ? (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Compose email
                  </>
                )}
              </MagneticButton>

              {/* One live region that stays mounted, so screen readers reliably
                  announce the result instead of racing a newly-inserted node. */}
              <p
                role="status"
                aria-live="polite"
                data-shown={submitStatus !== 'idle'}
                className="flex items-center gap-2 text-sm transition-opacity duration-300 data-[shown=false]:opacity-0"
              >
                {submitStatus === 'success' && (
                  <span className="flex items-center gap-2 text-accent-strong">
                    <CheckCircle className="h-4 w-4" />
                    Message sent — I&apos;ll be in touch.
                  </span>
                )}
                {submitStatus === 'mailto' && (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>
                      Your mail app should now be open with this message ready —
                      it is not sent until you send it there. If nothing opened,
                      write to{' '}
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-foreground underline underline-offset-4 hover:text-accent-strong"
                      >
                        {profile.email}
                      </a>
                      .
                    </span>
                  </span>
                )}
                {submitStatus === 'error' && (
                  <span className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Couldn&apos;t send. Email {profile.email} directly.
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </Section>
  )
}
