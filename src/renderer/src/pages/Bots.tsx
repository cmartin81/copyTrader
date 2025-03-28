import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBotStore, Bot, MasterAccount } from '../store/botStore'
import { createPortal } from 'react-dom'

type LogSize = 'normal' | 'half' | 'full'

const Bots: React.FC = () => {
  const { botId } = useParams<{ botId: string }>()
  const navigate = useNavigate()
  const { bots, updateBot, toggleBot, deleteBot, updateBotPnl } = useBotStore()
  const bot = bots.find(b => b.id === botId)

  const [logs, setLogs] = useState<string[]>([])
  const [logSize, setLogSize] = useState<LogSize>('normal')
  const [isTailing, setIsTailing] = useState(true)
  const [isReversed, setIsReversed] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const logContainerRef = React.useRef<HTMLDivElement>(null)
  const [showAddTarget, setShowAddTarget] = useState(false)
  const [newTargetAccount, setNewTargetAccount] = useState<Partial<Bot['targetAccounts'][0]>>({
    name: '',
    type: 'PropFirm',
    accountId: '',
    tickerMappings: []
  })

  const avatarOptions = [
    // Trading & Finance
    '📈', '📉', '💰', '💸', '💵', '💹', '📊', '💎',
    // Bot & Tech
    '🤖', '⚡', '⚙️', '🔧', '🛠️', '💻', '🔌', '💾',
    // Game & Sports
    '🎮', '🎲', '🎯', '🎪', '🎟️', '🎠', '🎨', '🎭',
    // Nature & Weather
    '🌱', '🌿', '🌳', '🌲', '🌴', '🌵', '🌺', '🌸',
    // Space & Science
    '🚀', '🌍', '🌎', '🌏', '⭐', '🌙', '☄️', '🌠',
    // Animals & Pets
    '🦊', '🦁', '🐯', '🐸', '🐼', '🐨', '🦒', '🦊',
    // Food & Drink
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
    // Symbols & Objects
    '🎯', '🎪', '🎟️', '🎠', '🎨', '🎭', '🎪', '🎟️'
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

    window.api.onStateUpdate(handleStateUpdate)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('state-updated')
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
      if (!bot.isRunning) {
        // Start the bot
        const response = await window.electron.ipcRenderer.invoke('launch-puppeteer', bot.id, bot.name)
        if (response.success) {
          toggleBot(bot.id)
          updateBot(bot.id, { isActive: true })
          addLog('Bot started successfully')
        } else {
          console.error('Failed to start bot:', response.error)
          addLog(`Failed to start bot: ${response.error}`)
        }
      } else {
        // Stop the bot
        const response = await window.electron.ipcRenderer.invoke('close-bot-window', bot.id)
        if (response.success) {
          toggleBot(bot.id)
          updateBot(bot.id, { isActive: false })
          addLog('Bot stopped successfully')
        } else {
          console.error('Failed to stop bot:', response.error)
          addLog(`Failed to stop bot: ${response.error}`)
        }
      }
    } catch (error) {
      console.error('Error toggling bot:', error)
      addLog(`Error toggling bot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const addLog = (message: string): void => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleMasterAccountTypeChange = (type: MasterAccount['type']): void => {
    const newMasterAccount: MasterAccount = {
      id: Date.now().toString(),
      name: '',
      type,
      connectionType: 'credentials',
      credentials: {}
    }
    updateBot(bot.id, {
      masterAccount: newMasterAccount
    })
    addLog(`Master account type changed to ${type}`)
  }

  const handleMasterAccountConnectionTypeChange = (connectionType: MasterAccount['connectionType']): void => {
    if (bot.masterAccount) {
      updateBot(bot.id, {
        masterAccount: {
          ...bot.masterAccount,
          connectionType
        }
      })
    }
  }

  const handleMasterAccountCredentialsChange = (
    field: keyof MasterAccount['credentials'],
    value: string
  ): void => {
    if (bot.masterAccount) {
      updateBot(bot.id, {
        masterAccount: {
          ...bot.masterAccount,
          credentials: { ...bot.masterAccount.credentials, [field]: value }
        }
      })
    }
  }

  const handleAddTargetAccount = (): void => {
    if (newTargetAccount.name && newTargetAccount.type && newTargetAccount.accountId) {
      updateBot(bot.id, {
        targetAccounts: [
          ...bot.targetAccounts,
          {
            id: Date.now().toString(),
            name: newTargetAccount.name,
            type: newTargetAccount.type,
            accountId: newTargetAccount.accountId,
            tickerMappings: []
          }
        ]
      })
      setNewTargetAccount({
        name: '',
        type: 'PropFirm',
        accountId: '',
        tickerMappings: []
      })
      setShowAddTarget(false)
      addLog(`Added new target account: ${newTargetAccount.name}`)
    }
  }

  const handleAddTickerMapping = (targetId: string): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          return {
            ...account,
            tickerMappings: [...account.tickerMappings, { 
              sourceTicker: '', 
              targetTicker: '', 
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
          const newMappings = [...account.tickerMappings]
          const mapping = newMappings[index]
          newMappings[index] = { ...mapping, isEditing: false }
          addLog(`Saved mapping for ${account.name}: ${mapping.sourceTicker} → ${mapping.targetTicker} (x${mapping.multiplier})`)
          return { ...account, tickerMappings: newMappings }
        }
        return account
      })
    })
  }

  const handleEditMapping = (targetId: string, index: number): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          const newMappings = [...account.tickerMappings]
          newMappings[index] = { ...newMappings[index], isEditing: true }
          return { ...account, tickerMappings: newMappings }
        }
        return account
      })
    })
  }

  const handleDeleteTickerMapping = (targetId: string, index: number): void => {
    updateBot(bot.id, {
      targetAccounts: bot.targetAccounts.map(account => {
        if (account.id === targetId) {
          const newMappings = account.tickerMappings.filter((_, i) => i !== index)
          addLog(`Deleted mapping from ${account.name}`)
          return { ...account, tickerMappings: newMappings }
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

  return (
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
                      {bot.isRunning && (
                        <span className="absolute bottom-0 right-0 h-4 w-4 bg-success rounded-full border-2 border-base-100 animate-pulse"></span>
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
                  bot.isRunning 
                    ? 'btn-error hover:btn-error' 
                    : 'btn-success hover:btn-success'
                } min-w-[150px]`}
              >
                <div className="flex items-center gap-2">
                  {bot.isRunning ? (
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
          <div className="w-2/5 bg-base-300 rounded-lg p-6 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Master Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-base-content/70 mb-2">Select Master Account Type</label>
                <select
                  className="select select-bordered w-full"
                  value={bot.masterAccount?.type || ''}
                  onChange={(e) => handleMasterAccountTypeChange(e.target.value as MasterAccount['type'])}
                >
                  <option value="">Select a type</option>
                  <option value="NinjaTrader">NinjaTrader</option>
                  <option value="MetaTrader">MetaTrader</option>
                  <option value="TradingView">TradingView</option>
                </select>
              </div>

              {bot.masterAccount && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-base-content/70 mb-2">Connection Type</label>
                    <select
                      className="select select-bordered w-full"
                      value={bot.masterAccount.connectionType}
                      onChange={(e) => handleMasterAccountConnectionTypeChange(e.target.value as MasterAccount['connectionType'])}
                    >
                      <option value="credentials">Username/Password</option>
                      <option value="token">API Token</option>
                      <option value="oauth">OAuth</option>
                    </select>
                  </div>

                  {bot.masterAccount.connectionType === 'credentials' && (
                    <>
                      <div>
                        <label className="block text-sm text-base-content/70 mb-2">Username</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={bot.masterAccount.credentials.username || ''}
                          onChange={(e) => handleMasterAccountCredentialsChange('username', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-base-content/70 mb-2">Password</label>
                        <input
                          type="password"
                          className="input input-bordered w-full"
                          value={bot.masterAccount.credentials.password || ''}
                          onChange={(e) => handleMasterAccountCredentialsChange('password', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {bot.masterAccount.connectionType === 'token' && (
                    <div>
                      <label className="block text-sm text-base-content/70 mb-2">API Token</label>
                      <input
                        type="password"
                        className="input input-bordered w-full"
                        value={bot.masterAccount.credentials.token || ''}
                        onChange={(e) => handleMasterAccountCredentialsChange('token', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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
                    <label className="block text-sm text-base-content/70 mb-2">Account Name</label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={newTargetAccount.name}
                      onChange={(e) => setNewTargetAccount({ ...newTargetAccount, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-base-content/70 mb-2">Account Type</label>
                    <select
                      className="select select-bordered w-full"
                      value={newTargetAccount.type}
                      onChange={(e) => setNewTargetAccount({ ...newTargetAccount, type: e.target.value as Bot['targetAccounts'][0]['type'] })}
                    >
                      <option value="PropFirm">Prop Firm</option>
                      <option value="TopStepX">TopStepX</option>
                      <option value="Tradovate">Tradovate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-base-content/70 mb-2">Account ID</label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={newTargetAccount.accountId}
                      onChange={(e) => setNewTargetAccount({ ...newTargetAccount, accountId: e.target.value })}
                    />
                  </div>
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
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-base-content/70 text-sm">{account.type} - {account.accountId}</p>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        updateBot(bot.id, {
                          targetAccounts: bot.targetAccounts.filter(a => a.id !== account.id)
                        })
                        addLog(`Deleted account: ${account.name}`)
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Ticker Mappings</h4>
                    {account.tickerMappings.map((mapping, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="input input-bordered input-sm w-28"
                          value={mapping.sourceTicker}
                          disabled={!mapping.isEditing}
                          onChange={(e) => {
                            const newMappings = [...account.tickerMappings]
                            newMappings[index] = { ...mapping, sourceTicker: e.target.value }
                            updateBot(bot.id, {
                              targetAccounts: bot.targetAccounts.map(a => 
                                a.id === account.id ? { ...a, tickerMappings: newMappings } : a
                              )
                            })
                          }}
                          placeholder="Source"
                        />
                        <span>→</span>
                        <input
                          type="text"
                          className="input input-bordered input-sm w-28"
                          value={mapping.targetTicker}
                          disabled={!mapping.isEditing}
                          onChange={(e) => {
                            const newMappings = [...account.tickerMappings]
                            newMappings[index] = { ...mapping, targetTicker: e.target.value }
                            updateBot(bot.id, {
                              targetAccounts: bot.targetAccounts.map(a => 
                                a.id === account.id ? { ...a, tickerMappings: newMappings } : a
                              )
                            })
                          }}
                          placeholder="Target"
                        />
                        <span>×</span>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-12"
                          value={mapping.multiplier}
                          disabled={!mapping.isEditing}
                          onChange={(e) => {
                            const newMappings = [...account.tickerMappings]
                            newMappings[index] = { ...mapping, multiplier: parseFloat(e.target.value) || 1 }
                            updateBot(bot.id, {
                              targetAccounts: bot.targetAccounts.map(a => 
                                a.id === account.id ? { ...a, tickerMappings: newMappings } : a
                              )
                            })
                          }}
                          step="1"
                        />
                        <div className="space-x-1">
                          {mapping.isEditing ? (
                            <button
                              className="btn btn-success btn-sm btn-square"
                              onClick={() => handleSaveMapping(account.id, index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              className="btn btn-info btn-sm btn-square"
                              onClick={() => handleEditMapping(account.id, index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          )}
                          <button
                            className="btn btn-error btn-sm btn-square"
                            onClick={() => handleDeleteTickerMapping(account.id, index)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleAddTickerMapping(account.id)}
                    >
                      + Add Mapping
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log Section */}
        <div className={getLogClassName()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Activity Log</h3>
            <div className="flex items-center space-x-2">
              <div className="join">
                <button
                  className={`join-item btn btn-sm ${isTailing ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setIsTailing(prev => !prev)}
                  title={isTailing ? 'Disable auto-scroll' : 'Enable auto-scroll'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M12 19l-4-4M12 19l4-4" />
                  </svg>
                </button>
                <button
                  className={`join-item btn btn-sm ${isReversed ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setIsReversed(prev => !prev)}
                  title={isReversed ? 'Show newest last' : 'Show newest first'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                  </svg>
                </button>
              </div>
              <div className="join">
                <button
                  className={`join-item btn btn-sm ${logSize === 'normal' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setLogSize('normal')}
                  title="Normal size"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="8" y="8" width="8" height="8" />
                  </svg>
                </button>
                <button
                  className={`join-item btn btn-sm ${logSize === 'half' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setLogSize('half')}
                  title="Half screen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                </button>
                <button
                  className={`join-item btn btn-sm ${logSize === 'full' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setLogSize('full')}
                  title="Full screen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setLogs([])}
              >
                Clear
              </button>
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
  )
}

export default Bots 