import React from 'react'
import { useAppStore } from '../store'

const AppStateCard: React.FC = () => {
  const appState = useAppStore()

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">App State</h2>
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