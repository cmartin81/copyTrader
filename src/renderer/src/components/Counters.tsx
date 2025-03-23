import { useEffect, useState } from 'react'
import { useStore } from '../store'
import '../styles/counters.css'
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
    <div className="counters">
      <div className="counter-container">
        <h3>Session Counter</h3>
        <p>This counter resets when you restart the app</p>
        <div className="counter">
          <button onClick={handleSessionDecrement}>-</button>
          <span>{sessionState.sessionCounter}</span>
          <button onClick={handleSessionIncrement}>+</button>
        </div>
      </div>

      <div className="counter-container">
        <h3>App Counter</h3>
        <p>This counter persists when you restart the app</p>
        <div className="counter">
          <button onClick={handleAppDecrement}>-</button>
          <span>{appState.appCounter}</span>
          <button onClick={handleAppIncrement}>+</button>
        </div>
      </div>

      <div className="auto-update-info">
        <h3>Auto Update Info</h3>
        <p>Both counters increase by 10 every 10 seconds</p>
        {lastAutoUpdate && (
          <p>Last auto-update: {lastAutoUpdate.toLocaleTimeString()}</p>
        )}
        <p>Next auto-update in: {nextAutoUpdate} seconds</p>
      </div>
    </div>
  )
}

export default Counters 