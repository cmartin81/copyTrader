import { app } from 'electron'
import Store from 'electron-store'
import { AppState } from '../shared/types'

interface BotState {
  id: string
  name: string
  pnl: number
  isActive: boolean
}

interface StoreSchema {
  appCounter: number
  bots: BotState[]
}

// Create a store for persistent app state
const appStore = new Store<StoreSchema>({
  name: 'app-state',
  defaults: {
    appCounter: 0,
    bots: []
  }
})

// Export functions to get and update the persistent state
export function getAppState(): AppState {
  const counter = appStore.get('appCounter', 0)
  return { appCounter: counter }
}

export function updateAppCounter(value: number): void {
  appStore.set('appCounter', value)
  console.log(`[Main] App counter updated to: ${value}`)
}

export function getBots(): BotState[] {
  return appStore.get('bots', [])
}

export function addBot(bot: Omit<BotState, 'pnl'>): void {
  const bots = getBots()
  bots.push({ ...bot, pnl: 0 })
  appStore.set('bots', bots)
}

export function updateBotPnl(botId: string, pnl: number): void {
  const bots = getBots()
  const botIndex = bots.findIndex(bot => bot.id === botId)
  if (botIndex !== -1) {
    bots[botIndex].pnl = pnl
    appStore.set('bots', bots)
  }
}

export function removeBot(botId: string): void {
  const bots = getBots()
  const filteredBots = bots.filter(bot => bot.id !== botId)
  appStore.set('bots', filteredBots)
}

export function updateBotStatus(botId: string, isActive: boolean): void {
  const bots = getBots()
  const botIndex = bots.findIndex(bot => bot.id === botId)
  if (botIndex !== -1) {
    bots[botIndex].isActive = isActive
    appStore.set('bots', bots)
  }
}

export function clearAllBots(): void {
  appStore.set('bots', [])
}

// Function to clear all state on app quit if needed
export function clearState(): void {
  appStore.clear()
}

export default appStore 