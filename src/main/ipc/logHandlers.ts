import { ipcMain, shell } from 'electron'
import { getLogsDirectory } from '../utils/logger'

export function setupLogHandlers(): void {
  ipcMain.on('open-logs-directory', () => {
    shell.openPath(getLogsDirectory())
  })
} 