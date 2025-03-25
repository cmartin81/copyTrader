import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'synthwave' | 'cyberpunk' | 'retro' | 'valentine' | 'aqua'

interface SettingsStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'synthwave',
      setTheme: (theme: Theme): void => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      }
    }),
    {
      name: 'settings-storage'
    }
  )
) 