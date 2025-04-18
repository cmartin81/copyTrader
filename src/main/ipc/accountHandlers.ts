import { ipcMain } from 'electron'
import { ProjectXBrowser } from '../services/projectX/ProjectXBrowser'

export function setupAccountHandlers(): void {
  ipcMain.handle('getAccounts', async (event, { type, credentials }) => {
    try {
      console.log('[Main] Received getAccounts request with params:', {
        type,
        credentials: {
          ...credentials,
          password: credentials.password ? '********' : undefined
        }
      })

      if (type === 'TopstepX') {
        const targetBrowser = await ProjectXBrowser.create(
          'TopstepX',
          credentials.username,
          credentials.password
        )
        const isOk = await targetBrowser.start()
        if (!isOk){
          return { success: false, error: 'Unsupported account type' }
        }
        const accounts = await targetBrowser.getAccounts()
        console.log('[Main] Retrieved accounts:', accounts)
        targetBrowser.closeBrowser()

        return { success: true, data: accounts }
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
