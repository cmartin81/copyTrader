import { BrowserWindow } from 'electron'
import { SessionState } from '../../shared/types'
import { setupStateHandlers } from './stateHandlers'
import { setupBotHandlers } from './botHandlers'
import { setupCounterHandlers } from './counterHandlers'
import { setupPuppeteerHandlers } from './puppeteerHandlers'
import { setupAccountHandlers } from './accountHandlers'
import { setupLogHandlers } from './logHandlers'

export function setupAllIpcHandlers(
  sessionState: SessionState,
  activeBrowsers: Map<string, BrowserWindow>,
  mainWindow: BrowserWindow | null
): void {
  setupStateHandlers(sessionState, activeBrowsers, mainWindow)
  setupBotHandlers()
  setupCounterHandlers(sessionState, mainWindow)
  setupPuppeteerHandlers(activeBrowsers)
  setupAccountHandlers()
  setupLogHandlers()
} 