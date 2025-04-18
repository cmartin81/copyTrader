import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.png'
import { getAppState, setAppState, getSessionState, setSessionState } from './store'
import { SessionState } from '../shared/types'
import pie from 'puppeteer-in-electron'
import puppeteer from 'puppeteer-core'
import type { Browser } from 'puppeteer-core'
import BotManager from './services/botManager/botManager'
import { logToFile, getLogsDirectory, createNewLogFile } from './utils/logger'
import { setupPasswordEncryptionHandlers } from './ipc/passwordEncryption'

// Session state (non-persistent, reset on app restart)
const sessionState: SessionState = {
  sessionCounter: 0
}

// Reference to main window for broadcasting from interval
let mainWindow: BrowserWindow | null = null

// Store active browser instances
const activeBrowsers = new Map<string, BrowserWindow>()

// Initialize puppeteer-in-electron before app is ready
pie.initialize(app).catch(console.error);

// Create a new log file on app start
createNewLogFile()

// Log app start
logToFile('Application started')

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Set up IPC handlers for state management
  ipcMain.handle('get-initial-state', () => {
    return {
      sessionState,
      appState: getAppState()
    }
  })

  // Add handler for resetting all settings
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

  // Bot management handlers
  ipcMain.on('set-bots', (event, bots) => {
    const currentState = getAppState()
    setAppState({ ...currentState, bots })
    logToFile(`Bots updated: ${JSON.stringify(bots)}`)
  })

  // Session counter handlers
  ipcMain.on('increment-session-counter', () => {
    sessionState.sessionCounter++
    logToFile(`Session counter incremented to: ${sessionState.sessionCounter}`)
    broadcastState()
  })

  ipcMain.on('decrement-session-counter', () => {
    sessionState.sessionCounter--
    logToFile(`Session counter decremented to: ${sessionState.sessionCounter}`)
    broadcastState()
  })

  // App counter handlers
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

  // Bot management handlers
  ipcMain.on('add-bot', (event, { botId, botName }) => {
    const currentState = getAppState()
    const newBot = {
      id: botId,
      name: botName,
      isRunning: false,
      isActive: true,
      pnl: 0,
      targetAccounts: [],
      masterAccount: {
        type: 'Personal' as const,
        connectionType: 'MT4' as const,
        credentials: {
          username: '',
          password: ''
        }
      }
    }
    setAppState({
      ...currentState,
      bots: [...currentState.bots, newBot]
    })
  })

  ipcMain.on('update-bot-pnl', (event, { botId, pnl }) => {
    const currentState = getAppState()
    const updatedBots = currentState.bots.map(bot =>
      bot.id === botId ? { ...bot, pnl } : bot
    )
    setAppState({
      ...currentState,
      bots: updatedBots
    })
  })

  ipcMain.on('remove-bot', (event, botId) => {
    const currentState = getAppState()
    const updatedBots = currentState.bots.filter(bot => bot.id !== botId)
    setAppState({
      ...currentState,
      bots: updatedBots
    })
  })

  ipcMain.on('update-bot-status', (event, { botId, isActive }) => {
    const currentState = getAppState()
    const updatedBots = currentState.bots.map(bot =>
      bot.id === botId ? { ...bot, isActive } : bot
    )
    setAppState({
      ...currentState,
      bots: updatedBots
    })
  })

  // Add handler for launching puppeteer
  ipcMain.handle('launch-puppeteer', async (event, botId, botName) => {
    try {
      const botManager = new BotManager(botId)

      await botManager.start()
      // Create a new browser window for the bot
      // const botWindow = new BrowserWindow({
      //   width: 800,
      //   height: 600,
      //   show: false,
      //   webPreferences: {
      //     nodeIntegration: true,
      //     contextIsolation: false
      //   }
      // })
      //
      // // Store the browser instance
      // activeBrowsers.set(botId, botWindow)
      //
      // // Load the bot's page
      // await botWindow.loadURL('about:blank')
      // botWindow.show()

      return { success: true }
    } catch (error) {
      console.error('Error launching puppeteer:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Add handler for closing bot window
  ipcMain.handle('close-bot-window', async (event, botId) => {
    try {
      const botWindow = activeBrowsers.get(botId)
      if (botWindow) {
        botWindow.close()
        activeBrowsers.delete(botId)
        return { success: true }
      }
      return { success: false, error: 'Window not found' }
    } catch (error) {
      console.error('Error closing bot window:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Set up interval to update counters every 10 seconds
  setInterval(() => {
    try {
      // Update session counter
      sessionState.sessionCounter += 10
      console.log(`[Main] Auto-updated session counter to: ${sessionState.sessionCounter}`)

      // Update app counter and bots
      const currentState = getAppState()
      if (currentState) {
        // Update app counter
        const newState = {
          ...currentState,
          appCounter: currentState.appCounter + 10,
          bots: currentState.bots?.map(bot => {
            if (bot.isActive) {
              return { ...bot, pnl: bot.pnl + 1 }
            }
            return bot
          }) || []
        }
        setAppState(newState)
      }

    } catch (error) {
      console.error('Error in interval update:', error)
    }
  }, 10000)
}

// Function to broadcast state updates to renderer
export function broadcastState(): void {
  if (mainWindow) {
    mainWindow.webContents.send('state-updated', sessionState, getAppState())
  }
}

// Handle opening logs directory
ipcMain.on('open-logs-directory', () => {
  shell.openPath(getLogsDirectory())
})

// Handle state updates
ipcMain.on('state-updated', () => {
  logToFile('State updated')
})

// Set up IPC handlers
setupPasswordEncryptionHandlers()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Log app quit
app.on('before-quit', () => {
  logToFile('Application quitting')
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
