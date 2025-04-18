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
    type: 'TopstepX' | 'Bulenox' | 'TheFuturesDesk' | 'TickTickTrader'
    accountId: string
    credentials?: {
      username: string
      password: string
    }
    accounts?: {
      id: number
      name: string
      alias: string | null
    }[]
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

// Helper function to sync bots with main process
const syncBotsWithMain = async (bots: Bot[]): Promise<void> => {
  try {
    await window.store.setBots(bots)
  } catch (error) {
    console.error('Failed to sync bots with main process:', error)
  }
}

export const useBotStore = create<BotStore>((set, get) => ({
  bots: [],
  addBot: async (bot) => {
    try {
      const newBot = { ...bot, id: uuidv4() }
      set((state) => ({ bots: [...state.bots, newBot] }))
      await syncBotsWithMain(get().bots)
    } catch (error) {
      console.error('Failed to add bot:', error)
      throw error
    }
  },
  updateBot: async (id, updates) => {
    try {
      if (updates.targetAccounts) {
        // Only encrypt passwords for accounts that have a new password
        const encryptedAccounts = await Promise.all(
          updates.targetAccounts.map(async (account) => {
            if (account.credentials?.password) {
              // Only encrypt if the password is different from the original
              const originalAccount = get().bots.find(b => b.id === id)?.targetAccounts.find(a => a.id === account.id)
              if (originalAccount?.credentials?.password !== account.credentials.password) {
                const encryptedPassword = await window.store.encryptPassword(account.credentials.password)
                return {
                  ...account,
                  credentials: {
                    ...account.credentials,
                    password: encryptedPassword
                  }
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
      await syncBotsWithMain(get().bots)
    } catch (error) {
      console.error('Failed to update bot:', error)
      throw error
    }
  },
  deleteBot: async (id) => {
    try {
      set((state) => ({ bots: state.bots.filter((bot) => bot.id !== id) }))
      await syncBotsWithMain(get().bots)
    } catch (error) {
      console.error('Failed to delete bot:', error)
      throw error
    }
  },
  toggleBot: async (id) => {
    try {
      set((state) => ({
        bots: state.bots.map((bot) =>
          bot.id === id ? { ...bot, isRunning: !bot.isRunning } : bot
        )
      }))
      await syncBotsWithMain(get().bots)
    } catch (error) {
      console.error('Failed to toggle bot:', error)
      throw error
    }
  },
  updateBotPnl: async (id, pnl) => {
    try {
      set((state) => ({
        bots: state.bots.map((bot) =>
          bot.id === id ? { ...bot, pnl } : bot
        )
      }))
      await syncBotsWithMain(get().bots)
    } catch (error) {
      console.error('Failed to update bot PNL:', error)
      throw error
    }
  }
}))
