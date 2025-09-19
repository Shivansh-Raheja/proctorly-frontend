'use client'

import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import Webcam from 'react-webcam'

interface VideoCaptureProps {
  onVideoReady: (videoElement: HTMLVideoElement) => void
  isRecording: boolean
}

const VideoCapture = forwardRef<HTMLVideoElement, VideoCaptureProps>(
  ({ onVideoReady, isRecording }, ref) => {
    const webcamRef = useRef<Webcam>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useImperativeHandle(ref, () => videoRef.current!)

    useEffect(() => {
      const videoElement = webcamRef.current?.video
      if (videoElement) {
        videoRef.current = videoElement
        // Wait for video to be ready
        const handleLoadedMetadata = () => {
          onVideoReady(videoElement)
        }
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
        
        return () => {
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
      }
    }, [onVideoReady])

    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: 'user',
      frameRate: { ideal: 30, max: 60 }
    }

    return (
      <div className="relative w-full h-full bg-black">
        <Webcam
          ref={webcamRef}
          audio={true}
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          mirrored={true}
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        )}

        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-4">
          <div className="text-center text-white text-sm">
            <p className="mb-2">Keep your face visible and maintain focus on the screen</p>
            <div className="flex justify-center space-x-6 text-xs text-gray-300">
              <span>✓ Good lighting</span>
              <span>✓ Face visible</span>
              <span>✓ No prohibited items</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

VideoCapture.displayName = 'VideoCapture'

export default VideoCapture
