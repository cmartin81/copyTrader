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
  addBot: (bot: Omit<Bot, 'id' | 'isRunning' | 'isActive' | 'pnl'>) => void
  updateBot: (id: string, updates: Partial<Bot>) => void
  deleteBot: (id: string) => void
  toggleBot: (id: string) => void
  updateBotPnl: (id: string, pnl: number) => void
  setBots: (bots: Bot[]) => void
}

export const useBotStore = create<BotStore>((set, get) => ({
  bots: [],
  setBots: (bots) => {
    set({ bots })
    // Only send the bots array to the main process
    window.store.setBots(bots)
  },
  addBot: (bot) => {
    const newBot = {
      ...bot,
      id: uuidv4(),
      isRunning: false,
      isActive: false,
      pnl: 0
    }
    const updatedBots = [...get().bots, newBot]
    get().setBots(updatedBots)
  },
  updateBot: (id, updates) => {
    const updatedBots = get().bots.map((bot) => (bot.id === id ? { ...bot, ...updates } : bot))
    get().setBots(updatedBots)
  },
  deleteBot: (id) => {
    const updatedBots = get().bots.filter((bot) => bot.id !== id)
    get().setBots(updatedBots)
  },
  toggleBot: (id) => {
    const updatedBots = get().bots.map((bot) =>
      bot.id === id ? { ...bot, isRunning: !bot.isRunning } : bot
    )
    get().setBots(updatedBots)
  },
  updateBotPnl: (id, pnl) => {
    const updatedBots = get().bots.map((bot) => (bot.id === id ? { ...bot, pnl } : bot))
    get().setBots(updatedBots)
  }
})) 