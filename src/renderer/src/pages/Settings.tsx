import React, { useState, useEffect } from 'react'
import { useSettingsStore, Theme } from '../store/settingsStore'
import { useSessionStore } from '../store/sessionStore'
import { useBotStore } from '../store/botStore'

const Settings: React.FC = () => {
  const { theme, setTheme } = useSettingsStore()
  const { addAlert } = useSessionStore()
  const { bots, deleteBot } = useBotStore()
  const [ngrokAuthToken, setNgrokAuthToken] = useState('')
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)

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
    addAlert('success', 'Settings saved successfully!')
  }

  const handleResetSettings = async (): Promise<void> => {
    try {
      // Clear all bots from Zustand store
      bots.forEach(bot => deleteBot(bot.id))

      // Reset settings in main process
      const response = await window.electron.ipcRenderer.invoke('reset-all-settings')
      if (response.success) {
        addAlert('success', 'Settings reset successfully!')
      } else {
        addAlert('error', 'Failed to reset settings')
      }
    } catch (error) {
      addAlert('error', 'Error resetting settings')
    }
    setShowResetConfirmation(false)
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
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">License</h2>
          <p className="opacity-70 mb-4">Manage your license settings</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="btn btn-primary"
              onClick={() => window.location.hash = '/license'}
            >
              Change License
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title text-error">Danger Zone</h2>
          <p className="opacity-70 mb-4">Destructive actions that cannot be reversed</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="btn btn-outline btn-warning"
              onClick={() => setShowResetConfirmation(true)}
            >
              Reset All Settings
            </button>
          </div>
        </div>
      </div>

      {/* Reset Settings Confirmation Modal */}
      <dialog className={`modal ${showResetConfirmation ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Reset All Settings</h3>
          <p className="py-4">Are you sure you want to reset all settings? This action cannot be undone and will:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Close all running bots</li>
            <li>Delete all bot configurations</li>
            <li>Reset all application settings</li>
          </ul>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setShowResetConfirmation(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-warning"
              onClick={handleResetSettings}
            >
              Yes, Reset Everything
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default Settings
