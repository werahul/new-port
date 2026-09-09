import { Github, Linkedin, Mail, type LucideIcon } from 'lucide-react'

export const profile = {
  name: 'Rahul',
  fullName: 'Rahul Kumar',
  role: 'Full-Stack Engineer',
  location: 'Noida, India',
  email: 'rahuldev.kb@gmail.com',
  phone: '+91 8077464884',
  /**
   * Intentionally a local path, not the Drive URL. `/resume` redirects to the
   * real file (see `RESUME_URL` in next.config.js), so the link on a CV or in
   * an email signature keeps working when the file is re-uploaded.
   */
  resumeUrl: '/resume',
  /** Short editorial statement, split into masked lines for the hero. */
  heroLines: ['Full-stack engineer', 'building considered', 'digital products.'],
  summary:
    'I design, build and ship production systems end to end — interface engineering, APIs, data models and the architecture that holds them together. Recently that has meant micro-frontend platforms, AI-assisted product surfaces and performance work that moves real numbers.',
  stats: [
    { value: '3+', label: 'Years shipping production software' },
    { value: '20+', label: 'Products delivered end to end' },
    { value: '7', label: 'Industries — finance to generative AI' },
  ],
} as const

export interface SocialLink {
  label: string
  href: string
  icon: LucideIcon
}

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/werahul', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/werahul/', icon: Linkedin },
  { label: 'Email', href: 'mailto:rahuldev.kb@gmail.com', icon: Mail },
]

export const contactChannels = [
  { title: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { title: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
  { title: 'Location', value: profile.location, href: null },
]
