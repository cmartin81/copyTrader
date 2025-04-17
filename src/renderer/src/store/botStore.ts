import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { useAppStore } from './index'

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
    type: 'Topstepx' | 'Bulenox' | 'TheFuturesDesk' | 'TickTickTrader'
    account: string
    credentials?: {
      username: string
      password: string
    }
    symbolMappings: {
      sourceSymbol: string
      targetSymbol: string
      multiplier: number
      isEditing: boolean
    }[]
  }[]
  masterAccount: MasterAccount
}

interface BotStore {
  bots: Bot[]
  addBot: (bot: Omit<Bot, 'id'>) => Promise<void>
  updateBot: (id: string, updates: Partial<Bot>) => Promise<void>
  deleteBot: (id: string) => Promise<void>
  toggleBot: (id: string) => Promise<void>
  updateBotPnl: (id: string, pnl: number) => Promise<void>
}

export const useBotStore = create<BotStore>((set, get) => ({
  bots: [],
  addBot: async (bot) => {
    const newBot = { ...bot, id: uuidv4() }
    set((state) => ({ bots: [...state.bots, newBot] }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  },
  updateBot: async (id, updates) => {
    if (updates.targetAccounts) {
      // Handle password encryption for target accounts
      const encryptedAccounts = await Promise.all(
        updates.targetAccounts.map(async (account) => {
          if (account.credentials) {
            const encryptedPassword = await window.electron.ipcRenderer.invoke('encrypt-password', account.credentials.password) as string
            return {
              ...account,
              credentials: {
                ...account.credentials,
                password: encryptedPassword
              }
            }
          }
          return account
        })
      )
      updates = {
        ...updates,
        targetAccounts: encryptedAccounts
      }
    }
    
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === id ? { ...bot, ...updates } : bot
      )
    }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  },
  deleteBot: async (id) => {
    set((state) => ({ bots: state.bots.filter((bot) => bot.id !== id) }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  },
  toggleBot: async (id) => {
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === id ? { ...bot, isRunning: !bot.isRunning } : bot
      )
    }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  },
  updateBotPnl: async (id, pnl) => {
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === id ? { ...bot, pnl } : bot
      )
    }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  }
})) 