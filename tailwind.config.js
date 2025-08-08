/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Clash Display', 'sans-serif'],
      },
             colors: {
         border: 'hsl(var(--border))',
         input: 'hsl(var(--input))',
         ring: 'hsl(var(--ring))',
         background: 'hsl(var(--background))',
         foreground: 'hsl(var(--foreground))',
         primary: {
           DEFAULT: 'hsl(var(--primary))',
           foreground: 'hsl(var(--primary-foreground))',
           50: '#f0f9ff',
           100: '#e0f2fe',
           200: '#bae6fd',
           300: '#7dd3fc',
           400: '#38bdf8',
           500: '#0ea5e9',
           600: '#0284c7',
           700: '#0369a1',
           800: '#075985',
           900: '#0c4a6e',
         },
         secondary: {
           DEFAULT: 'hsl(var(--secondary))',
           foreground: 'hsl(var(--secondary-foreground))',
         },
         destructive: {
           DEFAULT: 'hsl(var(--destructive))',
           foreground: 'hsl(var(--destructive-foreground))',
         },
         muted: {
           DEFAULT: 'hsl(var(--muted))',
           foreground: 'hsl(var(--muted-foreground))',
         },
         accent: {
           DEFAULT: 'hsl(var(--accent))',
           foreground: 'hsl(var(--accent-foreground))',
         },
         popover: {
           DEFAULT: 'hsl(var(--popover))',
           foreground: 'hsl(var(--popover-foreground))',
         },
         card: {
           DEFAULT: 'hsl(var(--card))',
           foreground: 'hsl(var(--card-foreground))',
         },
         dark: {
           50: '#f8fafc',
           100: '#f1f5f9',
           200: '#e2e8f0',
           300: '#cbd5e1',
           400: '#94a3b8',
           500: '#64748b',
           600: '#475569',
           700: '#334155',
           800: '#1e293b',
           900: '#0f172a',
           950: '#020617',
         },
         glass: {
           light: 'rgba(255, 255, 255, 0.1)',
           dark: 'rgba(0, 0, 0, 0.1)',
         },
         neon: {
           blue: '#00d4ff',
           purple: '#8b5cf6',
           pink: '#ec4899',
           green: '#10b981',
         },
       },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient': 'gradient 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.8)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'gradient-neon': 'linear-gradient(45deg, #00d4ff, #8b5cf6, #ec4899)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
    },
  },
  plugins: [],
} 