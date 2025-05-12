import { create } from 'zustand'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface Alert {
  id: string
  type: AlertType
  message: string
}

interface SessionState {
  alerts: Alert[]
  runningBotId: string | null
  addAlert: (type: AlertType, message: string) => void
  removeAlert: (id: string) => void
  setRunningBotId: (botId: string | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  alerts: [],
  runningBotId: null,
  addAlert: (type, message): void => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      alerts: [...state.alerts, { id, type, message }]
    }))
    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id)
      }))
    }, 3000)
  },
  removeAlert: (id): void => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id)
    }))
  },
  setRunningBotId: (botId): void => {
    set({ runningBotId: botId })
  }
}))
