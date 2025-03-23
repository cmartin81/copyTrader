import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { CounterActions } from '../../../shared/types'

const Counters = (): JSX.Element => {
  const { sessionState, appState } = useStore()
  const api = window.api as unknown as CounterActions
  const [lastAutoUpdate, setLastAutoUpdate] = useState<Date | null>(null)
  const [nextAutoUpdate, setNextAutoUpdate] = useState<number>(10)

  // Handle session counter actions
  const handleSessionIncrement = (): void => {
    api.incrementSessionCounter()
  }

  const handleSessionDecrement = (): void => {
    api.decrementSessionCounter()
  }

  // Handle app counter actions
  const handleAppIncrement = (): void => {
    api.incrementAppCounter()
  }

  const handleAppDecrement = (): void => {
    api.decrementAppCounter()
  }

  // Detect auto-updates by watching for changes that are multiples of 10
  useEffect(() => {
    const prevSessionValue = sessionState.sessionCounter - 10
    if (sessionState.sessionCounter > 0 && sessionState.sessionCounter % 10 === 0 && prevSessionValue >= 0) {
      setLastAutoUpdate(new Date())
      setNextAutoUpdate(10)
    }
  }, [sessionState.sessionCounter])

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Session Counter</h2>
          <p className="text-sm opacity-70">This counter resets when you restart the app</p>
          
          <div className="flex items-center justify-center gap-4 my-4">
            <button 
              className="btn btn-circle btn-primary" 
              onClick={handleSessionDecrement}
            >
              -
            </button>
            <div className="text-3xl font-bold">{sessionState.sessionCounter}</div>
            <button 
              className="btn btn-circle btn-primary" 
              onClick={handleSessionIncrement}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">App Counter</h2>
          <p className="text-sm opacity-70">This counter persists when you restart the app</p>
          
          <div className="flex items-center justify-center gap-4 my-4">
            <button 
              className="btn btn-circle btn-secondary" 
              onClick={handleAppDecrement}
            >
              -
            </button>
            <div className="text-3xl font-bold">{appState.appCounter}</div>
            <button 
              className="btn btn-circle btn-secondary" 
              onClick={handleAppIncrement}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-accent text-accent-content shadow-md md:col-span-2">
        <div className="card-body">
          <h2 className="card-title">Auto Update Info</h2>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p>Both counters increase by 10 every 10 seconds</p>
              {lastAutoUpdate && (
                <p>Last auto-update: {lastAutoUpdate.toLocaleTimeString()}</p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <div className="radial-progress text-primary" style={{ "--value": nextAutoUpdate * 10 } as React.CSSProperties}>
                {nextAutoUpdate}s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Counters 