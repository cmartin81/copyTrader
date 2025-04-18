import { ipcMain } from 'electron'
import { getAppState, setAppState } from '../store'
import { logToFile } from '../utils/logger'

export function setupBotHandlers(): void {
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