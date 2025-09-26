'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Heart, Github, Linkedin, Twitter, Mail } from 'lucide-react'

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <footer className="relative rounded-tl-[50px] rounded-tr-[50px] 
      backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 
      border-t border-white/20 dark:border-gray-700/30 overflow-hidden p-5">

      {/* Gradient blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] 
          bg-gradient-to-br from-purple-500/20 to-pink-500/20 
          dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] 
          bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 
          dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.1 }}
        className="relative z-10 container-custom py-12"
      >
        <div className="grid md:grid-cols-2 gap-8 mb-8 items-start">
          {/* Brand Section */}
          <motion.div variants={fadeInUp} className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-primary" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rahul Kumar</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 max-w-sm">
              Passionate MERN stack developer crafting smooth, beautiful, and innovative digital experiences.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Github, href: 'https://github.com/werahul', label: 'GitHub' },
                { icon: Linkedin, href: 'https://www.linkedin.com/in/werahul/', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:rahuldev.kb@gmail.com', label: 'Email' }
              ].map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 backdrop-blur-md 
                    bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 
                    rounded-lg flex items-center justify-center 
                    hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links - aligned right */}
          <motion.div variants={fadeInUp} className="flex flex-col items-end text-right">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Projects', 'Timeline', 'Contact'].map((link, i) => (
                <motion.li key={link} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div variants={fadeInUp} className="border-t border-white/20 dark:border-gray-700/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              © {currentYear} Rahul. All rights reserved.
            </p>
            
          </div>
        </motion.div>
      </motion.div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:shadow-xl backdrop-blur-lg border border-white/20 transition-all duration-300 z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-6 h-6 mx-auto" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
