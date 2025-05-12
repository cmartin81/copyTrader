import React from 'react'
import { useSessionStore } from '../store/sessionStore'

const SessionStateCard: React.FC = () => {
  const sessionState = useSessionStore()

  // Only show in development mode
  if (!window.electron.isDev) {
    return null
  }

  return (
    <div className="card bg-warning/10 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <h2 className="card-title">Session State</h2>
          <div className="badge badge-error">DEV</div>
        </div>
        <div className="mockup-code">
          <pre className="p-4 overflow-x-auto">
            <code>{JSON.stringify(sessionState, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export default SessionStateCard
