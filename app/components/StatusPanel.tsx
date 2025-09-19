'use client'

import { DetectionStatus, SessionStats } from '../types/detection'

interface StatusPanelProps {
  detectionStatus: DetectionStatus
  sessionStats: SessionStats
}

export default function StatusPanel({ detectionStatus, sessionStats }: StatusPanelProps) {
  const getIntegrityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getIntegrityScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Session Status</h3>
        <p className="text-sm text-gray-400 mt-1">
          Real-time monitoring dashboard
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
      
      {/* Integrity Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Integrity Score</span>
          <span className={`text-2xl font-bold ${getIntegrityScoreColor(sessionStats.integrityScore)}`}>
            {sessionStats.integrityScore}
          </span>
        </div>
        <div className="text-xs text-gray-400 mb-3">
          {getIntegrityScoreLabel(sessionStats.integrityScore)}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              sessionStats.integrityScore >= 90 ? 'bg-green-500' :
              sessionStats.integrityScore >= 70 ? 'bg-yellow-500' :
              sessionStats.integrityScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${sessionStats.integrityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Detection Status */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300">Detection Status</h4>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Focus</span>
          <div className={`status-indicator ${detectionStatus.isFocused ? 'status-focused' : 'status-danger'}`}>
            {detectionStatus.isFocused ? 'Focused' : 'Lost'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Face Detection</span>
          <div className={`status-indicator ${detectionStatus.faceDetected ? 'status-focused' : 'status-danger'}`}>
            {detectionStatus.faceDetected ? 'Detected' : 'Not Detected'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Eye Closure</span>
          <div className={`status-indicator ${detectionStatus.eyeClosure ? 'status-warning' : 'status-focused'}`}>
            {detectionStatus.eyeClosure ? 'Detected' : 'Normal'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Audio Noise</span>
          <div className={`status-indicator ${detectionStatus.audioNoise ? 'status-warning' : 'status-focused'}`}>
            {detectionStatus.audioNoise ? 'Detected' : 'Clear'}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Session Statistics</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Focus Lost</div>
            <div className="text-lg font-semibold text-red-400">{sessionStats.focusLostCount}</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Suspicious Events</div>
            <div className="text-lg font-semibold text-orange-400">{sessionStats.suspiciousEventsCount}</div>
          </div>
        </div>
      </div>

      {/* Detected Objects */}
      {detectionStatus.suspiciousObjects.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Detected Objects</h4>
          <div className="space-y-2">
            {detectionStatus.suspiciousObjects.map((obj, index) => (
              <div key={index} className="flex items-center justify-between bg-red-900 bg-opacity-30 rounded-lg p-2">
                <span className="text-sm text-red-200 capitalize">{obj.type}</span>
                <span className="text-xs text-red-300">{Math.round(obj.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
