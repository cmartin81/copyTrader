import { ipcMain, safeStorage } from 'electron'

export function setupSecurityHandlers(): void {
  ipcMain.handle('encrypt-password', async (event, password: string) => {
    try {
      const encryptedBuffer = safeStorage.encryptString(password)
      return encryptedBuffer.toString('base64')
    } catch (error) {
      console.error('Error encrypting password:', error)
      throw error
    }
  })
} 