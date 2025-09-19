'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import VideoCapture from './VideoCapture'
import DetectionOverlay from './DetectionOverlay'
import StatusPanel from './StatusPanel'
import AlertSystem from './AlertSystem'
import { DetectionEngine } from '../utils/DetectionEngine'
import { LoggingService } from '../utils/LoggingService'
import { VideoRecorder } from '../utils/VideoRecorder'
import { API_ENDPOINTS } from '../config/api'
import { SuspiciousObject, DetectionStatus, SessionStats, Alert, Candidate } from '../types/detection'

interface ProctoringInterfaceProps {
  candidate: Candidate
}

export default function ProctoringInterface({ candidate }: ProctoringInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>({
    isFocused: true,
    faceDetected: true,
    suspiciousObjects: [],
    eyeClosure: false,
    audioNoise: false
  })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    focusLostCount: 0,
    suspiciousEventsCount: 0,
    integrityScore: 100,
    totalDuration: 0
  })
  const [demoMode, setDemoMode] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const detectionEngineRef = useRef<DetectionEngine | null>(null)
  const loggingServiceRef = useRef<LoggingService | null>(null)
  const videoRecorderRef = useRef<VideoRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Initialize detection engine and logging service
    const initServices = async () => {
      try {
        detectionEngineRef.current = new DetectionEngine()
        await detectionEngineRef.current.initialize()
        
        loggingServiceRef.current = new LoggingService(candidate.candidateId)
        videoRecorderRef.current = new VideoRecorder()
        
        console.log('Detection services initialized')
      } catch (error) {
        console.error('Failed to initialize detection services:', error)
      }
    }

    initServices()

    // Demo mode - simulate detections every 10 seconds (less frequent)
    let demoInterval: NodeJS.Timeout | null = null
    if (demoMode) {
      demoInterval = setInterval(() => {
        const randomDetection = {
          isFocused: Math.random() > 0.3,
          faceDetected: Math.random() > 0.1,
          suspiciousObjects: Math.random() > 0.85 ? [{
            type: 'phone',
            confidence: 0.9,
            boundingBox: { x: 100, y: 100, width: 50, height: 80 }
          }] : [],
          eyeClosure: Math.random() > 0.9,
          audioNoise: Math.random() > 0.95
        }
        handleDetectionUpdate(randomDetection)
      }, 10000) // Changed from 5000 to 10000 (10 seconds)
    }

    // Session duration timer
    const durationInterval = setInterval(() => {
      setSessionDuration(prev => prev + 1)
    }, 1000)

    return () => {
      if (detectionEngineRef.current) {
        detectionEngineRef.current.cleanup()
      }
      if (videoRecorderRef.current) {
        videoRecorderRef.current.cleanup()
      }
      if (demoInterval) {
        clearInterval(demoInterval)
      }
      if (durationInterval) {
        clearInterval(durationInterval)
      }
    }
  }, [candidate.candidateId, demoMode])

  const handleVideoReady = useCallback(async (videoElement: HTMLVideoElement) => {
    console.log('Video ready, setting up detection and recording...')
    
    // Get media stream for recording
    if (videoElement.srcObject) {
      mediaStreamRef.current = videoElement.srcObject as MediaStream
      console.log('Media stream captured for recording')
    }
    
    // Wait a bit for detection engine to be ready
    setTimeout(async () => {
      if (detectionEngineRef.current) {
        try {
          await detectionEngineRef.current.startDetection(videoElement, handleDetectionUpdate)
          console.log('Detection started successfully')
        } catch (error) {
          console.error('Failed to start detection:', error)
        }
      }
    }, 1000)
  }, [])

  const handleDetectionUpdate = useCallback((detection: any) => {
    setDetectionStatus(prev => ({
      ...prev,
      ...detection
    }))

    // Log detection events
    if (loggingServiceRef.current) {
      loggingServiceRef.current.logDetection(detection)
    }

    // Update session stats
    setSessionStats(prev => {
      const newStats = { ...prev }
      
      if (detection.focusLost) {
        newStats.focusLostCount += 1
      }
      
      if (detection.suspiciousObjects?.length > 0) {
        newStats.suspiciousEventsCount += detection.suspiciousObjects.length
      }

      // Calculate integrity score - no maximum limits
      let score = 100
      score -= newStats.focusLostCount * 2 // 2 points per focus lost event
      score -= newStats.suspiciousEventsCount * 5 // 5 points per suspicious event
      newStats.integrityScore = Math.max(score, 0) // Minimum 0

      return newStats
    })

    // Generate alerts for critical events
    if (detection.focusLost || detection.suspiciousObjects?.length > 0 || detection.eyeClosure || detection.audioNoise) {
      let message = ''
      let type: 'focus' | 'suspicious' | 'warning' | 'info' = 'info'
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

      if (detection.focusLost) {
        message = 'Focus lost - please look at the screen'
        type = 'focus'
        severity = 'medium'
      } else if (detection.suspiciousObjects?.length > 0) {
        message = `Suspicious object detected: ${detection.suspiciousObjects.map((obj: SuspiciousObject) => obj.type).join(', ')}`
        type = 'suspicious'
        severity = 'high'
      } else if (detection.eyeClosure) {
        message = 'Eye closure detected - please stay alert'
        type = 'warning'
        severity = 'medium'
      } else if (detection.audioNoise) {
        message = 'Background noise detected'
        type = 'warning'
        severity = 'low'
      }

      const newAlert: Alert = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date(),
        severity
      }
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]) // Keep last 10 alerts
    }
  }, [])

  const handleStartRecording = async () => {
    try {
      console.log('Starting recording...')
      console.log('Video recorder available:', !!videoRecorderRef.current)
      console.log('Media stream available:', !!mediaStreamRef.current)
      
      if (!videoRecorderRef.current) {
        alert('Video recorder not initialized. Please refresh the page.')
        return
      }
      
      if (!mediaStreamRef.current) {
        alert('Camera not ready. Please wait for camera to initialize and try again.')
        return
      }
      
      await videoRecorderRef.current.startRecording(mediaStreamRef.current)
      setIsRecording(true)
      console.log('Recording started successfully')
      
      // Show success alert
      const successAlert = {
        id: Date.now(),
        type: 'info' as const,
        message: 'Recording started successfully',
        timestamp: new Date(),
        severity: 'low' as const
      }
      setAlerts(prev => [successAlert, ...prev.slice(0, 9)])
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to start recording. Please try again.')
    }
  }

  const handleStopRecording = async () => {
    try {
      if (videoRecorderRef.current) {
        const blob = await videoRecorderRef.current.stopRecording()
        setIsRecording(false)
        
        // Upload recording to server
        const filePath = await videoRecorderRef.current.uploadRecording(candidate.candidateId)
        console.log('Recording saved:', filePath)
        
        // End interview session
        if (loggingServiceRef.current) {
          await loggingServiceRef.current.endInterview()
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const handleDownloadReport = async () => {
    try {
      setIsSyncing(true)
      
      // First, sync the current stats with the backend
      if (loggingServiceRef.current) {
        await loggingServiceRef.current.syncCandidateStats({
          focusLostCount: sessionStats.focusLostCount,
          suspiciousEventsCount: sessionStats.suspiciousEventsCount,
          integrityScore: sessionStats.integrityScore,
          totalDuration: sessionDuration
        })
      }

      const response = await fetch(API_ENDPOINTS.REPORTS(candidate.candidateId, 'pdf'))
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `proctoring-report-${candidate.candidateId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        // Show success alert
        const successAlert = {
          id: Date.now(),
          type: 'info' as const,
          message: 'Report downloaded with synced integrity score',
          timestamp: new Date(),
          severity: 'low' as const
        }
        setAlerts(prev => [successAlert, ...prev.slice(0, 9)])
      } else {
        alert('Failed to download report. Please try again.')
      }
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report. Please check if the backend is running.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDownloadRecording = async () => {
    try {
      if (videoRecorderRef.current) {
        await videoRecorderRef.current.downloadRecording(`proctoring-recording-${candidate.candidateId}-${Date.now()}.webm`)
        
        // Show success alert
        const successAlert = {
          id: Date.now(),
          type: 'info' as const,
          message: 'Recording downloaded successfully',
          timestamp: new Date(),
          severity: 'low' as const
        }
        setAlerts(prev => [successAlert, ...prev.slice(0, 9)])
      } else {
        alert('No recording available to download. Please record first.')
      }
    } catch (error) {
      console.error('Failed to download recording:', error)
      alert('Failed to download recording. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Proctorly - Proctored Session</h1>
            <p className="text-sm text-gray-400">
              Candidate: {candidate.name} | ID: {candidate.candidateId}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`status-indicator ${detectionStatus.isFocused ? 'status-focused' : 'status-danger'}`}>
              {detectionStatus.isFocused ? 'Focused' : 'Not Focused'}
            </div>
            <div className="text-sm">
              Duration: <span className="font-bold">{Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s</span>
            </div>
            <div className="text-sm">
              Integrity Score: <span className="font-bold">{sessionStats.integrityScore}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <button
                onClick={handleDownloadReport}
                disabled={isSyncing}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isSyncing 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSyncing ? 'Syncing...' : 'Download Report'}
              </button>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  demoMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {demoMode ? 'Demo ON' : 'Demo OFF'}
              </button>
              <button
                onClick={handleDownloadRecording}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium text-white"
              >
                Download Recording
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Column - Alerts */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg">
          <AlertSystem
            alerts={alerts}
            onDismiss={dismissAlert}
          />
        </div>

        {/* Center Column - Main Video Area */}
        <div className="flex-1 relative bg-black">
          <VideoCapture
            ref={videoRef}
            onVideoReady={handleVideoReady}
            isRecording={isRecording}
          />
          
          {/* Detection Overlays */}
          <DetectionOverlay
            detections={detectionStatus}
            videoElement={videoRef.current}
          />
        </div>

        {/* Right Column - Status Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shadow-lg">
          <StatusPanel
            detectionStatus={detectionStatus}
            sessionStats={sessionStats}
          />
        </div>
      </div>
    </div>
  )
}
