import { BrowserWindow, ipcMain } from 'electron'
import { getAppState, setAppState } from '../store'
import { logToFile } from '../utils/logger'
import BotManager from '../services/botManager/botManager'

export function setupBotHandlers(activeBrowsers: Map<string, BrowserWindow>): void {
  ipcMain.handle('launch-bot', async (event, botId, botName) => {
    try {
      const botManager = BotManager.getInstance()
      botManager.initialize(botId)
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
}
