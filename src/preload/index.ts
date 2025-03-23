import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppState, SessionState } from '../shared/types'

// Custom APIs for renderer
const api = {
  // Session counter methods
  incrementSessionCounter: (): void => {
    ipcRenderer.send('increment-session-counter')
  },
  decrementSessionCounter: (): void => {
    ipcRenderer.send('decrement-session-counter')
  },
  
  // App counter methods 
  incrementAppCounter: (): void => {
    ipcRenderer.send('increment-app-counter')
  },
  decrementAppCounter: (): void => {
    ipcRenderer.send('decrement-app-counter')
  },
  
  // State listeners
  onStateUpdate: (callback: (sessionState: SessionState, appState: AppState) => void): void => {
    ipcRenderer.on('state-updated', (_event, sessionState, appState) => {
      callback(sessionState, appState)
    })
  },
  
  // Initial state request
  getInitialState: (): Promise<{ sessionState: SessionState, appState: AppState }> => {
    return ipcRenderer.invoke('get-initial-state')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
