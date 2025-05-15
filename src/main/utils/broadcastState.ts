import { BrowserWindow } from 'electron'
import { getAppState, getSessionState } from '../store'
import { SessionState } from '../../shared/types'

let mainWindowRef: BrowserWindow | null = null

export function setBroadcastStateRefs(
  mainWindow: BrowserWindow | null,
  sessionState: SessionState
): void {
  mainWindowRef = mainWindow
  // We don't need to store sessionState as a ref anymore
  // as we'll get the latest state directly from the store
}

export function broadcastState(): void {
  if (mainWindowRef) {
    // Get the latest session state from the store
    const sessionState = getSessionState();
    const appState = getAppState();
    console.log('[broadcastState] Broadcasting state update with session state:', sessionState);

    // Send all three arguments expected by the event listener: sessionState, appState, and bots
    mainWindowRef.webContents.send('state-updated', sessionState, appState, appState.bots || [])
  }
}
