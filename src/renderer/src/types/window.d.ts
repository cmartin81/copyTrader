import { AppState, SessionState } from '../../../shared/types'

interface MasterAccount {
  type: 'PropFirm' | 'Personal'
  connectionType: 'MT4' | 'MT5' | 'cTrader'
  credentials: {
    username: string
    password: string
    server?: string
  }
}

interface Bot {
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

interface StateUpdate {
  sessionState: SessionState
  appState: AppState
  bots: Bot[]
}

interface IpcResponse {
  success: boolean
  error?: string
}

interface WindowAPI {
  getInitialState: () => Promise<StateUpdate>
  onStateUpdate: (callback: (sessionState: SessionState, appState: AppState, bots: Bot[]) => void) => void
}

interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<IpcResponse | string>
    send: (channel: string, ...args: unknown[]) => void
    on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
    removeAllListeners: (channel: string) => void
  }
  process: {
    env: {
      DEV: boolean
    }
  }
  isDev: boolean
}

interface StoreAPI {
  getAppState: () => AppState
  setAppState: (state: AppState) => void
  getSessionState: () => SessionState
  setSessionState: (state: SessionState) => void
  onAppStateUpdate: (callback: (state: AppState) => void) => void
  onSessionStateUpdate: (callback: (state: SessionState) => void) => void
  onStateUpdate: (callback: (sessionState: SessionState, appState: AppState, bots: Bot[]) => void) => void
  getInitialState: () => Promise<StateUpdate>
  incrementSessionCounter: () => void
  decrementSessionCounter: () => void
  incrementAppCounter: () => void
  decrementAppCounter: () => void
  openLogsDirectory: () => void
}

declare global {
  interface Window {
    api: WindowAPI
    electron: ElectronAPI
    store: StoreAPI
  }
} 