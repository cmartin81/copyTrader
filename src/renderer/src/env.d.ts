/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RENDERER_VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { AppState, CounterActions, SessionState } from '../../../shared/types'

interface Window {
  electron: {
    ipcRenderer: {
      send(channel: string, ...args: unknown[]): void
      on(channel: string, func: (...args: unknown[]) => void): void
      once(channel: string, func: (...args: unknown[]) => void): void
      invoke(channel: string, ...args: unknown[]): Promise<unknown>
    }
  }
  api: CounterActions & {
    onStateUpdate: (callback: (sessionState: SessionState, appState: AppState) => void) => void
    getInitialState: () => Promise<{ sessionState: SessionState, appState: AppState }>
  }
  store: {
    getAppState: () => AppState
    setAppState: (state: AppState) => void
    getSessionState: () => SessionState
    setSessionState: (state: SessionState) => void
    onAppStateUpdate: (callback: (state: AppState) => void) => void
    onSessionStateUpdate: (callback: (state: SessionState) => void) => void
  }
}
