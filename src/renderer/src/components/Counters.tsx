import { useEffect, useState } from 'react'
import { useAppStore, useSessionStore } from '../store'

const Counters = (): JSX.Element => {
  const appCounter = useAppStore((state) => state.appCounter)
  const sessionCounter = useSessionStore((state) => state.sessionCounter)
  const [lastAutoUpdate, setLastAutoUpdate] = useState<Date | null>(null)
  const [nextAutoUpdate, setNextAutoUpdate] = useState<number>(10)

  // Handle session counter actions
  const handleSessionIncrement = (): void => {
    window.store.setSessionState({ sessionCounter: sessionCounter + 1 })
  }

  const handleSessionDecrement = (): void => {
    window.store.setSessionState({ sessionCounter: sessionCounter - 1 })
  }

  // Handle app counter actions
  const handleAppIncrement = (): void => {
    window.store.setAppState({ appCounter: appCounter + 1 })
  }

  const handleAppDecrement = (): void => {
    window.store.setAppState({ appCounter: appCounter - 1 })
  }

  // Detect auto-updates by watching for changes that are multiples of 10
  useEffect(() => {
    const prevSessionValue = sessionCounter - 10
    if (sessionCounter > 0 && sessionCounter % 10 === 0 && prevSessionValue >= 0) {
      setLastAutoUpdate(new Date())
      setNextAutoUpdate(10)
    }
  }, [sessionCounter])

  // Countdown timer for next auto-update
  useEffect(() => {
    if (nextAutoUpdate <= 0) return

    const timer = setTimeout(() => {
      setNextAutoUpdate(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [nextAutoUpdate])

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200 p-4">
        <h2 className="text-xl font-bold mb-4">Session Counter</h2>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary" onClick={handleSessionDecrement}>
            -
          </button>
          <span className="text-2xl">{sessionCounter}</span>
          <button className="btn btn-primary" onClick={handleSessionIncrement}>
            +
          </button>
        </div>
      </div>

      <div className="card bg-base-200 p-4">
        <h2 className="text-xl font-bold mb-4">App Counter (Persistent)</h2>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary" onClick={handleAppDecrement}>
            -
          </button>
          <span className="text-2xl">{appCounter}</span>
          <button className="btn btn-primary" onClick={handleAppIncrement}>
            +
          </button>
        </div>
      </div>

      {lastAutoUpdate && (
        <div className="card bg-base-200 p-4">
          <h2 className="text-xl font-bold mb-4">Auto Update Status</h2>
          <p>Last auto-update: {lastAutoUpdate.toLocaleTimeString()}</p>
          <p>Next auto-update in: {nextAutoUpdate} seconds</p>
        </div>
      )}
    </div>
  )
}

export default Counters 