import Store from 'electron-store'
import { AppState } from '../shared/types'

// Create a store for persistent app state
const appStore = new Store<AppState>({
  name: 'app-state',
  defaults: {
    appCounter: 0
  }
})

// Export functions to get and update the persistent state
export const getAppState = (): AppState => {
  const counter = appStore.get('appCounter', 0)
  return { appCounter: counter }
}

export const updateAppCounter = (value: number): void => {
  appStore.set('appCounter', value)
  console.log(`[Main] App counter updated to: ${value}`)
}

// Function to clear all state on app quit if needed
export const clearState = (): void => {
  appStore.clear()
}

export default appStore 