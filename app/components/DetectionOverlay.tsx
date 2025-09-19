'use client'

import { useEffect, useState } from 'react'

import { DetectionStatus } from '../types/detection'

interface DetectionOverlayProps {
  detections: DetectionStatus
  videoElement: HTMLVideoElement | null
}

export default function DetectionOverlay({ detections, videoElement }: DetectionOverlayProps) {
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (videoElement) {
      const updateOverlayStyle = () => {
        const rect = videoElement.getBoundingClientRect()
        setOverlayStyle({
          position: 'absolute',
          top: 0,
          left: 0,
          width: rect.width,
          height: rect.height,
          pointerEvents: 'none'
        })
      }

      updateOverlayStyle()
      window.addEventListener('resize', updateOverlayStyle)
      
      return () => window.removeEventListener('resize', updateOverlayStyle)
    }
  }, [videoElement])

  const getObjectColor = (objectType: string) => {
    switch (objectType) {
      case 'phone':
        return 'detection-phone'
      case 'book':
      case 'paper':
        return 'detection-book'
      case 'laptop':
      case 'tablet':
      case 'device':
        return 'detection-device'
      default:
        return 'detection-face'
    }
  }

  return (
    <div style={overlayStyle}>
      {/* Face Detection Overlay */}
      {detections.faceDetected && (
        <div className="absolute top-4 right-4 bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-100 text-xs font-medium">Face Detected</span>
          </div>
        </div>
      )}

      {/* Focus Status Overlay */}
      {!detections.isFocused && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-100 text-sm font-bold">FOCUS LOST</span>
          </div>
        </div>
      )}

      {/* Eye Closure Warning */}
      {detections.eyeClosure && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-100 text-xs font-medium">Eyes Closed</span>
          </div>
        </div>
      )}

      {/* Audio Noise Warning */}
      {detections.audioNoise && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-orange-100 text-xs font-medium">Background Noise</span>
          </div>
        </div>
      )}

      {/* Suspicious Objects Overlay */}
      {detections.suspiciousObjects.map((obj, index) => {
        const { x, y, width, height } = obj.boundingBox
        return (
          <div
            key={index}
            className={`detection-overlay ${getObjectColor(obj.type)}`}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${width}px`,
              height: `${height}px`
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded">
              {obj.type.toUpperCase()} ({Math.round(obj.confidence * 100)}%)
            </div>
          </div>
        )
      })}

      {/* Multiple Faces Warning */}
      {detections.suspiciousObjects.some(obj => obj.type === 'face' && detections.suspiciousObjects.filter(o => o.type === 'face').length > 1) && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-100 text-sm font-bold">MULTIPLE FACES DETECTED</span>
          </div>
        </div>
      )}
    </div>
  )
}
