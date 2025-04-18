import React from 'react'
import { useAppStore } from '../store'

const AppStateCard: React.FC = () => {
  const appState = useAppStore()

  // Only show in development mode
  if (!window.electron.isDev) {
    return null
  }

  return (
    <div className="card bg-warning/10 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <h2 className="card-title">App State</h2>
          <div className="badge badge-error">DEV</div>
        </div>
        <div className="mockup-code">
          <pre className="p-4 overflow-x-auto">
            <code>{JSON.stringify(appState, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export default AppStateCard
