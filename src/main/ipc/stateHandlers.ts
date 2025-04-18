import { ipcMain, BrowserWindow } from 'electron'
import { getAppState, setAppState } from '../store'
import { logToFile } from '../utils/logger'
import { SessionState } from '../../shared/types'
import { broadcastState } from '../utils/broadcastState'

export function setupStateHandlers(
  sessionState: SessionState,
  activeBrowsers: Map<string, BrowserWindow>,
  mainWindow: BrowserWindow | null
): void {
  ipcMain.handle('get-initial-state', () => {
    return {
      sessionState,
      appState: getAppState()
    }
  })

  ipcMain.handle('reset-all-settings', async () => {
    try {
      // Close all bot windows
      activeBrowsers.forEach((browserWindow) => {
        browserWindow.close()
      })
      activeBrowsers.clear()

      // Clear all bots from store
      setAppState({ ...getAppState(), bots: [] })

      return { success: true }
    } catch (error) {
      console.error('Error resetting settings:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    }
  })

  ipcMain.on('set-bots', (event, bots) => {
    const currentState = getAppState()
    setAppState({ ...currentState, bots })
    logToFile(`Bots updated: ${JSON.stringify(bots)}`)
  })

  ipcMain.on('state-updated', () => {
    logToFile('State updated')
    broadcastState(mainWindow, sessionState)
  })
} 