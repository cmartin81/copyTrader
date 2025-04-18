export interface StoreAPI {
  // App state methods
  getAppState: () => Promise<any>
  setAppState: (state: any) => Promise<void>

  // Session state methods
  getSessionState: () => Promise<any>
  setSessionState: (state: any) => Promise<void>

  // Bot management methods
  getBots: () => Promise<any[]>
  setBots: (bots: any[]) => Promise<void>
  updateBot: (botId: string, updates: any) => Promise<void>
  deleteBot: (botId: string) => Promise<void>

  // State listeners
  onAppStateUpdate: (callback: (state: any) => void) => () => void

  // Session counter methods
  incrementSessionCounter: () => Promise<void>
  decrementSessionCounter: () => Promise<void>
  getSessionCounter: () => Promise<number>

  // Security methods
  encryptPassword: (password: string) => Promise<string>
  decryptPassword: (encryptedPassword: string) => Promise<string>

  // Logs directory
  openLogsDirectory: () => Promise<void>
}

declare global {
  interface Window {
    store: StoreAPI
  }
} 