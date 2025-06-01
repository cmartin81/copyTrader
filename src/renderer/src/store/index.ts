import { create } from 'zustand'
import { AppState, Bot } from '../../../shared/types'
import { useBotStore } from './botStore'
import { useSessionStore } from '@renderer/store/sessionStore'

// App state store
export const useAppStore = create<AppState & {
  setAppCounter: (value: number) => void
  setBots: (bots: Bot[]) => void
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setExpirationTime: (time: number) => void
  setUser: (user: AppState['user']) => void
}>((set, get) => ({
  appCounter: 0,
  bots: [],
  user: undefined,
  setAppCounter: (value: number) => {
    const currentState = get()
    set({ ...currentState, appCounter: value })
    window.store.setAppState({ ...currentState, appCounter: value })
  },
  setBots: (bots) => {
    const currentState = get()
    set({ ...currentState, bots })
    window.store.setAppState({ ...currentState, bots })
  },
  setAccessToken: (token: string | null) => {
    const currentState = get()
    const user = currentState.user || {}
    const updatedUser = { ...user, accessToken: token || undefined, isLoggedIn: !!token }
    set({ ...currentState, user: updatedUser })
    window.store.setAppState({ ...currentState, user: updatedUser })
  },
  setRefreshToken: (token: string | null) => {
    const currentState = get()
    const user = currentState.user || {}
    const updatedUser = { ...user, refreshToken: token || undefined }
    set({ ...currentState, user: updatedUser })
    window.store.setAppState({ ...currentState, user: updatedUser })
  },
  setExpirationTime: (time: number) => {
    const currentState = get()
    const user = currentState.user || {}
    const updatedUser = { ...user, expirationTime: time }
    set({ ...currentState, user: updatedUser })
    window.store.setAppState({ ...currentState, user: updatedUser })
  },
  setUser: (user) => {
    const currentState = get()
    set({ ...currentState, user })
    window.store.setAppState({ ...currentState, user })
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
