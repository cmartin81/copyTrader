import { BrowserWindow } from 'electron'
import { getAppState } from '../store'
import { SessionState } from '../../shared/types'

let mainWindowRef: BrowserWindow | null = null
let sessionStateRef: SessionState | null = null

export function setBroadcastStateRefs(
  mainWindow: BrowserWindow | null,
  sessionState: SessionState
): void {
  mainWindowRef = mainWindow
  sessionStateRef = sessionState
}

export function broadcastState(): void {
  if (mainWindowRef && sessionStateRef) {
    mainWindowRef.webContents.send('state-updated', sessionStateRef, getAppState())
  }
} 