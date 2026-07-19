'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useUIStore } from '@/lib/store'
import { 
  Shield, 
  Lock, 
  Key, 
  FileCode, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Server, 
  EyeOff, 
  Settings, 
  Package, 
  Layers, 
  FileUp, 
  MousePointer, 
  HardDrive, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface Topic {
  id: string;
  title: string;
  icon: any;
  myApproach: string;
  myBestPractices: string[];
}

const securityTopics: Topic[] = [
  {
    id: 'auth',
    title: 'Authentication & Authorization',
    icon: UserCheckIcon,
    myApproach: 'In all client projects and enterprise portals, I build state-driven user authorization structures. I manage session states reactively using frontend stores to dynamically show or hide UI components, while routing calls through authentication interceptors that enforce cryptographic backend verification on every API request. This balances rich client interactivity with strict server-side policy controls.',
    myBestPractices: [
      'Design silent token refresh mechanisms that execute asynchronously before JWT tokens expire.',
      'Hide structural components and buttons reactively to guide users and restrict access at the UI layer.',
      'Always enforce identical authorization mappings in the backend API layer rather than trusting client-side logic.'
    ]
  },
  {
    id: 'route-protection',
    title: 'Route Protection & RBAC',
    icon: Lock,
    myApproach: 'I implement route-level protection using Next.js Edge Middleware to check user claims or token metadata before loading page chunks. By intercepting navigation triggers at the edge, I ensure unauthorized users are immediately redirected back to login before any sensitive JavaScript payloads are downloaded or hydrated in the browser.',
    myBestPractices: [
      'Intercept restricted endpoints at the edge middleware level to protect codebase assets.',
      'Group routes under logical subdirectories matching access control tiers (e.g. /admin/*).',
      'Double check authentication tokens during layout renders before components mount.'
    ]
  },
  {
    id: 'token-handling',
    title: 'Secure Token Handling',
    icon: Key,
    myApproach: 'To mitigate session hijacking and prevent XSS-based token harvesting, I store active access tokens (JWTs) strictly in local application memory (Zustand/React state) and set refresh tokens within secure, SameSite=Strict, HttpOnly cookies. This completely blocks malicious client-side scripts from reading the refresh tokens.',
    myBestPractices: [
      'Set short expiration limits (e.g., 5 to 15 minutes) on in-memory access tokens.',
      'Inject HttpOnly directives on auth cookies to shield them from Javascript document.cookie calls.',
      'Implement prompt token revocation protocols on the backend to invalidate compromised credentials immediately.'
    ]
  },
  {
    id: 'validation',
    title: 'Input Validation & Sanitization',
    icon: FileCode,
    myApproach: 'I enforce a strict policy of never trusting user-provided inputs. I design comprehensive validation schemas using Zod for form processing. Prior to rendering or storing any user inputs, I sanitize the contents using DOMPurify, effectively neutralising structural injection risks.',
    myBestPractices: [
      'Map Zod validations to React form controls to provide real-time UI warning signs.',
      'Sanitize all input data at point of capture using DOMPurify filters.',
      'Reject strings exceeding logical boundaries to prevent buffer overload attempts.'
    ]
  },
  {
    id: 'xss',
    title: 'XSS Protection',
    icon: ShieldAlert,
    myApproach: 'I defend against Cross-Site Scripting (XSS) by relying on React\'s native rendering engine, which escapes string values by default. In scenarios that necessitate raw rich-text execution, I pass the payload through strict DOMPurify configs to strip scripts, onload handlers, and javascript: protocols.',
    myBestPractices: [
      'Avoid dangerouslySetInnerHTML unless parsing through sanitized helper wrappers.',
      'Sanitize hyperlinks to verify they match standard http: or https: schemas.',
      'Instate strict Content Security Policies (CSP) to block execution of inline codes.'
    ]
  },
  {
    id: 'csrf',
    title: 'CSRF Prevention',
    icon: ShieldCheck,
    myApproach: 'To shield applications from Cross-Site Request Forgery (CSRF), I design API systems to rely on custom HTTP headers (such as Bearer authorization keys) which browsers do not auto-send on standard cross-site links. For traditional cookie setups, I enforce SameSite=Strict constraints.',
    myBestPractices: [
      'Enforce Bearer Authorization headers instead of standard session cookies for cross-origin API calls.',
      'Verify SameSite policies are active across all server-issued session trackers.',
      'Verify incoming CORS pre-flight origin checks for state-altering methods (POST/PUT/DELETE).'
    ]
  },
  {
    id: 'csp',
    title: 'Content Security Policy (CSP)',
    icon: Globe,
    myApproach: 'I formulate restrictive Content Security Policies (CSP) and deliver them via HTTP headers. I restrict resource execution to local domains and trusted CDNs, generate single-use script nonces for inline code snippets, and forbid unsafe-inline and unsafe-eval declarations.',
    myBestPractices: [
      'Define default-src \'self\' to lock down connections and downloads by default.',
      'Inject cryptographic nonces on server-side layouts to securely render trusted inline scripts.',
      'Utilize report-only directives to log policy violations during staging tests.'
    ]
  },
  {
    id: 'api-security',
    title: 'Secure API Communication',
    icon: Server,
    myApproach: 'I secure web communications by directing all traffic over HTTPS (TLS 1.3). On the backend, I configure precise CORS settings to authorize specific frontend URLs while completely rejecting wildcard (*) setups for authenticated endpoints, preventing unauthorized resource access.',
    myBestPractices: [
      'Enforce TLS 1.3 protocols to guarantee encryption in transit.',
      'Whitelist client domains explicitly in CORS configuration, avoiding generic wildcards.',
      'Build request timeouts in Axios clients to gracefully manage connection bottlenecks.'
    ]
  },
  {
    id: 'sensitive-data',
    title: 'Sensitive Data Handling',
    icon: EyeOff,
    myApproach: 'I keep credentials, password inputs, and personal user data (PII) out of global storage nodes or permanent files. I handle passwords in transient variables that are zeroed out as soon as the API request completes, and I remove console statement leaks in compilation pipelines.',
    myBestPractices: [
      'Clear passwords from memory arrays immediately after sending auth requests.',
      'Do not write credentials or personal profiles to local logs.',
      'Employ compile-time cleaners (such as Terser) to automatically strip console outputs.'
    ]
  },
  {
    id: 'env-variables',
    title: 'Env Variables & Secrets',
    icon: Settings,
    myApproach: 'I apply a strict separation of keys and configuration. I keep API secret keys and server passwords isolated from the web client, ensuring only non-sensitive public parameters (prefixed with NEXT_PUBLIC_ in Next.js) are compiled into the client bundle.',
    myBestPractices: [
      'Keep database URLs, Stripe secret keys, and JWT keys strictly on the server-side.',
      'Ensure all .env and .env.local files are declared in .gitignore.',
      'Verify required environment keys at build-time to intercept misconfigured deployments.'
    ]
  },
  {
    id: 'dependency-security',
    title: 'Dependency Security',
    icon: Package,
    myApproach: 'I manage third-party supply chain risks by scanning all external packages. I run npm audit checks and integrate Snyk scanners into active CI/CD scripts to audit and block insecure dependency upgrades before they make it to production environments.',
    myBestPractices: [
      'Enforce lockfile installs using npm ci to maintain code replication in pipelines.',
      'Run automatic dependency vulnerabilities audits during pre-commit hooks.',
      'Verify the health, open issues, and support status of open-source packages before integration.'
    ]
  },
  {
    id: 'security-headers',
    title: 'Security Headers',
    icon: Layers,
    myApproach: 'I deliver robust HTTP headers to restrict client browsers from acting in insecure ways. I configure the host servers (Nginx/Vercel) to issue X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, and HSTS headers on all pages.',
    myBestPractices: [
      'Mitigate MIME type sniffing vulnerabilities by setting X-Content-Type-Options: nosniff.',
      'Enforce SSL usage over all page layouts with Strict-Transport-Security settings.',
      'Restrict client referrer leaks using strict-origin referrer directives.'
    ]
  },
  {
    id: 'file-upload',
    title: 'File Upload Security',
    icon: FileUp,
    myApproach: 'I secure document upload routines by checking file sizes, checking header magic numbers, and limiting MIME categories on the client. I route upload calls to secure storage buckets where files are isolated and renamed to random hash IDs to prevent script execution.',
    myBestPractices: [
      'Validate file size and actual binary header type (magic bytes) before processing uploads.',
      'Configure HTML input fields to restrict selectable file properties.',
      'Avoid saving user-uploaded files directly on server application root folders.'
    ]
  },
  {
    id: 'clickjacking',
    title: 'Clickjacking Protection',
    icon: MousePointer,
    myApproach: 'I protect layouts from UI redress (clickjacking) attacks by instructing client browsers to block embedding. I set X-Frame-Options to DENY and configure the CSP frame-ancestors directive to prevent other websites from rendering my pages in hidden frames.',
    myBestPractices: [
      'Configure X-Frame-Options: DENY to prevent third-party framing.',
      'Configure CSP frame-ancestors \'none\' as a secondary validation barrier.',
      'Use frame-busting layouts in application base structures to secure older client browsers.'
    ]
  },
  {
    id: 'storage-security',
    title: 'Browser Storage Security',
    icon: HardDrive,
    myApproach: 'I maintain a strict storage classification policy: sensitive data (auth JWTs, refresh keys, PII) goes into secure HttpOnly cookies, while non-sensitive properties (user language preferences or UI light/dark themes) are stored in LocalStorage or SessionStorage.',
    myBestPractices: [
      'Keep access credentials out of client-accessible localStorage.',
      'Clear sessionStorage objects immediately upon user sign-out.',
      'Encrypt necessary local data records using CryptoJS arrays to restrict access.'
    ]
  },
  {
    id: 'error-handling',
    title: 'Secure Error Handling',
    icon: AlertCircle,
    myApproach: 'I design custom error boundary interfaces that keep stack trace data and database errors hidden in the browser. I present generic, friendly warnings to users while transmitting exact trace logs to secure servers like Sentry for investigation.',
    myBestPractices: [
      'Return generic user messages (e.g. "Action failed") in place of raw API error blocks.',
      'Isolate internal stack details, SQL calls, and trace details to secure servers.',
      'Implement global React boundary catch blocks to prevent client-side page crashes.'
    ]
  },
  {
    id: 'best-practices',
    title: 'General Best Practices',
    icon: CheckCircle,
    myApproach: 'I treat web security as an active build-time constraint. I run eslint-plugin-security rules inside ESLint, conduct threat audits before release cycles, and design user interfaces in alignment with OWASP Top 10 guidelines.',
    myBestPractices: [
      'Run automatic ESLint checks with security presets to catch unsafe code trends during development.',
      'Audit third-party package security metrics on a monthly schedule.',
      'Implement security compliance checklists in release templates.'
    ]
  }
];

function UserCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}

