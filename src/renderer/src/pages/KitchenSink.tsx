import React from 'react'
import Versions from '../components/Versions'
import Counters from '../components/Counters'
import electronLogo from '../assets/electron.svg'

const KitchenSink: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kitchen Sink</h1>
      
      <div className="hero bg-base-100 py-10 rounded-box shadow-xl mb-8">
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

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-6">Counter Management</h2>
          <Counters />
        </div>
      </div>

      <div className="divider mb-8">Version Information</div>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Application Information</h2>
          <Versions />
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary">More Info</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KitchenSink 