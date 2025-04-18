import { ipcMain, safeStorage } from 'electron'

export function setupSecurityHandlers(): void {
  ipcMain.handle('encrypt-password', async (event, password: string) => {
    try {
      const encryptedBuffer = safeStorage.encryptString(password)
      return { success: true, data: encryptedBuffer.toString('base64') }
    } catch (error) {
      console.error('Error encrypting password:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
} 