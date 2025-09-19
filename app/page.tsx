'use client'

import { useState, useEffect } from 'react'
import ProctoringInterface from './components/ProctoringInterface'
import CandidateSetup from './components/CandidateSetup'
import LoadingScreen from './components/LoadingScreen'
import { Candidate } from './types/detection'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  useEffect(() => {
    // Initialize TensorFlow.js
    const initTF = async () => {
      try {
        const tf = await import('@tensorflow/tfjs')
        await tf.ready()
        console.log('TensorFlow.js initialized')
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize TensorFlow.js:', error)
        setIsLoading(false)
      }
    }

    initTF()
  }, [])

  const handleCandidateSetup = (candidateData: Candidate) => {
    setCandidate(candidateData)
    setIsSetupComplete(true)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isSetupComplete) {
    return <CandidateSetup onSetupComplete={handleCandidateSetup} />
  }

  if (!candidate) {
    return <div>Error: No candidate data available</div>
  }

  return <ProctoringInterface candidate={candidate} />
}
