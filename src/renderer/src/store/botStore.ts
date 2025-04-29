import { create } from 'zustand'
import { Bot, MasterAccount } from '../types/bot'

export interface MasterAccount {
  type: 'PropFirm' | 'Personal' | 'Rithmic' | 'Test'
  connectionType: 'MT4' | 'MT5' | 'cTrader' | 'Rithmic' | 'Test'
  credentials: {
    username: string
    password: string
    server?: string
    location?: string
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
  masterAccount?: MasterAccount
}

export interface BotStore {
  bots: Bot[]
  masterAccounts: MasterAccount[]
  addBot: (bot: Omit<Bot, 'id' | 'isRunning' | 'isActive' | 'pnl'>) => Promise<Bot>
  updateBot: (id: string, updates: Partial<Bot>) => Promise<void>
  deleteBot: (id: string) => Promise<void>
  addMasterAccount: (account: Omit<MasterAccount, 'id'>) => Promise<void>
  updateMasterAccount: (id: string, updates: Partial<MasterAccount>) => Promise<void>
  deleteMasterAccount: (id: string) => Promise<void>
}

export const useBotStore = create<BotStore>((set, get) => ({
  bots: [],
  masterAccounts: [],
  addBot: async (bot) => {
    const newBot: Bot = {
      ...bot,
      id: crypto.randomUUID(),
      isRunning: false,
      isActive: false,
      pnl: 0
    }
    set((state) => ({
      bots: [...state.bots, newBot]
    }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
    return newBot
  },
  updateBot: async (id, updates) => {
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === id ? { ...bot, ...updates } : bot
      )
    }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  },
  deleteBot: async (id) => {
    set((state) => ({
      bots: state.bots.filter((bot) => bot.id !== id)
    }))
    window.electron.ipcRenderer.send('set-bots', get().bots)
  },
  addMasterAccount: async (account) => {
    const newAccount: MasterAccount = {
      ...account,
      id: crypto.randomUUID()
    }
    set((state) => ({
      masterAccounts: [...state.masterAccounts, newAccount]
    }))
    window.electron.ipcRenderer.send('set-master-accounts', get().masterAccounts)
  },
  updateMasterAccount: async (id, updates) => {
    set((state) => ({
      masterAccounts: state.masterAccounts.map((account) =>
        account.id === id ? { ...account, ...updates } : account
      )
    }))
    window.electron.ipcRenderer.send('set-master-accounts', get().masterAccounts)
  },
  deleteMasterAccount: async (id) => {
    set((state) => ({
      masterAccounts: state.masterAccounts.filter((account) => account.id !== id)
    }))
    window.electron.ipcRenderer.send('set-master-accounts', get().masterAccounts)
  }
}))
