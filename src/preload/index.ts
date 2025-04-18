import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppState, SessionState } from '../shared/types'
import { StoreAPI } from '../types/window'

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

// Custom APIs for renderer
const api: StoreAPI = {
  // App state methods
  getAppState: () => ipcRenderer.invoke('get-app-state'),
  setAppState: (state) => ipcRenderer.invoke('set-app-state', state),

  // Session state methods
  getSessionState: () => ipcRenderer.invoke('get-session-state'),
  setSessionState: (state) => ipcRenderer.invoke('set-session-state', state),

  // Bot management methods
  getBots: () => ipcRenderer.invoke('get-bots'),
  setBots: (bots) => ipcRenderer.invoke('set-bots', bots),
  updateBot: (botId, updates) => ipcRenderer.invoke('update-bot', botId, updates),
  deleteBot: (botId) => ipcRenderer.invoke('delete-bot', botId),

  // State listeners
  onAppStateUpdate: (callback) => {
    const subscription = (event: any, state: any) => callback(state)
    ipcRenderer.on('app-state-updated', subscription)
    return () => {
      ipcRenderer.removeListener('app-state-updated', subscription)
    }
  },

  // Session counter methods
  incrementSessionCounter: () => ipcRenderer.invoke('increment-session-counter'),
  decrementSessionCounter: () => ipcRenderer.invoke('decrement-session-counter'),
  getSessionCounter: () => ipcRenderer.invoke('get-session-counter'),

  // Security methods
  encryptPassword: (password) => ipcRenderer.invoke('encrypt-password', password),
  decryptPassword: (encryptedPassword) => ipcRenderer.invoke('decrypt-password', encryptedPassword),

  // Logs directory
  openLogsDirectory: () => ipcRenderer.invoke('open-logs-directory')
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('store', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.store = api
}
