import { create } from 'zustand'
import { AppState, SessionState } from '../../../shared/types'
import { useBotStore } from './botStore'

// App state store
export const useAppStore = create<AppState>((set, get) => ({
  appCounter: 0,
  bots: [],
  setAppCounter: (value: number) => {
    const currentState = get()
    set({ ...currentState, appCounter: value })
    window.store.setAppState({ ...currentState, appCounter: value })
  },
  setBots: (bots) => {
    const currentState = get()
    set({ ...currentState, bots })
    window.store.setAppState({ ...currentState, bots })
  }
}))

// Session state store
export const useSessionStore = create<SessionState>((set) => ({
  sessionCounter: 0,
  setSessionCounter: (value: number) => {
    set({ sessionCounter: value })
    window.store.setSessionState({ sessionCounter: value })
  }
}))

// Initialize stores and setup listeners
export const initializeStores = async (): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Failed to initialize stores:', error)
  }
} 