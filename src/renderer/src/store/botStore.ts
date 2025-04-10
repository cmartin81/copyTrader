import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MasterAccount {
  type: 'PropFirm' | 'Personal'
  connectionType: 'MT4' | 'MT5' | 'cTrader'
  credentials: {
    username: string
    password: string
    server?: string
  }
}

export interface Bot {
  id: string
  name: string
  isRunning: boolean
  isActive: boolean
  pnl: number
  avatar?: string
  targetAccounts: {
    id: string
    name: string
    type: 'PropFirm' | 'Personal'
    accountId: string
    tickerMappings: {
      source: string
      target: string
      isEditing: boolean
    }[]
  }[]
  masterAccount: MasterAccount
}

interface BotStore {
  bots: Bot[]
  addBot: (bot: Omit<Bot, 'id' | 'isRunning' | 'isActive' | 'pnl'>) => void
  updateBot: (id: string, updates: Partial<Bot>) => void
  deleteBot: (id: string) => void
  toggleBot: (id: string) => void
  updateBotPnl: (id: string, pnl: number) => void
}

export const useBotStore = create<BotStore>()(
  persist(
    (set) => ({
      bots: [],
      addBot: (bot) => set((state) => ({
        bots: [
          ...state.bots,
          {
            ...bot,
            id: Math.random().toString(36).substr(2, 9),
            isRunning: false,
            isActive: false,
            pnl: 0
          }
        ]
      })),
      updateBot: (id, updates) => set((state) => ({
        bots: state.bots.map((bot) => (bot.id === id ? { ...bot, ...updates } : bot))
      })),
      deleteBot: (id) => set((state) => ({
        bots: state.bots.filter((bot) => bot.id !== id)
      })),
      toggleBot: (id) => set((state) => ({
        bots: state.bots.map((bot) =>
          bot.id === id ? { ...bot, isRunning: !bot.isRunning } : bot
        )
      })),
      updateBotPnl: (id, pnl) => set((state) => ({
        bots: state.bots.map((bot) => (bot.id === id ? { ...bot, pnl } : bot))
      }))
    }),
    {
      name: 'bot-storage'
    }
  )
) 