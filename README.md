# Rahul's Portfolio - MERN Stack Developer

A stunning, animated portfolio website built with Next.js, featuring modern animations, smooth scrolling, and a premium design aesthetic.

## ✨ Features

- **🎨 Dark/Light Theme Toggle** - Persisted across sessions
- **🎭 Smooth Animations** - GSAP + Framer Motion powered transitions
- **📱 Responsive Design** - Optimized for all devices
- **⚡ Smooth Scrolling** - Lenis-powered smooth scroll experience
- **🎯 Interactive Elements** - Hover effects, parallax, and micro-interactions
- **🔧 Modern Tech Stack** - Next.js 14, TypeScript, TailwindCSS
- **♿ Accessibility** - Keyboard navigation and reduced motion support

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: GSAP + Framer Motion
- **Smooth Scroll**: Lenis
- **State Management**: Zustand
- **Icons**: Lucide React
- **3D Elements**: Spline (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rahul-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
rahul_portfolio/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   │   ├── sidebar.tsx   # Navigation sidebar
│   │   └── footer.tsx    # Footer component
│   ├── sections/         # Page sections
│   │   ├── hero-section.tsx
│   │   ├── about-section.tsx
│   │   ├── projects-section.tsx
│   │   ├── timeline-section.tsx
│   │   ├── testimonials-section.tsx
│   │   └── contact-section.tsx
│   └── ui/               # UI components
│       ├── theme-provider.tsx
│       └── smooth-scroll.tsx
├── lib/                  # Utility functions
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🎨 Customization

### Colors & Theme

The color scheme can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... other shades
  },
  dark: {
    50: '#f8fafc',
    // ... other shades
  }
}
```

### Animations

GSAP animations are configured in each section component. You can modify:

- Scroll trigger points
- Animation durations
- Easing functions
- Stagger delays

### Content

Update the content in each section component:

- **Hero Section**: Update name, title, and description
- **About Section**: Modify skills, experience, and personal info
- **Projects Section**: Add your projects with images and links
- **Timeline Section**: Update work experience
- **Testimonials Section**: Add client testimonials
- **Contact Section**: Update contact information

## 🎯 Key Features Explained

### Smooth Scrolling
Uses Lenis for buttery-smooth scrolling with configurable easing and speed.

### Theme Management
Zustand store manages theme state with localStorage persistence.

### GSAP Animations
- ScrollTrigger for scroll-based animations
- Timeline for complex animation sequences
- Stagger effects for list animations

### Responsive Design
- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

```bash
npm run build
npm start
```

## 📱 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for all metrics
- **Bundle Size**: Optimized with Next.js built-in optimizations
- **Images**: Next.js Image component for optimization

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

## 🎨 Design System

### Typography
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono
- **Display**: Clash Display

### Spacing
- Consistent spacing scale using TailwindCSS
- Responsive padding and margins

### Components
- Glassmorphism effects
- Gradient backgrounds
- Neon glow effects
- Smooth transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [GSAP](https://greensock.com/gsap/) for powerful animations
- [Framer Motion](https://www.framer.com/motion/) for React animations
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS
- [Lenis](https://github.com/studio-freight/lenis) for smooth scrolling
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Contact

- **Email**: rahul@example.com
- **LinkedIn**: [Your LinkedIn]
- **GitHub**: [Your GitHub]

---

Built with ❤️ using Next.js and modern web technologies. 