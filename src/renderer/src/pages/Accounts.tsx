import React, { useState } from 'react'

interface MasterAccount {
  id: string
  name: string
  type: 'NinjaTrader' | 'MetaTrader' | 'TradingView'
  connectionType: 'token' | 'oauth' | 'credentials'
  credentials: {
    token?: string
    username?: string
    password?: string
    url?: string
  }
}

interface TargetAccount {
  id: string
  name: string
  type: 'PropFirm' | 'TopStepX' | 'Tradovate'
  accountId: string
  tickerMappings: TickerMapping[]
}

interface TickerMapping {
  sourceTicker: string
  targetTicker: string
  multiplier: number
  isEditing?: boolean
}

type LogSize = 'normal' | 'half' | 'full'

const Accounts: React.FC = () => {
  const [masterAccount, setMasterAccount] = useState<MasterAccount | null>(null)
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([])
  const [showAddTarget, setShowAddTarget] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [logSize, setLogSize] = useState<LogSize>('normal')
  const [isTailing, setIsTailing] = useState(true)
  const [isReversed, setIsReversed] = useState(false)
  const logContainerRef = React.useRef<HTMLDivElement>(null)
  const [newTargetAccount, setNewTargetAccount] = useState<Partial<TargetAccount>>({
    name: '',
    type: 'PropFirm',
    accountId: '',
    tickerMappings: []
  })

  const addLog = (message: string): void => {
    setLogs(prev => {
      const newLogs = [...prev, `${new Date().toLocaleTimeString()} - ${message}`]
      if (isTailing) {
        setTimeout(() => {
          if (logContainerRef.current) {
            const container = logContainerRef.current
            container.scrollTop = isReversed ? 0 : container.scrollHeight
          }
        }, 0)
      }
      return newLogs
    })
  }

  const toggleOrder = (): void => {
    setIsReversed(prev => !prev)
    setTimeout(() => {
      if (logContainerRef.current && isTailing) {
        const container = logContainerRef.current
        container.scrollTop = !isReversed ? 0 : container.scrollHeight
      }
    }, 0)
  }

  const handleMasterAccountTypeChange = (type: MasterAccount['type']): void => {
    setMasterAccount({
      id: Date.now().toString(),
      name: '',
      type,
      connectionType: 'credentials',
      credentials: {}
    })
    addLog(`Master account type changed to ${type}`)
  }

  const handleAddTargetAccount = (): void => {
    if (newTargetAccount.name && newTargetAccount.type && newTargetAccount.accountId) {
      setTargetAccounts([
        ...targetAccounts,
        {
          id: Date.now().toString(),
          name: newTargetAccount.name,
          type: newTargetAccount.type as TargetAccount['type'],
          accountId: newTargetAccount.accountId,
          tickerMappings: []
        }
      ])
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
    setTargetAccounts(targetAccounts.map(account => {
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
    }))
  }

  const handleSaveMapping = (targetId: string, index: number): void => {
    setTargetAccounts(targetAccounts.map(account => {
      if (account.id === targetId) {
        const newMappings = [...account.tickerMappings]
        newMappings[index] = { ...newMappings[index], isEditing: false }
        addLog(`Saved mapping for ${account.name}: ${newMappings[index].sourceTicker} → ${newMappings[index].targetTicker} (x${newMappings[index].multiplier})`)
        return { ...account, tickerMappings: newMappings }
      }
      return account
    }))
  }

  const handleEditMapping = (targetId: string, index: number): void => {
    setTargetAccounts(targetAccounts.map(account => {
      if (account.id === targetId) {
        const newMappings = [...account.tickerMappings]
        newMappings[index] = { ...newMappings[index], isEditing: true }
        return { ...account, tickerMappings: newMappings }
      }
      return account
    }))
  }

  const handleDeleteTickerMapping = (targetId: string, index: number): void => {
    setTargetAccounts(targetAccounts.map(account => {
      if (account.id === targetId) {
        const newMappings = account.tickerMappings.filter((_, i) => i !== index)
        addLog(`Deleted mapping from ${account.name}`)
        return { ...account, tickerMappings: newMappings }
      }
      return account
    }))
  }

  const getLogClassName = (): string => {
    switch (logSize) {
      case 'half':
        return 'h-1/2 absolute bottom-0 left-6 right-6 bg-base-300 rounded-lg p-6 border-t border-base-content/10 transition-all duration-300'
      case 'full':
        return 'absolute inset-6 bg-base-300 rounded-lg p-6 z-40 transition-all duration-300'
      default:
        return 'h-48 mx-6 mb-6 bg-base-300 rounded-lg p-6 border-t border-base-content/10 transition-all duration-300'
    }
  }

  const getMainContentClassName = (): string => {
    if (logSize === 'half') {
      return 'flex flex-1 p-6 gap-6 overflow-auto pb-[calc(50vh-1.5rem)]'
    }
    if (logSize === 'full') {
      return 'flex flex-1 p-6 gap-6 overflow-hidden invisible'
    }
    return 'flex flex-1 p-6 gap-6 overflow-auto'
  }

  return (
    <div className="flex flex-col h-screen relative">
      <div className={getMainContentClassName()}>
        {/* Left Side - Master Account */}
        <div className="w-1/2 bg-base-300 rounded-lg p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Master Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-base-content/70 mb-2">Select Master Account Type</label>
              <select
                className="select select-bordered w-full"
                onChange={(e) => handleMasterAccountTypeChange(e.target.value as MasterAccount['type'])}
              >
                <option value="">Select a type</option>
                <option value="NinjaTrader">NinjaTrader</option>
                <option value="MetaTrader">MetaTrader</option>
                <option value="TradingView">TradingView</option>
              </select>
            </div>

            {masterAccount && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-base-content/70 mb-2">Connection Type</label>
                  <select
                    className="select select-bordered w-full"
                    value={masterAccount.connectionType}
                    onChange={(e) => setMasterAccount({
                      ...masterAccount,
                      connectionType: e.target.value as MasterAccount['connectionType']
                    })}
                  >
                    <option value="credentials">Username/Password</option>
                    <option value="token">API Token</option>
                    <option value="oauth">OAuth</option>
                  </select>
                </div>

                {masterAccount.connectionType === 'credentials' && (
                  <>
                    <div>
                      <label className="block text-sm text-base-content/70 mb-2">Username</label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={masterAccount.credentials.username || ''}
                        onChange={(e) => setMasterAccount({
                          ...masterAccount,
                          credentials: { ...masterAccount.credentials, username: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-base-content/70 mb-2">Password</label>
                      <input
                        type="password"
                        className="input input-bordered w-full"
                        value={masterAccount.credentials.password || ''}
                        onChange={(e) => setMasterAccount({
                          ...masterAccount,
                          credentials: { ...masterAccount.credentials, password: e.target.value }
                        })}
                      />
                    </div>
                  </>
                )}

                {masterAccount.connectionType === 'token' && (
                  <div>
                    <label className="block text-sm text-base-content/70 mb-2">API Token</label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      value={masterAccount.credentials.token || ''}
                      onChange={(e) => setMasterAccount({
                        ...masterAccount,
                        credentials: { ...masterAccount.credentials, token: e.target.value }
                      })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Target Accounts */}
        <div className="w-1/2 bg-base-300 rounded-lg p-6 overflow-auto">
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
                    onChange={(e) => setNewTargetAccount({ ...newTargetAccount, type: e.target.value as TargetAccount['type'] })}
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
            {targetAccounts.map((account) => (
              <div key={account.id} className="bg-base-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-base-content/70 text-sm">{account.type} - {account.accountId}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setTargetAccounts(targetAccounts.filter(a => a.id !== account.id))
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
                          setTargetAccounts(targetAccounts.map(a => 
                            a.id === account.id ? { ...a, tickerMappings: newMappings } : a
                          ))
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
                          setTargetAccounts(targetAccounts.map(a => 
                            a.id === account.id ? { ...a, tickerMappings: newMappings } : a
                          ))
                        }}
                        placeholder="Target"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        className="input input-bordered input-sm w-20"
                        value={mapping.multiplier}
                        disabled={!mapping.isEditing}
                        onChange={(e) => {
                          const newMappings = [...account.tickerMappings]
                          newMappings[index] = { ...mapping, multiplier: parseFloat(e.target.value) || 1 }
                          setTargetAccounts(targetAccounts.map(a => 
                            a.id === account.id ? { ...a, tickerMappings: newMappings } : a
                          ))
                        }}
                        step="0.1"
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
                onClick={toggleOrder}
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
            {logSize === 'full' && (
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setLogSize('normal')}
                title="Close fullscreen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
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
  )
}

export default Accounts 