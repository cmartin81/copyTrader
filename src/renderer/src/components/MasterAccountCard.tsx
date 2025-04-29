import React, { useState } from 'react'
import { Bot, MasterAccount } from '../store/botStore'

// Mapping of Rithmic servers to their available locations
const RITHMIC_SERVERS = {
  'Rithmic Paper Trading': ['Chicago', 'New York', 'London'],
  'Rithmic 01': ['Chicago', 'New York'],
  'Rithmic 04 Colo': ['Chicago', 'New York', 'London'],
  'TopstepTrader': ['Chicago', 'New York'],
  'SpeedUp': ['Chicago', 'New York', 'London'],
  'TradeFundrr': ['Chicago', 'New York'],
  'UProfitTrader': ['Chicago', 'New York', 'London'],
  'Apex': ['Chicago', 'New York'],
  'Leeloo Trading': ['Chicago', 'New York', 'London'],
  'MES Capital': ['Chicago', 'New York'],
  'FundedFuturesNetwork': ['Chicago', 'New York', 'London'],
  'TheTradingPit': ['Chicago', 'New York'],
  'Bulenox': ['Chicago', 'New York', 'London'],
  'Neurostreet Funding': ['Chicago', 'New York'],
  'Rithmic Test': ['Chicago', 'New York', 'London'],
  'PropShopTrader': ['Chicago', 'New York'],
  '4PropTrader': ['Chicago', 'New York', 'London'],
  'FastTrackTrading': ['Chicago', 'New York'],
  'DayTraders.com': ['Chicago', 'New York', 'London'],
  '10XFutures': ['Chicago', 'New York'],
  'LucidTrading': ['Chicago', 'New York', 'London'],
  'ThriveTrading': ['Chicago', 'New York'],
  'LegendsTrading': ['Chicago', 'New York', 'London']
}

interface MasterAccountCardProps {
  bot: Bot
  onUpdate: (updates: Partial<Bot>) => void
  onAddLog: (message: string) => void
}

