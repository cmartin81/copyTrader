import React, { useState } from 'react'

interface FollowerAccount {
  id: number
  name: string
  status: 'active' | 'inactive'
  accountId: string
}

interface MasterAccount {
  brokerageType: string
  url: string
}

const Accounts: React.FC = () => {
  const [masterAccount, setMasterAccount] = useState<MasterAccount>({
    brokerageType: 'NinjaTrader',
    url: ''
  })

  const [followerAccounts, setFollowerAccounts] = useState<FollowerAccount[]>([
    {
      id: 1,
      name: 'Follower Account 1',
      status: 'active',
      accountId: 'NQ x1'
    },
    {
      id: 2,
      name: 'Follower Account 2',
      status: 'inactive',
      accountId: 'NOM25 x2'
    }
  ])

  const handleAddFollower = (): void => {
    // Implement add follower logic
  }

  const handleDeleteFollower = (id: number): void => {
    setFollowerAccounts(followerAccounts.filter(account => account.id !== id))
  }

  const handleEditFollower = (_id: number): void => {
    // Implement edit follower logic
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Accounts</h1>

      {/* Master Account Section */}
      <div className="bg-base-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Master Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-base-content/70 mb-2">Brokerage Type</label>
            <select
              value={masterAccount.brokerageType}
              onChange={(e) => setMasterAccount({ ...masterAccount, brokerageType: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="NinjaTrader">NinjaTrader</option>
              {/* Add other brokerage options as needed */}
            </select>
          </div>
          <div>
            <label className="block text-sm text-base-content/70 mb-2">NinjaTrader URL</label>
            <input
              type="text"
              value={masterAccount.url}
              onChange={(e) => setMasterAccount({ ...masterAccount, url: e.target.value })}
              placeholder="Enter NinjaTrader URL"
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      {/* Follower Accounts Section */}
      <div className="bg-base-300 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Follower Accounts</h2>
          <button
            onClick={handleAddFollower}
            className="btn btn-primary"
          >
            Add Follower
          </button>
        </div>

        <div className="space-y-4">
          {followerAccounts.map((account) => (
            <div key={account.id} className="bg-base-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`badge ${
                    account.status === 'active' 
                      ? 'badge-success' 
                      : 'badge-error'
                  }`}>
                    {account.status}
                  </div>
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-base-content/70 text-sm">{account.accountId}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditFollower(account.id)}
                    className="btn btn-ghost btn-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteFollower(account.id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Accounts 