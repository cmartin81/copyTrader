import React, { useState, useEffect } from 'react'
import { useBotWindowStore } from '../store/botWindowStore'
import { SessionState, AppState } from '../../../shared/types'

interface Bot {
  id: string
  name: string
  pnl: number
  isActive: boolean
}

interface StateUpdate {
  sessionState: SessionState
  appState: AppState
  bots: Bot[]
}

interface IpcResponse {
  success: boolean
  error?: string
}

export const Bot: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([])
  const [botName, setBotName] = useState('')
  const { addBotWindow, removeBotWindow } = useBotWindowStore()

  useEffect(() => {
    // Get initial state
    window.api.getInitialState().then((state: StateUpdate) => {
      setBots(state.bots)
    })

    // Listen for state updates
    const handleStateUpdate = (sessionState: SessionState, appState: AppState, bots: Bot[]): void => {
      setBots(bots)
    }

    // Listen for window close events
    const handleWindowClose = (botId: string): void => {
      removeBotWindow(botId)
      // Remove the bot from the local state
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId))
    }

    window.api.onStateUpdate(handleStateUpdate)
    window.electron.ipcRenderer.on('bot-window-closed', (_: Electron.IpcRendererEvent, botId: string) => handleWindowClose(botId))

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('state-updated')
      window.electron.ipcRenderer.removeAllListeners('bot-window-closed')
    }
  }, [removeBotWindow])

  const handleLaunch = async (): Promise<void> => {
    if (!botName.trim()) return

    const botId = Math.random().toString(36).substr(2, 9)
    const response = await window.electron.ipcRenderer.invoke('launch-puppeteer', botId, botName) as IpcResponse
    
    if (response.success) {
      addBotWindow(botId)
      setBotName('')
    } else {
      console.error('Failed to launch bot:', response.error)
    }
  }

  const handleClose = async (botId: string): Promise<void> => {
    const response = await window.electron.ipcRenderer.invoke('close-bot-window', botId) as IpcResponse
    if (response.success) {
      removeBotWindow(botId)
      // Remove the bot from the local state
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId))
    } else {
      console.error('Failed to close bot:', response.error)
    }
  }

  const handleExecuteCommand = async (botId: string): Promise<void> => {
    const command = 'alert("Executing command!")'
    const response = await window.electron.ipcRenderer.invoke('execute-command', botId, command) as IpcResponse
    if (!response.success) {
      console.error('Failed to execute command:', response.error)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          placeholder="Enter bot name"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleLaunch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Launch Bot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((bot) => (
          <div key={bot.id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">{bot.name}</h3>
            <p className="mb-2">Status: {bot.isActive ? 'Active' : 'Inactive'}</p>
            <p className="mb-2">PnL: {bot.pnl}</p>
            <div className="space-x-2">
              <button
                onClick={() => handleExecuteCommand(bot.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
                disabled={!bot.isActive}
              >
                Execute Command
              </button>
              <button
                onClick={() => handleClose(bot.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
                disabled={!bot.isActive}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 