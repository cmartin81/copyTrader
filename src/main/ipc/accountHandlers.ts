import { ipcMain } from 'electron'
import { ProjectXBrowser } from '../services/projectX/ProjectXBrowser'
const projectXTypes = ['Topstepx', 'Bulenox','TheFuturesDesk', 'TickTickTrader']
export function setupAccountHandlers(): void {
  ipcMain.handle('getPlatformInfo', async (_event, { type, credentials }) => {
    try {
      console.log('[Main] Received getPlatformInfo request with params:', {
        type,
        credentials: {
          ...credentials,
          password: credentials.password ? '********' : undefined
        }
      })

      if (projectXTypes.includes(type)) {
        const targetBrowser = await ProjectXBrowser.create(
          type,
          credentials.username,
          credentials.password
        )
        const isOk = await targetBrowser.start()
        if (!isOk){
          return { success: false, error: 'Could not sign in' }
        }
        const accounts = await targetBrowser.getAccounts()
        const symbols = await targetBrowser.getPlatformSymbols()
        targetBrowser.closeBrowser()
        return { success: true, data: { accounts, symbols } }
      }

      return { success: false, error: 'Unsupported account type' }
    } catch (error) {
      console.error('[Main] Error getting accounts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
}
