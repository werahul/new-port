import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

interface UIState {
  isSidebarOpen: boolean
  currentSection: string
  setSidebarOpen: (open: boolean) => void
  setCurrentSection: (section: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  currentSection: 'home',
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setCurrentSection: (section) => set({ currentSection: section }),
})) 