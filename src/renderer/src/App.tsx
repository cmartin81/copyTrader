import { useEffect, useState } from 'react'
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import { initializeStore, useStore } from './store'
import './styles/app.css'

// Layout
import MainLayout from './layouts/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import KitchenSink from './pages/KitchenSink'

function App(): JSX.Element {
  const { isLoading } = useStore()
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    const init = async (): Promise<void> => {
      await initializeStore()
      setInitialized(true)
    }
    
    init().catch(console.error)
  }, [])
  
  useEffect(() => {
    // Set dark theme by default
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])
  
  // Show loading until store is initialized
  if (isLoading || !initialized) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-300">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  // Using HashRouter instead of BrowserRouter for Electron
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="kitchen-sink" element={<KitchenSink />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
