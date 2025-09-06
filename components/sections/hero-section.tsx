'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown, Download, Mail, ArrowRight, Sparkles, Code, Zap, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered text reveal with more dramatic timing
      const tl = gsap.timeline({ delay: 0.5 })

      tl.fromTo('.hero-badge',
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" }
      )

      tl.fromTo('.hero-name',
        { y: 120, opacity: 0, rotationX: 90 },
        { y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" },
        '-=0.3'
      )

      tl.fromTo('.hero-title',
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
        '-=0.5'
      )

      tl.fromTo('.hero-description',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        '-=0.3'
      )

      tl.fromTo('.hero-buttons',
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
        '-=0.2'
      )

      // Floating elements animation
      gsap.to('.floating-orb', {
        y: -30,
        x: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.5
      })

      // Rotating elements
      gsap.to('.rotating-element', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      })

      // Particle animation
      gsap.to('.particle', {
        y: -100,
        opacity: 0,
        duration: 3,
        repeat: -1,
        stagger: 0.1,
        ease: "power1.out"
      })

    }, heroRef)

    return () => ctx.revert()
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePosition({ x, y })
    }
  }

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background with Mouse Follow */}
      <div
        ref={containerRef}
        className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      >
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
          }}
        />

        {/* Geometric Patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl floating-orb" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-orange-500/20 rounded-full blur-3xl floating-orb" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl floating-orb" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)]" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}

        {/* Rotating Code Elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rotating-element opacity-20">
          <Code className="w-full h-full text-blue-400" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 rotating-element opacity-20" style={{ animationDirection: 'reverse' }}>
          <Zap className="w-full h-full text-purple-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container-custom section-padding text-center">
        {/* Badge */}
        <motion.div
          className="hero-badge mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            MERN Stack Developer
            <Sparkles className="w-4 h-4" />
          </span>
        </motion.div>

        {/* Name */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight">
            <span className="hero-name block text-slate-800 dark:text-slate-200">Hi, I'm</span>
            <span className="hero-name block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Rahul
            </span>
          </h1>
        </div>

        {/* Title */}
        <motion.h2
          className="hero-title text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-600 dark:text-slate-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Crafting Digital Experiences with
          <span className="block text-blue-600 dark:text-blue-400 font-bold">
            Modern Web Technologies
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="hero-description text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Full-stack developer passionate about creating exceptional web applications.
          Specializing in React, Node.js, and cutting-edge technologies to build
          scalable, performant, and user-centric solutions.
        </motion.p>

        {/* Action Buttons */}
        <div className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <a href="https://drive.google.com/file/d/1m_2ujrkDZZKyWpnrMARVWh8lYrdUcWlZ/view" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Download Resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </a>
          <a href="mailto:rahuldev.kb@gmail.com">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5 group-hover:animate-pulse" />
              Let's Connect
            </span>
          </motion.button>
          </a>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {[
            { number: "2+", label: "Years Experience", icon: Rocket },
            { number: "20+", label: "Projects Completed", icon: Code },
            { number: "7+ ", label: "Industries Served", icon: Zap }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center space-y-2 text-slate-500 dark:text-slate-400"
          >
            <span className="text-sm font-medium">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-10 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-10 w-12 h-12 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-xl"
        />
      </div>
    </section>
  )
} 