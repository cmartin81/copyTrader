import { create } from 'zustand'
import { RunningBot, TargetAccountStatus } from '../../../shared/types'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface Alert {
  id: string
  type: AlertType
  message: string
}

interface SessionState {
  alerts: Alert[]
  runningBot: RunningBot | null
  addAlert: (type: AlertType, message: string) => void
  removeAlert: (id: string) => void
  setRunningBot: (bot: RunningBot | null) => void
  updateTargetAccountStatus: (targetAccountId: string, status: TargetAccountStatus) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  alerts: [],
  runningBot: null,
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
  setRunningBot: (bot): void => {
    set({ runningBot: bot })
  },
  updateTargetAccountStatus: (targetAccountId, status): void => {
    set((state) => {
      if (!state.runningBot) return state

      return {
        runningBot: {
          ...state.runningBot,
          targetAccounts: state.runningBot.targetAccounts.map(ta =>
            ta.id === targetAccountId ? { ...ta, status } : ta
          )
        }
      }
    })
  }
}))
