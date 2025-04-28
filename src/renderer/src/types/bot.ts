export interface MasterAccount {
  id: string
  name: string
  type: 'Rithmic' | 'NinjaTrader' | 'Tradovate'
  connectionType: 'Rithmic' | 'NinjaTrader' | 'Tradovate'
  credentials: {
    username?: string
    password?: string
    userId?: string
    server?: string
    location?: string
  }
}

export interface Bot {
  id: string
  name: string
  masterAccount: MasterAccount
  targetAccounts: MasterAccount[]
  isRunning: boolean
  isActive: boolean
  pnl: number
} 