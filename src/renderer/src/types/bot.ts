export interface MasterAccount {
  id: string
  name: string
  type: 'PropFirm' | 'Personal' | 'Rithmic' | 'Test'
  connectionType: 'MT4' | 'MT5' | 'cTrader' | 'Rithmic' | 'Test'
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
  masterAccount?: MasterAccount
  targetAccounts: MasterAccount[]
  pnl: number
}
