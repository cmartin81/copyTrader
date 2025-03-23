import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import Counters from './components/Counters'
import electronLogo from './assets/electron.svg'
import { initializeStore, useStore } from './store'
import './styles/app.css'

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
  
  // Show loading until store is initialized
  if (isLoading || !initialized) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="container">
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Electron State Management Example</div>
      
      <Counters />
      
      <Versions />
    </div>
  )
}

export default App
