import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBotStore, Bot, MasterAccount } from '../store/botStore'
import { useSessionStore } from '../store/sessionStore'
import { createPortal } from 'react-dom'
import { v4 as uuidv4 } from 'uuid'
import { TargetAccount, IpcResponse } from '../types/window'
import MasterAccountCard from '../components/MasterAccountCard'

type LogSize = 'normal' | 'half' | 'full'

// Type guard for IpcResponse
const isIpcResponse = (response: unknown): response is IpcResponse => {
  return typeof response === 'object' && response !== null && 'success' in response
}

const projectXTypes = ['TopstepX', 'Bulenox', 'TheFuturesDesk', 'TickTickTrader']
const Bots: React.FC = () => {
  const { botId } = useParams<{ botId: string }>()
  const navigate = useNavigate()
  const { bots, updateBot, toggleBot, deleteBot, updateBotPnl } = useBotStore()
  const { addAlert } = useSessionStore()
  const bot = bots.find(b => b.id === botId)

  const [logs, setLogs] = useState<string[]>([])
  const [logSize, setLogSize] = useState<LogSize>('normal')
  const [isTailing, setIsTailing] = useState(true)
  const [isReversed, setIsReversed] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isEditingAvatar] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const logContainerRef = React.useRef<HTMLDivElement>(null)
  const [showAddTarget, setShowAddTarget] = useState(false)
  const [showTestMenu, setShowTestMenu] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [editedAccount, setEditedAccount] = useState<Partial<Bot['targetAccounts'][0]>>({
    type: undefined,
    accountId: '',
    credentials: undefined
  })
  const [newTargetAccount, setNewTargetAccount] = useState<Partial<Bot['targetAccounts'][0]>>({
    type: undefined,
    accountId: '',
    credentials: {
      username: '',
      password: ''
    },
    symbolMappings: []
  })
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false)
  const [accounts, setAccounts] = useState<{ id: string; name: string; alias: string | null }[]>([])
  const [symbols, setSymbols] = useState<{ id: string; name: string; short: string | null }[]>([])

  const avatarOptions = [
    // Trading & Finance
    '📈', '📉', '💰', '💸', '💵', '💹', '📊', '💎', '💱', '💲', '💳', '💴', '💶', '💷',
    // Bot & Tech
    '🤖', '⚡', '⚙️', '🔧', '🛠️', '💻', '🔌', '💾', '📱', '🔋', '💡', '🔬', '🔭', '📡', '🛰️', '🔮',
    // Game & Sports
    '🎮', '🎲', '🎯', '🎪', '🎟️', '🎠', '🎨', '🎭', '🎫', '🎬', '🎳', '🎸', '🎺', '🎻',
    // Nature & Weather
    '🌱', '🌿', '🌳', '🌲', '🌴', '🌵', '🌺', '🌸', '🌼', '🌻', '🌹', '🌷', '🍀', '🌾', '🌽', '🍄',
    // Space & Science
    '🚀', '🌍', '🌎', '��', '⭐', '🌙', '☄️', '🌠', '🌌', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗',
    // Animals & Pets
    '🦊', '🦁', '🐯', '🐸', '🐼', '🐨', '🦒', '🦝', '🦨', '🦡', '🦃', '🐓', '🦅', '🦆', '🦉', '🦚',
    // Food & Drink
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍍', '🥭', '🍏',
    // Tools & Office
    '📎', '✂️', '📏', '📌', '📍', '✒️', '✏️', '📝', '📋', '📑', '📒', '📓', '📔', '📕', '📗', '📘',
    // Weather & Nature
    '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '🌪️', '🌫️', '🌊', '🌋', '🗻', '🏔️',
    // Smiling Faces
    '😊', '😃', '😄', '😁', '😅', '😂', '🤣', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    // Cool Faces
    '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
    // Love & Hearts
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    // Hands & Gestures
    '👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '👋', '🤚', '🖐️', '✋', '🖖', '👊', '🤛', '🤜'
  ]

  useEffect(() => {
    if (!bot) {
      navigate('/')
    } else {
      if (!isEditingName) {
        setEditedName(bot.name)
      }
      if (!isEditingAvatar) {
        setSelectedAvatar(bot.avatar || '')
      }
    }
  }, [bot, navigate, isEditingName, isEditingAvatar])

  // Listen for state updates from main process
  useEffect(() => {
    const handleStateUpdate = (sessionState: any, appState: any, bots: any[]): void => {
      const updatedBot = bots.find(b => b.id === botId)
      if (updatedBot) {
        updateBotPnl(botId!, updatedBot.pnl)
      }
    }

    window.store.onAppStateUpdate((state) => {
      if (state.bots) {
        const updatedBot = state.bots.find(b => b.id === botId)
        if (updatedBot) {
          updateBotPnl(botId!, updatedBot.pnl)
        }
      }
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('app-state-updated')
    }
  }, [botId, updateBotPnl])

  if (!bot) {
    return null
  }

  const handleDeleteBot = (): void => {
    if (window.confirm(`Are you sure you want to delete the bot "${bot.name}"?`)) {
      deleteBot(bot.id)
      navigate('/')
      addLog(`Bot deleted: ${bot.name}`)
    }
  }

  const handleSaveName = (): void => {
    if (editedName.trim() && editedName !== bot.name) {
      updateBot(bot.id, { name: editedName.trim() })
      setIsEditingName(false)
      addLog(`Bot name updated to: ${editedName.trim()}`)
    }
  }

  const toggleBotRunning = async (): Promise<void> => {
    try {
      const isRunning = useSessionStore.getState().runningBot?.id === bot.id

      if (!isRunning) {
        // Check if any other bots are running
        const runningBot = useSessionStore.getState().runningBot
        if (runningBot && runningBot.id !== bot.id) {
          addAlert('warning', 'Only one bot can run at a time. Please stop the running bot first.')
          return
        }

        // Start the bot
        // alert(JSON.stringify(bot))
        const response = await window.electron.ipcRenderer.invoke('launch-bot', bot.id, bot.name)
        if (response.success) {
          toggleBot(bot.id)
          addLog('Bot started successfully')
        } else {
          console.error('Failed to start bot:', response.error)
          addLog(`Failed to start bot: ${response.error}`)
          addAlert('error', `Failed to start bot: ${response.error}`)
        }
      } else {
        // Stop the bot
        const response = await window.electron.ipcRenderer.invoke('close-bot-window', bot.id)
        if (response.success) {
          toggleBot(bot.id)
          addAlert('success', 'Bot stopped successfully')
        } else if (response.error === 'Window not found') {
          // If window is already closed, just update the state
          toggleBot(bot.id)
          addAlert('info', 'Bot window was already closed')
        } else {
          console.error('Failed to stop bot:', response.error)
          addLog(`Failed to stop bot: ${response.error}`)
          addAlert('error', `Failed to stop bot: ${response.error}`)
        }
      }
    } catch (error) {
      console.error('Error toggling bot:', error)
      addLog(`Error toggling bot: ${error instanceof Error ? error.message : 'Unknown error'}`)
      addAlert('error', `Error toggling bot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const addLog = (message: string): void => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleAddTargetAccount = async (): Promise<void> => {
    if (newTargetAccount.type && newTargetAccount.accountId && newTargetAccount.credentials?.username && newTargetAccount.credentials?.password) {
      try {
        // Encrypt the password before saving
        const encryptedPassword = await window.electron.ipcRenderer.invoke('encrypt-password', newTargetAccount.credentials.password)

        updateBot(bot.id, {
          targetAccounts: [
            ...bot.targetAccounts,
            {
              id: uuidv4(),
              type: newTargetAccount.type,
              accountId: newTargetAccount.accountId,
              credentials: {
                username: newTargetAccount.credentials.username,
                password: encryptedPassword
              },
              accounts: accounts,
              symbols: symbols,
              symbolMappings: []
            }
          ]
        })
        setNewTargetAccount({
          type: undefined,
          accountId: '',
          credentials: {
            username: '',
            password: ''
          },
          symbolMappings: []
        })
        setShowAddTarget(false)
        addLog(`Added new target account: ${newTargetAccount.type}`)
      } catch (error) {
        addLog(`Error encrypting password: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return
      }
    }
  }

  const handleAddSymbolMapping = (targetId: string): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          return {
            ...account,
            symbolMappings: [...account.symbolMappings, {
              sourceSymbol: '',
              targetSymbolId: '',
              multiplier: 1,
              isEditing: true
            }]
          }
        }
        return account
      })
    })
  }

  const handleSaveMapping = (targetId: string, index: number): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          const newMappings = [...account.symbolMappings]
          const mapping = newMappings[index]
          newMappings[index] = { ...mapping, isEditing: false }
          addLog(`Saved mapping for ${account.type}: ${mapping.sourceSymbol} → ${mapping.targetSymbolId} (x${mapping.multiplier})`)
          return { ...account, symbolMappings: newMappings }
        }
        return account
      })
    })
  }

  const handleEditMapping = (targetId: string, index: number): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          const newMappings = [...account.symbolMappings]
          newMappings[index] = { ...newMappings[index], isEditing: true }
          return { ...account, symbolMappings: newMappings }
        }
        return account
      })
    })
  }

  const handleDeleteSymbolMapping = (targetId: string, index: number): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          const newMappings = account.symbolMappings.filter((_, i) => i !== index)
          addLog(`Deleted mapping from ${account.type}`)
          return { ...account, symbolMappings: newMappings }
        }
        return account
      })
    })
  }

  const getLogClassName = (): string => {
    switch (logSize) {
      case 'half':
        return 'h-5/9 absolute bottom-0 left-0 right-0 mx-6 bg-base-300 rounded-lg p-6 border-t border-base-content/10 transition-all duration-300 z-10'
      case 'full':
        return 'absolute top-[1rem] bottom-0 left-0 right-0 mx-6 bg-base-300 rounded-lg p-6 transition-all duration-300 z-10'
      default:
        return 'h-48 mx-6 mb-6 bg-base-300 rounded-lg p-6 border-t border-base-content/10 transition-all duration-300'
    }
  }

  const getMainContentClassName = (): string => {
    if (logSize === 'half') {
      return 'flex flex-1 p-6 gap-6 overflow-auto min-h-0 pb-[50vh]'
    }
    if (logSize === 'full') {
      return 'flex flex-1 p-6 gap-6 overflow-hidden opacity-0 pointer-events-none'
    }
    return 'flex flex-1 p-6 gap-6 overflow-auto min-h-0'
  }

  const handleAvatarChange = (emoji: string): void => {
    updateBot(bot.id, { avatar: emoji })
    addLog(`Bot avatar updated to ${emoji}`)
  }

  const handleTestOrder = async (accountId: string, side: 'buy' | 'sell', mapping: { sourceSymbol: string }): Promise<void> => {
    try {
      const orderSize = side === 'buy' ? 1 : -1
      const response = await window.electron.ipcRenderer.invoke('place-order', {
        botId,
        sourceSymbol: mapping.sourceSymbol,
        orderSize,
        targetAccountId: accountId
      })

      if (response.success) {
        addLog(`Test ${side} order placed for ${mapping.sourceSymbol} on account ${accountId}`)
        addAlert('success', `Test ${side} order placed successfully`)
      } else {
        addLog(`Failed to place ${side} order: ${response.error}`)
        addAlert('error', `Failed to place order: ${response.error}`)
      }
    } catch (error) {
      console.error('Error placing test order:', error)
      addLog(`Error placing ${side} order: ${error instanceof Error ? error.message : 'Unknown error'}`)
      addAlert('error', `Error placing order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setTestSymbol('')
  }

  const handleSyncAccounts = async (): Promise<void> => {
    try {
      addLog('Syncing ProjectX account...')

      // Get the current account being edited or added
      const currentAccount = editingAccount
        ? bot.targetAccounts.find(acc => acc.id === editingAccount)
        : newTargetAccount

      if (!currentAccount?.type || !currentAccount.credentials) {
        addLog('No account type or credentials found')
        return
      }

      // Send request to main process
      const response = await window.electron.ipcRenderer.invoke('getPlatformInfo', {
        type: currentAccount.type,
        credentials: currentAccount.credentials
      })

      if (response.success) {
        setAccounts(response.data.accounts)
        setSymbols(response.data.symbols)
        addLog('Account sync completed')
        addAlert('success', `Account sync completed`)

      } else {
        addLog(`Error syncing accounts: ${response.error}`)
        addAlert('error', `Error syncing accounts: ${response.error}`)
      }
    } catch (error) {
      console.error('Error syncing accounts:', error)
      addLog(`Error syncing accounts: ${error instanceof Error ? error.message : 'Unknown error'}`)
      addAlert('error', `Error syncing accounts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditAccount = (account: Bot['targetAccounts'][0]): void => {
    setEditingAccount(account.id)
    setEditedAccount({
      type: account.type,
      accountId: account.accountId,
      credentials: undefined
    })

    // Set the accounts data from the existing account
    if (account.accounts) {
      setAccounts(account.accounts)
    }
  }

  const handleSaveAccount = async (accountId: string): Promise<void> => {
    if (editedAccount.type && editedAccount.accountId) {
      const originalAccount = bot.targetAccounts.find(acc => acc.id === accountId)
      if (!originalAccount) return

      // Only update non-credential fields
      updateBot(bot.id, {
        targetAccounts: bot.targetAccounts.map(acc => {
          if (acc.id === accountId) {
            return {
              ...acc,
              type: editedAccount.type!,
              accountId: editedAccount.accountId!
              // Don't include credentials at all
            }
          }
          return acc
        })
      })
      setEditingAccount(null)
      setEditedAccount({
        type: undefined,
        accountId: '',
        credentials: undefined
      })
      addLog(`Updated account: ${editedAccount.type}`)
    }
  }

  const handleChangePassword = async (accountId: string): Promise<void> => {
    if (!newPassword) {
      setShowPasswordModal(null)
      setNewPassword('')
      return
    }

    try {
      // Encrypt the new password
      const encryptedPassword = await window.electron.ipcRenderer.invoke('encrypt-password', newPassword)

      const originalAccount = bot.targetAccounts.find(acc => acc.id === accountId)
      if (!originalAccount) return

      // Only update the password
      updateBot(bot.id, {
        targetAccounts: bot.targetAccounts.map(acc => {
          if (acc.id === accountId) {
            return {
              ...acc,
              credentials: {
                username: originalAccount.credentials?.username || '',
                password: encryptedPassword
              }
            }
          }
          return acc
        })
      })
      addLog('Password updated successfully')
    } catch (error) {
      addLog(`Error encrypting password: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return
    }

    setShowPasswordModal(null)
    setNewPassword('')
  }

  return (
    <div className="">
      <div className="flex flex-col h-screen relative">
        <div className="mx-6 mt-6 z-20">
          <div className="bg-base-100 rounded-lg p-6 border border-base-300">
            <div className="flex justify-between items-center">
              <div className="flex-1 flex items-center gap-6">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input input-bordered text-3xl font-bold h-auto py-1"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveName()
                        } else if (e.key === 'Escape') {
                          setIsEditingName(false)
                          setEditedName(bot.name)
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        className="btn btn-circle btn-sm btn-ghost"
                        onClick={() => {
                          setIsEditingName(false)
                          setEditedName(bot.name)
                        }}
                        title="Cancel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-circle btn-primary"
                        onClick={handleSaveName}
                        title="Save"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="dropdown dropdown-right">
                      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle relative">
                        {bot.avatar ? (
                          <span className="text-2xl">{bot.avatar}</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                      <ul tabIndex={0} className="dropdown-content absolute z-[99999] menu p-4 shadow-lg bg-base-200 rounded-box w-[40rem] max-h-[40rem] overflow-y-auto">
                        <div className="grid grid-cols-8 gap-2">
                          {avatarOptions.map((emoji) => (
                            <li key={emoji}>
                              <button
                                className={`btn btn-ghost btn-sm text-2xl p-0 h-12 ${
                                  bot.avatar === emoji ? 'bg-primary text-primary-content' : ''
                                }`}
                                onClick={() => handleAvatarChange(emoji)}
                              >
                                {emoji}
                              </button>
                            </li>
                          ))}
                        </div>
                      </ul>
                    </div>
                    <h1 className="text-3xl font-bold">{bot.name}</h1>
                    <button
                      className="btn btn-circle btn-sm btn-ghost"
                      onClick={() => setIsEditingName(true)}
                      title="Edit name"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-error"
                  onClick={handleDeleteBot}
                  title="Delete bot"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Bot
                </button>
                <button
                  onClick={toggleBotRunning}
                  className={`btn btn-lg ${
                    useSessionStore.getState().runningBot?.id === bot.id
                      ? 'btn-error hover:btn-error'
                      : 'btn-success hover:btn-success'
                  } min-w-[150px]`}
                >
                  <div className="flex items-center gap-2">
                    {useSessionStore.getState().runningBot?.id === bot.id ? (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-content opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-error-content"></span>
                        </span>
                        Stop Bot
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-success-content"></span>
                        </span>
                        Start Bot
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0 relative">
          <div className={getMainContentClassName()}>
            {/* Left Side - Master Account */}
            <MasterAccountCard
              bot={bot}
              onUpdate={(updates) => updateBot(bot.id, updates)}
              onAddLog={addLog}
            />

            {/* Right Side - Target Accounts */}
            <div className="w-3/5 bg-base-300 rounded-lg p-6 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Target Accounts</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddTarget(true)}
                >
                  Add Target Account
                </button>
              </div>

              {showAddTarget && (
                <div className="bg-base-200 rounded-lg p-4 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-base-content/70 mb-2">Account Type</label>
                      <select
                        className="select select-bordered w-full"
                        value={newTargetAccount.type || ''}
                        onChange={(e) => setNewTargetAccount({ ...newTargetAccount, type: e.target.value as Bot['targetAccounts'][0]['type'] })}
                      >
                        <option value="">Select account type</option>
                        <option value="TopstepX">TopstepX</option>
                        <option value="Bulenox">Bulenox</option>
                        <option value="TheFuturesDesk">The Futures Desk</option>
                        <option value="TickTickTrader">TickTickTrader</option>
                      </select>
                    </div>
                    {newTargetAccount.type && (
                      <>
                        {(projectXTypes.includes(newTargetAccount.type)) && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-base-content/70 mb-2">Username</label>
                              <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newTargetAccount.credentials?.username || ''}
                                onChange={(e) => setNewTargetAccount({
                                  ...newTargetAccount,
                                  credentials: {
                                    username: e.target.value,
                                    password: newTargetAccount.credentials?.password || ''
                                  }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-base-content/70 mb-2">Password</label>
                              <input
                                type="password"
                                className="input input-bordered w-full"
                                value={newTargetAccount.credentials?.password || ''}
                                onChange={(e) => setNewTargetAccount({
                                  ...newTargetAccount,
                                  credentials: {
                                    username: newTargetAccount.credentials?.username || '',
                                    password: e.target.value
                                  }
                                })}
                              />
                            </div>
                          </div>
                        )}
                        {projectXTypes.includes(newTargetAccount.type) && (
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-sm text-base-content/70 mb-2">Account</label>
                              <select
                                className="select select-bordered w-full"
                                value={newTargetAccount.accountId}
                                onChange={(e) => {
                                  const selectedAccount = accounts.find(a => a.id === e.target.value)
                                  setNewTargetAccount({
                                    ...newTargetAccount,
                                    accountId: e.target.value,
                                    accounts: selectedAccount ? [selectedAccount] : undefined
                                  })
                                }}
                              >
                                <option value="">Select an account</option>
                                {accounts.map(account => (
                                  <option key={account.id} value={account.id}>
                                    {account.alias || account.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              className="btn btn-ghost btn-square"
                              title="Sync accounts"
                              onClick={handleSyncAccounts}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {newTargetAccount.type && !projectXTypes.includes(newTargetAccount.type) && (
                          <div>
                            <label className="block text-sm text-base-content/70 mb-2">Account ID</label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={newTargetAccount.accountId}
                              onChange={(e) => setNewTargetAccount({ ...newTargetAccount, accountId: e.target.value })}
                            />
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button
                        className="btn btn-ghost"
                        onClick={() => setShowAddTarget(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleAddTargetAccount}
                      >
                        Add Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {bot.targetAccounts.map((account) => (
                  <div key={account.id} className="bg-base-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium">
                          {account.type} - {account.accountId}
                          {useSessionStore.getState().runningBot?.id === bot.id && (
                            (() => {
                              const status = useSessionStore.getState().runningBot?.targetAccounts.find(ta => ta.id === account.id)?.status;
                              let badgeClass = "ml-2 badge badge-sm ";

                              switch(status) {
                                case 'starting':
                                  badgeClass += "badge-warning";
                                  break;
                                case 'running':
                                  badgeClass += "badge-success";
                                  break;
                                case 'stopped':
                                  badgeClass += "badge-error";
                                  break;
                                default:
                                  badgeClass += "badge-ghost";
                              }

                              return (
                                <span className={badgeClass}>
                                  {status || 'unknown'}
                                </span>
                              );
                            })()
                          )}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setShowTestMenu(account.id)}
                        >
                          Test
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditAccount(account)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            updateBot(bot.id, {
                              targetAccounts: bot.targetAccounts.filter(a => a.id !== account.id)
                            })
                            addLog(`Deleted account: ${account.type}`)
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {editingAccount === account.id ? (
                      <div className="space-y-4">
                        {editedAccount.type && (
                          <>
                            {(projectXTypes.includes(editedAccount.type)) && (
                              <div className="space-y-4">
                                <div className="flex gap-4 items-end">
                                  <div className="flex-1">
                                    <label className="block text-sm text-base-content/70 mb-2">Username</label>
                                    <input
                                      type="text"
                                      className="input input-bordered w-full"
                                      value={account.credentials?.username || ''}
                                      disabled
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-sm text-base-content/70 mb-2">Password</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value="********"
                                        disabled
                                      />
                                      <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setShowPasswordModal(account.id)}
                                      >
                                        Change
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {projectXTypes.includes(editedAccount.type) && (
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <label className="block text-sm text-base-content/70 mb-2">Account</label>
                                  <select
                                    className="select select-bordered w-full"
                                    value={editedAccount.accountId}
                                    onChange={(e) => {
                                      const selectedAccount = accounts.find(a => a.id === e.target.value)
                                      setEditedAccount({
                                        ...editedAccount,
                                        accountId: e.target.value,
                                        accounts: selectedAccount ? [selectedAccount] : undefined
                                      })
                                    }}
                                  >
                                    <option value="">Select an account</option>
                                    {accounts.map(account => (
                                      <option key={account.id} value={account.id}>
                                        {account.alias || account.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  className="btn btn-ghost btn-square"
                                  title="Sync accounts"
                                  onClick={handleSyncAccounts}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            {editedAccount.type && !projectXTypes.includes(editedAccount.type) && (
                              <div>
                                <label className="block text-sm text-base-content/70 mb-2">Account ID</label>
                                <input
                                  type="text"
                                  className="input input-bordered w-full"
                                  value={editedAccount.accountId}
                                  onChange={(e) => setEditedAccount({ ...editedAccount, accountId: e.target.value })}
                                />
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex justify-end space-x-2">
                          <button
                            className="btn btn-ghost"
                            onClick={() => {
                              setEditingAccount(null)
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleSaveAccount(account.id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {account.symbolMappings.map((mapping, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <input
                              type="text"
                              className="input input-bordered input-xs w-20"
                              value={mapping.sourceSymbol}
                              disabled={!mapping.isEditing}
                              onChange={(e) => {
                                const newMappings = [...account.symbolMappings]
                                newMappings[index] = { ...mapping, sourceSymbol: e.target.value }
                                updateBot(bot.id, {
                                  targetAccounts: bot.targetAccounts.map(a =>
                                    a.id === account.id ? { ...a, symbolMappings: newMappings } : a
                                  )
                                })
                              }}
                              placeholder="Source"
                            />
                            <span className="text-xs">→</span>
                            <select
                              className="select select-bordered select-xs w-full min-w-[100px]"
                              value={mapping.targetSymbolId}
                              disabled={!mapping.isEditing}
                              onChange={(e) => {
                                const newMappings = [...account.symbolMappings]
                                newMappings[index] = { ...mapping, targetSymbolId: e.target.value }
                                updateBot(bot.id, {
                                  targetAccounts: bot.targetAccounts.map(a =>
                                    a.id === account.id ? { ...a, symbolMappings: newMappings } : a
                                  )
                                })
                              }}
                            >
                              <option value="">Select symbol</option>
                              {account.symbols?.map(symbol => (
                                <option key={symbol.id} value={symbol.id}>
                                  {symbol.name}
                                </option>
                              ))}
                            </select>
                            <span className="text-xs">×</span>
                            <input
                              type="number"
                              className="input input-bordered input-xs w-10"
                              value={mapping.multiplier}
                              disabled={!mapping.isEditing}
                              onChange={(e) => {
                                const newMappings = [...account.symbolMappings]
                                newMappings[index] = { ...mapping, multiplier: parseFloat(e.target.value) || 1 }
                                updateBot(bot.id, {
                                  targetAccounts: bot.targetAccounts.map(a =>
                                    a.id === account.id ? { ...a, symbolMappings: newMappings } : a
                                  )
                                })
                              }}
                              step="1"
                            />
                            {mapping.isEditing ? (
                              <button
                                className="btn btn-success btn-xs btn-square"
                                onClick={() => handleSaveMapping(account.id, index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => handleEditMapping(account.id, index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                            )}
                            <button
                              className="btn btn-error btn-xs btn-square"
                              onClick={() => handleDeleteSymbolMapping(account.id, index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleAddSymbolMapping(account.id)}
                        >
                          + Add Mapping
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Section */}
          <div className={getLogClassName()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold">Activity Log</h3>
                <button
                  className="btn btn-ghost btn-xs opacity-50 hover:opacity-100"
                  onClick={() => window.store.openLogsDirectory()}
                >Open logs</button>
              </div>
            </div>
            <div
              ref={logContainerRef}
              className={`bg-base-200 rounded-lg p-4 ${logSize === 'normal' ? 'h-32' : 'h-[calc(100%-4rem)]'} overflow-auto font-mono text-sm`}
            >
              {(isReversed ? [...logs].reverse() : logs).map((log, index) => (
                <div key={index} className="text-base-content/70">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Menu Modal */}
      {showTestMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-lg p-6 w-[600px]">
            <h3 className="text-lg font-semibold mb-4">
              Test Order - {bot.targetAccounts.find(a => a.id === showTestMenu)?.type}
            </h3>
            <div className="space-y-4">
              <div className="text-sm text-base-content/70">
                <p className="mb-2">This will place a real test order on the exchange. If the order is not placed successfully, there might be an issue with:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Account connection</li>
                  <li>Symbol availability</li>
                  <li>Exchange permissions</li>
                  <li>System configuration</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Symbol Mappings</h4>
                {bot.targetAccounts.find(a => a.id === showTestMenu)?.symbolMappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between bg-base-300 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mapping.sourceSymbol}</span>
                      <span>→</span>
                      <span className="font-medium">
                        {bot.targetAccounts.find(a => a.id === showTestMenu)?.symbols?.find(s => s.id === mapping.targetSymbolId)?.name || 'Unknown symbol'}
                      </span>
                      <span>×</span>
                      <span className="font-medium">{mapping.multiplier}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleTestOrder(showTestMenu, 'sell', mapping)}
                      >
                        SELL
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleTestOrder(showTestMenu, 'buy', mapping)}
                      >
                        BUY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowTestMenu(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-base-content/70 mb-2">New Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowPasswordModal(null)
                    setNewPassword('')
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleChangePassword(showPasswordModal)}
                >
                  Save Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bots
