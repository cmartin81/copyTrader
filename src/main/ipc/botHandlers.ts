import { BrowserWindow, ipcMain } from 'electron'
import { getAppState, setAppState } from '../store'
import { logToFile } from '../utils/logger'
import BotManager from '../services/botManager/botManager'
import botManager from '../services/botManager/botManager'

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
      // First, stop the bot using botManager
      const botManager = BotManager.getInstance()
      if (botManager.getCurrentBotId() === botId) {
        await botManager.stop()
      }

      // Then close the browser window if it exists
      const botWindow = activeBrowsers.get(botId)
      if (botWindow) {
        botWindow.close()
        activeBrowsers.delete(botId)
      }

      return { success: true }
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
    const updatedBots = currentState.bots.map((bot) => (bot.id === botId ? { ...bot, pnl } : bot))
    setAppState({
      ...currentState,
      bots: updatedBots
    })
  })

  ipcMain.on('remove-bot', (event, botId) => {
    const currentState = getAppState()
    const updatedBots = currentState.bots.filter((bot) => bot.id !== botId)
    setAppState({
      ...currentState,
      bots: updatedBots
    })
  })

  ipcMain.on('update-bot-status', (event, { botId, isRunning }) => {
    // Update session state to track running bot
    const sessionState = getSessionState()
    setSessionState({
      ...sessionState,
      runningBotId: isRunning ? botId : null
    })
  })

  ipcMain.handle(
    'place-order',
    async (event, { botId, sourceSymbol, orderSize, targetAccountId }) => {
      try {
        logToFile(
          `[Main] PlaceOrder received: botId=${botId}, sourceSymbol=${sourceSymbol}, orderSize=${orderSize}, targetAccountId=${targetAccountId}`
        )
        console.log(`[Main] PlaceOrder received:`, {
          botId,
          sourceSymbol,
          orderSize,
          targetAccountId
        })

        const botManager = BotManager.getInstance()
        // todo: check if running
        if (botManager.getCurrentBotId() === botId) {
          await botManager.placeSingleOrder(targetAccountId, sourceSymbol, orderSize)
          return { success: true }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        logToFile(`[Main] Error placing order: ${errorMessage}`)
        console.error('Error placing order:', error)
        return {
          success: false,
          error: errorMessage
        }
      }
      return {
        success: false,
        error: 'Could not place order...'
      }
    }
  )
}
