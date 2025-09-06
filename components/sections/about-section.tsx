'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Code, Database, Globe, Smartphone, Zap, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const skills = [
  { name: 'React/Next.js', percentage: 95, icon: Code, color: 'from-blue-500 to-cyan-500' },
  { name: 'Node.js/Express', percentage: 90, icon: Database, color: 'from-green-500 to-emerald-500' },
  { name: 'TypeScript', percentage: 88, icon: Zap, color: 'from-blue-600 to-indigo-600' },
  { name: 'MongoDB/PostgreSQL', percentage: 80, icon: Database, color: 'from-purple-500 to-pink-500' },
  { name: 'UI/UX Development', percentage: 92, icon: Smartphone, color: 'from-orange-500 to-red-500' },
  { name: 'Team Collaboration', percentage: 90, icon: Users, color: 'from-teal-500 to-cyan-500' },
]

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Skill bars animation
      gsap.fromTo('.skill-bar-fill',
        { width: 0 },
        {
          width: (i, el) => el.dataset.percentage + '%',
          duration: 1.5,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.skills-container',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Text reveal animation
      gsap.fromTo('.about-text',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-gradient-to-r from-pink-500/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Who </span> Am I
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="about-text">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Full-Stack Developer Who Lives and Breathes Code
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                I'm a passionate MERN stack developer, and I love creating immersive digital experiences. Using technologies like React, Node.js and other modern frameworks, I bring ideas to life with scalable, efficient code.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                I started my journey into web development from a place of curiosity and have organically cultivated a true understanding of both the frontend and backend. I believe that writing good code is more than about functions - it is about creating an experience that is clean, long-lasting, and also fun to use.€
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 about-text">
              <div className="text-center p-4 rounded-xl glass-effect">
                <div className="text-3xl font-bold text-primary mb-2">2+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
              </div>
              <div className="text-center p-4 rounded-xl glass-effect">
                <div className="text-3xl font-bold text-primary mb-2">20+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Skills */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="skills-container"
          >
            <h3 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-gray-200">
              Technical Skills
            </h3>

            <div className="space-y-6">
              {skills.map((skill, index) => {
                const Icon = skill.icon
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${skill.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {skill.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`skill-bar-fill h-full bg-gradient-to-r ${skill.color} rounded-full`}
                        data-percentage={skill.percentage}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percentage}%` }}
                        transition={{ duration: 1.5, delay: 0.8 + index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid md:grid-cols-3 gap-8 about-text"
        >
          <div className="text-center p-6 rounded-xl glass-effect hover:scale-105 transition-transform duration-300">
            <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Web Development</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Building responsive, modern web applications with cutting-edge technologies
            </p>
          </div>

          <div className="text-center p-6 rounded-xl glass-effect hover:scale-105 transition-transform duration-300">
            <Smartphone className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Mobile-First</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Creating seamless experiences across all devices and screen sizes
            </p>
          </div>

          <div className="text-center p-6 rounded-xl glass-effect hover:scale-105 transition-transform duration-300">
            <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Performance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimizing for speed, accessibility, and user experience
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 