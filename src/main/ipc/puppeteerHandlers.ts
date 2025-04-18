import { ipcMain, BrowserWindow } from 'electron'
import BotManager from '../services/botManager/botManager'
import { logToFile } from '../utils/logger'

export function setupPuppeteerHandlers(activeBrowsers: Map<string, BrowserWindow>): void {
  ipcMain.handle('launch-puppeteer', async (event, botId, botName) => {
    try {
      const botManager = new BotManager(botId)
      await botManager.start()
      return { success: true }
    } catch (error) {
      console.error('Error launching puppeteer:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

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
} 