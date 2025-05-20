import { BrowserWindow } from 'electron'
import { SessionState } from '../../shared/types'
import { setupStateHandlers } from './stateHandlers'
import { setupBotHandlers } from './botHandlers'
import { setupCounterHandlers } from './counterHandlers'
import { setupPuppeteerHandlers } from './puppeteerHandlers'
import { setupAccountHandlers } from './accountHandlers'
import { setupLogHandlers } from './logHandlers'
import { setupSecurityHandlers } from './securityHandlers'
import { setupAuthHandlers } from './authHandlers'

export function setupAllIpcHandlers(
  sessionState: SessionState,
  activeBrowsers: Map<string, BrowserWindow>,
  mainWindow: BrowserWindow | null
): void {
  setupStateHandlers(sessionState, activeBrowsers, mainWindow)
  setupBotHandlers(activeBrowsers)
  setupCounterHandlers(sessionState, mainWindow)
  setupAccountHandlers()
  setupLogHandlers()
  setupSecurityHandlers()
  setupAuthHandlers()
}
