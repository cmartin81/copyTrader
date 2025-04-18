import { ipcMain, safeStorage } from 'electron'
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
        let decryptedPassword: string | null = null
        if (credentials.password) {
          try {
            const buffer = Buffer.from(credentials.password, 'base64')
            decryptedPassword = safeStorage.decryptString(buffer)
          } catch (error) {
            console.error('[Main] Error decrypting password:', error)
            return {
              success: false,
              error: 'Failed to decrypt password'
            }
          }
        }

        const targetBrowser = await ProjectXBrowser.create(
          'TopstepX',
          credentials.username,
          decryptedPassword
        )
        await targetBrowser.start()
        const accounts = await targetBrowser.getAccounts()
        console.log('[Main] Retrieved accounts:', accounts)
        await targetBrowser.closeBrowser()
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
