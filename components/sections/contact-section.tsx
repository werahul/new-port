'use client'

import React, { useRef, useState } from 'react'
import { Send, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react'
import {
  MagneticButton,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { ScrollReveal } from '@/components/motion'
import { contactChannels, profile, socials } from '@/content/profile'

type Status = 'idle' | 'success' | 'error' | 'mailto'

const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT

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
   * Posts to a form backend when NEXT_PUBLIC_CONTACT_ENDPOINT is configured
   * (Formspree / Basin / Getform / a route of your own all accept this shape).
   * With no endpoint set we hand off to the user's mail client instead of
   * pretending to deliver — the form never silently swallows a message.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypotRef.current?.value) return // bot filled the hidden field

    setIsSubmitting(true)
    setSubmitStatus('idle')

    if (!ENDPOINT) {
      const body = `${formData.message}

— ${formData.name} (${formData.email})`
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        formData.subject,
      )}&body=${encodeURIComponent(body)}`
      setIsSubmitting(false)
      setSubmitStatus('mailto')
      return
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
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

      <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12">
        <ScrollReveal variant="fade-up" className="lg:col-span-5">
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
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.08} className="lg:col-span-7">
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
              <MagneticButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
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
                    <CheckCircle className="h-4 w-4" />
                    Opening your mail app…
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
        </ScrollReveal>
      </div>
    </Section>
  )
}
