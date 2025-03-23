import React, { useState } from 'react'

interface Account {
  id: number
  name: string
  exchange: string
  balance: number
  inUse: boolean
  apiKey: string
  secretKey: string
  permissions: string[]
}

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 1,
      name: 'Binance Main',
      exchange: 'Binance',
      balance: 12385.42,
      inUse: true,
      apiKey: 'XXX...YYY',
      secretKey: '***...***',
      permissions: ['READ', 'TRADE', 'TRANSFER']
    },
    {
      id: 2,
      name: 'Bybit Futures',
      exchange: 'Bybit',
      balance: 5790.21,
      inUse: true,
      apiKey: 'AAA...BBB',
      secretKey: '***...***',
      permissions: ['READ', 'TRADE']
    },
    {
      id: 3,
      name: 'Kraken Spot',
      exchange: 'Kraken',
      balance: 3150.87,
      inUse: false,
      apiKey: 'CCC...DDD',
      secretKey: '***...***',
      permissions: ['READ']
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState<number | null>(null)

  const toggleAccountStatus = (id: number): void => {
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, inUse: !account.inUse } : account
    ))
  }

  const getExchangeIcon = (exchange: string): JSX.Element => {
    switch (exchange.toLowerCase()) {
      case 'binance':
        return (
          <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black">B</div>
        )
      case 'bybit':
        return (
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">By</div>
        )
      case 'kraken':
        return (
          <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">K</div>
        )
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center font-bold text-white">?</div>
        )
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Exchange Accounts</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  {getExchangeIcon(account.exchange)}
                  <div>
                    <h2 className="card-title">{account.name}</h2>
                    <p className="text-sm opacity-70">{account.exchange}</p>
                  </div>
                </div>
                <label className="swap">
                  <input 
                    type="checkbox" 
                    checked={account.inUse}
                    onChange={() => toggleAccountStatus(account.id)}
                  />
                  <div className="swap-on badge badge-success">ACTIVE</div>
                  <div className="swap-off badge badge-ghost">INACTIVE</div>
                </label>
              </div>

              <div className="divider my-2"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Balance</div>
                  <div className="stat-value text-xl">${account.balance.toLocaleString()}</div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">API Key</div>
                  <div className="flex items-center gap-2">
                    <div className="stat-value text-xl font-mono">{account.apiKey}</div>
                    <button 
                      className="btn btn-circle btn-ghost btn-sm"
                      onClick={() => setShowKeyModal(account.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Permissions</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {account.permissions.map((perm, idx) => (
                      <div key={idx} className="badge badge-primary badge-sm">{perm}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-outline">Test Connection</button>
                <button className="btn btn-sm btn-outline btn-warning">Edit</button>
                <button className="btn btn-sm btn-outline btn-error">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow-xl mt-8 p-6">
        <h3 className="text-xl font-bold mb-4">Account Security Recommendations</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use API keys with only the necessary permissions</li>
          <li>Set IP restrictions for your API keys when possible</li>
          <li>Enable Two-Factor Authentication on all exchange accounts</li>
          <li>Regularly rotate your API keys for better security</li>
          <li>Monitor account activity and set up notifications for large withdrawals</li>
        </ul>
        <div className="alert alert-warning mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Never share your API secret keys with anyone, including CopyTrader support!</span>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add New Exchange Account</h3>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Account Name</span>
              </label>
              <input type="text" placeholder="My Exchange Account" className="input input-bordered w-full" />
              
              <label className="label mt-2">
                <span className="label-text">Exchange</span>
              </label>
              <select className="select select-bordered w-full">
                <option disabled selected>Select Exchange</option>
                <option>Binance</option>
                <option>Bybit</option>
                <option>Kraken</option>
                <option>FTX</option>
                <option>Coinbase Pro</option>
              </select>
              
              <label className="label mt-2">
                <span className="label-text">API Key</span>
              </label>
              <input type="text" placeholder="Enter API Key" className="input input-bordered w-full" />
              
              <label className="label mt-2">
                <span className="label-text">API Secret</span>
              </label>
              <input type="password" placeholder="Enter API Secret" className="input input-bordered w-full" />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary">Add Account</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}></div>
        </div>
      )}

      {/* View Keys Modal */}
      {showKeyModal !== null && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">API Keys</h3>
            <div className="mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">API Key</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered font-mono" 
                  value={accounts.find(a => a.id === showKeyModal)?.apiKey} 
                  readOnly 
                />
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">API Secret</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered font-mono" 
                  value={accounts.find(a => a.id === showKeyModal)?.secretKey} 
                  readOnly 
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowKeyModal(null)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowKeyModal(null)}></div>
        </div>
      )}
    </div>
  )
}

export default Accounts 