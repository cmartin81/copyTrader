export enum TargetAccountStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPED = 'stopped'
}

export interface RunningBot {
  id: string
  targetAccounts: {
    id: string
    status: TargetAccountStatus
  }[]
}

export interface SessionState {
  sessionCounter: number
  runningBot?: RunningBot | null
}

export interface Bot {
  id: string
  name: string
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
    symbols?: { id: string; name: string }[]
    symbolMappings: {
      sourceSymbol: string
      targetSymbol: string
      multiplier: number
      isEditing: boolean
    }[]
  }[]
  masterAccount: {
    type: 'PropFirm' | 'Personal' | 'Rithmic' | 'Test'
    connectionType: 'MT4' | 'MT5' | 'cTrader' | 'Rithmic' | 'Test'
    credentials?: {
      username: string
      password: string
      server?: string
    }
  }
}

export interface AppState {
  appCounter: number
  bots: Bot[]
}

export interface CounterActions {
  incrementSessionCounter: () => void
  decrementSessionCounter: () => void
  incrementAppCounter: () => void
  decrementAppCounter: () => void
}
