import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'

interface MenuItem {
  name: string
  path: string
  icon: JSX.Element
}

const MainLayout = (): JSX.Element => {
  const [username] = useState('Admin User')
  const [email] = useState('admin@xlink.com')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      )
    },
    {
      name: 'Accounts',
      path: '/accounts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    {
      name: 'Kitchen Sink',
      path: '/kitchen-sink',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-base-300 border-r border-base-content/10 flex flex-col justify-between">
        {/* Logo and app name */}
        <div>
          <div className="p-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-content font-bold text-lg tracking-wider">XL</span>
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
              </li>
            ))}
          </nav>
        </div>
        
        {/* User info */}
        <div className="p-4 mt-auto border-t border-base-content/10 pt-4 pb-6">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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
              className={`w-4 h-4 text-base-content/50 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute bottom-28 left-4 right-4 bg-base-300 rounded-xl border border-base-content/10 shadow-xl overflow-hidden">
              <div className="py-1.5">
                <button className="w-full flex items-center px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-content/5 hover:text-base-content transition-colors group">
                  <svg
                    className="w-4 h-4 text-base-content/50 group-hover:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Restart</span>
                </button>
                <button className="w-full flex items-center px-4 py-2.5 text-sm text-base-content/70 hover:bg-base-content/5 hover:text-base-content transition-colors group">
                  <svg
                    className="w-4 h-4 text-base-content/50 group-hover:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
                <button className="w-full flex items-center px-4 py-2.5 text-sm text-error hover:bg-error/10 hover:text-error transition-colors group border-t border-base-content/10">
                  <svg
                    className="w-4 h-4 text-error/70 group-hover:text-error transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                  </svg>
                  <span>Shutdown</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 bg-base-200 overflow-y-auto">
          <div className="max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout 