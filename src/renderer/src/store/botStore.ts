import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MasterAccount {
  id: string
  name: string
  type: 'NinjaTrader' | 'MetaTrader' | 'TradingView'
  connectionType: 'token' | 'oauth' | 'credentials'
  credentials: {
    token?: string
    username?: string
    password?: string
    url?: string
  }
}

export interface Bot {
  id: string
  name: string
  masterAccount: MasterAccount | null
  targetAccounts: Array<{
    id: string
    name: string
    type: 'PropFirm' | 'TopStepX' | 'Tradovate'
    accountId: string
    tickerMappings: Array<{
      sourceTicker: string
      targetTicker: string
      multiplier: number
      isEditing?: boolean
    }>
  }>
  isRunning: boolean
}

interface BotStore {
  bots: Bot[]
  addBot: (name: string) => void
  updateBot: (id: string, bot: Partial<Bot>) => void
  deleteBot: (id: string) => void
  toggleBot: (id: string) => void
}

export const useBotStore = create<BotStore>()(
  persist(
    (set) => ({
      bots: [],
      addBot: (name: string): void => set((state) => ({
        bots: [...state.bots, {
          id: Date.now().toString(),
          name,
          masterAccount: null,
          targetAccounts: [],
          isRunning: false
        }]
      })),
      updateBot: (id: string, bot: Partial<Bot>): void => set((state) => ({
        bots: state.bots.map((b) => 
          b.id === id ? { ...b, ...bot } : b
        )
      })),
      deleteBot: (id: string): void => set((state) => ({
        bots: state.bots.filter((b) => b.id !== id)
      })),
      toggleBot: (id: string): void => set((state) => ({
        bots: state.bots.map((b) => 
          b.id === id ? { ...b, isRunning: !b.isRunning } : b
        )
      }))
    }),
    {
      name: 'bot-storage'
    }
  )
) 