import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  currentSection: string
  setSidebarOpen: (open: boolean) => void
  setCurrentSection: (section: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  currentSection: 'home',
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setCurrentSection: (section) => set({ currentSection: section }),
})) 