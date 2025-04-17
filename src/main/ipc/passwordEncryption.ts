import { ipcMain, safeStorage } from 'electron'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-here' // In production, use a secure key from environment variables

export function setupPasswordEncryptionHandlers() {
  ipcMain.handle('encrypt-password', (_, password: string) => {
    const encryptedBuffer = safeStorage.encryptString(password)
    return encryptedBuffer.toString('base64')
  })

  ipcMain.handle('decrypt-password', (_, encryptedString: string) => {
    const retrievedEncryptedBuffer = Buffer.from(encryptedString, 'base64')
    return safeStorage.decryptString(retrievedEncryptedBuffer)
  })
} 