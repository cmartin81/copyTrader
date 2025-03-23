export interface SessionState {
  sessionCounter: number
}

export interface AppState {
  appCounter: number
}

export interface CounterActions {
  incrementSessionCounter: () => void
  decrementSessionCounter: () => void
  incrementAppCounter: () => void
  decrementAppCounter: () => void
} 