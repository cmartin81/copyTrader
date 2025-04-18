import { app } from 'electron'
import Store from 'electron-store'
import { AppState } from '../shared/types'
import { broadcastState } from './utils/broadcastState'

interface StoreSchema {
  appState: AppState
}

// Create a store for persistent app state
const appStore = new Store<StoreSchema>({
  name: 'app-state',
  defaults: {
    appState: {
      appCounter: 0,
      bots: []
    }
  }
})

// Export functions to manage the persistent state
export function getAppState(): AppState {
  return appStore.get('appState')
}

export function setAppState(state: AppState): void {
  appStore.set('appState', state)
  broadcastState()
}

export function updateAppCounter(value: number): void {
  const currentState = getAppState()
  setAppState({
    ...currentState,
    appCounter: value
  })
}

// Session state (non-persistent, reset on app restart)
let sessionState = {
  sessionCounter: 0
}

export function getSessionState() {
  return sessionState
}

export function setSessionState(state: { sessionCounter: number }): void {
  sessionState = state
}

export function updateSessionCounter(value: number): void {
  sessionState = {
    ...sessionState,
    sessionCounter: value
  }
}

// Function to clear all state on app quit if needed
export function clearState(): void {
  appStore.clear()
}

export default appStore
