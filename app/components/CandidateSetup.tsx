'use client'

import { useState } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

interface CandidateSetupProps {
  onSetupComplete: (candidate: any) => void
}

export default function CandidateSetup({ onSetupComplete }: CandidateSetupProps) {
  const [formData, setFormData] = useState({
    candidateId: '',
    name: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generateCandidateId = () => {
    const id = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setFormData(prev => ({ ...prev, candidateId: id }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(API_ENDPOINTS.CANDIDATES, formData)
      onSetupComplete(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create candidate')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Candidate Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide your information to start the proctored session
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="candidateId" className="block text-sm font-medium text-gray-700">
                Candidate ID
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="candidateId"
                  name="candidateId"
                  type="text"
                  required
                  value={formData.candidateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateId: e.target.value }))}
                  className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter candidate ID"
                />
                <button
                  type="button"
                  onClick={generateCandidateId}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Start Proctored Session'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Ensure good lighting and a stable internet connection</li>
            <li>• Keep your face visible to the camera at all times</li>
            <li>• Remove any prohibited items from your workspace</li>
            <li>• The session will be monitored and recorded</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
