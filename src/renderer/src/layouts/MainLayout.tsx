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
    <div className="drawer md:drawer-open">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 md:hidden">
          <div className="flex-none">
            <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 font-bold">CopyTrader</div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-6 bg-base-200 min-h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
        <aside className="bg-gradient-to-b from-background-dark/95 to-background-dark/90 backdrop-blur-2xl border-r border-white/[0.02] w-64 h-full flex flex-col justify-between">
          {/* Logo and app name */}
          <div>
            <div className="p-4 mb-8">
              <div className="flex items-center space-x-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 ">
                  <span className="text-white font-bold text-lg tracking-wider">XL</span>
                </div>
                <div className="flex flex-col pl-3">
                  <span className="text-white font-semibold text-lg tracking-wide">CopyTrader</span>
                  <span className="text-xs text-blue-400/80 font-medium tracking-wider">TradersVantage</span>
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
                      `flex items-center space-x-5 px-4 py-3 rounded-xl transition-all duration-200 group relative border ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-white border-white/[0.08]'
                          : 'text-gray-400 hover:bg-white/[0.02] hover:text-white border-transparent hover:border-white/[0.02]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                          {item.icon}
                        </div>
                        <span className="font-medium tracking-wide text-sm pl-2">{item.name}</span>
                        {isActive && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </nav>
          </div>
          
          {/* User info */}
          <div className="p-4 mt-auto border-t border-white/[0.02] pt-4 pb-6">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center space-x-5 px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 border border-white/[0.02] group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
              <div className="flex-1 text-left pl-3">
                <div className="text-sm font-medium text-white tracking-wide group-hover:text-blue-400 transition-colors">{username}</div>
                <div className="text-xs text-gray-500">{email}</div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute bottom-28 left-4 right-4 bg-background-dark/95 backdrop-blur-xl rounded-xl border border-white/[0.02] shadow-xl shadow-black/20 overflow-hidden">
                <div className="py-1.5">
                  <button className="w-full flex items-center space-x-5 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/[0.02] hover:text-white transition-colors group">
                    <svg
                      className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Restart</span>
                  </button>
                  <button className="w-full flex items-center space-x-5 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/[0.02] hover:text-white transition-colors group">
                    <svg
                      className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                  <button className="w-full flex items-center space-x-5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group border-t border-white/[0.02]">
                    <svg
                      className="w-4 h-4 text-red-400/70 group-hover:text-red-300 transition-colors"
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
      </div>
    </div>
  )
}

export default MainLayout 