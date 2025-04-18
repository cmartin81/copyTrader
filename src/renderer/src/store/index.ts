import { create } from 'zustand'
import { AppState, SessionState } from '../../../shared/types'
import { useBotStore } from './botStore'

// App state store
export const useAppStore = create<AppState>((set, get) => ({
  appCounter: 0,
  bots: [],
  setAppCounter: (value: number) => {
    const currentState = get()
    const newState = { ...currentState, appCounter: value }
    set(newState)
    // Only sync with main process if store is initialized
    if (window.store) {
      window.store.setAppState(newState)
    }
  },
  setBots: (bots) => {
    const currentState = get()
    const newState = { ...currentState, bots }
    set(newState)
    // Only sync with main process if store is initialized
    if (window.store) {
      window.store.setAppState(newState)
    }
  }
}))

// Session state store
export const useSessionStore = create<SessionState>((set) => ({
  sessionCounter: 0,
  setSessionCounter: (value: number) => {
    const newState = { sessionCounter: value }
    set(newState)
    // Only sync with main process if store is initialized
    if (window.store) {
      window.store.setSessionState(newState)
    }
  }
}))

// Initialize stores and setup listeners
export const initializeStores = async (): Promise<void> => {
  try {
    // Wait for window.store to be available
    if (!window.store) {
      console.warn('window.store not available yet, waiting...')
      await new Promise(resolve => setTimeout(resolve, 100))
      if (!window.store) {
        throw new Error('window.store not available after waiting')
      }
    }

    // Get initial states
    const initialState = await window.store.getInitialState()
    const { appState, sessionState } = initialState

    // Set initial states
    useAppStore.setState(appState)
    useSessionStore.setState(sessionState)
    useBotStore.setState({ bots: appState.bots || [] })

    // Setup listeners for state updates
    window.store.onAppStateUpdate((state) => {
      useAppStore.setState(state)
      useBotStore.setState({ bots: state.bots || [] })
    })

    window.store.onSessionStateUpdate((state) => {
      useSessionStore.setState(state)
    })

    window.store.onStateUpdate((sessionState, appState) => {
      useSessionStore.setState(sessionState)
      useAppStore.setState(appState)
      useBotStore.setState({ bots: appState.bots || [] })
    })

    console.log('Stores initialized successfully')
  } catch (error) {
    console.error('Failed to initialize stores:', error)
    throw error
  }
} 