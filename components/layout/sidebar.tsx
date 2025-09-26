'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/ui/theme-provider'
import { useUIStore } from '@/lib/store'
import { 
  Home, 
  User, 
  Briefcase, 
  Clock, 
  MessageSquare, 
  Sun, 
  Moon,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'works', label: 'Works', icon: Briefcase },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
]

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const { currentSection, setCurrentSection, isSidebarOpen, setSidebarOpen } = useUIStore()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setCurrentSection(sectionId)
      setSidebarOpen(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      {/* Floating Top Navbar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden lg:block",
          scrolled && "top-4"
        )}
      >
        <motion.div
          className={cn(
            "glass-effect rounded-2xl px-6 py-3 backdrop-blur-xl border border-white/20 dark:border-white/10 transition-all duration-300",
            scrolled && "shadow-lg shadow-black/10"
          )}
          animate={{
            scale: scrolled ? 0.95 : 1,
            y: scrolled ? -5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex items-center space-x-1">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = currentSection === item.id
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "relative px-4 py-2 rounded-xl transition-all duration-300 group flex items-center space-x-2",
                    isActive 
                      ? "bg-primary/20 text-primary shadow-neon-blue" 
                      : "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10"
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:block">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-primary/20 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-300"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </motion.button>
          </nav>
        </motion.div>
      </motion.div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden p-2 rounded-lg glass-effect hover:scale-105 transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed left-0 top-0 h-full w-80 glass-effect z-50 lg:hidden"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold gradient-text">Rahul</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = currentSection === item.id
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300",
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : "text-black dark:text-gray-400 hover:text-primary hover:bg-primary/10"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  )
                })}
              </nav>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 