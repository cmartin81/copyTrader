import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png'
import { getAppState, setAppState, getSessionState, setSessionState, updateSessionCounter } from './store'
import { SessionState } from '../shared/types'
import pie from 'puppeteer-in-electron'
import puppeteer from 'puppeteer-core'
import type { Browser } from 'puppeteer-core'
import BotManager from './services/botManager/botManager'
import { logToFile, getLogsDirectory, createNewLogFile } from './utils/logger'
import { setupAllIpcHandlers } from './ipc'
import { setBroadcastStateRefs } from './utils/broadcastState'

// We'll use the session state from store.ts instead of creating a new one here
// This helps avoid having multiple session state objects that can get out of sync

// Reference to main window for broadcasting from interval
let mainWindow: BrowserWindow | null = null

// Store active browser instances
const activeBrowsers = new Map<string, BrowserWindow>()

// Flag to track if bot windows have been closed
let botWindowsClosed = false

// Initialize puppeteer-in-electron before app is ready
pie.initialize(app).catch(console.error);

// Create a new log file on app start
createNewLogFile()

// Log app start
logToFile('Application started')

function createWindow(): void {
  // Get saved window configuration from AppState
  const appState = getAppState()
  const savedWindowConfig = appState.windowConfig

  // Create the browser window with saved size and position if available
  mainWindow = new BrowserWindow({
    width: savedWindowConfig?.width || 1200,
    height: savedWindowConfig?.height || 800,
    x: savedWindowConfig?.x,
    y: savedWindowConfig?.y,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Set up broadcast state references
  setBroadcastStateRefs(mainWindow, getSessionState())

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Handle the close event on the main window
  mainWindow.on('close', async (event) => {
    console.log('Main window close event triggered')
    logToFile('Main window close event triggered')

    // Prevent the window from closing immediately
    event.preventDefault()

    // Stop all bots and close their windows if not already closed
    if (!botWindowsClosed) {
      try {
        const botManager = BotManager.getInstance()
        await botManager.stop()
        botWindowsClosed = true
        logToFile('All bot windows closed from main window close event')
        console.log('All bot windows closed from main window close event')
      } catch (error) {
        console.error('Error stopping bots:', error)
        logToFile(`Error stopping bots: ${error}`)
      }
    } else {
      console.log('Bot windows already closed, continuing with close')
      logToFile('Bot windows already closed, continuing with close in main window close event')
    }

    // Save window size and position before closing
    if (mainWindow) {
      const currentState = getAppState()
      setAppState({
        ...currentState,
        windowConfig:  mainWindow.getBounds()
      })
      logToFile('Window configuration saved before closing')
    }

    // Now close the window
    mainWindow?.destroy()
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

  // Set up all IPC handlers
  setupAllIpcHandlers(getSessionState(), activeBrowsers, mainWindow)

  // Set up interval to update counters every 10 seconds
  setInterval(() => {
    try {
      // Update session counter using the function from store.ts
      const currentSessionState = getSessionState();
      updateSessionCounter(currentSessionState.sessionCounter + 10)
      console.log(`[Main] Auto-updated session counter to: ${getSessionState().sessionCounter}`)

      // Update app counter and bots
      const currentState = getAppState()
      if (currentState) {
        // Update app counter
        const newState = {
          ...currentState,
          appCounter: currentState.appCounter + 10,
          bots: currentState.bots?.map(bot => {
            // Get the latest session state to check for running bot
            const latestSessionState = getSessionState();
            if (latestSessionState.runningBot?.id === bot.id) {
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


app.on('window-all-closed', async () => {
  console.log('All windows closed')

  // Stop all bots and close their windows before quitting (if not already closed)
  if (!botWindowsClosed) {
    try {
      const botManager = BotManager.getInstance()
      await botManager.stop()
      botWindowsClosed = true
      logToFile('All bot windows closed from window-all-closed event')
      console.log('All bot windows closed from window-all-closed event')
    } catch (error) {
      console.error('Error stopping bots:', error)
      logToFile(`Error stopping bots: ${error}`)
    }
  } else {
    console.log('Bot windows already closed, skipping')
    logToFile('Bot windows already closed, skipping in window-all-closed')
  }

  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

// Log app quit and close all bot windows if not already closed
app.on('before-quit', async (event) => {
  logToFile('Application quitting')

  // Stop all bots and close their windows if not already closed
  if (!botWindowsClosed) {
    // Prevent the app from quitting until we've closed all windows
    event.preventDefault()

    try {
      const botManager = BotManager.getInstance()
      await botManager.stop()
      botWindowsClosed = true
      logToFile('All bot windows closed from before-quit event')
      console.log('All bot windows closed from before-quit event')

      // Now we can quit the app
      app.quit()
    } catch (error) {
      console.error('Error stopping bots:', error)
      logToFile(`Error stopping bots: ${error}`)

      // Still try to quit even if there was an error
      app.quit()
    }
  } else {
    console.log('Bot windows already closed, continuing with quit')
    logToFile('Bot windows already closed, continuing with quit in before-quit')
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
