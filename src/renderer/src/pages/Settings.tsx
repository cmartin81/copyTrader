import React, { useState, useEffect } from 'react'
import { useSettingsStore, Theme } from '../store/settingsStore'

const Settings: React.FC = () => {
  const { theme, setTheme } = useSettingsStore()
  const [ngrokAuthToken, setNgrokAuthToken] = useState('')
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light'},
    { value: 'dark', label: 'Dark'},
    { value: 'cupcake', label: 'Cupcake'},
    { value: 'bumblebee', label: 'Bumblebee'},
    { value: 'emerald', label: 'Emerald'},
    { value: 'corporate', label: 'Corporate'},
    { value: 'synthwave', label: 'Synthwave'},
    { value: 'retro', label: 'Retro'},
    { value: 'cyberpunk', label: 'Cyberpunk'},
    { value: 'valentine', label: 'Valentine'},
    { value: 'halloween', label: 'Halloween'},
    { value: 'garden', label: 'Garden'},
    { value: 'forest', label: 'Forest'},
    { value: 'aqua', label: 'Aqua'},
    { value: 'lofi', label: 'Lofi'},
    { value: 'pastel', label: 'Pastel'},
    { value: 'fantasy', label: 'Fantasy'},
    { value: 'wireframe', label: 'Wireframe'},
    { value: 'black', label: 'Black'},
    { value: 'luxury', label: 'Luxury'},
    { value: 'dracula', label: 'Dracula'},
    { value: 'cmyk', label: 'Cmyk'},
    { value: 'autumn', label: 'Autumn'},
    { value: 'business', label: 'Business'},
    { value: 'acid', label: 'Acid'},
    { value: 'lemonade', label: 'Lemonade'},
    { value: 'night', label: 'Night'},
    { value: 'coffee', label: 'Coffee'},
    { value: 'winter', label: 'Winter'},
    { value: 'dim', label: 'Dim'},
    { value: 'nord', label: 'Nord'},
    { value: 'sunset', label: 'Sunset'},
    { value: 'caramellatte', label: 'Caramellatte'},
    { value: 'abyss', label: 'Abyss'},
    { value: 'silk', label: 'Silk'},
  ]

  useEffect(() => {
    // Get current theme from document
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    setTheme(theme as Theme)
  }, [])

  const handleSaveSettings = (): void => {
    // This would typically save to a config file or database
    console.log('Saving settings:', { ngrokAuthToken, ngrokUrl })
    
    // Show success message
    setSaveSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

  const handleResetSettings = async (): Promise<void> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('reset-all-settings')
      if (response.success) {
        setResetSuccess(true)
        setTimeout(() => setResetSuccess(false), 3000)
      } else {
        console.error('Failed to reset settings:', response.error)
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Appearance</h2>
          
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Theme</span>
            </label>
            <select
              className="select select-bordered"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              {themes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt">Select your preferred theme</span>
            </label>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
            {themes.map((t) => (
              <div
                key={t.value}
                className={`card bg-base-100 cursor-pointer transition-all hover:scale-105 ${
                  theme === t.value ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setTheme(t.value)}
                data-theme={t.value}
              >
                <div className="card-body items-center text-center p-2">
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-6 bg-primary rounded" />
                    <div className="w-1.5 h-6 bg-secondary rounded" />
                    <div className="w-1.5 h-6 bg-accent rounded" />
                    <div className="w-1.5 h-6 bg-neutral rounded" />
                  </div>
                  <h3 className="text-xs font-medium mt-1">{t.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title mb-4">Ngrok Configuration</h2>
          <p className="mb-6 opacity-70">
            Configure Ngrok to expose your local endpoints for webhook callbacks.
          </p>
          
          <div className="form-control w-full max-w-md">
            <label className="label">
              <span className="label-text">Auth Token</span>
            </label>
            <input 
              type="password" 
              placeholder="Enter your Ngrok auth token" 
              className="input input-bordered w-full" 
              value={ngrokAuthToken}
              onChange={(e) => setNgrokAuthToken(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">You can find this in your Ngrok dashboard</span>
            </label>
          </div>
          
          <div className="form-control w-full max-w-md mt-4">
            <label className="label">
              <span className="label-text">URL</span>
            </label>
            <input 
              type="text" 
              placeholder="Your Ngrok URL (e.g., https://abc123.ngrok.io)" 
              className="input input-bordered w-full" 
              value={ngrokUrl}
              onChange={(e) => setNgrokUrl(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">The URL provided by Ngrok when you start a tunnel</span>
            </label>
          </div>
          
          <div className="mt-6">
            <button 
              className="btn btn-primary" 
              onClick={handleSaveSettings}
              disabled={!ngrokAuthToken || !ngrokUrl}
            >
              Save Settings
            </button>
            
            {saveSuccess && (
              <div className="alert alert-success mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Settings saved successfully!</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title text-error">Danger Zone</h2>
          <p className="opacity-70 mb-4">Destructive actions that cannot be reversed</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn btn-outline btn-warning">Reset All Settings</button>
            <button className="btn btn-outline btn-error">Delete Account</button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Reset Settings</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleResetSettings}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reset All Settings
          </button>
          {resetSuccess && (
            <span className="text-green-500">Settings reset successfully!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings 