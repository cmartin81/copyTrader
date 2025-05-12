import { ipcMain, BrowserWindow } from 'electron'
import { getAppState, setAppState } from '../store'
import { logToFile } from '../utils/logger'
import { SessionState } from '../../shared/types'
import { broadcastState } from '../utils/broadcastState'

export function setupCounterHandlers(
  sessionState: SessionState,
  mainWindow: BrowserWindow | null
): void {
  ipcMain.on('increment-session-counter', () => {
    sessionState.sessionCounter++
    logToFile(`Session counter incremented to: ${sessionState.sessionCounter}`)
    broadcastState(mainWindow, sessionState)
  })

  ipcMain.on('decrement-session-counter', () => {
    sessionState.sessionCounter--
    logToFile(`Session counter decremented to: ${sessionState.sessionCounter}`)
    broadcastState(mainWindow, sessionState)
  })

  ipcMain.on('increment-app-counter', () => {
    const currentState = getAppState()
    const newState = { ...currentState, appCounter: currentState.appCounter + 1 }
    setAppState(newState)
    logToFile(`App counter incremented to: ${newState.appCounter}`)
  })

  ipcMain.on('decrement-app-counter', () => {
    const currentState = getAppState()
    const newState = { ...currentState, appCounter: currentState.appCounter - 1 }
    setAppState(newState)
    logToFile(`App counter decremented to: ${newState.appCounter}`)
  })
}
