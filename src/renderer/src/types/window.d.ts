import { AppState, SessionState } from '../../../shared/types'

interface Bot {
  id: string
  name: string
  pnl: number
  isActive: boolean
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
    invoke: (channel: string, ...args: unknown[]) => Promise<IpcResponse>
    on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
    removeAllListeners: (channel: string) => void
  }
}

declare global {
  interface Window {
    api: WindowAPI
    electron: ElectronAPI
  }
} 