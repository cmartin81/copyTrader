import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Alert from './Alert'
import { useSessionStore } from '../store/sessionStore'

const MainLayout: React.FC = () => {
  const { alerts, removeAlert } = useSessionStore()

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="fixed top-4 right-4 z-50 space-y-2">
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
      </div>
    </div>
  )
}

export default MainLayout 