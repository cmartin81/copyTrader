import { create } from 'zustand'
import { AppState, CounterActions, SessionState } from '../../../shared/types'

// Custom API type definition
interface ApiWithState extends CounterActions {
  onStateUpdate: (callback: (sessionState: SessionState, appState: AppState) => void) => void
  getInitialState: () => Promise<{ sessionState: SessionState, appState: AppState }>
}

interface Store {
  // State
  sessionState: SessionState
  appState: AppState
  isLoading: boolean

  // Actions
  setSessionState: (state: SessionState) => void
  setAppState: (state: AppState) => void
  setLoading: (loading: boolean) => void
  
  // Combined state setter
  updateState: (sessionState: SessionState, appState: AppState) => void
}

export const useStore = create<Store>((set) => ({
  // Initial state
  sessionState: { sessionCounter: 0 },
  appState: { appCounter: 0 },
  isLoading: true,

  // Actions
  setSessionState: (sessionState: SessionState): void => set({ sessionState }),
  setAppState: (appState: AppState): void => set({ appState }),
  setLoading: (isLoading: boolean): void => set({ isLoading }),
  
  // Combined state setter
  updateState: (sessionState: SessionState, appState: AppState): void => set({ sessionState, appState })
}))

// Initialize state and setup listeners
export const initializeStore = async (): Promise<void> => {
  try {
    const api = window.api as unknown as ApiWithState
    
    // Get initial state from main process
    const { sessionState, appState } = await api.getInitialState()
    useStore.setState({ sessionState, appState, isLoading: false })

    // Listen for state updates
    api.onStateUpdate((sessionState: SessionState, appState: AppState) => {
      useStore.setState({ sessionState, appState })
    })
  } catch (error) {
    console.error('Failed to initialize store:', error)
    useStore.setState({ isLoading: false })
  }
} 