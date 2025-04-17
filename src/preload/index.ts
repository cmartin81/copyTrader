import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppState, SessionState } from '../shared/types'

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
const api = {
  // Store methods
  getAppState: (): AppState => {
    return ipcRenderer.sendSync('store-send', { action: 'get', key: 'appState' })
  },
  
  setAppState: (state: AppState): void => {
    ipcRenderer.sendSync('store-send', { action: 'set', key: 'appState', value: state })
  },
  
  getSessionState: (): SessionState => {
    return ipcRenderer.sendSync('store-send', { action: 'get', key: 'sessionState' })
  },
  
  setSessionState: (state: SessionState): void => {
    ipcRenderer.sendSync('store-send', { action: 'set', key: 'sessionState', value: state })
  },

  // Bot management methods
  setBots: (bots: Bot[]): void => {
    ipcRenderer.send('set-bots', bots)
  },

  // State listeners
  onAppStateUpdate: (callback: (state: AppState) => void): void => {
    ipcRenderer.on('app-state-updated', (_event, state) => {
      callback(state)
    })
  },

  onSessionStateUpdate: (callback: (state: SessionState) => void): void => {
    ipcRenderer.on('session-state-updated', (_event, state) => {
      callback(state)
    })
  },

  // Session counter methods
  incrementSessionCounter: (): void => {
    ipcRenderer.send('increment-session-counter')
  },
  decrementSessionCounter: (): void => {
    ipcRenderer.send('decrement-session-counter')
  },
  incrementAppCounter: (): void => {
    ipcRenderer.send('increment-app-counter')
  },
  decrementAppCounter: (): void => {
    ipcRenderer.send('decrement-app-counter')
  },

  // State listeners
  onStateUpdate: (callback: (sessionState: SessionState, appState: AppState, bots: Bot[]) => void): void => {
    ipcRenderer.on('state-updated', (_event, sessionState, appState, bots) => {
      callback(sessionState, appState, bots)
    })
  },

  // Initial state request
  getInitialState: (): Promise<StateUpdate> => {
    return ipcRenderer.invoke('get-initial-state')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('store', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.store = api
}
