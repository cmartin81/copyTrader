import React, { useState, useEffect } from 'react'

const Settings: React.FC = () => {
  const [ngrokAuthToken, setNgrokAuthToken] = useState('')
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('dark')

  useEffect(() => {
    // Get current theme from document
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    setCurrentTheme(theme)
  }, [])

  const handleThemeChange = (theme: string): void => {
    document.documentElement.setAttribute('data-theme', theme)
    setCurrentTheme(theme)
  }

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="card bg-base-100 shadow-xl">
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
          <h2 className="card-title mb-4">Application Settings</h2>
          
          <div className="divider">Appearance</div>
          
          <div className="form-control w-full max-w-md">
            <label className="label">
              <span className="label-text">Theme</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="wireframe">Wireframe</option>
              <option value="aqua">Aqua</option>
            </select>
          </div>
          
          <div className="divider mt-6">Notifications</div>
          
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              <span className="label-text">Email notifications</span>
            </label>
          </div>
          
          <div className="form-control mt-2">
            <label className="label cursor-pointer justify-start gap-4">
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              <span className="label-text">Trade execution alerts</span>
            </label>
          </div>
          
          <div className="form-control mt-2">
            <label className="label cursor-pointer justify-start gap-4">
              <input type="checkbox" className="toggle toggle-primary" />
              <span className="label-text">Daily summary reports</span>
            </label>
          </div>
          
          <div className="divider mt-6">Security</div>
          
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              <span className="label-text">Two-factor authentication</span>
            </label>
          </div>
          
          <div className="form-control mt-2">
            <label className="label cursor-pointer justify-start gap-4">
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              <span className="label-text">Session timeout (after 30 minutes)</span>
            </label>
          </div>
          
          <div className="divider mt-6">Trading Limits</div>
          
          <div className="form-control w-full max-w-md">
            <label className="label">
              <span className="label-text">Maximum trade size (% of portfolio)</span>
            </label>
            <input 
              type="number" 
              placeholder="5" 
              className="input input-bordered w-full"
              defaultValue={5}
              min={1}
              max={100}
            />
          </div>
          
          <div className="form-control w-full max-w-md mt-4">
            <label className="label">
              <span className="label-text">Daily loss limit (%)</span>
            </label>
            <input 
              type="number" 
              placeholder="10" 
              className="input input-bordered w-full"
              defaultValue={10}
              min={1}
              max={100}
            />
          </div>
          
          <div className="mt-6">
            <button className="btn btn-primary">Save All Settings</button>
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
    </div>
  )
}

export default Settings 