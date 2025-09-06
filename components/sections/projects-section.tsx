'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Building2, Briefcase, ExternalLink } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const works = [
  {
    id: 1,
    title: 'Digital Marketing Agency-Website',
    description:
      'Engineered a 50+ page marketing website with integrated blog, career page, and Nodemailer-based application handling; improved performance and user interaction. ',
    image: '/proMelange.jpg',
    tags: [
      ' React.js',
      'TailwindCSS',
      'GSAP',
      'Framer Motion',
      'Node.js',
      'Express',
      'Nodemailer',
    ],
    // type: 'Company',
    link: 'https://melangedigital.co/',
  },
  {
    id: 2,
    title: 'AI-Powered Trading - Website ',
    description:
      'Architected AI-driven trading platform website, integrating personalized course recommendations and intuitive navigation; increased visitor engagement by 40% and course sales by 25% within the first quarter. ',
    image: '/proNeo.png',
    tags: ['HTML/CSS', 'JavaScript', 'TailwindCSS', 'PHP'],
    // type: 'Freelance',
    link: 'https://neotrader.in/',
  },
  {
    id: 3,
    title: 'AI-Powered 3D Avatars & Immersive Experiences',
    description:
      'Crafted an immersive front-end experience for a generative AI SaaS product with real-time loading, 3D asset rendering, and avatar generation using Three.js and React.',
    image:
      '/proGenvr.png',
    tags: [
      'Nex.js,',
      ' TailwindCSS',
      'TypeScript',
      ' React Quill',
      'React Redux',
      ' WaveSurfer.js,',
      'Three.js',
      'Video.js',
      'Django',
    ],
    // type: 'Company',
    link: 'https://app.genvrresearch.com/',
  },
  {
    id: 4,
    title: 'PR Agency Website – Strategic Brand Showcase',
    description:
      'Crafted an engaging, scroll-driven site using NextJs, Framer Motion, and GSAP to tell the agency’s 19+ year journey—featuring animated stats, smooth transitions, and a clean, content-first layout that brings their impact to life. ',
    image:
      '/proBrandit.png',
    tags: [
      'Next.js,',
      ' TailwindCSS',
      ' Framer Motion',
      'EmailJs',
      'GSAP ',
      ' Email.js',
    ],
    // type: 'Company',
    link: 'https://www.branditcommunications.com/',
  },
  {
    id: 5,
    title: 'Broking Platform – Responsive Website for Financial Brand ',
    description:
      'Developed a responsive landing page using React, TailwindCSS, and Framer Motion, implementing scroll-based UI, animated metrics, and clean component structure to highlight 30,000+ clients and key platform features.',
    image:
      '/proAc.png',
    tags: ['React.js,', ' TailwindCSS'],
    // type: 'Company',
    link: 'https://www.acagarwal.com/',
  },
  {
    id: 6,
    title: 'House of Tales – Interactive Landing Experience for a Wedding Brand ',
    description:
      'Engineered a mobile-first landing page with Next.js, TailwindCSS, and Framer Motion, optimized for speed and SEO. Handled backend contact flow using Nodemailer, ensuring scalable and secure lead submissions.',
    image:
      '/proHouse.png',
    tags: [
      'Next.js,',
      ' TailwindCSS',
      'TypeScript',
      'Material UI',
      "Day.js",
      "React Gestures",
      "Framer Motion",
      "GSAP",
      "Node.js",
      "Nodemailer",
    ],
    // type: 'Company',
    link: 'https://www.houseoftales.co/',
  },
  {
    id: 7,
    title: 'Aartech Solonics – Corporate Website for an Energy Engineering Pioneer',
    description:
      'Developed a modern corporate website to showcase Aartech’s legacy as an R&D-driven engineering leader since 1982. Integrated a live stock price API, dynamic product modules, and a tailored solution for managing complex product selections with matching elements.',
    image: '/proAartech.png',

    tags: [
      'React',
      'TailwindCSS',
      'Node.js',
      'Express',
      'Nodemailer',
      'React Carousel',
      'API Integration',
      'Custom Solutions',
    ],
    // type: 'Company',
    link: 'https://aartechsolonics.com/',
  },
  {
    id: 8,
    title: 'DevBoost – Engineering Intelligence Platform for Data-Driven Teams',
    description:
      'Built a dynamic website for DevBoost—an AI-powered engineering-intelligence tool that delivers predictive insights, performance visibility, and risk mitigation across software teams.ROI calculators.',
    image: '/proDev.png',

    tags: ['React', 'TailwindCSS', 'TypeScript', 'Data Visualization'],

    // type: 'Company',
    link: 'https://devboost.co/',
  },
]

export function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)
  const visibleWorks = showAll ? works : works.slice(0, 6)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.work-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.25,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Helper for 3D tilt
  function Card3DTilt({ children }: { children: React.ReactNode }) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useSpring(y, { stiffness: 200, damping: 20 })
    const rotateY = useSpring(x, { stiffness: 200, damping: 20 })

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      const card = e.currentTarget
      const rect = card.getBoundingClientRect()
      const cardX = e.clientX - rect.left
      const cardY = e.clientY - rect.top
      const percentX = (cardX / rect.width) * 2 - 1
      const percentY = (cardY / rect.height) * 2 - 1
      x.set(percentX * 12)
      y.set(-percentY * 12)
    }

    function handleMouseLeave() {
      x.set(0)
      y.set(0)
    }

    return (
      <motion.div
        style={{
          rotateY,
          rotateX,
          willChange: 'transform',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="work-card"
      >
        {children}
      </motion.div>
    )
  }

  return (
    <section
      id="works"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"


    >

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">Works </span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
      </motion.div>
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-24 left-0 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-0 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 0, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-0"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-0">
            My <span className="gradient-text">Work</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-0" />
         
        </motion.div>

        {/* Works Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleWorks.map((work, index) => (
            <Card3DTilt key={work.id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/40 dark:to-gray-800/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/40 shadow-xl group transition-all duration-500"
              >
                {/* Glow on hover - fully contained */}
                <div
                  className="absolute left-2 top-2 right-2 bottom-2 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-primary/30 via-purple-500/20 to-pink-500/20 z-0"
                  style={{ borderRadius: 'inherit' }}
                />

                {/* Image Section */}
                <div className="relative h-48 overflow-hidden z-10">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-semibold rounded-full shadow-md">
                    {/* {work.type === 'Company' ? <Building2 className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />} */}
                    {/* {work.type} */}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 z-10 relative">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                    {work.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-3">
                    {work.description}
                  </p>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm bg-gradient-to-r from-gray-100/80 to-gray-200/40 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-300 rounded-full border border-gray-200/40 dark:border-gray-600/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Button */}
                  <motion.a
                    href={work.link}
                    className="relative inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-medium overflow-hidden group-hover:shadow-neon-blue transition-all"
                    target='_blank'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Explore
                  </motion.a>
                </div>
              </motion.div>
            </Card3DTilt>
          ))}
        </div>

        {/* Show More Button */}
        {!showAll && works.length > 6 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
