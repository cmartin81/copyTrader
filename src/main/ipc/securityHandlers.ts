import { ipcMain, safeStorage } from 'electron'

export function setupSecurityHandlers(): void {
  ipcMain.handle('encrypt-password', async (_, password: string) => {
    if (!password) {
      return { success: false, error: 'No password provided' }
    }

    try {
      const encrypted = safeStorage.encryptString(password)
      return { success: true, data: encrypted.toString('base64') }
    } catch (error) {
      return { success: false, error: 'Failed to encrypt password' }
    }
  })

  ipcMain.handle('decrypt-password', async (_, encryptedPassword: string) => {
    if (!encryptedPassword) {
      return { success: false, error: 'No encrypted password provided' }
    }

    try {
      const buffer = Buffer.from(encryptedPassword, 'base64')
      const decrypted = safeStorage.decryptString(buffer)
      return { success: true, data: decrypted }
    } catch (error) {
      return { success: false, error: 'Failed to decrypt password' }
    }
  })
} 