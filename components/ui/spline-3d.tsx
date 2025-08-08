'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Spline to avoid SSR issues
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

interface Spline3DProps {
  scene: string
  className?: string
}

export function Spline3D({ scene, className = '' }: Spline3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Spline scene={scene} />
      </Suspense>
    </div>
  )
}

// Example usage in Hero Section:
// 
// import { Spline3D } from '@/components/ui/spline-3d'
// 
// {/* Optional: Spline 3D Element */}
// <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-50">
//   <Spline3D 
//     scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" 
//     className="w-full h-full"
//   />
// </div> 