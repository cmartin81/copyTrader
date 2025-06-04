import React, { useState } from 'react'
import { useAppStore } from '../store'
import WhopApiClient from '../services/WhopApiClient'

const TestPage: React.FC = () => {
  // Only show in development mode
  if (!window.electron.isDev) {
    return null
  }

  const accessToken = useAppStore((state) => state.user?.accessToken)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeMethod, setActiveMethod] = useState<string | null>(null)

  const handleApiCall = async (method: string, productId?: string) => {
    if (!accessToken) {
      setError('No access token available. Please log in first.')
      return
    }

    setLoading(true)
    setError(null)
    setActiveMethod(method)

    try {
      const apiClient = new WhopApiClient(accessToken)
      let response

      switch (method) {
        case 'getCurrentUser':
          response = await apiClient.getCurrentUser()
          break
        case 'getProducts':
          response = await apiClient.getProducts()
          break
        case 'getMembership':
          if (!productId) {
            // If no productId is provided, get all memberships
            response = await apiClient.getMemberships()
          } else {
            response = await apiClient.getMembership(productId)
          }
          break
        default:
          throw new Error(`Unknown method: ${method}`)
      }

      setApiResponse(response)
    } catch (err) {
      console.error(`Error calling ${method}:`, err)
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
      setApiResponse(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <h2 className="card-title">Test Page</h2>
            <div className="badge badge-error">DEV</div>
          </div>
          <p className="py-4">
            This is a test page for development purposes only. You can use this page to test various components and functionality.
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">WhopApiClient Test</h2>

          {!accessToken && (
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>No access token available. Please log in first.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className={`btn ${activeMethod === 'getCurrentUser' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleApiCall('getCurrentUser')}
              disabled={loading || !accessToken}
            >
              Get Current User
            </button>
            <button
              className={`btn ${activeMethod === 'getProducts' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleApiCall('getProducts')}
              disabled={loading || !accessToken}
            >
              Get Products
            </button>
            <button
              className={`btn ${activeMethod === 'getMembership' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleApiCall('getMembership')}
              disabled={loading || !accessToken}
            >
              Get Memberships
            </button>
          </div>

          {loading && (
            <div className="flex justify-center my-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {apiResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Response:</h3>
              <div className="mockup-code bg-base-300 text-base-content">
                <pre className="p-4 overflow-x-auto">
                  <code>{JSON.stringify(apiResponse, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestPage
