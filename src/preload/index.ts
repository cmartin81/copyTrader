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

// Define the type for our exposed API
interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
      },
    } as ElectronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
