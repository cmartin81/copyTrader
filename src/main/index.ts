import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getAppState, updateAppCounter, getBots, addBot, updateBotPnl, removeBot, updateBotStatus, clearAllBots } from './store'
import { SessionState } from '../shared/types'
import pie from 'puppeteer-in-electron'
import puppeteer from 'puppeteer-core'
import type { Browser } from 'puppeteer-core'

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

// Function to broadcast state updates to all renderer processes
const broadcastState = (): void => {
  mainWindow?.webContents.send('state-updated', sessionState, getAppState(), getBots())
}

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
      appState: getAppState(),
      bots: getBots()
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
      clearAllBots()

      // Broadcast the updated state
      broadcastState()

      return { success: true }
    } catch (error) {
      console.error('Error resetting settings:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }
    }
  })
  
  // Session counter handlers
  ipcMain.on('increment-session-counter', () => {
    sessionState.sessionCounter++
    console.log(`[Main] Session counter incremented to: ${sessionState.sessionCounter}`)
    broadcastState()
  })
  
  ipcMain.on('decrement-session-counter', () => {
    sessionState.sessionCounter--
    console.log(`[Main] Session counter decremented to: ${sessionState.sessionCounter}`)
    broadcastState()
  })
  
  // App counter handlers
  ipcMain.on('increment-app-counter', () => {
    const appState = getAppState()
    const newValue = appState.appCounter + 1
    updateAppCounter(newValue)
    broadcastState()
  })
  
  ipcMain.on('decrement-app-counter', () => {
    const appState = getAppState()
    const newValue = appState.appCounter - 1
    updateAppCounter(newValue)
    broadcastState()
  })
  
  // Set up interval to update counters every 10 seconds
  setInterval(() => {
    // Update session counter
    sessionState.sessionCounter += 10
    console.log(`[Main] Auto-updated session counter to: ${sessionState.sessionCounter}`)
    
    // Update app counter
    const appState = getAppState()
    const newValue = appState.appCounter + 10
    updateAppCounter(newValue)
    
    // Update PnL for all active bots
    const bots = getBots()
    bots.forEach(bot => {
      if (bot.isActive) {
        updateBotPnl(bot.id, bot.pnl + 1)
      }
    })
    
    // Broadcast the updates to the renderer
    broadcastState()
  }, 10000)
}

// Handle Puppeteer launch request
ipcMain.handle('launch-puppeteer', async (_, botId: string, botName: string) => {
  try {
    // Create a new browser window
    const browserWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // Store the window instance
    activeBrowsers.set(botId, browserWindow);

    // Add bot to store
    addBot({ id: botId, name: botName, isActive: true });

    // Connect puppeteer to the window
    const browser = await pie.connect(app, puppeteer as any);
    const page = await pie.getPage(browser, browserWindow);

    // Load the URL
    await browserWindow.loadURL('https://www.google.com');
    browserWindow.show();

    // Type "hello" in the search field after 4 seconds
    setTimeout(async () => {
      if (activeBrowsers.has(botId)) {
        try {
          await page.type('textarea[name="q"]', 'hello');
        } catch (error) {
          console.error('Error typing in search field:', error);
        }
      }
    }, 4000);

    // Execute console.log and alert after 8 seconds
    setTimeout(async () => {
      if (activeBrowsers.has(botId)) {
        try {
          await page.evaluate(() => {
            console.log('hello from electron');
            alert('hi');
          });
        } catch (error) {
          console.error('Error executing delayed commands:', error);
        }
      }
    }, 8000);

    // Listen for window close event
    browserWindow.on('closed', () => {
      activeBrowsers.delete(botId);
      updateBotStatus(botId, false);
      removeBot(botId); // Remove the bot from the store when window is closed
      // Notify renderer that the window was closed
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('bot-window-closed', botId);
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Puppeteer error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
});

// Handle window close request
ipcMain.handle('close-bot-window', async (_, botId: string) => {
  try {
    const browserWindow = activeBrowsers.get(botId);
    if (browserWindow) {
      browserWindow.close();
      activeBrowsers.delete(botId);
      updateBotStatus(botId, false);
      removeBot(botId); // Remove the bot from the store
      return { success: true };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    console.error('Error closing window:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
});

// Handle execute command request
ipcMain.handle('execute-command', async (_, botId: string, command: string) => {
  try {
    const browserWindow = activeBrowsers.get(botId);
    if (!browserWindow) {
      return { success: false, error: 'Window not found' };
    }

    const browser = await pie.connect(app, puppeteer as any);
    const page = await pie.getPage(browser, browserWindow);
    await page.evaluate(command);
    return { success: true };
  } catch (error) {
    console.error('Error executing command:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
});

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

// Clear the interval when the app is about to quit
app.on('before-quit', () => {
  // Close all bot windows
  activeBrowsers.forEach((browserWindow) => {
    browserWindow.close()
  })
  activeBrowsers.clear()
  mainWindow = null
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
