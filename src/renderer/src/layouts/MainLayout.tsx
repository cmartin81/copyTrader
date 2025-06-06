import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useBotStore } from '../store/botStore'
import { useSessionStore } from '../store/sessionStore'
import { useAppStore } from '../store'
import Alert from '../components/Alert'
import copyTraderLogo from '@renderer/assets/copyTraderLogo2.png'

interface MenuItem {
  name: string
  path: string
  icon: JSX.Element
}

const MainLayout = (): JSX.Element => {
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const { bots, addBot } = useBotStore()
  const { alerts, removeAlert } = useSessionStore()
  const navigate = useNavigate()
  const isDev = window.electron.isDev

  // Get user data from app state
  const user = useAppStore((state) => state.user)
  const username = user?.username || 'User'
  const email = user?.email || 'Product X'


  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the main process logout method
      const result = await window.store.logout();

      if (result.success) {
        // Navigate to login page (AuthGuard will handle this, but we'll do it explicitly)
        navigate('/login');
      } else {
        console.error('Logout failed:', result.error);
        // You could show an error message here
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // You could show an error message here
    }
  }

  const handleAddBot = async (): Promise<void> => {
    if (newBotName.trim()) {
      const newBot = {
        name: newBotName.trim(),
        targetAccounts: [],
        masterAccount: undefined
      }
      const response = await addBot(newBot)
      setNewBotName('')
      setIsAddBotModalOpen(false)

      // Navigate to the newly created bot using the response
      if (response && response.id) {
        navigate(`/bots/${response.id}`)
      }
    }
  }

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    // Test page menu item - only visible in development mode
    ...(isDev ? [{
      name: 'Test Page',
      path: '/test',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }] : [])
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-base-300 border-r border-base-content/10 flex flex-col justify-between">
        {/* Logo and app name */}
        <div>
          <div className="p-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src={copyTraderLogo}
                  alt="CopyTrader Logo"
                  className="rounded-sm"
                />
              </div>
              <div className="flex flex-col pl-3">
                <span className="font-semibold text-lg tracking-wide">CopyTrader</span>
                <span className="text-xs font-medium tracking-wider">TradersVantage</span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="space-y-1.5 px-2">
            {menuItems.map((item) => (
              <li key={item.path} className="list-none">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-primary text-primary-content'
                        : 'text-base-content/70 hover:bg-base-content/5 hover:text-base-content'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`${isActive ? 'text-primary-content' : 'text-base-content/70 group-hover:text-base-content'} transition-colors`}>
                        {item.icon}
                      </div>
                      <span className="font-medium tracking-wide text-sm pl-2">{item.name}</span>
                    </>
                  )}
                </NavLink>

                {/* Place Trading Bots section under Dashboard */}
                {item.name === 'Dashboard' && (
                  <div className="mt-1 mb-2">
                    <div className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="font-medium text-xs text-base-content/50 uppercase tracking-wider ml-2">Trading Bots</h3>
                      </div>
                      <button
                        onClick={() => setIsAddBotModalOpen(true)}
                        className="btn btn-ghost btn-x h-6 p-0 flex items-center"
                        title="Add new bot"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-1">
                      {bots.map((bot) => (
                        <NavLink
                          key={bot.id}
                          to={`/bots/${bot.id}`}
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 rounded-xl transition-all duration-200 group relative ${
                              isActive
                                ? 'bg-primary text-primary-content'
                                : 'text-base-content/70 hover:bg-base-content/5 hover:text-base-content'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}>
                                {bot.avatar ? (
                                  <span className="text-xl">{bot.avatar}</span>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium tracking-wide text-sm pl-2">{bot.name}</span>
                              {useSessionStore.getState().runningBot?.id === bot.id && (
                                <span className="ml-auto h-3 w-3 bg-success rounded-full border-2 border-base-100 animate-pulse"></span>
                              )}
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </nav>
        </div>

        {/* User info */}
        <div className="p-4 mt-auto border-t border-base-content/10 pt-4 pb-6">
          <div className="dropdown dropdown-top w-full">
            <button
              tabIndex={0}
              className="w-full flex items-center px-4 py-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-base-content/10 flex items-center justify-center">
                <span className="text-sm font-medium">AD</span>
              </div>
              <div className="flex-1 text-left pl-3">
                <div className="text-sm font-medium tracking-wide group-hover:text-primary transition-colors">{username}</div>
                <div className="text-xs text-base-content/50">{email}</div>
              </div>
              <svg
                className="w-4 h-4 text-base-content/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-300 rounded-xl w-full border border-base-content/10">
              <li>
                <button className="flex items-center gap-2 text-base-content/70 hover:bg-base-content/5 hover:text-base-content">
                  <svg
                    className="w-4 h-4 text-base-content/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restart
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-base-content/70 hover:bg-base-content/5 hover:text-base-content"
                >
                  <svg
                    className="w-4 h-4 text-base-content/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </li>
              <li>
                <button className="flex items-center gap-2 text-error hover:bg-error/10 hover:text-error border-t border-base-content/10">
                  <svg
                    className="w-4 h-4 text-error/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                  </svg>
                  Shutdown
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-base-200 overflow-y-auto">
          <div className="max-w-7xl">
            {/* Alerts container */}
            <div className="fixed top-4 right-4 z-[100] space-y-2">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  type={alert.type}
                  message={alert.message}
                  onDismiss={() => removeAlert(alert.id)}
                />
              ))}
            </div>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Add Bot Modal */}
      <dialog className={`modal ${isAddBotModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Add New Bot</h3>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bot Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter bot name"
                className="input input-bordered"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBot()
                  }
                }}
              />
            </div>
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsAddBotModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddBot}>Add Bot</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default MainLayout