export function SecuritySection() {
  const [activeTopicId, setActiveTopicId] = useState(securityTopics[0].id)
  const sectionRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const { setCurrentSection } = useUIStore()
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  const activeTopic = securityTopics.find(t => t.id === activeTopicId) || securityTopics[0]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background blobs animations
      gsap.to('.sec-blob-1', {
        x: 'random(-40, 40)',
        y: 'random(-40, 40)',
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
      gsap.to('.sec-blob-2', {
        x: 'random(-40, 40)',
        y: 'random(-40, 40)',
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // GSAP ScrollTrigger for pinning and scroll-based tab switching on desktop (lg and above)
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          id: "security-pin",
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${securityTopics.length * 150}`,
          pin: true,
          scrub: true,
          onToggle: (self) => {
            if (self.isActive) {
              setCurrentSection('security');
            }
          },
          onUpdate: (self) => {
            const index = Math.min(
              Math.floor(self.progress * securityTopics.length),
              securityTopics.length - 1
            );
            setActiveTopicId(securityTopics[index].id);
          }
        });
      });
    }, sectionRef)
    return () => ctx.revert()
  }, [setCurrentSection])

  // Scroll active tab into view in the desktop sidebar when activeTopicId changes
  useEffect(() => {
    const activeTab = document.getElementById(`desktop-tab-${activeTopicId}`);
    const sidebar = document.getElementById('desktop-sidebar');
    if (activeTab && sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      
      const isVisible = (
        tabRect.top >= sidebarRect.top &&
        tabRect.bottom <= sidebarRect.bottom
      );
      
      if (!isVisible) {
        sidebar.scrollTo({
          top: sidebar.scrollTop + (tabRect.top - sidebarRect.top) - (sidebarRect.height / 2) + (tabRect.height / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeTopicId]);

  // Scroll active tab into view on mobile horizontal strip
  const handleTabClick = (id: string) => {
    setActiveTopicId(id)
    const activeTabElement = document.getElementById(`tab-${id}`)
    if (activeTabElement && tabsRef.current) {
      const container = tabsRef.current
      const containerScrollLeft = container.scrollLeft
      const tabRect = activeTabElement.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      const scrollTarget = containerScrollLeft + (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2)
      container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth'
      })
    }
  }

  // Click handler for desktop tabs to adjust scroll position smoothly
  const handleDesktopTabClick = (id: string, index: number) => {
    setActiveTopicId(id);
    const trigger = ScrollTrigger.getById("security-pin");
    if (trigger) {
      const start = trigger.start;
      const end = trigger.end;
      const totalDist = end - start;
      const targetScroll = start + (index / securityTopics.length) * totalDist + 5;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }

  return (
    <section
      id="security"
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 lg:h-screen lg:flex lg:flex-col lg:justify-center lg:py-0"
    >
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="sec-blob-1 absolute top-12 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl" />
        <div className="sec-blob-2 absolute bottom-12 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Frontend Security</span> Integration
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            How I implement bulletproof, industry-compliant security standards to safeguard frontend applications and user experiences.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Tab Selection Interface */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Sidebar Tabs (Desktop) / Horizontal Strip (Mobile) */}
          <div className="lg:col-span-3 w-full lg:-ml-6">
            {/* Mobile Tab Strip */}
            <div 
              ref={tabsRef}
              className="flex lg:hidden overflow-x-auto gap-3 pb-4 mb-4 scrollbar-none snap-x"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {securityTopics.map((topic) => {
                const Icon = topic.icon
                const isActive = activeTopicId === topic.id
                return (
                  <button
                    key={topic.id}
                    id={`tab-${topic.id}`}
                    onClick={() => handleTabClick(topic.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border whitespace-nowrap text-sm font-semibold transition-all duration-300 snap-center ${
                      isActive
                        ? 'bg-primary/20 text-primary border-primary shadow-neon-blue'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {topic.title}
                  </button>
                )
              })}
            </div>

            {/* Desktop Vertical Sidebar */}
            <div 
              id="desktop-sidebar"
              className="hidden lg:flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth"
            >
              {securityTopics.map((topic, idx) => {
                const Icon = topic.icon
                const isActive = activeTopicId === topic.id
                return (
                  <motion.button
                    key={topic.id}
                    id={`desktop-tab-${topic.id}`}
                    onClick={() => handleDesktopTabClick(topic.id, idx)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary border-primary shadow-neon-blue'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{topic.title}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Display Panel */}
          <div className="lg:col-span-9 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTopic.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="glass-effect rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                    {(() => {
                      const Icon = activeTopic.icon
                      return <Icon className="w-6 h-6" />
                    })()}
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-primary font-bold">Security Practice</span>
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                      {activeTopic.title}
                    </h3>
                  </div>
                </div>

                {/* My Approach */}
                <div className="mb-6">
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-2">My Approach</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base font-medium">
                    {activeTopic.myApproach}
                  </p>
                </div>

                {/* My Best Practices */}
                <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/40 dark:border-emerald-900/20 p-5 rounded-2xl">
                  <h4 className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> My Best Practices
                  </h4>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-700 dark:text-slate-350">
                    {activeTopic.myBestPractices.map((practice, index) => (
                      <li key={index} className="flex gap-2.5 items-start">
                        <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">✓</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
