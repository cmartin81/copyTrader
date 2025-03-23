import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import Counters from './components/Counters'
import electronLogo from './assets/electron.svg'
import { initializeStore, useStore } from './store'
import './styles/app.css'

function App(): JSX.Element {
  const { isLoading } = useStore()
  const [initialized, setInitialized] = useState(false)
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    const init = async (): Promise<void> => {
      await initializeStore()
      setInitialized(true)
    }
    
    init().catch(console.error)
  }, [])
  
  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  // Show loading until store is initialized
  if (isLoading || !initialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="navbar bg-base-200 shadow-md sticky top-0 z-50">
        <div className="flex-1">
          <div className="flex items-center">
            <img src={electronLogo} alt="Electron Logo" className="w-8 h-8 mr-2" />
            <a className="btn btn-ghost text-xl">Electron App</a>
          </div>
        </div>
        <div className="flex-none">
          <label className="swap swap-rotate">
            <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
            {/* Sun icon */}
            <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
            </svg>
            {/* Moon icon */}
            <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
            </svg>
          </label>
        </div>
      </div>

      <div className="hero bg-base-200 py-16">
        <div className="hero-content text-center">
          <div>
            <div className="avatar mb-4">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={electronLogo} alt="Electron Logo" />
              </div>
            </div>
            <h1 className="text-5xl font-bold">Electron App</h1>
            <p className="py-6 max-w-md mx-auto">State Management Example with DaisyUI and Tailwind CSS</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Counter Management</h2>
        <Counters />
      </div>

      <div className="divider my-8">Version Information</div>

      <div className="card max-w-md mx-auto bg-base-100 shadow-xl mb-12">
        <div className="card-body">
          <h2 className="card-title">Application Information</h2>
          <Versions />
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary">More Info</button>
          </div>
        </div>
      </div>
      
      <footer className="footer p-10 bg-base-200 text-base-content">
        <div>
          <span className="footer-title">Electron App</span> 
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Documentation</a>
        </div> 
        <div>
          <span className="footer-title">Technologies</span> 
          <a className="link link-hover">Electron</a>
          <a className="link link-hover">React</a>
          <a className="link link-hover">Tailwind CSS</a>
          <a className="link link-hover">DaisyUI</a>
        </div> 
      </footer>
    </div>
  )
}

export default App
