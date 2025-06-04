import { useEffect, useState } from 'react'
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import { initializeStores, useAppStore, useSessionStore } from './store'
import { useSettingsStore } from './store/settingsStore'
import './styles/app.css'

// Layout
import MainLayout from './layouts/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import KitchenSink from './pages/KitchenSink'
import TestPage from './pages/TestPage'
import Bots from './pages/Bots'
import Login from './pages/Login'
import LicensePage from './pages/licensePage'

// Components
import AuthGuard from './components/AuthGuard'
import { AuthCallbackPage } from '@renderer/pages/authCallback'

function App(): JSX.Element {
  const { theme } = useSettingsStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        // Check if window.store is available
        if (!window.store) {
          throw new Error('Store API not available')
        }

        await initializeStores()
        setInitialized(true)
      } catch (error) {
        // Show error state instead of just logging to console
        document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; padding: 20px; text-align: center;">
            <h1 style="color: #e53e3e; margin-bottom: 16px;">Application Error</h1>
            <p>There was a problem initializing the application. Please check the console for more details.</p>
            <pre style="background: #f7fafc; padding: 16px; border-radius: 4px; margin-top: 16px; overflow: auto; max-width: 100%;">${error?.message || 'Unknown error'}</pre>
          </div>
        `
      }
    }

    init()
  }, [])

  useEffect(() => {
    // Apply theme from settings store
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Show loading until stores are initialized
  if (!initialized) {
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
        {/* Public routes */}
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<Login />} />
        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bots">
              <Route index element={<Bots />} />
              <Route path=":botId" element={<Bots />} />
            </Route>
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="license" element={<LicensePage />} />
            <Route path="test" element={<TestPage />} />
            <Route path="kitchen-sink" element={<KitchenSink />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