const MasterAccountCard: React.FC<MasterAccountCardProps> = ({ bot, onUpdate, onAddLog }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempMasterAccount, setTempMasterAccount] = useState<MasterAccount | null>(null)
  const [source, setSource] = useState('')
  const [contracts, setContracts] = useState('0')

  const handleCreateMasterAccount = (): void => {
    onUpdate({
      masterAccount: undefined
    })
    setTempMasterAccount({
      id: crypto.randomUUID(),
      name: 'Test Account',
      type: 'Test',
      connectionType: 'Test',
      credentials: {
        username: '',
        password: '',
        server: '',
        location: ''
      }
    })
    setIsEditing(true)
    onAddLog('Creating new master account')
  }

  const handleDeleteMasterAccount = (): void => {
    onUpdate({
      masterAccount: undefined
    })
    setIsEditing(false)
    setTempMasterAccount(null)
    onAddLog('Master account deleted')
  }

  const handleSaveMasterAccount = async (): Promise<void> => {
    if (!tempMasterAccount) return

    try {
      onUpdate({
        masterAccount: tempMasterAccount
      })
      setIsEditing(false)
      setTempMasterAccount(null)
      onAddLog('Master account saved')
    } catch (error) {
      console.error('Error saving master account:', error)
      onAddLog('Error saving master account')
    }
  }

  const handleMasterAccountTypeChange = (type: MasterAccount['type']): void => {
    if (tempMasterAccount) {
      setTempMasterAccount({
        ...tempMasterAccount,
        type,
        connectionType: type === 'Rithmic' ? 'Rithmic' : type === 'Test' ? 'Test' : 'MT4',
        credentials: {
          ...tempMasterAccount.credentials,
          server: '',
          location: ''
        }
      })
    }
  }

  const handleMasterAccountConnectionTypeChange = (connectionType: MasterAccount['connectionType']): void => {
    if (tempMasterAccount) {
      setTempMasterAccount({
        ...tempMasterAccount,
        connectionType
      })
    }
  }

  const handleMasterAccountCredentialsChange = (
    field: keyof MasterAccount['credentials'],
    value: string
  ): void => {
    if (tempMasterAccount) {
      setTempMasterAccount({
        ...tempMasterAccount,
        credentials: { ...tempMasterAccount.credentials, [field]: value }
      })
    }
  }

  const renderCredentialsForm = (): JSX.Element => {
    const account = isEditing ? tempMasterAccount : bot.masterAccount
    if (!account) return <div>No account selected</div>

    switch (account.connectionType) {
      case 'Test':
        return <></>
      case 'MT4':
      case 'MT5':
      case 'cTrader':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={account.credentials.username}
                onChange={(e) => handleMasterAccountCredentialsChange('username', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={account.credentials.password}
                onChange={(e) => handleMasterAccountCredentialsChange('password', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Server</label>
              <input
                type="text"
                value={account.credentials.server || ''}
                onChange={(e) => handleMasterAccountCredentialsChange('server', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )
      case 'Rithmic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <input
                type="text"
                value={account.credentials.username}
                onChange={(e) => handleMasterAccountCredentialsChange('username', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={account.credentials.password}
                onChange={(e) => handleMasterAccountCredentialsChange('password', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Server</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={account.credentials.server || ''}
                onChange={(e) => handleMasterAccountCredentialsChange('server', e.target.value)}
              >
                <option value="">Select a server</option>
                {Object.keys(RITHMIC_SERVERS).map(server => (
                  <option key={server} value={server}>{server}</option>
                ))}
              </select>
            </div>
            {account.credentials.server && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={account.credentials.location || ''}
                  onChange={(e) => handleMasterAccountCredentialsChange('location', e.target.value)}
                >
                  <option value="">Select a location</option>
                  {RITHMIC_SERVERS[account.credentials.server as keyof typeof RITHMIC_SERVERS]?.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )
      default:
        return <div>Unsupported connection type</div>
    }
  }

  return (
    <div className="w-2/5 bg-base-300 rounded-lg p-6 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Master Account</h2>
        {!isEditing && bot.masterAccount && (
          <div className="flex space-x-2">
            <button
              className="btn btn-error btn-sm"
              onClick={handleDeleteMasterAccount}
            >
              Delete
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setTempMasterAccount({ ...bot.masterAccount })
                setIsEditing(true)
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>
      
      {!bot.masterAccount && !isEditing ? (
        <div className="flex flex-col items-center justify-center h-full">
          <button
            className="btn btn-primary w-full max-w-xs"
            onClick={handleCreateMasterAccount}
          >
            Add Master Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isEditing ? (
            <div>
              <label className="block text-sm text-base-content/70 mb-2">Select Master Account Type</label>
              <select
                className="select select-bordered w-full"
                value={tempMasterAccount?.type}
                onChange={(e) => handleMasterAccountTypeChange(e.target.value as MasterAccount['type'])}
              >
                <option value="">Select a type</option>
                <option value="PropFirm">Prop Firm</option>
                <option value="Personal">Personal</option>
                <option value="Rithmic">Rithmic</option>
                <option value="Test">Test</option>
              </select>
            </div>
          ) : (
            <div className="bg-base-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-base-content/70">Type:</span>
                  <p className="font-medium">{bot.masterAccount?.type}</p>
                </div>
                {bot.masterAccount?.type === 'Test' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter source"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contracts</label>
                      <input
                        type="number"
                        min="0"
                        value={contracts}
                        onChange={(e) => setContracts(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter contracts"
                      />
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button 
                        className="btn btn-sm btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!source || parseInt(contracts) <= 0}
                        onClick={() => {
                          window.electron.ipcRenderer.send('masterAccountBuy', {
                            source,
                            contracts: parseInt(contracts)
                          })
                        }}
                      >
                        Buy
                      </button>
                      <button 
                        className="btn btn-sm btn-error disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!source || parseInt(contracts) <= 0}
                        onClick={() => {
                          window.electron.ipcRenderer.send('masterAccountSell', {
                            source,
                            contracts: parseInt(contracts)
                          })
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-base-content/70">Connection:</span>
                      <p className="font-medium">{bot.masterAccount?.connectionType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-base-content/70">Username:</span>
                      <p className="font-medium">{bot.masterAccount?.credentials.username}</p>
                    </div>
                    {bot.masterAccount?.credentials.server && (
                      <div>
                        <span className="text-sm text-base-content/70">Server:</span>
                        <p className="font-medium">{bot.masterAccount.credentials.server}</p>
                      </div>
                    )}
                    {bot.masterAccount?.credentials.location && (
                      <div>
                        <span className="text-sm text-base-content/70">Location:</span>
                        <p className="font-medium">{bot.masterAccount.credentials.location}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {isEditing && tempMasterAccount && (
            <div className="space-y-4">
              {tempMasterAccount.type !== 'Rithmic' && tempMasterAccount.type !== 'Test' && (
                <div>
                  <label className="block text-sm text-base-content/70 mb-2">Connection Type</label>
                  <select
                    className="select select-bordered w-full"
                    value={tempMasterAccount.connectionType}
                    onChange={(e) => handleMasterAccountConnectionTypeChange(e.target.value as MasterAccount['connectionType'])}
                  >
                    <option value="MT4">MT4</option>
                    <option value="MT5">MT5</option>
                    <option value="cTrader">cTrader</option>
                  </select>
                </div>
              )}

              {renderCredentialsForm()}

              <div className="flex justify-end space-x-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setTempMasterAccount(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveMasterAccount}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MasterAccountCard 