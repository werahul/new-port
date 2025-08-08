'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, MapPin, Building, Award } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const timelineData = [
  {
    id: 1,
    year: '2023 - Present',
    title: 'Senior Full-Stack Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    description: 'Leading development of enterprise-scale applications using React, Node.js, and cloud technologies. Mentoring junior developers and implementing best practices.',
    technologies: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
    achievements: ['Reduced load times by 40%', 'Led team of 5 developers', 'Implemented CI/CD pipeline']
  },
  {
    id: 2,
    year: '2021 - 2023',
    title: 'Full-Stack Developer',
    company: 'Digital Innovations Inc',
    location: 'New York, NY',
    description: 'Developed and maintained multiple web applications using MERN stack. Collaborated with design and product teams to deliver user-centric solutions.',
    technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'TypeScript'],
    achievements: ['Built 10+ client projects', 'Improved code quality by 60%', 'Mentored 3 interns']
  },
  {
    id: 3,
    year: '2020 - 2021',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    description: 'Focused on creating responsive and accessible user interfaces. Worked closely with UX designers to implement pixel-perfect designs.',
    technologies: ['React', 'TypeScript', 'TailwindCSS', 'Framer Motion'],
    achievements: ['Launched MVP in 3 months', 'Achieved 95% accessibility score', 'Reduced bundle size by 30%']
  },
  {
    id: 4,
    year: '2019 - 2020',
    title: 'Junior Developer',
    company: 'WebSolutions',
    location: 'Remote',
    description: 'Started my journey in web development, learning modern technologies and best practices. Contributed to various client projects.',
    technologies: ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
    achievements: ['Completed 20+ projects', 'Learned full-stack development', 'Earned AWS certification']
  }
]

export function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline line animation
      gsap.fromTo('.timeline-line', 
        { scaleY: 0 },
        { 
          scaleY: 1, 
          duration: 2, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Timeline items stagger animation
      gsap.fromTo('.timeline-item', 
        { x: -100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.timeline-container',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Right side items animation
      gsap.fromTo('.timeline-item-right', 
        { x: 100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.timeline-container',
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
      id="timeline" 
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Work <span className="gradient-text">Timeline</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-8" />
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            My professional journey and career milestones
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="timeline-container relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-purple-500 to-pink-500 timeline-line transform -translate-x-1/2" />
          
          {/* Timeline Items */}
          <div className="space-y-12">
            {timelineData.map((item, index) => (
              <motion.div
                key={item.id}
                className={`timeline-item group relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white dark:border-gray-900 shadow-neon-blue z-10" />
                
                {/* Content Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <motion.div
                    className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                    whileHover={{ y: -5 }}
                  >
                    {/* Year Badge */}
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{item.year}</span>
                    </div>

                    {/* Title and Company */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{item.company}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{item.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Achievements */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-primary" />
                        Key Achievements
                      </h4>
                      <ul className="space-y-1">
                        {item.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download Full Resume
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
} 