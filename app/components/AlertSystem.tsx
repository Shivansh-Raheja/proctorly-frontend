'use client'

import { useEffect } from 'react'
import { Alert } from '../types/detection'

interface AlertSystemProps {
  alerts: Alert[]
  onDismiss: (alertId: number) => void
}

export default function AlertSystem({ alerts, onDismiss }: AlertSystemProps) {
  useEffect(() => {
    // Auto-dismiss alerts after 5 seconds (faster dismissal)
    const timers = alerts.map(alert => {
      return setTimeout(() => {
        onDismiss(alert.id)
      }, 5000) // Reduced from 10000 to 5000
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [alerts, onDismiss])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return '👁️'
      case 'suspicious':
        return '⚠️'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900 border-red-500 text-red-100'
      case 'high':
        return 'bg-red-800 border-red-400 text-red-100'
      case 'medium':
        return 'bg-yellow-800 border-yellow-400 text-yellow-100'
      case 'low':
        return 'bg-blue-800 border-blue-400 text-blue-100'
      default:
        return 'bg-gray-800 border-gray-400 text-gray-100'
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Live Alerts</h3>
          <p className="text-sm text-gray-400 mt-1">
            Real-time monitoring notifications
          </p>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-gray-500 text-sm">No alerts at this time</p>
            <p className="text-gray-600 text-xs mt-1">All systems normal</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Live Alerts</h3>
        <p className="text-sm text-gray-400 mt-1">
          Real-time monitoring notifications
        </p>
      </div>

      {/* Alerts Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-3">
          {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 rounded-r-lg p-3 ${getAlertColor(alert.severity)} transform transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
