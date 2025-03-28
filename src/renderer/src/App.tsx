import { useEffect, useState } from 'react'
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import { initializeStore, useStore } from './store'
import { useSettingsStore } from './store/settingsStore'
import './styles/app.css'

// Layout
import MainLayout from './layouts/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import KitchenSink from './pages/KitchenSink'
import Bots from './pages/Bots'

function App(): JSX.Element {
  const { isLoading } = useStore()
  const { theme } = useSettingsStore()
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    const init = async (): Promise<void> => {
      await initializeStore()
      setInitialized(true)
    }
    
    init().catch(console.error)
  }, [])
  
  useEffect(() => {
    // Apply theme from settings store
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
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
          <Route path="bots">
            <Route index element={<Bots />} />
            <Route path=":botId" element={<Bots />} />
          </Route>
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
